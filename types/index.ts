export type UserRole = 'incube' | 'formateur' | 'formateur_principal' | 'admin' | 'super_admin';

export type PresenceStatus = 'pending' | 'validated' | 'rejected';

export type PaymentStatus = 'unpaid' | 'paid';

export type UserStatus = 'pending' | 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: UserRole;
  telephone: string;
  createdAt: string;
  status: UserStatus;
  // Propriétés incubés
  equipeId?: string;
  projetId?: string;
  banqueId?: string;
  rib?: string;
  photoUrl?: string;
  history?: any;
  // Propriétés formateurs
  equipeIds?: string[];
  specialite?: string;
  // Mises à jour en attente
  pendingRib?: string;
  pendingBanque?: string;
  pendingEquipe?: string;
}

export interface Incube extends User {
  role: 'incube';
  equipeId: string;
  projetId: string;
  banqueId: string;
  rib?: string;
  photoUrl?: string;
  pendingRib?: string;
  pendingBanque?: string;
  pendingEquipe?: string;
}

export interface Formateur extends User {
  role: 'formateur' | 'formateur_principal';
  equipeIds: string[];
  specialite?: string;
}

export interface Admin extends User {
  role: 'admin' | 'super_admin';
}

export interface Equipe {
  id: string;
  nom: string;
  description: string;
  formateurId: string;
  createdAt: string;
  membres?: Incube[];
  projets?: Projet[];
}

export interface Projet {
  id: string;
  nom: string;
  description: string;
  equipeId: string;
  createdAt: string;
  incubes?: Incube[];
  equipe?: Equipe;
}

export interface Banque {
  id: string;
  nom: string;
  code: string;
  createdAt: string;
  incubes?: Incube[];
}

export interface Presence {
  id: string;
  incubeId: string;
  date: string;
  heureArrivee: string;
  heureDepart?: string;
  status: PresenceStatus;
  isGeolocValid: boolean;
  isRetro?: boolean;
  latitude?: number;
  longitude?: number;
  validatedBy?: string;
  validatedAt?: string;
  rejectionReason?: string;
  paymentStatus: PaymentStatus;
  amount: number;
  incube?: User | any;
}

export interface RetroPresenceRequest {
  id: string;
  incubeId: string;
  date: string;
  motif: string;
  status: PresenceStatus;
  createdAt: string;
  validatedBy?: string;
  validatedAt?: string;
  rejectionReason?: string;
  incube?: User | any;
}

export interface Evaluation {
  id: string;
  incubeId: string;
  formateurId: string;
  date: string;
  noteCompetence: number;
  noteAssiduité: number;
  noteParticipation: number;
  commentaire: string;
  createdAt: string;
}

export interface Warning {
  id: string;
  incubeId: string;
  incube?: string | User;
  formateurId: string;
  formateur?: string | User;
  motif: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface DashboardStats {
  presencesToday: number;
  absencesToday: number;
  pendingValidations: number;
  totalAmount: number;
  presenceRate: number;
}

export type PermissionStatus = 'pending' | 'viewed' | 'approved' | 'rejected';

export type PermissionType = 'absence' | 'retard' | 'sortie_anticipee' | 'autre';

export interface PermissionRequest {
  id: string;
  incube: string | Incube;
  type: PermissionType;
  motif: string;
  dateDebut: string;
  dateFin?: string | null;
  status: PermissionStatus;
  viewedAt?: string | null;
  processedAt?: string | null;
  processedBy?: string | Formateur | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

