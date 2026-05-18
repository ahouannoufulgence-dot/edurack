
import { 
  User, GradeRecord, PaymentRecord, ClassLevel, 
  ALL_CLASSES, SUBJECTS, Role, AbsenceRecord, DisciplineRecord 
} from './school-types';
import { createAuditLog } from './audit';
import { syncIdentitySystem } from './identity-manager';

const KEYS = {
  USERS: 'edutrack_users',
  GRADES: 'edutrack_grades',
  PAYMENTS: 'edutrack_payments',
  AUDIT: 'edutrack_audit_logs',
  ABSENCES: 'edutrack_absences',
  DISCIPLINE: 'edutrack_discipline'
};

export function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function saveToStorage<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Fonction universelle d'inscription pour tous les rôles.
 * Déclenche automatiquement la synchronisation du système d'identité.
 */
export function registerUser(data: {
  role: Role;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  classLevel?: string;
  subjectId?: string;
  password?: string;
  secretQuestion?: string;
  secretAnswer?: string;
}) {
  try {
    const users = getFromStorage<User>(KEYS.USERS);
    const fullName = `${data.prenom} ${data.nom}`.toUpperCase();
    
    // Création d'un ID temporaire pour le stockage initial
    const tempId = `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    const newUser: User = {
      id: tempId,
      identifiant: tempId,
      name: fullName,
      nom: data.nom.toUpperCase(),
      prenom: data.prenom,
      sexe: data.sexe,
      classLevel: data.classLevel,
      classeId: data.classLevel,
      subjectId: data.subjectId,
      role: data.role,
      password: data.password || 'Pass1234',
      questionSecrete: data.secretQuestion,
      reponseSecrete: data.secretAnswer,
      statutCompte: 'actif',
      dateCreation: new Date().toISOString(),
      premierAcces: false,
      idHistory: []
    };

    // Sauvegarde initiale
    saveToStorage(KEYS.USERS, [...users, newUser]);
    
    // Déclenchement du recalcul alphabétique global
    // Si c'est un élève, on cible sa classe, sinon on synchronise tout (directeurs/profs)
    syncIdentitySystem(data.role === 'Eleve' ? (data.classLevel as ClassLevel) : undefined);
    
    // Récupération de l'ID final après synchronisation
    const updatedUsers = getFromStorage<User>(KEYS.USERS);
    const finalUser = updatedUsers.find(u => u.name === fullName && u.role === data.role);
    const finalId = finalUser?.id || tempId;
    
    createAuditLog(
      finalId, 
      fullName, 
      'ACCOUNT_ACTIVATION', 
      `Inscription terminée pour le rôle ${data.role}. Identifiant généré : ${finalId}`, 
      null, 
      finalUser, 
      'medium'
    );
    
    return finalId;
  } catch (error) {
    console.error("Erreur technique lors de l'inscription:", error);
    throw error;
  }
}

/**
 * Alias pour l'ajout d'élève utilisé dans StudentManager.
 */
export function addStudent(data: any) {
  return registerUser({
    role: 'Eleve',
    nom: data.nom,
    prenom: data.prenom,
    sexe: data.sexe,
    classLevel: data.classLevel
  });
}

export function addAbsence(absence: Partial<AbsenceRecord>) {
  const absences = getFromStorage<AbsenceRecord>(KEYS.ABSENCES);
  const newAbsence = {
    ...absence,
    absenceId: `ABS-${Date.now()}`,
    date: absence.date || new Date().toISOString()
  } as AbsenceRecord;
  saveToStorage(KEYS.ABSENCES, [newAbsence, ...absences]);
  createAuditLog(absence.eleveId || 'SYSTEM', 'Surveillant', 'SYSTEM_RESET', `Absence enregistrée pour ${absence.eleveId}`);
}

export function addIncident(incident: Partial<DisciplineRecord>) {
  const incidents = getFromStorage<DisciplineRecord>(KEYS.DISCIPLINE);
  const newIncident = {
    ...incident,
    incidentId: `DIS-${Date.now()}`,
    date: incident.date || new Date().toISOString()
  } as DisciplineRecord;
  saveToStorage(KEYS.DISCIPLINE, [newIncident, ...incidents]);
  createAuditLog(incident.eleveId || 'SYSTEM', 'CPE', 'SECURITY_ALERT', `Incident disciplinaire : ${incident.type} pour ${incident.eleveId}`, null, null, 'high');
}

export function saveGrade(grade: Partial<GradeRecord>) {
  const grades = getFromStorage<GradeRecord>(KEYS.GRADES);
  const existingIdx = grades.findIndex(g => 
    g.eleveId === grade.eleveId && 
    g.matiereId === grade.matiereId && 
    g.trimestre === grade.trimestre
  );

  const newGrade = {
    ...grade,
    noteId: grade.noteId || Math.random().toString(36).substr(2, 9),
    dateAjout: new Date().toISOString()
  } as GradeRecord;

  if (existingIdx > -1) {
    grades[existingIdx] = newGrade;
  } else {
    grades.push(newGrade);
  }
  saveToStorage(KEYS.GRADES, grades);
}

export function addPayment(payment: Partial<PaymentRecord>) {
  const payments = getFromStorage<PaymentRecord>(KEYS.PAYMENTS);
  const newPayment = {
    ...payment,
    paiementId: `PAY-${Date.now()}`,
    datePaiement: new Date().toISOString(),
    statut: 'payé'
  } as PaymentRecord;
  saveToStorage(KEYS.PAYMENTS, [...payments, newPayment]);
}

export function getGlobalStats() {
  const users = getFromStorage<User>(KEYS.USERS);
  const students = users.filter(u => u.role === 'Eleve');
  const grades = getFromStorage<GradeRecord>(KEYS.GRADES);
  const payments = getFromStorage<PaymentRecord>(KEYS.PAYMENTS);
  const absences = getFromStorage<AbsenceRecord>(KEYS.ABSENCES);

  const totalStudents = students.length;
  const validGrades = grades.filter(g => g.moyenne > 0);
  const avg = validGrades.length > 0 
    ? validGrades.reduce((acc, curr) => acc + curr.moyenne, 0) / validGrades.length 
    : 0;
  const totalRevenue = payments.reduce((acc, curr) => acc + (curr.montant || 0), 0);
  
  const attendanceRate = totalStudents > 0 ? (98 - (absences.length / totalStudents * 0.5)).toFixed(1) + "%" : "100%";

  return {
    totalStudents,
    globalAverage: avg.toFixed(2),
    totalRevenue: totalRevenue.toLocaleString() + ' FCFA',
    attendanceRate
  };
}
