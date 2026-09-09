import React, { useState, useEffect } from 'react';
import { 
  X, 
  Droplet, 
  Zap, 
  ArrowUpDown, 
  Flame, 
  Send,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Info,
  CheckSquare,
  ShieldAlert
} from 'lucide-react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { IncidentCategory, SeverityLevel } from '../../types/building';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: IncidentCategory;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({ 
  isOpen, 
  onClose,
  initialCategory = 'water'
}) => {
  const { broadcastIncident, activeBuildingId, buildings } = useBuildingStore();
  const { t } = useLanguageStore();

  const [category, setCategory] = useState<IncidentCategory>(initialCategory);
  const [severity, setSeverity] = useState<SeverityLevel>('critical');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [affectedUnits, setAffectedUnits] = useState('');
  const [estimatedRestorationTime, setEstimatedRestorationTime] = useState('');
  const [etaCountdownMinutes, setEtaCountdownMinutes] = useState<number>(90);
  const [requiresResidentConfirmation, setRequiresResidentConfirmation] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync category when initialCategory changes
  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
      setRequiresResidentConfirmation(initialCategory === 'water');
    }
  }, [initialCategory, isOpen]);

  if (!isOpen) return null;

  const currentBuilding = buildings.find(b => b.id === activeBuildingId) || buildings[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError('Veuillez renseigner le titre de l\'incident.');
      return;
    }

    if (!description.trim()) {
      setValidationError('Veuillez renseigner les détails et consignes de l\'incident.');
      return;
    }

    broadcastIncident({
      buildingId: currentBuilding?.id,
      category,
      severity,
      title: title.trim(),
      description: description.trim(),
      location: location.trim() || 'Parties communes',
      affectedUnits: affectedUnits.trim() || 'Tous les résidents',
      status: 'reported',
      estimatedRestorationTime: estimatedRestorationTime.trim() || 'En cours d\'évaluation',
      etaCountdownMinutes: Number(etaCountdownMinutes) || 60,
      requiresResidentConfirmation
    });

    // Reset form fields
    setTitle('');
    setDescription('');
    setLocation('');
    setAffectedUnits('');
    setEstimatedRestorationTime('');
    setValidationError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="elevate-card w-full max-w-lg overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.manager_modals.broadcast_title}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.manager_modals.broadcast_desc}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full elevate-button-secondary text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {validationError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Service Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.manager_modals.affected_service} <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'water', label: t.manager_modals.service_water, icon: Droplet },
                { id: 'elevator', label: t.manager_modals.service_elevator, icon: ArrowUpDown },
                { id: 'power', label: t.manager_modals.service_power, icon: Zap },
                { id: 'heating', label: t.manager_modals.service_heating, icon: Flame },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCategory(item.id as IncidentCategory);
                      if (item.id === 'water') setRequiresResidentConfirmation(true);
                    }}
                    className={`p-2.5 rounded-2xl text-xs font-semibold flex flex-col items-center gap-1.5 transition-all outline-none ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.manager_modals.urgency_level}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSeverity('critical')}
                className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center ${
                  severity === 'critical'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {t.incident_card.severity_urgent}
              </button>
              <button
                type="button"
                onClick={() => setSeverity('warning')}
                className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center ${
                  severity === 'warning'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {t.incident_card.severity_scheduled}
              </button>
              <button
                type="button"
                onClick={() => setSeverity('info')}
                className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center ${
                  severity === 'info'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {t.common.info}
              </button>
            </div>
          </div>

          {/* Title - Required user manager input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.manager_modals.title_label} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.manager_modals.title_placeholder}
              className="w-full text-xs sm:text-sm elevate-input"
            />
          </div>

          {/* Description & Action Plan - Required user manager input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.manager_modals.notice_details} <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.manager_modals.notice_placeholder}
              className="w-full text-xs sm:text-sm elevate-input"
            />
          </div>

          {/* Location & Affected Units */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.manager_modals.location_label}</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t.manager_modals.location_placeholder}
                className="w-full text-xs elevate-input"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.manager_modals.affected_units_label}</span>
              </label>
              <input
                type="text"
                value={affectedUnits}
                onChange={(e) => setAffectedUnits(e.target.value)}
                placeholder={t.manager_modals.affected_units_placeholder}
                className="w-full text-xs elevate-input"
              />
            </div>
          </div>

          {/* Estimated Resolution Time & Minutes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t.manager_modals.eta_label}</span>
              </label>
              <input
                type="text"
                value={estimatedRestorationTime}
                onChange={(e) => setEstimatedRestorationTime(e.target.value)}
                placeholder={t.manager_modals.eta_placeholder}
                className="w-full text-xs elevate-input"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.manager.units_label} (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={1440}
                step={15}
                value={etaCountdownMinutes}
                onChange={(e) => setEtaCountdownMinutes(Number(e.target.value))}
                className="w-full text-xs elevate-input"
              />
            </div>
          </div>

          {/* Confirmation Option */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="requiresConfirmation"
              checked={requiresResidentConfirmation}
              onChange={(e) => setRequiresResidentConfirmation(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 outline-none"
            />
            <label htmlFor="requiresConfirmation" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <span className="font-bold block text-slate-800 dark:text-slate-200">Confirmation</span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="elevate-button-secondary px-5 py-2.5 text-xs text-slate-600 dark:text-slate-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="elevate-button-primary px-5 py-2.5 text-xs"
            >
              <Send className="w-3.5 h-3.5 mr-2" />
              <span>{t.manager_modals.send_broadcast}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
