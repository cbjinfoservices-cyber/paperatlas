import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CopyTextButton from '@/components/feature/CopyTextButton';
import PoseRestante from '@/components/feature/PoseRestante';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { supabase } from '@/lib/supabase';
import { enSommeil } from '@/lib/messaging';
import AdminDemandeReponse from './AdminDemandeReponse';
import CompteIdentite from './CompteIdentite';
import AdminRelance from './AdminRelance';
import { TON_ETAT, lireEncaissement, type EtatEncaissement } from './adminPaiementsCore';
import type { Tri } from './AdminPaiements';
import type { VuePaiements } from './adminPaiementsCsv';
import { downloadCompteComparaisonWorkbook, downloadComptePartiesCsv } from './adminPaiementsCsv';
import { rangApresRelance } from './adminApresRelance';
import { downloadApresRelanceWorkbook, downloadCompteJournalWorkbook, downloadCompteLateWorkbook, dureeEnMots, resumerVisite, type RevueJournalRow } from './adminClientsXlsx';
import { readChips } from './adminChipsMemory';
import { readExportPaiements, semaineExportPaiements } from './adminPaiementsMemory';
import { readOuvertures, readRevus } from './adminReviewMemory';
import { joursDepuisRelance, readRelanceAt, saveRelanceAt, JOURS_RELANCE_PROCHE } from './adminRelanceMemory';
import { corpsRelance, ligneRecap, sujetRelance } from './adminRelanceText';
import { recapPriorites } from './adminPriorites';
import AdminComptePriorites from './AdminComptePriorites';
import {
  ageJours,
  demandeB2bATraiter,
  demandesB2bATraiter,
  estFerme,
  jour,
  nombre,
  relectureLongue,
  triDemandesParAnciennete,
  type AdminAbonnement,
  type AdminCompteFiche,
  type AdminConversation,
  type AdminDemandeB2b,
  type AdminSection,
  type AdminTab,
} from './adminTypes';

/** Sept jours, la fenêtre du compteur de la semaine — la même que celle de
 *  l'écran « Paiements », pour que les deux comptes parlent du même intervalle. */
const SEMAINE_MS = 7 * 24 * 60 * 60 * 1000;

type Props = {
  compteId: string | null;
  email: string | null;
  onClose: () => void;
  /** Ouvre l'onglet « Annonces » sur les seules relectures longues de ce
   *  compte : la fiche renvoie vers le travail, elle ne le refait pas. */
  onOpenLateAnnonces: (email: string) => void;
  /** Ouvre l'onglet « Annonces » sur un seul dépôt : la fiche le nomme, la
   *  liste le montre — on ne recopie pas son titre pour le retrouver. */
  onOpenAnnonce: (email: string, annonceId: string) => void;
  /** Les dépôts arrivés après la relance, comptés par compte : la fiche y lit
   *  son rang parmi les autres, sur la même mesure que le tableau. */
  apresParCle: Map<string, number>;
  /** Toutes les conversations de la plateforme : la fiche n'y garde que celles
   *  de ce compte, pour dire lesquelles dorment. */
  conversations: AdminConversation[];
  /** Ouvre la messagerie de la console sur un fil : la fiche renvoie vers la
   *  conversation, elle ne la recopie pas. */
  onOpenThread: (conversationId: string) => void;
  /** Ouvre la messagerie de la console en mode revue, réduite aux fils en
   *  sommeil de ce compte : la fiche renvoie au travail, elle ne le refait
   *  pas dans un fichier. */
  onOpenRevueCompte: (compteId: string | null, email: string | null) => void;
  /** Ouvre l'onglet « Paiements » resserré sur ce compte : la pastille
   *  d'encaissement y mène avec la même règle que celle qui l'allume, et le
   *  jeton « à régler » y pose en plus cette seule vue. */
  onOpenPaiements: (
    compteId: string | null,
    email: string | null,
    vue?: VuePaiements,
    tri?: Tri,
    /** Les deux points de la comparaison à ouvrir déjà choisis : la moyenne
     *  des exports de la semaine mène à eux sans qu'on les retrouve. */
    cmp?: { from: string; to: string },
  ) => void;
  /** La section que la console montre derrière la fiche, et ses onglets : ils
   *  suivent la fiche pour rester visibles tant qu'elle est ouverte. */
  section: AdminSection;
  tabs: AdminTab[];
  onPickSection: (key: AdminSection) => void;
  /** La ligne sur laquelle la fiche s'ouvre : la pastille « À relire » la pose
   *  sur la ligne de rôle du compte, pour relire la promotion sans chercher. */
  focus?: 'role' | null;
};

/**
 * La fiche d'un compte, ouverte sur le côté : son identité, ses abonnements,
 * les dépôts qu'il a faits et les demandes B2B qu'il a envoyées.
 *
 * Tout est lu côté serveur, par la même fonction que la console : la fiche ne
 * donne aucun accès direct à la base, et un appel sans identifiant ni adresse
 * ne raconte rien.
 */
