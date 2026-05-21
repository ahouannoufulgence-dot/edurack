/**
 * @fileOverview Définitions des types de données pour EduTrack Pro.
 */

export type Role = 'Directeur' | 'Enseignant' | 'Parent' | 'Eleve';
export type Sexe = 'M' | 'F';
export type ClassLevel = '6e 1' | '6e 2' | '5e 1' | '5e 2' | '4e 1' | '4e 2' | '3e 1' | '3e 2' | '2nde AB' | '2nde CD' | '1ère AB' | '1ère CD' | 'Tle A' | 'Tle D' | 'Tle C';

export const ALL_CLASSES: ClassLevel[] = [
  '6e 1', '6e 2', '5e 1', '5e 2', '4e 1', '4e 2', '3e 1', '3e 2',
  '2nde AB', '2nde CD', '1ère AB', '1ère CD', 'Tle A', 'Tle D', 'Tle C'
];

export interface Subject {
  id: string;
  name: string;
  category: 'Scientifique' | 'Littéraire' | 'Autre';
}

export const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Mathématiques', category: 'Scientifique' },
  { id: 'pc', name: 'Physique-Chimie', category: 'Scientifique' },
  { id: 'svt', name: 'SVT', category: 'Scientifique' },
  { id: 'fr', name: 'Français', category: 'Littéraire' },
  { id: 'hg', name: 'Histoire-Géo', category: 'Littéraire' },
  { id: 'ang', name: 'Anglais', category: 'Littéraire' },
  { id: 'philo', name: 'Philosophie', category: 'Littéraire' },
  { id: 'eps', name: 'EPS', category: 'Autre' },
  { id: 'art', name: 'Arts Plastiques', category: 'Autre' },
];

export interface User {
  id: string;
  identifiant: string;
  name: string;
  nom: string;
  prenom: string;
  role: Role;
  sexe: Sexe;
  classLevel?: ClassLevel;
  matieresAttribuees?: string[];
  password?: string;
  statutCompte: 'actif' | 'inactif' | 'suspendu';
  dateCreation: string;
}

export interface ActivationToken {
  id: string;
  classLevel: ClassLevel;
  status: 'available' | 'activated';
  studentName: string;
  dateCreated: string;
}

export interface GradeRecord {
  gradeId: string;
  eleveId: string;
  classeId: string;
  matiereId: string;
  enseignantId: string;
  trimestre: 'T1' | 'T2' | 'T3';
  interros: (number | null)[];
  devoirs: (number | null)[];
  moyenne: number;
  coefficient: number;
  dateAjout: string;
}

export interface CoefficientEntry {
  classLevel: string;
  subjectId: string;
  value: number;
}

export interface AbsenceRecord {
  absenceId: string;
  eleveId: string;
  date: string;
  motif: string;
  justifiee: boolean;
}

export interface DisciplineRecord {
  incidentId: string;
  eleveId: string;
  type: string;
  date: string;
  sanction: string;
  description: string;
}

export interface PaymentRecord {
  paiementId: string;
  eleveId: string;
  montant: number;
  datePaiement: string;
  typePaiement: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
}

export interface EmploiDuTemps {
  edtId: string;
  classeId: string;
  jour: string;
  heureDebut: string;
  heureFin: string;
  matiereId: string;
  enseignantId: string;
  salle: string;
}

export interface ArchiveData {
  year: string;
  users: User[];
  grades: GradeRecord[];
  timestamp: string;
}
