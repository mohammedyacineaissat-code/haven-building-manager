import React, { useState, useEffect, useMemo } from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { 
  Wallet, 
  TrendingDown, 
  CheckCircle, 
  Save, 
  Coins, 
  AlertCircle, 
  User, 
  CheckCheck,
  Search,
  Plus,
  RotateCcw,
  LayoutGrid,
  Columns,
  Receipt,
  Building
} from 'lucide-react';

interface FinancesBoardProps {
  onOpenExpenseModal?: () => void;
}

export const FinancesBoard: React.FC<FinancesBoardProps> = ({ onOpenExpenseModal }) => {
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
  const [searchQuery, setSearchQuery] = useState('');
  
  // Default to 'grid' view so all 42 apartments expand gracefully across the screen
  const [viewLayout, setViewLayout] = useState<'grid' | 'split' | 'expenses'>('grid');

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

  const handleMarkAllPaid = async () => {
    if (!selectedBuilding) return;
    const all = Array.from({ length: totalUnits }, (_, i) => `Apt ${i + 1}`);
    const next = new Set<string>(all);
    setPaidApts(next);
    await updateFinances(selectedBuilding.id, monthlyCharge, all);
  };

  const handleResetAllPayments = async () => {
    if (!selectedBuilding) return;
    if (!window.confirm(t.finances.reset_confirm)) return;
    setPaidApts(new Set());
    await updateFinances(selectedBuilding.id, monthlyCharge, []);
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
    if (filterMode === 'paid' && !paidApts.has(apt)) return false;
    if (filterMode === 'unpaid' && paidApts.has(apt)) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchApt = apt.toLowerCase().includes(q);
      const resident = residentMap.get(apt);
      const matchResident = resident 
        ? `${resident.firstName || ''} ${resident.lastName || ''} ${resident.phone || ''}`.toLowerCase().includes(q)
        : false;
      return matchApt || matchResident;
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      
      {/* Top Header & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.finances.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {t.finances.subtitle} <span className="font-bold text-slate-700 dark:text-slate-200">{selectedBuilding.name}</span> ({totalUnits} {t.manager.apartments_label})
            </p>
          </div>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-inner">
            <button
              onClick={() => setViewLayout('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewLayout === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title={t.finances.tab_grid}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{t.finances.tab_grid}</span>
            </button>
            <button
              onClick={() => setViewLayout('split')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewLayout === 'split'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title={t.finances.tab_split}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{t.finances.tab_split}</span>
            </button>
            <button
              onClick={() => setViewLayout('expenses')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewLayout === 'expenses'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title={t.finances.tab_expenses}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{t.finances.tab_expenses} ({expenseNotices.length})</span>
            </button>
          </div>

          {onOpenExpenseModal && (
            <button
              onClick={onOpenExpenseModal}
              className="py-2.5 px-4 rounded-2xl elevate-button-primary text-xs font-bold flex items-center gap-2 transition-all shadow-sm shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>{t.finances.group_invoice_btn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Financial Command Center Banner (4 KPI cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* KPI 1: Collection Rate */}
        <div className="p-5 rounded-3xl elevate-card flex flex-col justify-between transition-all border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.finances.collection_rate}</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-black font-mono ${
              collectionRate >= 75 
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
                : collectionRate >= 40 
                  ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' 
                  : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'
            }`}>
              {collectionRate}%
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{paidApts.size} / {totalUnits}</span>
              <span className="text-xs font-semibold text-slate-400">{t.finances.paid_count}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full mt-2.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  collectionRate >= 75 
                    ? 'bg-emerald-500' 
                    : collectionRate >= 40 
                      ? 'bg-amber-500' 
                      : 'bg-rose-500'
                }`}
                style={{ width: `${collectionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Total Debts */}
        <div className="p-5 rounded-3xl elevate-card flex flex-col justify-between transition-all border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.finances.total_debts}</span>
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {totalDebt.toLocaleString()} DA
            </span>
            <div className="flex items-center gap-1.5 text-xs text-rose-600/90 dark:text-rose-400/90 mt-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{unpaidApts.length} {t.finances.apartments_late}</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Net Cash Balance */}
        <div className="p-5 rounded-3xl elevate-card flex flex-col justify-between transition-all border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.finances.remaining_balance}</span>
            <div className={`p-2 rounded-xl ${remaining >= 0 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-black font-mono ${remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {remaining.toLocaleString()} DA
            </span>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              <span>{t.finances.collected_short} {totalCollected.toLocaleString()} DA</span>
              <span>{t.finances.expenses_short} {totalExpenses.toLocaleString()} DA</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Monthly Charge Config */}
        <div className="p-5 rounded-3xl elevate-card flex flex-col justify-between transition-all border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.finances.monthly_charge}</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    min="0"
                    step="500"
                    value={monthlyCharge}
                    onChange={(e) => setMonthlyCharge(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                  <button 
                    onClick={handleSaveCharge} 
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{t.finances.save}</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  {[2000, 2500, 3000, 5000, 6000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setMonthlyCharge(amt)}
                      className="px-1.5 py-0.5 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600"
                    >
                      {amt / 1000}k
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {monthlyCharge.toLocaleString()} DA
                  </span>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{t.finances.per_month_unit}</p>
                </div>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl transition-colors shrink-0"
                >
                  {t.finances.edit_btn}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Main Content Area based on View Layout */}
      <div className={`grid gap-6 ${viewLayout === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* Apartment List & Payment Tracking */}
        {(viewLayout === 'split' || viewLayout === 'grid') && (
          <div className={`${viewLayout === 'split' ? 'lg:col-span-8' : 'w-full'} elevate-card rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col transition-all`}>
            
            {/* Header: Title & Toolbar */}
            <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
              
              {/* Row 1: Title and Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.finances.payment_status}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {paidApts.size} {t.finances.paid_of_total} {totalUnits} {t.manager.apartments_label} • {t.finances.toggle_instruction}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkAllPaid}
                    className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title={t.finances.mark_all_paid}
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>{t.finances.mark_all_paid}</span>
                  </button>
                  <button
                    onClick={handleResetAllPayments}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title={t.finances.reset_all}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{t.finances.reset_all}</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Search Input & Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                
                {/* Search Bar */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.finances.search_placeholder}
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs pl-8 pr-7 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Status Tabs */}
                <div className="flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-xs font-bold self-start sm:self-auto shadow-inner">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1 rounded-lg transition-all ${filterMode === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    {t.finances.filter_all} ({totalUnits})
                  </button>
                  <button
                    onClick={() => setFilterMode('unpaid')}
                    className={`px-3 py-1 rounded-lg transition-all ${filterMode === 'unpaid' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    {t.finances.filter_unpaid} ({unpaidApts.length})
                  </button>
                  <button
                    onClick={() => setFilterMode('paid')}
                    className={`px-3 py-1 rounded-lg transition-all ${filterMode === 'paid' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    {t.finances.filter_paid} ({paidApts.size})
                  </button>
                </div>

              </div>

            </div>

            {/* Apartment Grid */}
            <div className="p-4 sm:p-5">
              {filteredApts.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-sm font-semibold text-slate-400">{t.finances.no_match_filter}</p>
                  <button
                    onClick={() => { setFilterMode('all'); setSearchQuery(''); }}
                    className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {t.finances.reset_filter}
                  </button>
                </div>
              ) : (
                <div className={`grid gap-3 ${
                  viewLayout === 'grid'
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'
                    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                }`}>
                  {filteredApts.map((apt) => {
                    const isPaid = paidApts.has(apt);
                    const resident = residentMap.get(apt);

                    return (
                      <button
                        key={apt}
                        onClick={() => toggleApt(apt)}
                        className={`group relative flex flex-col justify-between p-3.5 rounded-2xl border transition-all duration-200 text-left cursor-pointer select-none active:scale-[0.98] ${
                          isPaid 
                            ? 'bg-gradient-to-br from-emerald-50/90 to-teal-50/50 dark:from-emerald-950/25 dark:to-teal-950/10 border-emerald-300/80 dark:border-emerald-500/40 shadow-sm hover:border-emerald-500' 
                            : 'bg-white dark:bg-slate-800/80 border-slate-200/90 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
                        }`}
                      >
                        {/* Top: Apt label and Checkbox indicator */}
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-black tracking-tight ${isPaid ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                            {apt}
                          </span>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isPaid 
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/40' 
                              : 'border-2 border-slate-300 dark:border-slate-600 group-hover:border-slate-400'
                          }`}>
                            {isPaid && <CheckCircle className="w-3.5 h-3.5" />}
                          </div>
                        </div>

                        {/* Middle: Resident identity */}
                        <div className="mt-2 min-w-0">
                          {resident ? (
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                                {resident.lastName} {resident.firstName ? resident.firstName.charAt(0) + '.' : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                              {t.finances.not_registered}
                            </span>
                          )}
                        </div>

                        {/* Bottom: Fee status */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[11px]">
                          {isPaid ? (
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {t.finances.paid_status} ({monthlyCharge.toLocaleString()} DA)
                            </span>
                          ) : (
                            <span className="font-bold text-rose-600 dark:text-rose-400">
                              {t.finances.due_status} {monthlyCharge.toLocaleString()} DA
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Grid Footer Summary */}
            <div className="px-5 py-3.5 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{filteredApts.length} {t.finances.apts_displayed}</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {t.finances.total_collected_label} {totalCollected.toLocaleString()} DA / {((totalUnits) * monthlyCharge).toLocaleString()} DA
              </span>
            </div>

          </div>
        )}

        {/* Shared Expense History Panel */}
        {(viewLayout === 'split' || viewLayout === 'expenses') && (
          <div className={`${viewLayout === 'split' ? 'lg:col-span-4' : 'w-full'} elevate-card rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col transition-all`}>
            <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.finances.expense_history}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {expenseNotices.length} {t.finances.expenses_this_month}
                </p>
              </div>
              {onOpenExpenseModal && (
                <button
                  onClick={onOpenExpenseModal}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.finances.add_btn}</span>
                </button>
              )}
            </div>

            <div className="p-0 flex-1">
              {expenseNotices.length === 0 ? (
                <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <Receipt className="w-7 h-7 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {t.finances.no_expenses_recorded}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mb-4">
                    {t.finances.no_expenses_desc}
                  </p>
                  {onOpenExpenseModal && (
                    <button
                      onClick={onOpenExpenseModal}
                      className="py-2 px-4 rounded-xl elevate-button-primary text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.finances.group_invoice_btn}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {expenseNotices.map((notice) => (
                    <div key={notice.id} className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug truncate">
                            {notice.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(notice.date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-xl shrink-0 font-mono">
                          -{Number(notice.expenseDetails?.totalAmount).toLocaleString()} DA
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">
                          {t.finances.quota_per_apt_label}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {Number(notice.expenseDetails?.perResidentAmount).toFixed(0)} {t.manager.da_per_unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {expenseNotices.length > 0 && (
              <div className="px-5 py-3.5 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500 dark:text-slate-400">{t.finances.total_expenses_label}</span>
                <span className="font-black text-rose-600 dark:text-rose-400 font-mono text-sm">
                  {totalExpenses.toLocaleString()} DA
                </span>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
