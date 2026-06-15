<!-- src/lib/components/ui/Toast.svelte -->
<script>
  import { toasts, removeToast } from "$lib/js/stores/ui.js";
  import "$lib/styles/ui/toast.css";
  const ICONS = {
    success: "bi-check-circle-fill",
    error: "bi-x-circle-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill",
    loading: "bi-arrow-repeat",
  };

  const COLORS = {
    success: {
      bg: "#f0fff4",
      border: "#9ae6b4",
      icon: "#38a169",
      title: "#276749",
    },
    error: {
      bg: "#fff5f5",
      border: "#fed7d7",
      icon: "#e53e3e",
      title: "#c53030",
    },
    warning: {
      bg: "#fffbeb",
      border: "#fbd38d",
      icon: "#d69e2e",
      title: "#b7791f",
    },
    info: {
      bg: "#ebf8ff",
      border: "#90cdf4",
      icon: "#3182ce",
      title: "#2b6cb0",
    },
    loading: {
      bg: "#f7fafc",
      border: "#e2e8f0",
      icon: "#4a5568",
      title: "#2d3748",
    },
  };
</script>

<div class="toast-container" aria-live="polite" aria-atomic="false">
  {#each $toasts as t (t.id)}
    {@const c = COLORS[t.tipo] ?? COLORS.info}
    {@const icon = ICONS[t.tipo] ?? ICONS.info}

    <div
      class="toast-item"
      style="
        background:{c.bg};
        border:1.5px solid {c.border};
      "
      role="alert"
    >
      <!-- Ícono -->
      <div class="toast-icon" style="color:{c.icon}">
        <i
          class="bi {icon} {t.tipo === 'loading' ? 'toast-spin' : ''}"
          aria-hidden="true"
        ></i>
      </div>

      <!-- Contenido -->
      <div class="toast-body">
        {#if t.titulo}
          <div class="toast-titulo" style="color:{c.title}">{t.titulo}</div>
        {/if}
        <div class="toast-mensaje" style="color:{c.title}">{t.mensaje}</div>
      </div>

      <!-- Cerrar (no mostrar en loading) -->
      {#if t.tipo !== "loading"}
        <button
          class="toast-close"
          on:click={() => removeToast(t.id)}
          aria-label="Cerrar notificación"
          style="color:{c.icon}"
        >
          <i class="bi bi-x" aria-hidden="true"></i>
        </button>
      {/if}

      <!-- Barra de progreso (no en loading) -->
      {#if t.tipo !== "loading"}
        <div class="toast-progress" style="background:{c.border}"></div>
      {/if}
    </div>
  {/each}
</div>
