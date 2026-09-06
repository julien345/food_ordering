/**
 * Validation et nettoyage automatique des numéros de téléphone (ex: Cameroun / Douala).
 * 
 * Validateur strict de l'API : /^\+?[1-9]\d{1,14}$/ (E.164)
 * 
 * Règles appliquées :
 * 1. Supprime automatiquement les espaces, tirets, parenthèses et points.
 * 2. Si le numéro commence par un 0 local (ex: 06... ou 02...), remplace le premier 0
 *    par l'indicatif du Cameroun +237.
 * 3. Gère les préfixes "+2370" ou "2370" en éliminant le 0 surnuméraire (+237...).
 * 4. Si le numéro est saisi sans indicatif (ex: 699112233), ajoute l'indicatif +237.
 * 5. Si la chaîne est vide ou ne contient que l'indicatif sans numéro (+237, +, 237), renvoie undefined.
 */
export function cleanPhoneNumber(raw?: string | null): string | undefined {
  if (!raw) return undefined;

  // 1. Retrait des espaces, tirets, parenthèses, points
  let cleaned = String(raw).replace(/[\s\-\(\)\.]/g, '').trim();

  if (!cleaned) return undefined;

  // Si uniquement l'indicatif sans numéro réel
  if (cleaned === '+237' || cleaned === '+' || cleaned === '237') {
    return undefined;
  }

  // Cas préfixes internationaux et indicatifs composés
  if (cleaned.startsWith('00237')) {
    cleaned = '+237' + cleaned.substring(5);
  } else if (cleaned.startsWith('0237')) {
    cleaned = '+237' + cleaned.substring(4);
  } else if (cleaned.startsWith('+2370')) {
    // Si l'utilisateur a saisi "+237 06..." -> retire le 0 après +237
    cleaned = '+237' + cleaned.substring(5);
  } else if (cleaned.startsWith('2370')) {
    // Si l'utilisateur a saisi "237 06..." -> remplace par +237 et retire le 0
    cleaned = '+237' + cleaned.substring(4);
  } else if (cleaned.startsWith('0')) {
    // Si le numéro commence par un 0 local à Douala (ex: 06...), remplace le premier 0 par +237
    cleaned = '+237' + cleaned.substring(1);
  } else if (cleaned.startsWith('237') && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    // Si c'est un numéro local direct (ex: 699112233 ou 9 chiffres camerounais)
    if (/^[1-9]\d{6,14}$/.test(cleaned)) {
      cleaned = '+237' + cleaned;
    }
  }

  return cleaned;
}

/**
 * Valide si le numéro nettoyé respecte le format strict de l'API : /^\+?[1-9]\d{1,14}$/
 */
export function isValidPhoneNumber(cleaned?: string | null): boolean {
  if (!cleaned) return true; // Les champs optionnels sont valides s'ils sont vides
  return /^\+?[1-9]\d{1,14}$/.test(cleaned);
}
