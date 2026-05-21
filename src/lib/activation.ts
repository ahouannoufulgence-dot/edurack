
/**
 * @fileOverview Gestion des jetons d'activation pour EduTrack Pro.
 */
import { ActivationToken, ClassLevel, User } from './school-types';
import { getFromStorage, saveToStorage } from './data-service';
import { createAuditLog } from './audit';

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
  createAuditLog('SYS', 'Système', 'TOKEN_GEN', `Génération de ${count} jetons pour ${classLevel}`, 'medium');
}

export function verifyActivation(id: string): { success: boolean; message: string; token?: ActivationToken } {
  const tokens = getTokens();
  const token = tokens.find(t => t.id === id);
  
  if (!token) return { success: false, message: "Code d'activation invalide ou inexistant." };
  if (token.status === 'activated') return { success: false, message: "Ce code a déjà été utilisé pour activer un compte." };
  
  return { success: true, message: "Code valide.", token };
}

export function completeActivation(id: string, userData: any): string {
  const tokens = getTokens();
  const tokenIndex = tokens.findIndex(t => t.id === id);
  const token = tokens[tokenIndex];
  
  const users = getFromStorage<User>('edutrack_users');
  const newUser: User = {
    id,
    identifiant: id,
    name: `${userData.prenom} ${userData.nom}`.toUpperCase(),
    nom: userData.nom.toUpperCase(),
    prenom: userData.prenom,
    role: 'Eleve',
    sexe: userData.sexe,
    classLevel: token.classLevel,
    password: userData.password,
    statutCompte: 'actif',
    dateCreation: new Date().toISOString()
  };
  
  users.push(newUser);
  saveToStorage('edutrack_users', users);
  
  tokens[tokenIndex] = { ...token, status: 'activated', studentName: newUser.name };
  saveToStorage(STORAGE_KEY, tokens);
  
  createAuditLog(id, newUser.name, 'ACCOUNT_ACTIVATE', `Activation du compte élève ${id}`, 'low');
  
  return id;
}

export function deleteToken(id: string) {
  const tokens = getTokens().filter(t => t.id !== id);
  saveToStorage(STORAGE_KEY, tokens);
  createAuditLog('SYS', 'Directeur', 'TOKEN_DEL', `Suppression du jeton ${id}`, 'medium');
}

export function resetTokens() {
  saveToStorage(STORAGE_KEY, []);
}
