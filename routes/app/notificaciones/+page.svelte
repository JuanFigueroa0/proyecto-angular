<!-- src/routes/admin/notificaciones/+page.svelte -->
<script>
  import "$lib/styles/admin/notificacion.css";
  import "$lib/styles/admin/admin.css";
  const NOTIFS_MOCK = [
    {
      id: 1,
      titulo: "Nueva solicitud de Bautismo",
      cuerpo: "Juan García ha solicitado un bautismo.",
      leida: false,
      tipo: "solicitud",
      fecha: "Hace 5 min",
    },
    {
      id: 2,
      titulo: "Solicitud #3 aprobada",
      cuerpo: "La solicitud de Confirmación fue aprobada.",
      leida: false,
      tipo: "aprobacion",
      fecha: "Hace 1 hora",
    },
    {
      id: 3,
      titulo: "Documentación incompleta — Solicitud #5",
      cuerpo: "Faltan documentos en la solicitud de Matrimonio.",
      leida: true,
      tipo: "alerta",
      fecha: "Ayer",
    },
    {
      id: 4,
      titulo: "Certificado CERT-2026-001 emitido",
      cuerpo: "Se emitió el certificado de Bautismo.",
      leida: true,
      tipo: "certificado",
      fecha: "Hace 2 días",
    },
  ];

  let notifs = [...NOTIFS_MOCK];
  let filtro = "todas"; // todas | no_leidas

  $: filtradas =
    filtro === "no_leidas" ? notifs.filter((n) => !n.leida) : notifs;
  $: noLeidas = notifs.filter((n) => !n.leida).length;

  function marcarLeida(id) {
    notifs = notifs.map((n) => (n.id === id ? { ...n, leida: true } : n));
  }

  function marcarTodas() {
    notifs = notifs.map((n) => ({ ...n, leida: true }));
  }

  const TIPO_ICON = {
    solicitud: { icon: "bi-file-earmark-plus", color: "#2563eb" },
    aprobacion: { icon: "bi-check-circle", color: "#16a34a" },
    alerta: { icon: "bi-exclamation-triangle", color: "#d97706" },
    certificado: { icon: "bi-patch-check", color: "#7c3aed" },
  };
</script>

<svelte:head><title>EcclesiaSys – Notificaciones</title></svelte:head>

<div class="pg-wrap" style="max-width:760px;margin:0 auto">
  <div class="pg-header">
    <div>
      <h1 class="pg-titulo">Notificaciones</h1>
      <p class="pg-subtitulo">
        {noLeidas > 0 ? `${noLeidas} sin leer` : "Todo al día"}
      </p>
    </div>
    {#if noLeidas > 0}
      <button class="btn-outline-sm" on:click={marcarTodas}>
        <i class="bi bi-check-all me-1"></i>Marcar todas leídas
      </button>
    {/if}
  </div>

  <!-- Tabs filtro -->
  <div class="notif-tabs mb-4">
    <button
      class="notif-tab {filtro === 'todas' ? 'active' : ''}"
      on:click={() => (filtro = "todas")}
    >
      Todas ({notifs.length})
    </button>
    <button
      class="notif-tab {filtro === 'no_leidas' ? 'active' : ''}"
      on:click={() => (filtro = "no_leidas")}
    >
      Sin leer ({noLeidas})
    </button>
  </div>

  {#if filtradas.length === 0}
    <div class="tabla-empty">
      <i class="bi bi-bell-slash display-5 text-muted mb-3" aria-hidden="true"
      ></i>
      <p class="text-muted">
        No hay notificaciones{filtro === "no_leidas" ? " sin leer" : ""}.
      </p>
    </div>
  {:else}
    <div class="notifs-lista">
      {#each filtradas as n (n.id)}
        <div class="notif-item {n.leida ? 'leida' : 'no-leida'}">
          <div class="notif-icon" style="color:{TIPO_ICON[n.tipo]?.color}">
            <i class="bi {TIPO_ICON[n.tipo]?.icon}" aria-hidden="true"></i>
          </div>
          <div class="notif-body">
            <div class="notif-titulo">{n.titulo}</div>
            <div class="notif-cuerpo">{n.cuerpo}</div>
            <div class="notif-fecha">{n.fecha}</div>
          </div>
          {#if !n.leida}
            <button
              class="notif-marcar"
              on:click={() => marcarLeida(n.id)}
              title="Marcar como leída"
            >
              <i class="bi bi-check2" aria-hidden="true"></i>
            </button>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
