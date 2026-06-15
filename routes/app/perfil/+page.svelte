<!-- src/routes/admin/perfil/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import { getSession } from "$lib/js/api/client.js";
  import "$lib/styles/perfil/perfil.css";
  import {
    getMe,
    verificarPerfil,
    crearPerfil,
    actualizarPerfil,
    cambiarEmail,
    cambiarPassword,
    getMisSesiones,
    subirFotoPerfil,
    eliminarFotoPerfil,
  } from "$lib/js/interfaces/user.js";
  import { passwordStrength } from "$lib/js/interfaces/auth.js";
  import { toast } from "$lib/js/stores/ui.js";
  import { TIPOS_DOCUMENTO, ESTADOS_CIVILES } from "$lib/js/utils/constants.js";
  import { formatFecha } from "$lib/js/utils/formatters.js";
  import PasswordInput from "$lib/components/auth/PasswordInput.svelte";
  import FileUpload from "$lib/components/ui/FileUpload.svelte";

  // ── Estado general ─────────────────────────────────────
  let session = null;
  let me = null; // respuesta de /usuarios/me
  let perfilCompleto = false;
  let tabActivo = "info"; // 'info' | 'seguridad' | 'sesiones'
  let cargando = true;

  // ── Foto de perfil ─────────────────────────────────────
  let fotoUrl = null; // URL actual guardada
  let subiendoFoto = false;
  let errorFoto = "";

  // Avatares predefinidos (DiceBear — SVG gratuito, sin tracking)
  const AVATARES = [
    {
      id: 1,
      url: "/src/lib/assets/img/avatar/avatar_1.png",
    },
    {
      id: 2,
      url: "/src/lib/assets/img/avatar/avatar_2.png",
    },
    {
      id: 3,
      url: "/src/lib/assets/img/avatar/avatar_3.png",
    },
    {
      id: 4,
      url: "/src/lib/assets/img/avatar/avatar_4.png",
    },
    {
      id: 5,
      url: "/src/lib/assets/img/avatar/avatar_5.png",
    },
    {
      id: 6,
      url: "/src/lib/assets/img/avatar/avatar_6.png",
    },
  ];
  // ── Tab: Información personal ──────────────────────────
  let form = {
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    tipo_documento: "CC",
    numero_documento: "",
    fecha_nacimiento: "",
    sexo: "",
    lugar_nacimiento: "",
    region: "",
    departamento: "",
    municipio: "",
    estado_civil: "soltero",
    observaciones: "",
  };
  let guardandoPerfil = false;
  let errorPerfil = "";
  let exitoPerfil = "";

  // ── Tab: Seguridad ─────────────────────────────────────
  let correoNuevo = "";
  let guardandoEmail = false;
  let errorEmail = "";
  let exitoEmail = "";

  let passActual = "";
  let passNueva = "";
  let passConfirmar = "";
  let guardandoPass = false;
  let errorPass = "";
  let exitoPass = "";

  $: strengthPass = passwordStrength(passNueva);
  $: noCoinciden = passConfirmar.length > 0 && passNueva !== passConfirmar;

  // ── Tab: Sesiones ──────────────────────────────────────
  let sesiones = [];
  let cargandoSesiones = false;

  // ── Inicialización ─────────────────────────────────────
  onMount(async () => {
    session = getSession();
    correoNuevo = session?.correo ?? "";

    const [rMe, rPerfil] = await Promise.all([getMe(), verificarPerfil()]);

    cargando = false;

    if (rMe.ok) {
      me = rMe.data;
      perfilCompleto = rPerfil.ok ? (rPerfil.data?.completo ?? false) : false;
      rellenarForm(me);
      fotoUrl = me?.persona?.foto_url ?? null;
    }
  });

  function rellenarForm(data) {
    const p = data?.persona ?? data ?? {};
    form.primer_nombre = p.primer_nombre ?? "";
    form.segundo_nombre = p.segundo_nombre ?? "";
    form.primer_apellido = p.primer_apellido ?? "";
    form.segundo_apellido = p.segundo_apellido ?? "";
    form.tipo_documento = p.tipo_documento ?? "CC";
    form.numero_documento = p.numero_documento ?? "";
    form.fecha_nacimiento = p.fecha_nacimiento ?? "";
    form.sexo = p.sexo ?? "";
    form.lugar_nacimiento = p.lugar_nacimiento ?? "";
    form.region = p.region ?? "";
    form.departamento = p.departamento ?? "";
    form.municipio = p.municipio ?? "";
    form.estado_civil = p.estado_civil ?? "soltero";
    form.observaciones = p.observaciones ?? "";
  }

  // ── Guardar perfil ─────────────────────────────────────
  async function onGuardarPerfil() {
    errorPerfil = "";
    exitoPerfil = "";
    if (!form.primer_nombre || !form.primer_apellido) {
      errorPerfil = "Nombre y primer apellido son obligatorios.";
      return;
    }
    guardandoPerfil = true;
    const fn = perfilCompleto ? actualizarPerfil : crearPerfil;
    const r = await fn(form);
    guardandoPerfil = false;
    if (r.ok) {
      exitoPerfil = "Perfil guardado correctamente.";
      perfilCompleto = true;
      toast.success("Perfil actualizado");
    } else {
      errorPerfil = r.error;
    }
  }

  // ── Cambiar email ──────────────────────────────────────
  async function onCambiarEmail() {
    errorEmail = "";
    exitoEmail = "";
    if (!correoNuevo || correoNuevo === session?.correo) {
      errorEmail = "Ingresa un correo diferente al actual.";
      return;
    }
    guardandoEmail = true;
    const r = await cambiarEmail({ correo_nuevo: correoNuevo });
    guardandoEmail = false;
    if (r.ok) exitoEmail = r.mensaje;
    else errorEmail = r.error;
  }

  // ── Cambiar contraseña ─────────────────────────────────
  async function onCambiarPassword() {
    errorPass = "";
    exitoPass = "";
    if (!strengthPass.esValida) {
      errorPass = "La contraseña nueva no cumple los requisitos.";
      return;
    }
    if (passNueva !== passConfirmar) {
      errorPass = "Las contraseñas no coinciden.";
      return;
    }
    guardandoPass = true;
    const r = await cambiarPassword({
      contrasena_actual: passActual,
      contrasena_nueva: passNueva,
      confirmar_contrasena: passConfirmar,
    });
    guardandoPass = false;
    if (r.ok) {
      exitoPass = r.mensaje;
      passActual = "";
      passNueva = "";
      passConfirmar = "";
      toast.success("Contraseña actualizada");
    } else {
      errorPass = r.error;
    }
  }

  // ── Foto de perfil ─────────────────────────────────────
  async function onSeleccionarFoto(e) {
    const file = e.detail;
    errorFoto = "";
    subiendoFoto = true;
    const r = await subirFotoPerfil(file);
    subiendoFoto = false;
    if (r.ok) {
      fotoUrl = r.foto_url;
      toast.success("Foto de perfil actualizada");
    } else {
      errorFoto = r.error ?? "Error al subir la foto.";
      toast.error(errorFoto);
    }
  }

  async function onSeleccionarAvatar(url) {
    errorFoto = "";
    subiendoFoto = true;
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const file = new File([blob], "avatar.svg", { type: "image/svg+xml" });
      const r = await subirFotoPerfil(file);
      subiendoFoto = false;
      if (r.ok) {
        fotoUrl = r.foto_url;
        toast.success("Avatar aplicado");
      } else {
        errorFoto = r.error ?? "Error al aplicar el avatar.";
      }
    } catch {
      subiendoFoto = false;
      errorFoto = "No se pudo cargar el avatar. Intenta de nuevo.";
    }
  }

  async function onQuitarFoto() {
    errorFoto = "";
    subiendoFoto = true;
    const r = await eliminarFotoPerfil();
    subiendoFoto = false;
    if (r.ok) {
      fotoUrl = null;
      toast.success("Foto eliminada");
    } else {
      errorFoto = r.error ?? "Error al eliminar la foto.";
    }
  }

  // ── Cargar sesiones ────────────────────────────────────
  async function onVerSesiones() {
    tabActivo = "sesiones";
    cargandoSesiones = true;
    const r = await getMisSesiones();
    cargandoSesiones = false;
    if (r.ok) sesiones = r.data?.sesiones ?? r.data ?? [];
  }

  function iniciales() {
    const correo = session?.correo ?? "";
    return correo.slice(0, 2).toUpperCase();
  }

  function formatDevice(s) {
    return (
      s.dispositivo ?? s.user_agent?.slice(0, 40) ?? "Dispositivo desconocido"
    );
  }
