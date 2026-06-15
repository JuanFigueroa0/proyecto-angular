// src/lib/js/utils/permisos.js
import { getStoredUser } from "$lib/js/api/client.js";

/**
 * Mapa de permisos por módulo.
 * Cada módulo tiene un conjunto de acciones.
 * Los códigos deben coincidir con los que devuelve el backend en usuario.permisos[]
 */
export const PERMISOS = {
  // Sacramentos
  SACRAMENTOS_VER: "sacramentos.ver",
  SACRAMENTOS_CREAR: "sacramentos.crear",
  SACRAMENTOS_EDITAR: "sacramentos.editar",

  // Solicitudes
  SOLICITUDES_VER: "solicitudes.ver",
  SOLICITUDES_REVISAR: "solicitudes.revisar",
  SOLICITUDES_APROBAR: "solicitudes.aprobar",

  // Certificados
  CERTIFICADOS_VER: "certificados.ver",
  CERTIFICADOS_EMITIR: "certificados.emitir",
  CERTIFICADOS_REVOCAR: "certificados.revocar",

  // Usuarios
  USUARIOS_VER: "usuarios.ver",
  USUARIOS_CREAR: "usuarios.crear",
  USUARIOS_EDITAR: "usuarios.editar",
  USUARIOS_BLOQUEAR: "usuarios.bloquear",

  // Personas
  PERSONAS_VER: "personas.ver",
  PERSONAS_CREAR: "personas.crear",
  PERSONAS_EDITAR: "personas.editar",

  // Roles
  ROLES_VER: "roles.ver",
  ROLES_EDITAR: "roles.editar",

  // Auditoría
  AUDITORIA_VER: "auditoria.ver",

  // Eventos
  EVENTOS_VER: "eventos.ver",
  EVENTOS_CREAR: "eventos.crear",
  EVENTOS_EDITAR: "eventos.editar",

  // Pagos
  PAGOS_VER: "pagos.ver",
  PAGOS_REGISTRAR: "pagos.registrar",

  // Configuración
  CONFIG_VER: "configuracion.ver",
  CONFIG_EDITAR: "configuracion.editar",
};

/**
 * Verifica si el usuario actual tiene un permiso.
 * @param {string} permiso - código del permiso
 */
export function puede(permiso) {
  const u = getStoredUser();
  if (!u) return false;
  return (u.permisos ?? []).includes(permiso);
}

/**
 * Verifica si el usuario tiene todos los permisos dados.
 * @param {string[]} permisos
 */
export function puedeTodo(permisos) {
  return permisos.every((p) => puede(p));
}

/**
 * Verifica si el usuario tiene al menos uno de los permisos dados.
 * @param {string[]} permisos
 */
export function puedeAlguno(permisos) {
  return permisos.some((p) => puede(p));
}
