
/**
 * @fileOverview Logique de calcul des moyennes "Zéro Composition".
 * Règle d'excellence : 40% Moyenne des Interros + 60% Moyenne des Devoirs.
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

  // Calcul pondéré strict
  if (avgInterros !== null && avgDevoirs !== null) {
    return (avgInterros * 0.4) + (avgDevoirs * 0.6);
  }
  
  // Si un groupe est totalement absent, on utilise l'autre groupe (tolérance pour début de trimestre)
  return avgInterros ?? avgDevoirs ?? 0;
}
