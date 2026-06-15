// src/lib/js/utils/validators.js

export function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function esDocumentoValido(tipo, numero) {
  if (tipo === "sin_documento") return true;
  if (!numero) return false;
  const regexes = {
    CC: /^\d{6,10}$/,
    TI: /^\d{10,11}$/,
    CE: /^\d{6,10}$/,
    PA: /^[A-Z0-9]{6,12}$/i,
    RC: /^\d{8,11}$/,
  };
  return regexes[tipo]?.test(numero) ?? true;
}

export function esFechaValida(fecha) {
  if (!fecha) return false;
  const d = new Date(fecha);
  return !isNaN(d.getTime());
}

export function esMayorDeEdad(fechaNacimiento, edadMinima = 18) {
  if (!fechaNacimiento) return false;
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  const edad = hoy.getFullYear() - nac.getFullYear();
  const cumple = new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate());
  return edad > edadMinima || (edad === edadMinima && hoy >= cumple);
}

export function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}
