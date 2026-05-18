import { ActivationToken, ClassLevel, User } from './school-types';
import { createAuditLog } from './audit';
import { syncIdentitySystem } from './identity-manager';

const STORAGE_KEY = 'edutrack_activation_tokens';
const USERS_KEY = 'edutrack_users';

export function getTokens(): ActivationToken[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function resetTokens() {
  localStorage.removeItem(STORAGE_KEY);
  generateBulkTokens('Tle D', 5);
}

export function generateBulkTokens(classLevel: ClassLevel, count: number): ActivationToken[] {
  const existingTokens = getTokens();
  const year = new Date().getFullYear();
  const classCode = classLevel.replace(/\s/g, '').toUpperCase();
  
  const newTokens: ActivationToken[] = [];
  
  for (let i = 1; i <= count; i++) {
    const sequence = i.toString().padStart(3, '0');
    const tokenId = `EDP-${year + 2}-${classCode}-${sequence}`;
    
    newTokens.push({
      id: tokenId,
      studentName: `Élève ${classLevel} #${sequence}`,
      classLevel: classLevel,
      birthDate: '2010-01-01',
      parentPhone: '00000000',
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
    `Génération auto de ${count} codes pour ${classLevel}`,
    null,
    { classLevel, count },
    'medium'
  );
  
  return newTokens;
}

export function verifyActivation(tokenId: string, birthDate: string, parentPhone: string): { success: boolean; message: string; token?: ActivationToken } {
  const tokens = getTokens();
  const tokenIndex = tokens.findIndex(t => t.id.toUpperCase() === tokenId.toUpperCase());
  
  if (tokenIndex === -1) {
    return { success: false, message: "Identifiant non reconnu." };
  }
  
  const token = tokens[tokenIndex];
  
  if (token.status === 'activated') {
    return { success: false, message: "Compte déjà activé." };
  }
  
  if (token.attempts >= 5) {
    return { success: false, message: "Identifiant bloqué. Contactez le surveillant." };
  }

  if (token.birthDate === birthDate && token.parentPhone === parentPhone) {
    return { success: true, message: "Vérification réussie.", token };
  } else {
    token.attempts += 1;
    tokens[tokenIndex] = token;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    createAuditLog('SYSTEM', 'Security', 'ACCESS_DENIED', `Échec activation pour ${tokenId}`, null, null, 'medium');
    return { success: false, message: "Informations incorrectes." };
  }
}

export function completeActivation(tokenId: string, data: { email: string; photoUrl: string; secretQuestion: string; password?: string }) {
  const tokens = getTokens();
  const tokenIndex = tokens.findIndex(t => t.id.toUpperCase() === tokenId.toUpperCase());
  
  if (tokenIndex !== -1) {
    const token = tokens[tokenIndex];
    token.status = 'activated';
    token.activatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    
    // Création de l'utilisateur avec un identifiant provisoire
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const newUser: User & { password?: string } = {
      id: token.id,
      name: token.studentName,
      role: 'Eleve',
      email: data.email,
      photoUrl: data.photoUrl,
      classLevel: token.classLevel,
      studentId: token.id,
      password: data.password || 'Pass1234',
      idHistory: []
    };
    
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));

    // Déclenchement immédiat du recalcul des identifiants pour la classe
    syncIdentitySystem(token.classLevel);

    createAuditLog(
      token.id, 
      token.studentName, 
      'ACCOUNT_ACTIVATION', 
      `Activation finale terminée et compte créé. Système d'identité synchronisé.`,
      null,
      { email: data.email, classLevel: token.classLevel },
      'medium'
    );
  }
}