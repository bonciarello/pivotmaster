<script>
  import { createEventDispatcher, onMount } from 'svelte';

  /** @type {string} */
  export let column;
  /** @type {Record<string, string>[]} */
  export let data = [];
  /** @type {string[]} */
  export let selectedValues = [];

  const dispatch = createEventDispatcher();

  let uniqueValues = [];
  let allSelected = true;

  $: {
    const valueSet = new Set(data.map(r => String(r[column] ?? '')));
    uniqueValues = [...valueSet].sort();
    allSelected = selectedValues.length === 0 || selectedValues.length === uniqueValues.length;
  }

  function toggleValue(val) {
    let updated;
    if (selectedValues.includes(val)) {
      updated = selectedValues.filter(v => v !== val);
    } else {
      updated = [...selectedValues, val].sort();
    }

    // If all values are selected, clear the filter (no-op)
    if (updated.length === uniqueValues.length) {
      dispatch('change', { column, values: [] });
    } else {
      dispatch('change', { column, values: updated });
    }
  }

  function selectAll() {
    dispatch('change', { column, values: [] });
  }

  function deselectAll() {
    // Keep at least an empty array to indicate "nothing selected"
    dispatch('change', { column, values: [] });
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      dispatch('close');
    }
  }

  onMount(() => {
    // Focus trap-ish: focus the first checkbox
  });
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="popover" on:keydown={handleKeyDown}>
  <div class="popover-header">
    <span class="popover-title">Filtra: {column}</span>
    <button
      class="popover-close"
      on:click={() => dispatch('close')}
      aria-label="Chiudi filtro"
      type="button"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </div>

  <div class="popover-actions">
    <button class="action-link" on:click={selectAll} type="button">Seleziona tutti</button>
  </div>

  <ul class="popover-list" role="listbox" aria-label={`Valori di ${column}`}>
    {#each uniqueValues as val (val)}
      <li class="popover-item">
        <label class="filter-label">
          <input
            type="checkbox"
            checked={selectedValues.length === 0 || selectedValues.includes(val)}
            on:change={() => toggleValue(val)}
          />
          <span class="filter-value">{val || '(vuoto)'}</span>
        </label>
      </li>
    {/each}
  </ul>
</div>

<style>
  .popover {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: var(--space-2);
    background: var(--bg-input);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-popover);
    min-width: 200px;
    max-width: 280px;
    max-height: 260px;
    display: flex;
    flex-direction: column;
    z-index: 100;
    overflow: hidden;
  }

  .popover-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--border-light);
  }

  .popover-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
  }

  .popover-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .popover-close:hover {
    background: var(--bg-surface);
    color: var(--text-primary);
  }

  .popover-actions {
    padding: var(--space-1) var(--space-3);
    border-bottom: 1px solid var(--border-light);
  }

  .action-link {
    background: none;
    border: none;
    color: var(--accent-red);
    font-size: var(--text-xs);
    font-weight: 500;
    cursor: pointer;
    padding: var(--space-1) 0;
  }

  .action-link:hover {
    text-decoration: underline;
  }

  .popover-list {
    list-style: none;
    overflow-y: auto;
    padding: var(--space-1) 0;
  }

  .popover-item {
    padding: 0;
  }

  .filter-label {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-3);
    cursor: pointer;
    font-size: var(--text-sm);
    color: var(--text-primary);
    min-height: 32px;
    transition: background var(--transition-fast);
  }

  .filter-label:hover {
    background: var(--bg-surface-hover);
  }

  .filter-label input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--zone-filters);
    flex-shrink: 0;
  }

  .filter-value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
