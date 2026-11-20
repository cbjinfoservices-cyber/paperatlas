import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type CompteRole = 'pro' | 'candidat' | 'admin';

export type Compte = {
  id: string;
  email: string | null;
  nom: string | null;
  organisme: string | null;
  metier: string | null;
  wilaya: string | null;
  /** ISO code of the Arab country the member works from — « DZ » when absent. */
  pays: string | null;
  telephone: string | null;
  langue: string | null;
  role: CompteRole;
  cv_url: string | null;
  /* Storage path in the private CV bucket — never a public URL. */
  cv_path: string | null;
  bio: string | null;
  titre: string | null;
  /** The formula the member holds: « annuaire », « premium » or « institutions ».
   *  Stored on the account itself, so it can be changed later and counted. */
  formule: string | null;
  /** How many establishments an institution account covers — null elsewhere. */
  etablissements: number | null;
  /** L'identifiant de la fiche d'auteur que ce compte tient, s'il en a une.
   *  C'est ce lien qui permet aux visiteurs d'écrire à la plume depuis sa
   *  fiche comme depuis sa carte. */
  auteur_id?: string | null;
  created_at?: string | null;
};

const SELECT =
  'id, email, nom, organisme, metier, wilaya, pays, telephone, langue, role, cv_url, cv_path, bio, titre, formule, etablissements, auteur_id, created_at';

/** The public card other members see when they look for someone to write to. */
async function syncMemberCard(compte: Compte) {
  if (!compte.id || !compte.nom) return;
  await supabase.from('paperatlas_membres').upsert(
    {
      id: compte.id,
      nom: compte.nom,
      organisme: compte.organisme,
      metier: compte.metier,
      wilaya: compte.wilaya,
      pays: compte.pays,
      role: compte.role,
      titre: compte.titre,
      bio: compte.bio,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );
}

type AuthValue = {
  session: Session | null;
  user: User | null;
  compte: Compte | null;
  loading: boolean;
  compteError: string;
  signOut: () => Promise<void>;
  saveCompte: (patch: Partial<Omit<Compte, 'id'>>) => Promise<boolean>;
  /** Relit la ligne du compte : ce que le serveur vient d'écrire (un
   *  rattachement de fiche, par exemple) apparaît sans recharger la page. */
  refreshCompte: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  user: null,
  compte: null,
  loading: true,
  compteError: '',
  signOut: async () => {},
  saveCompte: async () => false,
  refreshCompte: async () => {},
});

function seedFromUser(user: User) {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const read = (key: string) => (typeof meta[key] === 'string' ? (meta[key] as string) : null);
  return {
    id: user.id,
    email: user.email ?? null,
    nom: read('nom'),
    organisme: read('organisme'),
    metier: read('metier'),
    wilaya: read('wilaya'),
    pays: read('pays'),
    telephone: read('telephone'),
    langue: read('langue') ?? 'fr',
    role:
      read('role') === 'candidat'
        ? 'candidat'
        : read('role') === 'admin'
          ? 'admin'
          : 'pro',
    cv_url: read('cv_url'),
    cv_path: read('cv_path'),
    bio: read('bio'),
    titre: read('titre'),
    formule: read('formule') ?? 'mensuel',
    etablissements: typeof meta.etablissements === 'number' ? meta.etablissements : null,
  } as Compte;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [compte, setCompte] = useState<Compte | null>(null);
  const [compteError, setCompteError] = useState('');
  const loadedFor = useRef('');
  /* A profile only enters the public member board once its e-mail is confirmed:
     an unverified sign-up stays private until it proves the address. */
  const confirmedRef = useRef(false);

  useEffect(() => {
    let alive = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!alive) return;
        setSession(data.session ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (alive) setLoading(false);
      });

    /* The callback stays synchronous: it only stores the session. */
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user?.id ?? null;
  const user = session?.user ?? null;
  /* A sign-up is only « published » once its address is proven. */
  const emailConfirmed = Boolean(user?.email_confirmed_at || user?.confirmed_at);

  useEffect(() => {
    if (!userId || !user) {
      setCompte(null);
      setCompteError('');
      loadedFor.current = '';
      return;
    }
    /* The key carries the confirmation state: the moment the address is proven
       (often in another tab), the card is written to the public board. */
    const loadKey = `${userId}:${emailConfirmed ? 'ok' : 'pending'}`;
    if (loadedFor.current === loadKey) return;
    loadedFor.current = loadKey;
    confirmedRef.current = emailConfirmed;

    let alive = true;

    const load = async () => {
      setCompteError('');
      try {
        const first = await supabase.from('paperatlas_comptes').select(SELECT).eq('id', userId).maybeSingle();
        if (first.error) throw first.error;

        let row = first.data as Compte | null;
        if (!row) {
          const seed = seedFromUser(user);
          const insert = await supabase
            .from('paperatlas_comptes')
            .upsert(seed, { onConflict: 'id', ignoreDuplicates: true });
          if (insert.error) throw insert.error;

          const again = await supabase.from('paperatlas_comptes').select(SELECT).eq('id', userId).maybeSingle();
          if (again.error) throw again.error;
          row = (again.data as Compte | null) ?? { ...seed, created_at: null };
        }
        if (alive) {
          setCompte(row);
          if (confirmedRef.current) void syncMemberCard(row).catch(() => undefined);
        }
      } catch (err) {
        if (!alive) return;
        loadedFor.current = '';
        setCompteError(err instanceof Error ? err.message : 'error');
      }
    };

    void load();

    return () => {
      alive = false;
    };
  }, [userId, user, emailConfirmed]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setCompte(null);
    loadedFor.current = '';
  }, []);

  const saveCompte = useCallback(
    async (patch: Partial<Omit<Compte, 'id'>>) => {
      if (!userId) return false;
      const { error } = await supabase
        .from('paperatlas_comptes')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) return false;
      setCompte((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        if (confirmedRef.current) void syncMemberCard(next).catch(() => undefined);
        return next;
      });
      return true;
    },
    [userId],
  );

  /* La relecture ne touche à rien d'autre qu'à la ligne du compte : elle sert
     après un rattachement fait côté serveur, pour que la phrase affichée dise
     aussitôt la vérité. */
  const refreshCompte = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('paperatlas_comptes')
      .select(SELECT)
      .eq('id', userId)
      .maybeSingle();
    if (error || !data) return;
    setCompte(data as Compte);
  }, [userId]);

  const value = useMemo<AuthValue>(
    () => ({ session, user, compte, loading, compteError, signOut, saveCompte, refreshCompte }),
    [session, user, compte, loading, compteError, signOut, saveCompte, refreshCompte],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);