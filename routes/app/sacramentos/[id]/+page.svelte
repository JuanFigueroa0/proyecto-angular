<!-- src/routes/admin/sacramentos/[id]/+page.svelte -->
<script>
  import { page } from "$app/stores";
  const id = Number($page.params.id);

  // Mock — reemplazar con getSacramento(id)
  const SACRAMENTOS_DATA = {
    1: {
      id: 1,
      nombre: "Bautismo",
      nivel_riesgo: "bajo",
      genera_certificado: true,
      requiere_pago: true,
      edad_minima: null,
      edad_maxima: null,
      activo: true,
      descripcion:
        "Sacramento de iniciación cristiana que borra el pecado original.",
      monto_sugerido: 80000,
    },
    2: {
      id: 2,
      nombre: "Primera Comunión",
      nivel_riesgo: "bajo",
      genera_certificado: true,
      requiere_pago: true,
      edad_minima: 7,
      edad_maxima: null,
      activo: true,
      descripcion: "Primer Sacramento de la Eucaristía.",
      monto_sugerido: 60000,
    },
    3: {
      id: 3,
      nombre: "Confirmación",
      nivel_riesgo: "bajo",
      genera_certificado: true,
      requiere_pago: true,
      edad_minima: 12,
      edad_maxima: null,
      activo: true,
      descripcion: "Sacramento que perfecciona la gracia del Bautismo.",
      monto_sugerido: 60000,
    },
    4: {
      id: 4,
      nombre: "Matrimonio",
      nivel_riesgo: "alto",
      genera_certificado: true,
      requiere_pago: true,
      edad_minima: 18,
      edad_maxima: null,
      activo: true,
      descripcion: "Sacramento de la unión conyugal.",
      monto_sugerido: 200000,
    },
    5: {
      id: 5,
      nombre: "Unción de los Enfermos",
      nivel_riesgo: "bajo",
      genera_certificado: false,
      requiere_pago: false,
      edad_minima: null,
      edad_maxima: null,
      activo: true,
      descripcion: "Sacramento para los enfermos graves.",
      monto_sugerido: null,
    },
    6: {
      id: 6,
      nombre: "Penitencia",
      nivel_riesgo: "bajo",
      genera_certificado: false,
      requiere_pago: false,
      edad_minima: null,
      edad_maxima: null,
      activo: true,
      descripcion: "Sacramento del perdón y la reconciliación.",
      monto_sugerido: null,
    },
  };

  const sac = SACRAMENTOS_DATA[id] ?? SACRAMENTOS_DATA[1];

  // Solicitudes recientes mock
  const solicitudes_recientes = [
    {
      id: 3,
      solicitante: "juan@mail.com",
      estado: "pendiente",
      fecha: "2026-03-15",
    },
    {
      id: 7,
      solicitante: "ana@mail.com",
      estado: "aprobada",
      fecha: "2026-03-10",
    },
    {
      id: 12,
      solicitante: "pedro@mail.com",
      estado: "en_revision",
      fecha: "2026-03-08",
    },
  ];

  const ICONOS = {
    Bautismo: "bi-droplet-fill",
    "Primera Comunión": "bi-cup-straw",
    Confirmación: "bi-shield-check",
    Matrimonio: "bi-hearts",
    "Unción de los Enfermos": "bi-heart-pulse-fill",
    Penitencia: "bi-chat-square-heart",
  };

  function formatMonto(m) {
    if (!m) return "Sin costo";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(m);
  }

  const BADGE_SOLICITUD = {
    pendiente: "badge-warning",
    en_revision: "badge-info",
    aprobada: "badge-success",
    rechazada: "badge-danger",
  };
</script>

<svelte:head><title>EcclesiaSys – {sac.nombre}</title></svelte:head>

<div class="pg-wrap" style="max-width:860px;margin:0 auto">
  <!-- Breadcrumb -->
  <div class="mb-4">
    <a href="/admin/sacramentos" class="auth-link small">
      <i class="bi bi-arrow-left me-1"></i>Sacramentos
    </a>
  </div>

  <!-- ── Header ── -->
  <div class="sac-detalle-header mb-4">
    <div class="sac-detalle-icon">
      <i class="bi {ICONOS[sac.nombre] ?? 'bi-star'}" aria-hidden="true"></i>
    </div>
    <div class="flex-1">
      <h1 class="pg-titulo mb-1">{sac.nombre}</h1>
      {#if sac.descripcion}
        <p class="text-muted small mb-0">{sac.descripcion}</p>
      {/if}
    </div>
    <div class="d-flex gap-2 flex-wrap">
      <a href="/admin/sacramentos/{sac.id}/requisitos" class="btn-requisitos">
        <i class="bi bi-list-check me-2" aria-hidden="true"></i>
        Gestionar requisitos
      </a>
      <button class="btn-primary">
        <i class="bi bi-pencil me-1" aria-hidden="true"></i>Editar
      </button>
    </div>
  </div>

  <!-- ── Propiedades en cards ── -->
  <div class="row g-3 mb-4">
    {#each [{ label: "Nivel de riesgo", val: sac.nivel_riesgo, icon: "bi-shield", extra: sac.nivel_riesgo === "alto" ? "badge-riesgo-alto" : "badge-riesgo-bajo" }, { label: "Genera certificado", val: sac.genera_certificado ? "Sí" : "No", icon: "bi-patch-check", extra: sac.genera_certificado ? "text-success" : "text-muted" }, { label: "Requiere pago", val: formatMonto(sac.monto_sugerido), icon: "bi-cash", extra: "" }, { label: "Edad mínima", val: sac.edad_minima ? `${sac.edad_minima} años` : "Sin límite", icon: "bi-person", extra: "" }] as prop}
      <div class="col-md-3 col-6">
        <div class="prop-card">
          <i class="bi {prop.icon} prop-icon {prop.extra}" aria-hidden="true"
          ></i>
          <div class="prop-val">{prop.val}</div>
          <div class="prop-label">{prop.label}</div>
        </div>
      </div>
    {/each}
  </div>

  <!-- ── Solicitudes recientes ── -->
  <div class="perfil-card">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div class="perfil-card-title mb-0">
        <i class="bi bi-clock-history me-2"></i>Solicitudes recientes
      </div>
      <a
        href="/admin/solicitudes?sacramento_id={sac.id}"
        class="auth-link small"
      >
        Ver todas <i class="bi bi-arrow-right ms-1"></i>
      </a>
    </div>

    {#if solicitudes_recientes.length === 0}
      <div class="tabla-empty py-3">
        <p class="text-muted small">Sin solicitudes recientes.</p>
      </div>
    {:else}
      <table class="tabla">
        <thead>
          <tr>
            <th>#</th>
            <th>Solicitante</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th class="text-end">Acción</th>
          </tr>
        </thead>
        <tbody>
          {#each solicitudes_recientes as sol}
            <tr class="tabla-fila">
              <td class="text-muted small">#{sol.id}</td>
              <td class="small">{sol.solicitante}</td>
              <td>
                <span
                  class="badge-estado {BADGE_SOLICITUD[sol.estado] ??
                    'badge-secondary'}"
                >
                  {sol.estado.replace("_", " ")}
                </span>
              </td>
              <td class="text-muted small">{sol.fecha}</td>
              <td class="text-end">
                <a
                  href="/admin/solicitudes/{sol.id}"
                  class="btn-accion btn-accion-ver"
                  aria-label="Ver solicitud {sol.id}"
                >
                  <i class="bi bi-eye"></i>
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>
