<!-- src/routes/admin/eventos/+page.svelte -->
<script>
  import "$lib/styles/admin/eventos.css";
  import "$lib/styles/admin/admin.css";
  const EVENTOS_MOCK = [
    {
      id: 1,
      titulo: "Misa Acción de Gracias",
      tipo: "misa",
      estado: "publicado",
      fecha: "2026-04-05",
      hora: "10:00",
      lugar: "Templo principal",
      cupo: 200,
      inscritos: 45,
    },
    {
      id: 2,
      titulo: "Misa por Difunto – Mora",
      tipo: "misa",
      estado: "publicado",
      fecha: "2026-04-06",
      hora: "08:00",
      lugar: "Templo principal",
      cupo: 100,
      inscritos: 12,
    },
    {
      id: 3,
      titulo: "Retiro Espiritual Jóvenes",
      tipo: "retiro",
      estado: "borrador",
      fecha: "2026-04-20",
      hora: "08:00",
      lugar: "Salón parroquial",
      cupo: 40,
      inscritos: 0,
    },
    {
      id: 4,
      titulo: "Catequesis Primera Comunión",
      tipo: "curso",
      estado: "finalizado",
      fecha: "2026-03-01",
      hora: "09:00",
      lugar: "Salón B",
      cupo: 30,
      inscritos: 28,
    },
  ];

  let filtroEstado = "";
  let filtroTipo = "";
  let modalCrear = false;

  $: filtrados = EVENTOS_MOCK.filter((e) => {
    return (
      (!filtroEstado || e.estado === filtroEstado) &&
      (!filtroTipo || e.tipo === filtroTipo)
    );
  });

  const ESTADO_BADGE = {
    borrador: "badge-secondary",
    publicado: "badge-success",
    cerrado: "badge-warning",
    finalizado: "badge-info",
    cancelado: "badge-danger",
  };
  const TIPO_ICON = {
    misa: "bi-church",
    retiro: "bi-tree",
    curso: "bi-book",
    reunion: "bi-people",
    celebracion: "bi-star",
  };
</script>

<svelte:head><title>EcclesiaSys – Eventos</title></svelte:head>

<div class="pg-wrap">
  <div class="pg-header">
    <div>
      <h1 class="pg-titulo">Agenda Parroquial</h1>
      <p class="pg-subtitulo">{filtrados.length} eventos</p>
    </div>
    <button class="btn-primary" on:click={() => (modalCrear = true)}>
      <i class="bi bi-plus-circle me-2"></i>Nuevo evento
    </button>
  </div>

  <div class="filtros-bar mb-4">
    <select
      class="form-select filtro-select"
      style="width:auto"
      bind:value={filtroEstado}
    >
      <option value="">Todos los estados</option>
      {#each ["borrador", "publicado", "cerrado", "finalizado", "cancelado"] as e}
        <option value={e}>{e}</option>
      {/each}
    </select>
    <select
      class="form-select filtro-select"
      style="width:auto"
      bind:value={filtroTipo}
    >
      <option value="">Todos los tipos</option>
      {#each ["misa", "retiro", "curso", "reunion", "celebracion"] as t}
        <option value={t}>{t}</option>
      {/each}
    </select>
  </div>

  <div class="tabla-wrap">
    <table class="tabla">
      <thead>
        <tr>
          <th>Evento</th>
          <th>Tipo</th>
          <th>Fecha / Hora</th>
          <th>Lugar</th>
          <th>Cupo</th>
          <th>Estado</th>
          <th class="text-end">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {#each filtrados as ev (ev.id)}
          <tr class="tabla-fila">
            <td class="fw-semibold">{ev.titulo}</td>
            <td>
              <span class="tipo-tag">
                <i class="bi {TIPO_ICON[ev.tipo] ?? 'bi-calendar'} me-1"></i>
                {ev.tipo}
              </span>
            </td>
            <td class="text-muted small">{ev.fecha} · {ev.hora}</td>
            <td class="text-muted small">{ev.lugar}</td>
            <td>
              <div class="cupo-bar">
                <div
                  class="cupo-fill"
                  style="width:{Math.min(100, (ev.inscritos / ev.cupo) * 100)}%"
                ></div>
              </div>
              <span class="cupo-label">{ev.inscritos}/{ev.cupo}</span>
            </td>
            <td
              ><span class="badge-estado {ESTADO_BADGE[ev.estado]}"
                >{ev.estado}</span
              ></td
            >
            <td class="text-end">
              <div class="d-flex gap-1 justify-content-end">
                <a
                  href="/admin/eventos/{ev.id}"
                  class="btn-accion btn-accion-ver"
                  title="Ver"
                >
                  <i class="bi bi-eye"></i>
                </a>
                <button class="btn-accion btn-accion-ver" title="Editar">
                  <i class="bi bi-pencil"></i>
                </button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
