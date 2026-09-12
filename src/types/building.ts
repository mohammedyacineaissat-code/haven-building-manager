export type SeverityLevel = 'critical' | 'warning' | 'info';

export type IncidentCategory = 
  | 'water'
  | 'power'
  | 'elevator'
  | 'heating'
  | 'gate'
  | 'general';

export type IncidentStatus = 
  | 'reported'
  | 'dispatched'
  | 'in_progress'
  | 'testing'
  | 'resolved';

export interface TimelineStep {
  id: string;
  status: IncidentStatus;
  label: string;
  timestamp: string;
  note?: string;
  author: string;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  towers: string[];
  status: 'operational' | 'alert' | 'maintenance';
}

export interface ResidentConfirmation {
  apartment: string;
  isRestored: boolean;
  timestamp: string;
}

export interface Incident {
  id: string;
  buildingId: string;
  category: IncidentCategory;
  severity: SeverityLevel;
  title: string;
  description: string;
  location: string;
  affectedUnits: string; // e.g. "All Floors (Tower A & B)" or "Floors 4-12"
  status: IncidentStatus;
  reportedAt: string;
  estimatedRestorationTime: string; // ISO string or relative e.g. "14:30 Today"
  etaCountdownMinutes: number; // For live progress countdown
  assignedTechnician?: {
    name: string;
    phone: string;
    company: string;
    dispatchedAt: string;
  };
  requiresResidentConfirmation?: boolean;
  timeline: TimelineStep[];
  confirmations: ResidentConfirmation[];
}

export interface BuildingNotice {
  id: string;
  buildingId: string;
  title: string;
  content: string;
  category: 'maintenance' | 'meeting' | 'urgent' | 'info' | 'expense' | 'security';
  author: string;
  date: string;
  isPinned?: boolean;
  expenseDetails?: {
    totalAmount: number;
    perResidentAmount: number;
  };
  grosTravauxDetails?: {
    projectId: string;
    totalCost: number;
    perUnitQuota: number;
    paidCount: number;
    totalUnits: number;
    status: GrosTravauxStatus;
  };
}

export type FixedChargeCategory = 'salary' | 'contract' | 'utility' | 'maintenance' | 'other';

export interface FixedCharge {
  id: string;
  buildingId: string;
  title: string;
  category: FixedChargeCategory;
  monthlyAmount: number;
  payee?: string;
  frequency?: 'monthly' | 'quarterly' | 'annual';
  isPaidThisMonth: boolean;
  notes?: string;
  updatedAt?: string;
}

export type GrosTravauxStatus = 'voting' | 'collecting' | 'in_progress' | 'completed';

export interface GrosTravauxProject {
  id: string;
  buildingId: string;
  title: string;
  description: string;
  totalCost: number;
  perUnitQuota: number;
  deadline: string;
  status: GrosTravauxStatus;
  contractorName?: string;
  contractorPhone?: string;
  paidApts: string[];
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  title: string;
  role: string;
  phone: string;
  available: string;
  icon: string;
}

export interface StaffContact {
  id: string;
  title: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  available: string;
  location: string;
}

export interface ResidentReport {
  id: string;
  buildingId: string;
  category: IncidentCategory;
  location: string;
  description: string;
  photoUrl?: string;
  status: 'pending' | 'in_review' | 'resolved';
  submittedBy: string;
  submittedAt: string;
}

export interface ResidentProfile {
  id?: string;
  lastName: string;
  firstName?: string;
  buildingId: string;
  floor: string;
  aptNumber: string;
  phone: string;
  password?: string;
  joinedAt: string;
}

export interface ManagerProfile {
  id: string;
  name: string;
  emailOrPhone: string;
  password?: string;
  agencyName?: string;
  createdAt: string;
}

export type UserRole = 'resident' | 'manager';
