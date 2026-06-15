import { onMount } from "svelte";
import { page } from "$app/stores";
import { goto } from "$app/navigation";
import { isAuthenticated } from "$lib/js/api/client.js";

// Rutas que NO requieren autenticación
const RUTAS_PUBLICAS = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/app", // PERMITIR ACCESO A TODAS LAS RUTAS DEL APP SIN LOGIN
];

function esPublica(ruta) {
  return RUTAS_PUBLICAS.some((p) => ruta === p || ruta.startsWith(p + "?"));
}

onMount(() => {
  const ruta = $page.url.pathname;
  if (!esPublica(ruta) && !isAuthenticated()) {
    goto(`/auth/login?next=${encodeURIComponent(ruta)}`);
  }
});

// También reacciona a cambios de ruta en navegación client-side
$: {
  const ruta = $page.url.pathname;
  if (typeof window !== "undefined" && !esPublica(ruta) && !isAuthenticated()) {
    goto(`/auth/login?next=${encodeURIComponent(ruta)}`);
  }
}
