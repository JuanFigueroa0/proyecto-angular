<!-- src/routes/app/solicitudes/nueva/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import FileUpload from "$lib/components/ui/FileUpload.svelte";
  import Spinner from "$lib/components/ui/Spinner.svelte";
  import {
    getSacramentos,
    getRequisitosSacramento,
    crearSolicitud,
    subirDocumentoSolicitud,
    getMisSolicitudes,
    getSolicitud,
    ROLES_POR_SACRAMENTO,
    TIPOS_DOCUMENTO_SOLICITUD,
    NOMBRES_SACRAMENTO,
  } from "$lib/js/interfaces/solicitudes.js";
  import { getRolesNormalizados } from "$lib/js/interfaces/navigation.js";
  import { toast } from "$lib/js/stores/ui.js";
  import "$lib/styles/admin/solicitudes.css";
  const ROLES_ADMIN = ["superadmin", "secretario", "parroco"];
  let esAdmin = false;

  // ── Pasos ─────────────────────────────────────────────────
  let paso = 1;
  let cargando = true;
  let enviando = false;
  let error = "";

  // ── Solicitud previa incompleta ───────────────────────────
  let solicitudPrevia = null;
  let mostrandoRecuperacion = false;

  // ── Paso 1 ────────────────────────────────────────────────
  let sacramentos = [];
  let sacramentoSel = null;
  let requisitos = [];
  let cargandoRequisitos = false;

  // ── Paso 2 ────────────────────────────────────────────────
  let personas = [];
  let fechaPreferida = "";
  let horaPreferida = "";
  let observaciones = "";
  let notasInternas = "";

  // ── Paso 4 ────────────────────────────────────────────────
  let solicitudCreada = null;
  let docsRequeridos = [];
  let docsSubidos = {};
  let subiendoDocs = {};

  // ── Validación de edades por sacramento ──────────────────
  const RESTRICCIONES_EDAD = {
    1: {
      padrino: { minAge: 16, label: "El padrino" },
      madrina: { minAge: 16, label: "La madrina" },
    },
    2: {
      receptor: { minAge: 7, maxAge: 18, label: "El comulgante" },
    },
    3: {
      receptor: { minAge: 12, label: "El confirmando" },
      padrino: { minAge: 16, label: "El padrino/madrina" },
    },
    4: {
      contrayente: { minAge: 18, label: "Los contrayentes" },
      testigo: { minAge: 18, label: "Los testigos" },
    },
  };

  const ICONOS = {
    Bautismo: "bi-droplet-fill",
    "Primera Comunión": "bi-cup-straw",
    Confirmación: "bi-shield-check",
    Matrimonio: "bi-hearts",
    "Unción de los Enfermos": "bi-heart-pulse-fill",
    Penitencia: "bi-chat-square-heart",
  };

  const TIPOS_DOC_ID = [
    { value: "CC", label: "Cédula de Ciudadanía" },
    { value: "TI", label: "Tarjeta de Identidad" },
    { value: "CE", label: "Cédula Extranjería" },
    { value: "PA", label: "Pasaporte" },
    { value: "RC", label: "Registro Civil" },
    { value: "sin_documento", label: "Sin documento" },
  ];

  const PASOS = [
    { n: 1, label: "Sacramento" },
    { n: 2, label: "Personas" },
    { n: 3, label: "Confirmar" },
    { n: 4, label: "Documentos" },
  ];

  const ESTADOS_EN_CURSO = [
    "pendiente",
    "en_revision",
    "documentacion_incompleta",
  ];

  onMount(async () => {
    const roles = getRolesNormalizados();
    esAdmin = ROLES_ADMIN.some((r) => roles.includes(r));

    const r = await getSacramentos();
    cargando = false;
    if (r.ok) sacramentos = (r.data ?? []).filter((s) => s.activo);
    else toast.error(r.error);
  });

  // ── Continuar solicitud previa ────────────────────────────
  function continuarSolicitudPrevia() {
    goto(`/app/solicitudes/${solicitudPrevia.id}`);
  }

  async function ignorarYCrearNueva() {
    const sac = solicitudPrevia?.sacramento;
    solicitudPrevia = null;
    mostrandoRecuperacion = false;
    if (sac) {
      sacramentoSel = sac;
      cargandoRequisitos = true;
      const r = await getRequisitosSacramento(sac.id);
      cargandoRequisitos = false;
      requisitos = r.ok ? (r.data ?? []) : [];

      const rolesDef = ROLES_POR_SACRAMENTO[sac.id] ?? {};
      let rolesEntries = Object.entries(rolesDef);
      if (sac.id === 4) {
        rolesEntries = [
          ["contrayente", { label: "Contrayente 1", obligatorio: true }],
          ["contrayente", { label: "Contrayente 2", obligatorio: true }],
          ...Object.entries(rolesDef).filter(([k]) =>
            ["testigo", "padrino", "madrina"].includes(k),
          ),
        ];
      }
      personas = rolesEntries.map(([rol, cfg]) => ({
        rol,
        label: cfg.label,
        obligatorio: cfg.obligatorio,
        expandido: cfg.obligatorio,
        datos: {
          primer_nombre: "",
          segundo_nombre: "",
          primer_apellido: "",
          segundo_apellido: "",
          tipo_documento: "CC",
          numero_documento: "",
          fecha_nacimiento: "",
          lugar_nacimiento: "",
        },
      }));
      paso = 2;
    }
  }

  // ── Normalizar texto ──────────────────────────────────────
  function normalizarNombre(v) {
    if (!v) return "";
    return v
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  function onBlurNombre(personaIdx, campo) {
    personas[personaIdx].datos[campo] = normalizarNombre(
      personas[personaIdx].datos[campo],
    );
    personas = [...personas];
  }

  // ── Calcular edad ─────────────────────────────────────────
  function calcularEdad(fechaNac) {
    if (!fechaNac) return null;
    const hoy = new Date();
    const nac = new Date(fechaNac);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }

  function edadTexto(fecha) {
    const e = calcularEdad(fecha);
    return e !== null ? `${e} años` : "";
  }

  // ── Validar edades según sacramento ──────────────────────
  function validarEdades() {
    if (!sacramentoSel) return null;
    const restricciones = RESTRICCIONES_EDAD[sacramentoSel.id] ?? {};
    for (const p of personas) {
      const r = restricciones[p.rol];
      if (!r) continue;
      const edad = calcularEdad(p.datos.fecha_nacimiento);
      if (edad === null) continue;
      if (r.minAge !== undefined && edad < r.minAge)
        return `${r.label} debe tener al menos ${r.minAge} años (tiene ${edad}).`;
      if (r.maxAge !== undefined && edad > r.maxAge)
        return `${r.label} no puede tener más de ${r.maxAge} años (tiene ${edad}).`;
    }
    return null;
  }

  // ── Seleccionar sacramento ────────────────────────────────
  async function seleccionarSacramento(sac) {
    const rPrev = await getMisSolicitudes({ pagina: 1, por_pagina: 50 });
    if (rPrev.ok) {
      const items = rPrev.data?.items ?? rPrev.data ?? [];
      const duplicada = items.find(
        (s) =>
          s.sacramento_id === sac.id && ESTADOS_EN_CURSO.includes(s.estado),
      );
      if (duplicada) {
        solicitudPrevia = { ...duplicada, sacramento: sac };
        mostrandoRecuperacion = true;
        return;
      }
    }

    solicitudPrevia = null;
    mostrandoRecuperacion = false;

    sacramentoSel = sac;
    cargandoRequisitos = true;
    const r = await getRequisitosSacramento(sac.id);
    cargandoRequisitos = false;
    requisitos = r.ok ? (r.data ?? []) : [];

    const rolesDef = ROLES_POR_SACRAMENTO[sac.id] ?? {};
    let rolesEntries = Object.entries(rolesDef);

    if (sac.id === 4) {
      rolesEntries = [
        ["contrayente", { label: "Contrayente 1", obligatorio: true }],
        ["contrayente", { label: "Contrayente 2", obligatorio: true }],
        ...Object.entries(rolesDef).filter(([k]) =>
          ["testigo", "padrino", "madrina"].includes(k),
        ),
      ];
    }

    personas = rolesEntries.map(([rol, cfg]) => ({
      rol,
      label: cfg.label,
      obligatorio: cfg.obligatorio,
      expandido: cfg.obligatorio,
      datos: {
        primer_nombre: "",
        segundo_nombre: "",
        primer_apellido: "",
        segundo_apellido: "",
        tipo_documento: "CC",
        numero_documento: "",
        fecha_nacimiento: "",
        lugar_nacimiento: "",
      },
    }));

    paso = 2;
  }

  // ── Validaciones paso 2 ───────────────────────────────────
  function validarPersonas() {
    for (const p of personas) {
      if (!p.obligatorio) continue;
      if (!p.datos.primer_nombre.trim())
        return `Falta primer nombre de "${p.label}"`;
      if (!p.datos.primer_apellido.trim())
        return `Falta primer apellido de "${p.label}"`;
      if (
        p.datos.tipo_documento !== "sin_documento" &&
        !p.datos.numero_documento.trim()
      )
        return `Falta número de documento de "${p.label}"`;
    }
    return validarEdades();
  }

  function irPaso3() {
    error = validarPersonas() ?? "";
    if (!error) paso = 3;
  }

  function volver() {
    if (paso > 1) paso -= 1;
    else goto("/app/solicitudes");
  }

  // ── Mapear tipo de documento ──────────────────────────────
  // IMPORTANTE: cada descripción de requisito se mapea a un tipo canónico.
  // Múltiples requisitos pueden tener el mismo tipo (ej: doc identidad del
  // solicitante Y doc identidad del padrino → ambos son "documento_identidad").
  // La deduplicación se hace en construirDocsRequeridos().
  function mapearTipoDoc(descripcion) {
    const d = descripcion.toLowerCase();
    if (d.includes("registro civil")) return "registro_civil";
    if (d.includes("bautismo")) return "certificado_bautismo";
    if (d.includes("confirmación") || d.includes("confirmacion"))
      return "certificado_confirmacion";
    if (d.includes("primera comunión") || d.includes("primera comunion"))
      return "certificado_primera_comunion";
    if (d.includes("defunción") || d.includes("defuncion"))
      return "acta_defuncion";
    if (d.includes("anulación") || d.includes("anulacion"))
      return "documento_anulacion";
    if (d.includes("custodia")) return "custodia_legal";
    if (
      d.includes("curso") ||
      d.includes("catequesis") ||
      d.includes("prematrimonial")
    )
      return "certificado_curso";
    // "identidad", "solicitante", "padrino", "madrina", "testigo", etc.
    // → todos son documentos de identidad
    if (
      d.includes("identidad") ||
      d.includes("padrino") ||
      d.includes("madrina") ||
      d.includes("testigo") ||
      d.includes("solicitante") ||
      d.includes("contrayente") ||
      d.includes("documento")
    )
      return "documento_identidad";
    return "otro";
  }

  // ── Construir docsRequeridos sin duplicados ───────────────
  // BUG FIX: varios requisitos pueden mapearse al mismo tipo (ej: doc padrino,
  // doc madrina, doc solicitante → todos "documento_identidad").
  // El {#each} de Svelte usa (doc.tipo) como clave → explota con duplicados.
  // Solución: agrupar por tipo, acumular descripciones, mantener 1 item por tipo.
  function construirDocsRequeridos(reqs) {
    /** @type {Map<string, {tipo:string, descripciones:string[], obligatorio:boolean}>} */
    const mapa = new Map();

    reqs
      .filter((req) => req.tipo_requisito === "documento")
      .forEach((req) => {
        const tipo = mapearTipoDoc(req.descripcion);
        if (mapa.has(tipo)) {
          const entry = mapa.get(tipo);
          // Si al menos uno es obligatorio, el grupo es obligatorio
          if (req.obligatorio) entry.obligatorio = true;
          // Acumular descripciones distintas para mostrarlas en UI
          if (!entry.descripciones.includes(req.descripcion)) {
            entry.descripciones.push(req.descripcion);
          }
        } else {
          mapa.set(tipo, {
            tipo,
            descripciones: [req.descripcion],
            obligatorio: req.obligatorio,
          });
        }
      });

    return Array.from(mapa.values()).map((entry) => ({
      tipo: entry.tipo,
      // Si hay varias descripciones del mismo tipo, las une con " / "
      descripcion:
        entry.descripciones.length > 1
          ? entry.descripciones.join(" / ")
          : entry.descripciones[0],
      obligatorio: entry.obligatorio,
    }));
  }

  // ── Crear solicitud ───────────────────────────────────────
  // ── Crear solicitud ───────────────────────────────────────
  async function enviarSolicitud() {
    error = "";
    enviando = true;

    // ── Construir personas ──────────────────────────────────
    const personasPayload = personas
      .filter(
        (p) => p.datos.primer_nombre.trim() && p.datos.primer_apellido.trim(),
      )
      .map((p) => {
        const fechaNac =
          p.datos.fecha_nacimiento && p.datos.fecha_nacimiento.trim() !== ""
            ? p.datos.fecha_nacimiento
            : null;

        const numDoc =
          p.datos.numero_documento && p.datos.numero_documento.trim() !== ""
            ? p.datos.numero_documento.trim()
            : null;

        return {
          rol_en_solicitud: p.rol,
          datos_digitados: {
            primer_nombre: normalizarNombre(p.datos.primer_nombre),
            segundo_nombre: normalizarNombre(p.datos.segundo_nombre) || null,
            primer_apellido: normalizarNombre(p.datos.primer_apellido),
            segundo_apellido:
              normalizarNombre(p.datos.segundo_apellido) || null,
            tipo_documento: p.datos.tipo_documento,
            numero_documento: numDoc,
            fecha_nacimiento: fechaNac,
            lugar_nacimiento:
              normalizarNombre(p.datos.lugar_nacimiento) || null,
          },
        };
      });

    // ── Guardia: verificar rol principal ───────────────────
    const ROLES_PRINCIPALES = ["receptor", "contrayente"];
    const tieneRolPrincipal = personasPayload.some((p) =>
      ROLES_PRINCIPALES.includes(p.rol_en_solicitud),
    );
    if (!tieneRolPrincipal) {
      error =
        "Falta completar los datos de la persona principal del sacramento (nombre y apellido obligatorios).";
      enviando = false;
      return;
    }

    const obsFinal =
      esAdmin && notasInternas.trim()
        ? `${observaciones}\n[Nota interna]: ${notasInternas}`.trim()
        : observaciones || null;

    // ── Llamada principal: crear solicitud ─────────────────
    let r;
    try {
      r = await crearSolicitud({
        sacramento_id: sacramentoSel.id,
        personas: personasPayload,
        fecha_preferida: fechaPreferida || null,
        hora_preferida: horaPreferida || null,
        observaciones: obsFinal,
      });
    } catch (e) {
      error = "Error inesperado al crear la solicitud. Intenta de nuevo.";
      enviando = false;
      return;
    }

    if (!r.ok) {
      error = r.error ?? "Error al crear la solicitud.";
      enviando = false;
      return;
    }

    // ── Solicitud creada ────────────────────────────────────
    solicitudCreada = r.data;

    // Construir lista de documentos desde los requisitos ya cargados
    docsRequeridos = construirDocsRequeridos(requisitos);

    // Verificar documentos ya vinculados por el backend (no bloquea el flujo)
    // Se usa Promise.race con timeout para que nunca congele el spinner
    const fetchDocs = getSolicitud(solicitudCreada.id)
      .then((rDet) => {
        if (!rDet.ok) return;
        const docsExistentes = rDet.data?.documentos ?? [];
        const nuevosSubidos = {};
        docsExistentes.forEach((d) => {
          const tipo = d.tipo_documento;
          if (tipo) {
            nuevosSubidos[tipo] = {
              subido: true,
              url: d.archivo?.cloudinary_url ?? null,
              nombre: d.archivo?.nombre_original ?? "Documento existente",
            };
          }
        });
        docsSubidos = nuevosSubidos;
      })
      .catch((e) => {
        console.warn("No se pudieron verificar documentos previos:", e);
      });

    // Timeout de 5 s: si getSolicitud tarda más, avanzamos igual
    const timeout = new Promise((resolve) => setTimeout(resolve, 5000));

    await Promise.race([fetchDocs, timeout]);

    // ✅ SIEMPRE avanza al paso 4, sin importar qué pasó arriba
    enviando = false;
    paso = 4;
  }

  // ── Subir documento ───────────────────────────────────────
  async function onSubirDoc(tipo, descripcion, file) {
    if (!file || !solicitudCreada) return;
    subiendoDocs = { ...subiendoDocs, [tipo]: true };

    const catMap = {
      documento_identidad: "documento_identidad",
      registro_civil: "registro_civil",
      certificado_bautismo: "certificado_externo",
      certificado_confirmacion: "certificado_externo",
      certificado_primera_comunion: "certificado_externo",
      acta_defuncion: "acta_defuncion",
      certificado_curso: "certificado_curso",
      documento_anulacion: "documento_anulacion",
      custodia_legal: "custodia_legal",
    };

    const r = await subirDocumentoSolicitud(solicitudCreada.id, {
      file,
      tipo_documento: tipo,
      categoria: catMap[tipo] ?? "otro",
      descripcion,
    });

    subiendoDocs = { ...subiendoDocs, [tipo]: false };

    if (r.ok) {
      const url =
        r.data?.cloudinary_url ?? r.data?.archivo?.cloudinary_url ?? null;
      docsSubidos = {
        ...docsSubidos,
        [tipo]: { subido: true, url, nombre: file.name },
      };
      toast.success("Documento subido correctamente");
    } else {
      toast.error(r.error ?? "Error al subir documento.");
    }
  }

  function previsualizarDoc(tipo) {
    const url = docsSubidos[tipo]?.url;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  function finalizarYVer() {
    goto(`/app/solicitudes/${solicitudCreada.id}`);
  }
</script>

<svelte:head><title>Nueva Solicitud · EcclesiaSys</title></svelte:head>

<div class="nueva-page">
  <!-- ══ PANTALLA: Solicitud previa en curso ══ -->
  {#if mostrandoRecuperacion && solicitudPrevia}
    <div class="nueva-header">
      <h1 class="nueva-titulo">Nueva Solicitud</h1>
    </div>

    <div class="recuperacion-card">
      <div class="recuperacion-icon">
        <i
          class="bi bi-exclamation-triangle-fill text-warning"
          style="font-size:2rem"
        ></i>
      </div>
      <div class="recuperacion-body">
        <div class="recuperacion-titulo">Tienes una solicitud en curso</div>

        <div class="recuperacion-desc">
          Ya tienes una solicitud de
          <strong
            >{solicitudPrevia.sacramento?.nombre ?? "este sacramento"}</strong
          >
          en curso (solicitud <strong>#{solicitudPrevia.id}</strong>), con
          estado
          <span class="estado-inline {solicitudPrevia.estado}">
            {solicitudPrevia.estado === "documentacion_incompleta"
              ? "documentación incompleta"
              : solicitudPrevia.estado.replace("_", " ")}
          </span>.
          {#if solicitudPrevia.estado === "documentacion_incompleta"}
            <br /><span class="text-danger small fw-semibold">
              <i class="bi bi-exclamation-circle me-1"></i>
              El secretario indicó que hay documentación pendiente.
            </span>
          {/if}
          <br /><span class="text-muted small">
            No es posible crear una nueva solicitud del mismo tipo hasta que
            esta finalice.
          </span>
        </div>
        <div class="recuperacion-acciones">
          <button class="btn-prim" on:click={continuarSolicitudPrevia}>
            <i class="bi bi-arrow-right-circle me-2"></i>
            Ver y continuar solicitud #{solicitudPrevia.id}
          </button>
          {#if esAdmin}
            <button class="btn-outline" on:click={ignorarYCrearNueva}>
              <i class="bi bi-plus me-2"></i>Crear de todas formas
            </button>
          {/if}
        </div>
      </div>
    </div>

    <!-- ══ FORMULARIO NORMAL ══ -->
  {:else}
    <!-- Encabezado -->
    <div class="nueva-header">
      <a href="/app/solicitudes" class="btn-volver-link">
        <i class="bi bi-arrow-left me-1"></i>Solicitudes
      </a>
      <h1 class="nueva-titulo">Nueva Solicitud</h1>
      <p class="nueva-sub">
        Completa los pasos para registrar la solicitud sacramental
      </p>
    </div>

    <!-- Indicador de pasos -->
    <div class="pasos-bar mb-4">
      {#each PASOS as p}
        <div
          class="paso {paso === p.n ? 'activo' : ''} {paso > p.n
            ? 'hecho'
            : ''}"
        >
          <div class="paso-circulo">
            {#if paso > p.n}<i class="bi bi-check-lg"></i>{:else}{p.n}{/if}
          </div>
          <span class="paso-label">{p.label}</span>
        </div>
        {#if p.n < PASOS.length}
          <div class="paso-linea {paso > p.n ? 'hecha' : ''}"></div>
        {/if}
      {/each}
    </div>

    {#if cargando}
      <div class="d-flex justify-content-center py-5"><Spinner /></div>

      <!-- ════ PASO 1: Sacramento ════ -->
    {:else if paso === 1}
      <h2 class="sec-title mb-3">¿Qué sacramento deseas solicitar?</h2>
      <div class="sac-grid">
        {#each sacramentos as sac (sac.id)}
          <button
            class="sac-card"
            on:click={() => seleccionarSacramento(sac)}
            disabled={cargandoRequisitos}
          >
            <div class="sac-icono">
              <i
                class="bi {ICONOS[sac.nombre] ?? 'bi-award'}"
                aria-hidden="true"
              ></i>
            </div>
            <div class="sac-nombre">{sac.nombre}</div>
            {#if sac.nivel_riesgo === "alto"}
              <span class="sac-tag tag-manual">Revisión manual</span>
            {:else}
              <span class="sac-tag tag-auto">Proceso estándar</span>
            {/if}
            {#if sac.requiere_pago && sac.monto_sugerido}
              <div class="sac-pago">
                <i class="bi bi-cash-coin me-1"
                ></i>${sac.monto_sugerido.toLocaleString("es-CO")} COP
              </div>
            {/if}
          </button>
        {/each}
      </div>

      <!-- ════ PASO 2: Personas ════ -->
    {:else if paso === 2}
      <h2 class="sec-title mb-1">Datos de personas involucradas</h2>
      <p class="text-muted small mb-4">
        Los nombres se formatearán automáticamente (primera letra mayúscula). El
        sistema verificará si el número de documento ya existe.
      </p>

      {#if cargandoRequisitos}
        <div class="d-flex justify-content-center py-4"><Spinner /></div>
      {:else}
        {#each personas as p, i}
          {@const restriccion = (RESTRICCIONES_EDAD[sacramentoSel?.id] ?? {})[
            p.rol
          ]}
          <div class="persona-card mb-3">
            <button
              class="persona-header"
              on:click={() => (p.expandido = !p.expandido)}
              aria-expanded={p.expandido}
            >
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <span class="rol-badge">{p.label}</span>
                {#if p.obligatorio}
                  <span style="font-size:.75rem; color:#dc2626"
                    >Obligatorio</span
                  >
                {:else}
                  <span style="font-size:.75rem; color:var(--text-muted)"
                    >Opcional</span
                  >
                {/if}
                {#if restriccion}
                  <span class="restriccion-tag">
                    <i class="bi bi-person-check me-1"></i>
                    {restriccion.minAge
                      ? `Mín. ${restriccion.minAge} años`
                      : ""}
                    {restriccion.maxAge
                      ? ` · Máx. ${restriccion.maxAge} años`
                      : ""}
                  </span>
                {/if}
                {#if p.datos.fecha_nacimiento}
                  {@const edad = calcularEdad(p.datos.fecha_nacimiento)}
                  {#if edad !== null}
                    <span
                      class="edad-tag {restriccion &&
                      restriccion.minAge &&
                      edad < restriccion.minAge
                        ? 'edad-error'
                        : ''}"
                    >
                      {edad} años
                    </span>
                  {/if}
                {/if}
              </div>
              <i class="bi bi-chevron-{p.expandido ? 'up' : 'down'} text-muted"
              ></i>
            </button>

            {#if p.expandido}
              <div class="persona-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="lbl" for="pn{i}"
                      >Primer nombre <span class="text-danger">*</span></label
                    >
                    <input
                      id="pn{i}"
                      type="text"
                      class="form-control form-control-sm"
                      bind:value={p.datos.primer_nombre}
                      on:blur={() => onBlurNombre(i, "primer_nombre")}
                      placeholder="Ej: María"
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="lbl" for="sn{i}">Segundo nombre</label>
                    <input
                      id="sn{i}"
                      type="text"
                      class="form-control form-control-sm"
                      bind:value={p.datos.segundo_nombre}
                      on:blur={() => onBlurNombre(i, "segundo_nombre")}
                      placeholder="Opcional"
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="lbl" for="pa{i}"
                      >Primer apellido <span class="text-danger">*</span></label
                    >
                    <input
                      id="pa{i}"
                      type="text"
                      class="form-control form-control-sm"
                      bind:value={p.datos.primer_apellido}
                      on:blur={() => onBlurNombre(i, "primer_apellido")}
                      placeholder="Ej: González"
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="lbl" for="sa{i}">Segundo apellido</label>
                    <input
                      id="sa{i}"
                      type="text"
                      class="form-control form-control-sm"
                      bind:value={p.datos.segundo_apellido}
                      on:blur={() => onBlurNombre(i, "segundo_apellido")}
                      placeholder="Opcional"
                    />
                  </div>
                  <div class="col-md-5">
                    <label class="lbl" for="td{i}">Tipo de documento</label>
                    <select
                      id="td{i}"
                      class="form-select form-select-sm"
                      bind:value={p.datos.tipo_documento}
                    >
                      {#each TIPOS_DOC_ID as t}
                        <option value={t.value}>{t.label}</option>
                      {/each}
                    </select>
                  </div>
                  {#if p.datos.tipo_documento !== "sin_documento"}
                    <div class="col-md-7">
                      <label class="lbl" for="nd{i}"
                        >Número de documento <span class="text-danger">*</span
                        ></label
                      >
                      <input
                        id="nd{i}"
                        type="text"
                        class="form-control form-control-sm"
                        bind:value={p.datos.numero_documento}
                        on:blur={() => {
                          p.datos.numero_documento =
                            p.datos.numero_documento?.trim();
                          personas = [...personas];
                        }}
                        placeholder="Número de identificación"
                      />
                    </div>
                  {/if}
                  <div class="col-md-6">
                    <label class="lbl" for="fn{i}">
                      Fecha de nacimiento
                      {#if restriccion}
                        <span class="text-muted" style="font-weight:400">
                          (requerida para validar edad)
                        </span>
                      {/if}
                    </label>
                    <input
                      id="fn{i}"
                      type="date"
                      class="form-control form-control-sm"
                      bind:value={p.datos.fecha_nacimiento}
                    />
                    {#if p.datos.fecha_nacimiento && restriccion}
                      {@const edad = calcularEdad(p.datos.fecha_nacimiento)}
                      {#if edad !== null && restriccion.minAge && edad < restriccion.minAge}
                        <div class="campo-error-msg">
                          <i class="bi bi-exclamation-circle me-1"></i>
                          {restriccion.label} debe tener al menos {restriccion.minAge}
                          años
                        </div>
                      {:else if edad !== null && restriccion.maxAge && edad > restriccion.maxAge}
                        <div class="campo-error-msg">
                          <i class="bi bi-exclamation-circle me-1"></i>
                          {restriccion.label} no puede tener más de {restriccion.maxAge}
                          años
                        </div>
                      {:else if edad !== null}
                        <div class="campo-ok-msg">
                          <i class="bi bi-check-circle me-1"></i>{edad} años — válido
                        </div>
                      {/if}
                    {/if}
                  </div>
                  <div class="col-md-6">
                    <label class="lbl" for="ln{i}">Lugar de nacimiento</label>
                    <input
                      id="ln{i}"
                      type="text"
                      class="form-control form-control-sm"
                      bind:value={p.datos.lugar_nacimiento}
                      on:blur={() => onBlurNombre(i, "lugar_nacimiento")}
                      placeholder="Ciudad, País"
                    />
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {/each}

        <!-- Preferencias -->
        <div class="info-card mb-4">
          <div class="info-card-title mb-3">
            <i class="bi bi-calendar me-2"></i>Preferencias
          </div>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="lbl" for="fPref">Fecha preferida</label>
              <input
                type="date"
                id="fPref"
                class="form-control form-control-sm"
                bind:value={fechaPreferida}
              />
            </div>
            <div class="col-md-6">
              <label class="lbl" for="hPref">Hora preferida</label>
              <input
                type="time"
                id="hPref"
                class="form-control form-control-sm"
                bind:value={horaPreferida}
              />
            </div>
            <div class="col-12">
              <label class="lbl" for="obs">Observaciones</label>
              <textarea
                id="obs"
                class="form-control form-control-sm"
                rows="2"
                bind:value={observaciones}
                placeholder="Notas adicionales para el secretario..."
              ></textarea>
            </div>
            {#if esAdmin}
              <div class="col-12">
                <label class="lbl" for="notas">
                  <i class="bi bi-lock-fill me-1 text-warning"></i>Notas
                  internas (solo admin)
                </label>
                <textarea
                  id="notas"
                  class="form-control form-control-sm notas-internas"
                  rows="2"
                  bind:value={notasInternas}
                  placeholder="Contexto presencial, aclaraciones internas..."
                ></textarea>
              </div>
            {/if}
          </div>
        </div>

        {#if error}
          <div class="alerta-error mb-3">
            <i class="bi bi-exclamation-circle me-2"></i>{error}
          </div>
        {/if}

        <div class="d-flex justify-content-between">
          <button class="btn-outline" on:click={volver}>
            <i class="bi bi-arrow-left me-1"></i>Volver
          </button>
          <button class="btn-prim" on:click={irPaso3}>
            Continuar <i class="bi bi-arrow-right ms-1"></i>
          </button>
        </div>
      {/if}

      <!-- ════ PASO 3: Confirmar ════ -->
    {:else if paso === 3}
      <h2 class="sec-title mb-4">Confirmar solicitud</h2>

      <div class="info-card mb-3">
        <div class="d-flex align-items-center gap-3">
          <div class="sac-sel-icono">
            <i
              class="bi {ICONOS[sacramentoSel?.nombre] ?? 'bi-star'}"
              aria-hidden="true"
            ></i>
          </div>
          <div>
            <div class="fw-semibold" style="color:var(--primary)">
              {sacramentoSel?.nombre}
            </div>
            {#if fechaPreferida}
              <div class="text-muted small">
                <i class="bi bi-calendar me-1"></i>{fechaPreferida}
                {#if horaPreferida}· {horaPreferida}{/if}
              </div>
            {/if}
          </div>
          <div class="ms-auto">
            {#if sacramentoSel?.nivel_riesgo === "alto"}
              <span class="tag-badge tag-alto">Revisión manual requerida</span>
            {:else}
              <span class="tag-badge tag-bajo">Proceso estándar</span>
            {/if}
          </div>
        </div>
      </div>

      <div class="info-card mb-3">
        <div class="info-card-title mb-3">
          <i class="bi bi-people me-2"></i>Personas involucradas
        </div>
        {#each personas.filter((p) => p.datos.primer_nombre.trim()) as p}
          <div class="resumen-row">
            <span class="resumen-rol">{p.label}</span>
            <span class="resumen-nombre">
              {p.datos.primer_nombre}
              {p.datos.segundo_nombre ?? ""}
              {p.datos.primer_apellido}
              {p.datos.segundo_apellido ?? ""}
            </span>
            {#if p.datos.numero_documento}
              <span class="text-muted small ms-auto"
                >{p.datos.tipo_documento}: {p.datos.numero_documento}</span
              >
            {/if}
            {#if p.datos.fecha_nacimiento}
              <span class="text-muted small"
                >{edadTexto(p.datos.fecha_nacimiento)}</span
              >
            {/if}
          </div>
        {/each}
      </div>

      <div class="aviso-info mb-4">
        <i class="bi bi-info-circle-fill me-2 text-primary"></i>
        <div class="small">
          <strong>Siguiente paso:</strong> Tras enviar podrás subir los documentos
          requeridos. El sistema verificará si ya existen en la base de datos.
        </div>
      </div>

      {#if error}
        <div class="alerta-error mb-3">
          <i class="bi bi-exclamation-circle me-2"></i>{error}
        </div>
      {/if}

      <div class="d-flex justify-content-between">
        <button class="btn-outline" on:click={volver} disabled={enviando}>
          <i class="bi bi-arrow-left me-1"></i>Volver
        </button>
        <button class="btn-prim" on:click={enviarSolicitud} disabled={enviando}>
          {#if enviando}
            <span
              class="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>Enviando...
          {:else}
            <i class="bi bi-send me-2"></i>Enviar solicitud
          {/if}
        </button>
      </div>

      <!-- ════ PASO 4: Documentos ════ -->
    {:else if paso === 4}
      <div class="solicitud-ok-banner mb-4">
        <i
          class="bi bi-check-circle-fill text-success me-2"
          style="font-size:1.4rem"
        ></i>
        <div>
          <div class="fw-semibold" style="color:var(--primary)">
            ¡Solicitud #{solicitudCreada?.id} creada exitosamente!
          </div>
          <div class="text-muted small">
            Sube los documentos requeridos. Puedes completarlos después desde el
            detalle.
          </div>
        </div>
      </div>

      <h2 class="sec-title mb-2">Documentos requeridos</h2>
      <p class="text-muted small mb-4">
        Los marcados con <span class="text-danger fw-semibold">*</span> son
        obligatorios. Haz clic en <strong>Ver</strong> para previsualizar un archivo
        ya subido.
      </p>

      {#if docsRequeridos.length === 0}
        <div class="docs-ok-banner mb-4">
          <i
            class="bi bi-check-circle-fill text-success me-2"
            style="font-size:1.5rem"
          ></i>
          <div>
            <div class="fw-semibold">¡Sin documentos pendientes!</div>
            <div class="text-muted small">
              Todos los documentos ya existen en el sistema o no se requieren
              para este sacramento.
            </div>
          </div>
        </div>
      {:else}
        <div class="docs-lista mb-4">
          <!--
            CLAVE: (doc.tipo + '_' + i) en lugar de solo (doc.tipo).
            construirDocsRequeridos() garantiza unicidad de tipos,
            pero el índice es un seguro adicional ante datos inesperados del backend.
          -->
          {#each docsRequeridos as doc, i (doc.tipo + "_" + i)}
            {@const est = docsSubidos[doc.tipo]}
            <div class="doc-card {est?.subido ? 'subido' : ''}">
              <div class="doc-header">
                <div class="doc-icono">
                  <i class="bi bi-file-earmark-text"></i>
                </div>
                <div class="doc-info">
                  <div class="doc-nombre">
                    {doc.descripcion}
                    {#if doc.obligatorio}
                      <span class="text-danger ms-1">*</span>
                    {:else}
                      <span class="opc-tag ms-1">opcional</span>
                    {/if}
                  </div>
                  <div style="font-size:.74rem; color:var(--text-muted)">
                    {TIPOS_DOCUMENTO_SOLICITUD.find((t) => t.value === doc.tipo)
                      ?.label ?? doc.tipo}
                  </div>
                  {#if est?.nombre}
                    <div
                      style="font-size:.72rem; color:var(--text-muted); margin-top:2px"
                    >
                      <i class="bi bi-paperclip me-1"></i>{est.nombre}
                    </div>
                  {/if}
                </div>
                {#if est?.subido}
                  <div class="d-flex align-items-center gap-2 ms-auto">
                    <span class="doc-ok">
                      <i class="bi bi-check-circle-fill me-1"></i>Subido
                    </span>
                    {#if est?.url}
                      <button
                        class="btn-preview"
                        on:click={() => previsualizarDoc(doc.tipo)}
                        title="Ver documento"
                        aria-label="Ver {doc.descripcion}"
                      >
                        <i class="bi bi-eye me-1"></i>Ver
                      </button>
                    {/if}
                  </div>
                {/if}
              </div>
              {#if !est?.subido}
                <div class="doc-upload-zona">
                  <FileUpload
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    maxMb={10}
                    label="Seleccionar archivo"
                    hint="PDF, JPG, PNG · Máx 10 MB"
                    compact={true}
                    uploading={!!subiendoDocs[doc.tipo]}
                    on:select={(e) =>
                      onSubirDoc(doc.tipo, doc.descripcion, e.detail)}
                  />
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}

      <div class="d-flex justify-content-between align-items-center">
        <div class="text-muted small">
          {Object.values(docsSubidos).filter((d) => d?.subido).length} de
          {docsRequeridos.length}
          documento{docsRequeridos.length !== 1 ? "s" : ""} subido
        </div>
        <button class="btn-prim" on:click={finalizarYVer}>
          <i class="bi bi-eye me-2"></i>Ver solicitud
        </button>
      </div>
    {/if}
  {/if}
</div>

<style>
</style>
