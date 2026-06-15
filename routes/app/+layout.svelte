<!-- src/routes/app/+layout.svelte -->
<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import AppLayout from "$lib/components/layout/AppLayout.svelte";
  import { requiereAuth } from "$lib/js/interfaces/navigation.js";

  onMount(() => {
    // requiereAuth($page.url.pathname);  // DESHABILITADO: permitir acceso sin login
  });
</script>

<AppLayout>
  <slot />
</AppLayout>
