// src/lib/js/interfaces/usuarios.js
import { api } from "$lib/js/api/client.js";

// ── Listar usuarios ────────────────────────────────────────
/**
 * GET /usuarios/admin/list
 * @param {{ page, limit, rol, estado, buscar }} params
 */
export async function listarUsuarios({
  page = 1,
  limit = 20,
  rol = "",
  estado = "",
  buscar = "",
} = {}) {
  const p = new URLSearchParams({ page, limit });
  if (rol) p.set("rol", rol);
  if (estado) p.set("estado", estado);
  if (buscar) p.set("buscar", buscar);

  const r = await api.get(`/usuarios/admin/list?${p}`);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

// ── Ver usuario ────────────────────────────────────────────
/** GET /usuarios/admin/{id} */
export async function getUsuario(id) {
  const r = await api.get(`/usuarios/admin/${id}`);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

// ── Eliminar usuario ───────────────────────────────────────
/** DELETE /usuarios/admin/{id} */
export async function eliminarUsuario(id) {
  const r = await api.delete(`/usuarios/admin/${id}`);
  if (r.ok) return { ok: true };
  return { ok: false, error: r.error };
}

// ── Roles ──────────────────────────────────────────────────
/** GET /roles/ */
export async function listarRoles() {
  const r = await api.get("/roles/");
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** GET /roles/{id} */
export async function getRol(id) {
  const r = await api.get(`/roles/${id}`);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** POST /roles/ */
export async function crearRol(datos) {
  const r = await api.post("/roles/", datos);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** PUT /roles/{id} */
export async function actualizarRol(id, datos) {
  const r = await api.put(`/roles/${id}`, datos);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** DELETE /roles/{id} */
export async function eliminarRol(id) {
  const r = await api.delete(`/roles/${id}`);
  if (r.ok) return { ok: true };
  return { ok: false, error: r.error };
}

/** GET /roles/{id}/usuarios */
export async function getUsuariosPorRol(id) {
  const r = await api.get(`/roles/${id}/usuarios`);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** POST /roles/asignar-usuario */
export async function asignarRol({ usuario_id, rol_id }) {
  const r = await api.post("/roles/asignar-usuario", { usuario_id, rol_id });
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** DELETE /roles/remover-usuario/{usuario_id}/{rol_id} */
export async function removerRol(usuario_id, rol_id) {
  const r = await api.delete(`/roles/remover-usuario/${usuario_id}/${rol_id}`);
  if (r.ok) return { ok: true };
  return { ok: false, error: r.error };
}

// ── Permisos ───────────────────────────────────────────────
/** GET /permisos/ */
export async function listarPermisos({ soloActivos = false } = {}) {
  const r = await api.get(`/permisos/?activos_solo=${soloActivos}`);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** POST /permisos/ */
export async function crearPermiso(datos) {
  const r = await api.post("/permisos/", datos);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** GET /permisos/{id} */
export async function getPermiso(id) {
  const r = await api.get(`/permisos/${id}`);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** GET /permisos/rol/{rol_id} */
export async function getPermisosDeRol(rol_id) {
  const r = await api.get(`/permisos/rol/${rol_id}`);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** DELETE /permisos/rol/{rol_id}/permiso/{permiso_id} */
export async function removerPermiso(rol_id, permiso_id) {
  const r = await api.delete(`/permisos/rol/${rol_id}/permiso/${permiso_id}`);
  if (r.ok) return { ok: true };
  return { ok: false, error: r.error };
}

/** GET /permisos/usuario/{id} */
export async function getPermisosDeUsuario(id) {
  const r = await api.get(`/permisos/usuario/${id}`);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** GET /permisos/por-modulo/{modulo_id} */
export async function getPermisosPorModulo(modulo_id) {
  const r = await api.get(`/permisos/por-modulo/${modulo_id}`);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

// ── Módulos ────────────────────────────────────────────────
/** GET /modulos/ */
export async function listarModulos({ soloActivos = false } = {}) {
  const r = await api.get(`/modulos/?activos_solo=${soloActivos}`);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** POST /modulos/ */
export async function crearModulo(datos) {
  const r = await api.post("/modulos/", datos);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** GET /modulos/{id} */
export async function getModulo(id) {
  const r = await api.get(`/modulos/${id}`);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** PUT /modulos/{id} */
export async function actualizarModulo(id, datos) {
  const r = await api.put(`/modulos/${id}`, datos);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** DELETE /modulos/{id} */
export async function eliminarModulo(id) {
  const r = await api.delete(`/modulos/${id}`);
  if (r.ok) return { ok: true };
  return { ok: false, error: r.error };
}

export async function toggleModulo(id, activo) {
  const r = await api.put(`/modulos/${id}`, { activo });
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

export async function asignarPermisos(rol_id, permiso_ids) {
  const r = await api.post(`/permisos/rol/${rol_id}/asignar`, {
    permisos_ids: permiso_ids, // ← cambiar permiso_ids por permisos_ids
  });
  if (r.ok) return { ok: true };
  return { ok: false, error: r.error };
}

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

/** PUT /permisos/{id} — actualizar permiso (activo, nombre, descripcion) */
export async function actualizarPermiso(id, datos) {
  const r = await api.put(`/permisos/${id}`, datos);
  if (r.ok) return { ok: true, data: r.data };
  return { ok: false, error: r.error };
}

/** Toggle activo/inactivo de un permiso */
export async function togglePermisoActivo(id, activo) {
  return actualizarPermiso(id, { activo });
}

// ── Foto de perfil ─────────────────────────────────────────

/**
 * POST /archivos/foto-perfil
 * Sube o reemplaza la foto de perfil.
 * @param {File} file
 */
export async function subirFotoPerfil(file) {
  const formData = new FormData();
  formData.append("file", file);
  const r = await api.upload("/archivos/foto-perfil", formData);
  if (r.ok) return { ok: true, foto_url: r.data?.foto_url };
  return { ok: false, error: r.error };
}

/**
 * DELETE /archivos/foto-perfil
 */
export async function eliminarFotoPerfil() {
  const r = await api.delete("/archivos/foto-perfil");
  if (r.ok) return { ok: true };
  return { ok: false, error: r.error };
}
