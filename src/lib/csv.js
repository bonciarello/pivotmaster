/**
 * Parse CSV or TSV text into headers and rows.
 * Auto-detects delimiter (comma, tab, semicolon).
 * Handles quoted fields and escaped quotes.
 */

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseLine(line, delimiter) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result.map(s => {
    s = s.trim();
    if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) {
      s = s.slice(1, -1);
    }
    return s;
  });
}

/**
 * @param {string} text - Raw CSV/TSV text
 * @returns {{ headers: string[], rows: Record<string, string>[], delimiter: string }}
 */
export function parseCSV(text) {
  if (!text || !text.trim()) {
    return { headers: [], rows: [], delimiter: ',' };
  }

  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) {
    // Need at least header + one data row
    const headers = parseLine(lines[0] || '', ',').filter(h => h);
    return { headers, rows: [], delimiter: ',' };
  }

  // Detect delimiter
  const firstLine = lines[0];
  const delimiters = [',', '\t', ';', '|'];
  let bestDelim = ',';
  let bestCount = 0;

  for (const d of delimiters) {
    const re = new RegExp(escapeRegex(d), 'g');
    const count = (firstLine.match(re) || []).length;
    if (count > bestCount) {
      bestCount = count;
      bestDelim = d;
    }
  }

  // Parse headers
  const headers = parseLine(lines[0], bestDelim);

  // Parse data rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i], bestDelim);
    if (values.length === 0) continue;

    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = j < values.length ? values[j] : '';
    }
    rows.push(row);
  }

  return { headers, rows, delimiter: bestDelim };
}
