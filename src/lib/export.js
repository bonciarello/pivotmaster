/**
 * Convert a pivot result to CSV text and trigger a download.
 */

/**
 * @param {object} pivotResult - The result from computePivot()
 * @returns {string} CSV text
 */
export function pivotToCSV(pivotResult) {
  if (!pivotResult) return '';

  const lines = [];

  if (pivotResult.type === 'simple') {
    // Header
    const headerCols = [
      ...pivotResult.rowFields,
      ...pivotResult.valueFields.flatMap(vf => [`Somma di ${vf}`, `Conteggio di ${vf}`])
    ];
    lines.push(headerCols.map(escapeCSV).join(','));

    // Rows
    for (const row of pivotResult.rows) {
      const rowCols = [
        ...row.rowKey.map(escapeCSV),
        ...pivotResult.valueFields.flatMap(vf => [
          String(row.values[vf]?.sum || 0),
          String(row.count || 0)
        ])
      ];
      lines.push(rowCols.join(','));
    }
  } else if (pivotResult.type === 'cross') {
    // Header
    const rowHeaders = pivotResult.rowFields.length > 0 ? [...pivotResult.rowFields] : [];
    const colHeaders = pivotResult.colKeys.flatMap(ck => {
      const label = ck.join(' — ');
      return pivotResult.valueFields.flatMap(vf => [
        `${label} (Somma di ${vf})`,
        `${label} (Conteggio)`
      ]);
    });
    const totalHeaders = pivotResult.valueFields.flatMap(vf => [
      `Totale Somma di ${vf}`,
      `Totale Conteggio`
    ]);
    lines.push([...rowHeaders, ...colHeaders, ...totalHeaders].map(escapeCSV).join(','));

    // Rows
    for (const row of pivotResult.rows) {
      const rowCols = [
        ...(row.rowKey ? row.rowKey.map(escapeCSV) : []),
        ...pivotResult.colKeys.flatMap(ck => {
          const ckStr = ck.join('\x00');
          const cell = row.cells[ckStr];
          return pivotResult.valueFields.flatMap(vf => [
            String(cell?.[vf]?.sum || 0),
            String(cell?.count || 0)
          ]);
        }),
        ...pivotResult.valueFields.flatMap(vf => [
          String(row.total?.[vf]?.sum || 0),
          String(row.totalCount || 0)
        ])
      ];
      lines.push(rowCols.join(','));
    }
  }

  return lines.join('\n');
}

function escapeCSV(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Trigger a file download in the browser.
 * @param {string} csvText - CSV content
 * @param {string} filename - Download filename
 */
export function downloadCSV(csvText, filename = 'pivot.csv') {
  const blob = new Blob(['\uFEFF' + csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
