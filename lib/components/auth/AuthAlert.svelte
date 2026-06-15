<script>
  export let tipo = "error";
  export let mensaje = "";
  export let extra = "";

  const cfg = {
    error: { cls: "auth-alert-error", icon: "bi-exclamation-triangle-fill" },
    success: { cls: "auth-alert-success", icon: "bi-check-circle-fill" },
    info: { cls: "auth-alert-info", icon: "bi-info-circle" },
  };

  $: c = cfg[tipo] ?? cfg.error;
</script>

{#if mensaje}
  <div class="alert {c.cls} d-flex align-items-start gap-2 mb-3" role="alert">
    <i class="bi {c.icon} mt-1 flex-shrink-0" aria-hidden="true"></i>
    <div class="w-100">
      <span>{mensaje}</span>
      {#if extra}
        <hr class="my-2" />
        <p class="mb-0 small">{extra}</p>
      {/if}
      <slot />
    </div>
  </div>
{/if}
