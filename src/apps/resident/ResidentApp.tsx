import React, { useState } from 'react';
import { useBuildingStore, DEFAULT_BUILDING } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { IncidentCard } from '../../components/outages/IncidentCard';
import { NoticeBoard } from '../../components/notices/NoticeBoard';
import { EmergencyDirectory } from '../../components/directory/EmergencyDirectory';
import { ResidentLoginScreen } from './ResidentLoginScreen';
import { LanguageSwitcher } from '../../components/layout/LanguageSwitcher';
import confetti from 'canvas-confetti';
import { 
  AlertCircle, 
  Bell, 
  MessageSquare, 
  Phone, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  History, 
  ChevronDown, 
  ChevronUp, 
  LogOut, 
  Wifi,
  Battery,
  Droplet,
  Zap,
  Check,
  Camera
} from 'lucide-react';

type ResidentTab = 'outages' | 'notices' | 'management';

interface ResidentAppProps {
  standalone?: boolean;
}

export const ResidentApp: React.FC<ResidentAppProps> = ({ standalone = false }) => {
  const [activeTab, setActiveTab] = useState<ResidentTab>('outages');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning'>('all');
  const [showResolvedHistory, setShowResolvedHistory] = useState(false);
  const [hasConfirmedWaterQuick, setHasConfirmedWaterQuick] = useState(false);

  const { 
    buildings, 
    residentProfile, 
    logoutResident, 
    activeIncidents, 
    resolvedIncidents, 
    unreadAlertCount, 
    clearUnreadAlerts, 
    soundEnabled, 
    toggleSound, 
    confirmRestoration
  } = useBuildingStore();

  const { t, isRtl } = useLanguageStore();

  if (!residentProfile) {
    return <ResidentLoginScreen isStandalone={standalone} />;
  }

  const myBuilding = buildings.find(b => b.id === residentProfile.buildingId) || buildings[0] || DEFAULT_BUILDING;

  // Incidents specific to this resident's building
  const buildingActiveIncidents = activeIncidents.filter(i => !i.buildingId || i.buildingId === myBuilding.id);
  const buildingResolvedIncidents = resolvedIncidents.filter(i => !i.buildingId || i.buildingId === myBuilding.id);

  const filteredIncidents = buildingActiveIncidents.filter(inc => {
    if (filterSeverity === 'all') return true;
    return inc.severity === filterSeverity;
  });

  const urgentCount = buildingActiveIncidents.filter(i => i.severity === 'critical').length;
  const maintenanceCount = buildingActiveIncidents.filter(i => i.severity === 'warning').length;

  // Water & Power Status determination
  const activeWaterIncident = buildingActiveIncidents.find(i => i.category === 'water');
  const activePowerIncident = buildingActiveIncidents.find(i => i.category === 'power');

  const handleQuickWaterConfirm = () => {
    if (activeWaterIncident) {
      confirmRestoration(activeWaterIncident.id, true);
    }
    setHasConfirmedWaterQuick(true);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#2563EB', '#10B981', '#38BDF8']
      });
    } catch {
      // Safe fallback
    }
  };

  return (
    <div className={`w-full ${standalone ? 'max-w-md min-h-screen sm:min-h-[840px]' : 'w-full min-h-[780px]'} mx-auto bg-elevate-bg dark:bg-elevate-bg-dark text-slate-900 dark:text-slate-100 sm:rounded-3xl overflow-hidden flex flex-col relative font-sans border-0 transition-colors duration-300`}>
      
      {/* Standalone Native Mobile Status Bar (Android Experience) */}
      {standalone && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 pt-2 pb-1 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[11px] font-medium text-slate-400 select-none">
          <span>09:41</span>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">5G</span>
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Resident Header with Name, Building & Quick Controls */}
        <div className="flex items-center justify-between bg-white/85 dark:bg-[#0D1524]/85 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/70 px-5 pt-4 pb-3.5 sticky top-0 z-20 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-black text-lg shadow-sm">
              H
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                {t.common.greeting} {residentProfile.firstName || residentProfile.lastName}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {myBuilding.name} • {t.resident.apt_prefix} {residentProfile.aptNumber}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => logoutResident()}
            className="w-9 h-9 rounded-full elevate-button-secondary text-slate-500 hover:text-rose-500 flex items-center justify-center transition-colors"
            title={t.resident.switch_logout_title}
          >
            <LogOut className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </div>

      {/* Main Content Body */}
      <main className="flex-1 px-5 pt-5 pb-24 overflow-y-auto">

        {/* Clean Minimalism Status Overview Grid */}
        <div className="elevate-card p-5 mb-6 transition-colors duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.common.status}
                </h2>
                <div className="flex items-center gap-2">
                  {urgentCount > 0 ? (
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                      {urgentCount} {t.common.critical}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {t.common.normal}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Water Status Node */}
                <div className={`p-4 rounded-2xl border transition-all duration-200 ${
                  activeWaterIncident 
                    ? 'bg-rose-50/80 dark:bg-rose-500/10 border-rose-200/80 dark:border-rose-500/30' 
                    : 'bg-sky-50/60 dark:bg-sky-500/10 border-sky-200/60 dark:border-sky-500/20'
                }`}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      activeWaterIncident 
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' 
                        : 'bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400'
                    }`}>
                      <Droplet className="w-4 h-4" />
                    </div>
                    <h3 className={`font-bold text-xs ${activeWaterIncident ? 'text-rose-700 dark:text-rose-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {t.incident_card.cat_water}
                    </h3>
                  </div>
                  <p className={`text-xs font-extrabold ${activeWaterIncident ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {activeWaterIncident ? t.common.critical : t.common.normal}
                  </p>
                  {activeWaterIncident && !hasConfirmedWaterQuick && (
                    <button 
                      onClick={handleQuickWaterConfirm}
                      className="w-full mt-3 elevate-button-primary py-1.5 text-[11px]"
                    >
                      {t.resident.water_flowing_btn}
                    </button>
                  )}
                </div>

                {/* Power Status Node */}
                <div className={`p-4 rounded-2xl border transition-all duration-200 ${
                  activePowerIncident 
                    ? 'bg-rose-50/80 dark:bg-rose-500/10 border-rose-200/80 dark:border-rose-500/30' 
                    : 'bg-amber-50/60 dark:bg-amber-500/10 border-amber-200/60 dark:border-amber-500/20'
                }`}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      activePowerIncident 
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' 
                        : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    }`}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <h3 className={`font-bold text-xs ${activePowerIncident ? 'text-rose-700 dark:text-rose-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {t.incident_card.cat_power}
                    </h3>
                  </div>
                  <p className={`text-xs font-extrabold ${activePowerIncident ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {activePowerIncident ? t.common.critical : t.common.normal}
                  </p>
                </div>
              </div>
            </div>

        {/* OUTAGES & STATUS TAB */}
        {activeTab === 'outages' && (
          <div className="space-y-4">
            
            <div className="flex items-center justify-between mb-3 mt-1">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-emerald-500" />
                  {t.resident.active_disruptions}
                </h2>
                
                {/* Filter Pills */}
                <div className="flex p-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    onClick={() => setFilterSeverity('all')}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all outline-none ${
                      filterSeverity === 'all' 
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t.common.all}
                  </button>
                  <button
                    onClick={() => setFilterSeverity('critical')}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all outline-none ${
                      filterSeverity === 'critical' 
                        ? 'bg-rose-500 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t.common.critical}
                  </button>
                </div>
              </div>

            {/* Incidents List */}
            <div className="space-y-4">
              {filteredIncidents.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center transition-colors">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{t.resident.no_ongoing_issues}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.resident.no_ongoing_issues_desc}</p>
                </div>
              ) : (
                filteredIncidents.map((incident) => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))
              )}
            </div>

            {/* Resolved Archive */}
            {buildingResolvedIncidents.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200/70 dark:border-slate-800 transition-colors duration-300">
                  <button 
                    onClick={() => setShowResolvedHistory(!showResolvedHistory)}
                    className="w-full flex items-center justify-between py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors outline-none"
                  >
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">{t.resident.recently_resolved}</span>
                    </div>
                    {showResolvedHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showResolvedHistory && (
                    <div className="mt-4 space-y-3">
                      {buildingResolvedIncidents.map((incident) => (
                        <div
                          key={incident.id}
                          className="elevate-card p-3.5 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-900 dark:text-white">{incident.title}</span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                              RÉSOLU
                            </span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-2">{incident.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
            )}

          </div>
        )}

        {/* NOTICES TAB */}
        {activeTab === 'notices' && <NoticeBoard />}

        {/* MANAGEMENT TAB */}
        {activeTab === 'management' && <EmergencyDirectory />}

      </main>

      {/* Floating Glass Bottom Navigation Bar */}
      <div className="mt-auto px-4 pb-4 pt-2 shrink-0 relative z-30">
        <div className="bg-white/90 dark:bg-[#101828]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-card-hover dark:shadow-card-dark-hover rounded-full p-1.5 flex items-center justify-between transition-colors duration-300">
          <button
            onClick={() => {
              setActiveTab('outages');
              clearUnreadAlerts();
            }}
            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-full transition-all duration-200 outline-none ${
              activeTab === 'outages' 
                ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="relative">
              <AlertCircle className="w-5 h-5 mb-0.5" />
              {unreadAlertCount > 0 && activeTab !== 'outages' && (
                <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
              )}
            </div>
            <span className="text-[10px]">{t.resident.tab_outages}</span>
          </button>

          <button
            onClick={() => setActiveTab('notices')}
            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-full transition-all duration-200 outline-none ${
              activeTab === 'notices' 
                ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t.resident.tab_notices}</span>
          </button>

          <button
            onClick={() => setActiveTab('management')}
            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-full transition-all duration-200 outline-none ${
              activeTab === 'management' 
                ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Phone className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t.resident.tab_management}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
