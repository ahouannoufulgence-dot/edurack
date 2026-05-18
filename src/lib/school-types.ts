
export type Role = 'Directeur' | 'Enseignant' | 'Parent' | 'Eleve';

export type ClassLevel = 
  | '6e' | '5e' | '4e' | '3e' 
  | '2nde' | '1ère A1' | '1ère A2' | '1ère C' | '1ère D' 
  | 'Terminale A1' | 'Terminale A2' | 'Terminale C' | 'Terminale D';

export type Subject = {
  id: string;
  name: string;
  category: 'Scientifique' | 'Littéraire' | 'Autre';
};

export type CoefficientEntry = {
  classLevel: ClassLevel;
  subjectId: string;
  value: number;
};

export type ConductGrade = 'Très bien' | 'Bien' | 'Assez bien' | 'Passable' | 'Insuffisant';

export const CONDUCT_VALUES: Record<ConductGrade, number> = {
  'Très bien': 20,
  'Bien': 16,
  'Assez bien': 12,
  'Passable': 10,
  'Insuffisant': 6,
};

export type GradeEntry = {
  id: string;
  studentId: string;
  subjectId: string;
  trimester: 'T1' | 'T2' | 'T3';
  value: number;
  isValidated: boolean;
  isLocked: boolean;
  lastModifiedBy: string;
  lastModifiedAt: string;
  authorName: string;
};

export type AuditLog = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'LOGIN' | 'GRADE_UPDATE' | 'GRADE_DELETE' | 'PAYMENT_RECORD' | 'ACCESS_DENIED' | 'ACCOUNT_ACTIVATION' | 'TOKEN_GENERATION';
  details: string;
  oldValue?: any;
  newValue?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
};

export type ActivationToken = {
  id: string; // Le code EDP-2026-XX-XXX
  studentName: string;
  classLevel: ClassLevel;
  birthDate: string;
  parentPhone: string;
  status: 'pending' | 'activated' | 'expired';
  activatedAt?: string;
  attempts: number;
};

export type Student = {
  id: string;
  name: string;
  classLevel: ClassLevel;
  photoUrl: string;
  conduct: ConductGrade;
  paymentStatus: 'A jour' | 'En retard' | 'Partiel';
  parentId?: string;
  isActivated?: boolean;
  email?: string;
  secretQuestion?: string;
};

export const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Mathématiques', category: 'Scientifique' },
  { id: 'pc', name: 'Physique-Chimie', category: 'Scientifique' },
  { id: 'svt', name: 'SVT', category: 'Scientifique' },
  { id: 'fr', name: 'Français', category: 'Littéraire' },
  { id: 'hg', name: 'Histoire-Géo', category: 'Littéraire' },
  { id: 'ang', name: 'Anglais', category: 'Littéraire' },
  { id: 'philo', name: 'Philosophie', category: 'Littéraire' },
  { id: 'eps', name: 'EPS', category: 'Autre' },
  { id: 'esp', name: 'Espagnol', category: 'Littéraire' },
  { id: 'all', name: 'Allemand', category: 'Littéraire' },
];
