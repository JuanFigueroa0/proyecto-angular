<script>
  export let id = "password";
  export let label = "Contraseña";
  export let value = "";
  export let placeholder = "••••••••";
  export let disabled = false;
  export let autocomplete = "current-password";
  export let invalid = false;
  export let errorMsg = "";

  let ver = false;
</script>

<div class="mb-3">
  {#if label}
    <div class="d-flex justify-content-between align-items-center mb-1">
      <label for={id} class="form-label fw-semibold small mb-0">{label}</label>
      <slot name="label-right" />
    </div>
  {/if}

  <div class="input-group">
    <span class="input-group-text auth-input-icon">
      <i class="bi bi-lock" aria-hidden="true"></i>
    </span>
    <input
      {id}
      type={ver ? "text" : "password"}
      class="form-control auth-input {invalid ? 'is-invalid' : ''}"
      {placeholder}
      bind:value
      {disabled}
      {autocomplete}
      required
    />
    <button
      type="button"
      class="btn btn-toggle-pass"
      on:click={() => (ver = !ver)}
      aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
    >
      <i class="bi {ver ? 'bi-eye-slash' : 'bi-eye'}" aria-hidden="true"></i>
    </button>
  </div>

  {#if invalid && errorMsg}
    <div class="text-danger small mt-1">{errorMsg}</div>
  {/if}
</div>
