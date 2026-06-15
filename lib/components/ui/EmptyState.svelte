<!-- src/lib/components/ui/EmptyState.svelte -->
<script>
  export let icon = "bi-inbox";
  export let titulo = "Sin resultados";
  export let descripcion = "";
</script>

<div class="empty-wrap">
  <div class="empty-icon">
    <i class="bi {icon}" aria-hidden="true"></i>
  </div>
  <div class="empty-titulo">{titulo}</div>
  {#if descripcion}
    <div class="empty-desc">{descripcion}</div>
  {/if}
  <slot />
</div>

<style>
  .empty-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3.5rem 1rem;
    text-align: center;
  }
  .empty-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    color: #94a3b8;
    margin-bottom: 1rem;
  }
  .empty-titulo {
    font-weight: 700;
    font-size: 1rem;
    color: var(--text-primary);
    margin-bottom: 0.35rem;
  }
  .empty-desc {
    font-size: 0.875rem;
    color: var(--text-muted);
    max-width: 340px;
  }
</style>
