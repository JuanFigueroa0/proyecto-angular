// src/lib/js/utils/dashboard.js
import { getSession } from "$lib/js/api/client.js";

// ── Normalizar roles (el backend devuelve 'Superadmin' con mayúscula) ──
export function getRolPrincipal() {
  const session = getSession();
  if (!session) return null;
  const roles = (session.roles ?? []).map((r) => r.toLowerCase());

  // Jerarquía: el primer rol que coincida gana
  if (roles.includes("superadmin")) return "superadmin";
  if (
    roles.includes("administrador parroquial") ||
    roles.includes("secretario")
  )
    return "secretario";
  if (roles.includes("párroco") || roles.includes("parroco")) return "parroco";
  if (roles.includes("admin del sitio") || roles.includes("admin_sitio"))
    return "admin_sitio";
  if (roles.includes("usuario")) return "usuario";

  // Si tiene algún rol desconocido, devolver el primero
  return roles[0] ?? "usuario";
}

// ── Saludo según hora ──────────────────────────────────────
export function getSaludo() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

// ── Configuración por rol ──────────────────────────────────
// Cada rol define:
//   bienvenida: string
//   descripcion: string
//   stats: [{ label, valor_key, icon, color, href }]
//     valor_key: clave que vendrá del backend en GET /dashboard/stats
//   acciones: [{ label, desc, icon, color, href, permiso? }]
//   widgets: string[]  → nombres de widgets a mostrar

