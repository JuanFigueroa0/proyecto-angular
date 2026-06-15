// src/lib/js/utils/formatters.js

/**
 * Formatea una fecha ISO a formato legible en español.
 * @param {string|Date} fecha
 * @param {{ hora?: boolean }} opts
 */
export function formatFecha(fecha, { hora = false } = {}) {
  if (!fecha) return "—";
  const d = new Date(fecha);
  const opts = {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  };
  if (hora) {
    opts.hour = "2-digit";
    opts.minute = "2-digit";
  }
  return d.toLocaleDateString("es-CO", opts);
}

/**
 * Formatea una fecha corta (dd/mm/aaaa).
 */
export function formatFechaCorta(fecha) {
  if (!fecha) return "—";
  const d = new Date(fecha);
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Bogota",
  });
}

/**
 * Formatea un monto en COP.
 */
export function formatMoneda(monto, moneda = "COP") {
  if (monto == null) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: moneda,
    maximumFractionDigits: 0,
  }).format(monto);
}

/**
 * Capitaliza la primera letra.
 */
export function capitalizar(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convierte un estado de BD a etiqueta legible.
 */
export function formatEstado(estado) {
  const mapa = {
    pendiente: "Pendiente",
    en_revision: "En revisión",
    documentacion_incompleta: "Documentación incompleta",
    aprobada: "Aprobada",
    rechazada: "Rechazada",
    cancelada: "Cancelada",
    activo: "Activo",
    inactivo: "Inactivo",
    bloqueado: "Bloqueado",
    pendiente_validacion: "Pendiente de validación",
    emitido: "Emitido",
    revocado: "Revocado",
    anulado: "Anulado",
    pagado: "Pagado",
    realizado: "Realizado",
    asignado: "Asignado",
  };
  return mapa[estado] ?? capitalizar(estado ?? "");
}

/**
 * Devuelve la clase Bootstrap de badge según el estado.
 */
export function colorEstado(estado) {
  const mapa = {
    pendiente: "warning",
    en_revision: "info",
    documentacion_incompleta: "warning",
    aprobada: "success",
    realizado: "success",
    emitido: "success",
    pagado: "success",
    activo: "success",
    rechazada: "danger",
    cancelada: "secondary",
    anulado: "danger",
    revocado: "danger",
    bloqueado: "danger",
    inactivo: "secondary",
    pendiente_validacion: "warning",
    asignado: "primary",
  };
  return mapa[estado] ?? "secondary";
}

/**
 * Nombre completo de una persona.
 */
export function nombreCompleto(persona) {
  if (!persona) return "—";
  return [
    persona.primer_nombre,
    persona.segundo_nombre,
    persona.primer_apellido,
    persona.segundo_apellido,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Trunca un texto largo.
 */
export function truncar(texto, max = 80) {
  if (!texto) return "";
  return texto.length > max ? texto.slice(0, max) + "…" : texto;
}
