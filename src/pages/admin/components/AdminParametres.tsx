import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { supabase } from '@/lib/supabase';
import {
  ADMIN_EMAIL,
  isAdminEmail,
  jour,
  jourHeure,
  type AdminCompte,
  type AdminOverview,
} from './adminTypes';
import AdminMailGuide, {
  MAIL_ETAPES_TOTAL,
  etapesEnPlace,
  premiereEtapeManquante,
} from './AdminMailGuide';
import AdminMailAuth from './AdminMailAuth';
import { downloadAccusesRenvoisCsv, type RenvoiAccuse } from './adminAccusesCsv';
import {
  clearPreuve,
  markDerniereLecture,
  markExpediteurVu,
  markPreuve,
  preuveAgeJours,
  readDerniereLecture,
  readPreuve,
} from './adminMailMemory';

type Props = {
  data: AdminOverview;
  /** Relit la console après un changement de rôle : la liste des comptes et
   *  les compteurs repartent alors de la base, sans recharger la page. */
  onReload?: () => void;
};

/** L'état de l'expéditeur, tel que le serveur le voit : jamais deviné côté
 *  navigateur, puisque la clé et le domaine vivent dans les secrets Supabase. */
type EtatExpediteur = {
  configured: boolean;
  key: boolean;
  domain: string;
  from: string;
  replyTo: string;
  admin: string;
};

/**
 * Les réglages du site, lus tels qu'ils sont enregistrés. La console les montre
 * et dit où ils s'écrivent : une page d'administration ne doit pas donner la
 * main sur des valeurs qu'elle ne sait pas encore valider.
 *
 * Une carte à part dit depuis quelle adresse PaperAtlas écrit. Elle lit l'état
 * réel des secrets, puis propose un envoi de test : une confirmation ne se
 * juge pas sur une promesse, mais sur un message reçu.
 */
