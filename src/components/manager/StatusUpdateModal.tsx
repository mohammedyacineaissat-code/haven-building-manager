import React, { useState } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import { Incident, IncidentStatus } from '../../types/building';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';

interface StatusUpdateModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ incident, isOpen, onClose }) => {
  const { updateIncidentStatus } = useBuildingStore();
  const { t } = useLanguageStore();
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus>(incident?.status || 'in_progress');
  const [note, setNote] = useState('');

  if (!isOpen || !incident) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateIncidentStatus(incident.id, selectedStatus, note.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {t.manager_modals.update_status_title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.manager_modals.update_status_desc}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400">{t.tickets.issue_suffix}</div>
            <div className="text-xs font-bold text-slate-900 truncate mt-0.5">{incident.title}</div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {t.manager_modals.current_stage}
            </label>
            <div className="space-y-1.5">
              {[
                { status: 'reported' as IncidentStatus, label: t.stages.reported, desc: t.manager_modals.stage_reported_desc },
                { status: 'dispatched' as IncidentStatus, label: t.stages.dispatched, desc: t.manager_modals.stage_dispatched_desc },
                { status: 'in_progress' as IncidentStatus, label: t.stages.in_progress, desc: t.manager_modals.stage_inprogress_desc },
                { status: 'testing' as IncidentStatus, label: t.stages.testing, desc: t.manager_modals.stage_testing_desc },
                { status: 'resolved' as IncidentStatus, label: t.manager_modals.stage_resolved, desc: t.manager_modals.stage_resolved_desc },
              ].map((step) => {
                const isSelected = selectedStatus === step.status;
                const isResolved = step.status === 'resolved';

                return (
                  <button
                    key={step.status}
                    type="button"
                    onClick={() => setSelectedStatus(step.status)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? isResolved 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm' 
                          : 'bg-blue-50 border-blue-300 text-blue-950 shadow-sm'
                        : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{step.label}</div>
                      <div className="text-[11px] text-slate-500">{step.desc}</div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected 
                        ? isResolved ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-blue-600 bg-blue-600 text-white' 
                        : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.manager_modals.add_note}
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.manager_modals.note_placeholder}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <span>{t.manager_modals.save_update}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
