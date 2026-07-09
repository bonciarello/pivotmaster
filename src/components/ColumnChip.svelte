<script>
  import { createEventDispatcher } from 'svelte';

  /** @type {string} */
  export let name;
  /** @type {string|null} */
  export let zone = null;
  /** @type {boolean} */
  export let removable = false;

  const dispatch = createEventDispatcher();

  const zoneColors = {
    rows: 'var(--zone-rows)',
    columns: 'var(--zone-cols)',
    values: 'var(--zone-values)',
    filters: 'var(--zone-filters)'
  };

  $: zoneColor = zone ? zoneColors[zone] || 'var(--text-muted)' : 'var(--text-secondary)';
  $: inPool = !zone;

  function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', name);
    e.dataTransfer.effectAllowed = 'move';
    dispatch('dragstart', { column: name, sourceZone: zone });
  }

  function handleDragEnd() {
    dispatch('dragend');
  }

  function handleRemove() {
    dispatch('remove', { column: name, zone });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (removable) {
        handleRemove();
      }
    }
  }
</script>

<div
  class="chip"
  class:in-pool={inPool}
  class:in-zone={!inPool}
  style={!inPool ? `--chip-color: ${zoneColor}` : ''}
  draggable="true"
  on:dragstart={handleDragStart}
  on:dragend={handleDragEnd}
  role="button"
  tabindex="0"
  aria-label={removable ? `${name} — clicca o premi Invio per rimuovere` : `${name} — trascina in un'area`}
  on:keydown={handleKeyDown}
>
  <span class="chip-label">{name}</span>
  {#if removable}
    <button
      class="chip-remove"
      on:click|stopPropagation={handleRemove}
      aria-label={`Rimuovi ${name}`}
      type="button"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  {/if}
</div>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 500;
    line-height: 1.4;
    cursor: grab;
    user-select: none;
    transition: transform var(--transition-fast),
                box-shadow var(--transition-fast),
                background var(--transition-fast);
    min-height: 32px;
    min-width: 44px;
  }

  .chip:active {
    cursor: grabbing;
  }

  .chip.in-pool {
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1.5px solid var(--border);
    box-shadow: var(--shadow-chip);
  }

  .chip.in-pool:hover {
    background: var(--bg-surface-hover);
    border-color: var(--text-muted);
    box-shadow: var(--shadow-chip-hover);
    transform: translateY(-1px);
  }

  .chip.in-pool:active {
    transform: translateY(0);
  }

  .chip.in-zone {
    background: color-mix(in srgb, var(--chip-color) 8%, var(--bg-surface));
    color: var(--chip-color);
    border: 1.5px solid color-mix(in srgb, var(--chip-color) 30%, var(--border));
    box-shadow: none;
  }

  .chip.in-zone:hover {
    background: color-mix(in srgb, var(--chip-color) 14%, var(--bg-surface));
  }

  .chip-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 160px;
  }

  .chip-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: currentColor;
    opacity: 0.5;
    cursor: pointer;
    flex-shrink: 0;
    transition: opacity var(--transition-fast), background var(--transition-fast);
  }

  .chip-remove:hover {
    opacity: 1;
    background: color-mix(in srgb, var(--chip-color) 20%, transparent);
  }

  .chip-remove:focus-visible {
    opacity: 1;
    outline: 2px solid var(--border-focus);
    outline-offset: 1px;
  }
</style>
