import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { CheckCircle2, AlertCircle, Coins, Clock, Receipt } from 'lucide-react';

export const MyPaymentStatus: React.FC = () => {
  const { residentProfile } = useAuthStore();
  const { finances } = useFinanceStore();
  const { t, isRtl } = useLanguageStore();

  if (!residentProfile) return null;

  const buildingFinances = finances[residentProfile.buildingId];
  const monthlyCharge = buildingFinances?.monthlyCharge || 0;
  
  // Just a simple check for current month (in real app, this would be more complex)
  const isPaid = buildingFinances?.paidApts.includes(residentProfile.aptNumber) || false;

  const getCurrentMonthName = () => {
    const d = new Date();
    return new Intl.DateTimeFormat(isRtl ? 'ar-DZ' : 'fr-FR', { month: 'long', year: 'numeric' }).format(d);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Coins className="w-4 h-4" />
          </div>
          {/* Default to French if missing in translation */}
          État des paiements
        </h2>
        {isPaid ? (
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            À jour
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 border border-amber-100 dark:border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            En attente
          </span>
        )}
      </div>

      <div className="flex items-end justify-between mt-6">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium capitalize">
            {getCurrentMonthName()}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {monthlyCharge}
            </span>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              DA
            </span>
          </div>
        </div>

        <button className="h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          Historique
        </button>
      </div>

      {!isPaid && (
        <div className="mt-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed font-medium">
            Votre cotisation pour ce mois n'a pas encore été réglée. Veuillez vous rapprocher du syndic.
          </p>
        </div>
      )}
    </div>
  );
};
