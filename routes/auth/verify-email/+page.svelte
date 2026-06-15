<!-- src/routes/auth/verify-email/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import {
    validarEmailGet,
    validarEmailPost,
    reenviarValidacion,
  } from "$lib/js/interfaces/auth.js";
  import "$lib/styles/auth.css";
  import AuthLayout from "$lib/components/auth/AuthLayout.svelte";
  import AuthHeader from "$lib/components/auth/AuthHeader.svelte";
  import AuthAlert from "$lib/components/auth/AuthAlert.svelte";

  let estado = "verificando";
  let mensaje = "";
  let error = "";
  let correoReenvio = "";
  let cargandoReenvio = false;
  let exitoReenvio = "";
  let errorReenvio = "";
  let tokenManual = "";
  let cargandoManual = false;

  // Detectar si viene de un flujo de reactivación
  let esReactivacion = false;

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const correoParam = params.get("correo");
    const tipo = params.get("tipo");

    esReactivacion = tipo === "reactivacion";
    if (correoParam) correoReenvio = correoParam;

    if (token) {
      const r = await validarEmailGet(token);
      if (r.ok) {
        estado = "exito";
        mensaje =
          r.mensaje ??
          (esReactivacion
            ? "¡Tu cuenta ha sido reactivada exitosamente!"
            : "¡Correo verificado exitosamente!");
      } else {
        estado = "error";
        error = r.error ?? "Token inválido o expirado.";
      }
    } else {
      estado = "manual";
    }
  });

  async function onSubmitManual(e) {
    e.preventDefault();
    if (!tokenManual.trim()) {
      error = "Debes ingresar el código.";
      return;
    }
    error = "";
    cargandoManual = true;
    const r = await validarEmailPost(tokenManual.trim());
    cargandoManual = false;
    if (r.ok) {
      estado = "exito";
      mensaje = r.mensaje;
    } else {
      error = r.error;
    }
  }

  async function onReenviar(e) {
    e.preventDefault();
    if (!correoReenvio.trim()) {
      errorReenvio = "Debes ingresar tu correo.";
      return;
    }
    errorReenvio = "";
    exitoReenvio = "";
    cargandoReenvio = true;
    const r = await reenviarValidacion(correoReenvio.trim());
    cargandoReenvio = false;
    if (r.ok) exitoReenvio = r.mensaje;
    else errorReenvio = r.error;
  }
</script>

<svelte:head>
  <title
    >EcclesiaSys – {esReactivacion
      ? "Reactivación de cuenta"
      : "Verificar correo"}</title
  >
</svelte:head>

<AuthLayout
  quote={esReactivacion
    ? "Bienvenido de nuevo a nuestra comunidad"
    : "Verificando tu identidad digital"}
