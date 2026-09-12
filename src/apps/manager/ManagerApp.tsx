import React, { useState } from 'react';
import { useBuildingStore, DEFAULT_BUILDING } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { IncidentCard } from '../../components/outages/IncidentCard';
import { BroadcastModal } from '../../components/manager/BroadcastModal';
import { StatusUpdateModal } from '../../components/manager/StatusUpdateModal';
import { AddBuildingModal } from '../../components/manager/AddBuildingModal';
import { AddExpenseModal } from '../../components/manager/AddExpenseModal';
import { AddAnnouncementModal } from '../../components/manager/AddAnnouncementModal';
import { ResidentsListView } from '../../components/directory/ResidentsListView';
import { NoticeBoard } from '../../components/notices/NoticeBoard';
import { FinancesBoard } from '../../components/manager/FinancesBoard';
import { EmergencyDirectory } from '../../components/directory/EmergencyDirectory';
import { ResidentTicketsView } from '../../components/reports/ResidentTicketsView';
import { ThemeToggle } from '../../components/layout/ThemeToggle';
import { LanguageSwitcher } from '../../components/layout/LanguageSwitcher';
import { Incident, IncidentCategory } from '../../types/building';
import { 
  Radio, 
  MessageSquare, 
  Users, 
  Bell, 
  Wrench, 
  Plus, 
  ChevronDown, 
  MapPin, 
  Droplet, 
  ArrowUpDown,
  Zap,
  CheckCircle,
  Calculator,
  Wallet,
  Receipt,
  Wifi,
  Battery,
  AlertTriangle,
  LayoutDashboard,
  Trash2,
  Building2,
  Phone
} from 'lucide-react';

type ManagerTab = 'dashboard' | 'tickets' | 'notices' | 'residents' | 'finances' | 'vendors';

interface ManagerAppProps {
  standalone?: boolean;
}

