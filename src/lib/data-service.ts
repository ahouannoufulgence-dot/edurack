
import { 
  User, Student, GradeEntry, Payment, AuditLog, ClassLevel, 
  ALL_CLASSES, SUBJECTS, GradeRecord, PaymentRecord 
} from './school-types';
import { createAuditLog } from './audit';
import { syncIdentitySystem } from './identity-manager';

const KEYS = {
  USERS: 'edutrack_users',
  GRADES: 'edutrack_grades',
  PAYMENTS: 'edutrack_payments',
  STUDENTS: 'edutrack_eleves',
  LOGS: 'edutrack_audit_logs'
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

// GESTION DES ELEVES
export function addStudent(studentData: Partial<Student>) {
  const users = getFromStorage<User>(KEYS.USERS);
  const students = getFromStorage<Student>(KEYS.STUDENTS);
  
  const newStudent = {
    ...studentData,
    id: `TEMP-${Math.random().toString(36).substr(2, 9)}`, // ID temporaire avant sync
    role: 'Eleve',
    dateCreation: new Date().toISOString(),
    statutCompte: 'actif'
  } as Student;

  saveToStorage(KEYS.USERS, [...users, newStudent]);
  saveToStorage(KEYS.STUDENTS, [...students, newStudent]);
  
  // Recalcul immédiat des IDs par ordre alphabétique
  syncIdentitySystem(newStudent.classLevel);
  
  createAuditLog('SYSTEM', 'Admin', 'ADD_STUDENT', `Nouvel élève ajouté : ${newStudent.name}`, null, newStudent, 'medium');
}

// GESTION DES NOTES
export function saveGrade(grade: Partial<GradeRecord>) {
  const grades = getFromStorage<GradeRecord>(KEYS.GRADES);
  const newGrade = {
    ...grade,
    noteId: Math.random().toString(36).substr(2, 9),
    dateAjout: new Date().toISOString()
  } as GradeRecord;
  
  saveToStorage(KEYS.GRADES, [...grades, newGrade]);
  createAuditLog(grade.enseignantId!, 'Enseignant', 'GRADE_ENTRY', `Note saisie pour ${grade.eleveId}`, null, newGrade, 'low');
}

// GESTION DES PAIEMENTS
export function addPayment(payment: Partial<PaymentRecord>) {
  const payments = getFromStorage<PaymentRecord>(KEYS.PAYMENTS);
  const newPayment = {
    ...payment,
    paiementId: `PAY-${Date.now()}`,
    datePaiement: new Date().toISOString()
  } as PaymentRecord;
  
  saveToStorage(KEYS.PAYMENTS, [...payments, newPayment]);
  createAuditLog('SYSTEM', 'Comptabilité', 'PAYMENT_RECEIVED', `Paiement de ${payment.montant} reçu pour ${payment.eleveId}`, null, newPayment, 'low');
}

// CALCULS DASHBOARD
export function getGlobalStats() {
  const students = getFromStorage<User>(KEYS.USERS).filter(u => u.role === 'Eleve');
  const grades = getFromStorage<GradeRecord>(KEYS.GRADES);
  const payments = getFromStorage<PaymentRecord>(KEYS.PAYMENTS);

  const totalStudents = students.length;
  const avg = grades.length > 0 
    ? grades.reduce((acc, curr) => acc + curr.moyenne, 0) / grades.length 
    : 0;
  
  const totalRevenue = payments.reduce((acc, curr) => acc + curr.montant, 0);

  return {
    totalStudents,
    globalAverage: avg.toFixed(2),
    totalRevenue: totalRevenue.toLocaleString() + ' FCFA',
    attendanceRate: "94%" // Simulation
  };
}
