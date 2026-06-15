<!-- src/routes/admin/sacramentos/+page.svelte -->
<script>
  import ConfirmDialog from "$lib/components/ui/ConfirmDialog.svelte";
  import "$lib/styles/admin/admin.css";
  import "$lib/styles/admin/sacramentos.css";

  // ── Mock — reemplazar con listarSacramentos() ─────────────
  let sacramentos = [
    {
      id: 1,
      nombre: "Bautismo",
      activo: true,
      genera_certificado: true,
      nivel_riesgo: "bajo",
      requiere_pago: true,
      edad_minima: null,
      edad_maxima: null,
      monto_sugerido: null,
      descripcion: null,
      requisitos_count: 12,
    },
    {
      id: 2,
      nombre: "Primera Comunión",
      activo: true,
      genera_certificado: true,
      nivel_riesgo: "bajo",
      requiere_pago: true,
      edad_minima: 7,
      edad_maxima: null,
      monto_sugerido: null,
      descripcion: null,
      requisitos_count: 6,
    },
    {
      id: 3,
      nombre: "Confirmación",
      activo: true,
      genera_certificado: true,
      nivel_riesgo: "bajo",
      requiere_pago: true,
      edad_minima: 12,
      edad_maxima: null,
      monto_sugerido: null,
      descripcion: null,
      requisitos_count: 9,
    },
    {
      id: 4,
      nombre: "Matrimonio",
      activo: true,
      genera_certificado: true,
      nivel_riesgo: "alto",
      requiere_pago: true,
      edad_minima: 18,
      edad_maxima: null,
      monto_sugerido: null,
      descripcion: null,
      requisitos_count: 13,
    },
    {
      id: 5,
      nombre: "Unción de los Enfermos",
      activo: true,
      genera_certificado: false,
      nivel_riesgo: "bajo",
      requiere_pago: false,
      edad_minima: null,
      edad_maxima: null,
      monto_sugerido: null,
      descripcion: null,
      requisitos_count: 4,
    },
    {
      id: 6,
      nombre: "Penitencia",
      activo: true,
      genera_certificado: false,
      nivel_riesgo: "bajo",
      requiere_pago: false,
      edad_minima: null,
      edad_maxima: null,
      monto_sugerido: null,
      descripcion: null,
      requisitos_count: 2,
    },
  ];

  // ── Modal crear/editar ────────────────────────────────────
  let modalAbierto = false;
  let modoEditar = false;
  let sacTarget = null;
  let guardando = false;
  let errorModal = "";

  const formVacio = () => ({
    nombre: "",
    descripcion: "",
    nivel_riesgo: "bajo",
    genera_certificado: false,
    requiere_pago: false,
    monto_sugerido: "",
    edad_minima: "",
    edad_maxima: "",
    activo: true,
  });
  let form = formVacio();

  function abrirCrear() {
    modoEditar = false;
    sacTarget = null;
    form = formVacio();
    errorModal = "";
    modalAbierto = true;
  }

  function abrirEditar(sac) {
    modoEditar = true;
    sacTarget = sac;
    form = {
      nombre: sac.nombre,
      descripcion: sac.descripcion ?? "",
      nivel_riesgo: sac.nivel_riesgo,
      genera_certificado: sac.genera_certificado,
      requiere_pago: sac.requiere_pago,
      monto_sugerido: sac.monto_sugerido ?? "",
      edad_minima: sac.edad_minima ?? "",
      edad_maxima: sac.edad_maxima ?? "",
      activo: sac.activo,
    };
    errorModal = "";
    modalAbierto = true;
  }

  function guardar() {
    if (!form.nombre.trim()) {
      errorModal = "El nombre es obligatorio.";
      return;
    }
    guardando = true;
    // TODO: llamar crearSacramento(form) o actualizarSacramento(sacTarget.id, form)
    setTimeout(() => {
      if (modoEditar) {
        sacramentos = sacramentos.map((s) =>
          s.id === sacTarget.id ? { ...s, ...form } : s,
        );
      } else {
        sacramentos = [
          ...sacramentos,
          { id: Date.now(), ...form, requisitos_count: 0 },
        ];
      }
      guardando = false;
      modalAbierto = false;
    }, 800);
  }

  // ── Icons por sacramento ──────────────────────────────────
  const ICONOS = {
    Bautismo: "bi-droplet-fill",
    "Primera Comunión": "bi-cup-straw",
    Confirmación: "bi-shield-check",
    Matrimonio: "bi-hearts",
    "Unción de los Enfermos": "bi-heart-pulse-fill",
    Penitencia: "bi-chat-square-heart",
  };

  function icono(nombre) {
    return ICONOS[nombre] ?? "bi-star";
  }

  function formatMonto(m) {
    if (!m) return null;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(m);
  }
