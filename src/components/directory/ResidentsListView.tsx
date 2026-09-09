import React, { useState } from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Search, Phone, Home, User, ShieldCheck } from 'lucide-react';

export const ResidentsListView = () => {
  const { registeredAccounts, activeBuildingId } = useBuildingStore();
  const { t } = useLanguageStore();
  const [search, setSearch] = useState('');

  const buildingResidents = registeredAccounts.filter(a => a.buildingId === activeBuildingId);

  const filtered = buildingResidents.filter(r => 
    r.lastName.toLowerCase().includes(search.toLowerCase()) ||
    (r.firstName ? r.firstName.toLowerCase().includes(search.toLowerCase()) : false) ||
    r.aptNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 elevate-card">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.residents_list.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.residents_list.subtitle}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.residents_list.search_placeholder}
          className="w-full pl-11 elevate-input"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl text-slate-500 font-semibold text-xs transition-colors">
            {t.residents_list.no_residents_found}
          </div>
        ) : (
          filtered.map(resident => (
            <div key={resident.id} className="elevate-card p-4 flex flex-col gap-3 hover:shadow-card-hover dark:hover:shadow-card-dark-hover transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm shrink-0 flex items-center justify-center">
                    {resident.lastName.charAt(0)}{resident.firstName?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {resident.lastName} {resident.firstName}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      {t.residents_list.registered_on} {resident.joinedAt || t.residents_list.recently}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="rounded-xl p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 transition-colors">
                  <Home className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold truncate">Apt {resident.aptNumber}</span>
                </div>
                <div className="rounded-xl p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold truncate">{resident.phone}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
