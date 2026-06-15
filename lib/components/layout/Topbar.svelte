<!-- src/lib/components/layout/Topbar.svelte -->
<!-- src/lib/components/layout/Topbar.svelte -->
<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { getSession } from "$lib/js/api/client.js";
  import { logout } from "$lib/js/interfaces/auth.js";
  import { getRolesNormalizados } from "$lib/js/interfaces/navigation.js";
  import { toggleMobileSidebar } from "$lib/js/stores/ui.js";
  import "$lib/styles/layout/topBar.css";
  import {
    notificaciones,
    notificacionesTotal as notiTotal,
    marcarLeida,
    cargarNotificaciones,
  } from "$lib/js/stores/notifications.js";

  // ── Estado ─────────────────────────────────────────────
  let session = null;
  let iniciales = "";
  let etiquetaRol = "";
  let menuAbierto = false; // dropdown del avatar
  let notiAbierto = false; // dropdown de notificaciones
  let cerrandoSesion = false;

  // ── Título de la página actual ─────────────────────────
  const TITULOS = {
    "/app/dashboard": "Dashboard",
    "/app/sacramentos": "Sacramentos",
    "/app/solicitudes": "Solicitudes",
    "/app/solicitudes/nueva": "Solicitar Sacramento",
    "/app/solicitudes/mis-solicitudes": "Mis Solicitudes",
    "/app/certificados": "Certificados",
    "/app/personas": "Personas",
    "/app/eventos": "Eventos",
    "/app/cursos": "Cursos",
    "/app/pagos": "Pagos",
    "/app/usuarios": "Usuarios",
    "/app/roles": "Roles y Permisos",
    "/app/auditoria": "Auditoría",
    "/app/configuracion": "Configuración",
    "/app/notificaciones": "Notificaciones",
    "/app/perfil": "Mi Perfil",
  };

  $: tituloPagina = (() => {
    const ruta = $page.url.pathname;
    // Buscar coincidencia exacta primero, luego por prefijo
    if (TITULOS[ruta]) return TITULOS[ruta];
    const match = Object.keys(TITULOS)
      .filter((k) => ruta.startsWith(k + "/"))
      .sort((a, b) => b.length - a.length)[0];
    return match ? TITULOS[match] : "EcclesiaSys";
  })();

  // ── Inicialización ─────────────────────────────────────
  onMount(() => {
    session = getSession();
    iniciales = calcularIniciales();
    etiquetaRol = calcularEtiquetaRol();
    cargarNotificaciones();
  });

  function calcularIniciales() {
    const correo = session?.correo ?? session?.sub ?? "??";
    return correo.slice(0, 2).toUpperCase();
  }

  function calcularEtiquetaRol() {
    const roles = getRolesNormalizados();
    if (roles.includes("superadmin")) return "Superadministrador";
    if (roles.includes("secretario")) return "Adm. Parroquial";
    if (roles.includes("parroco")) return "Párroco";
    if (roles.includes("admin_sitio")) return "Admin del Sitio";
    return "Fiel";
  }

  // ── Handlers ───────────────────────────────────────────
  function toggleMenu() {
    menuAbierto = !menuAbierto;
    if (menuAbierto) notiAbierto = false;
  }

  function toggleNoti() {
    notiAbierto = !notiAbierto;
    if (notiAbierto) menuAbierto = false;
  }

  function cerrarTodo() {
    menuAbierto = false;
    notiAbierto = false;
  }

  async function onLogout() {
    cerrandoSesion = true;
    await logout();
  }

  function onMarcarLeida(e, id) {
    e.preventDefault();
    e.stopPropagation();
    marcarLeida(id);
  }

  // Cerrar dropdowns al cambiar de ruta
  $: $page.url.pathname, cerrarTodo();
</script>

