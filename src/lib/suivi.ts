import { supabase } from '@/lib/supabase';

/**
 * One reference, two families. A subscription quote (`DEV-…`) and a print
 * request (`B2B-…`) are followed through the same door, so a visitor never has
 * to know which kind of file they hold before asking.
 */

export type SuiviKind = 'devis' | 'demande';

export type SuiviStatut =
  | 'recu'
  | 'en_etude'
  | 'confirme'
  | 'expire'
  | 'nouvelle'
  | 'vue'
  | 'traitee';

export type SuiviDevis = {
  kind: 'devis';
  reference: string;
  statut: SuiviStatut;
  created: string | null;
  updated: string | null;
  relance: string | null;
  formule: string;
  formuleId: string;
  etablissements: number;
  marche: string;
  devise: string;
  rythme: string;
  montantMensuel: string;
  montantTotal: string;
  /** What the printed sheet addresses to the contact: who the file is for, and
   *  the day the subscription should start. Empty when the file never said. */
  structure: string;
  miseEnRoute: string | null;
};

export type SuiviDemande = {
  kind: 'demande';
  reference: string;
  statut: SuiviStatut;
  created: string | null;
  updated: string | null;
  traiteeAt: string | null;
  atelier: string;
  quantite: string;
  delai: string;
};

export type SuiviDossier = SuiviDevis | SuiviDemande;

export type SuiviIssue = 'empty' | 'format' | 'notfound' | 'net' | 'server';

export type SuiviAnswer =
  | { ok: true; dossier: SuiviDossier }
  | { ok: false; issue: SuiviIssue };

const STATUTS: SuiviStatut[] = [
  'recu',
  'en_etude',
  'confirme',
  'expire',
  'nouvelle',
  'vue',
  'traitee',
];

