import { useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import {
  echeanceEnMots,
  jour,
  nombre,
  type AdminAbonnement,
} from './adminTypes';
import {
  TON_ETAT,
  lireEncaissement,
  synthesePaiements,
  triPaiements,
  type EtatEncaissement,
} from './adminPaiementsCore';
import {
  downloadArriveesPaiementsCsv,
  downloadComparaisonPaiements,
  downloadHistoriquePaiementsCsv,
  downloadOpposesPaiementsCsv,
  downloadPaiementsCsv,
  downloadPartiesPaiementsCsv,
  type VuePaiements,
} from './adminPaiementsCsv';
import {
  clearExportPaiements,
  exportDuJour,
  readExportPaiements,
  saveExportPaiements,
  semaineExportPaiements,
  type ExportPoint,
  type MemoireExport,
} from './adminPaiementsMemory';
import { localeFor } from '@/i18n/localize';
import './admin-paiements.css';

type Props = {
  rows: AdminAbonnement[];
  /** La fiche du compte : le même geste que sur le tableau des abonnés. */
  onOpenCompte: (compteId: string | null, email: string | null) => void;
  /** Le compte nommé par sa fiche : l'écran s'ouvre déjà resserré sur lui,
   *  et sur la vue que la fiche a demandée — « à régler » le plus souvent. */
  focus?: {
    compteId: string | null;
    email: string | null;
    at: number;
    vue?: VuePaiements;
    /** L'ordre demandé par la fiche : la pastille « encaissables » arrive
     *  déjà triée par montant, pour encaisser d'abord les plus rentables. */
    tri?: Tri;
    /** Les deux points de la comparaison, déjà choisis : la fiche du compte
     *  ouvre l'écran sur deux de ses exports de la semaine, sans avoir à les
     *  retrouver dans les sept. */
    cmp?: { from: string; to: string };
  } | null;
  /** Rend la file entière, sans quitter l'écran. */
  onClearFocus?: () => void;
};

type Vue = VuePaiements;

/** L'ordre de lecture de la file visible. */
export type Tri = 'etat' | 'montant';

/** Le montant d'une ligne, lu sans jamais rendre NaN. */
const montantDe = (row: AdminAbonnement) => {
  const valeur = Number(row.montant_mensuel ?? 0);
  return Number.isFinite(valeur) ? valeur : 0;
};

/** L'identité d'une ligne, telle que l'export la retient : c'est elle qui dit
 *  qu'une ligne est arrivée, ou qu'elle a quitté le tableau. */
const ligneKey = (row: AdminAbonnement) => String(row.id);

/**
 * L'écran « Paiements » : ce que les abonnements doivent rapporter, et ce qui
 * les empêche encore d'être encaissés.
 *
 * Il ne lit pas un état inventé : la même ligne que le tableau des abonnés —
 * offre, montant, échéance, moyen de paiement — et il en tire une conclusion
 * par abonnement. Les lignes qui ne sont pas encaissables passent devant, avec
 * leur raison écrite ; les autres restent disponibles derrière un jeton.
 */
export default function AdminPaiements({ rows, onOpenCompte, focus = null, onClearFocus }: Props) {
  const { t, lang } = useLang();
  /* La vue s'ouvre sur ce qui bloque : c'est la raison d'être de l'écran. */
  const [vue, setVue] = useState<Vue>('regler');
  /* Le motif isole une seule raison — « aucun moyen de paiement », « échéance
     dépassée »… Il l'emporte sur la vue, parce qu'une raison est toujours plus
     précise qu'un ensemble. Un second clic sur le même motif le retire. */
  const [motif, setMotif] = useState<EtatEncaissement | 'all'>('all');
  /* L'ordre de lecture : le blocage d'abord, ou le montant le plus haut
     d'abord quand on vient encaisser les abonnements les plus rentables. */
  const [tri, setTri] = useState<Tri>('etat');
  /* La différence d'un export : la file est resserrée sur les lignes qui sont
     arrivées depuis ce clic-là, à vue et motif égaux. `ids` vient de la
     mémoire de l'export, jamais d'une estimation. */
  const [ecart, setEcart] = useState<{ at: string; ids: Set<string> } | null>(null);
  /* L'extrait d'arrivées qui vient de partir : le bouton du bandeau confirme
     le geste, puis revient à son libellé. */
  const [ecartExporte, setEcartExporte] = useState(false);
  const timerEcartExport = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timerEcartExport.current) window.clearTimeout(timerEcartExport.current);
    },
    [],
  );

  /* La comparaison de deux exports de l'historique : un point de départ, un
     point d'arrivée, et l'écart de montant et de lignes entre les deux. Les
     deux instants sont retenus, pas les points eux-mêmes, pour que la
     comparaison survive à l'arrivée d'un nouvel export dans la liste. */
  const [cmpOpen, setCmpOpen] = useState(false);
  const [cmpFrom, setCmpFrom] = useState('');
  const [cmpTo, setCmpTo] = useState('');
  /* La comparaison qui vient de partir en fichier : le bouton confirme le
     geste, puis revient à son libellé. */
  const [cmpExporte, setCmpExporte] = useState(false);
  /* Le total apporté par les arrivées se clique : la comparaison déplie la
     liste de ces lignes avec leur montant, pour relire à l'écran ce que le
     fichier emporte. */
  const [cmpArrivalsOpen, setCmpArrivalsOpen] = useState(false);
  /* Le second clic sur ce même jeton resserre la file sur les lignes qui sont
     arrivées entre les deux points : le tableau ne garde plus qu'elles, à la
     vue et au motif courants. La sélection est figée au clic, pour qu'elle ne
     change pas sous le curseur quand un point de la comparaison bouge. */
  const [cmpArrivalsNarrow, setCmpArrivalsNarrow] = useState<Set<string> | null>(null);
  /* Le second resserrement, posé par le chiffre des lignes parties : la file
     ne garde alors que celles encore au tableau. Les deux resserrements ne
     se cumulent pas — l'un efface l'autre, sinon le tableau resterait vide
     sans qu'on sache lequel le tient. */
  const [cmpPartiesNarrow, setCmpPartiesNarrow] = useState<Set<string> | null>(null);
  /* L'extrait des lignes parties qui vient de partir : le bouton posé sur le
     bandeau de resserrement confirme le geste, puis revient à son libellé. */
  const [partiesExporte, setPartiesExporte] = useState(false);
  const timerPartiesExport = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timerPartiesExport.current) window.clearTimeout(timerPartiesExport.current);
    },
    [],
  );
  const timerCmpExport = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timerCmpExport.current) window.clearTimeout(timerCmpExport.current);
    },
    [],
  );
  /* Le jeton de l'historique : ne garder que les exports dont le décompte a
     bougé depuis, pour retrouver la ligne qui a bougé sans balayer les sept. */
  const [bougesOnly, setBougesOnly] = useState(false);
  /* Le même jeton, mais sur le montant : les exports dont le fichier ne pèse
     plus le même poids aujourd'hui, à leur vue et à leur motif. */
  const [montantsOnly, setMontantsOnly] = useState(false);
  /* Et le troisième, sur les deux écarts à la fois : ne garder que les exports
     dont le décompte et le montant partent en sens contraires. */
  const [opposesOnly, setOpposesOnly] = useState(false);
  /* Le quatrième jeton, sur le sens du montant : ne garder que les exports
     dont le montant a baissé depuis — la file pèse aujourd'hui moins que le
     fichier, à sa vue et à son motif. Un export sans montant retenu n'entre
     dans aucune direction : il ne se compare pas. */
  const [baissesOnly, setBaissesOnly] = useState(false);
  /* L'extrait des exports aux sens opposés qui vient de partir : le bouton du
     bandeau confirme le geste, puis revient à son libellé. */
  const [opposesExporte, setOpposesExporte] = useState(false);
  const timerOpposesExport = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timerOpposesExport.current) window.clearTimeout(timerOpposesExport.current);
    },
    [],
  );
  /* L'historique filtré qui vient de partir : le bouton confirme le geste,
     puis revient à son libellé. */
  const [histExporte, setHistExporte] = useState(false);
  const timerHistExport = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timerHistExport.current) window.clearTimeout(timerHistExport.current);
    },
    [],
  );

  const file = useMemo(() => triPaiements(rows), [rows]);

  /* La fiche d'un compte peut ouvrir cet écran déjà resserré sur lui : les
     lignes, les cinq chiffres et l'export lisent alors ce seul compte, pour
     que rien ici ne parle d'un abonnement qu'on n'est pas venu voir. */
  const duCompte = useMemo(() => {
    if (!focus) return file;
    const mail = (focus.email || '').trim().toLowerCase();
    const id = focus.compteId || '';
    return file.filter(
      (row) =>
        (id && row.artisan_id === id) ||
        (mail && (row.email || '').trim().toLowerCase() === mail),
    );
  }, [file, focus]);

  const synthese = useMemo(() => synthesePaiements(duCompte), [duCompte]);

  const visibles = useMemo(() => {
    let base = duCompte.filter((row) => {
      const lecture = lireEncaissement(row);
      if (motif !== 'all') return lecture.etat === motif;
      if (vue === 'all') return true;
      return vue === 'prets' ? lecture.encaissable : !lecture.encaissable;
    });
    /* La différence d'un export ne garde que les lignes qui n'y étaient pas. */
    if (ecart) base = base.filter((row) => !ecart.ids.has(ligneKey(row)));
    /* Puis le resserrement du jeton des arrivées : la file ne garde que les
       lignes qui sont arrivées entre les deux points comparés. */
    if (cmpArrivalsNarrow) {
      base = base.filter((row) => cmpArrivalsNarrow.has(ligneKey(row)));
    }
    /* Et celui des lignes parties : la file ne garde que celles qui ont
       quitté les deux points et sont encore au tableau. */
    if (cmpPartiesNarrow) {
      base = base.filter((row) => cmpPartiesNarrow.has(ligneKey(row)));
    }
    if (tri !== 'montant') return base;
    /* Le montant le plus haut devant, à égalité la plus ancienne échéance,
       pour que deux abonnements du même prix se départagent sur l'urgence. */
    return [...base].sort((a, b) => {
      const ecartMontant = montantDe(b) - montantDe(a);
      if (ecartMontant !== 0) return ecartMontant;
      const dateA = a.date_echeance ? new Date(a.date_echeance).getTime() : Number.POSITIVE_INFINITY;
      const dateB = b.date_echeance ? new Date(b.date_echeance).getTime() : Number.POSITIVE_INFINITY;
      return (Number.isFinite(dateA) ? dateA : Number.POSITIVE_INFINITY)
        - (Number.isFinite(dateB) ? dateB : Number.POSITIVE_INFINITY);
    });
  }, [duCompte, motif, vue, tri, ecart, cmpArrivalsNarrow, cmpPartiesNarrow]);

  /* Ce que la file lue représente : la somme des montants des lignes
     affichées, dans leur ordre de lecture. Le tri ne change pas ce total —
     il dit seulement combien d'argent cette file-là porte, pour savoir ce
     qu'on va encaisser avant de commencer. */
  const montantVisible = useMemo(
    () => visibles.reduce((sum, row) => sum + montantDe(row), 0),
    [visibles],
  );

  /* La part de cette même file qui peut déjà être prélevée : le second
     montant du jeton de total, pour lire les deux côtés d'un coup d'œil —
     ce que la file porte, et ce qui en est déjà encaissable. */
  const montantEncaisseVisible = useMemo(
    () =>
      visibles.reduce(
        (sum, row) => (lireEncaissement(row).encaissable ? sum + montantDe(row) : sum),
        0,
      ),
    [visibles],
  );

  /* Ce que la file laisse en suspens : le troisième chiffre du jeton, pour
     lire en une ligne ce qu'elle encaisse, ce qui est déjà encaissable et ce
     qui reste à régler. Un abonnement clos n'y entre pas — il n'a plus rien
     à percevoir —, comme dans la synthèse du haut. */
  const montantRestantVisible = useMemo(
    () =>
      visibles.reduce((sum, row) => {
        const lecture = lireEncaissement(row);
        if (lecture.encaissable || lecture.etat === 'ferme') return sum;
        return sum + montantDe(row);
      }, 0),
    [visibles],
  );

  /* La sélection qu'un export a emportée, appliquée à la file du jour : la
     même règle que les lignes affichées, et non une seconde lecture. Sert à
     mesurer ce que le tableau porte, et combien de lignes il compte. */
  const gardeLigne = (
    row: AdminAbonnement,
    onMotif: EtatEncaissement | 'all',
    onVue: Vue,
  ) => {
    const lecture = lireEncaissement(row);
    if (onMotif !== 'all') return lecture.etat === onMotif;
    if (onVue === 'all') return true;
    return onVue === 'prets' ? lecture.encaissable : !lecture.encaissable;
  };
  const lignesPour = (onMotif: EtatEncaissement | 'all', onVue: Vue) =>
    duCompte.filter((row) => gardeLigne(row, onMotif, onVue));
  const montantPour = (onMotif: EtatEncaissement | 'all', onVue: Vue) =>
    lignesPour(onMotif, onVue).reduce((sum, row) => sum + montantDe(row), 0);

  /* Poser un motif rend la vue sans objet ; retirer le motif rend la file
     entière plutôt qu'une vue oubliée, pour que le clic ne laisse jamais
     l'écran dans un état qu'on n'a pas demandé. */
  const poserVue = (valeur: Vue) => {
    setVue(valeur);
    setMotif('all');
    setEcart(null);
    setCmpArrivalsNarrow(null);
    setCmpPartiesNarrow(null);
  };
  const basculerMotif = (etat: EtatEncaissement) => {
    setMotif((courant) => (courant === etat ? 'all' : etat));
    setEcart(null);
    setCmpArrivalsNarrow(null);
    setCmpPartiesNarrow(null);
  };

  /* L'archive de ce jour : relue au premier rendu sur la mémoire de
     l'appareil, puis mise à jour à chaque export. Elle dit, en tête de
     l'écran, si le fichier du jour existe déjà. */
  const [dernierExport, setDernierExport] = useState<MemoireExport | null>(() =>
    readExportPaiements(),
  );

  /* Les points de l'historique, du plus ancien au plus récent : un select se
     lit dans le sens du temps, là où la liste d'archive commence par le plus
     récent. */
  const pointsArchive = useMemo(
    () => [...(dernierExport?.historique ?? [])].reverse(),
    [dernierExport],
  );

  /* Les deux points demandés par la fiche, s'ils sont encore dans les sept
     archives : un point qui aurait quitté l'historique laisse la comparaison
     fermée plutôt que d'en inventer un. */
  const cmpCible = useMemo(() => {
    const cible = focus?.cmp;
    if (!cible || cible.from === cible.to) return null;
    const dispo = pointsArchive.filter(
      (point) => point.at === cible.from || point.at === cible.to,
    );
    if (dispo.length < 2) return null;
    return { from: cible.from, to: cible.to };
  }, [focus?.cmp, pointsArchive]);

  /* Le bouton d'export répond en place : le fichier part, et le geste ne
     reste pas muet au-dessus d'un tableau qui vient de changer de contenu. */
  const [exporte, setExporte] = useState(false);
  const timerExport = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timerExport.current) window.clearTimeout(timerExport.current);
    },
    [],
  );
  const exporter = () => {
    downloadPaiementsCsv({ rows: visibles, motif, vue, lang, t });
    setDernierExport(
      saveExportPaiements({
        motif,
        vue,
        rows: visibles.length,
        /* Ce que le fichier emporte, pour que l'archive dise aussi le montant
           et pas seulement le nombre de lignes. */
        montant: montantVisible,
        /* Les lignes emportées, par leur identifiant : la différence de
           demain pourra être nommée, pas seulement comptée. */
        ids: visibles.map(ligneKey),
      }),
    );
    setEfface(false);
    setDemandeEffacement(false);
    setExporte(true);
    if (timerExport.current) window.clearTimeout(timerExport.current);
    timerExport.current = window.setTimeout(() => setExporte(false), 2600);
  };

  /* L'extrait des lignes arrivées part directement : le bandeau de
     différence emporte ce qu'il montre, sans repasser par la file entière ni
     réécrire l'archive — c'est une pièce jointe, pas un nouvel export du
     tableau complet. */
  const exporterEcart = () => {
    downloadArriveesPaiementsCsv({
      rows: visibles,
      motif,
      vue,
      lang,
      t,
      ecartAt: ecart?.at,
    });
    setEcartExporte(true);
    if (timerEcartExport.current) window.clearTimeout(timerEcartExport.current);
    timerEcartExport.current = window.setTimeout(() => setEcartExporte(false), 2600);
  };

  /* Effacer la mémoire d'export : deux gestes, parce qu'un envoi erroné se
     corrige mais qu'un effacement accidentel se remarque trop tard. Le
     premier clic demande confirmation, le second repart d'une ligne vierge. */
  const [demandeEffacement, setDemandeEffacement] = useState(false);
  const [efface, setEfface] = useState(false);
  const timerEfface = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timerEfface.current) window.clearTimeout(timerEfface.current);
      if (timerExport.current) window.clearTimeout(timerExport.current);
    },
    [],
  );
  const effacerMemoire = () => {
    if (!demandeEffacement) {
      setDemandeEffacement(true);
      return;
    }
    clearExportPaiements();
    setDernierExport(null);
    setDemandeEffacement(false);
    setEfface(true);
    if (timerEfface.current) window.clearTimeout(timerEfface.current);
    timerEfface.current = window.setTimeout(() => setEfface(false), 3200);
  };

  /* Un compte nommé par sa fiche arrive avec tous ses abonnements : la vue
     s'ouvre alors sur la file entière de ce compte, et le motif repart de
     zéro. L'écran ne cache pas un abonnement qu'on venait précisément lire. */
  const focusKey = focus?.at ?? 0;
  const focusVue = focus?.vue ?? 'all';
  const focusTri = focus?.tri ?? 'etat';
  useEffect(() => {
    if (!focusKey) return;
    setVue(focusVue);
    setMotif('all');
    setTri(focusTri);
    setEcart(null);
    setCmpArrivalsNarrow(null);
    setCmpPartiesNarrow(null);
  }, [focusKey, focusVue, focusTri]);

  /* La comparaison pré-choisie par la fiche : deux exports de la semaine pour
     ce compte. Les deux points sont posés dès l'ouverture ; l'historique
     reste lisible dessous, et les deux champs se changent comme avant. */
  useEffect(() => {
    if (!cmpCible) return;
    setCmpFrom(cmpCible.from);
    setCmpTo(cmpCible.to);
    setCmpOpen(true);
  }, [cmpCible]);

  /* L'archive du jour, dite en clair : la date et l'heure, ce qu'elle
     contenait, et une pastille quand elle a été produite aujourd'hui. */
  const memoireDate = useMemo(() => {
    if (!dernierExport) return '';
    const date = new Date(dernierExport.at);
    if (!Number.isFinite(date.getTime())) return '';
    const heure = new Intl.DateTimeFormat(localeFor(lang), { timeStyle: 'short' }).format(date);
    return `${jour(dernierExport.at, lang)}, ${heure}`;
  }, [dernierExport, lang]);
  const memoireQuoi = useMemo(() => {
    if (!dernierExport) return '';
    if (dernierExport.motif !== 'all') return t(`ad.pay.why.${dernierExport.motif}`);
    return t(
      dernierExport.vue === 'regler'
        ? 'ad.pay.filterRegler'
        : dernierExport.vue === 'prets'
          ? 'ad.pay.filterPrets'
          : 'ad.pay.filterAll',
    );
  }, [dernierExport, t]);
  const archiveAujourdhui = exportDuJour(dernierExport?.at);

  /* L'écart entre ce que l'export emportait et ce que la file compte
     aujourd'hui, à vue et motif égaux : il dit d'un coup d'œil si le tableau
     a bougé depuis. Rien ne s'affiche quand la mémoire ne portait pas de
     montant — un écart ne s'invente pas. */
  const ecartArchive = useMemo(() => {
    if (!dernierExport || !(dernierExport.montant > 0)) return null;
    const aujourdhui = montantPour(dernierExport.motif, dernierExport.vue);
    return Math.round(aujourdhui - dernierExport.montant);
  }, [dernierExport, duCompte]);

  /* Ce que le tableau compte aujourd'hui, à la vue et au motif de l'archive,
     comparé au nombre de lignes que le fichier emportait : le second écart,
     à côté du montant. Il se lit même quand la mémoire ne gardait pas de
     montant, parce qu'un décompte se compare toujours. */
  const ecartLignes = useMemo(() => {
    if (!dernierExport) return null;
    const aujourdhui = lignesPour(dernierExport.motif, dernierExport.vue).length;
    return aujourdhui - dernierExport.rows;
  }, [dernierExport, duCompte]);

  /* La différence ouverte : combien de lignes ont quitté le tableau depuis
     l'export. Les arrivées se lisent dans le tableau lui-même ; les départs
     ne peuvent que se compter — et ne s'inventent pas. */
  const ecartParties = useMemo(() => {
    if (!ecart) return 0;
    const actuels = new Set(lignesPour(motif, vue).map(ligneKey));
    return [...ecart.ids].filter((id) => !actuels.has(id)).length;
  }, [ecart, duCompte, motif, vue]);

  /* La date d'un point d'historique, écrite comme celle de l'archive. */
  const datePoint = (iso: string) => {
    const date = new Date(iso);
    if (!Number.isFinite(date.getTime())) return '—';
    const heure = new Intl.DateTimeFormat(localeFor(lang), { timeStyle: 'short' }).format(date);
    return `${jour(iso, lang)}, ${heure}`;
  };

  /* Rejouer un export depuis son montant, dans l'archive : l'écran reprend la
     vue et le motif de ce fichier-là, pour le refaire à l'identique. Une file
     resserrée sur un compte est d'abord rendue entière — sinon l'export
     rejoué ne serait pas celui qu'on relit. */
  const [rejoue, setRejoue] = useState(false);
  /* La ligne d'historique qui vient d'être rejouée, pour qu'elle se
     reconnaisse dans la liste et ne se confonde pas avec une autre. */
  const [rejoueAt, setRejoueAt] = useState<string | null>(null);
  const timerRejoue = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timerRejoue.current) window.clearTimeout(timerRejoue.current);
    },
    [],
  );
  /* Ouvrir la différence d'un export : la file reprend sa vue et son motif,
     puis se resserre sur les lignes qui n'y étaient pas. Une file resserrée
     sur un compte est d'abord rendue entière, sinon la différence serait
     celle d'un autre tableau. */
  const ouvrirEcart = (point: ExportPoint) => {
    if (!Array.isArray(point.ids)) return;
    if (focus && onClearFocus) onClearFocus();
    setVue(point.vue);
    setMotif(point.motif);
    setEcart({ at: point.at, ids: new Set(point.ids) });
  };

  const rejouerExport = (point: ExportPoint) => {
    if (focus && onClearFocus) onClearFocus();
    setVue(point.vue);
    setMotif(point.motif);
    setRejoue(true);
    setRejoueAt(point.at);
    if (timerRejoue.current) window.clearTimeout(timerRejoue.current);
    timerRejoue.current = window.setTimeout(() => {
      setRejoue(false);
      setRejoueAt(null);
    }, 2800);
  };

  /* Le compteur de la semaine : combien d'exports sur les sept derniers
     jours, et depuis combien de jours remonte le dernier. Il repère un
     tableau qu'on n'a pas réédité depuis plusieurs jours, là où la ligne
     d'archive ne dit que la date. */
  const semaine = useMemo(() => semaineExportPaiements(dernierExport), [dernierExport]);

  /* La moyenne des montants emportés par les exports rangés, et la tendance
     entre le plus récent et le plus ancien : les sept exports se lisent
     comme une suite, pas seulement ligne par ligne. Seuls les exports qui
     portaient un montant entrent dans la moyenne — un chiffre ne s'invente
     pas sur une mémoire qui ne l'avait pas retenu. */
  const moyenne = useMemo(() => {
    const points = dernierExport?.historique ?? [];
    const chiffres = points.filter((point) => point.montant > 0);
    if (chiffres.length === 0) return null;
    const somme = chiffres.reduce((total, point) => total + point.montant, 0);
    const tendance =
      chiffres.length >= 2 ? chiffres[0].montant - chiffres[chiffres.length - 1].montant : null;
    return { valeur: Math.round(somme / chiffres.length), n: chiffres.length, tendance };
  }, [dernierExport]);

  /* L'export le plus lourd de la semaine, lu sur les mêmes montants que la
     moyenne : il se marque dans la liste et se rappelle sous elle, pour que
     le pic se lise à côté de la moyenne au lieu de la contredire. Un seul
     export chiffré ne fait pas un pic. */
  const pic = useMemo(() => {
    const chiffres = (dernierExport?.historique ?? []).filter((point) => point.montant > 0);
    if (chiffres.length < 2) return null;
    return chiffres.reduce((best, point) =>
      point.montant > best.montant ? point : best,
    );
  }, [dernierExport]);
  const semaineEtat = !dernierExport ? 'none' : semaine.count > 0 ? 'yes' : 'no';
  const semaineDepuis = !dernierExport
    ? t('ad.pay.weekNever')
    : (semaine.jours ?? 0) <= 0
      ? t('ad.pay.weekToday')
      : t('ad.pay.weekSince').replace('{n}', String(semaine.jours ?? 0));

  /* Ce que le tableau compte aujourd'hui, à la vue et au motif d'un export de
     l'historique, comparé aux lignes que ce fichier emportait : la ligne qui
     a bougé se repère parmi les sept, sans ouvrir chaque archive. */
  const bougePoint = (point: ExportPoint) =>
    lignesPour(point.motif, point.vue).length - point.rows;

  /* Le même écart, mais sur le montant : ce que la file pèse aujourd'hui à la
     vue et au motif de cet export, comparé à ce que le fichier emportait. Il
     ne s'affiche que sur un export chiffré — un montant absent ne se compare
     pas, et un écart ne s'invente pas. */
  const bougeMontant = (point: ExportPoint) => {
    if (!(point.montant > 0)) return 0;
    return Math.round(montantPour(point.motif, point.vue) - point.montant);
  };

  /* Les exports dont le décompte et le montant partent en sens opposés : des
     lignes ont quitté le tableau alors que le montant a monté, ou l'inverse.
     Deux écarts qui se contredisent méritent d'être lus ensemble, parce qu'un
     simple regard sur l'un d'eux donnerait une conclusion fausse. */
  const sensOpposes = (point: ExportPoint) => {
    const lignes = bougePoint(point);
    const montant = bougeMontant(point);
    if (lignes === 0 || montant === 0) return false;
    return lignes > 0 !== montant > 0;
  };

  /* Les exports de l'historique qui ne sont plus au même décompte, et la
     liste que le jeton laisse lire : le fichier entier, ou seulement ceux
     qui ont bougé. */
  const pointsHistorique = dernierExport?.historique ?? [];
  const nbBouges = pointsHistorique.filter((point) => bougePoint(point) !== 0).length;
  /* Les exports dont le montant a bougé, comptés sur la même règle : un export
     sans montant retenu ne bouge pas, il ne se compare pas. */
  const nbMontantsBouges = pointsHistorique.filter((point) => bougeMontant(point) !== 0).length;
  /* Ceux dont les deux écarts se contredisent, comptés sur la même règle que
     le repère de chaque ligne : le jeton et la liste ne peuvent pas se
     contredire. */
  const nbOpposes = pointsHistorique.filter((point) => sensOpposes(point)).length;
  /* Ceux dont le montant a baissé, comptés sur la même règle que le filtre :
     un écart négatif, jamais un export sans montant retenu. */
  const nbBaisses = pointsHistorique.filter((point) => bougeMontant(point) < 0).length;
  const pointsAffiches = pointsHistorique
    .filter((point) => (bougesOnly ? bougePoint(point) !== 0 : true))
    .filter((point) => (montantsOnly ? bougeMontant(point) !== 0 : true))
    .filter((point) => (opposesOnly ? sensOpposes(point) : true))
    .filter((point) => (baissesOnly ? bougeMontant(point) < 0 : true));
  /* Les jetons posés sur l'historique, comptés une fois : le rappel du nombre
     d'exports visibles ne s'affiche que s'il y a quelque chose à resserrer. */
  const jetonsHistorique = [bougesOnly, montantsOnly, opposesOnly, baissesOnly].filter(
    Boolean,
  ).length;

  /* Le coût total de l'historique filtré : la somme de ce que les exports
     retenus pesaient au moment du clic. Un export sans montant retenu
     n'entre pas dans la somme — il ne s'additionne pas —, et la note dit sur
     combien d'exports chiffrés elle porte. */
  const coutHistorique = (() => {
    const chiffres = pointsAffiches.filter((point) => point.montant > 0);
    if (chiffres.length === 0) return null;
    const somme = chiffres.reduce((total, point) => total + point.montant, 0);
    return { somme: Math.round(somme), n: chiffres.length };
  })();

  /* La baisse cumulée des exports retenus : la somme de ce que la file a
     perdu face à leurs fichiers. Elle se lit sur les seuls écarts négatifs —
     un export qui a monté n'allège pas la baisse, il la contredit. */
  const baisseCumulee = pointsAffiches.reduce((total, point) => {
    const ecart = bougeMontant(point);
    return ecart < 0 ? total + Math.abs(ecart) : total;
  }, 0);

  /* L'extrait des exports aux sens opposés part directement : il emporte les
     seuls exports où les deux écarts se contredisent, avec leurs deux
     chiffres, sans repasser par la liste entière. */
  const exporterOpposes = () => {
    downloadOpposesPaiementsCsv({
      points: pointsHistorique
        .filter((point) => sensOpposes(point))
        .map((point) => ({
          at: point.at,
          motif: point.motif,
          vue: point.vue,
          rows: point.rows,
          montant: point.montant,
          rowsNow: lignesPour(point.motif, point.vue).length,
          montantNow: Math.round(montantPour(point.motif, point.vue)),
        })),
      lang,
      t,
    });
    setOpposesExporte(true);
    if (timerOpposesExport.current) window.clearTimeout(timerOpposesExport.current);
    timerOpposesExport.current = window.setTimeout(() => setOpposesExporte(false), 2600);
  };

  /* L'historique tel que les jetons le laissent lire, emporté en fichier :
     les seuls exports retenus, dans l'ordre où ils s'affichent — du plus
     récent au plus ancien —, avec leurs deux écarts. Le nom des jetons posés
     entre dans la feuille, pour qu'une archive resserrée se relise seule. */
  const exporterHistorique = () => {
    downloadHistoriquePaiementsCsv({
      points: pointsAffiches.map((point) => ({
        at: point.at,
        motif: point.motif,
        vue: point.vue,
        rows: point.rows,
        montant: point.montant,
        rowsNow: lignesPour(point.motif, point.vue).length,
        montantNow: Math.round(montantPour(point.motif, point.vue)),
      })),
      filters: [
        bougesOnly ? t('ad.pay.histMovedOnly') : '',
        montantsOnly ? t('ad.pay.histAmountMovedOnly') : '',
        opposesOnly ? t('ad.pay.histOppositeOnly') : '',
        baissesOnly ? t('ad.pay.histBaisseOnly') : '',
      ].filter(Boolean),
      /* Le coût total que l'écran affiche sous le bouton : la feuille le
         reprend en dernière ligne, au même chiffre. */
      cost: coutHistorique,
      /* Et la baisse cumulée, posée à côté : le chiffre du jeton des montants
         en baisse, pour que la feuille dise les deux mesures de l'écran. */
      baisse: baisseCumulee > 0 ? Math.round(baisseCumulee) : null,
      lang,
      t,
    });
    setHistExporte(true);
    if (timerHistExport.current) window.clearTimeout(timerHistExport.current);
    timerHistExport.current = window.setTimeout(() => setHistExporte(false), 2600);
  };

  /* La comparaison demandée : deux instants de l'historique, et l'écart de
     montant et de lignes entre eux. Rien n'est recalculé sur la file du jour
     — deux archives se comparent entre elles, pas avec le présent. Un montant
     absent d'un des deux points laisse l'écart de montant nul : il ne
     s'invente pas, alors que le décompte de lignes, lui, se compare toujours. */
  const cmp = useMemo(() => {
    if (!cmpOpen || pointsArchive.length < 2) return null;
    const from = pointsArchive.find((point) => point.at === cmpFrom) ?? pointsArchive[0];
    const to =
      pointsArchive.find((point) => point.at === cmpTo)
      ?? pointsArchive[pointsArchive.length - 1];
    if (from.at === to.at) return null;
    const montant = from.montant > 0 && to.montant > 0 ? to.montant - from.montant : null;
    const lignes = to.rows - from.rows;
    /* Quand les deux mémoires retenaient leurs lignes, la différence se nomme :
       celles qui sont arrivées entre les deux, et celles qui ont quitté. */
    const nomme = Array.isArray(from.ids) && Array.isArray(to.ids);
    let arrivees: number | null = null;
    let parties: number | null = null;
    if (nomme) {
      const depart = new Set(from.ids as string[]);
      const arrivee = new Set(to.ids as string[]);
      arrivees = [...arrivee].filter((id) => !depart.has(id)).length;
      parties = [...depart].filter((id) => !arrivee.has(id)).length;
    }
    return { from, to, montant, lignes, arrivees, parties };
  }, [cmpOpen, pointsArchive, cmpFrom, cmpTo]);

  /* Les lignes arrivées entre les deux points, retrouvées dans le tableau du
     jour par leur identifiant : la troisième feuille les nomme une à une. Une
     arrivée qui a déjà quitté le tableau ne s'y trouve plus — elle ne se
     compte, et le fichier le dit. */
  const arriveesCmp = useMemo(() => {
    const out: AdminAbonnement[] = [];
    if (!cmp) return out;
    const departIds = cmp.from.ids;
    const arriveeIds = cmp.to.ids;
    if (!Array.isArray(departIds) || !Array.isArray(arriveeIds)) return out;
    const depart = new Set(departIds);
    const parId = new Map(file.map((row) => [ligneKey(row), row]));
    const vues = new Set<string>();
    arriveeIds.forEach((id) => {
      if (depart.has(id) || vues.has(id)) return;
      vues.add(id);
      const row = parId.get(id);
      if (row) out.push(row);
    });
    return out.sort((a, b) => (a.entreprise || '').localeCompare(b.entreprise || ''));
  }, [cmp, file]);

  /* Les lignes parties entre les deux points, retrouvées dans le tableau du
     jour par leur identifiant : la quatrième feuille du classeur les nomme
     quand elle le peut. Une ligne qui a déjà quitté le tableau ne se nomme
     plus — elle se compte seulement, et le fichier le dit. */
  const partiesCmp = useMemo(() => {
    const out: AdminAbonnement[] = [];
    if (!cmp) return out;
    const departIds = cmp.from.ids;
    const arriveeIds = cmp.to.ids;
    if (!Array.isArray(departIds) || !Array.isArray(arriveeIds)) return out;
    const arrivee = new Set(arriveeIds);
    const parId = new Map(file.map((row) => [ligneKey(row), row]));
    const vues = new Set<string>();
    departIds.forEach((id) => {
      if (arrivee.has(id) || vues.has(id)) return;
      vues.add(id);
      const row = parId.get(id);
      if (row) out.push(row);
    });
    return out.sort((a, b) => (a.entreprise || '').localeCompare(b.entreprise || ''));
  }, [cmp, file]);

  /* Ce que l'ensemble des arrivées a apporté, lu sur les lignes retrouvées :
     le jeton du bandeau de différence le dit avant d'ouvrir le fichier. */
  const apportArrivees = useMemo(
    () =>
      arriveesCmp.reduce((sum, row) => {
        const valeur = Number(row.montant_mensuel ?? 0);
        return Number.isFinite(valeur) && valeur > 0 ? sum + valeur : sum;
      }, 0),
    [arriveesCmp],
  );

  /* Les lignes parties encore au tableau, prêtes à servir de filtre : le
     jeton du chiffre des parties les pose d'un clic. */
  const partiesNarrowSet = useMemo(
    () => new Set(partiesCmp.map(ligneKey)),
    [partiesCmp],
  );

  /* L'extrait des lignes parties part directement du bandeau de resserrement :
     il emporte exactement ce que le bandeau laisse lire, sans repasser par la
     file entière ni réécrire l'archive — une pièce jointe. */
  const exporterParties = () => {
    downloadPartiesPaiementsCsv({ rows: visibles, motif, vue, lang, t });
    setPartiesExporte(true);
    if (timerPartiesExport.current) window.clearTimeout(timerPartiesExport.current);
    timerPartiesExport.current = window.setTimeout(() => setPartiesExporte(false), 2600);
  };

  /* Le jeton des parties se clique une fois pour resserrer la file sur ces
     lignes-là, une seconde pour la rendre entière. Il ne se cumule jamais
     avec le resserrement des arrivées : la file ne peut pas être tenue par
     deux filtres qu'on ne verrait plus. */
  const basculerParties = () => {
    if (cmpPartiesNarrow) {
      setCmpPartiesNarrow(null);
      return;
    }
    if (partiesNarrowSet.size === 0) return;
    setCmpArrivalsOpen(false);
    setCmpArrivalsNarrow(null);
    setCmpPartiesNarrow(partiesNarrowSet);
  };

  /* Ouvrir la comparaison sur les deux bouts : le plus ancien au départ, le
     plus récent à l'arrivée — la lecture la plus large, à resserrer ensuite. */
  const ouvrirComparaison = () => {
    if (pointsArchive.length < 2) return;
    setCmpFrom((courant) => courant || pointsArchive[0].at);
    setCmpTo((courant) => courant || pointsArchive[pointsArchive.length - 1].at);
    setCmpArrivalsOpen(false);
    setCmpArrivalsNarrow(null);
    setCmpPartiesNarrow(null);
    setCmpOpen(true);
  };

  /* Le jeton des arrivées se lit en trois temps : replié, il déplie les lignes
     et leur montant ; déplié, un second clic resserre la file du tableau sur
     ces seules lignes ; resserré, un troisième clic rend la file et referme la
     liste. Le geste ne laisse jamais la file dans un état qu'on n'a pas nommé. */
  const basculerArrivees = () => {
    if (cmpArrivalsNarrow) {
      setCmpArrivalsNarrow(null);
    setCmpPartiesNarrow(null);
      setCmpArrivalsOpen(false);
      return;
    }
    if (cmpArrivalsOpen) {
      setCmpPartiesNarrow(null);
      setCmpArrivalsNarrow(new Set(arriveesCmp.map(ligneKey)));
      return;
    }
    setCmpArrivalsOpen(true);
  };

  /* La comparaison part en fichier : les deux points côte à côte avec leur
     montant et leur décompte, puis l'écart de montant et de lignes entre eux.
     Rien n'est recalculé sur la file du jour — deux archives se comparent
     entre elles. */
  const exporterComparaison = (comparaison: {
    from: ExportPoint;
    to: ExportPoint;
    montant: number | null;
    lignes: number;
    arrivees: number | null;
    parties: number | null;
  }) => {
    downloadComparaisonPaiements({
      from: comparaison.from,
      to: comparaison.to,
      montant: comparaison.montant,
      lignes: comparaison.lignes,
      arrivees: comparaison.arrivees,
      parties: comparaison.parties,
      /* Les lignes arrivées, quand les deux mémoires retenaient leurs
         identifiants : la troisième feuille les nomme. */
      arriveesRows: arriveesCmp,
      /* Les lignes parties, nommées quand elles sont encore au tableau : la
         quatrième feuille les liste au lieu de les compter seulement. */
      partiesRows: partiesCmp,
      lang,
      t,
    });
    setCmpExporte(true);
    if (timerCmpExport.current) window.clearTimeout(timerCmpExport.current);
    timerCmpExport.current = window.setTimeout(() => setCmpExporte(false), 2600);
  };

  return (
    <>
      <div className="admin-stats">
        <div className="admin-stat">
          <b>{nombre(synthese.total)}</b>
          <span>{t('ad.pay.total')}</span>
        </div>
        <div className="admin-stat" data-tone="ok">
          <b>{nombre(synthese.prets)}</b>
          <span>{t('ad.pay.prets')}</span>
        </div>
        <div className="admin-stat" data-tone="accent">
          <b>{nombre(synthese.aRegler)}</b>
          <span>{t('ad.pay.regler')}</span>
        </div>
        <div className="admin-stat" data-tone="ok">
          <b>{nombre(Math.round(synthese.montantPret))}</b>
          <span>{t('ad.pay.montantPret')}</span>
        </div>
        <div className="admin-stat" data-tone="soft">
          <b>{nombre(Math.round(synthese.montantRegler))}</b>
          <span>{t('ad.pay.montantRegler')}</span>
        </div>
      </div>

      <section className="admin-card">
        <div className="admin-card-head">
          <div>
            <p className="admin-stamp">{t('ad.pay.stamp')}</p>
            <p className="admin-sub">{t('ad.pay.sub')}</p>
          </div>
          {/* Le tableau part tel qu'il se lit : la file visible, le motif
              posé dessus, et un nom de fichier qui le rappelle. */}
          {visibles.length > 0 && (
            <button
              type="button"
              className="admin-btn"
              data-tone={exporte ? 'ok' : undefined}
              title={t('ad.pay.csvHint')}
              aria-live="polite"
              onClick={exporter}
            >
              <i className={exporte ? 'ri-check-line' : 'ri-file-excel-2-line'} aria-hidden="true"></i>
              <span className="whitespace-nowrap">
                {exporte ? t('ad.pay.csvDone') : t('ad.pay.csvCta')}
              </span>
              <b className="admin-num">{nombre(visibles.length)}</b>
            </button>
          )}
        </div>

        {/* Le compteur de la semaine, au-dessus de l'archive : il dit
            combien d'exports ont été produits ces sept derniers jours, et
            depuis combien de jours le dernier remonte. */}
        <div
          className="pay-week"
          data-state={semaineEtat}
          title={t('ad.pay.weekHint')}
          aria-live="polite"
        >
          <i
            className={
              semaineEtat === 'yes'
                ? 'ri-calendar-check-line'
                : semaineEtat === 'no'
                  ? 'ri-calendar-todo-line'
                  : 'ri-calendar-line'
            }
            aria-hidden="true"
          ></i>
          <span className="pay-week-main">
            <b>{t('ad.pay.weekLabel')}</b>
            <span className="pay-week-n">{nombre(semaine.count)}</span>
            <em>{semaineDepuis}</em>
          </span>
        </div>

        {/* L'archive du jour : posée sous le titre, avant les chiffres, pour
            qu'on sache d'un coup d'œil si le fichier existe déjà. */}
        <div
          className="pay-memo"
          data-today={archiveAujourdhui ? 'yes' : 'no'}
          title={t('ad.pay.exportMemoHint')}
        >
          <i
            className={
              !dernierExport
                ? 'ri-archive-2-line'
                : archiveAujourdhui
                  ? 'ri-check-double-line'
                  : 'ri-archive-line'
            }
            aria-hidden="true"
          ></i>
          {dernierExport ? (
            <span className="pay-memo-main">
              <b>{t('ad.pay.exportLast').replace('{date}', memoireDate)}</b>
              <em>
                {t('ad.pay.exportWhat')
                  .replace('{what}', memoireQuoi)
                  .replace('{n}', nombre(dernierExport.rows))}
              </em>
              {/* Le montant que le fichier emportait, à côté du nombre de
                  lignes : une archive se relit aussi à ce qu'elle pesait — et
                  le clic rejoue cet export, vue et motif compris. */}
              <button
                type="button"
                className="pay-memo-amount pay-memo-replay"
                data-done={rejoue ? 'yes' : 'no'}
                title={t('ad.pay.exportReplayHint')}
                onClick={() => rejouerExport(dernierExport)}
              >
                <i
                  className={rejoue ? 'ri-check-line' : 'ri-history-line'}
                  aria-hidden="true"
                ></i>
                <span className="whitespace-nowrap">
                  {rejoue
                    ? t('ad.pay.exportReplayDone')
                    : dernierExport.montant > 0
                      ? t('ad.pay.exportAmount').replace(
                          '{n}',
                          nombre(dernierExport.montant),
                        )
                      : t('ad.pay.exportReplay')}
                </span>
              </button>
              {/* L'écart avec la file du jour, à vue et motif égaux : le
                  montant que le tableau porte aujourd'hui, comparé à celui
                  que cet export emportait. Le jeton se clique : l'écran
                  s'ouvre sur les lignes de cette différence. */}
              {ecartArchive !== null && (
                <button
                  type="button"
                  className="pay-memo-delta"
                  data-tone={ecartArchive > 0 ? 'up' : ecartArchive < 0 ? 'down' : 'flat'}
                  data-open={Array.isArray(dernierExport.ids) ? 'yes' : 'no'}
                  data-on={ecart?.at === dernierExport.at ? 'yes' : 'no'}
                  title={
                    Array.isArray(dernierExport.ids)
                      ? t('ad.pay.archiveDeltaOpenHint')
                      : t('ad.pay.archiveDeltaHint')
                  }
                  onClick={() => ouvrirEcart(dernierExport)}
                >
                  <i
                    className={
                      ecartArchive > 0
                        ? 'ri-arrow-up-line'
                        : ecartArchive < 0
                          ? 'ri-arrow-down-line'
                          : 'ri-subtract-line'
                    }
                    aria-hidden="true"
                  ></i>
                  {ecartArchive === 0
                    ? t('ad.pay.archiveDeltaFlat')
                    : t(
                        ecartArchive > 0
                          ? 'ad.pay.archiveDeltaUp'
                          : 'ad.pay.archiveDeltaDown',
                      ).replace('{n}', nombre(Math.abs(ecartArchive)))}
                </button>
              )}
              {/* Le second écart, à côté du montant : les lignes gagnées ou
                  perdues depuis cet export, à la même vue et au même motif. */}
              {ecartLignes !== null && (
                <span
                  className="pay-memo-rows"
                  data-tone={ecartLignes > 0 ? 'up' : ecartLignes < 0 ? 'down' : 'flat'}
                  title={t('ad.pay.archiveDeltaRowsHint')}
                >
                  <i
                    className={
                      ecartLignes > 0
                        ? 'ri-add-line'
                        : ecartLignes < 0
                          ? 'ri-subtract-line'
                          : 'ri-drag-move-line'
                    }
                    aria-hidden="true"
                  ></i>
                  {ecartLignes === 0
                    ? t('ad.pay.archiveDeltaRowsFlat')
                    : t(
                        ecartLignes > 0
                          ? 'ad.pay.archiveDeltaRowsUp'
                          : 'ad.pay.archiveDeltaRowsDown',
                      ).replace('{n}', nombre(Math.abs(ecartLignes)))}
                </span>
              )}
            </span>
          ) : (
            <span className="pay-memo-main">{t('ad.pay.exportNone')}</span>
          )}
          {archiveAujourdhui && (
            <span className="pay-memo-today">{t('ad.pay.exportToday')}</span>
          )}
          {/* Effacer la trace d'un envoi erroné : la mémoire repart à zéro,
              et l'écran le dit, pour que la ligne vierge ne se confonde pas
              avec une mémoire simplement vide. */}
          {dernierExport && (
            <span className="pay-memo-act">
              {demandeEffacement && (
                <button
                  type="button"
                  className="pay-memo-cancel"
                  title={t('ad.pay.exportClearCancelHint')}
                  onClick={() => setDemandeEffacement(false)}
                >
                  <i className="ri-close-line" aria-hidden="true"></i>
                  <span className="whitespace-nowrap">
                    {t('ad.pay.exportClearCancel')}
                  </span>
                </button>
              )}
              <button
                type="button"
                className="pay-memo-clear"
                data-ask={demandeEffacement ? 'yes' : 'no'}
                title={
                  demandeEffacement
                    ? t('ad.pay.exportClearConfirmHint')
                    : t('ad.pay.exportClearHint')
                }
                onClick={effacerMemoire}
              >
                <i
                  className={demandeEffacement ? 'ri-delete-bin-6-line' : 'ri-eraser-line'}
                  aria-hidden="true"
                ></i>
                <span className="whitespace-nowrap">
                  {demandeEffacement
                    ? t('ad.pay.exportClearConfirm')
                    : t('ad.pay.exportClear')}
                </span>
              </button>
            </span>
          )}
          {efface && (
            <span className="pay-memo-done" role="status">
              <i className="ri-check-line" aria-hidden="true"></i>
              {t('ad.pay.exportCleared')}
            </span>
          )}
        </div>

        {/* L'historique des sept derniers exports, rangé sous la ligne
            d'archive : chacun dit sa date, son nombre de lignes et son
            montant, du plus récent au plus ancien. */}
        {dernierExport && dernierExport.historique.length > 0 && (
          <div className="pay-hist" title={t('ad.pay.histHint')}>
            <p className="pay-hist-head">
              <i className="ri-history-line" aria-hidden="true"></i>
              <b>{t('ad.pay.histTitle')}</b>
              <em>{t('ad.pay.histCount').replace('{n}', nombre(dernierExport.historique.length))}</em>
              {/* Le jeton des lignes qui ont bougé : il ne garde que les
                  exports dont le décompte diffère de celui d'aujourd'hui, à
                  leur vue et à leur motif. La ligne qui a bougé se retrouve
                  sans ouvrir ni comparer les sept. */}
              <button
                type="button"
                className="pay-hist-moved"
                data-on={bougesOnly ? 'yes' : 'no'}
                aria-pressed={bougesOnly}
                title={t('ad.pay.histMovedOnlyHint')}
                onClick={() => setBougesOnly((valeur) => !valeur)}
              >
                <i className="ri-filter-3-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('ad.pay.histMovedOnly')}</span>
                <b>{nombre(nbBouges)}</b>
              </button>
              {/* Le second jeton, à côté de celui des lignes : les exports dont
                  le montant a bougé, à leur vue et à leur motif. Un décompte
                  stable et un montant qui bouge ne disent pas la même chose. */}
              <button
                type="button"
                className="pay-hist-moved pay-hist-moved-amount"
                data-on={montantsOnly ? 'yes' : 'no'}
                aria-pressed={montantsOnly}
                title={t('ad.pay.histAmountMovedOnlyHint')}
                onClick={() => setMontantsOnly((valeur) => !valeur)}
              >
                <i className="ri-money-euro-circle-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('ad.pay.histAmountMovedOnly')}</span>
                <b>{nombre(nbMontantsBouges)}</b>
              </button>
              {/* Le troisième jeton, sur les deux écarts à la fois : seuls
                  restent les exports où le décompte et le montant pointent
                  en sens contraires — c'est ensemble qu'ils se lisent. */}
              <button
                type="button"
                className="pay-hist-moved pay-hist-moved-opposite"
                data-on={opposesOnly ? 'yes' : 'no'}
                aria-pressed={opposesOnly}
                title={t('ad.pay.histOppositeOnlyHint')}
                onClick={() => setOpposesOnly((valeur) => !valeur)}
              >
                <i className="ri-arrow-left-right-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('ad.pay.histOppositeOnly')}</span>
                <b>{nombre(nbOpposes)}</b>
              </button>
              {/* Le quatrième jeton, sur le sens du montant : seuls restent
                  les exports dont la file pèse aujourd'hui moins que le
                  fichier — ceux dont le montant a baissé depuis. */}
              <button
                type="button"
                className="pay-hist-moved pay-hist-moved-baisse"
                data-on={baissesOnly ? 'yes' : 'no'}
                aria-pressed={baissesOnly}
                title={t('ad.pay.histBaisseOnlyHint')}
                onClick={() => setBaissesOnly((valeur) => !valeur)}
              >
                <i className="ri-arrow-down-circle-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('ad.pay.histBaisseOnly')}</span>
                <b>{nombre(nbBaisses)}</b>
              </button>
              {/* La baisse cumulée, à côté du jeton des montants en baisse :
                  elle est un jeton à part entière, et un clic resserre
                  l'historique sur ces seuls exports — sans passer par le
                  compteur voisin. */}
              {baisseCumulee > 0 && (
                <button
                  type="button"
                  className="pay-hist-moved pay-hist-baisse-cumul-token"
                  data-on={baissesOnly ? 'yes' : 'no'}
                  aria-pressed={baissesOnly}
                  title={t('ad.pay.histBaisseCumulTokenHint').replace(
                    '{n}',
                    nombre(pointsAffiches.length),
                  )}
                  onClick={() => setBaissesOnly((valeur) => !valeur)}
                >
                  <i className="ri-arrow-down-double-line" aria-hidden="true"></i>
                  <span className="whitespace-nowrap">
                    {t('ad.pay.histBaisseCumulToken')}
                  </span>
                  <b>−{nombre(baisseCumulee)}</b>
                </button>
              )}
              {/* Ce que les jetons laissent à lire : le chiffre se pose à côté
                  d'eux dès que l'un est allumé, pour ne pas confondre un
                  historique resserré avec un historique perdu. */}
              {jetonsHistorique > 0 && (
                <span className="pay-hist-shown" title={t('ad.pay.histShowingHint')}>
                  <i className="ri-eye-line" aria-hidden="true"></i>
                  {t('ad.pay.histShowing')
                    .replace('{n}', nombre(pointsAffiches.length))
                    .replace('{m}', nombre(pointsHistorique.length))}
                  {/* La petite gomme : elle éteint les trois jetons d'un seul
                      geste et rend l'historique entier, sans les retirer un
                      par un. Elle ne s'affiche qu'une fois un jeton posé. */}
                  <button
                    type="button"
                    className="pay-hist-shown-clear"
                    title={t('ad.pay.histClearHint')}
                    aria-label={t('ad.pay.histClearHint')}
                    onClick={() => {
                      setBougesOnly(false);
                      setMontantsOnly(false);
                      setOpposesOnly(false);
                      setBaissesOnly(false);
                    }}
                  >
                    <i className="ri-eraser-line" aria-hidden="true"></i>
                  </button>
                </span>
              )}
              {/* Le bandeau des sens opposés emporte ses exports en CSV : les
                  seuls où les deux écarts se contredisent, avec leurs deux
                  chiffres côte à côte. Un fichier vide ne part pas. */}
              {nbOpposes > 0 && (
                <button
                  type="button"
                  className="pay-hist-moved pay-hist-moved-export"
                  data-done={opposesExporte ? 'yes' : 'no'}
                  title={t('ad.pay.histOppositeExportHint')}
                  aria-live="polite"
                  onClick={exporterOpposes}
                >
                  <i
                    className={opposesExporte ? 'ri-check-line' : 'ri-file-excel-2-line'}
                    aria-hidden="true"
                  ></i>
                  <span className="whitespace-nowrap">
                    {opposesExporte
                      ? t('ad.pay.histOppositeExportDone')
                      : t('ad.pay.histOppositeExport')}
                  </span>
                  <b className="admin-num">{nombre(nbOpposes)}</b>
                </button>
              )}
              {/* L'historique filtré, emporté tel qu'il se lit : les seuls
                  exports que les jetons laissent, dans l'ordre de la liste,
                  avec leurs deux écarts. Il n'apparaît qu'une fois un jeton
                  posé et au moins un export retenu. */}
              {jetonsHistorique > 0 && pointsAffiches.length > 0 && (
                <button
                  type="button"
                  className="pay-hist-moved pay-hist-moved-export pay-hist-filter-export"
                  data-done={histExporte ? 'yes' : 'no'}
                  title={t('ad.pay.histFilterExportHint')}
                  aria-live="polite"
                  onClick={exporterHistorique}
                >
                  <i
                    className={histExporte ? 'ri-check-line' : 'ri-file-excel-2-line'}
                    aria-hidden="true"
                  ></i>
                  <span className="whitespace-nowrap">
                    {histExporte
                      ? t('ad.pay.histFilterExportDone')
                      : t('ad.pay.histFilterExport')}
                  </span>
                  <b className="admin-num">{nombre(pointsAffiches.length)}</b>
                </button>
              )}
            </p>
            {/* Le coût total de l'historique filtré, posé sous son bouton
                d'export : ce que les exports retenus pesaient au moment du
                clic, additionné sur les seuls exports chiffrés. */}
            {jetonsHistorique > 0 && pointsAffiches.length > 0 && coutHistorique && (
              <p
                className="pay-hist-cost"
                title={t('ad.pay.histFilterCostHint')}
                aria-live="polite"
              >
                <i className="ri-money-euro-circle-line" aria-hidden="true"></i>
                {t('ad.pay.histFilterCost')
                  .replace('{n}', nombre(coutHistorique.somme))
                  .replace('{m}', nombre(coutHistorique.n))}
              </p>
            )}
            {pointsAffiches.length === 0 ? (
              <p className="pay-hist-empty">
                <i className="ri-check-double-line" aria-hidden="true"></i>
                {[bougesOnly, montantsOnly, opposesOnly, baissesOnly].filter(Boolean)
                  .length > 1
                  ? t('ad.pay.histFiltersEmpty')
                  : opposesOnly
                    ? t('ad.pay.histOppositeOnlyEmpty')
                    : baissesOnly
                      ? t('ad.pay.histBaisseOnlyEmpty')
                      : montantsOnly
                        ? t('ad.pay.histAmountMovedOnlyEmpty')
                        : t('ad.pay.histMovedOnlyEmpty')}
              </p>
            ) : (
            <ol className="pay-hist-list">
              {pointsAffiches.map((point, i) => (
                <li key={point.at} data-last={i === 0 ? 'yes' : 'no'}>
                  {/* Chaque ligne se rejoue : l'écran reprend la vue et le
                      motif de cet export-là, pas seulement du dernier. */}
                  <button
                    type="button"
                    className="pay-hist-row"
                    data-done={rejoueAt === point.at ? 'yes' : 'no'}
                    title={t('ad.pay.histRowHint')}
                    onClick={() => rejouerExport(point)}
                  >
                    <span className="pay-hist-date">{datePoint(point.at)}</span>
                    <span className="pay-hist-n">
                      {t('ad.pay.histRows').replace('{n}', nombre(point.rows))}
                    </span>
                    <span className="pay-hist-amount">
                      {point.montant > 0
                        ? t('ad.pay.exportAmount').replace('{n}', nombre(point.montant))
                        : t('ad.pay.histNoAmount')}
                    </span>
                    {/* Le décompte du jour, à la vue et au motif de cet
                        export : la ligne qui a bougé parmi les sept se
                        repère sans ouvrir chaque archive. */}
                    {bougePoint(point) !== 0 && (
                      <span
                        className="pay-hist-move"
                        data-tone={bougePoint(point) > 0 ? 'up' : 'down'}
                        title={t('ad.pay.histMovedHint')}
                      >
                        <i
                          className={
                            bougePoint(point) > 0 ? 'ri-add-line' : 'ri-subtract-line'
                          }
                          aria-hidden="true"
                        ></i>
                        {t(
                          bougePoint(point) > 0
                            ? 'ad.pay.histMovedUp'
                            : 'ad.pay.histMovedDown',
                        ).replace('{n}', nombre(Math.abs(bougePoint(point))))}
                      </span>
                    )}
                    {/* Le montant, à côté du décompte : ce que cet export
                        emportait comparé à ce que la file pèse aujourd'hui,
                        à la même vue et au même motif. Un export sans montant
                        retenu ne porte pas d'écart — rien à comparer. */}
                    {bougeMontant(point) !== 0 && (
                      <span
                        className="pay-hist-move pay-hist-amount"
                        data-tone={bougeMontant(point) > 0 ? 'up' : 'down'}
                        title={t('ad.pay.histAmountMovedHint')}
                      >
                        <i className="ri-money-euro-circle-line" aria-hidden="true"></i>
                        {t(
                          bougeMontant(point) > 0
                            ? 'ad.pay.histAmountMovedUp'
                            : 'ad.pay.histAmountMovedDown',
                        ).replace('{n}', nombre(Math.abs(bougeMontant(point))))}
                      </span>
                    )}
                    {/* Les deux écarts en sens opposés : le décompte et le
                        montant se contredisent, et c'est ensemble qu'ils se
                        lisent — sinon l'un des deux ferait conclure à tort. */}
                    {sensOpposes(point) && (
                      <span
                        className="pay-hist-opposite"
                        data-on={opposesOnly ? 'yes' : 'no'}
                        title={t('ad.pay.histOppositeHint')}
                      >
                        <i className="ri-arrow-left-right-line" aria-hidden="true"></i>
                        {t('ad.pay.histOpposite')}
                      </span>
                    )}
                    {/* L'export le plus lourd de la semaine : le pic se
                        repère dans la liste, à côté de son montant. */}
                    {pic && pic.at === point.at && (
                      <span className="pay-hist-peak" title={t('ad.pay.histPeakHint')}>
                        <i className="ri-bar-chart-grouped-line" aria-hidden="true"></i>
                        {t('ad.pay.histPeak')}
                      </span>
                    )}
                    <i
                      className={rejoueAt === point.at ? 'ri-check-line' : 'ri-history-line'}
                      aria-hidden="true"
                    ></i>
                  </button>
                </li>
              ))}
            </ol>
            )}
            {/* La moyenne des montants emportés, sous la liste : la suite des
                sept exports se lit d'un coup d'œil, avec la tendance entre le
                plus récent et le plus ancien. */}
            {moyenne && (
              <p className="pay-hist-avg" title={t('ad.pay.histAvgHint')}>
                <i className="ri-line-chart-line" aria-hidden="true"></i>
                <b>{t('ad.pay.histAvg').replace('{n}', nombre(moyenne.valeur))}</b>
                <em>{t('ad.pay.histAvgNote').replace('{n}', nombre(moyenne.n))}</em>
                {/* Le pic, rappelé sous la liste à côté de la moyenne : la
                    tendance se lit avec le plus haut point de la semaine. */}
                {pic && (
                  <button
                    type="button"
                    className="pay-hist-peak-note"
                    data-done={rejoueAt === pic.at ? 'yes' : 'no'}
                    title={t('ad.pay.histPeakReplayHint')}
                    aria-live="polite"
                    onClick={() => rejouerExport(pic)}
                  >
                    <i
                      className={
                        rejoueAt === pic.at ? 'ri-check-line' : 'ri-bar-chart-grouped-line'
                      }
                      aria-hidden="true"
                    ></i>
                    {rejoueAt === pic.at
                      ? t('ad.pay.exportReplayDone')
                      : t('ad.pay.histPeakNote')
                          .replace('{n}', nombre(pic.montant))
                          .replace('{date}', jour(pic.at, lang))}
                  </button>
                )}
                {moyenne.tendance !== null && (
                  <span
                    className="pay-hist-trend"
                    data-tone={
                      moyenne.tendance > 0
                        ? 'up'
                        : moyenne.tendance < 0
                          ? 'down'
                          : 'flat'
                    }
                  >
                    <i
                      className={
                        moyenne.tendance > 0
                          ? 'ri-arrow-up-line'
                          : moyenne.tendance < 0
                            ? 'ri-arrow-down-line'
                            : 'ri-subtract-line'
                      }
                      aria-hidden="true"
                    ></i>
                    {moyenne.tendance === 0
                      ? t('ad.pay.histAvgFlat')
                      : t(
                          moyenne.tendance > 0
                            ? 'ad.pay.histAvgUp'
                            : 'ad.pay.histAvgDown',
                        ).replace('{n}', nombre(Math.abs(moyenne.tendance)))}
                  </span>
                )}
              </p>
            )}

            {/* Comparer deux exports entre eux : un point de départ, un point
                d'arrivée, et l'écart de montant et de lignes entre les deux.
                Deux archives se comparent entre elles, jamais avec la file du
                jour. */}
            {pointsArchive.length >= 2 && (
              <div className="pay-cmp" data-open={cmpOpen ? 'yes' : 'no'}>
                {!cmpOpen ? (
                  <button
                    type="button"
                    className="pay-cmp-open"
                    title={t('ad.pay.cmpOpenHint')}
                    onClick={ouvrirComparaison}
                  >
                    <i className="ri-arrow-left-right-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">{t('ad.pay.cmpOpen')}</span>
                  </button>
                ) : (
                  <>
                    <p className="pay-cmp-head">
                      <i className="ri-arrow-left-right-line" aria-hidden="true"></i>
                      <b>{t('ad.pay.cmpTitle')}</b>
                      <button
                        type="button"
                        className="pay-cmp-close"
                        title={t('ad.pay.cmpCloseHint')}
                        onClick={() => {
                          setCmpOpen(false);
                          setCmpArrivalsNarrow(null);
    setCmpPartiesNarrow(null);
                        }}
                      >
                        <i className="ri-close-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">{t('ad.pay.cmpClose')}</span>
                      </button>
                    </p>
                    <div className="pay-cmp-pick">
                      <label className="pay-cmp-field">
                        <span>{t('ad.pay.cmpFrom')}</span>
                        <select
                          className="pay-cmp-select"
                          value={cmpFrom || pointsArchive[0].at}
                          onChange={(event) => {
                            setCmpFrom(event.target.value);
                            setCmpArrivalsOpen(false);
                            setCmpArrivalsNarrow(null);
    setCmpPartiesNarrow(null);
                          }}
                        >
                          {pointsArchive.map((point) => (
                            <option key={point.at} value={point.at}>
                              {datePoint(point.at)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <i className="ri-arrow-right-line" aria-hidden="true"></i>
                      <label className="pay-cmp-field">
                        <span>{t('ad.pay.cmpTo')}</span>
                        <select
                          className="pay-cmp-select"
                          value={cmpTo || pointsArchive[pointsArchive.length - 1].at}
                          onChange={(event) => {
                            setCmpTo(event.target.value);
                            setCmpArrivalsOpen(false);
                            setCmpArrivalsNarrow(null);
    setCmpPartiesNarrow(null);
                          }}
                        >
                          {pointsArchive.map((point) => (
                            <option key={point.at} value={point.at}>
                              {datePoint(point.at)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    {cmp ? (
                      <p className="pay-cmp-result" title={t('ad.pay.cmpHint')}>
                        {cmp.montant === null ? (
                          <span className="pay-cmp-chip" data-tone="flat">
                            <i className="ri-subtract-line" aria-hidden="true"></i>
                            {t('ad.pay.cmpAmountNone')}
                          </span>
                        ) : (
                          <span
                            className="pay-cmp-chip"
                            data-tone={
                              cmp.montant > 0 ? 'up' : cmp.montant < 0 ? 'down' : 'flat'
                            }
                          >
                            <i
                              className={
                                cmp.montant > 0
                                  ? 'ri-arrow-up-line'
                                  : cmp.montant < 0
                                    ? 'ri-arrow-down-line'
                                    : 'ri-subtract-line'
                              }
                              aria-hidden="true"
                            ></i>
                            {cmp.montant === 0
                              ? t('ad.pay.cmpAmountFlat')
                              : t(
                                  cmp.montant > 0
                                    ? 'ad.pay.cmpAmountUp'
                                    : 'ad.pay.cmpAmountDown',
                                ).replace('{n}', nombre(Math.abs(cmp.montant)))}
                          </span>
                        )}
                        <span
                          className="pay-cmp-chip"
                          data-tone={cmp.lignes > 0 ? 'up' : cmp.lignes < 0 ? 'down' : 'flat'}
                        >
                          <i
                            className={
                              cmp.lignes > 0
                                ? 'ri-add-line'
                                : cmp.lignes < 0
                                  ? 'ri-subtract-line'
                                  : 'ri-drag-move-line'
                            }
                            aria-hidden="true"
                          ></i>
                          {cmp.lignes === 0
                            ? t('ad.pay.cmpRowsFlat')
                            : t(
                                cmp.lignes > 0
                                  ? 'ad.pay.cmpRowsUp'
                                  : 'ad.pay.cmpRowsDown',
                              ).replace('{n}', nombre(Math.abs(cmp.lignes)))}
                        </span>
                        {/* Quand les deux exports retenaient leurs lignes,
                            la différence se nomme au lieu de se deviner. Les
                            arrivées restent un rappel chiffré ; les lignes
                            parties deviennent un jeton, parce qu'elles se
                            resserrent, elles aussi. */}
                        {cmp.arrivees !== null && cmp.parties !== null && (
                          <>
                            <em className="pay-cmp-ids">
                              {t('ad.pay.cmpArrivalsOnly').replace(
                                '{a}',
                                nombre(cmp.arrivees),
                              )}
                            </em>
                            {partiesNarrowSet.size > 0 ? (
                              <button
                                type="button"
                                className="pay-cmp-parties-token"
                                data-on={cmpPartiesNarrow ? 'yes' : 'no'}
                                aria-pressed={Boolean(cmpPartiesNarrow)}
                                title={
                                  cmpPartiesNarrow
                                    ? t('ad.pay.cmpPartiesExitHint')
                                    : t('ad.pay.cmpPartiesTokenHint')
                                }
                                onClick={basculerParties}
                              >
                                <i
                                  className={
                                    cmpPartiesNarrow
                                      ? 'ri-filter-3-line'
                                      : 'ri-arrow-down-line'
                                  }
                                  aria-hidden="true"
                                ></i>
                                {cmpPartiesNarrow
                                  ? t('ad.pay.cmpPartiesNarrowOn').replace(
                                      '{n}',
                                      nombre(cmpPartiesNarrow.size),
                                    )
                                  : t('ad.pay.cmpPartiesToken').replace(
                                      '{n}',
                                      nombre(cmp.parties),
                                    )}
                              </button>
                            ) : (
                              <span
                                className="pay-cmp-parties-token"
                                data-on="no"
                                title={t('ad.pay.cmpPartiesTokenGoneHint')}
                              >
                                <i className="ri-arrow-down-line" aria-hidden="true"></i>
                                {t('ad.pay.cmpPartiesToken').replace(
                                  '{n}',
                                  nombre(cmp.parties),
                                )}
                              </span>
                            )}
                          </>
                        )}
                        {/* Ce que ces arrivées ont apporté, en un chiffre que
                            l'on clique : la comparaison déplie alors leurs
                            montants, sans ouvrir le fichier. */}
                        {cmp.arrivees !== null &&
                          cmp.parties !== null &&
                          arriveesCmp.length > 0 && (
                            <button
                              type="button"
                              className="pay-cmp-arrival-total"
                              data-on={cmpArrivalsOpen ? 'yes' : 'no'}
                              data-narrow={cmpArrivalsNarrow ? 'yes' : 'no'}
                              aria-pressed={cmpArrivalsOpen}
                              title={
                                cmpArrivalsNarrow
                                  ? t('ad.pay.cmpArrivalNarrowExitHint')
                                  : cmpArrivalsOpen
                                    ? t('ad.pay.cmpArrivalNarrowHint')
                                    : t('ad.pay.cmpArrivalTotalChipHint')
                              }
                              onClick={basculerArrivees}
                            >
                              <i
                                className={
                                  cmpArrivalsNarrow
                                    ? 'ri-filter-3-line'
                                    : cmpArrivalsOpen
                                      ? 'ri-arrow-up-s-line'
                                      : 'ri-arrow-down-s-line'
                                }
                                aria-hidden="true"
                              ></i>
                              {cmpArrivalsNarrow
                                ? t('ad.pay.cmpArrivalNarrowOn').replace(
                                    '{n}',
                                    nombre(cmpArrivalsNarrow.size),
                                  )
                                : t('ad.pay.cmpArrivalTotalChip').replace(
                                    '{n}',
                                    nombre(Math.round(apportArrivees)),
                                  )}
                            </button>
                          )}
                      </p>
                    ) : (
                      <p className="pay-cmp-empty">
                        <i className="ri-information-line" aria-hidden="true"></i>
                        {t('ad.pay.cmpSame')}
                      </p>
                    )}
                    {/* Les montants des arrivées, dépliés depuis le total :
                        chaque ligne dit ce qu'elle a apporté et qui elle est,
                        pour relire le chiffre sans quitter l'écran. */}
                    {cmp && cmpArrivalsOpen && arriveesCmp.length > 0 && (
                      <ul className="pay-cmp-arrivals">
                        {arriveesCmp.map((row) => {
                          const valeur = Number(row.montant_mensuel ?? 0);
                          return (
                            <li key={ligneKey(row)}>
                              <i className="ri-corner-down-right-line" aria-hidden="true"></i>
                              <span className="pay-cmp-arrival-name">
                                <b>{row.entreprise || row.email || '—'}</b>
                                {row.email && <em>{row.email}</em>}
                              </span>
                              <span className="pay-cmp-arrival-amount">
                                {Number.isFinite(valeur) && valeur > 0
                                  ? `+${nombre(valeur)}`
                                  : t('ad.pay.cmpArrivalNoAmount')}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    {/* Le resserrement posé par le jeton des arrivées : la
                        file ne garde que ces lignes-là, et le bandeau dit
                        combien, avec le geste qui la rend entière. */}
                    {cmp && cmpArrivalsNarrow && (
                      <div className="pay-cmp-narrow" role="status">
                        <i className="ri-filter-3-line" aria-hidden="true"></i>
                        <b>
                          {t('ad.pay.cmpArrivalNarrowBanner').replace(
                            '{n}',
                            nombre(cmpArrivalsNarrow.size),
                          )}
                        </b>
                        <em>{t('ad.pay.cmpArrivalNarrowNote')}</em>
                        <button
                          type="button"
                          className="pay-cmp-narrow-clear"
                          title={t('ad.pay.cmpArrivalNarrowExitHint')}
                          onClick={() => setCmpArrivalsNarrow(null)}
                        >
                          <i className="ri-close-line" aria-hidden="true"></i>
                          <span className="whitespace-nowrap">{t('ad.pay.ecartClear')}</span>
                        </button>
                      </div>
                    )}
                    {/* Le resserrement posé par le jeton des lignes parties :
                        la file ne garde que ces lignes-là, celles encore au
                        tableau. */}
                    {cmp && cmpPartiesNarrow && (
                      <div className="pay-cmp-narrow pay-cmp-narrow-parties" role="status">
                        <i className="ri-filter-3-line" aria-hidden="true"></i>
                        <b>
                          {t('ad.pay.cmpPartiesNarrowBanner').replace(
                            '{n}',
                            nombre(cmpPartiesNarrow.size),
                          )}
                        </b>
                        <em>{t('ad.pay.cmpPartiesNarrowNote')}</em>
                        {/* L'extrait part d'ici : ce que le bandeau laisse
                            lire, sans repasser par la file entière. */}
                        {visibles.length > 0 && (
                          <button
                            type="button"
                            className="pay-cmp-narrow-export"
                            data-done={partiesExporte ? 'yes' : 'no'}
                            title={t('ad.pay.cmpPartiesNarrowExportHint')}
                            aria-live="polite"
                            onClick={exporterParties}
                          >
                            <i
                              className={
                                partiesExporte ? 'ri-check-line' : 'ri-file-excel-2-line'
                              }
                              aria-hidden="true"
                            ></i>
                            <span className="whitespace-nowrap">
                              {partiesExporte
                                ? t('ad.pay.cmpPartiesNarrowExportDone')
                                : t('ad.pay.cmpPartiesNarrowExport')}
                            </span>
                            <b className="admin-num">{nombre(visibles.length)}</b>
                          </button>
                        )}
                        <button
                          type="button"
                          className="pay-cmp-narrow-clear"
                          title={t('ad.pay.cmpPartiesExitHint')}
                          onClick={() => setCmpPartiesNarrow(null)}
                        >
                          <i className="ri-close-line" aria-hidden="true"></i>
                          <span className="whitespace-nowrap">{t('ad.pay.ecartClear')}</span>
                        </button>
                      </div>
                    )}
                    {/* La comparaison part en fichier : les deux points
                        côte à côte, puis l'écart de montant et de lignes.
                        Elle ne touche ni à la file ni à l'archive. */}
                    {cmp && (
                      <button
                        type="button"
                        className="pay-cmp-export"
                        data-done={cmpExporte ? 'yes' : 'no'}
                        title={t('ad.pay.cmpExportHint')}
                        aria-live="polite"
                        onClick={() => exporterComparaison(cmp)}
                      >
                        <i
                          className={cmpExporte ? 'ri-check-line' : 'ri-file-excel-2-line'}
                          aria-hidden="true"
                        ></i>
                        <span className="whitespace-nowrap">
                          {cmpExporte ? t('ad.pay.cmpExportDone') : t('ad.pay.cmpExport')}
                        </span>
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* La différence d'un export, posée sous l'archive : l'écran dit ce
            qu'il garde — les lignes arrivées —, et ce qu'il ne peut que
            compter, les lignes parties. */}
        {ecart && (
          <div className="pay-ecart" role="status">
            <i className="ri-contrast-2-line" aria-hidden="true"></i>
            <span className="pay-ecart-main">
              <b>{t('ad.pay.ecartChip').replace('{date}', datePoint(ecart.at))}</b>
              <em>{t('ad.pay.ecartArrived').replace('{n}', nombre(visibles.length))}</em>
              {ecartParties > 0 && (
                <em className="pay-ecart-left">
                  {t('ad.pay.ecartLeft').replace('{n}', nombre(ecartParties))}
                </em>
              )}
            </span>
            {/* L'extrait part d'ici : ce que le bandeau montre, sans
                repasser par la file entière. Il ne réécrit pas l'archive —
                c'est une pièce jointe, pas un nouvel export du tableau. */}
            {visibles.length > 0 && (
              <button
                type="button"
                className="pay-ecart-export"
                data-done={ecartExporte ? 'yes' : 'no'}
                title={t('ad.pay.ecartExportHint')}
                aria-live="polite"
                onClick={exporterEcart}
              >
                <i
                  className={ecartExporte ? 'ri-check-line' : 'ri-file-excel-2-line'}
                  aria-hidden="true"
                ></i>
                <span className="whitespace-nowrap">
                  {ecartExporte ? t('ad.pay.ecartExportDone') : t('ad.pay.ecartExport')}
                </span>
              </button>
            )}
            <button
              type="button"
              className="pay-ecart-clear"
              title={t('ad.pay.ecartClearHint')}
              onClick={() => setEcart(null)}
            >
              <i className="ri-close-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ad.pay.ecartClear')}</span>
            </button>
          </div>
        )}

        {focus && (
          <div className="pay-focus">
            <span className="admin-chip" data-on="yes" data-static="yes">
              <i className="ri-filter-3-line" aria-hidden="true"></i>
              {t('ad.pay.focus').replace(
                '{mail}',
                focus.email || focus.compteId || '—',
              )}
            </span>
            {focus.vue === 'regler' && (
              <span className="admin-chip" data-on="yes" data-static="yes">
                <i className="ri-error-warning-line" aria-hidden="true"></i>
                {t('ad.pay.focusVueRegler')}
              </span>
            )}
            {focus.vue === 'prets' && (
              <span className="admin-chip" data-on="yes" data-static="yes">
                <i className="ri-check-double-line" aria-hidden="true"></i>
                {t('ad.pay.focusVuePrets')}
              </span>
            )}
            {focus.tri === 'montant' && (
              <span className="admin-chip" data-on="yes" data-static="yes">
                <i className="ri-sort-desc" aria-hidden="true"></i>
                {t('ad.pay.focusTriMontant')}
              </span>
            )}
            {onClearFocus && (
              <button
                type="button"
                className="admin-chip"
                title={t('ad.pay.focusHint')}
                onClick={onClearFocus}
              >
                <i className="ri-close-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('ad.pay.focusClear')}</span>
              </button>
            )}
          </div>
        )}

        {/* Ce que l'écran ne peut pas promettre : le prélèvement n'est pas
            branché. La phrase est là, en tête, plutôt que dans une note en
            bas de page qu'on ne lit pas. */}
        <div className="pay-intro">
          <div className="pay-intro-card" data-tone="warn">
            <h3>
              <i className="ri-bank-card-line" aria-hidden="true"></i>
              {t('ad.pay.bannerTitle')}
            </h3>
            <p>{t('ad.pay.bannerBody')}</p>
          </div>
          <div className="pay-intro-card">
            <h3>
              <i className="ri-file-list-3-line" aria-hidden="true"></i>
              {t('ad.pay.ruleTitle')}
            </h3>
            <p>{t('ad.pay.ruleBody')}</p>
            {/* Les raisons réellement présentes, avec leur poids. Chacune se
                clique : elle isole d'un seul geste les abonnements qu'elle
                bloque, et un second clic rend la file entière. */}
            <ul className="pay-raisons" role="group" aria-label={t('ad.pay.motifLabel')}>
              {synthese.parRaison.map((item) => (
                <li key={item.etat} data-tone={TON_ETAT[item.etat]}>
                  <button
                    type="button"
                    className="pay-raison-btn"
                    data-on={motif === item.etat ? 'yes' : 'no'}
                    aria-pressed={motif === item.etat}
                    title={t('ad.pay.motifHint').replace(
                      '{r}',
                      t(`ad.pay.why.${item.etat}`),
                    )}
                    onClick={() => basculerMotif(item.etat)}
                  >
                    <span className="pay-raison-dot" aria-hidden="true"></span>
                    <span className="pay-raison-label">{t(`ad.pay.why.${item.etat}`)}</span>
                    <b>{nombre(item.n)}</b>
                  </button>
                </li>
              ))}
            </ul>
            <p className="pay-raison-hint">
              {motif === 'all' ? (
                <span>{t('ad.pay.motifLegend')}</span>
              ) : (
                <>
                  <span>
                    {t('ad.pay.motifActive').replace('{r}', t(`ad.pay.why.${motif}`))}
                  </span>
                  <button
                    type="button"
                    className="pay-raison-clear"
                    onClick={() => setMotif('all')}
                  >
                    <i className="ri-close-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">{t('ad.pay.motifClear')}</span>
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="admin-chips" role="group" aria-label={t('ad.pay.stamp')}>
          <button
            type="button"
            className="admin-chip"
            data-on={vue === 'regler' && motif === 'all' ? 'yes' : 'no'}
            data-tone="warn"
            aria-pressed={vue === 'regler' && motif === 'all'}
            onClick={() => poserVue('regler')}
            title={t('ad.pay.filterReglerHint')}
          >
            <i className="ri-error-warning-line" aria-hidden="true"></i>
            {t('ad.pay.filterRegler')}
            <b>{nombre(synthese.aRegler)}</b>
          </button>
          <button
            type="button"
            className="admin-chip"
            data-on={vue === 'prets' && motif === 'all' ? 'yes' : 'no'}
            aria-pressed={vue === 'prets' && motif === 'all'}
            onClick={() => poserVue('prets')}
            title={t('ad.pay.filterPretsHint')}
          >
            <i className="ri-check-double-line" aria-hidden="true"></i>
            {t('ad.pay.filterPrets')}
            <b>{nombre(synthese.prets)}</b>
          </button>
          <button
            type="button"
            className="admin-chip"
            data-on={vue === 'all' && motif === 'all' ? 'yes' : 'no'}
            aria-pressed={vue === 'all' && motif === 'all'}
            onClick={() => poserVue('all')}
          >
            <i className="ri-list-check-2" aria-hidden="true"></i>
            {t('ad.pay.filterAll')}
            <b>{nombre(synthese.total)}</b>
          </button>
          {/* L'ordre de la file : le blocage d'abord, ou le montant le plus
              haut d'abord. Le tri ne change pas la file, seulement l'ordre
              dans lequel on l'encaisse. */}
          <button
            type="button"
            className="admin-chip"
            data-on={tri === 'montant' ? 'yes' : 'no'}
            aria-pressed={tri === 'montant'}
            title={t('ad.pay.sortMontantHint')}
            onClick={() => setTri(tri === 'montant' ? 'etat' : 'montant')}
          >
            <i className="ri-sort-desc" aria-hidden="true"></i>
            {t('ad.pay.sortMontant')}
          </button>
          {/* Le montant que la file lue porte, à côté du jeton de tri : on
              sait ce qu'on va encaisser avant d'ouvrir la première fiche. */}
          {visibles.length > 0 && (
            <span className="pay-sum" title={t('ad.pay.sortedTotalHint')}>
              <i className="ri-money-euro-circle-line" aria-hidden="true"></i>
              <span>{t('ad.pay.sortedTotal')}</span>
              <b>{nombre(Math.round(montantVisible))}</b>
              <em>{t('ad.pay.sortedTotalRows').replace('{n}', nombre(visibles.length))}</em>
              {/* La part déjà encaissable de cette même file : le second
                  montant se lit à côté du premier, sans changer de vue. */}
              <em className="pay-sum-ready" title={t('ad.pay.sortedTotalReadyHint')}>
                <i className="ri-check-double-line" aria-hidden="true"></i>
                {t('ad.pay.sortedTotalReady').replace(
                  '{n}',
                  nombre(Math.round(montantEncaisseVisible)),
                )}
              </em>
              {/* Ce que la même file laisse en suspens : le troisième
                  montant, pour lire en une ligne ce qu'elle encaisse, ce qui
                  est déjà encaissable et ce qui reste à régler. */}
              <em className="pay-sum-due" title={t('ad.pay.sortedTotalDueHint')}>
                <i className="ri-time-line" aria-hidden="true"></i>
                {t('ad.pay.sortedTotalDue').replace(
                  '{n}',
                  nombre(Math.round(montantRestantVisible)),
                )}
              </em>
            </span>
          )}
        </div>

        {duCompte.length === 0 ? (
          <p className="admin-empty">
            <i className={focus ? 'ri-filter-3-line' : 'ri-bank-card-line'} aria-hidden="true"></i>
            {focus ? t('ad.pay.focusEmpty') : t('ad.pay.empty')}
          </p>
        ) : visibles.length === 0 ? (
          <p className="admin-empty">
            <i className={ecart ? 'ri-contrast-2-line' : 'ri-check-double-line'} aria-hidden="true"></i>
            {ecart
              ? t('ad.pay.ecartNone')
              : cmpPartiesNarrow
                ? t('ad.pay.cmpPartiesNarrowEmpty')
                : cmpArrivalsNarrow
                  ? t('ad.pay.cmpArrivalNarrowEmpty')
                  : motif !== 'all'
                  ? t('ad.pay.motifEmpty')
                  : vue === 'regler'
                    ? t('ad.pay.emptyRegler')
                    : t('ad.pay.emptyPrets')}
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-table-cards pay-table">
              <thead>
                <tr>
                  <th scope="col">{t('ad.pay.colEntreprise')}</th>
                  <th scope="col">{t('ad.pay.colOffre')}</th>
                  <th scope="col">{t('ad.pay.colMontant')}</th>
                  <th scope="col">{t('ad.pay.colEcheance')}</th>
                  <th scope="col">{t('ad.pay.colCanal')}</th>
                  <th scope="col">{t('ad.pay.colEtat')}</th>
                  <th scope="col">{t('ad.pay.colFiche')}</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((row) => {
                  const lecture = lireEncaissement(row);
                  return (
                    <tr
                      key={String(row.id)}
                      className="admin-row-click"
                      data-late={lecture.etat === 'retard' ? 'yes' : 'no'}
                      onClick={() => onOpenCompte(row.artisan_id, row.email)}
                    >
                      <td>
                        <b className="admin-strong">{row.entreprise || '—'}</b>
                        {row.email && <span className="admin-mail">{row.email}</span>}
                        {(row.metier || row.ville) && (
                          <span className="admin-muted">
                            {[row.metier, row.ville].filter(Boolean).join(' · ')}
                          </span>
                        )}
                      </td>
                      <td
                        data-label={t('ad.pay.colOffre')}
                        data-card-label={t('ad.pay.cardOffre')}
                      >
                        {row.offre || '—'}
                      </td>
                      <td
                        className="admin-num"
                        data-label={t('ad.pay.colMontant')}
                        data-card-label={t('ad.pay.cardMontant')}
                      >
                        {nombre(row.montant_mensuel)}
                      </td>
                      <td
                        className="admin-num"
                        data-label={t('ad.pay.colEcheance')}
                        data-card-label={t('ad.pay.cardEcheance')}
                      >
                        {jour(row.date_echeance, lang)}
                        {lecture.etat === 'retard' && (
                          <span className="admin-due" data-late="yes">
                            {echeanceEnMots(row.date_echeance, t)}
                          </span>
                        )}
                      </td>
                      <td
                        data-label={t('ad.pay.colCanal')}
                        data-card-label={t('ad.pay.cardCanal')}
                      >
                        {row.canal_paiement || '—'}
                      </td>
                      <td
                        data-label={t('ad.pay.colEtat')}
                        data-card-label={t('ad.pay.cardEtat')}
                      >
                        <span className="admin-badge" data-tone={TON_ETAT[lecture.etat]}>
                          <i
                            className={
                              lecture.encaissable
                                ? 'ri-check-double-line'
                                : lecture.etat === 'retard'
                                  ? 'ri-time-line'
                                  : 'ri-error-warning-line'
                            }
                            aria-hidden="true"
                          ></i>
                          {t(lecture.cle)}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-row-open"
                          aria-label={`${t('ad.pay.open')} · ${row.entreprise || '—'}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenCompte(row.artisan_id, row.email);
                          }}
                        >
                          <i className="ri-arrow-right-up-line" aria-hidden="true"></i>
                          <span className="whitespace-nowrap">{t('ad.pay.open')}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="admin-note">
          <i className="ri-information-line" aria-hidden="true"></i>
          <span>{t('ad.pay.note')}</span>
        </p>
      </section>
    </>
  );
}