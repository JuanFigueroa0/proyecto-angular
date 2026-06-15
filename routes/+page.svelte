<!-- src/routes/+page.svelte -->
<script>
  import "$lib/styles/landing.css";
  import Hero from "$lib/components/landing/Hero.svelte";
  import Features from "$lib/components/landing/features.svelte";
  import Footer from "$lib/components/landing/Footer.svelte";
</script>

<svelte:head>
  <title>EcclesiaSys – Gestión Sacramental Parroquial</title>
  <meta
    name="description"
    content="Plataforma digital de gestión sacramental para parroquias. Administra sacramentos, certificados y eventos de forma segura y eficiente."
  />
</svelte:head>

<nav class="landing-nav">
  <div class="container">
    <div class="d-flex align-items-center justify-content-between py-3">
      <div class="landing-brand d-flex align-items-center gap-2">
        <span class="landing-cross">✝</span>
        <div>
          <div class="landing-brand-name">EcclesiaSys</div>
          <div class="landing-brand-sub">Gestión Sacramental</div>
        </div>
      </div>
      <a href="/auth/login" class="btn btn-ecclesia-outline">
        <i class="bi bi-box-arrow-in-right me-2" aria-hidden="true"></i>Iniciar
        sesión
      </a>
    </div>
  </div>
</nav>

<main>
  <Hero />
  <Features />

  <section class="landing-stats">
    <div class="container">
      <div class="row g-4 justify-content-center text-center">
        {#each [{ num: "100%", label: "Trazabilidad de registros" }, { num: "0", label: "Registros eliminados" }, { num: "∞", label: "Histórico sacramental" }, { num: "24/7", label: "Acceso a certificados" }] as stat}
          <div class="col-6 col-md-3">
            <div class="stat-card">
              <div class="stat-num">{stat.num}</div>
              <div class="stat-label">{stat.label}</div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <section class="landing-cta">
    <div class="container text-center">
      <span class="landing-cross-md">✝</span>
      <h2 class="landing-cta-title mt-3">
        ¿Lista tu parroquia para el futuro?
      </h2>
      <p class="landing-cta-subtitle">
        Digitaliza tu gestión sacramental hoy mismo.
      </p>
      <a href="/auth/login" class="btn btn-ecclesia-lg mt-3">
        <i class="bi bi-arrow-right-circle me-2" aria-hidden="true"></i>Acceder
        a la plataforma
      </a>
    </div>
  </section>
</main>

<Footer />
