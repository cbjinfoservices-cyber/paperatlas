import { useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import CopyTextButton from '@/components/feature/CopyTextButton';
import SharedEraseCount from './SharedEraseCount';
import type { SharedLimit, SharedSeparator } from './mineSharedCopy';

type Props = {
  /** Le nombre de valeurs partagées prêtes à partir. */
  values: number;
  /** La longueur de la ligne courte, séparateur compris. */
  chars: number;
  /** Le seuil retenu dans l'aperçu : la phrase dit sous quelle mesure elle a
   *  été lue, pour ne jamais citer une longueur sans son cadre. */
  limit: SharedLimit;
  /** La langue vers laquelle la pastille emporte le relevé, en mots. */
  langName: string;
  /** Ce que la pastille « Copier en … » a déjà emporté dans cette langue. */
  otherTaken: number;
  /** Ce que la pastille compacte a déjà emporté. */
  compactTaken: number;
  /** Combien de fois ce récapitulatif est déjà parti de cet appareil. */
  copied: number;
  /** L'instant exact du dernier geste de cette gomme : son survol en tire le
   *  nombre de jours pendant lesquels elle n'a plus servi. */
  erasedLastAt?: string;
  /** Le signe posé entre les valeurs de la ligne courte : la phrase copiée le
   *  cite, pour qu'on sache d'elle-même comment les valeurs sont jointes. */
  sep: SharedSeparator;
  /** Le dernier séparateur réellement parti, le jour et la longueur de cet
   *  envoi : la phrase les cite, pour comparer deux envois d'un coup d'œil. */
  sepUsed: { sep: SharedSeparator; day: string; chars: number } | null;
  /** L'aperçu est-il rangé en ce moment ? La phrase copiée le dit, pour qu'un
   *  collègue comprenne pourquoi le texte long n'est pas sous les yeux. */
  folded: boolean;
  /** Le nombre de valeurs au-delà duquel l'aperçu se range de lui-même : le
   *  repli se nomme avec son seuil, jamais comme une panne. */
  foldAt: number;
  /** La rangée des valeurs est-elle rangée en ce moment ? La phrase le dit
   *  avec le nombre de valeurs qu'elle garde à l'écran. */
  listFolded: boolean;
  /** Le nombre de valeurs que la rangée repliée garde à l'écran : le repli se
   *  nomme avec ce qu'il laisse voir, jamais comme une perte. */
  listFoldAt: number;
  /** Combien de fois la gomme des replis a servi : la phrase copiée le cite,
   *  pour qu'un collègue sache d'où vient l'état de la ligne. */
  foldsErased: number;
  /** Le jour du dernier geste de la gomme des replis, déjà mis en forme. */
  foldsErasedDay: string;
  /** La date du plus ancien geste de gomme encore en mémoire, déjà mise en
   *  forme : la phrase copiée la cite, pour qu’un collègue sache depuis quand
   *  la ligne porte la trace des gestes. */
  oldestEraseDay: string;
  /** Le temps cumulé que les valeurs restées hors de la rangée repliée y ont
   *  passé, déjà mis en mots ; vide quand la rangée est ouverte. La phrase
   *  copiée le cite, pour qu’un collègue sache combien de temps la ligne
   *  tient ses valeurs de côté. */
  asideAgo: string;
  /** La valeur restée le plus longtemps hors de la rangée repliée, nommée ;
   *  vide quand la rangée est ouverte. La phrase copiée la cite, pour qu’un
   *  collègue sache laquelle la ligne garde de côté le plus longtemps. */
  asideLongest?: string;
  /** Les filtres que la dernière porte de gomme ouverte a rendus, nommés un
   *  par un ; vide tant qu’aucune porte n’a été ouverte. La phrase copiée les
   *  cite, pour qu’un collègue sache quelle étendue la porte a rendue. */
  doorFilters?: string;
  /** Les portes de gomme ouvertes depuis le début, tous comptes confondus :
   *  la phrase copiée le cite, pour qu’un collègue sache d’où vient l’état de
   *  la ligne. */
  doorOpens?: number;
  /** Les deux valeurs les plus lourdes restées hors de la rangée, nommées, et
   *  le compte de dépôts qu’elles y tiennent ensemble : la phrase copiée le
   *  cite, pour qu’un collègue sache ce que ces deux valeurs pèsent. */
  asideTwoNames?: string;
  asideTwoDeposits?: number;
  /** La part du temps cumulé hors écran que ces deux valeurs représentent,
   *  en pourcentage : la phrase copiée la cite, pour qu’un collègue sache
   *  quel poids elles ont sur la ligne entière. */
  asideTwoShare?: number;
  /** Les trois valeurs les plus lourdes restées hors de la rangée, nommées, et
   *  le compte de dépôts qu’elles y tiennent ensemble : la phrase copiée le
   *  cite, pour qu’un collègue sache ce que ces trois valeurs pèsent. */
  asideThreeNames?: string;
  asideThreeDeposits?: number;
  /** Les valeurs que les trois plus lourdes laissent encore de côté, nommées :
   *  la phrase copiée les cite, pour qu’un collègue sache ce que l’ouverture
   *  des trois laisse dehors. */
  asideThreeLeft?: string;
  /** La part du temps cumulé hors écran que ces trois valeurs représentent,
   *  en pourcentage : la phrase copiée la cite, pour qu’un collègue sache
   *  quel poids elles ont sur la ligne entière. */
  asideThreeShare?: number;
  /** Le détail des dépôts par rubrique laissée de côté, un nom avec son
   *  compte chacun : la phrase copiée le cite, pour qu’un collègue sache ce
   *  que chaque rubrique pèse, jamais un total seul. */
  asideLeftEach?: string;
  /** Ce que les rubriques laissées de côté tiennent ensemble, et le temps
   *  cumulé qu’elles ont passé dehors : la phrase copiée dit la même chose
   *  que le jeton, sans qu’on ait à recalculer le total. */
  asideLeftTotalN?: number;
  asideLeftTotalAgo?: string;
  asideLeftTotalRubs?: number;
  /** La rubrique restée le plus longtemps dehors, nommée : le total de la
   *  ligne et la phrase copiée disent ainsi ce qu’ils additionnent. */
  asideLeftHeaviest?: string;
  /** Le temps que cette rubrique a passé dehors, déjà mis en mots : la phrase
   *  copiée le dit à côté de son nom, comme le jeton. */
  asideLeftHeaviestAgo?: string;
  /** Les dépôts qui restent à corriger après la porte de la plus pesante : son
   *  premier dépôt s'ouvre d'un clic, les autres attendent — la phrase copiée
   *  le dit à côté du nom de la rubrique, comme la ligne réelle. */
  asideLeftHeavyLeft?: number;
  /** Les rubriques que la porte du petit compte a déjà ouvertes : la phrase
   *  copiée le cite, pour suivre un envoi à l’autre. */
  asideLeftOpened?: number;
  /** Le temps cumulé restant dehors après la dernière porte ouverte, déjà mis
   *  en mots ; vide tant qu’aucune porte n’a été ouverte. La phrase copiée le
   *  cite, pour comparer deux envois. */
  asideLeftRestAgo?: string;
  /** La petite porte du compte de cette gomme : elle resserre la liste sur les
   *  valeurs que son dernier geste a effacées. */
  eraseNarrow?: (() => void) | null;
  eraseNarrowTitle?: string;
  /** La porte de ce compte est-elle ouverte ? Un second clic rend les filtres
   *  qu'elle avait effacés. */
  eraseNarrowActive?: boolean;
  eraseNarrowBack?: string;
  /** Combien de fois la gomme du récapitulatif a servi, et le jour de son
   *  dernier geste : son propre compte se lit comme les autres gommes. */
  erasedCount: number;
  erasedDay: string;
  /** Combien de fois la porte de ce compte s'est déjà ouverte : le compte se
   *  lit à côté de son usage et de son jour, comme les autres gommes. */
  erasedOpens?: number;
  /** Une copie réelle du récapitulatif : le compte monte d'une fois. */
  onCopied: () => void;
  /** La petite gomme du compte : le récapitulatif repart de zéro, comme les
   *  autres comptes de la ligne. */
  onReset: () => void;
};

/**
 * La ligne récapitulative posée sous le relevé : le nombre de valeurs, la
 * longueur de la ligne courte sous son seuil et les deux comptes de copies,
 * dans une seule phrase — et la même phrase copiable d'un geste, pour la
 * garder avec le relevé dans un message. Son propre compte dit combien de
 * fois elle est déjà partie.
 */
export default function SharedRecap({
  values, chars, limit, sep, sepUsed, langName, otherTaken, compactTaken, copied, folded, foldAt,
  listFolded, listFoldAt, foldsErased, foldsErasedDay, oldestEraseDay, asideAgo, asideLongest = '', doorFilters = '',
  doorOpens = 0, asideTwoNames = '', asideTwoDeposits = 0, asideTwoShare = 0,
  asideThreeNames = '', asideThreeDeposits = 0, asideThreeLeft = '', asideThreeShare = 0,
  asideLeftEach = '', asideLeftTotalN = 0, asideLeftTotalAgo = '', asideLeftTotalRubs = 0,
  asideLeftHeaviest = '',
  asideLeftHeaviestAgo = '',
  asideLeftHeavyLeft = 0,
  asideLeftOpened = 0,
  asideLeftRestAgo = '',
  erasedCount, erasedDay, erasedLastAt = '', erasedOpens = 0,
  eraseNarrow = null, eraseNarrowTitle = '', eraseNarrowActive = false, eraseNarrowBack = '',
  onCopied, onReset,
}: Props) {
  const { t } = useLang();

  const valuesTxt = t('acct.mine.rubriqueSharedRecapValues')
    .replace('{n}', String(values));
  const charsTxt = t('acct.mine.rubriqueSharedRecapChars')
    .replace('{n}', String(chars));
  const limitTxt = t('acct.mine.rubriqueSharedRecapLimit')
    .replace('{n}', String(limit));
  const otherTxt = t('acct.mine.rubriqueSharedRecapLang')
    .replace('{lang}', langName)
    .replace('{n}', String(otherTaken));
  const compactTxt = t('acct.mine.rubriqueSharedRecapCompact')
    .replace('{n}', String(compactTaken));
  /** Le séparateur de la ligne courte, en mots : la phrase copiée dit avec
   *  quel signe les valeurs sont jointes. */
  const sepTxt = t('acct.mine.rubriqueSharedRecapSep').replace('{sep}', sep);
  /** Le dernier séparateur réellement parti, avec son jour et la longueur
   *  que la ligne faisait alors : la ligne le dit même quand le signe courant
   *  a changé, pour comparer deux envois par leur signe et par leur taille. */
  const sepUsedTxt = sepUsed
    ? (sepUsed.chars > 0
      ? t('acct.mine.rubriqueSharedRecapSepUsedChars')
        .replace('{sep}', sepUsed.sep)
        .replace('{day}', sepUsed.day)
        .replace('{n}', String(sepUsed.chars))
      : t('acct.mine.rubriqueSharedRecapSepUsed')
        .replace('{sep}', sepUsed.sep)
        .replace('{day}', sepUsed.day))
    : '';
  /** Le seuil de repli retenu, qu'il soit atteint ou non : il situe la ligne
   *  d'avance, sans attendre que l'aperçu se range. */
  const foldAtTxt = t('acct.mine.rubriqueSharedRecapFoldAt')
    .replace('{n}', String(foldAt));
  /** Le repli de l'aperçu, en mots : son seuil dit de lui-même pourquoi le
   *  relevé long s'est rangé. */
  const foldedTxt = t('acct.mine.rubriqueSharedRecapFolded')
    .replace('{n}', String(foldAt));
  /** Le repli de la rangée, en mots : il dit combien de valeurs restent à
   *  l'écran, et combien la rangée en tient au total. */
  const listFoldedTxt = t('acct.mine.rubriqueSharedRecapListFolded')
    .replace('{n}', String(listFoldAt))
    .replace('{total}', String(values));

  /** Le total des rubriques laissées de côté, en mots : les dépôts qu’elles
   *  tiennent ensemble et le temps qu’elles ont passé dehors — le même
   *  chiffre que le jeton, jamais un détail sans son total. */
  const asideLeftTotalAgoTxt = asideLeftTotalAgo || t('acct.mine.lessHour');
  const asideLeftTotalTxt = t('acct.mine.rubriqueSharedRecapAsideLeftTotal')
    .replace('{n}', String(asideLeftTotalN))
    .replace('{ago}', asideLeftTotalAgoTxt);

  /** La rubrique la plus lourde dehors, en mots : son nom, suivi du temps
   *  qu’elle a passé de côté quand il est gardé — la ligne le dit comme le
   *  jeton, jamais un nom seul. */
  const asideLeftHeavyTxt = asideLeftHeaviestAgo
    ? t('acct.mine.rubriqueSharedRecapAsideLeftHeavyAgo')
      .replace('{rub}', asideLeftHeaviest)
      .replace('{ago}', asideLeftHeaviestAgo)
    : t('acct.mine.rubriqueSharedRecapAsideLeftHeavy').replace('{rub}', asideLeftHeaviest);

  /** Ce qui reste à corriger après cette porte, en mots : le premier dépôt
   *  qu'elle ouvre passé, les autres attendent dans la même rubrique. */
  const asideLeftHeavyLeftTxt = t('acct.mine.rubriqueSharedRecapAsideLeftHeavyLeft')
    .replace('{n}', String(asideLeftHeavyLeft));

  /** Les rubriques que la porte du compte a déjà ouvertes, en mots : la ligne
   *  réelle porte le même chiffre que la phrase copiée. */
  const asideLeftOpenedTxt = t('acct.mine.rubriqueSharedRecapAsideLeftOpened')
    .replace('{n}', String(asideLeftOpened));

  /** Le temps qui reste dehors après la dernière porte ouverte, en mots : la
   *  ligne réelle et la phrase copiée le disent de la même façon. */
  const asideLeftRestTxt = t('acct.mine.rubriqueSharedRecapAsideLeftRest')
    .replace('{ago}', asideLeftRestAgo);

  /** Le récapitulatif tel qu'il part : la même phrase que celle lue à
   *  l'écran, dans l'ordre des faits — le seuil compris, et le repli de
   *  l'aperçu quand il est rangé. */
  const text = t('acct.mine.rubriqueSharedRecapText')
    .replace('{values}', String(values))
    .replace('{chars}', String(chars))
    .replace('{limit}', String(limit))
    .replace('{lang}', langName)
    .replace('{other}', String(otherTaken))
    .replace('{compact}', String(compactTaken))
    .replace('{sep}', sep)
    .concat(sepUsed
      ? (sepUsed.chars > 0
        ? t('acct.mine.rubriqueSharedRecapSepUsedCharsText')
          .replace('{sep}', sepUsed.sep)
          .replace('{day}', sepUsed.day)
          .replace('{n}', String(sepUsed.chars))
        : t('acct.mine.rubriqueSharedRecapSepUsedText')
          .replace('{sep}', sepUsed.sep)
          .replace('{day}', sepUsed.day))
      : '')
    .concat(folded
      ? t('acct.mine.rubriqueSharedRecapFoldedText').replace('{fold}', String(foldAt))
      : t('acct.mine.rubriqueSharedRecapFoldAtText').replace('{fold}', String(foldAt)))
    .concat(listFolded
      ? t('acct.mine.rubriqueSharedRecapListFoldedText')
        .replace('{fold}', String(listFoldAt))
        .replace('{total}', String(values))
      : '')
    .concat(foldsErased > 0
      ? (foldsErased > 1
        ? (foldsErasedDay
          ? t('acct.mine.rubriqueSharedRecapFoldsTextDay')
            .replace('{n}', String(foldsErased))
            .replace('{day}', foldsErasedDay)
          : t('acct.mine.rubriqueSharedRecapFoldsText').replace('{n}', String(foldsErased)))
        : (foldsErasedDay
          ? t('acct.mine.rubriqueSharedRecapFoldsOneTextDay').replace('{day}', foldsErasedDay)
          : t('acct.mine.rubriqueSharedRecapFoldsOneText')))
      : '')
    .concat(oldestEraseDay
      ? t('acct.mine.rubriqueSharedRecapOldestEraseText').replace('{day}', oldestEraseDay)
      : '')
    .concat(asideAgo
      ? t('acct.mine.rubriqueSharedRecapAsideText').replace('{ago}', asideAgo)
      : '')
    .concat(asideLongest
      ? t('acct.mine.rubriqueSharedRecapAsideLongestText').replace('{rub}', asideLongest)
      : '')
    .concat(asideTwoNames && asideTwoDeposits > 0
      ? t('acct.mine.rubriqueSharedRecapAsideTwoText')
        .replace('{names}', asideTwoNames)
        .replace('{n}', String(asideTwoDeposits))
      : '')
    .concat(asideTwoNames && asideTwoShare > 0
      ? t('acct.mine.rubriqueSharedRecapAsideTwoShareText')
        .replace('{pct}', String(asideTwoShare))
      : '')
    .concat(asideThreeNames && asideThreeDeposits > 0
      ? t('acct.mine.rubriqueSharedRecapAsideThreeText')
        .replace('{names}', asideThreeNames)
        .replace('{n}', String(asideThreeDeposits))
      : '')
    .concat(asideThreeLeft
      ? t('acct.mine.rubriqueSharedRecapAsideThreeLeftText')
        .replace('{names}', asideThreeLeft)
      : '')
    .concat(asideThreeNames && asideThreeShare > 0
      ? t('acct.mine.rubriqueSharedRecapAsideThreeShareText')
        .replace('{pct}', String(asideThreeShare))
      : '')
    .concat(asideLeftTotalN > 0
      ? t('acct.mine.rubriqueSharedRecapAsideLeftTotalText')
        .replace('{n}', String(asideLeftTotalN))
        .replace('{ago}', asideLeftTotalAgoTxt)
      : '')
    .concat(asideLeftHeaviest
      ? (asideLeftHeaviestAgo
        ? t('acct.mine.rubriqueSharedRecapAsideLeftHeavyAgoText')
          .replace('{rub}', asideLeftHeaviest)
          .replace('{ago}', asideLeftHeaviestAgo)
        : t('acct.mine.rubriqueSharedRecapAsideLeftHeavyText')
          .replace('{rub}', asideLeftHeaviest))
      : '')
    .concat(asideLeftHeaviest && asideLeftHeavyLeft > 0
      ? t('acct.mine.rubriqueSharedRecapAsideLeftHeavyLeftText')
        .replace('{n}', String(asideLeftHeavyLeft))
      : '')
    .concat(asideLeftOpened > 0
      ? t('acct.mine.rubriqueSharedRecapAsideLeftOpenedText')
        .replace('{n}', String(asideLeftOpened))
      : '')
    .concat(asideLeftRestAgo
      ? t('acct.mine.rubriqueSharedRecapAsideLeftRestText').replace('{ago}', asideLeftRestAgo)
      : '')
    .concat(asideLeftEach
      ? t('acct.mine.rubriqueSharedRecapAsideLeftEachText').replace('{parts}', asideLeftEach)
      : '')
    .concat(doorFilters
      ? t('acct.mine.rubriqueSharedRecapDoorFiltersText').replace('{parts}', doorFilters)
      : '')
    .concat(doorOpens > 0
      ? t('acct.mine.rubriqueSharedRecapDoorOpensText').replace('{n}', String(doorOpens))
      : '');

  /** La phrase courte : quand la longue dépasse le seuil retenu, la copie part
   *  d'une ligne plus brève — la plus lourde dehors citée en tête, puis ce
   *  qu'elle laisse à corriger, puis le total des rubriques laissées de côté.
   *  Le relevé part sans dépasser la mesure, et ce qui compte se lit d'abord. */
  const textShort = t('acct.mine.rubriqueSharedRecapShortText')
    .replace('{values}', String(values))
    .replace('{chars}', String(chars))
    .replace('{limit}', String(limit))
    .concat(asideLeftHeaviest
      ? (asideLeftHeaviestAgo
        ? t('acct.mine.rubriqueSharedRecapAsideLeftHeavyAgoText')
          .replace('{rub}', asideLeftHeaviest)
          .replace('{ago}', asideLeftHeaviestAgo)
        : t('acct.mine.rubriqueSharedRecapAsideLeftHeavyText')
          .replace('{rub}', asideLeftHeaviest))
      : '')
    .concat(asideLeftHeaviest && asideLeftHeavyLeft > 0
      ? t('acct.mine.rubriqueSharedRecapAsideLeftHeavyLeftText')
        .replace('{n}', String(asideLeftHeavyLeft))
      : '')
    .concat(asideLeftTotalN > 0
      ? t('acct.mine.rubriqueSharedRecapAsideLeftTotalText')
        .replace('{n}', String(asideLeftTotalN))
        .replace('{ago}', asideLeftTotalAgoTxt)
      : '')
    .concat(asideLeftEach
      ? t('acct.mine.rubriqueSharedRecapAsideLeftEachText').replace('{parts}', asideLeftEach)
      : '');

  /** Ce qui part réellement : la phrase entière tant qu'elle tient sous le
   *  seuil retenu, la version courte au-delà — la ligne copiée ne dépasse
   *  jamais la mesure sous laquelle la ligne courte est lue. */
  const recapTooLong = text.length > limit;
  const shortChars = textShort.length;

  /** Le corps de la phrase qui part, avant que sa propre longueur ne s'y
   *  ajoute : la mesure se dit sur ce qui part vraiment, phrase comprise. */
  const bodyOut = recapTooLong ? textShort : text;

  /** La longueur réellement partie, courte ou longue : la phrase la dit
   *  d'elle-même, pour comparer deux envois d'un coup d'œil. Le compte se
   *  mesure sur ce qui part, la mention comprise — il se recale tant que le
   *  nombre de chiffres change la longueur qu'il décrit. */
  const sendOf = (n: number) => t('acct.mine.rubriqueSharedRecapSend')
    .replace('{mode}', t(recapTooLong
      ? 'acct.mine.rubriqueSharedRecapSendShort'
      : 'acct.mine.rubriqueSharedRecapSendLong'))
    .replace('{n}', String(n));
  let sendTxt = sendOf(bodyOut.length);
  for (let pass = 0; pass < 3; pass += 1) {
    const next = sendOf(bodyOut.length + sendTxt.length);
    const settled = next.length === sendTxt.length;
    sendTxt = next;
    if (settled) break;
  }
  const textOut = bodyOut.concat(sendTxt);

  /** La phrase complète ouverte depuis la pastille « phrase courte » : ce que
   *  la version brève laisse de côté se lit avant de copier. */
  const [fullOpen, setFullOpen] = useState(false);

  return (
    <span
      className="mine-rubrique-shared-recap"
      title={t('acct.mine.rubriqueSharedRecapHint').replace('{values}', String(values))}
    >
      <i className="ri-file-list-3-line" aria-hidden="true"></i>
      <span className="mine-rubrique-shared-recap-label">
        {t('acct.mine.rubriqueSharedRecap')}
      </span>
      <span className="mine-rubrique-shared-recap-part" dir="ltr">
        <i className="ri-stack-line" aria-hidden="true"></i>
        {valuesTxt}
      </span>
      <span className="mine-rubrique-shared-recap-part" dir="ltr">
        <i className="ri-ruler-2-line" aria-hidden="true"></i>
        {charsTxt}
      </span>
      {/* Le seuil retenu, juste après la longueur : la phrase copiée se suffit
          à elle-même, sans qu'on ait à se souvenir de la mesure. */}
      <span
        className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-limit"
        dir="ltr"
        title={t('acct.mine.rubriqueSharedRecapLimitHint').replace('{n}', String(limit))}
      >
        <i className="ri-focus-3-line" aria-hidden="true"></i>
        {limitTxt}
      </span>
      <span className="mine-rubrique-shared-recap-part" dir="auto">
        <i className="ri-global-line" aria-hidden="true"></i>
        {otherTxt}
      </span>
      <span className="mine-rubrique-shared-recap-part" dir="auto">
        <i className="ri-file-copy-2-line" aria-hidden="true"></i>
        {compactTxt}
      </span>
      {/* Le séparateur de la ligne courte, juste après son compte : la phrase
          copiée le cite, et le lecteur l'a sous les yeux au moment de copier. */}
      <span
        className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-sep"
        dir="auto"
        title={t('acct.mine.rubriqueSharedRecapSepHint').replace('{sep}', sep)}
      >
        <i className="ri-more-line" aria-hidden="true"></i>
        {sepTxt}
      </span>
      {/* Le dernier séparateur réellement parti, avec son jour : la ligne suit
          l'envoi précédent, et le signe courant s'en distingue s'il a changé. */}
      {sepUsed && (
        <span
          className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-sepused"
          dir="auto"
          title={(sepUsed.chars > 0
            ? t('acct.mine.rubriqueSharedRecapSepUsedCharsHint')
            : t('acct.mine.rubriqueSharedRecapSepUsedHint'))
            .replace('{sep}', sepUsed.sep)
            .replace('{day}', sepUsed.day)
            .replace('{n}', String(sepUsed.chars))
            .replace('{now}', sep)}
        >
          <i className="ri-history-line" aria-hidden="true"></i>
          {sepUsedTxt}
          {sepUsed.sep !== sep && (
            <span className="mine-rubrique-shared-recap-sepdiff">
              {t('acct.mine.rubriqueSharedRecapSepUsedDiff')}
            </span>
          )}
        </span>
      )}
      {/* Le repli de l'aperçu, à côté des comptes : son seuil se dit même
          quand l'aperçu est ouvert, pour situer la ligne d'avance. */}
      <span
        className={`mine-rubrique-shared-recap-part mine-rubrique-shared-recap-folded${folded ? ' is-folded' : ''}`}
        dir="auto"
        title={(folded
          ? t('acct.mine.rubriqueSharedRecapFoldedHint').replace('{n}', String(foldAt))
          : t('acct.mine.rubriqueSharedRecapFoldAtHint').replace('{n}', String(foldAt)))}
      >
        <i className={folded ? 'ri-eye-off-line' : 'ri-contract-up-down-line'} aria-hidden="true"></i>
        {folded ? foldedTxt : foldAtTxt}
      </span>
      {/* Le repli de la rangée des valeurs, à côté de celui de l'aperçu : un
          collègue sait combien de valeurs restent à l'écran, et sur combien. */}
      {listFolded && (
        <span
          className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-folded"
          dir="auto"
          title={t('acct.mine.rubriqueSharedRecapListFoldedHint')
            .replace('{n}', String(listFoldAt))
            .replace('{total}', String(values))}
        >
          <i className="ri-list-unordered" aria-hidden="true"></i>
          {listFoldedTxt}
        </span>
      )}
      {/* Le temps cumulé hors écran, quand la rangée est repliée : la phrase
          copiée le cite, et il se lit ici avant le clic — la ligne lue et la
          ligne copiée disent la même chose. */}
      {asideAgo && (
        <span
          className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-aside"
          dir="auto"
          title={t('acct.mine.rubriqueSharedRecapAsideHint').replace('{ago}', asideAgo)}
        >
          <i className="ri-time-line" aria-hidden="true"></i>
          {t('acct.mine.rubriqueSharedAsideTotal').replace('{ago}', asideAgo)}
        </span>
      )}
      {/* La valeur restée le plus longtemps dehors, nommée à côté du temps
          cumulé : la ligne réelle porte le même jeton que la phrase copiée. */}
      {asideLongest && (
        <span
          className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-longest"
          dir="auto"
          title={t('acct.mine.rubriqueSharedRecapAsideLongestHint')
            .replace('{rub}', asideLongest)}
        >
          <i className="ri-hourglass-line" aria-hidden="true"></i>
          {t('acct.mine.rubriqueSharedRecapAsideLongest')
            .replace('{rub}', asideLongest)}
        </span>
      )}
      {/* Ce que les deux valeurs les plus lourdes tiennent hors de l’écran,
          nommées avec leur compte : la ligne réelle porte le même jeton que
          la phrase copiée. */}
      {asideTwoNames && asideTwoDeposits > 0 && (
        <span
          className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-asidetwo"
          dir="auto"
          title={t('acct.mine.rubriqueSharedRecapAsideTwoHint')
            .replace('{names}', asideTwoNames)
            .replace('{n}', String(asideTwoDeposits))}
        >
          <i className="ri-links-line" aria-hidden="true"></i>
          {t('acct.mine.rubriqueSharedRecapAsideTwo')
            .replace('{n}', String(asideTwoDeposits))}
        </span>
      )}
      {/* La part du temps cumulé que ces deux valeurs pèsent, en pourcentage :
          la ligne réelle porte le même jeton que la phrase copiée. */}
      {asideTwoNames && asideTwoShare > 0 && (
        <span
          className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-asidetwoshare"
          dir="auto"
          title={t('acct.mine.rubriqueSharedRecapAsideTwoShareHint')
            .replace('{pct}', String(asideTwoShare))}
        >
          <i className="ri-percent-line" aria-hidden="true"></i>
          {t('acct.mine.rubriqueSharedRecapAsideTwoShare')
            .replace('{pct}', String(asideTwoShare))}
        </span>
      )}
      {/* Ce que les trois valeurs les plus lourdes tiennent hors de l’écran,
          nommées avec leur compte : la ligne réelle porte le même jeton que
          la phrase copiée. */}
      {asideThreeNames && asideThreeDeposits > 0 && (
        <span
          className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-asidethree"
          dir="auto"
          title={t('acct.mine.rubriqueSharedRecapAsideThreeHint')
            .replace('{names}', asideThreeNames)
            .replace('{n}', String(asideThreeDeposits))}
        >
          <i className="ri-stack-line" aria-hidden="true"></i>
          {t('acct.mine.rubriqueSharedRecapAsideThree')
            .replace('{n}', String(asideThreeDeposits))}
        </span>
      )}
      {/* Les valeurs que les trois plus lourdes laissent encore de côté,
          nommées à côté de leur compte : la ligne réelle porte le même jeton
          que la phrase copiée. */}
      {asideThreeLeft && (
        <span
          className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-asidethreeleft"
          dir="auto"
          title={t('acct.mine.rubriqueSharedRecapAsideThreeLeftHint')
            .replace('{names}', asideThreeLeft)}
        >
          <i className="ri-eye-off-line" aria-hidden="true"></i>
          {t('acct.mine.rubriqueSharedRecapAsideThreeLeft')
            .replace('{names}', asideThreeLeft)}
        </span>
      )}
      {/* La part du temps cumulé que ces trois valeurs pèsent, en pourcentage :
          la ligne réelle porte le même jeton que la phrase copiée. */}
      {asideThreeNames && asideThreeShare > 0 && (
        <span
          className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-asidethreeshare"
          dir="auto"
          title={t('acct.mine.rubriqueSharedRecapAsideThreeShareHint')
            .replace('{pct}', String(asideThreeShare))}
        >
          <i className="ri-percent-line" aria-hidden="true"></i>
          {t('acct.mine.rubriqueSharedRecapAsideThreeShare')
            .replace('{pct}', String(asideThreeShare))}
        </span>
      )}
      {/* Le total des rubriques laissées de côté, avant leur détail : la ligne
          réelle porte le même chiffre que le jeton, et la phrase copiée. */}
      {asideLeftTotalN > 0 && (
        <span
          className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-asidelefttotal"
          dir="auto"
          title={t('acct.mine.rubriqueSharedRecapAsideLeftTotalHint')
            .replace('{n}', String(asideLeftTotalN))
            .replace('{rubs}', String(asideLeftTotalRubs))
            .replace('{ago}', asideLeftTotalAgoTxt)}
        >
          <i className="ri-stack-line" aria-hidden="true"></i>
          {asideLeftTotalTxt}
        </span>
      )}
      {/* La rubrique la plus lourde dehors, nommée juste après le total : le
          chiffre dit ce qu’il additionne, sans relire chaque durée. */}
      {asideLeftTotalN > 0 && asideLeftHeaviest && (
        <span
          className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-asideleftheavy"
          dir="auto"
          title={t('acct.mine.rubriqueSharedRecapAsideLeftHeavyHint')
            .replace('{rub}', asideLeftHeaviest)
            .replace('{ago}', asideLeftHeaviestAgo || t('acct.mine.lessHour'))}
        >
          <i className="ri-fire-line" aria-hidden="true"></i>
          {asideLeftHeavyTxt}
        </span>
      )}
      {/* Ce qui reste à corriger après cette porte, à côté de son nom : la
          ligne réelle et la phrase copiée donnent le même compte. */}
      {asideLeftTotalN > 0 && asideLeftHeaviest && asideLeftHeavyLeft > 0 && (
        <span
          className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-asideleftleft"
          dir="auto"
          title={t('acct.mine.rubriqueSharedRecapAsideLeftHeavyLeftHint')
            .replace('{rub}', asideLeftHeaviest)
            .replace('{n}', String(asideLeftHeavyLeft))}
        >
          <i className="ri-list-check-2" aria-hidden="true"></i>
          {asideLeftHeavyLeftTxt}
        </span>
      )}
      {/* Les rubriques que la porte du compte a déjà ouvertes, à côté de ce
          qui reste à corriger : la ligne réelle et la phrase copiée donnent
          le même compte, pour suivre un envoi à l’autre. */}
      {asideLeftTotalN > 0 && asideLeftOpened > 0 && (
        <span
          className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-asideleftopened"
          dir="auto"
          title={t('acct.mine.rubriqueSharedRecapAsideLeftOpenedHint')
            .replace('{n}', String(asideLeftOpened))}
        >
          <i className="ri-door-open-line" aria-hidden="true"></i>
          {asideLeftOpenedTxt}
        </span>
      )}
      {/* Le temps qui reste dehors après la dernière porte ouverte, à côté du
          compte de cette porte : la ligne réelle et la phrase copiée donnent
          le même chiffre, pour comparer deux envois. */}
      {asideLeftRestAgo && (
        <span
          className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-asideleftrest"
          dir="auto"
          title={t('acct.mine.rubriqueSharedRecapAsideLeftRestHint')
            .replace('{ago}', asideLeftRestAgo)}
        >
          <i className="ri-time-line" aria-hidden="true"></i>
          {asideLeftRestTxt}
        </span>
      )}
      {/* Le détail des dépôts par rubrique laissée de côté, un nom avec son
          compte chacun : la ligne réelle porte le même jeton que la phrase
          copiée, sans renvoyer à un total. */}
      {asideLeftEach && (
        <span
          className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-asidelefteach"
          dir="auto"
          title={t('acct.mine.rubriqueSharedRecapAsideLeftEachHint')
            .replace('{parts}', asideLeftEach)}
        >
          <i className="ri-list-check-2" aria-hidden="true"></i>
          {t('acct.mine.rubriqueSharedRecapAsideLeftEach')
            .replace('{parts}', asideLeftEach)}
        </span>
      )}
      {/* Les portes de gomme ouvertes depuis le début, tous comptes confondus :
          la ligne réelle porte le même jeton que la phrase copiée, pour
          qu’un collègue lise exactement ce qui part. */}
      {doorOpens > 0 && (
        <span
          className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-doors"
          dir="auto"
          title={t('acct.mine.rubriqueSharedRecapDoorOpensHint').replace('{n}', String(doorOpens))}
        >
          <i className="ri-login-box-line" aria-hidden="true"></i>
          {t('acct.mine.rubriqueSharedRecapDoorOpens').replace('{n}', String(doorOpens))}
        </span>
      )}
      {/* La copie part en version courte quand la phrase dépasse le seuil
          retenu : le lecteur le sait avant de cliquer, plutôt que de
          découvrir un texte raccourci de lui-même. La pastille est aussi une
          porte : un clic ouvre la phrase complète, pour voir ce qu'elle
          laisse de côté. */}
      {recapTooLong && (
        <button
          type="button"
          className="mine-rubrique-shared-recap-part mine-rubrique-shared-recap-short"
          dir="auto"
          aria-expanded={fullOpen}
          onClick={() => setFullOpen((open) => !open)}
          title={[t('acct.mine.rubriqueSharedRecapShortHint')
            .replace('{limit}', String(limit)),
          t('acct.mine.rubriqueSharedRecapFullHint').replace('{limit}', String(limit))]
            .join(' ')}
        >
          <i
            className={fullOpen ? 'ri-contract-up-down-line' : 'ri-expand-up-down-line'}
            aria-hidden="true"
          ></i>
          {fullOpen
            ? t('acct.mine.rubriqueSharedRecapFull').replace('{n}', String(text.length))
            : t('acct.mine.rubriqueSharedRecapShortOpen').replace('{n}', String(shortChars))}
        </button>
      )}
      {/* Ce que la version brève laisse de côté, ouvert sur demande : la
          phrase entière se lit ici avant de copier la ligne courte. */}
      {recapTooLong && fullOpen && (
        <span
          className="mine-rubrique-shared-recap-full"
          dir="auto"
          title={t('acct.mine.rubriqueSharedRecapFullHint').replace('{limit}', String(limit))}
        >
          <i className="ri-file-text-line" aria-hidden="true"></i>
          <span className="mine-rubrique-shared-recap-full-head">
            {t('acct.mine.rubriqueSharedRecapFull').replace('{n}', String(text.length))}
          </span>
          <span className="mine-rubrique-shared-recap-full-body">{text}</span>
          {/* La phrase complète se copie telle quelle, sans passer par la
              version brève : ce qui part est exactement ce qui se lit ici. */}
          <CopyTextButton
            className="mine-rubrique-shared-recap-full-copy"
            label={t('acct.mine.rubriqueSharedRecapFullCopy')}
            hint={t('acct.mine.rubriqueSharedRecapFullCopyHint')
              .replace('{n}', String(text.length))}
            build={() => text}
            onCopied={onCopied}
          />
          <button
            type="button"
            className="mine-rubrique-shared-recap-full-close"
            onClick={() => setFullOpen(false)}
            title={t('acct.mine.rubriqueSharedRecapFullClose')}
            aria-label={t('acct.mine.rubriqueSharedRecapFullClose')}
          >
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        </span>
      )}
      <CopyTextButton
        className="mine-rubrique-shared-copy mine-rubrique-shared-recap-copy"
        label={t('acct.mine.rubriqueSharedRecapCopy')}
        hint={t('acct.mine.rubriqueSharedRecapCopyHint').replace('{text}', textOut)}
        build={() => textOut}
        onCopied={onCopied}
        trailing={copied > 0 ? (
          <span
            className="mine-rubrique-shared-copy-taken"
            title={t('acct.mine.rubriqueSharedRecapCopiedHint').replace('{n}', String(copied))}
          >
            {t('acct.mine.rubriqueSharedRecapCopied').replace('{n}', String(copied))}
          </span>
        ) : null}
      />
      {/* Le petit compte de cette gomme, à côté des autres : elle se lit
          d'un même geste que celle des replis, et sa trace reste une fois la
          gomme disparue. */}
      <SharedEraseCount
        count={erasedCount}
        day={erasedDay}
        lastAt={erasedLastAt}
        opens={erasedOpens}
        onNarrow={eraseNarrow}
        narrowTitle={eraseNarrowTitle}
        narrowActive={eraseNarrowActive}
        narrowBackTitle={eraseNarrowBack}
      />
      {/* La petite gomme du compte, une fois le récapitulatif parti : elle
          remet son seul compte à zéro, sans toucher au seuil ni aux comptes
          de la ligne — et s'efface d'elle-même une fois le compte vide. */}
      {copied > 0 && (
        <button
          type="button"
          className="mine-rubrique-shared-copy-erase mine-rubrique-shared-recap-erase"
          onClick={onReset}
          title={t('acct.mine.rubriqueSharedRecapEraseHint').replace('{n}', String(copied))}
          aria-label={t('acct.mine.rubriqueSharedRecapErase')}
        >
          <i className="ri-eraser-line" aria-hidden="true"></i>
        </button>
      )}
    </span>
  );
}