</script>

<svelte:head><title>EcclesiaSys – Sacramentos</title></svelte:head>

<div class="pg-wrap">
  <!-- ── Encabezado ── -->
  <div class="pg-header">
    <div>
      <h1 class="pg-titulo">Sacramentos</h1>
      <p class="pg-subtitulo">
        {sacramentos.filter((s) => s.activo).length} activos ·
        {sacramentos.length} total
      </p>
    </div>
    <button class="btn-primary" on:click={abrirCrear}>
      <i class="bi bi-plus-circle me-2" aria-hidden="true"></i>Nuevo sacramento
    </button>
  </div>

  <!-- ── Cards de sacramentos ── -->
  <div class="sacramentos-admin-grid">
    {#each sacramentos as sac (sac.id)}
      <div class="sac-admin-card {!sac.activo ? 'inactivo' : ''}">
        <!-- Header de la card -->
        <div class="sac-admin-card-header">
          <div class="sac-admin-icon">
            <i class="bi {icono(sac.nombre)}" aria-hidden="true"></i>
          </div>
          <div class="sac-admin-nombre-wrap">
            <div class="sac-admin-nombre">{sac.nombre}</div>
            {#if !sac.activo}
              <span class="sac-inactivo-tag">Inactivo</span>
            {/if}
          </div>
          <div class="sac-admin-acciones">
            <button
              class="btn-accion btn-accion-ver"
              title="Editar"
              on:click={() => abrirEditar(sac)}
            >
              <i class="bi bi-pencil" aria-hidden="true"></i>
            </button>

            <a
              href="/admin/sacramentos/{sac.id}"
              class="btn-accion btn-accion-ver"
              title="Ver detalle"
            >
              <i class="bi bi-eye" aria-hidden="true"></i>
            </a>

            <a
              href="/admin/sacramentos/{sac.id}/requisitos"
              class="btn-accion"
              style="color:#7c3aed"
              title="Gestionar requisitos"
            >
              <i class="bi bi-list-check" aria-hidden="true"></i>
            </a>
          </div>
        </div>

        <!-- Badges de propiedades -->
        <div class="sac-admin-badges">
          <span
            class="sac-badge {sac.nivel_riesgo === 'alto'
              ? 'badge-riesgo-alto'
              : 'badge-riesgo-bajo'}"
          >
            <i
              class="bi bi-{sac.nivel_riesgo === 'alto'
                ? 'exclamation-triangle'
                : 'lightning'} me-1"
            ></i>
            Riesgo {sac.nivel_riesgo}
          </span>
          {#if sac.genera_certificado}
            <span class="sac-badge badge-certificado">
              <i class="bi bi-patch-check me-1"></i>Certificado
            </span>
          {/if}
          {#if sac.requiere_pago}
            <span class="sac-badge badge-pago">
              <i class="bi bi-cash me-1"></i>
              {sac.monto_sugerido
                ? formatMonto(sac.monto_sugerido)
                : "Requiere pago"}
            </span>
          {/if}
          {#if sac.edad_minima}
            <span class="sac-badge badge-edad">
              <i class="bi bi-person me-1"></i>Mín. {sac.edad_minima} años
            </span>
          {/if}
        </div>

        <!-- Footer con enlace a requisitos -->
        <div class="sac-admin-footer">
          <a href="/admin/sacramentos/{sac.id}/requisitos" class="sac-req-link">
            <i class="bi bi-list-check me-1" aria-hidden="true"></i>
            {sac.requisitos_count} requisito{sac.requisitos_count !== 1
              ? "s"
              : ""} configurado{sac.requisitos_count !== 1 ? "s" : ""}
          </a>
          <a href="/admin/sacramentos/{sac.id}" class="sac-ver-link">
            Ver detalle <i class="bi bi-arrow-right ms-1" aria-hidden="true"
            ></i>
          </a>
        </div>
      </div>
    {/each}
  </div>
</div>

<!-- ══ Modal crear / editar ══ -->
{#if modalAbierto}
  <div
    class="modal-overlay"
    on:click={() => (modalAbierto = false)}
    aria-hidden="true"
  ></div>
  <div class="modal-box modal-box-lg" role="dialog" aria-modal="true">
    <div class="modal-header">
      <div class="modal-icon-primary">
        <i class="bi bi-water" aria-hidden="true"></i>
      </div>
      <h3 class="modal-titulo">
        {modoEditar ? "Editar sacramento" : "Nuevo sacramento"}
      </h3>
    </div>

    {#if errorModal}
      <div class="alerta-error mb-3">{errorModal}</div>
    {/if}

    <div class="row g-3">
      <!-- Nombre -->
      <div class="col-12">
        <label class="form-label small fw-semibold" for="nombre">
          Nombre <span class="text-danger">*</span>
        </label>
        <input
          type="text"
          class="form-control"
          id="nombre"
          bind:value={form.nombre}
          placeholder="Ej: Bautismo"
        />
      </div>

      <!-- Descripción -->
      <div class="col-12">
        <label class="form-label small fw-semibold" for="descripcion">
          Descripción
        </label>
        <textarea
          class="form-control"
          rows="2"
          id="descripcion"
          bind:value={form.descripcion}
          placeholder="Descripción del sacramento..."
        ></textarea>
      </div>

      <!-- Nivel de riesgo -->
      <div class="col-md-6">
        <label class="form-label small fw-semibold" for="nivel_riesgo">
          Nivel de riesgo
        </label>
        <select
          class="form-select"
          id="nivel_riesgo"
          bind:value={form.nivel_riesgo}
        >
          <option value="bajo">Bajo — Aprobación automática</option>
          <option value="alto">Alto — Requiere revisión manual</option>
        </select>
      </div>

      <!-- Monto sugerido -->
      <div class="col-md-6">
        <label class="form-label small fw-semibold" for="monto_sugerido">
          Monto sugerido (COP)
        </label>
        <input
          type="number"
          class="form-control"
          bind:value={form.monto_sugerido}
          placeholder="0"
          min="0"
          disabled={!form.requiere_pago}
        />
      </div>

      <!-- Edad mínima -->
      <div class="col-md-6">
        <label class="form-label small fw-semibold" for="edad_minima">
          Edad mínima
        </label>
        <input
          type="number"
          class="form-control"
          id="edad_minima"
          bind:value={form.edad_minima}
          placeholder="Sin límite"
          min="0"
        />
      </div>

      <!-- Edad máxima -->
      <div class="col-md-6">
        <label class="form-label small fw-semibold" for="edad_maxima">
          Edad máxima
        </label>
        <input
          type="number"
          class="form-control"
          id="edad_maxima"
          bind:value={form.edad_maxima}
          placeholder="Sin límite"
          min="0"
        />
      </div>

      <!-- Checkboxes -->
      <div class="col-12">
        <div class="checks-row">
          <label class="check-toggle">
            <input type="checkbox" bind:checked={form.genera_certificado} />
            <span class="check-toggle-box"></span>
            <span class="check-toggle-label">Genera certificado</span>
          </label>
          <label class="check-toggle">
            <input type="checkbox" bind:checked={form.requiere_pago} />
            <span class="check-toggle-box"></span>
            <span class="check-toggle-label">Requiere pago</span>
          </label>
          <label class="check-toggle">
            <input type="checkbox" bind:checked={form.activo} />
            <span class="check-toggle-box"></span>
            <span class="check-toggle-label">Activo</span>
          </label>
        </div>
      </div>
    </div>

    <div class="modal-acciones">
      <button
        class="btn-modal-cancelar"
        on:click={() => (modalAbierto = false)}
        disabled={guardando}
      >
        Cancelar
      </button>
      <button class="btn-modal-primary" on:click={guardar} disabled={guardando}>
        {#if guardando}
          <span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
        {/if}
        {modoEditar ? "Guardar cambios" : "Crear sacramento"}
      </button>
    </div>
  </div>
{/if}
