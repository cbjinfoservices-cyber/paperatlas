import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import {
  FOOTER_COL_IDS,
  footerColsOpenCount,
  footerDoorTally,
  onFooterColsChange,
  onFooterDoorsChange,
  readFooterCol,
  resetFooterCols,
  writeAllFooterCols,
  type FooterDoorTally,
} from '@/lib/footerCols';
import { phrasePortesRubrique, phrasePortesSur, phrasePortesTotales } from '@/lib/navDoorsLeft';

/* Le mot qui nomme la colonne restée ouverte : le compte de part ouverte ne
   dit rien tant qu'il ne nomme pas de quoi il parle. Les deux tournures sont
   écrites à part, parce que « Plateforme » est féminin et « Ailleurs » ne
   l'est pas — une seule phrase ne peut pas servir les deux sans mentir. */
const COL_OPEN_KEY: Record<string, string> = {
  'foot-platform': 'foot.platformOpen',
  'foot-elsewhere': 'foot.elsewhereOpen',
};

/* Le titre de la même colonne, pris à la même source : ce que la gomme dit
   effacer se lit dans les mots du pied de page lui-même. */
const COL_TITLE_KEY: Record<string, string> = {
  'foot-platform': 'foot.platform',
  'foot-elsewhere': 'foot.elsewhere',
};

/**
 * Le geste unique du pied de page : déplier ou replier les deux colonnes de
 * liens d'un seul coup, et la petite gomme qui rend le pied de page à son
 * état d'origine.
 *
 * Il ne remplace pas les accordéons — il les tient ensemble. Et il obéit à la
 * même mémoire : ce qu'il décide est retenu pour la visite et pour les
 * suivantes, exactement comme un « + » pressé à la main. Un mot ajouté à une
 * colonne seule le fait changer d'avis : le bouton ne promet jamais « tout
 * déplier » quand une colonne sur deux est déjà ouverte — il dit alors
 * combien le sont, pour qu'on sache ce qui reste à faire.
 *
 * Quand une seule colonne est ouverte, son mot cède la place à ce qu'elle
 * découvre sur ce que le pied de page tient en tout — « Plateforme ouverte —
 * 17 portes sur 23 » —, lu sur les listes elles-mêmes et non sur une table
 * écrite à la main. Le nom de la colonne est posé là pour que le chiffre ne
 * reste pas orphelin : « 17 portes sur 23 » ne dit pas de quelle part on
 * parle.
 *
 * À côté, une petite gomme efface tout : elle replie les deux colonnes et
 * oublie la mémoire longue, comme celle du carnet de parcours. Le geste se
 * fait en deux temps — le premier efface le mot au profit d'une question, le
 * second replie vraiment —, parce qu'un pied de page qu'on a déplié se perd
 * d'un clic par inadvertance et ne se rend pas de la même façon.
 *
 * Après un geste, la même phrase est déposée à voix basse dans une zone de
 * statut : un lecteur d'écran n'entend pas deux accordéons se ranger sous lui.
 */
