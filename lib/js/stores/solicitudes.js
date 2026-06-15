// src/lib/js/stores/solicitudes.js
import { writable } from "svelte/store";
import { api } from "$lib/js/api/client.js";
import { setBadge } from "$lib/js/stores/ui.js";

export const solicitudes = writable([]);
export const solicitudActual = writable(null);
export const totalSolicitudes = writable(0);
export const cargandoSolicitud = writable(false);

/**
 * Carga la lista de solicitudes (con paginación y filtros).
 * GET /solicitudes?estado=pendiente&page=1&limit=20
 */
export async function cargarSolicitudes({
  estado = "",
  page = 1,
  limit = 20,
} = {}) {
  cargandoSolicitud.set(true);

  const params = new URLSearchParams({ page, limit });
  if (estado) params.set("estado", estado);

  const r = await api.get(`/solicitudes?${params}`);
  cargandoSolicitud.set(false);

  if (r.ok) {
    const items = r.data?.items ?? r.data ?? [];
    solicitudes.set(items);
    totalSolicitudes.set(r.data?.total ?? items.length);

    // Actualizar badge del sidebar con pendientes
    const pendientes = r.data?.pendientes ?? 0;
    if (pendientes) setBadge("solicitudes_pendientes", pendientes);
  }

  return r;
}

/**
 * Carga una solicitud por ID.
 * GET /solicitudes/:id
 */
export async function cargarSolicitud(id) {
  cargandoSolicitud.set(true);
  const r = await api.get(`/solicitudes/${id}`);
  cargandoSolicitud.set(false);

  if (r.ok) solicitudActual.set(r.data);
  return r;
}

/**
 * Crea una nueva solicitud de sacramento.
 * POST /solicitudes
 */
export async function crearSolicitud(datos) {
  const r = await api.post("/solicitudes", datos);
  return r;
}

/**
 * Actualiza el estado de una solicitud (secretario/párroco).
 * PATCH /solicitudes/:id/estado
 */
export async function actualizarEstado(id, { estado, observaciones }) {
  const r = await api.patch(`/solicitudes/${id}/estado`, {
    estado,
    observaciones,
  });
  if (r.ok) {
    solicitudActual.update((s) => (s ? { ...s, estado } : s));
  }
  return r;
}
