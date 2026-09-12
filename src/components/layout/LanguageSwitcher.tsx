import React from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { LANGUAGE_OPTIONS } from '../../i18n/translations';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false }) => {
  const { currentLanguage, setLanguage } = useLanguageStore();

  return (
    <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-full border border-slate-200 dark:border-slate-700/80 shadow-inner">
      <div className="flex items-center gap-1 text-xs font-medium">
        {LANGUAGE_OPTIONS.map((opt, idx) => {
          const isActive = currentLanguage === opt.code;
          return (
            <React.Fragment key={opt.code}>
              {idx > 0 && <span className="w-px h-3 bg-slate-200 dark:bg-slate-700"></span>}
              <button
                onClick={() => setLanguage(opt.code)}
                className={`px-2.5 py-1 rounded-full transition-all text-[11px] ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-extrabold shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title={opt.label}
              >
                <span>{opt.code.toUpperCase()}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
