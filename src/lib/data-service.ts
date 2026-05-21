
import { 
  User, GradeRecord, PaymentRecord, ClassLevel, 
  ALL_CLASSES, SUBJECTS, Role, AbsenceRecord, DisciplineRecord, CoefficientEntry,
  ArchiveData, EmploiDuTemps
} from './school-types';
import { createAuditLog } from './audit';
import { getNextClass } from './school-logic';

const KEYS = {
  USERS: 'edutrack_users',
  GRADES: 'edutrack_grades',
  PAYMENTS: 'edutrack_payments',
  AUDIT: 'edutrack_audit_logs',
  ABSENCES: 'edutrack_absences',
  DISCIPLINE: 'edutrack_discipline',
  MESSAGES: 'edutrack_messages',
  COEFFS: 'edutrack_coeffs',
  SCHEDULE: 'edutrack_schedule',
  CONFIG: 'edutrack_config',
  ARCHIVES: 'edutrack_archives'
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

export function getActiveYear(): string {
  if (typeof window === 'undefined') return '2025-2026';
  const config = JSON.parse(localStorage.getItem(KEYS.CONFIG) || '{"activeYear": "2025-2026"}');
  return config.activeYear;
}

export function setActiveYear(year: string) {
  if (typeof window === 'undefined') return;
  const config = JSON.parse(localStorage.getItem(KEYS.CONFIG) || '{}');
  localStorage.setItem(KEYS.CONFIG, JSON.stringify({ ...config, activeYear: year }));
  window.dispatchEvent(new Event('storage'));
}

export function closeAcademicYear(currentYear: string, nextYear: string) {
  if (typeof window === 'undefined') return;

  const archive: ArchiveData = {
    year: currentYear,
    users: getFromStorage<User>(KEYS.USERS),
    grades: getFromStorage<GradeRecord>(KEYS.GRADES),
    absences: getFromStorage<AbsenceRecord>(KEYS.ABSENCES),
    discipline: getFromStorage<DisciplineRecord>(KEYS.DISCIPLINE),
    payments: getFromStorage<PaymentRecord>(KEYS.PAYMENTS),
    schedule: getFromStorage<EmploiDuTemps>(KEYS.SCHEDULE),
    timestamp: new Date().toISOString()
  };

  const archives = getFromStorage<ArchiveData>(KEYS.ARCHIVES);
  saveToStorage(KEYS.ARCHIVES, [...archives, archive]);

  const users = getFromStorage<User>(KEYS.USERS);
  const updatedUsers = users.map(user => {
    if (user.role === 'Eleve' && user.classLevel !== 'Diplômé') {
      return {
        ...user,
        classLevel: getNextClass(user.classLevel || ''),
        classeId: getNextClass(user.classLevel || '')
      };
    }
    return user;
  });

  saveToStorage(KEYS.USERS, updatedUsers);

  saveToStorage(KEYS.GRADES, []);
  saveToStorage(KEYS.ABSENCES, []);
  saveToStorage(KEYS.DISCIPLINE, []);
  saveToStorage(KEYS.PAYMENTS, []);
  saveToStorage(KEYS.SCHEDULE, []);
  
  setActiveYear(nextYear);

  createAuditLog(
    'SYSTEM', 
    'Directeur', 
    'YEAR_CLOSURE', 
    `Clôture de l'année ${currentYear} et ouverture de ${nextYear}`,
    currentYear,
    nextYear,
    'critical'
  );
}

export function getCoefficient(classLevel: string, subjectId: string): number {
  const coeffs = getFromStorage<CoefficientEntry>(KEYS.COEFFS);
  const customEntry = coeffs.find(c => c.classLevel === classLevel && c.subjectId === subjectId);
  return customEntry ? customEntry.value : 0;
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
  createAuditLog(finalId, fullName, 'STUDENT_ADD', `Création du compte ${finalId}`);
  return finalId;
}

export function deleteStudent(studentId: string) {
  const users = getFromStorage<User>(KEYS.USERS);
  const updatedUsers = users.filter(u => u.id !== studentId);
  saveToStorage(KEYS.USERS, updatedUsers);
  
  const grades = getFromStorage<GradeRecord>(KEYS.GRADES);
  saveToStorage(KEYS.GRADES, grades.filter(g => g.eleveId !== studentId));
  
  const payments = getFromStorage<PaymentRecord>(KEYS.PAYMENTS);
  saveToStorage(KEYS.PAYMENTS, payments.filter(p => p.eleveId !== studentId));

  createAuditLog('SYSTEM', 'Directeur', 'STUDENT_DELETE', `Suppression définitive de l'élève ${studentId}`, null, null, 'high');
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
    anneeScolaire: getActiveYear()
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
