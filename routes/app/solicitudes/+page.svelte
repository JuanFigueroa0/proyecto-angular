<!-- src/routes/app/solicitudes/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Badge from "$lib/components/ui/Badge.svelte";
  import SearchBar from "$lib/components/ui/SearchBar.svelte";
  import EmptyState from "$lib/components/ui/EmptyState.svelte";
  import Spinner from "$lib/components/ui/Spinner.svelte";
  import Pagination from "$lib/components/ui/Pagination.svelte";
  import "$lib/styles/admin/solicitudes.css";
  import {
    getMisSolicitudes,
    listarTodasSolicitudes,
    ESTADOS_SOLICITUD,
  } from "$lib/js/interfaces/solicitudes.js";
  import { getRolesNormalizados } from "$lib/js/interfaces/navigation.js";
  import { toast } from "$lib/js/stores/ui.js";

  // ── Roles ─────────────────────────────────────────────────
  const ROLES_ADMIN = ["superadmin", "secretario", "parroco"];
  let esAdmin = false;

  // ── Vista admin: "todas" o "mis" ──────────────────────────
  let vistaAdmin = "todas"; // "todas" | "mis"

  // ── Estado ────────────────────────────────────────────────
  let solicitudes = [];
  let total = 0;
  let pagina = 1;
  const POR_PAGINA = 15;
  let cargando = true;
  let filtroEstado = "";
  let busqueda = "";

  onMount(async () => {
    const roles = getRolesNormalizados();
    esAdmin = ROLES_ADMIN.some((r) => roles.includes(r));
    await cargar();
  });

  async function cargar() {
    cargando = true;
    const params = { pagina, por_pagina: POR_PAGINA, estado: filtroEstado };

    // Admin en vista "todas" → endpoint admin; cualquier otro caso → mis solicitudes
    const usarAdmin = esAdmin && vistaAdmin === "todas";
    const r = usarAdmin
      ? await listarTodasSolicitudes(params)
      : await getMisSolicitudes(params);

    cargando = false;
    if (r.ok) {
      solicitudes = r.data?.items ?? r.data ?? [];
      total = r.data?.total ?? solicitudes.length;
    } else {
      toast.error(r.error ?? "Error al cargar solicitudes.");
    }
  }

  function cambiarVista(v) {
    vistaAdmin = v;
    pagina = 1;
    busqueda = "";
    cargar();
  }

  function cambiarFiltro(estado) {
    filtroEstado = estado;
    pagina = 1;
    cargar();
  }

  function cambiarPagina(p) {
    pagina = p;
    cargar();
  }

  $: solicitudesFiltradas = busqueda.trim()
    ? solicitudes.filter((s) => {
        const b = busqueda.toLowerCase();
        return (
          s.sacramento?.nombre?.toLowerCase().includes(b) ||
          String(s.id).includes(b) ||
          s.usuario?.correo?.toLowerCase().includes(b)
        );
      })
    : solicitudes;

  function formatFecha(f) {
    if (!f) return "—";
    return new Date(f).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const FILTROS = [
    { valor: "", label: "Todas" },
    { valor: "pendiente", label: "Pendientes" },
    { valor: "en_revision", label: "En revisión" },
    { valor: "documentacion_incompleta", label: "Doc. incompleta" },
    { valor: "aprobada", label: "Aprobadas" },
    { valor: "rechazada", label: "Rechazadas" },
    { valor: "cancelada", label: "Canceladas" },
  ];

  const ICONOS_SAC = {
    Bautismo: "bi-droplet-fill",
    "Primera Comunión": "bi-cup-straw",
    Confirmación: "bi-shield-check",
    Matrimonio: "bi-hearts",
    "Unción de los Enfermos": "bi-heart-pulse-fill",
    Penitencia: "bi-chat-square-heart",
  };

  const NOMBRES_SACRAMENTO = {
    1: "Bautismo",
    2: "Primera Comunión",
    3: "Confirmación",
    4: "Matrimonio",
    5: "Unción de los Enfermos",
    6: "Penitencia",
  };

  // Título dinámico según vista
  $: tituloVista = esAdmin
    ? vistaAdmin === "todas"
      ? "Todas las Solicitudes"
      : "Mis Solicitudes"
    : "Mis Solicitudes";
</script>

<svelte:head><title>{tituloVista} · EcclesiaSys</title></svelte:head>

<div class="sol-page">
  <!-- Encabezado -->
  <div class="sol-header">
    <div>
      <h1 class="sol-titulo">{tituloVista}</h1>
      <p class="sol-sub">
        {esAdmin && vistaAdmin === "todas"
          ? "Gestiona y revisa todas las solicitudes sacramentales"
          : "Historial y estado de tus solicitudes sacramentales"}
      </p>
    </div>
    <a href="/app/solicitudes/nueva" class="btn-nueva">
      <i class="bi bi-plus-lg me-2"></i>Nueva Solicitud
    </a>
  </div>

  <!-- Tabs admin: Todas / Mis solicitudes -->
  {#if esAdmin}
    <div class="vista-tabs mb-4">
      <button
        class="vista-tab {vistaAdmin === 'todas' ? 'activo' : ''}"
        on:click={() => cambiarVista("todas")}
      >
        <i class="bi bi-inbox-fill me-2"></i>Todas las solicitudes
      </button>
      <button
        class="vista-tab {vistaAdmin === 'mis' ? 'activo' : ''}"
        on:click={() => cambiarVista("mis")}
      >
        <i class="bi bi-person me-2"></i>Mis solicitudes
      </button>
    </div>
  {/if}

  <!-- Filtros de estado -->
  <div class="sol-filtros mb-3">
    {#each FILTROS as f}
      <button
        class="filtro-pill {filtroEstado === f.valor ? 'activo' : ''}"
        on:click={() => cambiarFiltro(f.valor)}
      >
        {f.label}
      </button>
    {/each}
  </div>

  <!-- Búsqueda -->
  <div class="sol-busqueda mb-4">
    <SearchBar
      placeholder={esAdmin && vistaAdmin === "todas"
        ? "Buscar por sacramento, ID o correo..."
        : "Buscar por sacramento o ID..."}
      bind:value={busqueda}
    />
  </div>

  <!-- Contenido -->
  {#if cargando}
    <div class="d-flex justify-content-center py-5"><Spinner /></div>
  {:else if solicitudesFiltradas.length === 0}
    <EmptyState
      icon="bi-inbox"
      titulo="Sin solicitudes"
      descripcion={filtroEstado
        ? "No hay solicitudes con este estado."
        : esAdmin && vistaAdmin === "todas"
          ? "No hay solicitudes registradas."
          : "Aún no has realizado ninguna solicitud sacramental."}
    >
      <a href="/app/solicitudes/nueva" class="btn-nueva mt-3">
        <i class="bi bi-plus-lg me-2"></i>Nueva Solicitud
      </a>
    </EmptyState>
  {:else}
    <div class="sol-lista">
      {#each solicitudesFiltradas as sol (sol.id)}
        <button
          class="sol-card"
          on:click={() => goto(`/app/solicitudes/${sol.id}`)}
          aria-label="Ver solicitud #{sol.id}"
        >
          <div class="sol-icono">
            <i
              class="bi {ICONOS_SAC[sol.sacramento?.nombre] ?? 'bi-award'}"
              aria-hidden="true"
            ></i>
          </div>

          <div class="sol-info">
            <div class="sol-nombre">
              {sol.sacramento?.nombre ??
                NOMBRES_SACRAMENTO[sol.sacramento_id] ??
                "Sacramento"}
            </div>
            <div class="sol-meta">
              <span
                ><i class="bi bi-calendar3 me-1"></i>{formatFecha(
                  sol.created_at,
                )}</span
              >
              <span class="ms-3 text-muted">ID #{sol.id}</span>
              {#if esAdmin && vistaAdmin === "todas" && sol.usuario?.correo}
                <span class="ms-3"
                  ><i class="bi bi-person me-1"></i>{sol.usuario.correo}</span
                >
              {/if}
            </div>
            {#if sol.observaciones_secretario}
              <div class="sol-obs-sec">
                <i class="bi bi-chat-left-text me-1"
                ></i>{sol.observaciones_secretario}
              </div>
            {/if}
          </div>

          <div class="sol-estado">
            <Badge
              color={ESTADOS_SOLICITUD[sol.estado]?.color ?? "secondary"}
              label={ESTADOS_SOLICITUD[sol.estado]?.label ?? sol.estado}
            />
            <!-- Alerta visual si hay acción requerida del usuario -->
            {#if sol.estado === "documentacion_incompleta"}
              <div class="sol-alerta-accion">
                <i class="bi bi-exclamation-circle-fill me-1"></i>Acción
                requerida
              </div>
            {/if}
          </div>

          <i class="bi bi-chevron-right text-muted sol-arrow"></i>
        </button>
      {/each}
    </div>

    {#if total > POR_PAGINA}
      <div class="mt-4">
        <Pagination
          currentPage={pagina}
          totalItems={total}
          itemsPerPage={POR_PAGINA}
          on:change={(e) => cambiarPagina(e.detail)}
        />
      </div>
    {/if}
  {/if}
</div>
