import { useId, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { faqItems } from './plans';
import TarifsPays from './TarifsPays';

type Props = {
  /** The home section keeps the same questions, folded tighter into two columns. */
  compact?: boolean;
  /** The page opens the first answer; the home section starts fully folded. */
  defaultOpen?: number | null;
};

/** Pricing FAQ: one question open at a time, closed by default. */
export default function FaqTarifs({ compact = false, defaultOpen = 0 }: Props) {
  const { t } = useLang();
  const uid = useId();
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div className="of-faq-block">
      <ul className={`of-faq${compact ? ' is-compact' : ''}`}>
        {faqItems.map((item, i) => {
          const isOpen = open === i;
          const btnId = `faq-btn-${uid}-${i}`;
          const panelId = `faq-panel-${uid}-${i}`;
          return (
            <li key={item.q} className={`of-faq-item${isOpen ? ' is-open' : ''}`} data-reveal>
              <h3 className="of-faq-head">
                <button
                  type="button"
                  className="of-faq-btn"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  id={btnId}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="of-faq-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="of-faq-q">{t(item.q)}</span>
                  <span className="of-faq-sign" aria-hidden="true">
                    <i className={isOpen ? 'ri-subtract-line' : 'ri-add-line'}></i>
                  </span>
                </button>
              </h3>
              <div
                className="of-faq-panel"
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                hidden={!isOpen}
              >
                <p>{t(item.a)}</p>
              </div>
            </li>
          );
        })}
      </ul>
      {/* Closed under the questions, the whole tariff market by market: the
          figure Premium reads there and the coefficient behind it. */}
      <TarifsPays compact={compact} />
    </div>
  );
}