export const ManagerApp: React.FC<ManagerAppProps> = ({ standalone = false }) => {
  const [activeTab, setActiveTab] = useState<ManagerTab>('dashboard');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastCategory, setBroadcastCategory] = useState<IncidentCategory>('water');
  const [isAddBuildingModalOpen, setIsAddBuildingModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [selectedIncidentForUpdate, setSelectedIncidentForUpdate] = useState<Incident | null>(null);
  const [isBuildingSelectorOpen, setIsBuildingSelectorOpen] = useState(false);

  // Quick calculator draft state
  const [calcTitle, setCalcTitle] = useState('');
  const [calcAmount, setCalcAmount] = useState<string>('');

  const { 
    buildings, 
    activeBuildingId, 
    setActiveBuilding, 
    removeBuilding,
    activeIncidents, 
    residentReports,
    notices
  } = useBuildingStore();

  const { t } = useLanguageStore();

  if (buildings.length === 0) {
    return (
      <div className={`w-full h-full bg-elevate-bg dark:bg-elevate-bg-dark flex flex-col font-sans transition-colors duration-300 ${standalone ? 'min-h-[840px]' : 'min-h-[780px]'}`}>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-blue-200/50 dark:border-blue-800/30 mx-auto">
            <LayoutDashboard className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">No Residences Managed</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed">
            You currently have no residences in your portfolio. Add a new building to start managing outages, notices, and residents.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm mx-auto">
            <button
              onClick={() => {
                useBuildingStore.getState().addBuilding({
                  name: 'Majestic 14 (Oran)',
                  address: 'Oran',
                  totalUnits: 42,
                  towers: ['Tour A', 'Tour B'],
                  status: 'operational',
                });
              }}
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-6 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2.5 transition-all active:scale-95"
            >
              <span>Restore Demo</span>
            </button>
            <button
              onClick={() => setIsAddBuildingModalOpen(true)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/25 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Residence</span>
            </button>
          </div>
        </div>
        
        {isAddBuildingModalOpen && (
          <AddBuildingModal 
            isOpen={isAddBuildingModalOpen}
            onClose={() => setIsAddBuildingModalOpen(false)} 
          />
        )}
      </div>
    );
  }

  const selectedBuilding = buildings.find(b => b.id === activeBuildingId) || buildings[0] || DEFAULT_BUILDING;

  // Building specific data
  const currentBuildingIncidents = activeIncidents.filter(i => !i.buildingId || i.buildingId === selectedBuilding.id);
  const pendingTickets = residentReports.filter(r => r.status !== 'resolved' && (!r.buildingId || r.buildingId === selectedBuilding.id));
  const buildingExpenses = notices.filter(n => n.category === 'expense' && (!n.buildingId || n.buildingId === selectedBuilding.id));
  const latestExpense = buildingExpenses[0];

  // Helper to open modal for manager to enter problem details
  const handleOpenBroadcastModal = (category: IncidentCategory = 'water') => {
    setBroadcastCategory(category);
    setIsBroadcastModalOpen(true);
  };

  const handlePublishGroupedExpense = () => {
    setIsExpenseModalOpen(true);
  };

  const parsedCalcAmount = parseFloat(calcAmount) || 0;
  const totalUnits = selectedBuilding.totalUnits || 30;
  const calculatedQuota = parsedCalcAmount > 0 && totalUnits > 0 ? (parsedCalcAmount / totalUnits).toFixed(2) : '0';

  const navTabs: { id: ManagerTab; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: t.manager.outage_ops_tab, icon: LayoutDashboard, badge: currentBuildingIncidents.length },
    { id: 'tickets', label: t.manager.tenant_tickets_tab, icon: MessageSquare, badge: pendingTickets.length },
    { id: 'notices', label: t.manager.bulletins_tab, icon: Bell },
    { id: 'residents', label: t.residents_list.title, icon: Users },
    { id: 'finances', label: t.manager.finances_tab, icon: Wallet },
    { id: 'vendors', label: t.manager.vendors_tab, icon: Wrench },
  ];

  return (
    <div className={`w-full h-full bg-elevate-bg dark:bg-elevate-bg-dark text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row font-sans transition-colors duration-300 ${standalone ? 'min-h-[840px]' : 'min-h-[780px]'}`}>
      
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white/90 dark:bg-[#101828]/90 backdrop-blur-xl border-r border-slate-200/70 dark:border-slate-800/70 z-30 shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-base flex items-center justify-center shadow-md shadow-emerald-500/20">
              H
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">HAVEN</h1>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-1">Manager Suite</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 outline-none ${
                  isActive 
                    ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                  <span className="text-sm truncate">{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    tab.id === 'dashboard' 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Theme Toggle & Language Switcher */}
        <div className="p-4 border-t border-slate-200/70 dark:border-slate-800/70 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Mode Sombre</span>
            <ThemeToggle />
          </div>
          <LanguageSwitcher compact />
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* Manager Header & Building Context */}
        <div className="bg-white/85 dark:bg-[#0D1524]/85 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/70 px-5 sm:px-8 py-4 transition-colors duration-300 z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0 relative">
              <button 
                onClick={() => setIsBuildingSelectorOpen(!isBuildingSelectorOpen)}
                className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <span className="truncate">{selectedBuilding.name}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isBuildingSelectorOpen ? 'rotate-180' : ''}`} />
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span className="truncate">{selectedBuilding.address}</span>
              </p>

              {/* Building Selector Dropdown */}
              {isBuildingSelectorOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsBuildingSelectorOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                    <div className="px-4 pb-2 mb-2 border-b border-slate-100 dark:border-slate-700/80">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.manager.switch_residence || 'Switch Residence'}</span>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto">
                      {buildings.map(b => (
                        <div key={b.id} className="flex items-center group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-50 dark:border-slate-700/30 last:border-0">
                          <button
                            onClick={() => {
                              setActiveBuilding(b.id);
                              setIsBuildingSelectorOpen(false);
                            }}
                            className={`flex-1 text-left px-4 py-2.5 text-sm flex items-center justify-between ${activeBuildingId === b.id ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}
                          >
                            <div className="flex flex-col truncate pr-2">
                              <span className="truncate">{b.name}</span>
                              <span className="text-[10px] font-normal opacity-70 truncate">{b.address}</span>
                            </div>
                            {activeBuildingId === b.id && <CheckCircle className="w-4 h-4 shrink-0" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to remove ${b.name}?`)) {
                                removeBuilding(b.id);
                              }
                            }}
                            className="px-4 py-2.5 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                            title="Remove residence"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="px-3 pt-2 mt-2 border-t border-slate-100 dark:border-slate-700/80">
                      <button
                        onClick={() => {
                          setIsBuildingSelectorOpen(false);
                          setIsAddBuildingModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                        <span>{t.manager.add_new_building || 'Add New Residence'}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Header Right Actions */}
            <div className="shrink-0 flex items-center gap-2 sm:gap-3">
              <div className="lg:hidden flex items-center gap-2">
                <ThemeToggle />
                <LanguageSwitcher compact />
              </div>
              <button
                onClick={() => setIsAnnouncementModalOpen(true)}
                className="py-2.5 px-3.5 rounded-2xl elevate-button-primary text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.manager.new_announcement_btn}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28">
          
          {/* DASHBOARD / OPERATIONS TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Desktop KPI Overview Banner */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl elevate-card flex flex-col justify-between transition-colors">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Résidence</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xl font-black text-slate-900 dark:text-white">{selectedBuilding.totalUnits}</span>
                    <span className="text-[11px] font-bold text-slate-400">{t.manager.apartments_label}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl elevate-card flex flex-col justify-between transition-colors">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pannes Actives</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className={`text-xl font-black ${currentBuildingIncidents.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {currentBuildingIncidents.length}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">incidents</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl elevate-card flex flex-col justify-between transition-colors">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Signalements</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className={`text-xl font-black ${pendingTickets.length > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                      {pendingTickets.length}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">en attente</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl elevate-card flex flex-col justify-between transition-colors">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dernière Facture</span>
                  <div className="mt-1 flex items-baseline justify-between truncate">
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono truncate">
                      {latestExpense ? `${Number(latestExpense.expenseDetails?.totalAmount).toLocaleString()} DA` : 'Aucune'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Balanced Responsive Grid: Left Column Operations, Right Column Financials */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Urgent Dispatcher & Live Incidents (7 cols on desktop) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Urgent Dispatcher */}
                  <div className="elevate-card p-5 transition-colors duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span>{t.manager.urgent_dispatcher}</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {t.manager.urgent_dispatcher_desc}
                        </p>
                      </div>
                      <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => handleOpenBroadcastModal('water')}
                        className="py-3 px-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200/80 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all shadow-sm"
                      >
                        <Droplet className="w-4 h-4 shrink-0" />
                        <span>{t.manager.water_outage}</span>
                      </button>
                      
                      <button
                        onClick={() => handleOpenBroadcastModal('elevator')}
                        className="py-3 px-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all shadow-sm"
                      >
                        <ArrowUpDown className="w-4 h-4 shrink-0" />
                        <span>{t.manager.elevator_failure}</span>
                      </button>

                      <button
                        onClick={() => handleOpenBroadcastModal('power')}
                        className="py-3 px-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all shadow-sm col-span-2 sm:col-span-1"
                      >
                        <Zap className="w-4 h-4 shrink-0" />
                        <span>{t.manager.power_gas}</span>
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs pt-4 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{t.manager.other_anomaly}</span>
                      <button
                        onClick={() => handleOpenBroadcastModal('general')}
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-bold"
                      >
                        {t.manager.write_full_alert} →
                      </button>
                    </div>
                  </div>

                  {/* Live Monitoring Dashboard */}
                  <div className="elevate-card p-5 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {t.manager.active_incidents_count} ({currentBuildingIncidents.length})
                      </h3>
                    </div>

                    {currentBuildingIncidents.length === 0 ? (
                      <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center transition-colors duration-300">
                        <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{t.manager.no_incidents}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t.manager.no_incidents_desc}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentBuildingIncidents.map((incident) => (
                          <IncidentCard
                            key={incident.id}
                            incident={incident}
                            onOpenStatusUpdater={(inc) => setSelectedIncidentForUpdate(inc)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Right Column: Financial Calculator Quick Tool (5 cols on desktop) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="elevate-card p-5 transition-colors duration-300 sticky top-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{t.manager.expense_calculator}</span>
                      </h3>
                      <span className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full">
                        {selectedBuilding.totalUnits} {t.manager.apartments_label}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {latestExpense && (
                        <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                {t.manager.last_published_expense}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{latestExpense.title}</h4>
                            </div>
                            <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {Number(latestExpense.expenseDetails?.totalAmount).toLocaleString()} {t.manager.currency}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            {t.manager.expense_title_label}
                          </label>
                          <input
                            type="text"
                            value={calcTitle}
                            onChange={(e) => setCalcTitle(e.target.value)}
                            placeholder={t.manager.expense_title_placeholder}
                            className="w-full elevate-input text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            {t.manager.total_amount_da}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={calcAmount}
                            onChange={(e) => setCalcAmount(e.target.value)}
                            placeholder="ex: 7500"
                            className="w-full elevate-input text-xs font-mono"
                          />
                        </div>

                        <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/70 dark:border-emerald-500/30 mt-4 p-3.5 rounded-2xl">
                          <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                            {t.manager.quota_per_unit_label} ({selectedBuilding.totalUnits}):
                          </div>
                          <div className="text-right">
                            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                              {calculatedQuota} {t.manager.currency}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handlePublishGroupedExpense}
                          disabled={!calcAmount || !calcTitle}
                          className="w-full elevate-button-primary py-3 rounded-2xl text-xs font-bold mt-2 disabled:opacity-40 flex justify-center items-center shadow-sm shadow-emerald-600/20"
                        >
                          <span>{t.manager.publish_grouped_invoice}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TENANT TICKETS / SIGNALEMENTS TAB */}
          {activeTab === 'tickets' && (
            <ResidentTicketsView />
          )}

          {/* FINANCES TAB */}
          {activeTab === 'finances' && (
            <div className="elevate-card p-5 transition-colors duration-300">
              <FinancesBoard />
            </div>
          )}

          {/* RESIDENTS TAB */}
          {activeTab === 'residents' && (
            <div className="elevate-card p-5 transition-colors duration-300">
              <ResidentsListView />
            </div>
          )}

          {/* NOTICES TAB */}
          {activeTab === 'notices' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-5 rounded-3xl elevate-card transition-colors duration-300">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.manager.bulletin_board_title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t.manager.bulletin_board_desc} {selectedBuilding.name}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAnnouncementModalOpen(true)}
                    className="py-2.5 px-4 elevate-button-primary text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.manager.write_notice_btn}</span>
                  </button>
                </div>
              </div>
              <NoticeBoard />
            </div>
          )}

          {/* VENDORS TAB */}
          {activeTab === 'vendors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 rounded-3xl elevate-card transition-colors">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.manager.vendors_tab} & Urgences</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Coordonnées officielles des services d'urgence et prestataires techniques
                  </p>
                </div>
              </div>
              <EmergencyDirectory />
            </div>
          )}

        </main>

        {/* Modern Floating Bottom Nav (hidden on desktop) */}
        <nav className="sticky bottom-0 left-0 right-0 z-20 px-3 pb-3 pt-1 bg-transparent lg:hidden">
          <div className="max-w-md mx-auto bg-white/90 dark:bg-[#101828]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-card-hover dark:shadow-card-dark-hover rounded-full p-1.5 flex items-center justify-between transition-colors duration-300">
            {[
              { id: 'dashboard' as ManagerTab, label: t.manager.outage_ops_tab, icon: LayoutDashboard, badge: currentBuildingIncidents.length },
              { id: 'tickets' as ManagerTab, label: t.manager.tenant_tickets_tab, icon: MessageSquare, badge: pendingTickets.length },
              { id: 'notices' as ManagerTab, label: t.manager.bulletins_tab, icon: Bell },
              { id: 'residents' as ManagerTab, label: t.residents_list.title, icon: Users },
              { id: 'finances' as ManagerTab, label: t.manager.finances_tab, icon: Wallet },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center justify-center py-2 rounded-full transition-all duration-200 outline-none ${
                    isActive 
                      ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                    )}
                  </div>
                  <span className="text-[9px] tracking-tight truncate max-w-[50px]">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
        
      </div> {/* End Main Content Column */}

      {/* Modals */}
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        defaultTitle={calcTitle}
        defaultAmount={parsedCalcAmount > 0 ? parsedCalcAmount : ''}
      />

      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        initialCategory={broadcastCategory}
      />

      <StatusUpdateModal
        incident={selectedIncidentForUpdate}
        isOpen={!!selectedIncidentForUpdate}
        onClose={() => setSelectedIncidentForUpdate(null)}
      />

      <AddBuildingModal
        isOpen={isAddBuildingModalOpen}
        onClose={() => setIsAddBuildingModalOpen(false)}
      />

      <AddAnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
      />

    </div>
  );
};
