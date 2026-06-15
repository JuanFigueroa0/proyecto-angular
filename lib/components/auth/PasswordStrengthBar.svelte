<script>
  export let strength = { score: 0, label: "", bg: "", color: "" };
  export let value = "";
  /** Si es true muestra los checks de requisitos (para reset-password) */
  export let showChecks = false;
</script>

{#if value.length > 0}
  <div class="mb-3">
    <div
      class="progress"
      style="height:4px;"
      role="progressbar"
      aria-label="Fortaleza de contraseña"
      aria-valuenow={strength.score * 25}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="progress-bar {strength.bg}"
        style="width:{strength.score * 25}%"
      ></div>
    </div>
    {#if strength.label}
      <small class="{strength.color} mt-1 d-block">
        Contraseña {strength.label}
      </small>
    {/if}

    {#if showChecks}
      <div class="d-flex flex-wrap gap-2 mt-2">
        {#each [{ test: value.length >= 6, label: "6+ caracteres" }, { test: /[A-Z]/.test(value), label: "Mayúscula" }, { test: /[a-z]/.test(value), label: "Minúscula" }, { test: /\d/.test(value), label: "Número" }, { test: /[@$!%*?&_\-.]/.test(value), label: "Especial (@$!%*?&_-.)" }] as req}
          <small class={req.test ? "text-success" : "text-muted"}>
            <i
              class="bi {req.test ? 'bi-check-circle-fill' : 'bi-circle'}"
              aria-hidden="true"
            ></i>
            {req.label}
          </small>
        {/each}
      </div>
    {/if}
  </div>
{:else}
  <div class="mb-3"></div>
{/if}
