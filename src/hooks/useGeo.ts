import { useCallback, useEffect, useState } from 'react';
import { localeFor } from '@/i18n/localize';

export type GeoPoint = { lat: number; lng: number };
export type GeoStatus = 'idle' | 'asking' | 'ready' | 'denied' | 'error' | 'unsupported';

const KEY = 'paperatlas:geo';

type GeoState = { status: GeoStatus; point: GeoPoint | null };

let state: GeoState = { status: 'idle', point: null };
let hydrated = false;
const listeners = new Set<(s: GeoState) => void>();

/** Great-circle distance in kilometres between two points. */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Human readable distance, 1 decimal under 10 km. */
export function formatDistance(km: number, lang: string): string {
  const rounded = km < 10 ? Math.round(km * 10) / 10 : Math.round(km);
  const value = new Intl.NumberFormat(localeFor(lang), {
    maximumFractionDigits: 1,
  }).format(rounded);
  return `${value} km`;
}

function isPoint(value: unknown): value is GeoPoint {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return false;
  return Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180;
}

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  if (typeof window === 'undefined') return;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (isPoint(parsed)) state = { status: 'ready', point: parsed };
  } catch {
    /* storage unavailable — start without a position */
  }
}

function publish(next: GeoState) {
  state = next;
  if (typeof window !== 'undefined') {
    try {
      if (next.point) window.sessionStorage.setItem(KEY, JSON.stringify(next.point));
      else window.sessionStorage.removeItem(KEY);
    } catch {
      /* storage unavailable — position stays in memory */
    }
  }
  listeners.forEach((fn) => fn(next));
}

export function useGeo() {
  hydrate();
  const [snap, setSnap] = useState<GeoState>(state);

  useEffect(() => {
    const sync = (next: GeoState) => setSnap(next);
    listeners.add(sync);
    setSnap(state);
    return () => {
      listeners.delete(sync);
    };
  }, []);

  const request = useCallback(() => {
    if (state.status === 'asking') return;
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      publish({ status: 'unsupported', point: null });
      return;
    }
    publish({ status: 'asking', point: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        publish({ status: 'ready', point: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
      },
      (err) => {
        publish({ status: err.code === err.PERMISSION_DENIED ? 'denied' : 'error', point: null });
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    );
  }, []);

  const reset = useCallback(() => {
    publish({ status: 'idle', point: null });
  }, []);

  return { status: snap.status, point: snap.point, request, reset };
}