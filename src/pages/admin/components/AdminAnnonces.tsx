import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/i18n/LangProvider';
import AdminRelance from './AdminRelance';
import { downloadApresRelanceWorkbook } from './adminClientsXlsx';
import { readChips } from './adminChipsMemory';
import {
  joursDepuisRelance,
  JOURS_RELANCE_PROCHE,
  readRelanceAt,
  saveRelanceAt,
} from './adminRelanceMemory';
import { corpsRelance, sujetRelance } from './adminRelanceText';
import { nomCommune } from '@/lib/communeLabels';
import {
  cleNature,
  cleRubrique,
  RUBRIQUES_PAR_FAMILLE,
  rubriqueHorsType,
} from '@/lib/annonceLabels';
import {
  ageJours,
  echeanceEnMots,
  estFerme,
  JOURS_ECHEANCE_PROCHE,
  jour,
  joursAvant,
  relectureLongue,
  triParRelecture,
  type AdminAbonnement,
  type AdminAnnonce,
} from './adminTypes';

type Props = {
  rows: AdminAnnonce[];
  abonnements: AdminAbonnement[];
  /** Ouvre la fiche du compte qui a déposé l'annonce. */
  onOpenCompte: (compteId: string | null, email: string | null) => void;
  /** Une demande venue de la fiche d'un compte : on montre ses seules
   *  relectures longues, ou le seul dépôt nommé quand `id` est fourni.
   *  `at` change à chaque clic, même sur le même compte. */
  focus?: { email: string; at: number; id?: string } | null;
  /** Rend la liste à toutes les annonces : le filtre de compte s'efface. */
  onClearFocus?: () => void;
  /** On quitte le dépôt nommé : la fiche du compte d'où l'on venait se rouvre,
   *  au lieu de laisser l'utilisateur sur une liste qui ne dit plus rien. */
  onReturnCompte?: () => void;
};

/**
 * La gestion des annonces : chaque dépôt dans son état de relecture, avec les
 * deux gestes qui comptent — ouvrir sur le tableau, ou retirer. Rien ne touche
 * au contenu déposé : seule la ligne d'état change, et elle change côté serveur.
 *
 * Un dépôt dont le compte arrive à échéance porte un signe visible : c'est le
 * moment de relancer l'abonnement, avant que le compte ne se coupe. Un dépôt
 * encore en relecture après sept jours porte le sien : celui d'une réponse
 * qu'on doit au déposant.
 */
