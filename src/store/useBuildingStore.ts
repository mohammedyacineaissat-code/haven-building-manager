import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Building, StaffContact, EmergencyContact } from '../types/building';
import { generateUUID, isOnline } from './utils';
import { DEFAULT_BUILDINGS, DEFAULT_BUILDING, STAFF_CONTACTS, CONTRACTOR_CONTACTS } from './defaults';
import { useAuthStore } from './useAuthStore';
import { useIncidentStore } from './useIncidentStore';
import { useNoticeStore } from './useNoticeStore';
import { useTicketStore } from './useTicketStore';
import { useFinanceStore } from './useFinanceStore';

// Re-export defaults for backward compatibility
export { DEFAULT_BUILDING, DEFAULT_BUILDINGS } from './defaults';

// Guard to prevent multiple realtime subscriptions
let realtimeSubscribed = false;

// ── Building Store Interface ──────────────────────────────────────────
interface BuildingState {
  buildings: Building[];
  activeBuildingId: string;
  staffContacts: StaffContact[];
  contractorContacts: EmergencyContact[];
  isLoading: boolean;
  error: string | null;

  // Orchestrator
  initializeData: () => Promise<void>;

  // Building Actions
  setActiveBuilding: (buildingId: string) => void;
  addBuilding: (buildingData: Omit<Building, 'id'>) => Promise<void>;
  removeBuilding: (buildingId: string) => Promise<void>;
  updateBuilding: (buildingId: string, updates: Partial<Omit<Building, 'id'>>) => Promise<void>;
}

const initialResidentProfile = useAuthStore.getState().residentProfile;

