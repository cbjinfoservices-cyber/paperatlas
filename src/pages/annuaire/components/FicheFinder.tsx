import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import useFinderKey from '@/hooks/useFinderKey';
import { nomPays, paysDe } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { entreprises } from '@/mocks/entreprises';
import './fiche-finder.css';

/** Combien de fiches la recherche propose avant que l'on précise le nom. */
const MAX_RESULTS = 6;

/** Accent-blind, case-blind form, so « Béjaïa » and « bejaia » meet. */
function plat(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * La recherche par nom, posée juste au-dessus des cartes : elle ouvre la fiche
 * d'un atelier sans passer par les filtres de l'annuaire. Elle lit le nom, mais
 * aussi la commune, la région et le pays, pour un visiteur qui ne se souvient
 * que de « Bab Ezzouar ».
 */
export default function FicheFinder() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  /* L'atelier que les flèches ont mis en avant : -1 tant qu'aucun ne l'est,
     et la frappe suivante efface ce choix. */
  const [actif, setActif] = useState(-1);
  const hitsRef = useRef<Array<HTMLLIElement | null>>([]);

  /* « / » ouvre le champ sans cliquer : le raccourci lit la page entière,
     jamais les frappes destinées à un autre champ. */
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

  /* L'atelier mis en avant reste sous les yeux, sans que la page ne saute :
     la liste défile juste assez pour le garder dans le cadre. */
  useEffect(() => {
    if (actif < 0) return;
    hitsRef.current[actif]?.scrollIntoView({ block: 'nearest' });
  }, [actif, results.length]);

  return (
    <div className="dir-find" role="search">
      <label className="dir-find-field">
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
          aria-controls="dir-find-workshops"
          aria-autocomplete="list"
          aria-activedescendant={actif >= 0 && results[actif] ? `dir-find-work-${results[actif].id}` : undefined}
          placeholder={t('dir.findPh')}
          aria-label={t('dir.find')}
          autoComplete="off"
        />
        {query.length > 0 && (
          <button
            type="button"
            className="dir-find-clear"
            aria-label={t('dir.findClear')}
            title={t('dir.findClear')}
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
          className="dir-find-key"
          title={t('dir.findKeyOpen')}
          aria-label={t('dir.findKeyOpen')}
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
        <div className="dir-find-panel" aria-live="polite">
          <p className="dir-find-count">
            <i className="ri-file-list-3-line" aria-hidden="true"></i>
            {t('dir.findCount').replace('{n}', String(results.length))}
          </p>
          {results.length > 0 ? (
            <ul className="dir-find-list" id="dir-find-workshops" role="listbox" aria-label={t('dir.find')}>
              {results.map((fiche, index) => (
                <li
                  key={fiche.id}
                  id={`dir-find-work-${fiche.id}`}
                  role="option"
                  aria-selected={index === actif}
                  ref={(node) => { hitsRef.current[index] = node; }}
                  onMouseEnter={() => setActif(index)}
                >
                  <Link
                    className={`dir-find-hit${index === actif ? ' is-active' : ''}`}
                    to={`/entreprise/${fiche.id}`}
                    title={`${fiche.name} · ${t(`trade.${fiche.trade}`)} · ${nomPays(paysDe(fiche), lang)}`}
                  >
                    <span className="dir-find-name">{fiche.name}</span>
                    <span className="dir-find-meta">
                      <i className="ri-store-2-line" aria-hidden="true"></i>
                      {t(`trade.${fiche.trade}`)}
                      <em>·</em>
                      {nomRegion(fiche.wilaya, lang)}
                      <em>·</em>
                      {nomPays(paysDe(fiche), lang)}
                    </span>
                    <i className="ri-arrow-right-line dir-find-go" aria-hidden="true"></i>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dir-find-none">
              <i className="ri-information-line" aria-hidden="true"></i>
              {t('dir.findNone')}
            </p>
          )}
          <p className="dir-find-hint">
            {t('dir.findHint')} <span className="dir-find-keyhint">{t('dir.findKeyHint')}</span>{' '}
            {results.length > 0 && <span className="dir-find-keyhint">{t('dir.findArrowsFiche')}</span>}
          </p>
        </div>
      )}
    </div>
  );
}