export const DASHBOARD_CONFIG = {
  // ─────────────────────────────────────────
  superadmin: {
    bienvenida: "Panel de control",
    descripcion: "Vista global del sistema parroquial",
    stats: [
      {
        label: "Usuarios activos",
        key: "usuarios_activos",
        icon: "bi-people-fill",
        color: "stat-blue",
      },
      {
        label: "Solicitudes pendientes",
        key: "solicitudes_pendientes",
        icon: "bi-inbox-fill",
        color: "stat-amber",
      },
      {
        label: "Certificados emitidos",
        key: "certificados_emitidos",
        icon: "bi-patch-check-fill",
        color: "stat-green",
      },
      {
        label: "Sacramentos registrados",
        key: "sacramentos_total",
        icon: "bi-award-fill",
        color: "stat-purple",
      },
      {
        label: "Eventos este mes",
        key: "eventos_mes",
        icon: "bi-calendar-event-fill",
        color: "stat-teal",
      },
      {
        label: "Roles configurados",
        key: "roles_total",
        icon: "bi-shield-fill",
        color: "stat-rose",
      },
    ],
    acciones: [
      {
        label: "Gestionar usuarios",
        desc: "Crear, editar y controlar accesos",
        icon: "bi-person-badge",
        color: "acc-blue",
        href: "/admin/usuarios",
      },
      {
        label: "Roles y permisos",
        desc: "Configurar roles del sistema",
        icon: "bi-shield-lock",
        color: "acc-purple",
        href: "/admin/roles",
      },
      {
        label: "Sacramentos",
        desc: "Administrar tipos y requisitos",
        icon: "bi-award",
        color: "acc-gold",
        href: "/admin/sacramentos",
      },
      {
        label: "Solicitudes",
        desc: "Revisar todas las solicitudes",
        icon: "bi-inbox",
        color: "acc-amber",
        href: "/admin/solicitudes",
      },
      {
        label: "Auditoría",
        desc: "Ver log completo del sistema",
        icon: "bi-journal-text",
        color: "acc-gray",
        href: "/admin/auditoria",
      },
      {
        label: "Configuración",
        desc: "Parámetros globales del sistema",
        icon: "bi-gear-fill",
        color: "acc-slate",
        href: "/admin/configuracion",
      },
      {
        label: "Eventos",
        desc: "Gestionar agenda parroquial",
        icon: "bi-calendar3",
        color: "acc-teal",
        href: "/admin/eventos",
      },
      {
        label: "Pagos",
        desc: "Control de pagos y ofrendas",
        icon: "bi-cash-coin",
        color: "acc-green",
        href: "/admin/pagos",
      },
    ],
    widgets: [
      "solicitudes_recientes",
      "actividad_sistema",
      "grafico_sacramentos",
    ],
  },

  // ─────────────────────────────────────────
  secretario: {
    bienvenida: "Administración parroquial",
    descripcion: "Gestión de solicitudes, personas y documentos",
    stats: [
      {
        label: "Solicitudes pendientes",
        key: "solicitudes_pendientes",
        icon: "bi-inbox-fill",
        color: "stat-amber",
      },
      {
        label: "En revisión",
        key: "solicitudes_revision",
        icon: "bi-hourglass-split",
        color: "stat-blue",
      },
      {
        label: "Aprobadas hoy",
        key: "aprobadas_hoy",
        icon: "bi-check-circle-fill",
        color: "stat-green",
      },
      {
        label: "Eventos próximos",
        key: "eventos_proximos",
        icon: "bi-calendar-event-fill",
        color: "stat-teal",
      },
    ],
    acciones: [
      {
        label: "Solicitudes",
        desc: "Revisar y gestionar solicitudes",
        icon: "bi-inbox",
        color: "acc-amber",
        href: "/admin/solicitudes",
      },
      {
        label: "Personas",
        desc: "Registrar y buscar personas",
        icon: "bi-people",
        color: "acc-blue",
        href: "/admin/personas",
      },
      {
        label: "Certificados",
        desc: "Emitir y validar certificados",
        icon: "bi-patch-check",
        color: "acc-green",
        href: "/admin/certificados",
      },
      {
        label: "Eventos",
        desc: "Gestionar agenda y misas",
        icon: "bi-calendar3",
        color: "acc-teal",
        href: "/admin/eventos",
      },
      {
        label: "Pagos",
        desc: "Registrar pagos recibidos",
        icon: "bi-cash-coin",
        color: "acc-gold",
        href: "/admin/pagos",
      },
      {
        label: "Cursos",
        desc: "Control de cursos y participantes",
        icon: "bi-mortarboard",
        color: "acc-purple",
        href: "/admin/cursos",
      },
    ],
    widgets: ["solicitudes_recientes", "pagos_pendientes"],
  },

  // ─────────────────────────────────────────
  parroco: {
    bienvenida: "Panel del Párroco",
    descripcion: "Validación de sacramentos y agenda pastoral",
    stats: [
      {
        label: "Pendientes de firma",
        key: "pendientes_firma",
        icon: "bi-pen-fill",
        color: "stat-amber",
      },
      {
        label: "Matrimonios en proceso",
        key: "matrimonios_proceso",
        icon: "bi-people-fill",
        color: "stat-blue",
      },
      {
        label: "Eventos esta semana",
        key: "eventos_semana",
        icon: "bi-calendar-event-fill",
        color: "stat-teal",
      },
      {
        label: "Certificados firmados",
        key: "certificados_firmados",
        icon: "bi-patch-check-fill",
        color: "stat-green",
      },
    ],
    acciones: [
      {
        label: "Solicitudes",
        desc: "Aprobar sacramentos complejos",
        icon: "bi-inbox",
        color: "acc-amber",
        href: "/admin/solicitudes",
      },
      {
        label: "Certificados",
        desc: "Firmar y autorizar certificados",
        icon: "bi-patch-check",
        color: "acc-green",
        href: "/admin/certificados",
      },
      {
        label: "Personas",
        desc: "Consultar registros parroquiales",
        icon: "bi-people",
        color: "acc-blue",
        href: "/admin/personas",
      },
      {
        label: "Eventos",
        desc: "Ver agenda y calendario",
        icon: "bi-calendar3",
        color: "acc-teal",
        href: "/admin/eventos",
      },
    ],
    widgets: ["solicitudes_recientes", "agenda_hoy"],
  },

  // ─────────────────────────────────────────
  admin_sitio: {
    bienvenida: "Administración del Sitio",
    descripcion: "Gestión de contenido público y comunicaciones",
    stats: [
      {
        label: "Eventos publicados",
        key: "eventos_publicados",
        icon: "bi-calendar-check-fill",
        color: "stat-teal",
      },
      {
        label: "Eventos borrador",
        key: "eventos_borrador",
        icon: "bi-pencil-fill",
        color: "stat-amber",
      },
      {
        label: "Próximos eventos",
        key: "eventos_proximos",
        icon: "bi-calendar-event-fill",
        color: "stat-blue",
      },
      {
        label: "Eventos este mes",
        key: "eventos_mes",
        icon: "bi-bar-chart-fill",
        color: "stat-green",
      },
    ],
    acciones: [
      {
        label: "Eventos",
        desc: "Publicar y gestionar eventos",
        icon: "bi-calendar3",
        color: "acc-teal",
        href: "/admin/eventos",
      },
      {
        label: "Notificaciones",
        desc: "Enviar comunicados a la comunidad",
        icon: "bi-bell",
        color: "acc-blue",
        href: "/admin/notificaciones",
      },
    ],
    widgets: ["eventos_proximos_lista"],
  },

  // ─────────────────────────────────────────
  usuario: {
    bienvenida: "Mi espacio parroquial",
    descripcion: "Gestiona tus sacramentos y solicitudes",
    stats: [
      {
        label: "Mis solicitudes",
        key: "mis_solicitudes",
        icon: "bi-inbox-fill",
        color: "stat-blue",
      },
      {
        label: "Pendientes",
        key: "mis_pendientes",
        icon: "bi-hourglass-split",
        color: "stat-amber",
      },
      {
        label: "Certificados listos",
        key: "mis_certificados",
        icon: "bi-patch-check-fill",
        color: "stat-green",
      },
      {
        label: "Eventos inscritos",
        key: "mis_eventos",
        icon: "bi-calendar-check",
        color: "stat-teal",
      },
    ],
    acciones: [
      {
        label: "Nueva solicitud",
        desc: "Solicitar un sacramento",
        icon: "bi-plus-circle",
        color: "acc-blue",
        href: "/admin/solicitudes/nueva",
      },
      {
        label: "Mis solicitudes",
        desc: "Ver estado de mis solicitudes",
        icon: "bi-inbox",
        color: "acc-amber",
        href: "/admin/solicitudes",
      },
      {
        label: "Mis certificados",
        desc: "Descargar mis certificados",
        icon: "bi-patch-check",
        color: "acc-green",
        href: "/admin/certificados",
      },
      {
        label: "Eventos",
        desc: "Ver e inscribirse a eventos",
        icon: "bi-calendar3",
        color: "acc-teal",
        href: "/admin/eventos",
      },
    ],
    widgets: ["mis_solicitudes_recientes", "eventos_proximos_lista"],
  },
};

// ── Etiquetas legibles de roles ────────────────────────────
export const LABEL_ROL = {
  superadmin: "Superadministrador",
  secretario: "Administrador Parroquial",
  parroco: "Párroco",
  admin_sitio: "Administrador del Sitio",
  usuario: "Fiel",
};

// ── Colores de avatar por rol ──────────────────────────────
export const COLOR_ROL = {
  superadmin: "linear-gradient(135deg,#7c3aed,#4f46e5)",
  secretario: "linear-gradient(135deg,#2a5298,#1a3a5c)",
  parroco: "linear-gradient(135deg,#c9a84c,#b8960c)",
  admin_sitio: "linear-gradient(135deg,#0f766e,#14b8a6)",
  usuario: "linear-gradient(135deg,#475569,#334155)",
};
