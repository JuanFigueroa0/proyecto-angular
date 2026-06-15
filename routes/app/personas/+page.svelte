<!-- src/routes/admin/personas/+page.svelte -->
<script>
  import "$lib/styles/admin/personas.css";
  import "$lib/styles/admin/admin.css";
  const PERSONAS_MOCK = [
    {
      id: 1,
      nombre: "Juan García Martínez",
      doc: "CC: 87654321",
      estado_civil: "casado",
      sacramentos: 3,
      tiene_usuario: true,
    },
    {
      id: 2,
      nombre: "Ana López Rodríguez",
      doc: "CC: 11223344",
      estado_civil: "casado",
      sacramentos: 2,
      tiene_usuario: true,
    },
    {
      id: 3,
      nombre: "Santiago García López",
      doc: "RC: 12345678",
      estado_civil: "soltero",
      sacramentos: 1,
      tiene_usuario: false,
    },
    {
      id: 4,
      nombre: "Carlos Pérez Soto",
      doc: "CC: 44332211",
      estado_civil: "soltero",
      sacramentos: 2,
      tiene_usuario: false,
    },
  ];

  let busqueda = "";
  let modalCrear = false;

  $: filtrados = PERSONAS_MOCK.filter(
    (p) =>
      !busqueda ||
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.doc.includes(busqueda),
  );
</script>

<svelte:head><title>EcclesiaSys – Personas</title></svelte:head>

<div class="pg-wrap">
  <div class="pg-header">
    <div>
      <h1 class="pg-titulo">Registro de Personas</h1>
      <p class="pg-subtitulo">{PERSONAS_MOCK.length} personas registradas</p>
    </div>
    <button class="btn-primary" on:click={() => (modalCrear = true)}>
      <i class="bi bi-person-plus me-2"></i>Nueva persona
    </button>
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
        placeholder="Buscar por nombre o documento..."
        bind:value={busqueda}
        style="border-color:#e2e8f0"
      />
    </div>
  </div>

  <div class="tabla-wrap">
    <table class="tabla">
      <thead>
        <tr>
          <th>Persona</th>
          <th>Documento</th>
          <th>Estado civil</th>
          <th>Sacramentos</th>
          <th>Usuario</th>
          <th class="text-end">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {#each filtrados as p (p.id)}
          <tr class="tabla-fila">
            <td>
              <div class="d-flex align-items-center gap-2">
                <div class="user-avatar user-avatar-sm">
                  {p.nombre.slice(0, 2).toUpperCase()}
                </div>
                <span class="fw-semibold">{p.nombre}</span>
              </div>
            </td>
            <td class="text-muted small">{p.doc}</td>
            <td class="text-muted small">{p.estado_civil}</td>
            <td>
              <span class="sac-count">{p.sacramentos}</span>
            </td>
            <td>
              {#if p.tiene_usuario}
                <span class="user-tag"
                  ><i class="bi bi-check-circle-fill me-1"></i>Sí</span
                >
              {:else}
                <span class="text-muted small">No</span>
              {/if}
            </td>
            <td class="text-end">
              <div class="d-flex gap-1 justify-content-end">
                <a
                  href="/admin/personas/{p.id}"
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
