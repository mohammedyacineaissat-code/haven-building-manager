import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Incident, IncidentStatus } from '../types/building';
import { generateUUID, isOnline } from './utils';
import { useAuthStore } from './useAuthStore';
import { playAlertSound } from '../utils/audio';

// ── Incident Store Interface ──────────────────────────────────────────
interface IncidentState {
  activeIncidents: Incident[];
  resolvedIncidents: Incident[];
  unreadAlertCount: number;
  soundEnabled: boolean;
  isLoading: boolean;
  error: string | null;

  // Data loading
  loadIncidents: () => Promise<void>;

  // Actions
  broadcastIncident: (newIncident: any) => Promise<void>;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus, note?: string) => Promise<void>;
  addTimelineNote: (incidentId: string, note: string) => Promise<void>;
  confirmRestoration: (incidentId: string, isRestored: boolean) => Promise<void>;
  toggleSound: () => void;
  clearUnreadAlerts: () => void;
}

// ── Incident Store ────────────────────────────────────────────────────
export const useIncidentStore = create<IncidentState>((set, get) => ({
  activeIncidents: [],
  resolvedIncidents: [],
  unreadAlertCount: 0,
  soundEnabled: true,
  isLoading: false,
  error: null,

  loadIncidents: async () => {
    if (!isOnline()) return;
    set({ isLoading: true, error: null });
    try {
      const { data: incData, error: incErr } = await supabase
        .from('incidents')
        .select(`*, incident_timelines(*), incident_confirmations(*)`);

      if (!incErr && incData && incData.length > 0) {
        const active: Incident[] = [];
        const resolved: Incident[] = [];

        incData.forEach((inc: Record<string, any>) => {
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
            timeline: (inc.incident_timelines || []).map((t: Record<string, any>) => ({
              id: t.id,
              status: t.status,
              label: t.label || t.status,
              timestamp: new Date(t.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              note: t.note,
              author: t.author || 'Bureau du Syndic'
            })),
            confirmations: (inc.incident_confirmations || []).map((c: Record<string, any>) => ({
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
    } catch (err) {
      console.warn('Failed to load incidents:', err);
      set({ error: 'Failed to load incidents' });
    } finally {
      set({ isLoading: false });
    }
  },

  broadcastIncident: async (incidentData) => {
    const newId = generateUUID();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newIncident: Incident = {
      id: newId,
      buildingId: incidentData.buildingId,
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
          id: generateUUID(),
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

    if (isOnline()) {
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
          id: generateUUID(),
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

    if (isOnline()) {
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
    }
  },

  addTimelineNote: async (incidentId, note) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const authState = useAuthStore.getState();
    const authorName = authState.currentRole === 'manager'
      ? 'Bureau du Syndic'
      : (authState.residentProfile?.lastName || 'Résident');

    set(state => {
      const active = state.activeIncidents.map(inc => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            timeline: [
              ...inc.timeline,
              {
                id: generateUUID(),
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

    if (isOnline()) {
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
    }
  },

  confirmRestoration: async (incidentId, isRestored) => {
    const apt = useAuthStore.getState().userApartment || 'Mon Appartement';

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

    if (isOnline()) {
      try {
        await supabase.from('incident_confirmations').upsert({
          incident_id: incidentId,
          unit_id: apt,
          is_restored: isRestored
        });
      } catch (err) {
        console.debug('DB confirmation error:', err);
      }
    }
  },

  toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),

  clearUnreadAlerts: () => set({ unreadAlertCount: 0 }),
}));
