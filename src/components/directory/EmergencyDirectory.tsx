import React from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { 
  Phone, 
  ShieldAlert, 
  Wrench, 
  Zap, 
  PhoneCall, 
  Building, 
  UserCheck, 
  Info, 
  MapPin, 
  Clock
} from 'lucide-react';

export const EmergencyDirectory: React.FC = () => {
  const { currentRole, staffContacts, contractorContacts } = useBuildingStore();
  const { t } = useLanguageStore();

  const getContractorIcon = (iconName: string) => {
    switch (iconName) {
      case 'wrench': return <Wrench className="w-5 h-5 text-sky-600" />;
      case 'shield-alert': return <ShieldAlert className="w-5 h-5 text-indigo-600" />;
      case 'zap': return <Zap className="w-5 h-5 text-amber-600" />;
      default: return <PhoneCall className="w-5 h-5 text-blue-600" />;
    }
  };

  const getContractorBg = (iconName: string) => {
    switch (iconName) {
      case 'wrench': return 'bg-sky-50 border-sky-100';
      case 'shield-alert': return 'bg-indigo-50 border-indigo-100';
      case 'zap': return 'bg-amber-50 border-amber-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Header based on Role */}
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
          {currentRole === 'resident' ? t.directory.title : t.directory.contractors_title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {currentRole === 'resident' 
            ? t.directory.subtitle
            : t.directory.contractors_subtitle}
        </p>
      </div>

      {/* RESIDENT VIEW: Building Manager (Syndic) & Concierge */}
      {currentRole === 'resident' ? (
        <div className="space-y-3">
          
          {/* Syndic / Manager Cards */}
          {staffContacts.map((staff) => (
            <div
              key={staff.id}
              className="p-5 elevate-card space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
                    {staff.id === 'staff-1' ? <Building className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {staff.id === 'staff-1' ? t.directory.manager_title : t.directory.concierge_title}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {staff.name}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {staff.role}
                    </div>
                  </div>
                </div>

                <a
                  href={`tel:${staff.phone.replace(/\s+/g, '')}`}
                  className="px-4 py-2 rounded-full elevate-button-primary text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 shrink-0"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t.directory.call_btn}</span>
                </a>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{staff.available}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{staff.location}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Policy info for Residents */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-start gap-3 text-xs">
            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              <strong className="text-slate-900 dark:text-white block font-bold mb-0.5">
                {t.directory.contractor_policy_title}
              </strong>
              {t.directory.contractor_policy_desc}
            </div>
          </div>

        </div>
      ) : (
        /* MANAGER VIEW: Contractor Directory */
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{t.directory.contractor_auth_notice}</span>
          </div>

          {contractorContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 rounded-2xl elevate-card flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${getContractorBg(contact.icon)}`}>
                  {getContractorIcon(contact.icon)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {contact.title}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {contact.role}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{contact.available}</span>
                  </div>
                </div>
              </div>

              <a
                href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/30 flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm"
                title={t.directory.dispatch_contractor}
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Public Emergency Lines in Algeria */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-slate-500" />
          <span>{t.directory.emergency_title}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          {t.directory.emergency_desc}
        </p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-2">
          <a 
            href="tel:14" 
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm flex flex-col items-center gap-0.5"
          >
            <span className="text-[10px] text-slate-400 font-semibold">{t.directory.ambulance}</span>
            <span className="text-rose-600 dark:text-rose-400 font-extrabold text-sm">14</span>
          </a>
          <a 
            href="tel:17" 
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm flex flex-col items-center gap-0.5"
          >
            <span className="text-[10px] text-slate-400 font-semibold">{t.directory.police}</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">17</span>
          </a>
          <a 
            href="tel:1055" 
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm flex flex-col items-center gap-0.5"
          >
            <span className="text-[10px] text-slate-400 font-semibold">{t.directory.gendarme}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">1055</span>
          </a>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <a 
            href="tel:1594" 
            className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200/60 dark:border-sky-500/20 text-sky-900 dark:text-sky-300 font-bold hover:bg-sky-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>SEAAL Eau:</span>
            <span className="text-sky-700 dark:text-sky-400 font-extrabold">1594</span>
          </a>
          <a 
            href="tel:3303" 
            className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 text-amber-900 dark:text-amber-300 font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Sonelgaz:</span>
            <span className="text-amber-700 dark:text-amber-400 font-extrabold">3303</span>
          </a>
        </div>
      </div>

    </div>
  );
};
