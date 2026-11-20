import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { dayStamp } from '@/lib/dates';
import { deviseCode, nomPays } from '@/lib/pays';
import { nomCommune } from '@/lib/communeLabels';
import { nomRegion } from '@/lib/regionLabels';
import { markOf } from '@/lib/listings';
import { CAT_KEY } from '@/pages/annonces/components/AnnonceCard';
import { CONTRACT_KEY } from '@/pages/emplois/components/JobCard';
import PaysBadge from '@/components/feature/PaysBadge';
import CopyTextButton from '@/components/feature/CopyTextButton';
import DepositPriceHint from '@/pages/deposer/components/DepositPriceHint';
import type { AnnonceCat } from '@/mocks/annonces';
import type { Contract } from '@/mocks/emplois';
import type { DepositKind } from '@/pages/deposer/components/useDepositForm';

const ANNONCE_CATS: AnnonceCat[] = ['materiel', 'papier', 'service', 'recherche'];
const CONTRACTS: Contract[] = ['cdi', 'cdd', 'stage', 'freelance'];

type Props = {
  kind: DepositKind;
  titre: string;
  description: string;
  rubrique: string;
  org: string;
  /* Le courriel compte parmi les champs qui retiennent l'envoi : l'aperçu le
     relit pour dire ce qu'il manque, sans attendre le refus du formulaire. */
  email: string;
  budget: string;
  /* Facultatif : l'aperçu le signale comme un enrichissement, jamais comme un
     empêchement — l'envoi passe sans lui. */
  phone: string;
  pays: string;
  wilaya: string;
  commune: string;
};

/** Un champ qui retient l'envoi, et l'endroit du formulaire où le remplir. */
type Manque = { cle: string; label: string; field: string };

/** La même forme que celle vérifiée à l'envoi : l'aperçu ne promet rien de plus. */
const EMAIL_SHAPE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * La carte du dépôt, telle qu'elle paraîtra sur le tableau, dessinée avec les
 * mêmes classes que les cartes publiques : on voit la rubrique, le titre, le
 * texte, le lieu et le prix à l'endroit exact où le lecteur les lira. Rien
 * n'est cliquable ici — c'est une épreuve, pas une fiche.
 *
 * Sous la carte, deux relevés se suivent sans se confondre : les champs qui
 * retiennent encore l'envoi, nommés un à un, puis ceux qui restent vides sans
 * rien empêcher — le prix, la commune, le téléphone — et qui enrichiraient la
 * fiche. Chacun mène au champ qu'il désigne. Le texte du dépôt se copie enfin
 * d'un geste, et un second geste ouvre le tableau déjà resserré sur la
 * rubrique choisie.
 */
