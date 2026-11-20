import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localize } from '@/i18n/localize';
import { paysArabes } from '@/lib/pays';
import { lireTriPays, memoriserTriPays, type TriPays } from '@/lib/paysTriMemory';
import { lireFiltrePays, memoriserFiltrePays } from '@/lib/paysFiltreMemory';
import {
  DELAIS_RAPPEL,
  SEUILS_RELANCE,
  SEUILS_URGENCE,
  lireAuteurRelance,
  lireDelaiRappel,
  lireRappelsPays,
  lireRelancesPays,
  lireSeuilRelance,
  lireSeuilUrgence,
  memoriserAuteurRelance,
  memoriserDelaiRappel,
  memoriserRappelsPays,
  memoriserRelancesPays,
  memoriserSeuilRelance,
  memoriserSeuilUrgence,
  type DelaiRappelPays,
  type RappelsPays,
  type RelancesPays,
  type SeuilRelancePays,
  type SeuilUrgencePays,
} from '@/lib/paysRelanceMemory';
import {
  lireCopiesPays,
  memoriserCopiesPays,
  type EnvoiPays,
} from '@/lib/paysCopiesMemory';
import { PRIX_PREMIUM_DZD, grouper, tarifsParMarche } from '@/lib/tarif';
import CopyTextButton from '@/components/feature/CopyTextButton';
import { lienFeuillePrix, lienPrix, lienPrixLigne, usePrixPays } from '@/hooks/usePrixPays';
import { useFacturation } from '@/hooks/useFacturation';
import { lienInscription, planDeFacturation, plans, prixPlan } from './plans';
import {
  exporterRelancePays,
  exporterTarifsPays,
  joursDepuisIso,
  jourHeureTexte,
} from './paysExport';
import PaysRetards from './PaysRetards';

/** Au-delà de trois semaines sans second contact, un marché relancé n'est plus
 *  seulement « en retard » : la feuille le dit d'un jeton plus insistant. */
const SEUIL_RAPPEL_MANQUE = 21;

type Props = {
  /** The home section keeps the same sheet, folded tighter. */
  compact?: boolean;
};

/**
 * Les trois lectures de la feuille : tout le catalogue, les marchés posés sur
 * le plancher de la fourchette (35 %), ou ceux dont le coefficient écrit en
 * sort. Une seule lecture tient à la fois, et la feuille se rouvre entière
 * d'un second clic.
 */
type FiltrePays = 'tous' | 'plancher' | 'hors' | 'oublies' | 'relances' | 'rappels' | 'retards' | 'urgents';

/** Un jour entier, pour compter le temps écoulé depuis un envoi (voir
 *  paysExport.ts, qui tient le calcul des deux classeurs). */

/** Copie un texte dans le presse-papiers, avec le repli des navigateurs qui
 *  refusent l'API moderne : la feuille doit pouvoir partir même là. */
async function copierDansLePresse(texte: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texte);
      return true;
    }
  } catch {
    /* on tente le repli plus bas */
  }
  try {
    const field = document.createElement('textarea');
    field.value = texte;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '-1000px';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(field);
    return ok;
  } catch {
    return false;
  }
}


/**
 * The whole tariff on one small sheet, folded away under the pricing questions:
 * what Premium reads in each market and the coefficient behind the figure.
 *
 * A row is no longer a single click that changes the money: it opens its own
 * detail panel — monthly price, the year with its offered month, the coefficient
 * and the market's own link — and the panel carries the button that reads every
 * price of the page in that money.
 *
 * The sheet leaves as a file too: the whole table, the market's own link, and
 * the country read on screen kept in the file name.
 */
