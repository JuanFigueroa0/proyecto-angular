<!-- src/routes/admin/dashboard/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import { api } from "$lib/js/api/client.js";
  import { getSession } from "$lib/js/api/client.js";
  import {
    getRolPrincipal,
    getSaludo,
    DASHBOARD_CONFIG,
    LABEL_ROL,
    COLOR_ROL,
  } from "$lib/js/utils/dashboard.js";
  import { requiereAuth } from "$lib/js/interfaces/navigation.js";
  import "$lib/styles/admin/dashboard.css";
  import "$lib/styles/admin/admin.css";

  // ── Estado ─────────────────────────────────────────────
  let session = null;
  let rol = null;
  let config = null;
  let stats = {}; // { [key]: number } desde el backend
  let cargandoStats = true;
  let solicitudesRecientes = [];
  let cargandoSolicitudes = false;

  // ── Inicialización ─────────────────────────────────────
  onMount(async () => {
    if (!requiereAuth()) return;

    session = getSession();
    rol = getRolPrincipal();
    config = DASHBOARD_CONFIG[rol] ?? DASHBOARD_CONFIG.usuario;

    // Cargar stats del backend
    await cargarStats();

    // Cargar widget de solicitudes si aplica
    if (
      config.widgets.includes("solicitudes_recientes") ||
      config.widgets.includes("mis_solicitudes_recientes")
    ) {
      await cargarSolicitudesRecientes();
    }
  });

  async function cargarStats() {
    cargandoStats = true;
    const r = await api.get("/dashboard/stats");
    cargandoStats = false;
    if (r.ok) stats = r.data ?? {};
  }

  async function cargarSolicitudesRecientes() {
    cargandoSolicitudes = true;
    const limite =
      rol === "usuario" ? "?limit=5&mis=true" : "?limit=5&estado=pendiente";
    const r = await api.get(`/solicitudes${limite}`);
    cargandoSolicitudes = false;
    if (r.ok) solicitudesRecientes = r.data?.items ?? r.data ?? [];
  }

  // ── Helpers ────────────────────────────────────────────
  function getStatValor(key) {
    if (cargandoStats) return "—";
    const v = stats[key];
    return v != null ? v : "—";
  }

  function getIniciales() {
    const correo = session?.correo ?? session?.sub ?? "";
    return correo.slice(0, 2).toUpperCase();
  }

  function formatEstadoBadge(estado) {
    const map = {
      pendiente: { label: "Pendiente", cls: "badge-warn" },
      en_revision: { label: "En revisión", cls: "badge-info" },
      aprobada: { label: "Aprobada", cls: "badge-ok" },
      rechazada: { label: "Rechazada", cls: "badge-danger" },
      documentacion_incompleta: { label: "Incompleta", cls: "badge-warn" },
      cancelada: { label: "Cancelada", cls: "badge-neutral" },
    };
    return map[estado] ?? { label: estado, cls: "badge-neutral" };
  }

  function formatFechaCorta(fecha) {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
</script>

<svelte:head>
  <title>EcclesiaSys – Dashboard</title>
</svelte:head>

{#if session && config}
  <div class="dash-page">
    <!-- ── Header de bienvenida ── -->
    <div class="dash-header">
      <div class="dash-header-left">
        <div class="dash-avatar" style="background:{COLOR_ROL[rol]}">
          {getIniciales()}
        </div>
        <div>
          <p class="dash-saludo">{getSaludo()},</p>
          <h1 class="dash-titulo">{config.bienvenida}</h1>
          <p class="dash-desc">{config.descripcion}</p>
        </div>
      </div>
      <div class="dash-header-right">
        <span class="dash-rol-badge">
          <i class="bi bi-shield-check me-1" aria-hidden="true"></i>
          {LABEL_ROL[rol] ?? rol}
        </span>
        {#if !session.perfil_completo}
          <a href="/app/perfil" class="dash-alerta-perfil">
            <i class="bi bi-exclamation-circle me-1" aria-hidden="true"></i>
            Completa tu perfil
          </a>
        {/if}
      </div>
    </div>

    <!-- ── Stats ── -->
    <div class="row g-3 mb-4">
      {#each config.stats as stat, i}
        <div
          class="col-6 col-md-4 col-xl-{config.stats.length <= 4 ? '3' : '2'}"
          style="animation-delay:{i * 60}ms"
        >
          <div class="stat-card {stat.color}">
            <div class="stat-icon">
              <i class="bi {stat.icon}" aria-hidden="true"></i>
            </div>
            <div class="stat-body">
              <div class="stat-valor">
                {#if cargandoStats}
                  <span class="stat-skeleton"></span>
                {:else}
                  {getStatValor(stat.key)}
                {/if}
              </div>
              <div class="stat-label">{stat.label}</div>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- ── Cuerpo principal: acciones + widget ── -->
    <div class="row g-4">
      <!-- Acciones rápidas -->
      <div class="col-lg-{config.widgets.length > 0 ? '7' : '12'}">
        <div class="dash-section">
          <h2 class="dash-section-title">
            <i class="bi bi-grid-3x3-gap me-2" aria-hidden="true"></i>Acciones
            rápidas
          </h2>
          <div class="row g-3">
            {#each config.acciones as accion, i}
              <div
                class="col-sm-6 col-xl-{config.acciones.length <= 4
                  ? '6'
                  : '4'}"
                style="animation-delay:{100 + i * 50}ms"
              >
                <a href={accion.href} class="accion-card {accion.color}">
                  <div class="accion-icon">
                    <i class="bi {accion.icon}" aria-hidden="true"></i>
                  </div>
                  <div class="accion-body">
                    <div class="accion-label">{accion.label}</div>
                    <div class="accion-desc">{accion.desc}</div>
                  </div>
                  <i class="bi bi-arrow-right accion-arrow" aria-hidden="true"
                  ></i>
                </a>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Widget lateral -->
      {#if config.widgets.length > 0}
        <div class="col-lg-5">
          <!-- Widget: solicitudes recientes -->
          {#if config.widgets.includes("solicitudes_recientes") || config.widgets.includes("mis_solicitudes_recientes")}
            <div class="dash-section">
              <div
                class="d-flex align-items-center justify-content-between mb-3"
              >
                <h2 class="dash-section-title mb-0">
                  <i class="bi bi-inbox me-2" aria-hidden="true"></i>
                  {rol === "usuario"
                    ? "Mis solicitudes"
                    : "Solicitudes recientes"}
                </h2>
                <a href="/app/solicitudes" class="dash-ver-mas">Ver todas</a>
              </div>

              {#if cargandoSolicitudes}
                <div class="text-center py-4">
                  <div
                    class="spinner-border spinner-border-sm text-primary"
                    role="status"
                  ></div>
                </div>
              {:else if solicitudesRecientes.length === 0}
                <div class="dash-empty">
                  <i
                    class="bi bi-inbox display-6 text-muted mb-2"
                    aria-hidden="true"
                  ></i>
                  <p class="text-muted small mb-0">
                    No hay solicitudes pendientes
                  </p>
                </div>
              {:else}
                <div class="solicitudes-lista">
                  {#each solicitudesRecientes as s}
                    <a href="/app/solicitudes/{s.id}" class="solicitud-item">
                      <div class="solicitud-icon">
                        <i class="bi bi-file-earmark-text" aria-hidden="true"
                        ></i>
                      </div>
                      <div class="solicitud-body">
                        <div class="solicitud-titulo">
                          {s.sacramento?.nombre ?? "Sacramento"}
                        </div>
                        <div class="solicitud-fecha">
                          {formatFechaCorta(s.created_at)}
                        </div>
                      </div>
                      <span
                        class="solicitud-badge {formatEstadoBadge(s.estado)
                          .cls}"
                      >
                        {formatEstadoBadge(s.estado).label}
                      </span>
                    </a>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}

          <!-- Widget: agenda hoy (párroco) -->
          {#if config.widgets.includes("agenda_hoy")}
            <div class="dash-section mt-3">
              <h2 class="dash-section-title">
                <i class="bi bi-calendar-day me-2" aria-hidden="true"></i>Hoy
              </h2>
              <div class="dash-empty">
                <i
                  class="bi bi-calendar-check display-6 text-muted mb-2"
                  aria-hidden="true"
                ></i>
                <p class="text-muted small mb-0">Sin eventos programados hoy</p>
                <a
                  href="/app/eventos"
                  class="btn btn-sm btn-outline-primary mt-2">Ver agenda</a
                >
              </div>
            </div>
          {/if}

          <!-- Widget: eventos próximos -->
          {#if config.widgets.includes("eventos_proximos_lista")}
            <div class="dash-section">
              <div
                class="d-flex align-items-center justify-content-between mb-3"
              >
                <h2 class="dash-section-title mb-0">
                  <i class="bi bi-calendar3 me-2" aria-hidden="true"
                  ></i>Próximos eventos
                </h2>
                <a href="/app/eventos" class="dash-ver-mas">Ver todos</a>
              </div>
              <div class="dash-empty">
                <i
                  class="bi bi-calendar-event display-6 text-muted mb-2"
                  aria-hidden="true"
                ></i>
                <p class="text-muted small mb-0">No hay eventos próximos</p>
              </div>
            </div>
          {/if}

          <!-- Widget: pagos pendientes (secretario) -->
          {#if config.widgets.includes("pagos_pendientes")}
            <div class="dash-section mt-3">
              <div
                class="d-flex align-items-center justify-content-between mb-3"
              >
                <h2 class="dash-section-title mb-0">
                  <i class="bi bi-cash-coin me-2" aria-hidden="true"></i>Pagos
                  pendientes
                </h2>
                <a href="/app/pagos" class="dash-ver-mas">Ver todos</a>
              </div>
              <div class="dash-empty">
                <i
                  class="bi bi-cash-stack display-6 text-muted mb-2"
                  aria-hidden="true"
                ></i>
                <p class="text-muted small mb-0">Sin pagos pendientes</p>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
    <!-- /row -->
  </div>
  <!-- /dash-page -->
{/if}
