/**
 * @fileOverview Service de persistance des données.
 */
import { User, GradeRecord, PaymentRecord, AbsenceRecord, DisciplineRecord, ALL_CLASSES, CoefficientEntry, EmploiDuTemps, ArchiveData } from './school-types';

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
    name: studentData.name || '',
    nom: studentData.nom || '',
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

export function addPayment(payment: any) {
  const payments = getFromStorage<PaymentRecord>('edutrack_payments');
  payments.push({
    paiementId: `PAY-${Date.now()}`,
    ...payment,
    datePaiement: new Date().toISOString()
  });
  saveToStorage('edutrack_payments', payments);
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