export default function DepositPreview({
  kind,
  titre,
  description,
  rubrique,
  org,
  email,
  budget,
  phone,
  pays,
  wilaya,
  commune,
}: Props) {
  const { t, lang } = useLang();
  /* L'aperçu s'ouvre par défaut ; le replier d'un clic rend le formulaire
     court quand on remplit beaucoup de champs, et le rouvrir ne coûte rien. */
  const [open, setOpen] = useState(true);

  const prefix = kind === 'annonce' ? 'ann' : 'off';
  const cleanTitre = titre.trim();
  const cleanBody = description.trim();
  const orgNom = org.trim();
  const mail = email.trim();
  const prix = budget.trim();
  const place = [nomCommune(commune.trim(), lang), nomRegion(wilaya.trim(), lang)]
    .filter(Boolean)
    .join(' · ');
  const today = dayStamp(new Date().toISOString().slice(0, 10), localeFor(lang));
  const devise = deviseCode(pays);

  const cat = ANNONCE_CATS.includes(rubrique as AnnonceCat) ? (rubrique as AnnonceCat) : null;
  const contract = CONTRACTS.includes(rubrique as Contract) ? (rubrique as Contract) : null;
  const rubriqueLabel = cat
    ? t(CAT_KEY[cat])
    : contract
      ? t(CONTRACT_KEY[contract])
      : '';

  /* Ce qui retiendrait l'envoi, dans l'ordre où le formulaire le demande. */
  const manques: Manque[] = [];
  if (!cleanTitre) manques.push({ cle: 'title', label: t('dep.miss.title'), field: `${prefix}-titre` });
  if (!orgNom) manques.push({ cle: 'org', label: t('dep.miss.org'), field: `${prefix}-org` });
  if (!mail) manques.push({ cle: 'email', label: t('dep.miss.email'), field: `${prefix}-email` });
  else if (!EMAIL_SHAPE.test(mail)) {
    manques.push({ cle: 'emailBad', label: t('dep.miss.emailBad'), field: `${prefix}-email` });
  }
  if (!cleanBody) manques.push({ cle: 'desc', label: t('dep.miss.desc'), field: `${prefix}-desc` });

  /* Ce qui ne bloque rien mais rendrait la fiche plus lisible : le prix, la
     commune et le téléphone. Le formulaire les accepte vides ; l'aperçu le dit
     en ton calme, pour ne pas les confondre avec ce qui retient l'envoi. */
  const enrichissements: Manque[] = [];
  if (!prix) {
    enrichissements.push({ cle: 'budget', label: t('dep.budget'), field: `${prefix}-budget` });
  }
  if (!commune.trim()) {
    enrichissements.push({ cle: 'commune', label: t('dep.commune'), field: `${prefix}-commune` });
  }
  if (!phone.trim()) {
    enrichissements.push({ cle: 'phone', label: t('dep.phone'), field: `${prefix}-phone` });
  }

  /**
   * Mène le lecteur au champ qui manque : la page défile jusqu'à lui, le
   * curseur s'y pose, et le cadre du champ s'éclaire un instant pour qu'on
   * voie où l'on vient d'arriver.
   */
  const jumpTo = (field: string) => {
    const el = document.getElementById(field);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => {
      el.focus({ preventScroll: true });
      const fld = el.closest('.fld');
      if (!fld) return;
      fld.classList.add('is-jumped');
      window.setTimeout(() => fld.classList.remove('is-jumped'), 1800);
    }, 260);
  };

  /** Le dépôt en texte, tel qu'il paraîtra — rien de plus que ce qui est saisi. */
  const buildText = () => {
    const lines: string[] = [];
    lines.push(`${t('dep.copyHead')} — ${kind === 'annonce' ? t('dep.tabAnnonce') : t('dep.tabOffre')}`);
    if (rubriqueLabel) lines.push(`${t('dep.rubrique')} : ${rubriqueLabel}`);
    lines.push('');
    lines.push(cleanTitre || t('dep.previewUntitled'));
    if (cleanBody) lines.push('', cleanBody);
    const lieu = [place, nomPays(pays, lang)].filter(Boolean).join(' · ');
    if (lieu) lines.push('', `${t('jobd.place')} : ${lieu}`);
    if (prix) {
      lines.push(
        kind === 'annonce'
          ? `${t('ann.price')} : ${prix} ${devise}`
          : `${t('jobd.salary')} : ${prix} ${devise}`,
      );
    }
    if (orgNom) lines.push(`${kind === 'annonce' ? t('ann.seller') : t('jobd.company')} : ${orgNom}`);
    if (mail) lines.push(`${t('dep.email')} : ${mail}`);
    return lines.join('\n');
  };

  return (
    <section className="dep-preview" aria-labelledby={`dep-preview-${kind}`}>
      <header className="dep-preview-head">
        <div className="dep-preview-head-row">
          <h3 className="dep-preview-h" id={`dep-preview-${kind}`}>
            <i className="ri-eye-line" aria-hidden="true"></i>
            {t('dep.preview')}
          </h3>
          <button
            type="button"
            className="dep-preview-toggle"
            aria-expanded={open}
            aria-controls={`dep-preview-body-${kind}`}
            title={t('dep.previewFoldHint')}
            onClick={() => setOpen((current) => !current)}
          >
            <i className={open ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} aria-hidden="true"></i>
            {open ? t('dep.previewFold') : t('dep.previewUnfold')}
          </button>
        </div>
        <p className="dep-preview-note">{t('dep.previewNote')}</p>
      </header>

      <div id={`dep-preview-body-${kind}`} className="dep-preview-body" hidden={!open}>
      {!cleanTitre && !cleanBody ? (
        <p className="dep-preview-empty">
          <i className="ri-draft-line" aria-hidden="true"></i>
          {t('dep.previewEmpty')}
        </p>
      ) : kind === 'annonce' ? (
        <article className="ad-card dep-preview-card">
          <div className="ad-top">
            <span className="ad-cat">{cat ? t(CAT_KEY[cat]) : t('dep.rubriqueAny')}</span>
          </div>

          <h4 className="ad-title">{cleanTitre || t('dep.previewUntitled')}</h4>
          {cleanBody && <p className="ad-body">{cleanBody}</p>}

          {(place || pays) && (
            <p className="ad-place">
              <i className="ri-map-pin-line" aria-hidden="true"></i>
              {place || pays}
              <PaysBadge code={pays} />
            </p>
          )}

          <div className="ad-foot">
            {prix && <span className="ad-price">{prix} · {devise}</span>}
            <span className="ad-meta">{t('ann.posted')} {today}</span>
          </div>

          {/* Sous le prix resté vide, un repère : la fourchette des prix déjà
              affichés dans la rubrique, dans la monnaie du pays. */}
          {!prix && (
            <DepositPriceHint
              kind={kind}
              rubrique={rubrique}
              pays={pays}
              onUse={() => jumpTo(`${prefix}-budget`)}
            />
          )}

          <div className="ad-actions">
            <span className="ad-btn ad-btn--solid">
              <i className="ri-mail-send-line" aria-hidden="true"></i>
              {t('ann.contact')}
            </span>
            {orgNom && <span className="ad-seller">{orgNom}</span>}
          </div>
        </article>
      ) : (
        <article className="job-card dep-preview-card">
          <div className="job-top">
            <span className="logo-mark" aria-hidden="true">{markOf(orgNom || 'PA')}</span>
            <div>
              <h4 className="job-title">{cleanTitre || t('dep.previewUntitled')}</h4>
              {orgNom && <p className="job-co">{orgNom}</p>}
            </div>
          </div>

          {cleanBody && <p className="ad-body">{cleanBody}</p>}

          {(place || pays) && (
            <p className="ad-place">
              <i className="ri-map-pin-line" aria-hidden="true"></i>
              {place || pays}
              <PaysBadge code={pays} />
            </p>
          )}

          <div className="ad-foot">
            {prix && (
              <span className="job-salary">
                <i className="ri-wallet-3-line" aria-hidden="true"></i>
                {prix}
              </span>
            )}
            <span className="ad-meta">{t('job.posted')} {today}</span>
          </div>

          {/* Sous le salaire resté vide, la même fourchette : ce que la
              rubrique pratique déjà, à titre de repère. */}
          {!prix && (
            <DepositPriceHint
              kind={kind}
              rubrique={rubrique}
              pays={pays}
              onUse={() => jumpTo(`${prefix}-budget`)}
            />
          )}

          <div className="ad-actions">
            <span className="job-contract">
              {contract ? t(CONTRACT_KEY[contract]) : t('dep.rubriqueAny')}
            </span>
            <span className="ad-btn ad-btn--solid job-apply">
              <i className="ri-send-plane-line" aria-hidden="true"></i>
              {t('job.apply')}
            </span>
          </div>
        </article>
      )}

      {/* Les champs qui retiennent l'envoi, nommés un à un sous la carte.
          Tant qu'il en reste un, la ligne le dit ; quand tout est là, elle
          se tait à sa manière — une seule phrase, sans liste. */}
      <p className={`dep-preview-missing${manques.length === 0 ? ' is-ok' : ''}`}>
        <i
          className={manques.length === 0 ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}
          aria-hidden="true"
        ></i>
        <span className="dep-preview-missing-label">
          {manques.length === 0 ? t('dep.missNone') : t('dep.missTitle')}
        </span>
        {manques.map((manque) => (
          <button
            type="button"
            className="dep-preview-miss"
            key={manque.cle}
            title={t('dep.missJump')}
            onClick={() => jumpTo(manque.field)}
          >
            {manque.label}
          </button>
        ))}
      </p>

      {/* Ce qui reste vide sans rien empêcher : le prix, la commune, le
          téléphone. La ligne se tait quand tout est rempli — il n'y a rien à
          dire de plus. */}
      {enrichissements.length > 0 && (
        <p className="dep-preview-extra" title={t('dep.extraHint')}>
          <i className="ri-add-circle-line" aria-hidden="true"></i>
          <span className="dep-preview-extra-label">{t('dep.extraTitle')}</span>
          {enrichissements.map((item) => (
            <button
              type="button"
              className="dep-preview-gap"
              key={item.cle}
              title={t('dep.missJump')}
              onClick={() => jumpTo(item.field)}
            >
              {item.label}
            </button>
          ))}
        </p>
      )}

      {/* Le dépôt en texte, tel qu'il paraîtra : ce qu'on colle dans un
          message, un e-mail ou un devis, sans le retaper. À côté, la porte du
          tableau déjà resserré sur la rubrique choisie. */}
      <div className="dep-preview-tools">
        <CopyTextButton
          className="dep-preview-copy"
          label={t('dep.copyText')}
          hint={t('dep.copyHint')}
          build={buildText}
        />
        {rubriqueLabel && (
          <Link
            className="dep-preview-door"
            to={kind === 'annonce'
              ? `/annonces?cat=${encodeURIComponent(rubrique)}`
              : `/emplois?contrat=${encodeURIComponent(rubrique)}`}
            title={t(kind === 'annonce' ? 'dep.previewDoorAnnonce' : 'dep.previewDoorOffre')}
          >
            <i className="ri-table-line" aria-hidden="true"></i>
            {t('dep.previewDoor')}
            <b>{rubriqueLabel}</b>
          </Link>
        )}
      </div>
      </div>
    </section>
  );
}