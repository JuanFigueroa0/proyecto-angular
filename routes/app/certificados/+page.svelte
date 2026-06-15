<!-- src/routes/admin/certificados/+page.svelte -->
<script>
  import "$lib/styles/admin/certificados.css";
  import "$lib/styles/admin/admin.css";
  const CERTS_MOCK = [
    {
      id: 1,
      codigo: "CERT-2026-001",
      sacramento: "Bautismo",
      receptor: "Santiago García",
      estado: "emitido",
      fecha: "2026-03-01",
    },
    {
      id: 2,
      codigo: "CERT-2026-002",
      sacramento: "Confirmación",
      receptor: "Laura Martínez",
      estado: "emitido",
      fecha: "2026-03-05",
    },
    {
      id: 3,
      codigo: "CERT-2026-003",
      sacramento: "Matrimonio",
      receptor: "Carlos y Ana",
      estado: "revocado",
      fecha: "2026-02-20",
    },
  ];

  let busqueda = "";
  let filtroEstado = "";

  $: filtrados = CERTS_MOCK.filter((c) => {
    const matchB =
      !busqueda ||
      c.receptor.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.codigo.includes(busqueda);
    const matchE = !filtroEstado || c.estado === filtroEstado;
    return matchB && matchE;
  });

  const BADGE = {
    emitido: "badge-success",
    revocado: "badge-danger",
    anulado: "badge-secondary",
  };
</script>

<svelte:head><title>EcclesiaSys – Certificados</title></svelte:head>

<div class="pg-wrap">
  <div class="pg-header">
    <div>
      <h1 class="pg-titulo">Certificados Sacramentales</h1>
      <p class="pg-subtitulo">
        Emisión, verificación y revocación de certificados con QR
      </p>
    </div>
    <button class="btn-primary">
      <i class="bi bi-plus-circle me-2" aria-hidden="true"></i>Emitir
      certificado
    </button>
  </div>

  <!-- Stats -->
  <div class="row g-3 mb-4">
    {#each [{ label: "Emitidos", val: CERTS_MOCK.filter((c) => c.estado === "emitido").length, cls: "stat-success", icon: "bi-patch-check" }, { label: "Revocados", val: CERTS_MOCK.filter((c) => c.estado === "revocado").length, cls: "stat-danger", icon: "bi-x-circle" }, { label: "Total", val: CERTS_MOCK.length, cls: "stat-primary", icon: "bi-file-text" }] as s}
      <div class="col-md-4">
        <div class="stat-card {s.cls}">
          <i class="bi {s.icon} stat-icon" aria-hidden="true"></i>
          <div>
            <div class="stat-num">{s.val}</div>
            <div class="stat-lbl">{s.label}</div>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Filtros -->
  <div class="filtros-bar mb-4">
    <div class="input-group" style="max-width:300px">
      <span
        class="input-group-text"
        style="background:#f8fafc;border-color:#e2e8f0"
      >
        <i class="bi bi-search"></i>
      </span>
      <input
        type="text"
        class="form-control"
        placeholder="Buscar por nombre o código..."
        bind:value={busqueda}
        style="border-color:#e2e8f0"
      />
    </div>
    <select
      class="form-select filtro-select"
      style="width:auto"
      bind:value={filtroEstado}
    >
      <option value="">Todos</option>
      <option value="emitido">Emitidos</option>
      <option value="revocado">Revocados</option>
      <option value="anulado">Anulados</option>
    </select>
  </div>

  <div class="tabla-wrap">
    <table class="tabla">
      <thead>
        <tr>
          <th>Código</th>
          <th>Sacramento</th>
          <th>Receptor</th>
          <th>Estado</th>
          <th>Fecha emisión</th>
          <th class="text-end">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {#each filtrados as cert (cert.id)}
          <tr class="tabla-fila">
            <td>
              <code class="cert-codigo">{cert.codigo}</code>
            </td>
            <td><span class="fw-semibold">{cert.sacramento}</span></td>
            <td>{cert.receptor}</td>
            <td
              ><span class="badge-estado {BADGE[cert.estado]}"
                >{cert.estado}</span
              ></td
            >
            <td class="text-muted small">{cert.fecha}</td>
            <td class="text-end">
              <div class="d-flex gap-1 justify-content-end">
                <a
                  href="/admin/certificados/{cert.id}"
                  class="btn-accion btn-accion-ver"
                  title="Ver"
                >
                  <i class="bi bi-eye" aria-hidden="true"></i>
                </a>
                <button
                  class="btn-accion"
                  title="Descargar"
                  style="color:var(--primary)"
                >
                  <i class="bi bi-download" aria-hidden="true"></i>
                </button>
                {#if cert.estado === "emitido"}
                  <button
                    class="btn-accion btn-accion-eliminar"
                    title="Revocar"
                  >
                    <i class="bi bi-x-circle" aria-hidden="true"></i>
                  </button>
                {/if}
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
