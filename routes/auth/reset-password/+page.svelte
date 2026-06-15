<!-- src/routes/auth/reset-password/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import {
    verificarTokenReset,
    resetPasswordConfirm,
    passwordStrength,
  } from "$lib/js/interfaces/auth.js";
  import "$lib/styles/auth.css";
  import AuthLayout from "$lib/components/auth/AuthLayout.svelte";
  import AuthHeader from "$lib/components/auth/AuthHeader.svelte";
  import AuthAlert from "$lib/components/auth/AuthAlert.svelte";
  import PasswordInput from "$lib/components/auth/PasswordInput.svelte";
  import PasswordStrengthBar from "$lib/components/auth/PasswordStrengthBar.svelte";

  let estado = "verificando";
  let token = "";
  let contrasena_nueva = "";
  let confirmar_contrasena = "";
  let cargando = false;
  let error = "";

  $: strength = passwordStrength(contrasena_nueva);
  $: noCoinciden =
    confirmar_contrasena.length > 0 &&
    contrasena_nueva !== confirmar_contrasena;

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    token = params.get("token") ?? "";
    if (!token) {
      estado = "token_invalido";
      return;
    }
    const r = await verificarTokenReset(token);
    if (r.ok) estado = "formulario";
    else {
      estado = "token_invalido";
      error = r.error;
    }
  });

  async function onSubmit(e) {
    e.preventDefault();
    error = "";
    if (!strength.esValida) {
      error =
        "La contraseña debe tener mayúscula, minúscula, número y carácter especial (@$!%*?&_-.).";
      return;
    }
    if (contrasena_nueva !== confirmar_contrasena) {
      error = "Las contraseñas no coinciden.";
      return;
    }
    cargando = true;
    const r = await resetPasswordConfirm({
      token,
      contrasena_nueva,
      confirmar_contrasena,
    });
    cargando = false;
    if (r.ok) estado = "exito";
    else error = r.error;
  }
</script>

<svelte:head><title>EcclesiaSys – Nueva contraseña</title></svelte:head>

<AuthLayout quote="Establece una nueva contraseña segura">
  {#if estado === "verificando"}
    <div class="text-center py-5">
      <div
        class="spinner-border text-primary mb-3"
        role="status"
        style="width:3rem;height:3rem;"
      >
        <span class="visually-hidden">Verificando enlace...</span>
      </div>
      <p class="text-muted">Verificando enlace de recuperación...</p>
    </div>
  {:else if estado === "token_invalido"}
    <div class="text-center">
      <span class="verify-icon text-danger mb-2" aria-hidden="true">✕</span>
      <h2 class="auth-form-title mt-2">Enlace inválido</h2>
      <p class="text-muted small mb-4">
        {error || "El enlace expiró o ya fue usado."}
      </p>
      <a href="/auth/forgot-password" class="btn btn-ecclesia w-100 mb-3"
        >Solicitar nuevo enlace</a
      >
      <a href="/auth/login" class="auth-link small d-block"
        >← Volver al inicio de sesión</a
      >
    </div>
  {:else if estado === "formulario"}
    <AuthHeader
      titulo="Nueva contraseña"
      subtitulo="Elige una contraseña segura"
    />
    <AuthAlert tipo="error" mensaje={error} />

    <form on:submit={onSubmit} novalidate>
      <PasswordInput
        id="contrasena_nueva"
        label="Nueva contraseña"
        bind:value={contrasena_nueva}
        disabled={cargando}
        autocomplete="new-password"
        placeholder="Mínimo 6 caracteres"
      />
      <PasswordStrengthBar
        {strength}
        value={contrasena_nueva}
        showChecks={true}
      />

      <PasswordInput
        id="confirmar_contrasena"
        label="Confirmar contraseña"
        bind:value={confirmar_contrasena}
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
          ></span>Guardando...
        {:else}
          Establecer nueva contraseña
        {/if}
      </button>
    </form>
  {:else if estado === "exito"}
    <div class="text-center">
      <span class="verify-icon text-success mb-2" aria-hidden="true">✓</span>
      <h2 class="auth-form-title mt-2">¡Contraseña actualizada!</h2>
      <p class="text-muted small mb-4">
        Tu contraseña fue cambiada exitosamente.
      </p>
      <a href="/auth/login" class="btn btn-ecclesia w-100">Iniciar sesión</a>
    </div>
  {/if}

  <div class="text-center mt-4">
    <a href="/auth/login" class="auth-link small"
      >← Volver al inicio de sesión</a
    >
  </div>
</AuthLayout>
