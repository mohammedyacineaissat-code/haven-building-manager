import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { 
  Incident, 
  Building, 
  BuildingNotice, 
  EmergencyContact, 
  StaffContact, 
  ResidentReport, 
  ResidentProfile, 
  ManagerProfile,
  FixedCharge,
  GrosTravauxProject,
  UserRole, 
  IncidentStatus 
} from '../types/building';
import { playAlertSound } from '../utils/audio';

// Default and sample residences in Algeria with matched UUIDs
export const DEFAULT_BUILDINGS: Building[] = [
  {
    id: '45ab09da-d767-4ae1-bc14-b486cdfe12b4',
    name: 'Majestic 14 (Oran)',
    address: 'Oran',
    totalUnits: 42,
    towers: ['Tour A', 'Tour B'],
    status: 'operational',
  }
];

export const DEFAULT_BUILDING: Building = DEFAULT_BUILDINGS[0];

export const DEFAULT_FIXED_CHARGES: Record<string, FixedCharge[]> = {
  '45ab09da-d767-4ae1-bc14-b486cdfe12b4': [
    {
      id: 'fc-1',
      buildingId: '45ab09da-d767-4ae1-bc14-b486cdfe12b4',
      title: 'Agent de Sécurité & Gardiennage (Poste Jour & Nuit)',
      category: 'salary',
      monthlyAmount: 38000,
      payee: 'Société Gardiennage El Amel',
      frequency: 'monthly',
      isPaidThisMonth: true,
      notes: 'Règlement régulier le 01 de chaque mois'
    },
    {
      id: 'fc-2',
      buildingId: '45ab09da-d767-4ae1-bc14-b486cdfe12b4',
      title: 'Nettoyage des Paliers, Halls et Escaliers',
      category: 'salary',
      monthlyAmount: 22000,
      payee: 'Mme Fatima (Agent d\'Entretien)',
      frequency: 'monthly',
      isPaidThisMonth: true,
      notes: '3 passages hebdomadaires + fourniture détergents'
    },
    {
      id: 'fc-3',
      buildingId: '45ab09da-d767-4ae1-bc14-b486cdfe12b4',
      title: 'Contrat Maintenance Ascenseurs (Tour A & B)',
      category: 'contract',
      monthlyAmount: 18000,
      payee: 'Schindler Ascenseurs Algérie',
      frequency: 'monthly',
      isPaidThisMonth: false,
      notes: 'Visite mensuelle préventive + astreinte dépannage 24/7'
    },
    {
      id: 'fc-4',
      buildingId: '45ab09da-d767-4ae1-bc14-b486cdfe12b4',
      title: 'Sonelgaz - Électricité des Communes & Parking',
      category: 'utility',
      monthlyAmount: 14000,
      payee: 'Sonelgaz Distribution Oran',
      frequency: 'monthly',
      isPaidThisMonth: true,
      notes: 'Compteur parties communes #482910'
    },
    {
      id: 'fc-5',
      buildingId: '45ab09da-d767-4ae1-bc14-b486cdfe12b4',
      title: 'Maintenance Surpresseur d\'Eau & Bâche à Eau',
      category: 'maintenance',
      monthlyAmount: 6000,
      payee: 'Hydro Pompes SARL',
      frequency: 'monthly',
      isPaidThisMonth: false,
      notes: 'Contrôle des pressions et étanchéité vanne'
    }
  ]
};

export const DEFAULT_GROS_TRAVAUX: Record<string, GrosTravauxProject[]> = {
  '45ab09da-d767-4ae1-bc14-b486cdfe12b4': [
    {
      id: 'gt-1',
      buildingId: '45ab09da-d767-4ae1-bc14-b486cdfe12b4',
      title: 'Réfection & Étanchéité de la Terrasse / Toiture',
      description: 'Travaux lourds d\'isolation multicouche avec membrane d\'étanchéité bitumineuse pour stopper les infiltrations d\'eau de pluie dans les derniers étages des tours A et B. Voté et validé lors de l\'Assemblée Générale Extraordinaire du 14 Août 2026. Garantie décennale incluse.',
      totalCost: 420000,
      perUnitQuota: 10000,
      deadline: '2026-10-30',
      status: 'collecting',
      contractorName: 'Entreprise BTPH El Djazair Étanchéité',
      contractorPhone: '0555 12 34 56',
      paidApts: Array.from({ length: 28 }, (_, i) => `Apt ${i + 1}`),
      createdAt: '2026-08-15'
    }
  ]
};

// Official building contacts
const STAFF_CONTACTS: StaffContact[] = [
  { 
    id: 'staff-1', 
    title: 'Syndic de Copropriété', 
    name: 'Bureau de Gestion du Syndic', 
    role: 'Administration & Gestion de la Résidence', 
    phone: '0661 00 00 00', 
    available: 'Dimanche - Jeudi: 08:30 - 17:30', 
    location: 'Bureau du Syndic (RDC)' 
  },
  { 
    id: 'staff-2', 
    title: 'Poste de Sécurité & Conciergerie', 
    name: 'Agent d\'Accueil & Sécurité', 
    role: 'Accueil, Contrôle d\'accès & Maintenance', 
    phone: '0555 00 00 00', 
    available: 'Présence continue 24/7', 
    location: 'Poste de Garde Principal' 
  }
];

