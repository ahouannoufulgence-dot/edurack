
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

/**
 * Initialise les comptes de démo si aucun utilisateur n'existe.
 */
function initializeDemoUsers() {
  if (typeof window !== 'undefined' && !localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_ACCOUNTS));
  }
}

export function getRoleFromId(id: string): Role | null {
  if (id.startsWith('DIR-')) return 'Directeur';
  if (id.startsWith('ENS-')) return 'Enseignant';
  if (id.startsWith('ELV-')) return 'Eleve';
  if (id.startsWith('PAR-')) return 'Parent';
  return null;
}

export function login(userId: string, password: string): { success: boolean; user?: User; message?: string } {
  initializeDemoUsers();
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

  // Récupérer les utilisateurs (demo + ceux créés via activation)
  const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  // Chercher l'utilisateur avec l'ID et le mot de passe correspondants
  const userMatch = users.find(u => u.id === userId && u.password === password);

  if (userMatch) {
    // Créer la session sans le mot de passe
    const { password: _, ...userSession } = userMatch;
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(userSession));
    createAuditLog(userSession.id, userSession.name, 'LOGIN', `Connexion réussie en tant que ${role}`);
    
    // Reset attempts
    delete attempts[userId];
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(attempts));
    
    return { success: true, user: userSession as User };
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
