
import { GradeRecord } from './school-types';

/**
 * Calcule la moyenne d'une matière selon le système béninois standard :
 * (Note de Devoir + 2 * Note de Composition) / 3
 * Si la composition n'est pas encore faite, la moyenne est égale à la note de devoir.
 */
export function calculateMoyenne(devoir: number, composition?: number): number {
  if (composition === undefined || isNaN(composition)) {
    return devoir;
  }
  return parseFloat(((devoir + 2 * composition) / 3).toFixed(2));
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
