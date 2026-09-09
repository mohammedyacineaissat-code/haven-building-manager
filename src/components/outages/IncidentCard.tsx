import React, { useState } from 'react';
import { 
  Incident, 
  IncidentStatus, 
  IncidentCategory 
} from '../../types/building';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { 
  Droplet, 
  Zap, 
  ArrowUpDown, 
  Flame, 
  ShieldAlert, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Check, 
  Send, 
  Info, 
  ShieldCheck 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface IncidentCardProps {
  incident: Incident;
  onOpenStatusUpdater?: (incident: Incident) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onOpenStatusUpdater }) => {
  const { currentRole, confirmRestoration, userApartment, addTimelineNote } = useBuildingStore();
  const { t } = useLanguageStore();
  const [quickNote, setQuickNote] = useState('');

  const isManager = currentRole === 'manager';

  const statusSteps: { key: IncidentStatus; label: string }[] = [
    { key: 'reported', label: t.stages.reported },
    { key: 'dispatched', label: t.stages.dispatched },
    { key: 'in_progress', label: t.stages.in_progress },
    { key: 'testing', label: t.stages.testing },
    { key: 'resolved', label: t.stages.resolved },
  ];

    const getCategoryDetails = (category: IncidentCategory) => {
      switch (category) {
        case 'water':
          return { icon: Droplet, label: t.incident_card.cat_water, bg: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-500/20' };
        case 'power':
          return { icon: Zap, label: t.incident_card.cat_power, bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20' };
        case 'elevator':
          return { icon: ArrowUpDown, label: t.incident_card.cat_elevator, bg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20' };
        case 'heating':
          return { icon: Flame, label: t.incident_card.cat_heating, bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20' };
        case 'gate':
          return { icon: ShieldAlert, label: t.incident_card.cat_gate, bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20' };
        default:
          return { icon: AlertCircle, label: t.incident_card.cat_general, bg: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700' };
      }
    };

  const cat = getCategoryDetails(incident.category);
  const CategoryIcon = cat.icon;
  const isCritical = incident.severity === 'critical';
  const currentStepIndex = statusSteps.findIndex(s => s.key === incident.status);

  const myConfirmation = (incident.confirmations || []).find(c => c.apartment === userApartment);
  const restoredCount = (incident.confirmations || []).filter(c => c.isRestored).length;

  const handleConfirm = (restored: boolean) => {
    confirmRestoration(incident.id, restored);
    if (restored) {
      try {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.8 },
          colors: ['#059669', '#2563EB', '#38BDF8']
        });
      } catch {
        // Safe fallback
      }
    }
  };

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    addTimelineNote(incident.id, quickNote.trim());
    setQuickNote('');
  };

  return (
    <article className={`elevate-card p-5 mb-4 relative overflow-hidden transition-all duration-200 hover:shadow-card-hover dark:hover:shadow-card-dark-hover ${
      isCritical ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-emerald-500'
    }`}>
      
      {/* Header: Category, Severity Badge, and Reported Time */}
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${cat.bg}`}>
            <CategoryIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {cat.label}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{incident.reportedAt}</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold leading-snug mt-0.5 text-slate-900 dark:text-white">
              {incident.title}
            </h3>
          </div>
        </div>

        {/* Severity Badge */}
        {isCritical ? (
          <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-bold tracking-tight shrink-0 flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
            {t.common.critical}
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold tracking-tight shrink-0">
            {t.common.warning}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm leading-relaxed mb-4 text-slate-600 dark:text-slate-300">
        {incident.description}
      </p>

      {/* Location & Affected Units Pill */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 font-semibold text-slate-700 dark:text-slate-200">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {incident.location}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 font-semibold text-slate-700 dark:text-slate-200">
          {t.incident_card.affects_label} <strong className="font-extrabold text-emerald-600 dark:text-emerald-400">{incident.affectedUnits}</strong>
        </span>
      </div>

      {/* Estimated Restoration Banner */}
      <div className="p-3.5 rounded-2xl mb-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.stages.eta_prefix}
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              {incident.estimatedRestorationTime}
            </div>
          </div>
        </div>

        {incident.etaCountdownMinutes > 0 && (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            ~{incident.etaCountdownMinutes} {t.stages.minutes_remaining}
          </span>
        )}
      </div>

      {/* Segmented Timeline Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-600 dark:text-slate-400">{t.common.status}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold capitalize">
            {statusSteps.find(s => s.key === incident.status)?.label || incident.status}
          </span>
        </div>

        {/* Continuous Segmented Bar */}
        <div className="grid grid-cols-5 gap-1.5 p-2 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          {statusSteps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div className={`w-full h-2 rounded-full transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                    : isCurrent 
                      ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-pulse' 
                      : 'bg-slate-300/60 dark:bg-slate-700/60'
                }`} />
                <span className={`text-[9px] sm:text-[10px] mt-1.5 font-bold text-center truncate w-full ${
                  isCurrent ? 'text-indigo-600 dark:text-indigo-400' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resident Service Check */}
      {currentRole === 'resident' && incident.requiresResidentConfirmation && (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {t.resident.water_confirmation_title}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {restoredCount} {t.resident.confirmed_by_tenants}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleConfirm(true)}
              className={`py-2.5 px-3 text-xs gap-1.5 font-semibold rounded-xl flex items-center justify-center transition-all ${
                myConfirmation?.isRestored === true
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t.resident.water_flowing_btn}</span>
            </button>

            <button
              onClick={() => handleConfirm(false)}
              className={`py-2.5 px-3 text-xs gap-1.5 font-semibold rounded-xl flex items-center justify-center transition-all ${
                myConfirmation?.isRestored === false
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 hover:bg-rose-100'
              }`}
            >
              <span>{t.resident.water_cut_btn}</span>
            </button>
          </div>
        </div>
      )}

      {/* Elevator Safety Protocol */}
      {incident.category === 'elevator' && (
        <div className={`p-3.5 rounded-2xl mb-4 flex items-start gap-2.5 text-xs transition-colors ${
          incident.status === 'testing'
            ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200/70 dark:border-indigo-800/50 text-indigo-950 dark:text-indigo-100'
            : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
        }`}>
          {incident.status === 'testing' ? (
            <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          ) : incident.status === 'resolved' ? (
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          )}

          <div>
            <strong className="font-bold block">
              {incident.status === 'testing'
                ? t.incident_card.elevator_testing_title
                : incident.status === 'resolved'
                  ? t.incident_card.elevator_resolved_title
                  : t.incident_card.elevator_onsite_title}
            </strong>
            <span className="text-[11px] leading-relaxed block mt-0.5 opacity-90">
              {incident.status === 'testing'
                ? t.incident_card.elevator_testing_desc
                : incident.status === 'resolved'
                  ? t.incident_card.elevator_resolved_desc
                  : t.incident_card.elevator_onsite_desc}
            </span>
          </div>
        </div>
      )}

      {isManager && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70 mb-2 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.incident_card.mgmt_actions}</span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{t.incident_card.syndic_control}</span>
          </div>

          <button
            onClick={() => onOpenStatusUpdater && onOpenStatusUpdater(incident)}
            className="w-full elevate-button-primary py-2.5 px-3 text-xs mb-3"
          >
            {t.incident_card.update_status_btn}
          </button>

          <form onSubmit={handlePostNote} className="flex items-center gap-2">
            <input
              type="text"
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              placeholder={t.incident_card.quick_note_placeholder}
              className="flex-1 text-xs elevate-input py-2.5"
            />
            <button
              type="submit"
              disabled={!quickNote.trim()}
              className="elevate-button-indigo w-10 h-10 shrink-0 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

    </article>
  );
};
