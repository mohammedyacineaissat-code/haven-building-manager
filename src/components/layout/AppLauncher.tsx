import React, { useState } from 'react';
import { Smartphone, Building2, Package } from 'lucide-react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { AndroidPackagerModal } from '../android/AndroidPackagerModal';

export type AppViewMode = 'resident' | 'manager';

interface AppLauncherProps {
  viewMode: AppViewMode;
  onSelectViewMode: (mode: AppViewMode) => void;
  isStandaloneMode?: boolean;
  onToggleStandalone?: () => void;
}

export const AppLauncher: React.FC<AppLauncherProps> = ({ 
  viewMode, 
  onSelectViewMode,
  isStandaloneMode,
  onToggleStandalone
}) => {
  const { setRole, currentRole } = useBuildingStore();
  const { t } = useLanguageStore();
  const [isPackagerOpen, setIsPackagerOpen] = useState(false);

  const handleModeChange = (mode: AppViewMode) => {
    onSelectViewMode(mode);
    if (mode === 'resident') setRole('resident');
    if (mode === 'manager') setRole('manager');
  };

  return (
    <>
      <header className="w-full h-16 bg-white/85 dark:bg-[#0D1524]/85 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0 transition-colors duration-300">
        
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-extrabold text-base flex items-center justify-center shadow-sm">
            H
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Haven</span>
          <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200/70 dark:border-emerald-500/20 hidden sm:inline-block">
            {t.app.algeria_edition}
          </span>
        </div>

        {/* Clean Segmented App Switcher */}
        <div className="flex items-center gap-2 sm:gap-4 text-sm font-medium">
          
          <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-full border border-slate-200/70 dark:border-slate-700/70">
            <button
              onClick={() => handleModeChange('resident')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'resident'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t.platform.resident_app}</span>
            </button>

            <button
              onClick={() => handleModeChange('manager')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'manager'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.platform.manager_suite}</span>
              <span className="sm:hidden">{t.platform.manager_suite}</span>
            </button>
          </div>

          {/* Android APK Modal Trigger */}
          <button
            onClick={() => setIsPackagerOpen(true)}
            className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
            title="Package as Native Android APK"
          >
            <Package className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden lg:inline">{t.app.android_apk}</span>
          </button>

          {/* Language Switcher & Theme Toggle */}
          <div className="ml-1 sm:ml-2 shrink-0 flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher compact />
          </div>

        </div>

      </header>

      <AndroidPackagerModal
        isOpen={isPackagerOpen}
        onClose={() => setIsPackagerOpen(false)}
        currentApp={currentRole}
      />
    </>
  );
};
