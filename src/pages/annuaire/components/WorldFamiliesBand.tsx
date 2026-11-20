import { Link, useSearchParams } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { entreprises } from '@/mocks/entreprises';
import { phrasePays, slugDeTrade, slugPays } from '@/lib/tradePages';
import { ANNUAIRE_FAMILLES, FAM_ABSENT_PARAM, paysTenusParFamille } from '@/lib/worldFamilies';
import { markFamilleVue } from '@/lib/familyMemory';
import './world-families.css';

/**
 * Les huit familles du répertoire, posées sous la carte du monde.
 *
 * La carte nomme ses pays ; cette bande nomme ses métiers. Chaque porte ouvre
 * la page du type — la même adresse que le menu de la barre et que la page
 * Arabe World.
 *
 * Les portes suivent le pays lu : la carte dit « Algérie », la bande compte
 * donc les fiches algériennes de chaque famille, et le total en tête devient
 * celui du pays. Sans pays retenu, elle retrouve les comptes du répertoire
 * entier, qui restent alors la seule mesure honnête.
 *
 * Au survol, une porte ne dit plus seulement son compte : elle nomme son
 * meilleur atelier dans le pays lu — le nom et la note —, lu sur tout le
 * répertoire et jamais sur la sélection filtrée, pour qu'un atelier écarté
 * par les filtres en cours ne disparaisse pas de sa propre famille.
 */
const COMPTES: Record<string, number> = {};
const COMPTES_PAR_PAYS: Record<string, Record<string, number>> = {};
const MEILLEURS: Record<string, { name: string; rating: number; reviews: number }> = {};
/* Les régions où chaque famille tient son monde, pays par pays : au survol,
   la porte dit combien de régions elle occupe là où la carte les lit —
   l'atelier le mieux noté ne dit pas à lui seul si la famille est partout ou
   dans un seul quartier. */
const REGIONS: Record<string, Set<string>> = {};

entreprises.forEach((fiche) => {
  const code = fiche.pays || 'DZ';
  COMPTES[fiche.trade] = (COMPTES[fiche.trade] ?? 0) + 1;
  const parPays = COMPTES_PAR_PAYS[code] ?? {};
  parPays[fiche.trade] = (parPays[fiche.trade] ?? 0) + 1;
  COMPTES_PAR_PAYS[code] = parPays;
  const key = `${code}|${fiche.trade}`;
  const best = MEILLEURS[key];
  if (!best || fiche.rating > best.rating || (fiche.rating === best.rating && fiche.reviews > best.reviews)) {
    MEILLEURS[key] = { name: fiche.name, rating: fiche.rating, reviews: fiche.reviews };
  }
  const where = (fiche.wilaya || '').trim();
  const regions = REGIONS[key] ?? new Set<string>();
  if (where) regions.add(where);
  REGIONS[key] = regions;
});

/** Combien de régions tiennent la famille dans le pays lu. */
function regionsDe(code: string, trade: string): number {
  if (!code) return 0;
  return REGIONS[`${code}|${trade}`]?.size ?? 0;
}

/** Le compte de chaque famille dans un pays ; le répertoire entier sans pays. */
function comptesDe(code: string): Record<string, number> {
  return code ? COMPTES_PAR_PAYS[code] ?? {} : COMPTES;
}

