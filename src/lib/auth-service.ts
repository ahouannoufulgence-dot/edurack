
/**
 * @fileOverview Service d'authentification réinitialisé.
 */

export function getCurrentUser() {
  return null;
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('edutrack_session');
  }
}

export function login(userId: string, pass: string) {
  return { success: false, message: "Le système a été réinitialisé. Aucun compte disponible." };
}

export function initializeDemoUsers() {
  // Aucune initialisation
}
