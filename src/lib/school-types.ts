
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
  classLevel?: string; // Utilisé pour le tri des élèves
  subjectId?: string;  // Utilisé pour le tri des enseignants
  matieresAttribuees?: string[];
  motDePasseHash?: string;
  password?: string; // Pour le prototype
  premierAcces: boolean;
  questionSecrete?: string;
  reponseSecrete?: string;
  statutCompte: 'actif' | 'inactif' | 'suspendu';
  derniereConnexion?: string;
  photoProfil?: string;
  photoUrl?: string; // Pour le prototype
  dateCreation: string;
  name: string; 
  idHistory?: string[];
  studentId?: string; // Pour les parents
};

export type StudentInfo = {
  eleveId: string;
  matricule: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: 'M' | 'F';
  classeId: string;
  parentId: string;
  adresse: string;
  statut: string;
  dateInscription: string;
  photo?: string;
};

export type ParentInfo = {
  parentId: string;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  profession: string;
  adresse: string;
  enfantsIds: string[];
};

export type TeacherInfo = {
  enseignantId: string;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  matieres: string[];
  classesAttribuees: string[];
  specialite: string;
  dateEmbauche: string;
};

export type SchoolClass = {
  classeId: string;
  nomClasse: string;
  niveau: string;
  effectif: number;
  professeurPrincipalId: string;
  anneeScolaire: string;
};

export type Subject = {
  matiereId: string;
  nom: string;
  coefficient: number;
  niveau: string;
  enseignantId?: string;
  category?: 'Scientifique' | 'Littéraire' | 'Autre';
  id: string; // Alias pour compatibilité
  name: string; // Alias pour compatibilité
};

export type GradeRecord = {
  noteId: string;
  eleveId: string;
  classeId: string;
  matiereId: string;
  enseignantId: string;
  trimestre: 'T1' | 'T2' | 'T3';
  devoir: number;
  composition?: number;
  moyenne: number;
  coefficient: number;
  dateAjout: string;
};

export type Bulletin = {
  bulletinId: string;
  eleveId: string;
  trimestre: string;
  moyenneGenerale: number;
  rang: string;
  mention: string;
  pdfUrl?: string;
  qrCode: string;
};

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
  statut: 'payé' | 'partiel' | 'en attente';
  datePaiement: string;
  anneeScolaire: string;
};

export type ClassLevel = string;
export type ConductGrade = 'Très bien' | 'Bien' | 'Assez bien' | 'Passable' | 'Insuffisant';

export type Student = StudentInfo & { 
  id: string; 
  name: string; 
  classLevel: string; 
  photoUrl: string; 
  conduct: ConductGrade; 
  paymentStatus: 'A jour' | 'En retard' | 'Partiel' 
};

export const ALL_CLASSES: ClassLevel[] = [
  '6e 1', '6e 2', '6e 3', '6e 4',
  '5e 1', '5e 2', '5e 3', '5e 4',
  '4e 1', '4e 2', '4e 3', '4e 4',
  '3e 1', '3e 2', '3e 3', '3e 4',
  '2nde A', '2nde B', '2nde C', '2nde D',
  '1ère A', '1ère B', '1ère C', '1ère D',
  'Tle A', 'Tle B', 'Tle C', 'Tle D'
];

export const SUBJECTS: Subject[] = [
  { matiereId: 'math', id: 'math', nom: 'Mathématiques', name: 'Mathématiques', coefficient: 4, niveau: 'Tous', category: 'Scientifique' },
  { matiereId: 'pc', id: 'pc', nom: 'Physique-Chimie', name: 'Physique-Chimie', coefficient: 4, niveau: 'Secondaire', category: 'Scientifique' },
  { matiereId: 'svt', id: 'svt', nom: 'SVT', name: 'SVT', coefficient: 4, niveau: 'Secondaire', category: 'Scientifique' },
  { matiereId: 'fr', id: 'fr', nom: 'Français', name: 'Français', coefficient: 4, niveau: 'Tous', category: 'Littéraire' },
  { matiereId: 'hg', id: 'hg', nom: 'Histoire-Géo', name: 'Histoire-Géo', coefficient: 2, niveau: 'Tous', category: 'Littéraire' },
  { matiereId: 'ang', id: 'ang', nom: 'Anglais', name: 'Anglais', coefficient: 3, niveau: 'Tous', category: 'Littéraire' },
  { matiereId: 'philo', id: 'philo', nom: 'Philosophie', name: 'Philosophie', coefficient: 2, niveau: 'Lycée', category: 'Littéraire' },
  { matiereId: 'eps', id: 'eps', nom: 'EPS', name: 'EPS', coefficient: 1, niveau: 'Tous', category: 'Autre' },
];
