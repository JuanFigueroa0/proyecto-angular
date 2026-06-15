<!-- src/lib/components/layout/AppLayout.svelte -->
<script>
  import Sidebar from "$lib/components/layout/Sidebar.svelte";
  import Topbar from "$lib/components/layout/Topbar.svelte";
  import Toast from "$lib/components/ui/Toast.svelte";
  import { sidebarCollapsed } from "$lib/js/stores/ui.js";
</script>

<div class="app-shell {$sidebarCollapsed ? 'sidebar-is-collapsed' : ''}">
  <Sidebar />
  <div class="app-main">
    <Topbar />
    <main class="app-content">
      <slot />
    </main>
  </div>
</div>

<Toast />

<style>
  .app-shell {
    display: flex;
    min-height: 100vh;
  }

  .app-main {
    flex: 1;
    margin-left: var(--sidebar-width);
    display: flex;
    flex-direction: column;
    min-width: 0;
    transition: margin-left var(--transition);
  }

  .app-shell.sidebar-is-collapsed .app-main {
    margin-left: var(--sidebar-collapsed);
  }

  .app-content {
    flex: 1;
    background: var(--bg-app);
    overflow-y: auto;
  }

  @media (max-width: 991.98px) {
    .app-main {
      margin-left: 0 !important;
    }
  }
</style>
