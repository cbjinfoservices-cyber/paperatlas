import {
  ageJours,
  echeanceEnMots,
  enRelecture,
  jour,
  nombre,
  relectureLongue,
  triParRelecture,
  type AdminAbonnement,
  type AdminAnnonce,
} from './adminTypes';

/** Ce qu'il faut savoir pour écrire une relance : un compte, ses abonnements
 *  et ses dépôts. La fiche comme la ligne du tableau passent par ici, pour que
 *  les deux écrivent mot pour mot le même message. */
export type RelanceContexte = {
  /** Le nom à qui l'on s'adresse — l'entreprise ou l'organisme. */
  nom?: string | null;
  email?: string | null;
  abonnements: AdminAbonnement[];
  annonces: AdminAnnonce[];
  lang: string;
  t: (key: string) => string;
};

/** Les dépôts encore en attente de réponse, le plus ancien en tête : c'est la
 *  liste que la relance reprend, une ligne par dépôt avec son âge. */
export function depotsEnAttente(annonces: AdminAnnonce[]): AdminAnnonce[] {
  return triParRelecture(annonces.filter((row) => enRelecture(row.statut)));
}

/** Les relectures qui traînent, comptées sur les mêmes lignes que la pastille. */
export function compteRelecturesLongues(annonces: AdminAnnonce[]): number {
  return annonces.filter((row) => relectureLongue(row.statut, row.created_at)).length;
}

/**
 * La ligne récapitulative : l'adresse d'abord, puis chaque abonnement avec son
 * montant, son échéance et son état, et enfin ce que le compte a déposé — de
 * quoi écrire un message de relance complet sans rouvrir la fiche.
 */
export function ligneRecap({
  email,
  abonnements,
  annonces,
  lang,
  t,
}: RelanceContexte): string {
  const mail = (email || '').trim();
  if (!mail) return '';
  /* Sans abonnement, le segment garde son étiquette et se ferme sur « aucun » :
     la chaîne se lit d'un bout à l'autre, sans phrase entière jetée au milieu
     des « · ». La fiche, elle, garde sa phrase complète dans son bloc. */
  const abosTexte =
    abonnements.length === 0
      ? t('ad.f.aboNone')
      : `${t('ad.f.abo')} : ${abonnements
          .map((row) =>
            [
              row.offre || '—',
              nombre(row.montant_mensuel),
              `${t('ad.clients.echeance')} ${jour(row.date_echeance, lang)}`,
              echeanceEnMots(row.date_echeance, t),
              row.statut || '—',
            ]
              .filter(Boolean)
              .join(' · '),
          )
          .join(' ; ')}`;
  /* Un compte sans aucun dépôt le dit, plutôt que d'afficher deux zéros que
     le destinataire lirait comme un reproche maladroit. Le nombre de
     relectures longues ferme la phrase : il rappelle l'attente à combler. */
  const longues = compteRelecturesLongues(annonces);
  const lateTexte = longues > 0 ? `${longues} ${t('ad.f.lateCopy')}` : t('ad.f.lateCopyNone');
  const publies = annonces.filter((row) => (row.statut || '').toLowerCase() === 'publie').length;
  const refuses = annonces.filter((row) => (row.statut || '').toLowerCase() === 'refuse').length;
  const depotTexte =
    annonces.length === 0
      ? t('ad.f.depotNoneCopy')
      : `${t('ad.f.annonces')} : ${publies} ${t('ad.f.publies')} · ${refuses} ${t(
          'ad.f.refuses',
        )} · ${lateTexte}`;
  return `${mail} · ${abosTexte} · ${depotTexte}`;
}

/** L'objet, qui annonce le nombre de dépôts encore en attente. */
export function sujetRelance({
  annonces,
  t,
}: Pick<RelanceContexte, 'annonces' | 't'>): string {
  const longues = compteRelecturesLongues(annonces);
  const attente = depotsEnAttente(annonces).length;
  return t('ad.r.subject').replace('{n}', String(longues > 0 ? longues : attente));
}

/**
 * Le message : la ligne copiée au centre, les dépôts en attente au-dessus —
 * de quoi écrire sans rouvrir un seul écran.
 */
export function corpsRelance(ctx: RelanceContexte): string {
  const { nom, annonces, t } = ctx;
  const attente = depotsEnAttente(annonces);
  const bonjour = nom ? t('ad.r.greetNamed').replace('{nom}', nom) : t('ad.r.greet');
  const entete =
    attente.length > 0
      ? t('ad.r.intro').replace('{n}', String(attente.length))
      : t('ad.r.introAccount');
  const lignes = attente.map((row) => {
    const age = ageJours(row.created_at);
    const ageTexte =
      age === null || age <= 0
        ? t('ad.f.depotToday')
        : t('ad.f.depotSince').replace('{n}', String(age));
    return `• ${row.titre || '—'} — ${ageTexte}`;
  });
  return [
    bonjour,
    '',
    entete,
    ...(lignes.length > 0 ? ['', ...lignes] : []),
    '',
    ligneRecap(ctx),
    '',
    t('ad.r.outro'),
    t('ad.r.sign'),
  ].join('\n');
}