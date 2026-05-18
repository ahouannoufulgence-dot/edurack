
export type Role = 'Directeur' | 'Enseignant' | 'Parent' | 'Eleve';

export type User = {
  id: string;
  identifiant: string;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  telephone?: string;
  email?: string;
  role: Role;
  classeId?: string;
  classLevel?: string; 
  subjectId?: string;  
  matieresAttribuees?: string[];
  motDePasseHash?: string;
  password?: string; 
  premierAcces: boolean;
  questionSecrete?: string;
  reponseSecrete?: string;
  statutCompte: 'actif' | 'inactif' | 'suspendu';
  derniereConnexion?: string;
  photoProfil?: string;
  photoUrl?: string; 
  dateCreation: string;
  name: string; 
  idHistory?: string[];
  studentId?: string; 
};

export type GradeRecord = {
  noteId: string;
  eleveId: string;
  classeId: string;
  matiereId: string;
  enseignantId: string;
  trimestre: 'T1' | 'T2' | 'T3';
  interros: (number | null)[];
  devoirs: (number | null)[];
  composition?: number | null;
  moyenne: number;
  coefficient: number;
  dateAjout: string;
};

export type AbsenceRecord = {
  absenceId: string;
  eleveId: string;
  date: string;
  motif: string;
  justification?: string;
  auteur?: string;
};

export type DisciplineRecord = {
  incidentId: string;
  eleveId: string;
  type: string;
  description: string;
  sanction: string;
  date: string;
};

export type Subject = {
  id: string; 
  name: string; 
  category: 'Scientifique' | 'Littéraire' | 'Autre';
};

export type CoefficientEntry = {
  classLevel: string;
  subjectId: string;
  value: number;
};

export const ALL_CLASSES: string[] = [
  '6e 1', '6e 2', '6e 3', '6e 4',
  '5e 1', '5e 2', '5e 3', '5e 4',
  '4e 1', '4e 2', '4e 3', '4e 4',
  '3e 1', '3e 2', '3e 3', '3e 4',
  '2nde A', '2nde B', '2nde C', '2nde D',
  '1ère A', '1ère B', '1ère C', '1ère D',
  'Tle A', 'Tle B', 'Tle C', 'Tle D'
];

export const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Mathématiques', category: 'Scientifique' },
  { id: 'pc', name: 'Physique-Chimie', category: 'Scientifique' },
  { id: 'svt', name: 'SVT', category: 'Scientifique' },
  { id: 'fr', name: 'Français', category: 'Littéraire' },
  { id: 'hg', name: 'Histoire-Géo', category: 'Littéraire' },
  { id: 'ang', name: 'Anglais', category: 'Littéraire' },
  { id: 'philo', name: 'Philosophie', category: 'Littéraire' },
  { id: 'eps', name: 'EPS', category: 'Autre' },
  { id: 'allemagne', name: 'Allemand', category: 'Littéraire' },
  { id: 'espagnol', name: 'Espagnol', category: 'Littéraire' },
  { id: 'ct', name: 'Couture/Technique', category: 'Autre' },
];

export type AuditLog = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'LOGIN' | 'LOGOUT' | 'ACCESS_DENIED' | 'GRADE_UPDATE' | 'STUDENT_ADD' | 'PAYMENT_ADD' | 'ACCOUNT_ACTIVATION' | 'TOKEN_GENERATION' | 'SECURITY_ALERT' | 'LOCKOUT' | 'SYSTEM_RESET';
  details: string;
  oldValue?: any;
  newValue?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  deviceInfo?: string;
};

export type ActivationToken = {
  id: string;
  studentName: string;
  classLevel: string;
  birthDate: string;
  parentPhone: string;
  status: 'pending' | 'activated' | 'expired';
  activatedAt?: string;
  attempts: number;
};

export type PaymentRecord = {
  paiementId: string;
  eleveId: string;
  montant: number;
  typePaiement: string;
  datePaiement: string;
  anneeScolaire: string;
};

export type EmploiDuTemps = {
  edtId: string;
  classeId: string;
  jour: string;
  heureDebut: string;
  heureFin: string;
  matiereId: string;
  enseignantId: string;
  salle: string;
};
