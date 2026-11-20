import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import useFinderKey from '@/hooks/useFinderKey';
import { localize } from '@/i18n/localize';
import { nomPays, paysDe } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { auteurs } from '@/mocks/auteurs';
import './fiche-finder.css';

/** Combien de plumes la recherche propose avant que l'on précise le nom. */
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
 * La recherche par nom de l'onglet Auteurs : elle ouvre la fiche d'une plume
 * sans passer par les filtres. Elle lit le nom, mais aussi la commune, la
 * région, le pays, les genres et les titres de ses livres — pour un visiteur
 * qui ne se souvient que d'un roman ou d'une ville.
 */
export default function AuteurFinder() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  /* La plume que les flèches ont mise en avant : -1 tant qu'aucune ne l'est,
     et la frappe suivante efface ce choix. */
  const [actif, setActif] = useState(-1);
  const hitsRef = useRef<Array<HTMLLIElement | null>>([]);

  /* La même touche « / » que côté ateliers : le champ s'ouvre sans clic, et
     les frappes destinées aux autres champs restent intactes. */
  useFinderKey(inputRef);

  const needle = plat(query);

  const results = useMemo(() => {
    if (needle.length < 1) return [];
    return auteurs
      .filter((a) => (
        plat(a.name).includes(needle)
        || plat(a.commune).includes(needle)
        || plat(a.wilaya).includes(needle)
        || plat(nomPays(paysDe(a), lang)).includes(needle)
        || a.genres.some((g) => plat(t(`genre.${g}`)).includes(needle))
        || a.books.some((b) => plat(localize(b.title, lang)).includes(needle))
      ))
      .slice(0, MAX_RESULTS);
  }, [needle, lang, t]);

  const openFirst = () => {
    const chosen = actif >= 0 ? results[actif] : results[0];
    if (!chosen) return;
    navigate(`/auteur/${chosen.id}`);
  };

  /* La plume mise en avant reste sous les yeux, sans que la page ne saute :
     la liste défile juste assez pour la garder dans le cadre. */
  useEffect(() => {
    if (actif < 0) return;
    hitsRef.current[actif]?.scrollIntoView({ block: 'nearest' });
  }, [actif]);

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
          aria-controls="dir-find-pens"
          aria-autocomplete="list"
          aria-activedescendant={actif >= 0 && results[actif] ? `dir-find-opt-${results[actif].id}` : undefined}
          placeholder={t('dir.authorFindPh')}
          aria-label={t('dir.authorFind')}
          autoComplete="off"
        />
        {query.length > 0 && (
          <button
            type="button"
            className="dir-find-clear"
            aria-label={t('dir.authorFindClear')}
            title={t('dir.authorFindClear')}
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
            <i className="ri-quill-pen-line" aria-hidden="true"></i>
            {t('dir.authorFindCount').replace('{n}', String(results.length))}
          </p>
          {results.length > 0 ? (
            <ul className="dir-find-list" id="dir-find-pens" role="listbox" aria-label={t('dir.authorFind')}>
              {results.map((plume, index) => (
                <li
                  key={plume.id}
                  id={`dir-find-opt-${plume.id}`}
                  role="option"
                  aria-selected={index === actif}
                  ref={(node) => { hitsRef.current[index] = node; }}
                  onMouseEnter={() => setActif(index)}
                >
                  <Link
                    className={`dir-find-hit${index === actif ? ' is-active' : ''}`}
                    to={`/auteur/${plume.id}`}
                    title={`${plume.name} · ${plume.genres.map((g) => t(`genre.${g}`)).join(' · ')} · ${nomPays(paysDe(plume), lang)}`}
                  >
                    <span className="dir-find-name">{plume.name}</span>
                    <span className="dir-find-meta">
                      <i className="ri-quill-pen-line" aria-hidden="true"></i>
                      {plume.genres.slice(0, 2).map((g) => t(`genre.${g}`)).join(' · ')}
                      <em>·</em>
                      {nomRegion(plume.wilaya, lang)}
                      <em>·</em>
                      {nomPays(paysDe(plume), lang)}
                    </span>
                    <i className="ri-arrow-right-line dir-find-go" aria-hidden="true"></i>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dir-find-none">
              <i className="ri-information-line" aria-hidden="true"></i>
              {t('dir.authorFindNone')}
            </p>
          )}
          <p className="dir-find-hint">
            {t('dir.authorFindHint')} <span className="dir-find-keyhint">{t('dir.findKeyHint')}</span>{' '}
            {results.length > 0 && <span className="dir-find-keyhint">{t('dir.findArrows')}</span>}
          </p>
        </div>
      )}
    </div>
  );
}