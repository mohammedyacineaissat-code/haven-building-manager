import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { 
  Incident, 
  Building, 
  BuildingNotice, 
  EmergencyContact, 
  StaffContact, 
  ResidentReport, 
  ResidentProfile, 
  UserRole, 
  IncidentStatus 
} from '../types/building';
import { playAlertSound } from '../utils/audio';

// Default and sample residences in Algeria with matched UUIDs
export const DEFAULT_BUILDINGS: Building[] = [
  {
    id: '45ab09da-d767-4ae1-bc14-b486cdfe12b4',
    name: 'Majestic 14 (Oran)',
    address: 'Oran',
    totalUnits: 42,
    towers: ['Tour A', 'Tour B'],
    status: 'operational',
  }
];

export const DEFAULT_BUILDING: Building = DEFAULT_BUILDINGS[0];

// Official building contacts
const STAFF_CONTACTS: StaffContact[] = [
  { 
    id: 'staff-1', 
    title: 'Syndic de Copropriété', 
    name: 'Bureau de Gestion du Syndic', 
    role: 'Administration & Gestion de la Résidence', 
    phone: '0661 00 00 00', 
    available: 'Dimanche - Jeudi: 08:30 - 17:30', 
    location: 'Bureau du Syndic (RDC)' 
  },
  { 
    id: 'staff-2', 
    title: 'Poste de Sécurité & Conciergerie', 
    name: 'Agent d\'Accueil & Sécurité', 
    role: 'Accueil, Contrôle d\'accès & Maintenance', 
    phone: '0555 00 00 00', 
    available: 'Présence continue 24/7', 
    location: 'Poste de Garde Principal' 
  }
];

// Official Algerian utility and emergency services
const CONTRACTOR_CONTACTS: EmergencyContact[] = [
  { 
    id: 'c-1', 
    title: 'SEAAL Urgence (Eau & Assainissement)', 
    role: 'Société des Eaux et de l\'Assainissement d\'Alger', 
    phone: '1594', 
    available: 'Numéro Vert 24/7', 
    icon: 'wrench' 
  },
  { 
    id: 'c-2', 
    title: 'Sonelgaz Dépannage (Électricité & Gaz)', 
    role: 'Centre d\'Appels National Sonelgaz', 
    phone: '3303', 
    available: 'Dépannage Réseau 24/7', 
    icon: 'zap' 
  },
  { 
    id: 'c-3', 
    title: 'Service Maintenance Ascenseurs', 
    role: 'Société de maintenance des ascenseurs', 
    phone: '021 00 00 00', 
    available: 'Astreinte technique 24/7', 
    icon: 'shield-alert' 
  }
];

// Load persisted accounts from storage if present
const getSavedRegisteredAccounts = (): ResidentProfile[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('haven_registered_accounts');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getSavedResidentSession = (): ResidentProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('haven_saved_resident_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Normalize clean strings
const cleanStr = (val?: string) => (val || '').trim().toLowerCase();
const cleanDigits = (val?: string) => (val || '').replace(/\D/g, '');
const cleanApt = (val?: string) => (val || '').trim().toLowerCase().replace(/^apt\s*/i, '');

interface BuildingState {
  currentRole: UserRole;
  userApartment: string;
  residentProfile: ResidentProfile | null;
  registeredAccounts: ResidentProfile[];
  buildings: Building[];
  activeBuildingId: string;
  residentHomeBuildingId: string;
  activeIncidents: Incident[];
  resolvedIncidents: Incident[];
  notices: BuildingNotice[];
  staffContacts: StaffContact[];
  contractorContacts: EmergencyContact[];
  residentReports: ResidentReport[];
  unreadAlertCount: number;
  soundEnabled: boolean;
  isLoading: boolean;
  
  // Actions
  initializeData: () => Promise<void>;
  setRole: (role: UserRole) => void;
  setActiveBuilding: (buildingId: string) => void;
  registerResident: (accountData: ResidentProfile) => Promise<{ success: boolean; message?: string }>;
  loginResidentWithCredentials: (buildingId: string, aptNumber: string, passwordOrPhone: string) => Promise<{ success: boolean; message?: string }>;
  loginResident: (profile: ResidentProfile) => Promise<void>;
  logoutResident: () => void;
  toggleSound: () => void;
  clearUnreadAlerts: () => void;
  
  // Database Actions
  addBuilding: (buildingData: Omit<Building, 'id'>) => Promise<void>;
  broadcastIncident: (newIncident: any) => Promise<void>;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus, note?: string) => Promise<void>;
  addTimelineNote: (incidentId: string, note: string) => Promise<void>;
  confirmRestoration: (incidentId: string, isRestored: boolean) => Promise<void>;
  submitResidentReport: (report: any) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: 'pending' | 'in_review' | 'resolved') => Promise<void>;
  addNotice: (notice: any) => Promise<void>;
}

