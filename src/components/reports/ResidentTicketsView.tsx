import React, { useState } from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { 
  Camera, 
  Send, 
  MapPin, 
  CheckCircle, 
  Plus, 
  X,
  HelpCircle
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

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            {t.tickets.title}
          </h2>
          <p className="text-xs text-slate-500">
            {currentRole === 'manager' 
              ? t.tickets.subtitle_manager 
              : t.tickets.subtitle_resident}
          </p>
        </div>

        {currentRole === 'resident' && (
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/25 transition-transform active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.tickets.new_report_btn}</span>
          </button>
        )}
      </div>

      {/* Note about deferred Kanban */}
      {currentRole === 'manager' && (
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs">
          <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-slate-600 text-[11px] leading-relaxed">
            <strong className="text-slate-800">{t.tickets.manager_note_title}</strong> {t.tickets.manager_note_desc}
          </p>
        </div>
      )}

      {/* Snap & Report Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {t.tickets.modal_title}
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              {t.tickets.modal_desc}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.tickets.issue_type}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="water">{t.tickets.type_water}</option>
                  <option value="power">{t.tickets.type_power}</option>
                  <option value="elevator">{t.tickets.type_elevator}</option>
                  <option value="gate">{t.tickets.type_gate}</option>
                  <option value="general">{t.tickets.type_general}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.tickets.location}</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t.tickets.location_placeholder}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.tickets.description}</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.tickets.description_placeholder}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
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
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-slate-50 border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Camera className="w-5 h-5 text-blue-600" />
                  <span>{photoData ? t.tickets.photo_attached : t.tickets.attach_photo}</span>
                  {photoData && (
                    <img src={photoData} alt="Preview" className="w-16 h-16 object-cover rounded-xl mt-1 border border-emerald-200" />
                  )}
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/25"
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
        {buildingTickets.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-100 text-center haven-card">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">{t.tickets.no_reports}</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
              {t.tickets.no_reports_desc}
            </p>
            {currentRole === 'resident' && (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{t.tickets.snap_report_btn}</span>
              </button>
            )}
          </div>
        ) : (
          buildingTickets.map((report) => (
            <div
              key={report.id}
              className="p-4 rounded-3xl haven-card space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 capitalize">
                  {report.category} {t.tickets.issue_suffix}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  report.status === 'resolved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : report.status === 'in_review'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {(t.stages[report.status as keyof typeof t.stages] || report.status).toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{report.description}</p>

              {report.photoUrl && (
                <div className="pt-1">
                  <img
                    src={report.photoUrl}
                    alt="Ticket"
                    className="w-full max-h-48 object-cover rounded-2xl border border-slate-100 shadow-sm"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {report.location}
                </span>
                <span>{t.tickets.by_prefix} {report.submittedBy} • {report.submittedAt}</span>
              </div>

              {/* Manager Status Controls */}
              {currentRole === 'manager' && report.status !== 'resolved' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  {report.status !== 'in_review' && (
                    <button
                      type="button"
                      onClick={() => updateTicketStatus(report.id, 'in_review')}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold transition-colors"
                    >
                      Prendre en charge
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => updateTicketStatus(report.id, 'resolved')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold transition-colors"
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
