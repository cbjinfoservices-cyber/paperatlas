import { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import CopyTextButton from '@/components/feature/CopyTextButton';
import AiresCompleteLegend from './AiresCompleteLegend';
import { nomPays, paysArabes } from '@/lib/pays';
import { paysSansTrade } from '@/lib/tradeCountries';
import { barreDePartTexte } from '@/lib/shareBar';
import {
  TOURS_EVENT,
  clearAiresCadrees,
  clearAiresCartesCopies,
  clearAiresCourtesCopies,
  clearAireSeuleCopies,
  markAireCadree,
  markAireSeuleCopied,
  markAiresCompletesCopied,
  markAiresCourteCopied,
  markTourCopied,
  readAiresCadrees,
  readAireCartesAires,
  readAireCartesAiresAts,
  readAiresCopiesJours,
  readAireSeuleCopies,
  readAiresCourtesCopies,
  readAiresCartesCopies,
  readTourCopies,
  type AiresCadrees,
  type AiresCompletesCopiees,
  type AiresSeulesCopiees,
  type ToursCopiees,
} from '@/lib/aireCarteMemory';
import {
  AIRE_CARTE_PARAM,
  AIRE_SEULE_PARAM,
  AIRES_MONDE_PARAM,
  AIRES_TRI_PARAM,
  REGIONS_MONDE,
  aireDeLien,
  airesDeLien,
  airesParPoidsDeLien,
  airesPourPays,
  fichesDesPays,
  regionMondeDe,
  regionMondeLabelKey,
  type RegionMondeKey,
} from '@/lib/worldRegions';
import './country-map-areas.css';

/** Le jour d'une copie, dit courtement : l'année ne s'écrit que si le geste
    n'appartient pas à l'année en cours. */
function jourCopie(stamp: number | null, lang: string): string {
  if (!stamp) return '';
  return new Intl.DateTimeFormat(localeFor(lang), {
    day: 'numeric',
    month: 'short',
    ...(new Date(stamp).getFullYear() === new Date().getFullYear()
      ? {}
      : { year: 'numeric' }),
  }).format(new Date(stamp));
}

type Props = {
  /** Le pays dont la page est ouverte : son aire vient en tête de la rangée. */
  pays: string;
  /** Le métier lu sur une page de type : la tournée copiée marque les aires
      où il n'a aucun atelier, avec les pays qui en sont privés. */
  trade?: string;
};

/**
 * Sur la page d'un pays, la grande carte se relit à l'échelle d'une aire du
 * monde : une pastille cadre la toile sur ses pays, pour que les régions du
 * pays apparaissent dans le voisinage qui donne son sens à son activité — et
 * à ses manques.
 *
 * Le même geste que la note des aires de la carte du monde : un appui cadre
 * sur l'aire, un second appui rend le cadrage du pays. La clef vit dans
 * l'adresse, si bien qu'un lien copié rouvre le même cadre.
 */
export default function CountryMapAreas({ pays, trade = '' }: Props) {
  const { t, lang } = useLang();
  const [params, setParams] = useSearchParams();
  /* Le chemin lu, pour que la tournée copiée donne l'adresse de la vue Carte
     de chaque aire sur la page où l'on se tient. */
  const location = useLocation();
  /* Les aires déjà cadrées depuis cet appareil : le compteur sous la carte
     les compte, et rouvre la dernière pressée d'un seul geste. */
  const [cadrees, setCadrees] = useState<AiresCadrees>({ aires: [], derniere: '' });
  /* Les tournées copiées depuis cet appareil, et la date de la dernière : le
     compte se lit à côté du compteur d'aires cadrées, sans rouvrir la note. */
  const [tours, setTours] = useState<ToursCopiees>({ count: 0, last: null, aire: '' });
  /* Les aires copiées seules depuis cet appareil : à côté du compte des
     tournées, le chiffre dit combien de fois une aire est partie seule, et
     le jour de la dernière copie. */
  const [seules, setSeules] = useState<AiresSeulesCopiees>({
    count: 0, last: null, aire: '', aires: [], pays: [],
  });
  /* Combien de fois la copie courte — les noms et les fiches — a servi depuis
     cet appareil, et le jour de la dernière : le petit compte posé sous la
     rangée le dit, comme celui des aires complètes de l'en-tête. */
  const [courtes, setCourtes] = useState<AiresCompletesCopiees>({ count: 0, last: null });
  /* Combien de fois une aire est partie depuis les cartes de l'annuaire —
     atelier comme plume —, et le jour de la dernière : posé à côté du compte
     des copies courtes, il distingue ces gestes-là de ceux partis d'une
     fiche. */
  const [cartes, setCartes] = useState<AiresCompletesCopiees>({ count: 0, last: null });
  /* Les aires distinctes déjà parties depuis les cartes de l'annuaire : le
     survol du compte les nomme une à une, et sa porte rouvre la note resserrée
     sur elles — ce que les cartes ont emporté se relit d'un geste. */
  const [cartesAires, setCartesAires] = useState<RegionMondeKey[]>([]);
  /* Le jour de la dernière copie de chacune de ces aires : le survol de la
     pastille les nomme une à une avec leur date, au lieu de ne donner qu’un
     total — on sait ce qui a quitté l’appareil et quand. */
  const [cartesAiresAts, setCartesAiresAts] = useState<Record<string, number>>({});
  /* Le jour de la dernière copie de chaque aire, tous gestes confondus :
     chaque pastille le porte sous les yeux, au lieu de le laisser au seul
     survol — on sait ce qui a quitté l'appareil, et quand. */
  const [airesJours, setAiresJours] = useState<Record<string, number>>({});
  /* La gomme du cadrage posée dans la rangée : le premier appui l'arme, le
     second efface la mémoire de l'appareil — de quoi repartir d'une tournée
     vierge sans remonter jusqu'à la note des aires. Laissée sans
     confirmation, elle se désarme seule au bout de cinq secondes. */
  const [gomme, setGomme] = useState(false);
  /* La gomme du seul compte des aires copiées seules : le premier appui
     l'arme, le second remet ce compte à zéro — le cadrage des aires, lui,
     reste tel quel. Laissée sans confirmation, elle se désarme au bout de
     cinq secondes. */
  const [seulesGomme, setSeulesGomme] = useState(false);
  /* La gomme du seul compte des copies courtes : le premier appui l'arme, le
     second remet ce compte à zéro — le carnet des aires reste tel quel. Laissée
     sans confirmation, elle se désarme au bout de cinq secondes. */
  const [courtesGomme, setCourtesGomme] = useState(false);
  /* La gomme du seul compte des aires copiées des cartes : le premier appui
     l'arme, le second remet ce compte à zéro — le carnet des aires, le
     cadrage et les autres comptes restent tels quels. Laissée sans
     confirmation, elle se désarme au bout de cinq secondes. */
  const [cartesGomme, setCartesGomme] = useState(false);

  useEffect(() => {
    setCadrees(readAiresCadrees());
    setTours(readTourCopies());
    setSeules(readAireSeuleCopies());
    setCourtes(readAiresCourtesCopies());
    setCartes(readAiresCartesCopies());
    setCartesAires(readAireCartesAires());
    setCartesAiresAts(readAireCartesAiresAts());
    setAiresJours(readAiresCopiesJours());
  }, []);

  /* Les deux comptes se relisent quand un geste part : les aires seules
     copiées depuis la note des aires du monde comptent ici aussi. */
  useEffect(() => {
    const relire = () => {
      setTours(readTourCopies());
      setSeules(readAireSeuleCopies());
      setCourtes(readAiresCourtesCopies());
      setCartes(readAiresCartesCopies());
      setCartesAires(readAireCartesAires());
      setCartesAiresAts(readAireCartesAiresAts());
      setAiresJours(readAiresCopiesJours());
    };
    window.addEventListener(TOURS_EVENT, relire);
    return () => window.removeEventListener(TOURS_EVENT, relire);
  }, []);

  useEffect(() => {
    if (!gomme) return;
    const timer = window.setTimeout(() => setGomme(false), 5000);
    return () => window.clearTimeout(timer);
  }, [gomme]);

  useEffect(() => {
    if (!seulesGomme) return;
    const timer = window.setTimeout(() => setSeulesGomme(false), 5000);
    return () => window.clearTimeout(timer);
  }, [seulesGomme]);

  useEffect(() => {
    if (!courtesGomme) return;
    const timer = window.setTimeout(() => setCourtesGomme(false), 5000);
    return () => window.clearTimeout(timer);
  }, [courtesGomme]);

  useEffect(() => {
    if (!cartesGomme) return;
    const timer = window.setTimeout(() => setCartesGomme(false), 5000);
    return () => window.clearTimeout(timer);
  }, [cartesGomme]);

  if (!pays) return null;

  const active = aireDeLien(params.get(AIRE_CARTE_PARAM));
  const sienne = regionMondeDe(pays)?.key ?? '';
  /* La petite bascule de la note des aires range aussi cette rangée : un
     seul geste range les deux listes, la plus lourde d'abord — le pays lu
     excepté, qui reste en tête comme sa propre aire. */
  const airesParPoids = airesParPoidsDeLien(params.get(AIRES_TRI_PARAM));
  /* L'ordre de poids range la rangée sans privilège : la plus lourde en tête,
     les ex æquo tranchés par le nom. La rangée, la tournée copiée, le rang
     écrit dans le survol et le compteur du monde lisent ainsi le même ordre,
     au lieu de laisser l'aire du pays en tête pendant que son rang dit autre
     chose. */
  const aires = airesParPoids
    ? [...airesPourPays(pays)].sort((a, b) => fichesDesPays(b.pays) - fichesDesPays(a.pays)
      || t(regionMondeLabelKey(a)).localeCompare(t(regionMondeLabelKey(b)), lang))
    : airesPourPays(pays);
  const activeRegion = active
    ? REGIONS_MONDE.find((region) => region.key === active) ?? null
    : null;
  /* La part du pays dans les fiches de son aire : le pays se situe dans le
     voisinage qui donne son sens à son activité — lu sur tout le répertoire,
     jamais sur la sélection filtrée. */
  const filesPays = activeRegion ? fichesDesPays([pays]) : 0;
  const filesAire = activeRegion ? fichesDesPays(activeRegion.pays) : 0;
  const part = filesAire > 0 ? Math.round((filesPays / filesAire) * 100) : 0;
  /* La dernière aire pressée, nommée dans le compteur et rouverte d'un clic. */
  const derniereRegion = cadrees.derniere
    ? REGIONS_MONDE.find((region) => region.key === cadrees.derniere) ?? null
    : null;
  /* La tournée ordonnée par poids, comme la note : le rang de chaque aire se
     lit parmi celles réellement cadrées depuis l'appareil, les ex æquo
     tranchés par le nom. L'échelle est lue sur ces mêmes aires. */
  const cadreesRows = cadrees.aires
    .map((key) => REGIONS_MONDE.find((region) => region.key === key))
    .filter((region): region is (typeof REGIONS_MONDE)[number] => Boolean(region));
  const cadreesOrdre = [...cadreesRows].sort(
    (a, b) => fichesDesPays(b.pays) - fichesDesPays(a.pays)
      || t(regionMondeLabelKey(a)).localeCompare(t(regionMondeLabelKey(b)), lang),
  );
  const rangCadree = (key: RegionMondeKey): number =>
    cadreesOrdre.findIndex((region) => region.key === key) + 1;
  const fichesCadrees = cadreesRows
    .reduce((sum, region) => sum + fichesDesPays(region.pays), 0);
  /* La tête de liste de la tournée : la première aire emportée et ses fiches.
     Le survol du rang la nomme, pour lire le début du message sans le coller. */
  const teteTour = cadreesOrdre[0] ?? null;
  /* Le rang de chaque aire parmi celles de ce pays : la plus lourde en tête,
     les ex æquo tranchés par le nom. La copie du pays le dit ligne à ligne. */
  const airesPaysOrdre = [...aires].sort(
    (a, b) => fichesDesPays(b.pays) - fichesDesPays(a.pays)
      || t(regionMondeLabelKey(a)).localeCompare(t(regionMondeLabelKey(b)), lang),
  );
  const rangPays = (key: RegionMondeKey): number =>
    airesPaysOrdre.findIndex((region) => region.key === key) + 1;
  /* Les aires que la tournée emporte hors du pays ouvert : le survol de la
     copie les compte, pour savoir ce que le message emporte au-delà de la
     page où il se tient. */
  const horsPaysOuvert = cadreesOrdre
    .filter((region) => rangPays(region.key) === 0).length;
  /* Les aires que la copie du pays emporte hors du pays ouvert : toutes
     celles qui ne sont pas la sienne. Elle les compte comme la tournée,
     si bien que les trois copies d'une page de pays se comparent. */
  const horsAiresPays = aires.filter((region) => rangPays(region.key) === 0).length;
  /* Le rang d'une aire, dit avec les mêmes mots dans les quatre copies de la
     page — la tournée, l'échelle, la part et les aires du pays : une même
     aire s'y lit à la même place. Quand l'aire cadrée ne touche pas le pays
     ouvert, la tournée garde son rang de cadrage, si bien qu'aucune ligne ne
     se tait. */
  const rangAireTxt = (key: RegionMondeKey): string => {
    const rang = rangPays(key);
    if (rang === 0) {
      return t('cmaps.aireFrameCopyTourRank')
        .replace('{rang}', String(rangCadree(key)))
        .replace('{n}', String(cadrees.aires.length));
    }
    return rang === 1
      ? t('cmaps.aireFrameChipRankFirst').replace('{n}', String(aires.length))
      : t('cmaps.aireFrameChipRank')
        .replace('{rang}', String(rang))
        .replace('{n}', String(aires.length));
  };
  /* L'échelle des seules aires qui touchent ce pays : la copie courte les
     emporte avec leur total, sans les autres aires cadrées sur l'appareil. */
  const fichesAiresPays = aires
    .reduce((sum, region) => sum + fichesDesPays(region.pays), 0);
  /* La part du pays dans les fiches que cette copie emporte : la petite barre
     posée sous la tournée du pays la dessine, comme celle des deux autres
     copies — le pays se lit dans le voisinage qu'il emporte. */
  const fichesPaysSeul = fichesDesPays([pays]);
  const partPays = fichesAiresPays > 0
    ? Math.round((fichesPaysSeul / fichesAiresPays) * 100)
    : 0;
  /* Les aires de ce pays où il pèse le plus lourd : il y devance tous les
     autres pays, les ex æquo tranchés par le nom. La copie du pays les compte
     sur une ligne en tête du message, pour savoir d'un mot si le pays mène
     quelque part dans son voisinage. */
  const nomLu = nomPays(pays, lang);
  const airesOuPaysMene = aires.filter((region) => region.pays.every((code) => code === pays
    || fichesPaysSeul > fichesDesPays([code])
    || (fichesPaysSeul === fichesDesPays([code])
      && nomLu.localeCompare(nomPays(code, lang), lang) <= 0)));
  /* Les aires menées, et la carte du monde telle qu'elle se tient : quand ses
     aires retenues sont exactement celles-ci, la ligne de tête se lit comme
     enfoncée — un second appui rend les vingt-deux pays. */
  const meneCles = airesOuPaysMene.map((region) => region.key);
  const airesRetenues = airesDeLien(params.get(AIRES_MONDE_PARAM));
  const meneSeules = meneCles.length > 0
    && airesRetenues.length === meneCles.length
    && meneCles.every((cle) => airesRetenues.includes(cle));
  /* Les pays privés du métier lu : la tournée copiée les marque aire par
     aire, pour que le manque se lise à l'échelle du voisinage. Lu sur tout le
     répertoire, jamais sur la sélection filtrée. */
  const manquants = new Set(trade ? paysSansTrade(trade) : []);

  /* Le poids de la tournée dans les fiches du monde : la petite barre de part
     des deux copies le dessine, si bien que le rang et l'échelle se comparent
     d'un regard avant d'être copiés. */
  const fichesMonde = REGIONS_MONDE
    .reduce((sum, region) => sum + fichesDesPays(region.pays), 0);
  const partMonde = fichesMonde > 0
    ? Math.round((fichesCadrees / fichesMonde) * 100)
    : 0;
  /* La part des aires de ce pays dans les fiches du monde : le petit
     compteur posé sous la rangée la dessine, comme l'échelle de la tournée.
     Les aires du pays se situent ainsi dans le monde au lieu de ne compter
     qu'entre elles. */
  const partMondeAires = fichesMonde > 0
    ? Math.round((fichesAiresPays / fichesMonde) * 100)
    : 0;
  /* L'aire du pays nommée seule : sa place parmi toutes les aires du monde,
     la plus lourde en tête et les ex æquo tranchés par le nom, et son poids
     contre les fiches du monde — de quoi la copier sans la moindre autre
     aire. */
  const sienneRegion = sienne
    ? REGIONS_MONDE.find((region) => region.key === sienne) ?? null
    : null;
  const ordreMonde = [...REGIONS_MONDE].sort(
    (a, b) => fichesDesPays(b.pays) - fichesDesPays(a.pays)
      || t(regionMondeLabelKey(a)).localeCompare(t(regionMondeLabelKey(b)), lang),
  );
  const sienneRang = sienneRegion
    ? ordreMonde.findIndex((region) => region.key === sienneRegion.key) + 1
    : 0;
  /** Le rang d'une aire parmi toutes celles du monde, la plus lourde en tête
      et les ex æquo tranchés par le nom : la copie des aires complètes de la
      rangée l'emporte, comme celle de l'en-tête, si bien que les deux
      messages lisent les aires dans la même place. */
  const rangMondeDe = (key: RegionMondeKey): number =>
    ordreMonde.findIndex((region) => region.key === key) + 1;
  const sienneFiles = sienneRegion ? fichesDesPays(sienneRegion.pays) : 0;
  const siennePartMonde = sienneFiles > 0 && fichesMonde > 0
    ? Math.round((sienneFiles / fichesMonde) * 100)
    : 0;
  /* La plus lourde des aires que le compteur du monde additionne : son survol
     la nomme avec son compte, pour que le total se vérifie sur la tête de la
     rangée au lieu de rester un chiffre sans prise. */
  const plusLourdeAirePays = airesPaysOrdre[0] ?? null;
  /* Le survol du compteur du monde : ce qu'il additionne et la plus lourde,
     lues dans l'ordre de la rangée — la plus lourde donne aussi son rang
     parmi les aires du pays, pour que le total se vérifie jusqu'à sa tête. */
  const mondeAiresTxt = plusLourdeAirePays
    ? `${t('cmaps.aireFrameWorldAiresHint')
      .replace('{n}', String(aires.length))
      .replace('{region}', t(regionMondeLabelKey(plusLourdeAirePays)))
      .replace('{files}', String(fichesDesPays(plusLourdeAirePays.pays)))
      .replace('{unit}', t('cmaps.airesChipFiles'))} · ${rangAireTxt(plusLourdeAirePays.key)}`
    : '';
  /* Le jour de la dernière tournée copiée, et celui de la dernière aire
     copiée seule : l'année ne s'écrit que si le geste n'appartient pas à
     l'année en cours. */
  const dateTour = jourCopie(tours.last, lang);
  const dateSeule = jourCopie(seules.last, lang);
  const dateCourte = jourCopie(courtes.last, lang);
  /* Le jour de la dernière aire partie d'une carte de l'annuaire. */
  const dateCartes = jourCopie(cartes.last, lang);
  /* Les aires distinctes que les cartes ont emportées, nommées une à une dans
     l'ordre des aires du monde : le survol du compte les dit avant qu'on le
     presse, et la porte mène à la note resserrée sur ces aires-là. */
  const cartesAiresNoms = cartesAires
    .map((key) => REGIONS_MONDE.find((region) => region.key === key))
    .filter((region): region is (typeof REGIONS_MONDE)[number] => Boolean(region))
    .map((region) => t(regionMondeLabelKey(region)))
    .join(' · ');
  /* Chaque aire avec le jour de sa dernière copie, une à une : le survol de
     la pastille dit ce qui a quitté l’appareil, et quand chaque aire est
     partie pour la dernière fois. */
  const cartesAiresDates = cartesAires
    .map((key) => REGIONS_MONDE.find((region) => region.key === key))
    .filter((region): region is (typeof REGIONS_MONDE)[number] => Boolean(region))
    .map((region) => t('cmaps.aireFrameCartesDatesRow')
      .replace('{region}', t(regionMondeLabelKey(region)))
      .replace('{date}', jourCopie(cartesAiresAts[region.key] ?? null, lang) || '—'))
    .join(' · ');
  /* La note est déjà resserrée sur ces mêmes aires : le compte se lit comme
     ouvert, enfoncé, au lieu de promettre un geste déjà fait. */
  const cartesSeuls = cartesAires.length > 0
    && airesRetenues.length === cartesAires.length
    && cartesAires.every((key) => airesRetenues.includes(key));
  /* La dernière aire copiée seule, nommée dans le survol du compteur. */
  const seuleAire = seules.aire
    ? REGIONS_MONDE.find((region) => region.key === seules.aire) ?? null
    : null;
  /* Les aires de cette rangée déjà copiées seules : le survol du compteur
     situe le geste comme la pastille ajoutée de la note le fait — combien
     des aires de la page sont déjà parties, sur combien. */
  const seulesDansRangee = aires
    .filter((region) => seules.aires.includes(region.key)).length;
  /* Les aires de cette rangée déjà emportées par une tournée : le survol du
     compte des tournées situe le geste — combien des aires de la page ont
     déjà quitté l'appareil dans un message, sur combien. */
  const toursDansRangee = aires
    .filter((region) => cadrees.aires.includes(region.key)).length;
  /* Les pays de cette rangée jamais copiés seuls : le compteur des aires
     seules porte le même chiffre que la pastille ajoutée de la note, si bien
     que les deux notes disent ensemble ce qui reste à envoyer. */
  const paysRangee = new Set<string>();
  aires.forEach((region) => region.pays.forEach((code) => paysRangee.add(code)));
  const paysRangeeJamais = [...paysRangee]
    .filter((code) => !seules.pays.includes(code)).length;
  /* Les aires de cette rangée dont tous les pays ont déjà été copiés seuls,
     et celles d'entre elles déjà parties : le compteur des tournées les
     nomme, et son clic ouvre la note resserrée dessus — le relevé complet se
     vérifie d'un geste, sans ouvrir une seule pastille. */
  const completesRangee = aires
    .filter((region) => region.pays.every((code) => seules.pays.includes(code)));
  const completesPartiesRangee = completesRangee
    .filter((region) => seules.aires.includes(region.key));
  const completesNoms = completesPartiesRangee
    .map((region) => t(regionMondeLabelKey(region)))
    .join(' · ');
  /* Les aires complètes de cette rangée qui ne sont jamais parties seules :
     le compteur les dit d'un chiffre, et son survol nomme ce que le geste
     emporterait — les aires et les fiches qu'elles tiendraient. */
  const completesNonSeulesRangee = completesRangee
    .filter((region) => !seules.aires.includes(region.key));
  /* Ces mêmes aires, la mieux placée d'abord : le survol de la copie courte
     les dit une à une avec leurs fiches, si bien que le message se mesure
     avant d'être collé — et l'ordre du message se lit déjà dans le survol. */
  const courtesRowsRangee = [...completesNonSeulesRangee]
    .sort((a, b) => rangMondeDe(a.key) - rangMondeDe(b.key));
  const fichesCompletesNonSeules = completesNonSeulesRangee
    .reduce((sum, region) => sum + fichesDesPays(region.pays), 0);
  const completesNonSeulesNoms = completesNonSeulesRangee
    .map((region) => t(regionMondeLabelKey(region)))
    .join(' · ');
  /* Toutes les aires complètes de la rangée, nommées une à une : la légende
     posée sous la rangée les dit au survol, sans ouvrir une seule copie. */
  const completesRangeeNoms = completesRangee
    .map((region) => t(regionMondeLabelKey(region)))
    .join(' · ');
  /* Les fiches que ces aires complètes tiendraient une fois envoyées : la
     légende les dit au survol, pour mesurer le geste avant de le presser. */
  const fichesCompletesRangee = completesRangee
    .reduce((sum, region) => sum + fichesDesPays(region.pays), 0);

  /** Les pays d'une aire, le plus lourd d'abord et les ex æquo tranchés par
      le nom, chacun avec son rang : le survol du geste d'aire seule les
      nomme un à un, au lieu de n'en donner que le compte. */
  const paysRangsTxt = (codes: readonly string[]): string => [...codes]
    .map((code) => ({ code, files: fichesDesPays([code]) }))
    .sort((a, b) => b.files - a.files
      || nomPays(a.code, lang).localeCompare(nomPays(b.code, lang), lang))
    .map((row, index) => t(index === 0 ? 'cmaps.airesAloneCountryRankFirst' : 'cmaps.airesAloneCountryRank')
      .replace('{pays}', nomPays(row.code, lang))
      .replace('{rang}', String(index + 1)))
    .join(' · ');

  /** Les pays d'une aire, une ligne chacun avec son rang, le plus lourd
      d'abord et les ex æquo tranchés par le nom : la copie de l'aire seule
      les emporte un à un, si bien que le message garde ses pays une fois
      collé — le survol, lui, les dit d'une seule phrase. */
  const paysLignesTxt = (codes: readonly string[]): string[] => [...codes]
    .map((code) => ({ code, files: fichesDesPays([code]) }))
    .sort((a, b) => b.files - a.files
      || nomPays(a.code, lang).localeCompare(nomPays(b.code, lang), lang))
    .map((row, index) => t(index === 0 ? 'cmaps.airesAloneCountryRowFirst' : 'cmaps.airesAloneCountryRow')
      .replace('{pays}', nomPays(row.code, lang))
      .replace('{rang}', String(index + 1))
      .replace('{n}', String(codes.length))
      /* Le poids du pays, à côté de son rang : le message collé dit ce que
         chaque pays pèse dans l'aire, sans rouvrir la carte. */
      .replace('{files}', String(row.files))
      .replace('{unit}', t('cmaps.airesChipFiles')));

  /** L'adresse de la vue Carte d'une aire : le collègue la colle telle quelle
      et retrouve la carte déjà cadrée sur elle, sans reposer le cadre. */
  const carteDeAire = (key: RegionMondeKey): string => {
    const base = typeof window === 'undefined'
      ? ''
      : `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
    const suivant = new URLSearchParams(params);
    suivant.set('view', 'map');
    suivant.set(AIRE_CARTE_PARAM, key);
    return `${base}${location.pathname}?${suivant.toString()}#board-results`;
  };

  /** La note des aires du monde, resserrée sur la rangée de ce pays : le
      compteur des aires seules y mène d'un clic — les mêmes aires s'y lisent
      avec leurs fiches, leur part et leurs pastilles, au lieu de rester un
      chiffre sans prise. */
  const ouvrirNoteRangee = () => {
    if (aires.length === 0) return;
    const next = new URLSearchParams(params);
    next.set(AIRES_MONDE_PARAM, aires.map((region) => region.key).join(','));
    next.delete(AIRE_SEULE_PARAM);
    next.delete(AIRES_TRI_PARAM);
    setParams(next, { replace: true });
    /* La note vient sous les yeux plutôt que de changer plus haut sans le
       dire — posée après le resserrement de la grille. */
    window.setTimeout(() => {
      document.getElementById('cmaps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 420);
  };

  /** La note des aires du monde, resserrée sur les seules aires de cette
      rangée qui sont complètes et déjà parties : le compteur des tournées y
      mène d'un clic, si bien que le relevé complet se relit au lieu de rester
      un compte. */
  const ouvrirNoteCompletes = () => {
    if (completesPartiesRangee.length === 0) return;
    const next = new URLSearchParams(params);
    next.set(AIRES_MONDE_PARAM, completesPartiesRangee.map((region) => region.key).join(','));
    next.delete(AIRE_SEULE_PARAM);
    next.delete(AIRES_TRI_PARAM);
    setParams(next, { replace: true });
    window.setTimeout(() => {
      document.getElementById('cmaps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 420);
  };

  /* Les aires que la porte de l'en-tête resserre : celles de la rangée qui
     sont complètes et jamais parties ; quand tout ce qui est complet est déjà
     parti, la porte garde les aires complètes elles-mêmes — elle ne mène
     jamais à une note vide. */
  const enteteCibles = completesNonSeulesRangee.length > 0
    ? completesNonSeulesRangee
    : completesRangee;
  const enteteNoms = enteteCibles
    .map((region) => t(regionMondeLabelKey(region)))
    .join(' · ');
  const enteteFiles = enteteCibles
    .reduce((sum, region) => sum + fichesDesPays(region.pays), 0);
  /* La note est déjà resserrée sur ces mêmes aires : la porte se lit comme
     ouverte, enfoncée, au lieu de promettre un geste déjà fait. */
  const enteteSeuls = enteteCibles.length > 0
    && airesRetenues.length === enteteCibles.length
    && enteteCibles.every((region) => airesRetenues.includes(region.key));

  /** La même porte, rappelée sous la rangée : le compteur de l'en-tête de la
      carte du monde, resserré sur les aires complètes de ce pays. La note et
      la rangée se rejoignent d'un seul clic, sans remonter à la main. */
  const ouvrirEnteteCompletes = () => {
    if (enteteCibles.length === 0) return;
    const next = new URLSearchParams(params);
    next.set(AIRES_MONDE_PARAM, enteteCibles.map((region) => region.key).join(','));
    next.delete(AIRE_SEULE_PARAM);
    next.delete(AIRES_TRI_PARAM);
    setParams(next, { replace: true });
    window.setTimeout(() => {
      document.getElementById('cmaps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 420);
  };

  /** La note des aires du monde, resserrée sur les seules aires complètes de
      cette rangée qui ne sont jamais parties seules : le compteur des aires
      complètes jamais parties y mène d'un clic, si bien que ce qui est complet
      mais jamais parti s'ouvre au lieu de rester un chiffre. */
  const ouvrirNoteCompletesLeft = () => {
    if (completesNonSeulesRangee.length === 0) return;
    const next = new URLSearchParams(params);
    next.set(AIRES_MONDE_PARAM, completesNonSeulesRangee.map((region) => region.key).join(','));
    next.delete(AIRE_SEULE_PARAM);
    next.delete(AIRES_TRI_PARAM);
    setParams(next, { replace: true });
    window.setTimeout(() => {
      document.getElementById('cmaps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 420);
  };

  /** La note des aires du monde, resserrée sur les seules aires que les cartes
      de l'annuaire ont emportées : le compte posé à côté des copies courtes y
      mène d'un clic — ce qui a quitté l'appareil par une carte se relit avec
      ses fiches, ses pays et ses pastilles, au lieu de rester un chiffre. */
  const ouvrirNoteCartes = () => {
    if (cartesAires.length === 0) return;
    const next = new URLSearchParams(params);
    next.set(AIRES_MONDE_PARAM, cartesAires.join(','));
    next.delete(AIRE_SEULE_PARAM);
    next.delete(AIRES_TRI_PARAM);
    setParams(next, { replace: true });
    window.setTimeout(() => {
      document.getElementById('cmaps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 420);
  };

  /** La date d'une pastille est une porte : elle rouvre la note des aires du
      monde resserrée sur cette seule aire, et l'amène sous les yeux — ce qui
      a déjà quitté l'appareil se mesure d'un geste, sans chercher l'aire.
      Secundo à côté du corps de la pastille, elle ne le presse pas. */
  const ouvrirNoteAireSeule = (key: RegionMondeKey) => {
    const next = new URLSearchParams(params);
    next.set(AIRES_MONDE_PARAM, key);
    next.delete(AIRE_SEULE_PARAM);
    next.delete(AIRES_TRI_PARAM);
    setParams(next, { replace: true });
    window.setTimeout(() => {
      document.getElementById('cmaps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 420);
  };

  /** Une pastille : le premier appui cadre sur l'aire, le second rend le pays. */
  const pick = (key: RegionMondeKey) => {
    const next = new URLSearchParams(params);
    if (active === key) {
      next.delete(AIRE_CARTE_PARAM);
    } else {
      next.set(AIRE_CARTE_PARAM, key);
      /* L'aire vient d'être cadrée : elle entre au carnet de l'appareil. */
      setCadrees(markAireCadree(key));
    }
    setParams(next, { replace: true });
  };

  /** Le compteur : la dernière aire pressée revient sous la carte d'un geste. */
  const reopen = (key: RegionMondeKey) => {
    const next = new URLSearchParams(params);
    next.set(AIRE_CARTE_PARAM, key);
    setParams(next, { replace: true });
    setCadrees(markAireCadree(key));
  };

  /** La ligne de tête des aires menées : un appui resserre la carte du monde
      sur ces aires seules, un second appui rend les vingt-deux pays. */
  const basculerMene = () => {
    if (meneCles.length === 0) return;
    const next = new URLSearchParams(params);
    if (meneSeules) {
      next.delete(AIRES_MONDE_PARAM);
    } else {
      next.set(AIRES_MONDE_PARAM, meneCles.join(','));
    }
    next.delete(AIRE_SEULE_PARAM);
    setParams(next, { replace: true });
    if (meneSeules) return;
    window.setTimeout(() => {
      document.getElementById('cmaps-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 160);
  };

  /** La porte de retour : le cadre se lève sur toutes les aires à la fois. */
  const clear = () => {
    const next = new URLSearchParams(params);
    next.delete(AIRE_CARTE_PARAM);
    setParams(next, { replace: true });
  };

  /** La gomme du seul compte des aires copiées seules : ce compte repart de
      zéro, les aires cadrées restent — la carte ouverte ne bouge pas non
      plus, seul le chiffre s'efface. */
  const gommerSeules = () => {
    if (!seulesGomme) {
      setSeulesGomme(true);
      return;
    }
    setSeules(clearAireSeuleCopies());
    setCourtes(readAiresCourtesCopies());
    setSeulesGomme(false);
  };

  /** La gomme du seul compte des copies courtes : ce compte repart de zéro,
      le carnet des aires reste — ni le cadrage, ni les tournées, ni les aires
      copiées seules ne bougent. */
  const gommerCourtes = () => {
    if (!courtesGomme) {
      setCourtesGomme(true);
      return;
    }
    setCourtes(clearAiresCourtesCopies());
    setCourtesGomme(false);
  };

  /** La gomme du seul compte des aires copiées des cartes : ce compte
      repart de zéro, le carnet des aires reste — ni le cadrage, ni les
      tournées, ni les aires seules, ni les copies courtes ne bougent. */
  const gommerCartes = () => {
    if (!cartesGomme) {
      setCartesGomme(true);
      return;
    }
    setCartes(clearAiresCartesCopies());
    setCartesGomme(false);
  };

  /** La gomme du cadrage, posée dans la rangée : un premier appui demande
      confirmation, le second efface la mémoire — les cinq aires redeviennent
      jamais cadrées et la tournée repart vierge. La carte ouverte ne bouge
      pas : seul le carnet s'efface. */
  const gommerCadrage = () => {
    if (!gomme) {
      setGomme(true);
      return;
    }
    setCadrees(clearAiresCadrees());
    setTours(readTourCopies());
    setSeules(readAireSeuleCopies());
    setCourtes(readAiresCourtesCopies());
    setCartes(readAiresCartesCopies());
    setGomme(false);
  };

  return (
    <div className="map-areas" role="group" aria-label={t('cmaps.aireFrame')}>
      <p
        className="map-areas-label"
        title={airesParPoids
          ? `${t('cmaps.aireFrameHint')} — ${t('cmaps.aireFrameWeights')}`
          : t('cmaps.aireFrameHint')}
      >
        <i className="ri-focus-3-line" aria-hidden="true"></i>
        <span>{t('cmaps.aireFrame')}</span>
      </p>
      <ul className="map-areas-list">
        {aires.map((region) => {
          const on = active === region.key;
          const here = region.key === sienne;
          const label = t(regionMondeLabelKey(region));
          /* Tous les pays de l'aire ont déjà été copiés seuls : la pastille
             porte un repère visible, si bien qu'une aire complète se retrouve
             d'un regard sans ouvrir une seule copie. */
          const complete = region.pays.every((code) => seules.pays.includes(code));
          /* Le rang de l'aire parmi celles de ce pays : le survol le dit, si
             bien qu'il se lise sans passer par la copie du pays. */
          const rangAire = rangPays(region.key);
          const rangTxt = rangAire === 1
            ? t('cmaps.aireFrameChipRankFirst').replace('{n}', String(aires.length))
            : t('cmaps.aireFrameChipRank')
              .replace('{rang}', String(rangAire))
              .replace('{n}', String(aires.length));
          /* L'aire du pays que le tri de poids a fait descendre : elle porte
             un repère visible, pour qu'on la retrouve sans lire son nom ni
             chercher son rang. Sans tri de poids, elle reste simplement en
             tête et le repère se tait. */
          const moved = airesParPoids && here && rangAire > 1;
          /* La part de l'aire dans les pays du monde : la même échelle que la
             note des aires, si bien que les deux notes parlent d'un même
             monde au lieu de compter chacune contre elle-même. */
          const partMonde = paysArabes.length > 0
            ? Math.round((region.pays.length / paysArabes.length) * 100)
            : 0;
          const mondeTxt = t('cmaps.airesChipWorld')
            .replace('{n}', String(region.pays.length))
            .replace('{total}', String(paysArabes.length))
            .replace('{pct}', String(partMonde));
          /* Le jour de la dernière copie de cette aire, tous gestes
             confondus : la pastille le porte elle-même, au lieu de le
             laisser au seul survol. */
          const dateAire = jourCopie(airesJours[region.key] ?? null, lang);
          /* La part de l'aire dans les fiches des aires de ce pays : la même
             petite barre que la note des aires, lue à l'échelle de la page. */
          const filesIci = fichesDesPays(region.pays);
          const partAire = fichesAiresPays > 0
            ? Math.round((filesIci / fichesAiresPays) * 100)
            : 0;
          /* La part exacte, au dixième : la barre n'en dessine qu'un arrondi,
             et son survol donne le chiffre qui la vérifie avant d'être cité. */
          const partExacte = fichesAiresPays > 0
            ? new Intl.NumberFormat(localeFor(lang), { maximumFractionDigits: 1 })
              .format((filesIci / fichesAiresPays) * 100)
            : '0';
          /* La place de l'aire parmi toutes celles du monde, et son poids
             dans les fiches du monde : le geste d'aire seule, posé sous la
             pastille, emporte les deux avec son nom — comme la note des
             aires, pour que les deux notes se lisent pareil. */
          const rangMondeIci = ordreMonde.findIndex((row) => row.key === region.key) + 1;
          const partMondeFiches = fichesMonde > 0
            ? Math.round((filesIci / fichesMonde) * 100)
            : 0;
          return (
            <li key={region.key} className="map-area-item">
              <span
                className={`map-area-chip${on ? ' is-on' : ''}${here ? ' is-home' : ''}${moved ? ' is-moved' : ''}${complete ? ' is-complete' : ''}`}
              >
                <button
                  type="button"
                  className="map-area-main"
                  aria-pressed={on}
                  title={`${label} · ${region.pays.length} ${t('cmaps.aireFrameCountries')} · ${mondeTxt} · ${rangTxt}${dateAire ? ` · ${t('cmaps.airesChipLastCopy').replace('{date}', dateAire)}` : ''}${complete ? ` — ${t('cmaps.aireFrameComplete')}` : ''}${here ? ` — ${moved ? t('cmaps.aireFrameHomeMoved') : t('cmaps.aireFrameHome')}` : ''} — ${on ? t('cmaps.aireFrameOff') : t('cmaps.aireFrameOn')}`}
                  onClick={() => pick(region.key)}
                >
                  <i className="ri-map-2-line" aria-hidden="true"></i>
                  <span className="map-area-name">{label}</span>
                  <b>{region.pays.length}</b>
                  {/* La part de l'aire dans les pays du monde, posée à côté de
                      son compte : la pastille se situe à l'échelle du monde,
                      comme celle de la note des aires. */}
                  <span className="map-area-world" title={mondeTxt}>{partMonde}%</span>
                </button>
                {/* Le jour de la dernière copie de l'aire, posé sur la
                    pastille elle-même : ce qui a déjà quitté l'appareil se
                    lit d'un regard, sans passer par le survol. Un appui
                    dessus rouvre la note resserrée sur cette seule aire. */}
                {dateAire && (
                  <button
                    type="button"
                    className="map-area-date"
                    title={`${t('cmaps.airesChipDateDoor').replace('{region}', label)} · ${t('cmaps.airesChipLastCopy').replace('{date}', dateAire)}`}
                    aria-label={t('cmaps.airesChipDateDoor').replace('{region}', label)}
                    onClick={() => ouvrirNoteAireSeule(region.key)}
                  >
                    <i className="ri-time-line" aria-hidden="true"></i>
                    {dateAire}
                    <i className="ri-arrow-right-up-line map-area-date-go" aria-hidden="true"></i>
                  </button>
                )}
                {/* La petite barre de part de la note, reprise aire par
                    aire : la plus lourde des aires du pays se repère d'un
                    regard, sans lire un seul chiffre. */}
                <span
                  className="map-area-share"
                  title={t('cmaps.aireFrameChipShareBar')
                    .replace('{files}', String(filesIci))
                    .replace('{total}', String(fichesAiresPays))
                    .replace('{unit}', t('cmaps.airesChipFiles'))
                    .replace('{pct}', partExacte)}
                  aria-hidden="true"
                >
                  <span
                    className="map-area-share-fill"
                    style={{ width: `${partAire}%` }}
                  ></span>
                </span>
                {/* L'aire complète porte son repère : le même signe que la
                    note des aires, pour la retrouver d'un regard. */}
                {complete && (
                  <span
                    className="map-area-complete"
                    title={t('cmaps.aireFrameCompleteHint')}
                    aria-label={`${t('cmaps.aireFrameComplete')} — ${t('cmaps.aireFrameCompleteHint')}`}
                  >
                    <i className="ri-checkbox-circle-fill" aria-hidden="true"></i>
                  </span>
                )}
                {here && (
                  <em className={`map-area-home${moved ? ' is-moved' : ''}`}>
                    {moved && <i className="ri-map-pin-2-fill" aria-hidden="true"></i>}
                    {t('cmaps.aireFrameHome')}
                  </em>
                )}
              </span>
              {/* Sous la pastille, le même geste d'aire seule que la note des
                  aires du monde : il n'emporte que cette aire — son nom, sa
                  place parmi les aires du monde et son poids avec sa barre de
                  part —, sans la moindre autre aire. */}
              <CopyTextButton
                label={t('cmaps.airesAloneCopy')}
                hint={`${t('cmaps.airesAloneCopyHint').replace('{region}', label)} · ${t('cmaps.airesAloneCountriesRank')
                  .replace('{n}', String(region.pays.length))
                  .replace('{ranks}', paysRangsTxt(region.pays))}`}
                className="map-area-alone"
                onCopied={() => setSeules(markAireSeuleCopied(region.key))}
                build={() => {
                  const unit = t('cmaps.airesChipFiles');
                  return [
                    t('cmaps.airesAloneCopyLine').replace('{region}', label),
                    `${t('cmaps.aireFrameCopyHomeRank')
                      .replace('{rang}', String(rangMondeIci))
                      .replace('{n}', String(REGIONS_MONDE.length))} · ${t('cmaps.aireFrameCopyHomeCountries')
                      .replace('{n}', String(region.pays.length))}`,
                    t('cmaps.aireFrameCopyHomeWeight')
                      .replace('{files}', String(filesIci))
                      .replace('{unit}', unit)
                      .replace('{pct}', String(partMondeFiches))
                      .replace('{bar}', barreDePartTexte(partMondeFiches)),
                    /* Les pays de l'aire, une ligne chacun avec son rang :
                       une fois le message collé, ils ne se perdent pas. */
                    t('cmaps.airesAloneCountriesHead')
                      .replace('{n}', String(region.pays.length)),
                    ...paysLignesTxt(region.pays),
                    /* Le total des fiches de l'aire, sous ses pays : la somme
                       du message collé se vérifie d'un regard. */
                    t('cmaps.airesAloneCountriesTotal')
                      .replace('{files}', String(filesIci))
                      .replace('{unit}', unit),
                    /* La part de ce total dans les fiches du monde, posée
                       sous ses pays : la somme du message collé se vérifie
                       aussi à l'échelle du monde. */
                    t('cmaps.airesAloneTotalWorld')
                      .replace('{pct}', String(partMondeFiches)),
                    /* L'adresse de la vue Carte, prête à coller : le cadre se
                       rouvre d'un clic au lieu de se reposer à la main. */
                    t('cmaps.airesAloneCopyMap').replace('{url}', carteDeAire(region.key)),
                  ].join('\n');
                }}
              />
            </li>
          );
        })}
      </ul>
      {/* Sous la rangée, la légende du trait affermi et de la coche : elle
          explique une seule fois ce que dit une aire complète, et les nomme
          une à une au survol. */}
      {completesRangee.length > 0 && (
        <AiresCompleteLegend
          count={completesRangee.length}
          total={aires.length}
          sample={t(regionMondeLabelKey(completesRangee[0]))}
          names={completesRangeeNoms}
          files={fichesCompletesRangee}
        />
      )}
      {/* Sous la rangée, la même porte que l'en-tête de la carte du monde :
          un clic y mène et resserre la note sur les aires complètes de ce
          pays — la note et la rangée se rejoignent d'un seul geste. Quand la
          note est déjà resserrée sur ces mêmes aires, la porte se lit comme
          enfoncée : elle dit d'un œil qu'elle est ouverte. À côté d'elle, le
          geste de copie groupé de ces aires complètes jamais parties. */}
      {(completesRangee.length > 0 || cartes.count > 0) && (
        <div className="map-areas-doors">
          {completesRangee.length > 0 && (
          <button
            type="button"
            className={`map-areas-headdoor${enteteSeuls ? ' is-on' : ''}`}
            aria-pressed={enteteSeuls}
            title={enteteSeuls
              ? `${t('cmaps.aireFrameHeadDoorOn')} — ${t('cmaps.aireFrameHeadDoorPick')}`
              : `${t('cmaps.aireFrameHeadDoorHint')
                .replace('{n}', String(enteteCibles.length))
                .replace('{total}', String(completesRangee.length))
                .replace('{names}', enteteNoms)
                .replace('{files}', String(enteteFiles))
                .replace('{unit}', t('cmaps.airesChipFiles'))} — ${t('cmaps.aireFrameHeadDoorPick')}`}
            onClick={ouvrirEnteteCompletes}
          >
            <i className="ri-arrow-up-circle-line" aria-hidden="true"></i>
            <span className="map-areas-headdoor-label">
              {t('cmaps.aireFrameHeadDoor')}
            </span>
            <b>{enteteCibles.length}</b>
            <em>/ {completesRangee.length}</em>
            <i className="ri-arrow-right-up-line map-areas-headdoor-go" aria-hidden="true"></i>
          </button>
          )}
          {/* Le geste de copie groupé de ces aires complètes : leur nom, leurs
              fiches, leur rang parmi les aires du monde et l'adresse de leur
              vue Carte partent d'un coup, dans l'ordre de leur place dans le
              monde — comme la copie de l'en-tête. */}
          {completesNonSeulesRangee.length > 0 && (
            <CopyTextButton
              label={t('cmaps.airesCompletesLeftCopy')}
              hint={t('cmaps.aireFrameCompleteCopyHint')
                .replace('{n}', String(completesNonSeulesRangee.length))
                .replace('{total}', String(completesRangee.length))}
              className="map-areas-copy map-areas-copy--completes"
              onCopied={() => markAiresCompletesCopied()}
              build={() => {
                const unit = t('cmaps.airesChipFiles');
                /* Les aires de la rangée, la mieux placée d'abord : l'écran
                   et le message disent la même chose, dans le même ordre. */
                const rows = [...completesNonSeulesRangee]
                  .sort((a, b) => rangMondeDe(a.key) - rangMondeDe(b.key));
                return [
                  t('cmaps.aireFrameCompleteCopyLine')
                    .replace('{n}', String(rows.length))
                    .replace('{total}', String(completesRangee.length)),
                  t('cmaps.airesCompletesCopyAll'),
                  `${t('cmaps.airesCompletesHeadRanksLead')} · ${REGIONS_MONDE.length}`,
                  ...rows.map((region) => `- ${t(regionMondeLabelKey(region))} · ${fichesDesPays(region.pays)} ${unit} · ${t('cmaps.aireFrameCopyHomeRank')
                    .replace('{rang}', String(rangMondeDe(region.key)))
                    .replace('{n}', String(REGIONS_MONDE.length))}`),
                  ...rows.map((region) => t('cmaps.airesAloneCopyMap')
                    .replace('{url}', carteDeAire(region.key))),
                ].join('\n');
              }}
            />
          )}
          {/* Le geste court, à côté du précédent : il n'emporte que le nom
              des aires complètes et leurs fiches, sans rang ni adresse — un
              message de deux lignes qui annonce le relevé sans le détailler. */}
          {completesNonSeulesRangee.length > 0 && (
            <CopyTextButton
              label={t('cmaps.aireFrameCompleteCopyShort')}
              hint={`${t('cmaps.aireFrameCompleteCopyShortHint')
                .replace('{n}', String(completesNonSeulesRangee.length))
                .replace('{total}', String(completesRangee.length))} · ${t('cmaps.aireFrameCompleteCopyShortRows')
                .replace('{list}', courtesRowsRangee
                  .map((region) => t('cmaps.aireFrameCompleteCopyShortRow')
                    .replace('{region}', t(regionMondeLabelKey(region)))
                    .replace('{files}', String(fichesDesPays(region.pays)))
                    .replace('{unit}', t('cmaps.airesChipFiles')))
                  .join(' · '))}`}
              className="map-areas-copy map-areas-copy--completes map-areas-copy--names"
              onCopied={() => setCourtes(markAiresCourteCopied())}
              build={() => {
                const unit = t('cmaps.airesChipFiles');
                /* Les aires de la rangée, la mieux placée d'abord : le
                   message court garde l'ordre de la copie entière. */
                const rows = courtesRowsRangee;
                return [
                  t('cmaps.aireFrameCompleteCopyShortLine')
                    .replace('{n}', String(rows.length))
                    .replace('{total}', String(completesRangee.length)),
                  ...rows.map((region) => t('cmaps.aireFrameCompleteCopyShortRow')
                    .replace('{region}', t(regionMondeLabelKey(region)))
                    .replace('{files}', String(fichesDesPays(region.pays)))
                    .replace('{unit}', unit)),
                ].join('\n');
              }}
            />
          )}
          {/* Combien de fois la copie courte a servi depuis cet appareil, et
              le jour de la dernière : posé sous la rangée, à côté des portes,
              il se relit comme le compte des aires complètes de l'en-tête. */}
          {courtes.count > 0 && (
            <>
              {/* Le compte se presse : il rouvre la note des aires resserrée
                  sur ces mêmes aires, d'un seul geste — et se lit enfoncé
                  quand la note y est déjà resserrée. */}
              <button
                type="button"
                className={`map-areas-courtes${enteteSeuls ? ' is-on' : ''}${completesNonSeulesRangee.length === 0 ? ' is-still' : ''}`}
                aria-pressed={enteteSeuls}
                title={`${t('cmaps.aireFrameShortCopiesCountHint').replace('{date}', dateCourte)}${completesNonSeulesRangee.length > 0
                  ? ` · ${t('cmaps.aireFrameShortCopiesOpenHint')}`
                  : ''}`}
                onClick={ouvrirNoteCompletesLeft}
              >
                <i className="ri-file-copy-line" aria-hidden="true"></i>
                <b>{courtes.count}</b>
                <span className="map-areas-courtes-label">
                  {t('cmaps.aireFrameShortCopiesCount')}
                </span>
                <em className="map-areas-courtes-last">
                  {t('cmaps.aireFrameCopiesLast').replace('{date}', dateCourte)}
                </em>
                {completesNonSeulesRangee.length > 0 && (
                  <i className="ri-arrow-right-up-line map-areas-courtes-go" aria-hidden="true"></i>
                )}
              </button>
              {/* La petite gomme du seul compte : ce chiffre repart de zéro,
                  le carnet des aires reste tel quel. Le premier appui l'arme,
                  le second efface. */}
              <button
                type="button"
                className={`map-areas-courtes-erase${courtesGomme ? ' is-armed' : ''}`}
                aria-pressed={courtesGomme}
                title={courtesGomme
                  ? t('cmaps.aireFrameSeulesClearConfirmHint')
                  : t('cmaps.aireFrameShortCopiesClearHint')}
                aria-label={courtesGomme
                  ? t('cmaps.aireFrameSeulesClearConfirmHint')
                  : t('cmaps.aireFrameShortCopiesClearHint')}
                onClick={gommerCourtes}
              >
                <i className="ri-eraser-line" aria-hidden="true"></i>
                {courtesGomme && (
                  <span className="whitespace-nowrap">
                    {t('cmaps.airesNeverClearConfirm')}
                  </span>
                )}
              </button>
            </>
          )}
          {/* Combien de fois une aire est partie depuis les cartes de
              l'annuaire — atelier comme plume —, et le jour de la dernière :
              posé à côté du compte des copies courtes, il dit ces gestes-là,
              partis d'une carte et non d'une fiche. */}
          {cartes.count > 0 && (
            <>
              {/* Le compte est une porte : il nomme au survol les aires
                  distinctes qu'il a emportées, une à une, et s'ouvre d'un
                  clic sur la note des aires resserrée sur elles. */}
              <button
                type="button"
                className={`map-areas-cartes is-door${cartesSeuls ? ' is-on' : ''}${cartesAires.length === 0 ? ' is-still' : ''}`}
                aria-pressed={cartesSeuls}
                title={`${t('cmaps.aireFrameCartesCountHint').replace('{date}', dateCartes)}${cartesAires.length > 0
                  ? ` · ${t('cmaps.aireFrameCartesDistinct')
                    .replace('{n}', String(cartesAires.length))
                    .replace('{total}', String(REGIONS_MONDE.length))
                    .replace('{list}', cartesAiresNoms)}${cartesAiresDates
                    ? ` · ${t('cmaps.aireFrameCartesDates').replace('{list}', cartesAiresDates)}`
                    : ''} · ${t('cmaps.aireFrameCartesOpen')}`
                  : ''}`}
                aria-label={`${t('cmaps.aireFrameCartesCount')}${cartesAires.length > 0
                  ? ` · ${t('cmaps.aireFrameCartesOpen')}`
                  : ''}`}
                onClick={ouvrirNoteCartes}
              >
                <i className="ri-layout-grid-line" aria-hidden="true"></i>
                <b>{cartes.count}</b>
                <span className="map-areas-cartes-label">
                  {t('cmaps.aireFrameCartesCount')}
                </span>
                <em className="map-areas-cartes-last">
                  {t('cmaps.aireFrameCopiesLast').replace('{date}', dateCartes)}
                </em>
                {cartesAires.length > 0 && (
                  <i className="ri-arrow-right-up-line map-areas-cartes-go" aria-hidden="true"></i>
                )}
              </button>
              {/* La petite gomme de ce seul compte : les aires copiées des
                  cartes repartent de zéro, le carnet des aires reste. Le
                  premier appui l'arme, le second efface. */}
              <button
                type="button"
                className={`map-areas-cartes-erase${cartesGomme ? ' is-armed' : ''}`}
                aria-pressed={cartesGomme}
                title={cartesGomme
                  ? t('cmaps.aireFrameCartesClearConfirmHint')
                  : t('cmaps.aireFrameCartesClearHint')}
                aria-label={cartesGomme
                  ? t('cmaps.aireFrameCartesClearConfirmHint')
                  : t('cmaps.aireFrameCartesClearHint')}
                onClick={gommerCartes}
              >
                <i className="ri-eraser-line" aria-hidden="true"></i>
                {cartesGomme && (
                  <span className="whitespace-nowrap">
                    {t('cmaps.airesNeverClearConfirm')}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      )}
      {/* La ligne de tête des aires menées, sous la rangée : les aires de ce
          pays où il pèse le plus lourd, comptées et nommées. Un appui
          resserre la carte du monde sur ces aires seules, un second appui
          rend les vingt-deux pays — le pays mène quelque part d'un geste. */}
      {airesOuPaysMene.length > 0 && (
        <button
          type="button"
          className={`map-areas-mene${meneSeules ? ' is-on' : ''}`}
          aria-pressed={meneSeules}
          title={meneSeules
            ? t('cmaps.aireFrameMenePicked')
            : `${t('cmaps.aireFrameMeneHint').replace('{pays}', nomLu)} ${airesOuPaysMene
              .map((region) => t('cmaps.aireFrameMeneShare')
                .replace('{region}', t(regionMondeLabelKey(region)))
                .replace('{pct}', String(fichesDesPays(region.pays) > 0
                  ? Math.round((fichesPaysSeul / fichesDesPays(region.pays)) * 100)
                  : 0)))
              .join(' · ')} — ${t('cmaps.aireFrameMenePick')}`}
          onClick={basculerMene}
        >
          <i className="ri-scales-3-line" aria-hidden="true"></i>
          <span className="map-areas-mene-label">
            {t('cmaps.aireFrameMene').replace('{pays}', nomLu)}
          </span>
          <b>{airesOuPaysMene.length}</b>
          <em>/ {aires.length}</em>
          <span className="map-areas-mene-names">
            {airesOuPaysMene.map((region) => t(regionMondeLabelKey(region))).join(' · ')}
          </span>
        </button>
      )}
      {/* Sous la rangée, le geste de l'aire du pays seule : son nom, sa place
          parmi les aires du monde et son poids — sans la moindre autre aire,
          quand on n'a rien d'autre à envoyer. */}
      {sienneRegion && (
        <CopyTextButton
          label={t('cmaps.aireFrameCopyHome')}
          hint={t('cmaps.aireFrameCopyHomeHint')
            .replace('{pays}', nomPays(pays, lang))
            .replace('{region}', t(regionMondeLabelKey(sienneRegion)))}
          className="map-areas-copy map-areas-copy--home"
          onCopied={() => setSeules(markAireSeuleCopied(sienneRegion.key, pays))}
          build={() => {
            const unit = t('cmaps.airesChipFiles');
            return [
              t('cmaps.aireFrameCopyHomeLine')
                .replace('{pays}', nomPays(pays, lang))
                .replace('{region}', t(regionMondeLabelKey(sienneRegion))),
              `${t('cmaps.aireFrameCopyHomeRank')
                .replace('{rang}', String(sienneRang))
                .replace('{n}', String(REGIONS_MONDE.length))} · ${t('cmaps.aireFrameCopyHomeCountries')
                .replace('{n}', String(sienneRegion.pays.length))}`,
              t('cmaps.aireFrameCopyHomeWeight')
                .replace('{files}', String(sienneFiles))
                .replace('{unit}', unit)
                .replace('{pct}', String(siennePartMonde))
                .replace('{bar}', barreDePartTexte(siennePartMonde)),
              /* Les pays de l'aire, une ligne chacun avec son rang : la copie
                 de l'aire du pays emporte les mêmes lignes que celle des
                 pastilles, si bien que les deux messages se lisent pareil. */
              t('cmaps.airesAloneCountriesHead')
                .replace('{n}', String(sienneRegion.pays.length)),
              ...paysLignesTxt(sienneRegion.pays),
              /* Le total des fiches de l'aire, sous ses pays : la copie de
                 l'aire du pays se vérifie comme celle des pastilles. */
              t('cmaps.airesAloneCountriesTotal')
                .replace('{files}', String(sienneFiles))
                .replace('{unit}', unit),
              /* La part de ce total dans les fiches du monde : la copie de
                 l'aire du pays se vérifie comme celle des pastilles. */
              t('cmaps.airesAloneTotalWorld').replace('{pct}', String(siennePartMonde)),
              /* L'adresse de la vue Carte de cette aire : la copie se rouvre
                 d'un clic, comme celle des pastilles de la rangée. */
              t('cmaps.airesAloneCopyMap').replace('{url}', carteDeAire(sienneRegion.key)),
            ].join('\n');
          }}
        />
      )}
      {/* La part des aires de ce pays dans les fiches du monde : posée sous
          la rangée, elle situe le voisinage du pays à l'échelle du monde, et
          sa petite barre la dessine comme l'échelle de la tournée. */}
      {fichesAiresPays > 0 && (
        <p
          className="map-areas-world"
          title={`${t('cmaps.aireFrameWorldHint')
            .replace('{files}', String(fichesAiresPays))
            .replace('{monde}', String(fichesMonde))
            .replace('{unit}', t('cmaps.airesChipFiles'))
            .replace('{pct}', String(partMondeAires))}${mondeAiresTxt ? ` · ${mondeAiresTxt}` : ''}`}
        >
          <i className="ri-earth-line" aria-hidden="true"></i>
          <span className="map-areas-world-label">{t('cmaps.aireFrameWorld')}</span>
          <b>{fichesAiresPays.toLocaleString(localeFor(lang))}</b>
          <span className="map-areas-world-unit">{t('cmaps.airesChipFiles')}</span>
          <span className="map-areas-world-bar" aria-hidden="true">
            <span
              className="map-areas-world-bar-fill"
              style={{ width: `${partMondeAires}%` }}
            ></span>
          </span>
          <em>{partMondeAires}%</em>
        </p>
      )}
      {/* Sous le compteur du monde, la plus lourde des aires qu'il additionne,
          nommée sans passer par le survol : le total a désormais sa tête de
          liste sous les yeux. */}
      {fichesAiresPays > 0 && plusLourdeAirePays && (
        <p
          className="map-areas-world-top"
          title={t('cmaps.aireFrameWorldTopHint')
            .replace('{region}', t(regionMondeLabelKey(plusLourdeAirePays)))
            .replace('{files}', String(fichesDesPays(plusLourdeAirePays.pays)))
            .replace('{unit}', t('cmaps.airesChipFiles'))
            .replace('{n}', String(aires.length))}
        >
          <i className="ri-bar-chart-horizontal-line" aria-hidden="true"></i>
          <span className="map-areas-world-top-label">{t('cmaps.aireFrameWorldTop')}</span>
          <b>{t(regionMondeLabelKey(plusLourdeAirePays))}</b>
          <span className="map-areas-world-top-files">
            {fichesDesPays(plusLourdeAirePays.pays).toLocaleString(localeFor(lang))}
            {' '}
            {t('cmaps.airesChipFiles')}
          </span>
        </p>
      )}
      {/* Le geste du compteur du monde : la part des aires du pays dans les
          fiches du monde part en texte, barre comprise, avec ses aires lues
          dans l'ordre de la rangée — la rangée, la tournée et l'échelle
          disent alors la même chose, et le message se colle tel quel. */}
      {fichesAiresPays > 0 && (
        <CopyTextButton
          label={t('cmaps.aireFrameWorldCopy')}
          hint={t('cmaps.aireFrameWorldCopyHint').replace('{pays}', nomPays(pays, lang))}
          className="map-areas-copy map-areas-copy--world"
          build={() => {
            const unit = t('cmaps.airesChipFiles');
            return [
              t('cmaps.aireFrameWorldCopyLine')
                .replace('{pays}', nomPays(pays, lang))
                .replace('{files}', String(fichesAiresPays))
                .replace('{monde}', String(fichesMonde))
                .replace('{unit}', unit)
                .replace('{pct}', String(partMondeAires)),
              /* La barre du compteur, reprise en texte : le message se lit à
                 côté de l'écran, sans redessiner le chiffre. */
              t('cmaps.aireFrameWorldCopyBar')
                .replace('{bar}', barreDePartTexte(partMondeAires))
                .replace('{pct}', String(partMondeAires)),
              /* Les aires du pays, une à une, dans l'ordre de la rangée :
                 chacune donne son poids dans le pays et sa part du monde, si
                 bien que le total se vérifie vers le bas. */
              ...aires.map((region) => {
                const files = fichesDesPays(region.pays);
                const partPaysAire = fichesAiresPays > 0
                  ? Math.round((files / fichesAiresPays) * 100)
                  : 0;
                const partAireMonde = fichesMonde > 0
                  ? Math.round((files / fichesMonde) * 100)
                  : 0;
                return t('cmaps.aireFrameWorldCopyRow')
                  .replace('{region}', t(regionMondeLabelKey(region)))
                  .replace('{files}', String(files))
                  .replace('{unit}', unit)
                  .replace('{pct}', String(partPaysAire))
                  .replace('{monde}', String(partAireMonde));
              }),
            ].join('\n');
          }}
        />
      )}
      {activeRegion && (
        <p className="map-areas-note">
          <i className="ri-checkbox-circle-line" aria-hidden="true"></i>
          <span>
            {t('cmaps.aireFrameNote')
              .replace('{region}', t(regionMondeLabelKey(activeRegion)))
              .replace('{n}', String(activeRegion.pays.length))}
          </span>
          <button
            type="button"
            className="map-areas-clear"
            title={t('cmaps.aireFrameClear')}
            onClick={clear}
          >
            <i className="ri-refresh-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('cmaps.aireFrameClear')}</span>
          </button>
        </p>
      )}
      {/* Sous la carte cadrée, la part du pays dans les fiches de son aire :
          le pays se situe dans le voisinage qui donne son sens à son
          activité, au lieu de rester un chiffre national sans échelle. */}
      {activeRegion && (
        <>
          <p
            className="map-areas-share"
            title={t('cmaps.aireFrameShareHint')
              .replace('{pays}', nomPays(pays, lang))
              .replace('{region}', t(regionMondeLabelKey(activeRegion)))}
          >
            <i className="ri-pie-chart-line" aria-hidden="true"></i>
            <span className="map-areas-share-label">{t('cmaps.aireFrameShare')}</span>
            <b>{part}%</b>
            <span className="map-areas-share-num">{filesPays} / {filesAire}</span>
            <span className="map-areas-share-unit">{t('cmaps.airesChipFiles')}</span>
            {/* La même petite barre que la note des aires : la part se voit
                d'un regard, et le texte copié la reprend à l'identique. */}
            <span className="map-areas-sharebar" aria-hidden="true">
              <span className="map-areas-sharebar-fill" style={{ width: `${part}%` }} />
            </span>
          </p>
          {/* Le geste court sous la part : la ligne part en texte, le pays et
              son aire ensemble, prête à se joindre à un point d'étape. */}
          <CopyTextButton
            label={t('cmaps.aireFrameShareCopy')}
            hint={t('cmaps.aireFrameShareCopyHint')
              .replace('{pays}', nomPays(pays, lang))
              .replace('{region}', t(regionMondeLabelKey(activeRegion)))}
            className="map-areas-copy"
            build={() => {
              const unit = t('cmaps.airesChipFiles');
              return [
                t('cmaps.aireFrameShareCopyLine')
                  .replace('{pays}', nomPays(pays, lang))
                  .replace('{pct}', String(part))
                  .replace('{region}', t(regionMondeLabelKey(activeRegion)))
                  .replace('{paysFiles}', String(filesPays))
                  .replace('{regionFiles}', String(filesAire))
                  .replace('{unit}', unit)
                  /* Le rang de l'aire, porté dès la ligne de la part : les
                     quatre copies d'une page de pays se comparent alors
                     ligne à ligne, sur la même place de la même aire. */
                  + ` · ${rangAireTxt(activeRegion.key)}`,
                /* La barre de part, reprise en texte : le message se lit à
                   côté de l'écran, sans redessiner le chiffre. */
                t('cmaps.aireFrameShareCopyBar')
                  .replace('{bar}', barreDePartTexte(part))
                  .replace('{pct}', String(part)),
                /* Le rang de l'aire, ajouté à sa ligne : la part du pays se
                   lit avec la place de cette aire parmi celles du pays, comme
                   dans les trois autres copies de la page. */
                `${t('cmaps.aireFrameShareCopyRegion')
                  .replace('{region}', t(regionMondeLabelKey(activeRegion)))
                  .replace('{regionFiles}', String(filesAire))
                  .replace('{unit}', unit)} · ${rangAireTxt(activeRegion.key)}`,
              ].join('\n');
            }}
          />
        </>
      )}
      {/* Le compteur des aires cadrées : posé sous la carte, il dit combien
          d'aires ont été lues depuis cet appareil, et la dernière pressée se
          rouvre d'un seul geste — c'est une porte, pas un simple constat.
          À côté, le compte des tournées copiées et la gomme du cadrage. */}
      <div className="map-areas-done">
        {derniereRegion ? (
          <button
            type="button"
            className="map-areas-count"
            title={t('cmaps.aireFrameDoneHint')
              .replace('{region}', t(regionMondeLabelKey(derniereRegion)))}
            onClick={() => reopen(derniereRegion.key)}
          >
            <i className="ri-focus-3-line" aria-hidden="true"></i>
            <span className="map-areas-count-label">{t('cmaps.aireFrameDone')}</span>
            <b>{cadrees.aires.length}</b>
            <em className="map-areas-count-total">/ {REGIONS_MONDE.length}</em>
            <span className="map-areas-count-last">
              {t('cmaps.aireFrameDoneLast')
                .replace('{region}', t(regionMondeLabelKey(derniereRegion)))}
            </span>
            <i className="ri-arrow-go-back-line map-areas-count-go" aria-hidden="true"></i>
          </button>
        ) : (
          <p className="map-areas-count is-empty" title={t('cmaps.aireFrameDoneNoneHint')}>
            <i className="ri-focus-3-line" aria-hidden="true"></i>
            <span className="map-areas-count-label">{t('cmaps.aireFrameDone')}</span>
            <b>0</b>
            <em className="map-areas-count-total">/ {REGIONS_MONDE.length}</em>
            <span className="map-areas-count-last is-quiet">{t('cmaps.aireFrameDoneNone')}</span>
          </p>
        )}
        {/* Combien de tournées sont parties depuis cet appareil, et le jour de
            la dernière : le chiffre se lit à côté des aires cadrées, sans
            rouvrir la note des aires. */}
        {tours.count > 0 && (
          completesPartiesRangee.length > 0 ? (
            <button
              type="button"
              className="map-areas-tours"
              title={`${t('cmaps.aireFrameCopiesCountHint').replace('{date}', dateTour)} · ${t('cmaps.aireFrameTourCountRow')
                .replace('{n}', String(toursDansRangee))
                .replace('{total}', String(aires.length))} · ${t('cmaps.aireFrameCompletesTours')
                .replace('{n}', String(completesPartiesRangee.length))
                .replace('{total}', String(completesRangee.length))} · ${t('cmaps.aireFrameCompletesToursOpen')
                .replace('{n}', String(completesPartiesRangee.length))
                .replace('{names}', completesNoms)}`}
              aria-label={`${t('cmaps.aireFrameCopiesCount')} · ${t('cmaps.aireFrameCompletesToursOpen')
                .replace('{n}', String(completesPartiesRangee.length))
                .replace('{names}', completesNoms)}`}
              onClick={ouvrirNoteCompletes}
            >
              <i className="ri-file-copy-2-line" aria-hidden="true"></i>
              <b>{tours.count}</b>
              <span className="map-areas-tours-label">{t('cmaps.aireFrameCopiesCount')}</span>
              <em className="map-areas-tours-last">
                {t('cmaps.aireFrameCopiesLast').replace('{date}', dateTour)}
              </em>
              <i className="ri-arrow-right-up-line map-areas-tours-go" aria-hidden="true"></i>
            </button>
          ) : (
            <span
              className="map-areas-tours"
              title={`${t('cmaps.aireFrameCopiesCountHint').replace('{date}', dateTour)} · ${t('cmaps.aireFrameTourCountRow')
                .replace('{n}', String(toursDansRangee))
                .replace('{total}', String(aires.length))}`}
            >
              <i className="ri-file-copy-2-line" aria-hidden="true"></i>
              <b>{tours.count}</b>
              <span className="map-areas-tours-label">{t('cmaps.aireFrameCopiesCount')}</span>
              <em className="map-areas-tours-last">
                {t('cmaps.aireFrameCopiesLast').replace('{date}', dateTour)}
              </em>
            </span>
          )
        )}
        {/* Combien d'aires ont été copiées seules depuis cet appareil, et le
            jour de la dernière : le chiffre se lit à côté du compte des
            tournées, sans rouvrir la note des aires. */}
        {seules.count > 0 && (
          <>
            <button
              type="button"
              className="map-areas-seules"
              title={`${t('cmaps.aireFrameAloneCountHint').replace('{date}', dateSeule)}${seuleAire
                ? ` · ${t('cmaps.aireFrameCopiesLastAire').replace('{region}', t(regionMondeLabelKey(seuleAire)))}`
                : ''} · ${t('cmaps.aireFrameAloneCountRow')
                .replace('{n}', String(seulesDansRangee))
                .replace('{total}', String(aires.length))} · ${t('cmaps.aireFrameAlonePaysNever')
                .replace('{n}', String(paysRangeeJamais))
                .replace('{total}', String(paysRangee.size))} · ${t('cmaps.aireFrameSeulesNoteOpen')
                .replace('{n}', String(aires.length))} — ${t('cmaps.aireFrameSeulesNoteOpenPick')}`}
              aria-label={`${t('cmaps.aireFrameAloneCount')} · ${t('cmaps.aireFrameSeulesNoteOpen')
                .replace('{n}', String(aires.length))}`}
              onClick={ouvrirNoteRangee}
            >
              <i className="ri-file-copy-line" aria-hidden="true"></i>
              <b>{seules.count}</b>
              <span className="map-areas-seules-label">{t('cmaps.aireFrameAloneCount')}</span>
              {/* Les pays de la rangée encore jamais copiés seuls : le
                  chiffre de la pastille ajoutée de la note se relit ici, à
                  côté du compte des aires. */}
              {paysRangeeJamais > 0 && (
                <em
                  className="map-areas-seules-never"
                  title={t('cmaps.aireFrameAlonePaysNever')
                    .replace('{n}', String(paysRangeeJamais))
                    .replace('{total}', String(paysRangee.size))}
                >
                  <i className="ri-global-line" aria-hidden="true"></i>
                  {paysRangeeJamais}
                </em>
              )}
              <em className="map-areas-seules-last">
                {t('cmaps.aireFrameCopiesLast').replace('{date}', dateSeule)}
              </em>
              <i
                className="ri-arrow-right-up-line map-areas-seules-go"
                title={t('cmaps.aireFrameSeulesNoteOpenNames')
                  .replace('{n}', String(aires.length))
                  .replace('{names}', aires.map((region) => t(regionMondeLabelKey(region))).join(' · '))}
                aria-hidden="true"
              ></i>
            </button>
            {/* La petite gomme du seul compte des aires copiées seules : le
                premier appui l'arme, le second remet le chiffre à zéro — le
                cadrage des aires, lui, reste intact. */}
            <button
              type="button"
              className={`map-areas-seules-erase${seulesGomme ? ' is-armed' : ''}`}
              aria-pressed={seulesGomme}
              title={seulesGomme
                ? t('cmaps.aireFrameSeulesClearConfirmHint')
                : `${t('cmaps.aireFrameSeulesClearDistinct').replace('{n}', String(seules.aires.length))} · ${t('cmaps.aireFrameSeulesClearHint')}`}
              aria-label={seulesGomme
                ? t('cmaps.aireFrameSeulesClearConfirmHint')
                : `${t('cmaps.aireFrameSeulesClearDistinct').replace('{n}', String(seules.aires.length))} · ${t('cmaps.aireFrameSeulesClearHint')}`}
              onClick={gommerSeules}
            >
              <i className="ri-eraser-line" aria-hidden="true"></i>
              {seulesGomme && (
                <span className="whitespace-nowrap">
                  {t('cmaps.airesNeverClearConfirm')}
                </span>
              )}
            </button>
          </>
        )}
        {/* Les aires complètes de la rangée qui ne sont jamais parties seules :
            le compteur les dit d'un chiffre, et son survol nomme les aires et
            les fiches qu'elles tiendraient une fois envoyées. */}
        {completesNonSeulesRangee.length > 0 && (
          <button
            type="button"
            className="map-areas-completes"
            title={`${t('cmaps.aireFrameCompletesLeftHint')
              .replace('{n}', String(completesNonSeulesRangee.length))
              .replace('{total}', String(completesRangee.length))
              .replace('{files}', String(fichesCompletesNonSeules))
              .replace('{unit}', t('cmaps.airesChipFiles'))
              .replace('{names}', completesNonSeulesNoms)} · ${t('cmaps.aireFrameCompletesLeftOpen')
              .replace('{n}', String(completesNonSeulesRangee.length))
              .replace('{names}', completesNonSeulesNoms)
              .replace('{files}', String(fichesCompletesNonSeules))
              .replace('{unit}', t('cmaps.airesChipFiles'))}`}
            aria-label={t('cmaps.aireFrameCompletesLeftOpen')
              .replace('{n}', String(completesNonSeulesRangee.length))
              .replace('{names}', completesNonSeulesNoms)
              .replace('{files}', String(fichesCompletesNonSeules))
              .replace('{unit}', t('cmaps.airesChipFiles'))}
            onClick={ouvrirNoteCompletesLeft}
          >
            <i className="ri-checkbox-circle-line" aria-hidden="true"></i>
            <b>{completesNonSeulesRangee.length}</b>
            <span className="map-areas-completes-label">
              {t('cmaps.aireFrameCompletesLeft')}
            </span>
            <em>/ {completesRangee.length}</em>
            <i className="ri-arrow-right-up-line map-areas-completes-go" aria-hidden="true"></i>
          </button>
        )}
        {/* La gomme du cadrage posée dans la rangée : le premier appui l'arme,
            le second efface la mémoire de l'appareil — la tournée repart
            vierge sans remonter jusqu'à la note. */}
        {cadrees.aires.length > 0 && (
          <button
            type="button"
            className={`map-areas-erase${gomme ? ' is-armed' : ''}`}
            aria-pressed={gomme}
            title={gomme
              ? t('cmaps.airesNeverClearConfirmHint')
              : `${t('cmaps.aireFrameEraseCount').replace('{n}', String(cadrees.aires.length))}${horsPaysOuvert > 0
                ? ` · ${t('cmaps.aireFrameCopyTourOutside').replace('{n}', String(horsPaysOuvert))}`
                : ''} · ${t('cmaps.airesNeverClearHint')}`}
            aria-label={gomme
              ? t('cmaps.airesNeverClearConfirmHint')
              : `${t('cmaps.aireFrameEraseCount').replace('{n}', String(cadrees.aires.length))}${horsPaysOuvert > 0
                ? ` · ${t('cmaps.aireFrameCopyTourOutside').replace('{n}', String(horsPaysOuvert))}`
                : ''} · ${t('cmaps.airesNeverClearHint')}`}
            onClick={gommerCadrage}
          >
            <i className="ri-eraser-line" aria-hidden="true"></i>
            {gomme && (
              <span className="whitespace-nowrap">{t('cmaps.airesNeverClearConfirm')}</span>
            )}
          </button>
        )}
      </div>
      {/* Le geste de la tournée : les aires déjà cadrées et leurs comptes
          partent en texte, sans un seul pays — la tournée se joint à un point
          d'étape sans repasser par la carte. */}
      {cadrees.aires.length > 0 && (
        <div
          className="map-areas-copies"
          role="group"
          aria-label={t('cmaps.aireFrameCopies')}
          title={t('cmaps.aireFrameCopiesHint')}
        >
          {/* Le rang que la tournée emporte : chaque ligne dit sa place parmi
              les aires réellement cadrées, la plus lourde en tête. */}
          <span
            className="map-areas-copies-rank"
            title={teteTour
              ? `${t('cmaps.aireFrameCopiesRankHint')} · ${t('cmaps.aireFrameCopiesRankFirst')
                .replace('{region}', t(regionMondeLabelKey(teteTour)))
                .replace('{files}', String(fichesDesPays(teteTour.pays)))
                .replace('{unit}', t('cmaps.airesChipFiles'))}`
              : t('cmaps.aireFrameCopiesRankHint')}
          >
            <i className="ri-list-ordered" aria-hidden="true"></i>
            {cadrees.aires.length > 1
              ? t('cmaps.aireFrameCopiesRank')
                .replace('{first}', '1')
                .replace('{last}', String(cadrees.aires.length))
              : t('cmaps.aireFrameCopyTourRank')
                .replace('{rang}', '1')
                .replace('{n}', '1')}
          </span>
          <CopyTextButton
            label={t('cmaps.aireFrameCopyTour')}
            hint={`${t('cmaps.aireFrameCopyTourHint')} · ${t('cmaps.aireFrameCopyTourOutside').replace('{n}', String(horsPaysOuvert))}`}
            className="map-areas-copy map-areas-copy--tour"
            onCopied={() => setTours(markTourCopied(cadreesOrdre[cadreesOrdre.length - 1]?.key))}
            build={() => {
            /* L'échelle de la tournée, lue sur les aires cadrées : le message
               dit son poids avant ses lignes, au lieu de laisser chaque aire
               se comparer sans total. */
            const fiches = fichesCadrees;
            return [
              t('cmaps.aireFrameCopyTourLine')
                .replace('{n}', String(cadrees.aires.length))
                .replace('{total}', String(REGIONS_MONDE.length)),
              /* Le compte des aires emportées hors du pays ouvert, en tête du
                 message : on sait combien de lignes viennent d'ailleurs
                 avant de les lire. */
              ...(horsPaysOuvert > 0
                ? [t('cmaps.aireFrameCopyTourOutsideLine')
                  .replace('{n}', String(horsPaysOuvert))]
                : []),
              t('cmaps.aireFrameCopyTourScale')
                .replace('{files}', String(fiches))
                .replace('{unit}', t('cmaps.airesChipFiles')),
              /* Le relevé du monde du compteur posé sous la rangée : la
                 tournée emporte la part du pays dans les fiches du monde,
                 sa barre comprise, pour que le message dise où le pays se
                 tient au lieu de compter ses seules aires cadrées. */
              ...(fichesAiresPays > 0
                ? [
                  t('cmaps.aireFrameWorldCopyLine')
                    .replace('{pays}', nomPays(pays, lang))
                    .replace('{files}', String(fichesAiresPays))
                    .replace('{monde}', String(fichesMonde))
                    .replace('{unit}', t('cmaps.airesChipFiles'))
                    .replace('{pct}', String(partMondeAires)),
                  t('cmaps.aireFrameWorldCopyBar')
                    .replace('{bar}', barreDePartTexte(partMondeAires))
                    .replace('{pct}', String(partMondeAires)),
                ]
                : []),
              /* La tournée suit l'ordre de poids annoncé par son rang : la
                 première ligne est bien la première, la plus lourde en tête. */
              ...cadreesOrdre.flatMap((region) => {
              const key = region.key;
              /* Le rang de l'aire dit désormais la même place que les trois
                 autres copies de la page : la tournée se compare à la part et
                 aux aires du pays d'un même regard. Hors des aires de ce
                 pays, la ligne garde son rang de cadrage. */
              const rang = rangAireTxt(key);
              /* L'aire que la tournée emporte hors du pays ouvert : sa ligne
                 le dit, pour que le nombre annoncé en tête se retrouve ligne
                 à ligne. */
              const dehors = rangPays(key) === 0;
              const lignes = [
                `- ${t(regionMondeLabelKey(region))} · ${fichesDesPays(region.pays)} ${t('cmaps.airesChipFiles')} · ${rang}${dehors ? ` · ${t('cmaps.aireFrameCopyTourOutsideMark')}` : ''}`,
              ];
              /* Les pays de l'aire privés du métier lu : la marque se lit
                 juste sous le compte, sans quitter la tournée. */
              const prives = trade
                ? region.pays.filter((code) => manquants.has(code))
                : [];
              if (prives.length > 0) {
                lignes.push(`  ${t('cmaps.aireFrameCopyTourMissing')
                  .replace('{pays}', prives.map((code) => nomPays(code, lang)).join(' · '))}`);
              }
              /* L'adresse de la vue Carte de l'aire, prête à coller : le
                 cadre se rouvre au lieu de se reposer à la main. */
              lignes.push(`  ${carteDeAire(key)}`);
              return lignes;
            }),
            ].join('\n');
            }}
          />
          {/* L'échelle que la seconde copie emporte : le total seul, sous les
              yeux, à côté du rang de la première. */}
          <span
            className="map-areas-copies-scale"
            title={t('cmaps.aireFrameCopiesScaleHint')}
          >
            <i className="ri-scales-3-line" aria-hidden="true"></i>
            <b>{fichesCadrees}</b>
            <span>{t('cmaps.airesChipFiles')}</span>
          </span>
          <CopyTextButton
            label={t('cmaps.aireFrameCopyScale')}
            hint={t('cmaps.aireFrameCopyScaleHint')}
            className="map-areas-copy map-areas-copy--scale"
            build={() => t('cmaps.aireFrameCopyTourScale')
              .replace('{files}', String(fichesCadrees))
              .replace('{unit}', t('cmaps.airesChipFiles'))}
          />
          {/* La petite barre de part : le poids de la tournée dans les fiches
              du monde, pour que l'échelle se lise d'un regard et non d'un
              chiffre seul. */}
          <span
            className="map-areas-copies-share"
            title={t('cmaps.aireFrameCopiesBarHint').replace('{pct}', String(partMonde))}
          >
            <span className="map-areas-copies-bar" aria-hidden="true">
              <span
                className="map-areas-copies-bar-fill"
                style={{ width: `${partMonde}%` }}
              ></span>
            </span>
            <em>{partMonde}%</em>
          </span>
        </div>
      )}
      {/* La tournée du seul pays ouvert : sous la rangée des deux copies, un
          geste plus fin qui n'emporte que les aires de ce pays-là, avec leurs
          fiches et l'adresse de leur vue Carte — les autres aires cadrées sur
          l'appareil restent dehors. */}
      {aires.length > 0 && (
        <div className="map-areas-country">
        <CopyTextButton
          label={t('cmaps.aireFrameCopyCountry')}
          hint={t('cmaps.aireFrameCopyCountryHint').replace('{pays}', nomPays(pays, lang))}
          className="map-areas-copy map-areas-copy--country"
          onCopied={() => setTours(markTourCopied(aires[aires.length - 1]?.key))}
          build={() => [
            t('cmaps.aireFrameCopyCountryLine')
              .replace('{pays}', nomPays(pays, lang))
              .replace('{n}', String(aires.length)),
            /* La ligne de tête : les aires où le pays pèse le plus lourd,
               comptées avant tout le reste — le nombre annoncé se lit sans
               parcourir une seule ligne. */
            t('cmaps.aireFrameCopyCountryLeads')
              .replace('{pays}', nomPays(pays, lang))
              .replace('{n}', String(airesOuPaysMene.length))
              .replace('{total}', String(aires.length))
              + (airesOuPaysMene.length > 0
                ? ` · ${airesOuPaysMene.map((region) => t(regionMondeLabelKey(region))).join(' · ')}`
                : ''),
            /* La même ligne que la tournée entière : les aires emportées
               hors du pays ouvert se comptent dès la tête du message, pour
               que les trois copies se lisent ligne à ligne. */
            ...(horsAiresPays > 0
              ? [t('cmaps.aireFrameCopyTourOutsideLine').replace('{n}', String(horsAiresPays))]
              : []),
            t('cmaps.aireFrameCopyTourScale')
              .replace('{files}', String(fichesAiresPays))
              .replace('{unit}', t('cmaps.airesChipFiles')),
            /* La barre de part du pays, reprise en texte : la copie se lit à
               côté de l'écran, et les trois copies se comparent. */
            t('cmaps.aireFrameCopyCountryBarLine')
              .replace('{bar}', barreDePartTexte(partPays))
              .replace('{pct}', String(partPays)),
            ...aires.flatMap((region) => {
              /* Le rang de l'aire, dit avec les mots de la tournée et de la
                 part : les quatre copies de la page se répondent sur une même
                 aire, dans la même phrase. */
              const rangTxt = rangAireTxt(region.key);
              /* L'aire que cette copie emporte hors du pays ouvert : sa ligne
                 le dit, comme dans la tournée, pour que le nombre annoncé en
                 tête se retrouve ligne à ligne. */
              const dehors = rangPays(region.key) === 0;
              return [
                `- ${t(regionMondeLabelKey(region))} · ${fichesDesPays(region.pays)} ${t('cmaps.airesChipFiles')} · ${rangTxt}${dehors ? ` · ${t('cmaps.aireFrameCopyTourOutsideMark')}` : ''}`,
                `  ${carteDeAire(region.key)}`,
              ];
            }),
          ].join('\n')}
        />
        {/* La petite barre de la tournée du pays : la place du pays dans les
            fiches qu'elle emporte, dessinée comme celle des deux autres
            copies — les trois se comparent d'un regard. */}
        <span
          className="map-areas-country-share"
          title={t('cmaps.aireFrameCopyCountryBarHint')
            .replace('{pays}', nomPays(pays, lang))
            .replace('{pct}', String(partPays))
            .replace('{paysFiles}', String(fichesPaysSeul))
            .replace('{regionFiles}', String(fichesAiresPays))
            .replace('{unit}', t('cmaps.airesChipFiles'))}
        >
          <span className="map-areas-country-scale">
            {t('cmaps.aireFrameCopyCountryBar')}
          </span>
          <span className="map-areas-country-bar" aria-hidden="true">
            <span
              className="map-areas-country-bar-fill"
              style={{ width: `${partPays}%` }}
            ></span>
          </span>
          <em>{partPays}%</em>
        </span>
        </div>
      )}
    </div>
  );
}