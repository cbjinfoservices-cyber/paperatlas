import { useEffect, useState } from 'react';
import type { Entreprise, Trade } from '@/mocks/entreprises';
import { centrePays } from '@/lib/paysCarte';
import { pointOfRegion } from '@/lib/regionGeo';
import { supabase } from '@/lib/supabase';

type PublishedRow = {
  id: string;
  nom: string;
  metier: string;
  pays: string;
  wilaya: string;
  commune: string | null;
  description: string | null;
  telephone_public: string | null;
  email_public: string | null;
  mise_en_avant_jusqu_a: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

/* Les métiers enregistrés dans la fiche, lus comme les types de l'annuaire. */
const TRADE_OF_METIER: Record<string, Trade> = {
  imprimerie: 'impression',
  edition: 'edition',
  librairie: 'librairie',
  faconnage: 'faconnage',
  agence: 'communication',
  fournisseur: 'fournisseurs',
};

function initialsOf(nom: string) {
  return nom.trim().split(/\s+/).slice(0, 2).map((word) => word.charAt(0)).join('').toLocaleUpperCase();
}

/* Une ligne publiée devient une fiche de l'annuaire. Les champs que la table
   ne porte pas (photos, services, catalogue, notes) restent vides : l'interface
   les masque ou montre un visuel de repli. */
export function ficheDepuisLigne(row: PublishedRow): Entreprise | null {
  const trade = TRADE_OF_METIER[row.metier];
  if (!trade) return null;
  const point = row.latitude != null && row.longitude != null
    ? { lat: row.latitude, lng: row.longitude }
    : pointOfRegion(row.wilaya, row.pays) ?? centrePays(row.pays);
  const joined = row.created_at.slice(0, 10);
  const featured = Boolean(row.mise_en_avant_jusqu_a && new Date(row.mise_en_avant_jusqu_a).getTime() > Date.now());
  return {
    id: row.id,
    name: row.nom,
    logoMark: initialsOf(row.nom),
    trade,
    wilaya: row.wilaya,
    pays: row.pays,
    commune: row.commune ?? '',
    address: '',
    lat: point.lat,
    lng: point.lng,
    since: Number(row.created_at.slice(0, 4)),
    joined,
    staff: 0,
    rating: 0,
    reviews: 0,
    capacity: { fr: '', ar: '' },
    blurb: { fr: row.description ?? '', ar: '' },
    services: [],
    certs: [],
    hours: [],
    catalogue: [],
    phone: row.telephone_public ?? '',
    email: row.email_public ?? '',
    photos: [],
    featured,
  };
}

/* Les fiches publiées de la base, lues par la carte et la liste de l'annuaire. */
export function usePublishedEntreprises() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data, error } = await supabase
        .from('paperatlas_entreprises')
        .select('id,nom,metier,pays,wilaya,commune,description,telephone_public,email_public,mise_en_avant_jusqu_a,latitude,longitude,created_at')
        .eq('publie', true)
        .order('created_at', { ascending: false });
      if (!alive) return;
      if (error) {
        console.error('annuaire-map-load-failed', error.message);
      } else {
        setEntreprises(((data ?? []) as PublishedRow[]).map(ficheDepuisLigne).filter((fiche): fiche is Entreprise => fiche !== null));
      }
      setLoading(false);
    };
    void load();
    return () => {
      alive = false;
    };
  }, []);

  return { entreprises, loading };
}