export default function AdminCompte({ compteId, email, onClose, onOpenLateAnnonces, onOpenAnnonce, onOpenRevueCompte, onOpenPaiements, apresParCle, conversations, onOpenThread, section, tabs, onPickSection, focus = null }: Props) {
  const { t, lang } = useLang();
  /* Le compteur d'exports de la semaine, lu sur la même mémoire d'appareil
     que l'écran « Paiements » : la fiche ne recompte rien, elle reprend le
     chiffre déjà retenu là-bas. Un tableau qu'on n'a pas réédité depuis
     plusieurs jours se voit donc aussi depuis le compte qu'on est en train
     de lire. */
  const semaineExport = useMemo(() => semaineExportPaiements(readExportPaiements()), []);
  const [data, setData] = useState<AdminCompteFiche | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  /* La relance pré-remplie, posée au-dessus de la fiche. */
  const [relance, setRelance] = useState(false);
  /* La demande B2B dont on prépare la réponse : l'adresse et le message sont
     déjà ceux de l'expéditeur, la fiche n'a plus qu'à ouvrir la feuille. */
  const [reponse, setReponse] = useState<AdminDemandeB2b | null>(null);
  /* La date du dernier message préparé pour ce compte : elle s'affiche près du
     bouton, pour ne pas relancer deux fois de suite. */
  const [derniereRelance, setDerniereRelance] = useState<string | null>(null);
  /* Vrai quand la liste des dépôts arrivés après la relance est réduite à ceux
     qui attendent déjà depuis plus de sept jours. Le compteur reste le même :
     il dit combien, ce jeton décide lesquels se lisent. */
  const [apresLateOnly, setApresLateOnly] = useState(false);
  /* Vrai quand les demandes B2B sont réduites à celles qui restent à traiter.
     Le compteur ne change pas : la file se resserre, le chiffre la dit. */
  const [demandeTodoOnly, setDemandeTodoOnly] = useState(false);
  /* Vrai quand la liste des lignes parties est resserrée sur celles qui pèsent
     à elles seules plus de la moitié du montant retiré. Le total reste le
     même : la liste se resserre, la note le dit. */
  const [partiesMajorOnly, setPartiesMajorOnly] = useState(false);
  /* Vrai quand la liste est resserrée sur l'autre moitié du retrait : les
     lignes qui ne pèsent pas à elles seules plus de la moitié, celles qui se
     partagent le retrait. Les deux jetons ne se cumulent jamais — l'un
     efface l'autre, sinon la liste resterait vide sans qu'on sache lequel la
     tient. */
  const [partiesShareOnly, setPartiesShareOnly] = useState(false);
  /* Vrai quand la liste des fils de la fiche s'ouvre à tous ceux du compte,
     actifs compris : chaque ligne porte alors la porte du fil public. */
  const [tousFils, setTousFils] = useState(false);

  /* La barre d'onglets de la fiche, tenue à part : sur téléphone elle défile
     sur une seule ligne. L'onglet déjà choisi revient donc sous les yeux à
     l'ouverture de la fiche et à chaque changement de section, plutôt que de
     rester hors du cadre après le défilement. */
  const tabsRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const nav = tabsRef.current;
    if (!nav || nav.scrollWidth <= nav.clientWidth) return;
    const actif = nav.querySelector<HTMLElement>('.admin-sheet-tab[data-on="yes"]');
    actif?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
  }, [section]);

  const load = useCallback(async () => {
    /* Ni identifiant ni adresse : la fiche n'a rien à rapprocher, elle le dit
       plutôt que de tourner indéfiniment. */
    if (!compteId && !email) {
      setData({ compte: null, abonnements: [], annonces: [], demandes: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data: answer, error: failure } = await supabase.functions.invoke('admin-console', {
        body: { action: 'compte', compteId: compteId ?? '', email: email ?? '' },
      });
      const payload = answer as ({ ok?: boolean } & Partial<AdminCompteFiche>) | null;
      if (failure || !payload?.ok) {
        setError(t('ad.f.err'));
        return;
      }
      setData({
        compte: payload.compte ?? null,
        abonnements: payload.abonnements ?? [],
        annonces: payload.annonces ?? [],
        demandes: payload.demandes ?? [],
      });
    } catch {
      setError(t('ad.f.err'));
    } finally {
      setLoading(false);
    }
  }, [compteId, email, t]);

  useEffect(() => {
    void load();
  }, [load]);

  /* La touche d'échappement referme d'abord la relance, puis la fiche : on
     ne reste jamais enfermé dans un panneau, et on ne perd pas la fiche en
     refermant un message. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (reponse) {
        setReponse(null);
        return;
      }
      if (relance) {
        setRelance(false);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, relance, reponse]);

  const compte = data?.compte ?? null;
  const titre = compte?.organisme || compte?.nom || email || '—';

  /* Les exports de la semaine relus sur le seul périmètre de ce compte : ce
     que ses abonnements pèsent à la vue et au motif de chaque fichier, et le
     nombre de ses lignes. Seuls les exports qui portaient au moins une de ses
     lignes sont retenus — un fichier qui ne le nommait pas ne dit rien de
     lui. Le montant est celui que le compte pèse aujourd'hui à ce périmètre,
     comme l'écart de la ligne d'archive : un passé ne s'invente pas. */
  const semainePerimetre = useMemo(() => {
    const memoire = readExportPaiements();
    if (!memoire) return null;
    const abos = data?.abonnements ?? [];
    const idsCompte = new Set(abos.map((row) => String(row.id)));
    const now = Date.now();
    const garde = (
      row: AdminAbonnement,
      motif: EtatEncaissement | 'all',
      vue: VuePaiements,
    ) => {
      const lecture = lireEncaissement(row);
      if (motif !== 'all') return lecture.etat === motif;
      if (vue === 'all') return true;
      return vue === 'prets' ? lecture.encaissable : !lecture.encaissable;
    };
    const points = memoire.historique
      .filter((point) => {
        const time = new Date(point.at).getTime();
        if (!Number.isFinite(time) || now - time > SEMAINE_MS || now - time < 0) return false;
        /* Une mémoire plus ancienne ne retenait pas ses lignes : elle reste
           lisible, elle dit seulement qu'on ne sait pas si ce compte y était. */
        if (!Array.isArray(point.ids)) return true;
        return point.ids.some((id) => idsCompte.has(id));
      })
      .map((point) => {
        const lignes = abos.filter((row) => garde(row, point.motif, point.vue));
        const montant = lignes.reduce((sum, row) => {
          const valeur = Number(row.montant_mensuel ?? 0);
          return Number.isFinite(valeur) ? sum + valeur : sum;
        }, 0);
        return {
          at: point.at,
          vue: point.vue,
          /* Les lignes que ce fichier portait, quand la mémoire les
             retenait : la comparaison peut alors nommer celles qui sont
             parties, et ce qu'elles ont retiré au périmètre. */
          ids: point.ids,
          lignes: lignes.length,
          montant: Math.round(montant),
        };
      });
    /* La moyenne ne porte que sur les exports où le compte comptait encore
       des lignes : une file vide ne se moyenne pas. */
    const chiffres = points.filter((point) => point.lignes > 0);
    const moyenne = chiffres.length
      ? Math.round(chiffres.reduce((sum, point) => sum + point.montant, 0) / chiffres.length)
      : null;
    /* Le pic du périmètre : l'export où ce compte a pesé le plus lourd dans
       la semaine. Il faut au moins deux exports chiffrés pour qu'un sommet
       ait un sens — un seul montant ne fait pas un pic. */
    const pic =
      chiffres.length >= 2
        ? chiffres.reduce((best, point) => (point.montant > best.montant ? point : best))
        : null;
    return { points, moyenne, n: chiffres.length, pic };
  }, [data]);

  /* Les deux exports de la semaine qui portaient ce compte, les plus
     écartés dans le temps : la moyenne se clique et s'ouvre sur eux. Un
     export qui ne retenait pas ses lignes ne peut pas entrer dans la
     comparaison — on ne compare pas ce qu'on ne sait pas nommer —, et il en
     faut deux pour qu'il y ait une comparaison. */
  const comparaisonSemaine = useMemo(() => {
    const memoire = readExportPaiements();
    if (!memoire) return null;
    const abos = data?.abonnements ?? [];
    if (abos.length === 0) return null;
    const idsCompte = new Set(abos.map((row) => String(row.id)));
    const porteurs = memoire.historique.filter(
      (point) => Array.isArray(point.ids) && point.ids.some((id) => idsCompte.has(id)),
    );
    if (porteurs.length < 2) return null;
    /* L'historique va du plus récent au plus ancien : l'arrivée est la
       première, le départ la dernière. */
    const from = porteurs[porteurs.length - 1].at;
    const to = porteurs[0].at;
    if (from === to) return null;
    return { from, to };
  }, [data]);

  /* Le pic du périmètre de ce compte, à côté de sa moyenne : l'export de la
     semaine où il a pesé le plus lourd, lu sur la même mesure que la
     moyenne. Il s'ouvre d'un clic sur « Paiements », resserré sur ce compte. */
  const picSemaine = semainePerimetre?.pic ?? null;

  /* La comparaison de deux exports, portée dans la fiche : l'export le plus
     ancien et le plus récent de la semaine qui portaient encore des lignes
     du compte, avec l'écart de montant de ses seules lignes entre les deux.
     Rien n'est lu sur la file entière — la fiche ne parle que de ce compte. */
  const comparaisonPerimetre = useMemo(() => {
    const points = (semainePerimetre?.points ?? []).filter((point) => point.lignes > 0);
    if (points.length < 2) return null;
    /* L'historique va du plus récent au plus ancien : le départ est le
       dernier point chiffré, l'arrivée le premier. */
    const to = points[0];
    const from = points[points.length - 1];
    if (from.at === to.at) return null;
    return { from, to, ecart: to.montant - from.montant };
  }, [semainePerimetre]);

  /* Ce que les lignes parties ont retiré au périmètre du compte entre les deux
     exports : leurs montants, retrouvés dans le tableau par leur identifiant.
     Une ligne qui n'y est plus ne se lit pas — elle se compte, et la fiche le
     dit au lieu d'inventer un zéro. Une mémoire sans lignes laisse la mesure
     nulle : elle ne s'invente pas. */
  const retraitPerimetre = useMemo(() => {
    const comparaison = comparaisonPerimetre;
    if (!comparaison) return null;
    const depart = comparaison.from.ids;
    const arrivee = comparaison.to.ids;
    if (!Array.isArray(depart) || !Array.isArray(arrivee)) return null;
    const encore = new Set(arrivee);
    const parId = new Map((data?.abonnements ?? []).map((row) => [String(row.id), row]));
    let somme = 0;
    let nommees = 0;
    let total = 0;
    depart.forEach((id) => {
      if (encore.has(id)) return;
      total += 1;
      const row = parId.get(id);
      if (!row) return;
      const valeur = Number(row.montant_mensuel ?? 0);
      if (!Number.isFinite(valeur)) return;
      somme += valeur;
      nommees += 1;
    });
    if (total === 0) return null;
    return { somme: Math.round(somme), nommees, total };
  }, [comparaisonPerimetre, data]);

  /* Les lignes parties retrouvées au tableau : celles que la feuille du
     classeur nomme et que le montant retiré additionne. Une ligne déjà sortie
     du tableau ne s'y trouve plus — elle ne se compte. */
  const partiesPerimetre = useMemo(() => {
    const comparaison = comparaisonPerimetre;
    if (!comparaison) return [] as AdminAbonnement[];
    const depart = comparaison.from.ids;
    const arrivee = comparaison.to.ids;
    if (!Array.isArray(depart) || !Array.isArray(arrivee)) return [] as AdminAbonnement[];
    const encore = new Set(arrivee);
    const parId = new Map((data?.abonnements ?? []).map((row) => [String(row.id), row]));
    return depart
      .filter((id) => !encore.has(id))
      .map((id) => parId.get(id))
      .filter((row): row is AdminAbonnement => Boolean(row))
      /* Le montant retiré le plus lourd en tête : la liste se lit dans
         l'ordre de ce qu'elle coûte au compte, pas dans l'ordre de la
         mémoire. Un montant vide reste derrière, il ne se classe pas. */
      .sort((a, b) => {
        const va = Number(a.montant_mensuel ?? 0);
        const vb = Number(b.montant_mensuel ?? 0);
        const na = Number.isFinite(va) && va > 0 ? va : -1;
        const nb = Number.isFinite(vb) && vb > 0 ? vb : -1;
        if (nb !== na) return nb - na;
        return (a.entreprise || '').localeCompare(b.entreprise || '');
      });
  }, [comparaisonPerimetre, data]);

  /* Combien de ces lignes pèsent à elles seules plus de la moitié du montant
     retiré : la liste dit alors si le retrait tient à une ligne ou s'il se
     répartit — le total seul ne le dirait pas. */
  const partiesMajoritaires = useMemo(() => {
    const total = retraitPerimetre?.somme ?? 0;
    if (!(total > 0)) return 0;
    return partiesPerimetre.filter((row) => {
      const valeur = Number(row.montant_mensuel ?? 0);
      return Number.isFinite(valeur) && valeur > total / 2;
    }).length;
  }, [partiesPerimetre, retraitPerimetre]);

  /* Ces lignes majoritaires, nommées : le jeton de la note les garde seules
     dans la liste, pour relire le retrait qui tient à un petit nombre de
     lignes. */
  const partiesMajoritairesRows = useMemo(() => {
    const total = retraitPerimetre?.somme ?? 0;
    if (!(total > 0)) return [] as AdminAbonnement[];
    return partiesPerimetre.filter((row) => {
      const valeur = Number(row.montant_mensuel ?? 0);
      return Number.isFinite(valeur) && valeur > total / 2;
    });
  }, [partiesPerimetre, retraitPerimetre]);

  /* L'identité de ces lignes majoritaires : la liste les marque une à une,
     pour que le retrait qui tient à peu de lignes se voie sans lire le total. */
  const partiesMajoritairesIds = useMemo(
    () => new Set(partiesMajoritairesRows.map((row) => String(row.id))),
    [partiesMajoritairesRows],
  );

  /* Les lignes qui restent quand on retire les majoritaires : celles qui se
     partagent le retrait. Elles n'existent comme ensemble qu'à partir de deux
     lignes — une seule ligne porte tout, elle ne partage rien. */
  const partiesPartageesRows = useMemo(
    () =>
      partiesPerimetre.filter((row) => !partiesMajoritairesIds.has(String(row.id))),
    [partiesPerimetre, partiesMajoritairesIds],
  );

  /* La part du retrait que se partagent les lignes non majoritaires : leur
     somme rapportée au montant retiré total, en pourcentage. Elle ne se lit
     que s'il reste quelque chose à partager — une ligne qui porte tout ne
     partage rien. */
  const partPartagee = useMemo(() => {
    const total = retraitPerimetre?.somme ?? 0;
    if (!(total > 0) || partiesPartageesRows.length === 0) return null;
    const somme = Math.round(
      partiesPartageesRows.reduce((cumul, row) => {
        const valeur = Number(row.montant_mensuel ?? 0);
        return Number.isFinite(valeur) && valeur > 0 ? cumul + valeur : cumul;
      }, 0),
    );
    return { part: Math.round((somme / total) * 100), somme, n: partiesPartageesRows.length };
  }, [partiesPartageesRows, retraitPerimetre]);

  /* Ce que ces seules lignes ont retiré : le CSV réduit compte son propre
     total, sans y glisser les lignes qu'il ne porte pas. */
  const retraitMajoritaires = useMemo(
    () =>
      Math.round(
        partiesMajoritairesRows.reduce((total, row) => {
          const valeur = Number(row.montant_mensuel ?? 0);
          return Number.isFinite(valeur) && valeur > 0 ? total + valeur : total;
        }, 0),
      ),
    [partiesMajoritairesRows],
  );

  /* La liste telle qu'elle se lit : entière, resserrée sur les lignes
     majoritaires, ou resserrée sur celles qui se partagent le retrait. Le
     fichier suit la liste. */
  const partiesAffichees = partiesMajorOnly
    ? partiesMajoritairesRows
    : partiesShareOnly
      ? partiesPartageesRows
      : partiesPerimetre;

  /* Les abonnements de ce compte qui ne sont pas encore encaissables, lus
     avec la règle de l'écran « Paiements » : le chiffre du jeton et la file
     qu'il ouvre ne peuvent pas se contredire. */
  const aReglerCompte = (data?.abonnements ?? []).filter(
    (row) => !lireEncaissement(row).encaissable,
  ).length;

  /* L'autre côté du même compte : les abonnements déjà encaissables, lus par
     la même fonction. Les deux chiffres, côte à côte, disent la file entière
     sans avoir à ouvrir l'écran « Paiements ». */
  const encaissablesCompte = (data?.abonnements ?? []).filter(
    (row) => lireEncaissement(row).encaissable,
  ).length;

  /* Ce que le compte a réellement sur le tableau : les dépôts publiés, les
     refusés, et le reste encore en relecture. Les trois partent des mêmes
     lignes que la liste plus bas. */
  const annonces = data?.annonces ?? [];
  const publies = annonces.filter((row) => (row.statut || '').toLowerCase() === 'publie').length;
  const refuses = annonces.filter((row) => (row.statut || '').toLowerCase() === 'refuse').length;
  const attente = Math.max(annonces.length - publies - refuses, 0);

  /* Les dépôts qui attendent une réponse depuis plus de sept jours : la
     fiche les compte, puis renvoie vers eux d'un clic. */
  const relecturesLongues = annonces.filter((row) =>
    relectureLongue(row.statut, row.created_at),
  ).length;
  const mailCompte = compte?.email || email || '';

  /* Les demandes B2B du compte : celles qui restent à traiter passent devant,
     la plus ancienne en tête — la file se lit dans l'ordre où elle attend, pas
     dans l'ordre où la base la renvoie. Le jeton resserre la liste sur ce qui
     n'a pas encore reçu de réponse. */
  const demandes = data?.demandes ?? [];
  const demandesRestantes = demandesB2bATraiter(demandes);
  const demandesAffichees = demandeTodoOnly
    ? demandesRestantes
    : triDemandesParAnciennete(demandes);

  /* Les fils de ce compte, et leur rythme. Une seule lecture pour toute la
     fiche, avec le même seuil de sommeil que la liste et la console : la
     fiche ne peut pas dire « endormi » là où la messagerie dit autre chose. */
  const compteCle = (compteId || compte?.id || '').trim();
  const mesFils = useMemo(() => {
    if (!compteCle) return [];
    return conversations.filter((row) => row.user_a === compteCle || row.user_b === compteCle);
  }, [conversations, compteCle]);
  const filsKey = mesFils.map((row) => row.id).join(',');
  const [paces, setPaces] = useState<Record<string, number>>({});
  const [pacesReady, setPacesReady] = useState(false);

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
        /* Le rythme n'est qu'une aide : la fiche reste lisible sans lui. */
      } finally {
        if (alive) setPacesReady(true);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [filsKey]);

  /* La revue de ce compte : les fils dormants qui lui appartiennent et qui
     ont été relus pendant la visite, dans l'ordre où ils l'ont été. Les
     instants viennent de la même mémoire de session que le journal du
     classeur, donc la fiche et le fichier datent la visite de la même façon. */
  const journalCompte = useMemo(() => {
    if (!pacesReady) return [] as RevueJournalRow[];
    const revus = new Set(readRevus());
    const ouvertures = readOuvertures();
    return mesFils
      .filter((row) => enSommeil(paces[row.id]) && revus.has(row.id))
      .map((row) => ({
        /* Le fil, son compte et son adresse : le journal de ce compte se lit
           comme celui du classeur, sans croiser deux exports. */
        nom: [row.nom_a, row.nom_b].filter(Boolean).join(' ↔ ') || row.sujet || '—',
        compte: titre,
        mail: mailCompte,
        /* L'instant de la première ouverture pendant la visite : la même
           mémoire de session que la ligne « Ouvert il y a … ». */
        ouvertAt: ouvertures[row.id] || '',
        gap: paces[row.id] ?? 0,
        lastAt: row.last_at ?? null,
      }))
      .sort((a, b) => (a.ouvertAt || '').localeCompare(b.ouvertAt || ''));
  }, [mesFils, paces, pacesReady, titre, mailCompte]);
  const visite = resumerVisite(journalCompte);
  /* L'heure d'ouverture, lue sur la même horloge que le journal du classeur :
     la fiche date la visite à la minute, sans passer par l'export. */
  const heureLabel = useMemo(
    () => new Intl.DateTimeFormat(localeFor(lang), { hour: '2-digit', minute: '2-digit' }),
    [lang],
  );
  const heureDe = (stamp: number | null) => {
    if (stamp === null) return '';
    const value = new Date(stamp);
    if (!Number.isFinite(value.getTime())) return '';
    return heureLabel.format(value);
  };

  /* Les fils qui dorment, le plus lent en tête : ce sont eux qui montent dans
     les priorités du compte, devant tout le reste de la fiche. */
  const filsDormants = useMemo(
    () =>
      mesFils
        .filter((row) => enSommeil(paces[row.id]))
        .sort((a, b) => (paces[b.id] ?? 0) - (paces[a.id] ?? 0)),
    [mesFils, paces],
  );

  /* Les fils actifs du compte, du plus récent au plus ancien : le jeton les
     rappelle dans la liste, et le classeur les nomme un à un sous leur
     chiffre — un compte de fils se relit ligne à ligne. */
  const filsActifs = useMemo(
    () =>
      mesFils
        .filter((row) => !enSommeil(paces[row.id]))
        .sort((a, b) => (b.last_at || '').localeCompare(a.last_at || '')),
    [mesFils, paces],
  );

  /* Tous les fils du compte, les dormants devant, puis les actifs du plus
     récent au plus ancien : le jeton de la fiche les rappelle avec leur porte,
     sans repasser par la messagerie. */
  const filsTries = useMemo(
    () => [...filsDormants, ...filsActifs],
    [filsDormants, filsActifs],
  );

  /* Les fils actifs du compte, lus sur la même mesure que les dormants : le
     classeur de comparaison les inscrit au moment où il se produit, pour que
     le chiffre voyagé dise l'état du compte ce jour-là. */
  const filsActifsCompte = filsActifs.length;

  /* La liste que la fiche montre : les seuls dormants, ou tous les fils quand
     le jeton les appelle. */
  const filsAffiches = tousFils ? filsTries : filsDormants;

  /* Le récapitulatif des priorités, prêt à coller dans un message : les fils
     qui dorment d'abord, puis les relectures longues nommées. Il ne dit rien
     de plus que ce que le bloc montre déjà — et c'est la même fonction que la
     ligne du tableau, pour que les deux copies soient identiques. */  const recapitulatifPriorites = () =>
    recapPriorites({ titre, fils: filsDormants, pace: paces, annonces, t });

  /* Les dépôts entrés après le dernier message préparé : la relance ne les
     couvre pas, la fiche les signale à côté du lien vers les relectures, avec
     la même règle que le bandeau et le classeur. */
  const apresRelance = derniereRelance
    ? annonces.filter((row) => {
        const stamp = new Date(derniereRelance).getTime();
        const depot = new Date(row.created_at || '').getTime();
        return Number.isFinite(stamp) && Number.isFinite(depot) && depot > stamp;
      }).length
    : 0;

  /* Ces mêmes dépôts, nommés par leur titre : le compteur dit combien, la
     liste dit lesquels — du plus récent au plus ancien, pour lire d'abord ce
     que le message n'a pas couvert. */  const apresRelanceRows = (derniereRelance
    ? annonces.filter((row) => {
        const stamp = new Date(derniereRelance).getTime();
        const depot = new Date(row.created_at || '').getTime();
        return Number.isFinite(stamp) && Number.isFinite(depot) && depot > stamp;
      })
    : []
  )
    .slice()
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

  /* Parmi ces dépôts, ceux qui attendent déjà une réponse depuis plus de
     sept jours : les compter sépare ce que le message n'a pas couvert de ce
     qui est déjà en retard de relecture. */
  const apresRelanceLongues = apresRelanceRows.filter((row) =>
    relectureLongue(row.statut, row.created_at),
  ).length;

  /* Les lignes réellement affichées sous le compteur : toutes celles arrivées
     après la relance, ou seulement celles qui attendent déjà, quand le jeton
     est allumé. La mesure ne change pas, seule la lecture se resserre. */
  const apresRelanceAffichees = apresLateOnly
    ? apresRelanceRows.filter((row) => relectureLongue(row.statut, row.created_at))
    : apresRelanceRows;

  /* Le rang de ce compte parmi ceux dont un dépôt est arrivé après leur
     relance : le premier est celui que le message a le moins couvert. Compté
     sur la même mesure que le tableau et le classeur, il ne peut pas
     contredire le compteur. */
  const rang = rangApresRelance(apresRelance, apresParCle);

  /* La ligne copiée : l'adresse d'abord, puis chaque abonnement avec son
     montant, son échéance et son état, et enfin ce que le compte a déposé —
     de quoi écrire un message de relance complet sans rouvrir la fiche. */
  const contexteRelance = () => ({
    nom: compte?.nom || compte?.organisme || '',
    email: mailCompte,
    abonnements: data?.abonnements ?? [],
    annonces,
    lang,
    t,
  });

  const ligneRecapCompte = () => ligneRecap(contexteRelance());

  /* Lue sur l'adresse du compte — celle que la fiche a fini par trouver, pas
     seulement celle qui l'a ouverte. */
  useEffect(() => {
    setDerniereRelance(readRelanceAt(mailCompte));
    /* Changer de compte referme le filtre : la liste repart entière, comme le
       compteur vient d'être relu. */
    setApresLateOnly(false);
    setPartiesMajorOnly(false);
    setPartiesShareOnly(false);
    setTousFils(false);
  }, [mailCompte]);

  /* Préparer une relance laisse une trace datée, par compte : la fiche
     l'affiche aussitôt, pour qu'on ne relance pas deux fois de suite. */
  const ouvrirRelance = () => {
    setDerniereRelance(saveRelanceAt(mailCompte || email));
    setRelance(true);
  };

  return (
    <div className="admin-sheet-layer" role="dialog" aria-modal="true" aria-label={t('ad.f.title')}>
      <button
        type="button"
        className="admin-sheet-backdrop"
        aria-label={t('ad.f.close')}
        onClick={onClose}
      ></button>

      <aside className="admin-sheet">
        <header className="admin-sheet-head">
          <div>
            <p className="admin-stamp">{t('ad.f.stamp')}</p>
            <h2 className="admin-sheet-title">{titre}</h2>
            {compte?.email && (
              <p className="admin-sheet-mail">
                <i className="ri-at-line" aria-hidden="true"></i>
                {compte.email}
              </p>
            )}
            {/* Le repère de pose de la fiche : les clés des dépôts de ce compte
                — annonces et offres, celles que la fiche liste plus bas —, et ce
                qu'il en reste à poser. Le même repère que l'espace compte, posé
                ici pour que la console dise son reste sans ouvrir une fiche
                publique. Il se tait une fois tout posé. */}
            <PoseRestante
              fichier="dict.ts"
              prefixes={['ann.', 'jobd.', 'job.']}
              className="admin-sheet-pose"
            />
            {derniereRelance && (
              <p
                className="admin-relance-ago"
                data-recent={
                  (joursDepuisRelance(derniereRelance) ?? 99) <= JOURS_RELANCE_PROCHE
                    ? 'yes'
                    : 'no'
                }
                title={
                  (joursDepuisRelance(derniereRelance) ?? 99) <= JOURS_RELANCE_PROCHE
                    ? t('ad.f.relanceSoonHint')
                    : undefined
                }
              >
                <i className="ri-mail-check-line" aria-hidden="true"></i>
                {t('ad.f.lastRelance')} · {jour(derniereRelance, lang)}
                <b>
                  {(joursDepuisRelance(derniereRelance) ?? 0) <= 0
                    ? t('ad.f.relanceToday')
                    : t('ad.f.relanceAgo').replace(
                        '{n}',
                        String(joursDepuisRelance(derniereRelance) ?? 0),
                      )}
                </b>
              </p>
            )}
          </div>
          <div className="admin-sheet-actions">
            {!loading && !error && data && mailCompte && (
              <button
                type="button"
                className="admin-btn"
                data-tone="accent"
                title={t('ad.f.relanceHint')}
                onClick={ouvrirRelance}
              >
                <i className="ri-mail-send-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('ad.f.relance')}</span>
              </button>
            )}
            {!loading && !error && data && (
              <CopyTextButton
                build={ligneRecapCompte}
                label={t('ad.f.copy')}
                hint={t('ad.f.copyHint')}
                className="admin-btn"
              />
            )}
            <button type="button" className="admin-ghost" onClick={onClose}>
              <i className="ri-close-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ad.f.close')}</span>
            </button>
          </div>
        </header>

        {/* La barre d'onglets de la console, reprise dans la fiche : ouverte
            par-dessus la liste, la fiche ne cache plus les sections — on passe
            de l'une à l'autre sans avoir à la refermer d'abord. */}
        <nav className="admin-sheet-tabs" aria-label={t('ad.title')} ref={tabsRef}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className="admin-sheet-tab"
              data-on={section === tab.key ? 'yes' : 'no'}
              aria-pressed={section === tab.key}
              title={tab.label}
              onClick={() => onPickSection(tab.key)}
            >
              <i className={tab.icon} aria-hidden="true"></i>
              <span>{tab.label}</span>
              {tab.count !== null && <b>{tab.count}</b>}
            </button>
          ))}
        </nav>

        <div className="admin-sheet-body">
          {loading ? (
            <p className="admin-loading">
              <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
              {t('ad.f.loading')}
            </p>
          ) : error ? (
            <div className="admin-gate">
              <p>{error}</p>
              <button type="button" className="admin-btn" onClick={() => void load()}>
                <i className="ri-refresh-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('ad.retry')}</span>
              </button>
            </div>
          ) : (
            <>
              {(mesFils.length > 0 || relecturesLongues > 0) && (
                <AdminComptePriorites
                  fils={filsAffiches}
                  dormants={filsDormants.length}
                  total={mesFils.length}
                  paces={paces}
                  pacesReady={pacesReady}
                  relecturesLongues={relecturesLongues}
                  tousFils={tousFils}
                  onToggleTousFils={() => setTousFils((avant) => !avant)}
                  onOpenThread={onOpenThread}
                  buildPriorites={recapitulatifPriorites}
                  compteNom={compte?.nom || compte?.organisme || ''}
                  comptePays={compte?.pays ?? null}
                />
              )}

              {/* La revue de ce compte, datée sur place : les fils dormants
                  relus pendant la visite, la première et la dernière
                  ouverture, et l'écart entre les deux — la même synthèse que
                  le bas du journal du classeur, sans ouvrir de fichier. */}
              {visite.relus > 0 && (
                <section className="admin-sheet-block">
                  <div className="admin-sheet-block-head">
                    <p className="admin-stamp">{t('ad.f.revueTitre')}</p>
                    <div className="admin-counts">
                      {/* Le compteur des fils relus se clique : il ouvre la
                          messagerie en mode revue, réduite à ce compte, là
                          où les fils se relisent vraiment. */}
                      <button
                        type="button"
                        className="admin-badge admin-badge-btn"
                        data-tone="ok"
                        title={t('ad.f.revueOpenHint')}
                        aria-label={`${t('ad.f.revueOpenHint')} · ${titre}`}
                        onClick={() => onOpenRevueCompte(compteId, mailCompte)}
                      >
                        <i className="ri-check-double-line" aria-hidden="true"></i>
                        {t('ad.f.revueFils').replace('{n}', nombre(visite.relus))}
                        <i className="ri-arrow-right-line" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="admin-revue-visite"
                    title={t('ad.f.revueSheetHint')}
                    aria-label={`${t('ad.f.revueSheet')} · ${titre}`}
                    onClick={() =>
                      downloadCompteJournalWorkbook({
                        email: mailCompte,
                        entreprise: titre,
                        journal: journalCompte,
                        jetons: readChips(),
                        lang,
                        t,
                      })
                    }
                  >
                    <span className="admin-revue-visite-facts">
                      <span className="admin-revue-visite-fact">
                        <span className="admin-revue-visite-key">
                          {t('ad.f.revueDebut')}
                        </span>
                        <span className="admin-revue-visite-val">
                          {heureDe(visite.debut) || '—'}
                        </span>
                      </span>
                      <span className="admin-revue-visite-fact">
                        <span className="admin-revue-visite-key">{t('ad.f.revueFin')}</span>
                        <span className="admin-revue-visite-val">
                          {heureDe(visite.fin) || '—'}
                        </span>
                      </span>
                      <span className="admin-revue-visite-fact">
                        <span className="admin-revue-visite-key">{t('ad.f.revueEcart')}</span>
                        <span className="admin-revue-visite-val">
                          {dureeEnMots(visite.minutes, t) || '—'}
                        </span>
                      </span>
                    </span>
                    {/* Le bloc se clique : il ouvre le journal de la revue
                        réduit à ce compte, dans le même classeur que le
                        classeur des abonnés. */}
                    <span className="admin-revue-visite-foot">
                      <i className="ri-file-excel-2-line" aria-hidden="true"></i>
                      <span className="whitespace-nowrap">{t('ad.f.revueSheet')}</span>
                      <i className="ri-download-line" aria-hidden="true"></i>
                    </span>
                  </button>
                  <p className="admin-muted">{t('ad.f.revueNote')}</p>
                </section>
              )}

              <CompteIdentite compte={compte} focusRole={focus === 'role'} />

              <section className="admin-sheet-block">
                <div className="admin-sheet-block-head">
                  <p className="admin-stamp">
                    {t('ad.f.abo')} · {nombre(data?.abonnements.length ?? 0)}
                  </p>
                  {/* Les deux côtés de la même file : ce qui est prêt à
                      encaisser, et ce qui bloque. Chaque jeton ouvre l'écran
                      « Paiements » resserré sur ce compte et sur sa vue. */}
                  {(data?.abonnements.length ?? 0) > 0 && (
                    <div className="admin-counts">
                      {aReglerCompte > 0 && (
                        <button
                          type="button"
                          className="admin-count admin-count-btn"
                          data-tone="warn"
                          title={t('ad.f.aboReglerHint')}
                          aria-label={`${t('ad.f.aboReglerHint')} · ${titre}`}
                          onClick={() =>
                            onOpenPaiements(compteId, mailCompte || email, 'regler')
                          }
                        >
                          <i className="ri-error-warning-line" aria-hidden="true"></i>
                          {t('ad.f.aboRegler').replace('{n}', nombre(aReglerCompte))}
                        </button>
                      )}
                      <button
                        type="button"
                        className="admin-count admin-count-btn"
                        data-tone="ok"
                        title={t('ad.f.aboPretsHint')}
                        aria-label={`${t('ad.f.aboPretsHint')} · ${titre}`}
                        onClick={() =>
                          onOpenPaiements(compteId, mailCompte || email, 'prets', 'montant')
                        }
                      >
                        <i className="ri-check-double-line" aria-hidden="true"></i>
                        {t('ad.f.aboPrets').replace('{n}', nombre(encaissablesCompte))}
                      </button>
                    </div>
                  )}
                </div>
                {(data?.abonnements.length ?? 0) === 0 ? (
                  <p className="admin-empty">
                    <i className="ri-inbox-line" aria-hidden="true"></i>
                    {t('ad.f.aboEmpty')}
                  </p>
                ) : (
                  <ul className="admin-rows">
                    {data?.abonnements.map((row) => {
                      const etat = (row.statut || '—').toLowerCase();
                      /* La même lecture que l’écran « Paiements » : la fiche
                         ne peut pas dire « prêt » là où cet écran dit encore
                         « aucun moyen de paiement ». */
                      const lecture = lireEncaissement(row);
                      const icone = lecture.encaissable
                        ? 'ri-check-double-line'
                        : lecture.etat === 'retard'
                          ? 'ri-time-line'
                          : 'ri-error-warning-line';
                      return (
                        <li className="admin-row" key={String(row.id)}>
                          <div className="admin-row-main">
                            <p className="admin-row-head">
                              <span
                                className="admin-badge"
                                data-tone={estFerme(etat) ? 'off' : 'ok'}
                              >
                                {row.statut || '—'}
                              </span>
                              <span className="admin-kind">{row.offre || '—'}</span>
                              {/* L’encaissement, à côté de l’état de
                                 l’abonnement : la même pastille, le même
                                 vocabulaire et la même règle que l’écran
                                 « Paiements ». Elle s’ouvre d’un clic sur
                                 cet écran, déjà resserré sur ce compte. */}
                              <button
                                type="button"
                                className="admin-badge admin-badge-btn"
                                data-tone={TON_ETAT[lecture.etat]}
                                title={t('ad.f.aboPayOpenHint')}
                                aria-label={`${t('ad.f.aboPayOpenHint')} · ${
                                  row.entreprise || mailCompte || titre
                                }`}
                                onClick={() => onOpenPaiements(compteId, mailCompte || email)}
                              >
                                <i className={icone} aria-hidden="true"></i>
                                {t(lecture.cle)}
                                <i className="ri-arrow-right-up-line" aria-hidden="true"></i>
                              </button>
                            </p>
                            <p className="admin-row-meta">
                              <span>
                                <i className="ri-money-euro-circle-line" aria-hidden="true"></i>
                                {nombre(row.montant_mensuel)} · {t('ad.clients.montant')}
                              </span>
                              <span>
                                <i className="ri-calendar-line" aria-hidden="true"></i>
                                {jour(row.date_echeance, lang)}
                              </span>
                              <span>
                                <i className="ri-bank-card-line" aria-hidden="true"></i>
                                {row.canal_paiement || '—'}
                              </span>
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Les exports de la semaine, relus sur le seul périmètre de ce
                  compte : la fiche n'additionne pas le tableau entier, elle
                  dit ce que ce compte pesait dans chaque fichier, et sa
                  moyenne. */}
              <section className="admin-sheet-block">
                <div className="admin-sheet-block-head">
                  <p className="admin-stamp">{t('ad.f.weekScopeTitle')}</p>
                  {semainePerimetre && semainePerimetre.moyenne !== null && (
                    <div className="admin-counts">
                      {comparaisonSemaine ? (
                        <button
                          type="button"
                          className="admin-count admin-count-btn"
                          data-tone="accent"
                          title={t('ad.f.weekScopeAvgOpenHint')}
                          onClick={() =>
                            onOpenPaiements(
                              compteId,
                              mailCompte || email,
                              'all',
                              'etat',
                              comparaisonSemaine,
                            )
                          }
                        >
                          <i className="ri-line-chart-line" aria-hidden="true"></i>
                          {t('ad.f.weekScopeAvg').replace(
                            '{n}',
                            nombre(semainePerimetre.moyenne),
                          )}
                          <b>
                            {t('ad.f.weekScopeAvgNote').replace(
                              '{n}',
                              nombre(semainePerimetre.n),
                            )}
                          </b>
                          <i className="ri-arrow-right-up-line" aria-hidden="true"></i>
                        </button>
                      ) : (
                        <span
                          className="admin-count"
                          data-tone="accent"
                          title={t('ad.f.weekScopeAvgHint')}
                        >
                          <i className="ri-line-chart-line" aria-hidden="true"></i>
                          {t('ad.f.weekScopeAvg').replace(
                            '{n}',
                            nombre(semainePerimetre.moyenne),
                          )}
                          <b>
                            {t('ad.f.weekScopeAvgNote').replace(
                              '{n}',
                              nombre(semainePerimetre.n),
                            )}
                          </b>
                        </span>
                      )}
                      {/* Le pic du seul périmètre de ce compte : l'export où
                          il a pesé le plus lourd de la semaine, à côté de sa
                          moyenne. Il se clique et rouvre cet export-là. */}
                      {picSemaine && (
                        <button
                          type="button"
                          className="admin-count admin-count-btn"
                          data-tone="ok"
                          title={t('ad.f.weekScopePeakHint')}
                          aria-label={`${t('ad.f.weekScopePeakOpenHint')} · ${titre}`}
                          onClick={() =>
                            onOpenPaiements(
                              compteId,
                              mailCompte || email,
                              picSemaine.vue,
                            )
                          }
                        >
                          <i className="ri-bar-chart-grouped-line" aria-hidden="true"></i>
                          {t('ad.f.weekScopePeak')
                            .replace('{n}', nombre(picSemaine.montant))
                            .replace('{date}', jour(picSemaine.at, lang))}
                          <i className="ri-arrow-right-up-line" aria-hidden="true"></i>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <p className="admin-muted">{t('ad.f.weekScopeHint')}</p>
                {!semainePerimetre ? (
                  <p className="admin-empty">
                    <i className="ri-archive-2-line" aria-hidden="true"></i>
                    {t('ad.f.weekScopeNoMemory')}
                  </p>
                ) : semainePerimetre.points.length === 0 ? (
                  <p className="admin-empty">
                    <i className="ri-archive-line" aria-hidden="true"></i>
                    {t('ad.f.weekScopeNone')}
                  </p>
                ) : (
                  <ul className="admin-scope-list">
                    {semainePerimetre.points.map((point) => (
                      <li key={point.at}>
                        <button
                          type="button"
                          className="admin-scope-row"
                          title={t('ad.f.weekScopeOpen')}
                          aria-label={`${t('ad.f.weekScopeOpen')} · ${titre}`}
                          onClick={() =>
                            onOpenPaiements(compteId, mailCompte || email, point.vue)
                          }
                        >
                          <i className="ri-history-line" aria-hidden="true"></i>
                          <span className="admin-scope-main">
                            <b>
                              {jour(point.at, lang)}
                              {heureDe(new Date(point.at).getTime())
                                ? ` · ${heureDe(new Date(point.at).getTime())}`
                                : ''}
                            </b>
                            <em>
                              {t('ad.f.weekScopeRows').replace('{n}', nombre(point.lignes))}
                            </em>
                          </span>
                          <span className="admin-scope-amount">
                            {nombre(point.montant)}
                          </span>
                          <i className="ri-arrow-right-up-line" aria-hidden="true"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {/* La comparaison de deux exports de son périmètre : les deux
                    points côte à côte, et l'écart de montant de ses seules
                    lignes. Le jeton se clique pour retrouver la même
                    comparaison dans « Paiements », déjà choisie. */}
                {comparaisonPerimetre && (
                  <div className="admin-scope-cmp">
                    <p className="admin-scope-cmp-head">
                      <i className="ri-arrow-left-right-line" aria-hidden="true"></i>
                      <b>{t('ad.f.weekScopeCmpTitle')}</b>
                      {comparaisonSemaine ? (
                        <button
                          type="button"
                          className="admin-scope-cmp-gap"
                          data-tone={
                            comparaisonPerimetre.ecart > 0
                              ? 'up'
                              : comparaisonPerimetre.ecart < 0
                                ? 'down'
                                : 'flat'
                          }
                          title={t('ad.f.weekScopeCmpOpenHint')}
                          onClick={() =>
                            onOpenPaiements(
                              compteId,
                              mailCompte || email,
                              'all',
                              'etat',
                              comparaisonSemaine,
                            )
                          }
                        >
                          <i
                            className={
                              comparaisonPerimetre.ecart > 0
                                ? 'ri-arrow-up-line'
                                : comparaisonPerimetre.ecart < 0
                                  ? 'ri-arrow-down-line'
                                  : 'ri-subtract-line'
                            }
                            aria-hidden="true"
                          ></i>
                          {comparaisonPerimetre.ecart === 0
                            ? t('ad.f.weekScopeCmpFlat')
                            : t(
                                comparaisonPerimetre.ecart > 0
                                  ? 'ad.f.weekScopeCmpUp'
                                  : 'ad.f.weekScopeCmpDown',
                              ).replace(
                                '{n}',
                                nombre(Math.abs(comparaisonPerimetre.ecart)),
                              )}
                        </button>
                      ) : (
                        <span
                          className="admin-scope-cmp-gap"
                          data-tone={
                            comparaisonPerimetre.ecart > 0
                              ? 'up'
                              : comparaisonPerimetre.ecart < 0
                                ? 'down'
                                : 'flat'
                          }
                          title={t('ad.f.weekScopeCmpHint')}
                        >
                          <i
                            className={
                              comparaisonPerimetre.ecart > 0
                                ? 'ri-arrow-up-line'
                                : comparaisonPerimetre.ecart < 0
                                  ? 'ri-arrow-down-line'
                                  : 'ri-subtract-line'
                            }
                            aria-hidden="true"
                          ></i>
                          {comparaisonPerimetre.ecart === 0
                            ? t('ad.f.weekScopeCmpFlat')
                            : t(
                                comparaisonPerimetre.ecart > 0
                                  ? 'ad.f.weekScopeCmpUp'
                                  : 'ad.f.weekScopeCmpDown',
                              ).replace(
                                '{n}',
                                nombre(Math.abs(comparaisonPerimetre.ecart)),
                              )}
                        </span>
                      )}
                      {/* Ce que les lignes parties ont retiré au périmètre :
                          le montant de ses seules lignes, pas celui de la
                          file entière. */}
                      {retraitPerimetre && retraitPerimetre.nommees > 0 && (
                        <span
                          className="admin-scope-cmp-parties"
                          title={t('ad.f.weekScopeCmpPartiesHint')}
                        >
                          <i className="ri-arrow-down-line" aria-hidden="true"></i>
                          {t('ad.f.weekScopeCmpParties').replace(
                            '{n}',
                            nombre(retraitPerimetre.somme),
                          )}
                        </span>
                      )}
                    </p>
                    <div className="admin-scope-cmp-points">
                      <span className="admin-scope-cmp-point">
                        <em>{t('ad.f.weekScopeCmpFrom')}</em>
                        <b>
                          {jour(comparaisonPerimetre.from.at, lang)}
                          {heureDe(new Date(comparaisonPerimetre.from.at).getTime())
                            ? ` · ${heureDe(new Date(comparaisonPerimetre.from.at).getTime())}`
                            : ''}
                        </b>
                        <span>
                          {t('ad.f.weekScopeRows').replace(
                            '{n}',
                            nombre(comparaisonPerimetre.from.lignes),
                          )}{' '}
                          · {nombre(comparaisonPerimetre.from.montant)}
                        </span>
                      </span>
                      <i className="ri-arrow-right-line" aria-hidden="true"></i>
                      <span className="admin-scope-cmp-point">
                        <em>{t('ad.f.weekScopeCmpTo')}</em>
                        <b>
                          {jour(comparaisonPerimetre.to.at, lang)}
                          {heureDe(new Date(comparaisonPerimetre.to.at).getTime())
                            ? ` · ${heureDe(new Date(comparaisonPerimetre.to.at).getTime())}`
                            : ''}
                        </b>
                        <span>
                          {t('ad.f.weekScopeRows').replace(
                            '{n}',
                            nombre(comparaisonPerimetre.to.lignes),
                          )}{' '}
                          · {nombre(comparaisonPerimetre.to.montant)}
                        </span>
                      </span>
                    </div>
                    <p className="admin-scope-cmp-note">{t('ad.f.weekScopeCmpNote')}</p>
                    {/* Les lignes parties qui ne sont plus au tableau ne se
                        lisent plus : la fiche les compte, plutôt que de
                        laisser un montant partiel passer pour complet. */}
                    {retraitPerimetre &&
                      retraitPerimetre.nommees < retraitPerimetre.total && (
                        <p className="admin-scope-cmp-note">
                          {t('ad.f.weekScopeCmpPartiesUnknown').replace(
                            '{n}',
                            nombre(retraitPerimetre.total - retraitPerimetre.nommees),
                          )}
                        </p>
                      )}
                    {/* Les lignes parties, nommées une à une sous le montant
                        qu'elles ont retiré : le chiffre se relit ligne à
                        ligne, sans ouvrir le classeur. */}
                    {partiesPerimetre.length > 0 && (
                      <div className="admin-scope-cmp-parties-list">
                        <p className="admin-scope-cmp-parties-head">
                          <i className="ri-logout-box-r-line" aria-hidden="true"></i>
                          <b>
                            {t('ad.f.weekScopeCmpPartiesList').replace(
                              '{n}',
                              nombre(partiesAffichees.length),
                            )}
                          </b>
                          <em title={t('ad.f.weekScopeCmpPartiesListHint')}>
                            {retraitPerimetre && retraitPerimetre.nommees > 0
                              ? t('ad.f.weekScopeCmpPartiesTotal').replace(
                                  '{n}',
                                  nombre(retraitPerimetre.somme),
                                )
                              : t('ad.f.weekScopeCmpPartiesNoTotal')}
                          </em>
                        </p>
                        <ul>
                          {partiesAffichees.map((row) => {
                            const valeur = Number(row.montant_mensuel ?? 0);
                            const chiffre = Number.isFinite(valeur) && valeur > 0;
                            return (
                              <li key={String(row.id)} data-major={partiesMajoritairesIds.has(String(row.id)) ? 'yes' : 'no'}>
                                <i className="ri-corner-down-right-line" aria-hidden="true"></i>
                                <span className="admin-scope-cmp-parties-name">
                                  <b>{row.entreprise || row.email || '—'}</b>
                                  {row.email && <em>{row.email}</em>}
                                </span>
                                {/* Le repère de la ligne qui pèse à elle seule
                                    plus de la moitié du retrait : la liste le
                                    dit ligne à ligne, sans passer par le
                                    total ni par le classeur. */}
                                {partiesMajoritairesIds.has(String(row.id)) && (
                                  <span
                                    className="admin-scope-cmp-parties-mark"
                                    title={t('ad.f.weekScopeCmpPartiesMajorHint')}
                                  >
                                    <i className="ri-scales-3-line" aria-hidden="true"></i>
                                    <span className="whitespace-nowrap">
                                      {t('ad.f.weekScopeCmpPartiesMajorMark')}
                                    </span>
                                  </span>
                                )}
                                <span
                                  className="admin-scope-cmp-parties-amount"
                                  data-empty={chiffre ? 'no' : 'yes'}
                                >
                                  {chiffre
                                    ? `−${nombre(valeur)}`
                                    : t('ad.f.weekScopeCmpPartiesNoAmount')}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                        {/* Sous la liste, la part que se partagent les lignes
                            non majoritaires : leur somme rapportée au total
                            retiré. Le chiffre se lit sans additionner la
                            colonne ni ouvrir le classeur. */}
                        {partPartagee && (
                          <button
                            type="button"
                            className="admin-scope-cmp-parties-share-note"
                            data-on={partiesShareOnly ? 'yes' : 'no'}
                            aria-pressed={partiesShareOnly}
                            title={
                              partiesShareOnly
                                ? t('ad.f.weekScopeCmpPartiesShareExitHint')
                                : t('ad.f.weekScopeCmpPartiesShareNoteHint')
                            }
                            onClick={() => {
                              setPartiesMajorOnly(false);
                              setPartiesShareOnly((value) => !value);
                            }}
                          >
                            <i
                              className={
                                partiesShareOnly
                                  ? 'ri-filter-3-line'
                                  : 'ri-pie-chart-line'
                              }
                              aria-hidden="true"
                            ></i>
                            <span>
                              {t('ad.f.weekScopeCmpPartiesShareNote')
                                .replace('{p}', String(partPartagee.part))
                                .replace('{n}', nombre(partPartagee.n))
                                .replace('{s}', nombre(partPartagee.somme))}
                            </span>
                            <i className="ri-arrow-right-line" aria-hidden="true"></i>
                          </button>
                        )}
                        {/* Sous la liste, ce qu'elle pèse réellement : combien
                            de ces lignes portent à elles seules plus de la
                            moitié du montant retiré. La note est un jeton :
                            un clic resserre la liste sur ces seules lignes,
                            un second la rend entière. */}
                        {retraitPerimetre && retraitPerimetre.somme > 0 && (
                          <div className="admin-scope-cmp-parties-tokens">
                          {partiesMajoritaires > 0 ? (
                            <button
                              type="button"
                              className="admin-scope-cmp-parties-major admin-scope-cmp-parties-major-btn"
                              data-on={partiesMajorOnly ? 'yes' : 'no'}
                              aria-pressed={partiesMajorOnly}
                              title={
                                partiesMajorOnly
                                  ? t('ad.f.weekScopeCmpPartiesMajorExitHint')
                                  : t('ad.f.weekScopeCmpPartiesMajorTokenHint')
                              }
                              onClick={() => {
                                setPartiesShareOnly(false);
                                setPartiesMajorOnly((value) => !value);
                              }}
                            >
                              <i
                                className={
                                  partiesMajorOnly
                                    ? 'ri-filter-3-line'
                                    : 'ri-scales-3-line'
                                }
                                aria-hidden="true"
                              ></i>
                              {partiesMajorOnly
                                ? t('ad.f.weekScopeCmpPartiesMajorOn').replace(
                                    '{n}',
                                    nombre(partiesMajoritaires),
                                  )
                                : t('ad.f.weekScopeCmpPartiesMajor')
                                    .replace('{n}', nombre(partiesMajoritaires))
                                    .replace('{t}', nombre(retraitPerimetre.somme))}
                            </button>
                          ) : (
                            <p
                              className="admin-scope-cmp-parties-major"
                              title={t('ad.f.weekScopeCmpPartiesMajorHint')}
                            >
                              <i className="ri-scales-2-line" aria-hidden="true"></i>
                              {t('ad.f.weekScopeCmpPartiesMajorNone')}
                            </p>
                          )}
                          {/* Le second jeton, à côté de celui des majoritaires :
                              il resserre la liste sur les lignes qui ne pèsent
                              pas plus de la moitié à elles seules — celles qui
                              se partagent le retrait. Les deux ne se cumulent
                              pas : l’un efface l’autre. */}
                          {partiesPartageesRows.length > 0 && (
                            <button
                              type="button"
                              className="admin-scope-cmp-parties-share"
                              data-on={partiesShareOnly ? 'yes' : 'no'}
                              aria-pressed={partiesShareOnly}
                              title={
                                partiesShareOnly
                                  ? t('ad.f.weekScopeCmpPartiesShareExitHint')
                                  : t('ad.f.weekScopeCmpPartiesShareHint')
                              }
                              onClick={() => {
                                setPartiesMajorOnly(false);
                                setPartiesShareOnly((value) => !value);
                              }}
                            >
                              <i
                                className={
                                  partiesShareOnly
                                    ? 'ri-filter-3-line'
                                    : 'ri-pie-chart-line'
                                }
                                aria-hidden="true"
                              ></i>
                              {partiesShareOnly
                                ? t('ad.f.weekScopeCmpPartiesShareOn').replace(
                                    '{n}',
                                    nombre(partiesPartageesRows.length),
                                  )
                                : t('ad.f.weekScopeCmpPartiesShare').replace(
                                    '{n}',
                                    nombre(partiesPartageesRows.length),
                                  )}
                            </button>
                          )}
                          </div>
                        )}
                      </div>
                    )}
                    {/* La ligne de synthèse des majoritaires : elle dit
                        combien de lignes pèsent plus de la moitié du retrait
                        et ouvre, d'un clic, le CSV réduit à ces seules
                        lignes — sans resserrer la liste à l'écran. */}
                    {retraitPerimetre &&
                      retraitPerimetre.somme > 0 &&
                      partiesMajoritaires > 0 && (
                        <button
                          type="button"
                          className="admin-scope-cmp-parties-major-line"
                          title={t('ad.f.weekScopeCmpPartiesMajorLineHint')}
                          aria-label={`${t('ad.f.weekScopeCmpPartiesMajorLineHint')} · ${titre}`}
                          onClick={() =>
                            downloadComptePartiesCsv({
                              rows: partiesMajoritairesRows,
                              parties: partiesMajoritairesRows.length,
                              retrait: retraitMajoritaires,
                              email: mailCompte,
                              entreprise: compte?.organisme || compte?.nom || '',
                              lang,
                              t,
                            })
                          }
                        >
                          <i className="ri-file-excel-2-line" aria-hidden="true"></i>
                          <span>
                            {t('ad.f.weekScopeCmpPartiesMajorLine').replace(
                              '{n}',
                              nombre(partiesMajoritaires),
                            )}
                          </span>
                          <i className="ri-download-line" aria-hidden="true"></i>
                        </button>
                      )}
                    {/* La liste des lignes parties part aussi en CSV, seule :
                        ce que la fiche laisse lire, dans l'ordre du montant
                        retiré, sans ouvrir le classeur entier. Le fichier
                        suit la liste : resserrée, il n'emporte que ces
                        lignes-là. */}
                    {partiesAffichees.length > 0 && (
                      <button
                        type="button"
                        className="admin-scope-cmp-sheet admin-scope-cmp-csv"
                        title={t('ad.f.weekScopeCmpPartiesCsvHint')}
                        aria-label={`${t('ad.f.weekScopeCmpPartiesCsv')} · ${titre}`}
                        onClick={() =>
                          downloadComptePartiesCsv({
                            rows: partiesAffichees,
                            /* Une liste resserrée n'a pas de lignes
                               « inconnues » : la différence avec le total
                               des parties n'est plus un manque, c'est le
                               resserrement lui-même. */
                            parties: partiesMajorOnly || partiesShareOnly
                              ? partiesAffichees.length
                              : (retraitPerimetre?.total ?? partiesPerimetre.length),
                            retrait: retraitPerimetre?.nommees
                              ? retraitPerimetre.somme
                              : null,
                            email: mailCompte,
                            entreprise: compte?.organisme || compte?.nom || '',
                            lang,
                            t,
                          })
                        }
                      >
                        <i className="ri-file-excel-2-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">
                          {t('ad.f.weekScopeCmpPartiesCsv')}
                        </span>
                        <i className="ri-download-line" aria-hidden="true"></i>
                      </button>
                    )}
                    {/* La comparaison part en classeur, réduite au périmètre
                        de ce compte : les deux exports, l'écart de ses seules
                        lignes, puis celles qui sont parties avec ce qu'elles
                        ont retiré. */}
                    <button
                      type="button"
                      className="admin-scope-cmp-sheet"
                      title={t('ad.f.weekScopeCmpSheetHint')}
                      aria-label={`${t('ad.f.weekScopeCmpSheet')} · ${titre}`}
                      onClick={() =>
                        downloadCompteComparaisonWorkbook({
                          from: {
                            at: comparaisonPerimetre.from.at,
                            vue: comparaisonPerimetre.from.vue,
                            rows: comparaisonPerimetre.from.lignes,
                            montant: comparaisonPerimetre.from.montant,
                          },
                          to: {
                            at: comparaisonPerimetre.to.at,
                            vue: comparaisonPerimetre.to.vue,
                            rows: comparaisonPerimetre.to.lignes,
                            montant: comparaisonPerimetre.to.montant,
                          },
                          montant: comparaisonPerimetre.ecart,
                          lignes: comparaisonPerimetre.to.lignes - comparaisonPerimetre.from.lignes,
                          parties: retraitPerimetre?.total ?? 0,
                          partiesRows: partiesPerimetre,
                          retrait: retraitPerimetre?.nommees
                            ? retraitPerimetre.somme
                            : null,
                          /* Les fils actifs au moment du clic : null tant que
                             les rythmes ne sont pas revenus, pour qu'un
                             chiffre non mesuré ne s'écrive pas. */
                          filsActifs: pacesReady ? filsActifsCompte : null,
                          /* Les mêmes fils, nommés : la feuille du classeur
                             relit le chiffre ligne à ligne, avec le sujet et
                             le dernier message de chacun. */
                          filsActifsRows: pacesReady ? filsActifs : [],
                          filsActifsPaces: paces,
                          email: mailCompte,
                          entreprise: compte?.organisme || compte?.nom || '',
                          lang,
                          t,
                        })
                      }
                    >
                      <i className="ri-file-excel-2-line" aria-hidden="true"></i>
                      <span className="whitespace-nowrap">
                        {t('ad.f.weekScopeCmpSheet')}
                      </span>
                      <i className="ri-download-line" aria-hidden="true"></i>
                    </button>
                  </div>
                )}
              </section>

              <section className="admin-sheet-block">
                <div className="admin-sheet-block-head">
                  <p className="admin-stamp">
                    {t('ad.f.annonces')} · {nombre(data?.annonces.length ?? 0)}
                  </p>
                  {!loading && !error && annonces.length > 0 && (
                    <div className="admin-counts">
                      <span className="admin-count" data-tone="ok">
                        <i className="ri-check-double-line" aria-hidden="true"></i>
                        {t('ad.f.publies')} <b>{nombre(publies)}</b>
                      </span>
                      <span className="admin-count" data-tone="off">
                        <i className="ri-close-line" aria-hidden="true"></i>
                        {t('ad.f.refuses')} <b>{nombre(refuses)}</b>
                      </span>
                      {attente > 0 && (
                        <span className="admin-count" data-tone="soft">
                          <i className="ri-time-line" aria-hidden="true"></i>
                          {t('ad.f.attente')} <b>{nombre(attente)}</b>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {(relecturesLongues > 0 || (derniereRelance && mailCompte)) && mailCompte && (
                  <div className="admin-fiche-links">
                    {relecturesLongues > 0 && (
                      <>
                        <button
                          type="button"
                          className="admin-fiche-link"
                          title={t('ad.f.lateLinkHint')}
                          onClick={() => onOpenLateAnnonces(mailCompte)}
                        >
                          <i className="ri-timer-flash-line" aria-hidden="true"></i>
                          <span className="whitespace-nowrap">
                            {t('ad.f.lateLink').replace('{n}', nombre(relecturesLongues))}
                          </span>
                          <i className="ri-arrow-right-line" aria-hidden="true"></i>
                        </button>
                        {/* Le classeur d'un seul compte : les mêmes lignes que
                            la fiche, emportées telles quelles. */}
                        <button
                          type="button"
                          className="admin-fiche-link"
                          title={t('ad.f.lateSheetHint')}
                          onClick={() =>
                            downloadCompteLateWorkbook({
                              email: mailCompte,
                              entreprise: compte?.organisme || compte?.nom || '',
                              annonces,
                              /* Le compte des jetons posés sur la liste, lu
                                 dans la mémoire de l'appareil : le nom du
                                 fichier se date du même chiffre que le
                                 classeur des abonnés. */
                              jetons: readChips(),
                              dureeMin: visite.minutes,
                              lang,
                              t,
                            })
                          }
                        >
                          <i className="ri-file-excel-2-line" aria-hidden="true"></i>
                          <span className="whitespace-nowrap">{t('ad.f.lateSheet')}</span>
                          <i className="ri-download-line" aria-hidden="true"></i>
                        </button>
                      </>
                    )}
                    {derniereRelance && apresRelanceRows.length > 0 && (
                      <button
                        type="button"
                        className="admin-fiche-link"
                        title={t('ad.f.afterSheetHint')}
                        onClick={() =>
                          downloadApresRelanceWorkbook({
                            email: mailCompte,
                            entreprise: compte?.organisme || compte?.nom || '',
                            relanceAt: derniereRelance,
                            rang,
                            annonces,
                            jetons: readChips(),
                            dureeMin: visite.minutes,
                            lang,
                            t,
                          })
                        }
                      >
                        <i className="ri-file-excel-2-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">{t('ad.f.afterSheet')}</span>
                        <i className="ri-download-line" aria-hidden="true"></i>
                      </button>
                    )}
                    {derniereRelance && (
                      <span
                        className="admin-count admin-after-relance"
                        data-tone={apresRelance > 0 ? 'accent' : 'soft'}
                        title={t('ad.f.afterRelanceHint')}
                      >
                        <i
                          className={
                            apresRelance > 0 ? 'ri-mail-unread-line' : 'ri-mail-check-line'
                          }
                          aria-hidden="true"
                        ></i>
                        {apresRelance > 0
                          ? t('ad.f.afterRelance').replace('{n}', nombre(apresRelance))
                          : t('ad.f.afterRelanceNone')}
                        {rang && rang.total > 1 && (
                          <b className="admin-after-rank" title={t('ad.f.afterRelanceRankHint')}>
                            {t('ad.f.afterRelanceRank')
                              .replace('{r}', String(rang.rang))
                              .replace('{t}', nombre(rang.total))}
                          </b>
                        )}
                      </span>
                    )}
                    {derniereRelance && apresRelanceLongues > 0 && (
                      <button
                        type="button"
                        className="admin-count admin-count-btn"
                        data-tone="warn"
                        data-on={apresLateOnly ? 'yes' : 'no'}
                        aria-pressed={apresLateOnly}
                        title={t('ad.f.afterRelanceLateFilterHint')}
                        onClick={() => setApresLateOnly((value) => !value)}
                      >
                        <i className="ri-timer-flash-line" aria-hidden="true"></i>
                        {t('ad.f.afterRelanceLate').replace(
                          '{n}',
                          nombre(apresRelanceLongues),
                        )}
                      </button>
                    )}
                  </div>
                )}
                {derniereRelance && apresRelanceAffichees.length > 0 && (
                  <ul
                    className="admin-fiche-apres"
                    aria-label={
                      apresLateOnly
                        ? t('ad.f.afterRelanceListLate')
                        : t('ad.f.afterRelanceList')
                    }
                  >
                    {apresRelanceAffichees.map((row) => (
                      <li key={row.id}>
                        <i className="ri-corner-down-right-line" aria-hidden="true"></i>
                        <button
                          type="button"
                          className="admin-fiche-apres-open"
                          title={t('ad.f.afterRelanceOpen')}
                          aria-label={`${t('ad.f.afterRelanceOpen')} · ${row.titre}`}
                          onClick={() => onOpenAnnonce(mailCompte, row.id)}
                        >
                          <span className="admin-fiche-apres-title">{row.titre}</span>
                          <i className="ri-arrow-right-line" aria-hidden="true"></i>
                        </button>
                        <span className="admin-fiche-apres-date">
                          {jour(row.created_at, lang)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {(data?.annonces.length ?? 0) === 0 ? (
                  <p className="admin-empty">
                    <i className="ri-file-list-3-line" aria-hidden="true"></i>
                    {t('ad.f.annoncesEmpty')}
                  </p>
                ) : (
                  <ul className="admin-rows">
                    {data?.annonces.map((row) => {
                      const etat = (row.statut || '—').toLowerCase();
                      /* Les jours d'attente, lus sur la date du dépôt : une
                         relecture se juge à son âge, pas à son rang. */
                      const attenteJours = ageJours(row.created_at);
                      const retard = relectureLongue(row.statut, row.created_at);
                      const joursTexte =
                        attenteJours === null || attenteJours <= 0
                          ? t('ad.f.depotToday')
                          : t('ad.f.depotSince').replace('{n}', String(attenteJours));
                      return (
                        <li className="admin-row" key={row.id} data-state={etat} data-late={retard ? 'yes' : 'no'}>
                          <div className="admin-row-main">
                            <p className="admin-row-head">
                              <span
                                className="admin-badge"
                                data-tone={
                                  etat === 'publie' ? 'ok' : etat === 'refuse' ? 'off' : 'soft'
                                }
                              >
                                {row.statut || '—'}
                              </span>
                              {row.kind && <span className="admin-kind">{row.kind}</span>}
                              <span className="admin-muted admin-num">
                                {jour(row.created_at, lang)}
                              </span>
                              <span
                                className="admin-badge"
                                data-tone={retard ? 'warn' : 'soft'}
                                title={t('ad.f.depotSinceHint')}
                              >
                                <i className="ri-time-line" aria-hidden="true"></i>
                                {joursTexte}
                              </span>
                            </p>
                            <h3 className="admin-row-title">{row.titre}</h3>
                            <p className="admin-row-meta">
                              {row.organisation && (
                                <span>
                                  <i className="ri-building-line" aria-hidden="true"></i>
                                  {row.organisation}
                                </span>
                              )}
                              {row.wilaya && (
                                <span>
                                  <i className="ri-map-pin-line" aria-hidden="true"></i>
                                  {row.wilaya}
                                </span>
                              )}
                              {row.budget && (
                                <span>
                                  <i className="ri-price-tag-3-line" aria-hidden="true"></i>
                                  {row.budget}
                                </span>
                              )}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <section className="admin-sheet-block">
                <div className="admin-sheet-block-head">
                  <p className="admin-stamp">
                    {t('ad.f.demandes')} · {nombre(demandes.length)}
                  </p>
                  {!loading && !error && demandes.length > 0 && (
                    <div className="admin-counts">
                      {/* La file se compte, puis se resserre d'un clic : le
                          chiffre dit combien attendent, le jeton décide
                          lesquelles se lisent. */}
                      <button
                        type="button"
                        className="admin-count admin-count-btn"
                        data-tone={demandesRestantes.length > 0 ? 'warn' : 'ok'}
                        data-on={demandeTodoOnly ? 'yes' : 'no'}
                        aria-pressed={demandeTodoOnly}
                        title={t('ad.f.demandesTodoHint')}
                        onClick={() => setDemandeTodoOnly((value) => !value)}
                      >
                        <i className="ri-inbox-unarchive-line" aria-hidden="true"></i>
                        {t('ad.f.demandesTodo')} <b>{nombre(demandesRestantes.length)}</b>
                      </button>
                      <span className="admin-count" data-tone="soft">
                        <i className="ri-check-double-line" aria-hidden="true"></i>
                        {t('ad.f.demandesDone')}{' '}
                        <b>{nombre(demandes.length - demandesRestantes.length)}</b>
                      </span>
                    </div>
                  )}
                </div>
                {demandes.length > 0 && (
                  <p className="admin-muted admin-fiche-order">
                    <i className="ri-sort-asc" aria-hidden="true"></i>
                    {t('ad.f.demandesOrderHint')}
                  </p>
                )}
                {demandesAffichees.length === 0 ? (
                  <p className="admin-empty">
                    <i
                      className={
                        demandeTodoOnly ? 'ri-check-double-line' : 'ri-briefcase-line'
                      }
                      aria-hidden="true"
                    ></i>
                    {demandes.length === 0
                      ? t('ad.f.demandesEmpty')
                      : t('ad.f.demandesNoneTodo')}
                  </p>
                ) : (
                  <ul className="admin-rows">
                    {demandesAffichees.map((row) => (
                      <li
                        className="admin-row"
                        key={row.id}
                        data-done={demandeB2bATraiter(row) ? 'no' : 'yes'}
                      >
                        <div className="admin-row-main">
                          <p className="admin-row-head">
                            <span
                              className="admin-badge"
                              data-tone={demandeB2bATraiter(row) ? 'accent' : 'ok'}
                            >
                              {row.statut || '—'}
                            </span>
                            {row.reference && (
                              <span className="admin-kind">{row.reference}</span>
                            )}
                            <span className="admin-muted admin-num">
                              {jour(row.created_at, lang)}
                            </span>
                            {demandeB2bATraiter(row) && (
                              <span
                                className="admin-badge"
                                data-tone="warn"
                                title={t('ad.f.demandesOrderHint')}
                              >
                                <i className="ri-time-line" aria-hidden="true"></i>
                                {t('ad.f.demandesTodo')}
                              </span>
                            )}
                          </p>
                          <h3 className="admin-row-title">
                            {row.dest_name || row.organisme || '—'}
                          </h3>
                          <p className="admin-row-meta">
                            {row.quantite && (
                              <span>
                                <i className="ri-stack-line" aria-hidden="true"></i>
                                {row.quantite}
                              </span>
                            )}
                            {row.delai && (
                              <span>
                                <i className="ri-time-line" aria-hidden="true"></i>
                                {row.delai}
                              </span>
                            )}
                            {row.budget && (
                              <span>
                                <i className="ri-price-tag-3-line" aria-hidden="true"></i>
                                {row.budget}
                              </span>
                            )}
                          </p>
                        </div>
                        {/* Répondre d'ici, comme depuis l'onglet Demandes :
                            l'objet reprend la référence, le message cite ce
                            que l'expéditeur a écrit. Sans adresse, le bouton
                            reste éteint et le dit au survol. */}
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-row-mail"
                            title={row.email ? t('ad.f.replyHint') : t('adm.reply.noEmail')}
                            aria-label={`${t('ad.f.reply')} · ${
                              row.nom || row.email || row.reference || '—'
                            }`}
                            disabled={!row.email}
                            onClick={() => setReponse(row)}
                          >
                            <i className="ri-reply-line" aria-hidden="true"></i>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Le compteur de la semaine, posé sous la fiche : combien
                  d'exports du tableau ces sept derniers jours, et depuis
                  quand le dernier remonte. Il vient de la mémoire de
                  l'appareil, la même que la ligne d'archive de l'écran
                  « Paiements ». Il se clique : l'écran s'ouvre resserré sur
                  ce compte, pour y produire l'export qui manque. */}
              <button
                type="button"
                className="admin-fiche-week"
                data-state={semaineExport.count > 0 ? 'yes' : 'no'}
                title={t('ad.f.weekExportHint')}
                aria-label={`${t('ad.f.weekExportOpen')} · ${titre}`}
                onClick={() => onOpenPaiements(compteId, mailCompte || email)}
              >
                <i
                  className={
                    semaineExport.count > 0
                      ? 'ri-calendar-check-line'
                      : 'ri-calendar-line'
                  }
                  aria-hidden="true"
                ></i>
                <span>{t('ad.f.weekExport')}</span>
                <b>{nombre(semaineExport.count)}</b>
                <em>
                  {semaineExport.jours === null
                    ? t('ad.pay.weekNever')
                    : semaineExport.jours <= 0
                      ? t('ad.pay.weekToday')
                      : t('ad.pay.weekSince').replace(
                          '{n}',
                          String(semaineExport.jours),
                        )}
                </em>
                <i className="ri-arrow-right-up-line admin-fiche-week-go" aria-hidden="true"></i>
              </button>
            </>
          )}
        </div>
      </aside>

      {relance && mailCompte && (
        <AdminRelance
          to={mailCompte}
          subject={sujetRelance(contexteRelance())}
          body={corpsRelance(contexteRelance())}
          onClose={() => setRelance(false)}
        />
      )}

      {reponse && (
        <AdminDemandeReponse
          nom={reponse.nom}
          email={reponse.email}
          organisation={reponse.organisme}
          sujet={reponse.reference || ''}
          sujetLabel={
            reponse.reference
              ? `${t('ad.f.demandeSubject')} · ${reponse.reference}`
              : t('ad.f.demandeSubject')
          }
          message={reponse.message || ''}
          created_at={reponse.created_at}
          onClose={() => setReponse(null)}
        />
      )}
    </div>
  );
}