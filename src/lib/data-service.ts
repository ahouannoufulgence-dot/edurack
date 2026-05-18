
import { 
  User, Student, GradeRecord, PaymentRecord, ClassLevel, 
  ALL_CLASSES, SUBJECTS 
} from './school-types';
import { createAuditLog } from './audit';
import { syncIdentitySystem } from './identity-manager';

const KEYS = {
  USERS: 'edutrack_users',
  GRADES: 'edutrack_grades',
  PAYMENTS: 'edutrack_payments',
  AUDIT: 'edutrack_audit_logs'
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
export function addStudent(studentData: any) {
  const users = getFromStorage<User>(KEYS.USERS);
  
  const newStudent = {
    ...studentData,
    id: `TEMP-${Math.random().toString(36).substr(2, 9)}`,
    role: 'Eleve',
    statutCompte: 'actif',
    dateCreation: new Date().toISOString(),
    premierAcces: true
  } as User;

  saveToStorage(KEYS.USERS, [...users, newStudent]);
  
  // Recalcul immédiat des IDs par ordre alphabétique
  syncIdentitySystem(studentData.classLevel);
  
  createAuditLog('SYSTEM', 'Admin', 'ADD_STUDENT', `Nouvel élève ajouté : ${newStudent.name}`, null, newStudent, 'medium');
}

// GESTION DES NOTES
export function saveGrade(grade: Partial<GradeRecord>) {
  const grades = getFromStorage<GradeRecord>(KEYS.GRADES);
  
  // On cherche si une note existe déjà pour cet élève, cette matière et ce trimestre
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
  createAuditLog(grade.enseignantId!, 'Enseignant', 'GRADE_ENTRY', `Note enregistrée pour ${grade.eleveId}`, null, newGrade, 'low');
}

// GESTION DES PAIEMENTS
export function addPayment(payment: Partial<PaymentRecord>) {
  const payments = getFromStorage<PaymentRecord>(KEYS.PAYMENTS);
  const newPayment = {
    ...payment,
    paiementId: `PAY-${Date.now()}`,
    datePaiement: new Date().toISOString(),
    statut: 'payé'
  } as PaymentRecord;
  
  saveToStorage(KEYS.PAYMENTS, [...payments, newPayment]);
  createAuditLog('SYSTEM', 'Comptabilité', 'PAYMENT_RECEIVED', `Encaissement de ${payment.montant} FCFA pour l'élève ${payment.eleveId}`, null, newPayment, 'low');
}

// CALCULS DASHBOARD
export function getGlobalStats() {
  const students = getFromStorage<User>(KEYS.USERS).filter(u => u.role === 'Eleve');
  const grades = getFromStorage<GradeRecord>(KEYS.GRADES);
  const payments = getFromStorage<PaymentRecord>(KEYS.PAYMENTS);

  const totalStudents = students.length;
  
  // Moyenne de toutes les moyennes saisies
  const validGrades = grades.filter(g => g.moyenne > 0);
  const avg = validGrades.length > 0 
    ? validGrades.reduce((acc, curr) => acc + curr.moyenne, 0) / validGrades.length 
    : 0;
  
  const totalRevenue = payments.reduce((acc, curr) => acc + curr.montant, 0);

  return {
    totalStudents,
    globalAverage: avg.toFixed(2),
    totalRevenue: totalRevenue.toLocaleString() + ' FCFA',
    attendanceRate: "94%"
  };
}
