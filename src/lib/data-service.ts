
import { 
  User, GradeRecord, PaymentRecord, ClassLevel, 
  ALL_CLASSES, SUBJECTS, Role, AbsenceRecord, DisciplineRecord, CoefficientEntry 
} from './school-types';
import { createAuditLog } from './audit';

const KEYS = {
  USERS: 'edutrack_users',
  GRADES: 'edutrack_grades',
  PAYMENTS: 'edutrack_payments',
  AUDIT: 'edutrack_audit_logs',
  ABSENCES: 'edutrack_absences',
  DISCIPLINE: 'edutrack_discipline',
  MESSAGES: 'edutrack_messages',
  COEFFS: 'edutrack_coeffs'
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

/**
 * Système de coefficients dynamiques selon les séries béninoises
 */
export function getCoefficient(classLevel: string, subjectId: string): number {
  const coeffs = getFromStorage<CoefficientEntry>(KEYS.COEFFS);
  const customEntry = coeffs.find(c => c.classLevel === classLevel && c.subjectId === subjectId);
  if (customEntry) return customEntry.value;

  const isPremierCycle = ['6e', '5e', '4e', '3e'].some(c => classLevel.includes(c));
  const isSerieC = classLevel.includes(' C');
  const isSerieD = classLevel.includes(' D');
  const isSerieA = classLevel.includes(' A') || classLevel.includes(' B');

  const defaultCoeffs: Record<string, number> = {
    'math': isSerieC ? 6 : (isSerieD || isPremierCycle ? 4 : 2),
    'pc': isSerieC ? 5 : (isSerieD ? 4 : (isPremierCycle ? 2 : 1)),
    'svt': isSerieD ? 5 : (isPremierCycle || isSerieC ? 2 : 1),
    'fr': isSerieA ? 5 : 4,
    'philo': isSerieA ? 4 : 2,
    'ang': isSerieA ? 4 : 3,
    'hg': isSerieA ? 3 : 2,
    'eps': 1,
    'allemand': 2,
    'espagnol': 2,
    'ct': 1
  };

  return defaultCoeffs[subjectId] || 1;
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
  const users = getFromStorage<User>(KEYS.USERS);
  const fullName = `${data.prenom} ${data.nom}`.toUpperCase();
  
  const prefix = data.role === 'Eleve' ? 'ELV' : data.role === 'Enseignant' ? 'ENS' : 'DIR';
  const classCode = data.classLevel ? data.classLevel.replace(/\s/g, '').toUpperCase() : 'GEN';
  const sequence = (users.filter(u => u.role === data.role).length + 1).toString().padStart(3, '0');
  const finalId = `${prefix}-${classCode}-${sequence}`;

  const newUser: User = {
    id: finalId,
    identifiant: finalId,
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
    premierAcces: false
  };

  saveToStorage(KEYS.USERS, [...users, newUser]);
  createAuditLog(finalId, fullName, 'STUDENT_ADD', `Création manuelle du compte ${finalId}`);
  return finalId;
}

export function addStudent(data: any) {
  return registerUser({ ...data, role: 'Eleve' });
}

export function saveGrade(grade: Partial<GradeRecord>) {
  const grades = getFromStorage<GradeRecord>(KEYS.GRADES);
  const existingIdx = grades.findIndex(g => 
    g.eleveId === grade.eleveId && g.matiereId === grade.matiereId && g.trimestre === grade.trimestre
  );
  
  const newGrade = { 
    ...grade, 
    noteId: grade.noteId || `GRD-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    dateAjout: new Date().toISOString() 
  } as GradeRecord;

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

export function addAbsence(absence: Partial<AbsenceRecord>) {
  const absences = getFromStorage<AbsenceRecord>(KEYS.ABSENCES);
  const newAbsence = {
    ...absence,
    absenceId: `ABS-${Date.now()}`,
    date: absence.date || new Date().toISOString().split('T')[0]
  } as AbsenceRecord;
  saveToStorage(KEYS.ABSENCES, [...absences, newAbsence]);
}

export function addIncident(incident: Partial<DisciplineRecord>) {
  const incidents = getFromStorage<DisciplineRecord>(KEYS.DISCIPLINE);
  const newIncident = {
    ...incident,
    incidentId: `DIS-${Date.now()}`,
    date: new Date().toISOString()
  } as DisciplineRecord;
  saveToStorage(KEYS.DISCIPLINE, [...incidents, newIncident]);
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

export function getUnreadMessageCount(userId: string): number {
  const messages = getFromStorage<any>(KEYS.MESSAGES);
  return messages.filter((m: any) => m.receiverId === userId && !m.read).length;
}

export function markConversationAsRead(userId: string, contactId: string) {
  const messages = getFromStorage<any>(KEYS.MESSAGES);
  let changed = false;
  const updated = messages.map((m: any) => {
    if (m.receiverId === userId && m.senderId === contactId && !m.read) {
      changed = true;
      return { ...m, read: true };
    }
    return m;
  });
  if (changed) {
    saveToStorage(KEYS.MESSAGES, updated);
  }
}

export function getGlobalStats() {
  const users = getFromStorage<User>(KEYS.USERS);
  const students = users.filter(u => u.role === 'Eleve');
  const grades = getFromStorage<GradeRecord>(KEYS.GRADES);
  const payments = getFromStorage<PaymentRecord>(KEYS.PAYMENTS);
  const absences = getFromStorage<AbsenceRecord>(KEYS.ABSENCES);

  let totalPoints = 0;
  let totalCoeffs = 0;
  
  grades.forEach(g => {
    totalPoints += (g.moyenne * g.coefficient);
    totalCoeffs += g.coefficient;
  });

  const avg = totalCoeffs > 0 ? totalPoints / totalCoeffs : 0;
  const totalRevenue = payments.reduce((acc, curr) => acc + (curr.montant || 0), 0);
  const attendanceRate = students.length > 0 ? (98 - (absences.length / students.length * 0.5)).toFixed(1) + "%" : "100%";

  return {
    totalStudents: students.length,
    globalAverage: avg.toFixed(2),
    totalRevenue: totalRevenue.toLocaleString() + ' FCFA',
    attendanceRate
  };
}
