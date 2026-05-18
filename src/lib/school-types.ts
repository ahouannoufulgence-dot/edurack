
export type Role = 'Directeur' | 'Enseignant' | 'Parent' | 'Eleve';

export type User = {
  id: string;
  identifiant: string;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  telephone: string;
  email?: string;
  role: Role;
  classeId?: string;
  matieresAttribuees?: string[];
  motDePasseHash?: string;
  premierAcces: boolean;
  questionSecrete?: string;
  reponseSecrete?: string;
  statutCompte: 'actif' | 'inactif' | 'suspendu';
  derniereConnexion?: string;
  photoProfil?: string;
  dateCreation: string;
  // Compatibilité avec les anciens composants
  name: string; 
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

export type CoefficientSetting = {
  coefficientId: string;
  matiereId: string;
  valeur: number;
  dateModification: string;
  auteurModification: string;
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

export type AbsenceRecord = {
  absenceId: string;
  eleveId: string;
  date: string;
  motif: string;
  justification?: string;
  auteur: string;
};

export type DisciplineIncident = {
  incidentId: string;
  eleveId: string;
  type: string;
  description: string;
  sanction?: string;
  date: string;
};

export type PaymentRecord = {
  paiementId: string;
  eleveId: string;
  typePaiement: string;
  montant: number;
  statut: 'payé' | 'partiel' | 'en attente';
  datePaiement: string;
  resteAPayer: number;
  anneeScolaire: string;
};

export type ScheduleSlot = {
  edtId: string;
  classeId: string;
  jour: string;
  heureDebut: string;
  heureFin: string;
  matiereId: string;
  enseignantId: string;
  salle: string;
};

export type AgendaEvent = {
  agendaId: string;
  titre: string;
  description: string;
  date: string;
  cible: string;
  auteur: string;
};

export type InternalMessage = {
  messageId: string;
  expediteurId: string;
  destinataireId: string;
  message: string;
  date: string;
  lu: boolean;
};

export type SystemNotification = {
  notificationId: string;
  utilisateurId: string;
  titre: string;
  contenu: string;
  lu: boolean;
  date: string;
};

export type ConnectionLog = {
  connexionId: string;
  userId: string;
  appareil: string;
  ip: string;
  localisation: string;
  dateConnexion: string;
  statut: string;
};

export type AuditAction = {
  actionId: string;
  auteurId: string;
  module: string;
  ancienneValeur?: any;
  nouvelleValeur?: any;
  date: string;
};

export type AppSettings = {
  nomEtablissement: string;
  logo: string;
  devise: string;
  telephone: string;
  email: string;
  anneeScolaire: string;
  systemeNotation: string;
  couleursApplication: {
    primary: string;
    secondary: string;
  };
};

export type QrVerificationLog = {
  qrId: string;
  bulletinId: string;
  dateVerification: string;
  statutAuthenticite: boolean;
};

// Aliases pour compatibilité avec les composants existants
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
export type GradeEntry = GradeRecord;
export type AuditLog = AuditAction & {
  timestamp: string;
  userName: string;
  userId: string;
  action: string;
  details: string;
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
export type Payment = PaymentRecord;

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
