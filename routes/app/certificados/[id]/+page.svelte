<!-- src/routes/admin/certificados/[id]/+page.svelte -->
<script>
  import { page } from "$app/stores";
  import "$lib/styles/admin/certificados.css";
  const id = $page.params.id;

  const cert = {
    id,
    codigo: "CERT-2026-001",
    sacramento: "Bautismo",
    receptor: "Santiago García López",
    estado: "emitido",
    fecha_emision: "2026-03-01",
    emisor: "Sec. María Torres",
    hash: "sha256:abc123def456...",
    qr_data: "https://ecclesiasys.com/verificar/CERT-2026-001",
    registro_id: 12,
  };
</script>

<svelte:head><title>EcclesiaSys – Certificado {cert.codigo}</title></svelte:head
>

<div class="pg-wrap" style="max-width:700px;margin:0 auto">
  <div class="mb-4">
    <a href="/admin/certificados" class="auth-link small">
      <i class="bi bi-arrow-left me-1"></i>Certificados
    </a>
  </div>

  <div class="cert-card">
    <!-- Header del certificado -->
    <div class="cert-header">
      <div class="cert-emblema">
        <i class="bi bi-patch-check-fill" aria-hidden="true"></i>
      </div>
      <div>
        <h2 class="cert-titulo">Certificado Sacramental</h2>
        <div class="cert-codigo-display">{cert.codigo}</div>
      </div>
      <span
        class="cert-estado {cert.estado === 'emitido' ? 'emitido' : 'revocado'}"
      >
        {cert.estado}
      </span>
    </div>

    <!-- Datos -->
    <div class="cert-datos">
      {#each [["Sacramento", cert.sacramento], ["Receptor", cert.receptor], ["Fecha emisión", cert.fecha_emision], ["Emitido por", cert.emisor], ["Registro #", cert.registro_id]] as [lbl, val]}
        <div class="cert-dato-row">
          <div class="cert-dato-label">{lbl}</div>
          <div class="cert-dato-val">{val}</div>
        </div>
      {/each}
    </div>

    <!-- QR simulado -->
    <div class="cert-qr-section">
      <div class="cert-qr-placeholder">
        <i class="bi bi-qr-code" aria-hidden="true"></i>
        <span class="small text-muted mt-2">QR de verificación</span>
      </div>
      <div class="cert-qr-info">
        <div class="small fw-semibold mb-1">URL de verificación</div>
        <code class="cert-url">{cert.qr_data}</code>
        <div class="small fw-semibold mt-3 mb-1">Hash de integridad</div>
        <code class="cert-hash">{cert.hash}</code>
      </div>
    </div>

    <!-- Acciones -->
    <div class="cert-acciones">
      <button class="btn-primary">
        <i class="bi bi-download me-2"></i>Descargar PDF
      </button>
      {#if cert.estado === "emitido"}
        <button class="btn-outline-danger">
          <i class="bi bi-x-circle me-2"></i>Revocar certificado
        </button>
      {/if}
    </div>
  </div>
</div>
