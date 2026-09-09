import React, { useState, useEffect } from 'react';
import { AppLauncher, AppViewMode } from './components/layout/AppLauncher';
import { ResidentApp } from './apps/resident/ResidentApp';
import { ManagerApp } from './apps/manager/ManagerApp';
import { useBuildingStore } from './store/useBuildingStore';
import { useLanguageStore } from './store/useLanguageStore';
import { useThemeStore } from './store/useThemeStore';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export function App() {
  const { currentRole, setRole, initializeData } = useBuildingStore();
  const { t } = useLanguageStore();
  const { initTheme } = useThemeStore();
  const targetApp = import.meta.env.VITE_APP_TARGET as 'resident' | 'manager' | undefined;

  const [viewMode, setViewMode] = useState<AppViewMode>(
    targetApp ? targetApp : (currentRole === 'manager' ? 'manager' : 'resident')
  );
  const [isStandaloneMode, setIsStandaloneMode] = useState(!!targetApp);
  const [isUrlStandalone, setIsUrlStandalone] = useState(false);
  const isHardcodedTarget = !!targetApp;

  // Initialize store and check URL parameters on load
  useEffect(() => {
    initializeData();
    initTheme();

    // Native App Initialization (Capacitor)
    if (Capacitor.isNativePlatform()) {
      const initNativeApp = async () => {
        try {
          // Force a dark or light style for the status bar depending on the theme. 
          // For now, setting to default light style or based on dark mode.
          const isDark = document.documentElement.classList.contains('dark');
          await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
          
          // Optionally set the status bar background color
          if (Capacitor.getPlatform() === 'android') {
            await StatusBar.setBackgroundColor({ color: isDark ? '#020617' : '#f8fafc' }); // slate-950 or slate-50
          }
          
          // Hide splash screen after our app mounts
          await SplashScreen.hide();
        } catch (e) {
          console.warn('Native plugin error:', e);
        }
      };
      initNativeApp();
    }

    if (typeof window !== 'undefined' && !isHardcodedTarget) {
      const params = new URLSearchParams(window.location.search);
      const appParam = params.get('app');
      const standaloneParam = params.get('standalone');

      if (appParam === 'resident') {
        setRole('resident');
        setViewMode('resident');
      } else if (appParam === 'manager') {
        setRole('manager');
        setViewMode('manager');
      }

      if (standaloneParam === 'true' || standaloneParam === '1') {
        setIsStandaloneMode(true);
        setIsUrlStandalone(true);
        if (appParam === 'manager') {
          setViewMode('manager');
        } else {
          setViewMode('resident');
        }
      }
    }
  }, [initializeData, setRole, initTheme]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-300">
      
      {/* If accessed via standalone URL (e.g. for PWA / Android TWA / APK), provide subtle exit button */}
      {isUrlStandalone ? (
        <div className="w-full max-w-2xl mx-auto my-2 flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-gray-900">
              {t.app.standalone_label} {viewMode === 'resident' ? t.platform.resident_app : t.platform.manager_suite}
            </span>
          </div>
          <button
            onClick={() => {
              window.history.replaceState({}, '', window.location.pathname);
              setIsUrlStandalone(false);
              setIsStandaloneMode(false);
            }}
            className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline"
          >
            {t.app.exit_standalone}
          </button>
        </div>
      ) : (
        <AppLauncher 
          viewMode={viewMode}
          onSelectViewMode={(mode) => {
            setViewMode(mode);
            setRole(mode);
          }}
          isStandaloneMode={isStandaloneMode}
          onToggleStandalone={() => setIsStandaloneMode(!isStandaloneMode)}
        />
      )}

      {/* Main Content Area: Single App View (Resident or Manager) */}
      <main className="flex-1 flex justify-center items-start w-full py-4 sm:py-6 px-2 sm:px-4">
        {viewMode === 'resident' ? (
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-float dark:shadow-none border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden relative transition-colors duration-300">
            <ResidentApp standalone={isStandaloneMode || isUrlStandalone} />
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-float dark:shadow-none flex flex-col overflow-hidden relative border border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <ManagerApp standalone={isStandaloneMode || isUrlStandalone} />
          </div>
        )}
      </main>

      {/* Clean Minimalism Footer Bar */}
      <footer className="h-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-auto shrink-0 transition-colors duration-300">
        <div className="flex gap-4 items-center">
          <span>{t.app.footer_hotline} <strong className="text-slate-700 dark:text-slate-300">1594</strong> (SEAAL) / <strong className="text-slate-700 dark:text-slate-300">3303</strong> (Sonelgaz)</span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
          <span className="hidden sm:inline">{t.app.footer_civil_protection} <strong className="text-slate-700 dark:text-slate-300">14</strong></span>
        </div>
        <div className="flex gap-4 items-center mt-1 sm:mt-0">
          <span>{t.app.footer_version}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>{t.app.footer_copyright}</span>
        </div>
      </footer>

    </div>
  );
}

export default App;
