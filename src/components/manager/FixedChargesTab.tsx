import React, { useState, useMemo } from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { FixedCharge, FixedChargeCategory } from '../../types/building';
import { AddFixedChargeModal } from './AddFixedChargeModal';
import { 
  Wallet, 
  Plus, 
  UserCheck, 
  FileText, 
  Zap, 
  Wrench, 
  Coins, 
  CheckCircle2, 
  Clock, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Info,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface FixedChargesTabProps {
  buildingId: string;
  totalUnits: number;
  currentMonthlyCharge: number;
}

export const FixedChargesTab: React.FC<FixedChargesTabProps> = ({
  buildingId,
  totalUnits,
  currentMonthlyCharge
}) => {
  const { fixedCharges, toggleFixedChargeSettled, deleteFixedCharge } = useBuildingStore();
  const { t, isRtl } = useLanguageStore();

  const [filterCategory, setFilterCategory] = useState<FixedChargeCategory | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<FixedCharge | null>(null);

  const charges = fixedCharges[buildingId] || [];

  // Financial calculations
  const totalMonthlyBudget = useMemo(() => {
    return charges.reduce((acc, c) => acc + (Number(c.monthlyAmount) || 0), 0);
  }, [charges]);

  const recommendedCotisationPerUnit = useMemo(() => {
    return totalUnits > 0 ? Math.ceil(totalMonthlyBudget / totalUnits) : 0;
  }, [totalMonthlyBudget, totalUnits]);

  const operatingMarginPerUnit = currentMonthlyCharge - recommendedCotisationPerUnit;

  const settledThisMonth = useMemo(() => {
    return charges
      .filter(c => c.isPaidThisMonth)
      .reduce((acc, c) => acc + (Number(c.monthlyAmount) || 0), 0);
  }, [charges]);

  const pendingThisMonth = totalMonthlyBudget - settledThisMonth;

  // Filtered charges
  const filteredCharges = useMemo(() => {
    if (filterCategory === 'all') return charges;
    return charges.filter(c => c.category === filterCategory);
  }, [charges, filterCategory]);

  const categoryMeta: Record<FixedChargeCategory, { label: string; icon: any; color: string }> = {
    salary: { 
      label: t.fixed_charges.cat_salary, 
      icon: UserCheck, 
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' 
    },
    contract: { 
      label: t.fixed_charges.cat_contract, 
      icon: FileText, 
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' 
    },
    utility: { 
      label: t.fixed_charges.cat_utility, 
      icon: Zap, 
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' 
    },
    maintenance: { 
      label: t.fixed_charges.cat_maintenance, 
      icon: Wrench, 
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' 
    },
    other: { 
      label: t.fixed_charges.cat_other, 
      icon: Coins, 
      color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' 
    },
  };

  const filterTabs: { id: FixedChargeCategory | 'all'; label: string }[] = [
    { id: 'all', label: t.fixed_charges.filter_all },
    { id: 'salary', label: t.fixed_charges.filter_salary },
    { id: 'contract', label: t.fixed_charges.filter_contract },
    { id: 'utility', label: t.fixed_charges.filter_utility },
    { id: 'maintenance', label: t.fixed_charges.filter_maintenance },
  ];

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      
      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* KPI 1: Total Monthly Fixed Budget */}
        <div className="p-4 sm:p-5 rounded-3xl elevate-card flex flex-col justify-between border border-slate-200/70 dark:border-slate-800/70 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.fixed_charges.monthly_budget_kpi}
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {totalMonthlyBudget.toLocaleString()} <span className="text-xs sm:text-sm font-bold text-slate-500">DA / mois</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {charges.length} postes réguliers enregistrés
            </p>
          </div>
        </div>

        {/* KPI 2: Recommended Baseline Cotisation */}
        <div className="p-4 sm:p-5 rounded-3xl elevate-card flex flex-col justify-between border border-slate-200/70 dark:border-slate-800/70 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.fixed_charges.recommended_cotisation_kpi}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {recommendedCotisationPerUnit.toLocaleString()} <span className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300">DA</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              par appartement ({totalUnits} lots)
            </p>
          </div>
        </div>

        {/* KPI 3: Operating Safety Margin */}
        <div className="p-4 sm:p-5 rounded-3xl elevate-card flex flex-col justify-between border border-slate-200/70 dark:border-slate-800/70 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {operatingMarginPerUnit >= 0 ? t.fixed_charges.surplus_kpi : t.fixed_charges.deficit_kpi}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              operatingMarginPerUnit >= 0 
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}>
              {operatingMarginPerUnit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-xl sm:text-2xl font-black ${
              operatingMarginPerUnit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {operatingMarginPerUnit >= 0 ? `+${operatingMarginPerUnit.toLocaleString()}` : operatingMarginPerUnit.toLocaleString()}{' '}
              <span className="text-xs sm:text-sm font-bold opacity-80">DA</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              Cotisation actuelle : {currentMonthlyCharge.toLocaleString()} DA
            </p>
          </div>
        </div>

        {/* KPI 4: Monthly Settlement Progress */}
        <div className="p-4 sm:p-5 rounded-3xl elevate-card flex flex-col justify-between border border-slate-200/70 dark:border-slate-800/70 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.fixed_charges.settled_kpi}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {settledThisMonth.toLocaleString()} <span className="text-xs sm:text-sm font-bold text-slate-500">DA</span>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
              Reste en attente : {pendingThisMonth.toLocaleString()} DA
            </p>
          </div>
        </div>

      </div>

      {/* Action Bar & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filterCategory === tab.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setEditingCharge(null);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.fixed_charges.add_charge_btn}</span>
        </button>
      </div>

      {/* Fixed Charges Cards List */}
      {filteredCharges.length === 0 ? (
        <div className="p-12 rounded-3xl elevate-card border border-dashed border-slate-300 dark:border-slate-800 text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {t.fixed_charges.no_charges}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {t.fixed_charges.no_charges_desc}
          </p>
          <button
            onClick={() => {
              setEditingCharge(null);
              setIsAddModalOpen(true);
            }}
            className="mt-5 px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
          >
            {t.fixed_charges.add_charge_btn}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredCharges.map(charge => {
            const meta = categoryMeta[charge.category] || categoryMeta.other;
            const CategoryIcon = meta.icon;

            return (
              <div
                key={charge.id}
                className="p-5 rounded-3xl elevate-card border border-slate-200/70 dark:border-slate-800/70 shadow-sm flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div>
                  {/* Top Bar: Category Pill & Actions */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${meta.color}`}>
                      <CategoryIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{meta.label}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCharge(charge);
                          setIsAddModalOpen(true);
                        }}
                        title={t.finances.edit_btn}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(t.fixed_charges.delete_confirm)) {
                            deleteFixedCharge(buildingId, charge.id);
                          }
                        }}
                        title={t.common.cancel}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Payee */}
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {charge.title}
                  </h4>
                  {charge.payee && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{charge.payee}</span>
                    </p>
                  )}
                  {charge.notes && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 italic line-clamp-2">
                      « {charge.notes} »
                    </p>
                  )}
                </div>

                {/* Bottom Bar: Amount & Settlement Toggle */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Montant Mensuel
                    </span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {charge.monthlyAmount.toLocaleString()} <span className="text-xs font-semibold text-slate-500">DA</span>
                    </span>
                  </div>

                  <button
                    onClick={() => toggleFixedChargeSettled(buildingId, charge.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                      charge.isPaidThisMonth
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20'
                    }`}
                    title={charge.isPaidThisMonth ? t.fixed_charges.mark_pending_action : t.fixed_charges.mark_paid_action}
                  >
                    {charge.isPaidThisMonth ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t.fixed_charges.status_paid}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{t.fixed_charges.status_pending}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <AddFixedChargeModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingCharge(null);
          }}
          buildingId={buildingId}
          initialCharge={editingCharge}
        />
      )}
    </div>
  );
};
