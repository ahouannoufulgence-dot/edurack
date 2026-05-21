
/**
 * @fileOverview Service d'authentification réinitialisé.
 */

export function getCurrentUser() {
  return null;
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.clear();
  }
}

export function login() {
  return { success: false, message: "Système réinitialisé." };
}
