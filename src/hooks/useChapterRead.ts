import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  SECTION_BEATS,
  loadLocalChapter,
  sanitizeChapter,
  saveLocalChapter,
} from '@/lib/chapter';

/* Where the account keeps its small display preferences. One row per member,
   readable and writable by its owner only (RLS on user_id). */
const TABLE = 'preferences_affichage';
const FIELD = 'chapterRead';

type Box = Record<string, unknown>;

/**
 * The sections of the home chapter already read.
 *
 * Two memories, one truth: the device answers instantly (a reload on the phone
 * finds the count straight away, before any network call), and the account
 * carries it from one device to the next. On sign-in the server is merged with
 * what the device already knew — never replacing one by the other, so a section
 * read while signed out is not thrown away.
 */
export function useChapterRead(userId: string | null) {
  const [read, setRead] = useState<string[]>(loadLocalChapter);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const readRef = useRef<string[]>(read);
  const boxRef = useRef<Box | undefined>(undefined);

  useEffect(() => {
    readRef.current = read;
  }, [read]);

  /** Writes the count into the member's row, keeping every other preference
      that may live in the same box untouched. */
  const persist = useCallback(async (uid: string, sections: string[]) => {
    setSaving(true);
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
      const next: Box = { ...base, [FIELD]: sections };
      boxRef.current = next;
      await supabase
        .from(TABLE)
        .upsert(
          { user_id: uid, donnees: next, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        );
    } catch {
      /* Offline or refused: the device keeps the count, the account catches up
         on the next visit. Nothing is lost, nothing is shown as an error. */
    } finally {
      setSaving(false);
    }
  }, []);

  /* Arriving signed in: the account's list and the device's list are joined. */
  useEffect(() => {
    if (!userId) {
      boxRef.current = {};
      return undefined;
    }
    let alive = true;

    const pull = async () => {
      setSyncing(true);
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
        const remote = sanitizeChapter(box[FIELD]);
        const merged = SECTION_BEATS.filter(
          (beat) => remote.includes(beat) || readRef.current.includes(beat),
        );
        if (merged.length === remote.length && merged.every((b) => remote.includes(b))) {
          /* The account already knows everything: nothing to write back. */
          if (merged.length > 0 && readRef.current.length !== merged.length) {
            saveLocalChapter(merged);
            setRead(merged);
          }
          return;
        }
        readRef.current = merged;
        saveLocalChapter(merged);
        setRead(merged);
        /* A section read before signing in is handed to the account. */
        await persist(userId, merged);
      } catch {
        /* The device's count stands on its own until the next visit. */
      } finally {
        if (alive) setSyncing(false);
      }
    };

    void pull();
    return () => {
      alive = false;
    };
  }, [userId, persist]);

  /** Marks a section read. Returns true only the first time it ever was. */
  const markRead = useCallback((section: string) => {
    if (!SECTION_BEATS.includes(section)) return false;
    if (readRef.current.includes(section)) return false;
    const next = SECTION_BEATS.filter(
      (beat) => beat === section || readRef.current.includes(beat),
    );
    readRef.current = next;
    setRead(next);
    saveLocalChapter(next);
    if (userId) void persist(userId, next);
    return true;
  }, [userId, persist]);

  /** Back to a blank chapter, on the device and on the account at once. */
  const reset = useCallback(() => {
    readRef.current = [];
    setRead([]);
    saveLocalChapter([]);
    if (userId) void persist(userId, []);
  }, [userId, persist]);

  /** Puts a chapter back exactly as it was a moment ago: the short window
      after a reset in which a mis-click can still be taken back. It writes
      like any other read — device first, account in the same gesture. */
  const restore = useCallback((sections: string[]) => {
    const next = sanitizeChapter(sections);
    readRef.current = next;
    setRead(next);
    saveLocalChapter(next);
    if (userId) void persist(userId, next);
  }, [userId, persist]);

  return { readSections: read, markRead, reset, restore, syncing, saving };
}