const initialSavedProfile = getSavedResidentSession();

export const useBuildingStore = create<BuildingState>((set, get) => ({
  currentRole: 'resident',
  userApartment: initialSavedProfile ? `Apt ${initialSavedProfile.aptNumber} (Étage ${initialSavedProfile.floor})` : '',
  residentProfile: initialSavedProfile,
  registeredAccounts: getSavedRegisteredAccounts(),
  buildings: DEFAULT_BUILDINGS,
  activeBuildingId: initialSavedProfile?.buildingId || DEFAULT_BUILDINGS[0].id,
  residentHomeBuildingId: initialSavedProfile?.buildingId || DEFAULT_BUILDINGS[0].id,
  activeIncidents: [],
  resolvedIncidents: [],
  notices: [],
  staffContacts: STAFF_CONTACTS,
  contractorContacts: CONTRACTOR_CONTACTS,
  residentReports: [],
  unreadAlertCount: 0,
  soundEnabled: true,
  isLoading: false,

  initializeData: async () => {
    try {
      // Load buildings
      const { data: bData, error: bError } = await supabase.from('buildings').select('*');
      if (!bError && bData && bData.length > 0) {
        const formattedBuildings: Building[] = bData.map(b => ({
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

      // Validate active session with backend — skip in Capacitor (no backend server)
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
              set({
                residentProfile: meData.profile,
                userApartment: `Apt ${meData.profile.aptNumber} (Étage ${meData.profile.floor})`,
                residentHomeBuildingId: meData.profile.buildingId,
                activeBuildingId: currentBldg.id
              });
            }
          }
        } catch {
          // Fallback to local profile
        }
      }

      // Fetch incidents
      const { data: incData, error: incErr } = await supabase.from('incidents').select(`*, incident_timelines(*), incident_confirmations(*)`);
      if (!incErr && incData && incData.length > 0) {
        const active: Incident[] = [];
        const resolved: Incident[] = [];

        incData.forEach(inc => {
          const formatted: Incident = {
            id: inc.id,
            buildingId: inc.building_id,
            category: inc.category || 'water',
            severity: inc.severity || 'warning',
            title: inc.title,
            description: inc.description,
            location: inc.location,
            affectedUnits: inc.affected_units || 'Tous',
            status: inc.status || 'reported',
            reportedAt: new Date(inc.reported_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            estimatedRestorationTime: inc.estimated_restoration_time || 'Sous peu',
            etaCountdownMinutes: inc.eta_countdown_minutes || 0,
            requiresResidentConfirmation: inc.requires_resident_confirmation ?? (inc.category === 'water'),
            timeline: (inc.incident_timelines || []).map((t: any) => ({
              id: t.id, 
              status: t.status, 
              label: t.label || t.status, 
              timestamp: new Date(t.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
              note: t.note, 
              author: t.author || 'Bureau du Syndic'
            })),
            confirmations: (inc.incident_confirmations || []).map((c: any) => ({
              apartment: c.unit_id || 'Résident', 
              isRestored: c.is_restored, 
              timestamp: c.created_at
            }))
          };

          if (inc.status === 'resolved') resolved.push(formatted);
          else active.push(formatted);
        });

        set({ activeIncidents: active, resolvedIncidents: resolved });
      }

      // Fetch notices
      const { data: nData, error: nErr } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
      if (!nErr && nData && nData.length > 0) {
        set({
          notices: nData.map(n => ({
            id: n.id,
            buildingId: n.building_id,
            title: n.title,
            content: n.content,
            category: n.category || 'info',
            author: n.author || 'Bureau du Syndic',
            date: new Date(n.created_at).toLocaleDateString(),
            isPinned: Boolean(n.is_pinned),
            expenseDetails: n.total_amount ? {
              totalAmount: Number(n.total_amount),
              perResidentAmount: Number(n.per_resident_amount)
            } : undefined
          }))
        });
      }

      // Fetch tickets
      const { data: tData, error: tErr } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
      if (!tErr && tData && tData.length > 0) {
        set({
          residentReports: tData.map(t => ({
            id: t.id,
            buildingId: t.building_id,
            category: t.category || 'general',
            location: t.location,
            description: t.description,
            photoUrl: t.photo_url,
            status: t.status || 'pending',
            submittedBy: t.submitted_by || 'Résident',
            submittedAt: new Date(t.created_at).toLocaleDateString()
          }))
        });
      }
    } catch (err) {
      console.info('State initialized clean; Supabase sync available:', err);
    }

    // Subscribe to realtime changes safely
    try {
      supabase.channel('haven:changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
          get().initializeData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
          get().initializeData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, () => {
          get().initializeData();
        })
        .subscribe();
    } catch {
      // Safe fallback
    }
  },

  setRole: (role: UserRole) => set({ currentRole: role }),

  setActiveBuilding: (buildingId: string) => {
    set({ activeBuildingId: buildingId });
  },

  registerResident: async (accountData: ResidentProfile) => {
    const cleanAptNum = accountData.aptNumber.trim();
    const cleanPhone = accountData.phone.trim();
    const cleanPwd = accountData.password?.trim() || cleanPhone;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId: accountData.buildingId,
          aptNumber: cleanAptNum,
          floor: accountData.floor.trim(),
          lastName: accountData.lastName.trim(),
          firstName: accountData.firstName?.trim() || '',
          phone: cleanPhone,
          password: cleanPwd
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Erreur lors de la création du compte sur le serveur.'
        };
      }

      if (data.token) {
        localStorage.setItem('haven_session_token', data.token);
      }

      const registeredProfile: ResidentProfile = {
        id: data.profile.id,
        lastName: data.profile.lastName,
        firstName: data.profile.firstName || '',
        buildingId: data.profile.buildingId,
        floor: data.profile.floor,
        aptNumber: data.profile.aptNumber,
        phone: data.profile.phone,
        password: cleanPwd,
        joinedAt: data.profile.joinedAt || new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
      };

      const currentAccounts = get().registeredAccounts.filter(
        a => !(a.buildingId === registeredProfile.buildingId && cleanApt(a.aptNumber) === cleanApt(registeredProfile.aptNumber))
      );
      const updatedAccounts = [registeredProfile, ...currentAccounts];

      set({
        registeredAccounts: updatedAccounts,
        residentProfile: registeredProfile,
        userApartment: `Apt ${registeredProfile.aptNumber} (Étage ${registeredProfile.floor})`,
        residentHomeBuildingId: registeredProfile.buildingId,
        activeBuildingId: registeredProfile.buildingId
      });

      localStorage.setItem('haven_registered_accounts', JSON.stringify(updatedAccounts));
      localStorage.setItem('haven_saved_resident_profile', JSON.stringify(registeredProfile));

      return { success: true };
    } catch (err: any) {
      console.warn('Backend call failed, using local persistence fallback:', err);
      // Fallback
      const existing = get().registeredAccounts.find(
        a => a.buildingId === accountData.buildingId && cleanStr(a.aptNumber) === cleanStr(cleanAptNum)
      );
      if (existing) {
        return {
          success: false,
          message: `Un compte existe déjà pour l'appartement ${cleanAptNum} dans cette résidence.`
        };
      }

      const newProfile: ResidentProfile = {
        id: `prof-${Date.now()}`,
        lastName: accountData.lastName.trim(),
        firstName: accountData.firstName?.trim() || '',
        buildingId: accountData.buildingId,
        floor: accountData.floor.trim(),
        aptNumber: cleanAptNum,
        phone: cleanPhone,
        password: cleanPwd,
        joinedAt: new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
      };

      const updatedAccounts = [newProfile, ...get().registeredAccounts];
      set({
        registeredAccounts: updatedAccounts,
        residentProfile: newProfile,
        userApartment: `Apt ${newProfile.aptNumber} (Étage ${newProfile.floor})`,
        residentHomeBuildingId: newProfile.buildingId,
        activeBuildingId: newProfile.buildingId
      });

      localStorage.setItem('haven_registered_accounts', JSON.stringify(updatedAccounts));
      localStorage.setItem('haven_saved_resident_profile', JSON.stringify(newProfile));

      return { success: true };
    }
  },

  loginResidentWithCredentials: async (buildingId: string, aptNumber: string, passwordOrPhone: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId,
          aptNumber: aptNumber.trim(),
          password: passwordOrPhone.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Identifiants incorrects ou compte introuvable.'
        };
      }

      if (data.token) {
        localStorage.setItem('haven_session_token', data.token);
      }

      const profile: ResidentProfile = {
        id: data.profile.id,
        lastName: data.profile.lastName,
        firstName: data.profile.firstName || '',
        buildingId: data.profile.buildingId,
        floor: data.profile.floor,
        aptNumber: data.profile.aptNumber,
        phone: data.profile.phone,
        joinedAt: data.profile.joinedAt || 'Récemment'
      };

      const currentAccounts = get().registeredAccounts.filter(
        a => !(a.buildingId === profile.buildingId && cleanApt(a.aptNumber) === cleanApt(profile.aptNumber))
      );
      const updatedAccounts = [profile, ...currentAccounts];

      set({
        residentProfile: profile,
        registeredAccounts: updatedAccounts,
        userApartment: `Apt ${profile.aptNumber} (Étage ${profile.floor})`,
        residentHomeBuildingId: profile.buildingId,
        activeBuildingId: profile.buildingId
      });

      localStorage.setItem('haven_registered_accounts', JSON.stringify(updatedAccounts));
      localStorage.setItem('haven_saved_resident_profile', JSON.stringify(profile));

      return { success: true };
    } catch (err: any) {
      console.warn('Backend login call failed, checking local store:', err);
      // Fallback
      const targetApt = cleanStr(aptNumber);
      const enteredSecretDigits = cleanDigits(passwordOrPhone);
      const enteredSecretRaw = cleanStr(passwordOrPhone);

      const account = get().registeredAccounts.find(
        a => (a.buildingId === buildingId || cleanStr(a.buildingId) === cleanStr(buildingId)) && (
          cleanStr(a.aptNumber) === targetApt ||
          cleanStr(`apt ${a.aptNumber}`) === targetApt ||
          targetApt.endsWith(cleanStr(a.aptNumber))
        )
      );

      if (!account) {
        return {
          success: false,
          message: `Aucun compte trouvé pour l'appartement "${aptNumber}" dans cette résidence. Cliquez sur "Créer un Compte" pour vous inscrire.`
        };
      }

      const accountPhoneDigits = cleanDigits(account.phone);
      const accountPwdRaw = cleanStr(account.password);

      const isMatch = 
        (enteredSecretDigits.length >= 4 && accountPhoneDigits.endsWith(enteredSecretDigits)) ||
        (accountPwdRaw && accountPwdRaw === enteredSecretRaw) ||
        (enteredSecretRaw === cleanStr(account.phone));

      if (!isMatch) {
        return {
          success: false,
          message: `Mot de passe ou numéro de téléphone incorrect pour l'appartement ${account.aptNumber}.`
        };
      }

      set({
        residentProfile: account,
        userApartment: `Apt ${account.aptNumber} (Étage ${account.floor})`,
        residentHomeBuildingId: account.buildingId,
        activeBuildingId: account.buildingId
      });

      localStorage.setItem('haven_saved_resident_profile', JSON.stringify(account));
      return { success: true };
    }
  },

  loginResident: async (profile: ResidentProfile) => {
    set({
      residentProfile: profile,
      userApartment: `Apt ${profile.aptNumber} (Étage ${profile.floor})`,
      residentHomeBuildingId: profile.buildingId,
      activeBuildingId: profile.buildingId
    });
    try {
      localStorage.setItem('haven_saved_resident_profile', JSON.stringify(profile));
    } catch {
      // Ignore
    }
  },

  logoutResident: () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('haven_session_token') : null;
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
      localStorage.removeItem('haven_session_token');
    }
    set({ residentProfile: null, userApartment: '' });
    try {
      localStorage.removeItem('haven_saved_resident_profile');
    } catch {
      // Ignore
    }
  },

  toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),

  clearUnreadAlerts: () => set({ unreadAlertCount: 0 }),

  addBuilding: async (buildingData) => {
    const newId = `bldg-${Date.now()}`;
    const newBuilding: Building = {
      id: newId,
      ...buildingData,
      status: 'operational'
    };

    set(state => ({
      buildings: [...state.buildings, newBuilding],
      activeBuildingId: newId
    }));

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
  },

  broadcastIncident: async (incidentData) => {
    const newId = `inc-${Date.now()}`;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newIncident: Incident = {
      id: newId,
      buildingId: incidentData.buildingId || get().activeBuildingId || get().buildings[0]?.id,
      category: incidentData.category,
      severity: incidentData.severity,
      title: incidentData.title,
      description: incidentData.description,
      location: incidentData.location,
      affectedUnits: incidentData.affectedUnits,
      status: 'reported',
      reportedAt: currentTime,
      estimatedRestorationTime: incidentData.estimatedRestorationTime,
      etaCountdownMinutes: incidentData.etaCountdownMinutes,
      requiresResidentConfirmation: incidentData.requiresResidentConfirmation ?? (incidentData.category === 'water'),
      timeline: [
        {
          id: `t-${Date.now()}`,
          status: 'reported',
          label: 'Incident Déclaré',
          timestamp: currentTime,
          note: incidentData.description,
          author: 'Bureau du Syndic'
        }
      ],
      confirmations: []
    };

    set(state => ({
      activeIncidents: [newIncident, ...state.activeIncidents],
      unreadAlertCount: state.unreadAlertCount + 1
    }));

    if (get().soundEnabled) {
      playAlertSound(incidentData.severity);
    }

    try {
      await supabase.from('incidents').insert({
        id: newId,
        building_id: newIncident.buildingId,
        category: newIncident.category,
        severity: newIncident.severity,
        title: newIncident.title,
        description: newIncident.description,
        location: newIncident.location,
        affected_units: newIncident.affectedUnits,
        status: newIncident.status,
        estimated_restoration_time: newIncident.estimatedRestorationTime,
        eta_countdown_minutes: newIncident.etaCountdownMinutes,
        requires_resident_confirmation: newIncident.requiresResidentConfirmation
      });

      await supabase.from('incident_timelines').insert({
        incident_id: newId,
        status: 'reported',
        label: 'Incident Déclaré',
        note: incidentData.description,
        author: 'Bureau du Syndic'
      });
    } catch (err) {
      console.debug('DB incident insert error:', err);
    }
  },

  updateIncidentStatus: async (incidentId, status, note) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isResolved = status === 'resolved';

    set(state => {
      const target = state.activeIncidents.find(i => i.id === incidentId);
      if (!target) return state;

      const updatedTimeline = [
        ...target.timeline,
        {
          id: `t-${Date.now()}`,
          status,
          label: status.toUpperCase(),
          timestamp: currentTime,
          note: note || `Statut mis à jour: ${status}`,
          author: 'Bureau du Syndic'
        }
      ];

      const updatedIncident: Incident = {
        ...target,
        status,
        timeline: updatedTimeline,
        estimatedRestorationTime: isResolved ? 'Rétabli' : target.estimatedRestorationTime,
        etaCountdownMinutes: isResolved ? 0 : target.etaCountdownMinutes
      };

      if (isResolved) {
        return {
          activeIncidents: state.activeIncidents.filter(i => i.id !== incidentId),
          resolvedIncidents: [updatedIncident, ...state.resolvedIncidents]
        };
      } else {
        return {
          activeIncidents: state.activeIncidents.map(i => i.id === incidentId ? updatedIncident : i)
        };
      }
    });

    try {
      await supabase.from('incidents').update({ status }).eq('id', incidentId);
      await supabase.from('incident_timelines').insert({
        incident_id: incidentId,
        status,
        label: status.toUpperCase(),
        note: note || `Statut mis à jour: ${status}`,
        author: 'Bureau du Syndic'
      });
    } catch (err) {
      console.debug('DB incident update error:', err);
    }
  },

  addTimelineNote: async (incidentId, note) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const authorName = get().currentRole === 'manager' 
      ? 'Bureau du Syndic' 
      : (get().residentProfile?.lastName || 'Résident');

    set(state => {
      const active = state.activeIncidents.map(inc => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            timeline: [
              ...inc.timeline,
              {
                id: `t-${Date.now()}`,
                status: inc.status,
                label: 'Note Technique',
                timestamp: currentTime,
                note,
                author: authorName
              }
            ]
          };
        }
        return inc;
      });
      return { activeIncidents: active };
    });

    try {
      await supabase.from('incident_timelines').insert({
        incident_id: incidentId,
        status: 'in_progress',
        label: 'Note Technique',
        note,
        author: authorName
      });
    } catch (err) {
      console.debug('DB timeline note error:', err);
    }
  },

  confirmRestoration: async (incidentId, isRestored) => {
    const apt = get().userApartment || 'Mon Appartement';

    set(state => {
      const active = state.activeIncidents.map(inc => {
        if (inc.id === incidentId) {
          const existingFiltered = (inc.confirmations || []).filter(c => c.apartment !== apt);
          return {
            ...inc,
            confirmations: [
              ...existingFiltered,
              {
                apartment: apt,
                isRestored,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
        }
        return inc;
      });
      return { activeIncidents: active };
    });

    try {
      await supabase.from('incident_confirmations').upsert({
        incident_id: incidentId,
        unit_id: apt,
        is_restored: isRestored
      });
    } catch (err) {
      console.debug('DB confirmation error:', err);
    }
  },

  submitResidentReport: async (report) => {
    const bId = get().residentHomeBuildingId || get().buildings[0]?.id;
    const author = get().residentProfile 
      ? `${get().residentProfile?.lastName} (${get().userApartment})`
      : 'Résident';

    const newReport: ResidentReport = {
      id: `rep-${Date.now()}`,
      buildingId: bId,
      category: report.category,
      location: report.location,
      description: report.description,
      photoUrl: report.photoUrl,
      status: 'pending',
      submittedBy: author,
      submittedAt: 'À l\'instant'
    };

    set(state => ({
      residentReports: [newReport, ...state.residentReports]
    }));

    try {
      await supabase.from('tickets').insert({
        building_id: bId,
        category: report.category,
        location: report.location,
        description: report.description,
        photo_url: report.photoUrl,
        status: 'pending',
        submitted_by: author
      });
    } catch (err) {
      console.debug('DB ticket insert error:', err);
    }
  },

  updateTicketStatus: async (ticketId, status) => {
    set(state => ({
      residentReports: state.residentReports.map(r => r.id === ticketId ? { ...r, status } : r)
    }));

    try {
      await supabase.from('tickets').update({ status }).eq('id', ticketId);
    } catch (err) {
      console.debug('DB ticket status error:', err);
    }
  },

  addNotice: async (notice) => {
    const bId = notice.buildingId || get().activeBuildingId || get().buildings[0]?.id;
    const newNotice: BuildingNotice = {
      id: `not-${Date.now()}`,
      buildingId: bId,
      title: notice.title,
      content: notice.content,
      category: notice.category || 'info',
      author: notice.author || 'Bureau du Syndic',
      date: 'Aujourd\'hui',
      isPinned: notice.isPinned ?? true,
      expenseDetails: notice.expenseDetails
    };

    set(state => ({
      notices: [newNotice, ...state.notices]
    }));

    try {
      await supabase.from('notices').insert({
        id: newNotice.id,
        building_id: bId,
        title: notice.title,
        content: notice.content,
        category: newNotice.category,
        author: newNotice.author,
        is_pinned: newNotice.isPinned,
        total_amount: notice.expenseDetails?.totalAmount,
        per_resident_amount: notice.expenseDetails?.perResidentAmount
      });
    } catch (err) {
      console.debug('DB notice insert error:', err);
    }
  }
}));
