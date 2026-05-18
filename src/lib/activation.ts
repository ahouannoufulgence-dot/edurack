
import { ActivationToken, ClassLevel } from './school-types';
import { createAuditLog } from './audit';

const STORAGE_KEY = 'edutrack_activation_tokens';

export function getTokens(): ActivationToken[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function generateBulkTokens(classLevel: ClassLevel, count: number): ActivationToken[] {
  const existingTokens = getTokens();
  const year = new Date().getFullYear();
  const classCode = classLevel.replace(/\s/g, '').toUpperCase();
  
  const newTokens: ActivationToken[] = [];
  
  for (let i = 1; i <= count; i++) {
    const sequence = i.toString().padStart(3, '0');
    const tokenId = `EDP-${year + 2}-${classCode}-${sequence}`;
    
    // Simuler des données élèves pré-existantes pour la démo
    newTokens.push({
      id: tokenId,
      studentName: `Élève ${classLevel} #${sequence}`,
      classLevel: classLevel,
      birthDate: '2010-01-01', // Valeur par défaut pour test
      parentPhone: '00000000',  // Valeur par défaut pour test
      status: 'pending',
      attempts: 0
    });
  }
  
  const updatedTokens = [...newTokens, ...existingTokens];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTokens));
  
  createAuditLog(
    'dir_01', 
    'Directeur', 
    'TOKEN_GENERATION', 
    `Génération de ${count} codes d'accès pour la classe ${classLevel}`,
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
    return { success: false, message: "Identifiant non reconnu par l'établissement." };
  }
  
  const token = tokens[tokenIndex];
  
  if (token.status === 'activated') {
    return { success: false, message: "Ce compte a déjà été activé." };
  }
  
  if (token.attempts >= 5) {
    createAuditLog('SYSTEM', 'SECURITY', 'ACCESS_DENIED', `Blocage du code ${tokenId} après 5 tentatives infructueuses`, null, null, 'high');
    return { success: false, message: "Trop de tentatives. Contactez l'administration." };
  }

  // Vérification stricte
  if (token.birthDate === birthDate && token.parentPhone === parentPhone) {
    return { success: true, message: "Informations vérifiées.", token };
  } else {
    token.attempts += 1;
    tokens[tokenIndex] = token;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    return { success: false, message: "Informations incorrectes. Tentative enregistrée." };
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
      `Compte élève activé avec succès`,
      null,
      data,
      'medium'
    );
  }
}
