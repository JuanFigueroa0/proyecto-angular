<!-- src/routes/admin/auditoria/+page.svelte -->
<script>
  import "$lib/styles/admin/auditoria.css";
  import "$lib/styles/admin/admin.css";
  const LOGS_MOCK = [
    {
      id: 1,
      usuario: "admin@ecclesia.com",
      accion: "LOGIN",
      entidad: "usuarios",
      entidad_id: 1,
      ip: "192.168.1.1",
      fecha: "2026-03-18 09:05",
    },
    {
      id: 2,
      usuario: "sec@ecclesia.com",
      accion: "CAMBIAR_ESTADO",
      entidad: "solicitudes_sacramento",
      entidad_id: 3,
      ip: "192.168.1.2",
      fecha: "2026-03-18 09:30",
    },
    {
      id: 3,
      usuario: "juan@mail.com",
      accion: "CREAR_SOLICITUD",
      entidad: "solicitudes_sacramento",
      entidad_id: 6,
      ip: "10.0.0.5",
      fecha: "2026-03-18 10:00",
    },
    {
      id: 4,
      usuario: "sec@ecclesia.com",
      accion: "EMITIR_CERTIFICADO",
      entidad: "certificados",
      entidad_id: 1,
      ip: "192.168.1.2",
      fecha: "2026-03-18 10:15",
    },
    {
      id: 5,
      usuario: "admin@ecclesia.com",
      accion: "ACTUALIZAR_ROL",
      entidad: "roles",
      entidad_id: 2,
      ip: "192.168.1.1",
      fecha: "2026-03-18 11:00",
    },
  ];

  const ACCION_COLOR = {
    LOGIN: "#16a34a",
    CAMBIAR_ESTADO: "#d97706",
    CREAR_SOLICITUD: "#2563eb",
    EMITIR_CERTIFICADO: "#7c3aed",
    ACTUALIZAR_ROL: "#dc2626",
  };

  let busqueda = "";
  $: filtrados = LOGS_MOCK.filter(
    (l) =>
      !busqueda ||
      l.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
      l.accion.toLowerCase().includes(busqueda.toLowerCase()) ||
      l.entidad.includes(busqueda),
  );

  let pagina = "ReportSection";

  const cambiarPagina = (p) => {
    pagina = p;
  };
</script>

<svelte:head><title>EcclesiaSys – Auditoría</title></svelte:head>

<div class="pg-wrap">
  <div class="pg-header">
    <div>
      <h1 class="pg-titulo">Registro de Auditoría</h1>
      <p class="pg-subtitulo">Solo lectura</p>
    </div>
  </div>

  <!-- PowerBI placeholder -->
  <div class="powerbi-slot mb-4">
    <div class="powerbi-inner">
      <i class="bi bi-graph-up" aria-hidden="true"></i>
      <div>
        <div class="fw-semibold">Gráfico Total de usuarios</div>
        <div class="text-muted small"></div>
      </div>
      <iframe
        title="BD_Eccleasys_1"
        width="600"
        height="373.5"
        src="https://app.powerbi.com/view?r=eyJrIjoiZTYxNTlkY2QtNjZmYy00NmQ2LTg3N2UtNTRjNTVkMzVjODk2IiwidCI6IjFlOWFhYmU4LTY3ZjgtNGYxYy1hMzI5LWE3NTRlOTI0OTlhZSIsImMiOjR9"
        frameborder="0"
        allowFullScreen="true"
      ></iframe>
    </div>
  </div>

  <div class="filtros-bar mb-4">
    <div class="input-group" style="max-width:320px">
      <span
        class="input-group-text"
        style="background:#f8fafc;border-color:#e2e8f0"
      >
        <i class="bi bi-search"></i>
      </span>
      <input
        type="text"
        class="form-control"
        placeholder="Buscar por usuario, acción o entidad..."
        bind:value={busqueda}
        style="border-color:#e2e8f0"
      />
    </div>
  </div>

  <div class="tabla-wrap">
    <table class="tabla">
      <thead>
        <tr>
          <th>#</th>
          <th>Usuario</th>
          <th>Acción</th>
          <th>Entidad</th>
          <th>IP</th>
          <th>Fecha y hora</th>
          <th class="text-end">Detalle</th>
        </tr>
      </thead>
      <tbody>
        {#each filtrados as log (log.id)}
          <tr class="tabla-fila">
            <td class="text-muted small">#{log.id}</td>
            <td class="small">{log.usuario}</td>
            <td>
              <span
                class="accion-tag"
                style="background:{ACCION_COLOR[
                  log.accion
                ]}18;color:{ACCION_COLOR[log.accion]}"
              >
                {log.accion}
              </span>
            </td>
            <td>
              <span class="entidad-tag">{log.entidad}</span>
              <span class="text-muted small ms-1">#{log.entidad_id}</span>
            </td>
            <td class="text-muted small">{log.ip}</td>
            <td class="text-muted small">{log.fecha}</td>
            <td class="text-end">
              <button class="btn-accion btn-accion-ver" title="Ver detalle">
                <i class="bi bi-eye"></i>
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
