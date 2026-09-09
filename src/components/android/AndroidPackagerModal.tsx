import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Package, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Terminal,
  FileCode,
  Layers,
  Sparkles
} from 'lucide-react';

interface AndroidPackagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApp: 'resident' | 'manager';
}

export const AndroidPackagerModal: React.FC<AndroidPackagerModalProps> = ({ 
  isOpen, 
  onClose,
  currentApp 
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPackagingMethod, setSelectedPackagingMethod] = useState<'capacitor' | 'twa' | 'pwa'>('capacitor');
  const [targetAppVariant, setTargetAppVariant] = useState<'resident' | 'manager'>(currentApp);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isResident = targetAppVariant === 'resident';
  const appId = isResident ? 'com.haven.resident' : 'com.haven.manager';
  const appName = isResident ? 'Haven Résidents' : 'Haven Syndic';

  const capacitorConfig = `{
  "appId": "${appId}",
  "appName": "${appName}",
  "webDir": "dist",
  "server": {
    "androidScheme": "https",
    "cleartext": true
  },
  "android": {
    "allowMixedContent": true,
    "captureInput": true,
    "backgroundColor": "${isResident ? '#F8FAFC' : '#0F172A'}"
  }
}`;

  const capacitorCommands = `# 1. Install Capacitor dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor project
npx cap init "${appName}" "${appId}" --web-dir dist

# 3. Build the production web bundle
npm run build

# 4. Add the Native Android platform
npx cap add android

# 5. Sync the web assets to the native Android directory
npx cap sync android

# 6. Open in Android Studio to build APK or run on Android emulator
npx cap open android

# (Optional) Build debug APK directly via Gradle CLI:
cd android && ./gradlew assembleDebug
# Generated APK will be in: android/app/build/outputs/apk/debug/app-debug.apk`;

  const bubblewrapCommands = `# 1. Install Google's official Bubblewrap CLI
npm install -g @bubblewrap/cli

# 2. Initialize Android TWA Project from Web App Manifest
bubblewrap init --manifest="https://your-deployed-domain.com/manifest-${targetAppVariant}.json"

# 3. Build signed APK / AAB for Google Play Store
bubblewrap build`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-blue-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Android Native Packaging & Testing
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Package each app as a standalone APK for Algerian residents or property managers
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          
          {/* Target App Switcher (Resident vs Manager Standalone) */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-2">
              Select Which Standalone App to Package
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetAppVariant('resident')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  targetAppVariant === 'resident'
                    ? 'bg-white border-blue-500 text-blue-950 shadow-sm ring-2 ring-blue-500/20 font-bold'
                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold truncate">Haven Résidents</div>
                  <div className="text-[10px] text-slate-400 truncate">com.haven.resident</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetAppVariant('manager')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  targetAppVariant === 'manager'
                    ? 'bg-white border-blue-500 text-blue-950 shadow-sm ring-2 ring-blue-500/20 font-bold'
                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold truncate">Haven Syndic</div>
                  <div className="text-[10px] text-slate-400 truncate">com.haven.manager</div>
                </div>
              </button>
            </div>
          </div>

          {/* Packaging Method Tabs */}
          <div>
            <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <span>Packaging Methods:</span>
            </div>
            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setSelectedPackagingMethod('capacitor')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                  selectedPackagingMethod === 'capacitor'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Capacitor Native (APK / AAB)
              </button>
              <button
                onClick={() => setSelectedPackagingMethod('twa')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                  selectedPackagingMethod === 'twa'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Google Play TWA
              </button>
              <button
                onClick={() => setSelectedPackagingMethod('pwa')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                  selectedPackagingMethod === 'pwa'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                WebAPK / PWA
              </button>
            </div>
          </div>

          {/* METHOD 1: CAPACITOR 6 */}
          {selectedPackagingMethod === 'capacitor' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Terminal className="w-4 h-4 text-blue-600" />
                    <span>Terminal Build Commands</span>
                  </div>
                  <button
                    onClick={() => handleCopy('cap-cmd', capacitorCommands)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1 font-bold text-[11px]"
                  >
                    {copiedId === 'cap-cmd' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'cap-cmd' ? 'Copied!' : 'Copy Commands'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {capacitorCommands}
                </pre>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <FileCode className="w-4 h-4 text-blue-600" />
                    <span>capacitor.config.json</span>
                  </div>
                  <button
                    onClick={() => handleCopy('cap-cfg', capacitorConfig)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1 font-bold text-[11px]"
                  >
                    {copiedId === 'cap-cfg' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'cap-cfg' ? 'Copied!' : 'Copy Config'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {capacitorConfig}
                </pre>
              </div>
            </div>
          )}

          {/* METHOD 2: TWA */}
          {selectedPackagingMethod === 'twa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Terminal className="w-4 h-4 text-blue-600" />
                    <span>Google Play Trusted Web Activity (Bubblewrap)</span>
                  </div>
                  <button
                    onClick={() => handleCopy('twa-cmd', bubblewrapCommands)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1 font-bold text-[11px]"
                  >
                    {copiedId === 'twa-cmd' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'twa-cmd' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {bubblewrapCommands}
                </pre>
              </div>
            </div>
          )}

          {/* METHOD 3: PWA / WebAPK */}
          {selectedPackagingMethod === 'pwa' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-950">
                <h4 className="font-bold mb-1">Instant Android Chrome WebAPK Install</h4>
                <p className="text-emerald-800 leading-relaxed">
                  When residents visit the app URL on Chrome for Android, a native install prompt will appear automatically: <em>"Ajouter Haven à l'écran d'accueil"</em>. It installs a lightweight Android APK with standalone app launcher, splash screen, and full offline caching.
                </p>
              </div>
            </div>
          )}

          {/* Direct Standalone Launch URLs */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-900 block">Standalone Direct Links:</span>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href="/?app=resident&standalone=true"
                target="_blank"
                rel="noreferrer"
                className="flex-1 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-500 flex items-center justify-between font-bold text-slate-800 hover:text-blue-600 transition-colors"
              >
                <span>Launch Standalone Resident App</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <a
                href="/?app=manager&standalone=true"
                target="_blank"
                rel="noreferrer"
                className="flex-1 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-500 flex items-center justify-between font-bold text-slate-800 hover:text-blue-600 transition-colors"
              >
                <span>Launch Standalone Manager Suite</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
