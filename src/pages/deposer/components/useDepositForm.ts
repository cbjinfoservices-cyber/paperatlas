import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { useLang } from '@/i18n/LangProvider';
import { supabase } from '@/lib/supabase';
import { readBrouillon, saveBrouillon, clearBrouillon } from '@/lib/depotBrouillon';
import { annonces } from '@/mocks/annonces';
import { emplois } from '@/mocks/emplois';
import { paysDevine } from '@/lib/pays';
import { regionsWith } from '@/lib/regions';

/** Ce que l'on dépose. Les deux formulaires partagent les mêmes colonnes,
 *  mais chacun ne propose que les rubriques de sa propre famille. */
export type DepositKind = 'annonce' | 'offre';

export type DepositStatus = 'idle' | 'sending' | 'ok' | 'err';

/**
 * Le dépôt, une fois, pour les deux formulaires : les coordonnées reprises du
 * compte, la liste des wilayas du pays lu, la validation et l'écriture. Un
 * formulaire d'annonce et un formulaire d'offre gardent chacun leur état,
 * puisque chacun monte son propre appel.
 */
export function useDepositForm(kind: DepositKind) {
  const { t } = useLang();
  const { session, compte } = useAuth();

  /* Ce que le visiteur a déjà écrit, retrouvé sur cet appareil : le titre et le
     texte d'abord, pour qu'il ne les réécrive pas en revenant. */
  const brouillon = useMemo(() => readBrouillon(kind), [kind]);

  const [status, setStatus] = useState<DepositStatus>('idle');
  const [formError, setFormError] = useState('');
  const [rubrique, setRubrique] = useState('');
  const [titre, setTitre] = useState(() => brouillon?.titre ?? '');
  const [description, setDescription] = useState(() => brouillon?.description ?? '');
  const [draftBack, setDraftBack] = useState(() => Boolean(brouillon));
  const [budget, setBudget] = useState('');
  const [commune, setCommune] = useState('');
  const [count, setCount] = useState(() => (brouillon?.description ?? '').length);

  const [org, setOrg] = useState('');
  const [email, setEmail] = useState('');
  const [wilaya, setWilaya] = useState('');
  /* Le pays d'où parle le dépôt : celui du membre, puis celui que le visiteur
     laisse deviner, puis librement modifiable. */
  const [pays, setPays] = useState(() => compte?.pays || paysDevine());
  const [phone, setPhone] = useState('');
  const seeded = useRef(false);

  /* Le brouillon s'écrit pendant la frappe, sans attendre l'envoi : la souris
     peut quitter la page sur un titre à peine commencé, il est déjà là. */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveBrouillon(kind, titre, description);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [kind, titre, description]);

  const effacerBrouillon = () => {
    clearBrouillon(kind);
    setTitre('');
    setDescription('');
    setCount(0);
    setDraftBack(false);
  };

  useEffect(() => {
    if (seeded.current || !compte) return;
    seeded.current = true;
    setOrg(compte.organisme ?? '');
    setEmail(compte.email ?? '');
    setWilaya(compte.wilaya ?? '');
    setPays(compte.pays || paysDevine());
    setPhone(compte.telephone ?? '');
  }, [compte]);

  const wilayas = useMemo(
    () => (pays === 'DZ'
      ? Array.from(new Set([
        ...annonces.map((a) => a.wilaya),
        ...emplois.map((j) => j.wilaya),
        ...(compte?.wilaya ? [compte.wilaya] : []),
      ])).sort((a, b) => a.localeCompare(b, 'fr'))
      : regionsWith(pays, wilaya)),
    [compte?.wilaya, pays, wilaya],
  );

  /** Après un envoi, le formulaire revient à son état de départ. */
  const resetForm = () => {
    setCount(0);
    setRubrique('');
    setTitre('');
    setDescription('');
    setBudget('');
    setCommune('');
    setOrg(compte?.organisme ?? '');
    setEmail(compte?.email ?? '');
    setWilaya(compte?.wilaya ?? '');
    setPays(compte?.pays || paysDevine());
    setPhone(compte?.telephone ?? '');
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    /* Le pot de miel : un champ rempli signale un robot, on s'arrête sans le dire. */
    const trap = String(data.get('website_alt') || '').trim();
    if (trap) {
      setStatus('ok');
      return;
    }

    const titre = String(data.get('titre') || '').trim();
    const organisation = String(data.get('organisation') || '').trim();
    const mail = String(data.get('email') || '').trim();
    const description = String(data.get('description') || '').trim();
    const rubriqueChoisie = String(data.get('rubrique') || '').trim();

    if (!titre || !organisation || !mail || !description) {
      setStatus('err');
      setFormError(t('dep.errRequired'));
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) {
      setStatus('err');
      setFormError(t('dep.errEmail'));
      return;
    }
    if (description.length > 500) {
      setStatus('err');
      setFormError(t('dep.errLong'));
      return;
    }

    setStatus('sending');
    setFormError('');

    try {
      /* Un dépôt arrive toujours « en_attente » : rien ne paraît sans relecture. */
      const { error } = await supabase.from('paperatlas_annonces').insert({
        user_id: session?.user?.id ?? null,
        kind,
        rubrique: rubriqueChoisie || null,
        titre,
        organisation,
        budget: String(data.get('budget') || '').trim() || null,
        pays: String(data.get('pays') || '').trim() || pays,
        wilaya: String(data.get('wilaya') || '').trim() || null,
        commune: String(data.get('commune') || '').trim() || null,
        email: mail,
        telephone: String(data.get('telephone') || '').trim() || null,
        description,
        statut: 'en_attente',
      });
      if (error) throw error;

      setStatus('ok');
      form.reset();
      resetForm();
      /* Le dépôt est parti : son brouillon n'a plus lieu d'être. */
      clearBrouillon(kind);
      setDraftBack(false);
    } catch {
      setStatus('err');
      setFormError(t('dep.errNotSaved'));
    }
  };

  return {
    session,
    compte,
    status,
    formError,
    count,
    setCount,
    titre,
    setTitre,
    description,
    setDescription,
    draftBack,
    effacerBrouillon,
    budget,
    setBudget,
    commune,
    setCommune,
    rubrique,
    setRubrique,
    org,
    setOrg,
    email,
    setEmail,
    wilaya,
    setWilaya,
    pays,
    setPays,
    phone,
    setPhone,
    wilayas,
    onSubmit,
  };
}

export type DepositFormState = ReturnType<typeof useDepositForm>;