function statut(value: unknown): SuiviStatut {
  const raw = typeof value === 'string' ? value : '';
  return (STATUTS as string[]).includes(raw) ? (raw as SuiviStatut) : 'recu';
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function when(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null;
}

function issue(value: unknown): SuiviIssue {
  const raw = typeof value === 'string' ? value : '';
  if (raw === 'empty' || raw === 'format' || raw === 'notfound') return raw;
  return 'server';
}

/**
 * The lookup goes through one server call: the two tables are never read from
 * the browser, so a reference alone opens a file — never the list around it.
 */
export async function chercherSuivi(reference: string): Promise<SuiviAnswer> {
  const asked = reference.trim();
  if (!asked) return { ok: false, issue: 'empty' };

  try {
    const { data, error } = await supabase.functions.invoke('suivi-reference', {
      body: { action: 'lookup', reference: asked },
    });
    if (error) return { ok: false, issue: 'net' };

    const body = (data ?? {}) as Record<string, unknown>;
    if (!body.ok) return { ok: false, issue: issue(body.error) };

    const ref = text(body.reference);
    if (!ref) return { ok: false, issue: 'notfound' };

    if (body.kind === 'devis') {
      const sites = Number(body.etablissements);
      return {
        ok: true,
        dossier: {
          kind: 'devis',
          reference: ref,
          statut: statut(body.statut),
          created: when(body.created),
          updated: when(body.updated),
          relance: when(body.relance),
          formule: text(body.formule),
          formuleId: text(body.formuleId),
          etablissements: Number.isFinite(sites) && sites > 0 ? Math.round(sites) : 1,
          marche: text(body.marche),
          devise: text(body.devise),
          rythme: text(body.rythme),
          montantMensuel: text(body.montantMensuel),
          montantTotal: text(body.montantTotal),
          structure: text(body.organisation),
          miseEnRoute: when(body.miseEnRoute),
        },
      };
    }

    return {
      ok: true,
      dossier: {
        kind: 'demande',
        reference: ref,
        statut: statut(body.statut),
        created: when(body.created),
        updated: when(body.updated),
        traiteeAt: when(body.traiteeAt),
        atelier: text(body.atelier),
        quantite: text(body.quantite),
        delai: text(body.delai),
      },
    };
  } catch {
    return { ok: false, issue: 'net' };
  }
}

/** One step of the file's journey, as the page reads it back. */
export type SuiviStep = {
  key: string;
  at: string | null;
  done: boolean;
  current: boolean;
};

/**
 * The journey of a quote: sent, studied, then settled one way or the other.
 * A step only carries a date when the file really says so — nothing is
 * back-dated to make the line look complete.
 */
export function etapesDevis(dossier: SuiviDevis): SuiviStep[] {
  const studied = dossier.statut === 'en_etude' || dossier.statut === 'confirme';
  const settled = dossier.statut === 'confirme' || dossier.statut === 'expire';
  return [
    { key: 'sv.step.sent', at: dossier.created, done: true, current: dossier.statut === 'recu' },
    {
      key: 'sv.step.study',
      at: studied ? dossier.updated : null,
      done: studied,
      current: dossier.statut === 'en_etude',
    },
    {
      key: dossier.statut === 'expire' ? 'sv.step.expired' : 'sv.step.confirmed',
      at: settled ? dossier.updated : null,
      done: settled,
      current: settled,
    },
  ];
}

/** The journey of a print request: received, read by the workshop, answered. */
export function etapesDemande(dossier: SuiviDemande): SuiviStep[] {
  const read = dossier.statut === 'vue' || dossier.statut === 'traitee';
  const answered = dossier.statut === 'traitee';
  return [
    {
      key: 'sv.step.sent',
      at: dossier.created,
      done: true,
      current: dossier.statut === 'nouvelle',
    },
    {
      key: 'sv.step.read',
      at: read ? dossier.updated : null,
      done: read,
      current: dossier.statut === 'vue',
    },
    {
      key: 'sv.step.answered',
      at: answered ? dossier.traiteeAt || dossier.updated : null,
      done: answered,
      current: answered,
    },
  ];
}

export function etapes(dossier: SuiviDossier): SuiviStep[] {
  return dossier.kind === 'devis' ? etapesDevis(dossier) : etapesDemande(dossier);
}

/** Where one reminder stands: still to come, really sent, or its day has passed
 *  without a trace of it leaving. */
export type RelanceState = 'due' | 'sent' | 'reached';

export type RelanceStep = {
  /** How many days after the sending this reminder falls. */
  day: number;
  /** The very day it falls on, in ISO — never a rounded figure. */
  at: string;
  state: RelanceState;
  /** The day the reminder really left, when the file says so — never the day it
   *  was due. Null while nothing proves it went out. */
  sentAt: string | null;
  /** Whom the reminder goes to: the workshop while it answers, our services
   *  once the file is with us. */
  to: 'partner' | 'us';
};

export type RelancePlan = {
  /** Whole days since the request left, never negative. */
  days: number;
  steps: RelanceStep[];
  /** The next reminder still ahead, or null when none is left. */
  next: string | null;
  /** True once the file is settled: no reminder is scheduled any more. */
  closed: boolean;
  /** How many reminders the file really shows as gone out. */
  sent: number;
};

const DAY_MS = 86_400_000;

/**
 * The reminders a file carries: a first word at J+3, a second at J+7. The two
 * days are counted from the moment the request left, never from today, so the
 * calendar does not slide with the visit. A reminder is only said to be « parti »
 * when the file really carries its day; a past day with no trace is said so,
 * rather than being read as a sent message.
 */
export function planRelances(dossier: SuiviDossier): RelancePlan {
  const start = dossier.created ? new Date(dossier.created).getTime() : NaN;
  const closed = dossier.kind === 'devis'
    ? dossier.statut === 'confirme' || dossier.statut === 'expire'
    : dossier.statut === 'traitee';
  const to: RelanceStep['to'] = dossier.kind === 'devis' ? 'us' : 'partner';

  if (!Number.isFinite(start)) {
    return { days: 0, steps: [], next: null, closed, sent: 0 };
  }

  const seen = dossier.kind === 'devis' && dossier.relance
    ? new Date(dossier.relance).getTime()
    : NaN;
  const now = Date.now();
  const days = Math.max(0, Math.floor((now - start) / DAY_MS));

  const steps: RelanceStep[] = [3, 7].map((day) => {
    const at = new Date(start + day * DAY_MS);
    const ahead = at.getTime() > now;
    const gone = Number.isFinite(seen) && seen >= at.getTime();
    return {
      day,
      at: at.toISOString(),
      state: ahead ? 'due' : gone ? 'sent' : 'reached',
      sentAt: ahead || !gone ? null : (dossier.kind === 'devis' ? dossier.relance : null),
      to,
    };
  });

  return {
    days,
    steps,
    next: closed ? null : (steps.find((step) => step.state === 'due')?.at ?? null),
    closed,
    sent: steps.filter((step) => step.state === 'sent').length,
  };
}