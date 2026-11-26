import data from './directory-data.json';

export type Option = { value: string; label: string };
export type LocationFilter = { country: string; region: string };
export type ListingFilter = LocationFilter & { category: string };

export const countries: Option[] = data.countries.map(country => ({ value: country.code, label: country.name }));
export const categories: Record<'annonce' | 'offre', Option[]> = {
  annonce: [
    { value: 'materiel', label: 'Matériel' }, { value: 'papier', label: 'Papier' },
    { value: 'service', label: 'Service' }, { value: 'recherche', label: 'Recherche' },
  ],
  offre: [
    { value: 'cdi', label: 'CDI' }, { value: 'cdd', label: 'CDD' },
    { value: 'stage', label: 'Stage' }, { value: 'freelance', label: 'Freelance' },
  ],
};

export function countryName(code: string | null | undefined) {
  return countries.find(country => country.value === (code || 'DZ'))?.label ?? code ?? '';
}
