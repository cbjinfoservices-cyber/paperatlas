import * as XLSX from 'xlsx';

/** Une cellule qui porte un lien : le texte reste lisible, le clic ouvre
 *  l'adresse. Le classeur ne devine jamais l'adresse — elle est écrite ici. */
/** Une cellule qui porte un lien : le texte reste lisible, le clic ouvre
 *  l'adresse, et l'infobulle dit ce que le chiffre représente — le survol
 *  n'est pas une explication en plus, il est écrit ici. */
export type XlsxLink = { text: string; url?: string; hint?: string };

/** Une cellule ordinaire, ou un texte qui mène quelque part. */
export type XlsxCell = string | number | XlsxLink;

/** One tab of the workbook: a name, its rows, and the width of each column. */
export type XlsxSheet = {
  name: string;
  rows: XlsxCell[][];
  widths?: number[];
};

/** Le lien tel que SheetJS l'écrit dans le fichier. */
type LinkableCell = { l?: { Target: string; Tooltip?: string } };

/**
 * A real `.xlsx` file: several tabs in one workbook, columns already sized, and
 * figures written as figures so Excel can sum them without cleaning the cell.
 * The download is handed to the browser, like the CSV before it.
 */
export function saveWorkbook(filename: string, sheets: XlsxSheet[]) {
  const book = XLSX.utils.book_new();

  sheets.forEach(({ name, rows, widths }) => {
    /* Les liens sont posés après coup, sur l'adresse exacte de la cellule :
       la feuille est d'abord écrite en valeurs simples, puis chaque cellule
       qui porte une adresse reçoit son lien. Rien d'autre ne bouge. */
    const liens: { r: number; c: number; url: string; hint?: string }[] = [];
    const valeurs = rows.map((row, r) =>
      row.map((cell, c) => {
        if (typeof cell === 'object' && cell !== null) {
          if (cell.url) liens.push({ r, c, url: cell.url, hint: cell.hint });
          return cell.text;
        }
        return cell;
      }),
    );

    const sheet = XLSX.utils.aoa_to_sheet(valeurs);
    liens.forEach(({ r, c, url, hint }) => {
      const ref = XLSX.utils.encode_cell({ r, c });
      const cell = sheet[ref] as unknown as LinkableCell | undefined;
      if (!cell) return;
      /* L'infobulle dit ce que le survol doit dire ; à défaut, l'adresse
         elle-même reste lisible au curseur. */
      cell.l = { Target: url, Tooltip: hint || url };
    });
    if (widths?.length) sheet['!cols'] = widths.map((wch) => ({ wch }));
    /* Excel refuses a tab name over 31 characters or holding : \ / ? * [ ] */
    XLSX.utils.book_append_sheet(book, sheet, name.replace(/[:\\/?*[\]]/g, ' ').slice(0, 31));
  });

  const data = XLSX.write(book, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}