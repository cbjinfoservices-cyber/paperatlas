import type { Annonce, AnnonceCat } from '@/mocks/annonces';
import type { Contract, Emploi } from '@/mocks/emplois';
import { PAYS_DEFAUT } from '@/lib/pays';

export type ListingKind = 'annonce' | 'offre';
export type ListingStatut = 'en_attente' | 'publie' | 'refuse';

/** One row of the `paperatlas_annonces` table, exactly as stored. */
export type ListingRow = {
  id: string;
  user_id: string | null;
  kind: ListingKind;
  rubrique: string | null;
  titre: string;
  organisation: string;
  budget: string | null;
  wilaya: string | null;
  commune: string | null;
  /** ISO country code of the deposit; older rows have none and read as Algeria. */
  pays?: string | null;
  email: string;
  telephone: string | null;
  description: string;
  statut: ListingStatut;
  motif: string | null;
  created_at: string;
  updated_at: string;
};

export const LISTING_COLUMNS =
  'id, user_id, kind, rubrique, titre, organisation, budget, pays, wilaya, commune, email, telephone, description, statut, motif, created_at, updated_at';

const ANNONCE_CATS: AnnonceCat[] = ['materiel', 'papier', 'service', 'recherche'];
const CONTRACTS: Contract[] = ['cdi', 'cdd', 'stage', 'freelance'];

/** A deposit is written in one language only, so every locale gets the same text. */
const same = (value: string) => ({ fr: value, ar: value, en: value });

const dayOf = (iso: string) => (iso ? iso.slice(0, 10) : new Date().toISOString().slice(0, 10));

/** Two initials used as a sober seal on the profile and detail sheets. */
export function markOf(name: string) {
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
  const letters = parts.map((word) => word.charAt(0).toUpperCase()).join('');
  return letters || 'PA';
}

export function toAnnonce(row: ListingRow): Annonce {
  const rubrique = row.rubrique ?? '';
  const cat = (ANNONCE_CATS as string[]).includes(rubrique) ? (rubrique as AnnonceCat) : 'materiel';
  return {
    id: row.id,
    cat,
    title: same(row.titre),
    body: same(row.description),
    seller: row.organisation,
    commune: row.commune ?? '',
    wilaya: row.wilaya ?? '',
    pays: row.pays || PAYS_DEFAUT,
    price: row.budget || '—',
    posted: dayOf(row.created_at),
    contact: row.email,
    phone: row.telephone ?? '',
  };
}

export function toEmploi(row: ListingRow): Emploi {
  const rubrique = row.rubrique ?? '';
  const contract = (CONTRACTS as string[]).includes(rubrique) ? (rubrique as Contract) : 'cdi';
  return {
    id: row.id,
    title: same(row.titre),
    summary: same(row.description),
    company: row.organisation,
    mark: markOf(row.organisation),
    contract,
    commune: row.commune ?? '',
    wilaya: row.wilaya ?? '',
    pays: row.pays || PAYS_DEFAUT,
    salary: row.budget || '—',
    posted: dayOf(row.created_at),
    tags: [],
    contact: row.email,
  };
}

/** A deposit carries no long description, so the sheet falls back to a sensible date. */
export function validThroughFrom(posted: string, days = 45) {
  const base = new Date(`${posted}T12:00:00`);
  if (Number.isNaN(base.getTime())) return posted;
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

/** Short, human-quotable reference shown on every detail sheet. */
export function referenceFor(id: string, prefix = 'EMP') {
  const clean = id.replace(/[^0-9a-zA-Z]/g, '').slice(0, 8).toUpperCase();
  return `${prefix}-${clean || 'DEPOT'}`;
}

export function annonceReferenceFor(id: string) {
  return referenceFor(id, 'ANN');
}