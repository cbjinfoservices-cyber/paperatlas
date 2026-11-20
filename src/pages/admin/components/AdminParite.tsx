import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import {
  agePlusAnciennePose,
  agePlusJeunePose,
  agePosee,
  copierLienReleve,
  copierParite,
  copierRetourParite,
  datePosee,
  ecartEnTete,
  fichierAccorde,
  fichiersEnEcart,
  fichierEnTete,
  grouperRetourParFichier,
  lireRetourParite,
  marquerPosees,
  nombreDatees,
  releveParite,
  resteACompleter,
  restePoseFichier,
  trierParEcart,
  telechargerPariteCsv,
  telechargerPariteResteCsv,
  telechargerPariteTraduitesCsv,
  telechargerReleveCsv,
  trierParAgeJeune,
  trierParPose,
  trierParPoseAncien,
  type PariteFichier,
  type TraductionRendue,
} from './adminPariteCore';
import { enregistrerPosees, lireDatesPosee, type DatesPose } from './adminPariteMemory';

/** Le nombre de clés nommées avant de résumer le reste : au-delà, la ligne
 *  deviendrait un mur et le relecteur n'y lirait plus rien. */
const MAX_CLES = 30;

/**
 * Le resserrement demandé par une pastille de pose : le relevé ne montre plus
 * qu'un fichier, et les clés qui portent la famille nommée. Une pastille qui
 * mène au travail doit ouvrir sur ce travail-là, pas sur les vingt et un
 * fichiers du site.
 */
export type PariteFocus = {
  fichier: string;
  prefixes?: string[];
  /** Ce qui restait à poser au moment où le lien a été copié : il se lit dans
   *  le resserrement, pour que le relecteur sache où il met les pieds. */
  reste?: number;
};

type Props = {
  /** Le fichier nommé par l'écran d'où l'on vient, s'il y en a un. */
  focus?: PariteFocus | null;
};

/**
 * L'égalité des clés entre le français, l'arabe et l'anglais, fichier par
 * fichier.
 *
 * Le panneau ne vérifie pas une intention, il lit les dictionnaires que le
 * site embarque : une clé qui n'existe pas dans un fichier n'existe nulle part
 * pour l'écran qui s'en sert, et le site retombe alors sur l'anglais sans le
 * dire. C'est exactement le trou que ce bloc rend visible, en le nommant.
 */
