<script>
  export let quote = "La tecnología al servicio de la fe y la comunidad";
</script>

<div class="container-fluid p-0">
  <div class="row g-0 min-vh-100">
    <!-- Panel izquierdo decorativo (solo desktop) -->
    <div
      class="col-lg-7 auth-panel-left d-none d-lg-flex align-items-center justify-content-center"
    >
      <div class="auth-panel-content text-center">
        <span class="auth-cross-lg mb-3">✝</span>
        <h1 class="auth-brand-title mt-3">EcclesiaSys</h1>
        <p class="auth-brand-subtitle mb-0">
          Plataforma de Gestión Sacramental
        </p>
        <div class="auth-divider mx-auto my-4"></div>
        <p class="auth-quote mx-auto">"{quote}"</p>
      </div>
    </div>

    <!-- Panel derecho: slot del formulario -->
    <div class="col-12 col-lg-5 auth-panel-right">
      <div class="auth-form-box">
        <slot />
      </div>
    </div>
  </div>
</div>
