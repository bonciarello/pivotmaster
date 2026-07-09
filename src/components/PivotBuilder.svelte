<script>
  import ColumnChip from './ColumnChip.svelte';
  import DropZone from './DropZone.svelte';
  import FilterPopover from './FilterPopover.svelte';
  import {
    rowsFields, colsFields, valuesFields, filtersFields,
    unassignedColumns, filterState, rawData, dragInfo
  } from '../lib/stores.js';

  // Local state for filter popover
  let openFilterCol = null;

  $: unassigned = $unassignedColumns;
  $: rows = $rowsFields;
  $: cols = $colsFields;
  $: vals = $valuesFields;
  $: filts = $filtersFields;
  $: filters = $filterState;
  $: data = $rawData;

  /** Move a column to a target zone (removing from its source zone first) */
  function moveColumn(column, targetZone) {
    // Remove from all zones
    rowsFields.update(r => r.filter(c => c !== column));
    colsFields.update(c => c.filter(col => col !== column));
    valuesFields.update(v => v.filter(col => col !== column));
    filtersFields.update(f => f.filter(col => col !== column));

    // Also clear any filter state for this column if moving away from filters
    if (targetZone !== 'filters') {
      filterState.update(fs => {
        const updated = { ...fs };
        delete updated[column];
        return updated;
      });
    }

    // Add to target zone
    if (targetZone === 'rows') {
      rowsFields.update(r => [...r, column]);
    } else if (targetZone === 'columns') {
      colsFields.update(c => [...c, column]);
    } else if (targetZone === 'values') {
      valuesFields.update(v => [...v, column]);
    } else if (targetZone === 'filters') {
      filtersFields.update(f => [...f, column]);
    }
  }

  /** Remove a column from its current zone (back to pool) */
  function removeFromZone(column, zone) {
    if (zone === 'rows') rowsFields.update(r => r.filter(c => c !== column));
    else if (zone === 'columns') colsFields.update(c => c.filter(col => col !== column));
    else if (zone === 'values') valuesFields.update(v => v.filter(col => col !== column));
    else if (zone === 'filters') {
      filtersFields.update(f => f.filter(col => col !== column));
      // Clear filter state
      filterState.update(fs => {
        const updated = { ...fs };
        delete updated[column];
        return updated;
      });
      if (openFilterCol === column) openFilterCol = null;
    }
    dragInfo.set({ column: null, sourceZone: null });
  }

  function handleDropZone(e) {
    const { column, targetZone } = e.detail;
    if (column) {
      moveColumn(column, targetZone);
    }
    dragInfo.set({ column: null, sourceZone: null });
  }

  function handleRemoveColumn(e) {
    const { column, zone } = e.detail;
    removeFromZone(column, zone);
  }

  function handleChipDragStart(e) {
    const { column, sourceZone } = e.detail;
    dragInfo.set({ column, sourceZone });
  }

  function handlePoolDrop(e) {
    e.preventDefault();
    const drag = $dragInfo;
    if (drag.column && drag.sourceZone) {
      removeFromZone(drag.column, drag.sourceZone);
    }
  }

  function handlePoolDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function toggleFilter(col) {
    if (openFilterCol === col) {
      openFilterCol = null;
    } else {
      openFilterCol = col;
    }
  }

  function handleFilterChange(e) {
    const { column, values } = e.detail;
    filterState.update(fs => ({ ...fs, [column]: values }));
  }

  function handleFilterClose() {
    openFilterCol = null;
  }
</script>

<div class="pivot-builder">
  <!-- Pool: unassigned columns -->
  <div class="pool-section">
    <div class="section-eyebrow">Colonne disponibili</div>
    <div
      class="pool-area"
      on:dragover={handlePoolDragOver}
      on:drop={handlePoolDrop}
      role="region"
      aria-label="Colonne non assegnate: trascinale in un'area"
    >
      {#if unassigned.length === 0}
        <p class="pool-empty">Tutte le colonne sono state assegnate.</p>
      {:else}
        <div class="pool-chips">
          {#each unassigned as col (col)}
            <ColumnChip
              name={col}
              zone={null}
              removable={false}
              on:dragstart={handleChipDragStart}
            />
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Drop zones grid -->
  <div class="zones-grid">
    <DropZone
      title="Righe"
      zoneName="rows"
      columns={rows}
      description="Raggruppa le righe per questi campi"
      on:dropcolumn={handleDropZone}
      on:removecolumn={handleRemoveColumn}
      on:chipdragstart={handleChipDragStart}
    />

    <DropZone
      title="Colonne"
      zoneName="columns"
      columns={cols}
      description="Crea colonne pivot per questi campi"
      on:dropcolumn={handleDropZone}
      on:removecolumn={handleRemoveColumn}
      on:chipdragstart={handleChipDragStart}
    />

    <DropZone
      title="Valori"
      zoneName="values"
      columns={vals}
      description="Somma e conteggio automatici"
      on:dropcolumn={handleDropZone}
      on:removecolumn={handleRemoveColumn}
      on:chipdragstart={handleChipDragStart}
    />

    <div class="filter-zone-wrapper">
      <DropZone
        title="Filtri"
        zoneName="filters"
        columns={filts}
        description="Filtra i dati prima del calcolo"
        on:dropcolumn={handleDropZone}
        on:removecolumn={handleRemoveColumn}
        on:chipdragstart={handleChipDragStart}
      />
      <!-- Filter popovers -->
      {#each filts as col (col)}
        <div class="filter-trigger-container">
          <button
            class="filter-trigger"
            class:active={openFilterCol === col}
            on:click={() => toggleFilter(col)}
            aria-label={`Configura filtro per ${col}`}
            aria-expanded={openFilterCol === col}
            type="button"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M1.5 3.5h13l-5 5v4l-3 1.5v-5.5l-5-5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>
            {filters[col] && filters[col].length > 0 ? `${filters[col].length} selez.` : 'Tutti'}
          </button>
          {#if openFilterCol === col}
            <FilterPopover
              column={col}
              data={data}
              selectedValues={filters[col] || []}
              on:change={handleFilterChange}
              on:close={handleFilterClose}
            />
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .pivot-builder {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .pool-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .section-eyebrow {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .pool-area {
    background: var(--bg-surface);
    border: 2px dashed var(--border-light);
    border-radius: var(--radius-md);
    padding: var(--space-3);
    min-height: 56px;
    display: flex;
    align-items: center;
    transition: border-color var(--transition-fast),
                background var(--transition-fast);
  }

  .pool-area:hover {
    border-color: var(--border);
  }

  .pool-empty {
    font-size: var(--text-sm);
    color: var(--text-muted);
    font-style: italic;
    width: 100%;
    text-align: center;
  }

  .pool-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: center;
  }

  .zones-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }

  .filter-zone-wrapper {
    position: relative;
  }

  .filter-trigger-container {
    position: relative;
    margin-top: var(--space-2);
  }

  .filter-trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    min-height: 30px;
    transition: background var(--transition-fast),
                border-color var(--transition-fast),
                color var(--transition-fast);
  }

  .filter-trigger:hover,
  .filter-trigger.active {
    border-color: var(--zone-filters);
    color: var(--zone-filters);
    background: color-mix(in srgb, var(--zone-filters) 6%, var(--bg-surface));
  }

  /* Mobile: single column zones */
  @media (max-width: 640px) {
    .zones-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
