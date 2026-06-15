<!-- src/lib/components/ui/SearchBar.svelte -->
<script>
  export let value = "";
  export let placeholder = "Buscar...";
  export let disabled = false;
</script>

<div class="searchbar-wrap">
  <i class="bi bi-search searchbar-icon" aria-hidden="true"></i>
  <input
    type="search"
    class="searchbar-input"
    bind:value
    {placeholder}
    {disabled}
    aria-label={placeholder}
  />
  {#if value}
    <button
      class="searchbar-clear"
      on:click={() => (value = "")}
      aria-label="Limpiar búsqueda"
      type="button"
    >
      <i class="bi bi-x-lg"></i>
    </button>
  {/if}
</div>

<style>
  .searchbar-wrap {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }
  .searchbar-icon {
    position: absolute;
    left: 0.75rem;
    color: #94a3b8;
    font-size: 0.85rem;
    pointer-events: none;
  }
  .searchbar-input {
    width: 100%;
    padding: 0.45rem 2.2rem 0.45rem 2.1rem;
    border: 1.5px solid #e2e8f0;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    background: #fff;
    color: var(--text-primary);
    outline: none;
    transition: border-color var(--transition);
  }
  .searchbar-input:focus {
    border-color: var(--primary-light);
  }
  .searchbar-input::-webkit-search-cancel-button {
    display: none;
  }
  .searchbar-clear {
    position: absolute;
    right: 0.6rem;
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 0;
    font-size: 0.75rem;
    line-height: 1;
    transition: color var(--transition);
  }
  .searchbar-clear:hover {
    color: var(--primary);
  }
</style>
