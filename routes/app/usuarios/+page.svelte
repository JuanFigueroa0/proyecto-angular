<!-- src/routes/admin/usuarios/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import {
    listarUsuarios,
    eliminarUsuario,
    listarRoles,
    asignarRol,
  } from "$lib/js/interfaces/usuarios.js";
  import { register } from "$lib/js/interfaces/auth.js";
  import { passwordStrength } from "$lib/js/interfaces/auth.js";
  import { toast } from "$lib/js/stores/ui.js";
  import { formatFecha } from "$lib/js/utils/formatters.js";
  import PasswordInput from "$lib/components/auth/PasswordInput.svelte";
  import "$lib/styles/admin/admin.css";

  // ── Estado principal ────────────────────────────────────
  let usuarios = [];
  let roles = [];
  let total = 0;
  let pages = 1;
  let cargando = true;
  let pagina = 1;
  const LIMIT = 20;

  // Filtros
  let filtroBuscar = "";
  let filtroRol = "";
  let filtroEstado = "";
  let buscarTimer = null;

  // ── Modal: eliminar ─────────────────────────────────────
  let modalEliminar = false;
  let usuarioTarget = null;
  let eliminando = false;

  // ── Modal: asignar rol ──────────────────────────────────
  let modalRol = false;
  let rolSeleccionado = "";
  let asignandoRol = false;

  // ── Modal: crear usuario ────────────────────────────────
  let modalCrear = false;
  let formCrear = { correo: "", contrasena: "", confirmar: "" };
  let creando = false;
  let errorCrear = "";
  let exitoCrear = "";

  $: strengthCrear = passwordStrength(formCrear.contrasena);
  $: noCoinciden =
    formCrear.confirmar.length > 0 &&
    formCrear.contrasena !== formCrear.confirmar;

  // ── Carga inicial ───────────────────────────────────────
  onMount(async () => {
    await Promise.all([cargar(), cargarRoles()]);
  });

  async function cargar() {
    cargando = true;
    const r = await listarUsuarios({
      page: pagina,
      limit: LIMIT,
      rol_id: filtroRol,
      estado: filtroEstado,
      buscar: filtroBuscar,
    });
    cargando = false;
    if (r.ok) {
      usuarios = r.data?.items ?? [];
      total = r.data?.total ?? 0;
      pages = r.data?.pages ?? 1;
    } else {
      toast.error(r.error);
    }
  }

  async function cargarRoles() {
    const r = await listarRoles();
    if (r.ok) roles = r.data ?? [];
  }

  // ── Búsqueda con debounce ───────────────────────────────
  function onBuscar() {
    clearTimeout(buscarTimer);
    buscarTimer = setTimeout(() => {
      pagina = 1;
      cargar();
    }, 400);
  }

  function onFiltro() {
    pagina = 1;
    cargar();
  }

  function limpiarFiltros() {
    filtroBuscar = "";
    filtroRol = "";
    filtroEstado = "";
    pagina = 1;
    cargar();
  }

  // ── Paginación ──────────────────────────────────────────
  function irPagina(p) {
    if (p < 1 || p > pages) return;
    pagina = p;
    cargar();
  }

  // ── Eliminar ────────────────────────────────────────────
  function abrirEliminar(u) {
    usuarioTarget = u;
    modalEliminar = true;
  }

  async function confirmarEliminar() {
    eliminando = true;
    const r = await eliminarUsuario(usuarioTarget.id);
    eliminando = false;
    modalEliminar = false;
    if (r.ok) {
      toast.success("Usuario eliminado");
      cargar();
    } else toast.error(r.error);
  }

  // ── Asignar rol ─────────────────────────────────────────
  function abrirAsignarRol(u) {
    usuarioTarget = u;
    rolSeleccionado = "";
    modalRol = true;
  }

  async function confirmarAsignarRol() {
    if (!rolSeleccionado) return;
    asignandoRol = true;
    const r = await asignarRol({
      usuario_id: usuarioTarget.id,
      rol_id: parseInt(rolSeleccionado),
    });
    asignandoRol = false;
    modalRol = false;
    if (r.ok) {
      toast.success("Rol asignado");
      cargar();
    } else toast.error(r.error);
  }

  // ── Crear usuario ───────────────────────────────────────
  function abrirCrear() {
    formCrear = { correo: "", contrasena: "", confirmar: "" };
    errorCrear = "";
    exitoCrear = "";
    modalCrear = true;
  }

  async function confirmarCrear() {
    errorCrear = "";
    if (!formCrear.correo) {
      errorCrear = "El correo es obligatorio.";
      return;
    }
    if (!strengthCrear.esValida) {
      errorCrear = "La contraseña no cumple los requisitos de seguridad.";
      return;
    }
    if (formCrear.contrasena !== formCrear.confirmar) {
      errorCrear = "Las contraseñas no coinciden.";
      return;
    }
    creando = true;
    const r = await register({
      correo: formCrear.correo,
      contrasena: formCrear.contrasena,
    });
    creando = false;
    if (r.ok) {
      exitoCrear = `Usuario ${formCrear.correo} creado. Se envió correo de verificación.`;
      formCrear = { correo: "", contrasena: "", confirmar: "" };
      cargar();
    } else {
      errorCrear = r.error;
    }
  }

  // ── Helpers ─────────────────────────────────────────────
  function badgeEstado(estado) {
    const m = {
      activo: "badge-activo",
      inactivo: "badge-inactivo",
      bloqueado: "badge-bloqueado",
      pendiente_validacion: "badge-pendiente",
    };
    return m[estado] ?? "badge-neutral";
  }
  function labelEstado(estado) {
    const m = {
      activo: "Activo",
      inactivo: "Inactivo",
      bloqueado: "Bloqueado",
      pendiente_validacion: "Pendiente",
    };
    return m[estado] ?? estado;
  }
  function iniciales(correo = "") {
    return correo.slice(0, 2).toUpperCase();
  }

  // Páginas visibles en paginador
  $: paginasVisibles = (() => {
    const arr = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - pagina) <= 1) arr.push(i);
      else if (Math.abs(i - pagina) === 2) arr.push("...");
    }
    // Deduplicar '...'
    return arr.filter((v, i, a) => v !== "..." || a[i - 1] !== "...");
  })();
