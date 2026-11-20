import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { enSommeil, replyGapLabel } from '@/lib/messaging';
import {
  REGIONS_MONDE,
  fichesDesPays,
  regionMondeDe,
  type RegionMonde,
  type RegionMondeKey,
} from '@/lib/worldRegions';
import { jourCopie } from '@/lib/jourCopie';
import {
  clearAireRelevesChemins,
  clearAireRelevesJours,
  clearAireRelevesTousCopies,
  markAireReleveCopied,
  markAireRelevesTousCopied,
  readAireRelevesJours,
  readAireRelevesChemins,
  readAireRelevesCheminsAires,
  readAireRelevesTousCopies,
  readGommesReleves,
  readGommesAiresJours,
  markGommesReleves,
  type RelevesChemins,
} from '@/lib/aireCarteMemory';
import CopyTextButton from '@/components/feature/CopyTextButton';
import AireCopyPill from './AireCopyPill';
import {
  jour,
  type AdminCompteRef,
  type AdminConversation,
  type AdminMessage,
  type AdminMembre,
} from './adminTypes';
import {
  readAireFirst,
  readAireKept,
  readAncienFirst,
  readApresFirst,
  readApresOnly,
  readJamaisFirst,
  readRecentFirst,
  readRevueFirst,
  readSleepOnly,
  readGommeFirst,
  readGommeAncienneFirst,
  readGommeHorsAncienne,
  saveGommeHorsAncienne,
  saveAireFirst,
  saveAireKept,
  saveAiresTight,
  saveAncienFirst,
  saveApresFirst,
  saveApresOnly,
  saveJamaisFirst,
  saveRecentFirst,
  saveRevueFirst,
  saveSleepOnly,
  saveGommeFirst,
  saveGommeAncienneFirst,
} from './adminSleepMemory';
import { marquerRevu, oublierRevus, readOuvertures, readRevus } from './adminReviewMemory';
import { dureeEnMots, resumerVisite } from './adminClientsXlsx';

type Props = {
  rows: AdminConversation[];
  /** Un fil nommé par la fiche d'un compte : la messagerie s'ouvre dessus,
   *  sans faire chercher la conversation dans la liste. `at` distingue deux
   *  demandes sur le même fil. */
  focus?: { id: string; at: number } | null;
  /** Le compte derrière un participant, quand la plateforme en tient un :
   *  l'identifiant d'abord, l'adresse ensuite. */
  compteDe?: (userId: string, email?: string | null) => AdminCompteRef | null;
  /** Passe du fil ouvert à la fiche du compte concerné, sans repasser par le
   *  tableau des abonnés. */
  onOpenCompte?: (compteId: string | null, email: string | null) => void;
  /** Les dépôts arrivés après la relance, comptés par fil : le tri « après
   *  relance » de la liste lit la même mesure que le tableau des abonnés et
   *  que le classeur. */
  apresParFil?: Map<string, number>;
  /** Un compte nommé par sa fiche : la messagerie s'ouvre en mode revue,
   *  réduite à ses seuls fils en sommeil. `at` distingue deux demandes. */
  revueCompte?: { compteId: string | null; email: string; nom: string; at: number } | null;
  /** Le geste de sortie de la revue d'un compte : la liste reprend toutes les
   *  conversations, et la fiche ne la rappelle pas. */
  onClearRevueCompte?: () => void;
  /** Les aires nommées par le classeur des abonnés — la ligne « aires jamais
   *  relevées » y mène : la boîte s'ouvre resserrée sur ces seules aires,
   *  dans l'ordre des aires du monde, sans toucher au choix retenu par
   *  l'appareil. `at` distingue deux demandes sur les mêmes aires. */
  airesFocus?: { aires: string[]; at: number } | null;
};

type Thread = {
  conversation: AdminConversation;
  messages: AdminMessage[];
  membres: AdminMembre[];
};

/** Un groupe de fils sous le nom d'une aire du monde — ou sous celui des
 *  interlocuteurs dont l'aire reste inconnue, qui ferment toujours la marche. */
type GroupeAire = {
  cle: string;
  libelle: string;
  region: RegionMonde | null;
  rows: AdminConversation[];
};

/**
 * La messagerie de la plateforme, vue de l'administration : toutes les
 * conversations, et le fil de celle qui est ouverte.
 *
 * La console lit, elle n'écrit pas dans le fil d'un membre : la réponse part
 * par e-mail, pour que personne ne puisse se faire passer pour un participant.
 */
