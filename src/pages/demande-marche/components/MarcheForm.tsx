import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { useAuth } from '@/auth/AuthProvider';
import { sendB2bRequest, type B2bIssue, type B2bTarget } from '@/lib/b2b';
import ConsentLegal, { consentementComplet, consentementDepuis } from '@/components/feature/ConsentLegal';
import {
  PIECE_MAX_BYTES,
  isPdfFile,
  pieceSizeLabel,
  uploadMarchePiece,
  type PieceIssue,
} from '@/lib/marchePieces';
import PieceField from './PieceField';

type Props = {
  selected: B2bTarget[];
  reference: string;
  onSent: (reference: string) => void;
  onReset: () => void;
};

/** The same failures as the print-run counter: one wording for one problem. */
const MESSAGES: Record<B2bIssue, string> = {
  net: 'b2b.errNet',
  invalid: 'b2b.errName',
  'no-target': 'b2b.errTarget',
  'too-many': 'b2b.errTarget',
  insert: 'b2b.errSend',
  unauthorized: 'b2b.errSend',
  'no-card': 'b2b.errSend',
};

/** Chaque refus d'une pièce est dit avec son propre mot : le fichier n'est pas
 * un formulaire, il ne se corrige pas tout seul. */
const PIECE_MESSAGES: Record<PieceIssue, string> = {
  type: 'mar.pieceErrType',
  size: 'mar.pieceErrSize',
  slot: 'mar.pieceErrSend',
  upload: 'mar.pieceErrSend',
};

/**
 * The tender form: same workshops, same reference, same server call as the B2B
 * page — but it asks for what an appel d'offres actually carries. The public
 * buyer sits where the organisation sits, the lot where the quantity sat, the
 * submission deadline where the deadline sat, and the dossier itself in the
 * message. Nothing is invented: each field lands in a column the workshop
 * inbox already reads.
 */
