<script>
  import DataInput from './components/DataInput.svelte';
  import PivotBuilder from './components/PivotBuilder.svelte';
  import PivotTable from './components/PivotTable.svelte';
  import ExportButton from './components/ExportButton.svelte';
  import { rawData, columns, filterState, hasData, effectiveData, rowsFields, colsFields, valuesFields } from './lib/stores.js';
  import { computePivot } from './lib/pivot.js';

  // Reactive pivot computation
  $: data = $effectiveData;
  $: rFields = $rowsFields;
  $: cFields = $colsFields;
  $: vFields = $valuesFields;
  $: pivot = computePivot(data, rFields, cFields, vFields);
  $: showBuilder = $hasData;

  function handleData(e) {
    const { headers, rows } = e.detail;
    rawData.set(rows);
    columns.set(headers);
    // Reset assignments and filters when new data is pasted
    filterState.set({});
  }
</script>

<div class="app">
  <!-- Header -->
  <header class="app-header">
    <div class="header-brand">
      <span class="header-logo" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="2" y="2" width="24" height="24" rx="4" stroke="currentColor" stroke-width="1.8"/>
          <rect x="5" y="6" width="18" height="3" rx="1" fill="currentColor" opacity="0.6"/>
          <rect x="5" y="11" width="18" height="3" rx="1" fill="currentColor" opacity="0.35"/>
          <rect x="5" y="16" width="18" height="3" rx="1" fill="currentColor" opacity="0.35"/>
          <rect x="5" y="21" width="10" height="3" rx="1" fill="currentColor" opacity="0.15"/>
        </svg>
      </span>
      <h1 class="header-title">PivotMaster</h1>
    </div>
    <p class="header-subtitle">Costruttore visuale di tabelle pivot — incolla, trascina, analizza</p>
  </header>

  <main class="app-main">
    <!-- Step 1: Data Input -->
    <section class="app-section" aria-labelledby="step1-title">
      <h2 id="step1-title" class="section-title">
        <span class="step-badge" aria-hidden="true">1</span>
        Incolla i dati
      </h2>
      <DataInput on:data={handleData} />
    </section>

    <!-- Step 2: Pivot Builder (only shown when data is available) -->
    {#if showBuilder}
      <section class="app-section" aria-labelledby="step2-title">
        <h2 id="step2-title" class="section-title">
          <span class="step-badge" aria-hidden="true">2</span>
          Costruisci la pivot
        </h2>
        <PivotBuilder />
      </section>
    {/if}

    <!-- Step 3: Pivot Result & Export -->
    {#if showBuilder}
      <section class="app-section" aria-labelledby="step3-title">
        <div class="section-header-row">
          <h2 id="step3-title" class="section-title">
            <span class="step-badge" aria-hidden="true">3</span>
            Risultato
          </h2>
          {#if pivot}
            <ExportButton pivotResult={pivot} />
          {/if}
        </div>
        <PivotTable pivotResult={pivot} />
      </section>
    {/if}
  </main>

  <footer class="app-footer">
    <p>PivotMaster &mdash; elaborazione completamente locale, nessun dato viene inviato a server esterni.</p>
  </footer>
</div>

<style>
  .app {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: var(--space-4) var(--space-4) var(--space-8);
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
    min-height: 100vh;
  }

  /* Header */
  .app-header {
    padding-top: var(--space-6);
    padding-bottom: var(--space-2);
    border-bottom: 2px solid var(--border);
  }

  .header-brand {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-1);
  }

  .header-logo {
    color: var(--accent-red);
    flex-shrink: 0;
  }

  .header-title {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .header-subtitle {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin-left: calc(28px + var(--space-3));
  }

  /* Main */
  .app-main {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .app-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .section-title {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .step-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--accent-red);
    color: var(--text-inverse);
    font-family: var(--font-display);
    font-size: var(--text-xs);
    font-weight: 700;
    flex-shrink: 0;
  }

  .section-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  /* Footer */
  .app-footer {
    margin-top: auto;
    padding-top: var(--space-6);
    border-top: 1px solid var(--border-light);
    text-align: center;
  }

  .app-footer p {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  /* Responsive */
  @media (max-width: 640px) {
    .app {
      padding: var(--space-3) var(--space-3) var(--space-6);
      gap: var(--space-6);
    }

    .app-header {
      padding-top: var(--space-4);
    }

    .header-title {
      font-size: var(--text-xl);
    }

    .header-subtitle {
      margin-left: 0;
      margin-top: var(--space-1);
    }

    .app-main {
      gap: var(--space-6);
    }
  }
</style>
