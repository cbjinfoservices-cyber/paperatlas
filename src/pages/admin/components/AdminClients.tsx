import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import CopyTextButton from '@/components/feature/CopyTextButton';
import { supabase } from '@/lib/supabase';
import { enSommeil } from '@/lib/messaging';
import { nomCommune } from '@/lib/communeLabels';
import {
  compterJetons,
  downloadAbonnesWorkbook,
  type RevueJournalRow,
} from './adminClientsXlsx';
import type { AccuseEnAttente, RenvoiAccuse } from './adminAccusesCsv';
import { saveChips } from './adminChipsMemory';
import AdminRelance from './AdminRelance';
import { apresRelanceParEmail } from './adminApresRelance';
import { recapPriorites } from './adminPriorites';
import { readRelanceAt, relanceTranche, saveRelanceAt, JOURS_RELANCE_PROCHE, joursDepuisRelance, type RelanceTranche } from './adminRelanceMemory';
import { readAncienFirst, readApresFirst, readAiresTight, readGommeAncienneFirst, readGommeFirst, readGommeHorsAncienne, readJamaisFirst, readRecentFirst, readRevueFirst } from './adminSleepMemory';
import { readAireRelevesJours, readAireRelevesTousCopies, readGommesAiresJours, readGommesReleves } from '@/lib/aireCarteMemory';
import { REGIONS_MONDE, regionMondeDe, type RegionMonde } from '@/lib/worldRegions';
import { readOuverture, readRevus } from './adminReviewMemory';
import { corpsRelance, sujetRelance } from './adminRelanceText';
import {
  depotsParEmail,
  echeanceEnMots,
  echeanceProche,
  estAdminCompte,
  estEssai,
  estFerme,
  jour,
  joursAvant,
  nombre,
  promotionARelire,
  triParPromotion,
  type AdminCompte,
  type AdminConversation,
  type AdminOverview,
  type AdminTri,
  type AdminTriPromo,
} from './adminTypes';

type Props = {
  data: AdminOverview;
  /** Ouvre la fiche d'un compte, tenue par la console elle-même. Le troisième
   *  argument la pose sur une ligne précise : la pastille « À relire » ouvre
   *  la fiche sur la ligne de rôle, pour relire la promotion sans chercher. */
  onOpenCompte: (
    compteId: string | null,
    email: string | null,
    focus?: 'role',
  ) => void;
  /** Ouvre l'onglet « Annonces » réduit aux relectures longues d'un compte,
   *  d'un seul clic depuis la ligne du tableau. Le compte est nommé avec son
   *  identifiant quand la ligne en a un : la fiche pourra se rouvrir au
   *  retour, comme lorsqu'on arrive par un dépôt. */
  onOpenLateAnnonces: (email: string, compteId?: string | null) => void;
  /** Ouvre la messagerie de la console sur un fil nommé : un clic sur la
   *  pastille de sommeil d'une ligne y mène directement. */
  onOpenThread: (conversationId: string) => void;
};


/** Le rang d'une ligne dans l'ordre d'urgence ; une ligne sans échéance passe
 *  toujours en fin de rang plutôt que de fausser la comparaison. */
function rangEcheance(a: { date_echeance: string | null }, b: { date_echeance: string | null }) {
  const aJours = joursAvant(a.date_echeance);
  const bJours = joursAvant(b.date_echeance);
  if (aJours === null && bJours === null) return 0;
  if (aJours === null) return 1;
  if (bJours === null) return -1;
  return aJours - bJours;
}

/**
 * Les clients abonnés, tels que la table les enregistre : l'offre, le montant,
 * l'échéance et le canal de paiement. Les compteurs du haut sont lus sur les
 * mêmes lignes que le tableau : ils ne peuvent pas raconter autre chose.
 *
 * Deux portes s'ajoutent au tableau : le jeton des échéances proches, qui
 * réduit la liste aux abonnements à moins de trente jours, et un clic sur une
 * ligne, qui ouvre la fiche du compte — ses dépôts et ses demandes B2B.
 *
 * Chaque ligne porte aussi ce que le compte a réellement déposé : les publiés
 * et les refusés, lus sur les dépôts de la console. Un second jeton isole les
 * comptes qui n'ont encore rien de publié — ceux à qui il reste tout à montrer.
 *
 * Quatre en-têtes se trient d'un clic : l'échéance, le nombre de relectures
 * longues, le nombre de fils en sommeil et le nombre de dépôts arrivés après
 * la relance — le compte le plus chargé passe alors en tête. La seconde table,
 * celle des comptes du site, reçoit les mêmes compteurs et suit ces trois
 * derniers tris, pour que les deux listes se lisent de la même façon. Elle
 * porte en plus son propre tri : la date de promotion, la plus ancienne en
 * tête, les comptes dont la date manque suivant et les comptes ordinaires
 * fermant la marche — le classeur suit ce choix.
 *
 * Le compteur « comptes après relance » se clique : il garde des deux listes
 * les seuls comptes dont un dépôt est arrivé après le message préparé. Et le
 * récapitulatif des priorités se copie depuis la ligne, sans ouvrir la fiche.
 *
 * Le compteur « comptes silencieux » fait de même pour les conversations qui
 * dorment, et la pastille de sommeil d'une ligne ouvre directement le fil dans
 * la messagerie de la console. Le classeur emporte la même colonne.
 */