export default function AdminParametres({ data, onReload }: Props) {
  const { t, lang } = useLang();
  const reglages = data.parametres;

  /* ---- la gestion des rôles ---- */
  /* Les rôles relus après un changement, par identifiant de compte : la ligne
     suit le geste sans attendre la relecture complète de la console. */
  const [rolesLus, setRolesLus] = useState<Record<string, string>>({});
  const [roleBusy, setRoleBusy] = useState('');
  const [roleNote, setRoleNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [roleQuery, setRoleQuery] = useState('');

  const roleDe = (row: AdminCompte) =>
    (rolesLus[row.id] ?? (row.role || 'membre')).trim().toLowerCase();

  const admins = data.comptes.filter(
    (row) => roleDe(row) === 'admin' || isAdminEmail(row.email),
  ).length;

  /* Les comptes réellement promus depuis la console : leur rôle est écrit
     « admin » en base. Le compte qui porte l'adresse d'administration n'est
     pas compté ici — il n'a pas eu besoin d'être promu. */
  const promus = useMemo(
    () =>
      data.comptes
        .filter((row) => roleDe(row) === 'admin')
        .slice()
        .sort((a, b) => {
          const stamp = (row: AdminCompte) => {
            const value = new Date(row.role_changed_at || '').getTime();
            return Number.isFinite(value) ? value : -1;
          };
          return stamp(b) - stamp(a);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.comptes, rolesLus],
  );

  /* La plus récente des promotions datées : elle se lit dans l'infobulle du
     compteur, pour dater le dernier geste sans parcourir la table. */
  const dernierePromo = useMemo(() => {
    let best: string | null = null;
    let bestStamp = -1;
    promus.forEach((row) => {
      const value = new Date(row.role_changed_at || '').getTime();
      if (Number.isFinite(value) && value > bestStamp) {
        bestStamp = value;
        best = row.role_changed_at || null;
      }
    });
    return best;
  }, [promus]);

  /* Les comptes cherchés d'abord, les administrateurs en tête : le rôle qui
     ouvre la console se lit avant les autres. */
  const comptesRoles = useMemo(() => {
    const needle = roleQuery.trim().toLowerCase();
    const roleOf = (row: AdminCompte) =>
      (rolesLus[row.id] ?? (row.role || 'membre')).trim().toLowerCase();
    return data.comptes
      .filter((row) => {
        if (!needle) return true;
        return [row.organisme, row.nom, row.email, row.formule]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(needle);
      })
      .slice()
      .sort((a, b) => {
        const rangA = roleOf(a) === 'admin' ? 0 : 1;
        const rangB = roleOf(b) === 'admin' ? 0 : 1;
        if (rangA !== rangB) return rangA - rangB;
        return (a.organisme || a.nom || a.email || '').localeCompare(
          b.organisme || b.nom || b.email || '',
        );
      });
  }, [data.comptes, roleQuery, rolesLus]);

  /* Le seul geste : écrire un rôle sur un compte. Le compte qui tient la
     console ne peut pas perdre son rôle d'ici — il se la fermerait. */
  const changerRole = async (compteId: string, role: string) => {
    setRoleBusy(compteId);
    setRoleNote(null);
    try {
      const { data: answer, error: failure } = await supabase.functions.invoke(
        'admin-console',
        { body: { action: 'role-set', compteId, role } },
      );
      const payload = answer as
        | { ok?: boolean; compte?: { id: string; role: string } }
        | null;
      if (failure || !payload?.ok || !payload.compte) {
        setRoleNote({ ok: false, text: t('ad.p.roles.err') });
        return;
      }
      setRolesLus((prev) => ({ ...prev, [payload.compte.id]: payload.compte.role }));
      setRoleNote({
        ok: true,
        text:
          payload.compte.role === 'admin'
            ? t('ad.p.roles.doneAdmin')
            : t('ad.p.roles.doneBack'),
      });
      onReload?.();
    } catch {
      setRoleNote({ ok: false, text: t('ad.p.roles.err') });
    } finally {
      setRoleBusy('');
    }
  };

  /* L'expéditeur : son état au chargement, puis après chaque vérification ou
     envoi de test. */
  const [expediteur, setExpediteur] = useState<EtatExpediteur | null>(null);
  const [mailLoading, setMailLoading] = useState(true);
  const [mailBusy, setMailBusy] = useState(false);
  const [mailNote, setMailNote] = useState('');
  const [mailNoteOk, setMailNoteOk] = useState(false);
  /* Le seul fait qui prouve le domaine : un message réellement reçu. Il ne se
     lit pas côté serveur — la carte retient donc le test parti d'ici, avec son
     jour, pour que la preuve se relise au lieu de s'oublier au rechargement. */
  const [preuve, setPreuve] = useState<string | null>(() => readPreuve());
  const testRecu = Boolean(preuve);
  /* L'instant de la dernière lecture de l'état, retenu sur ce poste : le
     bouton de vérification le dit au survol, pour que l'état affiché ne se
     lise pas comme s'il venait d'être relu. */
  const [lecture, setLecture] = useState<string | null>(() => readDerniereLecture());

  /* L'état du domaine tel que Brevo le voit : la seule réponse qui engage.
   * Un domaine écrit dans les secrets n'est pas un domaine vérifié, et la
   * carte ne doit pas confondre les deux. */
  type EtatDomaine = {
    checked: boolean;
    verified: boolean;
    status: string;
    found?: boolean;
    reason?: string;
    region?: string;
    checkedAt?: string;
    message?: string;
  };
  const [domaine, setDomaine] = useState<EtatDomaine | null>(null);
  const [domaineBusy, setDomaineBusy] = useState(false);
  const [domaineNote, setDomaineNote] = useState('');

  /* Les accusés de réception des candidatures, lus par une fonction
   * serveur : les compteurs, puis la file de ceux qui ne sont pas partis. */
  type AccuseLigne = {
    id: string;
    offre_titre: string;
    entreprise: string;
    candidat_nom: string;
    candidat_email: string;
    statut: string;
    created_at: string;
  };
  type AccuseEtat = {
    total: number;
    sent: number;
    waiting: number;
    today: number;
    pending: AccuseLigne[];
    /** Les accusés qui attendent depuis plus de vingt-quatre heures : le
     *  rappel que la console porte d'un onglet à l'autre. */
    overdue: number;
    /** Le dépôt le plus ancien encore sans accusé, pour situer l'attente. */
    oldestWaitingAt: string | null;
    /** Le journal des renvois, les plus récents d'abord. */
    history: RenvoiAccuse[];
    /** Combien de candidatures en attente ont déjà connu une tentative. */
    attemptCount: number;
  };
  const [accuses, setAccuses] = useState<AccuseEtat | null>(null);
  const [accLoading, setAccLoading] = useState(true);
  const [accBusy, setAccBusy] = useState('');
  const [accNote, setAccNote] = useState('');
  const [accNoteOk, setAccNoteOk] = useState(false);
  /* Le journal se resserre sur les envois qui ne sont pas partis : les échecs
     se traitent d'un coup, sans parcourir les réussites. */
  const [histFailedOnly, setHistFailedOnly] = useState(false);
  /* Et sur un seul motif, quand la question est « qu'est-ce qui bloque le
     plus ? » : aucune adresse, envoi non configuré, refus du service. */
  const [histMotif, setHistMotif] = useState<string | null>(null);
  /* Le renvoi groupé, dit par son avancement : « 3/7 » pendant le geste. */
  const [accBulk, setAccBulk] = useState('');
  /* L'âge de la preuve, lu une fois : au-delà d'un mois, le bouton de test
     porte son repère — le geste attendu se voit depuis l'en-tête, sans
     dérouler le guide. */
  const preuveAge = preuveAgeJours(preuve);
  const preuveVieille = preuveAge !== null && preuveAge > 30;
  /* L'âge de la preuve en mots, puis la phrase du survol : le bouton de test
     dit la date du dernier test réellement reçu, dans la langue du lecteur —
     le point posé sur son coin ne disait que l'ancienneté, jamais le jour. */
  const agePreuveMots =
    preuveAge === null
      ? ''
      : preuveAge === 0
        ? t('ad.p.mail.gAgeToday')
        : preuveAge === 1
          ? t('ad.p.mail.gAgeOne')
          : t('ad.p.mail.gAge').replace('{n}', String(preuveAge));
  const titreTest = preuve
    ? t(preuveVieille ? 'ad.p.mail.testOldAt' : 'ad.p.mail.testAt')
        .replace('{date}', jour(preuve, lang))
        .replace('{age}', agePreuveMots)
    : t('ad.p.mail.testHint');
  /* Les étapes réellement en place, comptées sur les mêmes faits que le
     guide : le chiffre se lit en tête de carte, sans dérouler les quatre
     étapes. */
  const etapesFaites = etapesEnPlace(expediteur, testRecu);
  /* L'étape que le compteur ouvre : la première qui manque, ou la dernière
     quand tout est tenu — le guide se relit alors sur sa preuve. Le numéro
     d'appui permet de rallumer le repère deux fois de suite. */
  const [guideFocus, setGuideFocus] = useState<{ etape: number; n: number } | null>(null);
  const etapeOuverte = premiereEtapeManquante(expediteur, testRecu) || MAIL_ETAPES_TOTAL;

  const lireExpediteur = useCallback(async () => {
    setMailLoading(true);
    try {
      const { data: answer, error: failure } = await supabase.functions.invoke('email-expediteur', {
        body: { action: 'etat' },
      });
      const payload = answer as ({ ok?: boolean } & Partial<EtatExpediteur>) | null;
      if (failure || !payload?.ok) {
        setMailNote(t('ad.p.mail.error'));
        setMailNoteOk(false);
        return;
      }
      setExpediteur({
        configured: Boolean(payload.configured),
        key: Boolean(payload.key),
        domain: payload.domain ?? '',
        from: payload.from ?? '',
        replyTo: payload.replyTo ?? '',
        admin: payload.admin ?? ADMIN_EMAIL,
      });
      /* L'état vient d'être relu : l'heure est retenue, puis affichée au
         survol du bouton qui l'a demandée. */
      setLecture(markDerniereLecture());
    } catch {
      setMailNote(t('ad.p.mail.error'));
      setMailNoteOk(false);
    } finally {
      setMailLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void lireExpediteur();
  }, [lireExpediteur]);

  /* La vérification se demande à Brevo, jamais aux secrets : on lit l'état
   * du domaine que les envois utilisent déjà. */
  const verifierDomaine = useCallback(async () => {
    setDomaineBusy(true);
    setDomaineNote('');
    try {
      const { data: answer, error: failure } = await supabase.functions.invoke(
        'email-expediteur',
        { body: { action: 'verifier' } },
      );
      const payload = answer as (EtatDomaine & { ok?: boolean; message?: string }) | null;
      if (failure || !payload?.ok) {
        setDomaine(null);
        setDomaineNote(t('ad.p.mail.verifyErr'));
        return;
      }
      setDomaine({
        checked: Boolean(payload.checked),
        verified: Boolean(payload.verified),
        status: payload.status ?? '',
        found: payload.found,
        reason: payload.reason,
        region: payload.region ?? '',
        message: payload.message ?? '',
        checkedAt: payload.checkedAt ?? new Date().toISOString(),
      });
    } catch {
      setDomaine(null);
      setDomaineNote(t('ad.p.mail.verifyErr'));
    } finally {
      setDomaineBusy(false);
    }
  }, [t]);

  useEffect(() => {
    void verifierDomaine();
  }, [verifierDomaine]);

  /* Les accusés : les trois compteurs et la file du renvoi, lus ensemble
   * pour que le chiffre et la liste ne puissent pas se contredire. */
  const lireAccuses = useCallback(async () => {
    setAccLoading(true);
    setAccNote('');
    try {
      const { data: answer, error: failure } = await supabase.functions.invoke(
        'accuses-candidature',
        { body: { action: 'etat' } },
      );
      const payload = answer as ({ ok?: boolean } & Partial<AccuseEtat>) | null;
      if (failure || !payload?.ok) {
        setAccuses(null);
        setAccNote(t('ad.p.acc.error'));
        setAccNoteOk(false);
        return;
      }
      setAccuses({
        total: payload.total ?? 0,
        sent: payload.sent ?? 0,
        waiting: payload.waiting ?? 0,
        today: payload.today ?? 0,
        pending: payload.pending ?? [],
        overdue: payload.overdue ?? 0,
        oldestWaitingAt: payload.oldestWaitingAt ?? null,
        history: payload.history ?? [],
        attemptCount: payload.attemptCount ?? 0,
      });
    } catch {
      setAccuses(null);
      setAccNote(t('ad.p.acc.error'));
      setAccNoteOk(false);
    } finally {
      setAccLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void lireAccuses();
  }, [lireAccuses]);

  /* Le renvoi manuel : il emprunte la fonction du dépôt, donc la date n'est
   * écrite que si le courriel part vraiment. */
  const renvoyerAccuse = async (row: AccuseLigne) => {
    setAccBusy(row.id);
    setAccNote('');
    try {
      const { data: answer, error: failure } = await supabase.functions.invoke(
        'accuser-candidature',
        { body: { candidatureId: row.id, lang } },
      );
      const payload = answer as
        | { code?: string; sent?: boolean; reason?: string; accuseAt?: string | null; message?: string }
        | null;
      if (failure || !payload || payload.code !== 'OK') {
        setAccNote(
          payload?.message ? `${t('ad.p.acc.err')} ${payload.message.slice(0, 160)}` : t('ad.p.acc.err'),
        );
        setAccNoteOk(false);
        return;
      }
      if (!payload.sent) {
        const raison =
          payload.reason === 'no-recipient'
            ? t('ad.p.acc.noMail')
            : payload.reason === 'already-acknowledged'
              ? t('ad.p.acc.already').replace('{date}', jour(payload.accuseAt ?? null, lang))
              : t('ad.p.acc.err');
        setAccNote(raison);
        setAccNoteOk(false);
        return;
      }
      setAccNote(
        t('ad.p.acc.ok')
          .replace('{to}', row.candidat_email || row.candidat_nom || '—')
          .replace('{date}', jour(payload.accuseAt ?? null, lang)),
      );
      setAccNoteOk(true);
      await lireAccuses();
    } catch {
      setAccNote(t('ad.p.acc.err'));
      setAccNoteOk(false);
    } finally {
      setAccBusy('');
    }
  };

  /* Les mots du domaine, lus sur la réponse de Brevo : vérifié, en attente,
   * introuvable, ou rien à interroger. */
  const domaineTone = domaine?.verified ? 'ok' : domaine?.checked ? 'warn' : 'soft';
  const domaineMots = !domaine
    ? t('ad.p.mail.noDomainYet')
    : domaine.verified
      ? t('ad.p.mail.verified')
      : domaine.reason === 'no-key'
        ? t('ad.p.mail.noKey')
        : domaine.reason === 'no-domain'
          ? t('ad.p.mail.noDomainSet')
          : domaine.reason === 'key-scope'
            ? t('ad.p.mail.keyScope')
            : domaine.reason
              ? t('ad.p.mail.verifyErr')
              : domaine.found === false
                ? t('ad.p.mail.unknownDomain')
                : t('ad.p.mail.pending');

  /* Les jours d'attente d'une candidature sans accusé, comptés depuis le
   * dépôt réel. */
  const attenteJours = (iso: string) => {
    const time = new Date(iso).getTime();
    if (!Number.isFinite(time)) return 0;
    return Math.max(0, Math.floor((Date.now() - time) / 86400000));
  };

  /* Une candidature sans accusé depuis plus de vingt-quatre heures : c'est
   * elle que le rappel nomme, et que la ligne signale dans la file. */
  const enRetard = (iso: string) => {
    const time = new Date(iso).getTime();
    if (!Number.isFinite(time)) return false;
    return Date.now() - time > 86400000;
  };

  /* Le journal tel que la carte le lit, puis tel que le filtre le laisse :
   * une seule liste, deux lectures — les échecs seuls, ou tout. */
  const journal = accuses?.history ?? [];
  const journalEchecs = journal.filter((row) => row.statut !== 'envoye');

  /* Les motifs réellement présents dans le journal, avec leur poids. Le plus
     lourd ouvre la rangée : il dit ce qui retient le plus d’accusés. Un motif
     que la console ne connaît pas encore garde sa ligne, sous un mot
     explicite — il ne se tait pas. */
  const motifsConnus = ['no-recipient', 'email-not-configured', 'email-error'];
  const motifLabel = (key: string) =>
    motifsConnus.includes(key) ? t(`ad.p.acc.why.${key}`) : t('ad.p.acc.motifOther');
  const motifs = useMemo(() => {
    const compte = new Map<string, number>();
    journalEchecs.forEach((row) => {
      const key = (row.motif || 'other').trim();
      compte.set(key, (compte.get(key) ?? 0) + 1);
    });
    return [...compte.entries()]
      .map(([key, n]) => ({ key, n }))
      .sort((a, b) => b.n - a.n || a.key.localeCompare(b.key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalEchecs.map((row) => `${row.id}:${row.motif || ''}`).join('|')]);

  /* Le motif posé ne se garde que s’il a encore des lignes : un motif éteint
     par une relecture ne laisse pas le journal filtré sur un vide sans porte. */
  const motifActif = motifs.some((entry) => entry.key === histMotif) ? histMotif : null;
  const journalVu = motifActif
    ? journalEchecs.filter((row) => (row.motif || 'other').trim() === motifActif)
    : histFailedOnly
      ? journalEchecs
      : journal;
  /* La file du renvoi groupé : les accusés qui attendent depuis plus de
   * vingt-quatre heures, du plus ancien au plus récent — la même mesure que
   * le rappel posé juste au-dessus. */
  const retards = (accuses?.pending ?? []).filter((row) => enRetard(row.created_at));

  /* Les accusés dont une tentative au moins n'est pas partie, et qui attendent
   * toujours : le geste « renvoyer les échecs » ne rejoue que ceux-là, au lieu
   * de reprendre toute la file des retards. Une candidature dont l'accusé est
   * parti depuis n'est plus dans la file : elle n'est jamais rejouée. */
  const echecsFile = (accuses?.pending ?? []).filter((row) =>
    journalEchecs.some((line) => line.candidature_id === row.id),
  );

  /* Le renvoi groupé emprunte la fonction du dépôt, un candidat après
   * l'autre : la date n'est écrite que si le courriel part vraiment, et le
   * compte final ne dit que ce qui est réellement parti. Le même geste sert
   * aux retards de plus de vingt-quatre heures et aux seuls échecs du journal —
   * seule la file change, et la phrase de fin avec elle. */
  const renvoyerGroupe = async (file: AccuseLigne[], doneKey: string) => {
    if (file.length === 0) return;
    setAccNote('');
    let partis = 0;
    let rates = 0;
    for (let i = 0; i < file.length; i += 1) {
      setAccBulk(`${i + 1}/${file.length}`);
      try {
        const { data: answer, error: failure } = await supabase.functions.invoke(
          'accuser-candidature',
          { body: { candidatureId: file[i].id, lang } },
        );
        const payload = answer as { code?: string; sent?: boolean } | null;
        if (!failure && payload?.code === 'OK' && payload.sent) partis += 1;
        else rates += 1;
      } catch {
        rates += 1;
      }
    }
    setAccBulk('');
    setAccNote(
      t(doneKey).replace('{sent}', String(partis)).replace('{failed}', String(rates)),
    );
    setAccNoteOk(partis > 0 && rates === 0);
    await lireAccuses();
  };

  const renvoyerTousLesRetards = () => renvoyerGroupe(retards, 'ad.p.acc.bulkDone');

  /* La carte rejointe par une porte du suivi : l'appareil s'en souvient, et
     les deux portes portent alors le repère « déjà ouverte ». Un simple
     drapeau ne suffirait pas — le jour de la visite se relit sur la porte.
     L'ancre est guettée aussi après le montage : une porte pressée depuis
     l'onglet déjà ouvert change l'adresse sans remonter la carte. */
  useEffect(() => {
    const noter = () => {
      if (window.location.hash === '#expediteur') markExpediteurVu();
    };
    noter();
    window.addEventListener('hashchange', noter);
    return () => window.removeEventListener('hashchange', noter);
  }, []);

  /* L'envoi de test : le serveur décide, la carte ne fait que raconter ce qui
     est réellement parti. */
  const envoyerTest = async () => {
    setMailBusy(true);
    setMailNote('');
    try {
      const { data: answer, error: failure } = await supabase.functions.invoke('email-expediteur', {
        body: { action: 'test' },
      });
      const payload = answer as
        | { ok?: boolean; sent?: boolean; to?: string; message?: string }
        | null;
      if (failure || !payload?.ok) {
        setMailNote(t('ad.p.mail.testFail'));
        setMailNoteOk(false);
        return;
      }
      if (payload.sent) {
        setMailNote(
          t('ad.p.mail.testSent').replace('{to}', payload.to || expediteur?.admin || ADMIN_EMAIL),
        );
        setMailNoteOk(true);
        /* Le jour du test réussi : il est daté, puis relu à la prochaine visite
           de la console sur cet appareil. */
        setPreuve(markPreuve());
        return;
      }
      /* Un test qui ne part pas retire la preuve : l'étape suivante ne
         s'annonce pas faite sur un ancien envoi, et aucun jour ne se garde. */
      clearPreuve();
      setPreuve(null);
      setMailNote(
        payload.message
          ? `${t('ad.p.mail.testFail')} ${payload.message}`
          : t('ad.p.mail.testFail'),
      );
      setMailNoteOk(false);
    } catch {
      setMailNote(t('ad.p.mail.testFail'));
      setMailNoteOk(false);
    } finally {
      setMailBusy(false);
    }
  };

  const lignes: Array<{ key: string; label: string; value: string }> = reglages
    ? [
        {
          key: 'essai',
          label: t('ad.p.essai'),
          value:
            reglages.essai_jours === null || reglages.essai_jours === undefined
              ? '—'
              : String(reglages.essai_jours),
        },
        {
          key: 'appel',
          label: t('ad.p.appel'),
          value:
            reglages.suivi_appel_heures === null || reglages.suivi_appel_heures === undefined
              ? '—'
              : String(reglages.suivi_appel_heures),
        },
        {
          key: 'by',
          label: t('ad.p.updatedBy'),
          value: reglages.updated_by || '—',
        },
        {
          key: 'at',
          label: t('ad.p.updatedAt'),
          value: jour(reglages.updated_at, lang),
        },
      ]
    : [];

  return (
    <>
      <section className="admin-card">
        <div className="admin-card-head">
          <div>
            <p className="admin-stamp">{t('ad.p.stamp')}</p>
            <p className="admin-sub">{t('ad.p.sub')}</p>
          </div>
        </div>

        {!reglages ? (
          <p className="admin-empty">
            <i className="ri-settings-3-line" aria-hidden="true"></i>
            {t('ad.p.none')}
          </p>
        ) : (
          <dl className="admin-defs">
            {lignes.map((ligne) => (
              <div className="admin-def" key={ligne.key}>
                <dt>{ligne.label}</dt>
                <dd>{ligne.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <p className="admin-note">
          <i className="ri-information-line" aria-hidden="true"></i>
          {t('ad.p.note')}
        </p>
      </section>

      {/* La gestion des rôles : qui peut ouvrir cette console. Un compte se
          promeut administrateur d'un clic, sans recopier son adresse dans les
          secrets de la fonction serveur. */}
      <section className="admin-card">
        <div className="admin-card-head">
          <div>
            <p className="admin-stamp">{t('ad.p.roles.stamp')}</p>
            <p className="admin-sub">{t('ad.p.roles.sub')}</p>
          </div>
          <div className="admin-tools">
            <label className="admin-search">
              <i className="ri-search-line" aria-hidden="true"></i>
              <input
                type="search"
                value={roleQuery}
                onChange={(event) => setRoleQuery(event.target.value)}
                placeholder={t('ad.p.roles.search')}
                className="text-sm"
              />
            </label>
            <span className="admin-count" data-tone="accent" title={t('ad.p.roles.countHint')}>
              <i className="ri-shield-user-line" aria-hidden="true"></i>
              {t('ad.p.roles.count').replace('{n}', String(admins))}
            </span>
            {/* Le nombre de comptes promus depuis la console, à côté du
                précédent : le second dit combien sont entrés par promotion. */}
            <span
              className="admin-count"
              data-tone={promus.length > 0 ? 'ok' : 'soft'}
              title={
                dernierePromo
                  ? `${t('ad.p.roles.promotedHint')} · ${t('ad.p.roles.lastPromotion')} ${jour(
                      dernierePromo,
                      lang,
                    )}`
                  : t('ad.p.roles.promotedHint')
              }
            >
              <i className="ri-user-add-line" aria-hidden="true"></i>
              {t('ad.p.roles.promoted').replace('{n}', String(promus.length))}
            </span>
          </div>
        </div>

        {data.comptes.length === 0 ? (
          <p className="admin-empty">
            <i className="ri-user-line" aria-hidden="true"></i>
            {t('ad.p.roles.none')}
          </p>
        ) : comptesRoles.length === 0 ? (
          <p className="admin-empty">
            <i className="ri-filter-off-line" aria-hidden="true"></i>
            {t('ad.p.roles.empty')}
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">{t('ad.clients.comptes')}</th>
                  <th scope="col">{t('ad.p.roles.role')}</th>
                  <th scope="col">{t('ad.p.roles.action')}</th>
                </tr>
              </thead>
              <tbody>
                {comptesRoles.map((row) => {
                  const role = roleDe(row);
                  const estAdmin = role === 'admin';
                  const estMoi =
                    (row.email || '').trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
                  const bloque = roleBusy === row.id || (estAdmin && estMoi);
                  return (
                    <tr key={row.id}>
                      <td>
                        <b className="admin-strong">
                          {row.organisme || row.nom || '—'}
                        </b>
                        {row.email && <span className="admin-mail">{row.email}</span>}
                      </td>
                      <td>
                        <span className="admin-badge" data-tone={estAdmin ? 'ok' : 'soft'}>
                          <i
                            className={
                              estAdmin ? 'ri-shield-check-line' : 'ri-user-line'
                            }
                            aria-hidden="true"
                          ></i>
                          {estAdmin ? t('ad.p.roles.admin') : t('ad.p.roles.other')}
                        </span>
                        {estMoi && (
                          <span className="admin-muted"> {t('ad.p.roles.me')}</span>
                        )}
                        {estAdmin && (
                          <span className="admin-muted">
                            {' · '}
                            {row.role_changed_at
                              ? `${t('ad.p.roles.promotedOn')} ${jour(row.role_changed_at, lang)}`
                              : t('ad.p.roles.promotedNoDate')}
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn"
                          data-tone={estAdmin ? 'off' : 'accent'}
                          disabled={bloque}
                          title={
                            estAdmin
                              ? estMoi
                                ? t('ad.p.roles.selfHint')
                                : t('ad.p.roles.demoteHint')
                              : t('ad.p.roles.promoteHint')
                          }
                          onClick={() =>
                            void changerRole(row.id, estAdmin ? 'membre' : 'admin')
                          }
                        >
                          <i
                            className={
                              roleBusy === row.id
                                ? 'ri-loader-4-line is-spin'
                                : estAdmin
                                  ? 'ri-shield-cross-line'
                                  : 'ri-shield-check-line'
                            }
                            aria-hidden="true"
                          ></i>
                          <span className="whitespace-nowrap">
                            {estAdmin ? t('ad.p.roles.demote') : t('ad.p.roles.promote')}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {roleNote && (
          <p className="admin-note" data-ok={roleNote.ok ? 'yes' : 'no'} role="status">
            <i
              className={roleNote.ok ? 'ri-check-double-line' : 'ri-error-warning-line'}
              aria-hidden="true"
            ></i>
            {roleNote.text}
          </p>
        )}

        <p className="admin-note">
          <i className="ri-information-line" aria-hidden="true"></i>
          {t('ad.p.roles.note')}
        </p>
      </section>

      {/* L'expéditeur des e-mails : le nom qui signe les confirmations, et une
          preuve qu'un message arrive vraiment. La carte porte son ancre, pour
          que le rappel du suivi l'ouvre droit sur ce bloc. */}
      <section className="admin-card" id="expediteur">
        <div className="admin-card-head">
          <div>
            <p className="admin-stamp">{t('ad.p.mail.stamp')}</p>
            <p className="admin-sub">{t('ad.p.mail.sub')}</p>
          </div>
          <div className="admin-tools">
            {/* Le compte des étapes en place, posé à côté des gestes : il se
                lit d'un coup d'œil, sans ouvrir le guide — et le clic ouvre
                le guide sur la première étape qui manque encore. */}
            <button
              type="button"
              className="admin-count admin-count-btn"
              data-tone={etapesFaites === MAIL_ETAPES_TOTAL ? 'ok' : 'soft'}
              title={t('ad.p.mail.stepsOpenHint')}
              aria-label={t('ad.p.mail.stepsOpenHint')}
              onClick={() =>
                setGuideFocus((prev) => ({ etape: etapeOuverte, n: (prev?.n ?? 0) + 1 }))
              }
            >
              <i
                className={
                  etapesFaites === MAIL_ETAPES_TOTAL ? 'ri-check-double-line' : 'ri-route-line'
                }
                aria-hidden="true"
              ></i>
              {t('ad.p.mail.steps')
                .replace('{n}', String(etapesFaites))
                .replace('{total}', String(MAIL_ETAPES_TOTAL))}
            </button>
            <button
              type="button"
              className="admin-btn"
              disabled={mailLoading}
              title={
                lecture
                  ? t('ad.p.mail.checkAt').replace('{date}', jourHeure(lecture, lang))
                  : t('ad.p.mail.checkNever')
              }
              onClick={() => void lireExpediteur()}
            >
              <i
                className={mailLoading ? 'ri-loader-4-line is-spin' : 'ri-refresh-line'}
                aria-hidden="true"
              ></i>
              <span className="whitespace-nowrap">{t('ad.p.mail.check')}</span>
            </button>
            {/* La vérification du domaine, demandée à Brevo lui-même : le
                seul geste qui dit si les accusés peuvent vraiment partir. */}
            <button
              type="button"
              className="admin-btn"
              data-tone={domaine?.verified ? 'off' : 'accent'}
              disabled={domaineBusy}
              title={t('ad.p.mail.verifyHint')}
              onClick={() => void verifierDomaine()}
            >
              <i
                className={domaineBusy ? 'ri-loader-4-line is-spin' : 'ri-shield-check-line'}
                aria-hidden="true"
              ></i>
              <span className="whitespace-nowrap">
                {domaineBusy ? t('ad.p.mail.verifying') : t('ad.p.mail.verify')}
              </span>
            </button>
            <button
              type="button"
              className="admin-btn mail-test-btn"
              data-tone="accent"
              data-old={preuveVieille ? 'yes' : 'no'}
              disabled={mailBusy || mailLoading || !expediteur?.configured}
              title={
                expediteur?.configured ? titreTest : t('ad.p.mail.testBlocked')
              }
              onClick={() => void envoyerTest()}
            >
              {preuveVieille && (
                <span className="mail-test-dot" aria-hidden="true">
                  <i className="ri-time-line"></i>
                </span>
              )}
              <i
                className={mailBusy ? 'ri-loader-4-line is-spin' : 'ri-send-plane-line'}
                aria-hidden="true"
              ></i>
              <span className="whitespace-nowrap">
                {mailBusy ? t('ad.p.mail.testing') : t('ad.p.mail.test')}
              </span>
            </button>
          </div>
        </div>

        {mailLoading && !expediteur ? (
          <p className="admin-loading">
            <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
            {t('ad.p.mail.loading')}
          </p>
        ) : (
          <dl className="admin-defs">
            <div className="admin-def">
              <dt>{t('ad.p.mail.state')}</dt>
              <dd>
                <span
                  className="admin-badge"
                  data-tone={expediteur?.configured ? 'ok' : 'warn'}
                >
                  <i
                    className={
                      expediteur?.configured ? 'ri-check-line' : 'ri-error-warning-line'
                    }
                    aria-hidden="true"
                  ></i>
                  {expediteur?.configured ? t('ad.p.mail.ready') : t('ad.p.mail.notReady')}
                </span>
              </dd>
            </div>
            <div className="admin-def">
              <dt>{t('ad.p.mail.from')}</dt>
              <dd>{expediteur?.from || '—'}</dd>
            </div>
            <div className="admin-def">
              <dt>{t('ad.p.mail.domain')}</dt>
              <dd>
                <span className="admin-badge" data-tone={domaineTone} title={t('ad.p.mail.verifyHint')}>
                  <i
                    className={
                      domaine?.verified
                        ? 'ri-check-double-line'
                        : domaineBusy
                          ? 'ri-loader-4-line is-spin'
                          : 'ri-shield-cross-line'
                    }
                    aria-hidden="true"
                  ></i>
                  {domaineMots}
                </span>
                {expediteur?.domain && (
                  <span className="admin-muted"> {expediteur.domain}</span>
                )}
                {domaine?.checkedAt && (
                  <span className="admin-muted">
                    {' · '}
                    {t('ad.p.mail.verifyAt').replace('{date}', jourHeure(domaine.checkedAt, lang))}
                  </span>
                )}
              </dd>
            </div>
            <div className="admin-def">
              <dt>{t('ad.p.mail.reply')}</dt>
              <dd>{expediteur?.replyTo || '—'}</dd>
            </div>
            <div className="admin-def">
              <dt>{t('ad.p.mail.key')}</dt>
              <dd>{expediteur?.key ? t('ad.p.mail.keySet') : t('ad.p.mail.keyMissing')}</dd>
            </div>
            {/* La preuve et son jour, sur la ligne qui la porte : le domaine
                n'est plus seulement « prouvé », il est daté. */}
            <div className="admin-def">
              <dt>{t('ad.p.mail.proof')}</dt>
              <dd>
                <span className="admin-badge" data-tone={preuve ? 'ok' : 'soft'}>
                  <i
                    className={preuve ? 'ri-calendar-check-line' : 'ri-calendar-line'}
                    aria-hidden="true"
                  ></i>
                  {preuve
                    ? t('ad.p.mail.proofAt').replace('{date}', jour(preuve, lang))
                    : t('ad.p.mail.proofNone')}
                </span>
              </dd>
            </div>
          </dl>
        )}

        {/* La marche à suivre, sous l'état réel : la clé, le domaine, puis le
            test reçu. Chaque étape se juge sur un fait, jamais sur une promesse. */}
        {(!mailLoading || expediteur) && (
          <AdminMailGuide
            etat={expediteur}
            testOk={testRecu}
            testDate={preuve}
            focusEtape={guideFocus?.etape ?? null}
            focusKey={guideFocus?.n ?? 0}
          />
        )}

        {/* Les mêmes secrets, mais un autre chemin : les messages qu'un compte
            reçoit avant d'entrer passent par Supabase Auth. Quatre gestes les
            mettent au nom de PaperAtlas, avec les modèles dans les trois
            langues collés à côté. */}
        {(!mailLoading || expediteur) && <AdminMailAuth etat={expediteur} />}

        {mailNote && (
          <p className="admin-note" data-ok={mailNoteOk ? 'yes' : 'no'} role="status">
            <i
              className={mailNoteOk ? 'ri-check-double-line' : 'ri-error-warning-line'}
              aria-hidden="true"
            ></i>
            {mailNote}
          </p>
        )}

        <p className="admin-note">
          <i className="ri-key-2-line" aria-hidden="true"></i>
          {t('ad.p.mail.note')}
        </p>
      </section>

      {/* Les accusés de réception des candidatures : ce qui est réellement
          parti, et ce qui reste à renvoyer. Le compteur se lit sur la même
          date que la fiche du candidat, écrite par la fonction d'envoi. */}
      <section className="admin-card" id="accuses">
        <div className="admin-card-head">
          <div>
            <p className="admin-stamp">{t('ad.p.acc.stamp')}</p>
            <p className="admin-sub">{t('ad.p.acc.sub')}</p>
          </div>
          <div className="admin-tools">
            {/* La porte de l'envoi, posée en tête de la carte des accusés :
                un accusé ne part que si l'expéditeur est configuré et si le
                domaine est vérifié chez Brevo. La pastille le dit, et le clic
                relance la vérification sans remonter à la carte voisine. */}
            <button
              type="button"
              className="admin-count admin-count-btn"
              data-tone={
                expediteur?.configured && domaine?.verified ? 'ok' : 'warn'
              }
              disabled={domaineBusy}
              title={t('ad.p.acc.gateHint')}
              onClick={() => void verifierDomaine()}
            >
              <i
                className={
                  domaineBusy
                    ? 'ri-loader-4-line is-spin'
                    : expediteur?.configured && domaine?.verified
                      ? 'ri-shield-check-line'
                      : 'ri-shield-cross-line'
                }
                aria-hidden="true"
              ></i>
              {expediteur?.configured && domaine?.verified
                ? t('ad.p.acc.gateReady')
                : t('ad.p.acc.gateBlocked')}
            </button>
            <span className="admin-count" data-tone="ok" title={t('ad.p.acc.sentHint')}>
              <i className="ri-mail-check-line" aria-hidden="true"></i>
              {t('ad.p.acc.sent').replace('{n}', String(accuses?.sent ?? 0))}
            </span>
            <span
              className="admin-count"
              data-tone={accuses && accuses.waiting > 0 ? 'accent' : 'soft'}
              title={t('ad.p.acc.waitingHint')}
            >
              <i className="ri-mail-forbid-line" aria-hidden="true"></i>
              {t('ad.p.acc.waiting').replace('{n}', String(accuses?.waiting ?? 0))}
            </span>
            <span className="admin-count" data-tone="soft" title={t('ad.p.acc.todayHint')}>
              <i className="ri-calendar-check-line" aria-hidden="true"></i>
              {t('ad.p.acc.today').replace('{n}', String(accuses?.today ?? 0))}
            </span>
            <button
              type="button"
              className="admin-btn"
              disabled={accLoading}
              onClick={() => void lireAccuses()}
            >
              <i
                className={accLoading ? 'ri-loader-4-line is-spin' : 'ri-refresh-line'}
                aria-hidden="true"
              ></i>
              <span className="whitespace-nowrap">{t('ad.p.acc.refresh')}</span>
            </button>
            {/* Le renvoi groupé : un seul geste pour tous les accusés en
                retard, plutôt qu'une ligne après l'autre. */}
            {retards.length > 0 && (
              <button
                type="button"
                className="admin-btn"
                data-tone="warn"
                disabled={accLoading || Boolean(accBusy) || Boolean(accBulk)}
                title={t('ad.p.acc.bulkHint')}
                onClick={() => void renvoyerTousLesRetards()}
              >
                <i
                  className={accBulk ? 'ri-loader-4-line is-spin' : 'ri-send-plane-2-line'}
                  aria-hidden="true"
                ></i>
                <span className="whitespace-nowrap">
                  {accBulk
                    ? t('ad.p.acc.bulkBusy').replace('{n}', accBulk)
                    : t('ad.p.acc.bulk').replace('{n}', String(retards.length))}
                </span>
              </button>
            )}
            {/* Le second geste groupé : rejouer les seuls envois qui ne sont
                pas partis, au lieu de reprendre toute la file des retards.
                Une candidature déjà accusée n'y entre jamais. */}
            {echecsFile.length > 0 && (
              <button
                type="button"
                className="admin-btn"
                data-tone="accent"
                disabled={accLoading || Boolean(accBusy) || Boolean(accBulk)}
                title={t('ad.p.acc.bulkFailHint')}
                onClick={() => void renvoyerGroupe(echecsFile, 'ad.p.acc.bulkFailDone')}
              >
                <i
                  className={accBulk ? 'ri-loader-4-line is-spin' : 'ri-restart-line'}
                  aria-hidden="true"
                ></i>
                <span className="whitespace-nowrap">
                  {accBulk
                    ? t('ad.p.acc.bulkBusy').replace('{n}', accBulk)
                    : t('ad.p.acc.bulkFail').replace('{n}', String(echecsFile.length))}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* La porte de l'envoi, dite en clair sous les compteurs : tant que
            l'expéditeur ou le domaine n'est pas vérifié chez Brevo, les
            accusés ne peuvent pas vraiment partir — la carte le dit plutôt
            que de laisser croire à un renvoi silencieux. */}
        {expediteur && !(expediteur.configured && domaine?.verified) && (
          <p className="admin-note" data-ok="no" role="status">
            <i className="ri-shield-cross-line" aria-hidden="true"></i>
            {t('ad.p.acc.gateNote')}
          </p>
        )}

        {/* Le rappel : au-delà d'une journée sans accusé, la carte le dit
            elle-même — le chiffre de l'en-tête et cette ligne lisent la même
            mesure, sur le dépôt réel de chaque candidature. */}
        {accuses && accuses.overdue > 0 && (
          <p className="admin-note" data-ok="no" role="status" id="accuses-rappel">
            <i className="ri-alarm-warning-line" aria-hidden="true"></i>
            {t('ad.p.acc.reminder')
              .replace('{n}', String(accuses.overdue))
              .replace(
                '{oldest}',
                accuses.oldestWaitingAt ? jour(accuses.oldestWaitingAt, lang) : '—',
              )}
          </p>
        )}

        {accLoading && !accuses ? (
          <p className="admin-loading">
            <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
            {t('ad.p.mail.loading')}
          </p>
        ) : !accuses ? (
          <p className="admin-empty">
            <i className="ri-error-warning-line" aria-hidden="true"></i>
            {t('ad.p.acc.error')}
          </p>
        ) : accuses.total === 0 ? (
          <p className="admin-empty">
            <i className="ri-mail-line" aria-hidden="true"></i>
            {t('ad.p.acc.none')}
          </p>
        ) : accuses.pending.length === 0 ? (
          <p className="admin-empty">
            <i className="ri-check-double-line" aria-hidden="true"></i>
            {t('ad.p.acc.empty')}
          </p>
        ) : (
          <>
            <p className="admin-note">
              <i className="ri-information-line" aria-hidden="true"></i>
              {t('ad.p.acc.listTitle')} — {t('ad.p.acc.listHint')}
            </p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th scope="col">{t('ad.p.acc.candidat')}</th>
                    <th scope="col">{t('ad.p.acc.offre')}</th>
                    <th scope="col">{t('ad.p.acc.waitSince')}</th>
                    <th scope="col">{t('ad.p.acc.send')}</th>
                  </tr>
                </thead>
                <tbody>
                  {accuses.pending.map((row) => {
                    const jours = attenteJours(row.created_at);
                    return (
                      <tr key={row.id}>
                        <td>
                          <b className="admin-strong">{row.candidat_nom || '—'}</b>
                          {row.candidat_email ? (
                            <span className="admin-mail">{row.candidat_email}</span>
                          ) : (
                            <span className="admin-muted"> · {t('ad.p.acc.fromCompte')}</span>
                          )}
                        </td>
                        <td>
                          {row.offre_titre || '—'}
                          {row.entreprise && (
                            <span className="admin-muted"> · {row.entreprise}</span>
                          )}
                        </td>
                        <td>
                          {jour(row.created_at, lang)}
                          <span className="admin-muted">
                            {' · '}
                            {t('ad.p.acc.days').replace('{n}', String(jours))}
                          </span>
                          {enRetard(row.created_at) && (
                            <span className="admin-badge" data-tone="warn">
                              <i className="ri-alarm-warning-line" aria-hidden="true"></i>
                              {t('ad.p.acc.late')}
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-btn"
                            data-tone="accent"
                            disabled={accBusy === row.id}
                            title={t('ad.p.acc.listHint')}
                            onClick={() => void renvoyerAccuse(row)}
                          >
                            <i
                              className={
                                accBusy === row.id
                                  ? 'ri-loader-4-line is-spin'
                                  : 'ri-send-plane-line'
                              }
                              aria-hidden="true"
                            ></i>
                            <span className="whitespace-nowrap">
                              {accBusy === row.id
                                ? t('ad.p.acc.sending')
                                : t('ad.p.acc.send')}
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {accNote && (
          <p className="admin-note" data-ok={accNoteOk ? 'yes' : 'no'} role="status">
            <i
              className={accNoteOk ? 'ri-check-double-line' : 'ri-error-warning-line'}
              aria-hidden="true"
            ></i>
            {accNote}
          </p>
        )}

        {/* L'historique des renvois : la date, l'auteur, le destinataire — ce
            que la console a déjà fait, et ce que le candidat a réellement reçu. */}
        <div className="admin-card-head">
          <div>
            <p className="admin-stamp">{t('ad.p.acc.histStamp')}</p>
            <p className="admin-sub">{t('ad.p.acc.histSub')}</p>
          </div>
          <div className="admin-tools">
            {/* Le filtre des échecs : il ne garde que les envois qui ne sont
                pas partis, pour les traiter d'un coup. */}
            <button
              type="button"
              className="admin-chip"
              data-on={histFailedOnly ? 'yes' : 'no'}
              data-tone="warn"
              aria-pressed={histFailedOnly}
              disabled={journalEchecs.length === 0}
              title={t('ad.p.acc.histFailHint')}
              onClick={() => {
                const next = !histFailedOnly;
                setHistFailedOnly(next);
                if (!next) setHistMotif(null);
              }}
            >
              <i
                className={histFailedOnly ? 'ri-list-check-2' : 'ri-error-warning-line'}
                aria-hidden="true"
              ></i>
              <span className="whitespace-nowrap">
                {histFailedOnly
                  ? t('ad.p.acc.histAll')
                  : t('ad.p.acc.histFailOnly').replace(
                    '{n}',
                    String(journalEchecs.length),
                  )}
              </span>
            </button>
            {/* Les échecs comptés par motif : le plus lourd ouvre la rangée,
                il dit ce qui bloque le plus. Un clic ne garde que ces
                envois-là, un second rend le journal entier. */}
            {motifs.map((entry) => (
              <button
                key={entry.key}
                type="button"
                className="admin-chip"
                data-on={motifActif === entry.key ? 'yes' : 'no'}
                data-tone="warn"
                aria-pressed={motifActif === entry.key}
                title={t('ad.p.acc.motifHint')}
                onClick={() => {
                  setHistFailedOnly(true);
                  setHistMotif((current) =>
                    current === entry.key ? null : entry.key,
                  );
                }}
              >
                <i
                  className={
                    motifActif === entry.key
                      ? 'ri-filter-3-line'
                      : 'ri-error-warning-line'
                  }
                  aria-hidden="true"
                ></i>
                <span className="whitespace-nowrap">{motifLabel(entry.key)}</span>
                <b>{entry.n}</b>
              </button>
            ))}
            {motifActif && (
              <button
                type="button"
                className="admin-chip"
                title={t('ad.p.acc.motifHint')}
                onClick={() => setHistMotif(null)}
              >
                <i className="ri-close-circle-line" aria-hidden="true"></i>
                {t('ad.p.acc.motifClear')}
              </button>
            )}
            <span className="admin-count" data-tone="soft">
              <i className="ri-history-line" aria-hidden="true"></i>
              {t('ad.p.acc.histCount').replace('{n}', String(journalVu.length))}
            </span>
            <button
              type="button"
              className="admin-btn"
              data-tone="accent"
              disabled={!accuses || journalVu.length === 0}
              title={t('ad.p.acc.histCsvHint')}
              onClick={() => {
                if (!accuses) return;
                downloadAccusesRenvoisCsv({ rows: journalVu, lang, t });
              }}
            >
              <i className="ri-file-excel-2-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ad.p.acc.histCsv')}</span>
            </button>
          </div>
        </div>

        {/* Ce qui bloque le plus, dit en clair sous l’en-tête : le motif le
            plus fréquent parmi les envois qui ne sont pas partis. */}
        {motifs.length > 0 && (
          <p className="admin-note" role="status" title={t('ad.p.acc.motifMostHint')}>
            <i className="ri-error-warning-line" aria-hidden="true"></i>
            {t('ad.p.acc.motifMost')
              .replace('{label}', motifLabel(motifs[0].key))
              .replace('{n}', String(motifs[0].n))}
          </p>
        )}

        {!accuses ? null : journal.length === 0 ? (
          <p className="admin-empty">
            <i className="ri-history-line" aria-hidden="true"></i>
            {t('ad.p.acc.histEmpty')}
          </p>
        ) : journalVu.length === 0 ? (
          <p className="admin-empty">
            <i className="ri-check-double-line" aria-hidden="true"></i>
            {t('ad.p.acc.histFailEmpty')}
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">{t('ad.p.acc.histDate')}</th>
                  <th scope="col">{t('ad.p.acc.histAuthor')}</th>
                  <th scope="col">{t('ad.p.acc.histTo')}</th>
                  <th scope="col">{t('ad.p.acc.candidat')}</th>
                  <th scope="col">{t('ad.p.acc.histState')}</th>
                </tr>
              </thead>
              <tbody>
                {journalVu.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {jourHeure(row.sent_at, lang)}
                      <span className="admin-muted">
                        {' · '}
                        {t(
                          row.declencheur === 'depot'
                            ? 'ad.p.acc.histDepot'
                            : 'ad.p.acc.histRenvoi',
                        )}
                      </span>
                    </td>
                    <td>{row.auteur || '—'}</td>
                    <td>{row.destinataire || '—'}</td>
                    <td>
                      <b className="admin-strong">{row.candidat_nom || '—'}</b>
                      {(row.offre_titre || row.entreprise) && (
                        <span className="admin-mail">
                          {[row.offre_titre, row.entreprise].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className="admin-badge"
                        data-tone={row.statut === 'envoye' ? 'ok' : 'warn'}
                      >
                        <i
                          className={
                            row.statut === 'envoye'
                              ? 'ri-check-double-line'
                              : 'ri-error-warning-line'
                          }
                          aria-hidden="true"
                        ></i>
                        {t(
                          row.statut === 'envoye'
                            ? 'ad.p.acc.histSent'
                            : 'ad.p.acc.histFailed',
                        )}
                      </span>
                      {row.motif && (
                        <span className="admin-muted">
                          {' '}
                          {t(`ad.p.acc.why.${row.motif}`)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="admin-note">
          <i className="ri-information-line" aria-hidden="true"></i>
          {t('ad.p.acc.note')}
        </p>
      </section>

      {domaineNote && (
        <p className="admin-note" data-ok="no" role="status">
          <i className="ri-error-warning-line" aria-hidden="true"></i>
          {domaineNote}
        </p>
      )}

      <section className="admin-card">
        <div className="admin-card-head">
          <div>
            <p className="admin-stamp">{t('ad.stamp')}</p>
            <p className="admin-sub">{t('ad.lede')}</p>
          </div>
        </div>
        <dl className="admin-defs">
          <div className="admin-def">
            <dt>{t('ad.p.access')}</dt>
            <dd>
              <span className="admin-mail">{ADMIN_EMAIL}</span>
            </dd>
          </div>
          <div className="admin-def">
            <dt>{t('ad.p.database')}</dt>
            <dd>{t('ad.p.databaseVal')}</dd>
          </div>
          <div className="admin-def">
            <dt>{t('ad.stat.comptes')}</dt>
            <dd>{data.comptes.length}</dd>
          </div>
          <div className="admin-def">
            <dt>{t('ad.stat.annonces')}</dt>
            <dd>{data.annonces.length}</dd>
          </div>
          <div className="admin-def">
            <dt>{t('ad.stat.fils')}</dt>
            <dd>{data.conversations.length}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}