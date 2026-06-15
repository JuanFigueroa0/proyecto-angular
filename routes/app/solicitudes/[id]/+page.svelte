<!-- src/routes/app/solicitudes/[id]/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import FileUpload from "$lib/components/ui/FileUpload.svelte";
  import ConfirmDialog from "$lib/components/ui/ConfirmDialog.svelte";
  import {
    getSolicitud,
    cambiarEstadoSolicitud,
    validarPersonaSolicitud,
    subirDocumentoSolicitud,
    ESTADOS_SOLICITUD,
    ROLES_SOLICITUD,
    TIPOS_DOCUMENTO_SOLICITUD,
  } from "$lib/js/interfaces/solicitudes.js";
  import { toast } from "$lib/js/stores/ui.js";
  import { formatFecha } from "$lib/js/utils/formatters.js";
  import { api } from "$lib/js/api/client.js";

  const solicitudId = Number($page.params.id);

  // ── Estado ────────────────────────────────────────────────
  let solicitud = null;
  let cargando = true;
  let tabActivo = "personas"; // personas | documentos | historial

  // ── Cambio de estado ──────────────────────────────────────
  let modalEstado = false;
  let nuevoEstado = "";
  let obsSecretario = "";
  let cambiandoEstado = false;

  // ── Validar persona ───────────────────────────────────────
  let modalValidar = false;
  let personaValidando = null; // { persona_id, rol, nombre }
  let resultadoValidar = true;
  let obsValidacion = "";
  let validando = false;

  // ── Subir documento ───────────────────────────────────────
  let modalDoc = false;
  let docTipo = "";
  let docDescripcion = "";
  let docPersonaId = null;
  let archivoSel = null;
  let subiendoDoc = false;
  let errorDoc = "";

  // ── Visor de documentos ───────────────────────────────────
  let cargandoVisor = {}; // { [archivo_id]: true/false }

  onMount(cargar);

  async function cargar() {
    cargando = true;
    const r = await getSolicitud(solicitudId);
    cargando = false;
    if (r.ok) solicitud = r.data;
    else toast.error(r.error ?? "No se pudo cargar la solicitud.");
  }

  // ── Visor: abre PDF o imagen en nueva ventana ─────────────
  async function verDocumento(doc) {
    // Buscar el id del archivo en todas las posibles rutas que el backend
    // puede devolver: doc.archivo.id, doc.archivo_id (campo plano)
    const archivoId = doc.archivo?.id ?? doc.archivo_id ?? null;

    // Buscar la URL directa en todas las rutas posibles
    const urlDirecta =
      doc.archivo?.cloudinary_url ?? doc.cloudinary_url ?? doc.url ?? null;

    const tipoDirecto =
      doc.archivo?.tipo_archivo ?? doc.tipo_archivo ?? "documento";

    // ── Caso 1: tenemos ID → llamar al endpoint de visor ──
    if (archivoId) {
      cargandoVisor = { ...cargandoVisor, [archivoId]: true };
      const r = await api.get(`/archivos/${archivoId}/visor`);
      cargandoVisor = { ...cargandoVisor, [archivoId]: false };

      if (r.ok) {
        abrirVisor(
          r.data.url_visor,
          r.data.tipo_archivo,
          doc,
          r.data.nombre_original,
        );
        return;
      }

      // El endpoint falló pero tenemos URL directa → usarla como fallback
      if (urlDirecta) {
        console.warn(
          `[verDocumento] endpoint /visor falló (${r.status}), usando URL directa.`,
        );
        abrirVisor(urlDirecta, tipoDirecto, doc);
        return;
      }

      toast.error(r.error ?? "No se pudo obtener la URL del documento.");
      return;
    }

    // ── Caso 2: no hay ID pero sí URL directa ─────────────
    if (urlDirecta) {
      abrirVisor(urlDirecta, tipoDirecto, doc);
      return;
    }

    // ── Caso 3: sin ID ni URL → diagnóstico en consola ────
    console.error("[verDocumento] doc sin archivo_id ni cloudinary_url:", doc);
    toast.error(
      "Este documento aún no tiene archivo adjunto. " +
        "Si acabas de subirlo, recarga la página.",
    );
  }

  function abrirVisor(url, tipo, doc, nombreOriginal = null) {
    const nombre =
      nombreOriginal ??
      doc.archivo?.nombre_original ??
      TIPOS_DOCUMENTO_SOLICITUD.find((t) => t.value === doc.tipo_documento)
        ?.label ??
      "Documento";

    const tipoNormalizado = (tipo ?? "").toLowerCase();

    // Generar HTML del visor en una nueva ventana
    const html = generarHtmlVisor({ url, tipo: tipoNormalizado, nombre });

    const ventana = window.open(
      "",
      "_blank",
      "width=900,height=700,noopener,noreferrer",
    );
    if (!ventana) {
      // Si el navegador bloqueó el popup, abrir directamente la URL
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    ventana.document.write(html);
    ventana.document.close();
  }

  function generarHtmlVisor({ url, tipo, nombre }) {
    // Detectar por extensión de la URL tiene prioridad sobre el tipo en BD.
    // Cloudinary convierte PDFs a .jpg con resource_type="auto", por lo que
    // la URL puede terminar en .jpg aunque tipo === "pdf".
    const EXTS_IMAGEN = ["jpg", "jpeg", "png", "webp", "gif"];
    const urlLower = url.toLowerCase().split("?")[0]; // quitar query params
    const urlEsImagen = EXTS_IMAGEN.some((e) => urlLower.endsWith("." + e));

    // Si la URL es claramente una imagen, renderizar como imagen sin importar tipo.
    const esPdf = tipo === "pdf" && !urlEsImagen;
    const esImagen = urlEsImagen || tipo === "imagen";

    const contenido = esPdf
      ? `<iframe src="${url}" class="visor-embed" title="${nombre}" frameborder="0">
           <p style="color:#e2e5f0;padding:2rem;text-align:center">
             Tu navegador no puede mostrar el PDF inline.
             <a href="${url}" target="_blank" style="color:#4f7cff">Abrir en nueva pestaña</a>
           </p>
         </iframe>`
      : esImagen
        ? `<div class="img-wrap"><img src="${url}" alt="${nombre}" class="visor-img" /></div>`
        : `<div class="doc-fallback">
             <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="#6b7280" stroke-width="1.5">
               <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>
             </svg>
             <p>No se puede previsualizar este tipo de archivo.</p>
             <a href="${url}" target="_blank" download class="dl-btn">Descargar</a>
           </div>`;

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${nombre}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #0f1117;
      --surface:   #1a1d27;
      --border:    #2a2d3a;
      --accent:    #4f7cff;
      --accent-h:  #6b93ff;
      --text:      #e2e5f0;
      --text-muted:#8b90a4;
      --radius:    10px;
    }

    html, body {
      height: 100%;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    /* ── Topbar ── */
    .topbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 18px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }

    .topbar-icon {
      width: 32px; height: 32px;
      background: var(--accent);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .topbar-icon svg { width: 16px; height: 16px; color: #fff; }

    .topbar-name {
      font-size: .875rem;
      font-weight: 600;
      color: var(--text);
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .topbar-actions { display: flex; gap: 8px; }

    .btn-topbar {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px;
      font-size: .8rem;
      font-weight: 500;
      border-radius: 7px;
      cursor: pointer;
      border: none;
      transition: background .15s;
      text-decoration: none;
    }
    .btn-download {
      background: var(--accent);
      color: #fff;
    }
    .btn-download:hover { background: var(--accent-h); }

    .btn-close-win {
      background: var(--border);
      color: var(--text-muted);
    }
    .btn-close-win:hover { background: #353849; color: var(--text); }

    /* ── Contenido ── */
    .visor-body {
      flex: 1;
      overflow: auto;
      display: flex;
      align-items: ${esPdf ? "stretch" : "center"};
      justify-content: center;
      padding: ${esPdf ? "0" : "24px"};
    }

    /* PDF */
    .visor-embed {
      width: 100%;
      height: 100%;
      border: none;
    }

    /* Imagen */
    .img-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
    .visor-img {
      max-width: 100%;
      max-height: calc(100vh - 80px);
      object-fit: contain;
      border-radius: var(--radius);
      box-shadow: 0 20px 60px rgba(0,0,0,.5);
    }

    /* Fallback */
    .doc-fallback {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 60px 20px;
      text-align: center;
      color: var(--text-muted);
      font-size: .9rem;
    }
    .dl-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 20px;
      background: var(--accent);
      color: #fff;
      border-radius: 8px;
      text-decoration: none;
      font-size: .85rem;
      font-weight: 500;
      margin-top: 4px;
      transition: background .15s;
    }
    .dl-btn:hover { background: var(--accent-h); }

    /* Tipo badge en topbar */
    .type-badge {
      padding: 2px 8px;
      border-radius: 20px;
      font-size: .7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .04em;
      background: ${esPdf ? "rgba(79,124,255,.2)" : esImagen ? "rgba(34,197,94,.2)" : "rgba(107,114,128,.2)"};
      color: ${esPdf ? "var(--accent)" : esImagen ? "#4ade80" : "var(--text-muted)"};
    }
  </style>
</head>
<body>
  <div class="layout">
    <div class="topbar">
      <div class="topbar-icon">
        ${
          esPdf
            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`
        }
      </div>
      <span class="topbar-name" title="${nombre}">${nombre}</span>
      <span class="type-badge">${esPdf ? "PDF" : esImagen ? "Imagen" : "Archivo"}</span>
      <div class="topbar-actions">
        <a href="${url}" download="${nombre}" class="btn-topbar btn-download">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4"/></svg>
          Descargar
        </a>
        <button class="btn-topbar btn-close-win" onclick="window.close()">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
          Cerrar
        </button>
      </div>
    </div>
    <div class="visor-body">
      ${contenido}
    </div>
  </div>
</body>
</html>`;
  }

  // ── Cambio de estado ──────────────────────────────────────
  function abrirCambioEstado(estado) {
    nuevoEstado = estado;
    obsSecretario = "";
    modalEstado = true;
  }

  async function confirmarCambioEstado() {
    if (
      ["rechazada", "documentacion_incompleta"].includes(nuevoEstado) &&
      !obsSecretario.trim()
    ) {
      toast.error(
        "Las observaciones son obligatorias al rechazar o marcar doc. incompleta.",
      );
      return;
    }
    cambiandoEstado = true;
    const r = await cambiarEstadoSolicitud(solicitudId, {
      estado: nuevoEstado,
      observaciones_secretario: obsSecretario || null,
    });
    cambiandoEstado = false;
    modalEstado = false;
    if (r.ok) {
      solicitud = r.data;
      toast.success("Estado actualizado");
    } else toast.error(r.error);
  }

  // ── Validar persona ───────────────────────────────────────
  function abrirValidarPersona(p) {
    const datos = p.datos_digitados ?? {};
    personaValidando = {
      persona_id: p.persona_id,
      rol: p.rol_en_solicitud,
      nombre:
        `${datos.primer_nombre ?? ""} ${datos.primer_apellido ?? ""}`.trim(),
    };
    resultadoValidar = true;
    obsValidacion = "";
    modalValidar = true;
  }

  async function confirmarValidarPersona() {
    validando = true;
    const r = await validarPersonaSolicitud(
      solicitudId,
      personaValidando.persona_id,
      personaValidando.rol,
      {
        datos_validados: resultadoValidar,
        observaciones_validacion: obsValidacion || null,
      },
    );
    validando = false;
    modalValidar = false;
    if (r.ok) {
      await cargar();
      toast.success(resultadoValidar ? "Datos validados" : "Datos rechazados");
    } else toast.error(r.error);
  }

  // ── Subir documento ───────────────────────────────────────
  function abrirModalDoc(personaId = null) {
    docTipo = "";
    docDescripcion = "";
    docPersonaId = personaId;
    archivoSel = null;
    errorDoc = "";
    modalDoc = true;
  }

  async function onSubirDoc() {
    if (!archivoSel) {
      errorDoc = "Selecciona un archivo.";
      return;
    }
    if (!docTipo) {
      errorDoc = "Selecciona el tipo de documento.";
      return;
    }
    subiendoDoc = true;
    errorDoc = "";

    const catMap = {
      documento_identidad: "documento_identidad",
      registro_civil: "registro_civil",
      certificado_bautismo: "certificado_externo",
      certificado_confirmacion: "certificado_externo",
      certificado_primera_comunion: "certificado_externo",
      acta_defuncion: "acta_defuncion",
      certificado_curso: "certificado_curso",
    };

    const r = await subirDocumentoSolicitud(solicitudId, {
      file: archivoSel,
      tipo_documento: docTipo,
      categoria: catMap[docTipo] ?? "otro",
      persona_id: docPersonaId,
      descripcion: docDescripcion || null,
    });

    subiendoDoc = false;
    if (r.ok) {
      toast.success(
        r.data?.es_reutilizado
          ? "Documento existente vinculado automáticamente"
          : "Documento subido correctamente",
      );
      modalDoc = false;
      await cargar();
    } else {
      errorDoc = r.error ?? "Error al subir.";
    }
  }

  // ── Helpers ───────────────────────────────────────────────
  const BADGE = {
    pendiente: "badge-warning",
    en_revision: "badge-info",
    documentacion_incompleta: "badge-danger",
    aprobada: "badge-success",
    rechazada: "badge-danger",
    cancelada: "badge-secondary",
  };

  function transicionesPermitidas(estado) {
    const mapa = {
      pendiente: ["en_revision", "rechazada", "cancelada"],
      en_revision: ["aprobada", "rechazada", "documentacion_incompleta"],
      documentacion_incompleta: ["en_revision", "cancelada"],
    };
    return mapa[estado] ?? [];
  }

  const LABEL_ESTADO = {
    en_revision: "Poner en revisión",
    aprobada: "Aprobar",
    rechazada: "Rechazar",
    documentacion_incompleta: "Doc. incompleta",
    cancelada: "Cancelar",
  };
  const ICON_ESTADO = {
    en_revision: "bi-search",
    aprobada: "bi-check-lg",
    rechazada: "bi-x-lg",
    documentacion_incompleta: "bi-file-earmark-x",
    cancelada: "bi-x-circle",
  };
  const BTN_ESTADO = {
    en_revision: "btn-est-info",
    aprobada: "btn-est-success",
    rechazada: "btn-est-danger",
    documentacion_incompleta: "btn-est-warning",
    cancelada: "btn-est-danger",
  };

  $: puedeSubirDocs =
    solicitud &&
    !["aprobada", "rechazada", "cancelada"].includes(solicitud.estado);

  $: todasPersonasValidadas = (solicitud?.personas ?? []).every(
    (p) => p.datos_validados,
  );
</script>

<svelte:head><title>EcclesiaSys – Solicitud #{solicitudId}</title></svelte:head>

<div class="pg-wrap" style="max-width:920px;margin:0 auto">
  <!-- Breadcrumb -->
  <div class="mb-4">
    <a href="/app/solicitudes" class="auth-link small">
      <i class="bi bi-arrow-left me-1"></i>Solicitudes
    </a>
  </div>

  {#if cargando}
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
  {:else if !solicitud}
    <div class="tabla-empty">
      <i class="bi bi-exclamation-circle display-5 text-muted mb-3"></i>
      <p class="text-muted">Solicitud no encontrada.</p>
    </div>
  {:else}
    <!-- ── Header ── -->
    <div class="pg-header mb-4">
      <div>
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <h1 class="pg-titulo mb-0">Solicitud #{solicitud.id}</h1>
          <span class="badge-estado {BADGE[solicitud.estado]}">
            {ESTADOS_SOLICITUD[solicitud.estado]?.label ?? solicitud.estado}
          </span>
          {#if solicitud.requiere_validacion_manual}
            <span class="validacion-tag manual">
              <i class="bi bi-person-check me-1"></i>Revisión manual
            </span>
          {:else}
            <span class="validacion-tag auto">
              <i class="bi bi-lightning me-1"></i>Automática
            </span>
          {/if}
        </div>
        <p class="pg-subtitulo mt-1">
          Creada {formatFecha(solicitud.created_at, { hora: true })}
        </p>
      </div>

      <!-- Acciones de estado -->
      <div class="d-flex gap-2 flex-wrap">
        {#each transicionesPermitidas(solicitud.estado) as est}
          <button
            class="btn-accion-estado {BTN_ESTADO[est]}"
            on:click={() => abrirCambioEstado(est)}
          >
            <i class="bi {ICON_ESTADO[est]} me-1" aria-hidden="true"></i>
            {LABEL_ESTADO[est]}
          </button>
        {/each}
        {#if puedeSubirDocs}
          <button class="btn-outline-sm" on:click={() => abrirModalDoc()}>
            <i class="bi bi-upload me-1"></i>Subir doc.
          </button>
        {/if}
      </div>
    </div>

    <!-- Alerta visible cuando el usuario debe actuar -->
    {#if solicitud.estado === "documentacion_incompleta" || solicitud.estado === "rechazada"}
      <div
        class="alerta-usuario {solicitud.estado === 'rechazada'
          ? 'alerta-rechazada'
          : 'alerta-doc-incompleta'} mb-4"
      >
        <div class="alerta-usuario-icon">
          <i
            class="bi {solicitud.estado === 'rechazada'
              ? 'bi-x-circle-fill'
              : 'bi-exclamation-triangle-fill'}"
          ></i>
        </div>
        <div class="alerta-usuario-body">
          <div class="alerta-usuario-titulo">
            {solicitud.estado === "rechazada"
              ? "Solicitud rechazada"
              : "Se requiere documentación adicional"}
          </div>
          {#if solicitud.observaciones_secretario}
            <div class="alerta-usuario-msg">
              {solicitud.observaciones_secretario}
            </div>
          {/if}
          {#if solicitud.estado === "documentacion_incompleta"}
            <div class="alerta-usuario-accion">
              <i class="bi bi-upload me-1"></i>
              Sube los documentos faltantes usando el botón "Subir documento" en
              la pestaña Documentos.
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Observaciones del secretario -->
    {#if solicitud.observaciones_secretario}
      <div class="obs-panel mb-4">
        <div class="obs-panel-header">
          <i class="bi bi-chat-left-dots-fill me-2"></i>Observaciones del
          secretario
        </div>
        <p class="obs-panel-body mb-0">{solicitud.observaciones_secretario}</p>
      </div>
    {/if}

    <!-- Alerta si doc. incompleta -->
    {#if solicitud.estado === "documentacion_incompleta"}
      <div class="alerta-warning mb-4">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <strong>Documentación incompleta.</strong> Sube los documentos faltantes
        y cambia el estado a "En revisión" para continuar.
      </div>
    {/if}

    <!-- Info general -->
    <div class="row g-3 mb-4">
      {#each [{ label: "Fecha preferida", val: solicitud.fecha_preferida ? formatFecha(solicitud.fecha_preferida) : "No especificada" }, { label: "Hora", val: solicitud.hora_preferida ?? "No especificada" }, { label: "Personas", val: `${solicitud.personas?.length ?? 0} involucradas` }, { label: "Documentos", val: `${solicitud.documentos?.length ?? 0} adjuntos` }] as prop}
        <div class="col-md-3 col-6">
          <div class="info-mini-card">
            <div class="info-mini-label">{prop.label}</div>
            <div class="info-mini-val">{prop.val}</div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Tabs -->
    <div class="perfil-tabs mb-4">
      <button
        class="perfil-tab {tabActivo === 'personas' ? 'active' : ''}"
        on:click={() => (tabActivo = "personas")}
      >
        <i class="bi bi-people me-2"></i>
        Personas
        {#if !todasPersonasValidadas && (solicitud.personas?.length ?? 0) > 0}
          <span class="tab-badge-warn ms-1"
            >{(solicitud.personas ?? []).filter((p) => !p.datos_validados)
              .length}</span
          >
        {/if}
      </button>
      <button
        class="perfil-tab {tabActivo === 'documentos' ? 'active' : ''}"
        on:click={() => (tabActivo = "documentos")}
      >
        <i class="bi bi-files me-2"></i>
        Documentos
        <span class="tab-count ms-1">{solicitud.documentos?.length ?? 0}</span>
      </button>
      <button
        class="perfil-tab {tabActivo === 'historial' ? 'active' : ''}"
        on:click={() => (tabActivo = "historial")}
      >
        <i class="bi bi-clock-history me-2"></i>Historial
      </button>
    </div>

    <!-- ── TAB: Personas ── -->
    {#if tabActivo === "personas"}
      <div class="perfil-card">
        <div
          class="d-flex align-items-start justify-content-between mb-3 flex-wrap gap-2"
        >
          <div>
            <p class="text-muted small mb-0">
              <i class="bi bi-info-circle me-1"></i>
              Compara los datos digitados con el documento físico y valida o rechaza
              cada persona.
            </p>
          </div>
          {#if !todasPersonasValidadas}
            <span class="alerta-badge-warn">
              <i class="bi bi-exclamation-triangle me-1"></i>
              {(solicitud.personas ?? []).filter((p) => !p.datos_validados)
                .length} pendiente{(solicitud.personas ?? []).filter(
                (p) => !p.datos_validados,
              ).length !== 1
                ? "s"
                : ""} de validar
            </span>
          {:else}
            <span class="alerta-badge-ok">
              <i class="bi bi-check-circle-fill me-1"></i>Todas validadas
            </span>
          {/if}
        </div>

        {#each solicitud.personas ?? [] as p}
          {@const datos = p.datos_digitados ?? {}}
          <div class="persona-admin-card">
            <div class="persona-admin-top">
              <div class="persona-admin-avatar">
                {(datos.primer_nombre?.[0] ?? "?").toUpperCase()}
              </div>
              <div class="persona-admin-info">
                <div class="persona-admin-rol">
                  {ROLES_SOLICITUD[p.rol_en_solicitud] ?? p.rol_en_solicitud}
                </div>
                <div class="persona-admin-nombre">
                  {datos.primer_nombre ?? "—"}
                  {datos.segundo_nombre ?? ""}
                  {datos.primer_apellido ?? ""}
                  {datos.segundo_apellido ?? ""}
                </div>
                {#if datos.numero_documento}
                  <div class="text-muted small">
                    {datos.tipo_documento}:
                    <strong>{datos.numero_documento}</strong>
                  </div>
                {/if}
                {#if datos.fecha_nacimiento}
                  <div class="text-muted small">
                    Nac: {datos.fecha_nacimiento}
                    {datos.lugar_nacimiento
                      ? `· ${datos.lugar_nacimiento}`
                      : ""}
                  </div>
                {/if}
              </div>
              <div class="persona-admin-acciones">
                {#if p.datos_validados}
                  <span class="val-badge val-ok">
                    <i class="bi bi-check-circle-fill me-1"></i>Validado
                  </span>
                {:else}
                  <div class="d-flex gap-1">
                    <button
                      class="val-btn val-btn-ok"
                      title="Validar — datos correctos"
                      on:click={() => {
                        resultadoValidar = true;
                        abrirValidarPersona(p);
                      }}
                    >
                      <i class="bi bi-check-lg me-1"></i>Validar
                    </button>
                    <button
                      class="val-btn val-btn-ko"
                      title="Rechazar — datos incorrectos"
                      on:click={() => {
                        resultadoValidar = false;
                        abrirValidarPersona(p);
                      }}
                    >
                      <i class="bi bi-x-lg me-1"></i>Rechazar
                    </button>
                  </div>
                {/if}
              </div>
            </div>

            {#if p.observaciones_validacion}
              <div class="persona-admin-obs">
                <i class="bi bi-chat-left-text me-1 text-muted"></i>
                {p.observaciones_validacion}
              </div>
            {/if}

            {#if puedeSubirDocs}
              <div class="persona-admin-footer">
                <button
                  class="btn-link-sm"
                  on:click={() => abrirModalDoc(p.persona_id)}
                >
                  <i class="bi bi-paperclip me-1"></i>Subir documento para esta
                  persona
                </button>
              </div>
            {/if}
          </div>
        {/each}

        {#if (solicitud.personas ?? []).length === 0}
          <div class="tabla-empty py-3">
            <p class="text-muted small">Sin personas registradas.</p>
          </div>
        {/if}
      </div>

      <!-- ── TAB: Documentos ── -->
    {:else if tabActivo === "documentos"}
      <div class="perfil-card">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <p class="text-muted small mb-0">
            <i class="bi bi-info-circle me-1"></i>
            Los documentos marcados como "Existente" ya estaban en el sistema y fueron
            vinculados automáticamente.
          </p>
          {#if puedeSubirDocs}
            <button class="btn-outline-sm" on:click={() => abrirModalDoc()}>
              <i class="bi bi-plus me-1"></i>Agregar
            </button>
          {/if}
        </div>

        {#if (solicitud.documentos ?? []).length === 0}
          <div class="tabla-empty py-3">
            <i class="bi bi-file-earmark display-6 text-muted mb-2"></i>
            <p class="text-muted small">Sin documentos adjuntos.</p>
            {#if puedeSubirDocs}
              <button class="btn-primary mt-2" on:click={() => abrirModalDoc()}>
                <i class="bi bi-upload me-1"></i>Subir documento
              </button>
            {/if}
          </div>
        {:else}
          <div class="docs-admin-lista">
            {#each solicitud.documentos ?? [] as doc}
              {@const archivoId = doc.archivo?.id ?? doc.archivo_id ?? null}
              {@const estaCargando =
                archivoId != null && cargandoVisor[archivoId] === true}
              <div class="doc-admin-row">
                <!-- Icono según tipo -->
                <div class="doc-admin-icon">
                  {#if doc.archivo?.tipo_archivo === "pdf"}
                    <i
                      class="bi bi-file-earmark-pdf"
                      aria-hidden="true"
                      style="color:#ef4444"
                    ></i>
                  {:else if doc.archivo?.tipo_archivo === "imagen"}
                    <i
                      class="bi bi-file-earmark-image"
                      aria-hidden="true"
                      style="color:#3b82f6"
                    ></i>
                  {:else}
                    <i class="bi bi-file-earmark-text" aria-hidden="true"></i>
                  {/if}
                </div>

                <div class="doc-admin-info">
                  <div class="fw-semibold small">
                    {TIPOS_DOCUMENTO_SOLICITUD.find(
                      (t) => t.value === doc.tipo_documento,
                    )?.label ?? doc.tipo_documento}
                  </div>
                  {#if doc.descripcion}
                    <div class="text-muted" style="font-size:.75rem">
                      {doc.descripcion}
                    </div>
                  {/if}
                  <div class="text-muted" style="font-size:.72rem">
                    {doc.persona_id ? `Persona #${doc.persona_id} · ` : ""}
                    {formatFecha(doc.created_at, { hora: false })}
                    {#if doc.archivo?.nombre_original}
                      · <span class="text-muted"
                        >{doc.archivo.nombre_original}</span
                      >
                    {/if}
                  </div>
                </div>

                <div class="d-flex gap-1 align-items-center">
                  {#if doc.es_reutilizado}
                    <span class="doc-tag-exist">Existente</span>
                  {:else}
                    <span class="doc-tag-nuevo">Nuevo</span>
                  {/if}

                  <!-- ── Botón ojito ── -->
                  <button
                    class="btn-accion btn-accion-ver"
                    title="Ver documento"
                    disabled={estaCargando}
                    on:click={() => verDocumento(doc)}
                  >
                    {#if estaCargando}
                      <span
                        class="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                        style="width:.8rem;height:.8rem;border-width:2px"
                      ></span>
                    {:else}
                      <i class="bi bi-eye" aria-hidden="true"></i>
                    {/if}
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- ── TAB: Historial ── -->
    {:else}
      <div class="perfil-card">
        {#if (solicitud.validaciones ?? []).length === 0}
          <div class="tabla-empty py-3">
            <i class="bi bi-clock-history display-6 text-muted mb-2"></i>
            <p class="text-muted small">Sin revisiones registradas todavía.</p>
          </div>
        {:else}
          {#each solicitud.validaciones ?? [] as v}
            <div class="hist-item">
              <div class="hist-icon {v.resultado}">
                <i
                  class="bi bi-{v.resultado === 'aprobado'
                    ? 'check-circle-fill'
                    : v.resultado === 'rechazado'
                      ? 'x-circle-fill'
                      : 'exclamation-circle-fill'}"
                  aria-hidden="true"
                ></i>
              </div>
              <div class="hist-body">
                <div class="hist-resultado {v.resultado}">
                  {v.resultado === "aprobado"
                    ? "Aprobado"
                    : v.resultado === "rechazado"
                      ? "Rechazado"
                      : v.resultado === "requiere_correccion"
                        ? "Requiere corrección"
                        : "Documentación incompleta"}
                  <span class="text-muted small ms-2"
                    >· {formatFecha(v.created_at, { hora: true })}</span
                  >
                </div>
                {#if v.comentarios}
                  <div class="hist-comentario">{v.comentarios}</div>
                {/if}
                {#if v.documentos_faltantes}
                  <div class="hist-docs-faltantes">
                    <strong class="small">Documentos faltantes:</strong>
                    <p class="small mb-0">{v.documentos_faltantes}</p>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        {/if}
      </div>
    {/if}
  {/if}
</div>

<!-- ══ Modal cambio de estado ══ -->
{#if modalEstado}
  <div
    class="modal-overlay"
    on:click={() => (modalEstado = false)}
    aria-hidden="true"
  ></div>
  <div class="modal-box" role="dialog" aria-modal="true">
    <div class="modal-header">
      <div class="modal-icon-primary">
        <i class="bi bi-arrow-repeat" aria-hidden="true"></i>
      </div>
      <h3 class="modal-titulo">Cambiar estado</h3>
    </div>
    <p class="modal-desc">
      Solicitud <strong>#{solicitudId}</strong> →
      <strong class="text-primary"
        >{ESTADOS_SOLICITUD[nuevoEstado]?.label ?? nuevoEstado}</strong
      >
    </p>
    <div class="mb-4">
      <label class="form-label small fw-semibold" for="obsSecretario">
        Observaciones para el solicitante
        {#if ["rechazada", "documentacion_incompleta"].includes(nuevoEstado)}
          <span class="text-danger">*</span>
        {/if}
      </label>
      <textarea
        class="form-control"
        rows="3"
        bind:value={obsSecretario}
        placeholder={["rechazada", "documentacion_incompleta"].includes(
          nuevoEstado,
        )
          ? "Explica el motivo..."
          : "Opcional — notas para el solicitante"}
      ></textarea>
    </div>
    <div class="modal-acciones">
      <button
        class="btn-modal-cancelar"
        on:click={() => (modalEstado = false)}
        disabled={cambiandoEstado}
      >
        Cancelar
      </button>
      <button
        class="btn-modal-primary"
        on:click={confirmarCambioEstado}
        disabled={cambiandoEstado}
      >
        {#if cambiandoEstado}
          <span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
        {/if}
        Confirmar
      </button>
    </div>
  </div>
{/if}

<!-- ══ Modal validar persona ══ -->
{#if modalValidar && personaValidando}
  <div
    class="modal-overlay"
    on:click={() => (modalValidar = false)}
    aria-hidden="true"
  ></div>
  <div class="modal-box" role="dialog" aria-modal="true">
    <div class="modal-header">
      <div class="modal-icon-primary">
        <i class="bi bi-person-check" aria-hidden="true"></i>
      </div>
      <h3 class="modal-titulo">Validar persona</h3>
    </div>
    <p class="modal-desc">
      <strong>{personaValidando.nombre}</strong> ·
      {ROLES_SOLICITUD[personaValidando.rol] ?? personaValidando.rol}
    </p>
    <div class="val-opciones mb-4">
      <label class="val-opcion {resultadoValidar ? 'activa-ok' : ''}">
        <input type="radio" bind:group={resultadoValidar} value={true} />
        <i class="bi bi-check-circle-fill me-2 text-success"></i>
        <div>
          <div class="fw-semibold small">Datos correctos</div>
          <div class="text-muted" style="font-size:.75rem">
            Los datos digitados coinciden con el documento
          </div>
        </div>
      </label>
      <label class="val-opcion {!resultadoValidar ? 'activa-ko' : ''}">
        <input type="radio" bind:group={resultadoValidar} value={false} />
        <i class="bi bi-x-circle-fill me-2 text-danger"></i>
        <div>
          <div class="fw-semibold small">Datos incorrectos</div>
          <div class="text-muted" style="font-size:.75rem">
            Los datos no coinciden con el documento físico
          </div>
        </div>
      </label>
    </div>
    <div class="mb-4">
      <label class="form-label small fw-semibold" for="obsValidacion">
        Observaciones {!resultadoValidar ? "*" : "(opcional)"}
      </label>
      <textarea
        class="form-control"
        rows="2"
        bind:value={obsValidacion}
        placeholder={!resultadoValidar
          ? "Indica qué datos no coinciden..."
          : "Notas adicionales..."}
      ></textarea>
    </div>
    <div class="modal-acciones">
      <button
        class="btn-modal-cancelar"
        on:click={() => (modalValidar = false)}
        disabled={validando}
      >
        Cancelar
      </button>
      <button
        class="btn-modal-primary"
        on:click={confirmarValidarPersona}
        disabled={validando}
      >
        {#if validando}
          <span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
        {/if}
        Confirmar validación
      </button>
    </div>
  </div>
{/if}

<!-- ══ Modal subir documento ══ -->
{#if modalDoc}
  <div
    class="modal-overlay"
    on:click={() => (modalDoc = false)}
    aria-hidden="true"
  ></div>
  <div class="modal-box" role="dialog" aria-modal="true">
    <div class="modal-header">
      <div class="modal-icon-primary">
        <i class="bi bi-upload" aria-hidden="true"></i>
      </div>
      <h3 class="modal-titulo">Subir documento</h3>
    </div>
    {#if errorDoc}
      <div class="alerta-error mb-3">{errorDoc}</div>
    {/if}
    <div class="mb-3">
      <label class="form-label small fw-semibold" for="docTipo">
        Tipo de documento <span class="text-danger">*</span>
      </label>
      <select class="form-select" bind:value={docTipo} id="docTipo">
        <option value="">-- Selecciona --</option>
        {#each TIPOS_DOCUMENTO_SOLICITUD as t}
          <option value={t.value}>{t.label}</option>
        {/each}
      </select>
    </div>
    <div class="mb-3">
      <label class="form-label small fw-semibold" for="descripcion"
        >Descripción (opcional)</label
      >
      <input
        type="text"
        class="form-control"
        id="descripcion"
        bind:value={docDescripcion}
        placeholder="Ej: Cédula del padrino"
      />
    </div>
    <div class="mb-4">
      <label class="form-label small fw-semibold" for="archivo">Archivo</label>
      <FileUpload
        accept="image/jpeg,image/png,image/webp,application/pdf"
        maxMb={10}
        label="Seleccionar o arrastrar documento"
        hint="PDF, JPG, PNG o WEBP · Máx 10 MB"
        uploading={subiendoDoc}
        on:select={(e) => {
          archivoSel = e.detail;
          errorDoc = "";
        }}
        on:clear={() => (archivoSel = null)}
      />
      {#if archivoSel}
        <div class="file-seleccionado mt-2">
          <i class="bi bi-paperclip me-1"></i>{archivoSel.name}
          <span class="text-muted small ms-2"
            >({(archivoSel.size / 1024).toFixed(0)} KB)</span
          >
        </div>
      {/if}
    </div>
    <div class="modal-acciones">
      <button
        class="btn-modal-cancelar"
        on:click={() => (modalDoc = false)}
        disabled={subiendoDoc}
      >
        Cancelar
      </button>
      <button
        class="btn-modal-primary"
        on:click={onSubirDoc}
        disabled={subiendoDoc}
      >
        {#if subiendoDoc}
          <span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>Subiendo...
        {:else}
          <i class="bi bi-upload me-2"></i>Subir
        {/if}
      </button>
    </div>
  </div>
{/if}
