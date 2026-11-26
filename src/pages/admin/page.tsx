import '@/i18n/adminDictLoader';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { useLang } from '@/i18n/LangProvider';
import { supabase } from '@/lib/supabase';
import AdminAnnonces from './components/AdminAnnonces';
import AdminClients from './components/AdminClients';
import AdminCompte from './components/AdminCompte';
import AdminDemandes from './components/AdminDemandes';
import AdminJournal from './components/AdminJournal';
import AdminMessages from './components/AdminMessages';
import AdminPaiements from './components/AdminPaiements';
import AdminParametres from './components/AdminParametres';
import AdminRelectureMini from './components/AdminRelectureMini';
import AdminSuivi from './components/AdminSuivi';
import {
  RELECTURE_TOTAL,
  useRelectureCompte,
  type RelectureLangue,
} from './components/adminRelectureCore';
import { type RelectureFocus } from './components/AdminRelecture';
import { releveParite } from './components/adminPariteCore';
import { chantierParCle } from './components/adminSuiviPlan';
import { apresRelanceParEmail } from './components/adminApresRelance';
import { synthesePaiements } from './components/adminPaiementsCore';
import type { VuePaiements } from './components/adminPaiementsCsv';
import type { Tri } from './components/AdminPaiements';
import { ADMIN_EMAIL, isAdminEmail, type AdminCompteRef, type AdminOverview, type AdminSection, type AdminTab } from './components/adminTypes';
import BrandSeal from '@/components/feature/BrandSeal';
import '@/styles/admin.css';
import '@/styles/admin-revue.css';
import '@/styles/admin-relire.css';

/**
 * La console d'administration du site : les clients abonnés, les annonces, la
 * messagerie et les réglages, sur les données réelles.
 *
 * Tout est lu côté serveur, par une fonction qui vérifie l'adresse de l'appelant
 * avant de répondre : la page elle-même ne donne aucun accès à la base, et un
 * membre ordinaire — même connecté — n'y voit qu'une porte fermée.
 */
/**
 * L'onglet qu'une porte a nommé dans l'adresse — `?section=params` —, quand il
 * en existe un. Une adresse inconnue retombe sur « Clients ».
 */
function sectionDemandee(): AdminSection {
  const demandee = new URLSearchParams(window.location.search).get('section') || '';
  const connues: string[] = [
    'clients',
    'paiements',
    'annonces',
    'demandes',
    'messages',
    'journal',
    'suivi',
    'params',
  ];
  return connues.includes(demandee) ? (demandee as AdminSection) : 'clients';
}

