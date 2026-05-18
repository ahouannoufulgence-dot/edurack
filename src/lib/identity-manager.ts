
import { ClassLevel, User } from './school-types';

const USERS_KEY = 'edutrack_users';
const GRADES_KEY = 'edutrack_grades';
const PAYMENTS_KEY = 'edutrack_payments';
const LOGS_KEY = 'edutrack_audit_logs';

/**
 * Recalcule tous les identifiants par ordre alphabétique selon le rôle
 * et met à jour toutes les références dans les autres tables (cascade).
 */
export function syncIdentitySystem(targetClass?: ClassLevel) {
  if (typeof window === 'undefined') return;

  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const grades: any[] = JSON.parse(localStorage.getItem(GRADES_KEY) || '[]');
  const payments: any[] = JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]');
  const logs: any[] = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');

  let updatedUsers = [...users];
  let updatedGrades = [...grades];
  let updatedPayments = [...payments];
  let updatedLogs = [...logs];

  // Helper pour mettre à jour les références lors d'un changement d'ID
  const updateReferences = (oldId: string, newId: string) => {
    updatedGrades = updatedGrades.map(g => g.eleveId === oldId ? { ...g, eleveId: newId } : g);
    updatedPayments = updatedPayments.map(p => p.eleveId === oldId ? { ...p, eleveId: newId } : p);
    updatedLogs = updatedLogs.map(l => l.userId === oldId ? { ...l, userId: newId } : l);
  };

  // 1. Recalcul pour les ÉLÈVES
  const classesToProcess = targetClass 
    ? [targetClass] 
    : Array.from(new Set(updatedUsers.filter(u => u.role === 'Eleve').map(u => u.classLevel || u.classeId || 'INCONNU')));

  classesToProcess.forEach(currentClass => {
    const students = updatedUsers
      .filter(u => u.role === 'Eleve' && (u.classLevel === currentClass || u.classeId === currentClass))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' }));

    const classCode = currentClass.replace(/\s/g, '').toUpperCase();

    students.forEach((student, index) => {
      const newId = `ELV-${classCode}-${(index + 1).toString().padStart(3, '0')}`;
      if (student.id !== newId) {
        const oldId = student.id;
        const userIndex = updatedUsers.findIndex(u => u.id === oldId);
        if (userIndex !== -1) {
          updatedUsers[userIndex] = {
            ...updatedUsers[userIndex],
            id: newId,
            identifiant: newId,
            idHistory: Array.from(new Set([...(student.idHistory || []), oldId]))
          };
          updateReferences(oldId, newId);
        }
      }
    });
  });

  // 2. Recalcul pour les ENSEIGNANTS
  const teacherRoles = updatedUsers.filter(u => u.role === 'Enseignant');
  const subjectIds = Array.from(new Set(teacherRoles.map(u => (u.subjectId || 'GEN').toUpperCase())));

  subjectIds.forEach(subId => {
    const teachers = updatedUsers
      .filter(u => u.role === 'Enseignant' && (u.subjectId || 'GEN').toUpperCase() === subId)
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr'));

    teachers.forEach((teacher, index) => {
      const newId = `ENS-${subId}-${(index + 1).toString().padStart(3, '0')}`;
      if (teacher.id !== newId) {
        const oldId = teacher.id;
        const userIndex = updatedUsers.findIndex(u => u.id === oldId);
        if (userIndex !== -1) {
          updatedUsers[userIndex] = {
            ...updatedUsers[userIndex],
            id: newId,
            identifiant: newId,
            idHistory: Array.from(new Set([...(teacher.idHistory || []), oldId]))
          };
          updateReferences(oldId, newId);
        }
      }
    });
  });

  // 3. Recalcul pour les DIRECTEURS
  const directors = updatedUsers
    .filter(u => u.role === 'Directeur')
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr'));

  directors.forEach((dir, index) => {
    const newId = `DIR-${(index + 1).toString().padStart(3, '0')}`;
    if (dir.id !== newId) {
      const oldId = dir.id;
      const userIndex = updatedUsers.findIndex(u => u.id === oldId);
      if (userIndex !== -1) {
        updatedUsers[userIndex] = {
          ...updatedUsers[userIndex],
          id: newId,
          identifiant: newId,
          idHistory: Array.from(new Set([...(dir.idHistory || []), oldId]))
        };
        updateReferences(oldId, newId);
      }
    }
  });

  // Sauvegarde globale
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  localStorage.setItem(GRADES_KEY, JSON.stringify(updatedGrades));
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(updatedPayments));
  localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
  
  window.dispatchEvent(new Event('storage'));
}
