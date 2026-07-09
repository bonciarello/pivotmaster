<script>
  /** @type {object|null} */
  export let pivotResult = null;

  function formatNumber(val) {
    if (val === null || val === undefined) return '—';
    // Show integers without decimals, floats with up to 2 decimals
    if (Number.isInteger(val)) return val.toLocaleString('it-IT');
    return val.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
</script>

{#if pivotResult}
  <div class="pivot-table-wrapper">
    {#if pivotResult.type === 'simple'}
      <!-- Simple grouped table -->
      <table class="pivot-table">
        <thead>
          <tr>
            {#each pivotResult.rowFields as rf}
              <th class="col-row-header" scope="col">{rf}</th>
            {/each}
            {#each pivotResult.valueFields as vf}
              <th class="col-sum" scope="col">Somma di {vf}</th>
              <th class="col-count" scope="col">Conteggio</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each pivotResult.rows as row, i}
            <tr class:alt={i % 2 === 1}>
              {#each row.rowKey as key}
                <td class="cell-row-key">{key || '(vuoto)'}</td>
              {/each}
              {#each pivotResult.valueFields as vf}
                <td class="cell-value cell-sum">{formatNumber(row.values[vf]?.sum)}</td>
                <td class="cell-value cell-count">{formatNumber(row.count)}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>

    {:else if pivotResult.type === 'cross'}
      <!-- Cross-tabulation table -->
      <table class="pivot-table pivot-cross">
        <thead>
          <tr>
            {#each pivotResult.rowFields as rf}
              <th class="col-row-header" scope="col" rowspan="2">{rf}</th>
            {/each}
            {#each pivotResult.colKeys as ck}
              <th class="col-col-header" scope="colgroup" colspan={pivotResult.valueFields.length * 2}>
                {ck.join(' — ') || '(vuoto)'}
              </th>
            {/each}
            <th class="col-total-header" scope="colgroup" colspan={pivotResult.valueFields.length * 2}>
              Totale
            </th>
          </tr>
          <tr>
            {#each pivotResult.colKeys as ck (ck.join(','))}
              {#each pivotResult.valueFields as vf}
                <th class="col-sub-sum" scope="col">Somma {vf}</th>
                <th class="col-sub-count" scope="col">N.</th>
              {/each}
            {/each}
            {#each pivotResult.valueFields as vf}
              <th class="col-sub-sum col-total-sub" scope="col">Somma {vf}</th>
              <th class="col-sub-count col-total-sub" scope="col">N.</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each pivotResult.rows as row, i}
            <tr class:alt={i % 2 === 1}>
              {#if row.rowKey}
                {#each row.rowKey as key}
                  <td class="cell-row-key">{key || '(vuoto)'}</td>
                {/each}
              {:else}
                <td class="cell-row-key cell-grand">Totale complessivo</td>
              {/if}

              {#each pivotResult.colKeys as ck}
                {@const ckStr = ck.join('\x00')}
                {@const cell = row.cells[ckStr]}
                {#each pivotResult.valueFields as vf}
                  <td class="cell-value cell-sum">{formatNumber(cell?.[vf]?.sum)}</td>
                  <td class="cell-value cell-count">{formatNumber(cell?.count)}</td>
                {/each}
              {/each}

              {#each pivotResult.valueFields as vf}
                <td class="cell-value cell-sum cell-total">{formatNumber(row.total?.[vf]?.sum)}</td>
                <td class="cell-value cell-count cell-total">{formatNumber(row.totalCount)}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}

    <div class="pivot-meta">
      {pivotResult.rows.length} righe &middot; {pivotResult.type === 'cross' ? pivotResult.colKeys.length + ' colonne pivot' : ''}
    </div>
  </div>
{:else}
  <div class="pivot-empty">
    <div class="empty-icon">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="36" height="36" rx="4" stroke="currentColor" stroke-width="1.5"/>
        <line x1="2" y1="12" x2="38" y2="12" stroke="currentColor" stroke-width="1.5"/>
        <line x1="12" y1="12" x2="12" y2="38" stroke="currentColor" stroke-width="1"/>
      </svg>
    </div>
    <p class="empty-text">Trascina almeno una colonna nell'area <strong>Valori</strong> per generare la tabella pivot.</p>
    <p class="empty-hint">Le colonne in Righe e Colonne definiscono i raggruppamenti. Ogni colonna in Valori produce una somma e un conteggio.</p>
  </div>
{/if}

<style>
  .pivot-table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .pivot-table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-body);
    font-size: var(--text-sm);
    line-height: 1.5;
  }

  .pivot-cross {
    font-size: var(--text-xs);
  }

  .pivot-table th {
    background: var(--bg-surface);
    color: var(--text-primary);
    font-weight: 600;
    text-align: left;
    padding: var(--space-2) var(--space-3);
    border-bottom: 2px solid var(--border);
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .pivot-table td {
    padding: var(--space-1) var(--space-3);
    border-bottom: 1px solid var(--border-light);
    min-height: 36px;
    vertical-align: middle;
  }

  .col-row-header {
    color: var(--zone-rows) !important;
    font-family: var(--font-display) !important;
    font-size: var(--text-xs);
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .col-col-header {
    color: var(--zone-cols) !important;
    text-align: center !important;
    font-family: var(--font-display) !important;
    font-size: var(--text-xs);
    letter-spacing: 0.03em;
  }

  .col-sum {
    color: var(--zone-values);
  }

  .col-count {
    color: var(--zone-filters);
    font-weight: 500;
  }

  .col-total-header {
    color: var(--accent-gold) !important;
    text-align: center !important;
    font-family: var(--font-display) !important;
    font-size: var(--text-xs);
  }

  .col-sub-sum,
  .col-sub-count {
    font-size: var(--text-xs);
    font-weight: 500;
    text-align: right !important;
  }

  .col-sub-sum {
    color: var(--text-secondary);
  }

  .col-sub-count {
    color: var(--text-muted);
  }

  .col-total-sub {
    color: var(--accent-gold) !important;
  }

  .cell-row-key {
    font-weight: 500;
    color: var(--text-primary);
    font-family: var(--font-body);
    white-space: nowrap;
  }

  .cell-grand {
    font-weight: 700 !important;
    font-family: var(--font-display) !important;
  }

  .cell-value {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .cell-sum {
    font-weight: 500;
    color: var(--text-primary);
  }

  .cell-count {
    color: var(--text-secondary);
    font-size: var(--text-xs);
  }

  .cell-total {
    font-weight: 600;
  }

  .cell-total.cell-sum {
    color: var(--accent-gold);
  }

  tr.alt td {
    background: var(--bg-surface);
  }

  .pivot-meta {
    margin-top: var(--space-2);
    font-size: var(--text-xs);
    color: var(--text-muted);
    text-align: right;
  }

  /* Empty state */
  .pivot-empty {
    text-align: center;
    padding: var(--space-8) var(--space-4);
    background: var(--bg-surface);
    border: 2px dashed var(--border-zone);
    border-radius: var(--radius-lg);
  }

  .empty-icon {
    color: var(--text-muted);
    margin-bottom: var(--space-3);
    display: inline-flex;
    opacity: 0.5;
  }

  .empty-text {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin-bottom: var(--space-1);
    line-height: 1.6;
  }

  .empty-text strong {
    color: var(--zone-values);
    font-weight: 600;
  }

  .empty-hint {
    font-size: var(--text-sm);
    color: var(--text-muted);
    max-width: 440px;
    margin: 0 auto;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .pivot-table {
      font-size: var(--text-xs);
    }

    .pivot-table th,
    .pivot-table td {
      padding: var(--space-1) var(--space-2);
    }

    .cell-value {
      font-size: var(--text-xs);
    }
  }
</style>
