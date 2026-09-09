import React, { useState } from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { X, Building2, Plus } from 'lucide-react';

interface AddBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddBuildingModal: React.FC<AddBuildingModalProps> = ({ isOpen, onClose }) => {
  const { addBuilding } = useBuildingStore();
  const { t } = useLanguageStore();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [totalUnits, setTotalUnits] = useState(48);
  const [towersText, setTowersText] = useState('Bloc A, Bloc B');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    addBuilding({
      name: name.trim(),
      address: address.trim(),
      totalUnits: Number(totalUnits) || 20,
      towers: towersText.split(',').map(t => t.trim()).filter(Boolean),
      status: 'operational',
    });

    setName('');
    setAddress('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {t.manager_modals.add_building_title}
              </h2>
              <p className="text-xs text-slate-500">
                {t.manager_modals.add_building_desc}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.manager_modals.bldg_name}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.manager_modals.bldg_name_placeholder}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.manager_modals.address}
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t.manager_modals.address_placeholder}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.manager_modals.total_units}
              </label>
              <input
                type="number"
                value={totalUnits}
                onChange={(e) => setTotalUnits(Number(e.target.value))}
                min={1}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.manager_modals.towers}
              </label>
              <input
                type="text"
                value={towersText}
                onChange={(e) => setTowersText(e.target.value)}
                placeholder={t.manager_modals.towers_placeholder}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-transform active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.manager_modals.register_prop}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
