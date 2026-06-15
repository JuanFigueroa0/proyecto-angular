<!-- src/routes/auth/login/+page.svelte -->
<script>
  import { login } from "$lib/js/interfaces/auth.js";
  import { api } from "$lib/js/api/client.js";
  import "$lib/styles/auth.css";
  import AuthLayout from "$lib/components/auth/AuthLayout.svelte";
  import AuthHeader from "$lib/components/auth/AuthHeader.svelte";
  import AuthAlert from "$lib/components/auth/AuthAlert.svelte";
  import PasswordInput from "$lib/components/auth/PasswordInput.svelte";

  let correo = "";
  let contrasena = "";
  let cargando = false;
  let error = "";
  let correoSinValidar = false;

  // Estado unificado para cuenta inactiva/eliminada
  let cuentaProblema = false; // true cuando hay que mostrar el bloque de reactivación
  let tipoCuentaProblema = ""; // "inactiva" | "eliminada"
  let reactivando = false;
  let exitoReactivacion = "";
  let errorReactivacion = "";

  const MSG_SIN_VALIDAR =
    "por favor valida tu correo electrónico antes de iniciar sesión";

  async function onSubmit(e) {
    e.preventDefault();
    error = "";
    correoSinValidar = false;
    cuentaProblema = false;
    tipoCuentaProblema = "";
    exitoReactivacion = "";
    errorReactivacion = "";
    cargando = true;

    const r = await login({ correo, contrasena });
    cargando = false;

    if (r.ok) {
      window.location.href = "/app/dashboard";
      return;
    }

    // ── Detectar cuenta inactiva (409 con codigo CUENTA_INACTIVA) ──
    if (r.codigo === "CUENTA_INACTIVA") {
      cuentaProblema = true;
      tipoCuentaProblema = "inactiva";
      return;
    }

    // ── Detectar cuenta eliminada (409 con codigo CUENTA_ELIMINADA) ──
    if (r.codigo === "CUENTA_ELIMINADA") {
      cuentaProblema = true;
      tipoCuentaProblema = "eliminada";
      return;
    }

    // ── Correo sin validar ──
    correoSinValidar =
      typeof r.error === "string" &&
      r.error.toLowerCase().includes(MSG_SIN_VALIDAR);

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
        "Error al reactivar.";
    }
  }

  function onCancelar() {
    cuentaProblema = false;
    tipoCuentaProblema = "";
    correo = "";
    contrasena = "";
  }
</script>

<svelte:head><title>EcclesiaSys – Iniciar sesión</title></svelte:head>

<AuthLayout quote="La tecnología al servicio de la fe y la comunidad">
  <AuthHeader titulo="Iniciar sesión" subtitulo="Ingresa a tu cuenta" />

  <!-- Alerta correo sin validar -->
  {#if correoSinValidar}
    <AuthAlert tipo="error" mensaje={error}>
      <div
        class="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-2"
      >
        <small>¿No recibiste el correo o expiró?</small>

        <a
          href="/auth/verify-email"
          class="btn btn-sm btn-outline-danger"
          style="font-size:.8rem;padding:.25rem .75rem;border-radius:6px;"
        >
          <i class="bi bi-envelope-arrow-up me-1" aria-hidden="true"></i>
          Reenviar correo
        </a>
      </div>
    </AuthAlert>
  {:else if error && !cuentaProblema}
    <AuthAlert tipo="error" mensaje={error} />
  {/if}

  <!-- Bloque unificado: cuenta inactiva o eliminada -->
  {#if cuentaProblema}
    <div class="cuenta-eliminada-box">
      <div class="ce-icon">
        <i
          class={tipoCuentaProblema === "inactiva"
            ? "bi bi-person-x"
            : "bi bi-person-slash"}
          aria-hidden="true"
        ></i>
      </div>

      <h4 class="ce-titulo">
        {tipoCuentaProblema === "inactiva"
          ? "Cuenta inactiva"
          : "Cuenta eliminada"}
      </h4>

      <p class="ce-msg">
        La cuenta <strong>{correo}</strong>
        {tipoCuentaProblema === "inactiva"
          ? "está inactiva."
          : "fue eliminada anteriormente."}
      </p>

      <p class="ce-submsg">
        {tipoCuentaProblema === "inactiva"
          ? "Puedes reactivarla: recibirás un correo de verificación y luego podrás iniciar sesión normalmente."
          : "Puedes reactivarla: recibirás un correo de verificación y luego podrás restablecer tu contraseña."}
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
        {#if tipoCuentaProblema === "eliminada"}
          <a href="/auth/forgot-password" class="btn btn-ecclesia w-100 mt-3">
            <i class="bi bi-lock me-2" aria-hidden="true"></i>
            Restablecer contraseña
          </a>
        {:else}
          <!-- Cuenta inactiva reactivada: ya puede intentar login -->
          <button class="btn btn-ecclesia w-100 mt-3" on:click={onCancelar}>
            <i class="bi bi-box-arrow-in-right me-2" aria-hidden="true"></i>
            Volver al inicio de sesión
          </button>
        {/if}
      {:else}
        <div class="d-flex gap-2 mt-3">
          <button
            class="btn btn-outline-secondary flex-1"
            on:click={onCancelar}
            disabled={reactivando}
          >
            Cancelar
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

  <!-- Formulario — se oculta si hay problema de cuenta -->
  {#if !cuentaProblema}
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
        autocomplete="current-password"
      >
        <svelte:fragment slot="label-right">
          <a href="/auth/forgot-password" class="auth-link">
            ¿Olvidaste tu contraseña?
          </a>
        </svelte:fragment>
      </PasswordInput>

      <div class="mb-4"></div>

      <button type="submit" class="btn btn-ecclesia w-100" disabled={cargando}>
        {#if cargando}
          <span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>Verificando...
        {:else}
          Iniciar sesión
        {/if}
      </button>
    </form>
  {/if}

  <div class="auth-or my-4">o</div>
  <div class="text-center">
    <span class="small text-muted">¿No tienes cuenta?</span>
    <a href="/auth/register" class="auth-link fw-semibold ms-1">Regístrate</a>
  </div>
</AuthLayout>
