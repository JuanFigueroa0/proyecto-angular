<script>
  import { register, passwordStrength } from "$lib/js/interfaces/auth.js";
  import { api } from "$lib/js/api/client.js";
  import "$lib/styles/auth.css";
  import AuthLayout from "$lib/components/auth/AuthLayout.svelte";
  import AuthHeader from "$lib/components/auth/AuthHeader.svelte";
  import AuthAlert from "$lib/components/auth/AuthAlert.svelte";
  import PasswordInput from "$lib/components/auth/PasswordInput.svelte";
  import PasswordStrengthBar from "$lib/components/auth/PasswordStrengthBar.svelte";

  let correo = "";
  let contrasena = "";
  let confirmar = "";
  let cargando = false;
  let error = "";
  let exito = "";

  let cuentaEliminada = false;
  let reactivando = false;
  let exitoReactivacion = "";
  let errorReactivacion = "";

  $: strength = passwordStrength(contrasena);
  $: noCoinciden = confirmar.length > 0 && contrasena !== confirmar;

  async function onSubmit(e) {
    e.preventDefault();
    error = "";
    exito = "";
    cuentaEliminada = false;
    errorReactivacion = "";
    exitoReactivacion = "";

    if (contrasena !== confirmar) {
      error = "Las contraseñas no coinciden.";
      return;
    }
    if (!strength.esValida) {
      error =
        "La contraseña debe incluir mayúscula, minúscula, número y un carácter especial (@$!%*?&_-.)";
      return;
    }

    cargando = true;
    const r = await register({ correo, contrasena });
    cargando = false;

    if (r.ok) {
      exito = r.mensaje;
      correo = "";
      contrasena = "";
      confirmar = "";
      return;
    }

    // Detectar cuenta inactiva
    const codigo = typeof r.detail === "object" ? r.detail?.codigo : null;
    if (codigo === "CUENTA_INACTIVA") {
      cuentaEliminada = true; // reutiliza el mismo estado y bloque visual
      return;
    }

    error = r.error ?? "Error desconocido";
  }

  async function onReactivar() {
    errorReactivacion = "";
    exitoReactivacion = "";
    reactivando = true;
    const r = await api.post(
      "/auth/reactivar-cuenta",
      { correo },
      { auth: false },
    );
    reactivando = false;
    if (r.ok) {
      exitoReactivacion =
        r.data?.mensaje ?? "Cuenta reactivada. Revisa tu correo.";
    } else {
      errorReactivacion =
        (typeof r.detail === "object" ? r.detail?.mensaje : r.detail) ??
        r.error ??
        "Error al reactivar la cuenta.";
    }
  }

  function onNoCuentaEliminada() {
    cuentaEliminada = false;
    correo = "";
    contrasena = "";
    confirmar = "";
  }
</script>

<svelte:head><title>EcclesiaSys – Registro</title></svelte:head>

<AuthLayout quote="Únete a nuestra comunidad digital">
  <AuthHeader
    titulo="Crear cuenta"
    subtitulo="Completa los datos para registrarte"
  />

  <AuthAlert tipo="error" mensaje={error} />
  <AuthAlert
    tipo="success"
    mensaje={exito}
    extra="Revisa tu bandeja de entrada y confirma tu correo para activar la cuenta."
  />

  <!-- Cuenta eliminada -->
  {#if cuentaEliminada}
    <div class="cuenta-eliminada-box">
      <div class="ce-icon">
        <i class="bi bi-person-slash" aria-hidden="true"></i>
      </div>
      <h4 class="ce-titulo">Cuenta eliminada</h4>
      <p class="ce-msg">
        La cuenta <strong>{correo}</strong> fue eliminada anteriormente. ¿Deseas
        reactivarla?
      </p>
      <p class="ce-submsg">
        Se enviará un correo de verificación. Luego podrás establecer una nueva
        contraseña usando "Olvidé mi contraseña".
      </p>

      {#if errorReactivacion}
        <div class="alert auth-alert-error mt-3 mb-0" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"
          ></i>
          {errorReactivacion}
        </div>
      {/if}

      {#if exitoReactivacion}
        <div class="alert auth-alert-success mt-3 mb-0" role="alert">
          <i class="bi bi-check-circle-fill me-2" aria-hidden="true"></i>
          {exitoReactivacion}
        </div>
        <a href="/auth/login" class="btn btn-ecclesia w-100 mt-3">
          Ir al inicio de sesión
        </a>
      {:else}
        <div class="d-flex gap-2 mt-3">
          <button
            class="btn btn-outline-secondary flex-1"
            on:click={onNoCuentaEliminada}
            disabled={reactivando}
          >
            Usar otro correo
          </button>
          <button
            class="btn btn-ecclesia flex-1"
            on:click={onReactivar}
            disabled={reactivando}
          >
            {#if reactivando}
              <span
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>Reactivando...
            {:else}
              <i class="bi bi-person-check me-2" aria-hidden="true"></i>
              Reactivar cuenta
            {/if}
          </button>
        </div>
      {/if}
    </div>
  {/if}

  {#if !exito && !cuentaEliminada}
    <form on:submit={onSubmit} novalidate>
      <div class="mb-3">
        <label for="correo" class="form-label fw-semibold small">
          Correo electrónico
        </label>
        <div class="input-group">
          <span class="input-group-text auth-input-icon">
            <i class="bi bi-envelope" aria-hidden="true"></i>
          </span>
          <input
            id="correo"
            type="email"
            class="form-control auth-input"
            placeholder="ejemplo@gmail.com"
            bind:value={correo}
            disabled={cargando}
            autocomplete="email"
            required
          />
        </div>
      </div>

      <PasswordInput
        id="contrasena"
        label="Contraseña"
        bind:value={contrasena}
        disabled={cargando}
        autocomplete="new-password"
        placeholder="Mínimo 8 caracteres"
      />
      <PasswordStrengthBar {strength} value={contrasena} />

      <PasswordInput
        id="confirmar"
        label="Confirmar contraseña"
        bind:value={confirmar}
        disabled={cargando}
        autocomplete="new-password"
        placeholder="Repite tu contraseña"
        invalid={noCoinciden}
        errorMsg="Las contraseñas no coinciden."
      />

      <div class="mb-4"></div>

      <button type="submit" class="btn btn-ecclesia w-100" disabled={cargando}>
        {#if cargando}
          <span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>Registrando...
        {:else}
          Crear cuenta
        {/if}
      </button>
    </form>
  {/if}

  <div class="auth-or my-4">o</div>
  <div class="text-center">
    <span class="small text-muted">¿Ya tienes cuenta?</span>
    <a href="/auth/login" class="auth-link fw-semibold ms-1">Iniciar sesión</a>
  </div>
</AuthLayout>
