
/**
 * Calcule la moyenne d'une matière selon le système béninois révisé :
 * Moyenne Interrogations (MI) = somme des interros / nombre d'interros saisies
 * Moyenne Devoirs (MD) = somme des devoirs / nombre de devoirs saisis
 * Moyenne Classe (MC) = (MI + MD) / 2
 * Moyenne Trimestrielle = (MC + 2 * Composition) / 3
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

  const mc = (validInterros.length > 0 || validDevoirs.length > 0)
    ? (mi + md) / 2
    : 0;

  if (composition === undefined || composition === null || isNaN(composition)) {
    return parseFloat(mc.toFixed(2));
  }

  return parseFloat(((mc + 2 * composition) / 3).toFixed(2));
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
