<!-- src/routes/admin/sacramentos/[id]/requisitos/+page.svelte -->
<script>
  import { page } from "$app/stores";
  import ConfirmDialog from "$lib/components/ui/ConfirmDialog.svelte";
  import "$lib/styles/admin/sacramentos.css";
  const id = Number($page.params.id);

  const NOMBRES_SACRAMENTO = {
    1: "Bautismo",
    2: "Primera Comunión",
    3: "Confirmación",
    4: "Matrimonio",
    5: "Unción de los Enfermos",
    6: "Penitencia",
  };
  const nombreSacramento = NOMBRES_SACRAMENTO[id] ?? `Sacramento #${id}`;

  // Mock — reemplazar con getRequisitosSacramento(id)
  const MOCK_REQUISITOS = {
    1: [
      {
        id: 1,
        tipo_requisito: "documento",
        descripcion: "Registro civil del menor",
        obligatorio: true,
        sacramento_previo_id: null,
        orden: 1,
      },
      {
        id: 2,
        tipo_requisito: "documento",
        descripcion: "Documento de identidad del solicitante",
        obligatorio: true,
        sacramento_previo_id: null,
        orden: 2,
      },
      {
        id: 3,
        tipo_requisito: "documento",
        descripcion: "Certificado de bautismo del padre",
        obligatorio: false,
        sacramento_previo_id: null,
        orden: 3,
      },
      {
        id: 4,
        tipo_requisito: "documento",
        descripcion: "Certificado de bautismo de la madre",
        obligatorio: false,
        sacramento_previo_id: null,
        orden: 4,
      },
      {
        id: 5,
        tipo_requisito: "documento",
        descripcion: "Documento de identidad del padrino",
        obligatorio: true,
        sacramento_previo_id: null,
        orden: 5,
      },
      {
        id: 6,
        tipo_requisito: "documento",
        descripcion: "Documento de identidad de la madrina",
        obligatorio: true,
        sacramento_previo_id: null,
        orden: 6,
      },
      {
        id: 7,
        tipo_requisito: "documento",
        descripcion: "Certificado de confirmación del padrino",
        obligatorio: true,
        sacramento_previo_id: null,
        orden: 7,
      },
      {
        id: 8,
        tipo_requisito: "documento",
        descripcion: "Certificado de confirmación de la madrina",
        obligatorio: true,
        sacramento_previo_id: null,
        orden: 8,
      },
      {
        id: 9,
        tipo_requisito: "documento",
        descripcion: "Acta declarando que no recibió bautismo",
        obligatorio: true,
        sacramento_previo_id: null,
        orden: 9,
      },
      {
        id: 10,
        tipo_requisito: "curso",
        descripcion: "Certificado de catequesis de bautismo",
        obligatorio: true,
        sacramento_previo_id: null,
        orden: 10,
      },
      {
        id: 11,
        tipo_requisito: "documento",
        descripcion: "Documento de custodia legal del tutor",
        obligatorio: false,
        sacramento_previo_id: null,
        orden: 11,
      },
      {
        id: 12,
        tipo_requisito: "edad",
        descripcion: "Padrinos deben tener mínimo 16 años",
        obligatorio: true,
        sacramento_previo_id: null,
        orden: 12,
      },
    ],
    2: [
      {
        id: 13,
        tipo_requisito: "sacramento_previo",
        descripcion: "Bautismo (interno o externo con certificado)",
        obligatorio: true,
        sacramento_previo_id: 1,
        orden: 1,
      },
      {
        id: 14,
        tipo_requisito: "curso",
        descripcion: "Certificado de catequesis de Primera Comunión",
        obligatorio: true,
        sacramento_previo_id: null,
        orden: 2,
      },
      {
        id: 15,
        tipo_requisito: "documento",
        descripcion: "Documento de identidad del solicitante",
        obligatorio: true,
        sacramento_previo_id: null,
        orden: 3,
      },
      {
        id: 16,
        tipo_requisito: "edad",
        descripcion: "Edad mínima: 7 años",
        obligatorio: true,
        sacramento_previo_id: null,
        orden: 4,
      },
    ],
    4: [
      {
        id: 17,
        tipo_requisito: "sacramento_previo",
        descripcion: "Bautismo de ambos contrayentes",
        obligatorio: true,
        sacramento_previo_id: 1,
        orden: 1,
      },
      {
        id: 18,
        tipo_requisito: "sacramento_previo",
        descripcion: "Primera Comunión de ambos contrayentes",
        obligatorio: true,
        sacramento_previo_id: 2,
        orden: 2,
      },
      {
        id: 19,
        tipo_requisito: "sacramento_previo",
        descripcion: "Confirmación de ambos contrayentes",
        obligatorio: true,
        sacramento_previo_id: 3,
        orden: 3,
      },
      {
        id: 20,
        tipo_requisito: "curso",
        descripcion: "Certificado de curso prematrimonial",
        obligatorio: true,
        sacramento_previo_id: null,
        orden: 4,
      },
      {
        id: 21,
        tipo_requisito: "estado_civil",
        descripcion: "Ningún contrayente con matrimonio activo",
        obligatorio: true,
        sacramento_previo_id: null,
        orden: 5,
      },
      {
        id: 22,
        tipo_requisito: "edad",
        descripcion: "Edad mínima: 18 años para ambos",
        obligatorio: true,
        sacramento_previo_id: null,
        orden: 6,
      },
    ],
  };

  let requisitos = [...(MOCK_REQUISITOS[id] ?? [])];

  // ── Modal crear/editar requisito ──────────────────────────
  let modalAbierto = false;
  let modoEditar = false;
  let reqTarget = null;
  let guardando = false;
  let errorModal = "";

  const formVacio = () => ({
    tipo_requisito: "documento",
    descripcion: "",
    obligatorio: true,
    sacramento_previo_id: "",
    orden: requisitos.length + 1,
  });
  let form = formVacio();

  const TIPOS_REQUISITO = [
    { value: "documento", label: "Documento", icon: "bi-file-earmark" },
    {
      value: "sacramento_previo",
      label: "Sacramento previo",
      icon: "bi-water",
    },
    { value: "curso", label: "Curso", icon: "bi-book" },
    { value: "edad", label: "Edad", icon: "bi-person" },
    { value: "estado_civil", label: "Estado civil", icon: "bi-heart" },
    { value: "otro", label: "Otro", icon: "bi-three-dots" },
  ];

  const SACRAMENTOS_OPCIONES = [
    { id: 1, nombre: "Bautismo" },
    { id: 2, nombre: "Primera Comunión" },
    { id: 3, nombre: "Confirmación" },
    { id: 4, nombre: "Matrimonio" },
  ].filter((s) => s.id !== id);

  function abrirCrear() {
    modoEditar = false;
    reqTarget = null;
    form = formVacio();
    errorModal = "";
    modalAbierto = true;
  }

  function abrirEditar(req) {
    modoEditar = true;
    reqTarget = req;
    form = {
      tipo_requisito: req.tipo_requisito,
      descripcion: req.descripcion,
      obligatorio: req.obligatorio,
      sacramento_previo_id: req.sacramento_previo_id ?? "",
      orden: req.orden,
    };
    errorModal = "";
    modalAbierto = true;
  }

  function guardar() {
    if (!form.descripcion.trim()) {
      errorModal = "La descripción es obligatoria.";
      return;
    }
    guardando = true;
    // TODO: llamar agregarRequisito o actualizarRequisito
    setTimeout(() => {
      if (modoEditar) {
        requisitos = requisitos.map((r) =>
          r.id === reqTarget.id
            ? {
                ...r,
                ...form,
                sacramento_previo_id: form.sacramento_previo_id
                  ? Number(form.sacramento_previo_id)
                  : null,
              }
            : r,
        );
      } else {
        requisitos = [
          ...requisitos,
          {
            id: Date.now(),
            ...form,
            sacramento_previo_id: form.sacramento_previo_id
              ? Number(form.sacramento_previo_id)
              : null,
          },
        ];
      }
      guardando = false;
      modalAbierto = false;
    }, 600);
  }

  // ── Eliminar ──────────────────────────────────────────────
  let confirmEliminar = false;
  let reqEliminar = null;
  let eliminando = false;

  function pedirEliminar(req) {
    reqEliminar = req;
    confirmEliminar = true;
  }

  function confirmarEliminar() {
    eliminando = true;
    // TODO: llamar eliminarRequisito(reqEliminar.id)
    setTimeout(() => {
      requisitos = requisitos.filter((r) => r.id !== reqEliminar.id);
      eliminando = false;
      confirmEliminar = false;
    }, 500);
  }

  // ── Agrupar por tipo ──────────────────────────────────────
  $: agrupados = TIPOS_REQUISITO.reduce((acc, t) => {
    const items = requisitos
      .filter((r) => r.tipo_requisito === t.value)
      .sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99));
    if (items.length > 0) acc.push({ ...t, items });
    return acc;
  }, []);

  // Nombre del sacramento previo
  function nombreSacPrevio(id) {
    return (
      SACRAMENTOS_OPCIONES.find((s) => s.id === id)?.nombre ??
      NOMBRES_SACRAMENTO[id] ??
      `Sacramento #${id}`
    );
  }