// Official Algerian utility and emergency services
const CONTRACTOR_CONTACTS: EmergencyContact[] = [
  { 
    id: 'c-1', 
    title: 'SEAAL Urgence (Eau & Assainissement)', 
    role: 'Société des Eaux et de l\'Assainissement d\'Alger', 
    phone: '1594', 
    available: 'Numéro Vert 24/7', 
    icon: 'wrench' 
  },
  { 
    id: 'c-2', 
    title: 'Sonelgaz Dépannage (Électricité & Gaz)', 
    role: 'Centre d\'Appels National Sonelgaz', 
    phone: '3303', 
    available: 'Dépannage Réseau 24/7', 
    icon: 'zap' 
  },
  { 
    id: 'c-3', 
    title: 'Service Maintenance Ascenseurs', 
    role: 'Société de maintenance des ascenseurs', 
    phone: '021 00 00 00', 
    available: 'Astreinte technique 24/7', 
    icon: 'shield-alert' 
  }
];

// Load persisted accounts from storage if present
const getSavedRegisteredAccounts = (): ResidentProfile[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('haven_registered_accounts');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getSavedResidentSession = (): ResidentProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('haven_saved_resident_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getSavedRegisteredManagers = (): ManagerProfile[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('haven_registered_managers');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getSavedManagerSession = (): ManagerProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('haven_saved_manager_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getSavedFixedCharges = (): Record<string, FixedCharge[]> => {
  if (typeof window === 'undefined') return DEFAULT_FIXED_CHARGES;
  try {
    const raw = localStorage.getItem('haven_fixed_charges');
    return raw ? JSON.parse(raw) : DEFAULT_FIXED_CHARGES;
  } catch {
    return DEFAULT_FIXED_CHARGES;
  }
};

const getSavedGrosTravaux = (): Record<string, GrosTravauxProject[]> => {
  if (typeof window === 'undefined') return DEFAULT_GROS_TRAVAUX;
  try {
    const raw = localStorage.getItem('haven_gros_travaux');
    return raw ? JSON.parse(raw) : DEFAULT_GROS_TRAVAUX;
  } catch {
    return DEFAULT_GROS_TRAVAUX;
  }
};

// Normalize clean strings
const cleanStr = (val?: string) => (val || '').trim().toLowerCase();
const cleanDigits = (val?: string) => (val || '').replace(/\D/g, '');
const cleanApt = (val?: string) => (val || '').trim().toLowerCase().replace(/^apt\s*/i, '');

interface BuildingState {
  currentRole: UserRole;
  userApartment: string;
  residentProfile: ResidentProfile | null;
  registeredAccounts: ResidentProfile[];
  managerProfile: ManagerProfile | null;
  registeredManagers: ManagerProfile[];
  buildings: Building[];
  activeBuildingId: string;
  residentHomeBuildingId: string;
  activeIncidents: Incident[];
  resolvedIncidents: Incident[];
  notices: BuildingNotice[];
  staffContacts: StaffContact[];
  contractorContacts: EmergencyContact[];
  residentReports: ResidentReport[];
  finances: Record<string, { monthlyCharge: number, paidApts: string[] }>;
  fixedCharges: Record<string, FixedCharge[]>;
  grosTravauxProjects: Record<string, GrosTravauxProject[]>;
  unreadAlertCount: number;
  soundEnabled: boolean;
  isLoading: boolean;
  
  // Actions
  initializeData: () => Promise<void>;
  setRole: (role: UserRole) => void;
  setActiveBuilding: (buildingId: string) => void;
  registerResident: (accountData: ResidentProfile) => Promise<{ success: boolean; message?: string }>;
  loginResidentWithCredentials: (buildingId: string, aptNumber: string, passwordOrPhone: string) => Promise<{ success: boolean; message?: string }>;
  loginResident: (profile: ResidentProfile) => Promise<void>;
  logoutResident: () => void;
  registerManager: (data: { name: string; emailOrPhone: string; password: string; agencyName?: string }) => Promise<{ success: boolean; message?: string }>;
  loginManager: (emailOrPhone: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logoutManager: () => void;
  toggleSound: () => void;
  clearUnreadAlerts: () => void;
  
  // Database Actions
  addBuilding: (buildingData: Omit<Building, 'id'>) => Promise<void>;
  removeBuilding: (buildingId: string) => Promise<void>;
  broadcastIncident: (newIncident: any) => Promise<void>;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus, note?: string) => Promise<void>;
  addTimelineNote: (incidentId: string, note: string) => Promise<void>;
  confirmRestoration: (incidentId: string, isRestored: boolean) => Promise<void>;
  submitResidentReport: (report: any) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: 'pending' | 'in_review' | 'resolved') => Promise<void>;
  addNotice: (notice: any) => Promise<void>;
  updateFinances: (buildingId: string, monthlyCharge: number, paidApts: string[]) => Promise<void>;

  // Operating Budget & Fixed Charges Actions
  addFixedCharge: (buildingId: string, charge: Omit<FixedCharge, 'id' | 'buildingId'>) => Promise<void>;
  updateFixedCharge: (buildingId: string, chargeId: string, updates: Partial<FixedCharge>) => Promise<void>;
  deleteFixedCharge: (buildingId: string, chargeId: string) => Promise<void>;
  toggleFixedChargeSettled: (buildingId: string, chargeId: string) => Promise<void>;

  // Gros Travaux (Major Works & Exceptional Levies) Actions
  addGrosTravauxProject: (buildingId: string, project: Omit<GrosTravauxProject, 'id' | 'buildingId' | 'createdAt' | 'paidApts' | 'perUnitQuota'>) => Promise<void>;
  updateGrosTravauxProject: (buildingId: string, projectId: string, updates: Partial<GrosTravauxProject>) => Promise<void>;
  toggleGrosTravauxAptPaid: (buildingId: string, projectId: string, aptNumber: string) => Promise<void>;
  deleteGrosTravauxProject: (buildingId: string, projectId: string) => Promise<void>;
  publishGrosTravauxNotice: (buildingId: string, projectId: string) => Promise<void>;
}

const initialSavedProfile = getSavedResidentSession();
const initialSavedManager = getSavedManagerSession();

export const useBuildingStore = create<BuildingState>((set, get) => ({
  currentRole: 'resident',
  userApartment: initialSavedProfile ? `Apt ${initialSavedProfile.aptNumber} (Étage ${initialSavedProfile.floor})` : '',
  residentProfile: initialSavedProfile,
  registeredAccounts: getSavedRegisteredAccounts(),
  managerProfile: initialSavedManager,
  registeredManagers: getSavedRegisteredManagers(),
  buildings: DEFAULT_BUILDINGS,
  activeBuildingId: initialSavedProfile?.buildingId || DEFAULT_BUILDINGS[0].id,
  residentHomeBuildingId: initialSavedProfile?.buildingId || DEFAULT_BUILDINGS[0].id,
  activeIncidents: [],
  resolvedIncidents: [],
  notices: [],
  staffContacts: STAFF_CONTACTS,
  contractorContacts: CONTRACTOR_CONTACTS,
  residentReports: [],
  finances: {},
  fixedCharges: getSavedFixedCharges(),
  grosTravauxProjects: getSavedGrosTravaux(),
  unreadAlertCount: 0,
  soundEnabled: true,
  isLoading: false,

  initializeData: async () => {
    try {
      // Load buildings
      const { data: bData, error: bError } = await supabase.from('buildings').select('*');
      if (!bError && bData && bData.length > 0) {
        const formattedBuildings: Building[] = bData.map(b => ({
          id: b.id,
          name: b.name,
          address: b.address,
          totalUnits: b.total_units || 30,
          towers: Array.isArray(b.towers) ? b.towers : (b.towers ? [b.towers] : ['Tour A']),
          status: b.status || 'operational'
        }));
        
        const currentActive = get().activeBuildingId;
        const exists = formattedBuildings.some(b => b.id === currentActive);
        set({
          buildings: formattedBuildings,
          activeBuildingId: exists ? currentActive : formattedBuildings[0].id
        });
      }

      // Validate active session with backend — skip in Capacitor (no backend server)
      const isCapacitor = typeof window !== 'undefined' && (
        !!(window as any).Capacitor || 
        window.location.protocol === 'capacitor:' ||
        window.location.hostname === 'localhost' && window.location.protocol === 'https:'
      );
      const token = typeof window !== 'undefined' ? localStorage.getItem('haven_session_token') : null;
      if (token && !isCapacitor) {
        try {
          const meRes = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            if (meData.success && meData.profile) {
              const currentBldg = get().buildings.find(b => b.id === meData.profile.buildingId) || get().buildings[0] || DEFAULT_BUILDING;
              set({
                residentProfile: meData.profile,
                userApartment: `Apt ${meData.profile.aptNumber} (Étage ${meData.profile.floor})`,
                residentHomeBuildingId: meData.profile.buildingId,
                activeBuildingId: currentBldg.id
              });
            }
          }
        } catch {
          // Fallback to local profile
        }
      }

      // Fetch incidents
      const { data: incData, error: incErr } = await supabase.from('incidents').select(`*, incident_timelines(*), incident_confirmations(*)`);
      if (!incErr && incData && incData.length > 0) {
        const active: Incident[] = [];
        const resolved: Incident[] = [];

        incData.forEach(inc => {
          const formatted: Incident = {
            id: inc.id,
            buildingId: inc.building_id,
            category: inc.category || 'water',
            severity: inc.severity || 'warning',
            title: inc.title,
            description: inc.description,
            location: inc.location,
            affectedUnits: inc.affected_units || 'Tous',
            status: inc.status || 'reported',
            reportedAt: new Date(inc.reported_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            estimatedRestorationTime: inc.estimated_restoration_time || 'Sous peu',
            etaCountdownMinutes: inc.eta_countdown_minutes || 0,
            requiresResidentConfirmation: inc.requires_resident_confirmation ?? (inc.category === 'water'),
            timeline: (inc.incident_timelines || []).map((t: any) => ({
              id: t.id, 
              status: t.status, 
              label: t.label || t.status, 
              timestamp: new Date(t.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
              note: t.note, 
              author: t.author || 'Bureau du Syndic'
            })),
            confirmations: (inc.incident_confirmations || []).map((c: any) => ({
              apartment: c.unit_id || 'Résident', 
              isRestored: c.is_restored, 
              timestamp: c.created_at
            }))
          };

          if (inc.status === 'resolved') resolved.push(formatted);
          else active.push(formatted);
        });

        set({ activeIncidents: active, resolvedIncidents: resolved });
      }

      // Fetch notices
      const { data: nData, error: nErr } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
      if (!nErr && nData && nData.length > 0) {
        set({
          notices: nData.map(n => ({
            id: n.id,
            buildingId: n.building_id,
            title: n.title,
            content: n.content,
            category: n.category || 'info',
            author: n.author || 'Bureau du Syndic',
            date: new Date(n.created_at).toLocaleDateString(),
            isPinned: Boolean(n.is_pinned),
            expenseDetails: n.total_amount ? {
              totalAmount: Number(n.total_amount),
              perResidentAmount: Number(n.per_resident_amount)
            } : undefined
          }))
        });
      }

      // Fetch tickets
      const { data: tData, error: tErr } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
      if (!tErr && tData && tData.length > 0) {
        set({
          residentReports: tData.map(t => ({
            id: t.id,
            buildingId: t.building_id,
            category: t.category || 'general',
            location: t.location,
            description: t.description,
            photoUrl: t.photo_url,
            status: t.status || 'pending',
            submittedBy: t.submitted_by || 'Résident',
            submittedAt: new Date(t.created_at).toLocaleDateString()
          }))
        });
      }

      // Fetch residents
      const { data: resData, error: resErr } = await supabase.from('residents').select('*');
      if (!resErr && resData && resData.length > 0) {
        set({
          registeredAccounts: resData.map(r => ({
            id: r.id,
            lastName: r.last_name,
            firstName: r.first_name,
            buildingId: r.building_id,
            floor: r.floor,
            aptNumber: r.apt_number,
            phone: r.phone,
            password: r.password,
            joinedAt: r.joined_at
          }))
        });
      }

      // Fetch finances
      const { data: finData, error: finErr } = await supabase.from('finances').select('*');
      if (!finErr && finData && finData.length > 0) {
        const financesMap: Record<string, { monthlyCharge: number, paidApts: string[] }> = {};
        finData.forEach(f => {
          financesMap[f.building_id] = {
            monthlyCharge: Number(f.monthly_charge) || 2500,
            paidApts: Array.isArray(f.paid_apts) ? f.paid_apts : []
          };
        });
        set({ finances: financesMap });
      }
    } catch (err) {
      console.info('State initialized clean; Supabase sync available:', err);
    }

    // Subscribe to realtime changes safely
    try {
      supabase.channel('haven:changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
          get().initializeData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
          get().initializeData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, () => {
          get().initializeData();
        })
        .subscribe();
    } catch {
      // Safe fallback
    }
  },

  setRole: (role: UserRole) => set({ currentRole: role }),

  setActiveBuilding: (buildingId: string) => {
    set({ activeBuildingId: buildingId });
  },

  registerResident: async (accountData: ResidentProfile) => {
    const cleanAptNum = accountData.aptNumber.trim();
    const cleanPhone = accountData.phone.trim();
    const cleanPwd = accountData.password?.trim() || cleanPhone;
    const joinedStr = new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

    try {
      // 1. Check if an account already exists for this building & apartment
      const { data: existing, error: errCheck } = await supabase
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

      // 2. Insert into Supabase
      const { data: newRes, error: errInsert } = await supabase
        .from('residents')
        .insert({
          last_name: accountData.lastName.trim(),
          first_name: accountData.firstName?.trim() || '',
          building_id: accountData.buildingId,
          floor: accountData.floor.trim(),
          apt_number: cleanAptNum,
          phone: cleanPhone,
          password: cleanPwd,
          joined_at: joinedStr
        })
        .select()
        .single();

      if (errInsert || !newRes) {
        console.error('Supabase insert error:', errInsert);
        return {
          success: false,
          message: 'Erreur lors de la création du compte sur le serveur.'
        };
      }

      // 3. Update local state
      const registeredProfile: ResidentProfile = {
        id: newRes.id,
        lastName: newRes.last_name,
        firstName: newRes.first_name,
        buildingId: newRes.building_id,
        floor: newRes.floor,
        aptNumber: newRes.apt_number,
        phone: newRes.phone,
        password: newRes.password,
        joinedAt: newRes.joined_at
      };

      const updatedAccounts = [registeredProfile, ...get().registeredAccounts];

      set({
        registeredAccounts: updatedAccounts,
        residentProfile: registeredProfile,
        userApartment: `Apt ${registeredProfile.aptNumber} (Étage ${registeredProfile.floor})`,
        residentHomeBuildingId: registeredProfile.buildingId,
        activeBuildingId: registeredProfile.buildingId
      });

      localStorage.setItem('haven_saved_resident_profile', JSON.stringify(registeredProfile));

      return { success: true };
    } catch (err: any) {
      console.error('Registration failed:', err);
      return { success: false, message: 'Erreur de connexion au serveur.' };
    }
  },
  loginResidentWithCredentials: async (buildingId: string, aptNumber: string, passwordOrPhone: string) => {
    try {
      const targetApt = cleanStr(aptNumber);
      
      const { data: residents, error } = await supabase
        .from('residents')
        .select('*')
        .eq('building_id', buildingId);

      if (error || !residents || residents.length === 0) {
        return {
          success: false,
          message: 'Aucun compte trouvé pour cette résidence.'
        };
      }

      // Find by apt number (flexible match like the local fallback)
      const account = residents.find(a => 
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

      const enteredSecretDigits = cleanDigits(passwordOrPhone);
      const enteredSecretRaw = cleanStr(passwordOrPhone);
      const accountPhoneDigits = cleanDigits(account.phone);
      const accountPwdRaw = cleanStr(account.password);

      const isMatch = 
        (enteredSecretDigits.length >= 4 && accountPhoneDigits.endsWith(enteredSecretDigits)) ||
        (accountPwdRaw && accountPwdRaw === enteredSecretRaw) ||
        (enteredSecretRaw === cleanStr(account.phone));

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
        password: account.password,
        joinedAt: account.joined_at || 'Récemment'
      };

      const currentAccounts = get().registeredAccounts.filter(
        a => !(a.buildingId === profile.buildingId && cleanApt(a.aptNumber) === cleanApt(profile.aptNumber))
      );
      const updatedAccounts = [profile, ...currentAccounts];

      set({
        residentProfile: profile,
        registeredAccounts: updatedAccounts,
        userApartment: `Apt ${profile.aptNumber} (Étage ${profile.floor})`,
        residentHomeBuildingId: profile.buildingId,
        activeBuildingId: profile.buildingId
      });

      localStorage.setItem('haven_saved_resident_profile', JSON.stringify(profile));

      return { success: true };
    } catch (err: any) {
      console.error('Login failed:', err);
      return { success: false, message: 'Erreur de connexion au serveur.' };
    }
  },

  loginResident: async (profile: ResidentProfile) => {
    set({
      residentProfile: profile,
      userApartment: `Apt ${profile.aptNumber} (Étage ${profile.floor})`,
      residentHomeBuildingId: profile.buildingId,
      activeBuildingId: profile.buildingId
    });
    try {
      localStorage.setItem('haven_saved_resident_profile', JSON.stringify(profile));
    } catch {
      // Ignore
    }
  },

  logoutResident: () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('haven_session_token') : null;
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
      localStorage.removeItem('haven_session_token');
    }
    set({ residentProfile: null, userApartment: '' });
    try {
      localStorage.removeItem('haven_saved_resident_profile');
    } catch {
      // Ignore
    }
  },

  registerManager: async (data: { name: string; emailOrPhone: string; password: string; agencyName?: string }) => {
    const cleanIdentifier = data.emailOrPhone.trim().toLowerCase();
    const cleanPwd = data.password.trim();
    const currentManagers = get().registeredManagers;

    const existing = currentManagers.find(m => m.emailOrPhone.trim().toLowerCase() === cleanIdentifier);
    if (existing) {
      return { success: false, message: 'Un compte avec cet identifiant existe déjà.' };
    }

    const newManager: ManagerProfile = {
      id: `mgr-${Date.now()}`,
      name: data.name.trim(),
      emailOrPhone: cleanIdentifier,
      password: cleanPwd,
      agencyName: data.agencyName?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    const updated = [newManager, ...currentManagers];
    set({
      registeredManagers: updated,
      managerProfile: newManager,
    });

    try {
      localStorage.setItem('haven_registered_managers', JSON.stringify(updated));
      localStorage.setItem('haven_saved_manager_profile', JSON.stringify(newManager));
    } catch {
      // Safe fallback
    }

    return { success: true };
  },

  loginManager: async (emailOrPhone: string, password: string) => {
    const cleanIdentifier = emailOrPhone.trim().toLowerCase();
    const cleanPwd = password.trim();
    const currentManagers = get().registeredManagers;

    const manager = currentManagers.find(
      m => m.emailOrPhone.trim().toLowerCase() === cleanIdentifier && m.password === cleanPwd
    );

    if (!manager) {
      return { success: false, message: 'Email/Téléphone ou mot de passe incorrect.' };
    }

    set({ managerProfile: manager });
    try {
      localStorage.setItem('haven_saved_manager_profile', JSON.stringify(manager));
    } catch {
      // Safe fallback
    }

    return { success: true };
  },

  logoutManager: () => {
    set({ managerProfile: null });
    try {
      localStorage.removeItem('haven_saved_manager_profile');
    } catch {
      // Safe fallback
    }
  },

  toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),

  clearUnreadAlerts: () => set({ unreadAlertCount: 0 }),

  addBuilding: async (buildingData) => {
    const newId = `bldg-${Date.now()}`;
    const newBuilding: Building = {
      id: newId,
      ...buildingData,
      status: 'operational'
    };

    set(state => ({
      buildings: [...state.buildings, newBuilding],
      activeBuildingId: newId
    }));

    try {
      await supabase.from('buildings').insert({
        id: newId,
        name: buildingData.name,
        address: buildingData.address,
        total_units: buildingData.totalUnits,
        towers: buildingData.towers,
        status: 'operational'
      });
    } catch (err) {
      console.debug('DB insert error:', err);
    }
  },

  removeBuilding: async (buildingId) => {
    set(state => {
      const remainingBuildings = state.buildings.filter(b => b.id !== buildingId);
      const nextActiveId = state.activeBuildingId === buildingId 
        ? (remainingBuildings[0]?.id || '') 
        : state.activeBuildingId;
        
      return {
        buildings: remainingBuildings,
        activeBuildingId: nextActiveId
      };
    });

    try {
      await supabase.from('buildings').delete().eq('id', buildingId);
    } catch (err) {
      console.debug('DB delete error:', err);
    }
  },

  broadcastIncident: async (incidentData) => {
    const newId = `inc-${Date.now()}`;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newIncident: Incident = {
      id: newId,
      buildingId: incidentData.buildingId || get().activeBuildingId || get().buildings[0]?.id,
      category: incidentData.category,
      severity: incidentData.severity,
      title: incidentData.title,
      description: incidentData.description,
      location: incidentData.location,
      affectedUnits: incidentData.affectedUnits,
      status: 'reported',
      reportedAt: currentTime,
      estimatedRestorationTime: incidentData.estimatedRestorationTime,
      etaCountdownMinutes: incidentData.etaCountdownMinutes,
      requiresResidentConfirmation: incidentData.requiresResidentConfirmation ?? (incidentData.category === 'water'),
      timeline: [
        {
          id: `t-${Date.now()}`,
          status: 'reported',
          label: 'Incident Déclaré',
          timestamp: currentTime,
          note: incidentData.description,
          author: 'Bureau du Syndic'
        }
      ],
      confirmations: []
    };

    set(state => ({
      activeIncidents: [newIncident, ...state.activeIncidents],
      unreadAlertCount: state.unreadAlertCount + 1
    }));

    if (get().soundEnabled) {
      playAlertSound(incidentData.severity);
    }

    try {
      await supabase.from('incidents').insert({
        id: newId,
        building_id: newIncident.buildingId,
        category: newIncident.category,
        severity: newIncident.severity,
        title: newIncident.title,
        description: newIncident.description,
        location: newIncident.location,
        affected_units: newIncident.affectedUnits,
        status: newIncident.status,
        estimated_restoration_time: newIncident.estimatedRestorationTime,
        eta_countdown_minutes: newIncident.etaCountdownMinutes,
        requires_resident_confirmation: newIncident.requiresResidentConfirmation
      });

      await supabase.from('incident_timelines').insert({
        incident_id: newId,
        status: 'reported',
        label: 'Incident Déclaré',
        note: incidentData.description,
        author: 'Bureau du Syndic'
      });
    } catch (err) {
      console.debug('DB incident insert error:', err);
    }
  },

  updateIncidentStatus: async (incidentId, status, note) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isResolved = status === 'resolved';

    set(state => {
      const target = state.activeIncidents.find(i => i.id === incidentId);
      if (!target) return state;

      const updatedTimeline = [
        ...target.timeline,
        {
          id: `t-${Date.now()}`,
          status,
          label: status.toUpperCase(),
          timestamp: currentTime,
          note: note || `Statut mis à jour: ${status}`,
          author: 'Bureau du Syndic'
        }
      ];

      const updatedIncident: Incident = {
        ...target,
        status,
        timeline: updatedTimeline,
        estimatedRestorationTime: isResolved ? 'Rétabli' : target.estimatedRestorationTime,
        etaCountdownMinutes: isResolved ? 0 : target.etaCountdownMinutes
      };

      if (isResolved) {
        return {
          activeIncidents: state.activeIncidents.filter(i => i.id !== incidentId),
          resolvedIncidents: [updatedIncident, ...state.resolvedIncidents]
        };
      } else {
        return {
          activeIncidents: state.activeIncidents.map(i => i.id === incidentId ? updatedIncident : i)
        };
      }
    });

    try {
      await supabase.from('incidents').update({ status }).eq('id', incidentId);
      await supabase.from('incident_timelines').insert({
        incident_id: incidentId,
        status,
        label: status.toUpperCase(),
        note: note || `Statut mis à jour: ${status}`,
        author: 'Bureau du Syndic'
      });
    } catch (err) {
      console.debug('DB incident update error:', err);
    }
  },

  addTimelineNote: async (incidentId, note) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const authorName = get().currentRole === 'manager' 
      ? 'Bureau du Syndic' 
      : (get().residentProfile?.lastName || 'Résident');

    set(state => {
      const active = state.activeIncidents.map(inc => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            timeline: [
              ...inc.timeline,
              {
                id: `t-${Date.now()}`,
                status: inc.status,
                label: 'Note Technique',
                timestamp: currentTime,
                note,
                author: authorName
              }
            ]
          };
        }
        return inc;
      });
      return { activeIncidents: active };
    });

    try {
      await supabase.from('incident_timelines').insert({
        incident_id: incidentId,
        status: 'in_progress',
        label: 'Note Technique',
        note,
        author: authorName
      });
    } catch (err) {
      console.debug('DB timeline note error:', err);
    }
  },

  confirmRestoration: async (incidentId, isRestored) => {
    const apt = get().userApartment || 'Mon Appartement';

    set(state => {
      const active = state.activeIncidents.map(inc => {
        if (inc.id === incidentId) {
          const existingFiltered = (inc.confirmations || []).filter(c => c.apartment !== apt);
          return {
            ...inc,
            confirmations: [
              ...existingFiltered,
              {
                apartment: apt,
                isRestored,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
        }
        return inc;
      });
      return { activeIncidents: active };
    });

    try {
      await supabase.from('incident_confirmations').upsert({
        incident_id: incidentId,
        unit_id: apt,
        is_restored: isRestored
      });
    } catch (err) {
      console.debug('DB confirmation error:', err);
    }
  },

  submitResidentReport: async (report) => {
    const bId = get().residentHomeBuildingId || get().buildings[0]?.id;
    const author = get().residentProfile 
      ? `${get().residentProfile?.lastName} (${get().userApartment})`
      : 'Résident';

    const newReport: ResidentReport = {
      id: `rep-${Date.now()}`,
      buildingId: bId,
      category: report.category,
      location: report.location,
      description: report.description,
      photoUrl: report.photoUrl,
      status: 'pending',
      submittedBy: author,
      submittedAt: 'À l\'instant'
    };

    set(state => ({
      residentReports: [newReport, ...state.residentReports]
    }));

    try {
      await supabase.from('tickets').insert({
        building_id: bId,
        category: report.category,
        location: report.location,
        description: report.description,
        photo_url: report.photoUrl,
        status: 'pending',
        submitted_by: author
      });
    } catch (err) {
      console.debug('DB ticket insert error:', err);
    }
  },

  updateTicketStatus: async (ticketId, status) => {
    set(state => ({
      residentReports: state.residentReports.map(r => r.id === ticketId ? { ...r, status } : r)
    }));

    try {
      await supabase.from('tickets').update({ status }).eq('id', ticketId);
    } catch (err) {
      console.debug('DB ticket status error:', err);
    }
  },

  addNotice: async (notice) => {
    const bId = notice.buildingId || get().activeBuildingId || get().buildings[0]?.id;
    const newNotice: BuildingNotice = {
      id: `not-${Date.now()}`,
      buildingId: bId,
      title: notice.title,
      content: notice.content,
      category: notice.category || 'info',
      author: notice.author || 'Bureau du Syndic',
      date: 'Aujourd\'hui',
      isPinned: notice.isPinned ?? true,
      expenseDetails: notice.expenseDetails
    };

    set(state => ({
      notices: [newNotice, ...state.notices]
    }));

    try {
      await supabase.from('notices').insert({
        id: newNotice.id,
        building_id: bId,
        title: notice.title,
        content: notice.content,
        category: newNotice.category,
        author: newNotice.author,
        is_pinned: newNotice.isPinned,
        total_amount: notice.expenseDetails?.totalAmount,
        per_resident_amount: notice.expenseDetails?.perResidentAmount
      });
    } catch (err) {
      console.debug('DB notice insert error:', err);
    }
  },

  updateFinances: async (buildingId: string, monthlyCharge: number, paidApts: string[]) => {
    set(state => ({
      finances: {
        ...state.finances,
        [buildingId]: { monthlyCharge, paidApts }
      }
    }));

    try {
      const { error } = await supabase
        .from('finances')
        .upsert({
          building_id: buildingId,
          monthly_charge: monthlyCharge,
          paid_apts: paidApts,
          updated_at: new Date().toISOString()
        }, { onConflict: 'building_id' });

      if (error) console.error('DB finance upsert error:', error);
    } catch (err) {
      console.error('DB finance error:', err);
    }
  },

  addFixedCharge: async (buildingId, chargeData) => {
    const newCharge: FixedCharge = {
      id: `fc-${Date.now()}`,
      buildingId,
      ...chargeData,
      updatedAt: new Date().toISOString()
    };
    const current = get().fixedCharges[buildingId] || [];
    const updated = [newCharge, ...current];
    const newMap = { ...get().fixedCharges, [buildingId]: updated };
    set({ fixedCharges: newMap });
    try {
      localStorage.setItem('haven_fixed_charges', JSON.stringify(newMap));
    } catch (e) {
      console.error('Error saving fixed charges:', e);
    }
  },

  updateFixedCharge: async (buildingId, chargeId, updates) => {
    const current = get().fixedCharges[buildingId] || [];
    const updated = current.map(c => c.id === chargeId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
    const newMap = { ...get().fixedCharges, [buildingId]: updated };
    set({ fixedCharges: newMap });
    try {
      localStorage.setItem('haven_fixed_charges', JSON.stringify(newMap));
    } catch (e) {
      console.error('Error saving fixed charges:', e);
    }
  },

  deleteFixedCharge: async (buildingId, chargeId) => {
    const current = get().fixedCharges[buildingId] || [];
    const updated = current.filter(c => c.id !== chargeId);
    const newMap = { ...get().fixedCharges, [buildingId]: updated };
    set({ fixedCharges: newMap });
    try {
      localStorage.setItem('haven_fixed_charges', JSON.stringify(newMap));
    } catch (e) {
      console.error('Error saving fixed charges:', e);
    }
  },

  toggleFixedChargeSettled: async (buildingId, chargeId) => {
    const current = get().fixedCharges[buildingId] || [];
    const updated = current.map(c => c.id === chargeId ? { ...c, isPaidThisMonth: !c.isPaidThisMonth } : c);
    const newMap = { ...get().fixedCharges, [buildingId]: updated };
    set({ fixedCharges: newMap });
    try {
      localStorage.setItem('haven_fixed_charges', JSON.stringify(newMap));
    } catch (e) {
      console.error('Error saving fixed charges:', e);
    }
  },

  addGrosTravauxProject: async (buildingId, projectData) => {
    const bldg = get().buildings.find(b => b.id === buildingId) || get().buildings[0];
    const totalUnits = bldg?.totalUnits || 30;
    const perQuota = totalUnits > 0 ? Math.round(projectData.totalCost / totalUnits) : projectData.totalCost;

    const newProject: GrosTravauxProject = {
      id: `gt-${Date.now()}`,
      buildingId,
      ...projectData,
      perUnitQuota: perQuota,
      paidApts: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    const current = get().grosTravauxProjects[buildingId] || [];
    const updated = [newProject, ...current];
    const newMap = { ...get().grosTravauxProjects, [buildingId]: updated };
    set({ grosTravauxProjects: newMap });
    try {
      localStorage.setItem('haven_gros_travaux', JSON.stringify(newMap));
    } catch (e) {
      console.error('Error saving gros travaux projects:', e);
    }
  },

  updateGrosTravauxProject: async (buildingId, projectId, updates) => {
    const current = get().grosTravauxProjects[buildingId] || [];
    const bldg = get().buildings.find(b => b.id === buildingId) || get().buildings[0];
    const totalUnits = bldg?.totalUnits || 30;

    const updated = current.map(p => {
      if (p.id !== projectId) return p;
      const nextTotalCost = updates.totalCost !== undefined ? updates.totalCost : p.totalCost;
      const nextQuota = totalUnits > 0 ? Math.round(nextTotalCost / totalUnits) : nextTotalCost;
      return {
        ...p,
        ...updates,
        perUnitQuota: nextQuota
      };
    });

    const newMap = { ...get().grosTravauxProjects, [buildingId]: updated };
    set({ grosTravauxProjects: newMap });
    try {
      localStorage.setItem('haven_gros_travaux', JSON.stringify(newMap));
    } catch (e) {
      console.error('Error saving gros travaux projects:', e);
    }
  },

  toggleGrosTravauxAptPaid: async (buildingId, projectId, aptNumber) => {
    const current = get().grosTravauxProjects[buildingId] || [];
    const cleanNum = aptNumber.trim();
    const updated = current.map(p => {
      if (p.id !== projectId) return p;
      const setApts = new Set(p.paidApts || []);
      if (setApts.has(cleanNum)) {
        setApts.delete(cleanNum);
      } else {
        setApts.add(cleanNum);
      }
      return { ...p, paidApts: Array.from(setApts) };
    });

    const newMap = { ...get().grosTravauxProjects, [buildingId]: updated };
    set({ grosTravauxProjects: newMap });
    try {
      localStorage.setItem('haven_gros_travaux', JSON.stringify(newMap));
    } catch (e) {
      console.error('Error saving gros travaux projects:', e);
    }
  },

  deleteGrosTravauxProject: async (buildingId, projectId) => {
    const current = get().grosTravauxProjects[buildingId] || [];
    const updated = current.filter(p => p.id !== projectId);
    const newMap = { ...get().grosTravauxProjects, [buildingId]: updated };
    set({ grosTravauxProjects: newMap });
    try {
      localStorage.setItem('haven_gros_travaux', JSON.stringify(newMap));
    } catch (e) {
      console.error('Error saving gros travaux projects:', e);
    }
  },

  publishGrosTravauxNotice: async (buildingId, projectId) => {
    const projects = get().grosTravauxProjects[buildingId] || [];
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const bldg = get().buildings.find(b => b.id === buildingId) || get().buildings[0];
    const totalUnits = bldg?.totalUnits || 30;

    const noticeContent = `${project.description}\n\n` +
      `📌 Coût Total du Projet : ${project.totalCost.toLocaleString()} DA\n` +
      `🏢 Quote-part par Appartement : ${project.perUnitQuota.toLocaleString()} DA\n` +
      `📅 Échéance prévue : ${project.deadline}\n` +
      (project.contractorName ? `👷 Entreprise retenue : ${project.contractorName} (${project.contractorPhone || 'N/A'})\n` : '') +
      `✅ Progression actuelle : ${project.paidApts.length}/${totalUnits} appartements ont versé leur cotisation.`;

    await get().addNotice({
      buildingId,
      title: `🚨 APPEL DE FONDS : ${project.title}`,
      content: noticeContent,
      category: 'expense',
      author: 'Bureau du Syndic (Gros Travaux)',
      isPinned: true,
      expenseDetails: {
        totalAmount: project.totalCost,
        perResidentAmount: project.perUnitQuota
      }
    });
  }
}));
