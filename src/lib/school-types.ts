
export type Role = 'Directeur' | 'Enseignant' | 'Parent' | 'Eleve';

export type User = {
  id: string;
  name: string;
  role: Role;
  email?: string;
  photoUrl?: string;
  lastLogin?: string;
  subjectId?: string; // Pour les enseignants
  studentId?: string; // Pour les parents/élèves
};

export type ClassLevel = 
  | '6e 1' | '6e 2' | '6e 3' | '6e 4'
  | '5e 1' | '5e 2' | '5e 3' | '5e 4'
  | '4e 1' | '4e 2' | '4e 3' | '4e 4'
  | '3e 1' | '3e 2' | '3e 3' | '3e 4'
  | '2nde A' | '2nde B' | '2nde C' | '2nde D'
  | '1ère A' | '1ère B' | '1ère C' | '1ère D'
  | 'Tle A' | 'Tle B' | 'Tle C' | 'Tle D';

export const ALL_CLASSES: ClassLevel[] = [
  '6e 1', '6e 2', '6e 3', '6e 4',
  '5e 1', '5e 2', '5e 3', '5e 4',
  '4e 1', '4e 2', '4e 3', '4e 4',
  '3e 1', '3e 2', '3e 3', '3e 4',
  '2nde A', '2nde B', '2nde C', '2nde D',
  '1ère A', '1ère B', '1ère C', '1ère D',
  'Tle A', 'Tle B', 'Tle C', 'Tle D'
];

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
  action: 'LOGIN' | 'LOGOUT' | 'GRADE_UPDATE' | 'GRADE_DELETE' | 'PAYMENT_RECORD' | 'ACCESS_DENIED' | 'ACCOUNT_ACTIVATION' | 'TOKEN_GENERATION' | 'LOCKOUT';
  details: string;
  oldValue?: any;
  newValue?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
};

export type ActivationToken = {
  id: string;
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
