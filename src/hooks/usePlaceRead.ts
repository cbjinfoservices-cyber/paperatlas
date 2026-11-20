import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  PLACE_DOORS,
  loadLocalPlaces,
  sanitizePlaces,
  saveLocalPlaces,
} from '@/lib/chapter';

/* The same row of display preferences the chapter already uses: one per member,
   readable and writable by its owner only (RLS on user_id). */
const TABLE = 'preferences_affichage';
const FIELD = 'placesRead';

type Box = Record<string, unknown>;

/**
 * The places of the row already read — the offers wall of the home page and the
 * directory itself.
 *
 * Same two memories as the chapter: the device answers instantly, the account
 * carries the mark from one device to the next, and on sign-in the two lists are
 * merged instead of one erasing the other. Nothing here enters the chapter
 * count: these places are doors, not beats of the film.
 */
export function usePlaceRead(userId: string | null) {
  const [places, setPlaces] = useState<string[]>(loadLocalPlaces);
  const placesRef = useRef<string[]>(places);
  const boxRef = useRef<Box | undefined>(undefined);

  useEffect(() => {
    placesRef.current = places;
  }, [places]);

  /** Writes the marks into the member's row, keeping every other preference. */
  const persist = useCallback(async (uid: string, list: string[]) => {
    try {
      let base = boxRef.current;
      const { data } = await supabase
        .from(TABLE)
        .select('donnees')
        .eq('user_id', uid)
        .maybeSingle();
      const stored = (data?.donnees ?? null) as unknown;
      if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
        base = stored as Box;
      }
      const next: Box = { ...base, [FIELD]: list };
      boxRef.current = next;
      await supabase
        .from(TABLE)
        .upsert(
          { user_id: uid, donnees: next, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        );
    } catch {
      /* Offline or refused: the device keeps the mark, the account catches up
         on the next visit. Nothing is shown as an error. */
    }
  }, []);

  /* Arriving signed in: the account's marks and the device's are joined. */
  useEffect(() => {
    if (!userId) {
      boxRef.current = {};
      return undefined;
    }
    let alive = true;

    const pull = async () => {
      try {
        const { data } = await supabase
          .from(TABLE)
          .select('donnees')
          .eq('user_id', userId)
          .maybeSingle();
        if (!alive) return;
        const stored = (data?.donnees ?? null) as unknown;
        const box: Box = stored && typeof stored === 'object' && !Array.isArray(stored)
          ? (stored as Box)
          : {};
        boxRef.current = box;
        const remote = sanitizePlaces(box[FIELD]);
        const merged = PLACE_DOORS.filter(
          (place) => remote.includes(place) || placesRef.current.includes(place),
        );
        const same = merged.length === remote.length && merged.every((p) => remote.includes(p));
        if (same) {
          if (merged.length > 0 && placesRef.current.length !== merged.length) {
            saveLocalPlaces(merged);
            setPlaces(merged);
          }
          return;
        }
        placesRef.current = merged;
        saveLocalPlaces(merged);
        setPlaces(merged);
        /* A place read before signing in is handed to the account. */
        await persist(userId, merged);
      } catch {
        /* The device's marks stand on their own until the next visit. */
      }
    };

    void pull();
    return () => {
      alive = false;
    };
  }, [userId, persist]);

  /** Marks a place read. Returns true only the first time it ever was. */
  const markPlace = useCallback((place: string) => {
    if (!PLACE_DOORS.includes(place)) return false;
    if (placesRef.current.includes(place)) return false;
    const next = PLACE_DOORS.filter(
      (item) => item === place || placesRef.current.includes(item),
    );
    placesRef.current = next;
    setPlaces(next);
    saveLocalPlaces(next);
    if (userId) void persist(userId, next);
    return true;
  }, [userId, persist]);

  /** Back to a blank row of places, on the device and on the account at once.
      Called in the same gesture as the chapter reset, so no half-read chapter
      is ever left behind. */
  const reset = useCallback(() => {
    placesRef.current = [];
    setPlaces([]);
    saveLocalPlaces([]);
    if (userId) void persist(userId, []);
  }, [userId, persist]);

  /** Puts the places back exactly as they were a moment ago: the short window
      after a reset in which a mis-click can still be taken back. */
  const restore = useCallback((list: string[]) => {
    const next = sanitizePlaces(list);
    placesRef.current = next;
    setPlaces(next);
    saveLocalPlaces(next);
    if (userId) void persist(userId, next);
  }, [userId, persist]);

  return { places, markPlace, reset, restore };
}