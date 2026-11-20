import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { useAuth } from '@/auth/AuthProvider';
import { auteurs } from '@/mocks/auteurs';
import { nomRegion } from '@/lib/regionLabels';
import { detacherAuteur, rattacherAuteur, type AuteurLinkIssue } from '@/lib/ficheAuteur';
import AireCopyProfile from '@/components/feature/AireCopyProfile';
import './author-linker.css';

/**
 * Un compte désigne lui-même sa fiche d'auteur. Une fiche, un compte : le
 * serveur refuse une fiche déjà tenue par quelqu'un d'autre, et le dit ici en
 * une phrase plutôt que d'échouer en silence.
 */
export default function AuthorLinker() {
  const { t, lang } = useLang();
  const { compte, refreshCompte } = useAuth();
  const current = compte?.auteur_id ?? '';
  const linked = useMemo(() => auteurs.find((a) => a.id === current) ?? null, [current]);

  const [editing, setEditing] = useState(false);
  const [needle, setNeedle] = useState('');
  const [picked, setPicked] = useState('');
  const [saving, setSaving] = useState(false);
  const [issue, setIssue] = useState<AuteurLinkIssue | null>(null);
  const [notice, setNotice] = useState('');

  const q = needle.trim().toLowerCase();
  const list = useMemo(() => auteurs
    .filter((a) => (!q ? true : `${a.name} ${a.commune} ${a.wilaya}`.toLowerCase().includes(q)))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    .slice(0, 40), [q]);

  const showPicker = editing || !linked;

  const save = async (value: string | null) => {
    setIssue(null);
    setNotice('');
    setSaving(true);
    if (value) {
      const refusal = await rattacherAuteur(value);
      setSaving(false);
      if (refusal) {
        setIssue(refusal);
        return;
      }
      await refreshCompte();
      setEditing(false);
      setPicked('');
      setNeedle('');
      return;
    }
    const ok = await detacherAuteur();
    setSaving(false);
    if (!ok) {
      setIssue('net');
      return;
    }
    await refreshCompte();
    setEditing(true);
    setNotice(t('acct.au.unlinked'));
  };

  return (
    <div className="aul">
      <div className="aul-head">
        <span className="aul-icon" aria-hidden="true">
          <i className="ri-quill-pen-line"></i>
        </span>
        <div className="aul-txt">
          <strong>{t('acct.au.title')}</strong>
          <p>{t('acct.au.text')}</p>
        </div>
      </div>

      {linked && !showPicker ? (
        <div className="aul-linked">
          <span className="aul-linked-name">
            <i className="ri-checkbox-circle-fill" aria-hidden="true"></i>
            {t('acct.au.linked')} <strong>{linked.name}</strong>
            <em>{linked.commune} · {nomRegion(linked.wilaya, lang)}</em>
          </span>
          <div className="aul-linked-actions">
            <Link to={`/auteur/${linked.id}`} className="ad-btn">
              <i className="ri-external-link-line" aria-hidden="true"></i>
              {t('acct.au.open')}
            </Link>
            <button type="button" className="ad-btn" onClick={() => setEditing(true)}>
              <i className="ri-edit-line" aria-hidden="true"></i>
              {t('acct.au.change')}
            </button>
            <button type="button" className="ad-btn" onClick={() => void save(null)} disabled={saving}>
              <i className="ri-link-unlink" aria-hidden="true"></i>
              {t('acct.au.unlink')}
            </button>
          </div>
          {/* Le geste court de l'aire, le même que sur la fiche de la plume :
              la carte liée n'annonce pas une aire sans pouvoir l'emporter. */}
          <AireCopyProfile pays={linked.pays} nom={linked.name} kind="plume" />
        </div>
      ) : (
        <div className="aul-pick">
          <div className="aul-search">
            <i className="ri-search-line" aria-hidden="true"></i>
            <input
              type="search"
              value={needle}
              onChange={(event) => setNeedle(event.target.value)}
              placeholder={t('acct.au.search')}
              aria-label={t('acct.au.search')}
              autoComplete="off"
            />
          </div>
          <ul className="aul-list">
            {list.length === 0 && <li className="aul-empty">{t('acct.au.empty')}</li>}
            {list.map((author) => (
              <li key={author.id}>
                <button
                  type="button"
                  className="aul-item"
                  data-on={picked === author.id ? 'yes' : 'no'}
                  aria-pressed={picked === author.id}
                  onClick={() => setPicked(author.id)}
                >
                  <img className="aul-item-mark" src={author.portrait} alt="" width={40} height={40} />
                  <span className="aul-item-txt">
                    <strong>{author.name}</strong>
                    <em>
                      {author.commune} · {nomRegion(author.wilaya, lang)}
                      {author.genres[0] ? ` · ${t(`genre.${author.genres[0]}`)}` : ''}
                    </em>
                  </span>
                  <i
                    className={picked === author.id ? 'ri-radio-button-line aul-on' : 'ri-checkbox-blank-circle-line'}
                    aria-hidden="true"
                  ></i>
                </button>
              </li>
            ))}
          </ul>
          <div className="aul-pick-actions">
            <button
              type="button"
              className="cta"
              disabled={!picked || saving}
              onClick={() => void save(picked)}
            >
              {saving ? t('acct.au.saving') : t('acct.au.save')}
              <i className="ri-link" aria-hidden="true"></i>
            </button>
            {linked && (
              <button type="button" className="ghost-btn" onClick={() => setEditing(false)}>
                {t('acct.mine.cancel')}
              </button>
            )}
          </div>
        </div>
      )}

      {issue && (
        <p className="form-msg err aul-issue">
          {issue === 'taken' ? t('acct.au.errTaken') : t('acct.au.errLink')}
        </p>
      )}
      {notice && <p className="form-msg ok">{notice}</p>}
    </div>
  );
}