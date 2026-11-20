import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import useFinderKey from '@/hooks/useFinderKey';
import { nomPays, paysDe } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { entreprises } from '@/mocks/entreprises';

/** Combien de fiches la recherche propose avant que l'on précise le nom. */
const MAX_RESULTS = 8;

/** Accent-blind, case-blind form, so « Béjaïa » and « bejaia » meet. */
function plat(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * La recherche du plan du site : un nom d'atelier, et la fiche s'ouvre. Elle lit
 * aussi la commune et la région, pour qu'un lecteur qui ne se souvient que de
 * « Bab Ezzouar » tombe tout de même sur l'atelier qu'il cherche.
 */
export default function PlanSearch() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  /* La fiche que les flèches ont mise en avant : -1 tant qu'aucune ne l'est,
     et la frappe suivante efface ce choix. */
  const [actif, setActif] = useState(-1);
  const hitsRef = useRef<Array<HTMLLIElement | null>>([]);

  /* Le même geste que dans l'annuaire : « / » ouvre le champ depuis n'importe
     où sur la page, sans jamais voler une frappe destinée à un autre champ. */
  useFinderKey(inputRef);

  const needle = plat(query);

  const results = useMemo(() => {
    if (needle.length < 1) return [];
    return entreprises
      .filter((e) => (
        plat(e.name).includes(needle)
        || plat(e.commune).includes(needle)
        || plat(e.wilaya).includes(needle)
        || plat(nomPays(paysDe(e), lang)).includes(needle)
      ))
      .slice(0, MAX_RESULTS);
  }, [needle, lang]);

  const openFirst = () => {
    const chosen = actif >= 0 ? results[actif] : results[0];
    if (!chosen) return;
    navigate(`/entreprise/${chosen.id}`);
  };

  /* La fiche mise en avant reste sous les yeux, sans que la page ne saute :
     la liste défile juste assez pour la garder dans le cadre. */
  useEffect(() => {
    if (actif < 0) return;
    hitsRef.current[actif]?.scrollIntoView({ block: 'nearest' });
  }, [actif, results.length]);

  return (
    <div className="plan-search" role="search">
      <label className="plan-search-field">
        <i className="ri-search-line" aria-hidden="true"></i>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActif(-1);
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              if (results.length === 0) return;
              event.preventDefault();
              setActif((current) => {
                if (event.key === 'ArrowDown') return current < results.length - 1 ? current + 1 : 0;
                return current > 0 ? current - 1 : results.length - 1;
              });
              return;
            }
            if (event.key === 'Enter') {
              event.preventDefault();
              openFirst();
            }
            if (event.key === 'Escape') {
              setQuery('');
              setActif(-1);
            }
          }}
          role="combobox"
          aria-expanded={needle.length > 0}
          aria-controls="plan-search-list"
          aria-autocomplete="list"
          aria-activedescendant={actif >= 0 && results[actif] ? `plan-search-opt-${results[actif].id}` : undefined}
          placeholder={t('siteMap.searchPh')}
          aria-label={t('siteMap.search')}
          autoComplete="off"
        />
        {query.length > 0 && (
          <button
            type="button"
            className="plan-search-clear"
            aria-label={t('siteMap.searchClear')}
            title={t('siteMap.searchClear')}
            onClick={() => {
              setQuery('');
              setActif(-1);
              inputRef.current?.focus();
            }}
          >
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        )}
        <button
          type="button"
          className="plan-search-key"
          title={t('siteMap.findKeyOpen')}
          aria-label={t('siteMap.findKeyOpen')}
          onClick={() => {
            inputRef.current?.focus();
            inputRef.current?.select();
            inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        >
          /
        </button>
      </label>

      {needle.length > 0 && (
        <div className="plan-search-panel">
          <p className="plan-search-count">
            <i className="ri-file-list-3-line" aria-hidden="true"></i>
            {t('siteMap.searchCount').replace('{n}', String(results.length))}
          </p>
          {results.length > 0 ? (
            <ul className="plan-search-list" id="plan-search-list" role="listbox" aria-label={t('siteMap.search')}>
              {results.map((fiche, index) => (
                <li
                  key={fiche.id}
                  id={`plan-search-opt-${fiche.id}`}
                  role="option"
                  aria-selected={index === actif}
                  ref={(node) => { hitsRef.current[index] = node; }}
                  onMouseEnter={() => setActif(index)}
                >
                  <Link
                    className={`plan-search-hit${index === actif ? ' is-active' : ''}`}
                    to={`/entreprise/${fiche.id}`}
                    title={`${fiche.name} · ${t(`trade.${fiche.trade}`)} · ${nomPays(paysDe(fiche), lang)}`}
                  >
                    <span className="plan-search-name">{fiche.name}</span>
                    <span className="plan-search-meta">
                      <i className="ri-store-2-line" aria-hidden="true"></i>
                      {t(`trade.${fiche.trade}`)}
                      <em>·</em>
                      {nomRegion(fiche.wilaya, lang)}
                      <em>·</em>
                      {nomPays(paysDe(fiche), lang)}
                    </span>
                    <i className="ri-arrow-right-line plan-search-go" aria-hidden="true"></i>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="plan-search-none">
              <i className="ri-information-line" aria-hidden="true"></i>
              {t('siteMap.searchNone')}
            </p>
          )}
          <p className="plan-search-hint">
            {t('siteMap.searchHint')} <span className="plan-search-keyhint">{t('siteMap.findKeyHint')}</span>{' '}
            {results.length > 0 && <span className="plan-search-keyhint">{t('siteMap.findArrows')}</span>}
          </p>
        </div>
      )}
    </div>
  );
}