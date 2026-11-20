import { useLang } from '@/i18n/LangProvider';
import { usePrixPays } from '@/hooks/usePrixPays';
import { plans, prixPlan } from './plans';

/** The testimonial badge names the shortest length, so it carries its price too. */
const mensuel = plans.find((plan) => plan.id === 'mensuel');

type Voice = {
  key: string;
  photo: string;
  alt: string;
};

/** Three workshops that pay for Premium, each with the one thing the plan
 *  actually changed for them. Short on purpose: the price argument, not a
 *  marketing page. */
const voices: Voice[] = [
  {
    key: 't1',
    photo: 'https://readdy.ai/api/search-image?query=Portrait%20of%20a%20middle-aged%20Algerian%20printer%20in%20his%20workshop%2C%20ink-stained%20apron%2C%20warm%20amber%20light%2C%20offset%20press%20blurred%20behind%20him%2C%20calm%20confident%20expression%2C%20editorial%20photography%2C%20shallow%20depth%20of%20field&width=200&height=200&seq=oft-voice-printer-oran&orientation=squarish',
    alt: 'Portrait du dirigeant de l’imprimerie El Bahia, à Oran',
  },
  {
    key: 't2',
    photo: 'https://readdy.ai/api/search-image?query=Portrait%20of%20an%20Algerian%20bookbinder%20woman%20in%20a%20traditional%20binding%20workshop%2C%20holding%20a%20freshly%20sewn%20book%20block%2C%20warm%20brown%20and%20amber%20tones%2C%20leather%20tools%20and%20folded%20paper%20behind%20her%2C%20editorial%20photography%2C%20soft%20window%20light&width=200&height=200&seq=oft-voice-binder-tlemcen&orientation=squarish',
    alt: 'Portrait de la relieuse de l’atelier Sidi Boumediene, à Tlemcen',
  },
  {
    key: 't3',
    photo: 'https://readdy.ai/api/search-image?query=Portrait%20of%20a%20young%20Algerian%20screen%20printer%20in%20a%20small%20print%20studio%2C%20holding%20a%20squeegee%2C%20colourful%20ink%20pots%20and%20drying%20racks%20behind%20him%2C%20warm%20dusty%20light%2C%20editorial%20photography%2C%20natural%20expression&width=200&height=200&seq=oft-voice-screenprinter-blida&orientation=squarish',
    alt: 'Portrait du sérigraphe de l’atelier Lettré, à Blida',
  },
];

export default function Testimonials({ compact = false }: { compact?: boolean }) {
  const { t } = useLang();
  const { pays } = usePrixPays();

  return (
    <div className={`of-voices${compact ? ' is-compact' : ''}`}>
      {voices.map((voice) => (
        <figure key={voice.key} className="of-voice" data-reveal>
          <span className="of-voice-mark" aria-hidden="true">”</span>
          <blockquote className="of-voice-quote">
            <p>{t(`oft.${voice.key}q`)}</p>
          </blockquote>
          <figcaption className="of-voice-by">
            <span className="of-voice-face">
              <img src={voice.photo} alt={voice.alt} title={t(`oft.${voice.key}n`)} width={200} height={200} />
            </span>
            <span className="of-voice-ident">
              <b>{t(`oft.${voice.key}n`)}</b>
              <em>{t(`oft.${voice.key}r`)}</em>
            </span>
            <span className="of-voice-plan">
              <i className="ri-vip-crown-line" aria-hidden="true"></i>
              {mensuel ? prixPlan(mensuel, pays, t) : t('off.m1t')}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}