// src/lib/js/stores/notifications.js
import { writable } from "svelte/store";
import { api } from "$lib/js/api/client.js";

export const notificaciones = writable([]);
export const notificacionesTotal = writable(0);
export const cargandoNoti = writable(false);

/**
 * Carga las notificaciones del usuario desde el backend.
 * GET /notificaciones?no_leidas=true
 */
export async function cargarNotificaciones() {
  cargandoNoti.set(true);
  const r = await api.get("/notificaciones?no_leidas=true&limit=20");
  cargandoNoti.set(false);

  if (r.ok) {
    notificaciones.set(r.data?.items ?? r.data ?? []);
    notificacionesTotal.set(r.data?.total ?? 0);
  }
}

/**
 * Marca una notificación como leída.
 * PATCH /notificaciones/:id/leida
 */
export async function marcarLeida(id) {
  const r = await api.patch(`/notificaciones/${id}/leida`, {});
  if (r.ok) {
    notificaciones.update((list) =>
      list.map((n) => (n.id === id ? { ...n, leida: true } : n)),
    );
    notificacionesTotal.update((v) => Math.max(0, v - 1));
  }
}

/**
 * Marca todas como leídas.
 * POST /notificaciones/marcar-todas-leidas
 */
export async function marcarTodasLeidas() {
  const r = await api.post("/notificaciones/marcar-todas-leidas", {});
  if (r.ok) {
    notificaciones.update((list) => list.map((n) => ({ ...n, leida: true })));
    notificacionesTotal.set(0);
  }
}
