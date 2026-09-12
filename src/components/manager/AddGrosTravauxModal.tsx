import React, { useState, useEffect } from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { GrosTravauxProject, GrosTravauxStatus } from '../../types/building';
import { 
  X, 
  Hammer, 
  Calculator, 
  Calendar, 
  Phone, 
  Building2, 
  Save, 
  AlertCircle,
  FileCheck,
  Clock
} from 'lucide-react';

interface AddGrosTravauxModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildingId: string;
  totalUnits: number;
  initialProject?: GrosTravauxProject | null;
}

export const AddGrosTravauxModal: React.FC<AddGrosTravauxModalProps> = ({
  isOpen,
  onClose,
  buildingId,
  totalUnits,
  initialProject
}) => {
  const { addGrosTravauxProject, updateGrosTravauxProject } = useBuildingStore();
  const { t, isRtl } = useLanguageStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [status, setStatus] = useState<GrosTravauxStatus>('collecting');
  const [deadline, setDeadline] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [contractorPhone, setContractorPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProject) {
      setTitle(initialProject.title);
      setDescription(initialProject.description);
      setTotalCost(initialProject.totalCost.toString());
      setStatus(initialProject.status);
      setDeadline(initialProject.deadline);
      setContractorName(initialProject.contractorName || '');
      setContractorPhone(initialProject.contractorPhone || '');
    } else {
      setTitle('');
      setDescription('');
      setTotalCost('');
      setStatus('collecting');
      // Default deadline: 3 months from now
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      setDeadline(d.toISOString().split('T')[0]);
      setContractorName('');
      setContractorPhone('');
    }
    setError(null);
  }, [initialProject, isOpen]);

  if (!isOpen) return null;

  const parsedCost = parseFloat(totalCost) || 0;
  const calculatedQuota = totalUnits > 0 && parsedCost > 0 ? Math.ceil(parsedCost / totalUnits) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError(t.gros_travaux.project_title_placeholder);
      return;
    }
    if (parsedCost <= 0) {
      setError(t.gros_travaux.cost_placeholder);
      return;
    }

    if (initialProject) {
      await updateGrosTravauxProject(buildingId, initialProject.id, {
        title: title.trim(),
        description: description.trim(),
        totalCost: parsedCost,
        status,
        deadline: deadline || new Date().toISOString().split('T')[0],
        contractorName: contractorName.trim() || undefined,
        contractorPhone: contractorPhone.trim() || undefined,
      });
    } else {
      await addGrosTravauxProject(buildingId, {
        title: title.trim(),
        description: description.trim(),
        totalCost: parsedCost,
        status,
        deadline: deadline || new Date().toISOString().split('T')[0],
        contractorName: contractorName.trim() || undefined,
        contractorPhone: contractorPhone.trim() || undefined,
      });
    }

    onClose();
  };

  const statusOptions: { id: GrosTravauxStatus; label: string }[] = [
    { id: 'voting', label: t.gros_travaux.status_voting },
    { id: 'collecting', label: t.gros_travaux.status_collecting },
    { id: 'in_progress', label: t.gros_travaux.status_in_progress },
    { id: 'completed', label: t.gros_travaux.status_completed },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {initialProject ? t.gros_travaux.tab_title : t.gros_travaux.modal_new_title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.gros_travaux.modal_new_desc}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Project Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.gros_travaux.project_title_label} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.gros_travaux.project_title_placeholder}
              required
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Scope / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.gros_travaux.description_label}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.gros_travaux.description_placeholder}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl p-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Total Cost & Live Quota Calculation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.gros_travaux.cost_label} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                placeholder={t.gros_travaux.cost_placeholder}
                required
                min={0}
                step={1000}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-black text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-amber-500"
              />
              <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                DA
              </span>
            </div>

            {/* Calculated Quota Banner */}
            <div className="mt-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{t.gros_travaux.quota_per_apt_label} :</span>
              </span>
              <span className="text-sm font-black text-amber-700 dark:text-amber-300">
                {calculatedQuota.toLocaleString()} DA <span className="text-[10px] font-normal opacity-75">({totalUnits} lots)</span>
              </span>
            </div>
          </div>

          {/* Status & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Statut du Projet
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-amber-500"
              >
                {statusOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.gros_travaux.deadline_label}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Contractor Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.gros_travaux.contractor_name_label}
              </label>
              <input
                type="text"
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                placeholder={t.gros_travaux.contractor_name_placeholder}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.gros_travaux.contractor_phone_label}
              </label>
              <input
                type="text"
                value={contractorPhone}
                onChange={(e) => setContractorPhone(e.target.value)}
                placeholder={t.gros_travaux.contractor_phone_placeholder}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white text-xs font-bold shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{t.gros_travaux.create_project_btn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
