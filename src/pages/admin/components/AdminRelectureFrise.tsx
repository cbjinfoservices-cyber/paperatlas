import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import {
  GESTES_AVIS,
  RELECTURE_LIGNES,
  RELECTURE_TOTAL,
  RELECTURE_TOURNEES,
  SECONDE_TOURNEE,
  autresTranchesDuClic,
  bornesOrdreEcrit,
  copierClicSeul,
  copierRangsOuverts,
  copierTrancheAncienne,
  copierTrancheRecente,
  copierTranchesExtremes,
  copierRangsTableau,
  copierRangsTableauDate,
  delaiDepuis,
  dispersionEcarts,
  ecransDuClicParTranche,
  ecransOuvertsApresGeste,
  effacerGestesBande,
  estRelue,
  etiquetteTournee,
  lireGestesBande,
  rangsOuvertsTranchesEcrits,
  rangsOuvertsTranche,
  telechargerRelectureCsvTranche,
  telechargerRelectureCsvTranchesOuvertes,
  tourneeDeRang,
  tourneeParId,
  tranchesDuMemeInstant,
  trancheDeplaceePlusRecente,
  trancheQuiGardeLePlus,
  trancheQuiGardeLeMoins,
  tranchesDeplaceesParTri,
  type RelectureEtat,
  type RelectureGeste,
  type TrancheFrise,
} from './adminRelectureCore';
import {
  readTriPortesCopie,
  readTriTranchesOuvertes,
  readTriTranchesOuvertesDepuis,
  saveTriPortesCopie,
  saveTriTranchesOuvertes,
  type TriPortesCopie,
  type TriTranchesOuvertes,
} from './adminFriseTriMemory';

/**
 * La frise des trente écrans, sous les jetons du panneau.
 *
 * Une marque par écran, dans l'ordre du plan, rangée en tranches : les deux
 * tournées, puis les écrans qui les suivent. La marque dit d'un coup d'œil où
 * en est la relecture — fermée des deux côtés, cochée d'un seul, ou encore
 * ouverte —, sans compter les cases de la liste une à une.
 *
 * La marque est aussi le geste : un clic coche l'écran des deux côtés, un
 * second le rend ouvert. C'est le seul endroit de la console où une page se
 * ferme sans passer par sa ligne — la frise sert à finir une tournée d'un
 * trait, pas à la relire.
 *
 * La frise ne compte rien elle-même : elle lit le carnet de l'appareil, celui
 * que le panneau écrit à chaque case cochée. Quand une tournée est ouverte,
 * les tranches qu'elle ne couvre pas s'effacent sans disparaître : on continue
 * de voir ce qui reste ailleurs.
 */

type Bande = {
  /** Le rang de la tournée, ou null pour la tranche qui la suit dans le plan. */
  id: number | null;
  /** Le premier rang qu'elle couvre. */
  de: number;
  /** Le dernier rang qu'elle couvre. */
  a: number;
};

/**
 * Les tranches de la frise : une par tournée, puis celle qui ferme le plan.
 * Elles se déduisent des tournées elles-mêmes, pour que déplacer une tournée
 * ne demande pas de retoucher la frise.
 */
const BANDES: Bande[] = [
  ...RELECTURE_TOURNEES.map((tournee) => ({
    id: tournee.id,
    de: tournee.de,
    a: tournee.a,
  })),
  { id: null, de: SECONDE_TOURNEE + 1, a: RELECTURE_TOTAL },
];

type Props = {
  /** Le carnet de l'appareil, tel que le panneau le tient à jour. */
  etat: RelectureEtat;
  /** La tournée ouverte, ou null quand les trente pages sont montrées. */
  tournee: number | null;
  /** Le geste d'une marque : cocher l'écran des deux côtés, ou le rouvrir. */
  onBascule: (n: number) => void;
  /** Le geste d'une tranche entière : fermer d'un coup les écrans encore
   *  ouverts, ou rouvrir les dix quand la tranche est faite des deux côtés. */
  onBasculeBande: (de: number, a: number) => void;
  /** Retrouver la tournée d'un geste : le rappel de la tête de frise ouvre
   *  le resserrement sur la tranche que ce clic avait fermée. */
  onVoirTournee?: (id: number) => void;
  /** Le geste de la porte de tête : rouvrir d'un coup les écrans de toutes les
   *  tranches qui gardent encore quelque chose d'ouvert. Les tranches déjà
   *  fermées des deux côtés ne bougent pas. */
  onRouvrirOuvertes?: () => void;
};

/**
 * Ce que le geste de tranche vient de fermer — ou de rouvrir —, gardé quelques
 * instants sous la tranche : un clic qui change dix écrans d'un coup mérite de
 * dire son compte, sinon l'œil ne sait pas ce qui a bougé.
 */
type GesteVu = {
  /** La tranche qui vient de recevoir le clic. */
  cle: string;
  /** Vrai quand le geste a fermé, faux quand il a rouvert. */
  ferme: boolean;
  /** Combien d'écrans le clic a touchés. */
  n: number;
  /** L'instant du clic : deux gestes sur la même tranche se distinguent. */
  at: number;
};

/** L'état d'un écran, lu sur les deux cases et jamais recompté ailleurs. */
function etatEcran(etat: RelectureEtat, n: number): 'deux' | 'un' | 'rien' {
  const ar = estRelue(etat, 'ar', n);
  const en = estRelue(etat, 'en', n);
  if (ar && en) return 'deux';
  if (ar || en) return 'un';
  return 'rien';
}

const ETATS: Array<'deux' | 'un' | 'rien'> = ['deux', 'un', 'rien'];

/** La date d'un geste, courte : le jour, puis l'heure de la console. */
function quandGeste(iso: string): string {
  const jour = new Date(iso);
  if (Number.isNaN(jour.getTime())) return '—';
  const deux = (valeur: number) => String(valeur).padStart(2, '0');
  return `${deux(jour.getDate())}/${deux(jour.getMonth() + 1)} · ${deux(jour.getHours())}:${deux(
    jour.getMinutes(),
  )}`;
}

/** Le jour seul, avec l'année : ce que la tête de frise dit du plus ancien geste. */
function jourGeste(iso: string): string {
  const jour = new Date(iso);
  if (Number.isNaN(jour.getTime())) return '—';
  const deux = (valeur: number) => String(valeur).padStart(2, '0');
  return `${deux(jour.getDate())}/${deux(jour.getMonth() + 1)}/${jour.getFullYear()}`;
}

/** Une tranche écrite comme dans la frise : « 01–10 ». */
function trancheEcrite(de: number, a: number): string {
  const deux = (valeur: number) => String(valeur).padStart(2, '0');
  return `${deux(de)}–${deux(a)}`;
}

/** La clé d'une tranche dans la frise : celle que la carte ouverte retient. */
function cleTranche(de: number, a: number): string {
  const bande = BANDES.find((entree) => entree.de === de && entree.a === a);
  if (!bande) return 'reste';
  return bande.id === null ? 'reste' : `t${bande.id}`;
}

