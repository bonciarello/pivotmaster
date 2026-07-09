<script>
  import { createEventDispatcher } from 'svelte';
  import ColumnChip from './ColumnChip.svelte';

  /** @type {string} */
  export let title;
  /** @type {string} */
  export let zoneName;
  /** @type {string[]} */
  export let columns = [];
  /** @type {string} */
  export let description = '';
  /** @type {string} */
  export let icon = '';

  const dispatch = createEventDispatcher();

  const zoneIcons = {
    rows: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1.5" width="14" height="3" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="6.5" width="14" height="3" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="11.5" width="14" height="3" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>`,
    columns: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1" width="3" height="14" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="6.5" y="1" width="3" height="14" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="11.5" y="1" width="3" height="14" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>`,
    values: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="5" cy="11" r="1.5" fill="currentColor"/><circle cx="8" cy="7" r="1.5" fill="currentColor"/><circle cx="11" cy="4" r="1.5" fill="currentColor"/><line x1="5.9" y1="10" x2="7.4" y2="7.5" stroke="currentColor" stroke-width="1.2"/><line x1="8.6" y1="6" x2="10.1" y2="4.5" stroke="currentColor" stroke-width="1.2"/></svg>`,
    filters: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.5 3.5h13l-5 5v4l-3 1.5v-5.5l-5-5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`
  };

  const zoneColors = {
    rows: 'var(--zone-rows)',
    columns: 'var(--zone-cols)',
    values: 'var(--zone-values)',
    filters: 'var(--zone-filters)'
  };

  $: zoneColor = zoneColors[zoneName] || 'var(--text-muted)';
  $: effectiveIcon = icon || zoneIcons[zoneName] || '';

  let isDragOver = false;

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    isDragOver = true;
  }

  function handleDragLeave() {
    isDragOver = false;
  }

  function handleDrop(e) {
    e.preventDefault();
    isDragOver = false;
    const columnName = e.dataTransfer.getData('text/plain');
    if (columnName) {
      dispatch('dropcolumn', { column: columnName, targetZone: zoneName });
    }
  }

  function handleRemove(e) {
    dispatch('removecolumn', e.detail);
  }

  function handleChipDragStart(e) {
    dispatch('chipdragstart', e.detail);
  }
</script>

<div
  class="dropzone"
  class:dragover={isDragOver}
  style="--zone-color: {zoneColor}"
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  role="region"
  aria-label={`Area ${title}: trascina qui le colonne`}
>
  <div class="zone-header">
    <span class="zone-icon">{@html effectiveIcon}</span>
    <h3 class="zone-title">{title}</h3>
    {#if description}
      <span class="zone-desc">{description}</span>
    {/if}
  </div>

  <div class="zone-content">
    {#if columns.length === 0}
      <p class="zone-placeholder">Trascina qui una colonna</p>
    {:else}
      <div class="zone-chips">
        {#each columns as col (col)}
          <ColumnChip
            name={col}
            zone={zoneName}
            removable={true}
            on:remove={handleRemove}
            on:dragstart={handleChipDragStart}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .dropzone {
    border: 2px dashed var(--border-zone);
    border-radius: var(--radius-md);
    padding: var(--space-3);
    background: var(--bg-surface);
    transition: border-color var(--transition-fast),
                background var(--transition-fast),
                box-shadow var(--transition-fast);
    min-height: 72px;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .dropzone.dragover {
    border-color: var(--zone-color);
    background: color-mix(in srgb, var(--zone-color) 4%, var(--bg-surface));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--zone-color) 12%, transparent);
  }

  .zone-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .zone-icon {
    display: flex;
    align-items: center;
    color: var(--zone-color);
    flex-shrink: 0;
  }

  .zone-title {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .zone-desc {
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin-left: auto;
  }

  .zone-content {
    flex: 1;
    display: flex;
    align-items: center;
    min-height: 36px;
  }

  .zone-placeholder {
    font-size: var(--text-sm);
    color: var(--text-muted);
    font-style: italic;
    user-select: none;
  }

  .zone-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: center;
  }
</style>
