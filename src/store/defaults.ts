import { 
  Building, 
  FixedCharge, 
  GrosTravauxProject, 
  StaffContact, 
  EmergencyContact 
} from '../types/building';

// ── Default Buildings ─────────────────────────────────────────────────
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

// ── Default Fixed Charges ─────────────────────────────────────────────
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

// ── Default Gros Travaux ──────────────────────────────────────────────
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

// ── Staff Contacts ────────────────────────────────────────────────────
export const STAFF_CONTACTS: StaffContact[] = [
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

// ── Contractor / Emergency Contacts ───────────────────────────────────
export const CONTRACTOR_CONTACTS: EmergencyContact[] = [
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
