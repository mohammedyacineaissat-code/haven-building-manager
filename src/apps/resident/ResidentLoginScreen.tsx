import React, { useState } from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { LanguageSwitcher } from '../../components/layout/LanguageSwitcher';
import { 
  Building2, 
  ArrowRight, 
  Lock, 
  Phone, 
  MapPin, 
  Search, 
  Check,
  UserPlus,
  LogIn,
  AlertCircle,
  KeyRound,
  Home,
  CheckCircle2
} from 'lucide-react';

interface ResidentLoginScreenProps {
  isStandalone?: boolean;
}

type AuthMode = 'signup' | 'login';

export const ResidentLoginScreen: React.FC<ResidentLoginScreenProps> = ({ 
  isStandalone = false 
}) => {
  const { 
    buildings, 
    registerResident, 
    loginResidentWithCredentials, 
    registeredAccounts 
  } = useBuildingStore();
  
  const { t, isRtl } = useLanguageStore();

  const [authMode, setAuthMode] = useState<AuthMode>('signup');

  // Building selection & search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(
    buildings[0]?.id || ''
  );

  React.useEffect(() => {
    if (buildings.length > 0 && (!selectedBuildingId || !buildings.some(b => b.id === selectedBuildingId))) {
      setSelectedBuildingId(buildings[0].id);
    }
  }, [buildings, selectedBuildingId]);

  // Sign Up Form Fields (No dummy hardcoded values)
  const [signupLastName, setSignupLastName] = useState('');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupFloor, setSignupFloor] = useState('');
  const [signupAptNumber, setSignupAptNumber] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Login Form Fields
  const [loginAptNumber, setLoginAptNumber] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Status & Validation
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId) || buildings[0];

  const handleSelectBuilding = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setGeneralError(null);
  };

  // Sign Up Handler
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    const errors: { [key: string]: string } = {};

    if (!signupLastName.trim()) {
      errors.lastName = t.login.family_name_error;
    }
    if (!signupFloor.trim()) {
      errors.floor = t.login.floor_error;
    }
    if (!signupAptNumber.trim()) {
      errors.aptNumber = t.login.apt_error;
    }
    
    const cleanPhone = signupPhone.replace(/[\s.-]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      errors.phone = t.login.phone_error;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const res = await registerResident({
      lastName: signupLastName.trim(),
      firstName: signupFirstName.trim() || undefined,
      buildingId: selectedBuilding.id,
      floor: signupFloor.trim(),
      aptNumber: signupAptNumber.trim(),
      phone: signupPhone.trim(),
      password: signupPassword.trim() || signupPhone.trim(),
      joinedAt: new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    });

    setIsSubmitting(false);

    if (!res.success) {
      setGeneralError(res.message || 'Erreur lors de la création du compte.');
    }
  };

  // Login Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    const errors: { [key: string]: string } = {};

    if (!loginAptNumber.trim()) {
      errors.loginApt = t.login.apt_error;
    }
    if (!loginPassword.trim()) {
      errors.loginPass = t.common.required;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const res = await loginResidentWithCredentials(
      selectedBuilding.id,
      loginAptNumber.trim(),
      loginPassword.trim()
    );

    setIsSubmitting(false);

    if (!res.success) {
      setGeneralError(res.message || 'Identifiants introuvables.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto elevate-card min-h-[760px] p-6 sm:p-8 flex flex-col justify-between font-sans transition-colors duration-300">
      
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-black text-base shadow-sm">
              H
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Haven</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block -mt-0.5">Espace Résidents</span>
            </div>
          </div>

          <LanguageSwitcher compact />
        </div>

        {/* Welcome Text */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {authMode === 'signup' ? t.login.signup_title : t.login.login_title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {authMode === 'signup' 
              ? t.login.signup_subtitle
              : t.login.login_subtitle}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex rounded-full bg-slate-100 dark:bg-slate-800/80 p-1 mb-5 border border-slate-200/70 dark:border-slate-700/70">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setGeneralError(null);
              setFieldErrors({});
            }}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'signup'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.login.signup_tab}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setGeneralError(null);
              setFieldErrors({});
            }}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'login'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{t.login.login_tab}</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {generalError && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{generalError}</span>
              {authMode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setGeneralError(null);
                  }}
                  className={`block mt-1.5 font-bold text-blue-700 hover:underline ${isRtl ? 'text-right' : 'text-left'}`}
                >
                  {t.login.create_account_link}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Residence Selector (Common to both modes) */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {t.login.residence_label.replace('*', '')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedBuildingId}
              onChange={(e) => handleSelectBuilding(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-2xl ps-10 pe-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 appearance-none"
            >
              {buildings.map((b) => {
                const addr = b.address.split(',')[1]?.trim() || b.address;
                return (
                  <option key={b.id} value={b.id}>
                    {b.name}{b.name.includes(addr) ? '' : ` (${addr})`}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* SIGN UP FORM */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
            
            {/* Apartment Number and Floor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.login.apt_label} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Home className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signupAptNumber}
                    onChange={(e) => setSignupAptNumber(e.target.value)}
                    placeholder="ex: 1402 ou 14"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl ps-8 pe-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
                {fieldErrors.aptNumber && (
                  <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{fieldErrors.aptNumber}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.login.floor_label} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={signupFloor}
                  onChange={(e) => setSignupFloor(e.target.value)}
                  placeholder="0 pour RDC, 1, 2..."
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 placeholder-slate-400 dark:placeholder-slate-500"
                />
                {fieldErrors.floor && (
                  <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{fieldErrors.floor}</span>
                )}
              </div>
            </div>

            {/* Resident Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.login.family_name_label} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={signupLastName}
                  onChange={(e) => setSignupLastName(e.target.value)}
                  placeholder=""
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                />
                {fieldErrors.lastName && (
                  <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{fieldErrors.lastName}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.login.first_name_label} ({t.common.optional})
                </label>
                <input
                  type="text"
                  value={signupFirstName}
                  onChange={(e) => setSignupFirstName(e.target.value)}
                  placeholder="ex: Amine"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>

            {/* Mobile Phone Number (Verification & Default Password) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.login.phone_label} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="ex: 0667 12 34 56"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl ps-8 pe-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {t.login.login_phone_hint}
              </p>
              {fieldErrors.phone && (
                <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{fieldErrors.phone}</span>
              )}
            </div>

            {/* Optional Custom Password / PIN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.login.password_label || 'Mot de passe (Optionnel)'}
              </label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder={t.login.password_placeholder || 'Créer un mot de passe'}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl ps-8 pe-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 elevate-button-primary text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{t.login.create_account_btn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

        {/* LOGIN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.login.login_apt_label}
              </label>
              <div className="relative">
                <Home className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginAptNumber}
                  onChange={(e) => setLoginAptNumber(e.target.value)}
                  placeholder="ex: 1402"
                  className="w-full elevate-input text-xs sm:text-sm font-bold ps-10"
                />
              </div>
              {fieldErrors.loginApt && (
                <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{fieldErrors.loginApt}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.login.login_password_label}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={t.login.login_password_placeholder}
                  className="w-full elevate-input text-xs sm:text-sm font-bold ps-10"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {t.login.login_phone_hint}
              </p>
              {fieldErrors.loginPass && (
                <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{fieldErrors.loginPass}</span>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 elevate-button-primary text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{t.login.login_btn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

      </div>

      {/* Footer Info */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
        {authMode === 'signup' ? (
          <p>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setGeneralError(null);
              }}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              {t.login.switch_to_login}
            </button>
          </p>
        ) : (
          <p>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setGeneralError(null);
              }}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              {t.login.switch_to_signup}
            </button>
          </p>
        )}
      </div>

    </div>
  );
};
