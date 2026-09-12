import React, { useState, useEffect, useMemo } from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { 
  Wallet, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle, 
  Circle, 
  Save, 
  Coins, 
  FileText, 
  AlertCircle, 
  Clock, 
  User,
  Filter,
  CheckCheck
} from 'lucide-react';

export const FinancesBoard: React.FC = () => {
  const activeBuildingId = useBuildingStore(state => state.activeBuildingId);
  const buildings = useBuildingStore(state => state.buildings);
  const allNotices = useBuildingStore(state => state.notices);
  const registeredAccounts = useBuildingStore(state => state.registeredAccounts);
  const finances = useBuildingStore(state => state.finances);
  const updateFinances = useBuildingStore(state => state.updateFinances);

  const selectedBuilding = buildings.find(b => b.id === activeBuildingId) || buildings[0];
  const notices = allNotices.filter(n => !n.buildingId || n.buildingId === (selectedBuilding?.id || activeBuildingId));

  const { t } = useLanguageStore();

  const currentFinances = selectedBuilding ? finances[selectedBuilding.id] : null;

  const [monthlyCharge, setMonthlyCharge] = useState<number>(2500);
  const [paidApts, setPaidApts] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'unpaid' | 'paid'>('all');

  useEffect(() => {
    if (currentFinances) {
      setMonthlyCharge(Number(currentFinances.monthlyCharge) || 2500);
      setPaidApts(new Set(currentFinances.paidApts || []));
    } else {
      setMonthlyCharge(2500);
      setPaidApts(new Set());
    }
  }, [currentFinances, selectedBuilding?.id]);

  const toggleApt = async (apt: string) => {
    if (!selectedBuilding) return;
    const next = new Set<string>(paidApts);
    if (next.has(apt)) next.delete(apt);
    else next.add(apt);
    
    setPaidApts(next);
    await updateFinances(selectedBuilding.id, monthlyCharge, Array.from(next));
  };

  const handleSaveCharge = async () => {
    setIsEditing(false);
    if (!selectedBuilding) return;
    const validCharge = Math.max(0, monthlyCharge);
    setMonthlyCharge(validCharge);
    await updateFinances(selectedBuilding.id, validCharge, Array.from(paidApts));
  };

  if (!selectedBuilding) return null;

  const totalUnits = selectedBuilding.totalUnits || 30;
  
  // Filter shared expense notices for this building
  const expenseNotices = notices.filter(n => n.category === 'expense' && n.expenseDetails);
  
  const totalExpenses = expenseNotices.reduce((sum, n) => {
    const amt = Number(n.expenseDetails?.totalAmount) || 0;
    return sum + amt;
  }, 0);

  const totalCollected = paidApts.size * monthlyCharge;
  const remaining = totalCollected - totalExpenses;
  const totalDebt = Math.max(0, (totalUnits - paidApts.size) * monthlyCharge);
  const collectionRate = totalUnits > 0 ? Math.min(100, Math.round((paidApts.size / totalUnits) * 100)) : 0;

  // Map registered residents to apartments
  const buildingResidents = registeredAccounts.filter(r => r.buildingId === selectedBuilding.id);
  const residentMap = useMemo(() => {
    const map = new Map<string, typeof registeredAccounts[0]>();
    buildingResidents.forEach(r => {
      const cleanNum = r.aptNumber.trim();
      map.set(`Apt ${cleanNum}`, r);
      map.set(cleanNum, r);
    });
    return map;
  }, [buildingResidents]);

  const aptsList = Array.from({ length: totalUnits }, (_, i) => `Apt ${i + 1}`);
  const unpaidApts = aptsList.filter(apt => !paidApts.has(apt));

  const filteredApts = aptsList.filter(apt => {
    if (filterMode === 'paid') return paidApts.has(apt);
    if (filterMode === 'unpaid') return !paidApts.has(apt);
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.finances.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.finances.subtitle} {selectedBuilding.name} ({totalUnits} {t.manager.apartments_label})
          </p>
        </div>
      </div>

      {/* Monthly Report Summary */}
      <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 dark:from-emerald-950/30 dark:via-[#101828] dark:to-slate-900 border border-emerald-100 dark:border-emerald-500/20 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.finances.monthly_report}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.finances.collection_rate}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {collectionRate}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ({paidApts.size} / {totalUnits} {t.finances.paid_count})
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700/50 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-sm" 
                style={{ width: `${collectionRate}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.finances.total_debts}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {totalDebt.toLocaleString()} DA
              </span>
            </div>
            <p className="text-xs text-rose-600/90 dark:text-rose-400/90 mt-1 font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{unpaidApts.length} {t.finances.apartments_late}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t.finances.funds_collected}</span>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalCollected.toLocaleString()} DA</span>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{paidApts.size} / {totalUnits} {t.finances.paid_count}</div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t.finances.total_expenses}</span>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalExpenses.toLocaleString()} DA</span>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{expenseNotices.length} {t.finances.expenses_this_month}</div>
          </div>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between transition-colors ${
          remaining >= 0 
            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-500/30' 
            : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-xl ${remaining >= 0 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t.finances.remaining_balance}</span>
          </div>
          <div>
            <span className={`text-2xl font-black font-mono ${remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {remaining.toLocaleString()} DA
            </span>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Trésorerie nette disponible</div>
          </div>
        </div>
      </div>

      {/* Monthly Charge Settings */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-2xl shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.finances.monthly_charge}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.finances.monthly_charge_desc}</p>
          </div>
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input 
              type="number"
              min="0"
              step="100"
              value={monthlyCharge}
              onChange={(e) => setMonthlyCharge(Number(e.target.value))}
              className="w-32 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
            />
            <button 
              onClick={handleSaveCharge} 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{monthlyCharge.toLocaleString()} DA / mois</span>
            <button 
              onClick={() => setIsEditing(true)} 
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl transition-colors"
            >
              {t.finances.edit_btn}
            </button>
          </div>
        )}
      </div>

      {/* Two Column Layout for Apartment Tracking & Expense History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Apartment List & Payment Tracking (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700/50 overflow-hidden flex flex-col transition-colors">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.finances.payment_status}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {paidApts.size} {t.finances.paid_of_total} {totalUnits} appartements
              </p>
            </div>
            
            {/* Filter Pills */}
            <div className="flex p-1 rounded-xl bg-slate-200/60 dark:bg-slate-700/60 text-xs font-bold self-start sm:self-auto">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg transition-all ${filterMode === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                Tous ({totalUnits})
              </button>
              <button
                onClick={() => setFilterMode('unpaid')}
                className={`px-3 py-1 rounded-lg transition-all ${filterMode === 'unpaid' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                Impayés ({unpaidApts.length})
              </button>
              <button
                onClick={() => setFilterMode('paid')}
                className={`px-3 py-1 rounded-lg transition-all ${filterMode === 'paid' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                À jour ({paidApts.size})
              </button>
            </div>
          </div>
          
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[440px] overflow-y-auto custom-scrollbar">
            {filteredApts.map((apt) => {
              const isPaid = paidApts.has(apt);
              const resident = residentMap.get(apt);

              return (
                <button
                  key={apt}
                  onClick={() => toggleApt(apt)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                    isPaid 
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-500/30 hover:border-emerald-400 shadow-sm' 
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-black ${isPaid ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {apt}
                      </span>
                      {resident && (
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">
                          • {resident.lastName} {resident.firstName ? resident.firstName.charAt(0) + '.' : ''}
                        </span>
                      )}
                    </div>
                    {isPaid ? (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                        Cotisation réglée ({monthlyCharge.toLocaleString()} DA)
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-0.5">
                        {t.finances.debt_label} {monthlyCharge.toLocaleString()} DA
                      </span>
                    )}
                  </div>
                  {isPaid ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Shared Expense History (5 cols on desktop) */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700/50 overflow-hidden flex flex-col transition-colors">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.finances.expense_history}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.finances.recent_shared_expenses}</p>
          </div>
          <div className="p-0 max-h-[440px] overflow-y-auto custom-scrollbar flex-1">
            {expenseNotices.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <Clock className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.finances.no_expenses_recorded}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700/50">
                {expenseNotices.map((notice) => (
                  <div key={notice.id} className="p-4 hover:bg-white dark:hover:bg-slate-800/60 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{notice.title}</h4>
                      <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg shrink-0 ml-2 font-mono">
                        -{Number(notice.expenseDetails?.totalAmount).toLocaleString()} DA
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{new Date(notice.date).toLocaleDateString()}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {notice.expenseDetails?.perResidentAmount.toFixed(0)} {t.manager.da_per_unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
