<!-- src/lib/components/layout/Sidebar.svelte -->
<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { getSession } from "$lib/js/api/client.js";
  import {
    getMenuAgrupado,
    getRolesNormalizados,
  } from "$lib/js/interfaces/navigation.js";
  import {
    sidebarCollapsed,
    sidebarMobileOpen,
    toggleSidebar,
    closeMobileSidebar,
    badgesSidebar,
  } from "$lib/js/stores/ui.js";
  import "$lib/styles/layout/sidebar.css";

  let menuAgrupado = [];
  let session = null;
  let etiquetaRol = "";
  let iniciales = "";

  // ── IDs que deben coincidir EXACTO porque su href es
  //    prefijo de otro ítem del menú (evita doble activo)
  const EXACTOS = new Set([
    "solicitudes",
    "certificados",
    "eventos",
    "cursos",
    "personas",
    "usuarios",
    "sacramentos",
  ]);

  onMount(() => {
    session = getSession();
    menuAgrupado = getMenuAgrupado();
    iniciales = calcularIniciales();
    etiquetaRol = calcularEtiquetaRol();
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

  // ── Ruta activa — reactiva con $page ──────────────────
  function esActivo(item) {
    const ruta = $page.url.pathname;

    // Dashboard siempre exacto
    if (item.href === "/app/dashboard") return ruta === item.href;

    // Ítems cuyo href es prefijo de otro ítem → solo exacto
    if (EXACTOS.has(item.id)) return ruta === item.href;

    // Resto: exacto O subruta directa
    return ruta === item.href || ruta.startsWith(item.href + "/");
  }
</script>

<!-- Overlay móvil -->
<div
  class="sidebar-overlay {$sidebarMobileOpen ? 'visible' : ''}"
  on:click={closeMobileSidebar}
  aria-hidden="true"
></div>

<aside
  class="sidebar {$sidebarCollapsed ? 'collapsed' : ''} {$sidebarMobileOpen
    ? 'mobile-open'
    : ''}"
  aria-label="Menú principal"
>
  <!-- Brand -->
  <a href="/app/dashboard" class="sidebar-brand" on:click={closeMobileSidebar}>
    <div class="sidebar-brand-icon">✝</div>
    <div class="sidebar-brand-text">
      <div class="sidebar-brand-name">EcclesiaSys</div>
      <div class="sidebar-brand-sub">Gestión Sacramental</div>
    </div>
  </a>

  <!-- Navegación -->
  <nav class="sidebar-nav">
    {#each menuAgrupado as grupo}
      <div class="sidebar-section">
        <div class="sidebar-section-label">{grupo.seccion}</div>
        <ul class="list-unstyled m-0">
          {#each grupo.items as item (item.id)}
            <li class="sidebar-item">
              <a
                href={item.href}
                class="sidebar-link {esActivo(item) ? 'active' : ''}"
                data-tooltip={item.label}
                on:click={closeMobileSidebar}
                aria-current={esActivo(item) ? "page" : undefined}
              >
                <span class="sidebar-link-icon">
                  <i class="bi {item.icon}" aria-hidden="true"></i>
                </span>
                <span class="sidebar-link-text">{item.label}</span>
                {#if item.badge && $badgesSidebar[item.badge] > 0}
                  <span class="sidebar-badge">
                    {$badgesSidebar[item.badge] > 99
                      ? "99+"
                      : $badgesSidebar[item.badge]}
                  </span>
                {/if}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </nav>

  <!-- Footer -->
  <div class="sidebar-footer">
    <button
      class="sidebar-toggle"
      on:click={toggleSidebar}
      aria-label={$sidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
    >
      <i class="bi bi-chevron-left sidebar-toggle-icon" aria-hidden="true"></i>
    </button>
  </div>
</aside>
