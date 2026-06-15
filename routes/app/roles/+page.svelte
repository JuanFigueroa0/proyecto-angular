<!-- src/routes/admin/roles/+page.svelte -->
<script>
  import ConfirmDialog from "$lib/components/ui/ConfirmDialog.svelte";
  import { onMount } from "svelte";
  import { togglePermisoActivo } from "$lib/js/interfaces/usuarios.js";
  import "$lib/styles/admin/admin.css";
  import {
    listarRoles,
    crearRol,
    actualizarRol,
    eliminarRol,
    listarPermisos,
    crearPermiso,
    getPermisosDeRol,
    asignarPermisos,
    removerPermiso,
    listarModulos,
    crearModulo,
    actualizarModulo,
    eliminarModulo,
    toggleModulo,
    getPermisosDeUsuario,
    listarUsuarios,
    getPermisosDirectosUsuario,
    asignarPermisosDirectosUsuario,
    removerPermisoDirectoUsuario,
  } from "$lib/js/interfaces/usuarios.js";
  import { toast, removeToast } from "$lib/js/stores/ui.js";
  // ── Estado general ──────────────────────────────────────
  let roles = [];
  let permisos = [];
  let modulos = [];
  let cargando = true;

  let procesando = {};
  // Tabs principales
  let tabActivo = "roles"; // 'roles' | 'modulos'
  let tabSecundario = "rol"; // 'rol'   | 'usuario'
  let tabPermisoUser = "directos"; // 'directos' | 'heredados'

  // ── Roles ───────────────────────────────────────────────
  let rolActivo = null;
  let permisosDelRol = []; // ids
  let cargandoPermisos = false;
  let filtroModuloRol = "";

  // Modal rol
  let modalRol = false;
  let modoEditar = false;
  let formRol = { nombre: "", descripcion: "" };
  let guardandoRol = false;
  let errorRol = "";
  let rolTarget = null;

  // Modal eliminar rol
  let modalEliminarRol = false;
  let eliminandoRol = false;

  // ── Módulos ─────────────────────────────────────────────
  let modalModulo = false;
  let modoEditarMod = false;
  let formModulo = { nombre: "", descripcion: "", codigo: "" };
  let guardandoMod = false;
  let errorMod = "";
  let moduloTarget = null;
  let modalEliminarMod = false;
  let eliminandoMod = false;
  let toggling = {};

  // ── Permisos (crear) ────────────────────────────────────
  let modalPermiso = false;
  let formPermiso = { nombre: "", codigo: "", descripcion: "", modulo_id: "" };
  let guardandoPerm = false;
  let errorPerm = "";

  // ── Permisos por usuario ────────────────────────────────
  let usuarioSeleccionado = null; // objeto usuario o null
  let inputBusqueda = "";
  let usuariosBusqueda = [];
  let buscandoUsuarios = false;
  let buscarUsuarioTimer = null;

  let permisosDirectos = []; // ids de permisos directos
  let permisosHeredados = []; // objetos de permisos por rol
  let cargandoPermUser = false;
  let filtroModuloUser = "";

  // Confirm dialog
  let confirmAbierto = false;
  let confirmConfig = {};
  let confirmCallback = null;

  let moduloExpandido = null;

  async function onTogglePermisoModulo(permiso) {
    toggling = { ...toggling, [`p_${permiso.id}`]: true };
    const loadId = toast.loading(
      permiso.activo ? "Desactivando permiso..." : "Activando permiso...",
    );
    const r = await togglePermisoActivo(permiso.id, !permiso.activo);
    toggling = { ...toggling, [`p_${permiso.id}`]: false };
    removeToast(loadId);
    if (r.ok) {
      toast.success(
        permiso.activo ? "Permiso desactivado" : "Permiso activado",
      );
      await cargarPermisos();
    } else {
      toast.error(r.error);
    }
  }
  function confirmar({
    titulo,
    mensaje,
    detalle = "",
    tipo = "danger",
    txtOk = "Confirmar",
    cb,
  }) {
    confirmConfig = { titulo, mensaje, detalle, tipo, txtOk };
    confirmCallback = cb;
    confirmAbierto = true;
  }

  async function onConfirmarDialog() {
    if (confirmCallback) await confirmCallback();
    confirmAbierto = false;
  }

  // ── Carga inicial ───────────────────────────────────────
  onMount(async () => {
    await Promise.all([cargarRoles(), cargarPermisos(), cargarModulos()]);
    cargando = false;
  });

  async function cargarRoles() {
    const r = await listarRoles();
    if (r.ok) roles = r.data ?? [];
    else toast.error(r.error);
  }

  async function cargarPermisos() {
    const r = await listarPermisos({ soloActivos: false });
    if (r.ok) permisos = r.data ?? [];
    else toast.error(r.error);
  }

  async function cargarModulos() {
    const r = await listarModulos({ soloActivos: false });
    if (r.ok) modulos = r.data ?? [];
    else toast.error(r.error);
  }

  // ── Seleccionar rol ─────────────────────────────────────
  async function seleccionarRol(rol) {
    rolActivo = rol;
    tabSecundario = "rol";
    cargandoPermisos = true;
    const r = await getPermisosDeRol(rol.id);
    cargandoPermisos = false;
    if (r.ok) permisosDelRol = (r.data ?? []).map((p) => p.id);
    else toast.error(r.error);
  }

  // ── Toggle permiso en rol ───────────────────────────────
  async function togglePermiso(permiso_id) {
    if (!rolActivo || procesando[permiso_id]) return;

    const estaAsignado = permisosDelRol.includes(permiso_id);
    const permiso = permisos.find((p) => p.id === permiso_id);

    if (estaAsignado) {
      // Confirmar antes de quitar
      confirmar({
        titulo: "Quitar permiso del rol",
        mensaje: `¿Quitar "${permiso?.nombre}" del rol "${rolActivo.nombre}"?`,
        detalle:
          "Los usuarios con este rol perderán este permiso inmediatamente.",
        tipo: "warning",
        txtOk: "Quitar permiso",
        cb: async () => {
          procesando = { ...procesando, [permiso_id]: true };
          const loadId = toast.loading("Quitando permiso...");
          const r = await removerPermiso(rolActivo.id, permiso_id);
          procesando = { ...procesando, [permiso_id]: false };
          removeToast(loadId);
          if (r.ok) {
            permisosDelRol = permisosDelRol.filter((p) => p !== permiso_id);
            toast.success("Permiso removido del rol", rolActivo.nombre);
          } else {
            toast.error(r.error, "Error al quitar permiso");
          }
        },
      });
    } else {
      // Asignar directo sin confirmación, pero con spinner
      procesando = { ...procesando, [permiso_id]: true };
      const loadId = toast.loading("Asignando permiso...");
      const r = await asignarPermisos(rolActivo.id, [permiso_id]);
      procesando = { ...procesando, [permiso_id]: false };
      removeToast(loadId);
      if (r.ok) {
        permisosDelRol = [...permisosDelRol, permiso_id];
        toast.success("Permiso asignado", rolActivo.nombre);
      } else {
        toast.error(r.error, "Error al asignar permiso");
      }
    }
  }

  // ── CRUD Roles ──────────────────────────────────────────
  function abrirCrearRol() {
    modoEditar = false;
    formRol = { nombre: "", descripcion: "" };
    errorRol = "";
    modalRol = true;
  }

  function abrirEditarRol(rol) {
    modoEditar = true;
    rolTarget = rol;
    formRol = { nombre: rol.nombre, descripcion: rol.descripcion ?? "" };
    errorRol = "";
    modalRol = true;
  }

  async function guardarRol() {
    if (!formRol.nombre.trim()) {
      errorRol = "El nombre es obligatorio.";
      return;
    }
    guardandoRol = true;
    errorRol = "";
    const r = modoEditar
      ? await actualizarRol(rolTarget.id, formRol)
      : await crearRol(formRol);
    guardandoRol = false;
    if (r.ok) {
      modalRol = false;
      toast.success(modoEditar ? "Rol actualizado" : "Rol creado");
      cargarRoles();
    } else errorRol = r.error;
  }

  async function confirmarEliminarRol() {
    eliminandoRol = true;
    const r = await eliminarRol(rolTarget.id);
    eliminandoRol = false;
    modalEliminarRol = false;
    if (r.ok) {
      toast.success("Rol eliminado");
      if (rolActivo?.id === rolTarget.id) rolActivo = null;
      cargarRoles();
    } else toast.error(r.error);
  }

  // ── CRUD Módulos ────────────────────────────────────────
  function abrirCrearModulo() {
    modoEditarMod = false;
    formModulo = { nombre: "", descripcion: "", codigo: "" };
    errorMod = "";
    modalModulo = true;
  }

  function abrirEditarModulo(mod) {
    modoEditarMod = true;
    moduloTarget = mod;
    formModulo = {
      nombre: mod.nombre,
      descripcion: mod.descripcion ?? "",
      codigo: mod.codigo ?? "",
    };
    errorMod = "";
    modalModulo = true;
  }

  async function guardarModulo() {
    if (!formModulo.nombre.trim()) {
      errorMod = "El nombre es obligatorio.";
      return;
    }
    if (!formModulo.codigo.trim()) {
      errorMod = "El código es obligatorio.";
      return;
    }
    guardandoMod = true;
    errorMod = "";
    const r = modoEditarMod
      ? await actualizarModulo(moduloTarget.id, formModulo)
      : await crearModulo(formModulo);
    guardandoMod = false;
    if (r.ok) {
      modalModulo = false;
      toast.success(modoEditarMod ? "Módulo actualizado" : "Módulo creado");
      cargarModulos();
    } else errorMod = r.error;
  }

  async function confirmarEliminarModulo() {
    eliminandoMod = true;
    const r = await eliminarModulo(moduloTarget.id);
    eliminandoMod = false;
    modalEliminarMod = false;
    if (r.ok) {
      toast.success("Módulo eliminado");
      cargarModulos();
    } else toast.error(r.error);
  }

  async function onToggleModulo(mod) {
    toggling = { ...toggling, [mod.id]: true };
    const r = await toggleModulo(mod.id, !mod.activo);
    toggling = { ...toggling, [mod.id]: false };
    if (r.ok) {
      toast.success(mod.activo ? "Módulo desactivado" : "Módulo activado");
      cargarModulos();
    } else toast.error(r.error);
  }

  // ── Crear permiso ───────────────────────────────────────
  async function guardarPermiso() {
    if (!formPermiso.nombre.trim()) {
      errorPerm = "El nombre es obligatorio.";
      return;
    }
    if (!formPermiso.codigo.trim()) {
      errorPerm = "El código es obligatorio.";
      return;
    }
    if (!formPermiso.modulo_id) {
      errorPerm = "Selecciona un módulo.";
      return;
    }
    guardandoPerm = true;
    errorPerm = "";
    const r = await crearPermiso({
      nombre: formPermiso.nombre,
      codigo: formPermiso.codigo,
      descripcion: formPermiso.descripcion,
      modulo_id: parseInt(formPermiso.modulo_id),
    });
    guardandoPerm = false;
    if (r.ok) {
      modalPermiso = false;
      toast.success("Permiso creado");
      cargarPermisos();
    } else errorPerm = r.error;
  }

  // ── Buscar usuario ──────────────────────────────────────
  function onBuscarUsuario() {
    clearTimeout(buscarUsuarioTimer);
    usuariosBusqueda = [];
    if (!inputBusqueda || inputBusqueda.length < 2) return;
    buscarUsuarioTimer = setTimeout(async () => {
      buscandoUsuarios = true;
      const r = await listarUsuarios({ buscar: inputBusqueda, limit: 8 });
      buscandoUsuarios = false;
      if (r.ok) usuariosBusqueda = r.data?.items ?? [];
    }, 350);
  }

  async function seleccionarUsuario(u) {
    usuarioSeleccionado = u;
    inputBusqueda = u.correo;
    usuariosBusqueda = [];
    tabPermisoUser = "directos";
    await cargarPermisosUsuario(u.id);
  }

  function limpiarUsuario() {
    usuarioSeleccionado = null;
    inputBusqueda = "";
    permisosDirectos = [];
    permisosHeredados = [];
  }

  async function cargarPermisosUsuario(id) {
    cargandoPermUser = true;
    const [rDir, rHer] = await Promise.all([
      getPermisosDirectosUsuario(id),
      getPermisosDeUsuario(id),
    ]);
    cargandoPermUser = false;
    if (rDir.ok) permisosDirectos = (rDir.data ?? []).map((p) => p.id);
    if (rHer.ok) permisosHeredados = rHer.data ?? [];
  }

  // ── Toggle permiso directo en usuario ───────────────────
  async function togglePermisoUsuario(permiso_id) {
    if (!usuarioSeleccionado || procesando[permiso_id]) return;

    const estaAsignado = permisosDirectos.includes(permiso_id);
    const permiso = permisos.find((p) => p.id === permiso_id);

    if (estaAsignado) {
      confirmar({
        titulo: "Quitar permiso directo",
        mensaje: `¿Quitar "${permiso?.nombre}" de ${usuarioSeleccionado.correo}?`,
        detalle:
          "El usuario perderá este permiso directo. Los permisos por rol no se ven afectados.",
        tipo: "warning",
        txtOk: "Quitar permiso",
        cb: async () => {
          procesando = { ...procesando, [permiso_id]: true };
          const loadId = toast.loading("Quitando permiso...");
          const r = await removerPermisoDirectoUsuario(
            usuarioSeleccionado.id,
            permiso_id,
          );
          procesando = { ...procesando, [permiso_id]: false };
          removeToast(loadId);
          if (r.ok) {
            permisosDirectos = permisosDirectos.filter((p) => p !== permiso_id);
            toast.success("Permiso directo removido");
          } else {
            toast.error(r.error, "Error al quitar permiso");
          }
        },
      });
    } else {
      procesando = { ...procesando, [permiso_id]: true };
      const loadId = toast.loading("Asignando permiso...");
      const r = await asignarPermisosDirectosUsuario(usuarioSeleccionado.id, [
        permiso_id,
      ]);
      procesando = { ...procesando, [permiso_id]: false };
      removeToast(loadId);
      if (r.ok) {
        permisosDirectos = [...permisosDirectos, permiso_id];
        toast.success("Permiso directo asignado");
      } else {
        toast.error(r.error, "Error al asignar permiso");
      }
    }
  }

  // ── Reactivos ───────────────────────────────────────────

  // Permisos del rol, agrupados por módulo
  $: permisosPorModulo =
    modulos.length >= 0
      ? agruparPorModulo(
          filtroModuloRol
            ? permisos.filter(
                (p) => Number(p.modulo_id) === Number(filtroModuloRol),
              )
            : permisos,
        )
      : {};
  // Permisos para asignar directamente a usuario, agrupados
  $: permisosUsuarioPorModulo =
    modulos.length >= 0
      ? agruparPorModulo(
          filtroModuloUser
            ? permisos.filter(
                (p) => Number(p.modulo_id) === Number(filtroModuloUser),
              )
            : permisos,
        )
      : {};

  // Permisos heredados del usuario, agrupados
  $: permisosHeredadosPorModulo =
    modulos.length >= 0 ? agruparPorModulo(permisosHeredados) : {};

  function agruparPorModulo(lista) {
    const grupos = {};
    for (const p of lista) {
      // Coerción explícita: ambos a número para evitar string vs int
      const mod = modulos.find((m) => Number(m.id) === Number(p.modulo_id));
      const key = mod?.nombre ?? "Sin módulo";
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(p);
    }
    // Ordenar: "Sin módulo" al final, el resto alfabético
    return Object.fromEntries(
      Object.entries(grupos).sort(([a], [b]) => {
        if (a === "Sin módulo") return 1;
        if (b === "Sin módulo") return -1;
        return a.localeCompare(b);
      }),
    );
  }