export default function FooterColsControl() {
  const { t } = useLang();
  const [openCount, setOpenCount] = useState(() => footerColsOpenCount());
  /* Les deux comptes du pied de page : le total relevé sur les listes, et la
     part que les colonnes dépliées découvrent. */
  const [tally, setTally] = useState<FooterDoorTally>(() => footerDoorTally());
  /* La phrase du geste, dite une fois la mesure posée. */
  const [said, setSaid] = useState('');
  const saidTimer = useRef<number | null>(null);
  /* La gomme qui attend son second geste. */
  const [ask, setAsk] = useState(false);
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  /* Un geste sur une colonne seule, ailleurs dans la page, relit la réponse —
     et les comptes, puisque la part ouverte change avec elle. */
  useEffect(() => onFooterColsChange(() => {
    setOpenCount(footerColsOpenCount());
    setTally(footerDoorTally());
  }), []);

  /* Les comptes relevés dans les colonnes arrivent après la première peinture
     du bouton : il les relit donc à l'instant où ils sont annoncés. */
  useEffect(() => {
    setTally(footerDoorTally());
    return onFooterDoorsChange(() => setTally(footerDoorTally()));
  }, []);

  /* La question posée, le curseur se pose sur le geste qui replie : on ne
     laisse pas le visiteur chercher où confirmer. */
  useEffect(() => {
    if (ask) confirmRef.current?.focus();
  }, [ask]);

  /* La minuterie d'une annonce ne survit pas au démontage du pied de page. */
  useEffect(() => () => {
    if (saidTimer.current !== null) window.clearTimeout(saidTimer.current);
    saidTimer.current = null;
  }, []);

  /* Une phrase se vide avant d'être réécrite : la même, dite deux fois de
     suite, doit s'entendre deux fois. */
  const say = (message: string, delay = 60) => {
    if (saidTimer.current !== null) window.clearTimeout(saidTimer.current);
    setSaid('');
    saidTimer.current = window.setTimeout(() => {
      saidTimer.current = null;
      setSaid(message);
    }, delay);
  };

  const allOpen = openCount === FOOTER_COL_IDS.length;

  /* La colonne restée seule ouverte, et son nom : c'est lui qui empêche le
     compte de flotter sans sujet. */
  const seulOuverte = openCount === 1
    ? FOOTER_COL_IDS.find((id) => readFooterCol(id))
    : undefined;

  /* La colonne restée fermée quand l'autre est ouverte : c'est sa part que le
     bouton global garde encore sous son accordéon. Le survol ne promet donc
     plus un geste abstrait — « un clic déplie les colonnes restantes » —, il
     nomme la colonne qui reste et les portes qu'elle tient, relevées sur la
     même liste que sa pastille. */
  const seulFermee = openCount === 1
    ? FOOTER_COL_IDS.find((id) => !readFooterCol(id))
    : undefined;
  const seulOuverteNom = seulOuverte ? t(COL_TITLE_KEY[seulOuverte] ?? 'foot.platform') : '';
  const seulFermeeNom = seulFermee ? t(COL_TITLE_KEY[seulFermee] ?? 'foot.elsewhere') : '';
  const fermeesDoors = seulFermee ? tally.byCol[seulFermee] ?? 0 : 0;

  /* La gomme n'efface pas un geste abstrait : elle oublie des colonnes
     nommées. Quand une seule est restée ouverte, c'est elle seule qu'elle
     efface — et son survol le dit, avec les portes qu'elle tient, relevées sur
     sa liste comme la pastille de son accordéon. Les deux colonnes ne sont
     nommées ensemble que lorsqu'elles sont toutes les deux ouvertes ; fermé
     des deux côtés, il n'y a rien à nommer et la phrase d'origine suffit. */
  const wipeCols = `${t('foot.platform')} · ${t('foot.elsewhere')}`;
  const wipeDoors = seulOuverte ? tally.byCol[seulOuverte] ?? 0 : 0;
  const wipeHint = seulOuverte && wipeDoors > 0
    ? t('foot.resetHintCol')
      .replace('{col}', seulOuverteNom)
      .replace('{doors}', phrasePortesRubrique(wipeDoors, t))
    : t('foot.resetHintCols').replace('{cols}', wipeCols);

  /* La question posée par la gomme nomme elle aussi ce qu'elle s'apprête à
     perdre : une seule colonne ouverte, et elle cite la colonne et les portes
     qu'elle va oublier. Deux colonnes ouvertes, ou aucune : la question
     d'origine suffit — il n'y a pas un compte à nommer, seulement un geste.

     C'est cette phrase, et non la question générique, qui nomme le groupe :
     la colonne citée et ses portes sont donc entendues avant les deux gestes
     qui suivent, quel que soit le côté où le pied de page se lit. */
  const askText = seulOuverte && wipeDoors > 0
    ? t('foot.resetAskCol')
      .replace('{col}', seulOuverteNom)
      .replace('{doors}', phrasePortesRubrique(wipeDoors, t))
    : t('foot.resetAsk');

  /* Ce que le bouton global promet, dit au survol : la colonne restée fermée,
     et les portes qu'elle garde encore. */
  const openHint = seulFermee && fermeesDoors > 0
    ? t('foot.openHintCol')
      .replace('{col}', seulFermeeNom)
      .replace('{doors}', phrasePortesRubrique(fermeesDoors, t))
    : t('foot.openHint');

  /* Les deux colonnes réunies : il n'y a plus de part restante à citer, mais
     deux colonnes ouvertes et leurs portes. Le survol les nomme ensemble,
     chacune avec le compte relevé sur sa propre liste — la même source que la
     pastille de son accordéon et que la gomme, si bien qu'une porte ajoutée
     se lit des trois côtés sans qu'on écrive un total à la main. */
  const bothColsDoors = FOOTER_COL_IDS
    .map((id) => {
      const doors = tally.byCol[id] ?? 0;
      const name = t(COL_TITLE_KEY[id] ?? 'foot.platform');
      const doorsPhrase = phrasePortesRubrique(doors, t);
      return doorsPhrase ? `${name} — ${doorsPhrase}` : name;
    })
    .join(' · ');
  const bothHint = allOpen && tally.total > 0
    ? t('foot.collapseHintBoth').replace('{cols}', bothColsDoors)
    : '';

  /* Une seule colonne ouverte : son nom et les deux comptes prennent la place
     du mot. Deux colonnes ouvertes, ou aucune : les mots d'avant reprennent
     la main. */
  const doorsWord = openCount === 1 && tally.total > 0
    ? phrasePortesSur(tally.open, tally.total, t)
    : '';
  const tallyWord = seulOuverte && doorsWord
    ? t(COL_OPEN_KEY[seulOuverte] ?? 'foot.openOne').replace('{doors}', doorsWord)
    : '';

  const label = tallyWord || (allOpen
    ? t('foot.collapseAll')
    : openCount === 0
      ? t('foot.expandAll')
      : openCount === 1
        ? t('foot.openOne')
        : t('foot.openSome').replace('{n}', String(openCount)));

  /* Ce que le bouton fera, et ce qu'il tient : le nom accessible garde le
     geste, le mot visible porte le compte. */
  const spokenLabel = allOpen
    ? t('foot.collapseAll')
    : openCount === 0
      ? t('foot.expandAll')
      : t('foot.openHint');

  /* Au repos — les deux colonnes ouvertes ou les deux fermées —, aucun compte
     de part ouverte ne prend la parole : c'est alors le total que le nom
     accessible porte, pour que le bouton dise ce que le pied de page tient et
     pas seulement le geste qu'il fera. Le chiffre se relève sur les listes,
     comme celui de l'accordéon voisin. */
  const totalDoors = phrasePortesTotales(tally.total, t);
  const restLabel = totalDoors ? `${label} — ${totalDoors}` : label;

  /* Les deux colonnes réunies portent le même compte dans le nom accessible
     que dans le survol — chaque chiffre relevé sur sa liste, comme la pastille
     de son accordéon et la gomme. Le nom commence par le mot que le bouton
     montre (« Tout replier ») : un lecteur d'écran entend ainsi ce qu'il lit à
     l'écran avant le compte, et la dictée vocale retrouve le bouton par son
     propre libellé, ce qu'un nom ouvert par « Un clic replie… » ne permettait
     pas. */
  const globalName = allOpen && bothColsDoors
    ? `${label} — ${bothColsDoors}`
    : (tallyWord || restLabel);

  const toggle = () => {
    const next = !allOpen;
    writeAllFooterCols(next);
    setOpenCount(next ? FOOTER_COL_IDS.length : 0);
    setTally(footerDoorTally());
    /* La voix basse ne dit rien avant que les colonnes ne se soient rangées :
       la mesure est relue au bout du délai, jamais devinée. */
    if (saidTimer.current !== null) window.clearTimeout(saidTimer.current);
    setSaid('');
    saidTimer.current = window.setTimeout(() => {
      saidTimer.current = null;
      const now = footerDoorTally();
      setTally(now);
      const portes = phrasePortesTotales(now.total, t);
      if (!portes) return;
      const mot = next ? t('foot.saidOpen') : t('foot.saidFolded');
      setSaid(`${mot} · ${portes}`);
    }, 700);
  };

  /* Le premier geste : la question remplace le mot, le pied de page reste tel
     qu'il est. */
  const askWipe = () => {
    setAsk(true);
    say(askText);
  };

  /* Le second geste, ou le renoncement. La gomme rend le pied de page à son
     état replié par défaut, mémoire longue comprise. */
  const wipe = () => {
    resetFooterCols();
    setOpenCount(0);
    setTally(footerDoorTally());
    setAsk(false);
    say(t('foot.resetSaid'), 120);
  };

  const keepFolded = () => {
    setAsk(false);
    setSaid('');
  };

  return (
    <div className="footer-cols-ctrl">
      {ask ? (
        <div className="footer-cols-ask" role="group" aria-label={askText}>
          <span className="footer-cols-ask-txt">{askText}</span>
          <button
            type="button"
            className="footer-cols-yes"
            ref={confirmRef}
            onClick={wipe}
          >
            <i className="ri-delete-bin-6-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('foot.resetYes')}</span>
          </button>
          <button type="button" className="footer-cols-no" onClick={keepFolded}>
            <span className="whitespace-nowrap">{t('foot.resetNo')}</span>
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            className="footer-cols-all"
            aria-pressed={allOpen}
            title={allOpen ? (bothHint || restLabel) : openHint}
            aria-label={globalName}
            onClick={toggle}
          >
            <i className={allOpen ? 'ri-collapse-diagonal-line' : 'ri-expand-diagonal-line'} aria-hidden="true"></i>
            <span>{label}</span>
          </button>
          {/* La petite gomme : elle ne paraît que là où les accordéons vivent,
              et son nom accessible dit ce qu'elle fait, pas seulement son
              signe. */}
          <button
            type="button"
            className="footer-cols-wipe"
            onClick={askWipe}
            title={wipeHint}
            aria-label={wipeHint}
          >
            <i className="ri-eraser-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('foot.reset')}</span>
          </button>
        </>
      )}
      {/* Le compte du geste, dit une seule fois et à voix basse : la marque
          visible est le bouton lui-même, la phrase est son annonce. */}
      <p className="footer-said" role="status" aria-live="polite">{said}</p>
    </div>
  );
}