// ── Building Store ────────────────────────────────────────────────────
export const useBuildingStore = create<BuildingState>((set, get) => ({
  buildings: DEFAULT_BUILDINGS,
  activeBuildingId: initialResidentProfile?.buildingId || DEFAULT_BUILDINGS[0].id,
  staffContacts: STAFF_CONTACTS,
  contractorContacts: CONTRACTOR_CONTACTS,
  isLoading: false,
  error: null,

  // ── Data Initialization Orchestrator ──────────────────────────────
  initializeData: async () => {
    set({ isLoading: true, error: null });

    try {
      // 1. Load buildings
      if (isOnline()) {
        const { data: bData, error: bError } = await supabase.from('buildings').select('*');
        if (!bError && bData && bData.length > 0) {
          const formattedBuildings: Building[] = bData.map((b: Record<string, any>) => ({
            id: b.id,
            name: b.name,
            address: b.address,
            totalUnits: b.total_units || 30,
            towers: Array.isArray(b.towers) ? b.towers : (b.towers ? [b.towers] : ['Tour A']),
            status: b.status || 'operational'
          }));

          const currentActive = get().activeBuildingId;
          const exists = formattedBuildings.some(b => b.id === currentActive);
          set({
            buildings: formattedBuildings,
            activeBuildingId: exists ? currentActive : formattedBuildings[0].id
          });
        }

        // 2. Validate active session with backend
        const isCapacitor = typeof window !== 'undefined' && (
          !!(window as any).Capacitor ||
          window.location.protocol === 'capacitor:' ||
          window.location.hostname === 'localhost' && window.location.protocol === 'https:'
        );
        const token = typeof window !== 'undefined' ? localStorage.getItem('haven_session_token') : null;
        if (token && !isCapacitor) {
          try {
            const meRes = await fetch('/api/auth/me', {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (meRes.ok) {
              const meData = await meRes.json();
              if (meData.success && meData.profile) {
                const currentBldg = get().buildings.find(b => b.id === meData.profile.buildingId) || get().buildings[0] || DEFAULT_BUILDING;
                const authStore = useAuthStore.getState();
                // Update auth store with validated profile
                authStore.loginResident({
                  ...meData.profile,
                  joinedAt: meData.profile.joinedAt || 'Récemment'
                });
                set({ activeBuildingId: currentBldg.id });
              }
            }
          } catch {
            // Fallback to local profile
          }
        }

        // 3. Fetch residents and sync managers
        const { data: resData } = await supabase
          .from('residents')
          .select('*')
          .neq('building_id', 'manager');

        if (resData && resData.length > 0) {
          useAuthStore.getState().setRegisteredAccounts(
            resData.map((r: Record<string, any>) => ({
              id: r.id,
              lastName: r.last_name,
              firstName: r.first_name,
              buildingId: r.building_id,
              floor: r.floor,
              aptNumber: r.apt_number,
              phone: r.phone,
              joinedAt: r.joined_at
            }))
          );
        }

        // Sync managers
        try {
          const { data: mgrData, error: mgrErr } = await supabase
            .from('residents')
            .select('*')
            .eq('building_id', 'manager');

          if (!mgrErr && mgrData && mgrData.length > 0) {
            const remoteManagers = mgrData.map((m: Record<string, any>) => ({
              id: m.id,
              name: m.first_name,
              emailOrPhone: m.phone || m.apt_number.replace('MANAGER:', ''),
              agencyName: m.last_name !== 'Syndic' ? m.last_name : '',
              createdAt: m.created_at || new Date().toISOString()
            }));

            const existingLocal = useAuthStore.getState().registeredManagers;
            const mergedManagers: any[] = [...remoteManagers];
            existingLocal.forEach(localM => {
              if (!mergedManagers.some(m => m.emailOrPhone.toLowerCase() === localM.emailOrPhone.toLowerCase())) {
                mergedManagers.push(localM);
              }
            });
            useAuthStore.getState().setRegisteredManagers(mergedManagers);
          }
        } catch (err) {
          console.warn('Failed to sync remote managers:', err);
        }
      }

      // 4. Load all domain data in parallel
      await Promise.all([
        useIncidentStore.getState().loadIncidents(),
        useNoticeStore.getState().loadNotices(),
        useTicketStore.getState().loadTickets(),
        useFinanceStore.getState().loadFinances(),
      ]);

    } catch (err) {
      console.info('State initialized clean; Supabase sync available:', err);
      set({ error: 'Initialization error' });
    } finally {
      set({ isLoading: false });
    }

    // 5. Subscribe to realtime changes (only once, granular handlers)
    if (!realtimeSubscribed && isOnline()) {
      realtimeSubscribed = true;
      try {
        supabase.channel('haven:changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
            useIncidentStore.getState().loadIncidents();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
            useTicketStore.getState().loadTickets();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, () => {
            useNoticeStore.getState().loadNotices();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'finances' }, () => {
            useFinanceStore.getState().loadFinances();
          })
          .subscribe();
      } catch {
        realtimeSubscribed = false;
      }
    }
  },

  setActiveBuilding: (buildingId: string) => {
    set({ activeBuildingId: buildingId });
  },

  addBuilding: async (buildingData) => {
    const newId = generateUUID();
    const newBuilding: Building = {
      id: newId,
      ...buildingData,
      status: 'operational'
    };

    set(state => ({
      buildings: [...state.buildings, newBuilding],
      activeBuildingId: newId
    }));

    if (isOnline()) {
      try {
        await supabase.from('buildings').insert({
          id: newId,
          name: buildingData.name,
          address: buildingData.address,
          total_units: buildingData.totalUnits,
          towers: buildingData.towers,
          status: 'operational'
        });
      } catch (err) {
        console.debug('DB insert error:', err);
      }
    }
  },

  removeBuilding: async (buildingId) => {
    set(state => {
      const remainingBuildings = state.buildings.filter(b => b.id !== buildingId);
      const nextActiveId = state.activeBuildingId === buildingId
        ? (remainingBuildings[0]?.id || '')
        : state.activeBuildingId;

      return {
        buildings: remainingBuildings,
        activeBuildingId: nextActiveId
      };
    });

    if (isOnline()) {
      try {
        await supabase.from('buildings').delete().eq('id', buildingId);
      } catch (err) {
        console.debug('DB delete error:', err);
      }
    }
  },

  updateBuilding: async (buildingId, updates) => {
    set(state => ({
      buildings: state.buildings.map(b =>
        b.id === buildingId ? { ...b, ...updates } : b
      )
    }));

    if (isOnline()) {
      try {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.address !== undefined) dbUpdates.address = updates.address;
        if (updates.totalUnits !== undefined) dbUpdates.total_units = updates.totalUnits;
        if (updates.towers !== undefined) dbUpdates.towers = updates.towers;
        if (updates.status !== undefined) dbUpdates.status = updates.status;

        await supabase.from('buildings').update(dbUpdates).eq('id', buildingId);
      } catch (err) {
        console.debug('DB building update error:', err);
      }
    }
  },
}));
