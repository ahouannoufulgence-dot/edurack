
import { 
  User, Student, GradeRecord, PaymentRecord, ClassLevel, 
  ALL_CLASSES, SUBJECTS, Role 
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
  const users = getFromStorage<any>(KEYS.USERS);
  const fullName = `${data.prenom} ${data.nom}`.toUpperCase();
  
  // 1. Créer un utilisateur avec un ID temporaire
  const tempId = `NEW-${Math.random().toString(36).substr(2, 5)}`;
  const newUser = {
    id: tempId,
    identifiant: tempId,
    name: fullName,
    nom: data.nom.toUpperCase(),
    prenom: data.prenom,
    sexe: data.sexe,
    classLevel: data.classLevel,
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

  saveToStorage(KEYS.USERS, [...users, newUser]);
  
  // 2. Déclencher le recalcul global des identifiants
  syncIdentitySystem(data.role === 'Eleve' ? (data.classLevel as ClassLevel) : undefined);
  
  // 3. Récupérer l'identifiant final
  const updatedUsers = getFromStorage<any>(KEYS.USERS);
  const finalUser = updatedUsers.find((u: any) => u.name === fullName && u.role === data.role);
  
  const finalId = finalUser?.id || tempId;
  
  createAuditLog(
    finalId, 
    fullName, 
    'ACCOUNT_ACTIVATION', 
    `Inscription terminée pour le rôle ${data.role}. Identifiant final : ${finalId}`, 
    null, 
    finalUser, 
    'medium'
  );
  
  return finalId;
}

export function addStudent(studentData: any) {
  return registerUser({
    ...studentData,
    role: 'Eleve'
  });
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

  const totalStudents = students.length;
  
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
