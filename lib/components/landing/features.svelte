<!-- src/lib/components/landing/features.svelte -->
<section class="landing-features" id="funcionalidades">
  <div class="container">
    <div class="text-center mb-5">
      <div class="section-tag">Funcionalidades</div>
      <h2 class="section-title">Todo lo que tu parroquia necesita</h2>
      <p class="section-subtitle">
        Un sistema integral diseñado para la realidad de las comunidades
        religiosas
      </p>
    </div>

    <div class="row g-4">
      {#each [{ icon: "bi-file-earmark-check", color: "feat-blue", titulo: "Gestión Sacramental", desc: "Registra y administra Bautismo, Confirmación, Matrimonio, Primera Comunión y más con flujos personalizados por sacramento." }, { icon: "bi-patch-check", color: "feat-gold", titulo: "Certificados Digitales", desc: "Generación automática para sacramentos de bajo riesgo. Validación humana para casos sensibles. Todo con QR verificable." }, { icon: "bi-calendar3", color: "feat-green", titulo: "Agenda y Eventos", desc: "Gestiona misas, retiros, cursos y celebraciones. Control de cupos, inscripciones y conflictos de horario automático." }, { icon: "bi-people", color: "feat-purple", titulo: "Gestión de Personas", desc: "Base de datos parroquial completa. Relaciones familiares, historial sacramental y documentos en la nube." }, { icon: "bi-shield-lock", color: "feat-red", titulo: "Seguridad y Auditoría", desc: "Trazabilidad completa de cada acción. Sin eliminación de datos. Historial inmutable con quién, qué y cuándo." }, { icon: "bi-bell", color: "feat-teal", titulo: "Notificaciones", desc: "Alertas por correo y Telegram para usuarios y secretaría. Cada solicitud tiene seguimiento en tiempo real." }] as f}
        <div class="col-md-6 col-lg-4">
          <div class="feat-card">
            <div class="feat-icon {f.color}">
              <i class="bi {f.icon}" aria-hidden="true"></i>
            </div>
            <h3 class="feat-title">{f.titulo}</h3>
            <p class="feat-desc">{f.desc}</p>
          </div>
        </div>
      {/each}
    </div>

    <!-- Sacramentos soportados -->
    <div class="sacraments-bar mt-5">
      <div class="sacraments-label">Sacramentos soportados</div>
      <div class="d-flex flex-wrap gap-2 justify-content-center mt-3">
        {#each ["Bautismo", "Primera Comunión", "Confirmación", "Matrimonio", "Unción de Enfermos", "Penitencia"] as s}
          <span class="sacrament-tag">✝ {s}</span>
        {/each}
      </div>
    </div>
  </div>
</section>
