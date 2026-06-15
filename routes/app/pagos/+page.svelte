<!-- src/routes/admin/pagos/+page.svelte -->
<script>
  import "$lib/styles/admin/pagos.css";
  import "$lib/styles/admin/admin.css";
  const PAGOS_MOCK = [
    {
      id: 1,
      referencia: "Solicitud #3 – Bautismo",
      monto: 80000,
      estado: "pendiente",
      metodo: null,
      fecha: null,
      registrado: "—",
    },
    {
      id: 2,
      referencia: "Solicitud #1 – Matrimonio",
      monto: 200000,
      estado: "pagado",
      metodo: "efectivo",
      fecha: "2026-03-08",
      registrado: "Sec. Torres",
    },
    {
      id: 3,
      referencia: "Evento: Retiro Espiritual",
      monto: 50000,
      estado: "pendiente",
      metodo: null,
      fecha: null,
      registrado: "—",
    },
    {
      id: 4,
      referencia: "Solicitud #5 – Confirmación",
      monto: 60000,
      estado: "anulado",
      metodo: "transferencia",
      fecha: "2026-02-20",
      registrado: "Sec. Torres",
    },
  ];

  let filtroEstado = "";
  let modalPago = false;
  let pagoSeleccionado = null;

  $: filtrados = PAGOS_MOCK.filter(
    (p) => !filtroEstado || p.estado === filtroEstado,
  );

  function abrirPago(p) {
    pagoSeleccionado = p;
    modalPago = true;
  }

  const BADGE = {
    pendiente: "badge-warning",
    pagado: "badge-success",
    anulado: "badge-secondary",
  };

  function formatMonto(m) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(m);
  }
</script>

<svelte:head><title>EcclesiaSys – Pagos</title></svelte:head>

<div class="pg-wrap">
  <div class="pg-header">
    <div>
      <h1 class="pg-titulo">Gestión de Pagos</h1>
      <p class="pg-subtitulo text-warning fw-semibold small">
        <i class="bi bi-shield-lock me-1"></i>
        Solo el secretario puede marcar pagos como recibidos
      </p>
    </div>
    <!-- Stats rápidas -->
    <div class="d-flex gap-2">
      <div class="pago-stat pendiente">
        {PAGOS_MOCK.filter((p) => p.estado === "pendiente").length} pendientes
      </div>
      <div class="pago-stat pagado">
        {PAGOS_MOCK.filter((p) => p.estado === "pagado").length} pagados
      </div>
    </div>
  </div>

  <div class="filtros-bar mb-4">
    <select
      class="form-select filtro-select"
      style="width:auto"
      bind:value={filtroEstado}
    >
      <option value="">Todos</option>
      <option value="pendiente">Pendientes</option>
      <option value="pagado">Pagados</option>
      <option value="anulado">Anulados</option>
    </select>
  </div>

  <div class="tabla-wrap">
    <table class="tabla">
      <thead>
        <tr>
          <th>#</th>
          <th>Referencia</th>
          <th>Monto</th>
          <th>Estado</th>
          <th>Método</th>
          <th>Fecha pago</th>
          <th>Registrado por</th>
          <th class="text-end">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {#each filtrados as p (p.id)}
          <tr class="tabla-fila">
            <td class="text-muted small">#{p.id}</td>
            <td class="fw-semibold small">{p.referencia}</td>
            <td class="fw-semibold" style="color:var(--primary)"
              >{formatMonto(p.monto)}</td
            >
            <td
              ><span class="badge-estado {BADGE[p.estado]}">{p.estado}</span
              ></td
            >
            <td class="text-muted small">{p.metodo ?? "—"}</td>
            <td class="text-muted small">{p.fecha ?? "—"}</td>
            <td class="text-muted small">{p.registrado}</td>
            <td class="text-end">
              {#if p.estado === "pendiente"}
                <button class="btn-marcar-pagado" on:click={() => abrirPago(p)}>
                  <i class="bi bi-cash-coin me-1"></i>Registrar pago
                </button>
              {:else}
                <span class="text-muted small">—</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<!-- Modal registrar pago -->
{#if modalPago && pagoSeleccionado}
  <div
    class="modal-overlay"
    on:click={() => (modalPago = false)}
    aria-hidden="true"
  ></div>
  <div class="modal-box" role="dialog" aria-modal="true">
    <div class="modal-header">
      <div class="modal-icon-primary"><i class="bi bi-cash-coin"></i></div>
      <h3 class="modal-titulo">Registrar pago</h3>
    </div>
    <p class="modal-desc">{pagoSeleccionado.referencia}</p>
    <p
      class="fw-semibold text-center mb-4"
      style="color:var(--primary);font-size:1.4rem"
    >
      {formatMonto(pagoSeleccionado.monto)}
    </p>
    <div class="mb-3">
      <label class="form-label small fw-semibold" for="metodo-pago"
        >Método de pago *</label
      >
      <select class="form-select" id="metodo-pago" required>
        <option value="">Selecciona...</option>
        <option value="efectivo">Efectivo</option>
        <option value="transferencia">Transferencia</option>
        <option value="cheque">Cheque</option>
        <option value="otro">Otro</option>
      </select>
    </div>
    <div class="mb-4">
      <label class="form-label small fw-semibold" for="observaciones"
        >Observaciones</label
      >
      <input
        type="text"
        class="form-control"
        id="observaciones"
        placeholder="Número de referencia, recibo, etc."
      />
    </div>
    <div class="modal-acciones">
      <button class="btn-modal-cancelar" on:click={() => (modalPago = false)}
        >Cancelar</button
      >
      <button class="btn-modal-primary">
        <i class="bi bi-check-lg me-1"></i>Confirmar pago
      </button>
    </div>
  </div>
{/if}
