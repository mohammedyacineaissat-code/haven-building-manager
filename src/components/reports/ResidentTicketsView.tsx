import React, { useState } from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { 
  Camera, 
  Send, 
  MapPin, 
  CheckCircle, 
  Plus, 
  X,
  HelpCircle,
  Inbox
} from 'lucide-react';
import { IncidentCategory } from '../../types/building';
import { useLanguageStore } from '../../store/useLanguageStore';

export const ResidentTicketsView: React.FC = () => {
  const { 
    currentRole, 
    residentReports, 
    submitResidentReport, 
    updateTicketStatus,
    userApartment,
    activeBuildingId,
    residentHomeBuildingId
  } = useBuildingStore();
  const { t } = useLanguageStore();
  
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [category, setCategory] = useState<IncidentCategory>('water');
  const [location, setLocation] = useState(userApartment || 'Palier principal');
  const [description, setDescription] = useState('');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_review' | 'resolved'>('all');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    submitResidentReport({
      category,
      location: location.trim() || userApartment || 'Résidence',
      description: description.trim(),
      photoUrl: photoData || undefined,
    });

    setDescription('');
    setPhotoData(null);
    setShowSubmitModal(false);
  };

  const currentBuildingId = currentRole === 'resident' ? residentHomeBuildingId : activeBuildingId;
  const buildingTickets = residentReports.filter(r => !r.buildingId || !currentBuildingId || r.buildingId === currentBuildingId);

  const filteredTickets = buildingTickets.filter(t => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="space-y-4 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 elevate-card transition-colors">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.tickets.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {currentRole === 'manager' 
              ? t.tickets.subtitle_manager 
              : t.tickets.subtitle_resident}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${statusFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Tous ({buildingTickets.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-lg transition-all ${statusFilter === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              En attente ({buildingTickets.filter(b => b.status === 'pending').length})
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-3 py-1 rounded-lg transition-all ${statusFilter === 'resolved' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Résolus ({buildingTickets.filter(b => b.status === 'resolved').length})
            </button>
          </div>

          {currentRole === 'resident' && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 rounded-xl elevate-button-primary text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.tickets.new_report_btn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Snap & Report Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-md p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {t.tickets.modal_title}
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {t.tickets.modal_desc}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.tickets.issue_type}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600"
                >
                  <option value="water">{t.tickets.type_water}</option>
                  <option value="power">{t.tickets.type_power}</option>
                  <option value="elevator">{t.tickets.type_elevator}</option>
                  <option value="gate">{t.tickets.type_gate}</option>
                  <option value="general">{t.tickets.type_general}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.tickets.location}</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t.tickets.location_placeholder}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.tickets.description}</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.tickets.description_placeholder}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="resident-ticket-photo"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <label
                  htmlFor="resident-ticket-photo"
                  className={`w-full py-3.5 px-4 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    photoData 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{photoData ? t.tickets.photo_attached : t.tickets.attach_photo}</span>
                  {photoData && (
                    <img src={photoData} alt="Preview" className="w-16 h-16 object-cover rounded-xl mt-1 border border-emerald-200 dark:border-emerald-700" />
                  )}
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl elevate-button-primary font-bold text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.tickets.send_ticket}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="p-12 rounded-3xl elevate-card text-center transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t.tickets.no_reports}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4">
              {t.tickets.no_reports_desc}
            </p>
            {currentRole === 'resident' && (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2 rounded-xl elevate-button-secondary text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{t.tickets.snap_report_btn}</span>
              </button>
            )}
          </div>
        ) : (
          filteredTickets.map((report) => (
            <div
              key={report.id}
              className="p-5 rounded-3xl elevate-card space-y-3 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white capitalize">
                  {report.category} {t.tickets.issue_suffix}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  report.status === 'resolved'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                    : report.status === 'in_review'
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
                      : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                }`}>
                  {(t.stages[report.status as keyof typeof t.stages] || report.status).toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{report.description}</p>

              {report.photoUrl && (
                <div className="pt-1">
                  <img
                    src={report.photoUrl}
                    alt="Ticket"
                    className="w-full max-h-56 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  {report.location}
                </span>
                <span>{t.tickets.by_prefix} {report.submittedBy} • {report.submittedAt}</span>
              </div>

              {/* Manager Status Controls */}
              {currentRole === 'manager' && report.status !== 'resolved' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {report.status !== 'in_review' && (
                    <button
                      type="button"
                      onClick={() => updateTicketStatus(report.id, 'in_review')}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-100 text-[11px] font-bold transition-colors"
                    >
                      Prendre en charge
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => updateTicketStatus(report.id, 'resolved')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 text-[11px] font-bold transition-colors"
                  >
                    Marquer Résolu
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