>
  <!-- ── CARGANDO ── -->
  {#if estado === "verificando"}
    <div class="text-center py-5">
      <span
        class="spinner-border text-primary mb-3"
        role="status"
        style="width:3rem;height:3rem;"
      >
        <span class="visually-hidden">Verificando...</span>
      </span>
      <p class="text-muted">
        {esReactivacion
          ? "Reactivando tu cuenta..."
          : "Verificando tu correo electrónico..."}
      </p>
    </div>

    <!-- ── ÉXITO ── -->
  {:else if estado === "exito"}
    <div class="verify-result-box verify-result-box--success text-center">
      <div class="vrb-icon vrb-icon--success">
        <i
          class="bi bi-{esReactivacion
            ? 'person-check-fill'
            : 'envelope-check-fill'}"
          aria-hidden="true"
        ></i>
      </div>

      <h2 class="vrb-titulo">
        {esReactivacion ? "¡Cuenta reactivada!" : "¡Correo verificado!"}
      </h2>

      <p class="vrb-mensaje">{mensaje}</p>

      {#if esReactivacion}
        <!-- Reactivación: ofrecer login Y opción de recuperar contraseña -->
        <p class="vrb-submsg">
          Ahora puedes iniciar sesión. Si no recuerdas tu contraseña, usa la
          opción <strong>"Olvidé mi contraseña"</strong>.
        </p>
        <div class="d-flex flex-column gap-2 mt-4">
          <a href="/auth/login" class="btn btn-ecclesia w-100">
            <i class="bi bi-box-arrow-in-right me-2" aria-hidden="true"></i>
            Iniciar sesión
          </a>
          <a
            href="/auth/forgot-password"
            class="btn btn-outline-secondary w-100"
          >
            <i class="bi bi-lock me-2" aria-hidden="true"></i>
            Olvidé mi contraseña
          </a>
        </div>
      {:else}
        <!-- Verificación normal: solo login -->
        <p class="vrb-submsg">
          Tu cuenta está activa. Ya puedes acceder al sistema.
        </p>
        <a href="/auth/login" class="btn btn-ecclesia w-100 mt-4">
          <i class="bi bi-box-arrow-in-right me-2" aria-hidden="true"></i>
          Iniciar sesión
        </a>
      {/if}
    </div>

    <!-- ── ERROR DE TOKEN ── -->
  {:else if estado === "error"}
    <div class="verify-result-box verify-result-box--error text-center mb-4">
      <div class="vrb-icon vrb-icon--error">
        <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
      </div>
      <h2 class="vrb-titulo">Enlace inválido</h2>
      <p class="vrb-mensaje">{error}</p>
      <p class="vrb-submsg">
        El enlace puede haber expirado o ya fue utilizado. Solicita uno nuevo
        ingresando tu correo.
      </p>
    </div>

    <!-- Reenvío inline -->
    <form on:submit={onReenviar} novalidate>
      <div class="mb-3">
        <label for="correoReenvioErr" class="form-label fw-semibold small">
          Tu correo electrónico
        </label>
        <div class="input-group">
          <span class="input-group-text auth-input-icon">
            <i class="bi bi-envelope" aria-hidden="true"></i>
          </span>
          <input
            id="correoReenvioErr"
            type="email"
            class="form-control auth-input"
            placeholder="correo@parroquia.com"
            bind:value={correoReenvio}
            disabled={cargandoReenvio}
            required
          />
        </div>
      </div>
      <AuthAlert tipo="error" mensaje={errorReenvio} />
      <AuthAlert tipo="success" mensaje={exitoReenvio} />
      <button
        type="submit"
        class="btn btn-ecclesia w-100"
        disabled={cargandoReenvio}
      >
        {#if cargandoReenvio}
          <span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
        {/if}
        Reenviar correo de verificación
      </button>
    </form>

    <!-- ── MANUAL (sin token en URL) ── -->
  {:else if estado === "manual"}
    <AuthHeader
      titulo="Verificar correo"
      subtitulo="Ingresa el código que recibiste por correo"
    />
    <AuthAlert tipo="error" mensaje={error} />

    <form on:submit={onSubmitManual} novalidate>
      <div class="mb-4">
        <label for="tokenManual" class="form-label fw-semibold small">
          Código de verificación
        </label>
        <div class="input-group">
          <span class="input-group-text auth-input-icon">
            <i class="bi bi-key" aria-hidden="true"></i>
          </span>
          <input
            id="tokenManual"
            type="text"
            class="form-control auth-input"
            placeholder="Pega aquí tu código"
            bind:value={tokenManual}
            disabled={cargandoManual}
            required
          />
        </div>
      </div>
      <button
        type="submit"
        class="btn btn-ecclesia w-100"
        disabled={cargandoManual}
      >
        {#if cargandoManual}
          <span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          Verificando...
        {:else}
          Verificar correo
        {/if}
      </button>
    </form>

    <hr class="my-4" />
    <p class="text-center text-muted small mb-3">¿No recibiste el correo?</p>

    <form on:submit={onReenviar} novalidate>
      <div class="mb-3">
        <label for="correoReenvio2" class="form-label fw-semibold small">
          Tu correo electrónico
        </label>
        <div class="input-group">
          <span class="input-group-text auth-input-icon">
            <i class="bi bi-envelope" aria-hidden="true"></i>
          </span>
          <input
            id="correoReenvio2"
            type="email"
            class="form-control auth-input"
            placeholder="ejemplo@gmail.com"
            bind:value={correoReenvio}
            disabled={cargandoReenvio}
            required
          />
        </div>
      </div>
      <AuthAlert tipo="error" mensaje={errorReenvio} />
      <AuthAlert tipo="success" mensaje={exitoReenvio} />
      <button
        type="submit"
        class="btn btn-outline-secondary w-100"
        disabled={cargandoReenvio}
      >
        {#if cargandoReenvio}
          <span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
        {/if}
        Reenviar correo de verificación
      </button>
    </form>
  {/if}

  <div class="text-center mt-4">
    <a href="/auth/login" class="auth-link small">
      <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
      Volver al inicio de sesión
    </a>
  </div>
</AuthLayout>
