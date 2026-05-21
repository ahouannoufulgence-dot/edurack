
/**
 * @fileOverview Service de persistance des données EduTrack Pro.
 */
import { User, GradeRecord, PaymentRecord, AbsenceRecord, DisciplineRecord, ALL_CLASSES, CoefficientEntry, EmploiDuTemps, ArchiveData } from './school-types';

export function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return [];
  }
}

export function saveToStorage<T>(key: string, data: T[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
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

export function saveGrade(grade: Partial<GradeRecord>) {
  const grades = getFromStorage<GradeRecord>('edutrack_grades');
  const index = grades.findIndex(g => 
    g.eleveId === grade.eleveId && 
    g.matiereId === grade.matiereId && 
    g.trimestre === grade.trimestre
  );

  const newGrade = {
    ...grade,
    gradeId: grade.gradeId || `GRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    dateAjout: new Date().toISOString()
  } as GradeRecord;

  if (index >= 0) {
    grades[index] = newGrade;
  } else {
    grades.push(newGrade);
  }
  saveToStorage('edutrack_grades', grades);
}

export function registerUser(userData: any): string {
  const users = getFromStorage<User>('edutrack_users');
  const id = `${userData.role.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  
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
    classLevel: studentData.classLevel as any,
    statutCompte: 'inactif',
    dateCreation: new Date().toISOString()
  };
  users.push(newStudent);
  saveToStorage('edutrack_users', users);
}

export function deleteStudent(id: string) {
  const users = getFromStorage<User>('edutrack_users').filter(u => u.id !== id);
  saveToStorage('edutrack_users', users);
  
  const grades = getFromStorage<GradeRecord>('edutrack_grades').filter(g => g.eleveId !== id);
  saveToStorage('edutrack_grades', grades);
  
  const payments = getFromStorage<PaymentRecord>('edutrack_payments').filter(p => p.eleveId !== id);
  saveToStorage('edutrack_payments', payments);
}

export function addPayment(payment: any) {
  const payments = getFromStorage<PaymentRecord>('edutrack_payments');
  const newPayment: PaymentRecord = {
    paiementId: `PAY-${Date.now()}`,
    eleveId: payment.eleveId,
    montant: payment.montant,
    typePaiement: payment.typePaiement,
    datePaiement: new Date().toISOString()
  };
  payments.push(newPayment);
  saveToStorage('edutrack_payments', payments);
}

export function addAbsence(abs: any) {
  const absences = getFromStorage<AbsenceRecord>('edutrack_absences');
  const newAbs: AbsenceRecord = {
    absenceId: `ABS-${Date.now()}`,
    eleveId: abs.eleveId,
    date: abs.date,
    motif: abs.motif,
    justifiee: false
  };
  absences.push(newAbs);
  saveToStorage('edutrack_absences', absences);
}

export function addIncident(inc: any) {
  const incidents = getFromStorage<DisciplineRecord>('edutrack_discipline');
  const newInc: DisciplineRecord = {
    incidentId: `INC-${Date.now()}`,
    eleveId: inc.eleveId,
    type: inc.type,
    sanction: inc.sanction,
    description: inc.description,
    date: new Date().toISOString()
  };
  incidents.push(newInc);
  saveToStorage('edutrack_discipline', incidents);
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

export function getUnreadMessageCount(userId: string): number {
  const messages = getFromStorage<any>('edutrack_messages');
  return messages.filter((m: any) => m.receiverId === userId && !m.read).length;
}

export function markConversationAsRead(currentUserId: string, otherUserId: string) {
  const messages = getFromStorage<any>('edutrack_messages');
  const updated = messages.map((m: any) => {
    if (m.receiverId === currentUserId && m.senderId === otherUserId) {
      return { ...m, read: true };
    }
    return m;
  });
  saveToStorage('edutrack_messages', updated);
}

export function getGlobalStats() {
  const students = getFromStorage<User>('edutrack_users').filter(u => u.role === 'Eleve');
  const payments = getFromStorage<PaymentRecord>('edutrack_payments');
  const grades = getFromStorage<GradeRecord>('edutrack_grades');
  
  const totalRevenue = payments.reduce((acc, curr) => acc + curr.montant, 0);
  const avg = grades.length > 0 ? grades.reduce((acc, curr) => acc + curr.moyenne, 0) / grades.length : 0;
  
  return {
    totalStudents: students.length,
    globalAverage: avg.toFixed(2),
    totalRevenue: totalRevenue.toLocaleString() + " FCFA",
    attendanceRate: "96%"
  };
}

export function closeAcademicYear(currentYear: string, nextYear: string) {
  const archives = getFromStorage<ArchiveData>('edutrack_archives');
  const users = getFromStorage<User>('edutrack_users');
  const grades = getFromStorage<GradeRecord>('edutrack_grades');
  
  archives.push({
    year: currentYear,
    users,
    grades,
    timestamp: new Date().toISOString()
  });
  
  saveToStorage('edutrack_archives', archives);
  
  const promotedUsers = users.map(u => {
    if (u.role === 'Eleve' && u.classLevel) {
      const idx = ALL_CLASSES.indexOf(u.classLevel);
      return {
        ...u,
        classLevel: idx < ALL_CLASSES.length - 1 ? ALL_CLASSES[idx + 1] : u.classLevel
      };
    }
    return u;
  });
  
  saveToStorage('edutrack_users', promotedUsers);
  saveToStorage('edutrack_grades', []);
  saveToStorage('edutrack_absences', []);
  saveToStorage('edutrack_discipline', []);
  setActiveYear(nextYear);
}