export default function AdminParite({ focus = null }: Props) {
  const { t } = useLang();
  const releve = useMemo(() => releveParite(), []);
  /* Le resserrement reçu d'un écran : il se retire d'un clic, sans quitter la
     console, et ne revient pas tant que la même porte n'est pas rejouée. */
  const [reserre, setReserre] = useState<PariteFocus | null>(focus);
  const focusVu = useRef<PariteFocus | null>(focus);
  /* Le panneau s'ouvre sur le travail : les fichiers déjà justes se déplient
     d'un clic, mais ils ne prennent pas la place des autres. */
  const [tous, setTous] = useState(false);
  /* Le relevé s'emporte en texte : les noms de clés partent intacts, prêts à
     être collés dans un message ou un carnet de correction. */
  const [copie, setCopie] = useState<'non' | 'ok' | 'echec'>('non');
  /* Le relevé part aussi en CSV : une ligne par fichier, les noms de clés
     dans leurs propres colonnes, prêt à être confié à un relecteur. */
  const [emporte, setEmporte] = useState(false);
  /* Le relevé revenu du relecteur : ses clés, la traduction qu'il a écrite en
     face, et celles qu'il a laissées vides. Rien n'est enregistré — la console
     lit le fichier et le nomme, pour que les clés se complètent une à une. */
  const [retour, setRetour] = useState<TraductionRendue[] | null>(null);
  const [retourNom, setRetourNom] = useState('');
  const [retourErreur, setRetourErreur] = useState('');
  const [copieRetour, setCopieRetour] = useState<'non' | 'ok' | 'echec'>('non');
  /* Les clés déjà posées depuis restent nommées, mais elles se rangent : le
     relevé s'ouvre sur ce qui reste à faire, et le jeton les rappelle. */
  const [voirPosees, setVoirPosees] = useState(false);
  /* Le jeton des traductions rendues et pas encore posées : la liste se réduit
     à elles seules, et la copie ne prend qu'elles — d'un trait. */
  const [voirTraduites, setVoirTraduites] = useState(false);
  /* Le second passage part en CSV, réduit aux seules clés encore vides. */
  const [resteEmporte, setResteEmporte] = useState(false);
  /* Les traductions rendues partent aussi en CSV : le fichier se transmet sans
     passer par la copie de texte. */
  const [traduitesEmporte, setTraduitesEmporte] = useState(false);
  /* Les lignes gommées pendant la visite, et l'état du relevé avant le premier
     effacement : une gomme trop rapide se rattrape d'un geste, sans réimporter
     le fichier. */
  const [gommees, setGommees] = useState(0);
  const [avantGomme, setAvantGomme] = useState<TraductionRendue[] | null>(null);
  /* Les lignes rappelées pendant la visite : leur compte entre dans le nom du
     relevé re-téléchargé, pour que deux relevés d’une même journée ne se
     confondent pas dans un dossier de téléchargements. */
  const [rappelees, setRappelees] = useState(0);
  /* Le relevé tel qu’il se lit, emporté d’un geste. */
  const [releveEmporte, setReleveEmporte] = useState(false);
  /* Les jours de pose retenus par l’appareil, et l’ordre de lecture qui s’y
     appuie : les traductions les plus récentes en tête, pour relire la
     dernière visite avant les anciennes. */
  const [datesPose, setDatesPose] = useState<DatesPose>(() => lireDatesPosee());
  const [triPose, setTriPose] = useState(false);
  /* Le second ordre par date : les traductions posées il y a le plus
     longtemps passent devant, parce que ce sont elles qui attendent un
     second regard depuis le plus de jours. Les deux tris s’excluent. */
  const [triAncien, setTriAncien] = useState(false);
  /* Le troisième ordre par âge : les poses les plus jeunes en tête, pour
     relire d’abord ce qui vient d’être posé. Il s’exclut des deux autres. */
  const [triJeune, setTriJeune] = useState(false);
  /* La recherche par nom de fichier : retrouver « dict.legal.ts » sans
     parcourir les vingt et un fichiers ni passer par une pastille d'écran. */
  const [recherche, setRecherche] = useState('');
  /* La recherche dans le relevé importé : ne garder que les lignes d'un
     fichier nommé, sans dérouler les vingt et un fichiers du site. */
  const [rechercheRetour, setRechercheRetour] = useState('');
  /* Le rangement des fichiers par nombre de clés en écart : le plus creusé
     ouvre la liste, et chaque ligne dit alors son propre écart. */
  const [triEcart, setTriEcart] = useState(false);
  const minuterie = useRef<number | null>(null);
  const minuterieCsv = useRef<number | null>(null);
  const minuterieRetour = useRef<number | null>(null);
  const minuterieReste = useRef<number | null>(null);
  const minuterieTraduites = useRef<number | null>(null);
  const minuterieReleve = useRef<number | null>(null);

  useEffect(() => {
    if (focus === focusVu.current) return;
    focusVu.current = focus;
    setReserre(focus);
  }, [focus]);

  useEffect(() => () => {
    if (minuterie.current) window.clearTimeout(minuterie.current);
    if (minuterieCsv.current) window.clearTimeout(minuterieCsv.current);
    if (minuterieRetour.current) window.clearTimeout(minuterieRetour.current);
    if (minuterieReste.current) window.clearTimeout(minuterieReste.current);
    if (minuterieTraduites.current) window.clearTimeout(minuterieTraduites.current);
    if (minuterieReleve.current) window.clearTimeout(minuterieReleve.current);
  }, []);

  const exporter = () => {
    try {
      telechargerPariteCsv();
      setEmporte(true);
      if (minuterieCsv.current) window.clearTimeout(minuterieCsv.current);
      minuterieCsv.current = window.setTimeout(() => setEmporte(false), 4000);
    } catch {
      /* Un navigateur qui refuse le téléchargement laisse l'écran intact. */
      setEmporte(false);
    }
  };

  const copier = async () => {
    const parti = await copierParite();
    setCopie(parti ? 'ok' : 'echec');
    if (minuterie.current) window.clearTimeout(minuterie.current);
    minuterie.current = window.setTimeout(() => setCopie('non'), 4000);
  };

  /* Le fichier revenu : la console le lit, ne l'envoie nulle part. Un fichier
     qui ne porte pas la feuille « À compléter » est dit tel quel, plutôt que
     d'afficher un tableau vide qui passerait pour un relevé complet. */
  const lireFichier = async (fichier: File | undefined) => {
    if (!fichier) return;
    setRetourErreur('');
    setRetourNom(fichier.name);
    try {
      const texte = await fichier.text();
      const lues = lireRetourParite(texte);
      if (lues.length === 0) {
        setRetour(null);
        setRetourErreur(t('ad.par.importErr'));
        return;
      }
      setRetour(lues);
      setVoirPosees(false);
      setVoirTraduites(false);
      setGommees(0);
      setAvantGomme(null);
      setRappelees(0);
      setReleveEmporte(false);
      setRechercheRetour('');
      setTriPose(false);
      setTriAncien(false);
      setTriJeune(false);
      /* L’ouverture d’un relevé est le premier jour où la console voit ses
         clés posées : le carnet se remplit ici, pour que le tri par date ait
         de quoi ranger avant même le premier téléchargement. */
      setDatesPose(enregistrerPosees(marquerPosees(lues)));
    } catch {
      setRetour(null);
      setRetourErreur(t('ad.par.importErr'));
    }
  };

  const copierRetour = async () => {
    if (!retour) return;
    const parti = await copierRetourParite(visiblesRetour);
    setCopieRetour(parti ? 'ok' : 'echec');
    if (minuterieRetour.current) window.clearTimeout(minuterieRetour.current);
    minuterieRetour.current = window.setTimeout(() => setCopieRetour('non'), 4000);
  };

  /* La gomme d'une ligne : la traduction déjà recopiée sort du relevé, sans
     que le fichier entier s'en aille — le reste du travail reste sous les
     yeux, et les compteurs se refont sur ce qui demeure. */
  const gommer = (entree: TraductionRendue) => {
    if (!retour) return;
    const rang = retour.findIndex(
      (row) => row.fichier === entree.fichier
        && row.langue === entree.langue
        && row.cle === entree.cle,
    );
    if (rang < 0) return;
    /* Le premier effacement retient le relevé tel qu'il était : c'est lui que
       le rappel remet en place, avec toutes les lignes gommées depuis. */
    if (avantGomme === null) setAvantGomme(retour);
    const suite = [...retour.slice(0, rang), ...retour.slice(rang + 1)];
    setRetour(suite.length > 0 ? suite : null);
    setGommees((n) => n + 1);
    setCopieRetour('non');
  };

  /* Le rappel : les lignes gommées reviennent à leur place, avec leurs
     traductions, et le relevé reprend sa forme d'avant le premier effacement. */
  const rappelerGommees = () => {
    if (!avantGomme) return;
    setRetour(avantGomme);
    setAvantGomme(null);
    /* Ce qui revient se garde en compte : le nom du relevé re-téléchargé dit
       combien de lignes ont été rappelées pendant la visite. */
    setRappelees((n) => n + gommees);
    setGommees(0);
    setReleveEmporte(false);
    setCopieRetour('non');
  };

  /* Le second passage : le fichier ne porte que les clés encore vides, celles
     que ni le relecteur ni le site n'ont encore remplies. */
  const exporterReste = () => {
    try {
      telechargerPariteResteCsv(marquees);
      setResteEmporte(true);
      if (minuterieReste.current) window.clearTimeout(minuterieReste.current);
      minuterieReste.current = window.setTimeout(() => setResteEmporte(false), 4000);
    } catch {
      /* Un navigateur qui refuse le téléchargement laisse l'écran intact. */
      setResteEmporte(false);
    }
  };

  /* Les seules traductions rendues que le site ne porte pas encore, emportées
     en CSV : la liste et le fichier parlent du même travail. */
  const exporterTraduites = () => {
    try {
      telechargerPariteTraduitesCsv(marquees);
      setTraduitesEmporte(true);
      if (minuterieTraduites.current) window.clearTimeout(minuterieTraduites.current);
      minuterieTraduites.current = window.setTimeout(
        () => setTraduitesEmporte(false),
        4000,
      );
    } catch {
      /* Un navigateur qui refuse le téléchargement laisse l'écran intact. */
      setTraduitesEmporte(false);
    }
  };

  /* Le relevé tel qu’il se lit, emporté avec le compte des rappelées dans
     son nom : le fichier se range à côté des autres sans les confondre. */
  const exporterReleve = () => {
    try {
      telechargerReleveCsv(marquees, rappelees);
      setDatesPose(enregistrerPosees(marquees));
      setReleveEmporte(true);
      if (minuterieReleve.current) window.clearTimeout(minuterieReleve.current);
      minuterieReleve.current = window.setTimeout(() => setReleveEmporte(false), 4000);
    } catch {
      /* Un navigateur qui refuse le téléchargement laisse l’écran intact. */
      setReleveEmporte(false);
    }
  };

  const rendues = retour ? retour.filter((entree) => entree.traduction !== '').length : 0;

  /* Le relevé importé, relu sur les dictionnaires du site : une clé posée
     depuis ne se corrige plus. Les posées se comptent, les restantes se
     nomment, le relevé s'ouvre sur ce qui reste. */
  const marquees = useMemo(() => (retour ? marquerPosees(retour) : []), [retour]);
  const posees = marquees.filter((entree) => entree.posee).length;
  const resteVides = resteACompleter(marquees).length;
  /* Les traductions rendues que le site ne porte pas encore : c'est le travail
     qui se recopie tout de suite, une clé après l'autre. */
  const traduitesNonPosees = marquees.filter(
    (entree) => !entree.posee && entree.traduction !== '',
  );
  const visiblesRetour = voirTraduites
    ? traduitesNonPosees
    : voirPosees
      ? marquees
      : marquees.filter((entree) => !entree.posee);
  /* Les lignes rangées par date de pose : les plus récentes en tête, les
     jours inconnus à la fin. Le tri ne touche pas au relevé lui-même — la
     copie garde l’ordre du fichier, et le fichier garde ses groupes. Le jeton
     ne paraît que si la liste lue porte vraiment des jours : un tri qui ne
     peut rien ranger ne s’annonce pas. */
  const datees = nombreDatees(visiblesRetour, datesPose);
  /* L’âge de la plus ancienne pose lue : le tri « À revoir en premier » le dit
     en tête du relevé, avant même qu’on le clique — c’est le temps qui sépare
     la traduction la plus ancienne d’aujourd’hui. */
  const ageAncien = datees > 0 ? agePlusAnciennePose(visiblesRetour, datesPose) : null;
  /* L’âge de la plus jeune pose lue : le tri « plus jeunes en tête » le dit
     sur son jeton, comme l’autre extrémité. */
  const ageJeune = datees > 0 ? agePlusJeunePose(visiblesRetour, datesPose) : null;
  /* Le relevé importé se range d'abord par fichier, le plus creusé en tête,
     puis par l'ordre choisi à l'intérieur de chaque fichier : le relecteur
     attaque un fichier d'un trait, au lieu de sauter de l'un à l'autre au fil
     des clés. Une ligne déjà rangée garde sa place dans son groupe. */
  const termeRetour = rechercheRetour.trim().toLowerCase();
  const groupesRetour = useMemo(() => {
    const dedans = (lignes: typeof visiblesRetour) => {
      if (datees === 0) return lignes;
      if (triJeune) return trierParAgeJeune(lignes, datesPose);
      if (triAncien) return trierParPoseAncien(lignes, datesPose);
      if (triPose) return trierParPose(lignes, datesPose);
      return lignes;
    };
    return grouperRetourParFichier(visiblesRetour)
      .filter((groupe) => termeRetour === ''
        || groupe.fichier.toLowerCase().includes(termeRetour))
      .map((groupe) => ({ fichier: groupe.fichier, entrees: dedans(groupe.entrees) }));
  }, [visiblesRetour, datees, triJeune, triAncien, triPose, datesPose, termeRetour]);
  /* Le compte des lignes que la recherche laisse voir : il se lit à côté du
     champ, pour que le relecteur sache ce qu'il reste dans le relevé. */
  const lignesRetour = groupesRetour.reduce((n, groupe) => n + groupe.entrees.length, 0);

  /* Le resserrement décide du stock lu : un seul fichier, montré tel qu'il
     est — même complet —, pour que la pastille ne mène jamais à une liste
     vide. */
  const prefixesFokus = reserre?.prefixes ?? [];
  const lus = reserre
    ? releve.fichiers.filter((f) => f.fichier === reserre.fichier)
    : releve.fichiers;
  /* La recherche par nom de fichier se compose avec le resserrement et avec
     « Tous les fichiers » : elle traverse le stock déjà lu, elle ne le
     remplace pas. Un fichier resserré reste montré même complet. */
  const terme = recherche.trim().toLowerCase();
  const cherches = terme === ''
    ? lus
    : lus.filter((f) => f.fichier.toLowerCase().includes(terme));
  /* Une recherche nomme un fichier : elle le montre même s'il est déjà
     complet, sinon le relecteur conclurait qu'il n'existe pas. */
  const lusLus = terme !== '' || reserre || tous
    ? cherches
    : cherches.filter((f) => !fichierAccorde(f));
  /* Le rangement par clés en écart se pose sur ce que l'écran montre vraiment :
     le resserrement, la recherche et « Tous les fichiers » compris. */
  const visibles = triEcart ? trierParEcart(lusLus, prefixesFokus) : lusLus;
  /* Le poids du fichier qui ouvre la liste : le jeton le dit sans qu'on ouvre
     une ligne. */
  const ecartTete = ecartEnTete(visibles, prefixesFokus);
  /* Combien de fichiers portent encore un écart : le jeton du tri le dit à
     côté du poids du premier, pour que le relecteur sache l'étendue du
     travail, pas seulement son fichier le plus creusé. */
  const fichiersEcart = fichiersEnEcart(visibles, prefixesFokus);
  /* Son nom, à côté du chiffre : le relecteur sait lequel est le plus creusé
     sans dérouler la liste ni compter les clés ligne à ligne. */
  const fichierTete = ecartTete > 0 ? fichierEnTete(visibles, prefixesFokus) : '';
  /* L’âge de la plus jeune pose du relevé entier : le jeton « Relevé à
     l’écran » le dit à côté des posées et des rappelées, sans qu’on ouvre un
     tri pour le lire. */
  const ageJeuneReleve = posees > 0 ? agePlusJeunePose(marquees, datesPose) : null;
  const ecart = releve.total - releve.accords;

  return (
    <div className="suivi-par" dir="ltr">
      <div className="suivi-par-head">
        <div className="suivi-par-head-txt">
          <h4 className="suivi-par-title">{t('ad.par.title')}</h4>
          <p className="suivi-par-note">{t('ad.par.note')}</p>
        </div>
        {/* Le resserrement reçu d'une pastille de pose : il se dit ici, et se
            retire d'un clic — le relevé entier revient sans quitter l'onglet. */}
        {reserre && (
          <>
            <button
              type="button"
              className="suivi-rl-chip"
              data-on="yes"
              title={`${t('ad.par.focusHint')} · ${t('ad.par.focusClear')}`}
              onClick={() => setReserre(null)}
            >
              <i className="ri-focus-3-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">
                {t('ad.par.focusOn').replace('{fichier}', reserre.fichier)}
                {prefixesFokus.length > 0
                  ? ` · ${t('ad.par.focusFam').replace('{fam}', prefixesFokus.join(' '))}`
                  : ''}
              </span>
              {/* Le lien copié portait son reste : il se lit ici, pour que le
                  relecteur sache sur quoi il arrive. */}
              {Boolean(reserre.reste) && (
                <em
                  className="suivi-par-tri-age"
                  title={t('ad.par.focusResteHint')}
                >
                  {t('ad.par.focusReste').replace('{n}', String(reserre.reste))}
                </em>
              )}
              <i className="ri-close-line" aria-hidden="true"></i>
            </button>
            {/* Le resserrement s'écrit : l'adresse copiée rouvre le relevé sur
                ce seul fichier, sans repasser par les vingt et un autres. */}
            <CopieLien
              fichier={reserre.fichier}
              prefixes={prefixesFokus}
              label={t('ad.par.focusLink')}
              hint={t('ad.par.focusLinkHint')}
            />
          </>
        )}
        {!reserre && (
          <button
            type="button"
            className="suivi-rl-chip"
            data-on={tous ? 'yes' : 'no'}
            aria-pressed={tous}
            title={tous ? t('ad.par.onlyGapsHint') : t('ad.par.showAllHint')}
            onClick={() => setTous((avant) => !avant)}
          >
            <i className="ri-list-check-2" aria-hidden="true"></i>
            <span className="whitespace-nowrap">
              {tous ? t('ad.par.onlyGaps') : t('ad.par.showAll')}
            </span>
            <b>{visibles.length}</b>
          </button>
        )}
        {/* Le rangement par clés en écart : le fichier le plus creusé ouvre la
            liste, et chaque ligne dit alors son propre écart. Le chiffre du
            jeton est le poids de ce fichier de tête. */}
        <button
          type="button"
          className="suivi-rl-chip"
          data-on={triEcart ? 'yes' : 'no'}
          aria-pressed={triEcart}
          title={triEcart ? t('ad.par.triEcartBackHint') : t('ad.par.triEcartHint')}
          onClick={() => setTriEcart((avant) => !avant)}
        >
          <i className="ri-bar-chart-horizontal-line" aria-hidden="true"></i>
          <span className="whitespace-nowrap">
            {triEcart ? t('ad.par.triEcartOn') : t('ad.par.triEcart')}
          </span>
          {fichiersEcart > 0 && (
            <em
              className="suivi-par-tri-age"
              title={`${t('ad.par.triEcartHeadHint')}${fichierTete ? ` · ${fichierTete}` : ''}`}
            >
              {t('ad.par.triEcartHeadFiles')
                .replace('{k}', String(fichiersEcart))
                .replace('{f}', fichierTete)
                .replace('{n}', String(ecartTete))}
            </em>
          )}
        </button>
        {/* La porte du retour : le CSV rempli par le relecteur rentre ici, et
            la console nomme chaque clé rendue. */}
        <label className="suivi-rl-chip suivi-par-import-btn" title={t('ad.par.importHint')}>
          <i className="ri-upload-2-line" aria-hidden="true"></i>
          <span className="whitespace-nowrap">{t('ad.par.import')}</span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="suivi-par-import-input"
            onChange={(event) => {
              void lireFichier(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </label>
        <button
          type="button"
          className="suivi-rl-chip"
          data-on={emporte ? 'yes' : 'no'}
          title={t('ad.par.csvHint')}
          onClick={exporter}
        >
          <i
            className={emporte ? 'ri-check-line' : 'ri-file-download-line'}
            aria-hidden="true"
          ></i>
          <span className="whitespace-nowrap">
            {emporte ? t('ad.par.csvOk') : t('ad.par.csv')}
          </span>
        </button>
        <button
          type="button"
          className="suivi-rl-chip"
          data-on={copie === 'ok' ? 'yes' : 'no'}
          title={t('ad.par.copyHint')}
          onClick={copier}
        >
          <i
            className={
              copie === 'ok'
                ? 'ri-check-line'
                : copie === 'echec'
                  ? 'ri-error-warning-line'
                  : 'ri-file-copy-line'
            }
            aria-hidden="true"
          ></i>
          <span className="whitespace-nowrap">
            {copie === 'ok'
              ? t('ad.par.copyOk')
              : copie === 'echec'
                ? t('ad.par.copyFail')
                : t('ad.par.copy')}
          </span>
        </button>
      </div>

      {/* La recherche par nom de fichier : le relecteur retrouve « dict.legal.ts »
          en le nommant, sans passer par une pastille d'écran ni dérouler les
          vingt et un fichiers. Elle se compose avec le resserrement. */}
      <div className="suivi-par-cherche">
        <i className="ri-search-line" aria-hidden="true"></i>
        <input
          type="search"
          className="suivi-par-cherche-input"
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
          placeholder={t('ad.par.searchPh')}
          aria-label={t('ad.par.searchPh')}
          title={t('ad.par.searchHint')}
        />
        {recherche !== '' && (
          <button
            type="button"
            className="suivi-par-cherche-clear"
            onClick={() => setRecherche('')}
            aria-label={t('ad.par.searchClear')}
            title={t('ad.par.searchClear')}
          >
            <i className="ri-close-circle-line" aria-hidden="true"></i>
          </button>
        )}
        {terme !== '' && (
          <span className="suivi-par-cherche-n" title={t('ad.par.searchHint')}>
            {t('ad.par.searchCount').replace('{n}', String(visibles.length))}
          </span>
        )}
      </div>

      {/* Les trois chiffres du relevé : ce qui manque de chaque côté, et le
          nombre de fichiers qui portent exactement la même liste de clés. */}
      <div className="suivi-par-tally">
        <p className="suivi-par-cell" data-etat={releve.manqueAr > 0 ? 'ecart' : 'ok'}>
          <span className="suivi-par-cell-lang">AR</span>
          <b>{releve.manqueAr}</b>
          <span className="suivi-par-cell-lbl">{t('ad.par.missAr')}</span>
        </p>
        <p className="suivi-par-cell" data-etat={releve.manqueEn > 0 ? 'ecart' : 'ok'}>
          <span className="suivi-par-cell-lang">EN</span>
          <b>{releve.manqueEn}</b>
          <span className="suivi-par-cell-lbl">{t('ad.par.missEn')}</span>
        </p>
        <p className="suivi-par-cell" data-etat={ecart > 0 ? 'ecart' : 'ok'}>
          <span
            className="suivi-par-cell-lang w-[13px] h-[13px] flex items-center justify-center"
            aria-hidden="true"
          >
            <i className="ri-check-double-line"></i>
          </span>
          <b>
            {releve.accords} / {releve.total}
          </b>
          <span className="suivi-par-cell-lbl">
            {t('ad.par.filesOk').replace('{n}', String(releve.total))}
          </span>
        </p>
      </div>

      {/* Les lignes gommées pendant la visite : leur compte se lit, et le
          geste d'à côté les rappelle toutes — un effacement trop rapide ne
          coûte pas le fichier, ni un second import. */}
      {gommees > 0 && (
        <div className="suivi-par-gommees">
          <p className="suivi-par-gommees-count" title={t('ad.par.gommeesHint')}>
            <i className="ri-eraser-line" aria-hidden="true"></i>
            <span>
              {t('ad.par.gommeesCount').replace('{n}', String(gommees))}
            </span>
          </p>
          <button
            type="button"
            className="suivi-rl-chip"
            title={t('ad.par.gommeesBackHint')}
            onClick={rappelerGommees}
          >
            <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('ad.par.gommeesBack')}</span>
          </button>
        </div>
      )}

      {/* Les lignes rappelées pendant la visite : le compte se lit même
          quand la gomme n’a plus rien à montrer, parce qu’il entre dans le
          nom du relevé re-téléchargé. */}
      {rappelees > 0 && (
        <p className="admin-muted suivi-par-rappelees">
          <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
          {t('ad.par.rappelees').replace('{n}', String(rappelees))}
        </p>
      )}

      {retourErreur && (
        <p className="admin-note" data-ok="no" role="status">
          <i className="ri-error-warning-line" aria-hidden="true"></i>
          {retourErreur}
        </p>
      )}

      {retour && (
        <div className="suivi-par-retour" dir="ltr">
          <div className="suivi-par-retour-head">
            <p className="suivi-par-retour-note">
              <i className="ri-file-text-line" aria-hidden="true"></i>
              <span>
                {t('ad.par.importHead')
                  .replace('{n}', String(rendues))
                  .replace('{vide}', String(resteVides))}
              </span>
              {retourNom && <em className="suivi-par-retour-file">{retourNom}</em>}
              {posees > 0 && (
                <em className="suivi-par-retour-posees" title={t('ad.par.importPoseesHint')}>
                  <i className="ri-check-double-line" aria-hidden="true"></i>
                  {t('ad.par.importPosees').replace('{n}', String(posees))}
                </em>
              )}
            </p>
            {/* Le travail qui se recopie tout de suite : les clés que le
                relecteur a traduites et que le site ne porte pas encore. La
                liste se réduit à elles, et la copie ne prend qu'elles. */}
            {traduitesNonPosees.length > 0 && (
              <button
                type="button"
                className="suivi-rl-chip"
                data-on={voirTraduites ? 'yes' : 'no'}
                aria-pressed={voirTraduites}
                title={
                  voirTraduites
                    ? t('ad.par.importTraduitesExitHint')
                    : t('ad.par.importTraduitesHint')
                }
                onClick={() => {
                  setVoirPosees(false);
                  setVoirTraduites((avant) => !avant);
                }}
              >
                <i
                  className={voirTraduites ? 'ri-filter-3-line' : 'ri-file-copy-2-line'}
                  aria-hidden="true"
                ></i>
                <span className="whitespace-nowrap">
                  {voirTraduites
                    ? t('ad.par.importTraduitesOn')
                    : t('ad.par.importTraduites')}
                </span>
                <b>{traduitesNonPosees.length}</b>
              </button>
            )}
            {/* Le relevé se range : les clés posées depuis se rappellent d'un
                clic, et l'écran revient à ce qui reste à faire. */}
            {posees > 0 && (
              <button
                type="button"
                className="suivi-rl-chip"
                data-on={voirPosees ? 'yes' : 'no'}
                aria-pressed={voirPosees}
                title={
                  voirPosees ? t('ad.par.importHidePoseesHint') : t('ad.par.importSeePoseesHint')
                }
                onClick={() => {
                  setVoirTraduites(false);
                  setVoirPosees((avant) => !avant);
                }}
              >
                <i className={voirPosees ? 'ri-eye-off-line' : 'ri-eye-line'} aria-hidden="true"></i>
                <span className="whitespace-nowrap">
                  {voirPosees ? t('ad.par.importHidePosees') : t('ad.par.importSeePosees')}
                </span>
                <b>{posees}</b>
              </button>
            )}
            {/* Le tri par date de pose : la dernière visite en tête, pour
                relire ce qui vient d’être posé avant les traductions
                anciennes. Le chiffre dit combien de lignes portent un jour. */}
            {datees > 0 && (
              <button
                type="button"
                className="suivi-rl-chip"
                data-on={triPose ? 'yes' : 'no'}
                aria-pressed={triPose}
                title={triPose ? t('ad.par.triPoseBackHint') : t('ad.par.triPoseHint')}
                onClick={() => {
                  setTriAncien(false);
                  setTriJeune(false);
                  setTriPose((avant) => !avant);
                }}
              >
                <i className="ri-sort-desc" aria-hidden="true"></i>
                <span className="whitespace-nowrap">
                  {triPose ? t('ad.par.triPoseOn') : t('ad.par.triPose')}
                </span>
                <b>{datees}</b>
              </button>
            )}
            {/* Le tri de la relecture : les traductions posées il y a le plus
                longtemps remontent en tête, pour relire d’abord ce qui attend
                depuis le plus de jours. Le chiffre dit combien de lignes
                portent un jour. */}
            {datees > 0 && (
              <button
                type="button"
                className="suivi-rl-chip"
                data-on={triAncien ? 'yes' : 'no'}
                aria-pressed={triAncien}
                title={
                  triAncien
                    ? t('ad.par.triAncienBackHint')
                    : ageAncien !== null
                      ? `${t('ad.par.triAncienHint')} ${t('ad.par.triAncienAge').replace('{n}', String(ageAncien))}`
                      : t('ad.par.triAncienHint')
                }
                onClick={() => {
                  setTriPose(false);
                  setTriJeune(false);
                  setTriAncien((avant) => !avant);
                }}
              >
                <i className="ri-sort-asc" aria-hidden="true"></i>
                <span className="whitespace-nowrap">
                  {triAncien ? t('ad.par.triAncienOn') : t('ad.par.triAncien')}
                </span>
                <b>{datees}</b>
                {/* Le temps qui sépare la plus ancienne pose d’aujourd’hui :
                    il se lit sur le jeton, sans ouvrir le fichier ni compter
                    les jours à la main. */}
                {ageAncien !== null && (
                  <em
                    className="suivi-par-tri-age"
                    title={t('ad.par.triAncienAgeHint')}
                  >
                    {t('ad.par.triAncienAge').replace('{n}', String(ageAncien))}
                  </em>
                )}
              </button>
            )}
                {datees > 0 && (
              <button
                type="button"
                className="suivi-rl-chip"
                data-on={triJeune ? 'yes' : 'no'}
                aria-pressed={triJeune}
                title={
                  triJeune
                    ? t('ad.par.triJeuneBackHint')
                    : ageJeune !== null
                      ? `${t('ad.par.triJeuneHint')} ${t('ad.par.triJeuneAge').replace('{n}', String(ageJeune))}`
                      : t('ad.par.triJeuneHint')
                }
                onClick={() => {
                  setTriPose(false);
                  setTriAncien(false);
                  setTriJeune((avant) => !avant);
                }}
              >
                <i className="ri-time-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">
                  {triJeune ? t('ad.par.triJeuneOn') : t('ad.par.triJeune')}
                </span>
                <b>{datees}</b>
                {/* L’âge de la plus jeune pose lue : il répond à celui du
                    tri « à revoir en premier », depuis l’autre bout. */}
                {ageJeune !== null && (
                  <em className="suivi-par-tri-age" title={t('ad.par.triJeuneAgeHint')}>
                    {t('ad.par.triJeuneAge').replace('{n}', String(ageJeune))}
                  </em>
                )}
              </button>
            )}
            {/* Le second passage : le CSV ne garde que les clés encore vides. */}
            <button
              type="button"
              className="suivi-rl-chip"
              data-on={resteEmporte ? 'yes' : 'no'}
              title={t('ad.par.resteCsvHint')}
              onClick={exporterReste}
            >
              <i
                className={resteEmporte ? 'ri-check-line' : 'ri-file-download-line'}
                aria-hidden="true"
              ></i>
              <span className="whitespace-nowrap">
                {resteEmporte
                  ? t('ad.par.resteCsvOk')
                  : t('ad.par.resteCsv').replace('{n}', String(resteVides))}
              </span>
            </button>
            {/* Le même travail, emporté en CSV : le fichier se transmet tel
                quel, sans passer par la copie de texte. */}
            {traduitesNonPosees.length > 0 && (
              <button
                type="button"
                className="suivi-rl-chip"
                data-on={traduitesEmporte ? 'yes' : 'no'}
                title={t('ad.par.traduitesCsvHint')}
                onClick={exporterTraduites}
              >
                <i
                  className={traduitesEmporte ? 'ri-check-line' : 'ri-file-download-line'}
                  aria-hidden="true"
                ></i>
                <span className="whitespace-nowrap">
                  {traduitesEmporte
                    ? t('ad.par.traduitesCsvOk')
                    : t('ad.par.traduitesCsv').replace(
                        '{n}',
                        String(traduitesNonPosees.length),
                      )}
                </span>
              </button>
            )}
            <button
              type="button"
              className="suivi-rl-chip"
              data-on={copieRetour === 'ok' ? 'yes' : 'no'}
              title={
                voirTraduites ? t('ad.par.importCopyNarrowHint') : t('ad.par.importCopyHint')
              }
              onClick={() => void copierRetour()}
            >
              <i
                className={
                  copieRetour === 'ok'
                    ? 'ri-check-line'
                    : copieRetour === 'echec'
                      ? 'ri-error-warning-line'
                      : 'ri-file-copy-line'
                }
                aria-hidden="true"
              ></i>
              <span className="whitespace-nowrap">
                {copieRetour === 'ok'
                  ? t('ad.par.importCopyOk')
                  : copieRetour === 'echec'
                    ? t('ad.par.importCopyFail')
                    : voirTraduites
                      ? t('ad.par.importCopyNarrow').replace(
                          '{n}',
                          String(traduitesNonPosees.length),
                        )
                      : t('ad.par.importCopy')}
              </span>
            </button>
            {/* Le relevé tel qu’il demeure : le fichier repart à l’identique,
                son nom portant les lignes qu’il contient, les traductions
                déjà posées et celles qui ont été rappelées pendant la visite.
                Le jeton dit lui-même ces trois chiffres : le compte se lit
                sans ouvrir le fichier. */}
            <button
              type="button"
              className="suivi-rl-chip"
              data-on={releveEmporte ? 'yes' : 'no'}
              data-back={rappelees > 0 ? 'yes' : 'no'}
              title={
                ageJeuneReleve !== null
                  ? `${t('ad.par.releveCsvHint')} ${t('ad.par.triJeuneAge').replace('{n}', String(ageJeuneReleve))}`
                  : t('ad.par.releveCsvHint')
              }
              onClick={exporterReleve}
            >
              <i
                className={releveEmporte ? 'ri-check-line' : 'ri-file-download-line'}
                aria-hidden="true"
              ></i>
              <span className="whitespace-nowrap">
                {releveEmporte
                  ? t('ad.par.releveCsvOk')
                  : rappelees > 0
                    ? t('ad.par.releveCsvBack')
                        .replace('{n}', String(marquees.length))
                        .replace('{p}', String(posees))
                        .replace('{r}', String(rappelees))
                    : posees > 0
                      ? t('ad.par.releveCsvPosees')
                          .replace('{n}', String(marquees.length))
                          .replace('{p}', String(posees))
                      : t('ad.par.releveCsv').replace('{n}', String(marquees.length))}
              </span>
              {/* L’âge de la plus jeune pose, à côté des posées et des
                  rappelées : le jeton dit l’autre bout de l’échelle des jours
                  sans qu’on ouvre un tri. */}
              {ageJeuneReleve !== null && (
                <em className="suivi-par-tri-age" title={t('ad.par.triJeuneAgeHint')}>
                  {t('ad.par.triJeuneAge').replace('{n}', String(ageJeuneReleve))}
                </em>
              )}
            </button>
            <button
              type="button"
              className="suivi-rl-chip"
              title={t('ad.par.importClearHint')}
              onClick={() => {
                setRetour(null);
                setRetourNom('');
                setRetourErreur('');
                setCopieRetour('non');
                setVoirPosees(false);
                setVoirTraduites(false);
                setResteEmporte(false);
                setTraduitesEmporte(false);
                setGommees(0);
                setAvantGomme(null);
                setRappelees(0);
                setReleveEmporte(false);
                setRechercheRetour('');
                setTriPose(false);
                setTriAncien(false);
                setTriJeune(false);
              }}
            >
              <i className="ri-close-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ad.par.importClear')}</span>
            </button>
          </div>

          {/* La recherche dans le relevé importé : le relecteur nomme un
              fichier et la liste ne garde que ses lignes. Elle se compose
              avec les jetons de date et de traduction déjà posés. */}
          <div className="suivi-par-cherche suivi-par-cherche--retour">
            <i className="ri-search-line" aria-hidden="true"></i>
            <input
              type="search"
              className="suivi-par-cherche-input"
              value={rechercheRetour}
              onChange={(event) => setRechercheRetour(event.target.value)}
              placeholder={t('ad.par.retourSearchPh')}
              aria-label={t('ad.par.retourSearchPh')}
              title={t('ad.par.retourSearchHint')}
            />
            {rechercheRetour !== '' && (
              <button
                type="button"
                className="suivi-par-cherche-clear"
                onClick={() => setRechercheRetour('')}
                aria-label={t('ad.par.retourSearchClear')}
                title={t('ad.par.retourSearchClear')}
              >
                <i className="ri-close-circle-line" aria-hidden="true"></i>
              </button>
            )}
            {termeRetour !== '' && (
              <span className="suivi-par-cherche-n" title={t('ad.par.retourSearchHint')}>
                {t('ad.par.retourSearchCount')
                  .replace('{n}', String(groupesRetour.length))
                  .replace('{l}', String(lignesRetour))}
              </span>
            )}
          </div>

          <ul className="suivi-par-retour-list">
            {groupesRetour.map((groupe) => (
              <Fragment key={groupe.fichier}>
                {/* L'en-tête du fichier : son nom, et ce qu'il lui reste à
                    compléter sur les lignes que le relevé porte. */}
                <li className="suivi-par-retour-group">
                  <span className="suivi-par-retour-group-file">{groupe.fichier}</span>
                  <span
                    className="suivi-par-retour-group-n"
                    title={t('ad.par.retourGroupHint')}
                  >
                    {t('ad.par.retourGroup')
                      .replace('{n}', String(resteACompleter(groupe.entrees).length))
                      .replace('{total}', String(groupe.entrees.length))}
                  </span>
                </li>
                {groupe.entrees.map((entree, index) => (
                  <li
                    className="suivi-par-retour-row"
                    key={`${entree.fichier}-${entree.langue}-${entree.cle}-${index}`}
                    data-vide={entree.traduction ? 'no' : 'yes'}
                    data-posee={entree.posee ? 'yes' : 'no'}
                  >
                    <span className="suivi-par-retour-fic">{entree.fichier}</span>
                    <span className="suivi-par-retour-lang" data-lang={entree.langue}>
                      {entree.langue === 'ar' ? 'AR' : 'EN'}
                    </span>
                    <code className="suivi-par-cle">{entree.cle}</code>
                    <span className="suivi-par-retour-val">
                      {entree.posee
                        ? t('ad.par.importPoseeTag')
                        : entree.traduction || t('ad.par.importBlank')}
                    </span>
                    {/* Quand le relevé se range par date, le jour qui a servi au
                        rangement se lit sur la ligne : un ordre sans sa date ne
                        se vérifie pas. */}
                    {(triPose || triAncien) && datePosee(entree, datesPose) !== '' && (
                      <em
                        className="suivi-par-retour-date"
                        title={t('ad.par.triPoseDateHint')}
                      >
                        <i className="ri-calendar-check-line" aria-hidden="true"></i>
                        {datePosee(entree, datesPose)}
                      </em>
                    )}
                    {/* Quand le relevé se range par âge, c’est l’âge qui se lit
                        sur la ligne : l’ordre se vérifie sans compter les jours. */}
                    {triJeune && agePosee(entree, datesPose) !== '' && (
                      <em
                        className="suivi-par-retour-date"
                        title={t('ad.par.triJeuneRowHint')}
                      >
                        <i className="ri-hourglass-line" aria-hidden="true"></i>
                        {t('ad.par.triJeuneRow').replace('{n}', agePosee(entree, datesPose))}
                      </em>
                    )}
                    {/* La gomme : une traduction déjà recopiée s'efface seule, sans
                        emporter le fichier entier ni les autres lignes. */}
                    {entree.traduction !== '' && (
                      <button
                        type="button"
                        className="suivi-par-retour-gomme"
                        title={t('ad.par.gommeHint')}
                        aria-label={`${t('ad.par.gomme')} · ${entree.cle}`}
                        onClick={() => gommer(entree)}
                      >
                        <i className="ri-eraser-line" aria-hidden="true"></i>
                      </button>
                    )}
                  </li>
                ))}
              </Fragment>
            ))}
          </ul>
          {lignesRetour === 0 && (
            <p className="suivi-rl-vide">
              <i
                className={
                  termeRetour !== ''
                    ? 'ri-search-line'
                    : voirTraduites
                      ? 'ri-file-copy-line'
                      : 'ri-check-double-line'
                }
                aria-hidden="true"
              ></i>
              <span>
                {termeRetour !== ''
                  ? t('ad.par.retourSearchNone').replace('{q}', rechercheRetour.trim())
                  : voirTraduites
                    ? t('ad.par.importTraduitesNone')
                    : t('ad.par.importAllPosees').replace('{n}', String(posees))}
              </span>
            </p>
          )}
        </div>
      )}

      {visibles.length === 0 ? (
        terme !== '' ? (
          <p className="suivi-rl-vide">
            <i className="ri-search-line" aria-hidden="true"></i>
            <span>
              {t('ad.par.searchNone').replace('{q}', recherche.trim())}
            </span>
          </p>
        ) : (
          <p className="suivi-rl-vide">
            <i className="ri-check-double-line" aria-hidden="true"></i>
            <span>
              {t('ad.par.none').replace('{n}', String(releve.total))}
            </span>
          </p>
        )
      ) : (
        <ul className="suivi-par-list">
          {visibles.map((f) => (
            <LigneParite
              key={f.fichier}
              fichier={f}
              prefixes={prefixesFokus}
              montreEcart={triEcart}
            />
          ))}
        </ul>
      )}

      <p className="admin-muted admin-journal-note">{t('ad.par.keep')}</p>
    </div>
  );
}

/**
 * Une ligne : le fichier, ses trois comptes, puis les clés qui manquent. Quand
 * une famille de clés a été nommée, la ligne ne parle que d'elle : les comptes
 * se refont sur les clés retenues, pour qu’un guichet n’annonce pas les trous
 * de tout le fichier.
 */
function LigneParite({
  fichier,
  prefixes = [],
  montreEcart = false,
}: {
  fichier: PariteFichier;
  prefixes?: string[];
  /** Quand le relevé se range par clés en écart, la ligne dit le sien : un
   *  ordre sans sa mesure ne se vérifie pas. */
  montreEcart?: boolean;
}) {
  const { t } = useLang();
  const garde = (cle: string) => prefixes.length === 0
    || prefixes.some((prefixe) => cle.startsWith(prefixe));
  const manqueAr = fichier.manqueAr.filter(garde);
  const manqueEn = fichier.manqueEn.filter(garde);
  const seulAr = fichier.seulAr.filter(garde);
  const seulEn = fichier.seulEn.filter(garde);
  const ecart = manqueAr.length + manqueEn.length + seulAr.length + seulEn.length;
  const juste = ecart === 0;
  const reference = prefixes.length === 0
    ? fichier.reference
    : Object.keys(fichier.textesFr).filter(garde).length;
  const ar = prefixes.length === 0 ? fichier.ar : reference - manqueAr.length;
  const en = prefixes.length === 0 ? fichier.en : reference - manqueEn.length;

  return (
    <li className="suivi-par-row" data-etat={juste ? 'ok' : 'ecart'}>
      <div className="suivi-par-top">
        <p className="suivi-par-file">{fichier.fichier}</p>
        {/* Le lien du fichier seul : le relecteur qui s'en occupe ouvre le
            relevé déjà resserré sur lui, sans chercher sa ligne. */}
        <CopieLien
          fichier={fichier.fichier}
          prefixes={prefixes}
          label={t('ad.par.rowLink')}
          hint={t('ad.par.rowLinkHint')}
          className="suivi-par-lien"
          iconOnly
        />
        <p className="suivi-par-counts">
          <span>FR {reference}</span>
          <span aria-hidden="true">·</span>
          <span data-lang="ar">AR {ar}</span>
          <span aria-hidden="true">·</span>
          <span data-lang="en">EN {en}</span>
          {montreEcart && ecart > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span title={t('ad.par.triEcartHeadHint')}>
                {t('ad.par.rowEcart').replace('{n}', String(ecart))}
              </span>
            </>
          )}
        </p>
      </div>

      {juste ? (
        <p className="suivi-par-ok">
          <i className="ri-check-line" aria-hidden="true"></i>
          <span>{t('ad.par.fileOk')}</span>
        </p>
      ) : (
        <>
          <CleListe
            titre={t('ad.par.missArLabel')}
            langue="ar"
            cles={manqueAr}
            vide={t('ad.par.noneAr')}
          />
          <CleListe
            titre={t('ad.par.missEnLabel')}
            langue="en"
            cles={manqueEn}
            vide={t('ad.par.noneEn')}
          />
          {seulAr.length > 0 && (
            <CleListe
              titre={t('ad.par.seulArLabel')}
              langue="ar"
              cles={seulAr}
              vide=""
            />
          )}
          {seulEn.length > 0 && (
            <CleListe
              titre={t('ad.par.seulEnLabel')}
              langue="en"
              cles={seulEn}
              vide=""
            />
          )}
        </>
      )}
    </li>
  );
}

/** Les clés d'un côté : leur nom exact, celui qu'on colle dans le fichier. */
function CleListe({
  titre,
  langue,
  cles,
  vide,
}: {
  titre: string;
  langue: 'ar' | 'en';
  cles: string[];
  vide: string;
}) {
  if (cles.length === 0 && vide) {
    return (
      <p className="suivi-par-cle-line">
        <span className="suivi-par-cle-titre" data-lang={langue}>
          {titre}
        </span>
        <span className="suivi-par-cle-vide">{vide}</span>
      </p>
    );
  }
  if (cles.length === 0) return null;

  const montre = cles.slice(0, MAX_CLES);
  const reste = cles.length - montre.length;

  return (
    <p className="suivi-par-cle-line">
      <span className="suivi-par-cle-titre" data-lang={langue}>
        {titre} · {cles.length}
      </span>
      <span className="suivi-par-cles">
        {montre.map((cle) => (
          <code className="suivi-par-cle" key={cle}>
            {cle}
          </code>
        ))}
        {reste > 0 && (
          <span className="suivi-par-plus" title={cles.slice(MAX_CLES).join(', ')}>
            + {reste}
          </span>
        )}
      </span>
    </p>
  );
}

/**
 * Le resserrement, écrit : l'adresse du relevé déjà réduit à un fichier part
 * dans le presse-papiers. Le relecteur qui la reçoit ouvre d'un clic le relevé
 * de ce seul fichier, sans traverser les vingt et un autres — c'est le même
 * chemin qu'une pastille de pose, mais transmissible.
 *
 * Le geste répond sur place : copié, ou refusé par le navigateur, jamais muet.
 */
function CopieLien({
  fichier,
  prefixes = [],
  label,
  hint,
  className = 'suivi-rl-chip',
  iconOnly = false,
}: {
  fichier: string;
  prefixes?: string[];
  label: string;
  hint: string;
  className?: string;
  /** Sur une ligne de fichier, seule l'icône tient : le nom est déjà là. */
  iconOnly?: boolean;
}) {
  const { t } = useLang();
  const [etat, setEtat] = useState<'non' | 'ok' | 'echec'>('non');
  const minuterie = useRef<number | null>(null);

  useEffect(() => () => {
    if (minuterie.current) window.clearTimeout(minuterie.current);
  }, []);

  const copier = async () => {
    const parti = await copierLienReleve(fichier, prefixes);
    setEtat(parti ? 'ok' : 'echec');
    if (minuterie.current) window.clearTimeout(minuterie.current);
    minuterie.current = window.setTimeout(() => setEtat('non'), 3200);
  };

  /* Ce qui reste à poser dans ce fichier : l'adresse copiée le porte, et le
     geste le dit sur place — le relecteur sait où il met les pieds. */
  const reste = restePoseFichier(fichier, prefixes)?.reste ?? 0;

  const texte = etat === 'ok'
    ? reste > 0
      ? t('ad.par.focusLinkOkReste').replace('{n}', String(reste))
      : t('ad.par.focusLinkOk')
    : etat === 'echec'
      ? t('ad.par.focusLinkFail')
      : label;

  return (
    <button
      type="button"
      className={`${className}${etat === 'ok' ? ' is-ok' : ''}`.trim()}
      data-on={etat === 'ok' ? 'yes' : 'no'}
      title={`${hint} · ${fichier}${prefixes.length > 0 ? ` · ${prefixes.join(' ')}` : ''}${
        reste > 0 ? ` · ${t('ad.par.focusReste').replace('{n}', String(reste))}` : ''
      }`}
      aria-label={iconOnly ? `${texte} · ${fichier}` : undefined}
      onClick={() => void copier()}
    >
      <i
        className={
          etat === 'ok'
            ? 'ri-check-line'
            : etat === 'echec'
              ? 'ri-error-warning-line'
              : 'ri-link'
        }
        aria-hidden="true"
      ></i>
      {!iconOnly && <span className="whitespace-nowrap">{texte}</span>}
    </button>
  );
}