export default function Admin() {
  const { user, compte, loading: authLoading, signOut } = useAuth();
  const { t } = useLang();
  /* L'onglet s'ouvre sur celui que l'adresse nomme : le rappel du suivi envoie
     sur « Paramètres », droit au bloc de l'expéditeur des e-mails. */
  const [section, setSection] = useState<AdminSection>(sectionDemandee);
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  /* La fiche d'un compte se tient ici : le tableau des abonnés comme les
     annonces peuvent l'ouvrir, sans en avoir chacun leur copie. `focus` dit la
     ligne sur laquelle elle s'ouvre — la pastille « À relire » la pose sur le
     rôle du compte. */
  const [fiche, setFiche] = useState<{
    compteId: string | null;
    email: string | null;
    focus?: 'role';
  } | null>(null);
  /* Une demande de la fiche : l'onglet « Annonces » s'ouvre sur les seules
     relectures longues du compte, ou sur un dépôt nommé quand `id` est là.
     `at` distingue deux clics sur le même. */
  const [annoncesFocus, setAnnoncesFocus] = useState<{ email: string; at: number; id?: string } | null>(
    null,
  );
  /* Le fil nommé par la fiche : la messagerie s'ouvre dessus. `at` distingue
     deux demandes sur la même conversation. */
  const [messagesFocus, setMessagesFocus] = useState<{ id: string; at: number } | null>(null);
  /* Les aires nommées par le classeur des abonnés : la ligne « aires jamais
     relevées » y mène, et la messagerie s'ouvre resserrée sur elles seules.
     `at` distingue deux demandes sur les mêmes aires. */
  const [messagesAires, setMessagesAires] = useState<{
    aires: string[];
    at: number;
  } | null>(null);
  /* Un compte nommé par sa fiche : la messagerie s'ouvre en mode revue,
     réduite à ses fils en sommeil. `at` distingue deux demandes. */
  const [revueCompte, setRevueCompte] = useState<{
    compteId: string | null;
    email: string;
    nom: string;
    at: number;
  } | null>(null);
  /* Un compte nommé par la pastille d'encaissement de sa fiche : l'écran
     « Paiements » s'ouvre réduit à ses abonnements — et, quand le jeton
     « à régler » l'a demandé, à cette seule vue. */
  const [paiementsFocus, setPaiementsFocus] = useState<{
    compteId: string | null;
    email: string | null;
    at: number;
    vue?: VuePaiements;
    tri?: Tri;
    /** Les deux points de comparaison déjà choisis par la fiche : l'écran
     *  s'ouvre sur eux, sans les chercher dans les sept archives. */
    cmp?: { from: string; to: string };
  } | null>(null);
  /* La fiche d'où l'on vient : ouverte sur un dépôt, elle est rouverte au
     retour, pour ne pas perdre le compte qu'on était en train de lire quand
     on est allé voir l'annonce du tableau. */
  const [retourFiche, setRetourFiche] = useState<{ compteId: string | null; email: string | null } | null>(
    null,
  );  /* Le classeur peut nommer un dépôt : `?depot=` ouvre d'emblée l'onglet
     « Annonces » sur sa ligne, comme le fait le titre dans la fiche. */
  const [searchParams, setSearchParams] = useSearchParams();

  /* Ce qui reste à relire, langue par langue, lu sur le carnet de l'appareil :
     deux comptes séparés dans l'en-tête, à portée de chaque onglet, pour voir
     de quel côté la relecture traîne. Ils se mettent à jour dès qu'une case du
     panneau se coche. */
  const relecture = useRelectureCompte();

  /* Ce que le geste de la miniature vient de fermer, et le compte atteint :
     la pastille le dit un instant, même quand la carte du survol s'est
     refermée. `at` distingue deux gestes sur la même tournée. */
  const [tourneeFlash, setTourneeFlash] = useState<{
    id: number;
    n: number;
    apres: number;
    at: number;
  } | null>(null);

  useEffect(() => {
    if (!tourneeFlash) return undefined;
    const timer = window.setTimeout(() => setTourneeFlash(null), 4600);
    return () => window.clearTimeout(timer);
  }, [tourneeFlash]);

  /* Les clés en écart, lues sur les dictionnaires que le site embarque : le
     même relevé que le panneau de parité, compté une fois pour l'en-tête. Le
     chiffre se voit sans ouvrir l'onglet « Suivi ». */
  const parite = useMemo(() => {
    const releve = releveParite();
    return {
      cles: releve.manqueAr + releve.manqueEn + releve.orphelines,
      manqueAr: releve.manqueAr,
      manqueEn: releve.manqueEn,
      orphelines: releve.orphelines,
    };
  }, []);

  /* La langue nommée par une pastille d'en-tête : l'onglet « Suivi » s'ouvre
     sur la liste resserrée sur les pages qui restent à cocher de ce côté.
     `at` distingue deux clics sur la même pastille. */
  const [relectureFocus, setRelectureFocus] = useState<RelectureFocus | null>(null);

  /* Le chantier nommé par une porte — `?section=suivi&chantier=mail` : l’onglet
     « Suivi du projet » s’ouvre resserré sur lui, sans repasser par les onglets. */
  const [chantierFocus, setChantierFocus] = useState<string | null>(null);

  /* Les accusés encore en attente, lus par la même fonction que la carte des
     Paramètres : le chiffre se voit depuis tous les onglets, et le rappel
     s’allume dès qu’un accusé dépasse les vingt-quatre heures. */
  const [accusesHead, setAccusesHead] = useState<{
    waiting: number;
    overdue: number;
    oldest: string | null;
    /** La porte de l'envoi, lue chez Brevo : tant que la clé ou le domaine
     *  vérifié manque, aucun accusé ne peut réellement partir — la pastille
     *  le dit depuis n'importe quel onglet. */
    gate: {
      configured: boolean;
      verified: boolean;
      checked: boolean;
      status: string;
    } | null;
  } | null>(null);

  /* L'accès tient à l'adresse historique et, désormais, au rôle « admin »
     porté par le compte : un compte promu en base entre sans dépendre d'une
     constante recopiée dans le code. */
  const admin =
    isAdminEmail(user?.email || compte?.email) ||
    (compte?.role ?? '').toLowerCase() === 'admin';

  const ouvrirFiche = (
    compteId: string | null,
    email: string | null,
    focus?: 'role',
  ) => {
    setRetourFiche(null);
    setFiche({ compteId, email, focus });
  };

  /* Les relectures longues d'un compte : la liste s'ouvre sur lui, et le
     compte lu est retenu. Qu'on vienne du tableau des abonnés, des comptes du
     site ou de la fiche elle-même, sortir de la liste — fermer le filtre,
     élargir au compte — ramène à la fiche plutôt que de laisser sur une liste
     qui ne dit plus d'où elle vient. */
  const ouvrirRelectures = (email: string, compteId?: string | null) => {
    setRetourFiche(fiche ?? { compteId: compteId ?? null, email });
    setAnnoncesFocus({ email, at: Date.now() });
    setSection('annonces');
    setFiche(null);
  };

  /* Le dépôt nommé par la fiche : la liste s'ouvre sur lui, sans repasser
     par les relectures longues ni par la recherche. La fiche d'où l'on part
     est retenue : elle se rouvrira quand on quittera l'annonce. */
  const ouvrirAnnonce = (email: string, annonceId: string) => {
    if (fiche) setRetourFiche({ compteId: fiche.compteId, email: fiche.email || email });
    setAnnoncesFocus({ email, at: Date.now(), id: annonceId });
    setSection('annonces');
    setFiche(null);
  };

  /* Un fil nommé par la fiche d'un compte : la messagerie de la console
     s'ouvre sur cette conversation, le compte lu ne se perd pas. */
  const ouvrirFil = (conversationId: string) => {
    setAnnoncesFocus(null);
    setRetourFiche(null);
    setRevueCompte(null);
    setMessagesAires(null);
    setMessagesFocus({ id: conversationId, at: Date.now() });
    setSection('messages');
    setFiche(null);
  };

  /* La revue d'un compte, ouverte depuis sa fiche : la messagerie se réduit
     aux fils en sommeil de ce compte et le dit, pour que la liste ne fasse
     pas croire à un silence qu'elle aurait inventé. */
  const ouvrirRevueCompte = (compteId: string | null, email: string | null) => {
    const cle = (email || '').trim().toLowerCase();
    const trouve = (data?.comptes ?? []).find(
      (row) =>
        (compteId && row.id === compteId) ||
        (cle && (row.email || '').trim().toLowerCase() === cle),
    );
    setAnnoncesFocus(null);
    setMessagesFocus(null);
    setMessagesAires(null);
    setRetourFiche(null);
    setRevueCompte({
      compteId: compteId ?? trouve?.id ?? null,
      email: email || trouve?.email || '',
      nom: trouve ? trouve.organisme || trouve.nom || trouve.email || '—' : email || '—',
      at: Date.now(),
    });
    setSection('messages');
    setFiche(null);
  };

  /* L'encaissement d'un abonnement lu sur la fiche : l'écran « Paiements »
     s'ouvre déjà resserré sur ce compte, avec la même règle que la pastille
     qui vient d'être cliquée. Le jeton « {n} à régler » y ajoute sa vue ;
     la pastille seule ouvre la file entière du compte. `at` distingue deux
     demandes sur le même. */
  const ouvrirPaiementsCompte = (
    compteId: string | null,
    email: string | null,
    vue: VuePaiements = 'all',
    tri: Tri = 'etat',
    cmp?: { from: string; to: string },
  ) => {
    setAnnoncesFocus(null);
    setMessagesFocus(null);
    setRevueCompte(null);
    setRetourFiche(null);
    setPaiementsFocus({ compteId, email, vue, tri, cmp, at: Date.now() });
    setSection('paiements');
    setFiche(null);
  };

  /* Le retour de l'annonce : on retombe sur la fiche du compte, à l'endroit
     exact qu'on venait de quitter. Sans fiche retenue, le retour ne fait rien
     et la liste reste telle quelle. */
  const revenirFiche = () => {
    if (!retourFiche) return;
    setFiche(retourFiche);
    setRetourFiche(null);
  };

  /* L'adresse lue une fois : le dépôt nommé par le classeur s'ouvre, puis
     l'adresse est nettoyée pour qu'un changement d'onglet ne rouvre pas la
     même ligne à chaque rendu. */
  useEffect(() => {
    const depot = searchParams.get('depot');
    if (!depot) return;
    setAnnoncesFocus({
      email: searchParams.get('email') || '',
      at: Date.now(),
      id: depot,
    });
    setSection('annonces');
    setFiche(null);
    const restants = new URLSearchParams(searchParams);
    restants.delete('depot');
    restants.delete('email');
    setSearchParams(restants, { replace: true });
  }, [searchParams, setSearchParams]);

  /* Les aires nommées par le classeur — `?section=messages&aires=maghreb,golfe` —
     ouvrent la messagerie resserrée sur elles. L'adresse est nettoyée ensuite,
     pour qu'un changement d'onglet ne rejoue pas le resserrement. */
  useEffect(() => {
    const brut = searchParams.get('aires');
    if (!brut) return;
    const aires = brut
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean);
    setAnnoncesFocus(null);
    setMessagesFocus(null);
    setRevueCompte(null);
    setRetourFiche(null);
    setSection('messages');
    setMessagesAires(aires.length > 0 ? { aires, at: Date.now() } : null);
    setFiche(null);
    const restants = new URLSearchParams(searchParams);
    restants.delete('aires');
    setSearchParams(restants, { replace: true });
  }, [searchParams, setSearchParams]);

  /* Une pastille de pose d'un écran public nomme son fichier dans l'adresse :
     l'onglet « Suivi » s'ouvre sur le relevé de parité, déjà resserré sur ce
     fichier et sur la famille de clés de l'écran. L'adresse est nettoyée
     ensuite, pour qu'un changement d'onglet ne rejoue pas le resserrement. */
  useEffect(() => {
    const fichier = searchParams.get('parite');
    if (!fichier) return;
    const familles = (searchParams.get('fam') || '')
      .split(',')
      .map((fam) => fam.trim())
      .filter(Boolean);
    setAnnoncesFocus(null);
    setMessagesFocus(null);
    setRevueCompte(null);
    setRetourFiche(null);
    setSection('suivi');
    setRelectureFocus({
      langue: null,
      desaccord: false,
      parite: true,
      fichier,
      familles,
      /* Le lien copié portait ce qui restait à poser : il se lit en tête du
         resserrement, pour que le relecteur sache où il arrive. */
      reste: Number(searchParams.get('reste')) || undefined,
      at: Date.now(),
    });
    setFiche(null);
    const restants = new URLSearchParams(searchParams);
    restants.delete('parite');
    restants.delete('fam');
    restants.delete('reste');
    setSearchParams(restants, { replace: true });
  }, [searchParams, setSearchParams]);

  /* Le chantier nommé dans l'adresse : la porte du guide de l'expéditeur
     ouvre le suivi resserré sur les e-mails, puis l'adresse est nettoyée pour
     qu'un changement d'onglet ne rejoue pas le resserrement. */
  useEffect(() => {
    const cle = searchParams.get('chantier');
    if (!cle) return;
    const nom = chantierParCle(cle);
    setAnnoncesFocus(null);
    setMessagesFocus(null);
    setRevueCompte(null);
    setRetourFiche(null);
    setRelectureFocus(null);
    setSection('suivi');
    setChantierFocus(nom);
    setFiche(null);
    const restants = new URLSearchParams(searchParams);
    restants.delete('chantier');
    setSearchParams(restants, { replace: true });
  }, [searchParams, setSearchParams]);

  /* L'ancre nommée par l'adresse est rejointe une fois l'onglet rendu : le
     bloc « Expéditeur des e-mails » se présente sans qu'on le cherche. */
  useEffect(() => {
    if (section !== 'params' || !data) return undefined;
    const id = window.location.hash.replace('#', '');
    if (!id) return undefined;
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 240);
    return () => window.clearTimeout(timer);
  }, [section, data]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: answer, error: failure } = await supabase.functions.invoke('admin-console', {
        body: { action: 'overview' },
      });
      const payload = answer as ({ ok?: boolean } & Partial<AdminOverview>) | null;
      if (failure || !payload?.ok) {
        setError(t('ad.error'));
        return;
      }
      setData({
        abonnements: payload.abonnements ?? [],
        comptes: payload.comptes ?? [],
        annonces: payload.annonces ?? [],
        conversations: payload.conversations ?? [],
        parametres: payload.parametres ?? null,
        demandesEnAttente: payload.demandesEnAttente ?? 0,
      });
    } catch {
      setError(t('ad.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (authLoading) return;
    if (!admin) {
      setLoading(false);
      return;
    }
    void load();
  }, [authLoading, admin, load]);

  /* Le compteur d’en-tête se relit avec la console : le chiffre de la pastille
     et celui de la carte des Paramètres ne peuvent pas se contredire. */
  const lireAccusesHead = useCallback(async () => {
    try {
      const { data: answer, error: failure } = await supabase.functions.invoke(
        'accuses-candidature',
        { body: { action: 'etat' } },
      );
      const payload = answer as
        | {
            ok?: boolean;
            waiting?: number;
            overdue?: number;
            oldestWaitingAt?: string | null;
            gate?: {
              configured?: boolean;
              verified?: boolean;
              checked?: boolean;
              status?: string;
            } | null;
          }
        | null;
      if (failure || !payload?.ok) {
        setAccusesHead(null);
        return;
      }
      setAccusesHead({
        waiting: payload.waiting ?? 0,
        overdue: payload.overdue ?? 0,
        oldest: payload.oldestWaitingAt ?? null,
        gate: payload.gate
          ? {
              configured: Boolean(payload.gate.configured),
              verified: Boolean(payload.gate.verified),
              checked: Boolean(payload.gate.checked),
              status: payload.gate.status ?? '',
            }
          : null,
      });
    } catch {
      setAccusesHead(null);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !admin) return;
    void lireAccusesHead();
  }, [authLoading, admin, data, lireAccusesHead]);

  /* Les dépôts arrivés après la relance, comptés par compte : la fiche y lit
     son rang parmi les autres, sur la même mesure que le tableau et le
     classeur. */
  const apresParCle = useMemo(
    () =>
      apresRelanceParEmail(data?.annonces ?? [], [
        ...(data?.comptes ?? []).map((row) => row.email),
        ...(data?.abonnements ?? []).map((row) => row.email),
      ]),
    [data],
  );

  /* Les dépôts arrivés après la relance, ramenés au fil de discussion : le tri
     « après relance » de la messagerie lit la même mesure que le tableau des
     abonnés, sur les deux tables d’adresses. */
  const apresParFil = useMemo(() => {
    const mailDe = new Map<string, string>();
    (data?.comptes ?? []).forEach((row) => {
      const cle = (row.email || '').trim().toLowerCase();
      if (row.id && cle) mailDe.set(row.id, cle);
    });
    (data?.abonnements ?? []).forEach((row) => {
      const cle = (row.email || '').trim().toLowerCase();
      if (row.artisan_id && cle && !mailDe.has(row.artisan_id)) mailDe.set(row.artisan_id, cle);
    });
    const map = new Map<string, number>();
    (data?.conversations ?? []).forEach((row) => {
      let compte = 0;
      [row.user_a, row.user_b].forEach((id) => {
        const cle = id ? mailDe.get(id) : undefined;
        if (cle) compte = Math.max(compte, apresParCle.get(cle) ?? 0);
      });
      if (compte > 0) map.set(row.id, compte);
    });
    return map;
  }, [data, apresParCle]);

  /* Les comptes, rangés par identifiant puis par adresse : la messagerie s'en
     sert pour passer d'un fil à la fiche du compte concerné. */
  const comptesParId = useMemo(() => {
    const map = new Map<string, AdminCompteRef>();
    (data?.comptes ?? []).forEach((row) => {
      map.set(row.id, {
        id: row.id,
        email: row.email,
        nom: row.organisme || row.nom || row.email || row.id.slice(0, 8),
        pays: row.pays,
      });
    });
    return map;
  }, [data]);

  const comptesParMail = useMemo(() => {
    const map = new Map<string, AdminCompteRef>();
    (data?.comptes ?? []).forEach((row) => {
      const cle = (row.email || '').trim().toLowerCase();
      if (!cle) return;
      map.set(cle, {
        id: row.id,
        email: row.email,
        nom: row.organisme || row.nom || row.email || row.id.slice(0, 8),
        pays: row.pays,
      });
    });
    return map;
  }, [data]);

  /* Ce que les abonnements doivent rapporter, lu sur les mêmes lignes que le
     tableau des clients : l'onglet « Paiements » en porte le compte, et son
     écran en détaille les raisons. */
  const paiements = useMemo(
    () => synthesePaiements(data?.abonnements ?? []),
    [data],
  );

  /* Le compte d'un participant : son identifiant d'abord, son adresse ensuite,
     rien du tout sinon — la messagerie n'affiche alors aucun lien. */
  const compteDeFil = useCallback(
    (userId: string, email?: string | null): AdminCompteRef | null => {
      const direct = userId ? comptesParId.get(userId) : undefined;
      if (direct) return direct;
      const cle = (email || '').trim().toLowerCase();
      return (cle ? comptesParMail.get(cle) : undefined) ?? null;
    },
    [comptesParId, comptesParMail],
  );

  /* La visite attend la session : afficher « accès refusé » à un membre déjà
     connecté, le temps que le jeton arrive, serait un mensonge. */
  if (authLoading) {
    return (
      <main className="admin admin-solo">
        <p className="admin-loading">
          <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
          {t('ad.loading')}
        </p>
      </main>
    );
  }

  if (!admin) {
    return (
      <main className="admin admin-solo">
        <section className="admin-gate">
          <span className="admin-gate-mark" aria-hidden="true">
            <i className="ri-lock-2-line"></i>
          </span>
          <h1>{t('ad.denied.title')}</h1>
          <p>{t('ad.denied.body')}</p>
          <p className="admin-gate-mail">
            <i className="ri-at-line" aria-hidden="true"></i>
            {ADMIN_EMAIL}
          </p>
          <div className="admin-gate-actions">
            <Link to="/compte/connexion" className="admin-btn" data-tone="accent">
              <i className="ri-login-box-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ad.denied.cta')}</span>
            </Link>
            <Link to="/" className="admin-ghost">
              {t('ad.back')}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /* Changer de section referme la fiche : la même barre d'onglets vit dans
     l'en-tête de la fiche, et un onglet choisi là-bas ne doit pas laisser un
     panneau ouvert sur la section quittée. */
  const choisirSection = (key: AdminSection) => {
    setAnnoncesFocus(null);
    setMessagesFocus(null);
    setMessagesAires(null);
    setRetourFiche(null);
    setRevueCompte(null);
    setPaiementsFocus(null);
    setRelectureFocus(null);
    setChantierFocus(null);
    setSection(key);
    setFiche(null);
  };

  /* La pastille d'en-tête est une porte : elle ouvre l'onglet « Suivi » sur la
     liste de relecture, resserrée sur sa langue. Le resserrement est posé
     après le changement d'onglet, qui rend, lui, la liste entière. */
  const ouvrirRelecture = (langue: RelectureLangue) => {
    choisirSection('suivi');
    setRelectureFocus({ langue, at: Date.now() });
  };

  /* Le compte du désaccord est une porte lui aussi : il ouvre la liste
     resserrée sur les pages où une langue est cochée sans l'autre, là où le
     relecteur doit reprendre. */
  const ouvrirEcart = () => {
    choisirSection('suivi');
    setRelectureFocus({ langue: null, desaccord: true, at: Date.now() });
  };

  /* Une pastille de tournée ouvre la liste resserrée sur ses dix écrans, dans
     l'ordre de passage — l'arabe d'abord. La ligne de la tournée y porte le
     geste qui les coche, et la pastille se calme quand ils sont faits. */
  const ouvrirTournee = (id: number) => {
    choisirSection('suivi');
    setRelectureFocus({ langue: null, desaccord: false, tournee: id, at: Date.now() });
  };

  /* La pastille des clés ouvre le relevé de parité, sous la liste de
     relecture : on arrive sur le détail, pas au début de l'onglet. */
  const ouvrirParite = () => {
    choisirSection('suivi');
    setRelectureFocus({
      langue: null,
      desaccord: false,
      parite: true,
      at: Date.now(),
    });
  };

  /* Cinq onglets, cinq signes qui ne se confondent pas : l'étoile du membre
     reste à la barre, et les deux listes qui se ressemblaient — dépôts et
     journal — prennent enfin deux visages distincts. */
  const tabs: AdminTab[] = [
    {
      key: 'clients',
      label: t('ad.tab.clients'),
      icon: 'ri-team-line',
      count: data ? data.abonnements.length : null,
    },
    {
      key: 'paiements',
      label: t('ad.tab.paiements'),
      icon: 'ri-bank-card-line',
      count: data && paiements.aRegler > 0 ? paiements.aRegler : null,
    },
    {
      key: 'annonces',
      label: t('ad.tab.annonces'),
      icon: 'ri-megaphone-line',
      count: data ? data.annonces.length : null,
    },
    {
      key: 'demandes',
      label: t('ad.tab.demandes'),
      icon: 'ri-inbox-archive-line',
      count: (data?.demandesEnAttente ?? 0) > 0 ? data?.demandesEnAttente ?? 0 : null,
    },
    {
      key: 'messages',
      label: t('ad.tab.messages'),
      icon: 'ri-chat-3-line',
      count: data ? data.conversations.length : null,
    },
    { key: 'journal', label: t('ad.tab.journal'), icon: 'ri-book-2-line', count: null },
    { key: 'suivi', label: t('ad.tab.suivi'), icon: 'ri-road-map-line', count: null },
    { key: 'params', label: t('ad.tab.params'), icon: 'ri-settings-3-line', count: null },
  ];

  /* La porte de l'envoi des accusés, lue chez Brevo par la même fonction que
     les compteurs : tant qu'elle est fermée, la pastille de l'en-tête le dit,
     et l'on voit depuis n'importe quel onglet que rien ne peut partir. */
  const accusesGate = accusesHead?.gate ?? null;
  const accusesGateBlocked = Boolean(
    accusesGate && !(accusesGate.configured && accusesGate.verified),
  );
  const accusesGatePhrase = !accusesGate
    ? ''
    : accusesGateBlocked
      ? t('ad.accuse.gateBlocked')
      : t('ad.accuse.gateReady');

  return (
    <main className="admin admin-shell">
      <aside className="admin-side">
        <div className="admin-brand">
          <BrandSeal className="admin-brand-mark" label="PaperAtlas" />
          <span className="admin-brand-text">
            <em>{t('ad.stamp')}</em>
            <strong>{t('ad.title')}</strong>
          </span>
          {/* La seconde marque du réseau, comme dans la barre du site : la
              console aussi nomme les deux mondes, au même endroit. */}
          <span className="admin-brand-world">
            <b lang="ar" dir="rtl">العالم العربي</b>
            <small>Arabe World</small>
          </span>
        </div>
        <nav className="admin-tabs" aria-label={t('ad.title')}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className="admin-tab"
              data-on={section === tab.key ? 'yes' : 'no'}
              aria-pressed={section === tab.key}
              onClick={() => choisirSection(tab.key)}
            >
              <i className={tab.icon} aria-hidden="true"></i>
              <span>{tab.label}</span>
              {tab.count !== null && <b>{tab.count}</b>}
            </button>
          ))}
        </nav>
        <div className="admin-side-todo">
          {/* Les deux comptes de la relecture, côte à côte : celui de l'arabe
              et celui de l'anglais, chacun avec son reste. Un écart entre les
              deux dit de quel côté la relecture traîne ; un clic ouvre la
              liste, sur l'onglet qui porte les cases. */}
          <span className="admin-relire-duo">
            {(['ar', 'en'] as const).map((langue) => {
              const reste = langue === 'ar' ? relecture.resteAr : relecture.resteEn;
              const fait = langue === 'ar' ? relecture.ar : relecture.en;
              const nom = t(langue === 'ar' ? 'ad.suivi.rlAr' : 'ad.suivi.rlEn');
              const phrase =
                reste === 0
                  ? t(langue === 'ar' ? 'ad.relectureArDone' : 'ad.relectureEnDone')
                  : t(
                      langue === 'ar' ? 'ad.relectureArCount' : 'ad.relectureEnCount',
                    ).replace('{n}', String(reste));
              return (
                <button
                  key={langue}
                  type="button"
                  className="admin-relire"
                  data-zero={reste === 0 ? 'yes' : 'no'}
                  data-langue={langue}
                  aria-label={`${nom} · ${phrase}`}
                  title={`${nom} · ${phrase} · ${t(
                    langue === 'ar' ? 'ad.relectureArHint' : 'ad.relectureEnHint',
                  )}`}
                  onClick={() => ouvrirRelecture(langue)}
                >
                  <i
                    className={
                      reste === 0 ? 'ri-check-double-line' : 'ri-checkbox-multiple-line'
                    }
                    aria-hidden="true"
                  ></i>
                  <b className="admin-relire-lang">{langue.toUpperCase()}</b>
                  <span className="admin-relire-num" aria-hidden="true">
                    {fait}
                    <em>/{RELECTURE_TOTAL}</em>
                  </span>
                </button>
              );
            })}
          </span>
          {/* Une pastille par tournée, comptée à côté des trente pages : ce
              qu'elle porte des deux côtés, et ce qu'il lui reste en arabe, le
              côté par lequel elle commence. Un clic ouvre la liste sur ses dix
              écrans, où le geste de la ligne la coche jusqu'au bout. */}
          {relecture.tournees.map((tour) => {
            const finie = tour.total > 0 && tour.deux === tour.total;
            const phrase = finie
              ? t('ad.relectureTourneeDone')
              : t('ad.relectureTourneeCount')
                  .replace('{done}', String(tour.deux))
                  .replace('{n}', String(tour.total))
                  .replace('{reste}', String(tour.resteAr));
            const nom = `${t('ad.relectureTourneeTag')} ${tour.id}`;
            /* Ce qui reste à cocher en arabe, rang par rang : le survol nomme
               les écrans eux-mêmes — « 02, 05, 07 » —, et non seulement leur
               nombre. Le relecteur choisit ainsi par où reprendre, et les deux
               chiffres se lisent dans la même écriture que le CSV. */
            const restantsAr = tour.restantsAr;
            const listeAr = restantsAr
              .map((n) => String(n).padStart(2, '0'))
              .join(', ');
            const phraseAr =
              restantsAr.length === 0
                ? t('ad.relectureTourneeRestNone')
                : t(
                    restantsAr.length === 1
                      ? 'ad.relectureTourneeRestArOne'
                      : 'ad.relectureTourneeRestAr',
                  ).replace('{list}', listeAr);
            return (
              <span className="admin-relire-mini-wrap" key={tour.id}>
                <button
                  type="button"
                  className="admin-relire admin-relire-tournee"
                  data-zero={finie ? 'yes' : 'no'}
                  data-flash={tourneeFlash && tourneeFlash.id === tour.id ? 'yes' : 'no'}
                  aria-label={`${nom} · ${phrase} · ${phraseAr}`}
                  title={`${nom} · ${phrase} · ${phraseAr} · ${t(
                    'ad.relectureTourneeRestHint',
                  )} ${t('ad.relectureTourneeHint')} ${t('ad.relectureTourneeGo')}`}
                  onClick={() => ouvrirTournee(tour.id)}
                >
                  {tourneeFlash && tourneeFlash.id === tour.id ? (
                    <>
                      <i className="ri-check-double-line" aria-hidden="true"></i>
                      <span className="admin-relire-tournee-flash">
                        {t('ad.relectureTourneeFlash')
                          .replace('{n}', String(tourneeFlash.n))
                          .replace('{apres}', String(tourneeFlash.apres))
                          .replace('{total}', String(tour.total))}
                      </span>
                    </>
                  ) : (
                    <>
                      <i className="ri-route-line" aria-hidden="true"></i>
                      <span className="admin-relire-tag">{nom}</span>
                      <b className="admin-relire-num">
                        {tour.deux}
                        <em>/{tour.total}</em>
                      </b>
                    </>
                  )}
                </button>
                {/* La frise en miniature, sous le survol de la pastille : les
                    dix écrans de la tournée, leur état, le dire de chaque
                    marque et le rang par lequel reprendre. Chaque marque
                    s'ouvre d'un clic dans un nouvel onglet — on quitte la page
                    relue, pas l'en-tête —, tandis que la pastille, elle,
                    ouvre le panneau où le geste se fait. Et le bouton de la
                    carte ferme d'un coup, des deux côtés, les écrans qui
                    restent : la miniature agit sur place, sans ouvrir le
                    panneau. */}
                <AdminRelectureMini
                  tour={tour}
                  etat={relecture.etat}
                  onClosed={(n, apres) =>
                    setTourneeFlash({ id: tour.id, n, apres, at: Date.now() })
                  }
                />
              </span>
            );
          })}
          {/* Le compte du désaccord, à côté des deux langues : les pages
              cochées d'un seul côté, celles où l'arabe et l'anglais ne
              s'accordent pas encore. Il se lit sans ouvrir le panneau, et un
              clic l'ouvre resserré sur ces seules pages. */}
          <button
            type="button"
            className="admin-relire admin-relire-ecart"
            data-zero={relecture.unCote.length === 0 ? 'yes' : 'no'}
            aria-label={
              relecture.unCote.length === 0
                ? t('ad.relectureEcartNone')
                : t('ad.relectureEcartCount').replace('{n}', String(relecture.unCote.length))
            }
            title={`${
              relecture.unCote.length === 0
                ? t('ad.relectureEcartNone')
                : t('ad.relectureEcartCount').replace('{n}', String(relecture.unCote.length))
            } · ${t('ad.relectureEcartHint')}`}
            onClick={ouvrirEcart}
          >
            <i
              className={
                relecture.unCote.length === 0 ? 'ri-check-double-line' : 'ri-contrast-drop-line'
              }
              aria-hidden="true"
            ></i>
            <span className="admin-relire-tag">
              {t(
                relecture.unCote.length === 0
                  ? 'ad.relectureEcartNoneTag'
                  : 'ad.relectureEcartTag',
              )}
            </span>
            {relecture.unCote.length > 0 && (
              <b className="admin-relire-num">{relecture.unCote.length}</b>
            )}
          </button>
          {/* Le compte des clés en écart, à côté des trois pastilles de
              relecture : les clés qu'une langue nomme sans l'autre, lues sur
              les dictionnaires du site. Un clic ouvre le relevé lui-même. */}
          <button
            type="button"
            className="admin-relire admin-relire-cles"
            data-zero={parite.cles === 0 ? 'yes' : 'no'}
            aria-label={
              parite.cles === 0
                ? t('ad.par.chipNone')
                : t('ad.par.chipCount').replace('{n}', String(parite.cles))
            }
            title={`${
              parite.cles === 0
                ? t('ad.par.chipNone')
                : `${t('ad.par.chipCount').replace('{n}', String(parite.cles))} · ${t(
                    'ad.par.chipSplit',
                  )
                    .replace('{ar}', String(parite.manqueAr))
                    .replace('{en}', String(parite.manqueEn))
                    .replace('{orph}', String(parite.orphelines))}`
            } · ${t('ad.par.chipHint')}`}
            onClick={ouvrirParite}
          >
            <i
              className={parite.cles === 0 ? 'ri-check-double-line' : 'ri-translate-2'}
              aria-hidden="true"
            ></i>
            <span className="admin-relire-tag">
              {t(parite.cles === 0 ? 'ad.par.chipNoneTag' : 'ad.par.chipTag')}
            </span>
            {parite.cles > 0 && <b className="admin-relire-num">{parite.cles}</b>}
          </button>
          {/* Les accusés de réception encore en attente, posés une fois pour
              toute la console : le chiffre se lit depuis n’importe quel
              onglet, et la pastille s’allume dès qu’un accusé attend depuis
              plus de vingt-quatre heures. */}
          <button
            type="button"
            className="admin-relire admin-accuses"
            data-zero={accusesHead && accusesHead.waiting === 0 ? 'yes' : 'no'}
            data-alert={accusesHead && accusesHead.overdue > 0 ? 'yes' : 'no'}
            data-gate={
              accusesGate ? (accusesGateBlocked ? 'blocked' : 'ready') : 'unknown'
            }
            aria-label={`${t('ad.accuse.chip')} · ${
              accusesHead
                ? t('ad.accuse.waiting').replace('{n}', String(accusesHead.waiting))
                : t('ad.accuse.loading')
            }${accusesGatePhrase ? ` · ${accusesGatePhrase}` : ''} · ${
              accusesGateBlocked ? t('ad.accuse.openVerify') : t('ad.accuse.open')
            }`}
            title={
              accusesHead
                ? `${t('ad.accuse.waiting').replace('{n}', String(accusesHead.waiting))}${
                    accusesHead.overdue > 0
                      ? ` · ${t('ad.accuse.overdue')
                          .replace('{n}', String(accusesHead.overdue))
                          .replace(
                            '{date}',
                            accusesHead.oldest
                              ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(
                                  new Date(accusesHead.oldest),
                                )
                              : '—',
                          )}`
                      : ` · ${t('ad.accuse.noLate')}`
                  }${accusesGatePhrase ? ` · ${accusesGatePhrase}` : ''} · ${
                    accusesGateBlocked ? t('ad.accuse.openVerify') : t('ad.accuse.open')
                  }`
                : t('ad.accuse.loading')
            }
            onClick={() => {
              /* Quand la pastille signale un envoi bloqué, elle n’ouvre pas la
                 file des accusés mais la vérification chez Brevo — le seul
                 fait qui autorise un accusé à partir. Sinon elle ouvre la
                 carte des accusés elle-même. */
              const cible = accusesGateBlocked ? 'expediteur' : 'accuses';
              window.location.hash = cible;
              if (section === 'params') {
                document
                  .getElementById(cible)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
              }
              choisirSection('params');
            }}
          >
            {accusesHead && accusesHead.overdue > 0 && (
              <span className="admin-accuses-dot" aria-hidden="true"></span>
            )}
            {accusesGateBlocked && (
              <span className="admin-accuses-gate" aria-hidden="true">
                <i className="ri-shield-cross-line"></i>
              </span>
            )}
            <i
              className={
                !accusesHead
                  ? 'ri-loader-4-line is-spin'
                  : accusesHead.waiting === 0
                    ? 'ri-check-double-line'
                    : accusesHead.overdue > 0
                      ? 'ri-alarm-warning-line'
                      : 'ri-mail-forbid-line'
              }
              aria-hidden="true"
            ></i>
            <span className="admin-relire-tag">{t('ad.accuse.chip')}</span>
            {accusesHead && accusesHead.waiting > 0 && (
              <b className="admin-relire-num">{accusesHead.waiting}</b>
            )}
          </button>
        </div>
      </aside>

      <div className="admin-content">
      <header className="admin-top">
        <div className="admin-top-actions">
          <span className="admin-who" title={user?.email ?? ''}>
            {t('ad.signedAs')} <b>{user?.email}</b>
          </span>
          <button type="button" className="admin-ghost" onClick={() => void load()}>
            <i className="ri-refresh-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('ad.refresh')}</span>
          </button>
          <Link to="/" className="admin-ghost">
            <i className="ri-arrow-left-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('ad.back')}</span>
          </Link>
          <button type="button" className="admin-ghost" onClick={() => void signOut()}>
            <i className="ri-logout-box-r-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('ad.signout')}</span>
          </button>
        </div>
      </header>

      <div className="admin-body">
        {loading ? (
          <p className="admin-loading">
            <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
            {t('ad.loading')}
          </p>
        ) : error ? (
          <div className="admin-gate">
            <span className="admin-gate-mark" aria-hidden="true">
              <i className="ri-error-warning-line"></i>
            </span>
            <p>{error}</p>
            <button type="button" className="admin-btn" onClick={() => void load()}>
              <i className="ri-refresh-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ad.retry')}</span>
            </button>
          </div>
        ) : !data ? (
          <p className="admin-empty">{t('ad.error')}</p>
        ) : section === 'clients' ? (
          <AdminClients
            data={data}
            onOpenCompte={ouvrirFiche}
            onOpenLateAnnonces={ouvrirRelectures}
            onOpenThread={ouvrirFil}
          />
        ) : section === 'paiements' ? (
          <AdminPaiements
            rows={data.abonnements}
            onOpenCompte={ouvrirFiche}
            focus={paiementsFocus}
            onClearFocus={() => setPaiementsFocus(null)}
          />
        ) : section === 'annonces' ? (
          <AdminAnnonces
            rows={data.annonces}
            abonnements={data.abonnements}
            onOpenCompte={ouvrirFiche}
            focus={annoncesFocus}
            onClearFocus={() => setAnnoncesFocus(null)}
            onReturnCompte={revenirFiche}
          />
        ) : section === 'demandes' ? (
          <AdminDemandes />
        ) : section === 'messages' ? (
          <AdminMessages
            rows={data.conversations}
            focus={messagesFocus}
            compteDe={compteDeFil}
            onOpenCompte={ouvrirFiche}
            apresParFil={apresParFil}
            revueCompte={revueCompte}
            airesFocus={messagesAires}
            onClearRevueCompte={() => setRevueCompte(null)}
          />
        ) : section === 'journal' ? (
          <AdminJournal data={data} onOpenThread={ouvrirFil} />
        ) : section === 'suivi' ? (
          <AdminSuivi relectureFocus={relectureFocus} chantierFocus={chantierFocus} />
        ) : (
          <AdminParametres data={data} onReload={() => void load()} />
        )}
      </div>
      </div>

      {fiche && (
        <AdminCompte
          compteId={fiche.compteId}
          email={fiche.email}
          onClose={() => setFiche(null)}
          onOpenLateAnnonces={ouvrirRelectures}
          onOpenAnnonce={ouvrirAnnonce}
          onOpenRevueCompte={ouvrirRevueCompte}
          onOpenPaiements={ouvrirPaiementsCompte}
          apresParCle={apresParCle}
          conversations={data.conversations}
          onOpenThread={ouvrirFil}
          section={section}
          tabs={tabs}
          onPickSection={choisirSection}
          focus={fiche.focus ?? null}
        />
      )}
    </main>
  );
}