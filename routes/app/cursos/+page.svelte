<!-- src/routes/admin/cursos/+page.svelte -->
<script>
  import "$lib/styles/admin/cursos.css";
  import "$lib/styles/admin/admin.css";
  const CURSOS_MOCK = [
    {
      id: 1,
      nombre: "Catequesis Bautismo",
      sacramento: "Bautismo",
      estado: "completado",
      inicio: "2026-02-01",
      fin: "2026-03-15",
      participantes: 8,
    },
    {
      id: 2,
      nombre: "Catequesis Primera Comunión",
      sacramento: "Primera Comunión",
      estado: "en_curso",
      inicio: "2026-03-01",
      fin: null,
      participantes: 15,
    },
    {
      id: 3,
      nombre: "Curso Prematrimonial",
      sacramento: "Matrimonio",
      estado: "en_curso",
      inicio: "2026-03-10",
      fin: null,
      participantes: 6,
    },
    {
      id: 4,
      nombre: "Catequesis Confirmación",
      sacramento: "Confirmación",
      estado: "abandonado",
      inicio: "2026-01-15",
      fin: "2026-02-20",
      participantes: 4,
    },
  ];

  const BADGE = {
    en_curso: "badge-info",
    completado: "badge-success",
    abandonado: "badge-secondary",
  };
  let modalCrear = false;
</script>

<svelte:head><title>EcclesiaSys – Cursos</title></svelte:head>

<div class="pg-wrap">
  <div class="pg-header">
    <div>
      <h1 class="pg-titulo">Cursos Sacramentales</h1>
      <p class="pg-subtitulo">Catequesis, prematrimonial y confirmación</p>
    </div>
    <button class="btn-primary" on:click={() => (modalCrear = true)}>
      <i class="bi bi-plus-circle me-2"></i>Nuevo curso
    </button>
  </div>

  <div class="tabla-wrap">
    <table class="tabla">
      <thead>
        <tr>
          <th>Curso</th>
          <th>Sacramento</th>
          <th>Período</th>
          <th>Participantes</th>
          <th>Estado</th>
          <th class="text-end">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {#each CURSOS_MOCK as c (c.id)}
          <tr class="tabla-fila">
            <td class="fw-semibold">{c.nombre}</td>
            <td class="text-muted small">{c.sacramento}</td>
            <td class="text-muted small">
              {c.inicio}
              {c.fin ? ` → ${c.fin}` : " → En curso"}
            </td>
            <td>
              <span class="part-badge">{c.participantes}</span>
            </td>
            <td
              ><span class="badge-estado {BADGE[c.estado]}"
                >{c.estado.replace("_", " ")}</span
              ></td
            >
            <td class="text-end">
              <div class="d-flex gap-1 justify-content-end">
                <a
                  href="/admin/cursos/{c.id}"
                  class="btn-accion btn-accion-ver"
                  title="Ver"
                >
                  <i class="bi bi-eye"></i>
                </a>
                <button
                  class="btn-accion"
                  title="Agregar participante"
                  style="color:var(--primary)"
                >
                  <i class="bi bi-person-plus"></i>
                </button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
