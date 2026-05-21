
/**
 * @fileOverview Service de données réinitialisé.
 */

export function getFromStorage<T>(key: string): T[] {
  return [];
}

export function saveToStorage<T>(key: string, data: T[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
}