<!-- Overlay para cerrar dropdowns al hacer click fuera -->
{#if menuAbierto || notiAbierto}
  <div class="topbar-overlay" on:click={cerrarTodo} aria-hidden="true"></div>
{/if}

<header class="topbar">
  <!-- Izquierda: toggle móvil + título -->
  <div class="topbar-left">
    <button
      class="topbar-menu-btn d-lg-none"
      on:click={toggleMobileSidebar}
      aria-label="Abrir menú"
    >
      <i class="bi bi-list" aria-hidden="true"></i>
    </button>

    <div class="topbar-titulo">
      <span class="topbar-cruz">✝</span>
      {tituloPagina}
    </div>
  </div>

  <!-- Derecha: notificaciones + avatar -->
  <div class="topbar-right">
    <!-- Botón notificaciones -->
    <div class="topbar-noti-wrap">
      <button
        class="topbar-icon-btn {notiAbierto ? 'active' : ''}"
        on:click={toggleNoti}
        aria-label="Notificaciones"
        aria-expanded={notiAbierto}
      >
        <i class="bi bi-bell" aria-hidden="true"></i>
        {#if $notiTotal > 0}
          <span class="topbar-noti-badge">
            {$notiTotal > 9 ? "9+" : $notiTotal}
          </span>
        {/if}
      </button>

      <!-- Dropdown notificaciones -->
      {#if notiAbierto}
        <div class="topbar-dropdown topbar-noti-dropdown" role="menu">
          <div class="topbar-dropdown-header">
            <span class="topbar-dropdown-title">Notificaciones</span>
            {#if $notiTotal > 0}
              <span class="topbar-noti-count">{$notiTotal} nuevas</span>
            {/if}
          </div>

          <div class="topbar-noti-lista">
            {#if $notificaciones.length === 0}
              <div class="topbar-noti-empty">
                <i
                  class="bi bi-bell-slash mb-2 d-block"
                  style="font-size:1.5rem;color:#94a3b8"
                  aria-hidden="true"
                ></i>
                <span>Sin notificaciones nuevas</span>
              </div>
            {:else}
              {#each $notificaciones.slice(0, 6) as n (n.id)}
                <div
                  class="topbar-noti-item {n.leida ? '' : 'no-leida'}"
                  role="menuitem"
                >
                  <div class="topbar-noti-dot" aria-hidden="true"></div>
                  <div class="topbar-noti-body">
                    <div class="topbar-noti-msg">
                      {n.mensaje ?? n.titulo ?? "Notificación"}
                    </div>
                    <div class="topbar-noti-time">
                      {n.created_at
                        ? new Date(n.created_at).toLocaleDateString("es-CO", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </div>
                  </div>
                  {#if !n.leida}
                    <button
                      class="topbar-noti-marcar"
                      on:click={(e) => onMarcarLeida(e, n.id)}
                      title="Marcar como leída"
                      aria-label="Marcar como leída"
                    >
                      <i class="bi bi-check2" aria-hidden="true"></i>
                    </button>
                  {/if}
                </div>
              {/each}
            {/if}
          </div>

          <div class="topbar-dropdown-footer">
            <a href="/app/notificaciones" on:click={cerrarTodo}>
              Ver todas las notificaciones
            </a>
          </div>
        </div>
      {/if}
    </div>

    <!-- Avatar / menú de usuario -->
    <div class="topbar-user-wrap">
      <button
        class="topbar-avatar-btn {menuAbierto ? 'active' : ''}"
        on:click={toggleMenu}
        aria-label="Menú de usuario"
        aria-expanded={menuAbierto}
      >
        <div class="topbar-avatar">{iniciales}</div>
        <div class="topbar-user-info d-none d-md-block">
          <div class="topbar-user-correo">{session?.correo ?? ""}</div>
          <div class="topbar-user-rol">{etiquetaRol}</div>
        </div>
        <i
          class="bi bi-chevron-down topbar-chevron d-none d-md-block"
          aria-hidden="true"
        ></i>
      </button>

      <!-- Dropdown usuario -->
      {#if menuAbierto}
        <div class="topbar-dropdown topbar-user-dropdown" role="menu">
          <!-- Cabecera del menú -->
          <div class="topbar-dropdown-header">
            <div class="topbar-dm-avatar">{iniciales}</div>
            <div>
              <div class="topbar-dm-correo">{session?.correo ?? ""}</div>
              <div class="topbar-dm-rol">{etiquetaRol}</div>
            </div>
          </div>

          <div class="topbar-dropdown-divider"></div>

          <!-- Opciones -->
          <a
            href="/app/perfil"
            class="topbar-menu-item"
            role="menuitem"
            on:click={cerrarTodo}
          >
            <i class="bi bi-person-circle" aria-hidden="true"></i>
            Mi perfil
          </a>

          <a
            href="/app/notificaciones"
            class="topbar-menu-item"
            role="menuitem"
            on:click={cerrarTodo}
          >
            <i class="bi bi-bell" aria-hidden="true"></i>
            Notificaciones
            {#if $notiTotal > 0}
              <span class="topbar-menu-badge">{$notiTotal}</span>
            {/if}
          </a>

          <div class="topbar-dropdown-divider"></div>

          <button
            class="topbar-menu-item topbar-menu-logout"
            role="menuitem"
            on:click={onLogout}
            disabled={cerrandoSesion}
          >
            {#if cerrandoSesion}
              <span
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              Cerrando sesión...
            {:else}
              <i class="bi bi-box-arrow-right" aria-hidden="true"></i>
              Cerrar sesión
            {/if}
          </button>
        </div>
      {/if}
    </div>
  </div>
</header>
