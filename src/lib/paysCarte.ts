/**
 * Where each Arab country sits on a map, expressed as a centre and a zoom that
 * shows the whole country in a small card. Used by the country maps of the
 * directory, so a card opens on its own territory instead of the Arabian
 * world seen from far above.
 */
export type CentrePays = { lat: number; lng: number; zoom: number };

const CENTRES: Record<string, CentrePays> = {
  DZ: { lat: 28.2, lng: 2.6, zoom: 5 },
  SA: { lat: 23.9, lng: 45.1, zoom: 5 },
  BH: { lat: 26.05, lng: 50.55, zoom: 10 },
  KM: { lat: -11.7, lng: 43.35, zoom: 9 },
  DJ: { lat: 11.6, lng: 42.6, zoom: 8 },
  EG: { lat: 26.8, lng: 30.0, zoom: 6 },
  AE: { lat: 24.1, lng: 54.2, zoom: 7 },
  IQ: { lat: 33.0, lng: 43.9, zoom: 6 },
  JO: { lat: 31.3, lng: 36.5, zoom: 7 },
  KW: { lat: 29.3, lng: 47.6, zoom: 9 },
  LB: { lat: 33.9, lng: 35.9, zoom: 8 },
  LY: { lat: 27.0, lng: 17.0, zoom: 5 },
  MA: { lat: 31.8, lng: -6.5, zoom: 6 },
  MR: { lat: 20.3, lng: -10.5, zoom: 5 },
  OM: { lat: 21.0, lng: 57.0, zoom: 6 },
  PS: { lat: 31.9, lng: 35.2, zoom: 8 },
  QA: { lat: 25.3, lng: 51.2, zoom: 9 },
  SO: { lat: 5.2, lng: 46.2, zoom: 5 },
  SD: { lat: 15.5, lng: 30.2, zoom: 5 },
  SY: { lat: 35.0, lng: 38.5, zoom: 7 },
  TN: { lat: 34.0, lng: 9.5, zoom: 7 },
  YE: { lat: 15.6, lng: 47.5, zoom: 6 },
};

/** The map framing of a country, never empty: the Arab world as a whole. */
export function centrePays(code: string | null | undefined): CentrePays {
  return CENTRES[code ?? ''] ?? { lat: 26.0, lng: 22.0, zoom: 3 };
}