import { writable, derived } from 'svelte/store';

/** Array of parsed data rows (objects) */
export const rawData = writable([]);

/** Array of column names from CSV headers */
export const columns = writable([]);

/** Column names assigned to each zone, in order */
export const rowsFields = writable([]);
export const colsFields = writable([]);
export const valuesFields = writable([]);
export const filtersFields = writable([]);

/** Filter selections: { [columnName]: string[] } — selected values to include */
export const filterState = writable({});

/** Drag & drop state */
export const dragInfo = writable({ column: null, sourceZone: null });

/* ---- Derived stores ---- */

/** Set of all assigned column names */
export const assignedColumns = derived(
  [rowsFields, colsFields, valuesFields, filtersFields],
  ([$r, $c, $v, $f]) => new Set([...$r, ...$c, ...$v, ...$f])
);

/** Columns not yet assigned to any zone */
export const unassignedColumns = derived(
  [columns, assignedColumns],
  ([$cols, $assigned]) => $cols.filter(c => !$assigned.has(c))
);

/** Data filtered by filter selections */
export const effectiveData = derived(
  [rawData, filterState],
  ([$data, $filters]) => {
    let result = $data;
    for (const [col, selectedValues] of Object.entries($filters)) {
      if (selectedValues && selectedValues.length > 0) {
        const allUnique = new Set($data.map(r => String(r[col] ?? '')));
        if (selectedValues.length < allUnique.size) {
          const selectedSet = new Set(selectedValues);
          result = result.filter(row => selectedSet.has(String(row[col] ?? '')));
        }
      }
    }
    return result;
  }
);

/** True when the user has pasted valid data */
export const hasData = derived(rawData, $d => $d.length > 0);
