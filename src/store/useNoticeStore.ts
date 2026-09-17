import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { BuildingNotice } from '../types/building';
import { generateUUID, isOnline } from './utils';

// ── Notice Store Interface ────────────────────────────────────────────
interface NoticeState {
  notices: BuildingNotice[];
  isLoading: boolean;
  error: string | null;

  // Data loading
  loadNotices: () => Promise<void>;

  // Actions
  addNotice: (notice: any) => Promise<void>;
  deleteNotice: (noticeId: string) => Promise<void>;
}

// ── Notice Store ──────────────────────────────────────────────────────
export const useNoticeStore = create<NoticeState>((set, get) => ({
  notices: [],
  isLoading: false,
  error: null,

  loadNotices: async () => {
    if (!isOnline()) return;
    set({ isLoading: true, error: null });
    try {
      const { data: nData, error: nErr } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (!nErr && nData && nData.length > 0) {
        set({
          notices: nData.map((n: Record<string, any>) => ({
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
    } catch (err) {
      console.warn('Failed to load notices:', err);
      set({ error: 'Failed to load notices' });
    } finally {
      set({ isLoading: false });
    }
  },

  addNotice: async (notice) => {
    const bId = notice.buildingId;
    const newNotice: BuildingNotice = {
      id: generateUUID(),
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

    if (isOnline()) {
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
  },

  deleteNotice: async (noticeId: string) => {
    set(state => ({
      notices: state.notices.filter(n => n.id !== noticeId)
    }));

    if (isOnline()) {
      try {
        await supabase.from('notices').delete().eq('id', noticeId);
      } catch (err) {
        console.debug('DB notice delete error:', err);
      }
    }
  },
}));
