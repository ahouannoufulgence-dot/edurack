
/**
 * Calcule la moyenne d'une matière selon le système sans composition :
 * Moyenne Interrogations (MI) = somme des interros / nombre d'interros saisies
 * Moyenne Devoirs (MD) = somme des devoirs / nombre de devoirs saisis
 * Moyenne Trimestrielle = (MI + MD) / 2
 * 
 * Si aucune note n'est saisie, retourne 0.
 */
export function calculateMoyenneComplex(
  interros: (number | null)[], 
  devoirs: (number | null)[], 
  composition?: number | null // Paramètre ignoré désormais
): number {
  const validInterros = interros.filter(n => n !== null && !isNaN(n as number)) as number[];
  const validDevoirs = devoirs.filter(n => n !== null && !isNaN(n as number)) as number[];

  if (validInterros.length === 0 && validDevoirs.length === 0) return 0;

  const mi = validInterros.length > 0 
    ? validInterros.reduce((a, b) => a + b, 0) / validInterros.length 
    : 0;
    
  const md = validDevoirs.length > 0 
    ? validDevoirs.reduce((a, b) => a + b, 0) / validDevoirs.length 
    : 0;

  // Si on a les deux types de notes, on fait la moyenne des deux
  if (validInterros.length > 0 && validDevoirs.length > 0) {
    return parseFloat(((mi + md) / 2).toFixed(2));
  }
  
  // Sinon on retourne la moyenne de l'un ou de l'autre
  return parseFloat((mi || md).toFixed(2));
}

export function getMention(moyenne: number): string {
  if (moyenne >= 16) return "Très Bien";
  if (moyenne >= 14) return "Bien";
  if (moyenne >= 12) return "Assez Bien";
  if (moyenne >= 10) return "Passable";
  return "Insuffisant";
}

export function getNextClass(currentClass: string): string {
  if (!currentClass) return currentClass;
  const parts = currentClass.split(' ');
  const level = parts[0].toLowerCase();
  const suffix = parts.slice(1).join(' ');

  const promotions: Record<string, string> = {
    '6e': '5e', '5e': '4e', '4e': '3e', '3e': '2nde',
    '2nde': '1ère', '1ère': 'Tle', 'tle': 'Diplômé'
  };

  const nextLevel = promotions[level];
  if (!nextLevel) return currentClass;
  if (nextLevel === 'Diplômé') return 'Diplômé';
  
  return `${nextLevel} ${suffix}`;
}
