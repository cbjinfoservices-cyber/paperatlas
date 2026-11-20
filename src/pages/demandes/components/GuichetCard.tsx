import { Link } from 'react-router-dom';

type GuichetCardProps = {
  /** Le rang du guichet, écrit en petit devant son signe. */
  index: string;
  /** Le signe du guichet : devis, tirage, marché. */
  icon: string;
  tag: string;
  title: string;
  body: string;
  bullets: string[];
  cta: string;
  to: string;
};

/**
 * Une des trois portes de la page « Demandes » : ce que le guichet sert, ce
 * qu'il emporte, et le geste qui l'ouvre. Les trois cartes se lisent d'un
 * même œil — même hauteur, même ordre, même bouton.
 */
export default function GuichetCard({
  index,
  icon,
  tag,
  title,
  body,
  bullets,
  cta,
  to,
}: GuichetCardProps) {
  return (
    <article className="gui-card" data-reveal>
      <div className="gui-top">
        <span className="gui-ico" aria-hidden="true">
          <i className={icon}></i>
        </span>
        <span className="gui-n">{index}</span>
      </div>
      <p className="gui-tag">{tag}</p>
      <h2 className="gui-h">{title}</h2>
      <p className="gui-p">{body}</p>
      <ul className="gui-list">
        {bullets.map((item) => (
          <li key={item}>
            <i className="ri-check-line" aria-hidden="true"></i>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Link className="gui-cta" to={to}>
        {cta}
        <i className="ri-arrow-right-line" aria-hidden="true"></i>
      </Link>
    </article>
  );
}