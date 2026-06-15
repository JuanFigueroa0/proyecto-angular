<!-- src/lib/components/ui/FileUpload.svelte -->
<script>
  import { createEventDispatcher } from "svelte";
  import "$lib/styles/upload.css";
  const dispatch = createEventDispatcher();

  // ── Props ────────────────────────────────────────────────
  export let accept = "image/*"; // tipos MIME aceptados
  export let maxMb = 2; // tamaño máximo en MB
  export let label = "Subir archivo";
  export let hint = "";
  export let preview = false; // mostrar preview de imagen
  export let previewUrl = ""; // URL actual (foto ya guardada)
  export let disabled = false;
  export let uploading = false; // estado de carga externo
  export let error = ""; // error externo
  export let compact = false; // modo compacto (sin drop zone grande)

  // ── Estado interno ───────────────────────────────────────
  let inputRef;
  let dragging = false;
  let localPreview = "";
  let localError = "";

  $: mostrarPreview = preview && (localPreview || previewUrl);
  $: urlMostrar = localPreview || previewUrl;
  $: errorMostrar = localError || error;

  // ── Validar archivo ──────────────────────────────────────
  function validar(file) {
    if (!file) return "No se seleccionó ningún archivo.";

    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes)
      return `El archivo supera el máximo de ${maxMb} MB.`;

    // Validar tipo MIME según accept
    if (accept && accept !== "*") {
      const tipos = accept.split(",").map((t) => t.trim());
      const ok = tipos.some((tipo) => {
        if (tipo.endsWith("/*")) {
          return file.type.startsWith(tipo.replace("/*", "/"));
        }
        return file.type === tipo || file.name.endsWith(tipo.replace(".", ""));
      });
      if (!ok) return `Tipo de archivo no permitido. Acepta: ${accept}`;
    }

    return null;
  }

  function procesarArchivo(file) {
    localError = "";
    const err = validar(file);
    if (err) {
      localError = err;
      dispatch("error", err);
      return;
    }

    // Preview local antes de subir
    if (preview && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => (localPreview = e.target.result);
      reader.readAsDataURL(file);
    }

    dispatch("select", file);
  }

  function onInputChange(e) {
    const file = e.target.files?.[0];
    if (file) procesarArchivo(file);
    e.target.value = "";
  }

  function onDrop(e) {
    e.preventDefault();
    dragging = false;
    if (disabled || uploading) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) procesarArchivo(file);
  }

  function onDragOver(e) {
    e.preventDefault();
    if (!disabled && !uploading) dragging = true;
  }

  function limpiar() {
    localPreview = "";
    localError = "";
    dispatch("clear");
  }
</script>

{#if compact}
  <!-- ── Modo compacto: solo botón ── -->
  <div class="fu-compact">
    <input
      bind:this={inputRef}
      type="file"
      {accept}
      on:change={onInputChange}
      disabled={disabled || uploading}
      class="visually-hidden"
      id="fu-input-compact"
    />
    <label
      for="fu-input-compact"
      class="fu-btn-compact {disabled || uploading ? 'fu-disabled' : ''}"
    >
      {#if uploading}
        <span
          class="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
        ></span>
        Subiendo...
      {:else}
        <i class="bi bi-upload me-2" aria-hidden="true"></i>
        {label}
      {/if}
    </label>

    {#if errorMostrar}
      <p class="fu-error mt-1">{errorMostrar}</p>
    {/if}
    {#if hint}
      <p class="fu-hint">{hint}</p>
    {/if}
  </div>
{:else}
  <!-- ── Modo completo: drop zone ── -->
  <div class="fu-wrap">
    {#if mostrarPreview}
      <div class="fu-preview-wrap">
        <img src={urlMostrar} alt="Preview" class="fu-preview-img" />
        {#if !uploading}
          <button
            type="button"
            class="fu-preview-clear"
            on:click={limpiar}
            title="Quitar imagen"
            aria-label="Quitar imagen"
          >
            <i class="bi bi-x" aria-hidden="true"></i>
          </button>
        {/if}
      </div>
    {/if}

    <input
      bind:this={inputRef}
      type="file"
      {accept}
      on:change={onInputChange}
      disabled={disabled || uploading}
      class="visually-hidden"
      id="fu-input-full"
    />

    <div
      class="fu-dropzone {dragging ? 'fu-drag-over' : ''} {disabled || uploading
        ? 'fu-disabled'
        : ''}"
      on:drop={onDrop}
      on:dragover={onDragOver}
      on:dragleave={() => (dragging = false)}
      role="button"
      tabindex={disabled || uploading ? -1 : 0}
      on:keydown={(e) => e.key === "Enter" && inputRef?.click()}
      on:click={() => inputRef?.click()}
      aria-label={label}
    >
      {#if uploading}
        <div class="fu-uploading">
          <span
            class="spinner-border text-primary mb-2"
            style="width:2rem;height:2rem;"
            role="status"
          ></span>
          <p class="fu-drop-text">Subiendo...</p>
        </div>
      {:else}
        <i class="bi bi-cloud-upload fu-icon" aria-hidden="true"></i>
        <p class="fu-drop-text">{label}</p>
        <p class="fu-drop-hint">
          {hint || `Arrastra aquí o haz clic · Máx ${maxMb} MB`}
        </p>
      {/if}
    </div>

    {#if errorMostrar}
      <p class="fu-error">{errorMostrar}</p>
    {/if}
  </div>
{/if}
