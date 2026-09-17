import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { FixedCharge, GrosTravauxProject } from '../types/building';
import { generateUUID, safeGetItem, safeSetItem, isOnline } from './utils';
import { DEFAULT_FIXED_CHARGES, DEFAULT_GROS_TRAVAUX } from './defaults';
import { useNoticeStore } from './useNoticeStore';

// ── Finance Store Interface ───────────────────────────────────────────
interface FinanceState {
  finances: Record<string, { monthlyCharge: number; paidApts: string[] }>;
  fixedCharges: Record<string, FixedCharge[]>;
  grosTravauxProjects: Record<string, GrosTravauxProject[]>;
  isLoading: boolean;
  error: string | null;

  // Data loading
  loadFinances: () => Promise<void>;

  // Cotisation Actions
  updateFinances: (buildingId: string, monthlyCharge: number, paidApts: string[]) => Promise<void>;

  // Fixed Charges Actions
  addFixedCharge: (buildingId: string, charge: Omit<FixedCharge, 'id' | 'buildingId'>) => Promise<void>;
  updateFixedCharge: (buildingId: string, chargeId: string, updates: Partial<FixedCharge>) => Promise<void>;
  deleteFixedCharge: (buildingId: string, chargeId: string) => Promise<void>;
  toggleFixedChargeSettled: (buildingId: string, chargeId: string) => Promise<void>;

  // Gros Travaux Actions
  addGrosTravauxProject: (buildingId: string, project: Omit<GrosTravauxProject, 'id' | 'buildingId' | 'createdAt' | 'paidApts' | 'perUnitQuota'>, totalUnits: number) => Promise<void>;
  updateGrosTravauxProject: (buildingId: string, projectId: string, updates: Partial<GrosTravauxProject>, totalUnits: number) => Promise<void>;
  toggleGrosTravauxAptPaid: (buildingId: string, projectId: string, aptNumber: string) => Promise<void>;
  deleteGrosTravauxProject: (buildingId: string, projectId: string) => Promise<void>;
  publishGrosTravauxNotice: (buildingId: string, projectId: string, totalUnits: number) => Promise<void>;
}

