// src/lib/js/interfaces/solicitudes.js
import { api } from "$lib/js/api/client.js";

// ── Sacramentos disponibles ────────────────────────────────

/** GET /sacramentos/ */
export async function listarSacramentos() {
  const r = await api.get("/sacramentos/");
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** GET /sacramentos/{id}/requisitos */
export async function getRequisitosSacramento(id) {
  const r = await api.get(`/sacramentos/${id}/requisitos`);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

// ── Mis solicitudes ────────────────────────────────────────

/** GET /solicitudes/mis-solicitudes */
export async function getMisSolicitudes({
  pagina = 1,
  por_pagina = 10,
  estado = "",
} = {}) {
  const p = new URLSearchParams({ pagina, por_pagina });
  if (estado) p.set("estado", estado);
  const r = await api.get(`/solicitudes/mis-solicitudes?${p}`);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** GET /solicitudes/{id} */
export async function getSolicitud(solicitudId) {
  const r = await api.get(`/solicitudes/${solicitudId}`);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** POST /solicitudes/ */
export async function crearSolicitud(datos) {
  const r = await api.post("/solicitudes/", datos);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** PATCH /solicitudes/{id} */
export async function actualizarSolicitud(id, datos) {
  const r = await api.patch(`/solicitudes/${id}`, datos);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** POST /solicitudes/{id}/cancelar */
export async function cancelarSolicitud(id) {
  const r = await api.post(`/solicitudes/${id}/cancelar`, {});
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** POST /solicitudes/{id}/documentos — multipart */
export async function subirDocumentoSolicitud(
  solicitudId,
  { file, tipo_documento, categoria, persona_id, descripcion },
) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("tipo_documento", tipo_documento);
  fd.append("categoria", categoria);
  if (persona_id) fd.append("persona_id", String(persona_id));
  if (descripcion) fd.append("descripcion", descripcion);

  const r = await api.upload(`/solicitudes/${solicitudId}/documentos`, fd);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

// ── Admin ──────────────────────────────────────────────────

/** GET /solicitudes/admin/todas */
export async function listarTodasSolicitudes({
  pagina = 1,
  por_pagina = 20,
  estado = "",
  sacramento_id = "",
} = {}) {
  const p = new URLSearchParams({ pagina, por_pagina });
  if (estado) p.set("estado", estado);
  if (sacramento_id) p.set("sacramento_id", sacramento_id);
  const r = await api.get(`/solicitudes/admin/todas?${p}`);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** PATCH /solicitudes/{id}/estado */
export async function cambiarEstadoSolicitud(
  id,
  { estado, observaciones_secretario },
) {
  const r = await api.patch(`/solicitudes/${id}/estado`, {
    estado,
    observaciones_secretario,
  });
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

// ── Helpers locales ────────────────────────────────────────

export const ESTADOS_SOLICITUD = {
  pendiente: { label: "Pendiente", color: "warning" },
  en_revision: { label: "En revisión", color: "info" },
  documentacion_incompleta: { label: "Doc. incompleta", color: "danger" },
  aprobada: { label: "Aprobada", color: "success" },
  rechazada: { label: "Rechazada", color: "danger" },
  cancelada: { label: "Cancelada", color: "secondary" },
};

export const ROLES_SOLICITUD = {
  receptor: "Receptor",
  padre: "Padre",
  madre: "Madre",
  padrino: "Padrino",
  madrina: "Madrina",
  contrayente: "Contrayente",
  testigo: "Testigo",
  tutor_legal: "Tutor legal",
  solicitante: "Solicitante",
  otro: "Otro",
};

/** Roles requeridos por sacramento */
export const ROLES_POR_SACRAMENTO = {
  1: {
    // Bautismo
    receptor: { label: "Bautizado", obligatorio: true },
    padre: { label: "Padre", obligatorio: false },
    madre: { label: "Madre", obligatorio: false },
    padrino: { label: "Padrino", obligatorio: true },
    madrina: { label: "Madrina", obligatorio: true },
    tutor_legal: { label: "Tutor legal", obligatorio: false },
  },
  2: {
    // Primera Comunión
    receptor: { label: "Comulgante", obligatorio: true },
    padre: { label: "Padre", obligatorio: false },
    madre: { label: "Madre", obligatorio: false },
    padrino: { label: "Padrino/ina", obligatorio: false },
    tutor_legal: { label: "Tutor legal", obligatorio: false },
  },
  3: {
    // Confirmación
    receptor: { label: "Confirmando", obligatorio: true },
    padre: { label: "Padre", obligatorio: false },
    madre: { label: "Madre", obligatorio: false },
    padrino: { label: "Padrino/ina", obligatorio: true },
  },
  4: {
    // Matrimonio
    contrayente: { label: "Contrayente", obligatorio: true },
    testigo: { label: "Testigo", obligatorio: true },
    padrino: { label: "Padrino", obligatorio: true },
    madrina: { label: "Madrina", obligatorio: false },
  },
  5: {
    // Unción de los Enfermos
    receptor: { label: "Enfermo", obligatorio: true },
    solicitante: { label: "Solicitante", obligatorio: true },
  },
  6: {
    // Penitencia
    receptor: { label: "Penitente", obligatorio: true },
  },
};

export const TIPOS_DOCUMENTO_SOLICITUD = [
  { value: "documento_identidad", label: "Documento de identidad" },
  { value: "registro_civil", label: "Registro civil" },
  { value: "certificado_bautismo", label: "Certificado de bautismo" },
  { value: "certificado_confirmacion", label: "Certificado de confirmación" },
  {
    value: "certificado_primera_comunion",
    label: "Certificado de Primera Comunión",
  },
  { value: "certificado_matrimonio", label: "Certificado de matrimonio" },
  { value: "acta_defuncion", label: "Acta de defunción" },
  { value: "documento_anulacion", label: "Documento de anulación" },
  { value: "custodia_legal", label: "Documento de custodia legal" },
  { value: "certificado_curso", label: "Certificado de curso" },
  { value: "otro", label: "Otro documento" },
];

// Agregar al final de src/lib/js/interfaces/solicitudes.js

/** PATCH /solicitudes/{id}/personas/{persona_id}/validar */
export async function validarPersonaSolicitud(
  solicitudId,
  personaId,
  rol,
  datos,
) {
  const r = await api.patch(
    `/solicitudes/${solicitudId}/personas/${personaId}/validar?rol=${encodeURIComponent(rol)}`,
    datos,
  );
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** GET /sacramentos/ — alias explícito */
export async function getSacramentos() {
  const r = await api.get("/sacramentos/");
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

export const NOMBRES_SACRAMENTO = {
  1: "Bautismo",
  2: "Primera Comunión",
  3: "Confirmación",
  4: "Matrimonio",
  5: "Unción de los Enfermos",
  6: "Penitencia",
};
