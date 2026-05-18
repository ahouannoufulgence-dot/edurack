
import { ClassLevel, User } from './school-types';

const USERS_KEY = 'edutrack_users';
const GRADES_KEY = 'edutrack_grades';
const PAYMENTS_KEY = 'edutrack_payments';
const LOGS_KEY = 'edutrack_audit_logs';

/**
 * Assure la cohérence du système d'identité sans réattribuer les IDs existants.
 * Un identifiant une fois attribué ne change plus pour éviter de casser les sessions.
 */
export function syncIdentitySystem(targetClass?: ClassLevel) {
  if (typeof window === 'undefined') return;

  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  // On ne fait plus de réattribution massive par ordre alphabétique pour les élèves
  // car l'identifiant est maintenant leur code d'activation distribué par le directeur.
  
  // On s'assure juste que les nouveaux utilisateurs sans ID correct (TEMP-) reçoivent un ID propre
  let updatedUsers = users.map(user => {
    if (user.id.startsWith('TEMP-')) {
      const rolePrefix = user.role === 'Directeur' ? 'DIR' : user.role === 'Enseignant' ? 'ENS' : 'USR';
      const timestamp = Date.now().toString().slice(-4);
      const newId = `${rolePrefix}-${timestamp}-${Math.floor(Math.random() * 1000)}`;
      return { ...user, id: newId, identifiant: newId };
    }
    return user;
  });

  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  window.dispatchEvent(new Event('storage'));
}
