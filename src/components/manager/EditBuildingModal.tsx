import React, { useState, useEffect } from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Building } from '../../types/building';
import { X, Building2, Save } from 'lucide-react';

interface EditBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  building: Building | null;
}

export const EditBuildingModal: React.FC<EditBuildingModalProps> = ({ isOpen, onClose, building }) => {
  const { updateBuilding } = useBuildingStore();
  const { t, isRtl } = useLanguageStore();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [totalUnits, setTotalUnits] = useState<number | ''>('');
  const [towersText, setTowersText] = useState('');

  useEffect(() => {
    if (isOpen && building) {
      setName(building.name);
      setAddress(building.address);
      setTotalUnits(building.totalUnits);
      setTowersText(building.towers?.join(', ') || '');
    }
  }, [isOpen, building]);

  if (!isOpen || !building) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !totalUnits) return;

    updateBuilding(building.id, {
      name: name.trim(),
      address: address.trim(),
      totalUnits: Number(totalUnits) || 20,
      towers: towersText.split(',').map(t => t.trim()).filter(Boolean),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div 
        className="bg-white dark:bg-[#0F172A] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800/50 animate-in zoom-in-95 duration-200"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Modifier la Résidence</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Modifier les détails de {building.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                {t.manager_modals?.bldg_name || 'Nom de la résidence'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Résidence Les Jasmins"
                className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                {t.manager_modals?.address || 'Adresse complète'}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: 12 Rue des Oliviers, Alger"
                className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  {t.manager_modals?.total_units || 'Nombre d\'apparts'}
                </label>
                <input
                  type="number"
                  value={totalUnits}
                  onChange={(e) => setTotalUnits(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Ex: 48"
                  min="1"
                  className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  {t.manager_modals?.towers || 'Blocs'}
                </label>
                <input
                  type="text"
                  value={towersText}
                  onChange={(e) => setTowersText(e.target.value)}
                  placeholder="Ex: Bloc A, Bloc B"
                  className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {t.common?.cancel || 'Annuler'}
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !address.trim() || !totalUnits}
              className="flex-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
