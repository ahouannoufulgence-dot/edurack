import { ActivationToken, ClassLevel } from './school-types';
import { createAuditLog } from './audit';

const STORAGE_KEY = 'edutrack_activation_tokens';

export function getTokens(): ActivationToken[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function resetTokens() {
  localStorage.removeItem(STORAGE_KEY);
  // Pré-générer un token pour le compte démo élève si besoin
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
  const tokenIndex = tokens.findIndex(t => t.id === tokenId);
  
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

export function completeActivation(tokenId: string, data: { email: string; photoUrl: string; secretQuestion: string }) {
  const tokens = getTokens();
  const tokenIndex = tokens.findIndex(t => t.id === tokenId);
  
  if (tokenIndex !== -1) {
    tokens[tokenIndex].status = 'activated';
    tokens[tokenIndex].activatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    
    createAuditLog(
      tokenId, 
      tokens[tokenIndex].studentName, 
      'ACCOUNT_ACTIVATION', 
      `Activation finale terminée`,
      null,
      data,
      'medium'
    );
  }
}
