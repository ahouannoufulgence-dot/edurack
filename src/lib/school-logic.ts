
/**
 * @fileOverview Logique de calcul des moyennes scolaires pour le Bénin.
 */

/**
 * Calcule la moyenne sans composition.
 * Règle stricte : 40% Interros + 60% Devoirs.
 * S'il n'y a que des interros ou que des devoirs, on fait la moyenne simple des notes présentes.
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
    // Pondération officielle béninoise
    return (avgInterros * 0.4) + (avgDevoirs * 0.6);
  }
  
  // S'il ne manque qu'un groupe, on prend la moyenne de l'autre
  return avgInterros ?? avgDevoirs ?? 0;
}
