
/**
 * @fileOverview Fichier de données réinitialisé.
 */

export function getFromStorage<T>(key: string): T[] {
  return [];
}

export function saveToStorage<T>(key: string, data: T[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export function getGlobalStats() {
  return {
    totalStudents: 0,
    globalAverage: "0.00",
    totalRevenue: "0 FCFA",
    attendanceRate: "0%"
  };
}

export function getActiveYear() {
  return "2025-2026";
}

export function getCoefficient(c: string, s: string) { return 0; }
