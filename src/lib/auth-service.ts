
/**
 * @fileOverview Gestion de l'authentification sécurisée.
 */
import { User } from './school-types';
import { getFromStorage, saveToStorage } from './data-service';
import { createAuditLog } from './audit';

const SESSION_KEY = 'edutrack_session';

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
}

export function login(id: string, password: string): { success: boolean; message: string; user?: User } {
  const users = getFromStorage<User>('edutrack_users');
  const user = users.find(u => (u.id === id || u.identifiant === id) && u.password === password);
  
  if (!user) {
    // Log tentative échouée
    createAuditLog(id || 'INCONNU', 'Anonyme', 'LOGIN_FAIL', `Tentative de connexion échouée avec l'ID ${id}`, 'high');
    return { success: false, message: "Identifiant ou mot de passe incorrect." };
  }
  
  if (user.statutCompte !== 'actif') {
    return { success: false, message: "Votre compte est suspendu ou inactif. Veuillez voir le Directeur." };
  }
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  createAuditLog(user.id, user.name, 'LOGIN', `Connexion réussie au portail`, 'low');
  
  return { success: true, message: "Connexion réussie", user };
}

export function logout() {
  const user = getCurrentUser();
  if (user) {
    createAuditLog(user.id, user.name, 'LOGOUT', `Déconnexion manuelle`, 'low');
  }
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event('storage'));
}

export function initializeDemoUsers(force: boolean = false) {
  const users = getFromStorage<User>('edutrack_users');
  if (users.length > 0 && !force) return;
  
  const demoUsers: User[] = [
    {
      id: 'DIR-001',
      identifiant: 'DIR-001',
      name: 'DR. KOFFI PATRICE',
      nom: 'KOFFI',
      prenom: 'Patrice',
      role: 'Directeur',
      sexe: 'M',
      password: 'admin',
      statutCompte: 'actif',
      dateCreation: new Date().toISOString()
    },
    {
      id: 'ENS-MATH-01',
      identifiant: 'ENS-MATH-01',
      name: 'M. ADJOVI MARC',
      nom: 'ADJOVI',
      prenom: 'Marc',
      role: 'Enseignant',
      sexe: 'M',
      matieresAttribuees: ['math'],
      password: 'prof',
      statutCompte: 'actif',
      dateCreation: new Date().toISOString()
    }
  ];
  
  saveToStorage('edutrack_users', demoUsers);
  localStorage.setItem('edutrack_active_year', '2025-2026');
}
