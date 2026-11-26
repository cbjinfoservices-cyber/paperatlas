import directoryData from './directory-data.json' with { type: 'json' };

type RegionalPlace = { name: string; pays: string | null; wilaya: string | null };
const normalize = (label: string) => label.normalize('NFD').replace(/\p{M}/gu, '')
  .toLowerCase().replace(/[’']/g, '').replace(/[-\s]+/g, ' ').trim();
const wilayas = new Map(Object.entries(directoryData.wilayas).map(([name, point]) => [normalize(name), point]));

export function wilayaMapPoints(rows: readonly RegionalPlace[]) {
  return rows.flatMap(row => {
    const country = row.pays?.trim().toUpperCase() || 'DZ';
    const point = country === 'DZ' && row.wilaya ? wilayas.get(normalize(row.wilaya)) : undefined;
    return point ? [{ name: row.name, ...point }] : [];
  });
}
