<script>
  import { pivotToCSV, downloadCSV } from '../lib/export.js';

  /** @type {object|null} */
  export let pivotResult = null;

  $: disabled = !pivotResult;

  function handleExport() {
    if (!pivotResult) return;
    const csv = pivotToCSV(pivotResult);
    if (csv) {
      const ts = new Date().toISOString().slice(0, 10);
      downloadCSV(csv, `pivotmaster-${ts}.csv`);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleExport();
    }
  }
</script>

<button
  class="export-btn"
  on:click={handleExport}
  on:keydown={handleKeyDown}
  disabled={disabled}
  aria-label="Scarica la tabella pivot in formato CSV"
  type="button"
>
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 1v9.5M4 7l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2 12v1.5a1 1 0 001 1h10a1 1 0 001-1V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
  Scarica CSV
</button>

<style>
  .export-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    background: var(--accent-green);
    color: var(--text-inverse);
    border: none;
    border-radius: var(--radius-sm);
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
    min-height: 44px;
    transition: background var(--transition-fast),
                transform var(--transition-fast),
                box-shadow var(--transition-fast);
  }

  .export-btn:hover:not(:disabled) {
    background: #236A40;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .export-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .export-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .export-btn:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }
</style>
