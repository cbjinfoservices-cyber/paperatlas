import { useId, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import Testimonials from './Testimonials';

/**
 * The three workshop voices, folded into one line inside the home offers
 * section: the same cards as the « Offres » page, one click away and out of
 * the way until the price is being weighed.
 */
export default function HomeVoices() {
  const { t } = useLang();
  const uid = useId();
  const [open, setOpen] = useState(false);
  const panelId = `home-voices-${uid}`;

  return (
    <div className="of-home-voices" data-reveal>
      <button
        type="button"
        className="of-fold-head"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="of-fold-icon" aria-hidden="true">
          <i className="ri-double-quotes-l"></i>
        </span>
        <span className="of-fold-main">
          <strong>{t('oft.title')}</strong>
          <em>{t('oft.sub')}</em>
        </span>
        <span className="of-fold-sign" aria-hidden="true">
          <i className={open ? 'ri-subtract-line' : 'ri-add-line'}></i>
        </span>
      </button>

      <div className="of-home-voices-body" id={panelId} hidden={!open}>
        <Testimonials compact />
        <p className="of-voices-note">
          <i className="ri-information-line" aria-hidden="true"></i>
          <span>{t('oft.note')}</span>
        </p>
      </div>
    </div>
  );
}