// ── Finance Store ─────────────────────────────────────────────────────
export const useFinanceStore = create<FinanceState>((set, get) => ({
  finances: {},
  fixedCharges: safeGetItem('haven_fixed_charges', DEFAULT_FIXED_CHARGES),
  grosTravauxProjects: safeGetItem('haven_gros_travaux', DEFAULT_GROS_TRAVAUX),
  isLoading: false,
  error: null,

  loadFinances: async () => {
    if (!isOnline()) return;
    set({ isLoading: true, error: null });
    try {
      const { data: finData, error: finErr } = await supabase.from('finances').select('*');
      if (!finErr && finData && finData.length > 0) {
        const financesMap: Record<string, { monthlyCharge: number; paidApts: string[] }> = {};
        finData.forEach((f: Record<string, any>) => {
          financesMap[f.building_id] = {
            monthlyCharge: Number(f.monthly_charge) || 2500,
            paidApts: Array.isArray(f.paid_apts) ? f.paid_apts : []
          };
        });
        set({ finances: financesMap });
      }
    } catch (err) {
      console.warn('Failed to load finances:', err);
      set({ error: 'Failed to load finances' });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Cotisation Actions ────────────────────────────────────────────
  updateFinances: async (buildingId, monthlyCharge, paidApts) => {
    set(state => ({
      finances: {
        ...state.finances,
        [buildingId]: { monthlyCharge, paidApts }
      }
    }));

    if (isOnline()) {
      try {
        const { error } = await supabase
          .from('finances')
          .upsert({
            building_id: buildingId,
            monthly_charge: monthlyCharge,
            paid_apts: paidApts,
            updated_at: new Date().toISOString()
          }, { onConflict: 'building_id' });

        if (error) console.error('DB finance upsert error:', error);
      } catch (err) {
        console.error('DB finance error:', err);
      }
    }
  },

  // ── Fixed Charges Actions ─────────────────────────────────────────
  addFixedCharge: async (buildingId, chargeData) => {
    const newCharge: FixedCharge = {
      id: generateUUID(),
      buildingId,
      ...chargeData,
      updatedAt: new Date().toISOString()
    };
    const current = get().fixedCharges[buildingId] || [];
    const updated = [newCharge, ...current];
    const newMap = { ...get().fixedCharges, [buildingId]: updated };
    set({ fixedCharges: newMap });
    safeSetItem('haven_fixed_charges', newMap);
  },

  updateFixedCharge: async (buildingId, chargeId, updates) => {
    const current = get().fixedCharges[buildingId] || [];
    const updated = current.map(c => c.id === chargeId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
    const newMap = { ...get().fixedCharges, [buildingId]: updated };
    set({ fixedCharges: newMap });
    safeSetItem('haven_fixed_charges', newMap);
  },

  deleteFixedCharge: async (buildingId, chargeId) => {
    const current = get().fixedCharges[buildingId] || [];
    const updated = current.filter(c => c.id !== chargeId);
    const newMap = { ...get().fixedCharges, [buildingId]: updated };
    set({ fixedCharges: newMap });
    safeSetItem('haven_fixed_charges', newMap);
  },

  toggleFixedChargeSettled: async (buildingId, chargeId) => {
    const current = get().fixedCharges[buildingId] || [];
    const updated = current.map(c => c.id === chargeId ? { ...c, isPaidThisMonth: !c.isPaidThisMonth } : c);
    const newMap = { ...get().fixedCharges, [buildingId]: updated };
    set({ fixedCharges: newMap });
    safeSetItem('haven_fixed_charges', newMap);
  },

  // ── Gros Travaux Actions ──────────────────────────────────────────
  addGrosTravauxProject: async (buildingId, projectData, totalUnits) => {
    const perQuota = totalUnits > 0 ? Math.round(projectData.totalCost / totalUnits) : projectData.totalCost;

    const newProject: GrosTravauxProject = {
      id: generateUUID(),
      buildingId,
      ...projectData,
      perUnitQuota: perQuota,
      paidApts: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    const current = get().grosTravauxProjects[buildingId] || [];
    const updated = [newProject, ...current];
    const newMap = { ...get().grosTravauxProjects, [buildingId]: updated };
    set({ grosTravauxProjects: newMap });
    safeSetItem('haven_gros_travaux', newMap);
  },

  updateGrosTravauxProject: async (buildingId, projectId, updates, totalUnits) => {
    const current = get().grosTravauxProjects[buildingId] || [];

    const updated = current.map(p => {
      if (p.id !== projectId) return p;
      const nextTotalCost = updates.totalCost !== undefined ? updates.totalCost : p.totalCost;
      const nextQuota = totalUnits > 0 ? Math.round(nextTotalCost / totalUnits) : nextTotalCost;
      return {
        ...p,
        ...updates,
        perUnitQuota: nextQuota
      };
    });

    const newMap = { ...get().grosTravauxProjects, [buildingId]: updated };
    set({ grosTravauxProjects: newMap });
    safeSetItem('haven_gros_travaux', newMap);
  },

  toggleGrosTravauxAptPaid: async (buildingId, projectId, aptNumber) => {
    const current = get().grosTravauxProjects[buildingId] || [];
    const cleanNum = aptNumber.trim();
    const updated = current.map(p => {
      if (p.id !== projectId) return p;
      const setApts = new Set(p.paidApts || []);
      if (setApts.has(cleanNum)) {
        setApts.delete(cleanNum);
      } else {
        setApts.add(cleanNum);
      }
      return { ...p, paidApts: Array.from(setApts) };
    });

    const newMap = { ...get().grosTravauxProjects, [buildingId]: updated };
    set({ grosTravauxProjects: newMap });
    safeSetItem('haven_gros_travaux', newMap);
  },

  deleteGrosTravauxProject: async (buildingId, projectId) => {
    const current = get().grosTravauxProjects[buildingId] || [];
    const projectToDelete = current.find(p => p.id === projectId);
    const updated = current.filter(p => p.id !== projectId);
    const newMap = { ...get().grosTravauxProjects, [buildingId]: updated };
    set({ grosTravauxProjects: newMap });
    safeSetItem('haven_gros_travaux', newMap);

    // Auto-delete the associated broadcast notice if it exists
    if (projectToDelete) {
      const expectedTitle = `🚨 APPEL DE FONDS : ${projectToDelete.title}`;
      const noticeStore = useNoticeStore.getState();
      const relatedNotice = noticeStore.notices.find(n => n.title === expectedTitle && n.buildingId === buildingId);
      if (relatedNotice) {
        await noticeStore.deleteNotice(relatedNotice.id);
      }
    }
  },

  publishGrosTravauxNotice: async (buildingId, projectId, totalUnits) => {
    const projects = get().grosTravauxProjects[buildingId] || [];
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const noticeContent = `${project.description}\n\n` +
      `📌 Coût Total du Projet : ${project.totalCost.toLocaleString()} DA\n` +
      `🏢 Quote-part par Appartement : ${project.perUnitQuota.toLocaleString()} DA\n` +
      `📅 Échéance prévue : ${project.deadline}\n` +
      (project.contractorName ? `👷 Entreprise retenue : ${project.contractorName} (${project.contractorPhone || 'N/A'})\n` : '') +
      `✅ Progression actuelle : ${project.paidApts.length}/${totalUnits} appartements ont versé leur cotisation.`;

    await useNoticeStore.getState().addNotice({
      buildingId,
      title: `🚨 APPEL DE FONDS : ${project.title}`,
      content: noticeContent,
      category: 'expense',
      author: 'Bureau du Syndic (Gros Travaux)',
      isPinned: true,
      expenseDetails: {
        totalAmount: project.totalCost,
        perResidentAmount: project.perUnitQuota
      }
    });
  },
}));
