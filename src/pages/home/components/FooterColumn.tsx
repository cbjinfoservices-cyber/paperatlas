import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { onFooterColsAllChange, readFooterCol, reportFooterColDoors, writeFooterCol } from '@/lib/footerCols';
import { phrasePortesRubrique } from '@/lib/navDoorsLeft';

type Props = {
  /** Le titre de la colonne, déjà traduit. */
  title: string;
  /** L'identifiant de la liste, pour que le bouton du téléphone la nomme. */
  listId: string;
  children: ReactNode;
};

/**
 * Une colonne de liens du pied de page.
 *
 * Sur un grand écran, elle s'ouvre d'office : le titre suffit, et les liens sont
 * là. Sur un téléphone, le même titre devient un accordéon discret — le pied de
 * page tient alors en trois lignes repliées au lieu d'une trentaine de liens,
 * et la page se termine sans qu'il faille faire défiler un annuaire.
 *
 * L'ouverture est retenue pour la visite, et aussi d'une visite à l'autre :
 * suivre un lien du pied de page puis en ouvrir un autre ne relègue plus la
 * colonne derrière son « + » à chaque changement de page, et un habitué
 * retrouve la colonne qu'il avait dépliée — comme celle qu'il avait refermée.
 *
 * Repliée, la colonne annonce désormais ce qu'elle tient : le nombre de portes
 * est relevé sur la liste elle-même, comme les comptes de rubrique du menu, et
 * se lit à côté du titre, dans la même pastille que les trois rubriques du
 * panneau. Un accordéon fermé ne cache donc plus combien il garde.
 *
 * Et quand c'est son propre accordéon qui se referme, la pastille ne revient
 * pas en silence : une phrase à voix basse nomme la colonne et son compte, une
 * fois, lue sur la liste après le repli. Le geste global, lui, a déjà sa voix
 * — il ne se dit pas deux fois.
 */
export default function FooterColumn({ title, listId, children }: Props) {
  const { t } = useLang();
  const [open, setOpen] = useState(() => readFooterCol(listId));
  /* Le compte, relevé sur les portes réellement présentes dans la liste : une
     colonne qui reçoit une porte de plus le dit sans qu'on touche à un chiffre
     écrit à la main. */
  const [count, setCount] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  /* La phrase dite à voix basse quand l'accordéon se referme : la pastille
     reparaît, et le chiffre qu'elle affiche est annoncé au lieu de surgir
     sous les yeux sans un mot. */
  const [said, setSaid] = useState('');
  const saidTimer = useRef<number | null>(null);

  /* La minuterie d'une annonce ne survit pas au démontage de la colonne. */
  useEffect(() => () => {
    if (saidTimer.current !== null) window.clearTimeout(saidTimer.current);
    saidTimer.current = null;
  }, []);

  /* Le bouton du pied de page déplie ou replie tout : la colonne suit le même
     geste sans que son accordéon à elle soit touché, et sans réécrire ce que
     le geste vient justement de retenir. */
  useEffect(() => onFooterColsAllChange(setOpen), []);

  /* Le relevé est pris avant la première peinture : la colonne repliée montre
     son chiffre tout de suite, sans une image où le titre serait seul. */
  useLayoutEffect(() => {
    const node = listRef.current;
    if (!node) return undefined;
    const read = () => {
      /* Le compte ne se lit pas sur la visibilité : la liste est justement
         repliée quand le chiffre sert, et une porte cachée reste une porte.
         Les liens du pied de page sont tous des destinations — il n'y a pas
         de pastille ni de bouton à écarter, comme dans le menu. */
      const portes = node.querySelectorAll('a[href]').length;
      setCount(portes);
      /* Le bouton « tout déplier » lit le même relevé : sa part ouverte et
         son total ne peuvent donc pas contredire l'accordéon voisin. */
      reportFooterColDoors(listId, portes);
    };
    read();
    /* Une liste qui change — un sous-groupe ajouté, une porte retirée — relit
       son compte : la pastille ne décrit jamais la liste d'avant. */
    if (typeof MutationObserver === 'undefined') return undefined;
    const watch = new MutationObserver(read);
    watch.observe(node, { childList: true, subtree: true });
    return () => watch.disconnect();
  }, [listId]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    writeFooterCol(listId, next);
    if (saidTimer.current !== null) {
      window.clearTimeout(saidTimer.current);
      saidTimer.current = null;
    }
    /* Ouverte, la liste se lit : le chiffre n'aurait rien à annoncer. Refermée,
       il reparaît — et c'est ce retour qui se dit. Le compte est repris sur la
       liste elle-même, jamais sur un chiffre mémorisé, et la phrase attend que
       la liste se soit rangée pour ne pas parler sur une géométrie en cours. */
    if (next) {
      setSaid('');
      return;
    }
    saidTimer.current = window.setTimeout(() => {
      saidTimer.current = null;
      const node = listRef.current;
      const portes = node ? node.querySelectorAll('a[href]').length : count;
      const doorsPhrase = phrasePortesRubrique(portes, t);
      if (!doorsPhrase) return;
      setSaid(t('foot.colSaidFolded')
        .replace('{title}', title)
        .replace('{doors}', doorsPhrase));
    }, 320);
  };

  /* Le chiffre se dit en toutes lettres au lecteur d'écran, avec son accord :
     « 1 porte » n'est pas « 17 portes ». La pastille visible, elle, reste
     muette — le nom accessible du bouton porte déjà la phrase. */
  const doorsPhrase = phrasePortesRubrique(count, t);

  return (
    <div className={`footer-col${open ? ' is-open' : ''}`}>
      <h4 className="footer-col-title">{title}</h4>
      <button
        type="button"
        className="footer-col-toggle"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={doorsPhrase ? `${title} — ${doorsPhrase}` : title}
        onClick={toggle}
      >
        <span>{title}</span>
        {/* Repliée seulement : ouverte, la liste se lit et le chiffre n'aurait
            plus rien à annoncer. */}
        {!open && count > 0 && (
          <b className="footer-col-n" aria-hidden="true">{count}</b>
        )}
        <i className={open ? 'ri-subtract-line' : 'ri-add-line'} aria-hidden="true"></i>
      </button>
      {/* Le conteneur n'est plus une liste : une colonne peut porter deux
          sous-groupes de liens, chacun avec son intitulé court. Chaque
          sous-groupe apporte sa propre <ul>, et l'accordéon du téléphone
          n'en tient pas moins d'un seul geste. */}
      <div id={listId} className="footer-col-list" ref={listRef}>{children}</div>
      {/* Le compte reparu, dit une fois et à voix basse : la pastille visible
          reste la marque, cette phrase est son annonce. */}
      <p className="footer-col-said" role="status" aria-live="polite">{said}</p>
    </div>
  );
}