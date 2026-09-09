import React from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { LANGUAGE_OPTIONS } from '../../i18n/translations';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false }) => {
  const { currentLanguage, setLanguage } = useLanguageStore();

  return (
    <div className="inline-flex items-center bg-gray-100 p-1 rounded-full border border-gray-200/80">
      <div className="flex items-center gap-1 text-xs font-medium">
        {LANGUAGE_OPTIONS.map((opt, idx) => {
          const isActive = currentLanguage === opt.code;
          return (
            <React.Fragment key={opt.code}>
              {idx > 0 && <span className="w-px h-3 bg-gray-300"></span>}
              <button
                onClick={() => setLanguage(opt.code)}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  isActive
                    ? 'bg-white text-blue-600 font-bold shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
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
