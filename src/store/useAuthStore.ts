import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { ResidentProfile, ManagerProfile, UserRole } from '../types/building';
import { cleanStr, cleanDigits, cleanApt, generateUUID, toAuthPassword, safeGetItem, safeSetItem, safeRemoveItem, isOnline } from './utils';

// ── Persisted Session Loaders ─────────────────────────────────────────
const getSavedRegisteredAccounts = (): ResidentProfile[] => safeGetItem('haven_registered_accounts', []);
const getSavedResidentSession = (): ResidentProfile | null => safeGetItem('haven_saved_resident_profile', null);
const getSavedRegisteredManagers = (): ManagerProfile[] => safeGetItem('haven_registered_managers', []);
const getSavedManagerSession = (): ManagerProfile | null => safeGetItem('haven_saved_manager_profile', null);

const initialSavedProfile = getSavedResidentSession();
const initialSavedManager = getSavedManagerSession();

// ── Auth Store Interface ──────────────────────────────────────────────
interface AuthState {
  currentRole: UserRole;
  userApartment: string;
  residentProfile: ResidentProfile | null;
  registeredAccounts: ResidentProfile[];
  managerProfile: ManagerProfile | null;
  registeredManagers: ManagerProfile[];

  // Actions
  setRole: (role: UserRole) => void;
  setRegisteredAccounts: (accounts: ResidentProfile[]) => void;
  setRegisteredManagers: (managers: ManagerProfile[]) => void;
  registerResident: (accountData: ResidentProfile) => Promise<{ success: boolean; message?: string }>;
  loginResidentWithCredentials: (buildingId: string, aptNumber: string, passwordOrPhone: string) => Promise<{ success: boolean; message?: string }>;
  loginResident: (profile: ResidentProfile) => Promise<void>;
  logoutResident: () => void;
  registerManager: (data: { name: string; emailOrPhone: string; password: string; agencyName?: string }) => Promise<{ success: boolean; message?: string }>;
  loginManager: (emailOrPhone: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logoutManager: () => void;
}

// ── Auth Store ────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set, get) => ({
  currentRole: 'resident',
  userApartment: initialSavedProfile ? `Apt ${initialSavedProfile.aptNumber} (Étage ${initialSavedProfile.floor})` : '',
  residentProfile: initialSavedProfile,
  registeredAccounts: getSavedRegisteredAccounts(),
  managerProfile: initialSavedManager,
  registeredManagers: getSavedRegisteredManagers(),

  setRole: (role: UserRole) => set({ currentRole: role }),

  setRegisteredAccounts: (accounts: ResidentProfile[]) => set({ registeredAccounts: accounts }),

  setRegisteredManagers: (managers: ManagerProfile[]) => set({ registeredManagers: managers }),

