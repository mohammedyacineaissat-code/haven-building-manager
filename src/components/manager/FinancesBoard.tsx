import React, { useState, useEffect } from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Wallet, TrendingDown, TrendingUp, CheckCircle, Circle, Save, Coins, FileText, AlertCircle, Clock } from 'lucide-react';

export const FinancesBoard: React.FC = () => {
  const activeBuildingId = useBuildingStore(state => state.activeBuildingId);
  const buildings = useBuildingStore(state => state.buildings);
  const allNotices = useBuildingStore(state => state.notices);
  const finances = useBuildingStore(state => state.finances);
  const updateFinances = useBuildingStore(state => state.updateFinances);

  const selectedBuilding = buildings.find(b => b.id === activeBuildingId) || buildings[0];
  const notices = allNotices.filter(n => !n.buildingId || n.buildingId === activeBuildingId);

  const { t } = useLanguageStore();

  const currentFinances = selectedBuilding ? finances[selectedBuilding.id] : null;

  const [monthlyCharge, setMonthlyCharge] = useState<number>(2500);
  const [paidApts, setPaidApts] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentFinances) {
      setMonthlyCharge(currentFinances.monthlyCharge || 2500);
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
    await updateFinances(selectedBuilding.id, monthlyCharge, Array.from(paidApts));
  };

  if (!selectedBuilding) return null;

  const totalUnits = selectedBuilding.totalUnits || 30;
  
  const expenseNotices = notices.filter(n => n.category === 'expense' && n.expenseDetails);
  
  const totalExpenses = expenseNotices.reduce((sum, n) => {
    return sum + Number(n.expenseDetails!.totalAmount);
  }, 0);

  const totalCollected = paidApts.size * monthlyCharge;
  const remaining = totalCollected - totalExpenses;
  const totalDebt = (totalUnits - paidApts.size) * monthlyCharge;

  const aptsList = Array.from({ length: totalUnits }, (_, i) => `Apt ${i + 1}`);
  const unpaidApts = aptsList.filter(apt => !paidApts.has(apt));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.finances.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.finances.subtitle} {selectedBuilding.name}
          </p>
        </div>
      </div>

      {/* Monthly Report Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/40 dark:to-slate-900 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.finances.monthly_report}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">{t.finances.collection_rate}</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {Math.round((paidApts.size / totalUnits) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700/50 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-blue-600 dark:bg-blue-500 h-full rounded-full" 
                style={{ width: `${(paidApts.size / totalUnits) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">{t.finances.total_debts}</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {totalDebt.toLocaleString()} DA
              </span>
            </div>
            <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-1">
              {unpaidApts.length} {t.finances.apartments_late}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t.finances.funds_collected}</span>
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{totalCollected.toLocaleString()} DA</span>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{paidApts.size} / {totalUnits} {t.finances.paid_count}</div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t.finances.total_expenses}</span>
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{totalExpenses.toLocaleString()} DA</span>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{expenseNotices.length} {t.finances.expenses_this_month}</div>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
          remaining >= 0 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30' 
            : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${remaining >= 0 ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t.finances.remaining_balance}</span>
          </div>
          <div>
            <span className={`text-xl font-black ${remaining >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {remaining.toLocaleString()} DA
            </span>
          </div>
        </div>
      </div>

      {/* Charge Settings */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
            <Coins className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.finances.monthly_charge}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.finances.monthly_charge_desc}</p>
          </div>
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input 
              type="number"
              value={monthlyCharge}
              onChange={(e) => setMonthlyCharge(Number(e.target.value))}
              className="w-24 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <button onClick={handleSaveCharge} className="p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors">
              <Save className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-900 dark:text-white">{monthlyCharge.toLocaleString()} DA</span>
            <button onClick={() => setIsEditing(true)} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-2 py-1 bg-blue-50 dark:bg-blue-500/10 rounded-md">
              {t.finances.edit_btn}
            </button>
          </div>
        )}
      </div>

      {/* Two Column Layout for Status and History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Apartment List & Debt Tracking */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.finances.payment_status}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{paidApts.size} {t.finances.paid_of_total} {totalUnits}</p>
            </div>
            {unpaidApts.length > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-100 dark:bg-rose-500/10 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">{unpaidApts.length} {t.finances.unpaid_label}</span>
              </div>
            )}
          </div>
          
          <div className="p-3 grid grid-cols-2 gap-2 max-h-72 overflow-y-auto custom-scrollbar">
            {aptsList.map((apt) => {
              const isPaid = paidApts.has(apt);
              return (
                <button
                  key={apt}
                  onClick={() => toggleApt(apt)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isPaid 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/30 shadow-sm' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className={`text-xs font-bold ${isPaid ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {apt}
                    </span>
                    {!isPaid && (
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">{t.finances.debt_label} {monthlyCharge} {t.manager.currency}</span>
                    )}
                  </div>
                  {isPaid ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Expense History */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.finances.expense_history}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.finances.recent_shared_expenses}</p>
          </div>
          <div className="p-0 max-h-72 overflow-y-auto custom-scrollbar">
            {expenseNotices.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <Clock className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.finances.no_expenses_recorded}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700/50">
                {expenseNotices.map((notice) => (
                  <div key={notice.id} className="p-4 hover:bg-white dark:hover:bg-slate-800/60 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{notice.title}</h4>
                      <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 px-2 py-1 rounded-md">
                        -{notice.expenseDetails?.totalAmount.toLocaleString()} DA
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[11px] text-slate-500 dark:text-slate-500">{new Date(notice.date).toLocaleDateString()}</span>
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
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
