import React, { useEffect } from 'react';
import { ResidentApp } from './apps/resident/ResidentApp';
import { ManagerApp } from './apps/manager/ManagerApp';
import { useBuildingStore } from './store/useBuildingStore';
import { useLanguageStore } from './store/useLanguageStore';
import { useThemeStore } from './store/useThemeStore';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import { DeviceFrame } from './components/layout/DeviceFrame';
import { ThemeToggle } from './components/layout/ThemeToggle';
import { LanguageSwitcher } from './components/layout/LanguageSwitcher';

export function App() {
  const { initializeData } = useBuildingStore();
  const { t } = useLanguageStore();
  const { initTheme } = useThemeStore();
  
  // We remove the viewMode logic to just display both in device frames simultaneously on desktop preview

  // Initialize store and check URL parameters on load
  useEffect(() => {
    initializeData();
    initTheme();

    // Native App Initialization (Capacitor)
    if (Capacitor.isNativePlatform()) {
      const initNativeApp = async () => {
        try {
          const isDark = document.documentElement.classList.contains('dark');
          await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
          if (Capacitor.getPlatform() === 'android') {
            await StatusBar.setBackgroundColor({ color: isDark ? '#020617' : '#f8fafc' });
          }
          await SplashScreen.hide();
        } catch (e) {
          console.warn('Native plugin error:', e);
        }
      };
      initNativeApp();
    }
  }, [initializeData, initTheme]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-300">
      
      {/* Sleek Preview Header */}
      <header className="w-full h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-30 sticky top-0 transition-colors duration-300 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-extrabold flex items-center justify-center shadow-md">
            H
          </div>
          <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            Haven Preview
          </span>
          <span className="ml-2 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] uppercase font-bold rounded-full tracking-wider border border-emerald-200 dark:border-emerald-500/30">
            Dual Build
          </span>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 px-2 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-2 uppercase tracking-wide">Theme</span>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <ThemeToggle />
            </div>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>
          <LanguageSwitcher compact />
        </div>
      </header>

      {/* Main Content Area: Side-by-side Device Frames */}
      <main className="flex-1 flex flex-col lg:flex-row justify-center items-center gap-12 lg:gap-24 w-full py-12 px-4 overflow-y-auto">
        <DeviceFrame title={t.platform.resident_app}>
          <ResidentApp standalone={true} />
        </DeviceFrame>
        
        <DeviceFrame title={t.platform.manager_suite}>
          <ManagerApp standalone={true} />
        </DeviceFrame>
      </main>

      {/* Clean Minimalism Footer Bar */}
      <footer className="h-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-8 flex items-center justify-center text-[11px] text-slate-500 dark:text-slate-400 mt-auto shrink-0 transition-colors duration-300">
        <div className="flex gap-4 items-center">
          <span>{t.app.footer_version}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>{t.app.footer_copyright}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
