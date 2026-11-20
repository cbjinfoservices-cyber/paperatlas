import { useLang } from '@/i18n/LangProvider';

/** The orders the author list can be read in. */
export type AuthorSort = 'pertinence' | 'books' | 'recent' | 'first' | 'generation' | 'name';

export const AUTHOR_SORTS: AuthorSort[] = ['pertinence', 'books', 'recent', 'first', 'generation', 'name'];

export const AUTHOR_SORT_LABEL: Record<AuthorSort, string> = {
  pertinence: 'sort.default',
  books: 'auth.sortBooks',
  recent: 'auth.sortRecent',
  first: 'auth.sortFirst',
  generation: 'sort.generation',
  name: 'sort.name',
};

type Props = {
  sort: AuthorSort;
  onSort: (s: AuthorSort) => void;
};

/**
 * One small control above the author list: the choice is written in the
 * address, so a copied link reopens the list read exactly the same way.
 */
export default function AuthorTools({ sort, onSort }: Props) {
  const { t } = useLang();

  return (
    <div className="dir-sortbar">
      <div className="fld dir-sort">
        <label htmlFor="auth-sort">{t('auth.sort')}</label>
        <div className="fld-inline">
          <i className="ri-sort-desc" aria-hidden="true"></i>
          <select
            id="auth-sort"
            value={sort}
            title={t('auth.sortShare')}
            onChange={(event) => onSort(event.target.value as AuthorSort)}
          >
            {AUTHOR_SORTS.map((key) => (
              <option key={key} value={key}>{t(AUTHOR_SORT_LABEL[key])}</option>
            ))}
          </select>
        </div>
      </div>

      <span className="dir-sorted">
        <i className="ri-link" aria-hidden="true"></i>
        {t('auth.sortShare')}
      </span>
    </div>
  );
}