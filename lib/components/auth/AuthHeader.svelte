<script>
  export let titulo = "";
  export let subtitulo = "";
</script>

<div class="text-center mb-4">
  <span class="auth-cross-sm">✝</span>
  <h2 class="auth-form-title mt-1">{titulo}</h2>
  {#if subtitulo}
    <p class="auth-form-subtitle">{subtitulo}</p>
  {/if}
</div>