</script>

<svelte:head><title>EcclesiaSys – Usuarios</title></svelte:head>

<div class="pg-wrap">
  <!-- ── Encabezado ── -->
  <div class="pg-header">
    <div>
      <h1 class="pg-titulo">Gestión de Usuarios</h1>
      <p class="pg-subtitulo">
        {cargando
          ? "Cargando..."
          : `${total} usuario${total !== 1 ? "s" : ""} registrados`}
      </p>
    </div>
    <button class="btn-primary" on:click={abrirCrear}>
      <i class="bi bi-person-plus me-2" aria-hidden="true"></i>Nuevo usuario
    </button>
  </div>

  <!-- ── Filtros ── -->
  <div class="pg-filtros">
    <div class="filtro-buscar">
      <i class="bi bi-search filtro-buscar-icon" aria-hidden="true"></i>
      <input
        type="text"
        class="form-control filtro-input"
        placeholder="Buscar por correo..."
        bind:value={filtroBuscar}
        on:input={onBuscar}
      />
    </div>
    <select
      class="form-select filtro-select"
      bind:value={filtroRol}
      on:change={onFiltro}
    >
      <option value="">Todos los roles</option>
      {#each roles as r}
        <option value={r.id}>{r.nombre}</option>
      {/each}
    </select>
    <select
      class="form-select filtro-select"
      bind:value={filtroEstado}
      on:change={onFiltro}
    >
      <option value="">Todos los estados</option>
      <option value="activo">Activo</option>
      <option value="inactivo">Inactivo</option>
      <option value="bloqueado">Bloqueado</option>
      <option value="pendiente_validacion">Pendiente</option>
    </select>
    {#if filtroBuscar || filtroRol || filtroEstado}
      <button class="btn-limpiar" on:click={limpiarFiltros}>
        <i class="bi bi-x-circle me-1" aria-hidden="true"></i>Limpiar
      </button>
    {/if}
  </div>

  <!-- ── Tabla ── -->
  <div class="tabla-wrap">
    {#if cargando}
      <div class="tabla-loading">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-3 small">Cargando usuarios...</p>
      </div>
    {:else if usuarios.length === 0}
      <div class="tabla-empty">
        <i class="bi bi-people display-5 text-muted mb-3" aria-hidden="true"
        ></i>
        <p class="text-muted mb-0">No se encontraron usuarios</p>
        {#if filtroBuscar || filtroRol || filtroEstado}
          <button
            class="btn-sm btn-outline-secondary mt-3"
            on:click={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        {/if}
      </div>
    {:else}
      <table class="tabla">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Estado</th>
            <th>Roles</th>
            <th>Perfil</th>
            <th>Registro</th>
            <th class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each usuarios as u (u.id)}
            <tr class="tabla-fila">
              <td>
                <div class="user-cell">
                  <div class="user-avatar">{iniciales(u.correo)}</div>
                  <div>
                    <div class="user-correo">{u.correo}</div>
                    <div class="user-id">ID #{u.id}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="estado-badge {badgeEstado(u.estado)}">
                  {labelEstado(u.estado)}
                </span>
              </td>
              <td>
                <div class="roles-cell">
                  {#if (u.roles ?? []).length === 0}
                    <span class="text-muted small">Sin rol</span>
                  {:else}
                    {#each u.roles as rol}
                      <span class="rol-tag">{rol.nombre}</span>
                    {/each}
                  {/if}
                </div>
              </td>
              <td>
                {#if u.perfil_completo}
                  <span class="perfil-ok">
                    <i class="bi bi-check-circle-fill me-1" aria-hidden="true"
                    ></i>Completo
                  </span>
                {:else}
                  <span class="perfil-pendiente">
                    <i class="bi bi-exclamation-circle me-1" aria-hidden="true"
                    ></i>Incompleto
                  </span>
                {/if}
              </td>
              <td class="text-muted small">{formatFecha(u.created_at)}</td>
              <td>
                <div class="acciones-cell">
                  <button
                    class="btn-accion btn-accion-ver"
                    title="Ver detalle"
                    on:click={() => goto(`/app/usuarios/${u.id}`)}
                  >
                    <i class="bi bi-eye" aria-hidden="true"></i>
                  </button>
                  <button
                    class="btn-accion btn-accion-rol"
                    title="Asignar rol"
                    on:click={() => abrirAsignarRol(u)}
                  >
                    <i class="bi bi-person-badge" aria-hidden="true"></i>
                  </button>
                  <button
                    class="btn-accion btn-accion-eliminar"
                    title="Eliminar usuario"
                    on:click={() => abrirEliminar(u)}
                  >
                    <i class="bi bi-trash" aria-hidden="true"></i>
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      <!-- Paginación -->
      {#if pages > 1}
        <div class="paginacion">
          <button
            class="pag-btn"
            disabled={pagina === 1}
            on:click={() => irPagina(pagina - 1)}
            aria-label="Página anterior"
          >
            <i class="bi bi-chevron-left" aria-hidden="true"></i>
          </button>
          {#each paginasVisibles as p}
            {#if p === "..."}
              <span class="pag-dots">…</span>
            {:else}
              <button
                class="pag-btn {pagina === p ? 'pag-activa' : ''}"
                on:click={() => irPagina(p)}>{p}</button
              >
            {/if}
          {/each}
          <button
            class="pag-btn"
            disabled={pagina === pages}
            on:click={() => irPagina(pagina + 1)}
            aria-label="Página siguiente"
          >
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<!-- ── Modal: Crear usuario ── -->
{#if modalCrear}
  <div
    class="modal-overlay"
    on:click={() => {
      if (!creando) modalCrear = false;
    }}
    aria-hidden="true"
  ></div>
  <div class="modal-box modal-box-md" role="dialog" aria-modal="true">
    <div class="modal-header">
      <div class="modal-icon-primary">
        <i class="bi bi-person-plus" aria-hidden="true"></i>
      </div>
      <h3 class="modal-titulo">Nuevo usuario</h3>
    </div>

    {#if exitoCrear}
      <div
        class="alert mb-4"
        style="background:#f0fff4;border:1.5px solid #9ae6b4;border-radius:8px;color:#276749;font-size:.875rem;padding:.85rem 1rem"
      >
        <i class="bi bi-check-circle-fill me-2" aria-hidden="true"
        ></i>{exitoCrear}
      </div>
      <div class="modal-acciones">
        <button
          class="btn-modal-primary"
          on:click={() => {
            modalCrear = false;
            exitoCrear = "";
          }}
        >
          Cerrar
        </button>
      </div>
    {:else}
      {#if errorCrear}
        <div
          class="alert mb-3"
          style="background:#fff5f5;border:1.5px solid #fed7d7;border-radius:8px;color:#c53030;font-size:.875rem;padding:.75rem 1rem"
        >
          <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"
          ></i>{errorCrear}
        </div>
      {/if}

      <div class="mb-3">
        <label class="form-label small fw-semibold" for="correo">
          Correo electrónico <span class="text-danger">*</span>
        </label>
        <div class="input-group">
          <span
            class="input-group-text"
            style="background:#f8fafc;border-color:#e2e8f0"
          >
            <i class="bi bi-envelope" aria-hidden="true"></i>
          </span>
          <input
            type="email"
            class="form-control"
            style="border-color:#e2e8f0"
            placeholder="correo@ejemplo.com"
            bind:value={formCrear.correo}
            disabled={creando}
          />
        </div>
        <div class="form-text small text-muted mt-1">
          Se enviará un correo de verificación automáticamente.
        </div>
      </div>

      <PasswordInput
        id="crear_contrasena"
        label="Contraseña"
        bind:value={formCrear.contrasena}
        disabled={creando}
        autocomplete="new-password"
        placeholder="Mínimo 6 caracteres"
      />

      <!-- Barra fortaleza -->
      {#if formCrear.contrasena.length > 0}
        <div class="mb-3">
          <div
            class="progress"
            style="height:4px"
            role="progressbar"
            aria-valuenow={strengthCrear.score * 25}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              class="progress-bar {strengthCrear.bg}"
              style="width:{strengthCrear.score * 25}%"
            ></div>
          </div>
          {#if strengthCrear.label}
            <small class="{strengthCrear.color} mt-1 d-block">
              Contraseña {strengthCrear.label}
            </small>
          {/if}
        </div>
      {/if}

      <!-- Requisitos -->
      <div class="pass-requisitos mb-3">
        {#each [{ test: formCrear.contrasena.length >= 6, label: "6+ caracteres" }, { test: /[A-Z]/.test(formCrear.contrasena), label: "Mayúscula" }, { test: /[a-z]/.test(formCrear.contrasena), label: "Minúscula" }, { test: /\d/.test(formCrear.contrasena), label: "Número" }, { test: /[@$!%*?&_\-.]/.test(formCrear.contrasena), label: "Especial" }] as req}
          <span class="req-item {req.test ? 'req-ok' : ''}">
            <i
              class="bi {req.test ? 'bi-check-circle-fill' : 'bi-circle'}"
              aria-hidden="true"
            ></i>
            {req.label}
          </span>
        {/each}
      </div>

      <PasswordInput
        id="crear_confirmar"
        label="Confirmar contraseña"
        bind:value={formCrear.confirmar}
        disabled={creando}
        autocomplete="new-password"
        placeholder="Repite la contraseña"
        invalid={noCoinciden}
        errorMsg="Las contraseñas no coinciden."
      />

      <div class="modal-acciones mt-4">
        <button
          class="btn-modal-cancelar"
          on:click={() => (modalCrear = false)}
          disabled={creando}
        >
          Cancelar
        </button>
        <button
          class="btn-modal-primary"
          on:click={confirmarCrear}
          disabled={creando || !strengthCrear.esValida || noCoinciden}
        >
          {#if creando}
            <span
              class="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>Creando...
          {:else}
            <i class="bi bi-person-plus me-2" aria-hidden="true"></i>Crear
            usuario
          {/if}
        </button>
      </div>
    {/if}
  </div>
{/if}

<!-- ── Modal: Eliminar ── -->
{#if modalEliminar}
  <div
    class="modal-overlay"
    on:click={() => (modalEliminar = false)}
    aria-hidden="true"
  ></div>
  <div class="modal-box" role="dialog" aria-modal="true">
    <div class="modal-header">
      <div class="modal-icon-danger">
        <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
      </div>
      <h3 class="modal-titulo">Eliminar usuario</h3>
    </div>
    <p class="modal-desc">
      ¿Eliminar a <strong>{usuarioTarget?.correo}</strong>? Esta acción no se
      puede deshacer.
    </p>
    <div class="modal-acciones">
      <button
        class="btn-modal-cancelar"
        on:click={() => (modalEliminar = false)}
      >
        Cancelar
      </button>
      <button
        class="btn-modal-confirmar"
        on:click={confirmarEliminar}
        disabled={eliminando}
      >
        {#if eliminando}
          <span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
        {/if}
        Eliminar
      </button>
    </div>
  </div>
{/if}

<!-- ── Modal: Asignar rol ── -->
{#if modalRol}
  <div
    class="modal-overlay"
    on:click={() => (modalRol = false)}
    aria-hidden="true"
  ></div>
  <div class="modal-box" role="dialog" aria-modal="true">
    <div class="modal-header">
      <div class="modal-icon-primary">
        <i class="bi bi-person-badge" aria-hidden="true"></i>
      </div>
      <h3 class="modal-titulo">Asignar rol</h3>
    </div>
    <p class="modal-desc">
      Asigna un rol a <strong>{usuarioTarget?.correo}</strong>
    </p>
    <div class="mb-4">
      <label class="form-label small fw-semibold" for="rol"
        >Seleccionar rol</label
      >
      <select class="form-select" id="rol" bind:value={rolSeleccionado}>
        <option value="">-- Selecciona un rol --</option>
        {#each roles as r}
          <option value={r.id}>{r.nombre}</option>
        {/each}
      </select>
    </div>
    <div class="modal-acciones">
      <button class="btn-modal-cancelar" on:click={() => (modalRol = false)}>
        Cancelar
      </button>
      <button
        class="btn-modal-primary"
        on:click={confirmarAsignarRol}
        disabled={!rolSeleccionado || asignandoRol}
      >
        {#if asignandoRol}
          <span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
        {/if}
        Asignar
      </button>
    </div>
  </div>
{/if}