</script>

<svelte:head
  ><title>EcclesiaSys – Requisitos: {nombreSacramento}</title></svelte:head
>

<div class="pg-wrap" style="max-width:860px;margin:0 auto">
  <!-- Breadcrumb -->
  <div class="mb-4 d-flex gap-2 align-items-center text-muted small flex-wrap">
    <a href="/admin/sacramentos" class="auth-link">Sacramentos</a>
    <i class="bi bi-chevron-right" style="font-size:.65rem"></i>
    <a href="/admin/sacramentos/{id}" class="auth-link">{nombreSacramento}</a>
    <i class="bi bi-chevron-right" style="font-size:.65rem"></i>
    <span>Requisitos</span>
  </div>

  <!-- ── Header ── -->
  <div class="pg-header mb-4">
    <div>
      <h1 class="pg-titulo">Requisitos — {nombreSacramento}</h1>
      <p class="pg-subtitulo">
        {requisitos.length} requisito{requisitos.length !== 1 ? "s" : ""} ·
        {requisitos.filter((r) => r.obligatorio).length} obligatorio{requisitos.filter(
          (r) => r.obligatorio,
        ).length !== 1
          ? "s"
          : ""}
      </p>
    </div>
    <button class="btn-primary" on:click={abrirCrear}>
      <i class="bi bi-plus-circle me-2" aria-hidden="true"></i>Agregar requisito
    </button>
  </div>

  <!-- ── Aviso ── -->
  <div class="aviso-req mb-4">
    <i class="bi bi-info-circle-fill me-2 text-primary" aria-hidden="true"></i>
    <div class="small text-muted">
      Los requisitos se muestran al usuario al crear una solicitud y determinan
      qué documentos debe presentar. Los <strong>obligatorios</strong> bloquean
      el avance si no se cumplen. Los <strong>opcionales</strong> son referenciales.
    </div>
  </div>

  <!-- ── Requisitos agrupados por tipo ── -->
  {#if requisitos.length === 0}
    <div class="tabla-empty">
      <i class="bi bi-list-check display-5 text-muted mb-3" aria-hidden="true"
      ></i>
      <p class="text-muted">
        No hay requisitos configurados para este sacramento.
      </p>
      <button class="btn-primary mt-2" on:click={abrirCrear}>
        <i class="bi bi-plus-circle me-1"></i>Agregar primer requisito
      </button>
    </div>
  {:else}
    {#each agrupados as grupo}
      <div class="req-grupo-card mb-3">
        <!-- Header del grupo -->
        <div class="req-grupo-header">
          <div class="req-grupo-icon">
            <i class="bi {grupo.icon}" aria-hidden="true"></i>
          </div>
          <div class="req-grupo-titulo">{grupo.label}</div>
          <span class="req-grupo-count">{grupo.items.length}</span>
        </div>

        <!-- Items del grupo -->
        <div class="req-items-lista">
          {#each grupo.items as req (req.id)}
            <div class="req-item">
              <div class="req-item-orden">{req.orden ?? "—"}</div>

              <div class="req-item-body">
                <div class="req-item-desc">{req.descripcion}</div>
                {#if req.sacramento_previo_id}
                  <div class="req-item-sub">
                    <i class="bi bi-link me-1" aria-hidden="true"></i>
                    Sacramento:
                    <strong>{nombreSacPrevio(req.sacramento_previo_id)}</strong>
                  </div>
                {/if}
              </div>

              <div class="req-item-badges">
                {#if req.obligatorio}
                  <span class="req-badge req-badge-obligatorio"
                    >Obligatorio</span
                  >
                {:else}
                  <span class="req-badge req-badge-opcional">Opcional</span>
                {/if}
              </div>

              <div class="req-item-acciones">
                <button
                  class="btn-accion btn-accion-ver"
                  title="Editar"
                  on:click={() => abrirEditar(req)}
                >
                  <i class="bi bi-pencil" aria-hidden="true"></i>
                </button>
                <button
                  class="btn-accion btn-accion-eliminar"
                  title="Eliminar"
                  on:click={() => pedirEliminar(req)}
                >
                  <i class="bi bi-trash" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  {/if}
</div>

<!-- ══ Modal crear / editar requisito ══ -->
{#if modalAbierto}
  <div
    class="modal-overlay"
    on:click={() => (modalAbierto = false)}
    aria-hidden="true"
  ></div>
  <div class="modal-box" role="dialog" aria-modal="true">
    <div class="modal-header">
      <div class="modal-icon-primary">
        <i class="bi bi-list-check" aria-hidden="true"></i>
      </div>
      <h3 class="modal-titulo">
        {modoEditar ? "Editar requisito" : "Nuevo requisito"}
      </h3>
    </div>

    {#if errorModal}
      <div class="alerta-error mb-3">{errorModal}</div>
    {/if}

    <!-- Tipo de requisito — selector visual -->
    <div class="mb-3">
      <label class="form-label small fw-semibold" for="tipo_requisito">
        Tipo de requisito
      </label>
      <div class="tipo-selector">
        {#each TIPOS_REQUISITO as t}
          <button
            type="button"
            class="tipo-btn {form.tipo_requisito === t.value ? 'active' : ''}"
            on:click={() => (form.tipo_requisito = t.value)}
          >
            <i class="bi {t.icon}" aria-hidden="true"></i>
            <span>{t.label}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Descripción -->
    <div class="mb-3">
      <label class="form-label small fw-semibold" for="descripcion">
        Descripción <span class="text-danger">*</span>
      </label>
      <textarea
        class="form-control"
        rows="2"
        bind:value={form.descripcion}
        placeholder="Describe claramente el requisito..."
      ></textarea>
    </div>

    <!-- Sacramento previo (solo si tipo = sacramento_previo) -->
    {#if form.tipo_requisito === "sacramento_previo"}
      <div class="mb-3">
        <label class="form-label small fw-semibold" for="sacramento_previo_id">
          Sacramento requerido
        </label>
        <select
          class="form-select"
          id="sacramento_previo_id"
          bind:value={form.sacramento_previo_id}
        >
          <option value="">-- Selecciona --</option>
          {#each SACRAMENTOS_OPCIONES as s}
            <option value={s.id}>{s.nombre}</option>
          {/each}
        </select>
      </div>
    {/if}

    <!-- Orden y obligatorio -->
    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <label class="form-label small fw-semibold" for="orden"
          >Orden de presentación</label
        >
        <input
          type="number"
          class="form-control"
          id="orden"
          bind:value={form.orden}
          min="1"
        />
      </div>
      <div class="col-md-6 d-flex align-items-end">
        <label class="check-toggle">
          <input type="checkbox" bind:checked={form.obligatorio} />
          <span class="check-toggle-box"></span>
          <span class="check-toggle-label fw-semibold">Obligatorio</span>
        </label>
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
        {modoEditar ? "Guardar cambios" : "Agregar requisito"}
      </button>
    </div>
  </div>
{/if}

<!-- ConfirmDialog eliminar -->
<ConfirmDialog
  bind:abierto={confirmEliminar}
  titulo="Eliminar requisito"
  mensaje="¿Eliminar este requisito?"
  detalle={reqEliminar?.descripcion}
  tipo="danger"
  txtOk="Eliminar"
  cargando={eliminando}
  on:confirmar={confirmarEliminar}
  on:cancelar={() => (confirmEliminar = false)}
/>