export default function AdminRelectureFrise({
  etat,
  tournee,
  onBascule,
  onBasculeBande,
  onVoirTournee,
  onRouvrirOuvertes,
}: Props) {
  const { t } = useLang();
  /* Ce que le dernier geste de tranche a touché : affiché un court instant
     sous la tranche cliquée, puis effacé. */
  const [gesteVu, setGesteVu] = useState<GesteVu | null>(null);
  const minuterie = useRef<number | null>(null);
  /* Le carnet des gestes, relu à chaque changement : la miniature de l'en-tête
     peut en noter un, et la porte « oublier » les efface tous. La tête de la
     frise et la date de chaque tranche puisent à cette seule liste. */
  const [gestes, setGestes] = useState<RelectureGeste[]>(() => lireGestesBande());
  /* L'oubli se fait en deux gestes : le premier demande, le second efface. */
  const [oubli, setOubli] = useState(false);
  const minuterieOubli = useRef<number | null>(null);
  /* Le jour de la remise à zéro qui vient d'avoir lieu : la frise répond au
     geste qui l'a vidée, au lieu de laisser le carnet disparaître sans mot. */
  const [remisZero, setRemisZero] = useState<string | null>(null);
  const minuterieZero = useRef<number | null>(null);
  /* La tranche dont la carte des gestes est ouverte : le clic sur sa date
     déplie la liste datée de ses clics, un second clic la referme. */
  const [carteOuverte, setCarteOuverte] = useState<string | null>(null);
  /* Le sens sur lequel la carte se range : une tranche agitée mêle fermetures
     et réouvertures, et les relire séparément vaut mieux que de les suivre
     dans l'ordre des clics. */
  const [triGestes, setTriGestes] = useState<'tous' | 'ferme' | 'rouvert'>('tous');
  /* Le sens lu par la tête de frise : la ligne du dernier geste se range par
     fermetures ou par réouvertures, quand le carnet mêle les deux. */
  const [triDernier, setTriDernier] = useState<'tous' | 'ferme' | 'rouvert'>('tous');
  /* L'ordre des deux portes de copie d'une seule tranche : la plus ancienne
     ouvre, ou la plus récente. L'appareil retient ce choix d'une visite à
     l'autre. */
  const [triPortes, setTriPortes] = useState<TriPortesCopie>(() => readTriPortesCopie());
  /* L'ordre des tranches encore ouvertes : celui du plan, ou la fin d'abord —
     la tranche la plus avancée dans le plan en tête. L'appareil retient ce
     choix d'une visite à l'autre, comme celui des deux portes de copie. */
  const [triOuvertes, setTriOuvertes] = useState<TriTranchesOuvertes>(() =>
    readTriTranchesOuvertes(),
  );
  /* Depuis quand l'ordre « Fin d'abord » tient : la gomme le rappelle au
     survol, pour dater le geste qu'elle défait. */
  const [triDepuis, setTriDepuis] = useState<string | null>(() =>
    readTriTranchesOuvertesDepuis(),
  );
  /* La tranche qui vient d'être emportée en CSV : la porte dit ce qu'elle a
     fait un court instant, au lieu de rester sans réponse. */
  const [csvFait, setCsvFait] = useState(false);
  const minuterieCsv = useRef<number | null>(null);
  /* La porte des tranches ouvertes : toutes celles qui gardent un écran non
     fermé, emportées dans un seul fichier. Elle répond un instant après le
     clic, comme la porte d'une seule tranche. */
  const [csvOuvertesFait, setCsvOuvertesFait] = useState(false);
  const minuterieCsvOuvertes = useRef<number | null>(null);
  /* La porte de réouverture des tranches ouvertes : elle demande un second
     clic, parce qu'elle retire des cases cochées d'un coup. */
  const [rouvre, setRouvre] = useState(false);
  const [rouvertesFait, setRouvertesFait] = useState(false);
  const minuterieRouvre = useRef<number | null>(null);
  const minuterieRouvertes = useRef<number | null>(null);
  /* La porte qui copie les rangs restants, tranche par tranche : elle répond
     un instant, le temps que l'ceil voie que la liste est partie. */
  const [rangsCopies, setRangsCopies] = useState(false);
  const minuterieRangs = useRef<number | null>(null);
  /* La porte du tableau : la même liste que la porte voisine, mais en colonnes
     — rang, écran, côté manquant —, pour un message ou un tableur. */
  const [rangsTableau, setRangsTableau] = useState(false);
  const minuterieTableau = useRef<number | null>(null);
  /* La porte du tableau daté : les mêmes rangs que le tableau simple, mais
     avec la date du dernier geste de chaque tranche en quatrième colonne. */
  const [rangsTableauDate, setRangsTableauDate] = useState(false);
  const minuterieTableauDate = useRef<number | null>(null);
  /* La porte d'un seul clic, dans la carte datée : elle répond un instant sur
     la ligne du clic qu'elle vient d'emporter, et non sur toute la carte. */
  const [clicCopie, setClicCopie] = useState<string | null>(null);
  const minuterieClic = useRef<number | null>(null);
  /* La porte de la tranche la plus ancienne : elle répond un instant, le temps
     que l'œil voie que la liste est partie — sans toucher au reste de la tête. */
  const [ancienneCopiee, setAncienneCopiee] = useState(false);
  const minuterieAncienne = useRef<number | null>(null);
  /* La porte symétrique, celle de la tranche touchée le plus récemment : elle
     répond de la même façon, un court instant, sans toucher au reste. */
  const [recenteCopiee, setRecenteCopiee] = useState(false);
  const minuterieRecente = useRef<number | null>(null);
  /* La porte des deux extrêmes : la plus ancienne et la plus récemment touchée
     emportées ensemble, dans une même feuille. */
  const [extremesCopiees, setExtremesCopiees] = useState(false);
  const minuterieExtremes = useRef<number | null>(null);

  useEffect(() => {
    const relire = () => setGestes(lireGestesBande());
    window.addEventListener(GESTES_AVIS, relire);
    window.addEventListener('storage', relire);
    return () => {
      window.removeEventListener(GESTES_AVIS, relire);
      window.removeEventListener('storage', relire);
    };
  }, []);

  useEffect(() => {
    if (!gesteVu) return undefined;
    if (minuterie.current) window.clearTimeout(minuterie.current);
    minuterie.current = window.setTimeout(() => setGesteVu(null), 3600);
    return () => {
      if (minuterie.current) window.clearTimeout(minuterie.current);
      minuterie.current = null;
    };
  }, [gesteVu]);

  useEffect(() => {
    if (!remisZero) return undefined;
    if (minuterieZero.current) window.clearTimeout(minuterieZero.current);
    minuterieZero.current = window.setTimeout(() => setRemisZero(null), 4200);
    return () => {
      if (minuterieZero.current) window.clearTimeout(minuterieZero.current);
      minuterieZero.current = null;
    };
  }, [remisZero]);

  useEffect(() => {
    if (!csvFait) return undefined;
    if (minuterieCsv.current) window.clearTimeout(minuterieCsv.current);
    minuterieCsv.current = window.setTimeout(() => setCsvFait(false), 4000);
    return () => {
      if (minuterieCsv.current) window.clearTimeout(minuterieCsv.current);
      minuterieCsv.current = null;
    };
  }, [csvFait]);

  useEffect(() => {
    if (!csvOuvertesFait) return undefined;
    if (minuterieCsvOuvertes.current) window.clearTimeout(minuterieCsvOuvertes.current);
    minuterieCsvOuvertes.current = window.setTimeout(
      () => setCsvOuvertesFait(false),
      4000,
    );
    return () => {
      if (minuterieCsvOuvertes.current) window.clearTimeout(minuterieCsvOuvertes.current);
      minuterieCsvOuvertes.current = null;
    };
  }, [csvOuvertesFait]);

  useEffect(() => {
    if (!rouvertesFait) return undefined;
    if (minuterieRouvertes.current) window.clearTimeout(minuterieRouvertes.current);
    minuterieRouvertes.current = window.setTimeout(
      () => setRouvertesFait(false),
      4200,
    );
    return () => {
      if (minuterieRouvertes.current) window.clearTimeout(minuterieRouvertes.current);
      minuterieRouvertes.current = null;
    };
  }, [rouvertesFait]);

  useEffect(() => {
    if (!rangsCopies) return undefined;
    if (minuterieRangs.current) window.clearTimeout(minuterieRangs.current);
    minuterieRangs.current = window.setTimeout(() => setRangsCopies(false), 3600);
    return () => {
      if (minuterieRangs.current) window.clearTimeout(minuterieRangs.current);
      minuterieRangs.current = null;
    };
  }, [rangsCopies]);

  useEffect(() => {
    if (!rangsTableau) return undefined;
    if (minuterieTableau.current) window.clearTimeout(minuterieTableau.current);
    minuterieTableau.current = window.setTimeout(() => setRangsTableau(false), 3600);
    return () => {
      if (minuterieTableau.current) window.clearTimeout(minuterieTableau.current);
      minuterieTableau.current = null;
    };
  }, [rangsTableau]);

  useEffect(() => {
    if (!rangsTableauDate) return undefined;
    if (minuterieTableauDate.current) window.clearTimeout(minuterieTableauDate.current);
    minuterieTableauDate.current = window.setTimeout(
      () => setRangsTableauDate(false),
      3600,
    );
    return () => {
      if (minuterieTableauDate.current) window.clearTimeout(minuterieTableauDate.current);
      minuterieTableauDate.current = null;
    };
  }, [rangsTableauDate]);

  useEffect(() => {
    if (!clicCopie) return undefined;
    if (minuterieClic.current) window.clearTimeout(minuterieClic.current);
    minuterieClic.current = window.setTimeout(() => setClicCopie(null), 3600);
    return () => {
      if (minuterieClic.current) window.clearTimeout(minuterieClic.current);
      minuterieClic.current = null;
    };
  }, [clicCopie]);

  useEffect(() => {
    if (!ancienneCopiee) return undefined;
    if (minuterieAncienne.current) window.clearTimeout(minuterieAncienne.current);
    minuterieAncienne.current = window.setTimeout(
      () => setAncienneCopiee(false),
      3600,
    );
    return () => {
      if (minuterieAncienne.current) window.clearTimeout(minuterieAncienne.current);
      minuterieAncienne.current = null;
    };
  }, [ancienneCopiee]);

  useEffect(() => {
    if (!recenteCopiee) return undefined;
    if (minuterieRecente.current) window.clearTimeout(minuterieRecente.current);
    minuterieRecente.current = window.setTimeout(() => setRecenteCopiee(false), 3600);
    return () => {
      if (minuterieRecente.current) window.clearTimeout(minuterieRecente.current);
      minuterieRecente.current = null;
    };
  }, [recenteCopiee]);

  useEffect(() => {
    if (!extremesCopiees) return undefined;
    if (minuterieExtremes.current) window.clearTimeout(minuterieExtremes.current);
    minuterieExtremes.current = window.setTimeout(() => setExtremesCopiees(false), 3600);
    return () => {
      if (minuterieExtremes.current) window.clearTimeout(minuterieExtremes.current);
      minuterieExtremes.current = null;
    };
  }, [extremesCopiees]);

  useEffect(() => () => {
    if (minuterie.current) window.clearTimeout(minuterie.current);
    if (minuterieOubli.current) window.clearTimeout(minuterieOubli.current);
    if (minuterieRouvre.current) window.clearTimeout(minuterieRouvre.current);
    if (minuterieRouvertes.current) window.clearTimeout(minuterieRouvertes.current);
    if (minuterieZero.current) window.clearTimeout(minuterieZero.current);
    if (minuterieCsv.current) window.clearTimeout(minuterieCsv.current);
    if (minuterieCsvOuvertes.current) window.clearTimeout(minuterieCsvOuvertes.current);
    if (minuterieRangs.current) window.clearTimeout(minuterieRangs.current);
    if (minuterieTableau.current) window.clearTimeout(minuterieTableau.current);
    if (minuterieTableauDate.current) window.clearTimeout(minuterieTableauDate.current);
    if (minuterieClic.current) window.clearTimeout(minuterieClic.current);
    if (minuterieAncienne.current) window.clearTimeout(minuterieAncienne.current);
    if (minuterieRecente.current) window.clearTimeout(minuterieRecente.current);
    if (minuterieExtremes.current) window.clearTimeout(minuterieExtremes.current);
  }, []);

  /* Le geste d'oubli : le premier clic demande, le second efface le carnet de
     cet appareil. Les cases cochées restent — on ne repart que d'un carnet de
     gestes vierge, pas d'une relecture vierge. */
  const oublierGestes = () => {
    if (gestes.length === 0) return;
    if (!oubli) {
      setOubli(true);
      if (minuterieOubli.current) window.clearTimeout(minuterieOubli.current);
      minuterieOubli.current = window.setTimeout(() => setOubli(false), 5000);
      return;
    }
    if (minuterieOubli.current) window.clearTimeout(minuterieOubli.current);
    setOubli(false);
    setGesteVu(null);
    setCarteOuverte(null);
    setRemisZero(new Date().toISOString());
    setGestes([]);
    effacerGestesBande();
  };

  /* Le geste de la date d'une tranche : sa carte datée se déplie sous elle,
     ou se referme. Deux tranches ne l'ouvrent pas à la fois. */
  const basculerCarte = (cle: string) => {
    const ouvre = carteOuverte !== cle;
    setCarteOuverte(ouvre ? cle : null);
    /* Une carte refermée rend le tri à son état neutre : la tranche suivante
       ne s'ouvre pas sur le resserrement de la précédente. */
    if (!ouvre) setTriGestes('tous');
  };

  /* La porte du CSV de tranche : elle n'emporte que la tranche affichée — ses
     écrans, leurs cases et ses gestes datés —, pour relire une tournée agitée
     dans son propre fichier. */
  const emporterTranche = (de: number, a: number) => {
    try {
      telechargerRelectureCsvTranche(de, a);
      setCsvFait(true);
    } catch {
      setCsvFait(false);
    }
  };

  /* La porte des tranches ouvertes : un seul fichier, toutes celles qui
     gardent au moins un écran non fermé — ce qui reste vraiment à finir,
     au lieu des trente écrans ou d'une seule tranche. */
  const emporterOuvertes = () => {
    try {
      /* L'ordre retenu descend jusqu'à la feuille : le fichier emporte les
         tranches comme la tête et les marques les rangent, et sa ligne de tête
         dit lequel. */
      telechargerRelectureCsvTranchesOuvertes(triOuvertes);
      setCsvOuvertesFait(true);
    } catch {
      setCsvOuvertesFait(false);
    }
  };

  /* La porte de réouverture : le premier clic demande, le second rend ouverts
     tous les écrans des tranches encore ouvertes. Les tranches finies des deux
     côtés restent telles quelles — on ne défait pas un travail achevé. */
  const rouvrirOuvertes = () => {
    if (!onRouvrirOuvertes) return;
    if (!rouvre) {
      setRouvre(true);
      setRouvertesFait(false);
      if (minuterieRouvre.current) window.clearTimeout(minuterieRouvre.current);
      minuterieRouvre.current = window.setTimeout(() => setRouvre(false), 5000);
      return;
    }
    if (minuterieRouvre.current) window.clearTimeout(minuterieRouvre.current);
    setRouvre(false);
    onRouvrirOuvertes();
    setRouvertesFait(true);
  };

  /* La porte de copie des rangs restants : la liste part dans le
     presse-papiers, prête à coller dans un message, tranche par tranche. Le
     geste répond vrai ou faux, sans jamais laisser l'écran sans mot. */
  const copierRangs = () => {
    /* La liste collée emporte l'ordre retenu : son en-tête le dit, pour qu'un
       message se relise seul, sans la tête de frise. */
    copierRangsOuverts(etat, triOuvertes)
      .then((fait) => setRangsCopies(fait))
      .catch(() => setRangsCopies(false));
  };

  /* La même liste, mais en tableau : une ligne par écran, avec son rang, son
     nom et le côté qui manque. Le geste répond vrai ou faux, comme celui de
     la porte voisine. */
  const copierTableau = () => {
    copierRangsTableau(etat)
      .then((fait) => setRangsTableau(fait))
      .catch(() => setRangsTableau(false));
  };

  /* Le tableau daté : les mêmes rangs, avec la date du dernier geste de
     chaque tranche en quatrième colonne — de quoi voir quelles tranches ont
     bougé récemment et lesquelles attendent depuis longtemps. */
  const copierTableauDate = () => {
    copierRangsTableauDate(etat, triOuvertes)
      .then((fait) => setRangsTableauDate(fait))
      .catch(() => setRangsTableauDate(false));
  };

  /* Un seul clic, emporté seul : sa date, son sens, son total d'écrans et ses
     tranches une à une — sans les autres gestes de la carte ni le reste de la
     feuille. La ligne du clic répond un instant, et rien d'autre ne bouge. */
  const copierClic = (geste: RelectureGeste) => {
    copierClicSeul(gestes, geste)
      .then((fait) => setClicCopie(fait ? geste.at : null))
      .catch(() => setClicCopie(null));
  };

  /* La tranche la plus ancienne encore ouverte, emportée seule : son nom, la
     date de son dernier geste et les rangs qu'il reste à fermer, côté qui
     manque compris — de quoi la fermer sans parcourir la frise ni déplier sa
     carte. La porte répond vrai ou faux, comme celles du tableau. */
  const copierPlusAncienne = () => {
    if (!plusAncienneOuverte) return;
    const { bande, geste } = plusAncienneOuverte;
    copierTrancheAncienne(etat, { id: bande.id, de: bande.de, a: bande.a }, geste)
      .then((fait) => setAncienneCopiee(fait))
      .catch(() => setAncienneCopiee(false));
  };

  /* Le geste du tri des portes : il range les deux boutons de la tête — la
     plus ancienne d'abord, ou la plus récente —, et l'appareil garde l'ordre
     pour la prochaine ouverture. */
  const choisirTriPortes = (sens: TriPortesCopie) => {
    setTriPortes(sens);
    saveTriPortesCopie(sens);
  };

  /* Le geste du tri des tranches ouvertes : il range les pastilles de la tête
     dans l'ordre du plan, ou la fin d'abord, et l'appareil garde l'ordre pour
     la prochaine ouverture. */
  const choisirTriOuvertes = (sens: TriTranchesOuvertes) => {
    setTriOuvertes(sens);
    saveTriTranchesOuvertes(sens);
    /* L'instant du choix se relit sur l'appareil : la gomme sait ainsi depuis
       quand l'ordre qu'elle efface était tenu. */
    setTriDepuis(sens === 'fin' ? readTriTranchesOuvertesDepuis() : null);
  };

  /* La porte symétrique : la tranche ouverte touchée le plus récemment — le
     pendant de la plus ancienne. L'une dit ce qui traîne, l'autre ce qui vient
     de bouger, et toutes deux emportent la même feuille d'une seule tranche. */
  const copierPlusRecente = () => {
    if (!plusRecenteOuverte) return;
    const { bande, geste } = plusRecenteOuverte;
    copierTrancheRecente(etat, { id: bande.id, de: bande.de, a: bande.a }, geste)
      .then((fait) => setRecenteCopiee(fait))
      .catch(() => setRecenteCopiee(false));
  };

  /* La porte des deux extrêmes : elle emporte d'un même geste les deux bords du
     carnet — la tranche qui attend depuis le plus longtemps et celle qui vient
     de bouger —, chacune écrite prête à être refermée. */
  const copierLesExtremes = () => {
    if (!plusAncienneOuverte || !plusRecenteOuverte) return;
    const ancienne = plusAncienneOuverte;
    const recente = plusRecenteOuverte;
    copierTranchesExtremes(
      etat,
      { id: ancienne.bande.id, de: ancienne.bande.de, a: ancienne.bande.a },
      ancienne.geste,
      { id: recente.bande.id, de: recente.bande.de, a: recente.bande.a },
      recente.geste,
    )
      .then((fait) => setExtremesCopiees(fait))
      .catch(() => setExtremesCopiees(false));
  };

  /* Le geste d'une pastille de sens : elle ouvre la carte datée de sa tranche,
     déjà rangée sur ce sens-là — les fermetures d'un côté, les réouvertures de
     l'autre —, au lieu de laisser le relecteur retrouver la tranche plus bas
     puis re-cliquer le tri. Une tranche qu'aucun geste n'a touchée n'a rien à
     dater : la pastille se contente de l'amener sous les yeux. */
  const ouvrirCarteBande = (
    de: number,
    a: number,
    sens: 'ferme' | 'rouvert' | 'aucun',
  ) => {
    if (sens === 'aucun') {
      setCarteOuverte(null);
      setTriGestes('tous');
    } else {
      setCarteOuverte(cleTranche(de, a));
      setTriGestes(sens);
    }
    /* La carte s'ouvre plus bas dans la frise : un léger défilement l'amène
       sous les yeux, sans quoi la pastille semblerait ne rien faire. */
    window.setTimeout(() => {
      document
        .querySelector(
          sens === 'aucun' ? '.suivi-rl-frise-bandes' : '.suivi-rl-frise-gestes',
        )
        ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 80);
  };

  /* La porte de la tête : elle ouvre la carte datée de la tranche du dernier
     geste, déjà rangée sur ce même sens — on retombe sur ce clic-là, avec sa
     date, les écrans touchés et le compte atteint. */
  const ouvrirCarteGeste = (geste: RelectureGeste) => {
    setCarteOuverte(cleTranche(geste.de, geste.a));
    setTriGestes(geste.ferme ? 'ferme' : 'rouvert');
    /* La carte s'ouvre plus bas dans la frise : un léger défilement l'amène
       sous les yeux, sans quoi la porte semblerait ne rien faire. */
    window.setTimeout(() => {
      document
        .querySelector('.suivi-rl-frise-gestes')
        ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 80);
  };

  /* Le délai écoulé depuis un geste, dit en une seule unité : une date seule
     ne dit pas si la tranche a bougé il y a une heure ou trois semaines. */
  const direDelai = (iso: string): string => {
    const delai = delaiDepuis(iso);
    if (!delai) return '';
    const cle =
      delai.unite === 'instant'
        ? 'Instant'
        : delai.unite === 'min'
          ? 'Min'
          : delai.unite === 'h'
            ? 'H'
            : 'J';
    return t(`ad.suivi.rlFriseDelai${cle}`).replace('{n}', String(delai.n));
  };

  /* L'écart entre deux instants, dit en une durée sèche — « 2 h », « 3 j » —,
     sans « il y a » : la frise date une réouverture par rapport à la fermeture
     qui l'a précédée, pas par rapport à maintenant. */
  const direEcart = (avant: string, apres: string): string => {
    const ecart = delaiDepuis(avant, new Date(apres).getTime());
    if (!ecart) return '';
    const cle =
      ecart.unite === 'instant'
        ? 'Instant'
        : ecart.unite === 'min'
          ? 'Min'
          : ecart.unite === 'h'
            ? 'H'
            : 'J';
    return t(`ad.suivi.rlFriseEcart${cle}`).replace('{n}', String(ecart.n));
  };

  const nomEtat = {
    deux: 'ad.suivi.rlFriseDeux',
    un: 'ad.suivi.rlFriseUn',
    rien: 'ad.suivi.rlFriseRien',
  } as const;

  /* Le dernier geste de tranche, relu sur le carnet de l'appareil : la tête
     de la frise le rappelle — quand, quelle tranche, et ce qu'il a fait —,
     pour retrouver une tournée fermée d'un trait sans la chercher dans les
     gestes datés. */
  const gestesLus =
    triDernier === 'tous'
      ? gestes
      : gestes.filter((geste) => (triDernier === 'ferme' ? geste.ferme : !geste.ferme));
  const dernier = gestesLus[0] ?? null;
  /* Combien de tranches le dernier clic a touchées : une réouverture groupée
     note une tranche à la fois, toutes sous le même instant — la ligne du
     dernier geste dit ainsi « 3 tranches d'un seul clic » plutôt que de
     laisser croire à trois gestes séparés. */
  const tranchesDuClic = dernier ? tranchesDuMemeInstant(gestes, dernier) : 0;
  const tourneeDuGeste = dernier ? tourneeDeRang(dernier.de) : null;
  /* Ce que la tranche du dernier geste porte : combien de gestes en tout, et
     combien du sens choisi. Le survol de « Carte datée » le dit avant d'ouvrir
     la carte, au lieu de laisser le relecteur la déplier pour compter. */
  const gestesDerniereTranche = dernier
    ? gestes.filter((geste) => geste.de === dernier.de && geste.a === dernier.a)
    : [];
  const gestesDerniereTrancheSens = dernier
    ? gestesDerniereTranche.filter((geste) => geste.ferme === dernier.ferme).length
    : 0;
  /* Le plus ancien geste retenu ferme le carnet : avec le compte, il dit ce
     que « Oublier les gestes » emporterait — combien de gestes, et depuis
     quand le plus ancien attend. */
  const plusAncien = gestes.length > 0 ? gestes[gestes.length - 1] : null;
  /* La tranche affichée par la frise quand une tournée est ouverte : la porte
     du CSV n'emporte qu'elle, et se tait quand les trente écrans sont rendus. */
  const trancheAffichee = tournee !== null ? tourneeParId(tournee) : null;
  /* Les gestes que la porte du CSV emportera avec la tranche affichée : leur
     nombre et le jour du plus ancien se lisent au survol, avant d'emporter
     le fichier. */
  const gestesTranche = trancheAffichee
    ? gestes.filter(
        (geste) => geste.de === trancheAffichee.de && geste.a === trancheAffichee.a,
      )
    : [];
  const plusAncienTranche =
    gestesTranche.length > 0 ? gestesTranche[gestesTranche.length - 1] : null;
  /* Les tranches encore ouvertes, comptées par le sens de leur dernier geste :
     la tête dit ainsi combien de tranches restent à finir, et si elles
     attendent du côté des fermetures ou de celui des réouvertures. */
  const bandesOuvertes = BANDES.filter((bande) => {
    const lignes = RELECTURE_LIGNES.filter(
      (ligne) => ligne.n >= bande.de && ligne.n <= bande.a,
    );
    if (lignes.length === 0) return false;
    return lignes.some(
      (ligne) => !estRelue(etat, 'ar', ligne.n) || !estRelue(etat, 'en', ligne.n),
    );
  });
  /* Chaque tranche encore ouverte avec le sens de son dernier geste : la tête
     de frise nomme ainsi la tranche et son sens, au lieu de ne donner que deux
     chiffres à additionner. */
  const ouvertesDetail = bandesOuvertes.map((bande) => {
    const geste =
      gestes.find((entree) => entree.de === bande.de && entree.a === bande.a) ?? null;
    const sens: 'ferme' | 'rouvert' | 'aucun' = geste
      ? geste.ferme
        ? 'ferme'
        : 'rouvert'
      : 'aucun';
    return { bande, sens };
  });
  const tranchesOuvertes = ouvertesDetail.map((entree) => entree.sens);
  /* Les mêmes tranches, dans l'ordre choisi pour la tête : celui du plan — de
     la première tranche à la dernière —, ou la fin d'abord, la tranche la plus
     avancée dans le plan en tête. Les deux listes portent les mêmes entrées :
     seul le rangement change. */
  const ouvertesDetailTriees =
    triOuvertes === 'fin'
      ? [...ouvertesDetail].sort(
          (a, b) => b.bande.a - a.bande.a || b.bande.de - a.bande.de,
        )
      : ouvertesDetail;
  /* Le même ordre descend jusqu'aux marques elles-mêmes : la frise se lit
     comme les pastilles de la tête, et le geste porte sur les tranches, pas
     seulement sur leur rangement d'en haut. */
  const bandesTriees =
    triOuvertes === 'fin'
      ? [...BANDES].sort((a, b) => b.a - a.a || b.de - a.de)
      : BANDES;
  /* Le poids du rangement, lu sur les tranches encore ouvertes : combien
     d'entre elles ne tombent pas au même rang dans l'ordre du plan et dans
     l'ordre retenu. Le chiffre se lit à côté des deux pastilles, pour que le
     tri dise son effet avant même d'ouvrir un fichier. */
  const ouvertesFrise: TrancheFrise[] = bandesOuvertes.map((bande) => ({
    id: bande.id,
    de: bande.de,
    a: bande.a,
  }));
  const deplaceesTri = tranchesDeplaceesParTri(ouvertesFrise, triOuvertes);
  /* Les deux bornes de l'ordre retenu : la tranche qui l'ouvre et celle qui
     le ferme. Le survol de la pastille de position les nomme, pour que le
     rangement se lise des deux côtés et pas seulement par son compte. */
  const bornesTri = bornesOrdreEcrit(ouvertesFrise, triOuvertes);
  /* La tranche rangée qui garde le plus d'écrans encore ouverts : la pastille
     de position la nomme au survol, à côté du poids du tri et de ses deux
     bornes — le rangement dit aussi laquelle pèse le plus dans ce qui reste. */
  const gardeuseTri = trancheQuiGardeLePlus(etat, ouvertesFrise, triOuvertes);
  /* La tranche la plus légère, lue sur le même ordre que la plus chargée : le
     survol du tableau daté nomme les deux bords du rangement, et la ligne de
     synthèse se relit depuis l'un comme depuis l'autre. */
  const legereTri = trancheQuiGardeLeMoins(etat, ouvertesFrise, triOuvertes);
  const ecartLegere = legereTri && gardeuseTri
    ? Math.max(gardeuseTri.n - legereTri.n, 0)
    : 0;
  /* La dispersion des écarts, lue sur le même rangement : le survol de la
     colonne « Écart au plus chargé » du tableau daté la donne d'un seul regard
     — l'écart moyen, et l'étendue des écarts —, sans soustraire les nombres
     de la synthèse. */
  const dispersionTri = dispersionEcarts(etat, ouvertesFrise, triOuvertes);
  /* La tranche que le tri en cours a déplacée le plus récemment : parmi celles
     que le rangement remue, celle dont le dernier geste est le plus frais. La
     ligne du dernier geste la nomme, de quoi voir de quel côté du plan l'ordre
     vient de bouger. */
  const deplaceeRecente = trancheDeplaceePlusRecente(etat, triOuvertes, gestes);
  const nomDeplacee = deplaceeRecente
    ? etiquetteTournee(deplaceeRecente.tranche.de) ||
      t('ad.suivi.rlFriseLastHors')
        .replace('{de}', String(deplaceeRecente.tranche.de))
        .replace('{a}', String(deplaceeRecente.tranche.a))
    : '';

  /* Ce que la porte des tranches ouvertes emportera : combien de tranches,
     combien d'écrans encore ouverts, et combien de gestes datés les ont déjà
     remuées. */
  const ecransOuvertsOuvertes = RELECTURE_LIGNES.filter(
    (ligne) =>
      bandesOuvertes.some((bande) => ligne.n >= bande.de && ligne.n <= bande.a) &&
      (!estRelue(etat, 'ar', ligne.n) || !estRelue(etat, 'en', ligne.n)),
  ).length;
  const gestesOuvertes = gestes.filter((geste) =>
    bandesOuvertes.some((bande) => geste.de === bande.de && geste.a === bande.a),
  ).length;
  /* Les cases cochées que la réouverture retirerait : chaque écran de ces
     tranches-là peut en porter deux, l’arabe et l’anglais, et la porte les
     enlève toutes. Le chiffre se lit sous elle avant le second clic. */
  const casesOuvertes = RELECTURE_LIGNES.filter((ligne) =>
    bandesOuvertes.some((bande) => ligne.n >= bande.de && ligne.n <= bande.a),
  ).reduce(
    (total, ligne) =>
      total +
      (estRelue(etat, 'ar', ligne.n) ? 1 : 0) +
      (estRelue(etat, 'en', ligne.n) ? 1 : 0),
    0,
  );
  const ouvertesFermees = tranchesOuvertes.filter((sens) => sens === 'ferme').length;
  const ouvertesRouvertes = tranchesOuvertes.filter((sens) => sens === 'rouvert').length;
  /* La tranche encore ouverte qui attend depuis le plus longtemps : celle dont
     le dernier geste est le plus ancien de tout le carnet. La ligne du dernier
     geste la nomme à côté du compte, pour que l'œil voie ce qui traîne sans
     parcourir les trente marques ni déplier les cartes. */
  const plusAncienneOuverte = bandesOuvertes.reduce<{
    bande: Bande;
    geste: RelectureGeste;
  } | null>((acc, bande) => {
    const geste =
      gestes.find((entree) => entree.de === bande.de && entree.a === bande.a) ?? null;
    if (!geste) return acc;
    if (!acc) return { bande, geste };
    return new Date(geste.at).getTime() < new Date(acc.geste.at).getTime()
      ? { bande, geste }
      : acc;
  }, null);
  const nomAncienne = plusAncienneOuverte
    ? etiquetteTournee(plusAncienneOuverte.bande.de) ||
      t('ad.suivi.rlFriseLastHors')
        .replace('{de}', String(plusAncienneOuverte.bande.de))
        .replace('{a}', String(plusAncienneOuverte.bande.a))
    : '';
  /* La tranche ouverte touchée le plus récemment : le pendant de la plus
     ancienne. Elle se lit sur le même carnet, avec la même règle — un geste
     noté, sinon la tranche ne dit rien de son passage. */
  const plusRecenteOuverte = bandesOuvertes.reduce<{
    bande: Bande;
    geste: RelectureGeste;
  } | null>((acc, bande) => {
    const geste =
      gestes.find((entree) => entree.de === bande.de && entree.a === bande.a) ?? null;
    if (!geste) return acc;
    if (!acc) return { bande, geste };
    return new Date(geste.at).getTime() > new Date(acc.geste.at).getTime()
      ? { bande, geste }
      : acc;
  }, null);
  const nomRecente = plusRecenteOuverte
    ? etiquetteTournee(plusRecenteOuverte.bande.de) ||
      t('ad.suivi.rlFriseLastHors')
        .replace('{de}', String(plusRecenteOuverte.bande.de))
        .replace('{a}', String(plusRecenteOuverte.bande.a))
    : '';
  /* Ce que chaque porte emporte réellement : les écrans encore à fermer de sa
     tranche. Le chiffre se lit sur le bouton, à côté du libellé, pour que le
     relecteur sache l'étendue de la tranche avant de la copier. */
  const ecransAncienne = plusAncienneOuverte
    ? rangsOuvertsTranche(etat, {
        id: plusAncienneOuverte.bande.id,
        de: plusAncienneOuverte.bande.de,
        a: plusAncienneOuverte.bande.a,
      }).length
    : 0;
  const ecransRecente = plusRecenteOuverte
    ? rangsOuvertsTranche(etat, {
        id: plusRecenteOuverte.bande.id,
        de: plusRecenteOuverte.bande.de,
        a: plusRecenteOuverte.bande.a,
      }).length
    : 0;
  /* Quand une seule tranche est à la fois la plus ancienne et la plus
     récemment touchée, la porte des extrêmes ne la compte qu'une fois — sinon
     son chiffre doublerait les mêmes écrans. */
  const memeExtreme =
    plusAncienneOuverte !== null &&
    plusRecenteOuverte !== null &&
    plusAncienneOuverte.bande.de === plusRecenteOuverte.bande.de &&
    plusAncienneOuverte.bande.a === plusRecenteOuverte.bande.a;
  const ecransExtremes =
    plusAncienneOuverte && plusRecenteOuverte
      ? ecransAncienne + (memeExtreme ? 0 : ecransRecente)
      : 0;
  /* Ce que la porte des extrêmes emporte, lu en tranches et non en écrans :
     deux bords du carnet, ou un seul quand la même tranche est à la fois la
     plus ancienne et la plus récemment touchée. Le bouton dit ce nombre-là —
     l'étendue du geste se compte en tranches. */
  const tranchesExtremes =
    plusAncienneOuverte && plusRecenteOuverte ? (memeExtreme ? 1 : 2) : 0;

  /* Les deux portes de copie d'une seule tranche : l'une désigne ce qui attend
     depuis le plus longtemps, l'autre ce qui vient de bouger. Le tri de la tête
     décide laquelle ouvre, et l'appareil retient ce choix. */
  const porteAncienne = plusAncienneOuverte ? (
    <button
      type="button"
      className="suivi-rl-frise-copy"
      data-variant="ancienne"
      data-fait={ancienneCopiee ? 'yes' : 'no'}
      title={`${t('ad.suivi.rlFriseAncienneCopierHint')
        .replace('{tranche}', nomAncienne)
        .replace('{delai}', direDelai(plusAncienneOuverte.geste.at))} ${t(
        'ad.suivi.rlFriseAncienneCopierCount',
      ).replace('{n}', String(ecransAncienne))}`}
      onClick={copierPlusAncienne}
    >
      <i
        className={ancienneCopiee ? 'ri-check-line' : 'ri-file-copy-line'}
        aria-hidden="true"
      ></i>
      <span className="whitespace-nowrap">
        {ancienneCopiee
          ? t('ad.suivi.rlFriseAncienneCopies')
          : t('ad.suivi.rlFriseAncienneCopierNDelai')
              .replace('{n}', String(ecransAncienne))
              .replace('{delai}', direDelai(plusAncienneOuverte.geste.at))}
      </span>
    </button>
  ) : null;

  /* La porte symétrique, dont le libellé porte maintenant l'ancienneté de la
     tranche : le bouton dit depuis combien de temps elle a bougé, sans
     attendre le survol. */
  const porteRecente = plusRecenteOuverte ? (
    <button
      type="button"
      className="suivi-rl-frise-copy"
      data-variant="recente"
      data-fait={recenteCopiee ? 'yes' : 'no'}
      title={`${t('ad.suivi.rlFriseRecenteCopierHint')
        .replace('{tranche}', nomRecente)
        .replace('{delai}', direDelai(plusRecenteOuverte.geste.at))} ${t(
        'ad.suivi.rlFriseRecenteCopierCount',
      ).replace('{n}', String(ecransRecente))}`}
      onClick={copierPlusRecente}
    >
      <i
        className={recenteCopiee ? 'ri-check-line' : 'ri-file-copy-line'}
        aria-hidden="true"
      ></i>
      <span className="whitespace-nowrap">
        {recenteCopiee
          ? t('ad.suivi.rlFriseRecenteCopies')
          : t('ad.suivi.rlFriseRecenteCopierNDelai')
              .replace('{n}', String(ecransRecente))
              .replace('{delai}', direDelai(plusRecenteOuverte.geste.at))}
      </span>
    </button>
  ) : null;

  return (
    <div className="suivi-rl-frise" dir="ltr">
      <div className="suivi-rl-frise-head">
        <h4 className="suivi-rl-frise-title">
          <i className="ri-layout-grid-line" aria-hidden="true"></i>
          <span>{t('ad.suivi.rlFriseTitle')}</span>
        </h4>
        <span className="admin-muted suivi-rl-frise-note">{t('ad.suivi.rlFriseNote')}</span>
        {/* Ce que le carnet retient, et depuis quand : le jour du plus ancien
            geste se lit ici, pour savoir ce qu'un oubli emporterait. */}
        {plusAncien && (
          <span
            className="admin-muted suivi-rl-frise-book"
            title={t('ad.suivi.rlFriseBookHint')
              .replace('{n}', String(gestes.length))
              .replace('{jour}', jourGeste(plusAncien.at))
              .replace('{recent}', jourGeste(gestes[0].at))}
          >
            <i className="ri-archive-2-line" aria-hidden="true"></i>
            {t('ad.suivi.rlFriseBook')
              .replace('{n}', String(gestes.length))
              .replace('{jour}', jourGeste(plusAncien.at))
              .replace('{recent}', jourGeste(gestes[0].at))}
          </span>
        )}
        {/* Le tri par sens de la tête : la ligne du dernier geste se lit par
            fermetures ou par réouvertures, quand le carnet mêle les deux. */}
        {gestes.length > 0 && (
          <span className="suivi-rl-frise-head-tri" title={t('ad.suivi.rlFriseLastSortHint')}>
            {(['tous', 'ferme', 'rouvert'] as const).map((sens) => (
              <button
                key={sens}
                type="button"
                className="suivi-rl-frise-gestes-sens"
                data-sens={sens}
                data-on={triDernier === sens ? 'yes' : 'no'}
                aria-pressed={triDernier === sens}
                title={t('ad.suivi.rlFriseLastSortHint')}
                onClick={() => setTriDernier(sens)}
              >
                <span className="whitespace-nowrap">
                  {t(
                    sens === 'tous'
                      ? 'ad.suivi.rlFriseGestesSortAll'
                      : sens === 'ferme'
                        ? 'ad.suivi.rlFriseGestesSortFerme'
                        : 'ad.suivi.rlFriseGestesSortRouvert',
                  )}
                </span>
              </button>
            ))}
          </span>
        )}
        {/* Les tranches encore ouvertes, comptées par le sens de leur dernier
            geste : la tête dit ainsi combien de tranches restent à finir, et
            de quel côté elles attendent. */}
        {gestes.length > 0 && (
          <span
            className="admin-muted suivi-rl-frise-ouvertes"
            title={t('ad.suivi.rlFriseOuvertesHint')}
          >
            <i className="ri-layout-grid-line" aria-hidden="true"></i>
            {tranchesOuvertes.length === 0
              ? t('ad.suivi.rlFriseOuvertesNone')
              : t('ad.suivi.rlFriseOuvertes')
                  .replace('{n}', String(tranchesOuvertes.length))
                  .replace('{ferme}', String(ouvertesFermees))
                  .replace('{rouvert}', String(ouvertesRouvertes))}
          </span>
        )}
        {/* L'ordre des pastilles : celui du plan, ou la fin d'abord — la
            tranche la plus avancée dans le plan en tête. Le choix reste sur
            cet appareil d'une visite à l'autre. */}
        {bandesOuvertes.length > 1 && (
          <span
            className="suivi-rl-frise-head-tri"
            title={t('ad.suivi.rlFriseOuvertesTriHint')}
          >
            {(['plan', 'fin'] as const).map((sens) => (
              <button
                key={sens}
                type="button"
                className="suivi-rl-frise-gestes-sens"
                data-on={triOuvertes === sens ? 'yes' : 'no'}
                aria-pressed={triOuvertes === sens}
                title={t('ad.suivi.rlFriseOuvertesTriHint')}
                onClick={() => choisirTriOuvertes(sens)}
              >
                <span className="whitespace-nowrap">
                  {t(
                    sens === 'plan'
                      ? 'ad.suivi.rlFriseOuvertesTriPlan'
                      : 'ad.suivi.rlFriseOuvertesTriFin',
                  )}
                </span>
              </button>
            ))}
            {/* La petite gomme : d'un seul clic, l'ordre revient à celui du
                plan — les pastilles et les tranches de la frise ensemble. Elle
                ne paraît que quand il y a quelque chose à gommer. */}
            {triOuvertes === 'fin' && (
              <button
                type="button"
                className="suivi-rl-frise-tri-gomme"
                title={`${t('ad.suivi.rlFriseOuvertesTriGommeHint').replace(
                  '{n}',
                  String(bandesOuvertes.length),
                )}${
                  triDepuis
                    ? ` ${t('ad.suivi.rlFriseOuvertesTriGommeDepuis').replace(
                        '{depuis}',
                        `${jourGeste(triDepuis)} (${direDelai(triDepuis)})`,
                      )}`
                    : ''
                }`}
                onClick={() => choisirTriOuvertes('plan')}
              >
                <i className="ri-eraser-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">
                  {t('ad.suivi.rlFriseOuvertesTriGomme')}
                </span>
              </button>
            )}
            {/* Le poids du rangement : combien de tranches le tri en cours a
                réellement déplacées. Le compte se tient là, à côté des deux
                pastilles — le tri dit son effet avant d'ouvrir un fichier. */}
            <span
              className="suivi-rl-frise-tri-poids"
              data-on={deplaceesTri > 0 ? 'yes' : 'no'}
              title={`${t('ad.suivi.rlFriseOuvertesTriPoidsHint')
                .replace('{n}', String(deplaceesTri))
                .replace('{tranches}', String(bandesOuvertes.length))
                .replace(
                  '{ordre}',
                  t(
                    triOuvertes === 'fin'
                      ? 'ad.suivi.rlFriseOuvertesTriFin'
                      : 'ad.suivi.rlFriseOuvertesTriPlan',
                  ),
                )}${bornesTri
                ? ` ${t('ad.suivi.rlFriseOuvertesTriPoidsBornes')
                    .replace('{ouvre}', bornesTri.ouvre)
                    .replace('{ferme}', bornesTri.ferme)}`
                : ''}${
                ecransOuvertsOuvertes > 0
                  ? ` ${t('ad.suivi.rlFriseOuvertesTriPoidsEcrans')
                      .replace('{tranches}', String(bandesOuvertes.length))
                      .replace('{ecrans}', String(ecransOuvertsOuvertes))}`
                  : ''
              }${
                gardeuseTri
                  ? ` ${t('ad.suivi.rlFriseOuvertesTriPoidsGarde')
                      .replace(
                        '{tranche}',
                        etiquetteTournee(gardeuseTri.tranche.de) ||
                          t('ad.suivi.rlFriseLastHors')
                            .replace('{de}', String(gardeuseTri.tranche.de))
                            .replace('{a}', String(gardeuseTri.tranche.a)),
                      )
                      .replace('{n}', String(gardeuseTri.n))}`
                  : ''
              }`}
            >
              <i className="ri-swap-2-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">
                {deplaceesTri === 0
                  ? t('ad.suivi.rlFriseOuvertesTriPoidsNone')
                  : t('ad.suivi.rlFriseOuvertesTriPoids').replace(
                      '{n}',
                      String(deplaceesTri),
                    )}
              </span>
            </span>
          </span>
        )}
        {/* Le sens du dernier geste de chacune des tranches encore ouvertes,
            nommée une à une : les deux chiffres au-dessus disent combien, ces
            pastilles disent lesquelles et de quel côté elles attendent. */}
        {bandesOuvertes.length > 0 && (
          <span
            className="suivi-rl-frise-ouvertes-sens"
            title={t('ad.suivi.rlFriseOuvertesSensHint')}
          >
            {ouvertesDetailTriees.map(({ bande, sens }) => {
              /* Ce que cette seule tranche garde encore ouvert, lu sur ses
                 écrans : le survol le dit à côté de son sens, sans faire
                 additionner les pastilles de la tête. */
              const ecransBande = rangsOuvertsTranche(etat, {
                id: bande.id,
                de: bande.de,
                a: bande.a,
              }).length;
              const ecransDit = t('ad.suivi.rlFriseOuvertesSensChipEcrans').replace(
                '{n}',
                String(ecransBande),
              );
              return (
                <button
                  key={bande.id === null ? 'reste' : `t${bande.id}`}
                  type="button"
                  className="suivi-rl-frise-sens-chip"
                  data-sens={sens}
                  data-carte={carteOuverte === cleTranche(bande.de, bande.a) ? 'yes' : 'no'}
                  aria-pressed={carteOuverte === cleTranche(bande.de, bande.a)}
                  title={`${
                    sens === 'aucun'
                      ? t('ad.suivi.rlFriseOuvertesSensChipAucun')
                          .replace('{de}', String(bande.de))
                          .replace('{a}', String(bande.a))
                      : t('ad.suivi.rlFriseOuvertesSensChipHint')
                          .replace('{de}', String(bande.de))
                          .replace('{a}', String(bande.a))
                          .replace(
                            '{sens}',
                            t(
                              sens === 'ferme'
                                ? 'ad.suivi.rlFriseOuvertesSensFerme'
                                : 'ad.suivi.rlFriseOuvertesSensRouvert',
                            ),
                          )
                  } ${ecransDit}`}
                  onClick={() => ouvrirCarteBande(bande.de, bande.a, sens)}
                >
                  <b>{trancheEcrite(bande.de, bande.a)}</b>
                  {t(
                    sens === 'ferme'
                      ? 'ad.suivi.rlFriseOuvertesSensFerme'
                      : sens === 'rouvert'
                        ? 'ad.suivi.rlFriseOuvertesSensRouvert'
                        : 'ad.suivi.rlFriseOuvertesSensAucun',
                  )}
                </button>
              );
            })}
          </span>
        )}
        {/* La porte d'oubli du carnet des gestes : deux clics, et la feuille
            emportée repart d'un carnet vierge. Les cases cochées restent. */}
        {gestes.length > 0 && (
          <button
            type="button"
            className="suivi-rl-frise-forget"
            data-on={oubli ? 'yes' : 'no'}
            title={t('ad.suivi.rlFriseForgetHint')}
            onClick={oublierGestes}
          >
            <i className={oubli ? 'ri-alert-line' : 'ri-eraser-line'} aria-hidden="true"></i>
            <span className="whitespace-nowrap">
              {oubli ? t('ad.suivi.rlFriseForgetConfirm') : t('ad.suivi.rlFriseForget')}
            </span>
          </button>
        )}
        {/* La porte du CSV de la tranche affichée : la feuille ne porte que
            les écrans de cette tranche et ses gestes datés, au lieu des
            trente pages et de tout le carnet. */}
        {trancheAffichee && (
          <button
            type="button"
            className="suivi-rl-frise-slice"
            data-fait={csvFait ? 'yes' : 'no'}
            title={`${t('ad.suivi.rlFriseSliceCsvHint')
              .replace('{de}', String(trancheAffichee.de))
              .replace('{a}', String(trancheAffichee.a))} ${
              plusAncienTranche
                ? t('ad.suivi.rlFriseSliceCsvGestes')
                    .replace('{n}', String(gestesTranche.length))
                    .replace('{jour}', jourGeste(plusAncienTranche.at))
                : t('ad.suivi.rlFriseSliceCsvGestesNone')
            }`}
            onClick={() => emporterTranche(trancheAffichee.de, trancheAffichee.a)}
          >
            <i
              className={csvFait ? 'ri-check-line' : 'ri-file-download-line'}
              aria-hidden="true"
            ></i>
            <span className="whitespace-nowrap">
              {csvFait ? t('ad.suivi.rlFriseSliceCsvOk') : t('ad.suivi.rlFriseSliceCsv')}
            </span>
          </button>
        )}
        {/* La porte des tranches ouvertes : un seul fichier pour toutes celles
            qui gardent un écran non fermé, au lieu des trente pages ou d'une
            seule tranche. Elle se tait quand tout est fini des deux côtés. */}
        {bandesOuvertes.length > 0 && (
          <button
            type="button"
            className="suivi-rl-frise-slice"
            data-variant="ouvertes"
            data-fait={csvOuvertesFait ? 'yes' : 'no'}
            title={`${t('ad.suivi.rlFriseOuvertesCsvHint')
              .replace('{n}', String(bandesOuvertes.length))
              .replace('{ecrans}', String(ecransOuvertsOuvertes))
              .replace('{gestes}', String(gestesOuvertes))}${
              gardeuseTri
                ? ` ${t('ad.suivi.rlFriseOuvertesCsvGarde')
                    .replace(
                      '{tranche}',
                      etiquetteTournee(gardeuseTri.tranche.de) ||
                        t('ad.suivi.rlFriseLastHors')
                          .replace('{de}', String(gardeuseTri.tranche.de))
                          .replace('{a}', String(gardeuseTri.tranche.a)),
                    )
                    .replace('{n}', String(gardeuseTri.n))}`
                : ''
            }${
              dispersionTri
                ? ` ${t('ad.suivi.rlFriseOuvertesCsvDispersion')}`
                : ''
            }`}
            onClick={emporterOuvertes}
          >
            <i
              className={csvOuvertesFait ? 'ri-check-line' : 'ri-file-download-line'}
              aria-hidden="true"
            ></i>
            <span className="whitespace-nowrap">
              {csvOuvertesFait
                ? t('ad.suivi.rlFriseOuvertesCsvOk')
                : t('ad.suivi.rlFriseOuvertesCsv').replace(
                    '{n}',
                    String(bandesOuvertes.length),
                  )}
            </span>
          </button>
        )}
        {/* Ce que ces tranches gardent encore ouvert : le nombre d'écrans qui
            restent à fermer des deux côtés, à côté de la porte qui les
            emporte — le fichier et le compte se lisent ensemble. */}
        {bandesOuvertes.length > 0 && ecransOuvertsOuvertes > 0 && (
          <span
            className="admin-muted suivi-rl-frise-ouverts"
            title={`${t('ad.suivi.rlFriseOuvertesEcransHint')
              .replace('{n}', String(ecransOuvertsOuvertes))
              .replace('{tranches}', String(bandesOuvertes.length))} ${t(
              'ad.suivi.rlFriseOuvertesRangsHint',
            ).replace('{rangs}', rangsOuvertsTranchesEcrits(etat, bandesOuvertes))}`}
          >
            <i className="ri-checkbox-blank-circle-line" aria-hidden="true"></i>
            {t('ad.suivi.rlFriseOuvertesEcrans').replace(
              '{n}',
              String(ecransOuvertsOuvertes),
            )}
          </span>
        )}
        {/* La porte qui copie la liste : les rangs encore à fermer, tranche
            par tranche, prêts à coller dans un message — de quoi demander de
            l'aide sans joindre la feuille ni décrire les trente écrans. */}
        {bandesOuvertes.length > 0 && (
          <button
            type="button"
            className="suivi-rl-frise-copy"
            data-fait={rangsCopies ? 'yes' : 'no'}
            title={`${t('ad.suivi.rlFriseRangsCopierHint')
              .replace('{n}', String(bandesOuvertes.length))
              .replace('{ecrans}', String(ecransOuvertsOuvertes))
              .replace('{ouvre}', bornesTri ? bornesTri.ouvre : '—')
              .replace('{ferme}', bornesTri ? bornesTri.ferme : '—')
              .replace(
                '{deplacees}',
                deplaceesTri === 0
                  ? t('ad.suivi.rlFriseOuvertesTriPoidsNone')
                  : t('ad.suivi.rlFriseOuvertesTriPoids').replace(
                      '{n}',
                      String(deplaceesTri),
                    ),
              )}${
              dispersionTri
                ? ` ${t('ad.suivi.rlFriseRangsCopierDispersion')}`
                : ''
            }`}
            onClick={copierRangs}
          >
            <i
              className={rangsCopies ? 'ri-check-line' : 'ri-file-copy-line'}
              aria-hidden="true"
            ></i>
            <span className="whitespace-nowrap">
              {rangsCopies
                ? t('ad.suivi.rlFriseRangsCopies')
                : t('ad.suivi.rlFriseRangsCopier')}
            </span>
          </button>
        )}
        {/* La même liste, en tableau : une ligne par écran, avec son rang, son
            nom et le côté qui manque. La porte voisine écrit des lignes
            courtes ; celle-ci rend des colonnes, prêtes pour un tableur. */}
        {bandesOuvertes.length > 0 && (
          <button
            type="button"
            className="suivi-rl-frise-copy"
            data-variant="tableau"
            data-fait={rangsTableau ? 'yes' : 'no'}
            title={t('ad.suivi.rlFriseTableauCopierHint')
              .replace('{n}', String(bandesOuvertes.length))
              .replace('{ecrans}', String(ecransOuvertsOuvertes))}
            onClick={copierTableau}
          >
            <i
              className={rangsTableau ? 'ri-check-line' : 'ri-table-line'}
              aria-hidden="true"
            ></i>
            <span className="whitespace-nowrap">
              {rangsTableau
                ? t('ad.suivi.rlFriseTableauCopies')
                : t('ad.suivi.rlFriseTableauCopier')}
            </span>
          </button>
        )}
        {/* Le même tableau, daté : une quatrième colonne dit quand la tranche
            de l’écran a bougé pour la dernière fois — quelles tranches ont été
            remuées récemment, et lesquelles attendent depuis longtemps. */}
        {bandesOuvertes.length > 0 && (
          <button
            type="button"
            className="suivi-rl-frise-copy"
            data-variant="tableau-date"
            data-fait={rangsTableauDate ? 'yes' : 'no'}
            title={`${t('ad.suivi.rlFriseTableauDateCopierHint')
              .replace('{n}', String(bandesOuvertes.length))
              .replace('{ecrans}', String(ecransOuvertsOuvertes))}${
              gardeuseTri
                ? ` ${t('ad.suivi.rlFriseTableauDateGarde')
                    .replace(
                      '{tranche}',
                      etiquetteTournee(gardeuseTri.tranche.de) ||
                        t('ad.suivi.rlFriseLastHors')
                          .replace('{de}', String(gardeuseTri.tranche.de))
                          .replace('{a}', String(gardeuseTri.tranche.a)),
                    )
                    .replace('{n}', String(gardeuseTri.n))}`
                : ''
            }${
              legereTri
                ? ` ${
                    ecartLegere === 0
                      ? t('ad.suivi.rlFriseTableauDateLegereSeule')
                          .replace(
                            '{tranche}',
                            etiquetteTournee(legereTri.tranche.de) ||
                              t('ad.suivi.rlFriseLastHors')
                                .replace('{de}', String(legereTri.tranche.de))
                                .replace('{a}', String(legereTri.tranche.a)),
                          )
                          .replace('{n}', String(legereTri.n))
                      : t('ad.suivi.rlFriseTableauDateLegere')
                          .replace(
                            '{tranche}',
                            etiquetteTournee(legereTri.tranche.de) ||
                              t('ad.suivi.rlFriseLastHors')
                                .replace('{de}', String(legereTri.tranche.de))
                                .replace('{a}', String(legereTri.tranche.a)),
                          )
                          .replace('{n}', String(legereTri.n))
                          .replace('{ecart}', String(ecartLegere))
                  }`
                : ''
            }${
              dispersionTri
                ? ` ${t('ad.suivi.rlFriseTableauDateMoyenne')
                    .replace('{n}', String(dispersionTri.tranches))
                    .replace('{moyenne}', dispersionTri.moyenne)
                    .replace('{min}', String(dispersionTri.min))
                    .replace('{max}', String(dispersionTri.max))}`
                : ''
            }`}
            onClick={copierTableauDate}
          >
            <i
              className={rangsTableauDate ? 'ri-check-line' : 'ri-calendar-2-line'}
              aria-hidden="true"
            ></i>
            <span className="whitespace-nowrap">
              {rangsTableauDate
                ? t('ad.suivi.rlFriseTableauDateCopies')
                : t('ad.suivi.rlFriseTableauDateCopier')}
            </span>
          </button>
        )}
        {/* Le tri des deux portes de copie : la plus ancienne ouvre, ou la plus
            récente — un choix de lecture, retenu sur cet appareil. */}
        {(plusAncienneOuverte || plusRecenteOuverte) && (
          <span
            className="suivi-rl-frise-head-tri"
            title={t('ad.suivi.rlFriseCopyTriHint')}
          >
            {(['ancienne', 'recente'] as const).map((sens) => (
              <button
                key={sens}
                type="button"
                className="suivi-rl-frise-gestes-sens"
                data-on={triPortes === sens ? 'yes' : 'no'}
                aria-pressed={triPortes === sens}
                title={t('ad.suivi.rlFriseCopyTriHint')}
                onClick={() => choisirTriPortes(sens)}
              >
                <span className="whitespace-nowrap">
                  {t(
                    sens === 'ancienne'
                      ? 'ad.suivi.rlFriseCopyTriAncienne'
                      : 'ad.suivi.rlFriseCopyTriRecente',
                  )}
                </span>
              </button>
            ))}
          </span>
        )}
        {/* Les deux portes de copie d'une seule tranche, rangées dans l'ordre
            choisi : l'une dit ce qui attend depuis le plus longtemps, l'autre
            ce qui vient de bouger. */}
        {triPortes === 'ancienne' ? (
          <>
            {porteAncienne}
            {porteRecente}
          </>
        ) : (
          <>
            {porteRecente}
            {porteAncienne}
          </>
        )}
        {/* La porte des deux extrêmes : un seul geste pour les deux bords du
            carnet — ce qui attend depuis le plus longtemps et ce qui vient de
            bouger —, au lieu de copier deux fois. */}
        {plusAncienneOuverte && plusRecenteOuverte && (
          <button
            type="button"
            className="suivi-rl-frise-copy"
            data-variant="extremes"
            data-fait={extremesCopiees ? 'yes' : 'no'}
            title={`${t('ad.suivi.rlFriseExtremesCopierHint')
              .replace('{ancienne}', nomAncienne)
              .replace('{delaiAncienne}', direDelai(plusAncienneOuverte.geste.at))
              .replace('{recente}', nomRecente)
              .replace('{delaiRecente}', direDelai(plusRecenteOuverte.geste.at))} ${t(
              'ad.suivi.rlFriseExtremesTranchesCount',
            ).replace('{n}', String(tranchesExtremes))} ${t(
              'ad.suivi.rlFriseExtremesCount',
            ).replace('{n}', String(ecransExtremes))}`}
            onClick={copierLesExtremes}
          >
            <i
              className={extremesCopiees ? 'ri-check-line' : 'ri-file-copy-2-line'}
              aria-hidden="true"
            ></i>
            <span className="whitespace-nowrap">
              {extremesCopiees
                ? t('ad.suivi.rlFriseExtremesCopies')
                : t('ad.suivi.rlFriseExtremesCopierTranchesDelai')
                    .replace('{n}', String(tranchesExtremes))
                    .replace(
                      '{ecart}',
                      direEcart(
                        plusAncienneOuverte.geste.at,
                        new Date().toISOString(),
                      ),
                    )}
            </span>
          </button>
        )}
        {/* La porte de réouverture des tranches ouvertes : deux clics, et
            leurs écrans repartent ouverts des deux côtés. Elle ne défait que
            ce qui n'était pas fini. */}
        {bandesOuvertes.length > 0 && onRouvrirOuvertes && (
          <span className="suivi-rl-frise-reopen-bloc">
            <button
              type="button"
              className="suivi-rl-frise-reopen"
              data-on={rouvre ? 'yes' : 'no'}
              data-fait={rouvertesFait ? 'yes' : 'no'}
              title={t('ad.suivi.rlFriseRouvrirOuvertesHint')
                .replace('{n}', String(bandesOuvertes.length))
                .replace('{ecrans}', String(ecransOuvertsOuvertes))}
              onClick={rouvrirOuvertes}
            >
              <i
                className={
                  rouvertesFait
                    ? 'ri-check-line'
                    : rouvre
                      ? 'ri-alert-line'
                      : 'ri-arrow-go-back-line'
                }
                aria-hidden="true"
              ></i>
              <span className="whitespace-nowrap">
                {rouvertesFait
                  ? t('ad.suivi.rlFriseRouvrirOuvertesOk').replace(
                      '{n}',
                      String(ecransOuvertsOuvertes),
                    )
                  : rouvre
                    ? t('ad.suivi.rlFriseRouvrirOuvertesConfirm')
                    : t('ad.suivi.rlFriseRouvrirOuvertes')}
              </span>
            </button>
            {/* Ce que le second clic retirerait, lu sous la porte avant qu'il
                ne tombe : les cases cochées de ces tranches-là, arabe et
                anglais ensemble. */}
            {rouvre && (
              <span
                className="suivi-rl-frise-reopen-cases"
                role="status"
                title={t('ad.suivi.rlFriseRouvrirCasesHint')
                  .replace('{n}', String(casesOuvertes))
                  .replace('{tranches}', String(bandesOuvertes.length))}
              >
                <i className="ri-checkbox-multiple-blank-line" aria-hidden="true"></i>
                {t('ad.suivi.rlFriseRouvrirCases').replace(
                  '{n}',
                  String(casesOuvertes),
                )}
              </span>
            )}
          </span>
        )}
      </div>

      {/* La clé se lit avant les marques : trois états, trois dessins. */}
      <div className="suivi-rl-frise-key">
        {ETATS.map((cle) => (
          <span key={cle}>
            <i data-etat={cle} aria-hidden="true"></i>
            {t(nomEtat[cle])}
          </span>
        ))}
      </div>

      {/* Le dernier geste de tranche, rappelé en tête : sa date, sa tranche,
          ce qu'il a fait. Un clic sur « Retrouver » ouvre le resserrement sur
          cette tournée — le relecteur retombe sur ce que le geste a fermé. */}
      <p
        className="suivi-rl-frise-last"
        data-sens={dernier ? (dernier.ferme ? 'ferme' : 'rouvert') : 'aucun'}
      >
        <i className="ri-history-line" aria-hidden="true"></i>
        <span>
          {dernier
            ? t('ad.suivi.rlFriseLast')
                .replace('{date}', quandGeste(dernier.at))
                .replace(
                  '{tranche}',
                  etiquetteTournee(dernier.de) ||
                    t('ad.suivi.rlFriseLastHors')
                      .replace('{de}', String(dernier.de))
                      .replace('{a}', String(dernier.a)),
                )
                .replace(
                  '{sens}',
                  t(
                    dernier.ferme
                      ? 'ad.suivi.rlFriseLastClose'
                      : 'ad.suivi.rlFriseLastReopen',
                  ),
                )
                .replace('{n}', String(dernier.n))
            : triDernier === 'tous'
              ? t('ad.suivi.rlFriseLastNone')
              : t('ad.suivi.rlFriseLastNoneSens')}
        </span>
        {/* Ce que le clic a emporté : une réouverture groupée touche plusieurs
            tranches d'un même geste, et la ligne le dit au lieu de laisser
            lire ces tranches comme des clics successifs. */}
        {dernier && tranchesDuClic > 1 && (
          <span
            className="suivi-rl-frise-last-tranches"
            title={`${t('ad.suivi.rlFriseLastTranchesHint').replace(
              '{n}',
              String(tranchesDuClic),
            )} ${t('ad.suivi.rlFriseLastTranchesDelaiHint').replace(
              '{delai}',
              direDelai(dernier.at),
            )}`}
          >
            <i className="ri-links-line" aria-hidden="true"></i>
            {t('ad.suivi.rlFriseLastTranches').replace(
              '{n}',
              String(tranchesDuClic),
            )}
            {/* Depuis quand ce clic-là a eu lieu : le nombre dit l’étendue du
                geste, ce délai dit son ancienneté — deux lectures d’un même
                clic, l’une sur l’espace, l’autre sur le temps. */}
            <span className="suivi-rl-frise-last-tranches-delai">
              {direDelai(dernier.at)}
            </span>
          </span>
        )}
        {/* La tranche encore ouverte qui attend depuis le plus longtemps : son
            nom et son délai, à côté du dernier geste — le carnet dit ainsi ce
            qui traîne, sans parcourir les trente marques ni déplier les cartes. */}
        {plusAncienneOuverte && (
          <span
            className="suivi-rl-frise-ancienne"
            title={t('ad.suivi.rlFriseAncienneHint')
              .replace('{tranche}', nomAncienne)
              .replace('{delai}', direDelai(plusAncienneOuverte.geste.at))}
          >
            <i className="ri-hourglass-line" aria-hidden="true"></i>
            {t('ad.suivi.rlFriseAncienne').replace('{tranche}', nomAncienne)}
            <span className="suivi-rl-frise-ancienne-delai">
              {direDelai(plusAncienneOuverte.geste.at)}
            </span>
          </span>
        )}
        {/* La tranche que le tri en cours a déplacée le plus récemment : son
            nom et sa date, à côté du dernier geste — le rangement dit ainsi
            laquelle de ses tranches il a remuée en dernier, sans ouvrir de
            fichier. Quand l'ordre retenu ne déplace rien, la ligne le dit. */}
        {bandesOuvertes.length > 1 && (
          <span
            className="suivi-rl-frise-deplacee"
            data-on={deplaceeRecente ? 'yes' : 'no'}
            title={
              deplaceeRecente
                ? t('ad.suivi.rlFriseLastDeplaceeHint')
                    .replace('{tranche}', nomDeplacee)
                    .replace('{date}', quandGeste(deplaceeRecente.geste.at))
                    .replace('{n}', String(deplaceesTri))
                : t('ad.suivi.rlFriseLastDeplaceeNoneHint')
            }
          >
            <i className="ri-swap-box-line" aria-hidden="true"></i>
            {deplaceeRecente ? (
              <>
                <span className="whitespace-nowrap">
                  {t('ad.suivi.rlFriseLastDeplacee')
                    .replace('{tranche}', nomDeplacee)
                    .replace('{date}', quandGeste(deplaceeRecente.geste.at))}
                </span>
                <span className="suivi-rl-frise-deplacee-delai">
                  {direDelai(deplaceeRecente.geste.at)}
                </span>
              </>
            ) : (
              <span className="whitespace-nowrap">
                {t('ad.suivi.rlFriseLastDeplaceeNone')}
              </span>
            )}
          </span>
        )}
        {dernier && tourneeDuGeste && onVoirTournee && (
          <button
            type="button"
            className="suivi-rl-frise-last-go"
            title={t('ad.suivi.rlFriseLastSeeHint').replace(
              '{de}',
              String(tourneeDuGeste.de),
            ).replace('{a}', String(tourneeDuGeste.a))}
            onClick={() => onVoirTournee(tourneeDuGeste.id)}
          >
            <i className="ri-route-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('ad.suivi.rlFriseLastSee')}</span>
          </button>
        )}
        {/* La porte de la carte : elle déplie sous la tranche du dernier geste
            sa carte datée, déjà rangée sur ce même sens — le clic se relit
            avec sa date et son compte, sans chercher la tranche plus bas. */}
        {dernier && (
          <button
            type="button"
            className="suivi-rl-frise-last-go"
            data-variant="carte"
            title={`${t('ad.suivi.rlFriseLastCardHint')
              .replace('{de}', String(dernier.de))
              .replace('{a}', String(dernier.a))
              .replace(
                '{sens}',
                t(
                  dernier.ferme
                    ? 'ad.suivi.rlFriseLastClose'
                    : 'ad.suivi.rlFriseLastReopen',
                ),
              )} ${t('ad.suivi.rlFriseLastCardCounts')
              .replace('{n}', String(gestesDerniereTranche.length))
              .replace('{m}', String(gestesDerniereTrancheSens))}`}
            onClick={() => ouvrirCarteGeste(dernier)}
          >
            <i className="ri-file-list-3-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('ad.suivi.rlFriseLastCard')}</span>
          </button>
        )}
      </p>

      <div className="suivi-rl-frise-bandes">
        {bandesTriees.map((bande) => {
          const lignes = RELECTURE_LIGNES.filter(
            (ligne) => ligne.n >= bande.de && ligne.n <= bande.a,
          );
          if (lignes.length === 0) return null;
          const fermes = lignes.filter(
            (ligne) => estRelue(etat, 'ar', ligne.n) && estRelue(etat, 'en', ligne.n),
          ).length;
          /* Le geste de la tranche : tant qu'un écran reste ouvert, il les
             ferme tous d'un coup ; une tranche faite des deux côtés le dit et
             propose de la rouvrir, sans laisser un bouton inerte. */
          const ouverts = lignes.length - fermes;
          const trancheFaite = ouverts === 0;
          /* Une tournée ouverte efface les autres tranches, sans les retirer :
             la frise garde ses trente marques sous les yeux. */
          const enVeille = tournee !== null && tournee !== bande.id;
          const cleBande = bande.id === null ? 'reste' : `t${bande.id}`;
          /* Le geste qui a touché cette tranche-là, le plus récent : chaque
             tranche nomme ainsi sa propre date, et non seulement la dernière
             de tout le carnet. */
          const gesteBande =
            gestes.find((geste) => geste.de === bande.de && geste.a === bande.a) ?? null;
          /* Ce que ce geste-là a laissé ouvert dans sa tranche : le survol le
             dit, sans quoi sa date ne distingue pas un geste qui a tout fermé
             d'un geste qui a laissé la moitié du chemin. */
          const restesGeste = gesteBande ? ecransOuvertsApresGeste(gesteBande) : null;
          /* Tous les gestes de cette tranche-là, les plus récents en tête : la
             carte sous la date les déplie, au lieu de ne montrer que le
             dernier. */
          const gestesBande = gestes.filter(
            (geste) => geste.de === bande.de && geste.a === bande.a,
          );
          /* La fermeture qui a précédé la dernière réouverture : la frise dit
             alors combien de temps l’état fermé a tenu avant d’être défait,
             au lieu de ne donner que la date de la réouverture. */
          const gesteRouvert = gesteBande && !gesteBande.ferme ? gesteBande : null;
          const fermetureAvant = gesteRouvert
            ? gestesBande.find(
                (entree) =>
                  entree.ferme &&
                  new Date(entree.at).getTime() < new Date(gesteRouvert.at).getTime(),
              ) ?? null
            : null;
          /* Le sens de chaque geste, compté pour la carte : une tranche agitée
             mêle les fermetures et les réouvertures, et la carte les range
             séparément quand on le demande. */
          const gestesFermes = gestesBande.filter((geste) => geste.ferme).length;
          const gestesRouverts = gestesBande.length - gestesFermes;
          const gestesVus =
            triGestes === 'tous'
              ? gestesBande
              : gestesBande.filter((geste) =>
                  triGestes === 'ferme' ? geste.ferme : !geste.ferme,
                );
          return (
            <div
              className="suivi-rl-frise-bande"
              key={cleBande}
              data-veille={enVeille ? 'yes' : 'no'}
            >
              <p className="suivi-rl-frise-legende">
                <span>
                  {bande.id === null
                    ? t('ad.suivi.rlFriseBandReste')
                        .replace('{de}', String(bande.de))
                        .replace('{a}', String(bande.a))
                    : t('ad.suivi.rlFriseBandTournee')
                        .replace('{n}', String(bande.id))
                        .replace('{de}', String(bande.de))
                        .replace('{a}', String(bande.a))}
                </span>
                <b>
                  {fermes} / {lignes.length}
                </b>
                {/* La date de son propre dernier geste : une tranche fermée
                    d'un trait se retrouve par sa date, ici et pas seulement
                    dans la tête de la frise. Un clic la déplie en carte : ses
                    gestes datés, avec le compte atteint de chacun. */}
                {gesteBande && (
                  <button
                    type="button"
                    className="suivi-rl-frise-bande-last"
                    data-sens={gesteBande.ferme ? 'ferme' : 'rouvert'}
                    data-carte={carteOuverte === cleBande ? 'yes' : 'no'}
                    aria-expanded={carteOuverte === cleBande}
                    title={`${t('ad.suivi.rlFriseBandeLastHint')
                      .replace('{date}', quandGeste(gesteBande.at))
                      .replace('{sens}', t(
                        gesteBande.ferme
                          ? 'ad.suivi.rlFriseLastClose'
                          : 'ad.suivi.rlFriseLastReopen',
                      ))
                      .replace('{ecrans}', trancheEcrite(gesteBande.de, gesteBande.a))
                      .replace('{n}', String(gesteBande.n))
                      .replace(
                        '{apres}',
                        gesteBande.apres === null
                          ? t('ad.suivi.rlFriseBandeLastApresNone')
                          : t('ad.suivi.rlFriseBandeLastApres')
                              .replace('{apres}', String(gesteBande.apres))
                              .replace('{total}', String(RELECTURE_TOTAL)),
                      )} ${t('ad.suivi.rlFriseBandeLastDelaiHint').replace(
                      '{delai}',
                      direDelai(gesteBande.at),
                    )} ${
                      restesGeste === null
                        ? t('ad.suivi.rlFriseBandeLastRestUnknown')
                        : restesGeste === 0
                          ? t('ad.suivi.rlFriseBandeLastRestNone')
                          : t('ad.suivi.rlFriseBandeLastRest').replace(
                              '{n}',
                              String(restesGeste),
                            )
                    }`}
                    onClick={() => basculerCarte(cleBande)}
                  >
                    <i className="ri-history-line" aria-hidden="true"></i>
                    {t('ad.suivi.rlFriseBandeLast')
                      .replace('{date}', quandGeste(gesteBande.at))
                      .replace(
                        '{sens}',
                        t(
                          gesteBande.ferme
                            ? 'ad.suivi.rlFriseLastClose'
                            : 'ad.suivi.rlFriseLastReopen',
                        ),
                      )}
                    {/* Le délai écoulé depuis ce geste : la date seule ne dit
                        pas si la tranche a bougé il y a une heure ou trois
                        semaines. */}
                    <span className="suivi-rl-frise-bande-last-delai">
                      {direDelai(gesteBande.at)}
                    </span>
                  </button>
                )}
                {/* Ce que la dernière réouverture a défait : la fermeture
                    qu’elle a suivie, et le temps que celle-ci a tenu. Une
                    date de réouverture seule ne dit pas si la tranche avait
                    été fermée une heure plus tôt ou trois semaines avant. */}
                {fermetureAvant && gesteRouvert && (
                  <span
                    className="suivi-rl-frise-bande-reouvert"
                    title={t('ad.suivi.rlFriseBandeReouvertApresHint')
                      .replace('{date}', quandGeste(fermetureAvant.at))
                      .replace(
                        '{delai}',
                        direEcart(fermetureAvant.at, gesteRouvert.at),
                      )}
                  >
                    <i className="ri-time-line" aria-hidden="true"></i>
                    {t('ad.suivi.rlFriseBandeReouvertApres').replace(
                      '{delai}',
                      direEcart(fermetureAvant.at, gesteRouvert.at),
                    )}
                  </span>
                )}
                {/* Le geste groupé de la tranche : les dix écrans d'un coup,
                    sans descendre jusqu'aux lignes de la liste. */}
                <button
                  type="button"
                  className="suivi-rl-frise-bulk"
                  data-fait={trancheFaite ? 'yes' : 'no'}
                  title={
                    trancheFaite
                      ? t('ad.suivi.rlFriseBulkReopenHint')
                      : t('ad.suivi.rlFriseBulkHint').replace('{n}', String(ouverts))
                  }
                  onClick={() => {
                    /* Le geste part de la tranche telle qu'elle est : ce sont
                       ces chiffres-là qu'il vient de changer. */
                    onBasculeBande(bande.de, bande.a);
                    setGesteVu({
                      cle: cleBande,
                      ferme: !trancheFaite,
                      n: trancheFaite ? lignes.length : ouverts,
                      at: Date.now(),
                    });
                  }}
                >
                  <i
                    className={trancheFaite ? 'ri-arrow-go-back-line' : 'ri-check-double-line'}
                    aria-hidden="true"
                  ></i>
                  <span className="whitespace-nowrap">
                    {trancheFaite
                      ? t('ad.suivi.rlFriseBulkReopen')
                      : t('ad.suivi.rlFriseBulkClose').replace('{n}', String(ouverts))}
                  </span>
                </button>
              </p>
              <ol className="suivi-rl-frise-cells">
                {lignes.map((ligne) => {
                  const cle = etatEcran(etat, ligne.n);
                  const rang = String(ligne.n).padStart(2, '0');
                  const titre = [
                    rang,
                    ligne.page,
                    t(nomEtat[cle]),
                    cle === 'deux' ? t('ad.suivi.rlFriseRouvrir') : t('ad.suivi.rlFriseFermer'),
                  ]
                    .filter(Boolean)
                    .join(' · ');
                  return (
                    <li key={ligne.n}>
                      <button
                        type="button"
                        className="suivi-rl-frise-cell"
                        data-etat={cle}
                        data-n={rang}
                        title={titre}
                        aria-label={titre}
                        aria-pressed={cle === 'deux'}
                        onClick={() => onBascule(ligne.n)}
                      >
                        {rang}
                      </button>
                    </li>
                  );
                })}
              </ol>
              {/* La carte des gestes de la tranche : ouverte par le clic sur
                  sa date, elle date chaque clic et dit le compte atteint juste
                  après, au lieu de le réserver au survol d'un seul chiffre. */}
              {carteOuverte === cleBande && gestesBande.length > 0 && (
                <div className="suivi-rl-frise-gestes" dir="ltr">
                  <p className="suivi-rl-frise-gestes-head">
                    <i className="ri-history-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">
                      {t('ad.suivi.rlFriseGestesTitle')}
                    </span>
                    <b>{gestesBande.length}</b>
                    {/* Le tri par sens : trois pastilles, chacune avec son
                        compte. Un second clic sur la pastille active la
                        retire, et la carte rend les deux sens. */}
                    <span className="suivi-rl-frise-gestes-tri">
                      {(['tous', 'ferme', 'rouvert'] as const).map((sens) => {
                        const compteSens =
                          sens === 'tous'
                            ? gestesBande.length
                            : sens === 'ferme'
                              ? gestesFermes
                              : gestesRouverts;
                        return (
                          <button
                            key={sens}
                            type="button"
                            className="suivi-rl-frise-gestes-sens"
                            data-sens={sens}
                            data-on={triGestes === sens ? 'yes' : 'no'}
                            aria-pressed={triGestes === sens}
                            title={t('ad.suivi.rlFriseGestesSortHint')}
                            onClick={() =>
                              setTriGestes((avant) =>
                                avant === sens && sens !== 'tous' ? 'tous' : sens,
                              )
                            }
                          >
                            <span className="whitespace-nowrap">
                              {t(
                                sens === 'tous'
                                  ? 'ad.suivi.rlFriseGestesSortAll'
                                  : sens === 'ferme'
                                    ? 'ad.suivi.rlFriseGestesSortFerme'
                                    : 'ad.suivi.rlFriseGestesSortRouvert',
                              )}
                            </span>
                            <b>{compteSens}</b>
                          </button>
                        );
                      })}
                    </span>
                    <button
                      type="button"
                      className="suivi-rl-frise-gestes-close"
                      title={t('ad.suivi.rlFriseGestesCloseHint')}
                      onClick={() => {
                        setCarteOuverte(null);
                        setTriGestes('tous');
                      }}
                    >
                      <i className="ri-close-line" aria-hidden="true"></i>
                    </button>
                  </p>
                  <ul>
                    {gestesVus.map((geste) => {
                      /* Les tranches que ce même clic a emportées avec celle-ci :
                         la carte ne se referme pas sur sa seule tranche, elle
                         rappelle le voisinage du geste groupé. */
                      const autres = autresTranchesDuClic(gestes, geste);
                      /* Ce que le clic a touché au total, tranche par tranche :
                         la somme se lit ici, sans additionner les tranches de
                         tête. */
                      const clic = ecransDuClicParTranche(gestes, geste);
                      return (
                      <li key={geste.at} data-sens={geste.ferme ? 'ferme' : 'rouvert'}>
                        <i
                          className={
                            geste.ferme ? 'ri-check-double-line' : 'ri-arrow-go-back-line'
                          }
                          aria-hidden="true"
                        ></i>
                        <span className="suivi-rl-frise-geste-date">
                          {quandGeste(geste.at)}
                        </span>
                        <span className="suivi-rl-frise-geste-sens">
                          {t(
                            geste.ferme
                              ? 'ad.suivi.rlFriseLastClose'
                              : 'ad.suivi.rlFriseLastReopen',
                          )}
                        </span>
                        <span className="suivi-rl-frise-geste-n">
                          {geste.deja === null
                            ? t('ad.suivi.rlFriseGestesTouchedDejaNone').replace(
                                '{n}',
                                String(geste.n),
                              )
                            : t('ad.suivi.rlFriseGestesTouchedDeja')
                                .replace('{n}', String(geste.n))
                                .replace('{deja}', String(geste.deja))
                                .replace('{total}', String(geste.a - geste.de + 1))}
                        </span>
                        <span className="suivi-rl-frise-geste-apres">
                          {geste.apres === null
                            ? t('ad.suivi.rlFriseBandeLastApresNone')
                            : t('ad.suivi.rlFriseGestesApres')
                                .replace('{apres}', String(geste.apres))
                                .replace('{total}', String(RELECTURE_TOTAL))}
                        </span>
                        {/* Les autres tranches du même clic, nommées une à
                            une : le geste se relit avec son étendue, pas
                            comme une tranche isolée. */}
                        {autres.length > 0 && (
                          <span
                            className="suivi-rl-frise-geste-autres"
                            title={t('ad.suivi.rlFriseGestesAutresHint').replace(
                              '{n}',
                              String(autres.length),
                            )}
                          >
                            <i className="ri-links-line" aria-hidden="true"></i>
                            {t('ad.suivi.rlFriseGestesAutres').replace(
                              '{tranches}',
                              autres.join(' · '),
                            )}
                          </span>
                        )}
                        {/* Le total du clic, tranche par tranche : la somme
                            des écrans que tous ses gestes ont touchés, et ce
                            que chacune y a porté — un clic groupé ne se lit
                            pas tranche par tranche, mais d’un seul chiffre. */}
                        {clic.tranches.length > 1 && (
                          <span
                            className="suivi-rl-frise-geste-clic"
                            title={t('ad.suivi.rlFriseGestesClicTotalHint')
                              .replace('{n}', String(clic.total))
                              .replace('{tranches}', String(clic.tranches.length))}
                          >
                            <i className="ri-focus-3-line" aria-hidden="true"></i>
                            {t('ad.suivi.rlFriseGestesClicTotal')
                              .replace('{n}', String(clic.total))
                              .replace(
                                '{detail}',
                                clic.tranches
                                  .map((entree) => `${entree.nom} : ${entree.n}`)
                                  .join(' · '),
                              )}
                          </span>
                        )}
                        {/* La porte d'un seul clic : elle emporte ce geste-là —
                            sa date, son sens, son total d'écrans et ses
                            tranches une à une —, sans les autres clics de la
                            carte. La ligne répond un instant, puis se tait. */}
                        <button
                          type="button"
                          className="suivi-rl-frise-geste-copier"
                          data-fait={clicCopie === geste.at ? 'yes' : 'no'}
                          title={t('ad.suivi.rlFriseClicCopierHint')
                            .replace('{date}', quandGeste(geste.at))
                            .replace(
                              '{sens}',
                              t(
                                geste.ferme
                                  ? 'ad.suivi.rlFriseLastClose'
                                  : 'ad.suivi.rlFriseLastReopen',
                              ),
                            )
                            .replace('{n}', String(clic.total))
                            .replace('{tranches}', String(clic.tranches.length))}
                          onClick={() => copierClic(geste)}
                        >
                          <i
                            className={
                              clicCopie === geste.at
                                ? 'ri-check-line'
                                : 'ri-file-copy-line'
                            }
                            aria-hidden="true"
                          ></i>
                          <span className="whitespace-nowrap">
                            {clicCopie === geste.at
                              ? t('ad.suivi.rlFriseClicCopies')
                              : t('ad.suivi.rlFriseClicCopier')}
                          </span>
                        </button>
                      </li>
                      );
                    })}
                  </ul>
                  {/* Ce que ce sens a réellement touché : la somme des écrans
                      des gestes visibles, au lieu du seul nombre de gestes. */}
                  {triGestes !== 'tous' && gestesVus.length > 0 && (
                    <p className="suivi-rl-frise-gestes-reel">
                      <i className="ri-focus-3-line" aria-hidden="true"></i>
                      <span>
                        {t('ad.suivi.rlFriseGestesReel')
                          .replace('{n}', String(gestesVus.length))
                          .replace(
                            '{ecrans}',
                            String(
                              gestesVus.reduce((total, geste) => total + geste.n, 0),
                            ),
                          )}
                      </span>
                    </p>
                  )}
                  {/* Un sens absent de la tranche le dit, au lieu de laisser
                      une carte vide sans explication. */}
                  {gestesVus.length === 0 && (
                    <p className="suivi-rl-frise-gestes-vide">
                      <i className="ri-filter-off-line" aria-hidden="true"></i>
                      <span>{t('ad.suivi.rlFriseGestesSortNone')}</span>
                    </p>
                  )}
                </div>
              )}
              {/* Ce que le geste vient de faire, un instant après le clic :
                  tant d'écrans fermés — ou rouverts — d'un seul coup. La note
                  s'efface d'elle-même et ne prend pas le clic. */}
              {gesteVu && gesteVu.cle === cleBande && (
                <p
                  className="suivi-rl-frise-flash"
                  data-sens={gesteVu.ferme ? 'ferme' : 'rouvert'}
                  role="status"
                >
                  <i
                    className={
                      gesteVu.ferme ? 'ri-check-double-line' : 'ri-arrow-go-back-line'
                    }
                    aria-hidden="true"
                  ></i>
                  <span>
                    {t(
                      gesteVu.ferme
                        ? 'ad.suivi.rlFriseFlashClose'
                        : 'ad.suivi.rlFriseFlashReopen',
                    ).replace('{n}', String(gesteVu.n))}
                  </span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* La réponse à l'oubli : le jour où le carnet a été remis à zéro, sous
          la frise, quelques instants — le geste ne se contente pas d'effacer
          en silence. */}
      {remisZero && (
        <p className="suivi-rl-frise-reset" role="status">
          <i className="ri-eraser-line" aria-hidden="true"></i>
          <span>
            {t('ad.suivi.rlFriseReset').replace('{date}', quandGeste(remisZero))}
          </span>
        </p>
      )}
    </div>
  );
}