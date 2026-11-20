import { useRef, useState, type ChangeEvent } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { openCv, removeCv, uploadCv, type CvError } from '@/lib/cv';

type Props = {
  userId: string;
  path: string | null;
  onSaved: (path: string | null) => Promise<boolean>;
};

const ERROR_KEY: Record<CvError, string> = {
  type: 'cv.errType',
  size: 'cv.errSize',
  upload: 'cv.errUpload',
};

/**
 * The CV is a file, not a link: it goes to a private bucket and only ever comes
 * back through a short-lived signed link.
 */
export default function CvField({ userId, path, onSaved }: Props) {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState<'' | 'upload' | 'view' | 'remove'>('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const pick = () => inputRef.current?.click();

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    setSaved(false);
    setBusy('upload');

    const result = await uploadCv(userId, file);
    if ('error' in result) {
      setBusy('');
      setError(t(ERROR_KEY[result.error]));
      return;
    }

    const ok = await onSaved(result.path);
    if (!ok) {
      await removeCv(result.path);
      setBusy('');
      setError(t('cv.errUpload'));
      return;
    }

    /* The previous file is no longer referenced: it leaves the bucket. */
    if (path && path !== result.path) await removeCv(path);
    setBusy('');
    setSaved(true);
  };

  const view = async () => {
    if (!path) return;
    setError('');
    setBusy('view');
    const opened = await openCv(path);
    setBusy('');
    if (!opened) setError(t('cv.errOpen'));
  };

  const drop = async () => {
    if (!path) return;
    setError('');
    setSaved(false);
    setBusy('remove');
    const ok = await onSaved(null);
    if (ok) {
      await removeCv(path);
      setSaved(false);
    } else {
      setError(t('cv.errUpload'));
    }
    setBusy('');
  };

  const hasFile = Boolean(path && path.trim());

  return (
    <div className="cvf">
      <div className="cvf-top">
        <span className="cvf-icon" aria-hidden="true">
          <i className="ri-file-pdf-2-line"></i>
        </span>
        <div className="cvf-txt">
          <strong>{hasFile ? t('cv.ready') : t('cv.none')}</strong>
          <em>{hasFile ? t('cv.private') : t('cv.empty')}</em>
        </div>
        {hasFile && (
          <span className="cvf-badge">
            <i className="ri-lock-line" aria-hidden="true"></i>
            {t('cv.privateBadge')}
          </span>
        )}
      </div>

      <div className="cvf-actions">
        <button type="button" className="cta cvf-main" onClick={pick} disabled={busy !== ''}>
          <i className={busy === 'upload' ? 'ri-loader-4-line is-spin' : 'ri-upload-2-line'} aria-hidden="true"></i>
          {busy === 'upload' ? t('cv.uploading') : hasFile ? t('cv.replace') : t('cv.choose')}
        </button>
        {hasFile && (
          <>
            <button type="button" className="ghost-btn" onClick={() => void view()} disabled={busy !== ''}>
              <i className="ri-eye-line" aria-hidden="true"></i>
              {t('cv.view')}
            </button>
            <button type="button" className="ghost-btn" onClick={() => void drop()} disabled={busy !== ''}>
              <i className="ri-delete-bin-line" aria-hidden="true"></i>
              {t('cv.remove')}
            </button>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        className="cvf-file"
        accept="application/pdf,.pdf"
        onChange={(event) => void onFile(event)}
        tabIndex={-1}
        aria-hidden="true"
      />

      <p className="cvf-hint">
        <i className="ri-information-line" aria-hidden="true"></i>
        {t('cv.hint')}
      </p>

      {saved && <p className="form-msg ok">{t('cv.uploaded')}</p>}
      {error && <p className="form-msg err">{error}</p>}
    </div>
  );
}

