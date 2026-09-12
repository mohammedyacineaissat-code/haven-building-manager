import React, { useState, useEffect } from 'react';
import { X, Calculator, Receipt, AlertCircle } from 'lucide-react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle?: string;
  defaultAmount?: number | '';
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ 
  isOpen, 
  onClose,
  defaultTitle = '',
  defaultAmount = ''
}) => {
  const { addNotice, buildings, activeBuildingId } = useBuildingStore();
  const { t } = useLanguageStore();
  
  const [expenseTitle, setExpenseTitle] = useState(defaultTitle);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [totalCost, setTotalCost] = useState(defaultAmount ? String(defaultAmount) : '');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync state whenever modal opens or default values change
  useEffect(() => {
    if (isOpen) {
      setExpenseTitle(defaultTitle);
      setTotalCost(defaultAmount ? String(defaultAmount) : '');
      setExpenseDescription('');
      setValidationError(null);
    }
  }, [isOpen, defaultTitle, defaultAmount]);

  if (!isOpen) return null;

  const currentBuilding = buildings.find(b => b.id === activeBuildingId) || buildings[0];
  const totalUnits = currentBuilding?.totalUnits || 30;

  const costNum = parseFloat(totalCost) || 0;
  const perResident = totalUnits > 0 && costNum > 0 ? (costNum / totalUnits) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!expenseTitle.trim()) {
      setValidationError('Veuillez saisir l\'intitulé de la dépense partagée.');
      return;
    }

    if (costNum <= 0) {
      setValidationError('Le montant total doit être supérieur à 0 DZD.');
      return;
    }

    addNotice({
      buildingId: currentBuilding?.id,
      title: expenseTitle.trim(),
      content: expenseDescription.trim() || `Frais partagés de copropriété répartis équitablement entre les ${totalUnits} appartements de la résidence.`,
      category: 'expense',
      author: 'Bureau du Syndic',
      isPinned: true,
      expenseDetails: {
        totalAmount: costNum,
        perResidentAmount: Number(perResident.toFixed(2))
      }
    });
    
    setExpenseTitle('');
    setExpenseDescription('');
    setTotalCost('');
    setValidationError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#101828] rounded-[28px] w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 transition-colors">
        
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Publier une Dépense Partagée
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calcul automatique de la quote-part pour {currentBuilding?.name || 'la résidence'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Intitulé de la Dépense <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              placeholder="ex: Ravitaillement Citerne 15 000L, Réparation Serrure..."
              className="w-full bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Détails & Justificatif (optionnel)
            </label>
            <textarea
              rows={2}
              value={expenseDescription}
              onChange={(e) => setExpenseDescription(e.target.value)}
              placeholder="Précisez le fournisseur, numéro de facture, date d'intervention..."
              className="w-full bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Montant Total de la Facture (DZD) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="any"
                required
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                placeholder="ex: 7500"
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors font-mono"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                DA
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Calculator className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Calcul de la Quote-Part</span>
            </div>
            
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-emerald-800 dark:text-emerald-400 tracking-tight font-mono">
                {perResident > 0 ? perResident.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                <span className="text-xs font-bold ml-1 text-emerald-700 dark:text-emerald-400">DA / unité</span>
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400/80 font-semibold">
                Pour {totalUnits} appartements
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all active:scale-95 shadow-emerald-600/20"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Publier aux Résidents</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
