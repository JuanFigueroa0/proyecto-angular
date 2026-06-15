<!-- src/routes/admin/usuarios/[id]/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import {
    getUsuario,
    listarRoles,
    asignarRol,
    removerRol,
    getPermisosDeUsuario,
    eliminarUsuario,
  } from "$lib/js/interfaces/usuarios.js";
  import { toast } from "$lib/js/stores/ui.js";
  import { formatFecha } from "$lib/js/utils/formatters.js";

  const id = $page.params.id;

  let usuario = null;
  let roles = [];
  let permisos = [];
  let cargando = true;

  let modalRol = false;
  let rolSeleccionado = "";
  let asignandoRol = false;

  let modalEliminar = false;
  let eliminando = false;

  onMount(async () => {
    await Promise.all([cargarUsuario(), cargarRoles()]);
  });

  async function cargarUsuario() {
    cargando = true;
    const [rU, rP] = await Promise.all([
      getUsuario(id),
      getPermisosDeUsuario(id),
    ]);
    cargando = false;
    if (rU.ok) usuario = rU.data;
    else {
      toast.error(rU.error);
      goto("/app/usuarios");
    }
    if (rP.ok) permisos = rP.data ?? [];
  }

  async function cargarRoles() {
    const r = await listarRoles();
    if (r.ok) roles = r.data ?? [];
  }

  async function onRemoverRol(rol_id) {
    const r = await removerRol(id, rol_id);
    if (r.ok) {
      toast.success("Rol removido");
      cargarUsuario();
    } else toast.error(r.error);
  }

  async function confirmarAsignarRol() {
    if (!rolSeleccionado) return;
    asignandoRol = true;
    const r = await asignarRol({
      usuario_id: parseInt(id),
      rol_id: parseInt(rolSeleccionado),
    });
    asignandoRol = false;
    modalRol = false;
    if (r.ok) {
      toast.success("Rol asignado");
      cargarUsuario();
    } else toast.error(r.error);
  }

  async function confirmarEliminar() {
    eliminando = true;
    const r = await eliminarUsuario(id);
    eliminando = false;
    if (r.ok) {
      toast.success("Usuario eliminado");
      goto("/app/usuarios");
    } else toast.error(r.error);
  }

  function badgeEstado(estado) {
    const m = {
      activo: "badge-activo",
      inactivo: "badge-inactivo",
      bloqueado: "badge-bloqueado",
      pendiente_validacion: "badge-pendiente",
    };
    return m[estado] ?? "badge-neutral";
  }

  function labelEstado(e) {
    const m = {
      activo: "Activo",
      inactivo: "Inactivo",
      bloqueado: "Bloqueado",
      pendiente_validacion: "Pendiente",
    };
    return m[e] ?? e;
  }

  function iniciales(correo = "") {
    return correo.slice(0, 2).toUpperCase();
  }
</script>

<svelte:head><title>EcclesiaSys – Usuario</title></svelte:head>

