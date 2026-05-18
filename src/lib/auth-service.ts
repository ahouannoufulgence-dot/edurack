import { Role, User } from './school-types';
import { createAuditLog } from './audit';

const SESSION_KEY = 'edutrack_session';
const LOCKOUT_KEY = 'edutrack_lockout';
const USERS_KEY = 'edutrack_users';

interface StoredUser extends User {
  password?: string;
}

const DEMO_ACCOUNTS: StoredUser[] = [
  { 
    id: 'DIR-001', 
    name: 'M. le Directeur', 
    role: 'Directeur', 
    password: 'Admin2026' 
  },
  { 
    id: 'ENS-MATH-001', 
    name: 'Prof. Saliou (Maths)', 
    role: 'Enseignant', 
    password: 'Prof2026',
    subjectId: 'math'
  },
  { 
    id: 'ELV-3D-001', 
    name: 'Koffi Adebayo', 
    role: 'Eleve', 
    password: 'Eleve2026' 
  },
  { 
    id: 'PAR-001', 
    name: 'Parent Adebayo', 
    role: 'Parent', 
    password: 'Parent2026',
    studentId: 'ELV-3D-001'
  },
];

export function initializeDemoUsers(force = false) {
  if (typeof window === 'undefined') return;
  
  const existingRaw = localStorage.getItem(USERS_KEY);
  if (!existingRaw || force) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_ACCOUNTS));
    if (force) {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LOCKOUT_KEY);
      createAuditLog('SYSTEM', 'Admin', 'LOGIN', 'Réinitialisation complète du système effectuée', null, null, 'high');
    }
  }
}

export function getRoleFromId(id: string): Role | null {
  const upperId = id.trim().toUpperCase();
  if (upperId.startsWith('DIR-')) return 'Directeur';
  if (upperId.startsWith('ENS-')) return 'Enseignant';
  if (upperId.startsWith('ELV-')) return 'Eleve';
  if (upperId.startsWith('PAR-')) return 'Parent';
  return null;
}

export function login(userIdInput: string, passwordInput: string): { success: boolean; user?: User; message?: string } {
  initializeDemoUsers();
  
  const userId = userIdInput.trim();
  const password = passwordInput.trim();
  const role = getRoleFromId(userId);
  
  if (!role) {
    return { success: false, message: "Identifiant invalide. Utilisez le format DIR-..., ENS-..., ELV-... ou PAR-..." };
  }

  const attempts = JSON.parse(localStorage.getItem(LOCKOUT_KEY) || '{}');
  if (attempts[userId] >= 5) {
    createAuditLog(userId, 'Inconnu', 'LOCKOUT', `Compte verrouillé après 5 échecs`, null, null, 'critical');
    return { success: false, message: "Compte verrouillé. Contactez l'administration." };
  }

  const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const userMatch = users.find(u => u.id.toUpperCase() === userId.toUpperCase() && u.password === password);

  if (userMatch) {
    const { password: _, ...userSession } = userMatch;
    localStorage.setItem(SESSION_KEY, JSON.stringify(userSession));
    createAuditLog(userSession.id, userSession.name, 'LOGIN', `Connexion réussie : ${role}`);
    
    delete attempts[userId];
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(attempts));
    
    return { success: true, user: userSession as User };
  } else {
    attempts[userId] = (attempts[userId] || 0) + 1;
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(attempts));
    createAuditLog(userId, 'Inconnu', 'ACCESS_DENIED', `Échec de connexion (Tentative ${attempts[userId]}/5)`);
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
    createAuditLog(user.id, user.name, 'LOGOUT', "Déconnexion session");
  }
  localStorage.removeItem(SESSION_KEY);
}
