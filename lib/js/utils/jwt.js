// src/lib/js/utils/jwt.js

/**
 * Decodifica el payload de un JWT sin verificar firma.
 * @param {string} token
 * @returns {object|null}
 */
export function decodeJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64url → Base64 → JSON
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Verifica si un JWT ha expirado (según el campo `exp` del payload).
 * @param {string} token
 * @returns {boolean}
 */
export function isTokenExpired(token) {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  // exp está en segundos, Date.now() en milisegundos
  return payload.exp * 1000 < Date.now();
}

/**
 * Extrae el campo `sub` (user_id) del token.
 * @param {string} token
 * @returns {string|null}
 */
export function getSubFromToken(token) {
  const payload = decodeJWT(token);
  return payload?.sub ?? null;
}