export default function AdminAnnonces({
  rows,
  abonnements,
  onOpenCompte,
  focus,
  onClearFocus,
  onReturnCompte,
}: Props) {
  const { t, lang } = useLang();
  const [local, setLocal] = useState<AdminAnnonce[]>(rows);
  const [filtre, setFiltre] = useState('all');
  const [query, setQuery] = useState('');
  const [soonOnly, setSoonOnly] = useState(false);
  const [lateOnly, setLateOnly] = useState(false);
  /* Le jeton du compte filtré : ne garder que les dépôts entrés après sa
     relance, ceux que le message n'a pas couverts. */
  const [apresOnly, setApresOnly] = useState(false);
  const [triLate, setTriLate] = useState(false);
  /* Le tri du bandeau : les dépôts entrés après le message d'abord, ceux que
     la relance ne couvre pas. Il ne s'offre que quand une relance existe. */
  const [triApres, setTriApres] = useState(false);
  /* Le jeton des rubriques hors type : il isole les dépôts dont la rubrique
     vient de l'autre famille, pour les corriger d'un seul endroit. */
  const [rubriqueOnly, setRubriqueOnly] = useState(false);
  /* Le compte dont on lit les relectures : le bandeau le nomme, et le bouton
     qui le ferme rend la liste entière. */
  const [focusActif, setFocusActif] = useState(false);
  /* Le dépôt nommé depuis la fiche du compte : la liste ne montre que lui,
     et le bandeau dit lequel — on n'arrive pas sur une liste sans savoir
     pourquoi elle est réduite. */
  const [idCible, setIdCible] = useState<string | null>(null);
  /* La dernière relance préparée pour le compte lu : si elle existe, le
     bandeau rappelle que l'attente n'est pas levée — relancer ne vaut pas
     réponse, et la liste reste la preuve qu'il faut la recevoir.
     La date est tenue ici pour changer dès qu'une relance part du bandeau. */
  const [relanceAt, setRelanceAt] = useState<string | null>(null);
  const focusRelanceProche = (joursDepuisRelance(relanceAt) ?? 99) <= JOURS_RELANCE_PROCHE;
  /* La relance ouverte depuis le bandeau, avec le même message que la fiche. */
  const [relance, setRelance] = useState<{ to: string; subject: string; body: string } | null>(
    null,
  );
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState('');

  /* La liste suit la console : un rafraîchissement remplace ce que la page
     garde, sans jamais laisser deux vérités côte à côte. */
  useEffect(() => {
    setLocal(rows);
  }, [rows]);

  /* Une demande venue de la fiche d'un compte : la liste se réduit à ses
     relectures longues, puis on lit la plus ancienne en tête. */
  useEffect(() => {
    if (!focus) {
      setIdCible(null);
      return;
    }
    setIdCible(focus.id ?? null);
    setQuery(focus.email);
    setSoonOnly(false);
    setApresOnly(false);
    setFiltre('all');
    setTriApres(false);
    setFocusActif(true);
    /* Un dépôt nommé s'ouvre seul : les filtres d'attente n'ont plus lieu
       d'être, ils cacheraient justement la ligne demandée. */
    setLateOnly(focus.id ? false : true);
    setTriLate(focus.id ? false : true);
  }, [focus]);

  /* La date de relance suit le compte lu : la mémoire de l'appareil est relue
     à chaque changement de compte, jamais gardée d'un compte à l'autre. */
  useEffect(() => {
    setRelanceAt(focus?.email ? readRelanceAt(focus.email) : null);
  }, [focus]);

  /* Un dépôt daté après le message du compte lu : la relance ne l'a pas
     couvert. Une seule règle, lue par le compteur du bandeau comme par le tri. */
  const arriveApresRelance = (row: AdminAnnonce) => {
    const cle = (focus?.email || query).trim().toLowerCase();
    const stamp = relanceAt ? new Date(relanceAt).getTime() : NaN;
    if (!cle || !Number.isFinite(stamp)) return false;
    if ((row.email || '').trim().toLowerCase() !== cle) return false;
    const depot = new Date(row.created_at || '').getTime();
    return Number.isFinite(depot) && depot > stamp;
  };

  /* Les dépôts du compte lu arrivés après le message : la relance ne couvre
     pas ce qui est entré depuis, et le bandeau le dit sans ouvrir la liste. */
  const apresRelance = local.filter(arriveApresRelance).length;

  /* La touche d'échappement referme la relance ouverte depuis le bandeau. */
  useEffect(() => {
    if (!relance) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setRelance(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [relance]);

  const quitterFocus = () => {
    setFocusActif(false);
    setIdCible(null);
    setQuery('');
    setLateOnly(false);
    setApresOnly(false);
    setTriLate(false);
    setTriApres(false);
    setRelanceAt(null);
    onClearFocus?.();
    /* La fiche d'où venait le dépôt reprend la main : on revient d'une annonce,
       on ne reste pas devant une liste vidée de son filtre. */
    onReturnCompte?.();
  };

  /* Le geste du bandeau : relancer le compte lu sans repasser par la fiche.
     Le message part de la même fabrique — dépôts en attente, âge, ligne
     récapitulative — et l'instant est retenu par compte. */
  const preparerRelance = () => {
    const mail = (focus?.email || query).trim();
    if (!mail) return;
    const cle = mail.toLowerCase();
    const annoncesDuCompte = local.filter(
      (row) => (row.email || '').trim().toLowerCase() === cle,
    );
    const contexte = {
      nom: annoncesDuCompte.find((row) => row.organisation)?.organisation ?? null,
      email: mail,
      abonnements: abonnements.filter((row) => (row.email || '').trim().toLowerCase() === cle),
      annonces: annoncesDuCompte,
      lang,
      t,
    };
    setRelanceAt(saveRelanceAt(mail));
    setRelance({
      to: mail,
      subject: sujetRelance(contexte),
      body: corpsRelance(contexte),
    });
  };

  /* Les échéances proches, rangées par adresse : la plus urgente l'emporte
     quand un même compte porte plusieurs abonnements. Un abonnement déjà
     fermé n'appelle pas de relance, il n'entre donc pas dans la carte. */
  const echeancesAbo = useMemo(() => {
    const map = new Map<string, string>();
    abonnements.forEach((row) => {
      const cle = (row.email || '').trim().toLowerCase();
      if (!cle || !row.date_echeance) return;
      if (estFerme((row.statut || '').toLowerCase())) return;
      const jours = joursAvant(row.date_echeance);
      if (jours === null || jours >= JOURS_ECHEANCE_PROCHE) return;
      const previous = map.get(cle);
      const previousJours = previous ? joursAvant(previous) : null;
      if (previousJours === null || jours < previousJours) map.set(cle, row.date_echeance);
    });
    return map;
  }, [abonnements]);

  const echeanceDe = (row: AdminAnnonce) => {
    const cle = (row.email || '').trim().toLowerCase();
    return cle ? echeancesAbo.get(cle) : undefined;
  };

  const proches = local.filter((row) => Boolean(echeanceDe(row))).length;

  /* Les relectures qui traînent : ni publiées ni refusées, et déposées depuis
     plus de sept jours. Ce sont les seules qui attendent encore une réponse. */
  const retards = local.filter((row) => relectureLongue(row.statut, row.created_at)).length;

  const statuts = [...new Set(local.map((row) => (row.statut || '—').toLowerCase()))].sort();

  /* Les dépôts dont la rubrique appartient à l'autre famille : une offre
     déposée en catégorie d'annonce, ou l'inverse. Le jeton les isole, et
     chaque ligne corrigée d'un clic écrit une rubrique que le formulaire
     propose vraiment pour son type. */
  const horsType = local.filter((row) => rubriqueHorsType(row.kind, row.rubrique));

  /* La dernière rubrique corrigée, le jeton n'a plus rien à garder : il
     s'efface plutôt que de laisser la liste filtrée sur un vide sans porte
     pour en sortir. */
  useEffect(() => {
    if (rubriqueOnly && horsType.length === 0) setRubriqueOnly(false);
  }, [rubriqueOnly, horsType.length]);

  const filtres = local.filter((row) => {
    if (soonOnly && !echeanceDe(row)) return false;
    if (lateOnly && !relectureLongue(row.statut, row.created_at)) return false;
    if (rubriqueOnly && !rubriqueHorsType(row.kind, row.rubrique)) return false;
    if (apresOnly && !arriveApresRelance(row)) return false;
    if (filtre !== 'all' && (row.statut || '—').toLowerCase() !== filtre) return false;
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [row.titre, row.organisation, row.wilaya, row.rubrique, row.email]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(needle);
  });

  /* L'ordre de lecture : la table par défaut, l'ancienneté de relecture avec
     le dépôt qui attend depuis le plus longtemps en tête, ou — dans le compte
     lu — les dépôts entrés après la relance remontés en tête, l'ordre choisi
     se maintenant à l'intérieur des deux groupes. */
  /* Le dépôt nommé depuis la fiche du compte : la liste se réduit à lui
     seul. Les filtres restent intacts, on les retrouve en revenant au
     compte d'un clic. */
  const listees = idCible ? filtres.filter((row) => row.id === idCible) : filtres;
  const base = triLate ? triParRelecture(listees) : listees;
  /* Le titre du dépôt ouvert, pour que le bandeau le nomme au lieu d'une
     liste réduite sans explication. */
  const titreCible = idCible ? local.find((row) => row.id === idCible)?.titre ?? '—' : '';
  const affichees =
    triApres && relanceAt
      ? [
          ...base.filter((row) => arriveApresRelance(row)),
          ...base.filter((row) => !arriveApresRelance(row)),
        ]
      : base;

  /* La correction d'une rubrique hors type : la fonction serveur n'accepte
     qu'une valeur de la famille du dépôt, et ne touche à rien d'autre — ni au
     titre, ni au texte, ni à l'état de relecture. */
  const changerRubrique = async (row: AdminAnnonce, rubrique: string) => {
    setBusy(row.id);
    setNote('');
    try {
      const { data, error } = await supabase.functions.invoke('admin-console', {
        body: { action: 'annonce-rubrique', id: row.id, kind: row.kind, rubrique },
      });
      const answer = data as
        | { ok?: boolean; annonce?: { id: string; kind: string | null; rubrique: string | null } }
        | null;
      if (error || !answer?.ok || !answer.annonce) {
        setNote(t('ad.ann.rubriqueErr'));
        return;
      }
      const next = answer.annonce;
      setLocal((prev) =>
        prev.map((item) => (item.id === next.id ? { ...item, rubrique: next.rubrique } : item)),
      );
    } catch {
      setNote(t('ad.ann.rubriqueErr'));
    } finally {
      setBusy('');
    }
  };

  const changer = async (id: string, statut: string) => {
    setBusy(id);
    setNote('');
    try {
      const { data, error } = await supabase.functions.invoke('admin-console', {
        body: { action: 'annonce', id, statut },
      });
      const answer = data as { ok?: boolean; annonce?: { id: string; statut: string } } | null;
      if (error || !answer?.ok || !answer.annonce) {
        setNote(t('ad.ann.err'));
        return;
      }
      const next = answer.annonce;
      setLocal((prev) =>
        prev.map((row) => (row.id === next.id ? { ...row, statut: next.statut } : row)),
      );
    } catch {
      setNote(t('ad.ann.err'));
    } finally {
      setBusy('');
    }
  };

  return (
    <>
      <div className="admin-stats">
        <div className="admin-stat">
          <b>{local.length}</b>
          <span>{t('ad.stat.annonces')}</span>
        </div>
        {statuts.map((statut) => (
          <div className="admin-stat" key={statut} data-tone={statut === 'publie' ? 'ok' : 'soft'}>
            <b>{local.filter((row) => (row.statut || '—').toLowerCase() === statut).length}</b>
            <span>{statut}</span>
          </div>
        ))}
      </div>

      <section className="admin-card">
        <div className="admin-card-head">
          <div>
            <p className="admin-stamp">{t('ad.ann.stamp')}</p>
            <p className="admin-sub">{t('ad.ann.sub')}</p>
          </div>
          <div className="admin-tools">
            <label className="admin-search">
              <i className="ri-search-line" aria-hidden="true"></i>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('ad.ann.search')}
                className="text-sm"
              />
            </label>
            <button
              type="button"
              className="admin-btn"
              data-tone={triLate ? 'accent' : undefined}
              aria-pressed={triLate}
              onClick={() => setTriLate((value) => !value)}
              title={t('ad.ann.sortLateHint')}
            >
              <i
                className={triLate ? 'ri-sort-asc' : 'ri-arrow-up-down-line'}
                aria-hidden="true"
              ></i>
              <span className="whitespace-nowrap">{t('ad.ann.sortLate')}</span>
            </button>
          </div>
        </div>

        {focusActif && (
          <div className="admin-focus" role="status">
            <i
              className={idCible ? 'ri-article-line' : 'ri-timer-flash-line'}
              aria-hidden="true"
            ></i>
            <span>
              {idCible
                ? t('ad.ann.focusDepot').replace('{titre}', titreCible)
                : t('ad.ann.focus').replace('{mail}', focus?.email ?? query)}
            </span>
            {idCible && (
              <button
                type="button"
                className="admin-chip"
                onClick={() => {
                  setIdCible(null);
                  setLateOnly(false);
                  setQuery(focus?.email ?? query);
                  /* Élargir au compte est déjà un retour : la fiche qu'on avait
                     quittée reprend sa place, le dépôt nommé est derrière soi. */
                  onReturnCompte?.();
                }}
              >
                <i className="ri-list-check-2" aria-hidden="true"></i>
                {t('ad.ann.focusAccountAll')}
              </button>
            )}
            {relanceAt && (
              <span className="admin-focus-note" data-recent={focusRelanceProche ? 'yes' : 'no'}>
                <i className="ri-mail-check-line" aria-hidden="true"></i>
                {t('ad.ann.focusRelance').replace('{date}', jour(relanceAt, lang))}
                <em
                  className="admin-focus-after"
                  data-tone={apresRelance > 0 ? 'yes' : 'no'}
                  title={t('ad.ann.focusAfterHint')}
                >
                  ·{' '}
                  {apresRelance > 0
                    ? t('ad.ann.focusAfter').replace('{n}', String(apresRelance))
                    : t('ad.ann.focusAfterNone')}
                </em>
              </span>
            )}
            {relanceAt && (
              <button
                type="button"
                className="admin-btn"
                data-tone={triApres ? 'accent' : undefined}
                aria-pressed={triApres}
                title={t('ad.ann.sortAfterHint')}
                onClick={() => setTriApres((value) => !value)}
              >
                <i
                  className={triApres ? 'ri-sort-desc' : 'ri-arrow-up-down-line'}
                  aria-hidden="true"
                ></i>
                <span className="whitespace-nowrap">{t('ad.ann.sortAfter')}</span>
                <b className="admin-focus-count">{apresRelance}</b>
              </button>
            )}
            {relanceAt && (
              <button
                type="button"
                className="admin-btn"
                disabled={apresRelance === 0}
                title={
                  apresRelance > 0
                    ? t('ad.ann.afterExportHint')
                    : t('ad.ann.afterExportEmptyHint')
                }
                onClick={() => {
                  const mail = (focus?.email || query).trim();
                  if (!mail) return;
                  const cle = mail.toLowerCase();
                  downloadApresRelanceWorkbook({
                    email: mail,
                    entreprise:
                      local.find(
                        (row) =>
                          (row.email || '').trim().toLowerCase() === cle && row.organisation,
                      )?.organisation ?? null,
                    relanceAt,
                    annonces: local,
                    /* Le compte des jetons posés sur la liste, lu dans la
                       mémoire de l'appareil : le nom du fichier se date du
                       même chiffre que le classeur des abonnés. */
                    jetons: readChips(),
                    lang,
                    t,
                  });
                }}
              >
                <i className="ri-file-excel-2-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('ad.ann.afterExport')}</span>
              </button>
            )}
            <button
              type="button"
              className="admin-btn"
              data-tone="accent"
              disabled={!focus?.email}
              title={t('ad.ann.relanceBtnHint')}
              onClick={preparerRelance}
            >
              <i className="ri-mail-send-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ad.ann.relanceBtn')}</span>
            </button>
            <button type="button" className="admin-chip" onClick={quitterFocus}>
              <i className="ri-close-circle-line" aria-hidden="true"></i>
              {t('ad.ann.focusClear')}
            </button>
          </div>
        )}

        <div className="admin-chips" role="group" aria-label={t('ad.ann.stamp')}>
          <button
            type="button"
            className="admin-chip"
            data-on={filtre === 'all' ? 'yes' : 'no'}
            aria-pressed={filtre === 'all'}
            onClick={() => setFiltre('all')}
          >
            {t('ad.ann.all')}
            <b>{local.length}</b>
          </button>
          <button
            type="button"
            className="admin-chip"
            data-tone="warn"
            data-on={soonOnly ? 'yes' : 'no'}
            aria-pressed={soonOnly}
            onClick={() => setSoonOnly((value) => !value)}
            title={t('ad.ann.aboSoonHint')}
          >
            <i className="ri-alarm-warning-line" aria-hidden="true"></i>
            {t('ad.ann.soonChip')}
            <b>{proches}</b>
          </button>
          <button
            type="button"
            className="admin-chip"
            data-on={lateOnly ? 'yes' : 'no'}
            aria-pressed={lateOnly}
            onClick={() => setLateOnly((value) => !value)}
            title={t('ad.ann.lateHint')}
          >
            <i className="ri-timer-flash-line" aria-hidden="true"></i>
            {t('ad.ann.lateChip')}
            <b>{retards}</b>
          </button>
          {/* Le jeton des rubriques hors type : il isole les dépôts dont la
              rubrique vient de l'autre famille, et ouvre sous chacun la
              correction d'un clic — le travail se fait d'un seul endroit. */}
          {horsType.length > 0 && (
            <button
              type="button"
              className="admin-chip"
              data-tone="warn"
              data-on={rubriqueOnly ? 'yes' : 'no'}
              aria-pressed={rubriqueOnly}
              onClick={() => {
                const next = !rubriqueOnly;
                setRubriqueOnly(next);
                /* Le jeton montre tous les dépôts hors type, pas seulement
                   ceux qui traînent : la relecture longue s'efface quand on
                   ne veut que cette liste-là. */
                if (next) setLateOnly(false);
              }}
              title={t('ad.ann.rubriqueChipHint')}
            >
              <i className="ri-error-warning-line" aria-hidden="true"></i>
              {t('ad.ann.rubriqueChip')}
              <b>{horsType.length}</b>
            </button>
          )}
          {relanceAt && (
            <button
              type="button"
              className="admin-chip"
              data-tone="accent"
              data-on={apresOnly ? 'yes' : 'no'}
              aria-pressed={apresOnly}
              onClick={() => {
                const next = !apresOnly;
                setApresOnly(next);
                /* Le jeton montre tous les dépôts entrés depuis la relance,
                   pas seulement ceux qui traînent : la relecture longue
                   s'efface quand on ne veut que ce que le message n'a pas
                   couvert. */
                if (next) setLateOnly(false);
              }}
              title={t('ad.ann.afterChipHint')}
            >
              <i className="ri-mail-unread-line" aria-hidden="true"></i>
              {t('ad.ann.afterChip')}
              <b>{apresRelance}</b>
            </button>
          )}
          {statuts.map((statut) => (
            <button
              key={statut}
              type="button"
              className="admin-chip"
              data-on={filtre === statut ? 'yes' : 'no'}
              aria-pressed={filtre === statut}
              onClick={() => setFiltre(statut)}
            >
              {statut}
              <b>{local.filter((row) => (row.statut || '—').toLowerCase() === statut).length}</b>
            </button>
          ))}
        </div>

        {note && (
          <p className="admin-note" data-ok="no" role="status">
            <i className="ri-error-warning-line" aria-hidden="true"></i>
            {note}
          </p>
        )}

        {local.length === 0 ? (
          <p className="admin-empty">
            <i className="ri-file-list-3-line" aria-hidden="true"></i>
            {t('ad.ann.empty')}
          </p>
        ) : listees.length === 0 ? (
          <p className="admin-empty">
            <i className="ri-filter-off-line" aria-hidden="true"></i>
            {rubriqueOnly
              ? t('ad.ann.rubriqueEmpty')
              : apresOnly
                ? t('ad.ann.afterChipEmpty')
                : lateOnly
                  ? t('ad.ann.lateEmpty')
                  : soonOnly
                    ? t('ad.ann.soonEmpty')
                    : t('ad.ann.none')}
          </p>
        ) : (
          <ul className="admin-rows">
            {affichees.map((row) => {
              const etat = (row.statut || '—').toLowerCase();
              const working = busy === row.id;
              const echeance = echeanceDe(row);
              const mail = (row.email || '').trim();
              const retard = relectureLongue(row.statut, row.created_at);
              const joursAttente = ageJours(row.created_at);
              /* La date du dépôt face à celle du message : un dépôt plus ancien
                 que la relance était déjà couvert, un dépôt plus récent est
                 arrivé après — l'attente ne se lit pas de la même façon. */
              const depotStamp = new Date(row.created_at || '').getTime();
              const relanceStamp = relanceAt ? new Date(relanceAt).getTime() : NaN;
              const avantRelance =
                Number.isFinite(depotStamp) &&
                Number.isFinite(relanceStamp) &&
                depotStamp <= relanceStamp;
              const pastille = (
                <>
                  <i className="ri-alarm-warning-line" aria-hidden="true"></i>
                  {t('ad.ann.aboSoon')} · {echeanceEnMots(echeance, t)}
                </>
              );
              /* La nature et la rubrique sont des valeurs rangées en base :
                 elles se lisent dans le vocabulaire du tableau, jamais en
                 latin au milieu d'une phrase arabe. */
              const natureCle = cleNature(row.kind);
              const rubriqueCle = cleRubrique(row.rubrique);
              return (
                <li
                  className="admin-row"
                  key={row.id}
                  data-state={etat}
                  data-soon={echeance ? 'yes' : 'no'}
                  data-late={retard ? 'yes' : 'no'}
                  data-target={idCible === row.id ? 'yes' : 'no'}
                >
                  <div className="admin-row-main">
                    <p className="admin-row-head">
                      <span className="admin-badge" data-tone={etat === 'publie' ? 'ok' : etat === 'refuse' ? 'off' : 'soft'}>
                        {row.statut || '—'}
                      </span>
                      {echeance &&
                        (mail ? (
                          <button
                            type="button"
                            className="admin-badge admin-badge-btn"
                            data-tone="accent"
                            title={`${t('ad.ann.aboSoonHint')} · ${t('ad.clients.open')}`}
                            aria-label={`${t('ad.clients.open')} · ${mail}`}
                            onClick={() => onOpenCompte(null, mail)}
                          >
                            {pastille}
                          </button>
                        ) : (
                          <span
                            className="admin-badge"
                            data-tone="accent"
                            title={t('ad.ann.aboSoonHint')}
                          >
                            {pastille}
                          </span>
                        ))}
                      {retard && (
                        <span
                          className="admin-badge"
                          data-tone="warn"
                          title={t('ad.ann.lateHint')}
                        >
                          <i className="ri-timer-flash-line" aria-hidden="true"></i>
                          {t('ad.ann.lateBadge').replace(
                            '{n}',
                            String(joursAttente === null ? 0 : Math.max(joursAttente, 0)),
                          )}
                        </span>
                      )}
                      {focusActif && relanceAt && (
                        <span
                          className="admin-relance-mark"
                          data-recent={focusRelanceProche ? 'yes' : 'no'}
                          title={t('ad.ann.rowRelanceHint')}
                        >
                          <i className="ri-mail-check-line" aria-hidden="true"></i>
                          {t('ad.ann.rowRelance').replace('{date}', jour(relanceAt, lang))}
                          <em>
                            ·{' '}
                            {avantRelance
                              ? t('ad.ann.rowRelanceBefore')
                              : t('ad.ann.rowRelanceAfter')}
                          </em>
                        </span>
                      )}
                      {row.kind && (
                        <span
                          className="admin-kind"
                          data-card-label={t('ad.ann.cardKind')}
                        >
                          {natureCle ? t(natureCle) : row.kind}
                        </span>
                      )}
                      {row.rubrique && (
                        <span
                          className="admin-kind"
                          data-card-label={t('ad.ann.cardRubrique')}
                        >
                          {rubriqueCle ? t(rubriqueCle) : row.rubrique}
                        </span>
                      )}
                      {/* La rubrique enregistrée vient de l'autre famille : la
                          ligne le dit, plutôt que de laisser passer une valeur
                          que le formulaire d'aujourd'hui ne propose plus. */}
                      {row.rubrique && rubriqueHorsType(row.kind, row.rubrique) && (
                        <span
                          className="admin-badge"
                          data-tone="warn"
                          title={t(
                            row.kind === 'offre'
                              ? 'ad.ann.rubriqueBadgeOffre'
                              : 'ad.ann.rubriqueBadgeAnnonce',
                          )}
                        >
                          <i className="ri-error-warning-line" aria-hidden="true"></i>
                          {t('ad.ann.rubriqueBadge')}
                        </span>
                      )}
                      <span className="admin-num admin-muted" data-card-label={t('ad.ann.cardDate')}>
                        {jour(row.created_at, lang)}
                      </span>
                    </p>
                    <h3 className="admin-row-title">{row.titre}</h3>
                    <p className="admin-row-meta">
                      {row.organisation && (
                        <span data-card-label={t('ad.ann.cardOrg')}>
                          <i className="ri-building-line" aria-hidden="true"></i>
                          {row.organisation}
                        </span>
                      )}
                      {row.wilaya && (
                        <span data-card-label={t('ad.ann.cardCity')}>
                          <i className="ri-map-pin-line" aria-hidden="true"></i>
                          {nomCommune(row.wilaya, lang)}
                        </span>
                      )}
                      {row.budget && (
                        <span data-card-label={t('ad.ann.cardBudget')}>
                          <i className="ri-price-tag-3-line" aria-hidden="true"></i>
                          {row.budget}
                        </span>
                      )}
                      {row.email && (
                        <span data-card-label={t('ad.ann.cardMail')}>
                          <i className="ri-mail-line" aria-hidden="true"></i>
                          {row.email}
                        </span>
                      )}
                    </p>
                    {/* Le jeton posé, chaque dépôt hors type ouvre sa propre
                        correction : une rubrique de sa famille, écrite d'un
                        clic, sans quitter la liste. */}
                    {rubriqueOnly && rubriqueHorsType(row.kind, row.rubrique) && (
                      <div className="admin-rubrique-fix">
                        <span className="admin-rubrique-fix-lab">
                          <i className="ri-magic-line" aria-hidden="true"></i>
                          {t('ad.ann.rubriqueFix')}
                        </span>
                        {RUBRIQUES_PAR_FAMILLE[row.kind === 'offre' ? 'offre' : 'annonce'].map(
                          (value) => (
                            <button
                              key={value}
                              type="button"
                              className="admin-chip"
                              disabled={working}
                              title={t('ad.ann.rubriqueFixHint')}
                              onClick={() => void changerRubrique(row, value)}
                            >
                              {t(cleRubrique(value) ?? value)}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                  <div className="admin-row-actions">
                    {/* La porte du dépôt : la fiche publique s'ouvre dans un
                        autre onglet, la liste reste derrière pour la suite de
                        la relecture. Le lecteur ne retape plus l'adresse. */}
                    <Link
                      to={`/annonces/${row.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn"
                      title={t('ad.ann.openHint')}
                    >
                      <i className="ri-external-link-line" aria-hidden="true"></i>
                      <span className="whitespace-nowrap">{t('ad.ann.open')}</span>
                    </Link>
                    {etat !== 'publie' && (
                      <button
                        type="button"
                        className="admin-btn"
                        data-tone="ok"
                        disabled={working}
                        onClick={() => void changer(row.id, 'publie')}
                      >
                        <i className={working ? 'ri-loader-4-line is-spin' : 'ri-check-line'} aria-hidden="true"></i>
                        <span className="whitespace-nowrap">
                          {working ? t('ad.ann.busy') : t('ad.ann.publish')}
                        </span>
                      </button>
                    )}
                    {etat === 'publie' && (
                      <button
                        type="button"
                        className="admin-btn"
                        disabled={working}
                        onClick={() => void changer(row.id, 'en_attente')}
                      >
                        <i className="ri-pause-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">{t('ad.ann.wait')}</span>
                      </button>
                    )}
                    {etat !== 'refuse' && (
                      <button
                        type="button"
                        className="admin-btn"
                        data-tone="off"
                        disabled={working}
                        onClick={() => void changer(row.id, 'refuse')}
                      >
                        <i className="ri-close-line" aria-hidden="true"></i>
                        <span className="whitespace-nowrap">{t('ad.ann.refuse')}</span>
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {relance && (
        <AdminRelance
          to={relance.to}
          subject={relance.subject}
          body={relance.body}
          onClose={() => setRelance(null)}
        />
      )}
    </>
  );
}