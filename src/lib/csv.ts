/**
 * One cell of a French-friendly CSV: no line breaks, no double separators, and
 * a quote only when the text really needs one.
 */
export function csvCell(value: string) {
  const clean = String(value ?? '').replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  return /[";\n]/.test(clean) ? `"${clean.replace(/"/g, '""')}"` : clean;
}

/** Semicolon separated with a UTF-8 BOM, so Excel opens clean columns. */
export function csvText(rows: string[][]): string {
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(';')).join('\r\n')}`;
}

/** Push the built CSV to the browser as a download. */
export function saveCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}