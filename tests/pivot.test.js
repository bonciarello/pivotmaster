import { describe, it, expect } from 'vitest';
import { parseCSV } from '../src/lib/csv.js';
import { computePivot } from '../src/lib/pivot.js';
import { pivotToCSV, downloadCSV } from '../src/lib/export.js';

describe('parseCSV', () => {
  it('parses comma-separated values', () => {
    const input = 'Name,Age,City\nAlice,30,Milan\nBob,25,Rome';
    const result = parseCSV(input);
    expect(result.headers).toEqual(['Name', 'Age', 'City']);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ Name: 'Alice', Age: '30', City: 'Milan' });
    expect(result.rows[1]).toEqual({ Name: 'Bob', Age: '25', City: 'Rome' });
    expect(result.delimiter).toBe(',');
  });

  it('parses tab-separated values', () => {
    const input = 'Name\tAge\tCity\nAlice\t30\tMilan';
    const result = parseCSV(input);
    expect(result.headers).toEqual(['Name', 'Age', 'City']);
    expect(result.delimiter).toBe('\t');
  });

  it('parses semicolon-separated values', () => {
    const input = 'Name;Age;City\nAlice;30;Milan';
    const result = parseCSV(input);
    expect(result.headers).toEqual(['Name', 'Age', 'City']);
    expect(result.delimiter).toBe(';');
  });

  it('handles quoted fields with commas', () => {
    const input = 'Name,Description\nAlice,"Hello, World"';
    const result = parseCSV(input);
    expect(result.rows[0].Description).toBe('Hello, World');
  });

  it('handles empty input', () => {
    const result = parseCSV('');
    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
  });

  it('handles single line (header only)', () => {
    const input = 'Name,Age,City';
    const result = parseCSV(input);
    expect(result.headers).toEqual(['Name', 'Age', 'City']);
    expect(result.rows).toHaveLength(0);
  });

  it('trims whitespace from values', () => {
    const input = ' Name , Age \n Alice , 30 ';
    const result = parseCSV(input);
    expect(result.headers).toEqual(['Name', 'Age']);
    expect(result.rows[0].Name).toBe('Alice');
    expect(result.rows[0].Age).toBe('30');
  });
});

describe('computePivot', () => {
  const data = [
    { City: 'Milan', Category: 'Electronics', Sales: '100', Qty: '5' },
    { City: 'Milan', Category: 'Clothing', Sales: '200', Qty: '3' },
    { City: 'Rome', Category: 'Electronics', Sales: '150', Qty: '7' },
    { City: 'Rome', Category: 'Electronics', Sales: '50', Qty: '2' },
    { City: 'Naples', Category: 'Clothing', Sales: '300', Qty: '10' },
  ];

  it('returns null when no value fields', () => {
    const result = computePivot(data, ['City'], [], []);
    expect(result).toBeNull();
  });

  it('returns null when no data', () => {
    const result = computePivot([], ['City'], [], ['Sales']);
    expect(result).toBeNull();
  });

  it('computes simple pivot with rows and one value', () => {
    const result = computePivot(data, ['City'], [], ['Sales']);
    expect(result).not.toBeNull();
    expect(result.type).toBe('simple');
    expect(result.rows).toHaveLength(3);

    const milan = result.rows.find(r => r.rowKey[0] === 'Milan');
    expect(milan).toBeDefined();
    expect(milan.values.Sales.sum).toBe(300); // 100 + 200
    expect(milan.count).toBe(2);

    const rome = result.rows.find(r => r.rowKey[0] === 'Rome');
    expect(rome.values.Sales.sum).toBe(200); // 150 + 50
    expect(rome.count).toBe(2);

    const naples = result.rows.find(r => r.rowKey[0] === 'Naples');
    expect(naples.values.Sales.sum).toBe(300);
    expect(naples.count).toBe(1);
  });

  it('computes simple pivot with multiple value fields', () => {
    const result = computePivot(data, ['City'], [], ['Sales', 'Qty']);
    expect(result.type).toBe('simple');

    const milan = result.rows.find(r => r.rowKey[0] === 'Milan');
    expect(milan.values.Sales.sum).toBe(300);
    expect(milan.values.Qty.sum).toBe(8); // 5 + 3
  });

  it('computes cross-tab pivot with rows, cols, and values', () => {
    const result = computePivot(data, ['City'], ['Category'], ['Sales']);
    expect(result.type).toBe('cross');
    expect(result.colKeys).toHaveLength(2);

    // Milan × Electronics
    const milan = result.rows.find(r => r.rowKey[0] === 'Milan');
    const electronicsKey = result.colKeys.find(ck => ck[0] === 'Electronics').join('\x00');
    expect(milan.cells[electronicsKey].Sales.sum).toBe(100);
    expect(milan.cells[electronicsKey].count).toBe(1);

    // Milan × Clothing
    const clothingKey = result.colKeys.find(ck => ck[0] === 'Clothing').join('\x00');
    expect(milan.cells[clothingKey].Sales.sum).toBe(200);
    expect(milan.cells[clothingKey].count).toBe(1);

    // Row total
    expect(milan.total.Sales.sum).toBe(300);
    expect(milan.totalCount).toBe(2);
  });

  it('computes cross-tab with only column fields (no rows)', () => {
    const result = computePivot(data, [], ['Category'], ['Sales']);
    expect(result.type).toBe('cross');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].rowKey).toBeNull();
  });

  it('handles non-numeric values gracefully', () => {
    const mixedData = [
      { City: 'Milan', Sales: 'abc' },
      { City: 'Milan', Sales: '100' },
    ];
    const result = computePivot(mixedData, ['City'], [], ['Sales']);
    expect(result.rows[0].values.Sales.sum).toBe(100); // 'abc' → NaN → 0
    expect(result.rows[0].count).toBe(2);
  });
});

describe('pivotToCSV', () => {
  const data = [
    { City: 'Milan', Category: 'A', Sales: '100' },
    { City: 'Rome', Category: 'B', Sales: '200' },
  ];

  it('exports simple pivot as CSV', () => {
    const pivot = computePivot(data, ['City'], [], ['Sales']);
    const csv = pivotToCSV(pivot);
    expect(csv).toContain('City');
    expect(csv).toContain('Somma di Sales');
    expect(csv).toContain('Conteggio di Sales');
    expect(csv).toContain('Milan');
    expect(csv).toContain('100');
    expect(csv).toContain('1');
  });

  it('exports cross-tab pivot as CSV', () => {
    const pivot = computePivot(data, ['City'], ['Category'], ['Sales']);
    const csv = pivotToCSV(pivot);
    expect(csv).toContain('City');
    expect(csv).toContain('Somma di Sales');
    expect(csv).toContain('Totale');
  });

  it('returns empty string for null pivot', () => {
    expect(pivotToCSV(null)).toBe('');
  });
});
