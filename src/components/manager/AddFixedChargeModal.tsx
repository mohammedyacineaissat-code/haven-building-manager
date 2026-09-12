import React, { useState, useEffect } from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { FixedCharge, FixedChargeCategory } from '../../types/building';
import { 
  X, 
  Wallet, 
  UserCheck, 
  FileText, 
  Zap, 
  Wrench, 
  Coins, 
  Building2,
  Calendar,
  Save,
  AlertCircle
} from 'lucide-react';

interface AddFixedChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildingId: string;
  initialCharge?: FixedCharge | null;
}

export const AddFixedChargeModal: React.FC<AddFixedChargeModalProps> = ({
  isOpen,
  onClose,
  buildingId,
  initialCharge
}) => {
  const { addFixedCharge, updateFixedCharge } = useBuildingStore();
  const { t, isRtl } = useLanguageStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FixedChargeCategory>('salary');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [payee, setPayee] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCharge) {
      setTitle(initialCharge.title);
      setCategory(initialCharge.category);
      setAmount(initialCharge.monthlyAmount.toString());
      setFrequency(initialCharge.frequency || 'monthly');
      setPayee(initialCharge.payee || '');
      setNotes(initialCharge.notes || '');
    } else {
      setTitle('');
      setCategory('salary');
      setAmount('');
      setFrequency('monthly');
      setPayee('');
      setNotes('');
    }
    setError(null);
  }, [initialCharge, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (!title.trim()) {
      setError(t.fixed_charges.title_placeholder);
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(t.fixed_charges.amount_placeholder);
      return;
    }

    if (initialCharge) {
      await updateFixedCharge(buildingId, initialCharge.id, {
        title: title.trim(),
        category,
        monthlyAmount: parsedAmount,
        frequency,
        payee: payee.trim() || undefined,
        notes: notes.trim() || undefined
      });
    } else {
      await addFixedCharge(buildingId, {
        title: title.trim(),
        category,
        monthlyAmount: parsedAmount,
        frequency,
        payee: payee.trim() || undefined,
        notes: notes.trim() || undefined,
        isPaidThisMonth: false
      });
    }

    onClose();
  };

  const categories: { id: FixedChargeCategory; label: string; icon: any }[] = [
    { id: 'salary', label: t.fixed_charges.cat_salary, icon: UserCheck },
    { id: 'contract', label: t.fixed_charges.cat_contract, icon: FileText },
    { id: 'utility', label: t.fixed_charges.cat_utility, icon: Zap },
    { id: 'maintenance', label: t.fixed_charges.cat_maintenance, icon: Wrench },
    { id: 'other', label: t.fixed_charges.cat_other, icon: Coins },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {initialCharge ? t.fixed_charges.modal_edit_title : t.fixed_charges.modal_add_title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.fixed_charges.modal_add_desc}
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
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t.fixed_charges.category_label}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map(cat => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title / Designation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.fixed_charges.title_label} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.fixed_charges.title_placeholder}
              required
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Amount & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.fixed_charges.amount_label} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t.fixed_charges.amount_placeholder}
                  required
                  min={0}
                  step={500}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                  DA
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.fixed_charges.frequency_label}
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="monthly">{t.fixed_charges.freq_monthly}</option>
                <option value="quarterly">{t.fixed_charges.freq_quarterly}</option>
                <option value="annual">{t.fixed_charges.freq_annual}</option>
              </select>
            </div>
          </div>

          {/* Payee / Provider */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.fixed_charges.payee_label}
            </label>
            <input
              type="text"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              placeholder={t.fixed_charges.payee_placeholder}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Notes / Contract Reference */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.fixed_charges.notes_label}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.fixed_charges.notes_placeholder}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{t.fixed_charges.save_btn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
