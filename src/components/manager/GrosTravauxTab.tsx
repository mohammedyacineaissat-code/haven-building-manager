import React, { useState } from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { GrosTravauxProject, GrosTravauxStatus } from '../../types/building';
import { AddGrosTravauxModal } from './AddGrosTravauxModal';
import { 
  Hammer, 
  Plus, 
  Calendar, 
  Phone, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Send, 
  Edit2, 
  Trash2, 
  CheckCheck, 
  ChevronDown, 
  ChevronUp, 
  Coins, 
  Info,
  Layers
} from 'lucide-react';

interface GrosTravauxTabProps {
  buildingId: string;
  totalUnits: number;
}

export const GrosTravauxTab: React.FC<GrosTravauxTabProps> = ({
  buildingId,
  totalUnits
}) => {
  const { 
    grosTravauxProjects, 
    toggleGrosTravauxAptPaid, 
    deleteGrosTravauxProject, 
    publishGrosTravauxNotice 
  } = useBuildingStore();

  const { t, isRtl } = useLanguageStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<GrosTravauxProject | null>(null);
  const [expandedChecklistId, setExpandedChecklistId] = useState<string | null>(null);
  const [broadcastSuccessId, setBroadcastSuccessId] = useState<string | null>(null);

  const projects = grosTravauxProjects[buildingId] || [];

  const aptsList = Array.from({ length: totalUnits }, (_, i) => `Apt ${i + 1}`);

  const statusMeta: Record<GrosTravauxStatus, { label: string; color: string }> = {
    voting: { 
      label: t.gros_travaux.status_voting, 
      color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30' 
    },
    collecting: { 
      label: t.gros_travaux.status_collecting, 
      color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' 
    },
    in_progress: { 
      label: t.gros_travaux.status_in_progress, 
      color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30' 
    },
    completed: { 
      label: t.gros_travaux.status_completed, 
      color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' 
    },
  };

  const handleBroadcast = async (projectId: string) => {
    await publishGrosTravauxNotice(buildingId, projectId);
    setBroadcastSuccessId(projectId);
    setTimeout(() => setBroadcastSuccessId(null), 4000);
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      
      {/* Educational Banner explaining why Gros Travaux require special cotisations */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 text-slate-800 dark:text-slate-200">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm sm:text-base font-black text-amber-900 dark:text-amber-200">
              {t.gros_travaux.banner_title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              {t.gros_travaux.banner_desc}
            </p>
          </div>
        </div>
      </div>

      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            {t.gros_travaux.tab_title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.gros_travaux.subtitle}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProject(null);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.gros_travaux.new_project_btn}</span>
        </button>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="p-12 rounded-3xl elevate-card border border-dashed border-slate-300 dark:border-slate-800 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <Hammer className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {t.gros_travaux.no_projects}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {t.gros_travaux.no_projects_desc}
          </p>
          <button
            onClick={() => {
              setEditingProject(null);
              setIsAddModalOpen(true);
            }}
            className="mt-5 px-5 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all"
          >
            {t.gros_travaux.new_project_btn}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(project => {
            const paidCount = project.paidApts?.length || 0;
            const collectedAmount = paidCount * project.perUnitQuota;
            const percentage = project.totalCost > 0 ? Math.min(100, Math.round((collectedAmount / project.totalCost) * 100)) : 0;
            const statusConfig = statusMeta[project.status] || statusMeta.collecting;
            const isChecklistOpen = expandedChecklistId === project.id;
            const isBroadcastSuccess = broadcastSuccessId === project.id;

            return (
              <div
                key={project.id}
                className="p-5 sm:p-6 rounded-3xl elevate-card border border-slate-200/70 dark:border-slate-800/70 shadow-sm transition-all"
              >
                {/* Top Row: Title, Status Badge, Edit/Delete */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Hammer className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {project.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Initié le {project.createdAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>

                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setIsAddModalOpen(true);
                      }}
                      title={t.finances.edit_btn}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t.gros_travaux.delete_confirm)) {
                          deleteGrosTravauxProject(buildingId, project.id);
                        }
                      }}
                      title={t.common.cancel}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Scope Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Info Pills Grid: Total Cost, Quota, Deadline, Contractor */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {t.gros_travaux.total_cost_label}
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5 block">
                      {project.totalCost.toLocaleString()} DA
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                      {t.gros_travaux.quota_per_apt_label}
                    </span>
                    <span className="text-sm sm:text-base font-black text-amber-800 dark:text-amber-300 mt-0.5 block">
                      {project.perUnitQuota.toLocaleString()} DA
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {t.gros_travaux.deadline_label}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                      {project.deadline}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {t.gros_travaux.contractor_label}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate" title={project.contractorName || 'Non assigné'}>
                      {project.contractorName || 'Non assigné'}
                    </span>
                  </div>
                </div>

                {/* Live Funding Progress Bar */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t.gros_travaux.collection_progress} :</span>
                      <span className="text-amber-600 dark:text-amber-400 font-black">
                        {collectedAmount.toLocaleString()} / {project.totalCost.toLocaleString()} DA
                      </span>
                    </span>

                    <span className="font-bold text-slate-500 dark:text-slate-400">
                      {paidCount} / {totalUnits} {t.gros_travaux.apts_paid_count} ({percentage}%)
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setExpandedChecklistId(isChecklistOpen ? null : project.id)}
                    className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <span>{t.gros_travaux.checklist_title}</span>
                    {isChecklistOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleBroadcast(project.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                      isBroadcastSuccess 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isBroadcastSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{isBroadcastSuccess ? t.gros_travaux.notice_published_success : t.gros_travaux.publish_notice_btn}</span>
                  </button>
                </div>

                {/* Apartment Payment Checklist Accordion */}
                {isChecklistOpen && (
                  <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 font-medium">
                      {t.gros_travaux.toggle_paid}
                    </p>

                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                      {aptsList.map(apt => {
                        const isPaid = project.paidApts?.includes(apt);
                        return (
                          <button
                            key={apt}
                            onClick={() => toggleGrosTravauxAptPaid(buildingId, project.id, apt)}
                            className={`p-2 rounded-xl text-center text-xs font-bold transition-all border ${
                              isPaid
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            <span className="block text-[10px]">{apt}</span>
                            <span className="text-[9px] mt-0.5 block">
                              {isPaid ? '✅' : '⏳'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {isAddModalOpen && (
        <AddGrosTravauxModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingProject(null);
          }}
          buildingId={buildingId}
          totalUnits={totalUnits}
          initialProject={editingProject}
        />
      )}
    </div>
  );
};