</script>

<svelte:head><title>EcclesiaSys – Roles y Permisos</title></svelte:head>

<div class="pg-wrap">
  <!-- ── Encabezado ── -->
  <div class="pg-header">
    <div>
      <h1 class="pg-titulo">Roles, Permisos y Módulos</h1>
      <p class="pg-subtitulo">
        {roles.length} roles · {permisos.length} permisos · {modulos.length} módulos
      </p>
    </div>
    <div class="d-flex gap-2 flex-wrap">
      {#if tabActivo === "roles"}
        <button class="btn-outline-sm" on:click={() => (modalPermiso = true)}>
          <i class="bi bi-key me-1" aria-hidden="true"></i>Nuevo permiso
        </button>
        <button class="btn-primary" on:click={abrirCrearRol}>
          <i class="bi bi-shield-plus me-2" aria-hidden="true"></i>Nuevo rol
        </button>
      {:else}
        <button class="btn-primary" on:click={abrirCrearModulo}>
          <i class="bi bi-puzzle me-2" aria-hidden="true"></i>Nuevo módulo
        </button>
      {/if}
    </div>
  </div>

  <!-- ── Tabs principales ── -->
  <div class="rp-tabs mb-4">
    <button
      class="rp-tab {tabActivo === 'roles' ? 'active' : ''}"
      on:click={() => (tabActivo = "roles")}
    >
      <i class="bi bi-shield me-2" aria-hidden="true"></i>Roles y Permisos
    </button>
    <button
      class="rp-tab {tabActivo === 'modulos' ? 'active' : ''}"
      on:click={() => (tabActivo = "modulos")}
    >
      <i class="bi bi-puzzle me-2" aria-hidden="true"></i>Módulos
    </button>
  </div>

  <!-- ══════════════════ TAB: ROLES ══════════════════ -->
  {#if tabActivo === "roles"}
    <div class="row g-4">
      <!-- Lista de roles -->
      <div class="col-lg-4">
        <div class="tabla-wrap">
          {#if cargando}
            <div class="tabla-loading">
              <div class="spinner-border text-primary" role="status"></div>
            </div>
          {:else if roles.length === 0}
            <div class="tabla-empty">
              <i
                class="bi bi-shield display-5 text-muted mb-3"
                aria-hidden="true"
              ></i>
              <p class="text-muted small">No hay roles</p>
            </div>
          {:else}
            <div class="roles-panel">
              {#each roles as rol (rol.id)}
                <div
                  class="rol-panel-item {rolActivo?.id === rol.id
                    ? 'activo'
                    : ''}"
                  on:click={() => seleccionarRol(rol)}
                  role="button"
                  tabindex="0"
                  on:keydown={(e) => e.key === "Enter" && seleccionarRol(rol)}
                >
                  <div class="rol-panel-icon">
                    <i class="bi bi-shield" aria-hidden="true"></i>
                  </div>
                  <div class="rol-panel-info">
                    <div class="rol-panel-nombre">{rol.nombre}</div>
                    {#if rol.descripcion}
                      <div class="rol-panel-desc">{rol.descripcion}</div>
                    {/if}
                    {#if rol.es_sistema}
                      <span class="rol-sistema-tag">Sistema</span>
                    {/if}
                  </div>
                  <div class="rol-panel-acciones">
                    <button
                      class="btn-accion btn-accion-ver"
                      title="Editar"
                      on:click|stopPropagation={() => abrirEditarRol(rol)}
                    >
                      <i class="bi bi-pencil" aria-hidden="true"></i>
                    </button>
                    {#if !rol.es_sistema}
                      <button
                        class="btn-accion btn-accion-eliminar"
                        title="Eliminar"
                        on:click|stopPropagation={() => {
                          rolTarget = rol;
                          modalEliminarRol = true;
                        }}
                      >
                        <i class="bi bi-trash" aria-hidden="true"></i>
                      </button>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <!-- Panel derecho: permisos -->
      <div class="col-lg-8">
        {#if !rolActivo}
          <div class="tabla-wrap">
            <div class="tabla-empty">
              <i
                class="bi bi-arrow-left-circle display-5 text-muted mb-3"
                aria-hidden="true"
              ></i>
              <p class="text-muted">
                Selecciona un rol para gestionar sus permisos
              </p>
            </div>
          </div>
        {:else}
          <div class="tabla-wrap">
            <!-- Header con sub-tabs -->
            <div class="permisos-header">
              <div>
                <h3 class="detalle-card-titulo mb-1">
                  <i class="bi bi-key me-2" aria-hidden="true"></i>
                  <span style="color:var(--accent)">{rolActivo.nombre}</span>
                </h3>
                <p class="text-muted small mb-0">
                  {permisosDelRol.length} permisos asignados al rol
                </p>
              </div>
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <div class="subtabs">
                  <button
                    class="subtab {tabSecundario === 'rol' ? 'active' : ''}"
                    on:click={() => (tabSecundario = "rol")}
                  >
                    <i class="bi bi-shield me-1" aria-hidden="true"></i>Por rol
                  </button>
                  <button
                    class="subtab {tabSecundario === 'usuario' ? 'active' : ''}"
                    on:click={() => (tabSecundario = "usuario")}
                  >
                    <i class="bi bi-person me-1" aria-hidden="true"></i>Por
                    usuario
                  </button>
                </div>
                {#if tabSecundario === "rol"}
                  <select
                    class="form-select filtro-select"
                    style="width:auto"
                    bind:value={filtroModuloRol}
                  >
                    <option value="">Todos los módulos</option>
                    {#each modulos as m}
                      <option value={m.id}>{m.nombre}</option>
                    {/each}
                  </select>
                {/if}
              </div>
            </div>

            <!-- ── SUB-TAB: Permisos del ROL ── -->
            {#if tabSecundario === "rol"}
              {#if cargandoPermisos}
                <div class="tabla-loading">
                  <div class="spinner-border text-primary" role="status"></div>
                </div>
              {:else}
                <div class="permisos-contenido">
                  {#each Object.entries(permisosPorModulo) as [modulo, items]}
                    <div class="permiso-grupo">
                      <div class="permiso-grupo-label">
                        <i class="bi bi-puzzle me-2" aria-hidden="true"
                        ></i>{modulo}
                      </div>
                      <div class="permisos-checks">
                        {#each items as permiso}
                          {@const marcado = permisosDelRol.includes(permiso.id)}
                          <label
                            class="permiso-check {marcado
                              ? 'activo'
                              : ''} {!permiso.activo
                              ? 'inactivo'
                              : ''} {procesando[permiso.id]
                              ? 'procesando'
                              : ''}"
                            title={!permiso.activo ? "Permiso inactivo" : ""}
                          >
                            <input
                              type="checkbox"
                              checked={marcado}
                              on:change={() => {
                                if (permiso.activo && !procesando[permiso.id])
                                  togglePermiso(permiso.id);
                              }}
                              disabled={!permiso.activo ||
                                !!procesando[permiso.id]}
                              class="visually-hidden"
                            />
                            <span class="permiso-check-box">
                              {#if procesando[permiso.id]}
                                <span
                                  class="spinner-border"
                                  style="width:10px;height:10px;border-width:1.5px"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                              {:else if marcado}
                                <i class="bi bi-check2" aria-hidden="true"></i>
                              {/if}
                            </span>
                            <div class="permiso-check-info">
                              <div class="permiso-check-nombre">
                                {permiso.nombre}
                                {#if !permiso.activo}
                                  <span class="badge-inactivo-sm">inactivo</span
                                  >
                                {/if}
                              </div>
                              <div class="permiso-check-codigo">
                                {permiso.codigo}
                              </div>
                            </div>
                          </label>
                        {/each}
                      </div>
                    </div>
                  {/each}
                  {#if Object.keys(permisosPorModulo).length === 0}
                    <div class="tabla-empty py-4">
                      <p class="text-muted small">Sin permisos para mostrar</p>
                    </div>
                  {/if}
                </div>
              {/if}

              <!-- ── SUB-TAB: Permisos por USUARIO ── -->
            {:else}
              <div class="permisos-contenido">
                <!-- Buscador de usuario -->
                <div class="usuario-busqueda mb-4">
                  <label
                    class="form-label small fw-semibold mb-2"
                    for="busqueda-usuario"
                  >
                    Buscar usuario para gestionar sus permisos directos
                  </label>
                  <div class="position-relative">
                    <div class="input-group">
                      <span
                        class="input-group-text"
                        style="background:#f8fafc;border-color:#e2e8f0"
                      >
                        <i class="bi bi-search" aria-hidden="true"></i>
                      </span>
                      <input
                        type="text"
                        class="form-control"
                        style="border-color:#e2e8f0"
                        placeholder="Buscar por correo..."
                        bind:value={inputBusqueda}
                        on:input={onBuscarUsuario}
                      />
                      {#if usuarioSeleccionado}
                        <button
                          class="btn btn-outline-secondary btn-sm"
                          style="border-color:#e2e8f0"
                          on:click={limpiarUsuario}
                          title="Cambiar usuario"
                        >
                          <i class="bi bi-x" aria-hidden="true"></i>
                        </button>
                      {/if}
                      {#if buscandoUsuarios}
                        <span
                          class="input-group-text"
                          style="background:#f8fafc;border-color:#e2e8f0"
                        >
                          <div
                            class="spinner-border spinner-border-sm text-primary"
                            role="status"
                          ></div>
                        </span>
                      {/if}
                    </div>

                    <!-- Dropdown resultados -->
                    {#if usuariosBusqueda.length > 0}
                      <div class="usuario-dropdown">
                        {#each usuariosBusqueda as u}
                          <button
                            class="usuario-dropdown-item"
                            on:click={() => seleccionarUsuario(u)}
                          >
                            <div class="user-avatar user-avatar-sm">
                              {u.correo.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div
                                class="small fw-semibold"
                                style="color:var(--primary)"
                              >
                                {u.correo}
                              </div>
                              <div
                                style="font-size:.7rem;color:var(--text-muted)"
                              >
                                ID #{u.id}
                                {#if (u.roles ?? []).length > 0}
                                  · {u.roles.map((r) => r.nombre).join(", ")}
                                {/if}
                              </div>
                            </div>
                          </button>
                        {/each}
                      </div>
                    {/if}
                  </div>
                </div>

                <!-- Sin usuario seleccionado -->
                {#if !usuarioSeleccionado}
                  <div class="tabla-empty py-3">
                    <i
                      class="bi bi-person-badge display-6 text-muted mb-2"
                      aria-hidden="true"
                    ></i>
                    <p class="text-muted small">
                      Busca un usuario para ver y gestionar sus permisos
                    </p>
                  </div>

                  <!-- Cargando permisos -->
                {:else if cargandoPermUser}
                  <div class="tabla-loading py-4">
                    <div
                      class="spinner-border text-primary"
                      role="status"
                    ></div>
                  </div>

                  <!-- Usuario seleccionado — mostrar permisos -->
                {:else}
                  <!-- Info del usuario -->
                  <div class="usuario-info-bar mb-4">
                    <div class="user-avatar user-avatar-sm">
                      {usuarioSeleccionado.correo.slice(0, 2).toUpperCase()}
                    </div>
                    <div class="flex-1">
                      <div
                        class="fw-semibold small"
                        style="color:var(--primary)"
                      >
                        {usuarioSeleccionado.correo}
                      </div>
                      <div style="font-size:.7rem;color:var(--text-muted)">
                        {permisosDirectos.length} directos ·
                        {permisosHeredados.length} heredados por rol
                      </div>
                    </div>
                    <select
                      class="form-select filtro-select"
                      style="width:auto"
                      bind:value={filtroModuloUser}
                    >
                      <option value="">Todos los módulos</option>
                      {#each modulos as m}
                        <option value={m.id}>{m.nombre}</option>
                      {/each}
                    </select>
                  </div>

                  <!-- Sub-tabs directos / heredados -->
                  <div class="subtabs mb-4" style="width:fit-content">
                    <button
                      class="subtab {tabPermisoUser === 'directos'
                        ? 'active'
                        : ''}"
                      on:click={() => (tabPermisoUser = "directos")}
                    >
                      <i class="bi bi-person-check me-1" aria-hidden="true"></i>
                      Directos ({permisosDirectos.length})
                    </button>
                    <button
                      class="subtab {tabPermisoUser === 'heredados'
                        ? 'active'
                        : ''}"
                      on:click={() => (tabPermisoUser = "heredados")}
                    >
                      <i class="bi bi-shield me-1" aria-hidden="true"></i>
                      Por rol ({permisosHeredados.length})
                    </button>
                  </div>

                  <!-- DIRECTOS: checkboxes editables -->
                  {#if tabPermisoUser === "directos"}
                    <div class="perm-user-info mb-3">
                      <i
                        class="bi bi-info-circle me-2 text-muted"
                        aria-hidden="true"
                      ></i>
                      <span class="text-muted small">
                        Permisos asignados directamente a este usuario, sin
                        importar su rol. El ícono
                        <i
                          class="bi bi-shield-fill"
                          style="color:#7c3aed;font-size:.75rem"
                        ></i>
                        indica que ya tiene el permiso por rol.
                      </span>
                    </div>

                    {#each Object.entries(permisosUsuarioPorModulo) as [modulo, items]}
                      <div class="permiso-grupo">
                        <div class="permiso-grupo-label">
                          <i class="bi bi-puzzle me-2" aria-hidden="true"
                          ></i>{modulo}
                        </div>
                        <div class="permisos-checks">
                          {#each items as permiso}
                            {@const esDirecto = permisosDirectos.includes(
                              permiso.id,
                            )}
                            {@const esHeredado = permisosHeredados.some(
                              (p) => p.id === permiso.id,
                            )}
                            <label
                              class="permiso-check
                                {esDirecto ? 'activo' : ''}
                                {esHeredado && !esDirecto ? 'heredado' : ''}
                                {!permiso.activo ? 'inactivo' : ''}"
                              title={!permiso.activo
                                ? "Permiso inactivo"
                                : esHeredado
                                  ? "Ya tiene este permiso por rol"
                                  : ""}
                            >
                              <input
                                type="checkbox"
                                checked={esDirecto}
                                on:change={() =>
                                  permiso.activo &&
                                  togglePermisoUsuario(permiso.id)}
                                disabled={!permiso.activo}
                                class="visually-hidden"
                              />
                              <span class="permiso-check-box">
                                {#if esDirecto}
                                  <i class="bi bi-check2" aria-hidden="true"
                                  ></i>
                                {:else if esHeredado}
                                  <i
                                    class="bi bi-shield-fill"
                                    style="font-size:.6rem;color:#7c3aed"
                                    aria-hidden="true"
                                  ></i>
                                {/if}
                              </span>
                              <div class="permiso-check-info">
                                <div class="permiso-check-nombre">
                                  {permiso.nombre}
                                  {#if esHeredado && !esDirecto}
                                    <span class="badge-heredado">por rol</span>
                                  {/if}
                                  {#if !permiso.activo}
                                    <span class="badge-inactivo-sm"
                                      >inactivo</span
                                    >
                                  {/if}
                                </div>
                                <div class="permiso-check-codigo">
                                  {permiso.codigo}
                                </div>
                              </div>
                            </label>
                          {/each}
                        </div>
                      </div>
                    {/each}

                    {#if Object.keys(permisosUsuarioPorModulo).length === 0}
                      <div class="tabla-empty py-3">
                        <p class="text-muted small">
                          Sin permisos para mostrar
                        </p>
                      </div>
                    {/if}

                    <!-- HEREDADOS: solo lectura -->
                  {:else}
                    <div class="perm-user-info mb-3">
                      <i
                        class="bi bi-info-circle me-2 text-muted"
                        aria-hidden="true"
                      ></i>
                      <span class="text-muted small">
                        Solo lectura. Para modificar estos permisos, edita el
                        rol correspondiente en el tab "Por rol".
                      </span>
                    </div>

                    {#each Object.entries(permisosHeredadosPorModulo) as [modulo, items]}
                      <div class="permiso-grupo">
                        <div class="permiso-grupo-label">
                          <i class="bi bi-puzzle me-2" aria-hidden="true"
                          ></i>{modulo}
                        </div>
                        <div class="permisos-grid">
                          {#each items as p}
                            <div class="permiso-tag">
                              <i class="bi bi-shield me-1" aria-hidden="true"
                              ></i>
                              {p.codigo}
                            </div>
                          {/each}
                        </div>
                      </div>
                    {/each}

                    {#if Object.keys(permisosHeredadosPorModulo).length === 0}
                      <div class="tabla-empty py-3">
                        <p class="text-muted small">
                          Sin permisos heredados por rol
                        </p>
                      </div>
                    {/if}
                  {/if}
                {/if}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- ══════════════════ TAB: MÓDULOS ══════════════════ -->
  {:else}
    <div class="tabla-wrap">
      {#if cargando}
        <div class="tabla-loading">
          <div class="spinner-border text-primary" role="status"></div>
        </div>
      {:else if modulos.length === 0}
        <div class="tabla-empty">
          <i class="bi bi-puzzle display-5 text-muted mb-3" aria-hidden="true"
          ></i>
          <p class="text-muted">No hay módulos configurados</p>
        </div>
      {:else}
        <div class="tabla-wrap">
          <table class="tabla">
            <thead>
              <tr>
                <th>Módulo</th>
                <th>Código</th>
                <th>Permisos</th>
                <th>Estado</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {#each modulos as mod (mod.id)}
                <tr class="tabla-fila">
                  <td>
                    <div class="mod-cell">
                      <div class="mod-icon">
                        <i class="bi bi-puzzle" aria-hidden="true"></i>
                      </div>
                      <div>
                        <div class="mod-nombre">{mod.nombre}</div>
                        {#if mod.descripcion}
                          <div class="mod-desc">{mod.descripcion}</div>
                        {/if}
                      </div>
                    </div>
                  </td>
                  <td><code class="mod-codigo">{mod.codigo ?? "—"}</code></td>
                  <td>
                    <!-- Botón que expande/colapsa permisos del módulo -->
                    <button
                      class="btn-ver-permisos"
                      on:click={() =>
                        (moduloExpandido =
                          moduloExpandido?.id === mod.id ? null : mod)}
                    >
                      <i class="bi bi-key me-1" aria-hidden="true"></i>
                      {permisos.filter((p) => p.modulo_id === mod.id).length} permisos
                      <i
                        class="bi bi-chevron-{moduloExpandido?.id === mod.id
                          ? 'up'
                          : 'down'} ms-1"
                        aria-hidden="true"
                      ></i>
                    </button>
                  </td>
                  <td>
                    <button
                      class="toggle-btn {mod.activo
                        ? 'toggle-on'
                        : 'toggle-off'}"
                      on:click={() => onToggleModulo(mod)}
                      disabled={toggling[mod.id]}
                      title={mod.activo
                        ? "Desactivar módulo"
                        : "Activar módulo"}
                    >
                      {#if toggling[mod.id]}
                        <span
                          class="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      {:else}
                        <span class="toggle-dot"></span>
                      {/if}
                      {mod.activo ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td>
                    <div class="acciones-cell">
                      <button
                        class="btn-accion btn-accion-ver"
                        title="Editar"
                        on:click={() => abrirEditarModulo(mod)}
                      >
                        <i class="bi bi-pencil" aria-hidden="true"></i>
                      </button>
                      <button
                        class="btn-accion btn-accion-eliminar"
                        title={permisos.filter((p) => p.modulo_id === mod.id)
                          .length > 0
                          ? "No se puede eliminar: tiene permisos asociados"
                          : "Eliminar módulo"}
                        on:click={() => {
                          moduloTarget = mod;
                          modalEliminarMod = true;
                        }}
                        disabled={permisos.filter((p) => p.modulo_id === mod.id)
                          .length > 0}
                      >
                        <i class="bi bi-trash" aria-hidden="true"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Fila expandible con permisos del módulo -->
                {#if moduloExpandido?.id === mod.id}
                  {@const permisosDelMod = permisos.filter(
                    (p) => p.modulo_id === mod.id,
                  )}
                  <tr>
                    <td colspan="5" class="p-0">
                      <div class="modulo-permisos-panel">
                        {#if permisosDelMod.length === 0}
                          <div class="tabla-empty py-3">
                            <p class="text-muted small mb-0">
                              Este módulo no tiene permisos
                            </p>
                          </div>
                        {:else}
                          <div class="permisos-mod-lista">
                            {#each permisosDelMod as permiso}
                              <div class="permiso-mod-item">
                                <div class="permiso-mod-info">
                                  <div class="permiso-check-nombre">
                                    {permiso.nombre}
                                  </div>
                                  <div class="permiso-check-codigo">
                                    {permiso.codigo}
                                  </div>
                                </div>
                                <button
                                  class="toggle-btn {permiso.activo
                                    ? 'toggle-on'
                                    : 'toggle-off'}"
                                  on:click={() =>
                                    onTogglePermisoModulo(permiso)}
                                  disabled={!!toggling[`p_${permiso.id}`]}
                                  title={permiso.activo
                                    ? "Desactivar permiso"
                                    : "Activar permiso"}
                                >
                                  {#if toggling[`p_${permiso.id}`]}
                                    <span
                                      class="spinner-border spinner-border-sm"
                                      role="status"
                                      aria-hidden="true"
                                    ></span>
                                  {:else}
                                    <span class="toggle-dot"></span>
                                  {/if}
                                  {permiso.activo ? "Activo" : "Inactivo"}
                                </button>
                              </div>
                            {/each}
                          </div>
                        {/if}
                      </div>
                    </td>
                  </tr>
                {/if}
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- ══════════ MODALES ══════════ -->

<!-- Modal: Crear/Editar Rol -->
{#if modalRol}
  <div
    class="modal-overlay"
    on:click={() => (modalRol = false)}
    aria-hidden="true"
  ></div>
  <div class="modal-box" role="dialog" aria-modal="true">
    <div class="modal-header">
      <div class="modal-icon-primary">
        <i class="bi bi-shield" aria-hidden="true"></i>
      </div>
      <h3 class="modal-titulo">{modoEditar ? "Editar rol" : "Nuevo rol"}</h3>
    </div>
    {#if errorRol}<div class="alerta-error mb-3">{errorRol}</div>{/if}
    <div class="mb-3">
      <label class="form-label small fw-semibold" for="nombre">
        Nombre <span class="text-danger">*</span></label
      >
      <input
        type="text"
        class="form-control"
        bind:value={formRol.nombre}
        placeholder="Ej: Secretario Parroquial"
      />
    </div>
    <div class="mb-4">
      <label class="form-label small fw-semibold" for="descripcion"
        >Descripción</label
      >
      <textarea
        class="form-control"
        rows="3"
        id="descripcion"
        bind:value={formRol.descripcion}
        placeholder="Descripción del rol..."
      ></textarea>
    </div>
    <div class="modal-acciones">
      <button class="btn-modal-cancelar" on:click={() => (modalRol = false)}
        >Cancelar</button
      >
      <button
        class="btn-modal-primary"
        on:click={guardarRol}
        disabled={guardandoRol}
      >
        {#if guardandoRol}<span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>{/if}
        {modoEditar ? "Guardar" : "Crear rol"}
      </button>
    </div>
  </div>
{/if}

<!-- Modal: Eliminar Rol -->
{#if modalEliminarRol}
  <div
    class="modal-overlay"
    on:click={() => (modalEliminarRol = false)}
    aria-hidden="true"
  ></div>
  <div class="modal-box" role="dialog" aria-modal="true">
    <div class="modal-header">
      <div class="modal-icon-danger">
        <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
      </div>
      <h3 class="modal-titulo">Eliminar rol</h3>
    </div>
    <p class="modal-desc">
      ¿Eliminar <strong>{rolTarget?.nombre}</strong>? Los usuarios con este rol
      lo perderán.
    </p>
    <div class="modal-acciones">
      <button
        class="btn-modal-cancelar"
        on:click={() => (modalEliminarRol = false)}>Cancelar</button
      >
      <button
        class="btn-modal-confirmar"
        on:click={confirmarEliminarRol}
        disabled={eliminandoRol}
      >
        {#if eliminandoRol}<span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>{/if}
        Eliminar
      </button>
    </div>
  </div>
{/if}

<!-- Modal: Crear/Editar Módulo -->
{#if modalModulo}
  <div
    class="modal-overlay"
    on:click={() => (modalModulo = false)}
    aria-hidden="true"
  ></div>
  <div class="modal-box" role="dialog" aria-modal="true">
    <div class="modal-header">
      <div class="modal-icon-primary">
        <i class="bi bi-puzzle" aria-hidden="true"></i>
      </div>
      <h3 class="modal-titulo">
        {modoEditarMod ? "Editar módulo" : "Nuevo módulo"}
      </h3>
    </div>
    {#if errorMod}<div class="alerta-error mb-3">{errorMod}</div>{/if}
    <div class="mb-3">
      <label class="form-label small fw-semibold" for=""
        >Nombre <span class="text-danger">*</span></label
      >
      <input
        type="text"
        class="form-control"
        bind:value={formModulo.nombre}
        placeholder="Ej: Gestión de Sacramentos"
      />
    </div>
    <div class="mb-3">
      <label class="form-label small fw-semibold" for="codigo">
        Código <span class="text-danger">*</span>
      </label>
      <input
        type="text"
        class="form-control"
        id="codigo"
        bind:value={formModulo.codigo}
        placeholder="Ej: sacramentos"
      />
      <div class="form-text small text-muted">
        Identificador único (sin espacios, minúsculas).
      </div>
    </div>
    <div class="mb-4">
      <label class="form-label small fw-semibold" for="descripcion"
        >Descripción</label
      >
      <textarea
        class="form-control"
        rows="2"
        bind:value={formModulo.descripcion}
        placeholder="Descripción del módulo..."
      ></textarea>
    </div>
    <div class="modal-acciones">
      <button class="btn-modal-cancelar" on:click={() => (modalModulo = false)}
        >Cancelar</button
      >
      <button
        class="btn-modal-primary"
        on:click={guardarModulo}
        disabled={guardandoMod}
      >
        {#if guardandoMod}<span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>{/if}
        {modoEditarMod ? "Guardar" : "Crear módulo"}
      </button>
    </div>
  </div>
{/if}

<!-- Modal: Eliminar Módulo -->
{#if modalEliminarMod}
  <div
    class="modal-overlay"
    on:click={() => (modalEliminarMod = false)}
    aria-hidden="true"
  ></div>
  <div class="modal-box" role="dialog" aria-modal="true">
    <div class="modal-header">
      <div class="modal-icon-danger">
        <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
      </div>
      <h3 class="modal-titulo">Eliminar módulo</h3>
    </div>
    <p class="modal-desc">
      ¿Eliminar <strong>{moduloTarget?.nombre}</strong>? Se eliminarán también
      sus permisos asociados.
    </p>
    <div class="modal-acciones">
      <button
        class="btn-modal-cancelar"
        on:click={() => (modalEliminarMod = false)}>Cancelar</button
      >
      <button
        class="btn-modal-confirmar"
        on:click={confirmarEliminarModulo}
        disabled={eliminandoMod}
      >
        {#if eliminandoMod}<span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>{/if}
        Eliminar
      </button>
    </div>
  </div>
{/if}

<!-- Modal: Crear Permiso -->
{#if modalPermiso}
  <div
    class="modal-overlay"
    on:click={() => (modalPermiso = false)}
    aria-hidden="true"
  ></div>
  <div class="modal-box" role="dialog" aria-modal="true">
    <div class="modal-header">
      <div class="modal-icon-primary">
        <i class="bi bi-key" aria-hidden="true"></i>
      </div>
      <h3 class="modal-titulo">Nuevo permiso</h3>
    </div>
    {#if errorPerm}<div class="alerta-error mb-3">{errorPerm}</div>{/if}
    <div class="mb-3">
      <label class="form-label small fw-semibold" for="modulo"
        >Módulo <span class="text-danger">*</span></label
      >
      <select class="form-select" bind:value={formPermiso.modulo_id}>
        <option value="">-- Selecciona un módulo --</option>
        {#each modulos.filter((m) => m.activo) as m}
          <option value={m.id}>{m.nombre}</option>
        {/each}
      </select>
    </div>
    <div class="mb-3">
      <label class="form-label small fw-semibold" for="nombre"
        >Nombre <span class="text-danger">*</span></label
      >
      <input
        type="text"
        class="form-control"
        bind:value={formPermiso.nombre}
        placeholder="Ej: Listar sacramentos"
      />
    </div>
    <div class="mb-3">
      <label class="form-label small fw-semibold" for="codigo"
        >Código <span class="text-danger">*</span></label
      >
      <input
        type="text"
        class="form-control"
        bind:value={formPermiso.codigo}
        placeholder="Ej: sacramentos.listar"
      />
      <div class="form-text small text-muted">
        Formato: modulo.accion (minúsculas, sin espacios).
      </div>
    </div>
    <div class="mb-4">
      <label class="form-label small fw-semibold" for="descripcion"
        >Descripción</label
      >
      <textarea
        class="form-control"
        rows="2"
        id="descripcion"
        bind:value={formPermiso.descripcion}
        placeholder="Descripción del permiso..."
      ></textarea>
    </div>
    <div class="modal-acciones">
      <button class="btn-modal-cancelar" on:click={() => (modalPermiso = false)}
        >Cancelar</button
      >
      <button
        class="btn-modal-primary"
        on:click={guardarPermiso}
        disabled={guardandoPerm}
      >
        {#if guardandoPerm}<span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>{/if}
        Crear permiso
      </button>
    </div>
  </div>
{/if}

<!-- ConfirmDialog SIEMPRE montado, fuera de cualquier {#if} -->
<ConfirmDialog
  bind:abierto={confirmAbierto}
  titulo={confirmConfig.titulo}
  mensaje={confirmConfig.mensaje}
  detalle={confirmConfig.detalle}
  tipo={confirmConfig.tipo}
  txtOk={confirmConfig.txtOk}
  cargando={!!confirmCallback &&
    confirmAbierto &&
    Object.values(procesando).some(Boolean)}
  on:confirmar={onConfirmarDialog}
  on:cancelar={() => (confirmAbierto = false)}
/>
