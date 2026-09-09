import React, { useState } from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { IncidentCard } from './IncidentCard';
import { BroadcastModal } from '../manager/BroadcastModal';
import { StatusUpdateModal } from '../manager/StatusUpdateModal';
import { Incident } from '../../types/building';
import { 
  CheckCircle, 
  History, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';

export const OutageHubView: React.FC = () => {
  const { 
    currentRole, 
    activeIncidents, 
    resolvedIncidents
  } = useBuildingStore();
  const { t } = useLanguageStore();

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [selectedIncidentForUpdate, setSelectedIncidentForUpdate] = useState<Incident | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning'>('all');
  const [showResolvedHistory, setShowResolvedHistory] = useState(false);

  const filteredIncidents = activeIncidents.filter(inc => {
    if (filterSeverity === 'all') return true;
    return inc.severity === filterSeverity;
  });

  const urgentCount = activeIncidents.filter(i => i.severity === 'critical').length;
  const maintenanceCount = activeIncidents.filter(i => i.severity === 'warning').length;

  return (
    <div className="space-y-4 pb-24">
      
      {/* Top Banner based on Role */}
      {currentRole === 'manager' ? (
        <div className="p-5 rounded-3xl bg-slate-900 dark:bg-slate-800 text-white shadow-card transition-colors">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              {t.manager.syndic_dispatch_center}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {t.manager.manager_mode}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-extrabold tracking-tight mb-1 text-white">
            {t.manager.broadcast_alerts_title}
          </h2>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            {t.manager.broadcast_alerts_desc}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{t.manager.create_alert_btn}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Resident Overview Banner */
        urgentCount > 0 ? (
          <div className="p-4 rounded-3xl bg-rose-50/90 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 flex items-start gap-3 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-rose-950 dark:text-rose-100">
                {t.resident.active_disruption_notice}
              </h2>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
                {t.resident.active_disruption_desc}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-3xl bg-emerald-50/90 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-3 transition-colors">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">{t.resident.all_services_normal}</h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">{t.resident.all_services_normal_desc}</p>
            </div>
          </div>
        )
      )}

      {/* Filter Chips */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              filterSeverity === 'all'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {t.resident.filter_all_updates} ({activeIncidents.length})
          </button>

          {urgentCount > 0 && (
            <button
              onClick={() => setFilterSeverity('critical')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterSeverity === 'critical'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 border border-rose-200 dark:border-rose-900/50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>{t.resident.filter_urgent_updates} ({urgentCount})</span>
            </button>
          )}

          {maintenanceCount > 0 && (
            <button
              onClick={() => setFilterSeverity('warning')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterSeverity === 'warning'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-700 border border-amber-200 dark:border-amber-900/50'
              }`}
            >
              {t.resident.filter_maintenance_updates} ({maintenanceCount})
            </button>
          )}
        </div>

        <button
          onClick={() => setShowResolvedHistory(!showResolvedHistory)}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 shrink-0 py-1"
        >
          <History className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>{t.resident.filter_past_updates} ({resolvedIncidents.length})</span>
          {showResolvedHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Incidents Feed */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 text-center shadow-sm transition-colors">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{t.resident.no_ongoing_issues}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.resident.no_ongoing_issues_desc}</p>
          </div>
        ) : (
          filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onOpenStatusUpdater={(inc) => setSelectedIncidentForUpdate(inc)}
            />
          ))
        )}
      </div>

      {/* Resolved History Section */}
      {showResolvedHistory && (
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            {t.resident.recently_resolved}
          </h3>

          <div className="space-y-2.5">
            {resolvedIncidents.map((incident) => (
              <div
                key={incident.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm text-xs transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{incident.title}</span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                    {t.resident.status_restored}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-2">{incident.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                  <span>{t.resident.location_prefix} {incident.location}</span>
                  <span>{incident.estimatedRestorationTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />

      <StatusUpdateModal
        incident={selectedIncidentForUpdate}
        isOpen={!!selectedIncidentForUpdate}
        onClose={() => setSelectedIncidentForUpdate(null)}
      />

    </div>
  );
};
