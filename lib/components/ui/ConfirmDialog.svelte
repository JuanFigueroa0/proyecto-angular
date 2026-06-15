<!-- src/lib/components/ui/ConfirmDialog.svelte -->
<script>
  import "$lib/styles/ui/confirmDialog.css";
  import { createEventDispatcher } from "svelte";

  export let abierto = false;
  export let titulo = "Confirmar acción";
  export let mensaje = "¿Estás seguro de continuar?";
  export let detalle = ""; // texto secundario opcional
  export let tipo = "danger"; // 'danger' | 'warning' | 'primary'
  export let txtOk = "Confirmar";
  export let txtCancel = "Cancelar";
  export let cargando = false;

  const dispatch = createEventDispatcher();

  const CFG = {
    danger: {
      icon: "bi-exclamation-triangle-fill",
      bg: "rgba(239,68,68,.1)",
      color: "#dc2626",
      btnClass: "btn-confirm-danger",
    },
    warning: {
      icon: "bi-exclamation-circle-fill",
      bg: "rgba(234,179,8,.1)",
      color: "#b45309",
      btnClass: "btn-confirm-warning",
    },
    primary: {
      icon: "bi-info-circle-fill",
      bg: "rgba(42,82,152,.1)",
      color: "var(--primary-light)",
      btnClass: "btn-confirm-primary",
    },
  };

  $: cfg = CFG[tipo] ?? CFG.danger;

  function onConfirmar() {
    if (cargando) return;
    dispatch("confirmar");
  }

  function onCancelar() {
    if (cargando) return;
    dispatch("cancelar");
    abierto = false;
  }

  function onKey(e) {
    if (!abierto) return;
    if (e.key === "Escape") onCancelar();
    if (e.key === "Enter") onConfirmar();
  }
</script>

<svelte:window on:keydown={onKey} />

{#if abierto}
  <!-- Overlay -->
  <div class="cd-overlay" on:click={onCancelar} aria-hidden="true"></div>

  <!-- Caja del diálogo -->
  <div
    class="cd-box"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cd-titulo"
  >
    <!-- Ícono + título -->
    <div class="cd-header">
      <div class="cd-icon" style="background:{cfg.bg};color:{cfg.color}">
        <i class="bi {cfg.icon}" aria-hidden="true"></i>
      </div>
      <h3 class="cd-titulo" id="cd-titulo">{titulo}</h3>
    </div>

    <!-- Mensaje -->
    <p class="cd-mensaje">{mensaje}</p>
    {#if detalle}
      <p class="cd-detalle">{detalle}</p>
    {/if}

    <!-- Acciones -->
    <div class="cd-acciones">
      <button class="cd-btn-cancelar" on:click={onCancelar} disabled={cargando}>
        {txtCancel}
      </button>
      <button
        class="cd-btn-ok {cfg.btnClass}"
        on:click={onConfirmar}
        disabled={cargando}
      >
        {#if cargando}
          <span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          Procesando...
        {:else}
          {txtOk}
        {/if}
      </button>
    </div>
  </div>
{/if}
