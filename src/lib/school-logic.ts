
/**
 * Calcule la moyenne d'une matière selon le système béninois sans composition :
 * Moyenne Interrogations (MI) = somme des interros / nombre d'interros saisies
 * Moyenne Devoirs (MD) = somme des devoirs / nombre de devoirs saisis
 * Moyenne Trimestrielle = (MI + MD) / 2
 */
export function calculateMoyenneComplex(
  interros: (number | null)[], 
  devoirs: (number | null)[], 
  composition?: number | null
): number {
  const validInterros = interros.filter(n => n !== null && !isNaN(n as number)) as number[];
  const validDevoirs = devoirs.filter(n => n !== null && !isNaN(n as number)) as number[];

  const mi = validInterros.length > 0 
    ? validInterros.reduce((a, b) => a + b, 0) / validInterros.length 
    : 0;
    
  const md = validDevoirs.length > 0 
    ? validDevoirs.reduce((a, b) => a + b, 0) / validDevoirs.length 
    : 0;

  // Calcul direct de la moyenne sans composition
  if (validInterros.length === 0 && validDevoirs.length === 0) return 0;
  
  const mc = (mi + md) / 2;
  return parseFloat(mc.toFixed(2));
}

/**
 * Retourne la mention correspondante à une moyenne.
 */
export function getMention(moyenne: number): string {
  if (moyenne >= 16) return "Très Bien";
  if (moyenne >= 14) return "Bien";
  if (moyenne >= 12) return "Assez Bien";
  if (moyenne >= 10) return "Passable";
  return "Insuffisant";
}

/**
 * Détermine la classe suivante pour la promotion automatique (Système Bénin)
 */
export function getNextClass(currentClass: string): string {
  if (!currentClass) return currentClass;
  const level = currentClass.split(' ')[0].toLowerCase();
  const suffix = currentClass.split(' ').slice(1).join(' ');

  const promotions: Record<string, string> = {
    '6e': '5e',
    '5e': '4e',
    '4e': '3e',
    '3e': '2nde',
    '2nde': '1ère',
    '1ère': 'Tle',
    'tle': 'Diplômé'
  };

  const nextLevel = promotions[level];
  if (!nextLevel) return currentClass;
  if (nextLevel === 'Diplômé') return 'Diplômé';
  
  // Ajustement pour les passages Second Cycle (Séries)
  if (level === '3e') return `2nde C ${suffix}`; // Par défaut vers C, à ajuster par le Dir.
  
  return `${nextLevel} ${suffix}`;
}
