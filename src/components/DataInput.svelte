<script>
  import { createEventDispatcher } from 'svelte';
  import { parseCSV } from '../lib/csv.js';

  const dispatch = createEventDispatcher();

  let textareaValue = '';
  let delimiter = '';
  let rowCount = 0;
  let colCount = 0;
  let error = '';
  let isFocused = false;

  function handlePaste() {
    // Small delay to let the textarea update
    setTimeout(() => {
      processInput(textareaValue);
    }, 50);
  }

  function handleInput() {
    error = '';
    processInput(textareaValue);
  }

  function processInput(text) {
    if (!text || !text.trim()) {
      dispatch('data', { headers: [], rows: [], delimiter: '' });
      rowCount = 0;
      colCount = 0;
      delimiter = '';
      return;
    }

    try {
      const result = parseCSV(text);
      if (result.headers.length === 0) {
        error = 'Nessuna colonna riconosciuta. Verifica il formato dei dati.';
        dispatch('data', { headers: [], rows: [], delimiter: '' });
        rowCount = 0;
        colCount = 0;
        return;
      }

      if (result.rows.length === 0) {
        error = 'Servono almeno una riga di dati oltre all\'intestazione.';
        dispatch('data', { headers: result.headers, rows: [], delimiter: result.delimiter });
        colCount = result.headers.length;
        rowCount = 0;
        return;
      }

      error = '';
      delimiter = result.delimiter;
      rowCount = result.rows.length;
      colCount = result.headers.length;
      dispatch('data', { headers: result.headers, rows: result.rows, delimiter: result.delimiter });
    } catch (e) {
      error = 'Errore durante l\'analisi dei dati. Controlla il formato.';
      dispatch('data', { headers: [], rows: [], delimiter: '' });
      rowCount = 0;
      colCount = 0;
    }
  }

  function clearData() {
    textareaValue = '';
    error = '';
    rowCount = 0;
    colCount = 0;
    delimiter = '';
    dispatch('data', { headers: [], rows: [], delimiter: '' });
  }

  function handleExample() {
    textareaValue = 'Città,Categoria,Vendite,Quantità\nMilano,Elettronica,1500,12\nMilano,Abbigliamento,800,8\nRoma,Elettronica,2300,18\nRoma,Abbigliamento,600,5\nNapoli,Elettronica,900,7\nNapoli,Abbigliamento,450,4';
    processInput(textareaValue);
  }
</script>

<div class="data-input" class:focused={isFocused}>
  <div class="input-header">
    <label for="csv-input" class="input-label">Incolla i tuoi dati</label>
    <span class="input-hint">CSV o TSV — con intestazioni di colonna</span>
  </div>

  <textarea
    id="csv-input"
    bind:value={textareaValue}
    on:input={handleInput}
    on:paste={handlePaste}
    on:focus={() => isFocused = true}
    on:blur={() => isFocused = false}
    placeholder="Città, Categoria, Vendite&#10;Milano, Elettronica, 1500&#10;Roma, Abbigliamento, 800"
    rows="5"
    aria-describedby="input-status"
    aria-invalid={error ? 'true' : undefined}
  ></textarea>

  <div class="input-footer">
    <div id="input-status" class="input-status" aria-live="polite">
      {#if error}
        <span class="status-error">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.5"/>
            <path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          {error}
        </span>
      {:else if rowCount > 0}
        <span class="status-success">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.5"/>
            <path d="M4.5 7l2 2 3-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {rowCount} righe &middot; {colCount} colonne
          {#if delimiter === '\t'}
            &middot; delimitatore: TAB
          {:else if delimiter === ';'}
            &middot; delimitatore: punto e virgola
          {:else if delimiter}
            &middot; delimitatore: {delimiter}
          {/if}
        </span>
      {:else}
        <span class="status-idle">In attesa dei dati…</span>
      {/if}
    </div>
    <div class="input-actions">
      <button class="btn-ghost" on:click={handleExample} type="button">
        Carica esempio
      </button>
      {#if textareaValue}
        <button class="btn-ghost btn-clear" on:click={clearData} type="button">
          Pulisci
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .data-input {
    background: var(--bg-surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    transition: border-color var(--transition-fast),
                box-shadow var(--transition-fast);
  }

  .data-input.focused {
    border-color: var(--accent-red);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-red) 10%, transparent);
  }

  .input-header {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
    flex-wrap: wrap;
  }

  .input-label {
    font-family: var(--font-display);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
  }

  .input-hint {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  textarea {
    width: 100%;
    padding: var(--space-3);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    line-height: 1.6;
    color: var(--text-primary);
    background: var(--bg-input);
    resize: vertical;
    min-height: 100px;
    transition: border-color var(--transition-fast);
  }

  textarea:focus {
    outline: none;
    border-color: var(--accent-red);
  }

  textarea::placeholder {
    color: var(--text-muted);
    font-family: var(--font-body);
  }

  .input-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: var(--space-2);
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .input-status {
    font-size: var(--text-xs);
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .status-error {
    color: #DC2626;
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .status-success {
    color: var(--accent-green);
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .status-idle {
    color: var(--text-muted);
  }

  .input-actions {
    display: flex;
    gap: var(--space-2);
  }

  .btn-ghost {
    background: none;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: var(--space-1) var(--space-2);
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    min-height: 32px;
    transition: border-color var(--transition-fast),
                background var(--transition-fast),
                color var(--transition-fast);
  }

  .btn-ghost:hover {
    border-color: var(--text-muted);
    background: var(--bg-surface-hover);
    color: var(--text-primary);
  }

  .btn-clear:hover {
    border-color: #DC2626;
    color: #DC2626;
  }
</style>
