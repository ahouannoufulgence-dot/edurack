
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

export function verifyActivation(tokenId: string): { success: boolean; message: string } {
  const tokens = getTokens();
  const token = tokens.find(t => t.id === tokenId);
  if (!token) return { success: false, message: "Code d'activation invalide ou introuvable." };
  if (token.status === 'activated') return { success: false, message: "Ce code a déjà été utilisé." };
  return { success: true, message: "Code valide." };
}

export function completeActivation(tokenId: string, userData: any): string {
  const tokens = getTokens();
  const tokenIndex = tokens.findIndex(t => t.id === tokenId);
  if (tokenIndex === -1) throw new Error("Token introuvable");

  const users = getFromStorage<User>('edutrack_users');
  const newId = tokenId; // L'identifiant définitif est le code d'activation
  
  const newUser: User = {
    id: newId,
    identifiant: newId,
    name: `${userData.prenom} ${userData.nom}`.toUpperCase(),
    nom: userData.nom.toUpperCase(),
    prenom: userData.prenom,
    role: 'Eleve',
    sexe: userData.sexe,
    classLevel: tokens[tokenIndex].classLevel,
    password: userData.password,
    statutCompte: 'actif',
    dateCreation: new Date().toISOString()
  };
  
  users.push(newUser);
  saveToStorage('edutrack_users', users);
  
  tokens[tokenIndex].status = 'activated';
  tokens[tokenIndex].studentName = newUser.name;
  saveToStorage(STORAGE_KEY, tokens);
  
  return newId;
}

export function deleteToken(id: string) {
  const tokens = getTokens().filter(t => t.id !== id);
  saveToStorage(STORAGE_KEY, tokens);
}

export function resetTokens() {
  saveToStorage(STORAGE_KEY, []);
}