export default function TarifsPays({ compact = false }: Props) {
  const { t, lang } = useLang();
  const { pays, choisir } = usePrixPays();
  /* L'ancre de l'adresse : une lecture copiée peut désigner une ligne précise
     de la feuille, que la feuille ouvre alors d'elle-même. */
  const { hash } = useLocation();
  /* The rhythm kept on this device, shared with the Premium card and the
     sign-up reminder: the choice made here is remembered like the country. */
  const { facturation, choisir: choisirRythme } = useFacturation();
  const [open, setOpen] = useState(false);
  /* Which line is opened as a detail panel, and whether the fold is out. */
  const [detail, setDetail] = useState<string | null>(null);
  const [csvDone, setCsvDone] = useState(false);
  /* La liste de relance s'emporte aussi comme fichier : le collègue qui n'a
     pas la feuille ouverte reçoit les mêmes marchés, le même total. */
  const [relanceCsvDone, setRelanceCsvDone] = useState(false);
  /* Which row has just handed its link away, and whether the copy went through. */
  const [copie, setCopie] = useState<{ code: string; ok: boolean } | null>(null);
  /* Les marchés dont l'adresse est vraiment partie pendant cette visite : la
     feuille les compte au bas d'elle-même, un marché une seule fois, même si
     son lien est recopié. Chacun garde l'instant de son dernier envoi et le
     nombre de fois où son adresse est repartie, pour savoir quand le lien a
     circulé — et combien de fois. */
  const [copies, setCopies] = useState<Record<string, EnvoiPays>>(lireCopiesPays);
  /* L'ordre de la feuille : le catalogue tel qu'il est tenu, ou les marchés
     classés par ce que l'année leur économise sur le tarif de référence — le
     seul chiffre qui se compare d'un pays à l'autre, puisqu'il est lu en dinars
     et non dans la monnaie de chaque marché. */
  const [tri, setTri] = useState<TriPays>(lireTriPays);
  /* Le seuil de relance : au-delà de ce nombre de jours sans nouvel envoi, un
     marché est dit oublié. Le choix est retenu sur l'appareil, comme le pays
     et l'ordre de la feuille, pour que la relance se rouvre au même seuil. */
  const [seuil, setSeuil] = useState<SeuilRelancePays>(lireSeuilRelance);
  const choisirSeuil = (next: SeuilRelancePays) => {
    setSeuil(next);
    memoriserSeuilRelance(next);
  };
  /* Les marchés vraiment relancés, marqués depuis leur ligne : la marque dit
     « relancé aujourd'hui » et reste sur l'appareil, comme le pays et le
     seuil — de quoi distinguer une vraie relance du simple envoi d'un lien. */
  const [relances, setRelances] = useState<RelancesPays>(lireRelancesPays);
  /* Les marchés déjà rappelés, marqués depuis leur ligne : le second contact
     se compte à part du premier, avec sa propre date. */
  const [rappels, setRappels] = useState<RappelsPays>(lireRappelsPays);
  /* Le nombre de marchés que le dernier rappel a marqués : la réponse se lit
     juste à côté du bouton, même quand la liste s'est vidée du même geste. */
  const [rappelN, setRappelN] = useState(0);
  /* Les marchés marqués d'un seul geste par « Tout marquer rappelé » : gardés
     pour que le même bouton puisse défaire ce qu'il vient de faire, comme la
     tournée des relances. */
  const [rappelBulk, setRappelBulk] = useState<string[]>([]);
  const [rappelBulkDone, setRappelBulkDone] = useState(0);
  /* Le délai de rappel : au-delà de ce nombre de jours après une relance, un
     marché peut être rappelé — sept, quatorze ou vingt et un jours. Le choix
     reste sur l'appareil, comme le seuil de relance. */
  const [delaiRappel, setDelaiRappel] = useState<DelaiRappelPays>(lireDelaiRappel);
  const choisirDelaiRappel = (next: DelaiRappelPays) => {
    setDelaiRappel(next);
    memoriserDelaiRappel(next);
  };
  /* Le seuil d'urgence : au-delà de ce nombre de jours de retard, un rappel
     est dit urgent. Le choix reste sur l'appareil, comme le délai lui-même. */
  const [seuilUrgence, setSeuilUrgence] = useState<SeuilUrgencePays>(lireSeuilUrgence);
  const choisirSeuilUrgence = (next: SeuilUrgencePays) => {
    setSeuilUrgence(next);
    memoriserSeuilUrgence(next);
  };
  /* Ce que le geste de rappel a répondu : le message copié, ou le refus du
     navigateur — lu juste à côté du bouton, sans fenêtre. */
  const [rappelEtat, setRappelEtat] = useState<'idle' | 'ok' | 'err'>('idle');
  /* Le message de relance laisse les marchés déjà relancés de côté : le geste
     posé sur leur compteur les retire, un second les remet. */
  const [sansDejaRelances, setSansDejaRelances] = useState(false);
  /* Le nom du collègue qui mène la tournée : il s’écrit dans la colonne
     « relancé par » du classeur, pour que deux personnes ne refassent pas le
     même contact sur le même marché. Le nom reste sur cet appareil. */
  const [auteur, setAuteur] = useState<string>(lireAuteurRelance);
  const changerAuteur = (nom: string) => {
    setAuteur(nom);
    memoriserAuteurRelance(nom);
  };
  /* Ce que le geste « Démarrer la tournée » a répondu : le message copié, ou
     le refus du navigateur — lu juste à côté du bouton, sans fenêtre. */
  const [tournee, setTournee] = useState<'idle' | 'ok' | 'err'>('idle');
  /* Les compteurs posés au bas de la feuille referment la liste sur une lecture
     du corridor : les marchés posés sur le plancher de 35 %, ou ceux dont le
     coefficient écrit sort de la fourchette. Un clic les garde seuls, un second
     rend la feuille entière. */
  const [filtre, setFiltre] = useState<FiltrePays>(() =>
    lireFiltrePays() === 'urgents' ? 'urgents' : 'tous',
  );
  /* L'ordre choisi s'écrit sur l'appareil, comme le pays : la prochaine visite
     rouvre la feuille dans le même sens, sans avoir à recliquer. */
  const choisirTri = (next: TriPays) => {
    setTri(next);
    memoriserTriPays(next);
  };
  /* Le filtre des urgents se retient comme l'ordre de la feuille : la prochaine
     visite rouvre la feuille déjà réduite à ces seuls rappels, sans avoir à
     recliquer sur la pastille. Les autres lectures restent des visites.
     Initialisée depuis l'appareil, la valeur est réécrite à chaque changement. */
  useEffect(() => {
    memoriserFiltrePays(filtre === 'urgents' ? 'urgents' : 'tous');
  }, [filtre]);
  const panelId = `of-pays-panel-${useId()}`;
  const whoId = `of-pays-who-${useId()}`;
  const timer = useRef<number | null>(null);
  const tourneeTimer = useRef<number | null>(null);
  const copyTimer = useRef<number | null>(null);
  const relanceTimer = useRef<number | null>(null);
  const rappelTimer = useRef<number | null>(null);
  /* La pastille de l'en-tête ouvre la feuille : elle la ramène aussi à l'écran,
     d'un léger délai pour laisser le pli se défaire avant de défiler. */
  const sheetTimer = useRef<number | null>(null);
  /* La liste des marchés servis est écrite sur l'appareil à chaque geste : la
     feuille se rouvre donc sur la même liste à la prochaine visite, et
     l'effacement d'un seul coup est lui aussi retenu. */
  const copiesRef = useRef(copies);
  const ecrireCopies = useCallback((next: Record<string, EnvoiPays>) => {
    copiesRef.current = next;
    setCopies(next);
    memoriserCopiesPays(next);
  }, []);
  /* Les marques de relance s'écrivent de la même façon : à chaque geste, pour
     que l'appareil retienne le marché et le jour, sans passer par un serveur. */
  const relancesRef = useRef(relances);
  const ecrireRelances = useCallback((next: RelancesPays) => {
    relancesRef.current = next;
    setRelances(next);
    memoriserRelancesPays(next);
  }, []);
  /* Les marques de rappel s'écrivent de la même façon : à chaque geste, pour
     que l'appareil retienne le second contact et son jour. */
  const rappelsRef = useRef(rappels);
  const ecrireRappels = useCallback((next: RappelsPays) => {
    rappelsRef.current = next;
    setRappels(next);
    memoriserRappelsPays(next);
  }, []);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    if (relanceTimer.current) window.clearTimeout(relanceTimer.current);
    if (rappelTimer.current) window.clearTimeout(rappelTimer.current);
    if (sheetTimer.current) window.clearTimeout(sheetTimer.current);
    if (tourneeTimer.current) window.clearTimeout(tourneeTimer.current);
  }, []);

  const rows = useMemo(
    () => tarifsParMarche(PRIX_PREMIUM_DZD, paysArabes.map((item) => item.code)),
    [],
  );
  const noms = new Map(paysArabes.map((item) => [item.code, localize(item.nom, lang)]));
  const nomChoisi = noms.get(pays) ?? pays;
  /* Les marchés déjà servis, le dernier envoi en tête : une recopie remet le
     marché à sa place, jamais une seconde fois dans la liste. */
  const copiesCodes = Object.keys(copies).sort(
    (a, b) => new Date(copies[b].at).getTime() - new Date(copies[a].at).getTime(),
  );
  const copiesCount = copiesCodes.length;
  /* Le jour et l'heure d'un envoi, dans la langue de la page : le lien a
     circulé à cet instant-là, pas seulement ce jour-là. */
  const jourHeure = (iso: string) => jourHeureTexte(iso, lang);
  /* Les jours entiers écoulés depuis un envoi, comptés de minuit à minuit :
     le jour même du départ se lit « aujourd’hui », la veille « hier », et
     au-delà le nombre de jours tel quel. */
  const joursDepuis = (iso: string) => joursDepuisIso(iso);
  const ecoule = (iso: string) => {
    const n = joursDepuis(iso);
    if (n <= 0) return t('ofs.sentAgoToday');
    if (n === 1) return t('ofs.sentAgoYesterday');
    return t('ofs.sentAgoDays').replace('{n}', String(n));
  };
  /* Les marchés qu’on a laissés filer : leur dernier envoi remonte à plus de
     jours que le seuil choisi. Les plus anciens passent en tête de la relance,
     puisque ce sont eux qui attendent depuis le plus longtemps. */
  const oublies = copiesCodes
    .filter((code) => joursDepuis(copies[code].at) >= seuil)
    .sort((a, b) => new Date(copies[a].at).getTime() - new Date(copies[b].at).getTime());
  /* Le tarif annuel de chaque marché, pour que la relance porte le prix et pas
     seulement le nombre de jours d’attente. */
  const parCode = useMemo(() => {
    const carte = new Map<string, (typeof rows)[number]>();
    rows.forEach((row) => carte.set(row.code, row));
    return carte;
  }, [rows]);
  /* Ce que l'année de Premium coûte chez ces marchés oubliés, additionnée en
     dinars : la seule monnaie qui se compare d'un marché à l'autre, la même
     que l'économie du catalogue. Le total se lit donc dans la pastille de
     l'en-tête replié, et dans le message de relance. */
  const totalOubliesDzd = oublies.reduce(
    (total, code) => total + (parCode.get(code)?.montantAnnuelDzd ?? 0),
    0,
  );
  const totalOubliesTexte = `${grouper(totalOubliesDzd)} DZD`;
  /* Le plus ancien des oublis : la tête de liste, puisque les marchés sont
     rangés du plus vieil envoi au plus récent. Son attente se lit dans
     l'en-tête replié, sans déplier la feuille. */
  const plusAncienJours = oublies.length > 0 ? joursDepuis(copies[oublies[0]].at) : 0;
  /* Les marchés déjà relancés parmi ces oublis : marqués depuis leur ligne,
     ils restent au-dessus du seuil, mais ne demandent plus un premier
     message. Le compteur les nomme, et le geste les retire de la relance. */
  const dejaRelances = oublies.filter((code) => relances[code]);
  /* Ceux qu'aucune marque ne couvre : les seuls marchés qu'une tournée doive
     encore contacter. */
  const resteARelancer = oublies.filter((code) => !relances[code]);
  /* La liste que le message emporte : tous les oublis, ou seulement les
     marchés qui n'ont pas encore été relancés. */
  const listeRelance = sansDejaRelances ? resteARelancer : oublies;
  const totalRelanceDzd = listeRelance.reduce(
    (total, code) => total + (parCode.get(code)?.montantAnnuelDzd ?? 0),
    0,
  );
  const totalRelanceTexte = `${grouper(totalRelanceDzd)} DZD`;
  /* L’adresse qui rouvre la feuille sur le marché lu : elle part avec la
     relance, pour que le marché oublié retombe sur son prix et son coefficient. */
  const lienRelance = lienFeuillePrix(pays, lang);
  /* Le message de relance, écrit pour une liste donnée : la feuille s'en sert
     pour son propre message, et « Démarrer la tournée » pour les seuls marchés
     restants — le total et la phrase d'exclusion suivent la liste qui part. */
  const construireRelance = (list: string[], hors: number) => {
    const total = list.reduce(
      (somme, code) => somme + (parCode.get(code)?.montantAnnuelDzd ?? 0),
      0,
    );
    return [
      t('ofs.relanceLead').replace('{n}', String(list.length)),
      ...list.map((code) =>
        t('ofs.relanceRow')
          .replace('{pays}', noms.get(code) ?? code)
          .replace('{prix}', parCode.get(code)?.montantAnnuel ?? '')
          .replace('{n}', String(joursDepuis(copies[code].at)))
          .replace('{lien}', lienPrixLigne(code, lang)),
      ),
      t('ofs.relanceTotal').replace('{total}', `${grouper(total)} DZD`),
      ...(hors > 0
        ? [t('ofs.relanceHorsNote').replace('{n}', String(hors))]
        : []),
      t('ofs.relanceSheet').replace('{lien}', lienRelance),
      t('ofs.relanceNote'),
    ].join('\n');
  };
  /* Le message de relance, prêt à envoyer : les marchés oubliés avec leurs
     jours d’attente, puis le lien qui rouvre la feuille sur chacun d’eux. */
  const relanceTexte = () =>
    construireRelance(listeRelance, sansDejaRelances ? dejaRelances.length : 0);
  /* La phrase de la ligne de relance : le compte des marchés à qui le message
     s'adresse, ou le constat que tout a déjà été relancé. */
  const texteRelance =
    listeRelance.length > 0
      ? t(listeRelance.length > 1 ? 'ofs.relanceLine' : 'ofs.relanceLineOne')
          .replace('{n}', String(listeRelance.length))
          .replace('{seuil}', String(seuil))
      : oublies.length > 0
        ? t('ofs.relanceAllDone').replace('{n}', String(oublies.length))
        : t('ofs.relanceNone').replace('{seuil}', String(seuil));

  /* Les lignes que l'écran déroule et que le fichier emporte : le même ordre
     pour les deux, donc une feuille envoyée à un pays se relit comme ici. */
  /* Le tri « déjà partis d’abord » garde les marchés servis en tête, le
     dernier envoi le plus récent devant, puis laisse le reste dans l’ordre
     du catalogue : la feuille se lit donc comme une tournée déjà faite. */
  const lignesTriees = useMemo(() => {
    if (tri === 'economie') {
      return [...rows].sort((a, b) => b.economieAnnuelleDzd - a.economieAnnuelleDzd);
    }
    if (tri === 'servis') {
      const dateDe = (code: string) => {
        const envoi = copies[code];
        const temps = envoi ? new Date(envoi.at).getTime() : 0;
        return Number.isNaN(temps) ? 0 : temps;
      };
      const servis = rows.filter((row) => copies[row.code]).sort((a, b) => dateDe(b.code) - dateDe(a.code));
      const restants = rows.filter((row) => !copies[row.code]);
      return [...servis, ...restants];
    }
    if (tri === 'retard') {
      /* Le retard de rappel de chaque marché, en jours : les marchés sans
         second contact en retard valent -1 et restent donc derrière, dans
         l'ordre du catalogue. Le plus urgent passe en tête. */
      const retardDe = (code: string) => {
        const marque = relances[code];
        if (!marque || rappels[code]) return -1;
        const jours = joursDepuis(marque);
        return jours >= delaiRappel ? jours - delaiRappel : -1;
      };
      return [...rows].sort((a, b) => retardDe(b.code) - retardDe(a.code));
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copies, delaiRappel, rappels, relances, rows, tri]);
  /* Le compteur des marchés au plancher se compte sur tout le catalogue, jamais
     sur la feuille déjà réduite : il ne peut donc pas se contredire lui-même. */
  const auPlancher = useMemo(() => rows.filter((row) => row.plancher), [rows]);
  /* Le second compteur, son pendant : les marchés dont le coefficient écrit
     sort de la fourchette. Comptés eux aussi sur tout le catalogue, jamais sur
     la feuille déjà réduite. */
  const horsFourchette = useMemo(() => rows.filter((row) => row.hors), [rows]);
  /* Les marchés déjà relancés sur tout le catalogue, marque à l'appui : le
     compteur de la feuille les garde seuls d'un clic, pour relire d'un coup
     la tournée faite, hors des seuls oublis au seuil choisi. */
  const dejaRelancesTous = useMemo(
    () => rows.filter((row) => Boolean(relances[row.code])),
    [relances, rows],
  );
  /* Les relances déjà faites depuis plus longtemps que le délai choisi : le
     contact commence à dater, le marché peut être rappelé sans attendre qu'il
     retombe dans les oublis. Comptées elles aussi sur tout le catalogue, et
     lues dans l'en-tête replié. */
  const relancesAnciennes = useMemo(
    () =>
      rows.filter(
        (row) =>
          Boolean(relances[row.code]) &&
          joursDepuis(relances[row.code]) >= delaiRappel,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delaiRappel, relances, rows],
  );
  /* Tous les marchés déjà rappelés, sur le catalogue entier : le compteur du
     bas de la feuille les garde seuls d'un clic, et le classeur les emporte
     sur sa troisième feuille. */
  const rappelsTous = useMemo(
    () => rows.filter((row) => Boolean(rappels[row.code])),
    [rappels, rows],
  );
  /* Les rappels en retard, sur le catalogue entier : les marchés relancés
     depuis plus longtemps que le délai choisi et jamais rappelés. C'est le
     même compte que la colonne du classeur, lu ici dans la feuille elle-même
     et gardé seul d'un clic au bas d'elle. */
  const rappelsRetard = useMemo(
    () =>
      rows.filter(
        (row) =>
          Boolean(relances[row.code]) &&
          !rappels[row.code] &&
          joursDepuis(relances[row.code]) >= delaiRappel,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delaiRappel, rappels, relances, rows],
  );
  /* Les rappels en retard, la relance la plus ancienne en tête : c'est cet
     ordre que le compteur du bas suit et que la liste copiée emporte, pour
     que le marché qui attend depuis le plus longtemps se lise le premier. */
  const rappelsRetardTries = useMemo(
    () =>
      [...rappelsRetard].sort(
        (a, b) =>
          new Date(relances[a.code]).getTime() - new Date(relances[b.code]).getTime(),
      ),
    [rappelsRetard, relances],
  );
  /* Le marché qui attend son rappel depuis le plus longtemps : son nom se lit
     dans le compteur du bas, comme la pastille des oublis nomme le sien — on
     sait donc qui relancer en premier sans ouvrir le fichier exporté. */
  /* Les retards qui dépassent le seuil d'urgence choisi : le compteur dit
     combien ils sont, et le tri par retard les remonte en tête. */
  const retardsUrgents = useMemo(
    () =>
      rappelsRetard.filter(
        (row) => joursDepuis(relances[row.code]) - delaiRappel >= seuilUrgence,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delaiRappel, rappelsRetard, relances, seuilUrgence],
  );
  const rappelRetardPlusVieux = rappelsRetardTries[0] ?? null;
  /* Le retard d'un rappel, en jours au-delà du délai choisi : négatif quand le
     second contact n'est pas encore dû ou qu'il a déjà eu lieu. Le même
     calcul sert au filtre des urgents et à la teinte plus dense de la ligne,
     pour que les deux ne se contredisent jamais. */
  const retardRappelDe = (code: string) => {
    const marque = relances[code];
    if (!marque || rappels[code]) return -1;
    const jours = joursDepuis(marque);
    return jours >= delaiRappel ? jours - delaiRappel : -1;
  };  const nomRetardPlusVieux = rappelRetardPlusVieux
    ? noms.get(rappelRetardPlusVieux.code) ?? rappelRetardPlusVieux.code
    : '';
  const joursRetardPlusVieux = rappelRetardPlusVieux
    ? joursDepuis(relances[rappelRetardPlusVieux.code])
    : 0;
  /* Les rappels vraiment manqués : relancés depuis plus de trois semaines et
     toujours sans second contact. Le compte se lit dans l'en-tête replié, à
     côté de l'état du tri, pour qu'on sache sans déplier la feuille combien
     de marchés ont laissé filer leur rappel. */
  const rappelsManques = useMemo(
    () =>
      rows.filter(
        (row) =>
          Boolean(relances[row.code]) &&
          !rappels[row.code] &&
          joursDepuis(relances[row.code]) >= SEUIL_RAPPEL_MANQUE,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rappels, relances, rows],
  );
  /* Les retards qui dépassent le seuil d'urgence, la relance la plus ancienne
     en tête : c'est cet ordre que la copie des urgents emporte, pour que le
     marché le plus en retard arrive le premier dans le message. */
  const retardsUrgentsTries = useMemo(
    () =>
      [...retardsUrgents].sort(
        (a, b) =>
          new Date(relances[a.code]).getTime() - new Date(relances[b.code]).getTime(),
      ),
    [relances, retardsUrgents],
  );
  /* Le rappel le plus urgent : le marché dont le retard dépasse le seuil depuis
     le plus longtemps. Son nom se lit dans la pastille des urgents, avec son
     retard en jours, sans avoir à déplier la feuille. */
  const urgentPlusVieux = retardsUrgentsTries[0] ?? null;
  const nomUrgentPlusVieux = urgentPlusVieux
    ? noms.get(urgentPlusVieux.code) ?? urgentPlusVieux.code
    : '';
  const joursUrgentPlusVieux = urgentPlusVieux
    ? joursDepuis(relances[urgentPlusVieux.code]) - delaiRappel
    : 0;
  /* Parmi les relances qui ont dépassé le délai, celles qui attendent encore
     leur rappel : ce sont les seules que le message emporte. Une relance déjà
     rappelée ne redemande donc jamais un second contact. */
  const rappelsAttente = useMemo(
    () => relancesAnciennes.filter((row) => !rappels[row.code]),
    [rappels, relancesAnciennes],
  );
  /* Les relances dues qui ont déjà reçu leur rappel : le pendant du compteur,
     lu dans l'en-tête pour séparer ce qui est fait de ce qui reste. */
  const rappelsFaits = useMemo(
    () => relancesAnciennes.filter((row) => Boolean(rappels[row.code])),
    [rappels, relancesAnciennes],
  );
  /* Les marchés du rappel, le contact le plus ancien en tête : ce sont eux
     qui attendent depuis le plus longtemps qu'on reprenne la parole. */
  const listeRappel = useMemo(
    () =>
      [...rappelsAttente]
        .sort(
          (a, b) =>
            new Date(relances[a.code]).getTime() - new Date(relances[b.code]).getTime(),
        )
        .map((row) => row.code),
    [rappelsAttente, relances],
  );
  /* Ce que la lecture « hors fourchette » emporte quand elle se copie : son
     compte, chaque marché avec son coefficient écrit, et la phrase qui dit ce
     que le prix affiché fait de ce coefficient. La lecture part donc telle
     quelle, sans ouvrir la feuille ni refaire le filtre chez le collègue. */
  const horsFourchetteTexte = () =>
    [
      t('ofs.horsCopyLead')
        .replace('{n}', String(horsFourchette.length))
        .replace('{total}', String(rows.length)),
      ...horsFourchette.map((row) =>
        t('ofs.horsCopyRowLink')
          .replace('{pays}', noms.get(row.code) ?? row.code)
          .replace('{coef}', String(Math.round(row.coef * 100)))
          .replace('{lien}', lienPrixLigne(row.code, lang)),
      ),
      t('ofs.horsCopyNote'),
    ].join('\n');
  /* La feuille déroule les lignes demandées : tout le catalogue dans l'ordre
     choisi, ou seulement les marchés au plancher. Le fichier exporté suit la
     même lecture. */
  const lignes =
    filtre === 'plancher'
      ? lignesTriees.filter((row) => row.plancher)
      : filtre === 'hors'
        ? lignesTriees.filter((row) => row.hors)
        : filtre === 'oublies'
          ? lignesTriees.filter((row) => copies[row.code] && joursDepuis(copies[row.code].at) >= seuil)
          : filtre === 'relances'
            ? lignesTriees.filter((row) => Boolean(relances[row.code]))
            : filtre === 'rappels'
              ? lignesTriees.filter((row) => Boolean(rappels[row.code]))
              : filtre === 'retards'
                ? lignesTriees.filter(
                    (row) =>
                      Boolean(relances[row.code]) &&
                      !rappels[row.code] &&
                      joursDepuis(relances[row.code]) >= delaiRappel,
                  )
                : filtre === 'urgents'
                  ? lignesTriees.filter(
                      (row) => retardRappelDe(row.code) >= seuilUrgence,
                    )
                  : lignesTriees;
  /* Le marché que ce tri remonte en tête : la ligne sous les deux boutons le
     nomme avec son économie, pour que l'ordre choisi se vérifie d'un regard. */
  /* Une adresse peut désigner une ligne précise de la feuille : la feuille
     s'ouvre, la ligne citée se déplie et l'écran la ramène au centre. Une
     lecture copiée depuis le compteur hors fourchette mène donc droit au
     marché qu'elle nomme, sans que le collègue ait à déplier ni à chercher. */
  useEffect(() => {
    /* Un lien de relance ne désigne pas une ligne mais la feuille entière : la
       feuille s’ouvre et se ramène à l’écran, le marché lu déjà choisi. */
    if (hash === '#of-pays-sheet') {
      setOpen(true);
      const timer = window.setTimeout(() => {
        document
          .getElementById('of-pays-sheet')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
      return () => window.clearTimeout(timer);
    }
    if (!hash.startsWith('#of-pays-')) return undefined;
    const code = hash.slice('#of-pays-'.length).toUpperCase();
    if (!rows.some((item) => item.code === code)) return undefined;
    setOpen(true);
    setFiltre('tous');
    setDetail(code);
    const timer = window.setTimeout(() => {
      document
        .getElementById(`of-pays-item-${code}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 220);
    return () => window.clearTimeout(timer);
  }, [hash, rows]);

  const plusAvantageux = tri === 'economie' ? lignesTriees[0] ?? null : null;
  const nomAvantageux = plusAvantageux
    ? noms.get(plusAvantageux.code) ?? plusAvantageux.code
    : '';
  /* Ce que l'année économise sur tout le catalogue, marchés additionnés :
     chaque économie est déjà lue en dinars, donc elle s'additionne sans
     mélanger les monnaies — c'est le seul total que la feuille puisse porter. */
  const economieCatalogue = useMemo(
    () => rows.reduce((total, row) => total + row.economieAnnuelleDzd, 0),
    [rows],
  );
  const economieCatalogueTexte = `${grouper(economieCatalogue)} DZD`;
  /* La pastille d'une ligne est une porte de tri : un clic classe la feuille
     par économie, un second la rend au catalogue. */
  const classerParEconomie = () => {
    choisirTri(tri === 'economie' ? 'catalogue' : 'economie');
  };

  /* One line per market: the four lengths side by side — what each market pays
     for the month, the quarter, the half year and the year, with the same
     engine as the cards — then the coefficient behind it, whether that figure
     is the floor, and the address that opens the page on that market, so the
     file can be forwarded as it is. */
  const exporter = useCallback(() => {
    /* Les colonnes du tableau vivent dans paysExport.ts : la feuille n'a plus
       qu'à dire ce qu'elle lit à l'écran. */
    exporterTarifsPays({ lignes, noms, t, lang, pays, tri, filtre });
    setCsvDone(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCsvDone(false), 2600);
  }, [filtre, lang, lignes, noms, pays, t, tri]);

  /* La relance s'emporte aussi comme fichier : le marché, son tarif annuel
     dans sa monnaie et en dinars, les jours d'attente, le dernier envoi,
     l'adresse qui rouvre la feuille sur lui et une colonne « dernière
     réponse » à remplir, puis le seuil et le total sur une seconde feuille —
     de quoi confier la tournée à plusieurs collègues sans la feuille ouverte. */
  const exporterRelance = useCallback(() => {
    /* Le classeur se compose dans paysExport.ts : la tournée à faire, son seuil
       et son total, puis les rappels déjà faits et leur ancienneté. */
    exporterRelancePays({
      listeRelance,
      copies,
      parCode,
      noms,
      relances,
      rappels,
      delaiRappel,
      auteur,
      lienRelance,
      nomChoisi,
      pays,
      seuil,
      totalRelanceDzd,
      rappelsTous,
      rappelsManques: rappelsManques.map((row) => row.code),
      seuilRappelManque: SEUIL_RAPPEL_MANQUE,
      seuilUrgence,
      urgentNom: nomUrgentPlusVieux,
      urgentJours: joursUrgentPlusVieux,
      t,
      lang,
    });
    setRelanceCsvDone(true);
    if (relanceTimer.current) window.clearTimeout(relanceTimer.current);
    relanceTimer.current = window.setTimeout(() => setRelanceCsvDone(false), 2600);
  }, [
    auteur,
    copies,
    delaiRappel,
    lang,
    lienRelance,
    listeRelance,
    nomChoisi,
    noms,
    parCode,
    pays,
    rappels,
    rappelsManques,
    rappelsTous,
    relances,
    seuil,
    seuilUrgence,
    nomUrgentPlusVieux,
    joursUrgentPlusVieux,
    t,
    totalRelanceDzd,
  ]);

  /* A row hands its own address away without going back up to the country
     selector: the link opens this page on that very market, coefficient and
     all, so a country can be sent its tariff straight from its line. */
  const copier = useCallback(
    async (code: string) => {
      const lien = lienPrix(code, lang);
      const ok = await copierDansLePresse(lien);
      setCopie({ code, ok });
      /* Seule une copie vraiment arrivée au presse-papiers entre dans le
         compte : un échec ne fait jamais croire qu'un lien est parti. */
      if (ok) {
        const prev = copiesRef.current;
        ecrireCopies({
          ...prev,
          [code]: {
            at: new Date().toISOString(),
            n: (prev[code]?.n ?? 0) + 1,
          },
        });
      }
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopie(null), 2400);
    },
    [ecrireCopies, lang],
  );

  /* Un marché se marque « relancé aujourd'hui » depuis sa propre ligne : un
     vrai contact, pas un simple envoi de lien. Un second clic retire la
     marque, pour qu'un geste fait par erreur ne laisse pas le marché à part
     pour toujours. */
  const marquerRelance = useCallback((code: string) => {
    const prev = relancesRef.current;
    const next = { ...prev };
    if (next[code]) {
      delete next[code];
      /* La marque de rappel suit celle de la relance : rappeler un marché
         qu'on ne dit plus relancé n'aurait plus de sens. */
      const autres = { ...rappelsRef.current };
      if (autres[code]) {
        delete autres[code];
        ecrireRappels(autres);
      }
    } else next[code] = new Date().toISOString();
    ecrireRelances(next);
  }, [ecrireRappels, ecrireRelances]);

  /* Un marché déjà relancé se marque « rappelé aujourd'hui » depuis sa propre
     ligne : le second contact se compte donc à part du premier, avec sa
     propre date. Un second clic retire la marque, pour revenir à l'état
     d'avant sans effacer la relance. */
  const marquerRappel = useCallback((code: string) => {
    if (!relancesRef.current[code]) return;
    const prev = rappelsRef.current;
    const next = { ...prev };
    if (next[code]) delete next[code];
    else next[code] = new Date().toISOString();
    ecrireRappels(next);
  }, [ecrireRappels]);

  /* La relance groupée : un seul geste marque tous les marchés du message
     comme relancés aujourd'hui, et le geste inverse les démarque — une
     manipulation faite par erreur ne laisse donc pas la tournée close. */
  const tousMarques =
    listeRelance.length > 0 && listeRelance.every((code) => Boolean(relances[code]));
  const marquerTout = useCallback(() => {
    const prev = relancesRef.current;
    const next = { ...prev };
    const at = new Date().toISOString();
    listeRelance.forEach((code) => {
      next[code] = at;
    });
    ecrireRelances(next);
  }, [ecrireRelances, listeRelance]);
  const demarquerTout = useCallback(() => {
    const prev = relancesRef.current;
    const next = { ...prev };
    listeRelance.forEach((code) => {
      delete next[code];
    });
    ecrireRelances(next);
    /* Les marques de rappel tombent avec elles : un marché qu'on ne dit plus
       relancé ne peut pas rester rappelé. */
    const autres = { ...rappelsRef.current };
    let change = false;
    listeRelance.forEach((code) => {
      if (!autres[code]) return;
      delete autres[code];
      change = true;
    });
    if (change) ecrireRappels(autres);
  }, [ecrireRappels, ecrireRelances, listeRelance]);

  /* « Démarrer la tournée » : le message se prépare pour les seuls marchés
     restants, les déjà relancés sortant de la liste — un contact déjà fait ne
     reçoit donc jamais deux fois le même message. Le message part aussitôt
     dans le presse-papiers, et le choix reste posé pour le fichier. */
  const demarrerTournee = async () => {
    if (resteARelancer.length === 0) return;
    setSansDejaRelances(true);
    const ok = await copierDansLePresse(
      construireRelance(resteARelancer, dejaRelances.length),
    );
    setTournee(ok ? 'ok' : 'err');
    if (tourneeTimer.current) window.clearTimeout(tourneeTimer.current);
    tourneeTimer.current = window.setTimeout(() => setTournee('idle'), 3600);
  };

  /* Le message de rappel, écrit pour les marchés relancés depuis plus longtemps
     que le délai choisi : la date du vrai contact, les jours écoulés et
     l'adresse qui rouvre la feuille sur chacun — le second contact ne se
     confond donc jamais avec une première relance. */
  const rappelTexte = () =>
    [
      t('ofs.rappelLead').replace('{n}', String(listeRappel.length)),
      ...listeRappel.map((code) =>
        t('ofs.rappelRow')
          .replace('{pays}', noms.get(code) ?? code)
          .replace('{date}', jourHeure(relances[code]))
          .replace('{n}', String(joursDepuis(relances[code])))
          .replace('{lien}', lienPrixLigne(code, lang)),
      ),
      t('ofs.rappelNote'),
      t('ofs.rappelSheet').replace('{lien}', lienRelance),
    ].join('\n');

  /* La liste des rappels en retard, copiée d'un seul clic : chaque marché y
     porte son retard en jours, compté au-delà du délai choisi, et l'adresse
     qui rouvre la feuille sur lui — le collègue qui reçoit le message sait
     donc qui rappeler en premier, sans recalculer les dates à la main. */
  const rappelsRetardTexte = () =>
    [
      t('ofs.rappelLateCopyLead')
        .replace('{n}', String(rappelsRetardTries.length))
        .replace('{j}', String(delaiRappel)),
      ...rappelsRetardTries.map((row) =>
        t('ofs.rappelLateCopyRow')
          .replace('{pays}', noms.get(row.code) ?? row.code)
          .replace('{n}', String(joursDepuis(relances[row.code]) - delaiRappel))
          .replace('{date}', jourHeure(relances[row.code]))
          .replace('{lien}', lienPrixLigne(row.code, lang)),
      ),
      t('ofs.rappelLateCopyNote'),
    ].join('\n');

  /* La liste réduite aux seuls urgents, copiée d'un seul clic : le seuil choisi
     sous le compteur dit ce qui est urgent, et le message ne retient donc que
     ces marchés — le plus en retard en tête, avec son retard en jours, la date
     de sa relance et le lien qui rouvre la feuille sur lui. */
  const rappelsUrgentsTexte = () =>
    [
      t('ofs.rappelUrgentCopyLead')
        .replace('{n}', String(retardsUrgentsTries.length))
        .replace('{s}', String(seuilUrgence))
        .replace('{j}', String(delaiRappel)),
      ...retardsUrgentsTries.map((row) =>
        t('ofs.rappelUrgentCopyRow')
          .replace('{pays}', noms.get(row.code) ?? row.code)
          .replace('{n}', String(joursDepuis(relances[row.code]) - delaiRappel))
          .replace('{date}', jourHeure(relances[row.code]))
          .replace('{lien}', lienPrixLigne(row.code, lang)),
      ),
      t('ofs.rappelUrgentCopyNote').replace('{s}', String(seuilUrgence)),
    ].join('\n');

  /* Le seul rappel le plus urgent, copié à part : son marché, son retard en
     jours et la date de sa relance — le premier appel à passer, sans la liste
     entière des urgents. */
  const rappelUrgentSeulTexte = () =>
    urgentPlusVieux
      ? [
          t('ofs.rappelUrgentOneLead').replace('{s}', String(seuilUrgence)),
          t('ofs.rappelUrgentOneRow')
            .replace('{pays}', nomUrgentPlusVieux)
            .replace('{n}', String(joursUrgentPlusVieux))
            .replace('{date}', jourHeure(relances[urgentPlusVieux.code]))
            .replace('{lien}', lienPrixLigne(urgentPlusVieux.code, lang)),
          t('ofs.rappelUrgentOneNote'),
        ].join('\n')
      : '';

  /* « Rappeler ces marchés » : le message part d'un seul clic dans le
     presse-papiers, et les marchés qu'il nomme sont marqués rappelés du même
     geste — le second contact se compte donc lui aussi. La réponse se lit
     juste à côté du bouton, avec le compte de ce qui vient d'être marqué. */
  const rappeler = async () => {
    if (listeRappel.length === 0) return;
    const n = listeRappel.length;
    const ok = await copierDansLePresse(rappelTexte());
    setRappelEtat(ok ? 'ok' : 'err');
    setRappelN(ok ? n : 0);
    if (ok) {
      const prev = rappelsRef.current;
      const next = { ...prev };
      const at = new Date().toISOString();
      listeRappel.forEach((code) => {
        next[code] = at;
      });
      ecrireRappels(next);
    }
    if (rappelTimer.current) window.clearTimeout(rappelTimer.current);
    rappelTimer.current = window.setTimeout(() => setRappelEtat('idle'), 3600);
  };

  /* « Tout marquer rappelé » : un seul geste pose la marque du second contact
     sur les marchés que le rappel nomme, et les garde pour que le même bouton
     puisse les démarquer — un geste fait par erreur ne laisse donc pas la
     liste du rappel fermée pour toujours. */
  const marquerToutRappel = () => {
    if (listeRappel.length === 0) return;
    const prev = rappelsRef.current;
    const next = { ...prev };
    const at = new Date().toISOString();
    listeRappel.forEach((code) => {
      next[code] = at;
    });
    ecrireRappels(next);
    setRappelBulk(listeRappel);
    setRappelBulkDone(listeRappel.length);
  };
  const demarquerToutRappel = () => {
    if (rappelBulk.length === 0) return;
    const next = { ...rappelsRef.current };
    rappelBulk.forEach((code) => {
      delete next[code];
    });
    ecrireRappels(next);
    setRappelBulk([]);
    setRappelBulkDone(0);
  };
  /* Le geste groupé ne propose de se défaire que tant que la liste du rappel
     est vraiment vide : dès qu'un marché redevient à rappeler, le bouton
     reprend son premier sens au lieu de rester bloqué sur l'annulation. */
  const rappelBulkActif = rappelBulk.length > 0 && listeRappel.length === 0;

  /* Une copie faite par erreur se retire de la liste d'un clic : le marché
     quitte « Déjà partis » et son compte avec lui, sans toucher aux autres. */
  const retirerCopy = useCallback((code: string) => {
    const prev = copiesRef.current;
    if (!prev[code]) return;
    const next = { ...prev };
    delete next[code];
    ecrireCopies(next);
    setCopie(null);
  }, [ecrireCopies]);

  /* Une visite de démonstration laisse une liste qui n'a plus lieu d'être : un
     seul geste la vide entièrement, compte compris, et l'appareil l'oublie. */
  const effacerCopies = useCallback(() => {
    ecrireCopies({});
    setCopie(null);
  }, [ecrireCopies]);

  /* La pastille de l'en-tête est une porte : un clic déplie la feuille déjà
     réduite aux marchés oubliés, un second la rend entière. La feuille se
     ramène à l'écran, pour que le geste se voie sans chercher plus bas. */
  const ouvrirOublies = useCallback(() => {
    const dejaLa = open && filtre === 'oublies';
    setFiltre(dejaLa ? 'tous' : 'oublies');
    setOpen(true);
    if (sheetTimer.current) window.clearTimeout(sheetTimer.current);
    sheetTimer.current = window.setTimeout(() => {
      document
        .getElementById('of-pays-sheet')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 160);
  }, [filtre, open]);

  /* La pastille des urgents, dans l'en-tête, est une porte du même genre : un
     clic déplie la feuille déjà réduite aux rappels qui dépassent le seuil, un
     second la rend entière. La feuille se ramène à l'écran. */
  const ouvrirUrgents = useCallback(() => {
    const dejaLa = open && filtre === 'urgents';
    setFiltre(dejaLa ? 'tous' : 'urgents');
    setOpen(true);
    if (sheetTimer.current) window.clearTimeout(sheetTimer.current);
    sheetTimer.current = window.setTimeout(() => {
      document
        .getElementById('of-pays-sheet')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 160);
  }, [filtre, open]);

  return (
    <div className={`of-pays-fold${compact ? ' is-compact' : ''}`} id="of-pays-sheet">
      <button
        type="button"
        className="of-fold-head"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="of-fold-icon" aria-hidden="true">
          <i className="ri-table-line"></i>
        </span>
        <span className="of-fold-main">
          <strong>{t('ofs.title')}</strong>
          <em>{t('ofs.sub')}</em>
          {/* L'en-tête replié dit ce que la feuille ouvrira : son tri et son
              filtre en cours, sans avoir à la déplier pour le découvrir. */}
          {(tri !== 'catalogue' ||
            filtre !== 'tous' ||
            oublies.length > 0 ||
            relancesAnciennes.length > 0 ||
            rappelsManques.length > 0 ||
            retardsUrgents.length > 0 ||
            rappelsRetard.length > 0) && (
            <span className="of-fold-state">
              {/* Les rappels manqués ouvrent la liste : relancés depuis plus
                  de trois semaines et toujours sans second contact, ils se
                  lisent avant tout le reste — avant même le compte des
                  urgents, qui n'est qu'un seuil plus bas. */}
              {rappelsManques.length > 0 && (
                <span
                  className="of-fold-tag is-rappel-manque"
                  title={t('ofs.foldRappelManqueHint').replace(
                    '{n}',
                    String(rappelsManques.length),
                  )}
                >
                  <i className="ri-error-warning-line" aria-hidden="true"></i>
                  {t(
                    rappelsManques.length > 1
                      ? 'ofs.foldRappelManque'
                      : 'ofs.foldRappelManqueOne',
                  ).replace('{n}', String(rappelsManques.length))}
                </span>
              )}
              {tri !== 'catalogue' && (
                <span className="of-fold-tag">
                  <i
                    className={
                      tri === 'economie'
                        ? 'ri-sort-asc'
                        : tri === 'retard'
                          ? 'ri-alarm-warning-line'
                          : 'ri-send-plane-line'
                    }
                    aria-hidden="true"
                  ></i>
                  {t('ofs.foldTri')} ·{' '}
                  {tri === 'economie'
                    ? t('ofs.sortEco')
                    : tri === 'retard'
                      ? t('ofs.sortRetard')
                      : t('ofs.sortServis')}
                </span>
              )}
              {filtre !== 'tous' && filtre !== 'oublies' && filtre !== 'urgents' && (
                <span
                  className={`of-fold-tag${filtre === 'hors' ? ' is-warn' : ''}${filtre === 'relances' ? ' is-relance' : ''}${filtre === 'rappels' ? ' is-rappele' : ''}${filtre === 'retards' ? ' is-retard' : ''}`}
                >
                  <i
                    className={
                      filtre === 'hors'
                        ? 'ri-error-warning-line'
                        : filtre === 'relances'
                          ? 'ri-check-double-line'
                          : filtre === 'rappels'
                            ? 'ri-phone-fill'
                            : filtre === 'retards'
                              ? 'ri-alarm-warning-line'
                              : 'ri-anchor-line'
                    }
                    aria-hidden="true"
                  ></i>
                  {filtre === 'hors'
                    ? t('ofs.horsFilterCta')
                    : filtre === 'relances'
                      ? t('ofs.relanceFilterCta')
                      : filtre === 'rappels'
                        ? t('ofs.rappelFilterCta')
                        : filtre === 'retards'
                          ? t('ofs.rappelLateFilterCta')
                          : t('ofs.floorFilterCta')}
                  <b>{lignes.length}</b>
                </span>
              )}
              {/* Le nombre de marchés oubliés se lit dans l'en-tête, sans
                  déplier la feuille : c'est lui qui dit s'il y a lieu de
                  relancer. La pastille est aussi une porte — un clic déplie
                  la feuille déjà réduite à ces marchés. */}
              {oublies.length > 0 && (
                <span
                  className={`of-fold-tag is-oublie${filtre === 'oublies' ? ' is-on' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={filtre === 'oublies'}
                  aria-label={
                    filtre === 'oublies'
                      ? t('ofs.foldOubliesClose')
                      : t('ofs.foldOubliesOpen').replace('{n}', String(oublies.length))
                  }
                  title={
                    filtre === 'oublies'
                      ? t('ofs.foldOubliesClose')
                      : t('ofs.foldOubliesOpen').replace('{n}', String(oublies.length))
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    ouvrirOublies();
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    event.stopPropagation();
                    ouvrirOublies();
                  }}
                >
                  <i className="ri-time-line" aria-hidden="true"></i>
                  {t(oublies.length > 1 ? 'ofs.foldOublies' : 'ofs.foldOubliesOne').replace(
                    '{n}',
                    String(oublies.length),
                  )}
                  {/* Celui qui attend depuis le plus longtemps : la pastille
                      dit le compte, puis l'attente la plus longue, sans
                      déplier la feuille. */}
                  <em className="of-fold-tag-age" title={t('ofs.foldOubliesOldestHint')}>
                    {t('ofs.foldOubliesOldest').replace('{n}', String(plusAncienJours))}
                  </em>
                  {/* Ce que ces marchés pèsent sur l'année, déjà lu dans la
                      pastille : le nombre d'oublis et leur tarif annuel en
                      dinars, sans déplier la feuille. */}
                  <b
                    className="of-fold-tag-sum"
                    title={t('ofs.foldOubliesSumHint').replace(
                      '{n}',
                      String(oublies.length),
                    )}
                  >
                    {t('ofs.foldOubliesSum').replace('{total}', totalOubliesTexte)}
                  </b>
                  {/* Parmi ces oublis, ceux qui ont déjà reçu une vraie
                      relance : la pastille les distingue des oublis qui
                      attendent encore un premier contact. */}
                  {dejaRelances.length > 0 && (
                    <em
                      className="of-fold-tag-done"
                      title={t('ofs.foldRelancedHint')}
                    >
                      <i className="ri-check-double-line" aria-hidden="true"></i>
                      {t(
                        dejaRelances.length > 1
                          ? 'ofs.foldRelanced'
                          : 'ofs.foldRelancedOne',
                      ).replace('{n}', String(dejaRelances.length))}
                    </em>
                  )}
                  <i
                    className={`of-fold-tag-door ${filtre === 'oublies' ? 'ri-filter-off-line' : 'ri-arrow-down-line'}`}
                    aria-hidden="true"
                  ></i>
                </span>
              )}
              {/* Les relances dues se séparent en deux lectures : celles qui
                  attendent encore leur rappel, et celles déjà rappelées. Le
                  second contact se compte donc sans se confondre avec ce qui
                  reste à faire. */}
              {(rappelsAttente.length > 0 || rappelsFaits.length > 0) && (
                <span
                  className="of-fold-tag is-recalled"
                  title={t('ofs.foldRelanceRecallHint').replace(
                    '{j}',
                    String(delaiRappel),
                  )}
                >
                  <i className="ri-phone-line" aria-hidden="true"></i>
                  {rappelsAttente.length > 0
                    ? t(
                        rappelsAttente.length > 1
                          ? 'ofs.foldRelanceRecall'
                          : 'ofs.foldRelanceRecallOne',
                      )
                        .replace('{n}', String(rappelsAttente.length))
                        .replace('{j}', String(delaiRappel))
                    : t('ofs.foldRappelNoneWaiting').replace('{j}', String(delaiRappel))}
                  {rappelsFaits.length > 0 && (
                    <em className="of-fold-tag-done is-rappele" title={t('ofs.foldRappelesHint')}>
                      <i className="ri-phone-fill" aria-hidden="true"></i>
                      {t(
                        rappelsFaits.length > 1 ? 'ofs.foldRappeles' : 'ofs.foldRappelesOne',
                      ).replace('{n}', String(rappelsFaits.length))}
                    </em>
                  )}
                </span>
              )}
              {/* Les rappels manqués, comptés dans l'en-tête : relancés depuis
                  plus de trois semaines et toujours sans second contact. La
                  pastille dit combien, sans déplier la feuille. */}
              {/* Les rappels qui dépassent le seuil d'urgence, comptés dans
                  l'en-tête : la pastille dit combien, rappelle le seuil en
                  jours, et sert de porte — un clic réduit la feuille à ces
                  seuls marchés, un second la rend entière. */}
              {retardsUrgents.length > 0 && (
                <span
                  className={`of-fold-tag is-urgent${filtre === 'urgents' ? ' is-on' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={filtre === 'urgents'}
                  aria-label={
                    filtre === 'urgents'
                      ? t('ofs.floorShowAllHint')
                      : t('ofs.urgentFilterHint')
                  }
                  title={
                    filtre === 'urgents'
                      ? t('ofs.floorShowAllHint')
                      : t('ofs.foldUrgentHint').replace('{n}', String(seuilUrgence))
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    ouvrirUrgents();
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    event.stopPropagation();
                    ouvrirUrgents();
                  }}
                >
                  <i
                    className={filtre === 'urgents' ? 'ri-filter-off-line' : 'ri-fire-line'}
                    aria-hidden="true"
                  ></i>
                  {filtre === 'urgents'
                    ? t('ofs.floorShowAll')
                    : t(
                        retardsUrgents.length > 1
                          ? 'ofs.foldUrgent'
                          : 'ofs.foldUrgentOne',
                      ).replace('{n}', String(retardsUrgents.length))}
                  <em className="of-fold-tag-seuil">
                    {t('ofs.foldUrgentSeuil').replace('{n}', String(seuilUrgence))}
                  </em>
                  {/* Le rappel qui attend depuis le plus longtemps : la pastille
                      le nomme avec son retard en jours, pour savoir qui appeler
                      d'abord sans ouvrir le fichier ni la feuille. */}
                  {nomUrgentPlusVieux && (
                    <em
                      className="of-fold-tag-oldest"
                      title={t('ofs.foldUrgentOldestHint')
                        .replace('{pays}', nomUrgentPlusVieux)
                        .replace('{n}', String(joursUrgentPlusVieux))}
                    >
                      <i className="ri-time-line" aria-hidden="true"></i>
                      {t('ofs.foldUrgentOldest')
                        .replace('{pays}', nomUrgentPlusVieux)
                        .replace('{n}', String(joursUrgentPlusVieux))}
                    </em>
                  )}
                </span>
              )}
              {/* Le seuil d'urgence, réglé depuis l'en-tête même : trois choix —
                  cinq, dix ou vingt jours — sans déplier la feuille, pour voir
                  le compte des urgents suivre aussitôt le nouveau seuil. */}
              {rappelsRetard.length > 0 && (
                <span
                  className="of-fold-urgence-set"
                  role="group"
                  aria-label={t('ofs.foldUrgenceLab')}
                >
                  <span className="of-fold-urgence-set-lab">
                    <i className="ri-fire-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">{t('ofs.foldUrgenceLab')}</span>
                  </span>
                  {SEUILS_URGENCE.map((valeur) => (
                    <span
                      key={valeur}
                      className={`of-fold-urgence-set-btn${seuilUrgence === valeur ? ' is-on' : ''}`}
                      role="button"
                      tabIndex={0}
                      aria-pressed={seuilUrgence === valeur}
                      title={t('ofs.foldUrgenceHint').replace('{n}', String(valeur))}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        choisirSeuilUrgence(valeur);
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter' && event.key !== ' ') return;
                        event.preventDefault();
                        event.stopPropagation();
                        choisirSeuilUrgence(valeur);
                      }}
                    >
                      {t('ofs.urgenceDay').replace('{n}', String(valeur))}
                    </span>
                  ))}
                </span>
              )}
              {(tri !== 'catalogue' || filtre !== 'tous') && (
                <span className="of-fold-tag-note">{t('ofs.foldStateNote')}</span>
              )}
            </span>
          )}
        </span>
        <span className="of-fold-sign" aria-hidden="true">
          <i className={open ? 'ri-subtract-line' : 'ri-add-line'}></i>
        </span>
      </button>

      {/* La relance se copie depuis l'en-tête replié : les marchés oubliés au
          seuil choisi partent en message sans ouvrir la feuille. */}
      {!open && listeRelance.length > 0 && (
        <div className="of-pays-fold-relance">
          <span className="of-pays-fold-relance-lab">
            <i className="ri-time-line" aria-hidden="true"></i>
            <span>
              {t('ofs.foldRelanceLab')
                .replace('{n}', String(listeRelance.length))
                .replace('{seuil}', String(seuil))}
            </span>
          </span>
          <CopyTextButton
            build={relanceTexte}
            label={t('ofs.foldRelance')}
            hint={t('ofs.relanceHint').replace('{seuil}', String(seuil))}
            className="of-pays-fold-relance-btn"
          />
        </div>
      )}

      {/* Le premier rendez-vous téléphonique se copie depuis l'en-tête replié :
          le rappel le plus urgent part avec son nom, son retard et sa date,
          sans déplier la feuille. */}
      {!open && urgentPlusVieux && nomUrgentPlusVieux && (
        <div className="of-pays-fold-relance is-urgent">
          <span className="of-pays-fold-relance-lab">
            <i className="ri-fire-line" aria-hidden="true"></i>
            <span>
              {t('ofs.foldUrgentOneCopyLab')
                .replace('{pays}', nomUrgentPlusVieux)
                .replace('{n}', String(joursUrgentPlusVieux))
                .replace('{s}', String(seuilUrgence))}
            </span>
          </span>
          <CopyTextButton
            build={rappelUrgentSeulTexte}
            label={t('ofs.rappelUrgentOne')}
            hint={t('ofs.rappelUrgentOneHint').replace('{s}', String(seuilUrgence))}
            className="of-pays-fold-relance-btn is-urgent"
          />
        </div>
      )}

      {/* Le rappel des marchés déjà relancés, offert dès l'en-tête : le délai
          choisi dit à partir de quand un contact peut être repris, et le
          message part d'un seul clic pour les marchés qui l'ont dépassé. */}
      {dejaRelancesTous.length > 0 && (
        <div className="of-pays-rappel" role="group" aria-label={t('ofs.rappelSeuil')}>
          <span className="of-pays-rappel-lab">
            <i className="ri-phone-line" aria-hidden="true"></i>
            <span>
              {listeRappel.length > 0
                ? t(listeRappel.length > 1 ? 'ofs.rappelLine' : 'ofs.rappelLineOne')
                    .replace('{n}', String(listeRappel.length))
                    .replace('{j}', String(delaiRappel))
                : rappelsFaits.length > 0
                  ? t('ofs.rappelAllDone')
                      .replace('{n}', String(rappelsFaits.length))
                      .replace('{j}', String(delaiRappel))
                  : t('ofs.rappelNone').replace('{j}', String(delaiRappel))}
            </span>
          </span>
          <span className="of-pays-rappel-acts">
            <span
              className="of-pays-rappel-delai"
              role="group"
              aria-label={t('ofs.rappelSeuil')}
            >
              <i className="ri-timer-line" aria-hidden="true"></i>
              {DELAIS_RAPPEL.map((valeur) => (
                <button
                  key={valeur}
                  type="button"
                  className={`of-pays-rappel-delai-btn${delaiRappel === valeur ? ' is-on' : ''}`}
                  aria-pressed={delaiRappel === valeur}
                  title={t('ofs.rappelSeuilHint').replace('{n}', String(valeur))}
                  onClick={() => choisirDelaiRappel(valeur)}
                >
                  {t('ofs.rappelSeuilDay').replace('{n}', String(valeur))}
                </button>
              ))}
            </span>
            {/* Le geste groupé du second contact : les marchés que le rappel
                nomme se marquent rappelés d'un seul clic, et le même bouton
                les démarque tant que le geste reste rattachable. */}
            {(listeRappel.length > 0 || rappelBulkActif) && (
              <button
                type="button"
                className={`of-pays-rappel-bulk${rappelBulkActif ? ' is-on' : ''}`}
                aria-pressed={rappelBulkActif}
                title={
                  rappelBulkActif
                    ? t('ofs.rappelBulkUndoHint').replace(
                        '{n}',
                        String(rappelBulk.length),
                      )
                    : t('ofs.rappelBulkHint').replace(
                        '{n}',
                        String(listeRappel.length),
                      )
                }
                onClick={
                  rappelBulkActif ? demarquerToutRappel : marquerToutRappel
                }
              >
                <i
                  className={
                    rappelBulkActif ? 'ri-close-circle-line' : 'ri-check-double-line'
                  }
                  aria-hidden="true"
                ></i>
                <span className="whitespace-nowrap">
                  {rappelBulkActif ? t('ofs.rappelBulkUndo') : t('ofs.rappelBulk')}
                </span>
              </button>
            )}
            {rappelBulkDone > 0 && (
              <em className="of-pays-rappel-ok" role="status">
                <i className="ri-check-line" aria-hidden="true"></i>
                {t('ofs.rappelBulkDone').replace('{n}', String(rappelBulkDone))}
              </em>
            )}
            {listeRappel.length > 0 && (
              <button
                type="button"
                className={`of-pays-rappel-btn${rappelEtat === 'ok' ? ' is-ok' : ''}`}
                title={t('ofs.rappelHint').replace('{j}', String(delaiRappel))}
                onClick={() => void rappeler()}
                aria-live="polite"
              >
                <i
                  className={
                    rappelEtat === 'ok'
                      ? 'ri-check-line'
                      : rappelEtat === 'err'
                        ? 'ri-error-warning-line'
                        : 'ri-phone-line'
                  }
                  aria-hidden="true"
                ></i>
                <span className="whitespace-nowrap">
                  {t('ofs.rappel')} · {listeRappel.length}
                </span>
              </button>
            )}
            {rappelEtat !== 'idle' && (
              <em
                className={`of-pays-rappel-ok${rappelEtat === 'err' ? ' is-err' : ''}`}
                role="status"
              >
                <i
                  className={rappelEtat === 'ok' ? 'ri-check-line' : 'ri-error-warning-line'}
                  aria-hidden="true"
                ></i>
                {rappelEtat === 'ok'
                  ? t('ofs.rappelCopyDone').replace('{n}', String(rappelN))
                  : t('ofs.relanceStartErr')}
              </em>
            )}
          </span>
        </div>
      )}

      <div className="of-pays-body" id={panelId} hidden={!open}>
        {/* L'ordre de la feuille, choisi au-dessus d'elle : le catalogue, ou
            les marchés les plus avantageux d'abord. Le tri vaut aussi pour le
            fichier exporté, qui suit la même lecture. */}
        <div className="of-pays-sort">
          <span className="of-pays-sort-lab">
            <i className="ri-sort-asc" aria-hidden="true"></i>
            {t('ofs.sortLabel')}
          </span>
          <div className="of-pays-sort-set" role="group" aria-label={t('ofs.sortLabel')}>
            <button
              type="button"
              className={`of-pays-sort-btn${tri === 'catalogue' ? ' is-on' : ''}`}
              aria-pressed={tri === 'catalogue'}
              title={t('ofs.sortCatalogueHint')}
              onClick={() => choisirTri('catalogue')}
            >
              <i className="ri-list-ordered" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ofs.sortCatalogue')}</span>
            </button>
            <button
              type="button"
              className={`of-pays-sort-btn${tri === 'economie' ? ' is-on' : ''}`}
              aria-pressed={tri === 'economie'}
              title={t('ofs.sortEcoHint')}
              onClick={() => choisirTri('economie')}
            >
              <i className="ri-arrow-down-double-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ofs.sortEco')}</span>
            </button>
            {/* Les marchés déjà servis remontent en tête : la tournée faite se
                relit d’un regard, et ce qui reste à servir vient après. */}
            <button
              type="button"
              className={`of-pays-sort-btn${tri === 'servis' ? ' is-on' : ''}`}
              aria-pressed={tri === 'servis'}
              title={t('ofs.sortServisHint')}
              onClick={() => choisirTri('servis')}
            >
              <i className="ri-send-plane-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ofs.sortServis')}</span>
            </button>
            {/* Le tri par retard : les rappels les plus urgents en tête, comme
                le tri par économie remonte les marchés les plus avantageux. */}
            <button
              type="button"
              className={`of-pays-sort-btn${tri === 'retard' ? ' is-on' : ''}`}
              aria-pressed={tri === 'retard'}
              title={t('ofs.sortRetardHint')}
              onClick={() => choisirTri('retard')}
            >
              <i className="ri-alarm-warning-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ofs.sortRetard')}</span>
            </button>
          </div>
          <p className="of-pays-sort-note" aria-live="polite">
            <i
              className={
                tri === 'economie'
                  ? 'ri-price-tag-3-line'
                  : tri === 'retard'
                    ? 'ri-alarm-warning-line'
                    : tri === 'servis'
                      ? 'ri-send-plane-line'
                      : 'ri-information-line'
              }
              aria-hidden="true"
            ></i>
            <span>
              {tri === 'economie' && plusAvantageux
                ? t('ofs.sortEcoLead')
                    .replace('{pays}', nomAvantageux)
                    .replace('{montant}', plusAvantageux.economieAnnuelle)
                : tri === 'retard'
                  ? rappelsRetard.length > 0
                    ? t('ofs.sortRetardLead').replace(
                        '{n}',
                        String(rappelsRetard.length),
                      )
                    : t('ofs.sortRetardEmpty')
                  : tri === 'servis'
                    ? copiesCount > 0
                      ? t('ofs.sortServisLead').replace('{n}', String(copiesCount))
                      : t('ofs.sortServisEmpty')
                    : t('ofs.sortCatalogueHint')}
            </span>
          </p>
          {/* Ce que dit la pastille posée sous chaque marché : la légende est
              au-dessus de la feuille, pas cachée dans une bulle, pour que le
              chiffre ne se lise jamais comme un prix de plus. */}
          <p className="of-pays-sort-note of-pays-eco-note">
            <i className="ri-price-tag-3-line" aria-hidden="true"></i>
            <span>{t('ofs.ecoPillNote')}</span>
          </p>
        </div>

        {/* Le total de la feuille, au-dessus d'elle : ce que l'année économise
            sur l'ensemble des marchés du catalogue, lu d'un seul chiffre avant
            la première ligne. */}
        <div className="of-pays-eco-total">
          <span className="of-pays-eco-total-lab">
            <i className="ri-coin-line" aria-hidden="true"></i>
            {t('ofs.ecoTotal')}
          </span>
          <b className="of-pays-eco-total-n">{economieCatalogueTexte}</b>
          <span className="of-pays-eco-total-note">
            {(filtre !== 'tous' ? t('ofs.ecoTotalNoteCatalogue') : t('ofs.ecoTotalNote')).replace(
              '{n}',
              String(rows.length),
            )}
          </span>
          {/* Le total part tel quel : l'intitulé, le chiffre et le nombre de
              marchés comparés, prêts à coller dans un message. */}
          <CopyTextButton
            build={() =>
              `${t('ofs.ecoTotal')} : ${economieCatalogueTexte} (${t('ofs.ecoTotalShare').replace(
                '{n}',
                String(rows.length),
              )})`
            }
            label={t('ofs.ecoTotalCopy')}
            hint={t('ofs.ecoTotalCopyHint')}
            className="of-pays-eco-copy"
          />
        </div>

        {/* La feuille réduite aux marchés oubliés le dit et se rend entière
            d'un clic : le filtre ouvert depuis la pastille de l'en-tête ne
            laisse personne sans retour. */}
        {filtre === 'oublies' && (
          <div className="of-pays-floor-band">
            <button
              type="button"
              className="of-pays-floor-btn is-on"
              aria-pressed
              title={t('ofs.floorShowAllHint')}
              onClick={() => setFiltre('tous')}
            >
              <i className="ri-filter-off-line" aria-hidden="true"></i>
              <b>{lignes.length}</b>
              <span className="whitespace-nowrap">{t('ofs.floorShowAll')}</span>
            </button>
            <span className="of-pays-floor-note" aria-live="polite">
              {t('ofs.oubliesFiltered')
                .replace('{n}', String(lignes.length))
                .replace('{total}', String(rows.length))}
            </span>
          </div>
        )}

        {/* La feuille réduite aux marchés déjà relancés le dit et se rend
            entière d'un clic : on vérifie la tournée faite sans y rester
            enfermé. */}
        {filtre === 'relances' && (
          <div className="of-pays-floor-band">
            <button
              type="button"
              className="of-pays-floor-btn is-relance is-on"
              aria-pressed
              title={t('ofs.floorShowAllHint')}
              onClick={() => setFiltre('tous')}
            >
              <i className="ri-filter-off-line" aria-hidden="true"></i>
              <b>{lignes.length}</b>
              <span className="whitespace-nowrap">{t('ofs.floorShowAll')}</span>
            </button>
            <span className="of-pays-floor-note" aria-live="polite">
              {t('ofs.relanceFiltered')
                .replace('{n}', String(lignes.length))
                .replace('{total}', String(rows.length))}
            </span>
          </div>
        )}

        {/* La feuille réduite aux marchés déjà rappelés le dit et se rend
            entière d'un clic : le second contact se vérifie sans y rester
            enfermé. */}
        {filtre === 'rappels' && (
          <div className="of-pays-floor-band">
            <button
              type="button"
              className="of-pays-floor-btn is-rappel is-on"
              aria-pressed
              title={t('ofs.floorShowAllHint')}
              onClick={() => setFiltre('tous')}
            >
              <i className="ri-filter-off-line" aria-hidden="true"></i>
              <b>{lignes.length}</b>
              <span className="whitespace-nowrap">{t('ofs.floorShowAll')}</span>
            </button>
            <span className="of-pays-floor-note" aria-live="polite">
              {t('ofs.rappelFiltered')
                .replace('{n}', String(lignes.length))
                .replace('{total}', String(rows.length))}
            </span>
          </div>
        )}

        {/* La feuille réduite aux rappels en retard le dit et se rend entière
            d'un clic : on voit qui attend un second contact sans y rester
            enfermé. */}
        {filtre === 'retards' && (
          <div className="of-pays-floor-band">
            <button
              type="button"
              className="of-pays-floor-btn is-retard is-on"
              aria-pressed
              title={t('ofs.floorShowAllHint')}
              onClick={() => setFiltre('tous')}
            >
              <i className="ri-filter-off-line" aria-hidden="true"></i>
              <b>{lignes.length}</b>
              <span className="whitespace-nowrap">{t('ofs.floorShowAll')}</span>
            </button>
            <span className="of-pays-floor-note" aria-live="polite">
              {t('ofs.rappelLateFiltered')
                .replace('{n}', String(lignes.length))
                .replace('{total}', String(rows.length))}
            </span>
          </div>
        )}

        {/* La feuille réduite aux seuls rappels urgents le dit et se rend
            entière d'un clic : le seuil se vérifie ligne par ligne sans y
            rester enfermé. */}
        {filtre === 'urgents' && (
          <div className="of-pays-floor-band">
            <button
              type="button"
              className="of-pays-floor-btn is-urgent is-on"
              aria-pressed
              title={t('ofs.floorShowAllHint')}
              onClick={() => setFiltre('tous')}
            >
              <i className="ri-filter-off-line" aria-hidden="true"></i>
              <b>{lignes.length}</b>
              <span className="whitespace-nowrap">{t('ofs.floorShowAll')}</span>
            </button>
            <span className="of-pays-floor-note" aria-live="polite">
              {t('ofs.urgentFiltered')
                .replace('{n}', String(lignes.length))
                .replace('{total}', String(rows.length))}
            </span>
            {/* La lecture est retenue d'une visite à l'autre : la phrase le dit,
                pour que personne ne s'étonne de rouvrir la feuille dessus. */}
            <span className="of-pays-urgence-kept">
              <i className="ri-bookmark-3-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ofs.urgentFilterKept')}</span>
            </span>
          </div>
        )}

        <div className="of-pays-table">
          <div className="of-pays-tr of-pays-head" aria-hidden="true">
            <span>{t('ofs.colMarket')}</span>
            {plans.map((plan) => (
              <span
                key={plan.id}
                className={`of-pays-head-dur${plan.featured ? ' is-year' : ''}`}
              >
                {t(plan.name)}
              </span>
            ))}
            <span className="of-pays-head-coef">{t('ofs.colCoef')}</span>
          </div>
          {lignes.map((row) => {
            const isOn = row.code === pays;
            const isOpen = detail === row.code;
            const etat = copie?.code === row.code ? (copie.ok ? 'ok' : 'err') : 'idle';
            const nom = noms.get(row.code) ?? row.code;
            const detailId = `${panelId}-${row.code}`;
            const lien = lienPrix(row.code, lang);
            const envoi = copies[row.code];
            const maRelance = relances[row.code];
            const monRappel = rappels[row.code];
            /* Passé trois semaines sans second contact, le retard n'est plus
               une simple avance : la ligne le dit d'un jeton plus insistant. */
            const rappelManque = Boolean(
              maRelance &&
                !monRappel &&
                joursDepuis(maRelance) >= SEUIL_RAPPEL_MANQUE,
            );
            /* Le rappel qui dépasse le seuil d'urgence choisi : la ligne prend
               une teinte plus dense et un trait plein sur son bord, pour se
               repérer dans la feuille avant même de trier ou de filtrer. */
            const rappelUrgent = retardRappelDe(row.code) >= seuilUrgence;
            return (
              <div
                key={row.code}
                id={`of-pays-item-${row.code}`}
                className={`of-pays-item${isOpen ? ' is-open' : ''}`}
              >
                <div
                  className={`of-pays-tr of-pays-row${isOn ? ' is-on' : ''}${row.hors ? ' is-hors' : ''}${row.plancher ? ' is-plancher' : ''}${isOpen ? ' is-open' : ''}${rappelUrgent ? ' is-urgent' : ''}`}
                >
                  {/* La ligne se lit d'un clic, mais elle contient sa propre
                      pastille de tri : elle est donc un conteneur cliquable
                      plutôt qu'un bouton, pour que la pastille reste un vrai
                      bouton à l'intérieur. */}
                  <div
                    className="of-pays-pick"
                    role="button"
                    tabIndex={0}
                    onClick={() => setDetail(isOpen ? null : row.code)}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return;
                      if (event.target !== event.currentTarget) return;
                      event.preventDefault();
                      setDetail(isOpen ? null : row.code);
                    }}
                    aria-expanded={isOpen}
                    aria-controls={detailId}
                    title={t('ofs.detailOpen')}
                  >
                    <span className="of-pays-name-cell">
                      <span className="of-pays-name">
                        {nom}
                        {isOn && <i className="ri-checkbox-circle-fill" aria-hidden="true"></i>}
                      </span>
                      {/* L'économie annuelle de ce marché, en pastille, sans
                          ouvrir la ligne : le même chiffre que le tri et que
                          le panneau de détail, lu en dinars. La pastille est
                          aussi un tri : un clic classe la feuille par
                          économie, un second la rend au catalogue. */}
                      <button
                        type="button"
                        className={`of-pays-eco${tri === 'economie' ? ' is-on' : ''}`}
                        aria-pressed={tri === 'economie'}
                        title={`${t('ofs.ecoPillHint').replace('{montant}', row.economieAnnuelle)} — ${t('ofs.ecoPillSortHint')}`}
                        aria-label={`${t('ofs.ecoPillHint').replace('{montant}', row.economieAnnuelle)} — ${t('ofs.ecoPillSortHint')}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          classerParEconomie();
                        }}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <i className="ri-price-tag-3-line" aria-hidden="true"></i>
                        <b>{row.economieAnnuelle}</b>
                      </button>
                      {/* La ligne dit d'elle-même que son adresse est déjà
                          partie, et combien de fois : plus besoin de
                          descendre jusqu'à la liste pour le savoir. */}
                      {envoi && (
                        <span
                          className="of-pays-sent"
                          title={t('ofs.rowSentHint').replace('{n}', String(envoi.n))}
                        >
                          <i className="ri-send-plane-line" aria-hidden="true"></i>
                          {t('ofs.rowSent').replace('{n}', String(envoi.n))}
                          {/* Depuis combien de jours l’adresse n’est pas
                              repartie : la ligne dit l’attente, pas seulement
                              l’instant du dernier envoi. */}
                          <em className="of-pays-sent-ago" title={t('ofs.sentAgoHint')}>
                            {ecoule(envoi.at)}
                          </em>
                        </span>
                      )}
                      {/* Un marché se marque « relancé aujourd'hui » depuis sa
                          propre ligne : la marque dit qu'un vrai contact a eu
                          lieu, là où le compte d'envois ne dit qu'un lien
                          parti. Elle reste sur cet appareil. */}
                      <button
                        type="button"
                        className={`of-pays-relance-mark${maRelance ? ' is-on' : ''}`}
                        aria-pressed={Boolean(maRelance)}
                        title={
                          maRelance
                            ? t('ofs.relanceUnmark').replace('{date}', jourHeure(maRelance))
                            : t('ofs.relanceMarkHint')
                        }
                        aria-label={
                          maRelance
                            ? t('ofs.relanceUnmark').replace('{date}', jourHeure(maRelance))
                            : t('ofs.relanceMarkHint')
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          marquerRelance(row.code);
                        }}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <i
                          className={maRelance ? 'ri-check-double-line' : 'ri-phone-line'}
                          aria-hidden="true"
                        ></i>
                        <span className="whitespace-nowrap">
                          {maRelance
                            ? joursDepuis(maRelance) <= 0
                              ? t('ofs.relanceMarkedToday')
                              : t('ofs.relanceMarkedOn').replace('{date}', jourHeure(maRelance))
                            : t('ofs.relanceMark')}
                        </span>
                      </button>
                      {/* Le second contact, marqué à part du premier : la
                          ligne dit quand la relance est partie et quand le
                          rappel l'a reprise. Un marché relancé sans rappel
                          ne se lit donc pas comme un marché déjà rappelé. */}
                      {maRelance && (
                        <button
                          type="button"
                          className={`of-pays-rappel-mark${monRappel ? ' is-on' : ''}`}
                          aria-pressed={Boolean(monRappel)}
                          title={
                            monRappel
                              ? t('ofs.rappelUnmark').replace(
                                  '{date}',
                                  jourHeure(monRappel),
                                )
                              : t('ofs.rappelMarkHint')
                          }
                          aria-label={
                            monRappel
                              ? t('ofs.rappelUnmark').replace(
                                  '{date}',
                                  jourHeure(monRappel),
                                )
                              : t('ofs.rappelMarkHint')
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            marquerRappel(row.code);
                          }}
                          onKeyDown={(event) => event.stopPropagation()}
                        >
                          <i
                            className={monRappel ? 'ri-phone-fill' : 'ri-phone-line'}
                            aria-hidden="true"
                          ></i>
                          <span className="whitespace-nowrap">
                            {monRappel
                              ? joursDepuis(monRappel) <= 0
                                ? t('ofs.rappelMarkedToday')
                                : t('ofs.rappelMarkedOn').replace(
                                    '{date}',
                                    jourHeure(monRappel),
                                  )
                              : t('ofs.rappelMark')}
                          </span>
                        </button>
                      )}
                      {/* Le rappel oublié se voit sur la ligne même : un marché
                          relancé au-delà du délai et jamais rappelé porte son
                          retard en jours, sans avoir à ouvrir le fichier
                          exporté pour le découvrir. Passé trois semaines, le
                          jeton devient plus insistant : trait plein, une
                          seule teinte dense, et les jours depuis la relance. */}
                      {rappelManque ? (
                        <span
                          className="of-pays-rappel-critique"
                          title={t('ofs.rappelCritiqueHint').replace(
                            '{n}',
                            String(joursDepuis(maRelance)),
                          )}
                        >
                          <i className="ri-error-warning-fill" aria-hidden="true"></i>
                          {t('ofs.rappelCritique').replace(
                            '{n}',
                            String(joursDepuis(maRelance)),
                          )}
                        </span>
                      ) : (
                        maRelance &&
                        !monRappel &&
                        joursDepuis(maRelance) >= delaiRappel && (
                          <span
                            className="of-pays-rappel-late"
                            title={t('ofs.rappelLateHint')
                              .replace('{j}', String(delaiRappel))
                              .replace(
                                '{n}',
                                String(joursDepuis(maRelance) - delaiRappel),
                              )}
                          >
                            <i className="ri-alarm-warning-line" aria-hidden="true"></i>
                            {t('ofs.rappelLate').replace(
                              '{n}',
                              String(joursDepuis(maRelance) - delaiRappel),
                            )}
                          </span>
                        )
                      )}
                      {/* Qui a mené la relance de ce marché : le nom inscrit sur
                          l'appareil se lit ici comme dans le classeur, pour
                          que deux collègues ne refassent pas le même contact. */}
                      {maRelance && auteur.trim() && (
                        <span
                          className="of-pays-relance-by"
                          title={t('ofs.rowRelanceByHint').replace('{nom}', auteur.trim())}
                        >
                          <i className="ri-user-3-line" aria-hidden="true"></i>
                          {t('ofs.rowRelanceBy').replace('{nom}', auteur.trim())}
                        </span>
                      )}
                    </span>
                    {/* Les quatre durées du marché, côte à côte : le mois, le
                        trimestre, le semestre et l'année, chacun lu dans la
                        monnaie du pays et par le même moteur que les cartes. */}
                    {plans.map((plan) => (
                      <span
                        key={plan.id}
                        className={`of-pays-dur${plan.featured ? ' is-year' : ''}`}
                      >
                        {prixPlan(plan, row.code)}
                      </span>
                    ))}
                    <span className="of-pays-coef">
                      <span className="of-pays-coef-num">
                        {row.hors && <i className="ri-error-warning-line" aria-hidden="true"></i>}
                        {Math.round(row.coef * 100)} %
                      </span>
                      {row.plancher && (
                        <em className="of-pays-floor" title={t('ofs.floorTip')}>
                          <i className="ri-anchor-line" aria-hidden="true"></i>
                          {t('ofs.floor')}
                        </em>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`of-pays-copy${etat === 'ok' ? ' is-ok' : ''}${etat === 'err' ? ' is-err' : ''}`}
                    onClick={() => void copier(row.code)}
                    title={`${t('ofs.copyRow')} — ${nom}`}
                    aria-label={`${t('ofs.copyRow')} — ${nom}`}
                  >
                    <i
                      className={
                        etat === 'ok'
                          ? 'ri-check-line'
                          : etat === 'err'
                            ? 'ri-error-warning-line'
                            : 'ri-link'
                      }
                      aria-hidden="true"
                    ></i>
                  </button>
                </div>

                {isOpen && (
                  <div className="of-pays-detail" id={detailId} role="region" aria-label={nom}>
                    <dl className="of-pays-detail-grid">
                      <div>
                        <dt>{t('ofs.dMonth')}</dt>
                        <dd>{row.montant}</dd>
                      </div>
                      <div>
                        <dt>
                          {t('ofs.csvYear')}
                          <span className="of-pays-detail-offer" title={t('ofp.yearTip')}>
                            <i className="ri-gift-2-line" aria-hidden="true"></i>
                            {t('ofp.yearOffer')}
                          </span>
                        </dt>
                        <dd>
                          {row.montantAnnuel}
                          <span className="of-pays-detail-was">
                            {t('ofs.dWas')} {row.montantAnnuelPlein}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt>{t('ofs.colCoef')}</dt>
                        <dd>
                          {Math.round(row.coef * 100)} %
                          {row.plancher && <span className="of-pays-detail-floor"> · {t('ofs.floor')}</span>}
                        </dd>
                      </div>
                      {/* Ce que la durée annuelle économise, lu en dinars : le
                          même chiffre que le tri, pour que l'ordre choisi se
                          vérifie ligne par ligne. */}
                      <div>
                        <dt title={t('ofs.dEcoHint')}>{t('ofs.dEco')}</dt>
                        <dd>
                          {row.economieAnnuelle}
                          <span className="of-pays-detail-unit">{t('ofs.perYear')}</span>
                        </dd>
                      </div>
                    </dl>

                    <p className="of-pays-detail-note">
                      <i className="ri-gift-2-line" aria-hidden="true"></i>
                      <span>{t('ofp.yearTip')}</span>
                    </p>
                    {row.plancher && (
                      <p className="of-pays-detail-note is-floor">
                        <i className="ri-anchor-line" aria-hidden="true"></i>
                        <span>{t('ofs.floorTip')}</span>
                      </p>
                    )}

                    {/* The two rhythms side by side, each with its own figure,
                        so the offered month is read before leaving the sheet. */}
                    <div className="of-pays-bill" role="group" aria-label={t('ofs.billLabel')}>
                      <button
                        type="button"
                        className={`of-pays-bill-btn${facturation === 'mois' ? ' is-on' : ''}`}
                        aria-pressed={facturation === 'mois'}
                        onClick={() => choisirRythme('mois')}
                      >
                        <span className="of-pays-bill-lab">
                          <i className="ri-calendar-line" aria-hidden="true"></i>
                          {t('ofs.billMonth')}
                        </span>
                        <b>{row.montant}</b>
                      </button>
                      <button
                        type="button"
                        className={`of-pays-bill-btn${facturation === 'annee' ? ' is-on' : ''}`}
                        aria-pressed={facturation === 'annee'}
                        onClick={() => choisirRythme('annee')}
                      >
                        <span className="of-pays-bill-lab">
                          <i className="ri-gift-2-line" aria-hidden="true"></i>
                          {t('ofs.billYear')}
                        </span>
                        <b>{row.montantAnnuel}</b>
                        <em>{t('ofp.yearOffer')}</em>
                      </button>
                    </div>

                    <p className="of-pays-bill-kept">
                      <i className="ri-bookmark-3-line" aria-hidden="true"></i>
                      <span>{t('ofp.billKept')}</span>
                    </p>

                    <Link
                      to={lienInscription(planDeFacturation(facturation), row.code)}
                      className="of-pays-signup"
                    >
                      <span>{t('ofs.signup')}</span>
                      <i className="ri-arrow-right-line" aria-hidden="true"></i>
                    </Link>

                    <div className="of-pays-detail-link">
                      <i className="ri-link" aria-hidden="true"></i>
                      <code title={lien}>{lien}</code>
                      <button
                        type="button"
                        className={`of-pays-key${etat === 'ok' ? ' is-ok' : ''}`}
                        onClick={() => void copier(row.code)}
                        title={t('ofs.copyRow')}
                        aria-label={`${t('ofs.copyRow')} — ${nom}`}
                      >
                        <i
                          className={
                            etat === 'ok'
                              ? 'ri-check-line'
                              : etat === 'err'
                                ? 'ri-error-warning-line'
                                : 'ri-file-copy-line'
                          }
                          aria-hidden="true"
                        ></i>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="of-pays-read"
                      onClick={() => choisir(row.code)}
                      aria-pressed={isOn}
                    >
                      <i className={isOn ? 'ri-check-double-line' : 'ri-money-dollar-circle-line'} aria-hidden="true"></i>
                      <span>{isOn ? t('ofs.dReading') : t('ofs.pick')}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Les deux compteurs du corridor, au bas de la feuille : combien de
            marchés paient le minimum de la fourchette, et combien en sortent.
            Chacun garde ses lignes seules d'un clic, et les compteurs se
            comptent toujours sur le catalogue entier. */}
        {(auPlancher.length > 0 ||
          horsFourchette.length > 0 ||
          dejaRelancesTous.length > 0 ||
          rappelsTous.length > 0 ||
          rappelsRetard.length > 0) && (
          <div className="of-pays-floor-band">
            {auPlancher.length > 0 && (
              <button
                type="button"
                className={`of-pays-floor-btn${filtre === 'plancher' ? ' is-on' : ''}`}
                aria-pressed={filtre === 'plancher'}
                title={
                  filtre === 'plancher' ? t('ofs.floorShowAllHint') : t('ofs.floorFilterHint')
                }
                onClick={() =>
                  setFiltre((valeur) => (valeur === 'plancher' ? 'tous' : 'plancher'))
                }
              >
                <i
                  className={filtre === 'plancher' ? 'ri-filter-off-line' : 'ri-anchor-line'}
                  aria-hidden="true"
                ></i>
                <b>{auPlancher.length}</b>
                <span className="whitespace-nowrap">
                  {filtre === 'plancher' ? t('ofs.floorShowAll') : t('ofs.floorFilterCta')}
                </span>
              </button>
            )}
            {horsFourchette.length > 0 && (
              <button
                type="button"
                className={`of-pays-floor-btn of-pays-hors-btn${filtre === 'hors' ? ' is-on' : ''}`}
                aria-pressed={filtre === 'hors'}
                title={filtre === 'hors' ? t('ofs.floorShowAllHint') : t('ofs.horsFilterHint')}
                onClick={() => setFiltre((valeur) => (valeur === 'hors' ? 'tous' : 'hors'))}
              >
                <i
                  className={
                    filtre === 'hors' ? 'ri-filter-off-line' : 'ri-error-warning-line'
                  }
                  aria-hidden="true"
                ></i>
                <b>{horsFourchette.length}</b>
                <span className="whitespace-nowrap">
                  {filtre === 'hors' ? t('ofs.floorShowAll') : t('ofs.horsFilterCta')}
                </span>
              </button>
            )}
            {/* La lecture des marchés hors fourchette se copie depuis son
                compteur : le compte, les marchés nommés et leur coefficient,
                prêts à coller dans un message — sans que le collègue ait à
                rouvrir la feuille ni à refaire le filtre. */}
            {horsFourchette.length > 0 && (
              <CopyTextButton
                build={horsFourchetteTexte}
                label={t('ofs.horsCopy')}
                hint={t('ofs.horsCopyHint')}
                className="of-pays-hors-copy"
              />
            )}
            {/* La tournée faite, comptée sur tout le catalogue : un clic ne
                garde que les marchés marqués « relancé » depuis leur ligne,
                pour relire ce qui a déjà été contacté. */}
            {dejaRelancesTous.length > 0 && (
              <button
                type="button"
                className={`of-pays-floor-btn is-relance${filtre === 'relances' ? ' is-on' : ''}`}
                aria-pressed={filtre === 'relances'}
                title={
                  filtre === 'relances' ? t('ofs.floorShowAllHint') : t('ofs.relanceFilterHint')
                }
                onClick={() =>
                  setFiltre((valeur) => (valeur === 'relances' ? 'tous' : 'relances'))
                }
              >
                <i
                  className={
                    filtre === 'relances' ? 'ri-filter-off-line' : 'ri-check-double-line'
                  }
                  aria-hidden="true"
                ></i>
                <b>{dejaRelancesTous.length}</b>
                <span className="whitespace-nowrap">
                  {filtre === 'relances' ? t('ofs.floorShowAll') : t('ofs.relanceFilterCta')}
                </span>
              </button>
            )}
            {/* Le second contact fait, compté à part du premier : un clic ne
                garde que les marchés marqués « rappelé » depuis leur ligne. */}
            {rappelsTous.length > 0 && (
              <button
                type="button"
                className={`of-pays-floor-btn is-rappel${filtre === 'rappels' ? ' is-on' : ''}`}
                aria-pressed={filtre === 'rappels'}
                title={
                  filtre === 'rappels' ? t('ofs.floorShowAllHint') : t('ofs.rappelFilterHint')
                }
                onClick={() =>
                  setFiltre((valeur) => (valeur === 'rappels' ? 'tous' : 'rappels'))
                }
              >
                <i
                  className={filtre === 'rappels' ? 'ri-filter-off-line' : 'ri-phone-fill'}
                  aria-hidden="true"
                ></i>
                <b>{rappelsTous.length}</b>
                <span className="whitespace-nowrap">
                  {filtre === 'rappels' ? t('ofs.floorShowAll') : t('ofs.rappelFilterCta')}
                </span>
              </button>
            )}
            {/* Le rappel oublié, son compte, son marché le plus ancien, sa
                liste copiable et son seuil d'urgence : le bloc vit dans
                PaysRetards.tsx, la feuille n'a plus qu'à le brancher. */}
            <PaysRetards
              count={rappelsRetard.length}
              plusVieuxNom={nomRetardPlusVieux}
              plusVieuxJours={joursRetardPlusVieux}
              plusUrgentNom={nomUrgentPlusVieux}
              plusUrgentJours={joursUrgentPlusVieux}
              active={filtre === 'retards'}
              onToggle={() =>
                setFiltre((valeur) => (valeur === 'retards' ? 'tous' : 'retards'))
              }
              copyBuild={rappelsRetardTexte}
              seuilUrgence={seuilUrgence}
              onSeuilUrgence={choisirSeuilUrgence}
              urgents={retardsUrgents.length}
              urgentActive={filtre === 'urgents'}
              onToggleUrgent={() =>
                setFiltre((valeur) => (valeur === 'urgents' ? 'tous' : 'urgents'))
              }
              urgentCopyBuild={rappelsUrgentsTexte}
              urgentOneCopyBuild={rappelUrgentSeulTexte}
            />
            <span className="of-pays-floor-note" aria-live="polite">
              {filtre === 'plancher'
                ? t('ofs.floorFiltered')
                    .replace('{n}', String(lignes.length))
                    .replace('{total}', String(rows.length))
                : filtre === 'hors'
                  ? t('ofs.horsFiltered')
                      .replace('{n}', String(lignes.length))
                      .replace('{total}', String(rows.length))
                  : filtre === 'relances'
                    ? t('ofs.relanceFiltered')
                        .replace('{n}', String(lignes.length))
                        .replace('{total}', String(rows.length))
                    : filtre === 'rappels'
                      ? t('ofs.rappelFiltered')
                          .replace('{n}', String(lignes.length))
                          .replace('{total}', String(rows.length))
                      : filtre === 'retards'
                        ? t('ofs.rappelLateFiltered')
                            .replace('{n}', String(lignes.length))
                            .replace('{total}', String(rows.length))
                        : t('ofs.floorFilterHint')}
            </span>
          </div>
        )}

        {/* La phrase qui fait découvrir le geste : chaque adresse copiée depuis
            une ligne ouvre la page sur ce marché, la ligne citée déjà dépliée. */}
        <p className="of-pays-link-note">
          <i className="ri-link" aria-hidden="true"></i>
          <span>{t('ofs.rowLinkNote')}</span>
          {/* Et, à côté, ce que la visite a déjà envoyé : le nombre de marchés
              dont l'adresse est partie depuis la feuille, un marché une seule
              fois. Rien ne s'écrit tant que rien n'est parti. */}
          {copiesCount > 0 && (
            <b className="of-pays-link-count" title={t('ofs.copyVisitHint')}>
              <i className="ri-file-copy-2-line" aria-hidden="true"></i>
              {t(copiesCount > 1 ? 'ofs.copyVisit' : 'ofs.copyVisitOne').replace(
                '{n}',
                String(copiesCount),
              )}
            </b>
          )}
        </p>

        {/* Sous la phrase qui explique le geste, les marchés dont l’adresse est
            vraiment partie pendant cette visite : le compte dit combien, la
            liste dit lesquels — on se rappelle à qui on a envoyé quoi. Un
            marché n’y est nommé qu’une fois, même si son lien est recopié. */}
        {copiesCount > 0 && (
          <>
            <p className="of-pays-link-names" title={t('ofs.copyVisitNamesHint')}>
              <i className="ri-send-plane-line" aria-hidden="true"></i>
              <span className="of-pays-link-names-lab">{t('ofs.copyVisitNames')}</span>
              <span className="of-pays-link-name-list">
                {copiesCodes.map((code) => {
                  const envoi = copies[code];
                  return (
                    <span className="of-pays-link-name" key={code}>
                      <i className="ri-check-line" aria-hidden="true"></i>
                      {noms.get(code) ?? code}
                      {/* Combien de fois cette adresse est repartie depuis la
                          visite : le nom dit aussi le nombre d'envois, pas
                          seulement l'instant du dernier. */}
                      <em
                        className="of-pays-link-name-times"
                        title={t('ofs.copyVisitTimesHint')}
                      >
                        {t('ofs.copyVisitTimes').replace('{n}', String(envoi.n))}
                      </em>
                      {/* Le jour et l'heure du dernier envoi : le marché nommé
                          dit aussi quand son adresse a circulé. */}
                      <em className="of-pays-link-name-at" title={t('ofs.copyVisitAtHint')}>
                        {t('ofs.copyVisitAt').replace('{date}', jourHeure(envoi.at))}
                      </em>
                      {/* Et, quand le marché a reçu une vraie relance, la date
                          du contact : un simple envoi et un marché déjà relancé
                          ne se lisent donc plus de la même façon. */}
                      {relances[code] && (
                        <em
                          className="of-pays-link-name-relanced"
                          title={t('ofs.copyVisitRelanceAtHint')}
                        >
                          <i className="ri-check-double-line" aria-hidden="true"></i>
                          {t('ofs.copyVisitRelanceAt').replace(
                            '{date}',
                            jourHeure(relances[code]),
                          )}
                        </em>
                      )}
                      {/* Le second contact, quand il a eu lieu : sa date se lit
                          à côté de celle de la relance, pour que le marché
                          garde ses deux moments de contact au même endroit. */}
                      {rappels[code] && (
                        <em
                          className="of-pays-link-name-rappel"
                          title={t('ofs.copyVisitRappelAtHint')}
                        >
                          <i className="ri-phone-fill" aria-hidden="true"></i>
                          {t('ofs.copyVisitRappelAt').replace(
                            '{date}',
                            jourHeure(rappels[code]),
                          )}
                        </em>
                      )}
                      {/* Et depuis combien de jours cette adresse attend son
                          prochain départ : c’est ce nombre qui désigne les
                          marchés oubliés, juste en dessous. */}
                      <em className="of-pays-link-name-ago" title={t('ofs.sentAgoHint')}>
                        {ecoule(envoi.at)}
                      </em>
                      {/* Une copie faite par erreur quitte la liste d'un clic. */}
                      <button
                        type="button"
                        className="of-pays-link-name-x"
                        title={t('ofs.copyVisitRemoveHint').replace(
                          '{pays}',
                          noms.get(code) ?? code,
                        )}
                        aria-label={t('ofs.copyVisitRemoveHint').replace(
                          '{pays}',
                          noms.get(code) ?? code,
                        )}
                        onClick={() => retirerCopy(code)}
                      >
                        <i className="ri-close-line" aria-hidden="true"></i>
                        <span>{t('ofs.copyVisitRemove')}</span>
                      </button>
                    </span>
                  );
                })}
              </span>
            </p>
            {/* La liste entière part d'un geste : le compte, chaque marché
                nommé avec son dernier envoi, et la phrase qui explique le
                geste — prête à coller dans un message. */}
            <div className="of-pays-link-copy">
              {/* Une liste laissée par une démonstration se vide d'un seul
                 geste : le compte, les noms et les dates partent ensemble. */}
              <button
                type="button"
                className="of-pays-link-clear"
                onClick={effacerCopies}
                title={t('ofs.copyVisitClearHint')}
                aria-label={t('ofs.copyVisitClearHint')}
              >
                <i className="ri-delete-bin-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('ofs.copyVisitClear')}</span>
              </button>
              <CopyTextButton
                build={() =>
                  [
                    t('ofs.copyVisitCopyLead').replace('{n}', String(copiesCount)),
                    ...copiesCodes.map((code) =>
                      t('ofs.copyVisitCopyRow')
                        .replace('{pays}', noms.get(code) ?? code)
                        .replace('{n}', String(copies[code].n))
                        .replace('{date}', jourHeure(copies[code].at))
                        .replace('{lien}', lienPrix(code, lang)),
                    ),
                    t('ofs.copyVisitCopyNote'),
                  ].join('\n')
                }
                label={t('ofs.copyVisitCopy')}
                hint={t('ofs.copyVisitCopyHint')}
                className="of-pays-link-copy-btn"
              />
            </div>
            {/* Depuis la liste elle-même, la relance : les marchés dont le
                dernier envoi remonte à plus de trente jours se relisent avec
                leur attente, et le message part avec l’adresse qui rouvre la
                feuille sur chacun d’eux. */}
            <div className="of-pays-relance-seuil" role="group" aria-label={t('ofs.relanceSeuil')}>
              <span className="of-pays-relance-seuil-lab">
                <i className="ri-timer-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('ofs.relanceSeuil')}</span>
              </span>
              {SEUILS_RELANCE.map((valeur) => (
                <button
                  key={valeur}
                  type="button"
                  className={`of-pays-relance-seuil-btn${seuil === valeur ? ' is-on' : ''}`}
                  aria-pressed={seuil === valeur}
                  title={t('ofs.relanceSeuilHint').replace('{n}', String(valeur))}
                  onClick={() => choisirSeuil(valeur)}
                >
                  {t('ofs.relanceSeuilDay').replace('{n}', String(valeur))}
                </button>
              ))}
              <span className="of-pays-relance-seuil-kept">
                <i className="ri-bookmark-3-line" aria-hidden="true"></i>
                <span>{t('ofs.relanceSeuilKept')}</span>
              </span>
            </div>
            {/* Le nom du collègue qui mène la tournée : il s'écrit dans la
                colonne « relancé par » du classeur, pour que deux personnes
                se partagent les mêmes marchés sans refaire le même contact. */}
            <div className="of-pays-relance-who">
              <label className="of-pays-relance-who-lab" htmlFor={whoId}>
                <i className="ri-user-3-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('ofs.relanceWho')}</span>
              </label>
              <input
                id={whoId}
                type="text"
                className="of-pays-relance-who-in"
                value={auteur}
                maxLength={40}
                placeholder={t('ofs.relanceWhoPlace')}
                autoComplete="off"
                onChange={(event) => changerAuteur(event.target.value)}
              />
              <span className="of-pays-relance-who-kept">
                <i className="ri-information-line" aria-hidden="true"></i>
                <span>{t('ofs.relanceWhoHint')}</span>
              </span>
            </div>
            {/* Ceux qui ont déjà reçu une vraie relance, au seuil choisi : le
                compteur les nomme, et le geste à côté les retire du message
                ou les y remet — sans effacer la marque posée sur leur ligne. */}
            {dejaRelances.length > 0 && (
              <div className="of-pays-relance-done">
                <span className="of-pays-relance-done-lab" title={t('ofs.relanceDoneHint')}>
                  <i className="ri-check-double-line" aria-hidden="true"></i>
                  {t('ofs.relanceDone')
                    .replace('{n}', String(dejaRelances.length))
                    .replace('{seuil}', String(seuil))}
                </span>
                <span className="of-pays-relance-done-acts">
                  <button
                    type="button"
                    className={`of-pays-relance-done-btn${sansDejaRelances ? ' is-on' : ''}`}
                    aria-pressed={sansDejaRelances}
                    title={
                      sansDejaRelances
                        ? t('ofs.relanceDoneBackHint').replace('{n}', String(dejaRelances.length))
                        : t('ofs.relanceDoneOutHint').replace('{n}', String(dejaRelances.length))
                    }
                    onClick={() => setSansDejaRelances((valeur) => !valeur)}
                  >
                    <i
                      className={
                        sansDejaRelances ? 'ri-arrow-go-back-line' : 'ri-close-circle-line'
                      }
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">
                      {sansDejaRelances ? t('ofs.relanceDoneBack') : t('ofs.relanceDoneOut')}
                    </span>
                  </button>
                  {/* Le geste de la tournée : le message se prépare pour les
                      seuls marchés restants, et les déjà relancés sortent de
                      la liste. Le compte des restants se lit dans la bulle. */}
                  {resteARelancer.length > 0 ? (
                    <button
                      type="button"
                      className="of-pays-relance-start"
                      title={t('ofs.relanceStartHint').replace(
                        '{n}',
                        String(dejaRelances.length),
                      )}
                      onClick={() => void demarrerTournee()}
                    >
                      <i className="ri-play-circle-line" aria-hidden="true"></i>
                      <span className="whitespace-nowrap">{t('ofs.relanceStart')}</span>
                    </button>
                  ) : (
                    <em className="of-pays-relance-start-none">
                      {t('ofs.relanceStartNone')}
                    </em>
                  )}
                  {tournee !== 'idle' && (
                    <em
                      className={`of-pays-relance-start-ok${tournee === 'err' ? ' is-err' : ''}`}
                      role="status"
                    >
                      <i
                        className={tournee === 'ok' ? 'ri-check-line' : 'ri-error-warning-line'}
                        aria-hidden="true"
                      ></i>
                      {tournee === 'ok'
                        ? t('ofs.relanceStartDone').replace(
                            '{n}',
                            String(resteARelancer.length),
                          )
                        : t('ofs.relanceStartErr')}
                    </em>
                  )}
                </span>
              </div>
            )}
            <div className="of-pays-link-relance">
              <span className="of-pays-link-relance-lab">
                <i className="ri-time-line" aria-hidden="true"></i>
                <span>{texteRelance}</span>
              </span>
              {listeRelance.length > 0 && (
                <span className="of-pays-link-relance-acts">
                  {/* Un seul geste marque tous les marchés du message comme
                      relancés aujourd'hui ; le geste inverse les démarque,
                      pour revenir à l'état d'avant. */}
                  <button
                    type="button"
                    className={`of-pays-relance-bulk${tousMarques ? ' is-on' : ''}`}
                    aria-pressed={tousMarques}
                    onClick={tousMarques ? demarquerTout : marquerTout}
                    title={
                      tousMarques
                        ? t('ofs.relanceBulkUndoHint').replace(
                            '{n}',
                            String(listeRelance.length),
                          )
                        : t('ofs.relanceBulkHint').replace(
                            '{n}',
                            String(listeRelance.length),
                          )
                    }
                  >
                    <i
                      className={tousMarques ? 'ri-close-circle-line' : 'ri-check-double-line'}
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">
                      {tousMarques ? t('ofs.relanceBulkUndo') : t('ofs.relanceBulk')}
                    </span>
                  </button>
                  <CopyTextButton
                    build={relanceTexte}
                    label={t('ofs.relance')}
                    hint={t('ofs.relanceHint').replace('{seuil}', String(seuil))}
                    className="of-pays-link-relance-btn"
                  />
                  {/* La même liste part aussi en fichier : le collègue qui
                      n'a pas la feuille ouverte reçoit la tournée complète. */}
                  <button
                    type="button"
                    className={`of-pays-relance-csv${relanceCsvDone ? ' is-ok' : ''}`}
                    onClick={exporterRelance}
                    title={t('ofs.relanceCsvHint')}
                    aria-live="polite"
                  >
                    <i
                      className={
                        relanceCsvDone ? 'ri-check-line' : 'ri-file-excel-2-line'
                      }
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">
                      {relanceCsvDone ? t('ofs.relanceCsvDone') : t('ofs.relanceCsv')}
                    </span>
                  </button>
                </span>
              )}
            </div>
            {listeRelance.length > 0 && (
              <p className="of-pays-link-relance-link">
                <i className="ri-link" aria-hidden="true"></i>
                <span>{t('ofs.relanceLinkLab')}</span>
                <code title={lienRelance}>{lienRelance}</code>
              </p>
            )}
            {/* La liste est retenue d'une visite à l'autre : la phrase le dit,
                pour que personne ne s'étonne de la retrouver en revenant. */}
            <p className="of-pays-link-kept">
              <i className="ri-bookmark-3-line" aria-hidden="true"></i>
              <span>{t('ofs.copyVisitKept')}</span>
            </p>
          </>
        )}

        {copie && (
          <p className={`of-pays-copied${copie.ok ? '' : ' is-err'}`} role="status">
            <i className={copie.ok ? 'ri-check-line' : 'ri-error-warning-line'} aria-hidden="true"></i>
            <span>
              {copie.ok ? t('ofs.copied') : t('ofs.copyErr')} ·{' '}
              {noms.get(copie.code) ?? copie.code}
            </span>
          </p>
        )}

        <div className="of-pays-foot">
          <p className="of-pays-note">
            <i className="ri-shield-check-line" aria-hidden="true"></i>
            <span>{t('ofs.note')}</span>
          </p>
          <button
            type="button"
            className={`ghost-btn of-pays-csv${csvDone ? ' is-ok' : ''}`}
            onClick={exporter}
            title={t('ofs.csvHint')}
            aria-live="polite"
          >
            <i className={csvDone ? 'ri-check-line' : 'ri-file-excel-2-line'} aria-hidden="true"></i>
            <span className="whitespace-nowrap">
              {csvDone ? t('ofs.csvDone') : t('ofs.csvCta')}
            </span>
          </button>
        </div>
        <p className="of-pays-csv-hint">
          <i className="ri-information-line" aria-hidden="true"></i>
          <span>
            {filtre === 'plancher'
              ? t('ofs.csvHintFloor')
              : filtre === 'hors'
                ? t('ofs.csvHintHors')
                : t('ofs.csvHint')}
          </span>
        </p>
        <p className="of-pays-csv-hint">
          <i className="ri-folder-line" aria-hidden="true"></i>
          <span>
            {t('ofs.csvKey')} <b>{nomChoisi}</b> ({pays}) · {t('ofs.csvKeyFollow')}
          </span>
        </p>
      </div>
    </div>
  );
}