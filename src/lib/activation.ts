/**
 * @fileOverview Gestion des jetons d'activation.
 */
import { ActivationToken, ClassLevel, User } from './school-types';
import { getFromStorage, saveToStorage } from './data-service';

const STORAGE_KEY = 'edutrack_activation_tokens';

export function getTokens(): ActivationToken[] {
  return getFromStorage<ActivationToken>(STORAGE_KEY);
}

export function generateBulkTokens(classLevel: ClassLevel, count: number) {
  const tokens = getTokens();
  for (let i = 0; i < count; i++) {
    const id = `ELV-${classLevel.replace(/\s+/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    tokens.push({
      id,
      classLevel,
      status: 'available',
      studentName: 'Libre - Prêt pour activation',
      dateCreated: new Date().toISOString()
    });
  }
  saveToStorage(STORAGE_KEY, tokens);
}

export function deleteToken(id: string) {
  const tokens = getTokens().filter(t => t.id !== id);
  saveToStorage(STORAGE_KEY, tokens);
}

export function resetTokens() {
  saveToStorage(STORAGE_KEY, []);
}
