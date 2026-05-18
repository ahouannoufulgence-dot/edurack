
import { Role, User } from './school-types';
import { createAuditLog } from './audit';

const SESSION_KEY = 'edutrack_session';
const LOCKOUT_KEY = 'edutrack_lockout';

export function getRoleFromId(id: string): Role | null {
  if (id.startsWith('DIR-')) return 'Directeur';
  if (id.startsWith('ENS-')) return 'Enseignant';
  if (id.startsWith('ELV-')) return 'Eleve';
  if (id.startsWith('PAR-')) return 'Parent';
  return null;
}

export function login(userId: string, password: string): { success: boolean; user?: User; message?: string } {
  const role = getRoleFromId(userId);
  
  if (!role) {
    return { success: false, message: "Identifiant invalide (Préfixe inconnu)." };
  }

  // Vérifier le lockout
  const attempts = JSON.parse(localStorage.getItem(LOCKOUT_KEY) || '{}');
  if (attempts[userId] >= 3) {
    createAuditLog(userId, 'Inconnu', 'LOCKOUT', `Compte verrouillé après 3 échecs`, null, null, 'high');
    return { success: false, message: "Compte verrouillé. Contactez le directeur." };
  }

  // Simulation de validation (tous les mots de passe "admin" fonctionnent pour la démo)
  if (password === 'admin' || password === '1234') {
    const user: User = {
      id: userId,
      name: `Utilisateur ${role}`,
      role: role,
      lastLogin: new Date().toISOString()
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    createAuditLog(user.id, user.name, 'LOGIN', `Connexion réussie en tant que ${role}`);
    
    // Reset attempts
    delete attempts[userId];
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(attempts));
    
    return { success: true, user };
  } else {
    attempts[userId] = (attempts[userId] || 0) + 1;
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(attempts));
    createAuditLog(userId, 'Inconnu', 'ACCESS_DENIED', `Échec de connexion (Tentative ${attempts[userId]}/3)`);
    return { success: false, message: "Identifiant ou mot de passe incorrect." };
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
}

export function logout() {
  const user = getCurrentUser();
  if (user) {
    createAuditLog(user.id, user.name, 'LOGOUT', "Déconnexion manuelle");
  }
  localStorage.removeItem(SESSION_KEY);
}
