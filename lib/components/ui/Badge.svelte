<!-- src/lib/components/ui/Badge.svelte -->
<script>
  // color: success | danger | warning | info | secondary | primary
  export let color = "secondary";
  export let label = "";

  const MAP = {
    success: "badge-ok",
    danger: "badge-error",
    warning: "badge-warn",
    info: "badge-info",
    secondary: "badge-sec",
    primary: "badge-prim",
  };
</script>

<span class="ui-badge {MAP[color] ?? 'badge-sec'}">{label}</span>

<style>
  .ui-badge {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 3px 10px;
    font-size: 0.72rem;
    font-weight: 700;
    white-space: nowrap;
    letter-spacing: 0.01em;
  }
  .badge-ok {
    background: #d1fae5;
    color: #065f46;
  }
  .badge-error {
    background: #fee2e2;
    color: #991b1b;
  }
  .badge-warn {
    background: #fef3c7;
    color: #92400e;
  }
  .badge-info {
    background: #dbeafe;
    color: #1e40af;
  }
  .badge-sec {
    background: #f1f5f9;
    color: #475569;
  }
  .badge-prim {
    background: rgba(26, 58, 92, 0.1);
    color: #1a3a5c;
  }
</style>
