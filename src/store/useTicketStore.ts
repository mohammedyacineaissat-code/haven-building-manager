import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { ResidentReport } from '../types/building';
import { generateUUID, isOnline } from './utils';
import { useAuthStore } from './useAuthStore';

// ── Ticket Store Interface ────────────────────────────────────────────
interface TicketState {
  residentReports: ResidentReport[];
  isLoading: boolean;
  error: string | null;

  // Data loading
  loadTickets: () => Promise<void>;

  // Actions
  submitResidentReport: (report: any) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: 'pending' | 'in_review' | 'resolved') => Promise<void>;
}

// ── Ticket Store ──────────────────────────────────────────────────────
export const useTicketStore = create<TicketState>((set, get) => ({
  residentReports: [],
  isLoading: false,
  error: null,

  loadTickets: async () => {
    if (!isOnline()) return;
    set({ isLoading: true, error: null });
    try {
      const { data: tData, error: tErr } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (!tErr && tData && tData.length > 0) {
        set({
          residentReports: tData.map((t: Record<string, any>) => ({
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
      console.warn('Failed to load tickets:', err);
      set({ error: 'Failed to load tickets' });
    } finally {
      set({ isLoading: false });
    }
  },

  submitResidentReport: async (report) => {
    const authState = useAuthStore.getState();
    const bId = authState.residentProfile?.buildingId || '';
    const author = authState.residentProfile
      ? `${authState.residentProfile.lastName} (${authState.userApartment})`
      : 'Résident';

    const newReport: ResidentReport = {
      id: generateUUID(),
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

    if (isOnline()) {
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
    }
  },

  updateTicketStatus: async (ticketId, status) => {
    set(state => ({
      residentReports: state.residentReports.map(r => r.id === ticketId ? { ...r, status } : r)
    }));

    if (isOnline()) {
      try {
        await supabase.from('tickets').update({ status }).eq('id', ticketId);
      } catch (err) {
        console.debug('DB ticket status error:', err);
      }
    }
  },
}));
