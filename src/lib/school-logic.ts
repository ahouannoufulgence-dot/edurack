
/**
 * @fileOverview Logique de calcul des moyennes scolaires pour le Bénin.
 */

/**
 * Calcule la moyenne sans case "Composition".
 * Règle : Moyenne des Interros (40%) + Moyenne des Devoirs (60%).
 * Si un groupe est vide, l'autre prend 100%.
 */
export function calculateMoyenneComplex(interros: (number | null)[], devoirs: (number | null)[]) {
  const validInterros = interros.filter((n): n is number => n !== null);
  const validDevoirs = devoirs.filter((n): n is number => n !== null);

  if (validInterros.length === 0 && validDevoirs.length === 0) return 0;

  const avgInterros = validInterros.length > 0 
    ? validInterros.reduce((a, b) => a + b, 0) / validInterros.length 
    : null;
    
  const avgDevoirs = validDevoirs.length > 0 
    ? validDevoirs.reduce((a, b) => a + b, 0) / validDevoirs.length 
    : null;

  if (avgInterros !== null && avgDevoirs !== null) {
    return (avgInterros * 0.4) + (avgDevoirs * 0.6);
  }
  
  return avgInterros ?? avgDevoirs ?? 0;
}