export default function AdminClients({
  data,
  onOpenCompte,
  onOpenLateAnnonces,
  onOpenThread,
}: Props) {
  const { t, lang } = useLang();
  const [query, setQuery] = useState('');
  const [statut, setStatut] = useState('all');
  const [nearOnly, setNearOnly] = useState(false);
  const [sansPublieOnly, setSansPublieOnly] = useState(false);
  const [lateOnly, setLateOnly] = useState(false);
  /* Le même jeton, posé sur la seconde table : les comptes se filtrent
     désormais sans passer par les abonnements. */
  const [lateComptesOnly, setLateComptesOnly] = useState(false);
  /* Le jeton des administrateurs : il ne garde que les comptes qui peuvent
     ouvrir la console, lus sur la même règle que leur pastille. */
  const [adminsOnly, setAdminsOnly] = useState(false);
  /* Le jeton des promotions anciennes : il ne garde que les comptes promus
     administrateurs depuis plus de six mois, ceux dont le rôle se relit. */
  const [adminsARelireOnly, setAdminsARelireOnly] = useState(false);
  /* Le jeton des promotions sans date : il ne garde que les comptes
     administrateurs dont la promotion n'a pas été datée, ceux dont la date
     reste à compléter. */
  const [adminsSansDateOnly, setAdminsSansDateOnly] = useState(false);
  /* Le tri de la table des comptes par date de promotion : la plus ancienne
     en tête, puis la plus récente. Il est propre à cette table — le tri des
     abonnements ne bouge pas quand on le pose. */
  const [promo, setPromo] = useState<'none' | AdminTriPromo>('none');
  /* Le compteur « comptes silencieux » se clique : il réduit les deux tables
     aux seuls comptes dont une conversation dort, pour une revue rapide. */
  const [silencieuxOnly, setSilencieuxOnly] = useState(false);
  /* Les comptes déjà touchés par une relance : le jeton sépare ceux du jour
     même de ceux de la semaine, pour distinguer un message qui vient de
     partir d'un rappel plus ancien. */
  const [recent, setRecent] = useState<RelanceTranche>('none');
  /* Le compteur des comptes après relance se clique : il devient un jeton qui
     réduit les deux listes à ces seuls comptes. */
  const [apresOnly, setApresOnly] = useState(false);
  const [tri, setTri] = useState<AdminTri>('none');
  /* La seconde table suit le tri des abonnements tant qu'on ne l'en détache
     pas : un clic sur son jeton la ramène à l'ordre de la table, sans
     toucher au tri des abonnements. */
  const [suivreTri, setSuivreTri] = useState(true);
  /* La relance préparée depuis une ligne : le même message que la fiche,
     sans avoir à l'ouvrir. */
  const [relance, setRelance] = useState<{ to: string; subject: string; body: string } | null>(null);
  /* Le rythme des conversations, lu une fois pour tout le tableau : une ligne
     dit si le compte a des fils qui dorment, sans qu'on ouvre sa fiche. */
  const [paces, setPaces] = useState<Record<string, number>>({});
  const [pacesReady, setPacesReady] = useState(false);

  const rows = data.abonnements;

  /* Une seule lecture des messages pour tous les fils de la console : le
     tableau signale les comptes qui dorment avec le seuil de la messagerie. */
  const filsKey = data.conversations.map((row) => row.id).join(',');

  useEffect(() => {
    if (!filsKey) {
      setPaces({});
      setPacesReady(true);
      return undefined;
    }
    let alive = true;
    setPacesReady(false);
    const load = async () => {
      try {
        const { data: answer, error: failure } = await supabase.functions.invoke('admin-console', {
          body: { action: 'paces', conversationIds: filsKey.split(',') },
        });
        const payload = answer as { ok?: boolean; paces?: Record<string, number> } | null;
        if (failure || !payload?.ok) return;
        if (alive) setPaces(payload.paces ?? {});
      } catch {
        /* La mesure n'est qu'un repère : le tableau reste lisible sans elle. */
      } finally {
        if (alive) setPacesReady(true);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [filsKey]);

  /* Les fils dormants, rattachés au compte par son identifiant et, à défaut,
     par son adresse : un fil se compte une fois pour chacun de ses deux
     participants, jamais deux fois pour le même compte. Chaque liste est
     rangée du plus lent au plus vif, comme le récapitulatif copié le fera. */
  const dormantsParCle = useMemo(() => {
    const parId = new Map<string, AdminConversation[]>();
    const parMail = new Map<string, AdminConversation[]>();
    if (!pacesReady) return { parId, parMail };
    const mailDe = new Map<string, string>();
    data.comptes.forEach((row) => {
      const mail = (row.email || '').trim().toLowerCase();
      if (row.id && mail) mailDe.set(row.id, mail);
    });
    const ajouter = (map: Map<string, AdminConversation[]>, cle: string, fil: AdminConversation) => {
      const liste = map.get(cle);
      if (liste) liste.push(fil);
      else map.set(cle, [fil]);
    };
    data.conversations.forEach((row) => {
      if (!enSommeil(paces[row.id])) return;
      const touches = new Set<string>();
      if (row.user_a) touches.add(row.user_a);
      if (row.user_b) touches.add(row.user_b);
      touches.forEach((id) => {
        ajouter(parId, id, row);
        const mail = mailDe.get(id);
        if (mail) ajouter(parMail, mail, row);
      });
    });
    [parId, parMail].forEach((map) => {
      map.forEach((liste) => {
        liste.sort((a, b) => (paces[b.id] ?? 0) - (paces[a.id] ?? 0));
      });
    });
    return { parId, parMail };
  }, [data.comptes, data.conversations, paces, pacesReady]);

  /* Les fils d'un compte, quelle que soit la table qui l'interroge :
     l'identifiant d'abord, l'adresse ensuite, rien du tout sinon. */
  const filsDormantsDe = useCallback(
    (compteId: string | null | undefined, email: string | null | undefined) => {
      const parId = compteId ? dormantsParCle.parId.get(compteId) : undefined;
      if (parId) return parId;
      const cle = (email || '').trim().toLowerCase();
      return (cle ? dormantsParCle.parMail.get(cle) : undefined) ?? [];
    },
    [dormantsParCle],
  );

  /* Le récapitulatif d'une ligne, bâti au clic sur les mêmes mesures que la
     fiche : fils dormants du compte, puis relectures longues de ses dépôts. */
  const recapDe = (
    titre: string,
    compteId: string | null | undefined,
    email: string | null | undefined,
  ) => () => {
    const cle = (email || '').trim().toLowerCase();
    return recapPriorites({
      titre,
      fils: filsDormantsDe(compteId, email),
      pace: paces,
      annonces: cle
        ? data.annonces.filter((row) => (row.email || '').trim().toLowerCase() === cle)
        : [],
      t,
    });
  };

  /* Les comptes dont au moins une conversation dort, sur les deux tables :
     l'ensemble sert au compteur du haut, au jeton qui réduit les listes et à
     la ligne de synthèse du classeur. Un compte ne se compte qu'une fois,
     même s'il porte plusieurs abonnements. */
  const silencieux = useMemo(() => {
    const mails = new Set<string>();
    const ids = new Set<string>();
    const vus = new Set<string>();
    const noter = (compteId: string | null | undefined, email: string | null | undefined) => {
      if (filsDormantsDe(compteId, email).length === 0) return;
      const mail = (email || '').trim().toLowerCase();
      const id = compteId || '';
      if (mail) mails.add(mail);
      if (id) ids.add(id);
      const cle = mail || (id ? `id:${id}` : '');
      if (cle) vus.add(cle);
    };
    data.abonnements.forEach((row) => noter(row.artisan_id, row.email));
    data.comptes.forEach((row) => noter(row.id, row.email));
    return { mails, ids, total: vus.size };
  }, [data.abonnements, data.comptes, filsDormantsDe]);

  /* Un compte est silencieux quand l'une de ses conversations dort : la
     lecture passe par son identifiant puis, à défaut, par son adresse. */
  const estSilencieux = useCallback(
    (compteId: string | null | undefined, email: string | null | undefined) => {
      const mail = (email || '').trim().toLowerCase();
      if (mail && silencieux.mails.has(mail)) return true;
      return Boolean(compteId && silencieux.ids.has(compteId));
    },
    [silencieux],
  );

  /* Le nombre de fils dormants par adresse de compte : la colonne du classeur
     lit la même mesure que la pastille de la ligne. */
  const dormantsParMail = useMemo(() => {
    const map = new Map<string, number>();
    data.abonnements.forEach((row) => {
      const cle = (row.email || '').trim().toLowerCase();
      if (cle) map.set(cle, filsDormantsDe(row.artisan_id, row.email).length);
    });
    data.comptes.forEach((row) => {
      const cle = (row.email || '').trim().toLowerCase();
      if (cle && !map.has(cle)) map.set(cle, filsDormantsDe(row.id, row.email).length);
    });
    return map;
  }, [data.abonnements, data.comptes, filsDormantsDe]);

  /* Les fils dormants relus pendant la visite, par adresse de compte : la
     colonne du classeur lit la même mémoire de session que le repère
     « relu » de la messagerie, et s'efface avec la visite. */
  const revusParMail = useMemo(() => {
    const revus = new Set(readRevus());
    const map = new Map<string, number>();
    const compter = (
      compteId: string | null | undefined,
      email: string | null | undefined,
    ) => {
      const cle = (email || '').trim().toLowerCase();
      if (!cle) return;
      const relus = filsDormantsDe(compteId, email).filter((fil) => revus.has(fil.id)).length;
      if (relus > (map.get(cle) ?? 0)) map.set(cle, relus);
    };
    data.abonnements.forEach((row) => compter(row.artisan_id, row.email));
    data.comptes.forEach((row) => compter(row.id, row.email));
    return map;
  }, [data.abonnements, data.comptes, filsDormantsDe]);

  /* Les dépôts comptés par adresse de compte : le tableau lit les mêmes
     lignes que l'onglet « Annonces », il ne peut pas les contredire. */
  const depots = useMemo(() => depotsParEmail(data.annonces), [data.annonces]);
  const depotsDe = (email: string | null) => {
    const cle = (email || '').trim().toLowerCase();
    return cle ? depots.get(cle) : undefined;
  };
  const sansPublie = rows.filter((row) => (depotsDe(row.email)?.publies ?? 0) === 0).length;

  /* Les comptes qui ont encore un dépôt en relecture depuis plus de sept
     jours : ce sont ceux à qui une réponse est due, pas seulement un rappel
     d'abonnement. */
  const avecRelectureLongue = rows.filter((row) => (depotsDe(row.email)?.longues ?? 0) > 0).length;

  /* Les deux tranches de relance, lues sur la même date : le jour même d'un
     côté, les sept derniers jours de l'autre — aujourd'hui y compris, sans
     double comptage possible. */
  const relancesAujourdhui = rows.filter((row) => relanceTranche(row.email) === 'today').length;
  const relancesSemaine = rows.filter((row) => relanceTranche(row.email) !== 'none').length;

  /* Les comptes dont un dépôt est arrivé après la relance préparée : un compte
     n'est retenu qu'une fois, même s'il a déposé plusieurs fois depuis son
     message. Les adresses viennent des deux tables, pour ne pas perdre un
     compte sans abonnement en cours. L'ensemble sert au compteur, au jeton qui
     réduit les listes, au tri de la seconde table et à la fiche. */
  const apresParCle = useMemo(
    () =>
      apresRelanceParEmail(data.annonces, [
        ...data.comptes.map((row) => row.email),
        ...rows.map((row) => row.email),
      ]),
    [data.annonces, data.comptes, rows],
  );

  /* Le compte qui ouvre la marche du tri « après relance » : celui qui a
     déposé le plus depuis son message, départagé par son nom comme le
     tableau le fait. Le classeur le nomme à côté du tri actif, comme le
     bouton de la messagerie. */
  const teteApres = useMemo(() => {
    const candidats: { nom: string; n: number }[] = [];
    const voir = (nom: string | null, email: string | null) => {
      const cle = (email || '').trim().toLowerCase();
      const n = cle ? apresParCle.get(cle) ?? 0 : 0;
      if (n > 0) candidats.push({ nom: nom || cle, n });
    };
    rows.forEach((row) => voir(row.entreprise, row.email));
    data.comptes.forEach((row) => voir(row.organisme || row.nom, row.email));
    if (candidats.length === 0) return '';
    candidats.sort((a, b) => b.n - a.n || a.nom.localeCompare(b.nom));
    return candidats[0].nom;
  }, [rows, data.comptes, apresParCle]);

  /* Le compte qui ouvrait la marche du tri « revue » au moment de
     l'export : celui du premier fil dormant restant à relire, lu sur la même
     mesure que la messagerie et le même repère de session. Le classeur le
     nomme à côté du tri actif, comme la messagerie le fait sur son en-tête. */
  const teteRevue = useMemo(() => {
    if (!pacesReady) return '';
    const relus = new Set(readRevus());
    const premier = data.conversations.find(
      (row) => enSommeil(paces[row.id]) && !relus.has(row.id),
    );
    if (!premier) return '';
    const nomParId = new Map<string, string>();
    const nomParMail = new Map<string, string>();
    data.comptes.forEach((row) => {
      const nom = row.organisme || row.nom || '';
      if (row.id && nom) nomParId.set(row.id, nom);
      const mail = (row.email || '').trim().toLowerCase();
      if (mail && nom) nomParMail.set(mail, nom);
    });
    rows.forEach((row) => {
      const nom = row.entreprise || '';
      const mail = (row.email || '').trim().toLowerCase();
      if (row.artisan_id && nom && !nomParId.has(row.artisan_id)) {
        nomParId.set(row.artisan_id, nom);
      }
      if (mail && nom && !nomParMail.has(mail)) nomParMail.set(mail, nom);
    });
    const noms = [premier.user_a, premier.user_b]
      .filter((id): id is string => Boolean(id))
      .map((id) => nomParId.get(id) || '')
      .filter(Boolean);
    return noms[0] || '';
  }, [data.conversations, data.comptes, rows, paces, pacesReady]);

  /* Le compte qui ouvre la marche du tri « relevé le plus récent » : celui du
     fil dont l'aire a été relevée le plus récemment depuis cet appareil — la
     même mémoire que la messagerie. Le classeur le nomme à côté du tri actif,
     pour que deux exports du même jour ne se lisent pas de la même façon. */
  const teteRecent = useMemo(() => {
    const releves = readAireRelevesJours();
    if (Object.keys(releves).length === 0) return '';
    const paysParId = new Map<string, string>();
    const nomParId = new Map<string, string>();
    data.comptes.forEach((row) => {
      const nom = row.organisme || row.nom || '';
      if (row.id && row.pays) paysParId.set(row.id, row.pays);
      if (row.id && nom) nomParId.set(row.id, nom);
    });
    rows.forEach((row) => {
      const nom = row.entreprise || '';
      if (row.artisan_id && nom && !nomParId.has(row.artisan_id)) {
        nomParId.set(row.artisan_id, nom);
      }
    });
    let tete = '';
    let meilleur = 0;
    data.conversations.forEach((row) => {
      const ids = [row.user_a, row.user_b].filter((id): id is string => Boolean(id));
      let stamp = 0;
      ids.forEach((id) => {
        const region = regionMondeDe(paysParId.get(id) || '');
        if (!region) return;
        const jour = releves[region.key] ?? 0;
        if (jour > stamp) stamp = jour;
      });
      if (stamp <= meilleur) return;
      meilleur = stamp;
      const noms = ids.map((id) => nomParId.get(id) || '').filter(Boolean);
      tete = noms[0] || row.sujet || '';
    });
    return tete;
  }, [data.conversations, data.comptes, rows]);

  /* Le compte qui ouvre la marche du tri « relevé le plus ancien d'abord » :
     celui du fil dont l'aire attend son relevé depuis le plus longtemps — la
     même mémoire d'appareil que la messagerie. Le classeur le nomme à côté du
     tri actif, pour que deux exports du même jour ne se lisent pas de la même
     façon. */
  const teteAncien = useMemo(() => {
    const releves = readAireRelevesJours();
    if (Object.keys(releves).length === 0) return '';
    const paysParId = new Map<string, string>();
    const nomParId = new Map<string, string>();
    data.comptes.forEach((row) => {
      const nom = row.organisme || row.nom || '';
      if (row.id && row.pays) paysParId.set(row.id, row.pays);
      if (row.id && nom) nomParId.set(row.id, nom);
    });
    rows.forEach((row) => {
      const nom = row.entreprise || '';
      if (row.artisan_id && nom && !nomParId.has(row.artisan_id)) {
        nomParId.set(row.artisan_id, nom);
      }
    });
    let tete = '';
    let meilleur = Number.POSITIVE_INFINITY;
    data.conversations.forEach((row) => {
      const ids = [row.user_a, row.user_b].filter((id): id is string => Boolean(id));
      let stamp = 0;
      ids.forEach((id) => {
        const region = regionMondeDe(paysParId.get(id) || '');
        if (!region) return;
        const jourReleve = releves[region.key] ?? 0;
        if (jourReleve > 0 && (stamp === 0 || jourReleve < stamp)) stamp = jourReleve;
      });
      if (stamp === 0 || stamp >= meilleur) return;
      meilleur = stamp;
      const noms = ids.map((id) => nomParId.get(id) || '').filter(Boolean);
      tete = noms[0] || row.sujet || '';
    });
    return tete;
  }, [data.conversations, data.comptes, rows]);

  /* L'aire qui ouvre la marche du tri « gomme la plus récente d'abord » :
     celle que la petite gomme vient de rendre vierge le plus récemment,
     parmi celles que la boîte porte encore — la même mémoire d'appareil que
     la messagerie. Le classeur la nomme à côté du tri actif et dans le nom du
     fichier, pour que deux exports du même jour ne se lisent pas pareil. */
  const teteGomme = useMemo(() => {
    const jours = readGommesAiresJours();
    if (Object.keys(jours).length === 0) return '';
    const paysParCompte = new Map<string, string>();
    data.comptes.forEach((row) => {
      if (row.id && row.pays) paysParCompte.set(row.id, row.pays);
    });
    let tete = '';
    let meilleur = 0;
    data.conversations.forEach((row) => {
      const ids = [row.user_a, row.user_b].filter((id): id is string => Boolean(id));
      ids.forEach((id) => {
        const region = regionMondeDe(paysParCompte.get(id) || '');
        if (!region) return;
        const stamp = jours[region.key] ?? 0;
        if (stamp > meilleur) {
          meilleur = stamp;
          tete = t(`worldRegion.${region.key}`);
        }
      });
    });
    return tete;
  }, [data.conversations, data.comptes, t]);

  /* L'aire qui ouvre la marche du tri « gomme la plus ancienne d'abord » :
     celle que la petite gomme a rendue vierge il y a le plus longtemps, parmi
     celles que la boîte porte encore — la même mémoire d'appareil que la
     messagerie. Le classeur la nomme à côté du tri actif et dans le nom du
     fichier, comme les sept autres ordres. */
  const teteGommeAncienne = useMemo(() => {
    const jours = readGommesAiresJours();
    if (Object.keys(jours).length === 0) return '';
    const paysParCompte = new Map<string, string>();
    data.comptes.forEach((row) => {
      if (row.id && row.pays) paysParCompte.set(row.id, row.pays);
    });
    let tete = '';
    let meilleur = Number.POSITIVE_INFINITY;
    data.conversations.forEach((row) => {
      const ids = [row.user_a, row.user_b].filter((id): id is string => Boolean(id));
      ids.forEach((id) => {
        const region = regionMondeDe(paysParCompte.get(id) || '');
        if (!region) return;
        const stamp = jours[region.key] ?? 0;
        if (stamp > 0 && stamp < meilleur) {
          meilleur = stamp;
          tete = t(`worldRegion.${region.key}`);
        }
      });
    });
    return tete;
  }, [data.conversations, data.comptes, t]);

  /* Les aires encore dans la boîte qu'aucun relevé n'a emportées, au moment de
     l'export : la synthèse du classeur reprend le compte de la pastille de la
     messagerie, lu sur la même mémoire d'appareil. L'ordre est celui des
     aires du monde, pour que la ligne se lise comme la console. Les deux
     lignes du classeur mènent à la messagerie resserrée sur ces aires :
     l'adresse porte leurs clés, lues ici une seule fois. */
  const airesJamais = useMemo(() => {
    const releves = readAireRelevesJours();
    const tous = readAireRelevesTousCopies();
    const paysParId = new Map<string, string>();
    data.comptes.forEach((row) => {
      if (row.id && row.pays) paysParId.set(row.id, row.pays);
    });
    const dansLaBoite = new Set<string>();
    data.conversations.forEach((row) => {
      [row.user_a, row.user_b].forEach((id) => {
        if (!id) return;
        const region = regionMondeDe(paysParId.get(id) || '');
        if (region) dansLaBoite.add(region.key);
      });
    });
    const restantes = REGIONS_MONDE
      .map((region) => region.key)
      .filter((key) => dansLaBoite.has(key) && !releves[key] && !tous.aires.includes(key));
    const baseConsole = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
    return {
      n: restantes.length,
      keys: restantes,
      list: restantes.map((key) => t(`worldRegion.${key}`)).join(' · '),
      /* Une porte par aire : chaque nom de la synthèse ouvre la messagerie
         resserrée sur cette seule aire, au lieu d'une seule porte qui les
         emmène toutes. */
      rows: restantes.map((key) => ({
        label: t(`worldRegion.${key}`),
        url: `${baseConsole}/admin?section=messages&aires=${key}`,
      })),
      /* La première des aires ouvre la marche du tri « aire jamais relevée
         d'abord » : elle se nomme dans la synthèse et dans le nom du
         fichier, comme les quatre autres ordres. */
      tete: restantes.length > 0 ? t(`worldRegion.${restantes[0]}`) : '',
      url: restantes.length > 0
        ? `${baseConsole}/admin?section=messages&aires=${restantes.join(',')}`
        : '',
    };
  }, [data.conversations, data.comptes, t]);

  /* Les comptes du site qui attendent encore une réponse : le compte du jeton
     dans la seconde table, lu sur les mêmes dépôts. */
  const comptesLate = data.comptes.filter((row) => (depotsDe(row.email)?.longues ?? 0) > 0);
  /* Les comptes qui peuvent ouvrir la console : le chiffre posé en tête de la
     table et le jeton qui la resserre lisent cette même liste, et la pastille
     de chaque ligne suit la même règle — ils ne peuvent pas se contredire. */
  const comptesAdmin = data.comptes.filter((row) => estAdminCompte(row.email, row.role));

  /* La fiche du compte par adresse : la table des abonnements ne porte pas le
     rôle, elle le lit ici pour signaler une promotion ancienne sur sa ligne. */
  const compteParMail = useMemo(() => {
    const map = new Map<string, AdminCompte>();
    data.comptes.forEach((row) => {
      const cle = (row.email || '').trim().toLowerCase();
      if (cle && !map.has(cle)) map.set(cle, row);
    });
    return map;
  }, [data.comptes]);

  /* Une promotion remonte à plus de six mois : le rôle est signalé « à
     relire », avec l'ancienneté en mois et la date exacte. Un compte sans date
     de promotion ne se signale pas — rien ne permet de dater son geste. */
  const promoARevoir = useCallback(
    (row: AdminCompte | undefined | null) => {
      const ancienne = promotionARelire(row);
      if (!ancienne) return null;
      return { mois: ancienne.mois, date: jour(row.role_changed_at, lang) };
    },
    [lang],
  );

  const promoARevoirDe = useCallback(
    (email: string | null | undefined) => {
      const cle = (email || '').trim().toLowerCase();
      return promoARevoir(cle ? compteParMail.get(cle) : undefined);
    },
    [compteParMail, promoARevoir],
  );

  /* Les comptes administrateurs dont la promotion demande une relecture : le
     jeton de la table des comptes lit cette liste, comme les pastilles de
     ligne — le chiffre ne peut pas contredire ce qu'on voit. */
  const comptesARelire = data.comptes.filter((row) => promoARevoir(row));
  /* Les comptes administrateurs promus avant que la console ne note les
     dates : leur promotion reste à dater. Le jeton et son compte lisent cette
     même liste, ils ne peuvent pas annoncer deux chiffres. */
  const comptesSansDate = data.comptes.filter(
    (row) => estAdminCompte(row.email, row.role) && !row.role_changed_at,
  );
  const comptesVus = data.comptes.filter((row) => {
    const cle = (row.email || '').trim().toLowerCase();
    if (adminsOnly && !estAdminCompte(row.email, row.role)) return false;
    if (adminsARelireOnly && !promoARevoir(row)) return false;
    if (adminsSansDateOnly && !(estAdminCompte(row.email, row.role) && !row.role_changed_at)) {
      return false;
    }
    if (lateComptesOnly && (depotsDe(row.email)?.longues ?? 0) === 0) return false;
    if (apresOnly && !apresParCle.has(cle)) return false;
    /* Le filtre ne retire rien tant que la mesure des rythmes n'est pas
       revenue : une liste vide ferait croire à un silence qui n'existe pas
       encore. */
    if (silencieuxOnly && pacesReady && !estSilencieux(row.id, row.email)) return false;
    return true;
  });

  /* La seconde table se lit dans le même ordre que la première : triée par
     relectures longues ou par dépôts arrivés après la relance, elle suit le
     choix fait à l'écran, deux comptes également chargés se départageant par
     leur nom. Le tri par échéance ne la concerne pas — un compte du site n'a
     pas d'abonnement daté. */
  const comptesTries = (() => {
    const list = [...comptesVus];
    const nomDe = (row: AdminCompte) => row.organisme || row.nom || '';
    /* Le tri par promotion est propre à cette table : il passe avant le tri
       partagé, et ne touche pas à l'ordre des abonnements. */
    if (promo !== 'none') return triParPromotion(list, promo);
    /* Détachée du tri, la seconde table reprend l'ordre de la table : elle
       se lit comme à l'ouverture, le tri des abonnements restant où il est. */
    if (!suivreTri) return list;
    if (tri === 'late' || tri === 'lateDesc') {
      const nbLongues = (row: AdminCompte) => depotsDe(row.email)?.longues ?? 0;
      return list.sort((a, b) => {
        const ecart = nbLongues(a) - nbLongues(b);
        if (ecart !== 0) return tri === 'late' ? -ecart : ecart;
        return nomDe(a).localeCompare(nomDe(b));
      });
    }
    if (tri === 'apres' || tri === 'apresDesc') {
      const nbApres = (row: AdminCompte) =>
        apresParCle.get((row.email || '').trim().toLowerCase()) ?? 0;
      return list.sort((a, b) => {
        const ecart = nbApres(a) - nbApres(b);
        if (ecart !== 0) return tri === 'apres' ? -ecart : ecart;
        return nomDe(a).localeCompare(nomDe(b));
      });
    }
    /* Le tri par fils en sommeil traverse les deux tables : le compte le plus
       silencieux passe en tête dans celle-ci comme dans les abonnements. */
    if (tri === 'sleep' || tri === 'sleepDesc') {
      const nbDormants = (row: AdminCompte) => filsDormantsDe(row.id, row.email).length;
      return list.sort((a, b) => {
        const ecart = nbDormants(a) - nbDormants(b);
        if (ecart !== 0) return tri === 'sleep' ? -ecart : ecart;
        return nomDe(a).localeCompare(nomDe(b));
      });
    }
    return list;
  })();

  /* Le nom de l'ordre suivi, quand il s'applique à la seconde table : le
     jeton le rappelle, pour que deux listes qui se suivent ne surprennent pas. */
  const ordreComptes =
    !suivreTri
      ? ''
      : tri === 'late'
        ? t('ad.clients.comptesOrderLate')
        : tri === 'lateDesc'
          ? t('ad.clients.comptesOrderLateDesc')
          : tri === 'apres'
            ? t('ad.clients.comptesOrderApres')
            : tri === 'apresDesc'
              ? t('ad.clients.comptesOrderApresDesc')
              : tri === 'sleep'
                ? t('ad.clients.comptesOrderSleep')
                : tri === 'sleepDesc'
                  ? t('ad.clients.comptesOrderSleepDesc')
                  : '';

  /* Le tri des abonnements qui s'applique aussi aux comptes : quand il est
     actif, la seconde table peut le suivre ou s'en tenir à l'ordre de la
     table, et le jeton dit lequel des deux. */
  const triPartage =
    tri === 'late' ||
    tri === 'lateDesc' ||
    tri === 'apres' ||
    tri === 'apresDesc' ||
    tri === 'sleep' ||
    tri === 'sleepDesc';

  /* Les états réellement présents, avec leur poids : une pastille n'annonce
     jamais un état que la table n'a pas écrit. */
  const statuts = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((row) => {
      const key = (row.statut || '—').trim().toLowerCase();
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const actifs = rows.filter((row) => !estFerme((row.statut || '').toLowerCase())).length;
  const essais = rows.filter((row) => estEssai((row.statut || '').toLowerCase())).length;
  const proches = rows.filter((row) => echeanceProche(row.date_echeance)).length;
  const mrr = rows.reduce((total, row) => {
    if (estFerme((row.statut || '').toLowerCase())) return total;
    const value = Number(row.montant_mensuel ?? 0);
    return Number.isFinite(value) ? total + value : total;
  }, 0);

  /* Le filtre des échéances proches et celui de la recherche d'abord ; le tri
     par échéance s'applique ensuite, sur les seules lignes retenues. */
  const base = rows.filter((row) => {
    if (statut !== 'all' && (row.statut || '—').trim().toLowerCase() !== statut) return false;
    if (nearOnly && !echeanceProche(row.date_echeance)) return false;
    if (sansPublieOnly && (depotsDe(row.email)?.publies ?? 0) > 0) return false;
    if (lateOnly && (depotsDe(row.email)?.longues ?? 0) === 0) return false;
    if (apresOnly && !apresParCle.has((row.email || '').trim().toLowerCase())) return false;
    if (silencieuxOnly && pacesReady && !estSilencieux(row.artisan_id, row.email)) return false;
    if (recent === 'today' && relanceTranche(row.email) !== 'today') return false;
    if (recent === 'week' && relanceTranche(row.email) === 'none') return false;
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [row.entreprise, row.email, row.ville, row.offre, row.metier]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(needle);
  });

  /* Trois lectures possibles : l'ordre de la table, l'échéance la plus urgente
     en tête (le jeton des échéances proches l'applique de lui-même), ou son
     inverse. Un clic sur l'en-tête « Échéance » passe de l'une à l'autre. */
  const filtres = useMemo(() => {
    const list = [...base];
    if (tri === 'none') {
      return nearOnly ? list.sort(rangEcheance) : list;
    }
    /* Le tri par relectures longues : le compte le plus chargé en tête, puis
       l'entreprise pour départager deux comptes à égalité. */
    if (tri === 'late' || tri === 'lateDesc') {
      const longues = (row: { email: string | null }) => {
        const cle = (row.email || '').trim().toLowerCase();
        return cle ? depots.get(cle)?.longues ?? 0 : 0;
      };
      return list.sort((a, b) => {
        const ecart = longues(a) - longues(b);
        if (ecart !== 0) return tri === 'late' ? -ecart : ecart;
        return (a.entreprise || '').localeCompare(b.entreprise || '');
      });
    }
    /* Le tri par dépôts arrivés après la relance : le compte que le message
       n'a pas couvert le plus souvent passe en tête, puis l'entreprise. */
    if (tri === 'apres' || tri === 'apresDesc') {
      const nbApres = (row: { email: string | null }) => {
        const cle = (row.email || '').trim().toLowerCase();
        return cle ? apresParCle.get(cle) ?? 0 : 0;
      };
      return list.sort((a, b) => {
        const ecart = nbApres(a) - nbApres(b);
        if (ecart !== 0) return tri === 'apres' ? -ecart : ecart;
        return (a.entreprise || '').localeCompare(b.entreprise || '');
      });
    }
    /* Le tri par fils en sommeil : le compte dont les conversations dorment le
       plus longtemps en tête, puis l'entreprise pour départager deux comptes à
       égalité. Un compte sans fil dormant ferme la marche sans se faire passer
       pour un compte silencieux. */
    if (tri === 'sleep' || tri === 'sleepDesc') {
      const nbDormants = (row: { artisan_id: string | null; email: string | null }) =>
        filsDormantsDe(row.artisan_id, row.email).length;
      return list.sort((a, b) => {
        const ecart = nbDormants(a) - nbDormants(b);
        if (ecart !== 0) return tri === 'sleep' ? -ecart : ecart;
        return (a.entreprise || '').localeCompare(b.entreprise || '');
      });
    }
    return list.sort((a, b) => {
      const aJours = joursAvant(a.date_echeance);
      const bJours = joursAvant(b.date_echeance);
      if (aJours === null && bJours === null) return 0;
      if (aJours === null) return 1;
      if (bJours === null) return -1;
      return tri === 'due' ? aJours - bJours : bJours - aJours;
    });
  }, [base, tri, nearOnly, depots, apresParCle, filsDormantsDe]);

  const tournerTri = () =>
    setTri((current) => (current === 'due' ? 'dueDesc' : current === 'dueDesc' ? 'none' : 'due'));

  const tournerTriLate = () =>
    setTri((current) =>
      current === 'late' ? 'lateDesc' : current === 'lateDesc' ? 'none' : 'late',
    );

  /* Le même geste pour les dépôts arrivés après la relance : plein d'abord,
     vide ensuite, puis retour à l'ordre de la table. */
  const tournerTriApres = () =>
    setTri((current) =>
      current === 'apres' ? 'apresDesc' : current === 'apresDesc' ? 'none' : 'apres',
    );

  /* Et pour les fils en sommeil : le compte le plus silencieux d'abord, puis
     l'inverse, puis l'ordre de la table — trois états, un seul en-tête. */
  const tournerTriSleep = () =>
    setTri((current) =>
      current === 'sleep' ? 'sleepDesc' : current === 'sleepDesc' ? 'none' : 'sleep',
    );

  /* Le tri de la table des comptes : la plus ancienne promotion d'abord, puis
     la plus récente, puis l'ordre de la table — trois états, un seul en-tête. */
  const tournerTriPromo = () =>
    setPromo((current) =>
      current === 'none' ? 'old' : current === 'old' ? 'recent' : 'none',
    );

  /* Le geste de la ligne : le message reprend tous les abonnements et tous les
     dépôts du compte, exactement comme la fiche les lirait. L'instant est
     retenu par compte, pour ne pas relancer deux fois de suite. */
  const preparerRelance = (email: string | null, nom: string | null) => {
    const mail = (email || '').trim();
    if (!mail) return;
    const cle = mail.toLowerCase();
    const contexte = {
      nom,
      email: mail,
      abonnements: rows.filter((row) => (row.email || '').trim().toLowerCase() === cle),
      annonces: data.annonces.filter((row) => (row.email || '').trim().toLowerCase() === cle),
      lang,
      t,
    };
    saveRelanceAt(mail);
    setRelance({
      to: mail,
      subject: sujetRelance(contexte),
      body: corpsRelance(contexte),
    });
  };

  /* La touche d'échappement referme la relance ouverte depuis une ligne : le
     tableau reste tel qu'on l'a laissé. */
  useEffect(() => {
    if (!relance) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setRelance(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [relance]);

  const reset = () => {
    setQuery('');
    setStatut('all');
    setNearOnly(false);
    setSansPublieOnly(false);
    setLateOnly(false);
    setLateComptesOnly(false);
    setAdminsOnly(false);
    setAdminsARelireOnly(false);
    setAdminsSansDateOnly(false);
    setPromo('none');
    setApresOnly(false);
    setSilencieuxOnly(false);
    setRecent('none');
    setTri('none');
    setSuivreTri(true);
  };

  /* Le journal de la revue : les fils dormants ouverts pendant cette visite,
     dans l'ordre où ils l'ont été — la mémoire de session ne garde qu'un
     repère par fil — avec le délai de réponse qui les a fait lire. */
  const revueJournal = useMemo(() => {
    if (!pacesReady) return [] as RevueJournalRow[];
    /* Le nom de chaque compte, par identifiant puis par adresse : la colonne
       « Compte » du journal dit à qui appartient le fil relu, sans ouvrir sa
       fiche. Un compte sans abonnement en cours garde son nom par la seconde
       table. */
    const nomParId = new Map<string, string>();
    const nomParMail = new Map<string, string>();
    /* L'adresse de chaque compte, par identifiant : la colonne « E-mail » du
       journal la reprend telle quelle, pour se copier sans ouvrir la fiche. */
    const mailParId = new Map<string, string>();
    data.comptes.forEach((row) => {
      const nom = row.organisme || row.nom || '';
      if (row.id && nom) nomParId.set(row.id, nom);
      const mail = (row.email || '').trim();
      if (row.id && mail) mailParId.set(row.id, mail);
      if (mail && nom) nomParMail.set(mail.toLowerCase(), nom);
    });
    rows.forEach((row) => {
      const nom = row.entreprise || '';
      const mail = (row.email || '').trim();
      if (row.artisan_id && nom && !nomParId.has(row.artisan_id)) {
        nomParId.set(row.artisan_id, nom);
      }
      if (row.artisan_id && mail && !mailParId.has(row.artisan_id)) {
        mailParId.set(row.artisan_id, mail);
      }
      if (mail && nom && !nomParMail.has(mail.toLowerCase())) {
        nomParMail.set(mail.toLowerCase(), nom);
      }
    });
    const compteDuFil = (row: AdminConversation) => {
      const noms: string[] = [];
      [row.user_a, row.user_b].forEach((id) => {
        if (!id) return;
        const nom = nomParId.get(id) || '';
        if (nom && !noms.includes(nom)) noms.push(nom);
      });
      return noms.join(' · ');
    };
    /* L'adresse du compte du fil, sur la même lecture que son nom : un fil
       relu se copie depuis le classeur, sans ouvrir de fiche. */
    const mailDuFil = (row: AdminConversation) => {
      const mails: string[] = [];
      [row.user_a, row.user_b].forEach((id) => {
        if (!id) return;
        const mail = mailParId.get(id) || '';
        if (mail && !mails.includes(mail)) mails.push(mail);
      });
      return mails.join(' · ');
    };
    const out: RevueJournalRow[] = [];
    readRevus().forEach((id) => {
      const row = data.conversations.find((entry) => entry.id === id);
      if (!row || !enSommeil(paces[row.id])) return;
      out.push({
        nom: [row.nom_a, row.nom_b].filter(Boolean).join(' ↔ ') || row.sujet || '—',
        /* Le compte à côté du fil : deux fils du même participant se
           retrouvent d'un coup d'œil. */
        compte: compteDuFil(row),
        mail: mailDuFil(row),
        /* L'heure d'ouverture du fil pendant la visite : la mémoire de session
           porte le premier instant retenu, la colonne du journal le reprend
           tel quel pour dater la revue à la minute. */
        ouvertAt: readOuverture(row.id),
        gap: paces[row.id] ?? 0,
        lastAt: row.last_at ?? null,
      });
    });
    return out;
  }, [data.conversations, data.comptes, rows, paces, pacesReady]);

  /* Le compte des jetons posés sur la liste, calculé une seule fois : la
     mémoire de l'appareil le retient pour les classeurs par compte, ouverts
     ailleurs depuis la fiche ou l'onglet « Annonces », qui s'en datent aussi. */
  const jetonsListe = compterJetons({
    statut,
    nearOnly,
    lateOnly,
    apresOnly,
    sansPublie: sansPublieOnly,
    sleepOnly: silencieuxOnly,
    recent,
  });

  useEffect(() => {
    saveChips(jetonsListe);
  }, [jetonsListe]);

  const exporter = async () => {
    /* Le journal des renvois d'accusés part avec le classeur, dans son propre
       onglet : il est lu au moment du clic, et une lecture manquée laisse le
       classeur partir sans cet onglet plutôt que de ne pas partir du tout. */
    let renvois: RenvoiAccuse[] = [];
    /* La file du renvoi part avec le même appel : les accusés qui ne sont pas
       encore partis prennent leur propre onglet, à côté du journal. */
    let attente: AccuseEnAttente[] = [];
    try {
      const { data: answer } = await supabase.functions.invoke('accuses-candidature', {
        body: { action: 'etat' },
      });
      const payload = answer as
        | { ok?: boolean; history?: RenvoiAccuse[]; pending?: AccuseEnAttente[] }
        | null;
      if (payload?.ok && payload.history) renvois = payload.history;
      if (payload?.ok && payload.pending) attente = payload.pending;
    } catch {
      renvois = [];
      attente = [];
    }
    /* Les aires resserrées dans la messagerie, lues au moment du clic sur la
       même mémoire d'appareil que la pastille de la boîte : la synthèse dit le
       jour du dernier relevé de chacune, ou qu'elle n'a jamais été relevée. */
    const airesTight = (() => {
      const keys = readAiresTight();
      if (keys.length === 0) return undefined;
      const releves = readAireRelevesJours();
      const baseConsole = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
      /* Le pays de chaque compte, lu une seule fois : les fils d'une aire se
         comptent comme la boîte les compte — sur le pays d'un participant. */
      const paysParCompte = new Map<string, string>();
      data.comptes.forEach((row) => {
        if (row.id && row.pays) paysParCompte.set(row.id, row.pays);
      });
      const aireDuFil = (row: AdminConversation) => {
        const ids = [row.user_a, row.user_b].filter((id): id is string => Boolean(id));
        for (let i = 0; i < ids.length; i += 1) {
          const region = regionMondeDe(paysParCompte.get(ids[i]) || '');
          if (region) return region.key;
        }
        return '';
      };
      /* Un fil ne se compte qu'une fois, même si deux aires resserrées le
         nomment : le compte posé sous la ligne des aires dit le poids réel
         du resserrement, pas la somme des lignes. */
      const emportes = new Set<string>();
      data.conversations.forEach((row) => {
        const key = aireDuFil(row);
        if (key && keys.includes(key)) emportes.add(row.id);
      });
      const filsDe = (key: string) =>
        data.conversations.filter((row) => aireDuFil(row) === key).length;
      /* La plus ancienne date de relevé parmi ces aires : le nom du fichier
         la porte, pour que deux exports du même jour, faits avant et après
         un relevé, ne se confondent plus dans un dossier de téléchargement. */
      const dates = keys
        .map((key) => releves[key] ?? 0)
        .filter((stamp) => stamp > 0);
      return {
        n: keys.length,
        oldest: dates.length > 0 ? Math.min(...dates) : null,
        /* La porte de tout le resserrement : la ligne de la plus ancienne
           date de relevé ouvre la boîte sur les mêmes aires, sans avoir à
           retrouver leur liste. */
        url: `${baseConsole}/admin?section=messages&aires=${keys.join(',')}`,
        /* Les fils que ces aires laissent ensemble dans la boîte : la
           synthèse en pose le compte juste sous celui des aires, et chaque
           nom d'aire dit le sien au survol. */
        fils: emportes.size,
        /* Chaque aire se nomme sur sa propre ligne, avec le jour de son
           dernier relevé, ses fils laissés dans la boîte et une porte vers
           la messagerie resserrée sur elle seule. */
        rows: keys.map((key) => {
          const stamp = releves[key] ?? 0;
          return {
            region: t(`worldRegion.${key}`),
            fils: filsDe(key),
            /* La date du dernier relevé, en millisecondes : la ligne de la
               plus ancienne date du classeur porte une porte par aire, sa
               date s'ouvrant sur la boîte resserrée sur elle seule. */
            date: stamp > 0 ? stamp : null,
            /* L'ancienneté du relevé, en jours entiers : le survol de la
               synthèse dit « relevée il y a 12 jours » sans ouvrir la
               messagerie. Une aire jamais relevée garde null. */
            jours: stamp
              ? Math.max(0, Math.floor((Date.now() - stamp) / 86400000))
              : null,
            detail: stamp
              ? t('ad.xls.airesTightJourRow')
                .replace('{region}', t(`worldRegion.${key}`))
                .replace('{date}', jour(new Date(stamp).toISOString(), lang))
              : t('ad.xls.airesTightJamaisRow').replace(
                '{region}',
                t(`worldRegion.${key}`),
              ),
            url: `${baseConsole}/admin?section=messages&aires=${key}`,
          };
        }),
        list: keys
          .map((key) => {
            const stamp = releves[key] ?? 0;
            return stamp
              ? t('ad.xls.airesTightJourRow')
                .replace('{region}', t(`worldRegion.${key}`))
                .replace('{date}', jour(new Date(stamp).toISOString(), lang))
              : t('ad.xls.airesTightJamaisRow').replace(
                '{region}',
                t(`worldRegion.${key}`),
              );
          })
          .join(' · '),
      };
    })();
    /* Les aires dont le relevé porte la date du jour, lues sur la même mémoire
       d'appareil que la pastille de la boîte : la synthèse les compte et les
       nomme, et la ligne mène à la messagerie resserrée sur elles. */
    const airesJour = (() => {
      const releves = readAireRelevesJours();
      const debut = new Date();
      debut.setHours(0, 0, 0, 0);
      const seuil = debut.getTime();
      const paysParCompte = new Map<string, string>();
      data.comptes.forEach((row) => {
        if (row.id && row.pays) paysParCompte.set(row.id, row.pays);
      });
      const dansLaBoite = new Set<string>();
      /* Les fils que chaque aire a emportés, nommés un à un : la synthèse les
         donne au survol de sa ligne, comme la pastille de la messagerie. */
      const filsParAire = new Map<string, string[]>();
      data.conversations.forEach((row) => {
        /* L'aire du fil se lit sur le pays du premier participant connu,
           comme la messagerie range la ligne : un fil ne se compte qu'une
           fois, même si deux participants se tiennent dans deux aires. */
        const ids = [row.user_a, row.user_b].filter((id): id is string => Boolean(id));
        let region: RegionMonde | null = null;
        for (let i = 0; i < ids.length; i += 1) {
          region = regionMondeDe(paysParCompte.get(ids[i]) || '');
          if (region) break;
        }
        if (!region) return;
        dansLaBoite.add(region.key);
        const liste = filsParAire.get(region.key) ?? [];
        liste.push(
          [row.nom_a, row.nom_b].filter(Boolean).join(' ↔ ') ||
            row.sujet ||
            '—',
        );
        filsParAire.set(region.key, liste);
      });
      const keys = REGIONS_MONDE
        .map((region) => region.key)
        .filter((key) => dansLaBoite.has(key) && (releves[key] ?? 0) >= seuil);
      const baseConsole = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
      return {
        n: keys.length,
        list: keys.map((key) => t(`worldRegion.${key}`)).join(' · '),
        rows: keys.map((key) => {
          const fils = filsParAire.get(key) ?? [];
          return {
            label: t(`worldRegion.${key}`),
            url: `${baseConsole}/admin?section=messages&aires=${key}`,
            fils: fils.length,
            detail: fils.join(' · '),
          };
        }),
        url: keys.length > 0
          ? `${baseConsole}/admin?section=messages&aires=${keys.join(',')}`
          : '',
      };
    })();
    /* L'état de la revue, lu au moment du clic sur les fils eux-mêmes : la
       même mesure que la jauge de la messagerie, pour que le nom du fichier
       dise exactement où en était la visite. */
    const revue = (() => {
      if (!pacesReady) return { relus: 0, total: 0 };
      const relus = new Set(readRevus());
      const fils = data.conversations.filter((row) => enSommeil(paces[row.id]));
      return {
        relus: fils.filter((row) => relus.has(row.id)).length,
        total: fils.length,
      };
    })();
    /* Les aires rendues par la gomme, lues une seule fois pour la synthèse et
       le nom du fichier : celles que la boîte porte encore et celles qui l’ont
       quittée, sur la même mémoire d’appareil que la pastille. */
    const gommeBoite = (() => {
      const gestes = readGommesReleves();
      if (gestes.count === 0) return null;
      const jours = readGommesAiresJours();
      /* Le pays de chaque compte, lu une seule fois : une aire rendue compte
         encore si un fil de la boîte s’y tient, comme la boîte les range. */
      const paysParCompte = new Map<string, string>();
      data.comptes.forEach((row) => {
        if (row.id && row.pays) paysParCompte.set(row.id, row.pays);
      });
      const dansLaBoite = new Set<string>();
      data.conversations.forEach((row) => {
        const ids = [row.user_a, row.user_b].filter((id): id is string => Boolean(id));
        ids.forEach((id) => {
          const region = regionMondeDe(paysParCompte.get(id) || '');
          if (region) dansLaBoite.add(region.key);
        });
      });
      const aires = REGIONS_MONDE
        .map((region) => region.key)
        .filter((key) => (jours[key] ?? 0) > 0);
      const restantes = aires.filter((key) => dansLaBoite.has(key));
      const parties = aires.filter((key) => !dansLaBoite.has(key));
      /* Le jour du dernier départ retenu : l'aire partie dont le geste est le
         plus récent. Son mois passe dans le nom du fichier, pour que deux
         exports d'une même journée ne se confondent plus. */
      const dernierParti = parties.reduce<number | null>((best, key) => {
        const stamp = jours[key] ?? 0;
        if (!stamp) return best;
        return best === null || stamp > best ? stamp : best;
      }, null);
      return {
        gestes,
        jours,
        aires,
        restantes,
        parties,
        dernierParti,
      };
    })();
    downloadAbonnesWorkbook({
      rows: filtres,
      comptes: data.comptes,
      annonces: data.annonces,
      /* Le journal des renvois, lu au clic : il prend son onglet à côté des
         abonnés, avec ses gestes réussis comme ses échecs. */
      renvois,
      /* Et la file du renvoi, lue au même clic : les accusés qui ne sont pas
         encore partis prennent leur onglet, pour joindre la file au classeur. */
      attente,
      lang,
      t,
      statut,
      nearOnly,
      lateOnly,
      apresOnly,
      /* Le jeton des administrateurs, posé sur la seconde table : la synthèse
         et le nom du fichier le comptent comme les autres. */
      adminOnly: adminsOnly,
      /* Le jeton « sans dépôt publié » n'est pas une colonne : la synthèse le
         compte pourtant parmi les jetons posés, pour dater l'état du fichier. */
      sansPublie: sansPublieOnly,
      sleepOnly: silencieuxOnly,
      /* Le tri « revue » de la messagerie, retenu par l'appareil : la ligne
         « Filtre de la liste » du classeur dit l'ordre que la console
         affichait, pour que deux exports du même jour se distinguent. */
      revueTrie: readRevueFirst(),
      /* Et le compte du premier fil dormant restant à relire : la synthèse
         dit qui ouvrait la marche de la revue au moment de l'export. */
      revueTete: teteRevue,
      /* Le tri « après relance », retenu de la même façon : la synthèse dit
         aussi lequel des deux ordres la messagerie affichait. */
      apresTrie: readApresFirst(),
      /* Et le compte qui ouvrait la marche de ce tri, nommé à côté, pour que
         deux exports du même jour ne se lisent pas de la même façon sans
         qu'on sache pourquoi. */
      apresTete: teteApres,
      /* Le tri « relevé le plus récent », retenu de la même façon : la
         synthèse dit lequel des quatre ordres la messagerie affichait, et
         quel compte en ouvrait la marche. */
      recentTrie: readRecentFirst(),
      recentTete: teteRecent,
      /* Le tri « aire jamais relevée d'abord », retenu de la même façon : la
         synthèse dit aussi lequel des cinq ordres la messagerie affichait. */
      jamaisTrie: readJamaisFirst(),
      /* Et l'aire qui ouvrait la marche de ce cinquième ordre : la première
         des aires encore dans la boîte qu'aucun relevé n'a emportées. Elle se
         nomme à côté du tri actif et passe dans le nom du fichier, comme les
         quatre autres. */
      jamaisTete: airesJamais.tete,
      /* Le tri « relevé le plus ancien d'abord », retenu de la même façon : la
         ligne « Filtre de la liste » dit lequel des six ordres la messagerie
         affichait, et quel compte en ouvrait la marche. */
      ancienTrie: readAncienFirst(),
      ancienTete: teteAncien,
      /* Le tri « gomme la plus récente d'abord », retenu de la même façon : la
         ligne « Filtre de la liste » dit lequel des sept ordres la messagerie
         affichait, et quelle aire en ouvrait la marche. */
      gommeTrie: readGommeFirst(),
      gommeTete: teteGomme,
      /* Le tri « gomme la plus ancienne d'abord », retenu de la même façon :
         la ligne « Filtre de la liste » dit lequel des huit ordres la
         messagerie affichait, et quelle aire en ouvrait la marche. */
      gommeAncienneTrie: readGommeAncienneFirst(),
      gommeAncienneTete: teteGommeAncienne,
      /* Le poids du dernier geste de gomme — les aires rendues vierges et les
         fils qu'elles ont emportés —, lu sur la même mémoire d'appareil que
         la pastille : le nom du fichier le porte, « -gomme-2-aires-7-fils »,
         avec, juste après, les aires rendues qui se tiennent encore dans la
         boîte — « -1-restante » —, pour que deux exports du même jour se
         distinguent par ce qu'il reste à relire. */
      gommePoids: gommeBoite
        ? {
            aires: gommeBoite.aires.length,
            fils: gommeBoite.gestes.fils,
            restantes: gommeBoite.restantes.length,
            parties: gommeBoite.parties.length,
            dernierParti: gommeBoite.dernierParti,
          }
        : undefined,
      /* Le jour d'effacement de chaque aire partie : la synthèse en compte les
         départs par mois, le plus récent en tête, sur la même mémoire
         d'appareil que la ligne des aires parties de la messagerie. */
      gommeHorsMois: gommeBoite
        ? gommeBoite.parties.map((key) => ({ stamp: gommeBoite.jours[key] ?? 0 }))
        : undefined,
      /* Le sens de la ligne des aires parties, lu sur la même mémoire
         d'appareil que la messagerie : la synthèse le pose sur sa propre
         ligne, pour que deux exports du même jour, faits avant et après un
         retournement, ne se lisent pas pareil. */
      gommeHorsSens: readGommeHorsAncienne() ? 'ancien' : 'recent',
      /* Les aires rendues qui se tiennent encore dans la boîte, avec leur
         compte : la synthèse les pose sur leur propre ligne, juste avant
         celle de l’écart. */
      gommeRestantes: gommeBoite
        ? {
            n: gommeBoite.restantes.length,
            total: gommeBoite.aires.length,
            list: gommeBoite.restantes
              .map((key) => t(`worldRegion.${key}`))
              .join(' · '),
          }
        : undefined,
      /* L'écart de gomme — le premier effacement retenu et le dernier —, lu
         sur la même mémoire d'appareil que la pastille : la synthèse le pose
         sur sa propre ligne, pour que l'effacement se lise dans le temps. */
      gommeEcart: (() => {
        const gestes = readGommesReleves();
        if (gestes.count === 0) return undefined;
        return {
          premier: gestes.premier,
          dernier: gestes.last,
          jours:
            gestes.count > 1 && gestes.premier && gestes.last
              ? Math.max(
                  0,
                  Math.floor((gestes.last - gestes.premier) / 86400000),
                )
              : null,
        };
      })(),
      /* Les aires encore dans la boîte qu'aucun relevé n'a emportées au moment
         du clic : le chiffre et les noms se lisent sans ouvrir la messagerie. */
      airesJamais,
      /* Et celles dont le relevé porte la date du jour : la synthèse les
         compte, les nomme, et sa ligne mène à la boîte resserrée sur elles. */
      airesJour,
      /* Les aires sur lesquelles la boîte était resserrée, avec le jour de
         leur dernier relevé : deux exports du même jour, faits avant et après
         un relevé, ne portent plus la même ligne. */
      airesTight,
      filsDormants: dormantsParMail,
      revusDormants: revusParMail,
      revue,
      /* L'onglet « Journal de la revue » ouvre une ligne par fil relu pendant
         cette visite, avec son délai de réponse. */
      revueJournal,
      recent,
      ordre: tri,
      /* Le tri par promotion posé sur la table des comptes : l'onglet
         « Comptes » le suit et le nomme, pour que le fichier dise le même
         ordre que l'écran. */
      comptesPromo: promo === 'none' ? null : promo,
      /* Le classeur n'a pas les rythmes des conversations : quand la console se
         range par fils en sommeil, l'onglet « Comptes » garde l'ordre de la
         table et le dit, plutôt que de promettre un ordre qu'il ne tient pas.
         Le tri par promotion, lui, reste tenu par le classeur. */
      comptesDetache:
        promo === 'none' && (!suivreTri || tri === 'sleep' || tri === 'sleepDesc'),
    });
  };

  return (
    <>
      <div className="admin-stats">
        <div className="admin-stat">
          <b>{nombre(rows.length)}</b>
          <span>{t('ad.stat.abo')}</span>
        </div>
        <div className="admin-stat" data-tone="ok">
          <b>{nombre(actifs)}</b>
          <span>{t('ad.stat.actifs')}</span>
        </div>
        <div className="admin-stat" data-tone="soft">
          <b>{nombre(essais)}</b>
          <span>{t('ad.stat.essai')}</span>
        </div>
        <div className="admin-stat" data-tone="accent">
          <b>{nombre(Math.round(mrr))}</b>
          <span>{t('ad.stat.mrr')}</span>
        </div>
        <div className="admin-stat">
          <b>{nombre(data.comptes.length)}</b>
          <span>{t('ad.stat.comptes')}</span>
        </div>
        <button
          type="button"
          className="admin-stat admin-stat-btn"
          data-tone="warn"
          data-on={silencieuxOnly ? 'yes' : 'no'}
          aria-pressed={silencieuxOnly}
          title={t('ad.clients.sleepHint')}
          onClick={() => setSilencieuxOnly((value) => !value)}
        >
          <b>{nombre(silencieux.total)}</b>
          <span>
            {t('ad.stat.silencieux')}
            <i className="ri-moon-line" aria-hidden="true"></i>
          </span>
        </button>
        <button
          type="button"
          className="admin-stat admin-stat-btn"
          data-tone="accent"
          data-on={apresOnly ? 'yes' : 'no'}
          aria-pressed={apresOnly}
          title={t('ad.clients.apresHint')}
          onClick={() => setApresOnly((value) => !value)}
        >
          <b>{nombre(apresParCle.size)}</b>
          <span>
            {t('ad.stat.apresRelance')}
            <i className="ri-filter-3-line" aria-hidden="true"></i>
          </span>
        </button>
      </div>

      <section className="admin-card">
        <div className="admin-card-head">
          <div>
            <p className="admin-stamp">{t('ad.clients.stamp')}</p>
            <p className="admin-sub">{t('ad.clients.sub')}</p>
          </div>
          <div className="admin-tools">
            <label className="admin-search">
              <i className="ri-search-line" aria-hidden="true"></i>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('ad.clients.search')}
                className="text-sm"
              />
            </label>
            <select
              className="admin-select text-sm"
              value={statut}
              onChange={(event) => setStatut(event.target.value)}
              aria-label={t('ad.clients.statut')}
            >
              <option value="all">{t('ad.clients.allStatus')}</option>
              {statuts.map(([key, count]) => (
                <option key={key} value={key}>
                  {key} · {count}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="admin-btn"
              data-tone="accent"
              onClick={() => void exporter()}
            >
              <i className="ri-file-excel-2-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ad.clients.export')}</span>
            </button>
          </div>
        </div>

        <div className="admin-chips" role="group" aria-label={t('ad.clients.stamp')}>
          <button
            type="button"
            className="admin-chip"
            data-on={nearOnly ? 'yes' : 'no'}
            data-tone="warn"
            aria-pressed={nearOnly}
            onClick={() => setNearOnly((value) => !value)}
            title={t('ad.clients.echeanceHint')}
          >
            <i className="ri-calendar-event-line" aria-hidden="true"></i>
            {t('ad.clients.echeanceChip')}
            <b>{nombre(proches)}</b>
          </button>
          <button
            type="button"
            className="admin-chip"
            data-on={sansPublieOnly ? 'yes' : 'no'}
            aria-pressed={sansPublieOnly}
            onClick={() => setSansPublieOnly((value) => !value)}
            title={t('ad.clients.noPublieHint')}
          >
            <i className="ri-file-list-3-line" aria-hidden="true"></i>
            {t('ad.clients.noPublieChip')}
            <b>{nombre(sansPublie)}</b>
          </button>
          <button
            type="button"
            className="admin-chip"
            data-on={lateOnly ? 'yes' : 'no'}
            data-tone="warn"
            aria-pressed={lateOnly}
            onClick={() => setLateOnly((value) => !value)}
            title={t('ad.clients.lateHint')}
          >
            <i className="ri-timer-flash-line" aria-hidden="true"></i>
            {t('ad.clients.lateChip')}
            <b>{nombre(avecRelectureLongue)}</b>
          </button>
          <button
            type="button"
            className="admin-chip"
            data-on={recent === 'today' ? 'yes' : 'no'}
            aria-pressed={recent === 'today'}
            onClick={() => setRecent((value) => (value === 'today' ? 'none' : 'today'))}
            title={t('ad.clients.recentTodayHint')}
          >
            <i className="ri-mail-check-line" aria-hidden="true"></i>
            {t('ad.clients.recentTodayChip')}
            <b>{nombre(relancesAujourdhui)}</b>
          </button>
          <button
            type="button"
            className="admin-chip"
            data-on={recent === 'week' ? 'yes' : 'no'}
            aria-pressed={recent === 'week'}
            onClick={() => setRecent((value) => (value === 'week' ? 'none' : 'week'))}
            title={t('ad.clients.recentWeekHint')}
          >
            <i className="ri-history-line" aria-hidden="true"></i>
            {t('ad.clients.recentWeekChip')}
            <b>{nombre(relancesSemaine)}</b>
          </button>
          {(nearOnly ||
            sansPublieOnly ||
            lateOnly ||
            apresOnly ||
            silencieuxOnly ||
            recent !== 'none' ||
            statut !== 'all' ||
            query.trim() !== '' ||
            tri !== 'none') && (
            <button type="button" className="admin-chip" onClick={reset}>
              <i className="ri-close-circle-line" aria-hidden="true"></i>
              {t('ad.clients.reset')}
            </button>
          )}
        </div>

        {rows.length === 0 ? (
          <p className="admin-empty">
            <i className="ri-inbox-line" aria-hidden="true"></i>
            {t('ad.clients.empty')}
          </p>
        ) : filtres.length === 0 ? (
          <p className="admin-empty">
            <i className="ri-filter-off-line" aria-hidden="true"></i>
            {sansPublieOnly
              ? t('ad.clients.noPublieEmpty')
              : apresOnly
                ? t('ad.clients.apresEmpty')
                : lateOnly
                  ? t('ad.clients.lateEmpty')
                  : silencieuxOnly
                    ? t('ad.clients.sleepEmpty')
                  : recent !== 'none'
                    ? t(
                        recent === 'today'
                          ? 'ad.clients.recentTodayEmpty'
                          : 'ad.clients.recentWeekEmpty',
                      )
                    : nearOnly
                      ? t('ad.clients.echeanceEmpty')
                      : t('ad.clients.none')}
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-table-cards admin-clients-table">
              <thead>
                <tr>
                  <th scope="col">{t('ad.clients.entreprise')}</th>
                  <th scope="col">{t('ad.clients.offre')}</th>
                  <th scope="col">{t('ad.clients.statut')}</th>
                  <th scope="col">{t('ad.clients.montant')}</th>
                  <th
                    scope="col"
                    aria-sort={
                      tri === 'due' ? 'ascending' : tri === 'dueDesc' ? 'descending' : 'none'
                    }
                  >
                    <button
                      type="button"
                      className="admin-sort"
                      data-on={tri === 'due' || tri === 'dueDesc' ? 'yes' : 'no'}
                      onClick={tournerTri}
                      title={t('ad.clients.sortDueHint')}
                    >
                      {t('ad.clients.echeance')}
                      <i
                        className={
                          tri === 'due'
                            ? 'ri-sort-asc'
                            : tri === 'dueDesc'
                              ? 'ri-sort-desc'
                              : 'ri-arrow-up-down-line'
                        }
                        aria-hidden="true"
                      ></i>
                    </button>
                  </th>
                  <th
                    scope="col"
                    aria-sort={
                      tri === 'late' ? 'descending' : tri === 'lateDesc' ? 'ascending' : 'none'
                    }
                  >
                    <button
                      type="button"
                      className="admin-sort"
                      data-on={tri === 'late' || tri === 'lateDesc' ? 'yes' : 'no'}
                      onClick={tournerTriLate}
                      title={t('ad.clients.sortLateHint')}
                    >
                      {t('ad.clients.depots')}
                      <i
                        className={
                          tri === 'late'
                            ? 'ri-sort-desc'
                            : tri === 'lateDesc'
                              ? 'ri-sort-asc'
                              : 'ri-arrow-up-down-line'
                        }
                        aria-hidden="true"
                      ></i>
                    </button>
                  </th>
                  <th
                    scope="col"
                    aria-sort={
                      tri === 'sleep' ? 'descending' : tri === 'sleepDesc' ? 'ascending' : 'none'
                    }
                  >
                    <button
                      type="button"
                      className="admin-sort"
                      data-on={tri === 'sleep' || tri === 'sleepDesc' ? 'yes' : 'no'}
                      onClick={tournerTriSleep}
                      title={t('ad.clients.sortSleepHint')}
                    >
                      {t('ad.clients.sleepCol')}
                      <i
                        className={
                          tri === 'sleep'
                            ? 'ri-sort-desc'
                            : tri === 'sleepDesc'
                              ? 'ri-sort-asc'
                              : 'ri-arrow-up-down-line'
                        }
                        aria-hidden="true"
                      ></i>
                    </button>
                  </th>
                  <th
                    scope="col"
                    aria-sort={
                      tri === 'apres' ? 'descending' : tri === 'apresDesc' ? 'ascending' : 'none'
                    }
                  >
                    <button
                      type="button"
                      className="admin-sort"
                      data-on={tri === 'apres' || tri === 'apresDesc' ? 'yes' : 'no'}
                      onClick={tournerTriApres}
                      title={t('ad.clients.sortApresHint')}
                    >
                      {t('ad.clients.apresCol')}
                      <i
                        className={
                          tri === 'apres'
                            ? 'ri-sort-desc'
                            : tri === 'apresDesc'
                              ? 'ri-sort-asc'
                              : 'ri-arrow-up-down-line'
                        }
                        aria-hidden="true"
                      ></i>
                    </button>
                  </th>
                  <th scope="col">{t('ad.clients.canal')}</th>
                  <th scope="col">{t('ad.clients.depuis')}</th>
                  <th scope="col">{t('ad.clients.fiche')}</th>
                </tr>
              </thead>
              <tbody>
                {filtres.map((row) => {
                  const etat = (row.statut || '—').toLowerCase();
                  const jours = joursAvant(row.date_echeance);
                  const proche = jours !== null && jours < 30;
                  const depot = depotsDe(row.email);
                  const rienDepose =
                    !depot || (depot.publies === 0 && depot.refuses === 0 && depot.attente === 0);
                  const longues = depot?.longues ?? 0;
                  /* Les fils qui dorment pour ce compte : une seule lecture,
                     partagée par la colonne, le tri et le récapitulatif. */
                  const dormants = filsDormantsDe(row.artisan_id, row.email);
                  /* Les dépôts arrivés après le message préparé : le chiffre
                     que l'en-tête trie, lu sur la même mémoire d'appareil que
                     le compteur du haut. */
                  const apresIci = apresParCle.get((row.email || '').trim().toLowerCase()) ?? 0;
                  /* La dernière relance préparée pour ce compte, si elle date
                     de moins de trois jours : le bouton s'allume pour
                     signaler deux messages trop rapprochés. */
                  const relanceAt = readRelanceAt(row.email);
                  const relanceProche =
                    (joursDepuisRelance(relanceAt) ?? 99) <= JOURS_RELANCE_PROCHE;
                  /* Le rôle promu depuis plus de six mois se signale sous le
                     nom, comme la pastille d'administration — la ligne se
                     relit sans ouvrir la fiche. */
                  const promoRelire = promoARevoirDe(row.email);
                  return (
                    <tr
                      key={String(row.id)}
                      className="admin-row-click"
                      data-soon={proche ? 'yes' : 'no'}
                      data-late={longues > 0 ? 'yes' : 'no'}
                      onClick={() => onOpenCompte(row.artisan_id, row.email)}
                    >
                      <td>
                        <b className="admin-strong">{row.entreprise || '—'}</b>
                        {row.email && <span className="admin-mail">{row.email}</span>}
                        {estAdminCompte(row.email) && (
                          <span
                            className="admin-badge admin-admin-mark"
                            data-tone="accent"
                            title={t('ad.clients.adminMarkHint')}
                          >
                            <i className="ri-shield-user-line" aria-hidden="true"></i>
                            {t('ad.clients.adminMark')}
                          </span>
                        )}
                        {promoRelire && (
                          <button
                            type="button"
                            className="admin-badge admin-admin-mark admin-badge-btn"
                            data-tone="warn"
                            title={`${t('ad.clients.adminStaleHint')
                              .replace('{n}', String(promoRelire.mois))
                              .replace('{date}', promoRelire.date)} · ${t(
                              'ad.clients.adminStaleOpen',
                            )}`}
                            aria-label={`${t('ad.clients.adminStaleOpen')} · ${
                              row.entreprise || row.email || '—'
                            }`}
                            onClick={(event) => {
                              event.stopPropagation();
                              onOpenCompte(row.artisan_id, row.email, 'role');
                            }}
                          >
                            <i className="ri-time-line" aria-hidden="true"></i>
                            {t('ad.clients.adminStaleMark')}
                          </button>
                        )}
                        {(row.metier || row.ville) && (
                          <span className="admin-muted">
                            {[row.metier, nomCommune(row.ville, lang)].filter(Boolean).join(' · ')}
                          </span>
                        )}
                      </td>
                      <td data-label={t('ad.clients.offre')}>{row.offre || '—'}</td>
                      <td data-label={t('ad.clients.statut')}>
                        <span
                          className="admin-badge"
                          data-tone={estFerme(etat) ? 'off' : estEssai(etat) ? 'soft' : 'ok'}
                        >
                          {row.statut || '—'}
                        </span>
                      </td>
                      <td
                        className="admin-num"
                        data-label={t('ad.clients.montant')}
                        data-card-label={t('ad.clients.cardMontant')}
                      >
                        {nombre(row.montant_mensuel)}
                      </td>
                      <td className="admin-num" data-label={t('ad.clients.echeance')}>
                        {jour(row.date_echeance, lang)}
                        {proche && (
                          <span className="admin-due" data-late={jours !== null && jours < 0 ? 'yes' : 'no'}>
                            {echeanceEnMots(row.date_echeance, t)}
                          </span>
                        )}
                      </td>
                      <td data-label={t('ad.clients.depots')}>
                        {rienDepose ? (
                          <span className="admin-muted">{t('ad.clients.depotNone')}</span>
                        ) : (
                          <span className="admin-depots">
                            <span
                              className="admin-badge"
                              data-tone="ok"
                              title={t('ad.f.publies')}
                            >
                              <i className="ri-check-double-line" aria-hidden="true"></i>
                              {nombre(depot.publies)}
                            </span>
                            <span
                              className="admin-badge"
                              data-tone="off"
                              title={t('ad.f.refuses')}
                            >
                              <i className="ri-close-line" aria-hidden="true"></i>
                              {nombre(depot.refuses)}
                            </span>
                            {longues > 0 && (
                              <button
                                type="button"
                                className="admin-badge admin-badge-btn"
                                data-tone="warn"
                                title={t('ad.clients.lateOpenHint')}
                                aria-label={`${t('ad.clients.lateOpenHint')} · ${
                                  row.entreprise || row.email || ''
                                }`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  if (row.email) onOpenLateAnnonces(row.email, row.artisan_id);
                                }}
                              >
                                <i className="ri-timer-flash-line" aria-hidden="true"></i>
                                {nombre(longues)}
                              </button>
                            )}
                          </span>
                        )}
                      </td>
                      <td
                        data-label={t('ad.clients.sleepCol')}
                        data-card-label={t('ad.clients.cardSleep')}
                      >
                        {dormants.length > 0 ? (
                          <button
                            type="button"
                            className="admin-badge admin-badge-btn admin-row-sleep"
                            data-tone="warn"
                            title={t('ad.clients.sleepOpenHint')}
                            aria-label={`${t('ad.clients.sleepOpenHint')} · ${
                              row.entreprise || row.email || ''
                            }`}
                            onClick={(event) => {
                              event.stopPropagation();
                              onOpenThread(dormants[0].id);
                            }}
                          >
                            <i className="ri-moon-line" aria-hidden="true"></i>
                            {nombre(dormants.length)} {t('ad.clients.sleepRow')}
                          </button>
                        ) : (
                          <span className="admin-muted">—</span>
                        )}
                      </td>
                      <td data-label={t('ad.clients.apresCol')}>
                        {apresIci > 0 ? (
                          <span
                            className="admin-badge"
                            data-tone="accent"
                            title={t('ad.stat.apresRelanceHint')}
                          >
                            <i className="ri-mail-unread-line" aria-hidden="true"></i>
                            {nombre(apresIci)}
                          </span>
                        ) : (
                          <span className="admin-muted">—</span>
                        )}
                      </td>
                      <td data-label={t('ad.clients.canal')}>{row.canal_paiement || '—'}</td>
                      <td className="admin-num" data-label={t('ad.clients.depuis')}>
                        {jour(row.date_debut ?? row.created_at, lang)}
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          {(dormants.length > 0 || longues > 0) && (
                            <span
                              className="admin-row-copy"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <CopyTextButton
                                build={recapDe(
                                  row.entreprise || row.email || '—',
                                  row.artisan_id,
                                  row.email,
                                )}
                                label=""
                                hint={t('ad.clients.recapHint')}
                                className="admin-row-copy-btn"
                              />
                            </span>
                          )}
                          <button
                            type="button"
                            className="admin-row-mail"
                            data-recent={relanceProche ? 'yes' : 'no'}
                            title={
                              relanceAt
                                ? `${t('ad.clients.relance')} · ${t('ad.f.lastRelance')} ${jour(
                                    relanceAt,
                                    lang,
                                  )}`
                                : `${t('ad.clients.relance')} · ${t('ad.clients.relanceHint')}`
                            }
                            aria-label={`${t('ad.clients.relance')} · ${row.entreprise || row.email || ''}`}
                            disabled={!row.email}
                            onClick={(event) => {
                              event.stopPropagation();
                              preparerRelance(row.email, row.entreprise);
                            }}
                          >
                            <i className="ri-mail-send-line" aria-hidden="true"></i>
                          </button>
                          <button
                            type="button"
                            className="admin-row-open"
                            aria-label={`${t('ad.clients.open')} · ${row.entreprise || '—'}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              onOpenCompte(row.artisan_id, row.email);
                            }}
                          >
                            <i className="ri-arrow-right-up-line" aria-hidden="true"></i>
                            <span className="whitespace-nowrap">{t('ad.clients.open')}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-card">
        <div className="admin-card-head">
          <div>
            <p className="admin-stamp">{t('ad.clients.comptes')}</p>
            <p className="admin-sub">{t('ad.clients.comptesSub')}</p>
          </div>
          {/* Les deux compteurs en tête de la table : le nombre
              d’administrateurs et celui des promotions jamais datées. Tous
              deux se cliquent comme le jeton voisin et resserrent la table
              sur leurs seuls comptes, un second clic la rendant entière.
              Ils lisent la même liste que la colonne de promotion et que le
              jeton de la rangée — trois lectures, un seul chiffre. */}
          <div className="admin-counts">
            <button
              type="button"
              className="admin-count admin-count-btn"
              data-tone="accent"
              data-on={adminsOnly ? 'yes' : 'no'}
              aria-pressed={adminsOnly}
              title={t('ad.clients.comptesAdminCountHint')}
              onClick={() => setAdminsOnly((value) => !value)}
            >
              <i className="ri-shield-user-line" aria-hidden="true"></i>
              {t('ad.clients.comptesAdminCount').replace(
                '{n}',
                nombre(comptesAdmin.length),
              )}
            </button>
            <button
              type="button"
              className="admin-count admin-count-btn"
              data-tone="warn"
              data-on={adminsSansDateOnly ? 'yes' : 'no'}
              aria-pressed={adminsSansDateOnly}
              title={t('ad.clients.adminNoDateHint')}
              onClick={() => setAdminsSansDateOnly((value) => !value)}
            >
              <i className="ri-calendar-close-line" aria-hidden="true"></i>
              {t('ad.clients.adminNoDateChip')}
              <b>{nombre(comptesSansDate.length)}</b>
            </button>
          </div>
        </div>
        {data.comptes.length > 0 && (
          <div className="admin-chips" role="group" aria-label={t('ad.clients.comptes')}>
            <button
              type="button"
              className="admin-chip"
              data-on={adminsOnly ? 'yes' : 'no'}
              data-tone="accent"
              aria-pressed={adminsOnly}
              onClick={() => setAdminsOnly((value) => !value)}
              title={t('ad.clients.comptesAdminHint')}
            >
              <i className="ri-shield-user-line" aria-hidden="true"></i>
              {t('ad.clients.comptesAdminChip')}
              <b>{nombre(comptesAdmin.length)}</b>
            </button>
            <button
              type="button"
              className="admin-chip"
              data-on={adminsARelireOnly ? 'yes' : 'no'}
              data-tone="warn"
              aria-pressed={adminsARelireOnly}
              onClick={() => setAdminsARelireOnly((value) => !value)}
              title={t('ad.clients.adminStaleHintChip')}
            >
              <i className="ri-time-line" aria-hidden="true"></i>
              {t('ad.clients.adminStaleChip')}
              <b>{nombre(comptesARelire.length)}</b>
            </button>
            <button
              type="button"
              className="admin-chip"
              data-on={adminsSansDateOnly ? 'yes' : 'no'}
              data-tone="warn"
              aria-pressed={adminsSansDateOnly}
              onClick={() => setAdminsSansDateOnly((value) => !value)}
              title={t('ad.clients.adminNoDateHint')}
            >
              <i className="ri-calendar-close-line" aria-hidden="true"></i>
              {t('ad.clients.adminNoDateChip')}
              <b>{nombre(comptesSansDate.length)}</b>
            </button>
            <button
              type="button"
              className="admin-chip"
              data-on={lateComptesOnly ? 'yes' : 'no'}
              data-tone="warn"
              aria-pressed={lateComptesOnly}
              onClick={() => setLateComptesOnly((value) => !value)}
              title={t('ad.clients.lateHint')}
            >
              <i className="ri-timer-flash-line" aria-hidden="true"></i>
              {t('ad.clients.lateChip')}
              <b>{nombre(comptesLate.length)}</b>
            </button>
            {promo !== 'none' && (
              <button
                type="button"
                className="admin-chip"
                data-on="yes"
                data-tone="accent"
                title={t('ad.clients.sortPromoHint')}
                onClick={() => setPromo('none')}
              >
                <i
                  className={promo === 'old' ? 'ri-sort-asc' : 'ri-sort-desc'}
                  aria-hidden="true"
                ></i>
                <span className="whitespace-nowrap">
                  {t(
                    promo === 'old'
                      ? 'ad.clients.promoOrderOld'
                      : 'ad.clients.promoOrderRecent',
                  )}
                </span>
                <i className="ri-close-line" aria-hidden="true"></i>
              </button>
            )}
            {ordreComptes && promo === 'none' && (
              <button
                type="button"
                className="admin-chip"
                data-on="yes"
                data-tone="accent"
                title={t('ad.clients.comptesOrderDetachHint')}
                onClick={() => setSuivreTri(false)}
              >
                <i
                  className={
                    tri === 'late' || tri === 'apres' || tri === 'sleep'
                      ? 'ri-sort-desc'
                      : 'ri-sort-asc'
                  }
                  aria-hidden="true"
                ></i>
                <span className="whitespace-nowrap">{ordreComptes}</span>
                <i className="ri-close-line" aria-hidden="true"></i>
              </button>
            )}
            {!suivreTri && triPartage && (
              <button
                type="button"
                className="admin-chip"
                title={t('ad.clients.comptesOrderAttachHint')}
                onClick={() => setSuivreTri(true)}
              >
                <i className="ri-sort-alphabet-asc" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('ad.clients.comptesOrderTable')}</span>
                <i className="ri-arrow-right-line" aria-hidden="true"></i>
              </button>
            )}
            {apresOnly && (
              <button
                type="button"
                className="admin-chip"
                data-on="yes"
                data-tone="accent"
                aria-pressed="true"
                title={t('ad.clients.apresHint')}
                onClick={() => setApresOnly(false)}
              >
                <i className="ri-filter-3-line" aria-hidden="true"></i>
                {t('ad.stat.apresRelance')}
                <b>{nombre(apresParCle.size)}</b>
              </button>
            )}
            {silencieuxOnly && (
              <button
                type="button"
                className="admin-chip"
                data-on="yes"
                data-tone="warn"
                aria-pressed="true"
                title={t('ad.clients.sleepHint')}
                onClick={() => setSilencieuxOnly(false)}
              >
                <i className="ri-moon-line" aria-hidden="true"></i>
                {t('ad.clients.sleepChip')}
                <b>{nombre(silencieux.total)}</b>
                <i className="ri-close-line" aria-hidden="true"></i>
              </button>
            )}
            {(lateComptesOnly || adminsARelireOnly || adminsSansDateOnly || promo !== 'none') && (
              <button
                type="button"
                className="admin-chip"
                onClick={() => {
                  setLateComptesOnly(false);
                  setAdminsARelireOnly(false);
                  setAdminsSansDateOnly(false);
                  setPromo('none');
                }}
              >
                <i className="ri-close-circle-line" aria-hidden="true"></i>
                {t('ad.clients.reset')}
              </button>
            )}
          </div>
        )}
        {data.comptes.length === 0 ? (
          <p className="admin-empty">
            <i className="ri-user-line" aria-hidden="true"></i>
            {t('ad.clients.comptesEmpty')}
          </p>
        ) : comptesVus.length === 0 ? (
          <p className="admin-empty">
            <i className="ri-filter-off-line" aria-hidden="true"></i>
            {adminsOnly
              ? t('ad.clients.comptesAdminEmpty')
              : adminsARelireOnly
                ? t('ad.clients.adminStaleEmpty')
              : adminsSansDateOnly
                ? t('ad.clients.adminNoDateEmpty')
              : apresOnly
                ? t('ad.clients.apresEmpty')
                : silencieuxOnly
                  ? t('ad.clients.sleepEmpty')
                  : t('ad.clients.comptesLateEmpty')}
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-table-cards admin-comptes-table">
              <thead>
                <tr>
                  <th scope="col">{t('ad.clients.entreprise')}</th>
                  <th scope="col">{t('ad.clients.offre')}</th>
                  <th
                    scope="col"
                    aria-sort={
                      promo === 'old' ? 'ascending' : promo === 'recent' ? 'descending' : 'none'
                    }
                  >
                    <button
                      type="button"
                      className="admin-sort"
                      data-on={promo !== 'none' ? 'yes' : 'no'}
                      onClick={tournerTriPromo}
                      title={t('ad.clients.sortPromoHint')}
                    >
                      {t('ad.clients.promoCol')}
                      <i
                        className={
                          promo === 'old'
                            ? 'ri-sort-asc'
                            : promo === 'recent'
                              ? 'ri-sort-desc'
                              : 'ri-arrow-up-down-line'
                        }
                        aria-hidden="true"
                      ></i>
                    </button>
                  </th>
                  <th scope="col">{t('csv.etabs')}</th>
                  <th scope="col">{t('ad.clients.depots')}</th>
                  <th scope="col">{t('ad.clients.sleepCol')}</th>
                  <th scope="col">{t('pays.label')}</th>
                  <th scope="col">{t('ad.clients.depuis')}</th>
                  <th scope="col">{t('ad.clients.fiche')}</th>
                </tr>
              </thead>
              <tbody>
                {comptesTries.map((row) => {
                  const depot = depotsDe(row.email);
                  const rienDepose =
                    !depot || (depot.publies === 0 && depot.refuses === 0 && depot.attente === 0);
                  const longuesCompte = depot?.longues ?? 0;
                  /* Le même compteur que le tableau des abonnés, lu sur la
                     même mesure : les deux listes ne peuvent pas annoncer
                     deux nombres différents pour un même compte. */
                  const dormantsCompte = filsDormantsDe(row.id, row.email);
                  /* La mémoire de relance vaut aussi pour un compte sans
                     abonnement : l'adresse suffit à écrire et à dater. */
                  const relanceAt = readRelanceAt(row.email);
                  const relanceProche =
                    (joursDepuisRelance(relanceAt) ?? 99) <= JOURS_RELANCE_PROCHE;
                  /* La promotion ancienne se signale sur la ligne elle-même :
                     un rôle ouvert depuis plus de six mois se relit. */
                  const promoRelire = promoARevoir(row);
                  /* Le rôle est lu une fois : la pastille et la colonne de
                     promotion en dépendent, elles ne peuvent pas se
                     contredire. */
                  const estAdminLigne = estAdminCompte(row.email, row.role);
                  return (
                  <tr
                    key={row.id}
                    className="admin-row-click"
                    data-late={longuesCompte > 0 ? 'yes' : 'no'}
                    onClick={() => onOpenCompte(row.id, row.email)}
                  >
                    <td>
                      <b className="admin-strong">{row.organisme || row.nom || '—'}</b>
                      {row.email && <span className="admin-mail">{row.email}</span>}
                      {row.metier && <span className="admin-muted">{row.metier}</span>}
                      {estAdminLigne && (
                        <button
                          type="button"
                          className="admin-badge admin-admin-mark admin-badge-btn"
                          data-tone="accent"
                          title={`${t('ad.clients.adminMarkHint')} · ${t('ad.clients.adminMarkOpen')}`}
                          aria-label={`${t('ad.clients.adminMarkOpen')} · ${
                            row.organisme || row.nom || row.email || '—'
                          }`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenCompte(row.id, row.email, 'role');
                          }}
                        >
                          <i className="ri-shield-user-line" aria-hidden="true"></i>
                          {t('ad.clients.adminMark')}
                        </button>
                      )}
                      {promoRelire && (
                        <button
                          type="button"
                          className="admin-badge admin-admin-mark admin-badge-btn"
                          data-tone="warn"
                          title={`${t('ad.clients.adminStaleHint')
                            .replace('{n}', String(promoRelire.mois))
                            .replace('{date}', promoRelire.date)} · ${t(
                            'ad.clients.adminStaleOpen',
                          )}`}
                          aria-label={`${t('ad.clients.adminStaleOpen')} · ${
                            row.organisme || row.nom || row.email || '—'
                          }`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenCompte(row.id, row.email, 'role');
                          }}
                        >
                          <i className="ri-time-line" aria-hidden="true"></i>
                          {t('ad.clients.adminStaleMark')}
                        </button>
                      )}
                    </td>
                    <td data-label={t('ad.clients.offre')}>
                      <span className="admin-badge" data-tone="accent">
                        {row.formule || '—'}
                      </span>
                    </td>
                    <td className="admin-num" data-label={t('ad.clients.promoCol')}>
                      {/* La date de promotion, et la mention explicite quand
                          elle n'a jamais été notée : une case vide se lirait
                          comme une mesure manquante. Un compte ordinaire n'a
                          pas de promotion — la case reste alors vide. */}
                      {estAdminLigne ? (
                        row.role_changed_at ? (
                          jour(row.role_changed_at, lang)
                        ) : (
                          <span
                            className="admin-muted"
                            title={t('ad.clients.promoUnknownHint')}
                          >
                            {t('ad.clients.promoUnknown')}
                          </span>
                        )
                      ) : (
                        <span className="admin-muted">—</span>
                      )}
                    </td>
                    <td className="admin-num" data-label={t('csv.etabs')} data-card-label={t('ad.clients.cardEtabs')}>
                      {/* Un compte d'administration n'est pas un établissement :
                          la colonne le dit au lieu d'afficher un zéro qui se
                          lirait comme une mesure. */}
                      {estAdminCompte(row.email, row.role) ? (
                        <span className="admin-muted" title={t('ad.clients.adminNoEtabsHint')}>
                          —
                        </span>
                      ) : (
                        nombre(row.etablissements ?? 0)
                      )}
                    </td>
                    <td data-label={t('ad.clients.depots')}>
                      {rienDepose ? (
                        <span className="admin-muted">{t('ad.clients.depotNone')}</span>
                      ) : (
                        <span className="admin-depots">
                          <span className="admin-badge" data-tone="ok" title={t('ad.f.publies')}>
                            <i className="ri-check-double-line" aria-hidden="true"></i>
                            {nombre(depot.publies)}
                          </span>
                          <span className="admin-badge" data-tone="off" title={t('ad.f.refuses')}>
                            <i className="ri-close-line" aria-hidden="true"></i>
                            {nombre(depot.refuses)}
                          </span>
                          {(depot?.longues ?? 0) > 0 && (
                            <button
                              type="button"
                              className="admin-badge admin-badge-btn"
                              data-tone="warn"
                              title={t('ad.clients.lateOpenHint')}
                              aria-label={`${t('ad.clients.lateOpenHint')} · ${
                                row.organisme || row.nom || row.email || ''
                              }`}
                              onClick={(event) => {
                                event.stopPropagation();
                                if (row.email) onOpenLateAnnonces(row.email, row.id);
                              }}
                            >
                              <i className="ri-timer-flash-line" aria-hidden="true"></i>
                              {nombre(depot?.longues ?? 0)}
                            </button>
                          )}
                        </span>
                      )}
                    </td>
                    <td
                      data-label={t('ad.clients.sleepCol')}
                      data-card-label={t('ad.clients.cardSleep')}
                    >
                      {dormantsCompte.length > 0 ? (
                        <button
                          type="button"
                          className="admin-badge admin-badge-btn admin-row-sleep"
                          data-tone="warn"
                          title={t('ad.clients.sleepOpenHint')}
                          aria-label={`${t('ad.clients.sleepOpenHint')} · ${
                            row.organisme || row.nom || row.email || ''
                          }`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenThread(dormantsCompte[0].id);
                          }}
                        >
                          <i className="ri-moon-line" aria-hidden="true"></i>
                          {nombre(dormantsCompte.length)} {t('ad.clients.sleepRow')}
                        </button>
                      ) : (
                        <span className="admin-muted">—</span>
                      )}
                    </td>
                    <td data-label={t('pays.label')}>{row.pays || '—'}</td>
                    <td className="admin-num" data-label={t('ad.clients.depuis')}>
                      {jour(row.created_at, lang)}
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        {(dormantsCompte.length > 0 || longuesCompte > 0) && (
                          <span
                            className="admin-row-copy"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <CopyTextButton
                              build={recapDe(
                                row.organisme || row.nom || row.email || '—',
                                row.id,
                                row.email,
                              )}
                              label=""
                              hint={t('ad.clients.recapHint')}
                              className="admin-row-copy-btn"
                            />
                          </span>
                        )}
                        <button
                          type="button"
                          className="admin-row-mail"
                          data-recent={relanceProche ? 'yes' : 'no'}
                          title={
                            relanceAt
                              ? `${t('ad.clients.relance')} · ${t('ad.f.lastRelance')} ${jour(
                                  relanceAt,
                                  lang,
                                )}`
                              : `${t('ad.clients.relance')} · ${t('ad.clients.relanceHint')}`
                          }
                          aria-label={`${t('ad.clients.relance')} · ${
                            row.organisme || row.nom || row.email || ''
                          }`}
                          disabled={!row.email}
                          onClick={(event) => {
                            event.stopPropagation();
                            preparerRelance(row.email, row.organisme || row.nom);
                          }}
                        >
                          <i className="ri-mail-send-line" aria-hidden="true"></i>
                        </button>
                        <button
                          type="button"
                          className="admin-row-open"
                          aria-label={`${t('ad.clients.open')} · ${row.organisme || row.nom || '—'}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenCompte(row.id, row.email);
                          }}
                        >
                          <i className="ri-arrow-right-up-line" aria-hidden="true"></i>
                          <span className="whitespace-nowrap">{t('ad.clients.open')}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {relance && (
        <AdminRelance
          to={relance.to}
          subject={relance.subject}
          body={relance.body}
          onClose={() => setRelance(null)}
        />
      )}
    </>
  );
}