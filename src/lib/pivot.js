/**
 * Compute a pivot table from flat data.
 *
 * @param {Record<string, string>[]} data - Array of row objects
 * @param {string[]} rowFields - Fields to group by on rows
 * @param {string[]} colFields - Fields to group by on columns
 * @param {string[]} valueFields - Fields to aggregate (sum + count for each)
 * @returns {object|null} Pivot result or null if no data/values
 */
export function computePivot(data, rowFields, colFields, valueFields) {
  if (!data || data.length === 0 || !valueFields || valueFields.length === 0) {
    return null;
  }

  // Effective row/col fields (use empty if none)
  const rf = rowFields.length > 0 ? rowFields : [];
  const cf = colFields.length > 0 ? colFields : [];

  // Build groups: key = rowKey + "___" + colKey
  const groups = new Map();

  for (const row of data) {
    const rowKey = rf.map(f => String(row[f] ?? '')).join('\x00');
    const colKey = cf.map(f => String(row[f] ?? '')).join('\x00');
    const compositeKey = rowKey + '___' + colKey;

    if (!groups.has(compositeKey)) {
      groups.set(compositeKey, {
        rowKeyParts: rf.map(f => String(row[f] ?? '')),
        colKeyParts: cf.map(f => String(row[f] ?? '')),
        values: {},
        count: 0
      });
    }

    const group = groups.get(compositeKey);
    group.count++;

    for (const vf of valueFields) {
      if (!group.values[vf]) {
        group.values[vf] = { sum: 0 };
      }
      const num = parseFloat(row[vf]);
      group.values[vf].sum += isNaN(num) ? 0 : num;
    }
  }

  if (cf.length === 0) {
    // --- Simple grouped table (rows only) ---
    const rowKeysOrdered = [];
    const rowKeysSet = new Set();

    for (const g of groups.values()) {
      const rk = g.rowKeyParts.join('\x00');
      if (!rowKeysSet.has(rk)) {
        rowKeysSet.add(rk);
        rowKeysOrdered.push(g.rowKeyParts);
      }
    }

    const resultRows = rowKeysOrdered.map(rkParts => {
      const rk = rkParts.join('\x00');
      const matchingGroups = [...groups.values()].filter(
        g => g.rowKeyParts.join('\x00') === rk
      );

      const aggregated = {};
      let totalCount = 0;

      for (const vf of valueFields) {
        aggregated[vf] = { sum: 0 };
      }

      for (const g of matchingGroups) {
        totalCount += g.count;
        for (const vf of valueFields) {
          aggregated[vf].sum += g.values[vf]?.sum || 0;
        }
      }

      return { rowKey: rkParts, values: aggregated, count: totalCount };
    });

    return {
      type: 'simple',
      rowFields: rf,
      valueFields,
      rows: resultRows
    };
  } else {
    // --- Cross-tab (rows × columns) ---
    const rowKeysOrdered = [];
    const rowKeysSet = new Set();
    const colKeysOrdered = [];
    const colKeysSet = new Set();

    for (const g of groups.values()) {
      const rk = g.rowKeyParts.join('\x00');
      const ck = g.colKeyParts.join('\x00');
      if (!rowKeysSet.has(rk)) {
        rowKeysSet.add(rk);
        rowKeysOrdered.push(g.rowKeyParts);
      }
      if (!colKeysSet.has(ck)) {
        colKeysSet.add(ck);
        colKeysOrdered.push(g.colKeyParts);
      }
    }

    // If no row fields, treat as single-row cross-tab
    const effectiveRowKeys = rf.length > 0 ? rowKeysOrdered : [[]];
    const effectiveRowLabels = rf.length > 0 ? rf : [];

    const resultRows = effectiveRowKeys.map(rkParts => {
      const rk = rkParts.join('\x00');
      const cells = {};
      const totalValues = {};
      let totalCount = 0;

      for (const vf of valueFields) {
        totalValues[vf] = { sum: 0 };
      }

      for (const ckParts of colKeysOrdered) {
        const ck = ckParts.join('\x00');
        const compositeKey = rk + '___' + ck;
        const group = groups.get(compositeKey);

        if (group) {
          totalCount += group.count;
          cells[ck] = { ...group.values, count: group.count };

          for (const vf of valueFields) {
            totalValues[vf].sum += group.values[vf]?.sum || 0;
          }
        } else {
          cells[ck] = { count: 0 };
          for (const vf of valueFields) {
            cells[ck][vf] = { sum: 0 };
          }
        }
      }

      return {
        rowKey: rkParts.length > 0 ? rkParts : null,
        cells,
        total: totalValues,
        totalCount
      };
    });

    return {
      type: 'cross',
      rowFields: effectiveRowLabels,
      colFields: cf,
      valueFields,
      colKeys: colKeysOrdered,
      rows: resultRows
    };
  }
}