export default function AdminMessages({
  rows: toutesLesConversations,
  focus,
  compteDe,
  onOpenCompte,
  apresParFil,
  revueCompte,
  onClearRevueCompte,
  airesFocus,
}: Props) {
  const { t, lang } = useLang();
  const [ouverte, setOuverte] = useState('');
  /* La revue d'un compte, ouverte depuis sa fiche : la liste se réduit à ses
     seuls fils en sommeil, et le mode revue s'applique sans changer le choix
     retenu par l'appareil. La croix rend la liste entière. */
  const [scope, setScope] = useState<{
    compteId: string | null;
    email: string;
    nom: string;
    at: number;
  } | null>(null);
  /* Une revue peut se limiter aux fils qui dorment : le jeton se pose sur le
     compteur, et il ne change rien au fil ouvert. Le choix reste d'une visite
     à l'autre, retenu par l'appareil. */
  const [sleepOnly, setSleepOnly] = useState<boolean>(() => readSleepOnly());
  /* Le jeton « restant à relire » ne garde que les fils dormants pas encore
     ouverts pendant cette visite : il suit le repère de revue, il ne survit
     pas à la visite et n'est donc pas mémorisé. */
  const [restantOnly, setRestantOnly] = useState(false);
  /* L'en-tête de tri « revue » : les fils dormants jamais ouverts pendant
     cette visite passent en tête, sans retirer une ligne de la liste. Le
     choix reste d'une visite à l'autre, retenu par l'appareil. */
  const [revueFirst, setRevueFirst] = useState<boolean>(
    () =>
      readRevueFirst() &&
      !readApresFirst() &&
      !readAireFirst() &&
      !readRecentFirst() &&
      !readJamaisFirst() &&
      !readAncienFirst() &&
      !readGommeFirst(),
  );
  /* Le second en-tête, « après relance » : les fils dont le compte a reçu un
     dépôt après la relance préparée passent en tête, sans retirer une ligne.
     Les trois tris s'excluent : un seul ordre à la fois, et le dernier posé
     est celui qu'on retrouve à la visite suivante. */
  const [apresFirst, setApresFirst] = useState<boolean>(
    () =>
      readApresFirst() &&
      !readJamaisFirst() &&
      !readAncienFirst() &&
      !readGommeFirst(),
  );
  /* Le troisième ordre, « par aire » : la liste se range sous le nom de
     chaque aire du monde, au lieu de suivre l'activité. Les trois ordres
     s'excluent : un seul parle à la fois, et le dernier posé se retrouve à
     la visite suivante. */
  const [aireFirst, setAireFirst] = useState<boolean>(
    () =>
      readAireFirst() &&
      !readRevueFirst() &&
      !readApresFirst() &&
      !readRecentFirst() &&
      !readJamaisFirst() &&
      !readAncienFirst() &&
      !readGommeFirst(),
  );
  /* Le quatrième ordre, « relevé le plus récent » : les aires dont le relevé
     vient de partir de l'appareil passent en tête. Les quatre ordres
     s'excluent — un seul parle à la fois, et le dernier posé se retrouve à la
     visite suivante. */
  const [recentFirst, setRecentFirst] = useState<boolean>(
    () =>
      readRecentFirst() &&
      !readRevueFirst() &&
      !readApresFirst() &&
      !readAireFirst() &&
      !readJamaisFirst() &&
      !readAncienFirst() &&
      !readGommeFirst(),
  );
  /* Le cinquième ordre, « aire jamais relevée d'abord » : les fils des aires
     qu'aucun relevé n'a encore emportées passent en tête, dans l'ordre des
     aires du monde. Les cinq ordres s'excluent — un seul parle à la fois, et
     le dernier posé se retrouve à la visite suivante. */
  const [jamaisFirst, setJamaisFirst] = useState<boolean>(
    () =>
      readJamaisFirst() &&
      !readRevueFirst() &&
      !readApresFirst() &&
      !readAireFirst() &&
      !readRecentFirst() &&
      !readAncienFirst() &&
      !readGommeFirst(),
  );
  /* Le sixième ordre, « relevé le plus ancien d'abord » : les aires dont le
     relevé est parti depuis le plus longtemps passent en tête, pour retrouver
     ce qui attend depuis le plus longtemps. Les six ordres s'excluent — un
     seul parle à la fois, et le dernier posé se retrouve à la visite
     suivante. */
  const [ancienFirst, setAncienFirst] = useState<boolean>(
    () =>
      readAncienFirst() &&
      !readRevueFirst() &&
      !readApresFirst() &&
      !readAireFirst() &&
      !readRecentFirst() &&
      !readJamaisFirst() &&
      !readGommeFirst(),
  );
  /* Le septième ordre, « gomme la plus récente d'abord » : les fils des aires
     que la petite gomme vient de rendre vierges passent en tête, la plus
     récemment effacée d'abord, pour retrouver ce qui vient d'être rendu. Les
     sept ordres s'excluent — un seul parle à la fois —, et le dernier posé se
     retrouve à la visite suivante. */
  const [gommeFirst, setGommeFirst] = useState<boolean>(
    () =>
      readGommeFirst() &&
      !readRevueFirst() &&
      !readApresFirst() &&
      !readAireFirst() &&
      !readRecentFirst() &&
      !readJamaisFirst() &&
      !readAncienFirst(),
  );
  /* Le huitième ordre, l'inverse du précédent — « gomme la plus ancienne
     d'abord » : les fils des aires que la petite gomme a rendues vierges il y
     a le plus longtemps passent en tête, pour retrouver ce qui attend d'être
     remis à neuf. Les huit ordres s'excluent — un seul parle à la fois —, et
     l'effet posé plus bas tient celui-ci hors des sept autres. */
  const [gommeAncienneFirst, setGommeAncienneFirst] = useState<boolean>(
    () => readGommeAncienneFirst(),
  );
  /* Le sens de la ligne des aires parties : la plus récemment effacée en tête
     par défaut, ou la plus anciennement effacée quand la ligne est retournée —
     pour relire les départs les plus anciens d'abord. Le choix ne vit que dans
     la visite : la ligne se rouvre sur son sens d'origine. */
  const [horsAncienneFirst, setHorsAncienneFirst] = useState<boolean>(() =>
    readGommeHorsAncienne(),
  );
  /* Les huit ordres s'excluent : dès qu'un autre parle, celui-ci s'efface et
     l'appareil oublie son choix, si bien qu'il ne revient pas d'une visite à
     l'autre sans qu'on l'ait redemandé. */
  useEffect(() => {
    if (!gommeAncienneFirst) return;
    if (
      revueFirst ||
      apresFirst ||
      aireFirst ||
      recentFirst ||
      jamaisFirst ||
      ancienFirst ||
      gommeFirst
    ) {
      setGommeAncienneFirst(false);
      saveGommeAncienneFirst(false);
    }
  }, [
    gommeAncienneFirst,
    revueFirst,
    apresFirst,
    aireFirst,
    recentFirst,
    jamaisFirst,
    ancienFirst,
    gommeFirst,
  ]);
  /* L'aire sur laquelle la boîte est resserrée, "" quand elle montre tout :
     le titre d'un groupe l'impose, ses fils n'ont qu'à suivre. Le choix est
     retenu d'une visite à l'autre — la boîte se rouvre là où la lecture s'est
     arrêtée, sans avoir à rappuyer sur le titre. */
  const [aire, setAire] = useState<RegionMondeKey | ''>(
    () => (readAireKept() as RegionMondeKey | ''),
  );
  /* Les aires nommées par le classeur des abonnés : la boîte s'ouvre resserrée
     sur elles seules, sans rien changer au choix retenu par l'appareil. Le
     geste n'a pas de mémoire — la croix de la pastille rend tous les fils, et
     un changement d'onglet l'efface comme une visite qui s'achève. */
  const [airesTight, setAiresTight] = useState<RegionMondeKey[]>([]);
  /* Le jeton des aires relevées il y a plus de sept jours : il ne garde que
     les fils des aires dont le dernier relevé de fils date de plus d'une
     semaine, lu sur cet appareil. Les aires jamais relevées restent dehors —
     l'ordre « aire jamais relevée d'abord » les nomme. Comme les autres
     jetons de la liste, il s'efface d'un geste avec la petite gomme. */
  const [vieillesOnly, setVieillesOnly] = useState(false);
  /* Le jour du dernier relevé de fils de chaque aire, lu sur l'appareil : le
     compte des fils d'un groupe dit depuis quand le relevé est parti. */
  const [releves, setReleves] = useState<Record<string, number>>(
    () => readAireRelevesJours(),
  );
  /* Le compte du relevé de toutes les aires, lu sur l'appareil : l'en-tête dit
     combien de fois le geste est parti et le jour de la dernière fois. */
  const [relevesTous, setRelevesTous] = useState(() => readAireRelevesTousCopies());
  /* Les deux chemins du relevé d'une aire — l'en-tête d'un groupe et l'appui
     long sur la pastille d'un fil —, comptés séparément pour que l'en-tête
     distingue les deux gestes au lieu de les additionner. */
  const [relevesChemins, setRelevesChemins] = useState<RelevesChemins>(
    () => readAireRelevesChemins(),
  );
  /* Ce que la gomme des deux chemins vient d'effacer : la phrase se pose
     juste après le clic, quelques secondes, pour que le nombre de gestes se
     lise sans relire le compte qui vient de retomber à zéro. */
  const [cheminsEffaces, setCheminsEffaces] = useState('');
  useEffect(() => {
    if (!cheminsEffaces) return undefined;
    const timer = window.setTimeout(() => setCheminsEffaces(''), 6000);
    return () => window.clearTimeout(timer);
  }, [cheminsEffaces]);
  /* Ce que la gomme des relevés d'ensemble vient d'oublier : le nombre de
     gestes et d'aires, dit juste après le clic, avant que le compte ne
     retombe à zéro et ne puisse plus le dire. */
  const [relevesTousEffaces, setRelevesTousEffaces] = useState('');
  useEffect(() => {
    if (!relevesTousEffaces) return undefined;
    const timer = window.setTimeout(() => setRelevesTousEffaces(''), 6000);
    return () => window.clearTimeout(timer);
  }, [relevesTousEffaces]);
  /* Ce que la gomme des relevés d'aires vient d'oublier : le nombre d'aires
     rendues vierges, dit juste après le clic, avant que la pastille ne les
     compte plus parmi les relevées. */
  const [relevesAiresEffaces, setRelevesAiresEffaces] = useState('');
  useEffect(() => {
    if (!relevesAiresEffaces) return undefined;
    const timer = window.setTimeout(() => setRelevesAiresEffaces(''), 6000);
    return () => window.clearTimeout(timer);
  }, [relevesAiresEffaces]);
  /* Ce que la gomme de la pastille des aires relevées aujourd'hui vient
     d'oublier : le nombre d'aires ramenées à « jamais relevée » dans la
     boîte, dit juste après le clic, avant que la pastille ne disparaisse. */
  const [airesJourEffaces, setAiresJourEffaces] = useState('');
  useEffect(() => {
    if (!airesJourEffaces) return undefined;
    const timer = window.setTimeout(() => setAiresJourEffaces(''), 6000);
    return () => window.clearTimeout(timer);
  }, [airesJourEffaces]);
  /* Le compte des gommes qui ont rendu des aires vierges, et le jour du
     dernier geste : la pastille des aires relevées aujourd'hui le tient à
     côté d'elle, même quand elle n'a plus rien à annoncer. */
  const [gommes, setGommes] = useState(() => readGommesReleves());
  /* Le jour du dernier geste de gomme de chaque aire, lu sur la même mémoire
     d'appareil : l'ordre « gomme la plus récente d'abord » y lit ce qui vient
     d'être rendu vierge. */
  const [gommesAires, setGommesAires] = useState<Record<string, number>>(
    () => readGommesAiresJours(),
  );
  /* Le jeton « après relance seulement » ne garde que les fils dont le compte
     a déposé depuis son message. Comme le filtre en sommeil, il laisse une
     trace sur l'appareil : la liste se retrouve réduite de la même façon à la
     visite suivante. La petite gomme du jeton rend la liste entière. */
  const [apresOnly, setApresOnly] = useState<boolean>(() => readApresOnly());
  /* Un fil nommé par la fiche rouvre la liste entière le temps de la visite :
     le filtre mémorisé n'est pas effacé, seulement suspendu. */
  const [filNomme, setFilNomme] = useState(false);
  const [pacesReady, setPacesReady] = useState(false);
  const [fil, setFil] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  /* Le rythme de chaque fil, lu d'une seule requete : la console signale les
     conversations qui dorment avec le meme seuil que la messagerie du site. */
  const [paces, setPaces] = useState<Record<string, number>>({});
  /* Les fils dormants ouverts pendant cette visite : le repère dit où la revue
     s'est arrêtée, et il s'efface avec la visite. */
  const [revus, setRevus] = useState<string[]>(() => readRevus());
  /* L'instant d'ouverture de chaque fil relu : le bouton de reprise dit sous
     lui depuis combien de temps la revue s'est arrêtée sur le dernier. */
  const [ouvertures, setOuvertures] = useState<Record<string, string>>(() =>
    readOuvertures(),
  );

  /* La fiche d'un compte peut nommer une revue : la liste se réduit alors à
     ses fils, lus sur l'identifiant puis sur l'adresse — la même clé que la
     fiche et le tableau. Le choix retenu par l'appareil n'est pas touché. */
  useEffect(() => {
    setScope(revueCompte ?? null);
  }, [revueCompte]);
  /* Le classeur nomme ses aires : la boîte s'ouvre sur elles, dans l'ordre des
     aires du monde, et reprend la main sur un fil nommé par la fiche. Un nom
     d'aire inconnu est écarté plutôt que d'ouvrir une liste vide. */
  useEffect(() => {
    if (!airesFocus) return;
    const demandees = new Set(airesFocus.aires);
    const gardees = REGIONS_MONDE
      .map((region) => region.key)
      .filter((key) => demandees.has(key));
    setAiresTight(gardees);
    setFilNomme(false);
  }, [airesFocus]);

  /* Les aires resserrées sont reposées sur l'appareil à chaque changement :
     la synthèse du classeur des abonnés peut ainsi dire le jour du dernier
     relevé de chacune, même ouverte depuis un autre onglet. La petite gomme
     de la pastille rend les aires du classeur pour la visite seulement : le
     drapeau retient ce geste-là, pour que la mémoire de l'appareil — le
     choix retenu — reste intacte. */
  const airesTightGomme = useRef(false);
  useEffect(() => {
    if (airesTightGomme.current) {
      airesTightGomme.current = false;
      return;
    }
    saveAiresTight(airesTight);
  }, [airesTight]);
  const rows = useMemo(() => {
    if (!scope) return toutesLesConversations;
    const cle = (scope.email || '').trim().toLowerCase();
    return toutesLesConversations.filter((row) => {
      const ids = [row.user_a, row.user_b].filter((id): id is string => Boolean(id));
      if (scope.compteId && ids.includes(scope.compteId)) return true;
      if (!cle || !compteDe) return false;
      return ids.some((id) => {
        const compte = compteDe(id);
        return (compte?.email || '').trim().toLowerCase() === cle;
      });
    });
  }, [toutesLesConversations, scope, compteDe]);
  const scopeOn = scope !== null;

  const idsKey = rows.map((row) => row.id).join(',');
  /* La carte elle-même, pour que les flèches du clavier aient un endroit où
     agir : le geste ne prend jamais la main ailleurs sur la page. */
  const carteRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!idsKey) {
      setPaces({});
      setPacesReady(true);
      return undefined;
    }
    let alive = true;
    setPacesReady(false);
    const load = async () => {
      try {
        const { data, error: failure } = await supabase.functions.invoke('admin-console', {
          body: { action: 'paces', conversationIds: idsKey.split(',') },
        });
        const answer = data as { ok?: boolean; paces?: Record<string, number> } | null;
        if (failure || !answer?.ok) return;
        if (alive) setPaces(answer.paces ?? {});
      } catch {
        /* La mesure n'est qu'une aide : la console reste lisible sans elle. */
      } finally {
        if (alive) setPacesReady(true);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [idsKey]);

  /* Les fils qui dorment, lus une seule fois : le compteur, la jauge, les
     filtres et les repères de revue partagent cette même liste. */
  const dormantsRows = rows.filter((row) => enSommeil(paces[row.id]));
  const dormants = dormantsRows.length;

  /* Les repères de la revue : un fil dormant déjà ouvert reste marqué, sans
     changer le filtre ni le fil ouvert. */
  const revusSet = new Set(revus);
  const revusDormants = dormantsRows.filter((row) => revusSet.has(row.id)).length;
  /* Ce qui reste à ouvrir pendant cette visite : le jeton s'y réduit. */
  const restants = dormants - revusDormants;
  const partRevue = dormants > 0 ? Math.round((revusDormants / dormants) * 100) : 0;

  /* Le premier fil dormant qui reste à relire : les touches N et J y mènent,
     pour reprendre la revue exactement là où elle s'est arrêtée. */
  const premierRestant = dormantsRows.find((row) => !revusSet.has(row.id)) ?? null;

  /* Le dernier fil relu de la visite : la mémoire de session garde l'ordre des
     ouvertures, son dernier repère est donc celui où la revue s'est arrêtée.
     Le bouton de reprise y ramène d'un clic, sans faire chercher le fil dans
     la liste ; les touches N et J, elles, ouvrent le fil suivant. */
  const dernierRevu = (() => {
    const id = revus.length > 0 ? revus[revus.length - 1] : '';
    if (!id) return null;
    return rows.find((row) => row.id === id) ?? null;
  })();

  /* Ce que le bouton de reprise ouvre : le dernier fil relu, ou, quand rien
     n'a encore été relu, le premier fil dormant restant — sur une revue qui
     commence, reprendre veut dire commencer. */
  const reprise = dernierRevu ?? premierRestant;

  /* Depuis quand le dernier fil relu a été ouvert : lu sur la mémoire de
     session, remis à l'heure toutes les demi-minutes pour que la ligne ne
     mente pas quand la visite se prolonge. */
  const derniereOuverture = dernierRevu ? ouvertures[dernierRevu.id] ?? '' : '';
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    if (!derniereOuverture) return undefined;
    const timer = window.setInterval(() => setMaintenant(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, [derniereOuverture]);
  const depuisTexte = (() => {
    const stamp = new Date(derniereOuverture).getTime();
    if (!Number.isFinite(stamp)) return '';
    const minutes = Math.max(0, Math.floor((maintenant - stamp) / 60000));
    if (minutes < 1) return t('ad.msg.reviewResumeAgoNow');
    if (minutes < 60) {
      return t('ad.msg.reviewResumeAgoMin').replace('{n}', String(minutes));
    }
    const heures = Math.floor(minutes / 60);
    if (heures < 24) {
      return t('ad.msg.reviewResumeAgoHour').replace('{n}', String(heures));
    }
    return t('ad.msg.reviewResumeAgoDay').replace('{n}', String(Math.floor(heures / 24)));
  })();

  /* Les dépôts arrivés après la relance, lus par fil : un fil se range selon
     le compte de l'un de ses participants, jamais selon un chiffre tenu à
     part. Un fil sans compte connu ne pèse rien. */
  const apresDe = (row: AdminConversation) => apresParFil?.get(row.id) ?? 0;
  const avecApres = rows.filter((row) => apresDe(row) > 0).length;

  /* Le nom d'un fil, tel qu'il se lit dans la liste et sur la jauge. */
  const etiquette = (row: AdminConversation) =>
    [row.nom_a, row.nom_b].filter(Boolean).join(' ↔ ') || row.sujet || '—';

  /* L'aire d'un fil, lue sur le pays de l'un de ses participants : la fiche
     du compte porte ce pays, et la liste s'en sert sans ouvrir un dossier.
     Un fil dont aucun participant n'est connu ne s'invente pas une aire. */
  const regionDe = (row: AdminConversation): RegionMonde | null => {
    if (!compteDe) return null;
    const ids = [row.user_a, row.user_b].filter((id): id is string => Boolean(id));
    for (let i = 0; i < ids.length; i += 1) {
      const region = regionMondeDe(compteDe(ids[i])?.pays ?? '');
      if (region) return region;
    }
    return null;
  };

  /* Le filtre effectif : le choix mémorisé, sauf quand la fiche vient de
     nommer un fil — la liste se rouvre alors en entier. Le jeton « restant à
     relire » est suspendu de la même façon, sans être oublié. La revue d'un
     compte, elle, impose le sommeil sans changer le choix retenu. */
  const sleepOn = (sleepOnly || scopeOn) && !filNomme;
  const restantOn = restantOnly && !filNomme;
  const apresOn = apresOnly && !filNomme;

  /* Le filtre ne retire rien tant que la mesure n'est pas revenue : une revue
     qui s'ouvrirait sur une liste vide ferait croire à un silence qui n'existe
     pas encore. Le fil ouvert, lui, reste dans la liste même une fois marqué —
     la revue ne le fait pas disparaître sous le clic. */
  const baseRevue = sleepOn && pacesReady ? dormantsRows : rows;
  const baseFiltre =
    restantOn && pacesReady
      ? baseRevue.filter(
          (row) =>
            row.id === ouverte || (enSommeil(paces[row.id]) && !revusSet.has(row.id)),
        )
      : baseRevue;
  /* L'aire retenue resserre la liste : seuls restent les fils dont un
     participant se tient dans cette aire. */
  const baseAire = aire ? baseFiltre.filter((row) => regionDe(row)?.key === aire) : baseFiltre;
  /* Les aires nommées par le classeur resserrent la boîte à elles seules : un
     fil dont aucun participant ne se tient dans l'une d'elles reste dehors,
     comme lorsqu'une aire unique est retenue. */
  const baseAires =
    airesTight.length > 0
      ? baseAire.filter((row) => {
          const region = regionDe(row);
          return Boolean(region && airesTight.includes(region.key));
        })
      : baseAire;
  /* Le jeton des aires relevées il y a plus de sept jours resserre la boîte
     sur elles seules : une aire sans relevé garde son fil dehors, comme une
     aire relevée hier. */
  const baseVieilles = vieillesOnly
    ? baseAires.filter((row) => {
        const region = regionDe(row);
        if (!region) return false;
        const stamp = releves[region.key] ?? 0;
        return stamp > 0 && stamp < Date.now() - 7 * 24 * 60 * 60 * 1000;
      })
    : baseAires;
  const visibles = apresOn ? baseVieilles.filter((row) => apresDe(row) > 0) : baseVieilles;

  /* Les fils que les aires resserrées laissent dans la boîte, lus avant les
     jetons qui resserrent encore : la pastille dit le compte d'aires et le
     compte de fils côte à côte, dans son survol comme dans son titre. */
  const filsAiresTight = airesTight.length > 0 ? baseAires.length : 0;

  /* Les aires du classeur qu'aucun relevé n'a encore emportées — ni d'ensemble,
     ni une à une : la pastille les compte à côté de son total, et son survol
     les nomme. Le partage suit la même règle que les pastilles d'aire de la
     liste, donc les deux chiffres ne peuvent pas se contredire. */
  const airesTightJamais = airesTight.filter(
    (key) => !releves[key] && !relevesTous.aires.includes(key),
  ).length;
  /* Les aires du classeur qui portent encore une date de relevé : le survol
     de la petite gomme dit combien elle en rend vierges, et les nomme une à
     une. */
  const airesTightReleveesListe = airesTight.filter(
    (key) => Boolean(releves[key]) || relevesTous.aires.includes(key),
  );
  const airesTightRelevees = airesTightReleveesListe.length;

  /* Les fils que chaque aire resserrée laisse dans la boîte, comptés une
     seule fois : le survol de son nom dit à la fois son compte de fils et le
     jour de son relevé, comme la ligne des fils de la synthèse du classeur. */
  const filsParAireTight = (() => {
    const map = new Map<string, number>();
    airesTight.forEach((key) => map.set(key, 0));
    baseAires.forEach((row) => {
      const region = regionDe(row);
      if (!region) return;
      const compte = map.get(region.key);
      if (compte === undefined) return;
      map.set(region.key, compte + 1);
    });
    return map;
  })();

  /* Le fil qui ouvre la marche du tri « après relance » : son compte est celui
     qui a le plus déposé depuis son message, il se nomme sur le bouton comme
     la reprise nomme le premier fil restant. */
  const premierApres = (() => {
    const candidats = visibles.filter((row) => apresDe(row) > 0);
    if (candidats.length === 0) return null;
    return candidats.reduce((best, row) => (apresDe(row) > apresDe(best) ? row : best));
  })();

  /* L'en-tête de tri « revue » : les fils dormants jamais ouverts pendant la
     visite d'abord, puis ceux déjà relus, puis le reste. L'ordre de la liste
     est conservé à l'intérieur de chaque groupe. */
  const rangRevue = (row: AdminConversation) => {
    if (!enSommeil(paces[row.id])) return 2;
    return revusSet.has(row.id) ? 1 : 0;
  };

  /* Le jour du dernier relevé de l'aire d'un fil : c'est ce que l'ordre
     « relevé le plus récent » mesure, et rien d'autre. Un fil sans aire connue
     ne pèse aucun jour — il ferme la marche. */
  const dateReleve = (row: AdminConversation) => {
    const region = regionDe(row);
    if (!region) return 0;
    return releves[region.key] ?? 0;
  };

  /* La même date, lue pour l'ordre inverse : une aire jamais relevée ou un
     interlocuteur sans aire connue n'a pas de date, et ferme donc la marche
     plutôt que de passer pour le plus ancien relevé de tous. */
  const dateAncienne = (row: AdminConversation) => {
    const stamp = dateReleve(row);
    return stamp > 0 ? stamp : Number.POSITIVE_INFINITY;
  };

  /* L'aire d'un fil est-elle encore vierge de tout relevé ? Ni emportée par le
     geste d'ensemble, ni par le relevé de son aire : c'est ce que l'ordre
     « aire jamais relevée d'abord » met en tête. Un fil sans aire connue ne
     pèse rien — il ferme la marche, comme dans les autres ordres. */
  const jamaisReleve = (row: AdminConversation) => {
    const region = regionDe(row);
    if (!region) return false;
    if (releves[region.key]) return false;
    return !relevesTous.aires.includes(region.key);
  };

  /* Le jour du dernier geste de gomme sur l'aire d'un fil : c'est ce que
     l'ordre « gomme la plus récente d'abord » mesure, et rien d'autre. Un fil
     sans aire connue, ou dont l'aire n'a jamais été rendue vierge, n'a pas de
     date et ferme la marche. */
  const dateGomme = (row: AdminConversation) => {
    const region = regionDe(row);
    if (!region) return 0;
    return gommesAires[region.key] ?? 0;
  };

  /* La même date, lue pour l'ordre inverse : une aire jamais rendue ou un
     interlocuteur sans aire connue n'a pas de date, et ferme donc la marche
     plutôt que de passer pour la gomme la plus ancienne de toutes. */
  const dateGommeAncienne = (row: AdminConversation) => {
    const stamp = dateGomme(row);
    return stamp > 0 ? stamp : Number.POSITIVE_INFINITY;
  };

  const listeAffichee = (() => {
    if (
      !revueFirst &&
      !apresFirst &&
      !aireFirst &&
      !recentFirst &&
      !jamaisFirst &&
      !ancienFirst &&
      !gommeFirst
    ) {
      return visibles;
    }
    const ordre = visibles.map((row, index) => ({ row, index }));
    ordre.sort((a, b) => {
      if (aireFirst) return a.index - b.index;
      if (jamaisFirst) {
        /* Les fils des aires encore dans la boîte passent devant, puis les
           aires déjà relevées et les interlocuteurs sans aire connue. */
        const ecart =
          (jamaisReleve(a.row) ? 0 : 1) - (jamaisReleve(b.row) ? 0 : 1);
        if (ecart !== 0) return ecart;
      } else if (recentFirst) {
        /* L'aire dont le relevé vient de quitter la boîte passe devant : la
           plus fraîche d'abord, puis les aires jamais relevées. */
        const ecart = dateReleve(b.row) - dateReleve(a.row);
        if (ecart !== 0) return ecart;
      } else if (gommeFirst) {
        /* L'aire que la gomme vient de rendre vierge passe devant : la plus
           récemment effacée d'abord, puis celle qui n'a jamais été rendue,
           qui n'a aucune date et ferme la marche. */
        const ecart = dateGomme(b.row) - dateGomme(a.row);
        if (ecart !== 0) return ecart;
      } else if (gommeAncienneFirst) {
        /* L'aire que la gomme a rendue vierge il y a le plus longtemps passe
           devant : ce qui attend d'être remis à neuf se retrouve d'un coup.
           Les aires jamais rendues, qui n'ont aucune date, ferment la
           marche. */
        const ecart = dateGommeAncienne(a.row) - dateGommeAncienne(b.row);
        if (Number.isFinite(ecart) && ecart !== 0) return ecart;
      } else if (ancienFirst) {
        /* L'aire dont le relevé attend depuis le plus longtemps passe devant :
           ce qui attend le plus longtemps se retrouve d'un coup. Les aires
           jamais relevées et les interlocuteurs sans aire connue, qui n'ont
           aucune date, ferment la marche. */
        const ecart = dateAncienne(a.row) - dateAncienne(b.row);
        if (Number.isFinite(ecart) && ecart !== 0) return ecart;
      } else if (apresFirst) {
        const ecart = apresDe(b.row) - apresDe(a.row);
        if (ecart !== 0) return ecart;
      } else {
        const ecart = rangRevue(a.row) - rangRevue(b.row);
        if (ecart !== 0) return ecart;
      }
      /* À égalité, l'ordre de la liste est gardé : un tri ne mélange pas ce
         qu'il ne prétend pas mesurer. */
      return a.index - b.index;
    });
    return ordre.map((entry) => entry.row);
  })();

  /* Le fil qui ouvre la marche de l'ordre « relevé le plus récent » : il se
     nomme dans la barre de tri comme celui des deux autres ordres. */
  const premierRecent = recentFirst
    ? listeAffichee.find((row) => dateReleve(row) > 0) ?? null
    : null;

  /* Le fil qui ouvre la marche de l'ordre « relevé le plus ancien d'abord » :
     celui dont l'aire attend depuis le plus longtemps. Il se nomme dans la
     barre de tri comme ceux des cinq autres ordres. */
  const premierAncien = ancienFirst
    ? listeAffichee.find((row) => dateReleve(row) > 0) ?? null
    : null;

  /* Le fil qui ouvre la marche de l'ordre « gomme la plus récente d'abord » :
     celui dont l'aire vient d'être rendue vierge, il se nomme dans la barre de
     tri comme ceux des autres ordres. */
  const premierGomme = gommeFirst
    ? listeAffichee.find((row) => dateGomme(row) > 0) ?? null
    : null;

  /* Le fil qui ouvre la marche de l'ordre « gomme la plus ancienne d'abord » :
     celui dont l'aire attend sa remise à neuf depuis le plus longtemps. Il se
     nomme dans la barre de tri comme ceux des autres ordres. */
  const premierGommeAncienne = gommeAncienneFirst
    ? listeAffichee.find((row) => dateGomme(row) > 0) ?? null
    : null;

  /* Le fil qui ouvre la marche de l'ordre « aire jamais relevée d'abord » :
     le premier fil dont l'aire n'a encore jamais quitté la boîte. Il se nomme
     dans la barre de tri comme ceux des quatre autres ordres. */
  const premierJamais = jamaisFirst
    ? listeAffichee.find((row) => jamaisReleve(row)) ?? null
    : null;

  /* Ce que l'ordre « aire jamais relevée d'abord » laisse réellement en tête :
     ses fils, et les aires qu'ils portent, lues dans l'ordre des aires du
     monde. Le compte se lit sous le tri, à côté de celui des aires. */
  const teteJamais = jamaisFirst ? listeAffichee.filter((row) => jamaisReleve(row)) : [];
  const filsJamaisTete = teteJamais.length;
  const airesJamaisTete = REGIONS_MONDE
    .filter((region) => teteJamais.some((row) => regionDe(row)?.key === region.key))
    .map((region) => region.key);

  /* Le fil qui ouvre la marche du tri « revue » : le premier fil dormant qui
     reste à relire dans la liste telle qu'elle s'affiche. Il se nomme dans
     l'en-tête, comme le compte du tri « après relance ». */
  const teteRevue =
    listeAffichee.find(
      (row) => enSommeil(paces[row.id]) && !revusSet.has(row.id),
    ) ?? null;

  /* Les fils rangés sous le nom de chaque aire du monde, dans l'ordre des
     aires. Un interlocuteur dont le pays n'est pas connu ne disparaît pas :
     il ferme la liste, sous son propre titre. Le même rangement sert à la
     lecture groupée et au relevé de toutes les aires, pour que les deux
     disent exactement la même chose. */
  const grouperParAire = (liste: AdminConversation[]): GroupeAire[] => {
    const seaux = new Map<string, GroupeAire>();
    REGIONS_MONDE.forEach((region) => {
      seaux.set(region.key, {
        cle: region.key,
        libelle: t(`worldRegion.${region.key}`),
        region,
        rows: [],
      });
    });
    const sansAire: GroupeAire = {
      cle: 'sans-aire',
      libelle: t('ad.msg.aireGroupNone'),
      region: null,
      rows: [],
    };
    liste.forEach((row) => {
      const region = regionDe(row);
      const seau = region ? seaux.get(region.key) : sansAire;
      (seau ?? sansAire).rows.push(row);
    });
    const remplis = REGIONS_MONDE
      .map((region) => seaux.get(region.key))
      .filter((groupe): groupe is GroupeAire => Boolean(groupe) && (groupe as GroupeAire).rows.length > 0);
    return sansAire.rows.length > 0 ? [...remplis, sansAire] : remplis;
  };

  const groupes: GroupeAire[] = aireFirst ? grouperParAire(listeAffichee) : [];

  /* Les aires de la boîte telles qu'elle se lit, groupées pour le relevé :
     le geste de l'en-tête les emporte toutes, un titre par aire, sans passer
     par chaque groupe. */
  const groupesReleve: GroupeAire[] = grouperParAire(visibles);

  /* Les aires de la boîte avant qu'elle ne se resserre sur une seule : c'est
     l'étendue entière que la pastille des aires jamais relevées mesure, sinon
     la boîte se lirait déjà réduite à ce qu'elle montre et la porte ne
     mènerait plus nulle part. Le resserrement choisi ne change donc rien à la
     liste des aires restant à relever. */
  const groupesBoiteEntiere = grouperParAire(
    apresOn ? baseFiltre.filter((row) => apresDe(row) > 0) : baseFiltre,
  );

  /* Les fils que ces aires portent réellement dans la boîte : la gomme de la
     pastille et celle de la ligne des fils y lisent le poids de leur geste au
     moment du clic, avant que la boîte ne change. */
  const filsDesAires = (cles: string[]) =>
    groupesBoiteEntiere
      .filter((groupe) => groupe.region && cles.includes(groupe.region.key))
      .reduce((total, groupe) => total + groupe.rows.length, 0);

  /* Les aires réellement portées par la boîte, dans l'ordre des aires du
     monde : celles que le relevé d'ensemble nommerait s'il partait maintenant. */
  const airesDeLaBoite = groupesBoiteEntiere
    .map((groupe) => groupe.region)
    .filter((region): region is RegionMonde => Boolean(region));

  /* Les aires que rien n'a encore emportées : ni un relevé d'ensemble, ni le
     relevé d'une seule aire. Elles se repèrent d'un regard dans l'en-tête,
     sans ouvrir chaque groupe. */
  const airesJamaisRelevees = airesDeLaBoite.filter(
    (region) => !relevesTous.aires.includes(region.key) && !releves[region.key],
  );

  /* Les aires de la boîte dont le dernier relevé de fils date de plus de sept
     jours : le jeton de l'en-tête les compte, les nomme au survol, puis ne
     garde que leurs fils. Une aire jamais relevée n'en fait pas partie — elle
     a son propre ordre. */
  const SEPT_JOURS_MS = 7 * 24 * 60 * 60 * 1000;
  const seuilVieilleReleve = Date.now() - SEPT_JOURS_MS;
  const airesVieilles = airesDeLaBoite.filter((region) => {
    const stamp = releves[region.key] ?? 0;
    return stamp > 0 && stamp < seuilVieilleReleve;
  });

  /* Les fils que le jeton des sept jours laisse réellement dans la liste : le
     compte se lit à côté de celui des aires, comme la ligne du tri « aire
     jamais relevée d'abord » compte les fils qu'il met en tête. */
  const filsVieilles = (vieillesOnly ? visibles : baseAires).filter((row) => {
    const region = regionDe(row);
    if (!region) return false;
    const stamp = releves[region.key] ?? 0;
    return stamp > 0 && stamp < seuilVieilleReleve;
  }).length;

  /* Les aires de la boîte dont le relevé de fils porte la date du jour : le
     même seuil que la ligne « Aires relevées aujourd'hui » de la synthèse du
     classeur, lu sur la même mémoire d'appareil. La pastille de l'en-tête et
     le fichier ne peuvent donc pas annoncer deux chiffres différents. */
  const debutDuJour = (() => {
    const debut = new Date();
    debut.setHours(0, 0, 0, 0);
    return debut.getTime();
  })();
  const airesReleveesJour = airesDeLaBoite.filter(
    (region) => (releves[region.key] ?? 0) >= debutDuJour,
  );
  /* Les fils que ces aires ont emportés, nommés un à un : chaque aire ouvre
     la liste de ses propres interlocuteurs, lus sur la boîte entière — le
     même découpage que les groupes de la boîte. */
  const filsAiresJour = airesReleveesJour.map((region) => ({
    region,
    fils:
      groupesBoiteEntiere
        .find((groupe) => groupe.region?.key === region.key)
        ?.rows.map((row) => etiquette(row)) ?? [],
  }));
  const filsAiresJourTotal = filsAiresJour.reduce(
    (total, entry) => total + entry.fils.length,
    0,
  );
  /* Le survol de la pastille : le compte des aires, celui des fils qu'elles
     ont emportés, puis les fils eux-mêmes, aire par aire, un à un. */
  const airesJourDetail = filsAiresJour
    .map((entry) =>
      t('ad.msg.airesJourAireDetail')
        .replace('{region}', t(`worldRegion.${entry.region.key}`))
        .replace(
          '{fils}',
          entry.fils.length > 0
            ? entry.fils.join(' · ')
            : t('ad.msg.airesJourNoThread'),
        ),
    )
    .join(' — ');
  const airesJourHint = t('ad.msg.airesJourPillHint')
    .replace('{n}', String(airesReleveesJour.length))
    .replace('{fils}', String(filsAiresJourTotal))
    .replace('{detail}', airesJourDetail);
  /* Ce que la petite gomme de la pastille va rendre, dit au survol : toutes
     les aires de la boîte, quel que soit leur jour de relevé, et combien
     d'entre elles portent encore une date. */
  const gommeAiresJourHint = t('ad.msg.airesJourGommeHint')
    .replace('{n}', String(airesDeLaBoite.length))
    .replace(
      '{relevees}',
      String(
        airesDeLaBoite.filter((region) => Boolean(releves[region.key])).length,
      ),
    );

  /* L'écart entre le plus vieux et le plus récent relevé des aires de la
     boîte : le survol du tri « relevé le plus ancien d'abord » le dit, pour
     que l'attente se mesure avant le clic. Un seul relevé ne fait pas
     d'écart, et une boîte sans date garde le survol d'origine. */
  const ecartReleves = (() => {
    const entries = airesDeLaBoite
      .map((region) => ({ key: region.key, stamp: releves[region.key] ?? 0 }))
      .filter((entry) => entry.stamp > 0);
    if (entries.length === 0) return null;
    /* Les deux bouts de l'écart gardent leur aire : la plus ancienne et la
       plus récente se nomment, au lieu de rester deux dates sans visage. */
    const vieux = entries.reduce((best, entry) =>
      entry.stamp < best.stamp ? entry : best,
    );
    const recent = entries.reduce((best, entry) =>
      entry.stamp > best.stamp ? entry : best,
    );
    return {
      n: Math.max(0, Math.floor((recent.stamp - vieux.stamp) / 86400000)),
      vieux: vieux.stamp,
      recent: recent.stamp,
      vieuxAire: vieux.key,
      recentAire: recent.key,
    };
  })();
  const sortAncienHint = ecartReleves
    ? `${t('ad.msg.sortAncienHint')} ${t('ad.msg.sortAncienSpan')
        .replace('{n}', String(ecartReleves.n))
        .replace('{vieux}', jourCopie(ecartReleves.vieux, lang))
        .replace('{recent}', jourCopie(ecartReleves.recent, lang))}`
    : t('ad.msg.sortAncienHint');

  /* La jauge posée sous le tri « relevé le plus ancien d'abord » : elle
     mesure l'écart sur une échelle de trois mois, pour que l'attente se lise
     sans survol. L'écart d'un seul relevé ne fait pas de jauge. */
  const partEcartReleves = ecartReleves
    ? Math.min(100, Math.max(4, Math.round((ecartReleves.n / 90) * 100)))
    : 0;
  const ancienJaugeSpan = ecartReleves
    ? t('ad.msg.ancienJaugeSpan')
        .replace('{n}', String(ecartReleves.n))
        .replace('{vieux}', jourCopie(ecartReleves.vieux, lang))
        .replace('{recent}', jourCopie(ecartReleves.recent, lang))
    : '';

  /* Le survol de la jauge nomme les deux aires qui se tiennent aux bouts de
     l'écart — la plus ancienne et la plus récente —, avec leur date : l'attente
     se situe avant d'être ouverte. Une boîte sans date garde le survol
     d'origine, sans inventer d'aires. */
  const ancienJaugeHint = ecartReleves
    ? `${t('ad.msg.ancienJaugeHint')} ${t('ad.msg.ancienJaugeBouts')
        .replace('{aireVieux}', t(`worldRegion.${ecartReleves.vieuxAire}`))
        .replace('{vieux}', jourCopie(ecartReleves.vieux, lang))
        .replace('{aireRecent}', t(`worldRegion.${ecartReleves.recentAire}`))
        .replace('{recent}', jourCopie(ecartReleves.recent, lang))}`
    : t('ad.msg.ancienJaugeHint');

  /* Ce que les gommes des relevés ont rendu depuis cet appareil, dit en
     clair : le nombre de gestes, celui des aires rendues sans date et le jour
     du dernier. */
  /* L'écart de jours entre le premier et le dernier geste de gomme : le
     survol de la pastille le dit, pour que l'effacement se lise dans le temps
     et pas seulement à sa dernière date. Un seul geste ne fait pas d'écart. */
  const gommesEcart = (() => {
    if (gommes.count < 2 || !gommes.premier || !gommes.last) return null;
    return {
      jours: Math.max(0, Math.floor((gommes.last - gommes.premier) / 86400000)),
      premier: gommes.premier,
      dernier: gommes.last,
    };
  })();
  const gommesHint = gommes.count > 0
    ? `${t('ad.msg.gommesTallyHint')
        .replace('{n}', String(gommes.count))
        .replace('{aires}', String(gommes.aires))
        .replace('{date}', jourCopie(gommes.last, lang))}${
        gommesEcart
          ? ` ${t('ad.msg.gommesSpan')
              .replace('{n}', String(gommesEcart.jours))
              .replace('{premier}', jourCopie(gommesEcart.premier, lang))
              .replace('{dernier}', jourCopie(gommesEcart.dernier, lang))}`
          : ''
      }`
    : '';
  const gommesTally = t('ad.msg.gommesTally')
    .replace('{n}', String(gommes.count))
    .replace('{date}', jourCopie(gommes.last, lang));

  /* Les aires que la petite gomme a rendues vierges, la plus récemment
     effacée en tête : la ligne posée sous l’ordre « gomme la plus récente
     d’abord » les nomme une à une avec le jour de leur geste. */
  const gommesAiresListe = REGIONS_MONDE
    .filter((region) => (gommesAires[region.key] ?? 0) > 0)
    .sort((a, b) => (gommesAires[b.key] ?? 0) - (gommesAires[a.key] ?? 0));
  const gommeLine = t('ad.msg.gommeLine')
    .replace('{n}', String(gommesAiresListe.length))
    .replace(
      '{list}',
      gommesAiresListe
        .map((region) =>
          t('ad.msg.gommeLineAire')
            .replace('{region}', t(`worldRegion.${region.key}`))
            .replace('{date}', jourCopie(gommesAires[region.key], lang)),
        )
        .join(' · '),
    );

  /* Les mêmes aires, lues dans l'autre sens : la plus anciennement rendue en
     tête. La ligne posée sous l'ordre « gomme la plus ancienne d'abord » les
     nomme une à une avec le jour de leur geste. */
  const gommesAiresListeAncienne = [...gommesAiresListe].reverse();
  const gommeAncienneLine = t('ad.msg.gommeAncienneLine')
    .replace('{n}', String(gommesAiresListeAncienne.length))
    .replace(
      '{list}',
      gommesAiresListeAncienne
        .map((region) =>
          t('ad.msg.gommeLineAire')
            .replace('{region}', t(`worldRegion.${region.key}`))
            .replace('{date}', jourCopie(gommesAires[region.key], lang)),
        )
        .join(' · '),
    );

  /* Les aires rendues par la gomme qui se tiennent encore dans la boîte, et
     celles qui l'ont quittée : le survol des fils de la dernière gomme donne
     les deux compte à la suite, pour que le geste se lise sur ce qui reste
     à voir comme sur ce qui a déjà quitté la liste. */
  const gommesAiresEncore = gommesAiresListe.filter((region) =>
    airesDeLaBoite.some((entry) => entry.key === region.key),
  );
  const gommesAiresParties = gommesAiresListe.filter(
    (region) => !airesDeLaBoite.some((entry) => entry.key === region.key),
  );
  /* Les aires parties, lues dans le sens choisi : par défaut la plus
     récemment effacée en tête, ou la plus anciennement effacée quand la ligne
     est retournée. La copie suit ce même ordre. */
  const gommesPartiesListe = horsAncienneFirst
    ? [...gommesAiresParties].reverse()
    : gommesAiresParties;
  const gommesFilsHint = [
    t('ad.msg.gommesFilsHint'),
    gommesAiresEncore.length > 0
      ? t('ad.msg.gommesFilsEncore')
          .replace('{n}', String(gommesAiresEncore.length))
          .replace(
            '{list}',
            gommesAiresEncore
              .map((region) => t(`worldRegion.${region.key}`))
              .join(' · '),
          )
      : '',
    gommesAiresParties.length > 0
      ? t('ad.msg.gommesFilsParties')
          .replace('{n}', String(gommesAiresParties.length))
          .replace(
            '{list}',
            gommesAiresParties
              .map((region) => t(`worldRegion.${region.key}`))
              .join(' · '),
          )
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  /* Les aires rendues par la gomme qui ne sont plus dans la boîte, la plus
     récemment effacée en tête : la ligne posée sous le tri inverse les nomme
     une à une avec le jour de leur dernier geste, pour que le geste se relise
     aussi sur ce qui a quitté la liste. */
  const gommeHorsLine = t(
    horsAncienneFirst ? 'ad.msg.gommeHorsLineAncienne' : 'ad.msg.gommeHorsLine',
  )
    .replace('{n}', String(gommesPartiesListe.length))
    .replace(
      '{list}',
      gommesPartiesListe
        .map((region) =>
          t('ad.msg.gommeLineAire')
            .replace('{region}', t(`worldRegion.${region.key}`))
            .replace('{date}', jourCopie(gommesAires[region.key], lang)),
        )
        .join(' · '),
    );

  /* Le partage des aires rendues par la dernière gomme, dit sur la pastille
     elle-même : celles qui se tiennent encore dans la boîte et celles qui
     l'ont quittée. Les deux chiffres se lisent sans survol, et le survol les
     nomme une à une. */
  const gommesSplitHint = t('ad.msg.gommesSplitHint')
    .replace('{encore}', String(gommesAiresEncore.length))
    .replace('{parties}', String(gommesAiresParties.length))
    .replace(
      '{listeEncore}',
      gommesAiresEncore.length > 0
        ? gommesAiresEncore
            .map((region) => t(`worldRegion.${region.key}`))
            .join(' · ')
        : t('ad.msg.gommesNoneAreas'),
    )
    .replace(
      '{listeParties}',
      gommesAiresParties.length > 0
        ? gommesAiresParties
            .map((region) => t(`worldRegion.${region.key}`))
            .join(' · ')
        : t('ad.msg.gommesNoneAreas'),
    );

  /* Les départs, comptés par mois d'effacement : le survol du bouton qui
     retourne la ligne des aires parties dit les vagues du geste — combien de
     départs chaque mois a emportés —, lus sur la même mémoire d'appareil que
     la ligne elle-même. */
  const gommesPartiesMois = (() => {
    const seaux = new Map<string, number>();
    gommesAiresParties.forEach((region) => {
      const stamp = gommesAires[region.key] ?? 0;
      if (!stamp) return;
      const moment = new Date(stamp);
      const cle = `${moment.getFullYear()}-${String(moment.getMonth() + 1).padStart(2, '0')}`;
      seaux.set(cle, (seaux.get(cle) ?? 0) + 1);
    });
    const libelle = new Intl.DateTimeFormat(localeFor(lang), {
      month: 'short',
      year: 'numeric',
    });
    return [...seaux.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([cle, n]) => {
        const [annee, mois] = cle.split('-');
        const stamp = new Date(Number(annee), Number(mois) - 1, 1);
        return { cle, n, label: libelle.format(stamp) };
      });
  })();
  const gommeHorsSortHint =
    gommesPartiesMois.length > 0
      ? `${t('ad.msg.gommeHorsSortHint')} ${t('ad.msg.gommeHorsSortMonths')
          .replace('{n}', String(gommesAiresParties.length))
          .replace(
            '{list}',
            gommesPartiesMois.map((entry) => `${entry.label} ${entry.n}`).join(' · '),
          )}`
      : t('ad.msg.gommeHorsSortHint');

  /* Les deux bouts du partage, nommés sur la pastille des gommes : l'aire
     effacée en dernier et celle qui est partie le plus anciennement, chacune
     avec le jour de son geste — le partage se lit sans survol. */
  const gommeSplitDerniere = gommesAiresListe[0] ?? null;
  const gommeSplitVieillePartie =
    gommesAiresParties.length > 0
      ? gommesAiresParties[gommesAiresParties.length - 1]
      : null;
  const gommesSplitBouts =
    gommeSplitDerniere && gommeSplitVieillePartie
      ? t('ad.msg.gommesSplitBouts')
          .replace('{recent}', t(`worldRegion.${gommeSplitDerniere.key}`))
          .replace(
            '{dateRecent}',
            jourCopie(gommesAires[gommeSplitDerniere.key], lang),
          )
          .replace('{vieux}', t(`worldRegion.${gommeSplitVieillePartie.key}`))
          .replace(
            '{dateVieux}',
            jourCopie(gommesAires[gommeSplitVieillePartie.key], lang),
          )
      : t('ad.msg.gommesSplitBoutsNone');
  const gommesSplitBoutsHint = gommeSplitVieillePartie
    ? t('ad.msg.gommesSplitBoutsHint')
        .replace('{vieux}', t(`worldRegion.${gommeSplitVieillePartie.key}`))
        .replace(
          '{dateVieux}',
          jourCopie(gommesAires[gommeSplitVieillePartie.key], lang),
        )
    : t('ad.msg.gommesSplitBoutsNoneHint');

  /* La liste des aires parties, copiée depuis la ligne du tri inverse : une
     entrée, puis une ligne par aire avec le jour de son geste — prête à
     coller dans un message. */
  const buildGommeHors = () =>
    [
      t('ad.msg.gommeHorsCopyHead')
        .replace('{n}', String(gommesAiresParties.length))
        .replace('{total}', String(gommesAiresListe.length)),
      ...gommesPartiesListe.map((region) =>
        t('ad.msg.gommeLineAire')
          .replace('{region}', t(`worldRegion.${region.key}`))
          .replace('{date}', jourCopie(gommesAires[region.key], lang)),
      ),
    ].join('\n');

  /* L'aire que la gomme a rendue vierge en dernier : la jauge du tri inverse
     la nomme, juste au-dessus de la ligne des aires parties. */
  const gommeRecapTete = gommesAiresListe[0] ?? null;
  const gommeRecapTeteTexte = gommeRecapTete
    ? t('ad.msg.recapGommeTete')
        .replace('{region}', t(`worldRegion.${gommeRecapTete.key}`))
        .replace(
          '{date}',
          jourCopie(gommesAires[gommeRecapTete.key], lang),
        )
    : '';

  /* Le sens que le tri inverse de la ligne récapitulative lit au moment du
     clic : le plus frais d'abord par défaut, ou l'autre bout quand l'ordre
     inverse est déjà posé. */
  const recapGommeSens = gommeAncienneFirst
    ? t('ad.msg.recapGommeSensAncien')
    : t('ad.msg.recapGommeSensRecent');

  /* L'écart de jours entre l'aire effacée en dernier et la plus anciennement
     effacée : le survol de la jauge le dit, pour que le geste se lise d'un
     bout à l'autre et pas seulement à sa date la plus fraîche. Un seul geste
     ne fait pas d'écart. */
  const gommeRecapEcart = (() => {
    if (gommesAiresListe.length < 2) return null;
    const recent = gommesAiresListe[0];
    const vieux = gommesAiresListe[gommesAiresListe.length - 1];
    const stampRecent = gommesAires[recent.key] ?? 0;
    const stampVieux = gommesAires[vieux.key] ?? 0;
    if (!stampRecent || !stampVieux) return null;
    return {
      jours: Math.max(0, Math.floor((stampRecent - stampVieux) / 86400000)),
      recent: recent.key,
      vieux: vieux.key,
      stampRecent,
      stampVieux,
    };
  })();
  const recapGommeHint = gommeRecapEcart
    ? `${t('ad.msg.recapGommeHint')} ${t('ad.msg.recapGommeSpan')
        .replace('{n}', String(gommeRecapEcart.jours))
        .replace('{recent}', t(`worldRegion.${gommeRecapEcart.recent}`))
        .replace('{dateRecent}', jourCopie(gommeRecapEcart.stampRecent, lang))
        .replace('{vieux}', t(`worldRegion.${gommeRecapEcart.vieux}`))
        .replace('{dateVieux}', jourCopie(gommeRecapEcart.stampVieux, lang))}`
    : t('ad.msg.recapGommeHint');

  /* Le geste de la ligne des aires parties : un clic retourne le sens, du plus
     frais au plus ancien, puis du plus ancien au plus frais. */
  const basculerHorsSens = () =>
    setHorsAncienneFirst((value) => {
      saveGommeHorsAncienne(!value);
      return !value;
    });

  /* L'aire que la pastille ouvrira au prochain appui : celle qui suit l'aire
     retenue dans l'ordre des aires du monde, ou la première quand la boîte
     n'est resserrée sur aucune d'elles. Les appuis s'enchaînent ainsi d'une
     aire jamais relevée à la suivante, sans repasser par le titre du groupe. */
  const aireJamaisSuivante = (() => {
    if (airesJamaisRelevees.length === 0) return null;
    const ici = airesJamaisRelevees.findIndex((region) => region.key === aire);
    return airesJamaisRelevees[(ici + 1) % airesJamaisRelevees.length];
  })();

  /* L'aire retenue, lue dans la liste des aires du monde : la pastille dit
     alors son étendue — combien de pays et de fiches elle couvre —, à côté du
     compte des fils qu'elle laisse dans la boîte. */
  const regionRetenue = aire
    ? REGIONS_MONDE.find((region) => region.key === aire) ?? null
    : null;

  /* Le dernier relevé de chaque aire, par chemin : la pastille d'aire d'un fil
     s'en sert pour dire, au survol, si son relevé est déjà parti d'un en-tête
     de groupe ou d'un appui long sur une ligne. */
  const cheminsAires = readAireRelevesCheminsAires();

  /* Ce que le survol d'une pastille d'aire ajoute : d'où le relevé de cette
     aire est déjà parti, et quand — ou qu'il n'est encore jamais parti. */
  const cheminDeAire = (key: RegionMondeKey): string => {
    const chemins = cheminsAires[key];
    const entete = chemins?.entete ?? 0;
    const ligne = chemins?.ligne ?? 0;
    if (entete && ligne) {
      return t('ad.msg.threadAireCheminBoth')
        .replace('{entete}', jourCopie(entete, lang))
        .replace('{ligne}', jourCopie(ligne, lang));
    }
    if (entete) {
      return t('ad.msg.threadAireCheminEntete').replace(
        '{date}',
        jourCopie(entete, lang),
      );
    }
    if (ligne) {
      return t('ad.msg.threadAireCheminLigne').replace(
        '{date}',
        jourCopie(ligne, lang),
      );
    }
    /* Une aire emportée par le geste d'ensemble : son relevé est bien parti,
       mais d'aucun des deux chemins d'une seule aire. */
    if (releves[key]) {
      return t('ad.msg.threadAireCheminEnsemble').replace(
        '{date}',
        jourCopie(releves[key], lang),
      );
    }
    return t('ad.msg.threadAireCheminNone');
  };

  /* Une aire retenue puis vidée par la vie de la boîte — un fil fermé, un
     compte parti — ne rouvre pas une liste vide : la boîte revient d'elle-même
     à tous les fils. */
  useEffect(() => {
    if (!aire || rows.length === 0) return;
    if (!rows.some((row) => regionDe(row)?.key === aire)) setAire('');
  }, [aire, rows, compteDe]);

  /* Une aire nommée par le classeur puis vidée par la vie de la boîte — un fil
     fermé, un compte parti — ne rouvre pas une liste vide : elle quitte le
     resserrement, et la pastille ne garde que les aires encore présentes. */
  useEffect(() => {
    if (airesTight.length === 0 || rows.length === 0) return;
    const presentes = new Set(
      REGIONS_MONDE
        .map((region) => region.key)
        .filter((key) => rows.some((row) => regionDe(row)?.key === key)),
    );
    const gardees = airesTight.filter((key) => presentes.has(key));
    if (gardees.length !== airesTight.length) setAiresTight(gardees);
  }, [airesTight, rows, compteDe]);

  /* L'aire retenue est reposée sur l'appareil à chaque changement : la boîte
     se rouvre resserrée là où la lecture s'est arrêtée, et le geste qui rend
     tous les fils se retient aussi. */
  useEffect(() => {
    saveAireKept(aire);
  }, [aire]);

  /* Le geste du titre d'un groupe : il resserre la boîte sur cette seule
     aire, sans passer par les lignes ; un second appui rend tous les fils. */
  const basculerAire = (key: RegionMondeKey) => {
    setAire((current) => (current === key ? '' : key));
  };

  /* Le geste de la pastille « aires jamais relevées » : chaque appui resserre
     la boîte sur l'aire jamais relevée qui vient dans l'ordre des aires du
     monde. Une fois la dernière atteinte, l'appui suivant revient à la
     première — la porte se parcourt sans jamais s'arrêter sur un cul-de-sac. */
  const ouvrirAireJamais = () => {
    if (!aireJamaisSuivante) return;
    setAire(aireJamaisSuivante.key);
    setFilNomme(false);
  };

  /* Le relevé d'une aire, copié depuis son en-tête : ses pays, puis chaque
     fil avec son interlocuteur et son sujet — une ligne par fil. */
  const buildReleve = (groupe: GroupeAire) => {
    const region = groupe.region;
    const files = region ? fichesDesPays(region.pays) : 0;
    const entete = t('ad.msg.aireGroupCopyLine')
      .replace('{region}', groupe.libelle)
      .replace('{files}', String(files))
      .replace('{unit}', t('cmaps.airesChipFiles'))
      .replace('{n}', String(groupe.rows.length));
    const lignes = groupe.rows.map((row) => t('ad.msg.aireGroupCopyRow')
      .replace('{nom}', etiquette(row))
      .replace('{sujet}', row.sujet || '—'));
    return [entete, ...lignes].join('\n');
  };

  /* Le relevé de toutes les aires de la boîte, copié depuis l'en-tête :
     chaque aire à la suite, sous son propre titre, puis ses fils — une ligne
     par fil. Un blanc sépare deux aires, pour que le message collé se relise
     sans confusion. */
  const buildReleves = () =>
    groupesReleve.map((groupe) => buildReleve(groupe)).join('\n\n');

  /* Le relevé d'une seule aire, bâti depuis la ligne d'un fil : le groupe de
     la boîte quand il existe, sinon les fils de cette aire tels qu'ils se
     lisent — un appui long n'emporte jamais autre chose que ce qu'on voit. */
  const buildReleveAire = (key: RegionMondeKey) => {
    const groupe = groupesReleve.find((entry) => entry.region?.key === key);
    if (groupe) return buildReleve(groupe);
    const region = REGIONS_MONDE.find((entry) => entry.key === key);
    if (!region) return '';
    return buildReleve({
      cle: key,
      libelle: t(`worldRegion.${key}`),
      region,
      rows: visibles.filter((row) => regionDe(row)?.key === key),
    });
  };

  /* Ce que la gomme du compte des relevés va effacer, dit en clair : combien
     de gestes et combien d'aires comptées, jamais autre chose. */
  const gommeRelevesHint = relevesTous.count > 0
    ? t('ad.msg.relevesAllClearHintCount')
      .replace('{n}', String(relevesTous.count))
      .replace('{a}', String(relevesTous.aires.length))
    : t('ad.msg.relevesAllClearHint');

  /* Ce que la gomme des deux chemins va effacer, dit en clair : combien de
     relevés partis d'un en-tête et combien emportés d'une ligne, jamais les
     dates des groupes. */
  const gommeCheminsHint = t('ad.msg.relevesCheminsClearHint')
    .replace('{h}', String(relevesChemins.entetes))
    .replace('{l}', String(relevesChemins.lignes));

  /* Le geste emporte toutes les aires : le jour de chaque relevé est reposé
     d'un seul coup, pour que chaque en-tête de groupe dise la même date. */
  const daterReleves = () => {
    let jours = readAireRelevesJours();
    /* Les aires réellement emportées par ce geste : elles entrent au compte
       des aires distinctes, une fois seulement, pour que l'en-tête dise
       combien d'aires ont quitté la boîte au moins une fois. */
    const aires: RegionMondeKey[] = [];
    groupesReleve.forEach((groupe) => {
      if (!groupe.region) return;
      /* Le geste d'ensemble date chaque aire sans compter un chemin : il a
         son propre compte, à côté de ceux des en-têtes et des lignes. */
      jours = markAireReleveCopied(groupe.region.key, 'aucun');
      aires.push(groupe.region.key);
    });
    setReleves(jours);
    /* Le geste d'ensemble se compte à part : l'en-tête dit combien de fois le
       relevé complet est parti, sans additionner les aires une à une. */
    setRelevesTous(markAireRelevesTousCopied(aires));
  };

  /* Le geste du jeton : il bascule le filtre et le retient pour la prochaine
     visite. Il reprend aussi la main sur un fil nommé par la fiche. Sur la
     revue d'un compte, le même clic la referme : la liste redevient entière. */
  const basculerSommeil = () => {
    if (scopeOn) {
      quitterScope();
      return;
    }
    const next = !sleepOnly;
    setSleepOnly(next);
    saveSleepOnly(next);
    setFilNomme(false);
  };

  /* Rien ne filtre quand aucun jeton n'est posé : le bandeau garde alors la
     liste entière, sans phrase pour ne rien dire. La revue d'un compte se
     nomme à la place du filtre en sommeil, puisqu'elle le contient. */
  const filtresActifs = [
    scopeOn
      ? t('ad.msg.revueCompteOn').replace('{n}', scope?.nom || '')
      : sleepOn
        ? t('ad.msg.sleepOnlyOn')
        : '',
    aire ? t('ad.msg.aireOn').replace('{n}', t(`worldRegion.${aire}`)) : '',
    airesTight.length > 0
      ? t('ad.msg.airesTightOn').replace('{n}', String(airesTight.length))
      : '',
    vieillesOnly ? t('ad.msg.vieillesAiresOn') : '',
    restantOn ? t('ad.msg.restantOnlyOn') : '',
    apresOn ? t('ad.msg.apresOnlyOn') : '',
  ].filter(Boolean);

  /* Ce que la gomme de la pastille des aires resserrées va rendre, dit au
     survol : le compte exact d'aires du classeur encore resserrées, et les
     fils qu'elles laissent ensemble dans la boîte — les deux chiffres de la
     pastille, au moment du clic. */
  const gommeAiresTightHint = t('ad.msg.airesTightGommeHintCount')
    .replace('{n}', String(airesTight.length))
    .replace('{fils}', String(filsAiresTight));

  /* Ce que la gomme de la ligne des fils s'apprête à rendre, dit au survol :
     combien d'aires du classeur portent encore une date, combien n'en ont
     jamais eu, les noms de celles qui vont être rendues vierges une à une, et
     que les autres aires de l'appareil restent intactes. */
  const gommeRelevesAiresHint =
    airesTightReleveesListe.length > 0
      ? t('ad.msg.airesTightRelevesGommeHint')
        .replace('{n}', String(airesTight.length))
        .replace('{relevees}', String(airesTightRelevees))
        .replace('{jamais}', String(airesTightJamais))
        .replace(
          '{list}',
          airesTightReleveesListe.map((key) => t(`worldRegion.${key}`)).join(' · '),
        )
      : t('ad.msg.airesTightRelevesGommeHintEmpty').replace(
        '{n}',
        String(airesTight.length),
      );

  /* Ce que la petite gomme de la ligne s'apprête à rendre, dit au survol : le
     nombre de jetons posés et celui des aires resserrées — l'aire retenue
     compte pour une, les aires du classeur pour leur nombre. */
  const airesRendues = (aire ? 1 : 0) + airesTight.length;
  const gommeFiltresHint =
    airesRendues > 0
      ? t('ad.msg.jamaisLineClearHintCount')
        .replace('{chips}', String(filtresActifs.length))
        .replace('{aires}', String(airesRendues))
      : t('ad.msg.jamaisLineClearHint');

  /* La visite en cours, datée sur les mêmes repères de session que le journal
     de la revue : la ligne récapitulative dit combien de temps elle a couru,
     à côté des fils qu'elle a laissés. */
  const visite = resumerVisite(
    revus.map((id) => ({ ouvertAt: ouvertures[id] || '' })),
  );
  const dureeVisite = dureeEnMots(visite.minutes, t);

  /* Sortir de la revue d'un compte : la liste reprend ses conversations, et
     la fiche ne la rappelle pas au prochain rendu. */
  const quitterScope = () => {
    setScope(null);
    onClearRevueCompte?.();
  };

  /* Le geste du jeton « restant à relire » : il ne garde que ce qui n'a pas
     encore été ouvert, et reprend la main sur un fil nommé par la fiche. */
  const basculerRestant = () => {
    setRestantOnly((value) => !value);
    setFilNomme(false);
  };

  /* Le geste de l'en-tête « revue » : il pose l'ordre et le retient pour la
     prochaine visite. Il reprend l'ordre à l'en-tête « après relance », pour
     qu'un seul tri parle à la fois. */
  const basculerRevue = () => {
    const next = !revueFirst;
    setRevueFirst(next);
    saveRevueFirst(next);
    if (next) {
      setApresFirst(false);
      saveApresFirst(false);
      setAireFirst(false);
      saveAireFirst(false);
      setRecentFirst(false);
      saveRecentFirst(false);
      setJamaisFirst(false);
      saveJamaisFirst(false);
      setAncienFirst(false);
      saveAncienFirst(false);
      setGommeFirst(false);
      saveGommeFirst(false);
    }
  };

  /* Le geste de l'en-tête « après relance » : le compte qui a reçu le plus de
     dépôts depuis son message passe en tête, et le choix est retenu pour la
     visite suivante. Il ne s'ajoute pas à celui de la revue. */
  const basculerApres = () => {
    const next = !apresFirst;
    setApresFirst(next);
    saveApresFirst(next);
    if (next) {
      setRevueFirst(false);
      saveRevueFirst(false);
      setAireFirst(false);
      saveAireFirst(false);
      setRecentFirst(false);
      saveRecentFirst(false);
      setJamaisFirst(false);
      saveJamaisFirst(false);
      setAncienFirst(false);
      saveAncienFirst(false);
      setGommeFirst(false);
      saveGommeFirst(false);
    }
  };

  /* Le geste de l'en-tête « par aire » : la liste se range sous le nom de
     chaque aire du monde, et le choix est retenu pour la visite suivante.
     Il reprend l'ordre aux deux autres en-têtes — un seul tri parle à la
     fois. */
  const basculerAireOrdre = () => {
    const next = !aireFirst;
    setAireFirst(next);
    saveAireFirst(next);
    if (next) {
      setRevueFirst(false);
      saveRevueFirst(false);
      setApresFirst(false);
      saveApresFirst(false);
      setRecentFirst(false);
      saveRecentFirst(false);
      setJamaisFirst(false);
      saveJamaisFirst(false);
      setAncienFirst(false);
      saveAncienFirst(false);
      setGommeFirst(false);
      saveGommeFirst(false);
    }
  };

  /* Le geste de l'en-tête « relevé le plus récent » : les aires dont le relevé
     vient de partir de l'appareil passent en tête, la plus fraîche d'abord. Le
     choix est retenu pour la visite suivante, et il reprend l'ordre aux trois
     autres en-têtes — un seul tri parle à la fois. */
  const basculerRecent = () => {
    const next = !recentFirst;
    setRecentFirst(next);
    saveRecentFirst(next);
    if (next) {
      setRevueFirst(false);
      saveRevueFirst(false);
      setApresFirst(false);
      saveApresFirst(false);
      setAireFirst(false);
      saveAireFirst(false);
      setJamaisFirst(false);
      saveJamaisFirst(false);
      setAncienFirst(false);
      saveAncienFirst(false);
      setGommeFirst(false);
      saveGommeFirst(false);
    }
  };

  /* Le geste de l'en-tête « aire jamais relevée d'abord » : les fils des aires
     qu'aucun relevé n'a encore emportées passent en tête, dans l'ordre des
     aires du monde. Le choix est retenu pour la visite suivante, et il reprend
     l'ordre aux quatre autres en-têtes — un seul tri parle à la fois. */
  const basculerJamais = () => {
    const next = !jamaisFirst;
    setJamaisFirst(next);
    saveJamaisFirst(next);
    if (next) {
      setRevueFirst(false);
      saveRevueFirst(false);
      setApresFirst(false);
      saveApresFirst(false);
      setAireFirst(false);
      saveAireFirst(false);
      setRecentFirst(false);
      saveRecentFirst(false);
      setAncienFirst(false);
      saveAncienFirst(false);
    }
  };

  /* Le geste de l'ordre « relevé le plus ancien d'abord », posé sur la ligne
     des fils : les aires dont le relevé attend depuis le plus longtemps
     passent en tête. Le choix est retenu pour la visite suivante, et il
     reprend l'ordre aux cinq autres en-têtes — un seul tri parle à la fois. */
  const basculerAncien = () => {
    const next = !ancienFirst;
    setAncienFirst(next);
    saveAncienFirst(next);
    if (next) {
      setRevueFirst(false);
      saveRevueFirst(false);
      setApresFirst(false);
      saveApresFirst(false);
      setAireFirst(false);
      saveAireFirst(false);
      setRecentFirst(false);
      saveRecentFirst(false);
      setJamaisFirst(false);
      saveJamaisFirst(false);
      setAncienFirst(false);
      saveAncienFirst(false);
      setGommeFirst(false);
      saveGommeFirst(false);
    }
  };

  /* Le geste de l'ordre « gomme la plus récente d'abord », posé sur la ligne
     des fils : les aires que la petite gomme vient de rendre vierges passent en
     tête, la plus récemment effacée d'abord, pour retrouver ce qui vient d'être
     rendu. Le choix est retenu pour la visite suivante, et il reprend l'ordre
     aux six autres en-têtes — un seul tri parle à la fois. */
  const basculerGomme = () => {
    const next = !gommeFirst;
    setGommeFirst(next);
    saveGommeFirst(next);
    if (next) {
      setRevueFirst(false);
      saveRevueFirst(false);
      setApresFirst(false);
      saveApresFirst(false);
      setAireFirst(false);
      saveAireFirst(false);
      setRecentFirst(false);
      saveRecentFirst(false);
      setJamaisFirst(false);
      saveJamaisFirst(false);
      setAncienFirst(false);
      saveAncienFirst(false);
    }
  };

  /* Le geste du jeton « après relance seulement » : il ne garde que les fils
     dont le compte a déposé depuis son message, retient le choix pour la
     visite suivante et reprend la main sur un fil nommé par la fiche. */
  const basculerApresOnly = () => {
    const next = !apresOnly;
    setApresOnly(next);
    saveApresOnly(next);
    setFilNomme(false);
  };

  /* Le rappel de tri de la ligne récapitulative se clique : il éteint l'ordre
     posé et rend à la liste son ordre d'origine. Les jetons et le filtre
     restent où ils sont — on ne retire ici que l'ordre de lecture. */
  const retourOrdreListe = () => {
    setRevueFirst(false);
    saveRevueFirst(false);
    setApresFirst(false);
    saveApresFirst(false);
    setAireFirst(false);
    saveAireFirst(false);
    setRecentFirst(false);
    saveRecentFirst(false);
    setJamaisFirst(false);
    saveJamaisFirst(false);
    setAncienFirst(false);
    saveAncienFirst(false);
    setGommeFirst(false);
    saveGommeFirst(false);
    setGommeAncienneFirst(false);
    saveGommeAncienneFirst(false);
  };

  /* Le geste de l'ordre « gomme la plus ancienne d'abord », posé sur la ligne
     des fils : les aires que la petite gomme a rendues vierges il y a le plus
     longtemps passent en tête, pour retrouver ce qui attend d'être remis à
     neuf. Le choix est retenu pour la visite suivante, et il reprend l'ordre
     aux sept autres en-têtes — un seul tri parle à la fois. */
  const basculerGommeAncienne = () => {
    const next = !gommeAncienneFirst;
    setGommeAncienneFirst(next);
    saveGommeAncienneFirst(next);
    if (next) {
      setRevueFirst(false);
      saveRevueFirst(false);
      setApresFirst(false);
      saveApresFirst(false);
      setAireFirst(false);
      saveAireFirst(false);
      setRecentFirst(false);
      saveRecentFirst(false);
      setJamaisFirst(false);
      saveJamaisFirst(false);
      setAncienFirst(false);
      saveAncienFirst(false);
      setGommeFirst(false);
      saveGommeFirst(false);
    }
  };

  /* Le geste du tri inverse posé sur la ligne récapitulative : il range les
     fils des aires rendues par la gomme du plus frais au plus ancien, puis
     retourne le sens d'un second clic — de la plus ancienne à la plus récente
     —, sans repasser par la barre de tri. Les huit ordres continuent de
     s'exclure : poser celui-ci éteint tous les autres. */
  const basculerGommeRecap = () => {
    /* L'ordre frais d'abord est posé le premier ; s'il parle déjà, le clic
       retourne le sens et lit la plus ancienne d'abord. */
    const versAncienne = gommeFirst;
    setRevueFirst(false);
    saveRevueFirst(false);
    setApresFirst(false);
    saveApresFirst(false);
    setAireFirst(false);
    saveAireFirst(false);
    setRecentFirst(false);
    saveRecentFirst(false);
    setJamaisFirst(false);
    saveJamaisFirst(false);
    setAncienFirst(false);
    saveAncienFirst(false);
    /* Le premier clic lit du plus frais au plus ancien ; le suivant inverse. */
    setGommeFirst(!versAncienne);
    saveGommeFirst(!versAncienne);
    setGommeAncienneFirst(versAncienne);
    saveGommeAncienneFirst(versAncienne);
  };

  /* La petite gomme du jeton : elle efface les trois jetons de la liste —
     sommeil, restant à relire, après relance — et rend la liste entière. Le
     geste est retenu, pour que la visite suivante s'ouvre aussi en entier. */
  const gommerFiltres = () => {
    setSleepOnly(false);
    saveSleepOnly(false);
    setRestantOnly(false);
    setApresOnly(false);
    saveApresOnly(false);
    setAire('');
    setAiresTight([]);
    setVieillesOnly(false);
    setFilNomme(false);
    /* La revue d'un compte nommé s'efface aussi : la liste redevient entière,
       ce que la gomme promet. */
    if (scopeOn) quitterScope();
  };

  /* La petite gomme de la ligne des fils : elle remet à zéro les relevés de
     ces seules aires du classeur — leur date s'oublie, elles quittent le
     carnet des aires emportées d'ensemble —, sans toucher aux autres aires de
     l'appareil, ni au resserrement, ni au compte des gestes d'ensemble. La
     pastille les dit alors à nouveau jamais relevées, et la synthèse du
     classeur comme le nom du fichier suivent la même mémoire. */
  const gommerRelevesAiresTight = () => {
    const rendues = airesTightRelevees;
    const resultat = clearAireRelevesJours(airesTight);
    setReleves(resultat.jours);
    setRelevesTous(resultat.tous);
    setFilNomme(false);
    /* Une gomme qui a réellement rendu des aires vierges se compte, et son
       jour se retient : la pastille des aires du jour le dit ensuite. Les
       aires visées gardent chacune ce jour-là, pour l'ordre « gomme la plus
       récente d'abord ». */
    if (rendues > 0) {
      /* Les fils réellement emportés par ce geste, lus sur la boîte avant
         l’effacement : la pastille les compte ensuite sans les déduire d’une
         boîte qui a pu changer. */
      setGommes(
        markGommesReleves(
          rendues,
          airesTightReleveesListe,
          filsDesAires(airesTightReleveesListe),
        ),
      );
      setGommesAires(readGommesAiresJours());
    }
    setRelevesAiresEffaces(
      t('ad.msg.airesTightRelevesCleared').replace('{n}', String(rendues)),
    );
  };

  /* La petite gomme de la pastille des aires relevées aujourd'hui : elle
     efface la date de relevé de toutes les aires de la boîte, quel que soit
     leur jour — elles redeviennent « jamais relevées », et la synthèse du
     classeur les compte comme telles. Les aires absentes de la boîte, le
     resserrement et le compte des gestes d'ensemble restent tels quels. */
  const gommerAiresJour = () => {
    const cles = airesDeLaBoite.map((region) => region.key);
    const rendues = cles.filter((key) => Boolean(releves[key])).length;
    /* Les fils que la boîte porte dans ces aires, lus avant l’effacement : la
       pastille dit le poids réel du dernier geste. */
    const emportes = filsDesAires(cles);
    if (cles.length === 0) return;
    const resultat = clearAireRelevesJours(cles);
    setReleves(resultat.jours);
    setRelevesTous(resultat.tous);
    setFilNomme(false);
    /* La gomme de la pastille rend elle aussi des aires vierges : elle entre
       au même compte, avec le jour de son geste — et chaque aire effacée
       garde ce jour-là, pour l'ordre « gomme la plus récente d'abord ». */
    if (rendues > 0) {
      setGommes(
        markGommesReleves(
          rendues,
          cles.filter((key) => Boolean(releves[key])) as RegionMondeKey[],
          emportes,
        ),
      );
      setGommesAires(readGommesAiresJours());
    }
    setAiresJourEffaces(
      t('ad.msg.airesJourCleared')
        .replace('{n}', String(rendues))
        .replace('{a}', String(cles.length)),
    );
  };

  /* La petite gomme de la pastille des aires resserrées : elle rend toutes
     les aires du classeur d'un geste — la boîte montre tous ses fils —, sans
     toucher au choix retenu par l'appareil : la mémoire garde les aires, et la
     visite suivante les retrouve. */
  const gommerAiresTight = () => {
    airesTightGomme.current = true;
    setAiresTight([]);
    setFilNomme(false);
  };

  /* La fiche d'un compte peut nommer un fil : la liste reprend toutes les
     conversations pour ne pas le cacher derrière un filtre, sans effacer le
     choix retenu. */
  useEffect(() => {
    if (!focus?.id) return;
    setFilNomme(true);
    setOuverte(focus.id);
  }, [focus]);

  /* La jauge de revue porte un raccourci clavier : la touche N — ou la touche
     J, pour ceux qui ne veulent pas quitter la frappe — ouvre le fil suivant
     sans la souris, comme le bouton de reprise le fait au clic. Le geste ne
     prend jamais la main dans un champ de saisie, ni quand une touche de
     commande est enfoncée — un raccourci de la console ne peut pas voler une
     frappe. */
  const prochainId = premierRestant?.id ?? '';
  /* Le retour : la touche R rouvre le dernier fil relu, comme le bouton de
     reprise au clic — N et J gardent leur geste, ouvrir le fil suivant. */
  const retourId = dernierRevu?.id ?? '';
  useEffect(() => {
    if (!prochainId && !retourId) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const touche = event.key.toLowerCase();
      if (touche !== 'n' && touche !== 'j' && touche !== 'r') return;
      const cible = event.target as HTMLElement | null;
      const tag = (cible?.tagName || '').toLowerCase();
      if (cible?.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select') {
        return;
      }
      const filCible = touche === 'r' ? retourId : prochainId;
      if (!filCible) return;
      event.preventDefault();
      setFilNomme(false);
      setOuverte(filCible);
      /* Le clavier reste dans la carte : les flèches prennent la suite sans
         qu'on ait à cliquer dans la liste. */
      carteRef.current?.focus({ preventScroll: true });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prochainId, retourId]);

  /* La touche d'échappement referme le fil ouvert : la liste reprend toute
     la colonne, sans avoir à retrouver la ligne du fil pour la quitter. Le
     geste ne prend jamais la main dans un champ de saisie, et il ne fait rien
     quand aucun fil n'est ouvert — la carte garde alors son calme. */
  useEffect(() => {
    if (!ouverte) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const cible = event.target as HTMLElement | null;
      const tag = (cible?.tagName || '').toLowerCase();
      if (cible?.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select') {
        return;
      }
      event.preventDefault();
      setFilNomme(false);
      setOuverte('');
      carteRef.current?.focus({ preventScroll: true });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ouverte]);

  /* Les flèches haut et bas déplacent dans la liste elle-même : la touche N
     ouvre le fil suivant, les flèches passent d'un fil à l'autre dans l'ordre
     affiché. Le pas s'arrête aux deux bouts plutôt que de boucler, et il
     respecte le filtre comme le tri : on ne saute jamais dans un fil que la
     liste ne montre pas. */
  const deplacerFil = (pas: number) => {
    if (listeAffichee.length < 2) return;
    const ici = listeAffichee.findIndex((row) => row.id === ouverte);
    const suite = ici < 0 ? (pas > 0 ? 0 : listeAffichee.length - 1) : ici + pas;
    if (suite < 0 || suite >= listeAffichee.length) return;
    setFilNomme(false);
    setOuverte(listeAffichee[suite].id);
  };

  /* Ouvrir un fil dormant pendant la visite le marque comme relu : la revue
     sait ainsi ce qui reste à voir. Un fil vif n'est jamais marqué, et un fil
     déjà marqué ne l'est pas deux fois. */
  useEffect(() => {
    if (!ouverte || !pacesReady || !enSommeil(paces[ouverte])) return;
    setRevus(marquerRevu(ouverte));
    setOuvertures(readOuvertures());
  }, [ouverte, paces, pacesReady]);

  useEffect(() => {
    if (!ouverte) {
      setFil(null);
      return;
    }
    let alive = true;
    setLoading(true);
    setError('');
    const load = async () => {
      try {
        const { data, error: failure } = await supabase.functions.invoke('admin-console', {
          body: { action: 'thread', conversationId: ouverte },
        });
        const answer = data as ({ ok?: boolean } & Partial<Thread>) | null;
        if (failure || !answer?.ok || !answer.conversation) {
          if (alive) setError(t('ad.msg.err'));
          return;
        }
        if (alive) {
          setFil({
            conversation: answer.conversation,
            messages: Array.isArray(answer.messages) ? answer.messages : [],
            membres: Array.isArray(answer.membres) ? answer.membres : [],
          });
        }
      } catch {
        if (alive) setError(t('ad.msg.err'));
      } finally {
        if (alive) setLoading(false);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [ouverte, t]);

  const nomDe = (id: string) => {
    const row = rows.find((entry) => entry.id === ouverte);
    const membre = fil?.membres.find((entry) => entry.id === id);
    if (membre?.nom) return membre.nom;
    if (row) {
      if (row.user_a === id && row.nom_a) return row.nom_a;
      if (row.user_b === id && row.nom_b) return row.nom_b;
    }
    return id.slice(0, 8);
  };

  const corps = (row: AdminConversation) =>
    `\n\n— ${row.sujet ?? ''}\n${row.last_message ?? ''}`;

  /* Les participants qui sont de vrais comptes : un lien vers la fiche
     accompagne le fil ouvert, sans le fermer ni le quitter. Un participant
     sans compte n'a rien à ouvrir et ne produit donc aucun lien. */
  const comptesLiees = (() => {
    if (!fil || !compteDe) return [] as AdminCompteRef[];
    const ids = [fil.conversation.user_a, fil.conversation.user_b].filter(
      (id): id is string => Boolean(id),
    );
    const vus = new Set<string>();
    const out: AdminCompteRef[] = [];
    ids.forEach((id) => {
      const membre = fil.membres.find((entry) => entry.id === id);
      const compte = compteDe(id, membre?.email ?? null);
      if (!compte || vus.has(compte.id)) return;
      vus.add(compte.id);
      out.push(compte);
    });
    return out;
  })();

  /* Une ligne de fil : son nom, sa date, sa nature, son aperçu et son rythme,
     puis la porte qui l'ouvre tel que le compte le voit. La ligne est écrite
     une seule fois, qu'elle se lise à la suite ou sous le nom d'une aire. */
  const ligne = (row: AdminConversation) => {
    const dormant = enSommeil(paces[row.id]);
    const revu = dormant && revusSet.has(row.id);
    /* L'aire du fil, lue sur le pays de son compte : la pastille situe la
       ligne sans remonter au compte du groupe. Un fil sans pays connu n'en
       porte pas — elle ne s'invente pas. */
    const regionFil = regionDe(row);
    return (
      <li key={row.id} className="admin-thread-item">
        <button
          type="button"
          className="admin-thread"
          data-on={ouverte === row.id ? 'yes' : 'no'}
          data-revu={revu ? 'yes' : 'no'}
          aria-pressed={ouverte === row.id}
          onClick={() => setOuverte(row.id)}
        >
          <span className="admin-thread-top">
            <b>{etiquette(row)}</b>
            <em>{jour(row.last_at ?? row.created_at, lang)}</em>
          </span>
          {row.sujet && <span className="admin-thread-subject">{row.sujet}</span>}
          <span className="admin-thread-last">
            {row.last_message || t('ad.msg.none')}
          </span>
          {dormant && (
            <span className="admin-thread-sleep" title={t('ad.msg.sleepHint')}>
              <i className="ri-moon-line" aria-hidden="true"></i>
              {replyGapLabel(paces[row.id], t)}
            </span>
          )}
          {revu && (
            <span className="admin-thread-revu" title={t('ad.msg.reviewHint')}>
              <i className="ri-check-double-line" aria-hidden="true"></i>
              {t('ad.msg.reviewedOne')}
            </span>
          )}
        </button>
        {/* Le pied de la ligne : la pastille de l'aire du fil, qui resserre la
            boîte sur elle d'un appui et emporte son relevé d'un appui long,
            puis la porte qui ouvre la conversation telle que le compte la
            voit. Les deux gestes se tiennent à côté du bouton de la ligne,
            pour ne jamais se voler le clic. */}
        <div className="admin-thread-foot">
          {regionFil ? (
            <AireCopyPill
              region={regionFil}
              active={aire === regionFil.key}
              hint={`${t('ad.msg.threadAireHoldHint').replace(
                '{region}',
                t(`worldRegion.${regionFil.key}`),
              )} — ${cheminDeAire(regionFil.key)}`}
              build={() => buildReleveAire(regionFil.key)}
              onToggle={() => basculerAire(regionFil.key)}
              onCopied={() => {
                /* L'appui long part d'une ligne : son relevé se compte à part de
                   ceux qui partent d'un en-tête de groupe. */
                setReleves(markAireReleveCopied(regionFil.key, 'ligne'));
                setRelevesChemins(readAireRelevesChemins());
              }}
            />
          ) : null}
          <Link
            to={`/messages?c=${row.id}`}
            target="_blank"
            rel="noreferrer"
            className="admin-thread-open"
            title={`${t('ad.msg.openThreadHint')} · /messages?c=${row.id}`}
          >
            <i className="ri-external-link-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('ad.msg.openThread')}</span>
          </Link>
        </div>
      </li>
    );
  };

  return (
    <section
      className="admin-card admin-inbox"
      ref={carteRef}
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        const cible = event.target as HTMLElement | null;
        const tag = (cible?.tagName || '').toLowerCase();
        if (
          cible?.isContentEditable ||
          tag === 'input' ||
          tag === 'textarea' ||
          tag === 'select'
        ) {
          return;
        }
        if (listeAffichee.length < 2) return;
        /* Le geste ne vaut que dans la carte : ailleurs, les flèches gardent
           le défilement de la page. */
        event.preventDefault();
        deplacerFil(event.key === 'ArrowDown' ? 1 : -1);
      }}
    >
      <div className="admin-card-head">
        <div>
          <p className="admin-stamp">{t('ad.msg.stamp')}</p>
          <p className="admin-sub">{t('ad.msg.sub')}</p>
        </div>
        <div className="admin-inbox-tags">
          {/* La revue d'un compte nommé par sa fiche : la liste le dit, et la
              croix la rend entière sans effacer les jetons retenus. */}
          {scopeOn && scope && (
            <span
              className="admin-badge admin-scope-badge"
              data-tone="ok"
              title={t('ad.msg.revueCompteHint')}
            >
              <i className="ri-account-pin-box-line" aria-hidden="true"></i>
              <span className="admin-scope-word">{t('ad.msg.revueCompte')}</span>
              <span className="admin-scope-who" title={scope.nom}>
                {scope.nom}
              </span>
              <button
                type="button"
                className="admin-revue-clear"
                title={t('ad.msg.revueCompteClear')}
                aria-label={t('ad.msg.revueCompteClear')}
                onClick={quitterScope}
              >
                <i className="ri-close-line" aria-hidden="true"></i>
              </button>
            </span>
          )}
          {dormants > 0 && (
            <span
              className="admin-badge admin-revue-badge"
              data-tone="ok"
              title={t('ad.msg.reviewGaugeHint')}
            >
              <i className="ri-eye-line" aria-hidden="true"></i>
              <span className="admin-revue-count">
                {revusDormants} / {dormants}
              </span>
              <span className="admin-revue-words">{t('ad.msg.reviewed')}</span>
              <span className="admin-revue-track" aria-hidden="true">
                <span className="admin-revue-fill" style={{ width: `${partRevue}%` }}></span>
              </span>
              {revusDormants > 0 && (
                <button
                  type="button"
                  className="admin-revue-clear"
                  title={t('ad.msg.reviewClearHint')}
                  aria-label={t('ad.msg.reviewClearHint')}
                  onClick={() => {
                    setRevus(oublierRevus());
                    setOuvertures({});
                  }}
                >
                  <i className="ri-eraser-line" aria-hidden="true"></i>
                </button>
              )}
            </span>
          )}
          {reprise && (
            <span className="admin-revue-resume-wrap">
            <button
              type="button"
              className="admin-badge admin-revue-resume"
              data-tone="accent"
              data-back={dernierRevu ? 'yes' : 'no'}
              title={`${t('ad.msg.reviewResumeHint')} · ${t('ad.msg.reviewResumeKeyHint')}`}
              aria-label={`${t(
                dernierRevu ? 'ad.msg.reviewResumeLast' : 'ad.msg.reviewResume',
              )} · ${etiquette(reprise)}`}
              onClick={() => {
                setFilNomme(false);
                setOuverte(reprise.id);
              }}
            >
              <i
                className={dernierRevu ? 'ri-history-line' : 'ri-play-circle-line'}
                aria-hidden="true"
              ></i>
              <span className="admin-revue-resume-word">{t('ad.msg.reviewResume')}</span>
              <span className="admin-revue-resume-who">{etiquette(reprise)}</span>
              {/* L'avancement en clair : « 2 sur 5 » dit combien de fils
                  dormants ont été relus sur le total, avant même d'ouvrir le
                  suivant. */}
              <span
                className="admin-revue-resume-count"
                title={t('ad.msg.reviewGaugeHint')}
              >
                {t('ad.msg.reviewResumeProgress')
                  .replace('{done}', String(revusDormants))
                  .replace('{total}', String(dormants))}
              </span>
              <kbd className="admin-revue-resume-key" title={t('ad.msg.reviewResumeKeyHint')}>
                N
              </kbd>
              <kbd className="admin-revue-resume-key" title={t('ad.msg.reviewResumeKeyHint')}>
                J
              </kbd>
              {/* La touche du retour : elle ramène au dernier fil relu, quand
                  N et J ouvrent le suivant. */}
              {dernierRevu && (
                <kbd
                  className="admin-revue-resume-key"
                  title={t('ad.msg.reviewResumeBackKeyHint')}
                >
                  R
                </kbd>
              )}
            </button>
            {/* Sous le bouton, depuis quand la revue s'est arrêtée sur ce
                fil : le retour se mesure avant le clic. */}
            {dernierRevu && depuisTexte && (
              <button
                type="button"
                className="admin-revue-resume-since"
                title={`${t('ad.msg.reviewResumeSinceHint')} · ${etiquette(dernierRevu)}`}
                aria-label={`${t('ad.msg.reviewResumeLast')} · ${etiquette(dernierRevu)}`}
                onClick={() => {
                  setFilNomme(false);
                  setOuverte(dernierRevu.id);
                }}
              >
                <i className="ri-time-line" aria-hidden="true"></i>
                {t('ad.msg.reviewResumeSince').replace('{ago}', depuisTexte)}
              </button>
            )}
            </span>
          )}
          {(dormants > 0 || sleepOnly) && (
            <span
              className="admin-badge admin-count-btn admin-sleep-btn"
              data-tone="warn"
              data-on={sleepOn ? 'yes' : 'no'}
              title={t('ad.msg.sleepOnlyHint')}
            >
              <button
                type="button"
                className="admin-sleep-toggle"
                aria-pressed={sleepOn}
                onClick={basculerSommeil}
              >
                <i className="ri-moon-line" aria-hidden="true"></i>
                {sleepOn ? t('ad.msg.sleepOnly') : `${dormants} ${t('ad.msg.sleeping')}`}
              </button>
              {sleepOn && (
                <button
                  type="button"
                  className="admin-revue-clear"
                  title={t('ad.msg.apresClearHint')}
                  aria-label={t('ad.msg.apresClearHint')}
                  onClick={gommerFiltres}
                >
                  <i className="ri-eraser-line" aria-hidden="true"></i>
                </button>
              )}
            </span>
          )}
          {(dormants > 0 || restantOn) &&
            (restants === 0 && !restantOn ? (
              <span
                className="admin-badge admin-restant-done"
                data-tone="ok"
                title={t('ad.msg.restantNoneHint')}
              >
                <i className="ri-check-double-line" aria-hidden="true"></i>
                {t('ad.msg.restantAllDone')}
              </span>
            ) : (
              <button
                type="button"
                className="admin-badge admin-count-btn admin-restant-btn"
                data-tone={restantOn ? 'warn' : 'ok'}
                data-on={restantOn ? 'yes' : 'no'}
                aria-pressed={restantOn}
                title={t('ad.msg.restantHint')}
                onClick={basculerRestant}
              >
                <i
                  className={restantOn ? 'ri-filter-off-line' : 'ri-filter-3-line'}
                  aria-hidden="true"
                ></i>
                {restantOn ? t('ad.msg.restantOnly') : `${restants} ${t('ad.msg.restant')}`}
              </button>
            ))}
          {(avecApres > 0 || apresOnly) && (
            <span
              className="admin-badge admin-count-btn admin-apres-btn"
              data-tone={apresOn ? 'warn' : 'accent'}
              data-on={apresOn ? 'yes' : 'no'}
              title={t('ad.msg.apresOnlyHint')}
            >
              <button
                type="button"
                className="admin-apres-toggle"
                aria-pressed={apresOn}
                aria-label={
                  apresOn && premierApres
                    ? `${t('ad.msg.apresOnly')} · ${etiquette(premierApres)}`
                    : undefined
                }
                onClick={basculerApresOnly}
              >
                <i
                  className={apresOn ? 'ri-filter-off-line' : 'ri-mail-check-line'}
                  aria-hidden="true"
                ></i>
                {apresOn ? t('ad.msg.apresOnly') : `${avecApres} ${t('ad.msg.apres')}`}
                {apresOn && premierApres && (
                  <span className="admin-apres-who" title={etiquette(premierApres)}>
                    {etiquette(premierApres)}
                  </span>
                )}
              </button>
              {apresOnly && (
                <button
                  type="button"
                  className="admin-revue-clear"
                  title={t('ad.msg.apresClearHint')}
                  aria-label={t('ad.msg.apresClearHint')}
                  onClick={gommerFiltres}
                >
                  <i className="ri-eraser-line" aria-hidden="true"></i>
                </button>
              )}
            </span>
          )}
          {/* Les aires de la boîte qu'aucun relevé n'a encore emportées : la
              pastille dit combien, son survol les nomme une à une, et chaque
              appui resserre la boîte sur la première d'entre elles — puis sur
              la suivante, appui après appui. */}
          {airesDeLaBoite.length > 0 &&
            (airesJamaisRelevees.length > 0 && aireJamaisSuivante ? (
              <button
                type="button"
                className="admin-badge admin-aires-jamais admin-aires-jamais-btn"
                data-tone="accent"
                data-on={
                  airesJamaisRelevees.some((region) => region.key === aire)
                    ? 'yes'
                    : 'no'
                }
                aria-pressed={airesJamaisRelevees.some((region) => region.key === aire)}
                title={t('ad.msg.airesJamaisOpenHint')
                  .replace('{n}', String(airesJamaisRelevees.length))
                  .replace('{region}', t(`worldRegion.${aireJamaisSuivante.key}`))
                  .replace(
                    '{list}',
                    airesJamaisRelevees
                      .map((region) => t(`worldRegion.${region.key}`))
                      .join(' · '),
                  )}
                onClick={ouvrirAireJamais}
              >
                <i className="ri-map-pin-time-line" aria-hidden="true"></i>
                <b>{airesJamaisRelevees.length}</b>
                <span className="admin-aires-jamais-word">
                  {t('ad.msg.airesJamaisWords')}
                </span>
                {/* La porte nomme l'aire qu'elle ouvrira : le geste se lit
                    avant le clic, sans survol. */}
                <span className="admin-aires-jamais-next">
                  <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
                  {t(`worldRegion.${aireJamaisSuivante.key}`)}
                </span>
              </button>
            ) : (
              <span
                className="admin-badge admin-aires-jamais"
                data-tone="ok"
                title={t('ad.msg.airesJamaisNoneHint')}
              >
                <i className="ri-check-double-line" aria-hidden="true"></i>
                <span className="admin-aires-jamais-word">
                  {t('ad.msg.airesJamaisNone')}
                </span>
              </span>
            ))}
          {/* Les aires de la boîte dont le relevé porte la date du jour : la
              pastille les compte comme la synthèse du classeur les compte, et
              son survol nomme les fils qu’elles ont emportés, un à un. Sa
              petite gomme efface la date de toutes les aires de la boîte,
              quel que soit leur jour. */}
          {airesReleveesJour.length > 0 && (
            <span
              className="admin-badge admin-aires-jamais admin-aires-jour"
              data-tone="ok"
              title={airesJourHint}
            >
              <i className="ri-file-copy-2-line" aria-hidden="true"></i>
              <b>{airesReleveesJour.length}</b>
              <span className="admin-aires-jamais-word">
                {t('ad.msg.airesJourWords')}
              </span>
              <span className="admin-aires-jamais-next" title={airesJourDetail}>
                {t('ad.msg.airesJourFils').replace(
                  '{n}',
                  String(filsAiresJourTotal),
                )}
              </span>
              {/* Ce que les gommes des relevés ont rendu depuis cet appareil :
                  le nombre de gestes et le jour du dernier, à côté de la
                  pastille qu'elles vident. */}
              {gommes.count > 0 && (
                <span className="admin-gommes-tally" title={gommesHint}>
                  <i className="ri-eraser-line" aria-hidden="true"></i>
                  {gommesTally}
                </span>
              )}
              {/* Les fils que la dernière gomme a réellement emportés : le
                  geste dit son poids à côté de son nombre, sur la même
                  pastille. */}
              {gommes.count > 0 && gommes.fils > 0 && (
                <span
                  className="admin-gommes-tally admin-gommes-fils"
                  title={gommesFilsHint}
                >
                  <i className="ri-links-line" aria-hidden="true"></i>
                  {t('ad.msg.gommesFils').replace('{n}', String(gommes.fils))}
                </span>
              )}
              {/* Le partage des aires rendues par la dernière gomme, posé sur
                  la pastille : celles qui restent dans la boîte, puis celles
                  qui en sont parties — les deux chiffres se lisent sans
                  survol, le survol les nommant une à une. */}
              {gommes.count > 0 && (
                <span className="admin-gommes-split" title={gommesSplitHint}>
                  <span className="admin-gommes-split-part admin-gommes-split-encore">
                    {t('ad.msg.gommesEncore').replace(
                      '{n}',
                      String(gommesAiresEncore.length),
                    )}
                  </span>
                  <span
                    className="admin-gommes-split-part admin-gommes-split-parties"
                    data-zero={gommesAiresParties.length === 0 ? 'yes' : 'no'}
                  >
                    {t('ad.msg.gommesParties').replace(
                      '{n}',
                      String(gommesAiresParties.length),
                    )}
                  </span>
                  <span
                    className="admin-gommes-split-bouts"
                    title={gommesSplitBoutsHint}
                  >
                    {gommesSplitBouts}
                  </span>
                </span>
              )}
              <button
                type="button"
                className="admin-revue-clear"
                title={gommeAiresJourHint}
                aria-label={gommeAiresJourHint}
                onClick={gommerAiresJour}
              >
                <i className="ri-eraser-line" aria-hidden="true"></i>
              </button>
            </span>
          )}
          {/* La pastille des aires du jour disparaît quand la gomme a tout
              rendu : le compte des gommes reste alors seul, avec le jour de
              son dernier geste, pour que l'effacement ne s'oublie pas. */}
          {gommes.count > 0 && airesReleveesJour.length === 0 && (
            <span
              className="admin-badge admin-aires-jamais admin-gommes-pill"
              data-tone="soft"
              title={gommesHint}
            >
              <i className="ri-eraser-line" aria-hidden="true"></i>
              <b>{gommes.count}</b>
              <span className="admin-aires-jamais-word">
                {t('ad.msg.gommesWords')}
              </span>
              <span className="admin-aires-jamais-next">
                {t('ad.msg.gommesLast').replace(
                  '{date}',
                  jourCopie(gommes.last, lang),
                )}
              </span>
              {gommes.fils > 0 && (
                <span
                  className="admin-gommes-tally admin-gommes-fils"
                  title={gommesFilsHint}
                >
                  <i className="ri-links-line" aria-hidden="true"></i>
                  {t('ad.msg.gommesFils').replace('{n}', String(gommes.fils))}
                </span>
              )}
              {/* La pastille qui survit à la gomme porte le même partage :
                  ce qui reste dans la boîte et ce qui l'a quittée, côte à
                  côte, sans survol. */}
              <span className="admin-gommes-split" title={gommesSplitHint}>
                <span className="admin-gommes-split-part admin-gommes-split-encore">
                  {t('ad.msg.gommesEncore').replace(
                    '{n}',
                    String(gommesAiresEncore.length),
                  )}
                </span>
                <span
                  className="admin-gommes-split-part admin-gommes-split-parties"
                  data-zero={gommesAiresParties.length === 0 ? 'yes' : 'no'}
                >
                  {t('ad.msg.gommesParties').replace(
                    '{n}',
                    String(gommesAiresParties.length),
                  )}
                </span>
                <span
                  className="admin-gommes-split-bouts"
                  title={gommesSplitBoutsHint}
                >
                  {gommesSplitBouts}
                </span>
              </span>
            </span>
          )}
          {/* Le jeton des aires relevées il y a plus de sept jours : il compte
              les aires dont le dernier relevé date de plus d'une semaine, les
              nomme au survol, et ne garde que leurs fils d'un clic. Un second
              clic rend la liste entière. */}
          {(airesVieilles.length > 0 || vieillesOnly) && (
            <button
              type="button"
              className="admin-badge admin-count-btn admin-vieilles-btn"
              data-tone={vieillesOnly ? 'warn' : 'accent'}
              data-on={vieillesOnly ? 'yes' : 'no'}
              aria-pressed={vieillesOnly}
              title={t('ad.msg.vieillesAiresHint')
                .replace('{n}', String(airesVieilles.length))
                .replace('{fils}', String(filsVieilles))
                .replace(
                  '{list}',
                  airesVieilles
                    .map((region) => t(`worldRegion.${region.key}`))
                    .join(' · ') || t('ad.msg.vieillesAiresNone'),
                )}
              onClick={() => {
                setVieillesOnly((value) => !value);
                setFilNomme(false);
              }}
            >
              <i
                className={vieillesOnly ? 'ri-filter-off-line' : 'ri-time-line'}
                aria-hidden="true"
              ></i>
              {vieillesOnly
                ? t('ad.msg.vieillesAiresOnly')
                : `${airesVieilles.length} ${t('ad.msg.vieillesAires')}`}
              {/* Le compte des fils que le jeton laisse dans la liste se lit
                  juste à côté de celui des aires : les deux chiffres disent
                  ensemble ce que le geste retient. */}
              <span className="admin-vieilles-fils">
                {t('ad.msg.vieillesAiresFils').replace('{n}', String(filsVieilles))}
              </span>
            </button>
          )}
          <span className="admin-badge" data-tone="accent">
            {rows.length} {t('ad.stat.fils')}
          </span>
          {/* La gomme des deux chemins dit, juste après le clic, le nombre de
              gestes qu'elle vient d'effacer : le compte retombe à zéro, la
              phrase garde ce qui est parti. */}
          {/* La gomme des relevés d'ensemble dit, juste après le clic, ce
              qu'elle vient d'oublier : les gestes et les aires, avant que le
              compte de l'en-tête ne retombe à zéro. */}
          {relevesTousEffaces && (
            <span
              className="admin-badge admin-releves-cleared"
              data-tone="ok"
              role="status"
              title={t('ad.msg.relevesAllClearedHint')}
            >
              <i className="ri-eraser-line" aria-hidden="true"></i>
              {relevesTousEffaces}
            </span>
          )}
          {cheminsEffaces && (
            <span
              className="admin-badge admin-releves-cleared"
              data-tone="ok"
              role="status"
              title={t('ad.msg.relevesCheminsClearedHint')}
            >
              <i className="ri-eraser-line" aria-hidden="true"></i>
              {cheminsEffaces}
            </span>
          )}
          {/* La gomme de la ligne des fils dit, juste après le clic, combien
              d'aires du classeur viennent d'être rendues vierges. */}
          {relevesAiresEffaces && (
            <span
              className="admin-badge admin-releves-cleared"
              data-tone="ok"
              role="status"
              title={t('ad.msg.airesTightRelevesClearedHint')}
            >
              <i className="ri-eraser-line" aria-hidden="true"></i>
              {relevesAiresEffaces}
            </span>
          )}
          {/* La gomme de la pastille des aires relevées aujourd'hui dit, juste
              après le clic, combien d'aires de la boîte viennent de perdre
              leur date. */}
          {airesJourEffaces && (
            <span
              className="admin-badge admin-releves-cleared"
              data-tone="ok"
              role="status"
              title={t('ad.msg.airesJourClearedHint')}
            >
              <i className="ri-eraser-line" aria-hidden="true"></i>
              {airesJourEffaces}
            </span>
          )}
          {/* Le geste de l'en-tête : il emporte les fils de chaque aire à la
              suite, un titre par aire — le relevé de chaque groupe, réuni en
              un seul message, sans ouvrir les groupes un par un. */}
          {visibles.length > 0 && (dormants > 0 || avecApres > 0 || rows.length > 1) && (
            <>
              <CopyTextButton
                className="admin-aire-group-copy admin-releves-all"
                label={t('ad.msg.relevesAll')}
                hint={t('ad.msg.relevesAllHint')
                  .replace('{n}', String(visibles.length))
                  .replace('{a}', String(groupesReleve.length))}
                build={buildReleves}
                onCopied={daterReleves}
              />
              {/* Le compte du geste d'ensemble : combien de fois le relevé de
                  toutes les aires est parti, combien d'aires distinctes ont
                  quitté la boîte, et le jour de la dernière fois. La petite
                  gomme remet ce compte à zéro sans toucher aux dates des
                  groupes. */}
              {(relevesTous.count > 0 ||
                relevesChemins.entetes + relevesChemins.lignes > 0) && (
                <span
                  className="admin-badge admin-releves-tally"
                  data-tone="ok"
                  title={t('ad.msg.relevesAllCountHint').replace(
                    '{date}',
                    jourCopie(relevesTous.last, lang),
                  )}
                >
                  {relevesTous.count > 0 && (
                    <>
                      <i className="ri-file-copy-line" aria-hidden="true"></i>
                      <b>{relevesTous.count}</b>
                      <span className="admin-releves-tally-word">
                        {t('ad.msg.relevesAllCount')}
                      </span>
                    </>
                  )}
                  {relevesTous.aires.length > 0 && (
                    <span
                      className="admin-releves-tally-aires"
                      title={t('ad.msg.relevesAllAiresHint')
                        .replace('{n}', String(relevesTous.aires.length))
                        .replace(
                          '{list}',
                          relevesTous.aires
                            .map((key) => t(`worldRegion.${key}`))
                            .join(' · '),
                        )}
                    >
                      <i className="ri-map-2-line" aria-hidden="true"></i>
                      {t('ad.msg.relevesAllAires').replace(
                        '{n}',
                        String(relevesTous.aires.length),
                      )}
                    </span>
                  )}
                  {/* Les relevés d'une seule aire, séparés selon leur chemin :
                      partis de l'en-tête d'un groupe, ou emportés d'un appui
                      long sur la pastille d'un fil. Deux gestes, deux
                      chiffres — le relevé d'ensemble garde le sien. */}
                  {relevesChemins.entetes + relevesChemins.lignes > 0 && (
                    <span
                      className="admin-releves-tally-chemins"
                      title={t('ad.msg.relevesCheminsHint')
                        .replace('{h}', String(relevesChemins.entetes))
                        .replace('{l}', String(relevesChemins.lignes))}
                    >
                      <span className="admin-releves-tally-chemin">
                        <i className="ri-layout-top-line" aria-hidden="true"></i>
                        {t('ad.msg.relevesCheminsEntete').replace(
                          '{n}',
                          String(relevesChemins.entetes),
                        )}
                      </span>
                      <span className="admin-releves-tally-chemin">
                        <i className="ri-cursor-line" aria-hidden="true"></i>
                        {t('ad.msg.relevesCheminsLigne').replace(
                          '{n}',
                          String(relevesChemins.lignes),
                        )}
                      </span>
                      {/* La gomme des deux chemins : elle remet les deux
                          comptes à zéro sans toucher aux dates des groupes,
                          et son survol dit ce qui part. */}
                      <button
                        type="button"
                        className="admin-revue-clear"
                        title={gommeCheminsHint}
                        aria-label={gommeCheminsHint}
                        onClick={() => {
                          /* Le nombre de gestes est lu avant l'effacement : la
                             phrase dit ce qui vient de partir, pas un zéro. */
                          const effaces =
                            relevesChemins.entetes + relevesChemins.lignes;
                          setRelevesChemins(clearAireRelevesChemins());
                          setCheminsEffaces(
                            t('ad.msg.relevesCheminsCleared').replace(
                              '{n}',
                              String(effaces),
                            ),
                          );
                        }}
                      >
                        <i className="ri-eraser-line" aria-hidden="true"></i>
                      </button>
                    </span>
                  )}
                  <em className="admin-releves-tally-last">
                    {jourCopie(relevesTous.last, lang)
                      ? t('ad.msg.relevesAllLast').replace(
                        '{date}',
                        jourCopie(relevesTous.last, lang),
                      )
                      : ''}
                  </em>
                  {relevesTous.count > 0 && (
                    <button
                      type="button"
                      className="admin-revue-clear"
                      title={gommeRelevesHint}
                      aria-label={gommeRelevesHint}
                      onClick={() => {
                        /* Le nombre de gestes et d'aires est lu avant
                           l'effacement : la phrase garde ce qui vient
                           d'être oublié, pas un zéro. */
                        const gestes = relevesTous.count;
                        const aires = relevesTous.aires.length;
                        setRelevesTous(clearAireRelevesTousCopies());
                        setRelevesTousEffaces(
                          t('ad.msg.relevesAllCleared')
                            .replace('{n}', String(gestes))
                            .replace('{a}', String(aires)),
                        );
                      }}
                    >
                      <i className="ri-eraser-line" aria-hidden="true"></i>
                    </button>
                  )}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="admin-empty">
          <i className={scopeOn ? 'ri-user-star-line' : 'ri-chat-3-line'} aria-hidden="true"></i>
          {scopeOn ? t('ad.msg.revueCompteEmpty') : t('ad.msg.empty')}
        </p>
      ) : (
        <div className="admin-inbox-grid">
          <div className="admin-inbox-list">
            {(dormants > 0 || avecApres > 0 || rows.length > 1) && (
              <div className="admin-inbox-sort" role="group" aria-label={t('ad.msg.sortLabel')}>
                <span className="admin-muted">{t('ad.msg.sortLabel')}</span>
                {listeAffichee.length > 1 && (
                  <span className="admin-inbox-keys" title={t('ad.msg.listKeyHint')}>
                    <kbd className="admin-revue-resume-key">↑</kbd>
                    <kbd className="admin-revue-resume-key">↓</kbd>
                  </span>
                )}
                {/* La touche Échap se rappelle à côté des flèches : le geste
                    se découvre même sans fil ouvert. Elle s'allume quand il y
                    a quelque chose à refermer, sans jamais disparaître. */}
                <span
                  className="admin-inbox-keys admin-inbox-esc"
                  data-on={ouverte ? 'yes' : 'no'}
                  title={t('ad.msg.sortEscHint')}
                >
                  <kbd className="admin-revue-resume-key">{t('ad.msg.closeKeyName')}</kbd>
                  <span className="whitespace-nowrap">{t('ad.msg.closeKey')}</span>
                </span>
                {dormants > 0 && (
                  <button
                    type="button"
                    className="admin-sort"
                    data-on={revueFirst ? 'yes' : 'no'}
                    aria-pressed={revueFirst}
                    aria-label={
                      revueFirst && teteRevue
                        ? `${t('ad.msg.sortReview')} · ${etiquette(teteRevue)}`
                        : undefined
                    }
                    title={t('ad.msg.sortReviewHint')}
                    onClick={basculerRevue}
                  >
                    <i
                      className={revueFirst ? 'ri-sort-desc' : 'ri-arrow-up-down-line'}
                      aria-hidden="true"
                    ></i>
                    {t('ad.msg.sortReview')}
                    {revueFirst && restants > 0 && <b>{restants}</b>}
                    {revueFirst && teteRevue && (
                      <span className="admin-sort-who" title={etiquette(teteRevue)}>
                        {etiquette(teteRevue)}
                      </span>
                    )}
                  </button>
                )}
                {avecApres > 0 && (
                  <button
                    type="button"
                    className="admin-sort"
                    data-on={apresFirst ? 'yes' : 'no'}
                    aria-pressed={apresFirst}
                    aria-label={
                      apresFirst && premierApres
                        ? `${t('ad.msg.sortApres')} · ${etiquette(premierApres)}`
                        : undefined
                    }
                    title={t('ad.msg.sortApresHint')}
                    onClick={basculerApres}
                  >
                    <i
                      className={apresFirst ? 'ri-sort-desc' : 'ri-arrow-up-down-line'}
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">{t('ad.msg.sortApres')}</span>
                    {apresFirst && <b>{avecApres}</b>}
                    {apresFirst && premierApres && (
                      <span className="admin-sort-who" title={etiquette(premierApres)}>
                        {etiquette(premierApres)}
                      </span>
                    )}
                  </button>
                )}
                {/* Le troisième ordre : les fils rangés sous le nom de chaque
                    aire du monde, au lieu de se suivre. */}
                {rows.length > 1 && (
                  <button
                    type="button"
                    className="admin-sort"
                    data-on={aireFirst ? 'yes' : 'no'}
                    aria-pressed={aireFirst}
                    title={t('ad.msg.sortAireHint')}
                    onClick={basculerAireOrdre}
                  >
                    <i
                      className={aireFirst ? 'ri-sort-desc' : 'ri-map-2-line'}
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">{t('ad.msg.sortAire')}</span>
                    {aireFirst && <b>{groupes.length}</b>}
                  </button>
                )}
                {/* Le quatrième ordre : les aires dont le relevé vient de
                    quitter la boîte passent en tête, la plus fraîche d'abord.
                    Le bouton n'apparaît qu'une fois un relevé parti, et reste
                    sous la main tant que l'ordre est posé. */}
                {(Object.keys(releves).length > 0 || recentFirst) && (
                  <button
                    type="button"
                    className="admin-sort"
                    data-on={recentFirst ? 'yes' : 'no'}
                    aria-pressed={recentFirst}
                    aria-label={
                      recentFirst && premierRecent
                        ? `${t('ad.msg.sortRecent')} · ${etiquette(premierRecent)}`
                        : undefined
                    }
                    title={t('ad.msg.sortRecentHint')}
                    onClick={basculerRecent}
                  >
                    <i
                      className={recentFirst ? 'ri-sort-desc' : 'ri-time-line'}
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">{t('ad.msg.sortRecent')}</span>
                    {recentFirst && <b>{Object.keys(releves).length}</b>}
                    {recentFirst && premierRecent && (
                      <span className="admin-sort-who" title={etiquette(premierRecent)}>
                        {etiquette(premierRecent)}
                      </span>
                    )}
                  </button>
                )}
                {/* Le cinquième ordre : les fils des aires qu'aucun relevé n'a
                    encore emportées passent en tête, dans l'ordre des aires
                    du monde. Le bouton n'apparaît que quand une telle aire
                    demeure dans la boîte, et reste sous la main tant que
                    l'ordre est posé. */}
                {(airesJamaisRelevees.length > 0 || jamaisFirst) && (
                  <button
                    type="button"
                    className="admin-sort"
                    data-on={jamaisFirst ? 'yes' : 'no'}
                    aria-pressed={jamaisFirst}
                    aria-label={
                      jamaisFirst && premierJamais
                        ? `${t('ad.msg.sortJamais')} · ${etiquette(premierJamais)}`
                        : undefined
                    }
                    title={t('ad.msg.sortJamaisHint')}
                    onClick={basculerJamais}
                  >
                    <i
                      className={jamaisFirst ? 'ri-sort-desc' : 'ri-map-pin-time-line'}
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">{t('ad.msg.sortJamais')}</span>
                    {jamaisFirst && <b>{airesJamaisRelevees.length}</b>}
                    {jamaisFirst && premierJamais && (
                      <span className="admin-sort-who" title={etiquette(premierJamais)}>
                        {etiquette(premierJamais)}
                      </span>
                    )}
                  </button>
                )}
                {/* Le septième ordre : les aires que la petite gomme vient de
                    rendre vierges passent en tête, la plus récemment effacée
                    d'abord. Le bouton n'apparaît qu'une fois une gomme
                    passée, et reste sous la main tant que l'ordre est posé. */}
                {(Object.keys(gommesAires).length > 0 || gommeFirst) && (
                  <button
                    type="button"
                    className="admin-sort"
                    data-on={gommeFirst ? 'yes' : 'no'}
                    aria-pressed={gommeFirst}
                    aria-label={
                      gommeFirst && premierGomme
                        ? `${t('ad.msg.sortGomme')} · ${etiquette(premierGomme)}`
                        : t('ad.msg.sortGomme')
                    }
                    title={t('ad.msg.sortGommeHint')}
                    onClick={basculerGomme}
                  >
                    <i
                      className={gommeFirst ? 'ri-sort-desc' : 'ri-eraser-line'}
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">{t('ad.msg.sortGomme')}</span>
                    {gommeFirst && <b>{Object.keys(gommesAires).length}</b>}
                    {gommeFirst && premierGomme && (
                      <span className="admin-sort-who" title={etiquette(premierGomme)}>
                        {etiquette(premierGomme)}
                      </span>
                    )}
                  </button>
                )}
                {/* Le huitième ordre, l'inverse du septième : les aires que
                    la petite gomme a rendues vierges il y a le plus longtemps
                    passent en tête. Le bouton n'apparaît qu'une fois une
                    gomme passée, et reste sous la main tant que l'ordre est
                    posé. */}
                {(Object.keys(gommesAires).length > 0 || gommeAncienneFirst) && (
                  <button
                    type="button"
                    className="admin-sort"
                    data-on={gommeAncienneFirst ? 'yes' : 'no'}
                    aria-pressed={gommeAncienneFirst}
                    aria-label={
                      gommeAncienneFirst && premierGommeAncienne
                        ? `${t('ad.msg.sortGommeAncienne')} · ${etiquette(
                            premierGommeAncienne,
                          )}`
                        : t('ad.msg.sortGommeAncienne')
                    }
                    title={t('ad.msg.sortGommeAncienneHint')}
                    onClick={basculerGommeAncienne}
                  >
                    <i
                      className={gommeAncienneFirst ? 'ri-sort-asc' : 'ri-eraser-line'}
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">
                      {t('ad.msg.sortGommeAncienne')}
                    </span>
                    {gommeAncienneFirst && <b>{Object.keys(gommesAires).length}</b>}
                    {gommeAncienneFirst && premierGommeAncienne && (
                      <span
                        className="admin-sort-who"
                        title={etiquette(premierGommeAncienne)}
                      >
                        {etiquette(premierGommeAncienne)}
                      </span>
                    )}
                  </button>
                )}
              </div>
            )}
            {/* Sous la barre de tri, en une ligne discrète : l'appui long sur
                une pastille d'aire emporte son relevé, l'appui court ne fait
                que resserrer la boîte. Le geste se découvre sans survol. */}
            {listeAffichee.some((row) => Boolean(regionDe(row))) && (
              <p className="admin-inbox-hold" title={t('ad.msg.aireHoldNoteHint')}>
                <i className="ri-cursor-line" aria-hidden="true"></i>
                {t('ad.msg.aireHoldNote')}
              </p>
            )}
            {/* Sous le tri « relevé le plus récent », la ligne dit combien
                d'aires jamais relevées ferment la liste, et les nomme : le
                compte se lit avant de descendre jusqu'à elles. */}
            {recentFirst && (
              <p
                className="admin-inbox-jamais"
                data-zero={airesJamaisRelevees.length === 0 ? 'yes' : 'no'}
                title={t('ad.msg.recentJamaisLineHint')}
              >
                <i
                  className={
                    airesJamaisRelevees.length > 0
                      ? 'ri-map-pin-time-line'
                      : 'ri-check-double-line'
                  }
                  aria-hidden="true"
                ></i>
                <span>
                  {airesJamaisRelevees.length > 0
                    ? t('ad.msg.recentJamaisLine')
                        .replace('{n}', String(airesJamaisRelevees.length))
                        .replace(
                          '{list}',
                          airesJamaisRelevees
                            .map((region) => t(`worldRegion.${region.key}`))
                            .join(' · '),
                        )
                    : t('ad.msg.recentJamaisLineNone')}
                </span>
              </p>
            )}
            {/* Sous le tri « aire jamais relevée d'abord », la ligne dit ce
                qu'il laisse en tête : le nombre de fils et celui des aires,
                puis les aires elles-mêmes, dans l'ordre du monde. */}
            {jamaisFirst && (
              <p
                className="admin-inbox-jamais"
                data-zero={filsJamaisTete === 0 ? 'yes' : 'no'}
                title={t('ad.msg.jamaisLineHint')}
              >
                <i
                  className={
                    filsJamaisTete > 0 ? 'ri-map-pin-time-line' : 'ri-check-double-line'
                  }
                  aria-hidden="true"
                ></i>
                <span>
                  {filsJamaisTete > 0
                    ? t('ad.msg.jamaisLine')
                        .replace('{f}', String(filsJamaisTete))
                        .replace('{a}', String(airesJamaisTete.length))
                        .replace(
                          '{list}',
                          airesJamaisTete
                            .map((key) => t(`worldRegion.${key}`))
                            .join(' · '),
                        )
                    : t('ad.msg.jamaisLineNone')}
                </span>
                {/* La petite gomme de la ligne : elle rend la liste entière
                    d'un geste — les jetons et le resserrement sur une aire
                    s'effacent, l'ordre de lecture reste posé. */}
                {filtresActifs.length > 0 && (
                  <button
                    type="button"
                    className="admin-revue-clear admin-inbox-jamais-clear"
                    title={gommeFiltresHint}
                    aria-label={gommeFiltresHint}
                    onClick={gommerFiltres}
                  >
                    <i className="ri-eraser-line" aria-hidden="true"></i>
                  </button>
                )}
              </p>
            )}
            {/* Sous l’ordre « gomme la plus récente d’abord », la ligne nomme
                les aires que la petite gomme a rendues vierges, la plus
                récemment effacée en tête, chacune avec son jour : ce qui vient
                d’être rendu se relit sans ouvrir la boîte. */}
            {gommeFirst && gommesAiresListe.length > 0 && (
              <p className="admin-inbox-jamais" title={t('ad.msg.gommeLineHint')}>
                <i className="ri-eraser-line" aria-hidden="true"></i>
                <span>{gommeLine}</span>
              </p>
            )}
            {/* Sous l'ordre « gomme la plus ancienne d'abord », la ligne
                nomme les aires rendues il y a le plus longtemps, la plus
                anciennement effacée en tête, chacune avec son jour : ce qui
                attend d'être remis à neuf se relit sans ouvrir la boîte. */}
            {gommeAncienneFirst && gommesAiresListeAncienne.length > 0 && (
              <p
                className="admin-inbox-jamais"
                title={t('ad.msg.gommeAncienneLineHint')}
              >
                <i className="ri-eraser-line" aria-hidden="true"></i>
                <span>{gommeAncienneLine}</span>
              </p>
            )}
            {(filtresActifs.length > 0 ||
              revueFirst ||
              apresFirst ||
              aireFirst ||
              recentFirst ||
              jamaisFirst ||
              visite.relus > 0 ||
              ancienFirst ||
              gommeFirst ||
              gommeAncienneFirst) && (
              <p
                className="admin-inbox-note"
                title={filtresActifs.length > 0 ? t('ad.msg.filtersHint') : t('ad.msg.sortRecapHint')}
              >
                <i
                  className={filtresActifs.length > 0 ? 'ri-filter-3-line' : 'ri-arrow-up-down-line'}
                  aria-hidden="true"
                ></i>
                {filtresActifs.length > 0 && (
                  <span className="admin-inbox-note-list">{filtresActifs.join(' · ')}</span>
                )}
                {/* Le compte des jetons posés, dit comme dans la synthèse du
                    classeur : la ligne se lit d'un coup d'œil, sans énumérer
                    les filtres un par un. */}
                {filtresActifs.length > 0 && (
                  <span
                    className="admin-inbox-note-count admin-inbox-note-chips"
                    title={t('ad.msg.chipCountHint')}
                  >
                    {filtresActifs.length === 1
                      ? t('ad.msg.chipOne')
                      : t('ad.msg.chipMany').replace('{n}', String(filtresActifs.length))}
                  </span>
                )}
                {/* L'ordre de lecture se lit à côté des jetons : le tri actif
                    nomme l'ordre qu'il impose, et le compte qui ouvre la
                    marche quand il y en a un. Le rappel se clique : un clic
                    éteint l'ordre et rend la liste à son ordre d'origine. */}
                {(revueFirst ||
                  apresFirst ||
                  aireFirst ||
                  recentFirst ||
                  jamaisFirst ||
                  ancienFirst ||
                  gommeFirst ||
                  gommeAncienneFirst) && (
                  <button
                    type="button"
                    className="admin-inbox-note-count admin-inbox-note-sort admin-inbox-note-sort-btn"
                    title={t('ad.msg.sortRecapBackHint')}
                    aria-label={t('ad.msg.sortRecapBack')}
                    onClick={retourOrdreListe}
                  >
                    <i className="ri-sort-desc" aria-hidden="true"></i>
                    {t('ad.msg.sortLabel')} ·{' '}
                    {revueFirst
                      ? t('ad.msg.sortReview')
                      : apresFirst
                        ? t('ad.msg.sortApres')
                        : recentFirst
                          ? t('ad.msg.sortRecent')
                          : jamaisFirst
                            ? t('ad.msg.sortJamais')
                            : ancienFirst
                              ? t('ad.msg.sortAncien')
                              : gommeFirst
                                ? t('ad.msg.sortGomme')
                                : gommeAncienneFirst
                                  ? t('ad.msg.sortGommeAncienne')
                                  : t('ad.msg.sortAire')}
                    {aireFirst ? (
                      <span className="admin-inbox-note-sort-who">
                        {t('ad.msg.sortAireGroups').replace('{n}', String(groupes.length))}
                      </span>
                    ) : (() => {
                      const tete = revueFirst
                        ? teteRevue
                        : recentFirst
                          ? premierRecent
                          : jamaisFirst
                            ? premierJamais
                            : ancienFirst
                              ? premierAncien
                              : gommeFirst
                                ? premierGomme
                                : gommeAncienneFirst
                                  ? premierGommeAncienne
                                  : premierApres;
                      return tete ? (
                        <span className="admin-inbox-note-sort-who" title={etiquette(tete)}>
                          {etiquette(tete)}
                        </span>
                      ) : null;
                    })()}
                    <i className="ri-close-line admin-inbox-note-sort-back" aria-hidden="true"></i>
                  </button>
                )}
                <span className="admin-inbox-note-count">
                  {visibles.length} {t('ad.stat.fils')}
                </span>
                {dormants > 0 && (
                  <span className="admin-inbox-note-count">
                    {revusDormants} / {dormants} {t('ad.msg.reviewed')}
                  </span>
                )}
                {/* La durée de la visite, posée dans la ligne : elle se lit
                    avec les filtres et l’avancement, sans ouvrir le journal
                    ni télécharger de classeur. */}
                {visite.relus > 0 && dureeVisite && (
                  <span className="admin-inbox-note-count" title={t('ad.msg.visitLengthHint')}>
                    <i className="ri-timer-line" aria-hidden="true"></i>{' '}
                    {t('ad.msg.visitLength')} · {dureeVisite}
                  </span>
                )}
                {/* Un seul « effacer » ferme la ligne : il éteint les trois
                    jetons de la liste et rend toutes les conversations, sans
                    aller les décrocher un par un. */}
                {filtresActifs.length > 0 && (
                  <button
                    type="button"
                    className="admin-inbox-note-clear"
                    title={t('ad.msg.apresClearHint')}
                    onClick={gommerFiltres}
                  >
                    <i className="ri-eraser-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">{t('ad.msg.clearAll')}</span>
                  </button>
                )}
              </p>
            )}
            {/* Le tri inverse de la ligne récapitulative : posé sous elle, sur
                toute sa largeur, il range les aires rendues par la gomme du
                plus frais au plus ancien, et retourne le sens d'un second
                clic — sans repasser par la barre de tri. */}
            {gommesAiresListe.length > 0 && (
              <button
                type="button"
                className="admin-gomme-recap"
                data-on={gommeFirst || gommeAncienneFirst ? 'yes' : 'no'}
                aria-pressed={gommeFirst || gommeAncienneFirst}
                title={recapGommeHint}
                onClick={basculerGommeRecap}
              >
                <i
                  className={gommeAncienneFirst ? 'ri-sort-asc' : 'ri-sort-desc'}
                  aria-hidden="true"
                ></i>
                <span className="admin-gomme-recap-word">
                  {t('ad.msg.recapGomme')}
                </span>
                <span className="admin-gomme-recap-sens">{recapGommeSens}</span>
                {/* L'aire effacée le plus récemment, nommée sur la jauge
                    elle-même : le geste le plus frais se lit au-dessus de la
                    ligne des aires parties, sans survol. */}
                {gommeRecapTete && (
                  <span
                    className="admin-gomme-recap-tete"
                    title={t('ad.msg.recapGommeTeteHint')}
                  >
                    {gommeRecapTeteTexte}
                  </span>
                )}
                <b>{gommesAiresListe.length}</b>
              </button>
            )}
            {/* Sous le tri inverse, une ligne discrète nomme les aires rendues
                par la gomme qui ne sont plus dans la boîte, la plus
                récemment effacée en tête, chacune avec le jour de son dernier
                geste : le geste se relit aussi sur ce qui a quitté la liste. */}
            {(gommeFirst || gommeAncienneFirst) && (
              <p
                className="admin-inbox-jamais admin-gomme-hors"
                data-zero={gommesAiresParties.length === 0 ? 'yes' : 'no'}
                title={t('ad.msg.gommeHorsLineHint')}
              >
                <i
                  className={
                    gommesAiresParties.length > 0
                      ? 'ri-links-line'
                      : 'ri-check-double-line'
                  }
                  aria-hidden="true"
                ></i>
                <span>
                  {gommesAiresParties.length > 0
                    ? gommeHorsLine
                    : t('ad.msg.gommeHorsLineNone')}
                </span>
                {/* La liste des aires parties se copie d'ici, prête à coller
                    dans un message : une entrée, puis chaque aire avec le
                    jour de son geste. */}
                {gommesAiresParties.length > 0 && (
                  <CopyTextButton
                    className="admin-aire-group-copy admin-gomme-hors-copy"
                    label={t('ad.msg.gommeHorsCopy')}
                    hint={t(
                      horsAncienneFirst
                        ? 'ad.msg.gommeHorsCopyHintAncienne'
                        : 'ad.msg.gommeHorsCopyHint',
                    ).replace('{n}', String(gommesAiresParties.length))}
                    build={buildGommeHors}
                  />
                )}
                {/* Le sens de la ligne se retourne d'un clic : les départs les
                    plus anciens passent en tête, pour les relire dans l'ordre
                    où ils sont arrivés. */}
                {gommesAiresParties.length > 1 && (
                  <button
                    type="button"
                    className="admin-gomme-hors-sort"
                    data-on={horsAncienneFirst ? 'yes' : 'no'}
                    aria-pressed={horsAncienneFirst}
                    title={gommeHorsSortHint}
                    onClick={basculerHorsSens}
                  >
                    <i
                      className={horsAncienneFirst ? 'ri-sort-asc' : 'ri-sort-desc'}
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">
                      {t('ad.msg.gommeHorsSort')}
                    </span>
                  </button>
                )}
              </p>
            )}
            {/* L'aire retenue, dite en clair au-dessus de la liste : la boîte
                ne montre que les fils dont un participant s'y tient, et le
                geste pour rendre tous les fils reste sous la main. */}
            {/* Les aires nommées par le classeur, dites au-dessus de la liste :
                la boîte ne montre que leurs fils, et la croix la rend
                entière sans toucher au choix retenu par l'appareil. */}
            {airesTight.length > 0 && (
              <p
                className="admin-aire-tray"
                title={t('ad.msg.airesTightHint')
                  .replace('{n}', String(airesTight.length))
                  .replace('{jamais}', String(airesTightJamais))
                  .replace('{fils}', String(filsAiresTight))
                  .replace(
                    '{list}',
                    airesTight.map((key) => t(`worldRegion.${key}`)).join(' · '),
                  )}
              >
                <span className="admin-aire-tray-pill">
                  <i className="ri-map-pin-time-line" aria-hidden="true"></i>
                  <b>
                    {t('ad.msg.airesTightTitle').replace(
                      '{n}',
                      String(airesTight.length),
                    )}
                  </b>
                  {/* Chaque aire nommée garde son dernier relevé sous le
                      curseur : le survol dit le jour où ses fils sont partis
                      pour la dernière fois, ou qu'elle n'a jamais été
                      relevée. */}
                  <span className="admin-aire-tray-names">
                    {airesTight.map((key) => {
                      const jourReleve = releves[key] ?? 0;
                      const filsIci = filsParAireTight.get(key) ?? 0;
                      return (
                        <span
                          key={key}
                          className="admin-aire-tray-name"
                          title={
                            jourReleve
                              ? t('ad.msg.airesTightAireJourFils')
                                  .replace('{region}', t(`worldRegion.${key}`))
                                  .replace('{n}', String(filsIci))
                                  .replace('{date}', jourCopie(jourReleve, lang))
                              : t('ad.msg.airesTightAireJamaisFils')
                                  .replace('{region}', t(`worldRegion.${key}`))
                                  .replace('{n}', String(filsIci))
                          }
                        >
                          {t(`worldRegion.${key}`)}
                        </span>
                      );
                    })}
                  </span>
                  <span>
                    {visibles.length === 1
                      ? t('ad.msg.aireGroupOne')
                      : t('ad.msg.aireGroupCount').replace('{n}', String(visibles.length))}
                  </span>
                  {/* Le tri de la ligne des fils : les aires dont le relevé
                      attend depuis le plus longtemps passent en tête, pour
                      retrouver ce qui patiente sans remonter la liste. Un
                      second clic revient à l'ordre de la liste. */}
                  <button
                    type="button"
                    className="admin-chip admin-aire-tray-sort"
                    data-on={ancienFirst ? 'yes' : 'no'}
                    aria-pressed={ancienFirst}
                    aria-label={
                      ancienFirst && premierAncien
                        ? `${t('ad.msg.sortAncien')} · ${etiquette(premierAncien)}`
                        : t('ad.msg.sortAncien')
                    }
                    title={sortAncienHint}
                    onClick={basculerAncien}
                  >
                    <i
                      className={ancienFirst ? 'ri-sort-asc' : 'ri-arrow-up-down-line'}
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">{t('ad.msg.sortAncien')}</span>
                    {ancienFirst && premierAncien && (
                      <span className="admin-sort-who" title={etiquette(premierAncien)}>
                        {etiquette(premierAncien)}
                      </span>
                    )}
                  </button>
                  {/* La petite gomme de la ligne des fils : elle remet à zéro
                      les relevés de ces seules aires, sans rendre la boîte ni
                      oublier le choix retenu par l'appareil. */}
                  <button
                    type="button"
                    className="admin-revue-clear"
                    title={gommeRelevesAiresHint}
                    aria-label={gommeRelevesAiresHint}
                    onClick={gommerRelevesAiresTight}
                  >
                    <i className="ri-eraser-line" aria-hidden="true"></i>
                  </button>
                </span>
                {/* La petite gomme : elle rend toutes les aires du classeur
                    d'un geste, sans toucher au choix retenu par l'appareil —
                    la mémoire garde les aires, la boîte se rouvre entière. */}
                <button
                  type="button"
                  className="admin-chip"
                  title={gommeAiresTightHint}
                  aria-label={gommeAiresTightHint}
                  onClick={gommerAiresTight}
                >
                  <i className="ri-eraser-line" aria-hidden="true"></i>
                  <span className="whitespace-nowrap">{t('ad.msg.airesTightGomme')}</span>
                </button>
              </p>
            )}
            {/* Sous la ligne des fils, la jauge du tri « relevé le plus ancien
                d'abord » : l'écart de jours se lit sans survol. */}
            {ancienFirst && ecartReleves && (
              <p
                className="admin-ancien-jauge"
                title={ancienJaugeHint}
              >
                <span className="admin-ancien-jauge-head">
                  <i className="ri-sort-asc" aria-hidden="true"></i>
                  {t('ad.msg.ancienJaugeLabel')}
                </span>
                <span className="admin-ancien-jauge-track" aria-hidden="true">
                  <span
                    className="admin-ancien-jauge-fill"
                    style={{ width: `${partEcartReleves}%` }}
                  ></span>
                </span>
                <span className="admin-ancien-jauge-span">{ancienJaugeSpan}</span>
              </p>
            )}
            {aire && (
              <p className="admin-aire-tray">
                <span className="admin-aire-tray-pill">
                  <i className="ri-filter-3-line" aria-hidden="true"></i>
                  <b>{t(`worldRegion.${aire}`)}</b>
                  <span>
                    {visibles.length === 1
                      ? t('ad.msg.aireGroupOne')
                      : t('ad.msg.aireGroupCount').replace('{n}', String(visibles.length))}
                  </span>
                  {/* L'étendue de l'aire retenue, à côté de son compte de
                      fils : combien de pays et de fiches elle couvre. */}
                  {regionRetenue && (
                    <span
                      className="admin-aire-tray-span"
                      title={t('ad.msg.aireTraySpanHint').replace(
                        '{region}',
                        t(`worldRegion.${aire}`),
                      )}
                    >
                      {t('ad.msg.aireTraySpan')
                        .replace('{pays}', String(regionRetenue.pays.length))
                        .replace('{files}', String(fichesDesPays(regionRetenue.pays)))
                        .replace('{unit}', t('cmaps.airesChipFiles'))}
                    </span>
                  )}
                </span>
                <button type="button" className="admin-chip" onClick={() => setAire('')}>
                  <i className="ri-close-line" aria-hidden="true"></i>
                  <span className="whitespace-nowrap">{t('ad.msg.aireClear')}</span>
                </button>
              </p>
            )}
            {visibles.length === 0 ? (
              <p className="admin-empty">
                <i
                  className={
                    vieillesOnly
                      ? 'ri-time-line'
                      : restantOn
                        ? 'ri-check-double-line'
                        : apresOn
                          ? 'ri-mail-check-line'
                          : 'ri-moon-line'
                  }
                  aria-hidden="true"
                ></i>
                {vieillesOnly
                  ? t('ad.msg.vieillesAiresEmpty')
                  : restantOn && !scopeOn
                    ? t('ad.msg.restantEmpty')
                    : apresOn
                      ? t('ad.msg.apresEmpty')
                      : scopeOn
                        ? t('ad.msg.revueCompteEmpty')
                        : sleepOn
                          ? t('ad.msg.sleepNone')
                          : t('ad.msg.empty')}
              </p>
            ) : (
              <ul className="admin-threads">
                {aireFirst
                  ? groupes.map((groupe) => {
                      const region = groupe.region;
                      const dernier = region ? releves[region.key] : undefined;
                      return (
                        <Fragment key={groupe.cle}>
                          {/* Le nom de l'aire, une fois, au-dessus de ses fils :
                              il resserre la boîte sur cette seule aire, et le
                              compte qui suit dit son poids et la date du
                              dernier relevé parti. */}
                          <li className="admin-aire-group">
                            {/* Une vraie aire est une porte ; le groupe des
                                interlocuteurs sans pays reste un simple
                                titre, pour ne pas promettre un geste qui ne
                                mène nulle part. */}
                            {region ? (
                              <button
                                type="button"
                                className="admin-aire-group-title"
                                data-on={aire === groupe.cle ? 'yes' : 'no'}
                                aria-pressed={aire === groupe.cle}
                                title={t('ad.msg.aireGroupTitleHint')}
                                onClick={() => basculerAire(region.key)}
                              >
                                <i className="ri-map-2-line" aria-hidden="true"></i>
                                <b>{groupe.libelle}</b>
                              </button>
                            ) : (
                              <span className="admin-aire-group-title" data-static="yes">
                                <i className="ri-question-line" aria-hidden="true"></i>
                                <b>{groupe.libelle}</b>
                              </span>
                            )}
                            <span
                              className="admin-aire-group-count"
                              title={region
                                ? t('ad.msg.aireGroupCountHint')
                                  .replace('{region}', groupe.libelle)
                                  .replace('{pays}', String(region.pays.length))
                                  .replace('{files}', String(fichesDesPays(region.pays)))
                                  .replace('{unit}', t('cmaps.airesChipFiles'))
                                  .replace('{n}', String(groupe.rows.length))
                                : undefined}
                            >
                              {groupe.rows.length === 1
                                ? t('ad.msg.aireGroupOne')
                                : t('ad.msg.aireGroupCount').replace(
                                    '{n}',
                                    String(groupe.rows.length),
                                  )}
                              {dernier ? (
                                <em
                                  className="admin-aire-group-last"
                                  title={t('ad.msg.aireGroupLastCopyHint').replace(
                                    '{region}',
                                    groupe.libelle,
                                  )}
                                >
                                  <i className="ri-file-copy-line" aria-hidden="true"></i>
                                  {t('ad.msg.aireGroupLastCopy').replace(
                                    '{date}',
                                    jourCopie(dernier, lang),
                                  )}
                                </em>
                              ) : null}
                            </span>
                            {region ? (
                              <CopyTextButton
                                className="admin-aire-group-copy"
                                label={t('ad.msg.aireGroupCopy')}
                                hint={t('ad.msg.aireGroupCopyHint')
                                  .replace('{region}', groupe.libelle)
                                  .replace('{n}', String(groupe.rows.length))}
                                build={() => buildReleve(groupe)}
                                onCopied={() => {
                                  setReleves(
                                    markAireReleveCopied(region.key, 'entete'),
                                  );
                                  setRelevesChemins(readAireRelevesChemins());
                                }}
                              />
                            ) : null}
                          </li>
                          {groupe.rows.map((row) => ligne(row))}
                        </Fragment>
                      );
                    })
                  : listeAffichee.map((row) => ligne(row))}
              </ul>
            )}
          </div>

          <div className="admin-thread-pane">
            {!ouverte ? (
              <p className="admin-empty">
                <i className="ri-arrow-left-line" aria-hidden="true"></i>
                {t('ad.msg.pick')}
              </p>
            ) : loading ? (
              <p className="admin-empty">
                <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
                {t('ad.msg.loading')}
              </p>
            ) : error ? (
              <p className="admin-empty" data-tone="off">
                <i className="ri-error-warning-line" aria-hidden="true"></i>
                {error}
              </p>
            ) : (
              <>
                <div className="admin-thread-members">
                  <span className="admin-muted">{t('ad.msg.participants')}</span>
                  {/* La touche qui referme le fil se lit dans l'en-tête du
                      fil ouvert : le geste s'apprend sans notice, et il ne
                      s'affiche que quand il a quelque chose à fermer. */}
                  <span className="admin-thread-esc" title={t('ad.msg.closeKeyHint')}>
                    <kbd className="admin-revue-resume-key">{t('ad.msg.closeKeyName')}</kbd>
                    <span className="whitespace-nowrap">{t('ad.msg.closeKey')}</span>
                  </span>
                  {fil?.membres.map((membre) => (
                    <a
                      key={membre.id}
                      className="admin-member"
                      href={`mailto:${membre.email ?? ''}`}
                      title={t('ad.msg.copyMail')}
                    >
                      <i className="ri-mail-line" aria-hidden="true"></i>
                      {membre.nom || membre.email || membre.id.slice(0, 8)}
                    </a>
                  ))}
                </div>

                {comptesLiees.length > 0 && onOpenCompte && (
                  <div className="admin-thread-links">
                    {comptesLiees.map((compte) => (
                      <button
                        key={compte.id}
                        type="button"
                        className="admin-member admin-member-btn"
                        title={t('ad.msg.openCompteHint')}
                        onClick={() => onOpenCompte(compte.id, compte.email)}
                      >
                        <i className="ri-user-star-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">
                          {t('ad.msg.openCompte')} · {compte.nom}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {fil?.messages.length === 0 ? (
                  <p className="admin-empty">
                    <i className="ri-chat-off-line" aria-hidden="true"></i>
                    {t('ad.msg.none')}
                  </p>
                ) : (
                  <ul className="admin-bubbles">
                    {fil?.messages.map((message) => (
                      <li key={message.id} className="admin-bubble">
                        <span className="admin-bubble-head">
                          <b>{nomDe(message.sender_id)}</b>
                          <em>{jour(message.created_at, lang)}</em>
                        </span>
                        <p className="admin-bubble-body">{message.corps}</p>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="admin-reply">
                  <p className="admin-reply-note">
                    <i className="ri-information-line" aria-hidden="true"></i>
                    {t('ad.msg.replyNote')}
                  </p>
                  {fil && (
                    <div className="admin-reply-actions">
                      {fil.membres
                        .filter((membre) => membre.email)
                        .map((membre) => (
                          <a
                            key={membre.id}
                            className="admin-btn"
                            href={`mailto:${membre.email}?subject=${encodeURIComponent(
                              fil.conversation.sujet ?? '',
                            )}&body=${encodeURIComponent(corps(fil.conversation))}`}
                          >
                            <i className="ri-mail-send-line" aria-hidden="true"></i>
                            <span className="whitespace-nowrap">
                              {t('ad.msg.reply')} · {membre.nom || membre.email}
                            </span>
                          </a>
                        ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}