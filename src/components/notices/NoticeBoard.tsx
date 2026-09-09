import React from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Pin, Calendar, User, Info, Coins } from 'lucide-react';

export const NoticeBoard: React.FC = () => {
  const { notices } = useBuildingStore();
  const { t } = useLanguageStore();

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.notices.title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t.notices.subtitle}</p>
      </div>

      <div className="space-y-3">
        {notices.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center transition-colors">
            <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t.notices.empty}</h3>
          </div>
        ) : (
          notices.map((notice) => (
          <article
            key={notice.id}
            className={`p-5 elevate-card hover:shadow-card-hover dark:hover:shadow-card-dark-hover ${
              notice.isPinned ? 'ring-2 ring-emerald-500/50 dark:ring-emerald-500/40' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {notice.isPinned && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/30">
                    <Pin className="w-3 h-3" />
                    {t.notices.pinned}
                  </span>
                )}
                {notice.category === 'expense' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                    <Coins className="w-3 h-3" />
                    {t.notices.expense_badge}
                  </span>
                )}
                {notice.category === 'meeting' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                    {t.announcement_modal.cat_meeting}
                  </span>
                )}
                {notice.category === 'maintenance' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    {t.announcement_modal.cat_maintenance}
                  </span>
                )}
                {notice.category === 'security' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/30 px-2.5 py-0.5 rounded-full">
                    {t.announcement_modal.cat_security}
                  </span>
                )}
                {notice.category === 'urgent' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/30 px-2.5 py-0.5 rounded-full">
                    {t.announcement_modal.cat_urgent}
                  </span>
                )}
                {notice.category === 'info' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border border-sky-200/60 dark:border-sky-500/30 px-2.5 py-0.5 rounded-full">
                    {t.announcement_modal.cat_info}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Calendar className="w-3 h-3" />
                <span>{notice.date}</span>
              </div>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
              {notice.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              {notice.content}
            </p>

            {notice.category === 'expense' && notice.expenseDetails && (
              <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t.notices.amount_due}
                  </div>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {notice.expenseDetails.perResidentAmount.toFixed(2)} <span className="text-sm font-semibold">{t.manager.currency}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t.manager.total_cost_label}
                  </div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {notice.expenseDetails.totalAmount.toFixed(2)} {t.manager.currency}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <User className="w-3.5 h-3.5" />
                </div>
                {notice.author}
              </span>
              <span className="text-[11px] font-medium">{t.notices.author_label}</span>
            </div>
          </article>
        )))}
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 transition-colors">
        <Info className="w-4 h-4 text-emerald-500 shrink-0" />
        <span className="font-bold">{t.notices.read_only_info}</span>
      </div>
    </div>
  );
};
