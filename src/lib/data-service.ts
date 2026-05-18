
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
  DISCIPLINE: 'edutrack_discipline',
  MESSAGES: 'edutrack_messages'
};

export function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function saveToStorage<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new Event('storage'));
}

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
    const tempId = `TEMP-${Date.now()}`;
    
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
      matieresAttribuees: data.subjectId ? [data.subjectId] : [],
      role: data.role,
      password: data.password || 'Pass1234',
      questionSecrete: data.secretQuestion,
      reponseSecrete: data.secretAnswer,
      statutCompte: 'actif',
      dateCreation: new Date().toISOString(),
      premierAcces: false,
      idHistory: []
    };

    saveToStorage(KEYS.USERS, [...users, newUser]);
    
    // Déterminer la classe cible pour la synchro si c'est un élève
    const syncClass = data.role === 'Eleve' ? (data.classLevel as ClassLevel) : undefined;
    syncIdentitySystem(syncClass);
    
    const updatedUsers = getFromStorage<User>(KEYS.USERS);
    const finalUser = updatedUsers.find(u => u.name === fullName && u.role === data.role);
    
    createAuditLog(
      finalUser?.id || tempId,
      fullName,
      'STUDENT_ADD',
      `Création de compte réussie : ${data.role}`
    );

    return finalUser?.id || tempId;
  } catch (error) {
    console.error("Erreur inscription:", error);
    throw error;
  }
}

// Assurer l'existence de addStudent pour corriger l'erreur d'importation
export function addStudent(data: any) {
  return registerUser({ ...data, role: 'Eleve' });
}

export function addAbsence(absence: Partial<AbsenceRecord>) {
  const absences = getFromStorage<AbsenceRecord>(KEYS.ABSENCES);
  const newAbsence = { ...absence, absenceId: `ABS-${Date.now()}` } as AbsenceRecord;
  saveToStorage(KEYS.ABSENCES, [newAbsence, ...absences]);
}

export function addIncident(incident: Partial<DisciplineRecord>) {
  const incidents = getFromStorage<DisciplineRecord>(KEYS.DISCIPLINE);
  const newIncident = { ...incident, incidentId: `DIS-${Date.now()}` } as DisciplineRecord;
  saveToStorage(KEYS.DISCIPLINE, [newIncident, ...incidents]);
}

export function saveGrade(grade: Partial<GradeRecord>) {
  const grades = getFromStorage<GradeRecord>(KEYS.GRADES);
  const existingIdx = grades.findIndex(g => 
    g.eleveId === grade.eleveId && g.matiereId === grade.matiereId && g.trimestre === grade.trimestre
  );
  const newGrade = { ...grade, dateAjout: new Date().toISOString() } as GradeRecord;
  if (existingIdx > -1) grades[existingIdx] = newGrade;
  else grades.push(newGrade);
  saveToStorage(KEYS.GRADES, grades);
}

export function addPayment(payment: Partial<PaymentRecord>) {
  const payments = getFromStorage<PaymentRecord>(KEYS.PAYMENTS);
  const newPayment = {
    ...payment,
    paiementId: `PAY-${Date.now()}`,
    datePaiement: new Date().toISOString(),
    anneeScolaire: '2025-2026'
  } as PaymentRecord;
  saveToStorage(KEYS.PAYMENTS, [newPayment, ...payments]);
}

export function sendMessage(msg: { senderId: string, receiverId: string, content: string }) {
  const messages = getFromStorage<any>(KEYS.MESSAGES);
  const newMsg = {
    id: `MSG-${Date.now()}`,
    ...msg,
    timestamp: new Date().toISOString(),
    read: false
  };
  saveToStorage(KEYS.MESSAGES, [newMsg, ...messages]);
}

export function getGlobalStats() {
  const users = getFromStorage<User>(KEYS.USERS);
  const students = users.filter(u => u.role === 'Eleve');
  const grades = getFromStorage<GradeRecord>(KEYS.GRADES);
  const payments = getFromStorage<PaymentRecord>(KEYS.PAYMENTS);
  const absences = getFromStorage<AbsenceRecord>(KEYS.ABSENCES);

  const avg = grades.length > 0 ? grades.reduce((acc, curr) => acc + curr.moyenne, 0) / grades.length : 0;
  const totalRevenue = payments.reduce((acc, curr) => acc + (curr.montant || 0), 0);
  const attendanceRate = students.length > 0 ? (98 - (absences.length / students.length * 0.5)).toFixed(1) + "%" : "100%";

  return {
    totalStudents: students.length,
    globalAverage: avg.toFixed(2),
    totalRevenue: totalRevenue.toLocaleString() + ' FCFA',
    attendanceRate
  };
}
