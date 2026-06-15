<!-- src/routes/admin/personas/[id]/+page.svelte -->
<script>
  import { page } from "$app/stores";
  const id = $page.params.id;

  const persona = {
    id,
    nombre: "Juan García Martínez",
    doc: "CC: 87654321",
    fecha_nacimiento: "1985-06-15",
    lugar_nacimiento: "Barranquilla",
    estado_civil: "casado",
    sexo: "masculino",
    tiene_usuario: true,
    foto_url: null,
    sacramentos: [
      { nombre: "Bautismo", fecha: "1985-07-20", lugar: "Parroquia San José" },
      {
        nombre: "Confirmación",
        fecha: "2000-05-15",
        lugar: "Parroquia San José",
      },
      { nombre: "Matrimonio", fecha: "2010-03-10", lugar: "Catedral" },
    ],
    documentos: [
      { tipo: "Documento identidad", vigente: true, validado: true },
      { tipo: "Certificado bautismo", vigente: true, validado: false },
    ],
  };

  let tabActivo = "info";
</script>

<svelte:head><title>EcclesiaSys – {persona.nombre}</title></svelte:head>

<div class="pg-wrap" style="max-width:860px;margin:0 auto">
  <div class="mb-4">
    <a href="/admin/personas" class="auth-link small">
      <i class="bi bi-arrow-left me-1"></i>Personas
    </a>
  </div>

  <!-- Header -->
  <div class="persona-header mb-4">
    <div class="persona-avatar-lg">
      {#if persona.foto_url}
        <img src={persona.foto_url} alt="" />
      {:else}
        {persona.nombre.slice(0, 2).toUpperCase()}
      {/if}
    </div>
    <div>
      <h1 class="pg-titulo mb-1">{persona.nombre}</h1>
      <div class="text-muted small">{persona.doc}</div>
      <div class="d-flex gap-2 mt-2 flex-wrap">
        {#if persona.tiene_usuario}
          <span class="tag-verde"
            ><i class="bi bi-person-check me-1"></i>Tiene cuenta</span
          >
        {/if}
        <span class="tag-gris">{persona.estado_civil}</span>
        <span class="tag-gris">{persona.sexo}</span>
      </div>
    </div>
    <div class="ms-auto">
      <button class="btn-primary">
        <i class="bi bi-pencil me-1"></i>Editar
      </button>
    </div>
  </div>

  <!-- Tabs -->
  <div class="perfil-tabs mb-4">
    {#each [["info", "Información", "bi-person"], ["sacramentos", "Sacramentos", "bi-water"], ["documentos", "Documentos", "bi-files"]] as [t, l, i]}
      <button
        class="perfil-tab {tabActivo === t ? 'active' : ''}"
        on:click={() => (tabActivo = t)}
      >
        <i class="bi {i} me-2"></i>{l}
      </button>
    {/each}
  </div>

  {#if tabActivo === "info"}
    <div class="perfil-card">
      <div class="row g-3">
        {#each [["Fecha de nacimiento", persona.fecha_nacimiento], ["Lugar de nacimiento", persona.lugar_nacimiento], ["Estado civil", persona.estado_civil], ["Sexo", persona.sexo]] as [lbl, val]}
          <div class="col-md-6">
            <div class="dato-label">{lbl}</div>
            <div class="dato-val">{val ?? "—"}</div>
          </div>
        {/each}
      </div>
    </div>
  {:else if tabActivo === "sacramentos"}
    <div class="perfil-card">
      {#each persona.sacramentos as s}
        <div class="sac-hist-item">
          <div class="sac-hist-icon"><i class="bi bi-water"></i></div>
          <div>
            <div class="fw-semibold">{s.nombre}</div>
            <div class="text-muted small">{s.fecha} · {s.lugar}</div>
          </div>
          <span class="sac-hist-badge">Registrado</span>
        </div>
      {/each}
    </div>
  {:else}
    <div class="perfil-card">
      {#each persona.documentos as doc}
        <div class="doc-row">
          <div class="doc-icon-sm"><i class="bi bi-file-earmark-text"></i></div>
          <div class="flex-1">
            <div class="fw-semibold small">{doc.tipo}</div>
          </div>
          <span
            class="badge-min {doc.validado ? 'badge-success' : 'badge-warning'}"
          >
            {doc.validado ? "Validado" : "Sin validar"}
          </span>
          <span
            class="badge-min {doc.vigente
              ? 'badge-success'
              : 'badge-secondary'}"
          >
            {doc.vigente ? "Vigente" : "Inactivo"}
          </span>
        </div>
      {/each}
    </div>
  {/if}
</div>
