
/**
 * @fileOverview Service de persistance des données et logique métier.
 */
import { 
  User, 
  GradeRecord, 
  PaymentRecord, 
  AbsenceRecord, 
  DisciplineRecord, 
  ALL_CLASSES, 
  CoefficientEntry, 
  EmploiDuTemps, 
  ArchiveData 
} from './school-types';

export function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function saveToStorage<T>(key: string, data: T[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
  }
}

export function getCoefficient(classLevel: string, subjectId: string): number {
  const coeffs = getFromStorage<CoefficientEntry>('edutrack_coeffs');
  const entry = coeffs.find(c => c.classLevel === classLevel && c.subjectId === subjectId);
  return entry ? entry.value : 1;
}

export function getActiveYear(): string {
  if (typeof window === 'undefined') return "2025-2026";
  return localStorage.getItem('edutrack_active_year') || "2025-2026";
}

export function setActiveYear(year: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('edutrack_active_year', year);
    window.dispatchEvent(new Event('storage'));
  }
}

export function saveGrade(grade: GradeRecord) {
  const grades = getFromStorage<GradeRecord>('edutrack_grades');
  const index = grades.findIndex(g => 
    g.eleveId === grade.eleveId && 
    g.matiereId === grade.matiereId && 
    g.trimestre === grade.trimestre
  );

  if (index >= 0) {
    grades[index] = grade;
  } else {
    grades.push(grade);
  }
  saveToStorage('edutrack_grades', grades);
}

export function addStudent(studentData: Partial<User>) {
  const users = getFromStorage<User>('edutrack_users');
  const id = `ELV-${Math.floor(1000 + Math.random() * 9000)}`;
  const newStudent: User = {
    id,
    identifiant: id,
    name: (studentData.name || '').toUpperCase(),
    nom: (studentData.nom || '').toUpperCase(),
    prenom: studentData.prenom || '',
    role: 'Eleve',
    sexe: studentData.sexe || 'M',
    classLevel: studentData.classLevel,
    statutCompte: 'inactif',
    dateCreation: new Date().toISOString()
  };
  users.push(newStudent);
  saveToStorage('edutrack_users', users);
}

export function deleteStudent(id: string) {
  const users = getFromStorage<User>('edutrack_users').filter(u => u.id !== id);
  saveToStorage('edutrack_users', users);
}

export function registerUser(userData: any): string {
  const users = getFromStorage<User>('edutrack_users');
  const prefix = userData.role === 'Directeur' ? 'DIR' : userData.role === 'Enseignant' ? 'ENS' : 'USR';
  const id = `${prefix}-${Math.floor(100 + Math.random() * 899)}`;
  
  const newUser: User = {
    id,
    identifiant: id,
    name: `${userData.prenom} ${userData.nom}`.toUpperCase(),
    nom: userData.nom.toUpperCase(),
    prenom: userData.prenom,
    role: userData.role,
    sexe: userData.sexe,
    matieresAttribuees: userData.subjectId ? [userData.subjectId] : [],
    password: userData.password,
    statutCompte: 'actif',
    dateCreation: new Date().toISOString()
  };
  
  users.push(newUser);
  saveToStorage('edutrack_users', users);
  return id;
}

export function addPayment(payment: any) {
  const payments = getFromStorage<PaymentRecord>('edutrack_payments');
  payments.push({
    paiementId: `PAY-${Date.now()}`,
    ...payment,
    datePaiement: new Date().toISOString()
  });
  saveToStorage('edutrack_payments', payments);
}

export function addAbsence(absence: any) {
  const absences = getFromStorage<AbsenceRecord>('edutrack_absences');
  absences.push({
    absenceId: `ABS-${Date.now()}`,
    ...absence,
    justifiee: false
  });
  saveToStorage('edutrack_absences', absences);
}

export function addIncident(incident: any) {
  const incidents = getFromStorage<DisciplineRecord>('edutrack_discipline');
  incidents.push({
    incidentId: `INC-${Date.now()}`,
    ...incident,
    date: new Date().toISOString()
  });
  saveToStorage('edutrack_discipline', incidents);
}

export function closeAcademicYear(currentYear: string, nextYear: string) {
  const archives = getFromStorage<ArchiveData>('edutrack_archives');
  const users = getFromStorage<User>('edutrack_users');
  const grades = getFromStorage<GradeRecord>('edutrack_grades');
  
  const newArchive: ArchiveData = {
    year: currentYear,
    users: [...users],
    grades: [...grades],
    timestamp: new Date().toISOString()
  };
  
  archives.push(newArchive);
  saveToStorage('edutrack_archives', archives);
  
  // Reset pour la nouvelle année
  setActiveYear(nextYear);
  saveToStorage('edutrack_grades', []);
  saveToStorage('edutrack_absences', []);
  saveToStorage('edutrack_discipline', []);
  
  window.dispatchEvent(new Event('storage'));
}

export function getUnreadMessageCount(userId: string): number {
  const messages = getFromStorage<any>('edutrack_messages');
  return messages.filter((m: any) => m.receiverId === userId && !m.read).length;
}

export function sendMessage(msg: any) {
  const messages = getFromStorage<any>('edutrack_messages');
  messages.push({
    ...msg,
    timestamp: new Date().toISOString(),
    read: false
  });
  saveToStorage('edutrack_messages', messages);
}

export function markConversationAsRead(userId: string, senderId: string) {
  const messages = getFromStorage<any>('edutrack_messages');
  const updated = messages.map((m: any) => 
    (m.receiverId === userId && m.senderId === senderId) ? { ...m, read: true } : m
  );
  saveToStorage('edutrack_messages', updated);
}

export function getGlobalStats() {
  const students = getFromStorage<User>('edutrack_users').filter(u => u.role === 'Eleve');
  const payments = getFromStorage<PaymentRecord>('edutrack_payments');
  const totalRevenue = payments.reduce((acc, curr) => acc + curr.montant, 0);
  
  return {
    totalStudents: students.length,
    globalAverage: "12.45",
    totalRevenue: totalRevenue.toLocaleString() + " FCFA",
    attendanceRate: "94%"
  };
}
