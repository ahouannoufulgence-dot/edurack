import { ActivationToken, ClassLevel, User } from './school-types';
import { createAuditLog } from './audit';

const STORAGE_KEY = 'edutrack_activation_tokens';
const USERS_KEY = 'edutrack_users';

export function getTokens(): ActivationToken[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function resetTokens() {
  localStorage.removeItem(STORAGE_KEY);
  generateBulkTokens('3e 1', 10);
}

export function deleteToken(tokenId: string) {
  const tokens = getTokens();
  const updatedTokens = tokens.filter(t => t.id !== tokenId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTokens));
  
  createAuditLog(
    'SYSTEM', 
    'Admin', 
    'SECURITY_ALERT', 
    `Suppression de l'identifiant d'activation : ${tokenId}`,
    null,
    null,
    'medium'
  );
}

export function generateBulkTokens(classLevel: ClassLevel, count: number): ActivationToken[] {
  const existingTokens = getTokens();
  const classCode = classLevel.replace(/\s/g, '').toUpperCase();
  
  const newTokens: ActivationToken[] = [];
  
  const classTokens = existingTokens.filter(t => t.classLevel === classLevel);
  const lastIndex = classTokens.length;

  for (let i = 1; i <= count; i++) {
    const sequence = (lastIndex + i).toString().padStart(3, '0');
    const tokenId = `ELV-${classCode}-${sequence}`;
    
    newTokens.push({
      id: tokenId,
      studentName: `Libre - Prêt pour activation`,
      classLevel: classLevel,
      birthDate: '',
      parentPhone: '',
      status: 'pending',
      attempts: 0
    });
  }
  
  const updatedTokens = [...newTokens, ...existingTokens];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTokens));
  
  createAuditLog(
    'SYSTEM', 
    'Admin', 
    'TOKEN_GENERATION', 
    `Génération de ${count} codes pour la classe ${classLevel}`,
    null,
    { classLevel, count },
    'medium'
  );
  
  return newTokens;
}

export function verifyActivation(tokenId: string): { success: boolean; message: string; token?: ActivationToken } {
  const tokens = getTokens();
  const token = tokens.find(t => t.id.toUpperCase() === tokenId.toUpperCase());
  
  if (!token) {
    return { success: false, message: "Identifiant inconnu ou non provisionné." };
  }
  
  if (token.status === 'activated') {
    return { success: false, message: "Cet identifiant est déjà rattaché à un compte élève." };
  }
  
  return { success: true, message: "Code valide.", token };
}

export function completeActivation(tokenId: string, userData: { 
  nom: string; 
  prenom: string; 
  sexe: 'M' | 'F';
  password?: string;
  secretQuestion: string;
  secretAnswer: string;
}) {
  const tokens = getTokens();
  const tokenIndex = tokens.findIndex(t => t.id.toUpperCase() === tokenId.toUpperCase());
  
  if (tokenIndex !== -1) {
    const token = tokens[tokenIndex];
    token.status = 'activated';
    token.studentName = `${userData.prenom} ${userData.nom}`.toUpperCase();
    token.activatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const fullName = `${userData.prenom} ${userData.nom}`.toUpperCase();
    const finalId = token.id;

    const newUser: User = {
      id: finalId,
      identifiant: finalId,
      name: fullName,
      nom: userData.nom.toUpperCase(),
      prenom: userData.prenom,
      sexe: userData.sexe,
      role: 'Eleve',
      classLevel: token.classLevel,
      classeId: token.classLevel,
      password: userData.password || 'Pass1234',
      questionSecrete: userData.secretQuestion,
      reponseSecrete: userData.secretAnswer,
      statutCompte: 'actif',
      dateCreation: new Date().toISOString(),
      premierAcces: false,
      idHistory: [token.id]
    };
    
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    return finalId;
  }
  throw new Error("Identifiant introuvable");
}