<div class="pg-wrap">
  <!-- Breadcrumb -->
  <div class="pg-breadcrumb">
    <a href="/app/usuarios" class="breadcrumb-link">
      <i class="bi bi-chevron-left me-1" aria-hidden="true"></i>Usuarios
    </a>
    <span class="breadcrumb-sep">/</span>
    <span class="breadcrumb-actual">Detalle</span>
  </div>

  {#if cargando}
    <div class="tabla-loading">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-3 small">Cargando usuario...</p>
    </div>
  {:else if usuario}
    <div class="row g-4">
      <!-- Columna izquierda: info del usuario -->
      <div class="col-lg-4">
        <div class="detalle-card">
          <div class="detalle-avatar-wrap">
            <div class="detalle-avatar">{iniciales(usuario.correo)}</div>
            <span class="estado-badge {badgeEstado(usuario.estado)} mt-2">
              {labelEstado(usuario.estado)}
            </span>
          </div>
          <div class="detalle-correo">{usuario.correo}</div>
          <div class="detalle-id">ID #{usuario.id}</div>

          <div class="detalle-meta">
            <div class="detalle-meta-item">
              <span class="detalle-meta-label">Correo validado</span>
              <span class="detalle-meta-valor">
                {#if usuario.correo_validado}
                  <i
                    class="bi bi-check-circle-fill text-success"
                    aria-hidden="true"
                  ></i> Sí
                {:else}
                  <i class="bi bi-x-circle-fill text-danger" aria-hidden="true"
                  ></i> No
                {/if}
              </span>
            </div>
            <div class="detalle-meta-item">
              <span class="detalle-meta-label">Perfil completo</span>
              <span class="detalle-meta-valor">
                {usuario.perfil_completo ? "Sí" : "No"}
              </span>
            </div>
            <div class="detalle-meta-item">
              <span class="detalle-meta-label">Registro</span>
              <span class="detalle-meta-valor"
                >{formatFecha(usuario.created_at)}</span
              >
            </div>
            <div class="detalle-meta-item">
              <span class="detalle-meta-label">Actualizado</span>
              <span class="detalle-meta-valor"
                >{formatFecha(usuario.updated_at)}</span
              >
            </div>
          </div>

          <button
            class="btn-danger-outline w-100 mt-3"
            on:click={() => (modalEliminar = true)}
          >
            <i class="bi bi-trash me-2" aria-hidden="true"></i>Eliminar usuario
          </button>
        </div>
      </div>

      <!-- Columna derecha: roles y permisos -->
      <div class="col-lg-8">
        <!-- Roles -->
        <div class="detalle-card mb-4">
          <div class="detalle-card-header">
            <h3 class="detalle-card-titulo">
              <i class="bi bi-person-badge me-2" aria-hidden="true"></i>Roles
              asignados
            </h3>
            <button class="btn-primary-sm" on:click={() => (modalRol = true)}>
              <i class="bi bi-plus" aria-hidden="true"></i> Asignar rol
            </button>
          </div>

          {#if (usuario.roles ?? []).length === 0}
            <div class="detalle-empty">
              <i
                class="bi bi-person-x mb-2 d-block text-muted"
                style="font-size:2rem"
                aria-hidden="true"
              ></i>
              <p class="text-muted small mb-0">Sin roles asignados</p>
            </div>
          {:else}
            <div class="roles-lista">
              {#each usuario.roles ?? [] as rol}
                <div class="rol-item">
                  <div class="rol-icono">
                    <i class="bi bi-shield" aria-hidden="true"></i>
                  </div>
                  <div class="rol-info">
                    <div class="rol-nombre">{rol.nombre ?? rol}</div>
                    {#if rol.descripcion}
                      <div class="rol-desc">{rol.descripcion}</div>
                    {/if}
                  </div>
                  <button
                    class="btn-accion btn-accion-eliminar"
                    title="Remover rol"
                    on:click={() => onRemoverRol(rol.id)}
                  >
                    <i class="bi bi-x" aria-hidden="true"></i>
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Permisos -->
        <div class="detalle-card">
          <div class="detalle-card-header">
            <h3 class="detalle-card-titulo">
              <i class="bi bi-key me-2" aria-hidden="true"></i>Permisos
              efectivos
            </h3>
          </div>
          {#if permisos.length === 0}
            <div class="detalle-empty">
              <p class="text-muted small mb-0">Sin permisos asignados</p>
            </div>
          {:else}
            <div class="permisos-grid">
              {#each permisos as p}
                <div class="permiso-tag">
                  <i class="bi bi-check2 me-1" aria-hidden="true"></i>
                  {p.codigo ?? p.nombre ?? p}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Modal asignar rol -->
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
    <div class="mb-4">
      <label class="form-label small fw-semibold" for="rol">Rol</label>
      <select class="form-select" id="rol" bind:value={rolSeleccionado}>
        <option value="">-- Selecciona --</option>
        {#each roles as r}
          <option value={r.id}>{r.nombre}</option>
        {/each}
      </select>
    </div>
    <div class="modal-acciones">
      <button class="btn-modal-cancelar" on:click={() => (modalRol = false)}
        >Cancelar</button
      >
      <button
        class="btn-modal-primary"
        on:click={confirmarAsignarRol}
        disabled={!rolSeleccionado || asignandoRol}
      >
        {#if asignandoRol}<span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>{/if}
        Asignar
      </button>
    </div>
  </div>
{/if}

<!-- Modal eliminar -->
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
      ¿Eliminar a <strong>{usuario?.correo}</strong>? Esta acción no se puede
      deshacer.
    </p>
    <div class="modal-acciones">
      <button
        class="btn-modal-cancelar"
        on:click={() => (modalEliminar = false)}>Cancelar</button
      >
      <button
        class="btn-modal-confirmar"
        on:click={confirmarEliminar}
        disabled={eliminando}
      >
        {#if eliminando}<span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>{/if}
        Eliminar
      </button>
    </div>
  </div>
{/if}
