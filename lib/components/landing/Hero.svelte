<!-- src/lib/components/landing/Hero.svelte -->
<section class="landing-hero">
  <div class="landing-hero-bg" aria-hidden="true">
    <div class="hero-orb hero-orb-1"></div>
    <div class="hero-orb hero-orb-2"></div>
    <div class="hero-grid"></div>
  </div>

  <div class="container position-relative">
    <div class="row align-items-center min-vh-100 py-5">
      <div class="col-lg-6 hero-content">
        <div class="hero-badge mb-4">
          <span class="hero-badge-dot"></span>
          Plataforma de gestión parroquial
        </div>
        <h1 class="hero-title">
          EcclesiaSys<br />
          <span class="hero-title-accent">tecnología digna</span>
        </h1>
        <p class="hero-subtitle">
          EcclesiaSys digitaliza la gestión sacramental de tu parroquia.
          Certificados automáticos, trazabilidad completa y control seguro de
          cada sacramento.
        </p>
        <div class="d-flex flex-wrap gap-3 mt-4">
          <a href="/auth/login" class="btn btn-ecclesia-lg">
            <i class="bi bi-box-arrow-in-right me-2" aria-hidden="true"></i>
            Ingresar a la plataforma
          </a>
          <a href="#funcionalidades" class="btn btn-hero-outline">
            Ver funcionalidades
            <i class="bi bi-arrow-down ms-2" aria-hidden="true"></i>
          </a>
        </div>
      </div>

      <div
        class="col-lg-6 d-none d-lg-flex justify-content-center align-items-center"
      >
        <div class="hero-card-stack">
          <!-- Tarjeta principal -->
          <div class="hero-card hero-card-main">
            <div class="hc-icon">
              <i class="bi bi-shield-check" aria-hidden="true"></i>
            </div>
            <div class="hc-content">
              <div class="hc-title">Certificado de Bautismo</div>
              <div class="hc-sub">
                Generado automáticamente · Verificable con QR
              </div>
            </div>
            <div class="hc-badge hc-badge-ok">
              <i class="bi bi-check-circle-fill me-1" aria-hidden="true"
              ></i>Emitido
            </div>
          </div>

          <!-- Tarjeta secundaria -->
          <div class="hero-card hero-card-float">
            <div class="hc-icon hc-icon-sm">
              <i class="bi bi-people-fill" aria-hidden="true"></i>
            </div>
            <div class="hc-content">
              <div class="hc-title-sm">Solicitud de Matrimonio</div>
              <div class="hc-sub">En revisión por secretaría</div>
            </div>
            <div class="hc-badge hc-badge-warn">
              <i class="bi bi-hourglass-split me-1" aria-hidden="true"
              ></i>Revisión
            </div>
          </div>
          <!-- Tarjeta tercera -->
          <div class="hero-card hero-card-bottom">
            <div class="hc-icon hc-icon-sm">
              <i class="bi bi-calendar-event" aria-hidden="true"></i>
            </div>
            <div class="hc-content">
              <div class="hc-title-sm">Misa de Acción de Gracias</div>
              <div class="hc-sub">Dom 15 · 10:00 AM</div>
            </div>
            <div class="hc-badge hc-badge-info">
              <i class="bi bi-clock me-1" aria-hidden="true"></i>Próximo
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
