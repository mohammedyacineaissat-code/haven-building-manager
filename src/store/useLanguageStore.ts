import { create } from 'zustand';
import { Language, Direction, Translations } from '../i18n/types';
import { TRANSLATIONS } from '../i18n/translations';

interface LanguageState {
  currentLanguage: Language;
  dir: Direction;
  isRtl: boolean;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('haven_language') as Language;
      if (saved && (saved === 'en' || saved === 'fr' || saved === 'ar')) {
        return saved;
      }
    } catch {
      // Ignore storage errors
    }
  }
  return 'fr'; // Default French
};

const initialLang = getInitialLanguage();
const initialDir: Direction = initialLang === 'ar' ? 'rtl' : 'ltr';

if (typeof document !== 'undefined') {
  document.documentElement.dir = initialDir;
  document.documentElement.lang = initialLang;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  currentLanguage: initialLang,
  dir: initialDir,
  isRtl: initialDir === 'rtl',
  t: TRANSLATIONS[initialLang],

  setLanguage: (lang: Language) => {
    const isRtl = lang === 'ar';
    const dir: Direction = isRtl ? 'rtl' : 'ltr';

    if (typeof document !== 'undefined') {
      document.documentElement.dir = dir;
      document.documentElement.lang = lang;
    }

    try {
      localStorage.setItem('haven_language', lang);
    } catch {
      // Ignore storage errors in sandbox
    }

    set({
      currentLanguage: lang,
      dir,
      isRtl,
      t: TRANSLATIONS[lang],
    });
  },
}));
