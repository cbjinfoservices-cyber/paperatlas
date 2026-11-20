import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { entreprises } from '@/mocks/entreprises';
import type { B2bIssue } from '@/lib/b2b';
import AireCopyProfile from '@/components/feature/AireCopyProfile';

type Props = {
  current: string | null;
  issue: B2bIssue | null;
  onLink: (entrepriseId: string | null) => Promise<boolean>;
  onClearIssue: () => void;
};

/**
 * An account has to say which directory card is its own before requests can be
 * routed to it. One card, one account: the server refuses a second claim.
 */
export default function CardLinker({ current, issue, onLink, onClearIssue }: Props) {
  const { t } = useLang();
  const [editing, setEditing] = useState(!current);
  const [needle, setNeedle] = useState('');
  const [picked, setPicked] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const linked = useMemo(() => entreprises.find((e) => e.id === current) ?? null, [current]);
  const q = needle.trim().toLowerCase();
  const list = useMemo(() => entreprises
    .filter((e) => (!q ? true : `${e.name} ${e.commune} ${e.wilaya}`.toLowerCase().includes(q)))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    .slice(0, 40), [q]);

  const save = async (value: string | null) => {
    onClearIssue();
    setNotice('');
    setSaving(true);
    const ok = await onLink(value);
    setSaving(false);
    if (!ok) return;
    setEditing(!value ? true : false);
    setPicked('');
    setNeedle('');
    setNotice(value ? '' : t('acct.b2b.unlinked'));
  };

  return (
    <div className="b2bc-link">
      <div className="b2bc-link-head">
        <span className="b2bc-link-icon" aria-hidden="true">
          <i className="ri-store-2-line"></i>
        </span>
        <div className="b2bc-link-txt">
          <strong>{t('acct.b2b.cardTitle')}</strong>
          <p>{t('acct.b2b.cardText')}</p>
        </div>
      </div>

      {linked && !editing ? (
        <div className="b2bc-linked">
          <span className="b2bc-linked-name">
            <i className="ri-checkbox-circle-fill" aria-hidden="true"></i>
            {t('acct.b2b.cardLinked')} <strong>{linked.name}</strong>
            <em>{linked.commune} · {linked.wilaya}</em>
          </span>
          <div className="b2bc-linked-actions">
            <Link to={`/entreprise/${linked.id}`} className="ad-btn">
              <i className="ri-external-link-line" aria-hidden="true"></i>
              {t('acct.b2b.cardOpen')}
            </Link>
            <button type="button" className="ad-btn" onClick={() => setEditing(true)}>
              <i className="ri-edit-line" aria-hidden="true"></i>
              {t('acct.b2b.cardChange')}
            </button>
            <button type="button" className="ad-btn" onClick={() => void save(null)} disabled={saving}>
              <i className="ri-link-unlink" aria-hidden="true"></i>
              {t('acct.b2b.cardUnlink')}
            </button>
          </div>
          {/* Le geste court de l'aire, le même que sur la fiche de l'atelier :
              la carte liée n'annonce pas une aire sans pouvoir l'emporter. */}
          <AireCopyProfile pays={linked.pays} nom={linked.name} kind="atelier" />
        </div>
      ) : (
        <div className="b2bc-pick">
          <div className="b2bc-search">
            <i className="ri-search-line" aria-hidden="true"></i>
            <input
              type="search"
              value={needle}
              onChange={(event) => setNeedle(event.target.value)}
              placeholder={t('acct.b2b.cardSearch')}
              aria-label={t('acct.b2b.cardSearch')}
              autoComplete="off"
            />
          </div>
          <ul className="b2bc-list">
            {list.length === 0 && <li className="b2bc-empty">{t('acct.b2b.cardEmpty')}</li>}
            {list.map((shop) => (
              <li key={shop.id}>
                <button
                  type="button"
                  className="b2bc-item"
                  data-on={picked === shop.id ? 'yes' : 'no'}
                  aria-pressed={picked === shop.id}
                  onClick={() => setPicked(shop.id)}
                >
                  <span className="b2bc-item-mark" aria-hidden="true">{shop.logoMark}</span>
                  <span className="b2bc-item-txt">
                    <strong>{shop.name}</strong>
                    <em>{t(`trade.${shop.trade}`)} · {shop.commune} · {shop.wilaya}</em>
                  </span>
                  <i className={picked === shop.id ? 'ri-radio-button-line b2bc-on' : 'ri-checkbox-blank-circle-line'} aria-hidden="true"></i>
                </button>
              </li>
            ))}
          </ul>
          <div className="b2bc-pick-actions">
            <button
              type="button"
              className="cta"
              disabled={!picked || saving}
              onClick={() => void save(picked)}
            >
              {saving ? t('acct.b2b.cardSaving') : t('acct.b2b.cardSave')}
              <i className="ri-link" aria-hidden="true"></i>
            </button>
            {current && (
              <button type="button" className="ghost-btn" onClick={() => setEditing(false)}>
                {t('acct.mine.cancel')}
              </button>
            )}
          </div>
        </div>
      )}

      {issue && (
        <p className="form-msg err b2bc-issue">
          {issue === 'no-card' ? t('acct.b2b.errTaken') : t('acct.b2b.errLink')}
        </p>
      )}
      {notice && <p className="form-msg ok">{notice}</p>}
    </div>
  );
}