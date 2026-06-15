// src/lib/js/interfaces/navigation.js
import { getSession, isAuthenticated } from "$lib/js/api/client.js";

// ── Roles normalizados ─────────────────────────────────────
export const ROLES = {
  SUPERADMIN: "superadmin",
  SECRETARIO: "secretario",
  PARROCO: "parroco",
  ADMIN_SITIO: "admin_sitio",
  USUARIO: "usuario",
};

// ── Helper: roles del usuario actual ──────────────────────
export function getRolesNormalizados() {
  const session = getSession();
  if (!session) return [];
  return (session.roles ?? []).map((r) =>
    r
      .toLowerCase()
      .replace("á", "a")
      .replace("ó", "o")
      .replace("ú", "u")
      .replace("administrador parroquial", "secretario")
      .replace("admin del sitio", "admin_sitio")
      .replace("párroco", "parroco"),
  );
}

// ──────────────────────────────────────────────────────────
// MENÚ ÚNICO
// roles: []        → visible para TODOS los autenticados
// roles: ['x','y'] → solo esos roles lo ven en el sidebar
//
// La visibilidad en el sidebar es SOLO comodidad visual.
// El backend valida permisos en cada endpoint.
// ──────────────────────────────────────────────────────────
export const MENU_ITEMS = [
  // ════════════════════════════════
  // SECCIÓN: Principal
  // ════════════════════════════════
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/app/dashboard",
    icon: "bi-speedometer2",
    seccion: "Principal",
    roles: [],
  },
  {
    id: "solicitudes",
    label: "Solicitudes",
    href: "/app/solicitudes",
    icon: "bi-inbox-fill",
    seccion: "Principal",
    roles: [],
    badge: "solicitudes_pendientes",
  },
  {
    id: "nueva_solicitud",
    label: "Nueva Solicitud",
    href: "/app/solicitudes/nueva",
    icon: "bi-plus-circle",
    seccion: "Principal",
    roles: [],
  },

  /*{
    id: "certificados",
    label: "Certificados",
    href: "/app/certificados",
    icon: "bi-patch-check",
    seccion: "Principal",
    roles: [],
  },*/
  {
    id: "notificaciones",
    label: "Notificaciones",
    href: "/app/notificaciones",
    icon: "bi-bell",
    seccion: "Principal",
    roles: [],
  },

  // ════════════════════════════════
  // SECCIÓN: Gestión
  // ════════════════════════════════
  {
    id: "sacramentos",
    label: "Sacramentos",
    href: "/app/sacramentos",
    icon: "bi-award",
    seccion: "Gestión",
    roles: [ROLES.SUPERADMIN, ROLES.SECRETARIO, ROLES.PARROCO],
  },
  /*{
    id: "personas",
    label: "Personas",
    href: "/app/personas",
    icon: "bi-people",
    seccion: "Gestión",
    roles: [ROLES.SUPERADMIN, ROLES.SECRETARIO, ROLES.PARROCO],
  },*/
  {
    id: "eventos",
    label: "Eventos",
    href: "/app/eventos",
    icon: "bi-calendar3",
    seccion: "Gestión",
    roles: [],
  },
  /*{
    id: "cursos",
    label: "Cursos",
    href: "/app/cursos",
    icon: "bi-mortarboard",
    seccion: "Gestión",
    roles: [ROLES.SUPERADMIN, ROLES.SECRETARIO],
  },*/
  /*{
    id: "pagos",
    label: "Pagos",
    href: "/app/pagos",
    icon: "bi-cash-coin",
    seccion: "Gestión",
    roles: [ROLES.SUPERADMIN, ROLES.SECRETARIO],
  },*/

  // ════════════════════════════════
  // SECCIÓN: Administración
  // ════════════════════════════════
  {
    id: "usuarios",
    label: "Usuarios",
    href: "/app/usuarios",
    icon: "bi-person-badge",
    seccion: "Administración",
    roles: [ROLES.SUPERADMIN],
  },
  {
    id: "roles",
    label: "Roles y permisos",
    href: "/app/roles",
    icon: "bi-shield-lock",
    seccion: "Administración",
    roles: [ROLES.SUPERADMIN],
  },
  /*{
    id: "auditoria",
    label: "Auditoría",
    href: "/app/auditoria",
    icon: "bi-journal-text",
    seccion: "Administración",
    roles: [ROLES.SUPERADMIN],
  },*/
  {
    id: "configuracion",
    label: "Configuración",
    href: "/app/configuracion",
    icon: "bi-gear",
    seccion: "Administración",
    roles: [ROLES.SUPERADMIN],
  },

  // ── Ocultos del sidebar (accesibles por URL directa) ────
  {
    id: "perfil",
    label: "Mi perfil",
    href: "/app/perfil",
    icon: "bi-person-circle",
    seccion: "Principal",
    roles: [],
    oculto: true,
  },
];

export const MENU_ITEMS_FLAT = MENU_ITEMS;

// ── Filtra ítems visibles para el usuario actual ───────────
export function getMenuParaUsuario() {
  const roles = getRolesNormalizados();
  return MENU_ITEMS.filter((item) => {
    if (item.roles.length === 0) return true;
    return item.roles.some((r) => roles.includes(r));
  });
}

// ── Agrupado por sección para el sidebar ──────────────────
export function getMenuAgrupado() {
  const items = getMenuParaUsuario().filter((item) => !item.oculto);
  const ordenSecciones = ["Principal", "Gestión", "Administración"];
  const grupos = {};
  for (const item of items) {
    if (!grupos[item.seccion]) grupos[item.seccion] = [];
    grupos[item.seccion].push(item);
  }
  return ordenSecciones
    .filter((s) => grupos[s]?.length > 0)
    .map((s) => ({ seccion: s, items: grupos[s] }));
}

// ── Redirección tras login ─────────────────────────────────
export function redirigirSegunRol() {
  window.location.href = "/app/dashboard";
}

// ── Guardia de autenticación ──────────────────────────────
export function requiereAuth(returnTo) {
  if (!isAuthenticated()) {
    const url = returnTo
      ? `/auth/login?next=${encodeURIComponent(returnTo)}`
      : "/auth/login";
    window.location.href = url;
    return false;
  }
  return true;
}

// ── Guardia de rol (visual — el back es el guardián real) ─
export function requiereRol(rolesPermitidos) {
  if (!isAuthenticated()) {
    window.location.href = "/auth/login";
    return false;
  }
  if (rolesPermitidos.length > 0) {
    const mis = getRolesNormalizados();
    const ok = rolesPermitidos.some((r) => mis.includes(r));
    if (!ok) {
      window.location.href = "/app/dashboard";
      return false;
    }
  }
  return true;
}