export default function WorldFamiliesBand({
  active = '',
  pays = '',
}: {
  /** Le type lu, pour que sa porte se lise comme enfoncée. */
  active?: string;
  /** Le pays lu sur la carte, sur lequel les comptes se prennent. */
  pays?: string;
}) {
  const { t, lang } = useLang();
  const [params, setParams] = useSearchParams();
  const place = pays ? phrasePays(pays, lang) : '';
  const comptes = comptesDe(pays);
  const total = ANNUAIRE_FAMILLES.reduce((sum, row) => sum + (comptes[row.trade] ?? 0), 0);
  /* Les familles absentes du pays lu : la bande les compte sous ses portes,
     et chaque nom ouvre sa page dans tout le répertoire — on repère ce qui
     manque ici sans perdre le chemin pour le lire ailleurs. Sans pays retenu,
     la question ne se pose pas : la ligne se tait. */
  const absentes = pays
    ? ANNUAIRE_FAMILLES.filter(({ trade }) => (comptes[trade] ?? 0) === 0)
    : [];
  /* Le compteur de l'en-tête de la carte a resserré la bande sur ces seules
     familles : la clef vit dans l'adresse, la bande la lit donc à la même
     source. Sans famille absente, il n'y a rien à resserrer et les huit
     portes reviennent d'elles-mêmes. */
  const resserree = params.get(FAM_ABSENT_PARAM) === '1' && absentes.length > 0;
  const portesAffichees = resserree
    ? ANNUAIRE_FAMILLES.filter(({ trade }) => (comptes[trade] ?? 0) === 0)
    : ANNUAIRE_FAMILLES;
  /* Le total mondial des familles que la bande resserrée montre : ce que le
     pays lu laisse vide, le répertoire le tient ailleurs. Lu sur tout le
     répertoire, comme le compte mondial des cartes de pays. */
  const totalMondeResserree = portesAffichees.reduce(
    (sum, { trade }) => sum + (COMPTES[trade] ?? 0),
    0,
  );

  /** Les huit portes reviennent d'un geste : la clef de l'adresse s'efface. */
  const rendreLesHuit = () => {
    setParams((prev) => {
      const suivant = new URLSearchParams(prev);
      suivant.delete(FAM_ABSENT_PARAM);
      return suivant;
    }, { replace: true });
  };

  return (
    <section className="fam-band" id="fam-band" aria-labelledby="fam-band-title">
      <div className="fam-band-head">
        <h2 className="fam-band-title" id="fam-band-title">
          <i className="ri-apps-2-line" aria-hidden="true"></i>
          <span>{t('dir.famBand')}</span>
          <em className="fam-band-total">{total}</em>
          {pays && <em className="fam-band-place">{place}</em>}
        </h2>
        <p className="fam-band-sub">
          {pays
            ? t('dir.famBandSubCountry').replace('{place}', place)
            : t('dir.famBandSub')}
        </p>
      </div>
      <ul className="fam-band-list">
        {portesAffichees.map(({ trade, icon }) => {
          const on = active === trade;
          const count = comptes[trade] ?? 0;
          const label = t(`tradePlural.${trade}`);
          const best = pays ? MEILLEURS[`${pays}|${trade}`] : null;
          const regions = pays ? regionsDe(pays, trade) : 0;
          const baseTitle = pays
            ? best
              ? regions > 0
                ? t('dir.famBandHoverRegions')
                  .replace('{label}', label)
                  .replace('{count}', String(count))
                  .replace('{best}', best.name)
                  .replace('{rating}', best.rating.toFixed(1))
                  .replace('{regions}', String(regions))
                : t('dir.famBandHover')
                  .replace('{label}', label)
                  .replace('{count}', String(count))
                  .replace('{best}', best.name)
                  .replace('{rating}', best.rating.toFixed(1))
              : t('dir.famBandHoverEmpty')
                .replace('{label}', label)
                .replace('{place}', place)
            : `${label} · ${count} — ${t('dir.famBandHint')}`;
          /* Sur la bande resserrée, la porte dit en plus dans combien de pays
             du monde sa famille est tenue : le zéro du pays lu se situe
             alors contre l'étendue du répertoire. */
          const paysTenus = paysTenusParFamille(trade);
          const title = resserree
            ? `${baseTitle} · ${paysTenus === 1
              ? t('dir.famBandCountriesOne')
              : t('dir.famBandCountries').replace('{n}', String(paysTenus))}`
            : baseTitle;
          return (
            <li key={trade}>
              <Link
                className="fam-band-door"
                to={`/annuaire/${slugDeTrade(trade)}${pays && slugPays(pays) ? `/${slugPays(pays)}` : ''}`}
                data-on={on ? 'yes' : 'no'}
                data-empty={count === 0 ? 'yes' : 'no'}
                aria-current={on ? 'page' : undefined}
                title={title}
                onClick={() => markFamilleVue(trade)}
              >
                <span className="fam-band-icon" aria-hidden="true">
                  <i className={icon}></i>
                </span>
                <span className="fam-band-name">{label}</span>
                <b className="fam-band-count">{count}</b>
                <i className="ri-arrow-right-line fam-band-go" aria-hidden="true"></i>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* La bande resserrée le dit, et se rend d'un geste : le manque se lit,
          puis s'efface au lieu de rester une vue sans sortie. */}
      {resserree && (
        <div className="fam-band-narrow">
          <p className="fam-band-narrow-lead" title={t('dir.famBandOnlyHint')}>
            <i className="ri-filter-3-line" aria-hidden="true"></i>
            <span>
              {t('dir.famBandOnly')
                .replace('{n}', String(absentes.length))
                .replace('{place}', place)}
            </span>
          </p>
          {/* Le total mondial des familles montrées : le manque se lit à
              l'échelle du répertoire, pas seulement dans le pays. */}
          <em className="fam-band-narrow-world" title={t('dir.famBandOnlyWorldHint')}>
            <i className="ri-earth-line" aria-hidden="true"></i>
            <span>
              {(portesAffichees.length === 1
                ? t('dir.famBandOnlyWorldOne')
                : t('dir.famBandOnlyWorld').replace('{n}', String(portesAffichees.length)))
                .replace('{total}', String(totalMondeResserree))}
            </span>
          </em>
          <button
            type="button"
            className="fam-band-narrow-off"
            title={t('dir.famBandRestoreHint')}
            onClick={rendreLesHuit}
          >
            <i className="ri-refresh-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('dir.famBandRestore')}</span>
          </button>
        </div>
      )}

      {/* Sous les portes, la ligne des familles absentes : elle dit combien
          manquent au pays lu, et chacune s'ouvre d'un clic dans tout le
          répertoire — le manque est nommé, et il mène quelque part. */}
      {absentes.length > 0 && !resserree && (
        <div className="fam-band-absent">
          <p className="fam-band-absent-lead" title={t('dir.famAbsentHint')}>
            <i className="ri-door-open-line" aria-hidden="true"></i>
            <span>
              {absentes.length === 1
                ? t('dir.famAbsentOne').replace('{place}', place)
                : t('dir.famAbsent')
                  .replace('{n}', String(absentes.length))
                  .replace('{place}', place)}
            </span>
          </p>
          <ul className="fam-band-absent-list">
            {absentes.map(({ trade }) => (
              <li key={trade}>
                <Link
                  className="fam-band-absent-door"
                  to={`/annuaire/${slugDeTrade(trade)}`}
                  title={`${t(`tradePlural.${trade}`)} — ${t('dir.famAbsentOpen')}`}
                >
                  {t(`tradePlural.${trade}`)}
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}