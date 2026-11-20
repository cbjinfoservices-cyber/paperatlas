import { useLang } from '@/i18n/LangProvider';
import { nomPays, paysDe } from '@/lib/pays';
import './pays-badge.css';

type Props = {
  /** The country of the row; a row without one is Algerian, as everywhere else. */
  code?: string | null;
};

/**
 * The small country chip used on every card of the public boards — directory,
 * classifieds and job offers. It always reads in the language being read, so an
 * Arabic reader sees « مصر » where a French reader sees « Égypte ».
 */
export default function PaysBadge({ code }: Props) {
  const { lang } = useLang();
  return (
    <span className="pays-badge">
      <i className="ri-global-line" aria-hidden="true"></i>
      {nomPays(paysDe({ pays: code }), lang)}
    </span>
  );
}