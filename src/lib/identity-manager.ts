import { User, GradeEntry, AuditLog, Payment, ClassLevel } from './school-types';
import { createAuditLog } from './audit';

const USERS_KEY = 'edutrack_users';
const GRADES_KEY = 'edutrack_grades';
const PAYMENTS_KEY = 'edutrack_payments';
const LOGS_KEY = 'edutrack_audit_logs';

/**
 * Recalcule tous les identifiants d'une classe spécifique par ordre alphabétique
 * et met à jour toutes les références dans les autres tables.
 */
export function syncIdentitySystem(classLevel?: ClassLevel) {
  if (typeof window === 'undefined') return;

  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const grades: GradeEntry[] = JSON.parse(localStorage.getItem(GRADES_KEY) || '[]');
  const payments: Payment[] = JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]');
  const logs: AuditLog[] = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');

  let updatedUsers = [...users];
  let updatedGrades = [...grades];
  let updatedPayments = [...payments];
  let updatedLogs = [...logs];

  // 1. Recalcul pour les Élèves d'une classe ou de toutes
  const classesToProcess = classLevel ? [classLevel] : Array.from(new Set(users.filter(u => u.role === 'Eleve').map(u => u.classLevel!)));

  classesToProcess.forEach(currentClass => {
    const students = updatedUsers
      .filter(u => u.role === 'Eleve' && u.classLevel === currentClass)
      .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));

    const classCode = currentClass.replace(/\s/g, '').toUpperCase();

    students.forEach((student, index) => {
      const newId = `ELV-${classCode}-${(index + 1).toString().padStart(3, '0')}`;
      
      if (student.id !== newId) {
        const oldId = student.id;
        
        // Mise à jour de l'utilisateur
        const userIndex = updatedUsers.findIndex(u => u.id === oldId);
        if (userIndex !== -1) {
          updatedUsers[userIndex] = {
            ...updatedUsers[userIndex],
            id: newId,
            idHistory: Array.from(new Set([...(student.idHistory || []), oldId]))
          };
        }

        // Mise à jour des références
        updatedGrades = updatedGrades.map(g => g.studentId === oldId ? { ...g, studentId: newId } : g);
        updatedPayments = updatedPayments.map(p => p.studentId === oldId ? { ...p, studentId: newId } : p);
        updatedLogs = updatedLogs.map(l => l.userId === oldId ? { ...l, userId: newId } : l);

        createAuditLog('SYSTEM', 'IdentityManager', 'IDENTITY_RECALCULATION', `Identifiant élève recalculé : ${oldId} -> ${newId}`, oldId, newId, 'low');
      }
    });
  });

  // 2. Recalcul pour les Enseignants (Par matière)
  const subjects = Array.from(new Set(users.filter(u => u.role === 'Enseignant').map(u => u.subjectId!)));
  subjects.forEach(subId => {
    const teachers = updatedUsers
      .filter(u => u.role === 'Enseignant' && u.subjectId === subId)
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

    teachers.forEach((teacher, index) => {
      const newId = `ENS-${subId.toUpperCase()}-${(index + 1).toString().padStart(3, '0')}`;
      if (teacher.id !== newId) {
        const oldId = teacher.id;
        const userIndex = updatedUsers.findIndex(u => u.id === oldId);
        updatedUsers[userIndex] = { ...updatedUsers[userIndex], id: newId, idHistory: Array.from(new Set([...(teacher.idHistory || []), oldId])) };
        updatedLogs = updatedLogs.map(l => l.userId === oldId ? { ...l, userId: newId } : l);
      }
    });
  });

  // 3. Recalcul pour les Parents
  const parents = updatedUsers
    .filter(u => u.role === 'Parent')
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  parents.forEach((parent, index) => {
    const newId = `PAR-${(index + 1).toString().padStart(3, '0')}`;
    if (parent.id !== newId) {
      const oldId = parent.id;
      const userIndex = updatedUsers.findIndex(u => u.id === oldId);
      updatedUsers[userIndex] = { ...updatedUsers[userIndex], id: newId, idHistory: Array.from(new Set([...(parent.idHistory || []), oldId])) };
      updatedLogs = updatedLogs.map(l => l.userId === oldId ? { ...l, userId: newId } : l);
    }
  });

  // Sauvegarde globale
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  localStorage.setItem(GRADES_KEY, JSON.stringify(updatedGrades));
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(updatedPayments));
  localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
}