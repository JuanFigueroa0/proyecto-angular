<!-- src/routes/auth/forgot-password/+page.svelte -->
<script>
  import { forgotPassword } from "$lib/js/interfaces/auth.js";
  import "$lib/styles/auth.css";
  import AuthLayout from "$lib/components/auth/AuthLayout.svelte";
  import AuthHeader from "$lib/components/auth/AuthHeader.svelte";
  import AuthAlert from "$lib/components/auth/AuthAlert.svelte";

  let correo = "";
  let cargando = false;
  let error = "";
  let exito = "";

  async function onSubmit(e) {
    e.preventDefault();
    error = "";
    exito = "";
    cargando = true;
    const r = await forgotPassword(correo);
    cargando = false;
    if (r.ok) exito = r.mensaje;
    else error = r.error;
  }
</script>

<svelte:head><title>EcclesiaSys – Recuperar contraseña</title></svelte:head>

<AuthLayout quote="Recupera el acceso a tu cuenta">
  {#if exito}
    <div class="text-center">
      <AuthAlert
        tipo="success"
        mensaje={exito}
        extra="Revisa tu bandeja de entrada. El enlace expira en 30 minutos."
      />
      <a href="/auth/login" class="btn btn-ecclesia w-100"
        >Volver al inicio de sesión</a
      >
    </div>
  {:else}
    <AuthHeader
      titulo="Recuperar contraseña"
      subtitulo="Te enviaremos un enlace a tu correo"
    />
    <AuthAlert tipo="error" mensaje={error} />

    <form on:submit={onSubmit} novalidate>
      <div class="mb-4">
        <label for="correo" class="form-label fw-semibold small"
          >Correo electrónico</label
        >
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
        <div class="form-text small text-muted mt-1">
          Ingresa el correo con el que te registraste.
        </div>
      </div>

      <button type="submit" class="btn btn-ecclesia w-100" disabled={cargando}>
        {#if cargando}
          <span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>Enviando...
        {:else}
          Enviar enlace de recuperación
        {/if}
      </button>
    </form>
  {/if}

  <div class="text-center mt-4">
    <a href="/auth/login" class="auth-link small"
      >← Volver al inicio de sesión</a
    >
  </div>
</AuthLayout>
