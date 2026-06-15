// src/lib/js/stores/ui.js
import { writable } from "svelte/store";

// ── Sidebar ────────────────────────────────────────────────
export const sidebarCollapsed = writable(false);
export const sidebarMobileOpen = writable(false);

export function toggleSidebar() {
  sidebarCollapsed.update((v) => !v);
}
export function toggleMobileSidebar() {
  sidebarMobileOpen.update((v) => !v);
}
export function closeMobileSidebar() {
  sidebarMobileOpen.set(false);
}

// ── Toasts ─────────────────────────────────────────────────
// Cada toast: { id, tipo, titulo?, mensaje, duracion }
export const toasts = writable([]);

let _toastId = 0;

/**
 * Muestra un toast.
 * @param {{ tipo, mensaje, titulo?, duracion? }} opts
 */
export function addToast({
  tipo = "info",
  mensaje,
  titulo = "",
  duracion = 3500,
}) {
  const id = ++_toastId;
  toasts.update((list) => [...list, { id, tipo, titulo, mensaje }]);
  if (duracion > 0) setTimeout(() => removeToast(id), duracion);
  return id;
}

export function removeToast(id) {
  toasts.update((list) => list.filter((t) => t.id !== id));
}

// Helpers de conveniencia
export const toast = {
  success: (mensaje, titulo = "") =>
    addToast({ tipo: "success", mensaje, titulo }),
  error: (mensaje, titulo = "") =>
    addToast({ tipo: "error", mensaje, titulo, duracion: 5000 }),
  info: (mensaje, titulo = "") => addToast({ tipo: "info", mensaje, titulo }),
  warning: (mensaje, titulo = "") =>
    addToast({ tipo: "warning", mensaje, titulo, duracion: 4500 }),
  loading: (mensaje, titulo = "") =>
    addToast({ tipo: "loading", mensaje, titulo, duracion: 0 }),
};

// ── Cargando global ────────────────────────────────────────
export const cargandoGlobal = writable(false);

// ── Badges sidebar ─────────────────────────────────────────
export const badgesSidebar = writable({ solicitudes_pendientes: 0 });

export function setBadge(key, value) {
  badgesSidebar.update((b) => ({ ...b, [key]: value }));
}
