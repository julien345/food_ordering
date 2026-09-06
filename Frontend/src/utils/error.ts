/**
 * Utilitaire d'extraction robuste et détaillée des messages d'erreurs retournés par l'API backend.
 * Supporte :
 * - NestJS / class-validator (tableau de messages)
 * - Zod (issues, array of paths/messages, format)
 * - Express-validator (tableaux d'objets avec field/param/path/msg)
 * - Objets d'erreurs de validation ({ [field]: message | message[] })
 * - Attributs errors, details, validationErrors, issues, etc.
 */

export function extractApiErrorMessage(err: any, defaultFallback = "Une erreur est survenue"): string {
  if (!err) return defaultFallback;

  // Si c'est déjà une chaîne de caractères
  if (typeof err === 'string') return err;

  const resData = err.response?.data;
  if (!resData) {
    return err.message || defaultFallback;
  }

  // Pour faciliter le débogage dans la console du navigateur
  try {
    console.warn('[API Error Payload Details]:', resData);
  } catch {
    // Ignore console errors
  }

  // 1. Si le corps de réponse est directement une chaîne de texte
  if (typeof resData === 'string') {
    return resData;
  }

  const collectedErrors: string[] = [];

  // Helper pour formater un champ et son message
  const addFieldError = (field: string | undefined | null, msg: any) => {
    if (!msg) return;
    const cleanMsg = typeof msg === 'string' ? msg : JSON.stringify(msg);
    if (field && field.trim()) {
      collectedErrors.push(`${field} : ${cleanMsg}`);
    } else {
      collectedErrors.push(cleanMsg);
    }
  };

  // Helper pour traiter les erreurs de type Zod issues ou express-validator
  const processErrorItem = (item: any) => {
    if (!item) return;
    if (typeof item === 'string') {
      collectedErrors.push(item);
      return;
    }
    if (typeof item === 'object') {
      const field =
        item.field ||
        item.param ||
        item.property ||
        (Array.isArray(item.path) ? item.path.filter((p: any) => p !== 'body').join('.') : item.path);

      // Cas class-validator NestJS avec contraintes
      if (item.constraints && typeof item.constraints === 'object') {
        const constraintMsgs = Object.values(item.constraints).map(String);
        if (constraintMsgs.length > 0) {
          constraintMsgs.forEach((cMsg) => addFieldError(field, cMsg));
          return;
        }
      }

      const msg = item.message || item.msg || item.error;
      if (msg) {
        addFieldError(field, msg);
      } else {
        collectedErrors.push(JSON.stringify(item));
      }
    }
  };

  // 2. Format NestJS standard : message est un tableau de chaînes
  if (Array.isArray(resData.message)) {
    resData.message.forEach((m: any) => processErrorItem(m));
  }

  // 3. Format errors (tableau ou dictionnaire champ -> message)
  if (Array.isArray(resData.errors)) {
    resData.errors.forEach((e: any) => processErrorItem(e));
  } else if (resData.errors && typeof resData.errors === 'object') {
    Object.entries(resData.errors).forEach(([field, val]) => {
      if (Array.isArray(val)) {
        val.forEach((subVal) => addFieldError(field, subVal));
      } else if (typeof val === 'string' || typeof val === 'number') {
        addFieldError(field, val);
      } else if (val && typeof val === 'object') {
        processErrorItem({ field, ...(val as any) });
      }
    });
  }

  // 4. Format Zod issues
  if (Array.isArray(resData.issues)) {
    resData.issues.forEach((issue: any) => processErrorItem(issue));
  }

  // 5. Format details (tableau ou objet)
  if (Array.isArray(resData.details)) {
    resData.details.forEach((d: any) => processErrorItem(d));
  } else if (resData.details && typeof resData.details === 'object') {
    Object.entries(resData.details).forEach(([field, val]) => {
      if (Array.isArray(val)) {
        val.forEach((subVal) => addFieldError(field, subVal));
      } else if (typeof val === 'string') {
        addFieldError(field, val);
      }
    });
  }

  // 6. Format validationErrors
  if (Array.isArray(resData.validationErrors)) {
    resData.validationErrors.forEach((v: any) => processErrorItem(v));
  }

  // 7. Enveloppe data imbriquée (ex: { data: { errors: [...] } })
  if (resData.data && typeof resData.data === 'object') {
    if (Array.isArray(resData.data.errors)) {
      resData.data.errors.forEach((e: any) => processErrorItem(e));
    } else if (Array.isArray(resData.data.issues)) {
      resData.data.issues.forEach((i: any) => processErrorItem(i));
    } else if (typeof resData.data.message === 'string' && resData.data.message) {
      collectedErrors.push(resData.data.message);
    }
  }

  // Si des erreurs spécifiques ont été collectées
  if (collectedErrors.length > 0) {
    const uniqueErrors = Array.from(new Set(collectedErrors.filter(Boolean)));
    if (uniqueErrors.length === 1) {
      return uniqueErrors[0];
    }
    return `Données invalides :\n• ${uniqueErrors.join('\n• ')}`;
  }

  // 8. Gestion des messages scalaires (message vs error)
  const isGeneric = (str: string) => {
    const s = str.trim().toLowerCase();
    return (
      s === 'données invalides' ||
      s === 'donnees invalides' ||
      s === 'bad request' ||
      s === 'validation error' ||
      s === 'validation failed' ||
      s === 'error' ||
      s === 'internal server error'
    );
  };

  const rawMsg = typeof resData.message === 'string' ? resData.message.trim() : '';
  const rawErr = typeof resData.error === 'string' ? resData.error.trim() : '';

  // Si l'un des deux est un message spécifique et non un titre générique
  if (rawMsg && !isGeneric(rawMsg)) {
    return rawMsg;
  }
  if (rawErr && !isGeneric(rawErr)) {
    return rawErr;
  }

  // Si les deux sont définis mais l'un était générique
  if (rawMsg && rawErr && rawMsg !== rawErr) {
    return `${rawMsg} : ${rawErr}`;
  }

  if (rawMsg) return rawMsg;
  if (rawErr) return rawErr;

  return err.message || defaultFallback;
}
