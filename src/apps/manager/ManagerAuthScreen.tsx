import React, { useState } from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { LanguageSwitcher } from '../../components/layout/LanguageSwitcher';
import { ThemeToggle } from '../../components/layout/ThemeToggle';
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  KeyRound, 
  Building2, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface ManagerAuthScreenProps {
  standalone?: boolean;
}

type AuthMode = 'login' | 'signup';

export const ManagerAuthScreen: React.FC<ManagerAuthScreenProps> = () => {
  const { registerManager, loginManager } = useBuildingStore();
  const { t, isRtl } = useLanguageStore();

  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Sign In State
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up State
  const [signupName, setSignupName] = useState('');
  const [signupEmailOrPhone, setSignupEmailOrPhone] = useState('');
  const [signupAgency, setSignupAgency] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!loginEmailOrPhone.trim() || !loginPassword.trim()) {
      setError(t.manager_auth.error_empty_fields);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginManager(loginEmailOrPhone, loginPassword);
      if (!res.success) {
        setError(res.message || t.manager_auth.error_invalid_credentials);
      }
    } catch {
      setError(t.manager_auth.error_invalid_credentials);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Sign Up Submit
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!signupName.trim() || !signupEmailOrPhone.trim() || !signupPassword.trim()) {
      setError(t.manager_auth.error_empty_fields);
      return;
    }

    if (signupPassword.length < 6) {
      setError(t.manager_auth.error_password_short);
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError(t.manager_auth.error_password_match);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerManager({
        name: signupName,
        emailOrPhone: signupEmailOrPhone,
        password: signupPassword,
        agencyName: signupAgency
      });

      if (!res.success) {
        setError(res.message || t.manager_auth.error_account_exists);
      } else {
        setSuccessMessage(t.manager_auth.success_registered);
      }
    } catch {
      setError(t.manager_auth.error_account_exists);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-elevate-bg dark:bg-elevate-bg-dark text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 font-sans">
      
      {/* Top Bar with Language & Theme Controls */}
      <div className="w-full max-w-md flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-500/20">
            H
          </div>
          <span className="text-sm font-black tracking-tight text-slate-800 dark:text-slate-200">
            HAVEN <span className="text-emerald-600 dark:text-emerald-400 font-bold">MANAGER</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher compact />
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 transition-all">
        
        {/* Header Badge & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.manager_auth.badge}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {authMode === 'login' ? t.manager_auth.login_title : t.manager_auth.signup_title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
            {authMode === 'login' ? t.manager_auth.login_subtitle : t.manager_auth.signup_subtitle}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl mb-6 border border-slate-200/50 dark:border-slate-700/50">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              authMode === 'login'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{t.manager_auth.tab_login}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              authMode === 'signup'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.manager_auth.tab_signup}</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.manager_auth.email_phone_label} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={loginEmailOrPhone}
                  onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                  placeholder={t.manager_auth.email_phone_placeholder}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-2xl ps-10 pe-4 py-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.manager_auth.password_label} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={t.manager_auth.password_placeholder}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-2xl ps-10 pe-4 py-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? t.common.loading : t.manager_auth.login_btn}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setError(null);
                }}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {t.manager_auth.switch_to_signup}
              </button>
            </div>
          </form>
        )}

        {/* SIGN UP FORM */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.manager_auth.name_label} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder={t.manager_auth.name_placeholder}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-2xl ps-10 pe-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.manager_auth.email_phone_label} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={signupEmailOrPhone}
                  onChange={(e) => setSignupEmailOrPhone(e.target.value)}
                  placeholder={t.manager_auth.email_phone_placeholder}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-2xl ps-10 pe-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.manager_auth.agency_label} <span className="text-slate-400 font-normal">({t.common.optional})</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={signupAgency}
                  onChange={(e) => setSignupAgency(e.target.value)}
                  placeholder={t.manager_auth.agency_placeholder}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-2xl ps-10 pe-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.manager_auth.password_label} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-2xl ps-10 pe-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.manager_auth.password_confirm_label} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-2xl ps-10 pe-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? t.common.loading : t.manager_auth.signup_btn}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>

            <div className="text-center pt-1.5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError(null);
                }}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {t.manager_auth.switch_to_login}
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Footer Branding */}
      <p className="mt-8 text-[11px] text-slate-400 dark:text-slate-500 text-center font-medium">
        {t.app.footer_copyright} • Haven Residential Suite
      </p>

    </div>
  );
};