  registerResident: async (accountData: ResidentProfile) => {
    const cleanAptNum = accountData.aptNumber.trim();
    const cleanPhone = accountData.phone.trim();
    const cleanPwd = accountData.password?.trim() || cleanPhone;
    const joinedStr = new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

    if (!isOnline()) {
      // Offline registration — local only
      const newProfile: ResidentProfile = {
        id: generateUUID(),
        lastName: accountData.lastName.trim(),
        firstName: accountData.firstName?.trim() || '',
        buildingId: accountData.buildingId,
        floor: accountData.floor.trim(),
        aptNumber: cleanAptNum,
        phone: cleanPhone,
        joinedAt: joinedStr
      };
      const updatedAccounts = [newProfile, ...get().registeredAccounts];
      set({
        currentRole: 'resident',
        registeredAccounts: updatedAccounts,
        residentProfile: newProfile,
        userApartment: `Apt ${newProfile.aptNumber} (Étage ${newProfile.floor})`,
      });
      safeSetItem('haven_saved_resident_profile', newProfile);
      safeSetItem('haven_registered_accounts', updatedAccounts);
      return { success: true };
    }

    try {
      // 1. Check if an account already exists for this building & apartment
      const { data: existing } = await supabase
        .from('residents')
        .select('id')
        .eq('building_id', accountData.buildingId)
        .eq('apt_number', cleanAptNum);

      if (existing && existing.length > 0) {
        return {
          success: false,
          message: `Un compte existe déjà pour l'appartement ${cleanAptNum} dans cette résidence.`
        };
      }

      // 2. Register with Supabase Auth
      let authUserId: string | null = null;
      try {
        const authEmail = `${cleanDigits(cleanPhone) || cleanPhone}@haven.dz`;
        const authPassword = toAuthPassword(cleanPwd);
        const { data: authData } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              first_name: accountData.firstName?.trim() || '',
              last_name: accountData.lastName.trim(),
              phone: cleanPhone,
              building_id: accountData.buildingId,
              floor: accountData.floor.trim(),
              apt_number: cleanAptNum,
              role: 'resident'
            }
          }
        });

        if (authData?.user?.id) {
          authUserId = authData.user.id;
          await supabase.from('profiles').upsert({
            id: authUserId,
            role: 'resident',
            first_name: accountData.firstName?.trim() || '',
            last_name: accountData.lastName.trim(),
            phone: cleanPhone
          });
        }
      } catch (authErr) {
        console.warn('Supabase Auth resident signUp note:', authErr);
      }

      // 3. Insert into residents table (NO password field — security fix)
      const insertPayload: Record<string, unknown> = {
        last_name: accountData.lastName.trim(),
        first_name: accountData.firstName?.trim() || '',
        building_id: accountData.buildingId,
        floor: accountData.floor.trim(),
        apt_number: cleanAptNum,
        phone: cleanPhone,
        joined_at: joinedStr
      };
      if (authUserId) {
        insertPayload.id = authUserId;
      }

      const { data: newRes, error: errInsert } = await supabase
        .from('residents')
        .insert(insertPayload)
        .select()
        .single();

      if (errInsert || !newRes) {
        console.error('Supabase insert error:', errInsert);
        return {
          success: false,
          message: 'Erreur lors de la création du compte sur le serveur.'
        };
      }

      // 4. Update local state
      const registeredProfile: ResidentProfile = {
        id: newRes.id,
        lastName: newRes.last_name,
        firstName: newRes.first_name,
        buildingId: newRes.building_id,
        floor: newRes.floor,
        aptNumber: newRes.apt_number,
        phone: newRes.phone,
        joinedAt: newRes.joined_at || joinedStr
      };

      const updatedAccounts = [registeredProfile, ...get().registeredAccounts];

      set({
        currentRole: 'resident',
        registeredAccounts: updatedAccounts,
        residentProfile: registeredProfile,
        userApartment: `Apt ${registeredProfile.aptNumber} (Étage ${registeredProfile.floor})`,
      });

      safeSetItem('haven_saved_resident_profile', registeredProfile);

      return { success: true };
    } catch (err) {
      console.error('Registration failed:', err);
      return { success: false, message: 'Erreur de connexion au serveur.' };
    }
  },

  loginResidentWithCredentials: async (buildingId: string, aptNumber: string, passwordOrPhone: string) => {
    const targetApt = cleanStr(aptNumber);

    if (!isOnline()) {
      // Offline login — match against local registered accounts
      const localAccounts = get().registeredAccounts;
      const account = localAccounts.find(a =>
        a.buildingId === buildingId && (
          cleanStr(a.aptNumber) === targetApt ||
          cleanStr(`apt ${a.aptNumber}`) === targetApt ||
          targetApt.endsWith(cleanStr(a.aptNumber))
        )
      );
      if (!account) {
        return { success: false, message: 'Aucun compte trouvé localement pour cet appartement.' };
      }
      const enteredDigits = cleanDigits(passwordOrPhone);
      const accountDigits = cleanDigits(account.phone);
      if (
        (enteredDigits.length >= 4 && accountDigits.endsWith(enteredDigits)) ||
        cleanStr(passwordOrPhone) === cleanStr(account.phone)
      ) {
        const profile = { ...account };
        set({
          currentRole: 'resident',
          residentProfile: profile,
          userApartment: `Apt ${profile.aptNumber} (Étage ${profile.floor})`,
        });
        safeSetItem('haven_saved_resident_profile', profile);
        return { success: true };
      }
      return { success: false, message: 'Numéro de téléphone incorrect.' };
    }

    try {
      const { data: residents, error } = await supabase
        .from('residents')
        .select('*')
        .eq('building_id', buildingId);

      if (error || !residents || residents.length === 0) {
        return { success: false, message: 'Aucun compte trouvé pour cette résidence.' };
      }

      const account = residents.find((a: Record<string, string>) =>
        cleanStr(a.apt_number) === targetApt ||
        cleanStr(`apt ${a.apt_number}`) === targetApt ||
        targetApt.endsWith(cleanStr(a.apt_number))
      );

      if (!account) {
        return {
          success: false,
          message: `Aucun compte trouvé pour l'appartement "${aptNumber}" dans cette résidence.`
        };
      }

      let isMatch = false;

      // 1. Phone number match (fast-login fallback)
      const enteredSecretDigits = cleanDigits(passwordOrPhone);
      const enteredSecretRaw = cleanStr(passwordOrPhone);
      const accountPhoneDigits = cleanDigits(account.phone);

      if (
        (enteredSecretDigits.length >= 4 && accountPhoneDigits.endsWith(enteredSecretDigits)) ||
        (enteredSecretRaw === cleanStr(account.phone))
      ) {
        isMatch = true;
      }

      // 2. Supabase Auth password login
      if (!isMatch) {
        const authEmail = `${accountPhoneDigits || cleanStr(account.phone)}@haven.dz`;
        const { data: authData } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: toAuthPassword(passwordOrPhone.trim())
        });

        if (authData?.user) {
          isMatch = true;
        }
      }

      if (!isMatch) {
        return {
          success: false,
          message: `Mot de passe ou numéro de téléphone incorrect pour l'appartement ${account.apt_number}.`
        };
      }

      const profile: ResidentProfile = {
        id: account.id,
        lastName: account.last_name,
        firstName: account.first_name || '',
        buildingId: account.building_id,
        floor: account.floor,
        aptNumber: account.apt_number,
        phone: account.phone,
        joinedAt: account.joined_at || 'Récemment'
      };

      const currentAccounts = get().registeredAccounts.filter(
        a => !(a.buildingId === profile.buildingId && cleanApt(a.aptNumber) === cleanApt(profile.aptNumber))
      );
      const updatedAccounts = [profile, ...currentAccounts];

      set({
        currentRole: 'resident',
        residentProfile: profile,
        registeredAccounts: updatedAccounts,
        userApartment: `Apt ${profile.aptNumber} (Étage ${profile.floor})`,
      });

      safeSetItem('haven_saved_resident_profile', profile);

      return { success: true };
    } catch (err) {
      console.error('Login failed:', err);
      return { success: false, message: 'Erreur de connexion au serveur.' };
    }
  },

  loginResident: async (profile: ResidentProfile) => {
    set({
      currentRole: 'resident',
      residentProfile: profile,
      userApartment: `Apt ${profile.aptNumber} (Étage ${profile.floor})`,
    });
    safeSetItem('haven_saved_resident_profile', profile);
  },

  logoutResident: () => {
    supabase.auth.signOut().catch(() => {});
    const token = typeof window !== 'undefined' ? localStorage.getItem('haven_session_token') : null;
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
      safeRemoveItem('haven_session_token');
    }
    set({ currentRole: 'resident', residentProfile: null, userApartment: '' });
    safeRemoveItem('haven_saved_resident_profile');
  },

  registerManager: async (data) => {
    const cleanIdentifier = data.emailOrPhone.trim().toLowerCase();
    const cleanPwd = data.password.trim();
    const currentManagers = get().registeredManagers;

    const existing = currentManagers.find(m => m.emailOrPhone.trim().toLowerCase() === cleanIdentifier);
    if (existing) {
      return { success: false, message: 'Un compte avec cet identifiant existe déjà.' };
    }

    let authUserId: string | null = null;

    if (isOnline()) {
      const authEmail = cleanIdentifier.includes('@')
        ? cleanIdentifier
        : `${cleanDigits(cleanIdentifier) || cleanIdentifier}@haven.dz`;
      const authPassword = toAuthPassword(cleanPwd);

      try {
        const { data: authData } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              name: data.name.trim(),
              agency_name: data.agencyName?.trim() || '',
              phone: cleanIdentifier,
              role: 'manager'
            }
          }
        });

        if (authData?.user?.id) {
          authUserId = authData.user.id;
          const nameParts = data.name.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || data.name.trim();

          await supabase.from('profiles').upsert({
            id: authUserId,
            role: 'manager',
            first_name: firstName,
            last_name: lastName,
            phone: cleanIdentifier
          });
        }
      } catch (authErr) {
        console.warn('Supabase Auth manager signUp note:', authErr);
      }
    }

    const newId = authUserId || generateUUID();
    const newManager: ManagerProfile = {
      id: newId,
      name: data.name.trim(),
      emailOrPhone: cleanIdentifier,
      agencyName: data.agencyName?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    const updated = [newManager, ...currentManagers.filter(m => m.emailOrPhone.trim().toLowerCase() !== cleanIdentifier)];
    set({
      currentRole: 'manager',
      registeredManagers: updated,
      managerProfile: newManager,
    });

    safeSetItem('haven_registered_managers', updated);
    safeSetItem('haven_saved_manager_profile', newManager);

    return { success: true };
  },

  loginManager: async (emailOrPhone: string, password: string) => {
    const cleanIdentifier = emailOrPhone.trim().toLowerCase();
    const cleanPwd = password.trim();

    // 1. Try Supabase Auth
    if (isOnline()) {
      try {
        const authEmail = cleanIdentifier.includes('@')
          ? cleanIdentifier
          : `${cleanDigits(cleanIdentifier) || cleanIdentifier}@haven.dz`;
        const authPassword = toAuthPassword(cleanPwd);

        const { data: authIn, error: authInErr } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });

        if (!authInErr && authIn?.user) {
          const userMeta = authIn.user.user_metadata || {};
          const profile: ManagerProfile = {
            id: authIn.user.id,
            name: userMeta.name || 'Gestionnaire Syndic',
            emailOrPhone: cleanIdentifier,
            agencyName: userMeta.agency_name || '',
            createdAt: authIn.user.created_at || new Date().toISOString()
          };
          set({ currentRole: 'manager', managerProfile: profile });
          safeSetItem('haven_saved_manager_profile', profile);
          return { success: true };
        }
      } catch {
        // Continue to local check
      }
    }

    // 2. Fallback to local managers (phone match only — no plaintext passwords)
    const currentManagers = get().registeredManagers;
    const manager = currentManagers.find(
      m => m.emailOrPhone.trim().toLowerCase() === cleanIdentifier
    );

    if (!manager) {
      return { success: false, message: 'Email/Téléphone ou mot de passe incorrect.' };
    }

    // In offline mode, allow login if the identifier matches (phone-based trust)
    if (!isOnline()) {
      set({ currentRole: 'manager', managerProfile: manager });
      safeSetItem('haven_saved_manager_profile', manager);
      return { success: true };
    }

    return { success: false, message: 'Email/Téléphone ou mot de passe incorrect.' };
  },

  logoutManager: () => {
    supabase.auth.signOut().catch(() => {});
    set({ currentRole: 'resident', managerProfile: null });
    safeRemoveItem('haven_saved_manager_profile');
  },
}));
