<!-- src/routes/admin/configuracion/+page.svelte -->
<script>
  import "$lib/styles/admin/admin.css";
  import "$lib/styles/admin/configuracion.css";
  let tabActivo = "general";

  const SECCIONES = [
    { id: "general", label: "General", icon: "bi-gear" },
    { id: "certificados", label: "Certificados", icon: "bi-patch-check" },
    { id: "firmas", label: "Firmas digitales", icon: "bi-pen" },
    { id: "retencion", label: "Retención docs.", icon: "bi-archive" },
    { id: "notifics", label: "Notificaciones", icon: "bi-bell" },
  ];

  // Mock
  let config = {
    nombre_parroquia: "Parroquia San José",
    direccion: "Calle 72 #45-20, Barranquilla",
    telefono: "605 356 7890",
    email_parroquia: "info@sanjose.com",
    parroco_actual: "Pbro. Luis Rodríguez",
    // Certificados
    plantilla_activa: "clasica",
    incluir_qr: true,
    incluir_sello: true,
    // Retención
    dias_retencion_docs: 365 * 5,
    // Notificaciones
    notif_email: true,
    notif_telegram: false,
    telegram_bot_token: "",
  };
</script>

<svelte:head><title>EcclesiaSys – Configuración</title></svelte:head>

<div class="pg-wrap">
  <div class="pg-header">
    <div>
      <h1 class="pg-titulo">Configuración del Sistema</h1>
      <p class="pg-subtitulo">
        Parámetros globales, certificados y firmas digitales
      </p>
    </div>
  </div>

  <div class="row g-4">
    <!-- Sidebar de secciones -->
    <div class="col-md-3">
      <div class="config-nav">
        {#each SECCIONES as s}
          <button
            class="config-nav-item {tabActivo === s.id ? 'active' : ''}"
            on:click={() => (tabActivo = s.id)}
          >
            <i class="bi {s.icon} me-2" aria-hidden="true"></i>{s.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Contenido -->
    <div class="col-md-9">
      {#if tabActivo === "general"}
        <div class="perfil-card">
          <div class="perfil-card-title mb-4">
            <i class="bi bi-building me-2"></i>Datos de la Parroquia
          </div>
          <div class="row g-3">
            {#each [["Nombre de la parroquia", "nombre_parroquia", "text"], ["Dirección", "direccion", "text"], ["Teléfono", "telefono", "tel"], ["Email institucional", "email_parroquia", "email"], ["Párroco actual", "parroco_actual", "text"]] as [lbl, campo, tipo]}
              <div class="col-md-6">
                <label class="form-label small fw-semibold" for={campo}
                  >{lbl}</label
                >
                <input
                  type={tipo}
                  class="form-control"
                  bind:value={config[campo]}
                />
              </div>
            {/each}
          </div>
          <div class="d-flex justify-content-end mt-4">
            <button class="btn-primary">
              <i class="bi bi-check-lg me-1"></i>Guardar cambios
            </button>
          </div>
        </div>
      {:else if tabActivo === "certificados"}
        <div class="perfil-card">
          <div class="perfil-card-title mb-4">
            <i class="bi bi-patch-check me-2"></i>Configuración de Certificados
          </div>
          <div class="mb-4">
            <label class="form-label small fw-semibold" for="plantilla-activa"
              >Plantilla activa</label
            >
            <div class="plantillas-grid">
              {#each ["clasica", "moderna", "minimalista"] as p}
                <button
                  class="plantilla-card {config.plantilla_activa === p
                    ? 'active'
                    : ''}"
                  on:click={() => (config.plantilla_activa = p)}
                >
                  <div class="plantilla-preview">
                    <i class="bi bi-file-earmark-text" aria-hidden="true"></i>
                  </div>
                  <div class="plantilla-nombre">{p}</div>
                </button>
              {/each}
            </div>
          </div>
          <div class="config-toggle-group">
            <div class="config-toggle">
              <div>
                <div class="fw-semibold small">Incluir código QR</div>
                <div class="text-muted" style="font-size:.75rem">
                  Permite verificación online del certificado
                </div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" bind:checked={config.incluir_qr} />
                <span class="toggle-track"></span>
              </label>
            </div>
            <div class="config-toggle">
              <div>
                <div class="fw-semibold small">Incluir sello parroquial</div>
                <div class="text-muted" style="font-size:.75rem">
                  Sello digital de la parroquia
                </div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" bind:checked={config.incluir_sello} />
                <span class="toggle-track"></span>
              </label>
            </div>
          </div>
          <div class="d-flex justify-content-end mt-4">
            <button class="btn-primary"
              ><i class="bi bi-check-lg me-1"></i>Guardar</button
            >
          </div>
        </div>
      {:else if tabActivo === "firmas"}
        <div class="perfil-card">
          <div class="perfil-card-title mb-4">
            <i class="bi bi-pen me-2"></i>Firmas Digitales
          </div>
          <div class="firma-slot mb-4">
            <div class="firma-placeholder">
              <i class="bi bi-pen" aria-hidden="true"></i>
              <div class="small text-muted mt-2">Firma del Párroco</div>
              <div class="text-muted" style="font-size:.7rem">
                Pbro. Luis Rodríguez
              </div>
            </div>
            <div class="ms-4">
              <p class="text-muted small mb-3">
                La firma digital se usa para autenticar certificados
                sacramentales. Al cambiar el párroco, se debe actualizar la
                firma.
              </p>
              <button class="btn-outline-sm">
                <i class="bi bi-upload me-1"></i>Subir nueva firma
              </button>
            </div>
          </div>
          <div class="alerta-info">
            <i class="bi bi-info-circle me-2"></i>
            Al cambiar la firma, los certificados emitidos anteriormente mantienen
            la firma original. Solo los nuevos certificados usarán la firma actualizada.
          </div>
        </div>
      {:else if tabActivo === "retencion"}
        <div class="perfil-card">
          <div class="perfil-card-title mb-4">
            <i class="bi bi-archive me-2"></i>Retención de Documentos
          </div>
          <div class="mb-4">
            <label class="form-label small fw-semibold" for=" dias-retencion">
              Días de retención de documentos
            </label>
            <div class="d-flex align-items-center gap-3">
              <input
                type="number"
                class="form-control"
                style="max-width:150px"
                bind:value={config.dias_retencion_docs}
                min="365"
                step="365"
              />
              <span class="text-muted small">
                ≈ {Math.round(config.dias_retencion_docs / 365)} años
              </span>
            </div>
            <div class="form-text small text-muted mt-1">
              Mínimo recomendado: 5 años (1825 días)
            </div>
          </div>
          <div class="alerta-warning">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Los documentos <strong>nunca se eliminan automáticamente</strong>.
            Este parámetro solo es referencial para reportes de cumplimiento.
          </div>
          <div class="d-flex justify-content-end mt-4">
            <button class="btn-primary"
              ><i class="bi bi-check-lg me-1"></i>Guardar</button
            >
          </div>
        </div>
      {:else if tabActivo === "notifics"}
        <div class="perfil-card">
          <div class="perfil-card-title mb-4">
            <i class="bi bi-bell me-2"></i>Canales de Notificación
          </div>
          <div class="config-toggle-group mb-4">
            <div class="config-toggle">
              <div>
                <div class="fw-semibold small">Correo electrónico (Email)</div>
                <div class="text-muted" style="font-size:.75rem">
                  Notificaciones vía SMTP configurado
                </div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" bind:checked={config.notif_email} />
                <span class="toggle-track"></span>
              </label>
            </div>
            <div class="config-toggle">
              <div>
                <div class="fw-semibold small">Telegram Bot</div>
                <div class="text-muted" style="font-size:.75rem">
                  Alertas en tiempo real vía Telegram
                </div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" bind:checked={config.notif_telegram} />
                <span class="toggle-track"></span>
              </label>
            </div>
          </div>
          {#if config.notif_telegram}
            <div class="mb-3">
              <label
                class="form-label small fw-semibold"
                for=" telegram_bot_token">Token del Bot de Telegram</label
              >
              <input
                type="password"
                class="form-control"
                bind:value={config.telegram_bot_token}
                placeholder="123456789:ABCdefGHI..."
              />
              <div class="form-text small text-muted">
                Obtén el token desde @BotFather en Telegram.
              </div>
            </div>
          {/if}
          <div class="d-flex justify-content-end mt-4">
            <button class="btn-primary"
              ><i class="bi bi-check-lg me-1"></i>Guardar</button
            >
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