export default function MarcheForm({ selected, reference, onSent, onReset }: Props) {
  const { t, lang } = useLang();
  const { session, compte } = useAuth();
  const [status, setStatus] = useState<'idle' | 'sending' | 'err'>('idle');
  const [formError, setFormError] = useState('');
  const [count, setCount] = useState(0);
  /** True when the receipt mail really left: the copy must not promise it. */
  const [mailOk, setMailOk] = useState(false);
  /** Les deux pièces choisies, gardées en main jusqu'au dépôt du dossier. */
  const [cdcFile, setCdcFile] = useState<File | null>(null);
  const [bordereauFile, setBordereauFile] = useState<File | null>(null);
  /** Combien de pièces sont vraiment parties : l'écran de reçu le dit, sans
   * promettre un document qui n'a pas été joint. */
  const [piecesSent, setPiecesSent] = useState(0);
  const formRef = useRef<HTMLFormElement | null>(null);
  const seeded = useRef(false);

  /* A signed-in member should not retype what the account already knows. */
  useEffect(() => {
    if (seeded.current || !compte || !formRef.current) return;
    seeded.current = true;
    const form = formRef.current;
    const set = (name: string, value: string) => {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.value = value;
    };
    set('nom', compte.nom ?? '');
    set('email', compte.email ?? '');
    set('organisme', compte.organisme ?? '');
    set('telephone', compte.telephone ?? '');
  }, [compte]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    /* Honeypot: a filled field means a bot — stop silently. */
    if (String(data.get('website_alt') || '').trim()) return;

    const nom = String(data.get('nom') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();

    if (selected.length === 0) {
      setStatus('err');
      setFormError(t('b2b.errTarget'));
      return;
    }
    if (!nom || !email) {
      setStatus('err');
      setFormError(t('b2b.errName'));
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setStatus('err');
      setFormError(t('b2b.errEmail'));
      return;
    }
    if (!message) {
      setStatus('err');
      setFormError(t('b2b.errMsg'));
      return;
    }
    if (message.length > 500) {
      setStatus('err');
      setFormError(t('b2b.errLong'));
      return;
    }

    const consentement = consentementDepuis(data);
    if (!consentementComplet(consentement)) {
      setStatus('err');
      setFormError(t('consent.err'));
      return;
    }

    /* Une pièce refusée arrête le dépôt : mieux vaut le dire que de laisser
       partir un dossier amputé de son cahier des charges. */
    const wrongPiece = [cdcFile, bordereauFile].find(
      (file) => file !== null && (file.size > PIECE_MAX_BYTES || !isPdfFile(file)),
    );
    if (wrongPiece) {
      setStatus('err');
      setFormError(
        t(wrongPiece.size > PIECE_MAX_BYTES ? 'mar.pieceErrSize' : 'mar.pieceErrType'),
      );
      return;
    }

    setStatus('sending');
    setFormError('');

    /* Les PDF montent d'abord, chacun sur sa place signée. Le dossier ne part
       qu'une fois les deux pièces arrivées : un dépôt qui cite un document
       absent serait pire qu'un dépôt sans document. */
    let cdcPath = '';
    let bordereauPath = '';
    if (cdcFile) {
      const sent = await uploadMarchePiece('cdc', cdcFile);
      if ('error' in sent) {
        setStatus('err');
        setFormError(t(PIECE_MESSAGES[sent.error]));
        return;
      }
      cdcPath = sent.path;
    }
    if (bordereauFile) {
      const sent = await uploadMarchePiece('bordereau', bordereauFile);
      if ('error' in sent) {
        setStatus('err');
        setFormError(t(PIECE_MESSAGES[sent.error]));
        return;
      }
      bordereauPath = sent.path;
    }

    const result = await sendB2bRequest({
      targets: selected,
      nature: 'marche',
      lang,
      nom,
      email,
      telephone: String(data.get('telephone') || '').trim(),
      organisme: String(data.get('organisme') || '').trim(),
      quantite: String(data.get('quantite') || '').trim(),
      delai: String(data.get('delai') || '').trim(),
      budget: String(data.get('budget') || '').trim(),
      message,
      pieceCdcPath: cdcPath || undefined,
      pieceBordereauPath: bordereauPath || undefined,
      consentement,
    });

    if (result.ok) {
      setStatus('idle');
      setCount(0);
      setMailOk(result.confirmed);
      setPiecesSent([cdcPath, bordereauPath].filter(Boolean).length);
      setCdcFile(null);
      setBordereauFile(null);
      form.reset();
      seeded.current = false;
      onSent(result.reference);
      return;
    }

    setStatus('err');
    setFormError(t(MESSAGES[result.issue] ?? 'b2b.errSend'));
  };

  if (reference) {
    return (
      <section className="b2b-form b2b-done" aria-live="polite">
        <i className="ri-file-shield-2-line" aria-hidden="true"></i>
        <h2>{t('b2b.ok')}</h2>
        <p className="b2b-done-ref">
          {t('b2b.okRef')} <strong>{reference}</strong>
        </p>
        <p className="b2b-done-hint">{t('b2b.okHint')}</p>
        {mailOk && (
          <p className="b2b-done-mail">
            <i className="ri-mail-check-line" aria-hidden="true"></i>
            {t('b2b.okMail')}
          </p>
        )}
        {piecesSent > 0 && (
          <p className="b2b-done-mail">
            <i className="ri-attachment-2" aria-hidden="true"></i>
            {t('mar.okPieces').replace('{n}', String(piecesSent))}
          </p>
        )}
        <div className="b2b-done-actions">
          {session && (
            <Link to="/compte#demandes-b2b" className="cta">
              {t('b2b.toAccount')}
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          )}
          <button
            type="button"
            className="ghost-btn"
            onClick={() => {
              setMailOk(false);
              setPiecesSent(0);
              onReset();
            }}
          >
            <i className="ri-add-line" aria-hidden="true"></i>
            {t('b2b.again')}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="b2b-form" aria-labelledby="mar-form-title">
      <div className="b2b-form-head">
        <h2 id="mar-form-title">{t('mar.formTitle')}</h2>
        <p>{t('mar.formNote')}</p>
      </div>

      <form ref={formRef} onSubmit={onSubmit} noValidate>
        <input
          type="text"
          name="website_alt"
          className="fld-aux"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          readOnly
          onFocus={(event) => event.currentTarget.removeAttribute('readonly')}
        />

        <div className="form-grid">
          <div className="fld">
            <label htmlFor="mar-acheteur">{t('mar.acheteur')}</label>
            <input
              id="mar-acheteur"
              name="organisme"
              autoComplete="organization"
              placeholder={t('mar.acheteurPh')}
            />
          </div>
          <div className="fld">
            <label htmlFor="mar-nom">{t('b2b.name')} *</label>
            <input id="mar-nom" name="nom" required autoComplete="name" placeholder={t('cf.namePh')} />
          </div>
          <div className="fld">
            <label htmlFor="mar-email">{t('b2b.email')} *</label>
            <input
              id="mar-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={t('cf.emailPh')}
            />
          </div>
          <div className="fld">
            <label htmlFor="mar-tel">{t('b2b.phone')}</label>
            <input id="mar-tel" name="telephone" type="tel" autoComplete="tel" placeholder="+…" />
          </div>
          <div className="fld">
            <label htmlFor="mar-lot">{t('mar.lot')}</label>
            <input id="mar-lot" name="quantite" placeholder={t('mar.lotPh')} />
          </div>
          <div className="fld">
            <label htmlFor="mar-limit">{t('mar.limit')}</label>
            <input id="mar-limit" name="delai" placeholder={t('mar.limitPh')} />
          </div>
          <div className="fld">
            <label htmlFor="mar-montant">{t('mar.montant')}</label>
            <input id="mar-montant" name="budget" placeholder={t('mar.montantPh')} />
          </div>
        </div>

        <div className="fld">
          <label htmlFor="mar-msg">
            {t('mar.msg')} *
            {/* The counter is a figure, not a sentence: kept left to right and
                isolated, so an Arabic page never reads it « 500/0 ». */}
            <span className="b2b-count" dir="ltr">
              {count}/500
            </span>
          </label>
          <textarea
            id="mar-msg"
            name="message"
            maxLength={500}
            required
            rows={6}
            onChange={(event) => setCount(event.target.value.length)}
            placeholder={t('mar.msgPh')}
          ></textarea>
        </div>

        {/* Les deux pièces du dossier : elles partent avec la demande, et
            l'atelier comme le déposant les retrouvent par un lien signé. */}
        <fieldset className="b2b-pieces">
          <legend>
            {t('mar.piecesTitle')}
            <span className="b2b-pieces-opt">{t('mar.piecesOptional')}</span>
          </legend>
          <PieceField
            id="mar-cdc"
            label={t('mar.pieceCdc')}
            hint={t('mar.pieceHint').replace('{size}', pieceSizeLabel(PIECE_MAX_BYTES))}
            file={cdcFile}
            disabled={status === 'sending'}
            onPick={setCdcFile}
          />
          <PieceField
            id="mar-bordereau"
            label={t('mar.pieceBordereau')}
            hint={t('mar.pieceHint').replace('{size}', pieceSizeLabel(PIECE_MAX_BYTES))}
            file={bordereauFile}
            disabled={status === 'sending'}
            onPick={setBordereauFile}
          />
          <p className="b2b-pieces-note">
            <i className="ri-lock-2-line" aria-hidden="true"></i>
            {t('mar.piecesNote')}
          </p>
        </fieldset>

        <p className="b2b-note">
          <i className="ri-information-line" aria-hidden="true"></i>
          {session ? t('b2b.accountNote') : t('b2b.guestNote')}
        </p>

        <ConsentLegal idPrefix="mar" />
        <button type="submit" className="cta b2b-submit" disabled={status === 'sending'}>
          {status === 'sending' ? t('b2b.sending') : t('mar.send')}
          <i className="ri-send-plane-line" aria-hidden="true"></i>
        </button>

        {status === 'err' && <p className="form-msg err">{formError}</p>}
      </form>
    </section>
  );
}