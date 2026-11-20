import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import BrandSeal from '@/components/feature/BrandSeal';
import FooterColumn from './FooterColumn';
import FooterColsControl from './FooterColsControl';
import FooterTradePages from './FooterTradePages';
import { SOCIAL_PROFILES } from '@/lib/socialProfiles';
import { compteMetiers } from '@/lib/metiersCompte';
import { BASE } from './nav/navShared';
import PartnerMark from '@/components/feature/PartnerMark';
import '@/components/feature/partner-mark.css';

export default function Footer() {
  const { t } = useLang();
  const { pathname, search } = useLocation();
  /* Le périmètre écrit dans l'adresse : le pied de page le lit comme les trois
     barres, pour que ses comptes soient ceux d'aujourd'hui et non ceux du
     pays entier. */
  const footParams = new URLSearchParams(search);
  const scopeRegion = footParams.get('wilaya') ?? '';
  const scopePays = footParams.get('pays') ?? '';
  const metiers = compteMetiers(scopeRegion, scopePays);
  const compteDe = (trade: string) => metiers.counts[trade] ?? 0;
  /* Le lien d'un métier garde le périmètre lu : le chiffre annoncé est
     exactement celui qu'on retrouve en l'ouvrant, région comprise. */
  const metierHref = (trade: string) => {
    const next = new URLSearchParams();
    next.set('trade', trade);
    if (scopePays) next.set('pays', scopePays);
    if (scopeRegion) next.set('wilaya', scopeRegion);
    return `/annuaire?${next.toString()}`;
  };
  const facWord = t(compteDe('faconnage') === 1 ? 'foot.faconnier' : 'foot.faconniers');
  /* The arrivals board lives on the home and directory pages: stay local there. */
  const latestHref = pathname === '/' || pathname === '/annuaire' ? '#derniers' : `${BASE}/#derniers`;
  /* Le filigrane n'a de sens que sur les pages qui se parcourent longtemps.
     Ailleurs, il ne serait qu'une tache derrière un pied de page déjà court. */
  const longPage = pathname.startsWith('/annuaire') || pathname.startsWith('/annonces');
  /* L'espace du membre et ses pages (compte, messages, console) ferment sur le
     même liseré que le reste du site : le pied de page y suit de longues
     plaques claires, et le trait doit s'y lire sans être avalé par leurs ombres. */
  const internalPage = pathname.startsWith('/compte')
    || pathname.startsWith('/messages')
    || pathname.startsWith('/admin');
  /* L'espace du membre et la messagerie bornent leur contenu à 1400 px et le
     centrent ; la console, elle, prend toute la largeur. Le pied de page suit
     donc deux mesures, pour rester sur l'axe de la page qu'il ferme — dans les
     deux sens de lecture. */
  const workspacePage = pathname.startsWith('/compte') || pathname.startsWith('/messages');
  /* Le cadre public : les pages dont le contenu s'arrête lui aussi à 1400 px —
     l'annuaire, les annonces, les offres, les emplois, les profils, le suivi,
     le dépôt et le devis. Leur pied de page suivait encore les 8vw de la
     fenêtre : au-delà de 1400 px, le cachet et les deux colonnes partaient de
     plus en plus loin à gauche des cartes qu'ils prolongent. Il reprend donc
     la même mesure qu'elles. La page d'accueil, elle, n'entre pas dans ce
     cadre : ses panneaux occupent la fenêtre. */
  const publicFramePage = !internalPage && (
    pathname.startsWith('/annuaire')
    || pathname.startsWith('/annonces')
    || pathname.startsWith('/candidats')
    || pathname.startsWith('/emplois')
    || pathname.startsWith('/entreprise')
    || pathname === '/offres'
    || pathname.startsWith('/suivi')
    || pathname === '/deposer'
    || pathname === '/devis'
    || pathname === '/mentions-legales'
    || pathname === '/confidentialite'
    || pathname === '/plan-du-site'
    || pathname === '/sitemap'
    || pathname === '/arabe-world'
    || pathname.startsWith('/demande-b2b')
    || pathname.startsWith('/demande-marche')
  );

  /* « Signaler un contenu » : un message déjà adressé à l'équipe, avec
     l'adresse de la page sous les yeux. Rien ne part tant que le visiteur n'a
     pas envoyé lui-même le message. */
  const signalHref = (() => {
    const page = typeof window === 'undefined' ? `${BASE}${pathname}` : window.location.href;
    const sujet = t('foot.signalSubject');
    const corps = t('foot.signalBody').replace('{url}', page);
    return `mailto:contact@paperatlas.net?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
  })();

  return (
    <footer className={`footer${internalPage ? ' is-internal' : ''}${workspacePage ? ' is-workspace' : ''}${publicFramePage ? ' is-public' : ''}`}>
      {longPage && <BrandSeal className="footer-watermark" />}
      <p className="footer-line" dangerouslySetInnerHTML={{ __html: t('foot.line') }} />
      {/* Un seul geste pour les deux groupes de liens : il paraît là où les
          accordéons existent, et il retient son choix comme chacun d'eux. */}
      <FooterColsControl />
      <div className="footer-grid">
        <div className="footer-brand">
          {/* Le pied de page répond à la barre : le cachet du papier, un filet,
              puis l'emblème « Arabe World » et son lettrage arabe. Les deux
              marques se lisent donc en haut et en bas de chaque page, dans le
              même ordre — et la seconde ouvre sa propre page. */}
          <div className="footer-marks">
            <BrandSeal className="footer-seal" label="PaperAtlas" />
            <span className="footer-marks-rule" aria-hidden="true" />
            <Link
              className="footer-partner"
              to="/arabe-world"
              title={t('foot.arabeworld')}
              aria-label={`Arabe World — ${t('foot.arabeworld')}`}
            >
              <PartnerMark />
            </Link>
          </div>
          <h4>PaperAtlas</h4>
          <p>{t('foot.desc')}</p>
          {/* Chaque réseau porte sa marque : la pastille reste neutre au
              repos, et prend sa couleur propre au survol. Une adresse écrite
              dans le jeu de profils rallume la pastille ; sans adresse, elle
              reste un repère, sans lien qui renverrait ailleurs. */}
          <div className="socials">
            {SOCIAL_PROFILES.map((profile) => (profile.href ? (
              <a
                key={profile.key}
                className={`social social--${profile.key}`}
                href={profile.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${profile.label} — ${t('foot.socialOpen')}`}
                title={`${profile.label} · ${t('foot.socialOpen')}`}
              >
                <i className={profile.icon} aria-hidden="true"></i>
              </a>
            ) : (
              <span
                key={profile.key}
                className={`social social--${profile.key} is-pending`}
                role="img"
                aria-label={`${profile.label} — ${t('foot.socialSoon')}`}
                title={`${profile.label} · ${t('foot.socialSoon')}`}
              >
                <i className={profile.icon} aria-hidden="true"></i>
              </span>
            )))}
          </div>
        </div>
        {/* Un seul bloc de portes illustrées : la plateforme garde ses liens
            principaux, et les métiers comme le contact se rangent dessous,
            sous un intitulé plus court, au lieu de faire deux colonnes à part. */}
        <div className="footer-links">
        <FooterColumn title={t('foot.platform')} listId="foot-platform">
            {/* Quinze portes sur une seule liste faisaient une colonne trop
                longue : elles se lisent maintenant en deux sous-groupes
                courts — ce qui se visite, puis ce qui vous appartient. */}
            <div className="footer-group">
              <p className="footer-group-title">{t('foot.site')}</p>
              <ul>
                {/* La colonne se lit dans l'ordre du panneau « Plus » : le
                    réseau d'abord — l'annuaire, puis ses deux tableaux —, et
                    le travail ensuite. Le bas de page raconte donc la même
                    histoire que le menu, dans le même ordre. */}
                <li><Link to="/annuaire"><i className="ri-building-4-line" aria-hidden="true"></i>{t('foot.directory')}</Link></li>
                <li><Link to="/annonces"><i className="ri-megaphone-line" aria-hidden="true"></i>{t('nav.annonces')}</Link></li>
                <li><Link to="/emplois"><i className="ri-briefcase-line" aria-hidden="true"></i>{t('nav.emplois')}</Link></li>
                {/* Le filet de la famille : Annonces et Emplois ferment la
                    parenté de l'annuaire, puis Auteurs reprend la liste. Il
                    traverse les deux rangs et reste d'un cran plus bas que le
                    liseré des colonnes — une couture, pas une frontière. */}
                <li className="footer-site-rule" aria-hidden="true" />
                {/* Sous le filet, un mot discret le nomme : la couture ne se
                    lit plus comme une simple séparation, mais comme le pas
                    vers la suite du réseau — les plumes, le vivier, les
                    guichets. Il ne prend la place d'aucune porte. */}
                <li className="footer-site-seam">{t('foot.seam')}</li>
                <li><Link to="/annuaire?kind=auteurs"><i className="ri-quill-pen-line" aria-hidden="true"></i>{t('foot.authors')}</Link></li>
                <li><Link to="/candidats"><i className="ri-user-follow-line" aria-hidden="true"></i>{t('candlist.short')}</Link></li>
                <li><Link to="/candidats?fresh=1"><i className="ri-user-star-line" aria-hidden="true"></i>{t('candlist.newLink')}</Link></li>
                {/* La seconde marque du réseau a sa page : elle se lit d'ici
                    comme le cachet se lit dans la barre. */}
                <li><Link to="/arabe-world"><i className="ri-global-line" aria-hidden="true"></i>{t('foot.arabeworld')}</Link></li>
                {/* Les trois guichets ferment le réseau, exactement là où le
                    panneau les range. */}
                <li><Link to="/demandes"><i className="ri-survey-line" aria-hidden="true"></i>{t('nav.demandes')}</Link></li>
                {/* Puis le travail : le lieu de la page, la demande B2B et la
                    muraille des offres, dans l'ordre du menu. */}
                <li><a href={`${BASE}/#soustraitance`}><i className="ri-stack-line" aria-hidden="true"></i>{t('foot.sub')}</a></li>
                <li><Link to="/demande-b2b"><i className="ri-inbox-archive-line" aria-hidden="true"></i>{t('nav.b2b')}</Link></li>
                <li><Link to="/offres"><i className="ri-price-tag-3-line" aria-hidden="true"></i>{t('nav.offres')}</Link></li>
                {/* The quote is composed from the offers page only: the footer
                    keeps the plans door above and never opens a second way in. */}
                {/* The file tracking sits next to the quote: a reference received
                    by e-mail is followed from the footer of any page. */}
                <li><Link to="/suivi"><i className="ri-truck-line" aria-hidden="true"></i>{t('nav.suivi')}</Link></li>
                <li><Link to="/deposer"><i className="ri-upload-cloud-2-line" aria-hidden="true"></i>{t('foot.deposit')}</Link></li>
                <li><a href={latestHref}><i className="ri-time-line" aria-hidden="true"></i>{t('foot.latest')}</a></li>
              </ul>
            </div>
            <div className="footer-group">
              <p className="footer-group-title">{t('foot.space')}</p>
              <ul>
                <li><Link to="/compte"><i className="ri-user-settings-line" aria-hidden="true"></i>{t('nav.compte')}</Link></li>
                <li><Link to="/compte/inscription"><i className="ri-user-add-line" aria-hidden="true"></i>{t('acct.toSignup')}</Link></li>
                <li><Link to="/compte/inscription/candidat"><i className="ri-id-card-line" aria-hidden="true"></i>{t('foot.candidates')}</Link></li>
              </ul>
            </div>
        </FooterColumn>
        {/* Métiers et contact réunis sous un intitulé plus court : les sept
            portes gardent leur signe, mais elles ne tiennent plus deux
            colonnes à elles seules. */}
        <FooterColumn title={t('foot.elsewhere')} listId="foot-elsewhere">
            <ul>
            {/* Chaque porte de métier annonce son compte dans le périmètre
                lu : une région choisie fait descendre le chiffre, et le lien
                la garde, pour que le nombre annoncé soit celui qu'on voit. */}
            <li>
              <Link
                to={metierHref('impression')}
                className="footer-fac"
                aria-label={`${t('foot.imprimeries')} — ${compteDe('impression')}`}
                title={`${t('foot.imprimeries')} ${compteDe('impression')}`}
              >
                <i className="ri-printer-line" aria-hidden="true"></i>
                {t('foot.imprimeries')}
                <span className="footer-count" aria-hidden="true">{compteDe('impression')}</span>
              </Link>
            </li>
            <li>
              <Link
                to={metierHref('edition')}
                className="footer-fac"
                aria-label={`${t('foot.editeurs')} — ${compteDe('edition')}`}
                title={`${t('foot.editeurs')} ${compteDe('edition')}`}
              >
                <i className="ri-book-open-line" aria-hidden="true"></i>
                {t('foot.editeurs')}
                <span className="footer-count" aria-hidden="true">{compteDe('edition')}</span>
              </Link>
            </li>
            {/* Le même compte que dans la barre, jusqu'au dernier lien du site :
                le chiffre descend avec le libellé, et c'est le lien qui le
                porte — une seule porte, une seule tournure. */}
            <li>
              <Link
                to={metierHref('faconnage')}
                className="footer-fac"
                aria-label={`${facWord} ${compteDe('faconnage')} — ${t('navm.faconActive')}`}
                title={`${facWord} ${compteDe('faconnage')} — ${t('navm.faconActive')}`}
              >
                <i className="ri-scissors-cut-line" aria-hidden="true"></i>
                {facWord}
                <span className="footer-count" aria-hidden="true">{compteDe('faconnage')}</span>
              </Link>
            </li>
            <li>
              <Link
                to={metierHref('fournisseurs')}
                className="footer-fac"
                aria-label={`${t('foot.fournisseurs')} — ${compteDe('fournisseurs')}`}
                title={`${t('foot.fournisseurs')} ${compteDe('fournisseurs')}`}
              >
                <i className="ri-store-2-line" aria-hidden="true"></i>
                {t('foot.fournisseurs')}
                <span className="footer-count" aria-hidden="true">{compteDe('fournisseurs')}</span>
              </Link>
            </li>
            <li><a href="mailto:contact@paperatlas.net"><i className="ri-mail-line" aria-hidden="true"></i>contact@paperatlas.net</a></li>
            <li><a href={`${BASE}/#annuaire`}><i className="ri-map-pin-2-line" aria-hidden="true"></i>{t('foot.cities')}</a></li>
            {/* « Demandes » a rejoint le réseau, dans la première colonne :
                le pied de page ne la nomme plus deux fois. */}
            </ul>
        </FooterColumn>
        </div>
      </div>
      {/* Le maillage des pages par pays : chaque famille ouvre sa ligne, et
          chaque pays mène à sa propre adresse — un chemin stable pour le
          lecteur comme pour le moteur de recherche. */}
      <FooterTradePages pays={scopePays} />
      <div className="legal">
        <span>{t('foot.rights')}</span>
        {/* Les deux textes légaux sont des pages : le pied de page les ouvre
            au lieu de les nommer sans destination. Le troisième lien, lui,
            n'ouvre pas une page : il adresse un message à l'équipe. */}
        <span className="legal-links">
          <Link to="/mentions-legales">{t('foot.legalMentions')}</Link>
          <span aria-hidden="true">·</span>
          <Link to="/confidentialite">{t('foot.legalPrivacy')}</Link>
          {/* Le plan du site : toutes les pages de type et de pays réunies
              sur une seule adresse, pour le lecteur comme pour le robot. */}
          <span aria-hidden="true">·</span>
          <Link to="/plan-du-site">{t('foot.sitemap')}</Link>
          {/* Le troisième lien du pied de page : il n'ouvre pas une page mais
              un message déjà écrit à l'équipe, page citée. */}
          <span aria-hidden="true">·</span>
          <a href={signalHref} title={t('foot.signalSubject')}>
            {t('foot.signal')}
          </a>
        </span>
      </div>
    </footer>
  );
}