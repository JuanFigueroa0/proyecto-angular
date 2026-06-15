// src/lib/js/interfaces/user.js
import { api, getSession, recargarPermisos } from "$lib/js/api/client.js";
import { actualizarFotoEnSesion } from "$lib/js/api/client.js";

// ── Perfil propio ──────────────────────────────────────────

/** GET /usuarios/me */
export async function getMe() {
  const r = await api.get("/usuarios/me");
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** GET /usuarios/me/verificar-perfil */
export async function verificarPerfil() {
  const r = await api.get("/usuarios/me/verificar-perfil");
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** POST /usuarios/me/perfil — primera vez */
export async function crearPerfil(datos) {
  const r = await api.post("/usuarios/me/perfil", datos);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** PUT /usuarios/me/perfil — actualizar */
export async function actualizarPerfil(datos) {
  const r = await api.put("/usuarios/me/perfil", datos);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** PUT /usuarios/me/email */
export async function cambiarEmail({ correo_nuevo }) {
  const r = await api.put("/usuarios/me/email", { correo_nuevo });
  if (r.ok)
    return { ok: true, mensaje: r.data?.mensaje ?? "Correo actualizado." };
  return { ok: false, error: r.error };
}

/** PUT /usuarios/me/password */
export async function cambiarPassword({
  contrasena_actual,
  contrasena_nueva,
  confirmar_contrasena,
}) {
  const r = await api.put("/usuarios/me/password", {
    contrasena_actual,
    contrasena_nueva,
    confirmar_contrasena,
  });
  if (r.ok)
    return { ok: true, mensaje: r.data?.mensaje ?? "Contraseña actualizada." };
  return { ok: false, error: r.error };
}

/** GET /usuarios/me/sacramentos */
export async function getMisSacramentos() {
  const r = await api.get("/usuarios/me/sacramentos");
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** DELETE /usuarios/me */
export async function eliminarMiCuenta() {
  const r = await api.delete("/usuarios/me");
  if (r.ok) return { ok: true };
  return { ok: false, error: r.error };
}

/** GET /auth/sesiones */
export async function getMisSesiones() {
  const r = await api.get("/auth/sesiones");
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

// ── Admin ──────────────────────────────────────────────────

/** GET /usuarios/admin/list */
export async function listarUsuarios({
  page = 1,
  limit = 20,
  rol_id = "",
  estado = "",
  buscar = "",
} = {}) {
  const p = new URLSearchParams({ page, limit });
  if (rol_id) p.set("rol_id", rol_id);
  if (estado) p.set("estado", estado);
  if (buscar) p.set("buscar", buscar);

  const r = await api.get(`/usuarios/admin/list?${p}`);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** GET /usuarios/admin/{id} */
export async function getUsuario(id) {
  const r = await api.get(`/usuarios/admin/${id}`);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** DELETE /usuarios/admin/{id} */
export async function eliminarUsuario(id) {
  const r = await api.delete(`/usuarios/admin/${id}`);
  if (r.ok) return { ok: true };
  return { ok: false, error: r.error };
}

// ── Helpers locales ────────────────────────────────────────

export function getUsuarioLocal() {
  return getSession();
}
export function getRolesUsuario() {
  return getSession()?.roles ?? [];
}
export function getPermisosUsuario() {
  return getSession()?.permisos ?? [];
}

export function tieneRol(rol) {
  return getRolesUsuario()
    .map((r) => r.toLowerCase())
    .includes(rol.toLowerCase());
}

export function tieneAlgunRol(roles) {
  return roles.some((r) => tieneRol(r));
}

export function tienePermiso(permiso) {
  return getPermisosUsuario().includes(permiso);
}

export { recargarPermisos };

// ── Permisos directos de usuario ──────────────────────────

/** GET /permisos/usuario/{id}/directos */
export async function getPermisosDirectosUsuario(id) {
  const r = await api.get(`/permisos/usuario/${id}/directos`);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** POST /permisos/usuario/{id}/asignar */
export async function asignarPermisosDirectosUsuario(usuario_id, permisos_ids) {
  const r = await api.post(`/permisos/usuario/${usuario_id}/asignar`, {
    permisos_ids,
  });
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** DELETE /permisos/usuario/{usuario_id}/permiso/{permiso_id} */
export async function removerPermisoDirectoUsuario(usuario_id, permiso_id) {
  const r = await api.delete(
    `/permisos/usuario/${usuario_id}/permiso/${permiso_id}`,
  );
  if (r.ok) return { ok: true };
  return { ok: false, error: r.error };
}

// ── Foto de perfil ─────────────────────────────────────────

/**
 * POST /archivos/foto-perfil
 * Sube o reemplaza la foto de perfil del usuario autenticado.
 * @param {File} file — objeto File del input
 */
export async function subirFotoPerfil(file) {
  const formData = new FormData();
  formData.append("file", file);

  const r = await api.upload("/archivos/foto-perfil", formData);
  if (r.ok) {
    // Sincronizar en sesión local para que el sidebar/topbar se actualice
    actualizarFotoEnSesion(r.data?.foto_url ?? null);
    return { ok: true, foto_url: r.data?.foto_url };
  }
  return { ok: false, error: r.error };
}

/**
 * DELETE /archivos/foto-perfil
 * Elimina la foto de perfil actual.
 */
export async function eliminarFotoPerfil() {
  const r = await api.delete("/archivos/foto-perfil");
  if (r.ok) {
    actualizarFotoEnSesion(null);
    return { ok: true };
  }
  return { ok: false, error: r.error };
}