</script>

<svelte:head><title>EcclesiaSys – Mi perfil</title></svelte:head>

<div class="perfil-page">
  <!-- ── Encabezado ── -->
  <div class="perfil-header">
    <div class="perfil-avatar-wrap">
      {#if fotoUrl}
        <img
          src={fotoUrl}
          alt="Foto de perfil"
          class="perfil-avatar perfil-avatar-img"
        />
      {:else}
        <div class="perfil-avatar">{iniciales()}</div>
      {/if}
      {#if perfilCompleto}
        <span class="perfil-avatar-badge" title="Perfil completo">
          <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
        </span>
      {/if}
    </div>
    <div class="perfil-header-info">
      <h1 class="perfil-nombre">
        {#if form.primer_nombre}
          {form.primer_nombre} {form.primer_apellido}
        {:else}
          {session?.correo ?? ""}
        {/if}
      </h1>
      <p class="perfil-correo">{session?.correo ?? ""}</p>
      <div class="d-flex gap-2 flex-wrap mt-2">
        {#each session?.roles ?? [] as rol}
          <span class="perfil-rol-badge">{rol}</span>
        {/each}
        {#if !perfilCompleto}
          <span class="perfil-incompleto-badge">
            <i class="bi bi-exclamation-triangle me-1" aria-hidden="true"></i>
            Perfil incompleto
          </span>
        {/if}
      </div>
    </div>
  </div>

  <!-- ── Tabs ── -->
  <div class="perfil-tabs">
    <button
      class="perfil-tab {tabActivo === 'info' ? 'active' : ''}"
      on:click={() => (tabActivo = "info")}
    >
      <i class="bi bi-person me-2" aria-hidden="true"></i>Información personal
    </button>
    <button
      class="perfil-tab {tabActivo === 'seguridad' ? 'active' : ''}"
      on:click={() => (tabActivo = "seguridad")}
    >
      <i class="bi bi-shield-lock me-2" aria-hidden="true"></i>Seguridad
    </button>
    <button
      class="perfil-tab {tabActivo === 'foto' ? 'active' : ''}"
      on:click={() => (tabActivo = "foto")}
    >
      <i class="bi bi-camera me-2" aria-hidden="true"></i>Foto de perfil
    </button>
    <button
      class="perfil-tab {tabActivo === 'sesiones' ? 'active' : ''}"
      on:click={onVerSesiones}
    >
      <i class="bi bi-laptop me-2" aria-hidden="true"></i>Sesiones activas
    </button>
  </div>

  <!-- ── Contenido de tabs ── -->
  {#if cargando}
    <div class="perfil-loading">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-3">Cargando tu perfil...</p>
    </div>

    <!-- TAB: Información personal -->
  {:else if tabActivo === "info"}
    <div class="perfil-card">
      <div class="perfil-card-title">
        <i class="bi bi-person-vcard me-2" aria-hidden="true"></i>
        {perfilCompleto ? "Editar información personal" : "Completar perfil"}
      </div>

      {#if errorPerfil}
        <div class="alert perfil-alert-error mb-4" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"
          ></i>{errorPerfil}
        </div>
      {/if}
      {#if exitoPerfil}
        <div class="alert perfil-alert-success mb-4" role="alert">
          <i class="bi bi-check-circle-fill me-2" aria-hidden="true"
          ></i>{exitoPerfil}
        </div>
      {/if}

      <form on:submit|preventDefault={onGuardarPerfil} novalidate>
        <!-- Nombres -->
        <div class="perfil-form-section">
          <div class="perfil-form-section-label">Nombres</div>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label perfil-label" for="primer_nombre"
                >Primer nombre <span class="text-danger">*</span></label
              >
              <input
                id="primer_nombre"
                type="text"
                class="form-control perfil-input"
                bind:value={form.primer_nombre}
                placeholder="Ej: Juan"
                required
              />
            </div>
            <div class="col-md-6">
              <label class="form-label perfil-label" for="segundo_nombre">
                Segundo nombre
              </label>
              <input
                id="segundo_nombre"
                type="text"
                class="form-control perfil-input"
                bind:value={form.segundo_nombre}
                placeholder="Opcional"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label perfil-label" for="primer_apellido">
                Primer apellido <span class="text-danger">*</span>
              </label>
              <input
                id="primer_apellido"
                type="text"
                class="form-control perfil-input"
                bind:value={form.primer_apellido}
                placeholder="Ej: García"
                required
              />
            </div>
            <div class="col-md-6">
              <label class="form-label perfil-label" for="segundo_apellido">
                Segundo apellido
              </label>
              <input
                id="segundo_apellido"
                type="text"
                class="form-control perfil-input"
                bind:value={form.segundo_apellido}
                placeholder="Opcional"
              />
            </div>
          </div>
        </div>

        <!-- Documento -->
        <div class="perfil-form-section">
          <div class="perfil-form-section-label">Documento de identidad</div>
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label perfil-label" for="tipo_documento"
                >Tipo <span class="text-danger">*</span></label
              >
              <select
                id="tipo_documento"
                class="form-select perfil-input"
                bind:value={form.tipo_documento}
              >
                {#each TIPOS_DOCUMENTO as t}
                  <option value={t.value}>{t.label}</option>
                {/each}
              </select>
            </div>
            <div class="col-md-8">
              <label class="form-label perfil-label" for="numero_documento">
                Número
              </label>
              <input
                id="numero_documento"
                type="text"
                class="form-control perfil-input"
                bind:value={form.numero_documento}
                placeholder="Número de documento"
                disabled={form.tipo_documento === "sin_documento"}
              />
            </div>
          </div>
        </div>

        <!-- Datos personales -->
        <div class="perfil-form-section">
          <div class="perfil-form-section-label">Datos personales</div>
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label perfil-label" for="fecha_nacimiento">
                Fecha de nacimiento
              </label>
              <input
                id="fecha_nacimiento"
                type="date"
                class="form-control perfil-input"
                bind:value={form.fecha_nacimiento}
              />
            </div>
            <div class="col-md-4">
              <label class="form-label perfil-label" for="sexo"> Sexo </label>
              <select
                id="sexo"
                class="form-select perfil-input"
                bind:value={form.sexo}
              >
                <option value="">Seleccionar</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label perfil-label" for="estado_civil">
                Estado civil
              </label>
              <select
                id="estado_civil"
                class="form-select perfil-input"
                bind:value={form.estado_civil}
              >
                {#each ESTADOS_CIVILES as e}
                  <option value={e.value}>{e.label}</option>
                {/each}
              </select>
            </div>
            <div class="col-md-12">
              <label class="form-label perfil-label" for="lugar_nacimiento">
                Lugar de nacimiento
              </label>
              <input
                id="lugar_nacimiento"
                type="text"
                class="form-control perfil-input"
                bind:value={form.lugar_nacimiento}
                placeholder="Ciudad, País"
              />
            </div>
          </div>
        </div>

        <!-- Ubicación -->
        <div class="perfil-form-section">
          <div class="perfil-form-section-label">Ubicación</div>
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label perfil-label" for="region">Región</label>
              <input
                id="region"
                type="text"
                class="form-control perfil-input"
                bind:value={form.region}
                placeholder="Ej: Caribe"
              />
            </div>
            <div class="col-md-4">
              <label class="form-label perfil-label" for="departamento"
                >Departamento</label
              >
              <input
                id="departamento"
                type="text"
                class="form-control perfil-input"
                bind:value={form.departamento}
                placeholder="Ej: Atlántico"
              />
            </div>
            <div class="col-md-4">
              <label class="form-label perfil-label" for="municipio"
                >Ciudad</label
              >
              <input
                id="municipio"
                type="text"
                class="form-control perfil-input"
                bind:value={form.municipio}
                placeholder="Ej: Barranquilla"
              />
            </div>
          </div>
        </div>

        <!-- Observaciones -->
        <div class="perfil-form-section">
          <div class="perfil-form-section-label">Información adicional</div>
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label perfil-label" for="observaciones"
                >Observaciones</label
              >
              <textarea
                id="observaciones"
                class="form-control perfil-input"
                rows="3"
                bind:value={form.observaciones}
                placeholder="Información adicional relevante..."
              ></textarea>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end mt-2">
          <button
            type="submit"
            class="btn btn-perfil-primary"
            disabled={guardandoPerfil}
          >
            {#if guardandoPerfil}
              <span
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Guardando...
            {:else}
              <i class="bi bi-check-lg me-2" aria-hidden="true"></i>
              {perfilCompleto ? "Guardar cambios" : "Completar perfil"}
            {/if}
          </button>
        </div>
      </form>
    </div>

    <!-- TAB: Seguridad -->
  {:else if tabActivo === "seguridad"}
    <div class="row g-4">
      <!-- Cambiar correo -->
      <div class="col-lg-6">
        <div class="perfil-card h-100">
          <div class="perfil-card-title">
            <i class="bi bi-envelope me-2" aria-hidden="true"></i>Cambiar correo
            electrónico
          </div>
          <p class="text-muted small mb-4">
            Al cambiar tu correo recibirás un enlace de verificación en la nueva
            dirección.
          </p>

          {#if errorEmail}
            <div class="alert perfil-alert-error mb-3" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"
              ></i>{errorEmail}
            </div>
          {/if}
          {#if exitoEmail}
            <div class="alert perfil-alert-success mb-3" role="alert">
              <i class="bi bi-check-circle-fill me-2" aria-hidden="true"
              ></i>{exitoEmail}
            </div>
          {/if}

          <form on:submit|preventDefault={onCambiarEmail} novalidate>
            <div class="mb-3">
              <label class="form-label perfil-label" for="correo_actual"
                >Correo actual</label
              >
              <input
                id="correo_actual"
                type="email"
                class="form-control perfil-input"
                value={session?.correo ?? ""}
                disabled
              />
            </div>
            <div class="mb-4">
              <label class="form-label perfil-label" for="correo_nuevo"
                >Nuevo correo <span class="text-danger">*</span></label
              >
              <input
                id="correo_nuevo"
                type="email"
                class="form-control perfil-input"
                bind:value={correoNuevo}
                placeholder="nuevo@correo.com"
                disabled={guardandoEmail}
                required
              />
            </div>
            <button
              type="submit"
              class="btn btn-perfil-primary w-100"
              disabled={guardandoEmail}
            >
              {#if guardandoEmail}
                <span
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>Enviando...
              {:else}
                <i class="bi bi-envelope-arrow-up me-2" aria-hidden="true"
                ></i>Cambiar correo
              {/if}
            </button>
          </form>
        </div>
      </div>

      <!-- Cambiar contraseña -->
      <div class="col-lg-6">
        <div class="perfil-card h-100">
          <div class="perfil-card-title">
            <i class="bi bi-lock me-2" aria-hidden="true"></i>Cambiar contraseña
          </div>
          <p class="text-muted small mb-4">
            Usa una contraseña segura con mayúsculas, números y caracteres
            especiales.
          </p>

          {#if errorPass}
            <div class="alert perfil-alert-error mb-3" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"
              ></i>{errorPass}
            </div>
          {/if}
          {#if exitoPass}
            <div class="alert perfil-alert-success mb-3" role="alert">
              <i class="bi bi-check-circle-fill me-2" aria-hidden="true"
              ></i>{exitoPass}
            </div>
          {/if}

          <form on:submit|preventDefault={onCambiarPassword} novalidate>
            <PasswordInput
              id="pass_actual"
              label="Contraseña actual"
              bind:value={passActual}
              disabled={guardandoPass}
              autocomplete="current-password"
              placeholder="Tu contraseña actual"
            />

            <PasswordInput
              id="pass_nueva"
              label="Nueva contraseña"
              bind:value={passNueva}
              disabled={guardandoPass}
              autocomplete="new-password"
              placeholder="Mínimo 6 caracteres"
            />

            <!-- Barra de fortaleza -->
            {#if passNueva.length > 0}
              <div class="mb-3">
                <div
                  class="progress"
                  style="height:4px;"
                  role="progressbar"
                  aria-valuenow={strengthPass.score * 25}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div
                    class="progress-bar {strengthPass.bg}"
                    style="width:{strengthPass.score * 25}%"
                  ></div>
                </div>
                {#if strengthPass.label}
                  <small class="{strengthPass.color} mt-1 d-block">
                    Contraseña {strengthPass.label}
                  </small>
                {/if}
              </div>
            {/if}

            <PasswordInput
              id="pass_confirmar"
              label="Confirmar nueva contraseña"
              bind:value={passConfirmar}
              disabled={guardandoPass}
              autocomplete="new-password"
              placeholder="Repite la nueva contraseña"
              invalid={noCoinciden}
              errorMsg="Las contraseñas no coinciden."
            />

            <div class="mb-3"></div>
            <button
              type="submit"
              class="btn btn-perfil-primary w-100"
              disabled={guardandoPass}
            >
              {#if guardandoPass}
                <span
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>Guardando...
              {:else}
                <i class="bi bi-lock-fill me-2" aria-hidden="true"
                ></i>Actualizar contraseña
              {/if}
            </button>
          </form>
        </div>
      </div>
    </div>
  {:else if tabActivo === "foto"}
    <div class="perfil-card">
      <div class="perfil-card-title">
        <i class="bi bi-camera me-2" aria-hidden="true"></i>Foto de perfil
      </div>
      <p class="text-muted small mb-4">
        Sube tu propia foto o elige un avatar. Formatos: JPG, PNG, WEBP · Máx 2
        MB.
      </p>

      <!-- Foto actual -->
      <div class="d-flex align-items-center gap-3 mb-4 flex-wrap">
        {#if fotoUrl}
          <img src={fotoUrl} alt="Foto actual" class="foto-perfil-actual" />
          <div>
            <p
              class="small fw-semibold mb-1"
              style="color:var(--success,#16a34a)"
            >
              <i class="bi bi-check-circle me-1"></i>Foto de perfil activa
            </p>
            <button
              class="btn-danger-sm"
              on:click={onQuitarFoto}
              disabled={subiendoFoto}
            >
              <i class="bi bi-trash me-1" aria-hidden="true"></i>Quitar foto
            </button>
          </div>
        {:else}
          <div class="foto-perfil-placeholder">{iniciales()}</div>
          <p class="text-muted small mb-0">Sin foto de perfil</p>
        {/if}
      </div>

      {#if errorFoto}
        <div class="alert perfil-alert-error mb-3" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"
          ></i>
          {errorFoto}
        </div>
      {/if}

      <!-- Subir foto propia -->
      <div class="mb-4">
        <p class="small fw-semibold mb-2">
          <i class="bi bi-upload me-1" aria-hidden="true"></i>
          Subir foto propia
        </p>
        <FileUpload
          accept="image/jpeg,image/png,image/webp"
          maxMb={2}
          label="Haz clic o arrastra tu foto aquí"
          hint="JPG, PNG o WEBP · Máx 2 MB"
          preview={true}
          previewUrl={fotoUrl ?? ""}
          uploading={subiendoFoto}
          on:select={onSeleccionarFoto}
          on:clear={() => {}}
        />
      </div>

      <!-- Avatares predefinidos -->
      <div>
        <p class="small fw-semibold mb-3">
          <i class="bi bi-stars me-1" aria-hidden="true"></i>
          O elige un avatar predefinido
        </p>
        <div class="avatares-grid">
          {#each AVATARES as av}
            <button
              class="avatar-opcion"
              on:click={() => onSeleccionarAvatar(av.url)}
              disabled={subiendoFoto}
              title="Usar este avatar"
              aria-label="Avatar {av.id}"
            >
              {#if subiendoFoto}
                <span
                  class="spinner-border spinner-border-sm text-primary"
                  role="status"
                  aria-hidden="true"
                ></span>
              {:else}
                <img src={av.url} alt="Avatar {av.id}" width="52" height="52" />
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>
    <!-- TAB: Sesiones -->
  {:else if tabActivo === "sesiones"}
    <div class="perfil-card">
      <div class="perfil-card-title">
        <i class="bi bi-laptop me-2" aria-hidden="true"></i>Sesiones activas
      </div>
      <p class="text-muted small mb-4">
        Dispositivos donde tu cuenta está actualmente conectada.
      </p>

      {#if cargandoSesiones}
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="text-muted mt-3 small">Cargando sesiones...</p>
        </div>
      {:else if sesiones.length === 0}
        <div class="perfil-empty">
          <i class="bi bi-laptop display-5 text-muted mb-3" aria-hidden="true"
          ></i>
          <p class="text-muted">No se encontraron sesiones activas.</p>
        </div>
      {:else}
        <div class="sesiones-lista">
          {#each sesiones as s}
            <div class="sesion-item {s.activa ? 'sesion-activa' : ''}">
              <div class="sesion-icon">
                <i
                  class="bi bi-{s.dispositivo?.toLowerCase().includes('mobile')
                    ? 'phone'
                    : 'laptop'}"
                  aria-hidden="true"
                ></i>
              </div>
              <div class="sesion-info">
                <div class="sesion-device">{formatDevice(s)}</div>
                <div class="sesion-meta">
                  {#if s.ip_address}<span>{s.ip_address}</span> ·
                  {/if}
                  <span
                    >Último uso: {formatFecha(s.fecha_ultimo_uso, {
                      hora: true,
                    })}</span
                  >
                </div>
                {#if s.ubicacion}
                  <div class="sesion-ubicacion">
                    <i class="bi bi-geo-alt me-1" aria-hidden="true"
                    ></i>{s.ubicacion}
                  </div>
                {/if}
              </div>
              <div class="sesion-estado">
                {#if s.activa}
                  <span class="sesion-badge-activa">
                    <i
                      class="bi bi-circle-fill me-1"
                      style="font-size:.5rem"
                      aria-hidden="true"
                    ></i>
                    Activa
                  </span>
                {:else}
                  <span class="sesion-badge-inactiva">Inactiva</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
