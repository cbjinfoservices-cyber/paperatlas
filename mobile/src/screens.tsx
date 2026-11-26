import type { Session } from '@supabase/supabase-js';
import Feather from '@expo/vector-icons/Feather';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { conversations, messages, publishedListings, searchDirectory, sendMessage, type Conversation, type ListingKind } from './queries';
import type { NonNullableClient } from './types';
import { Button, Card, colors, Notice, SectionHeader, s } from './ui';
import { categories, countryName, type LocationFilter } from './catalog';
import { FilterFields } from './filters';
import { DirectoryMap } from './directory-map';
import { wilayaMapPoints } from './wilaya-map';

export type Tab = 'home' | 'directory' | ListingKind | 'inbox' | 'account';

function message(error: unknown) {
  return error instanceof Error ? error.message : 'Une erreur est survenue. Réessayez.';
}

function useDelayed(value: string) {
  const [delayed, setDelayed] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDelayed(value.trim()), 250);
    return () => clearTimeout(timer);
  }, [value]);
  return delayed;
}

function useRows<T>(read: (signal: AbortSignal) => Promise<T[]>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion(n => n + 1), []);

  useEffect(() => setRows([]), [read]);
  useEffect(() => {
    const request = new AbortController();
    setLoading(true);
    setError('');
    void read(request.signal).then(result => {
      if (!request.signal.aborted) setRows(result);
    }).catch((failure: unknown) => {
      if (!request.signal.aborted) setError(message(failure));
    }).finally(() => {
      if (!request.signal.aborted) setLoading(false);
    });
    return () => request.abort();
  }, [read, version]);
  return { rows, loading, error, refresh };
}

export function Browsing({ db, tab }: { db: NonNullableClient; tab: 'directory' | ListingKind }) {
  return tab === 'directory' ? <Directory db={db} /> : <Listings db={db} kind={tab} />;
}

type ResultsView = 'list' | 'map';

function ResultsViewSwitch({ view, onChange }: { view: ResultsView; onChange: (view: ResultsView) => void }) {
  return <View style={s.switchRow}>
    {([{ id: 'list', label: 'Liste' }, { id: 'map', label: 'Carte' }] as const).map(option => (
      <Pressable key={option.id} accessibilityRole="button" accessibilityState={{ selected: view === option.id }}
        style={[s.switchButton, view === option.id && s.switchActive]} onPress={() => onChange(option.id)}>
        <Text style={view === option.id ? s.accent : s.muted}>{option.label}</Text>
      </Pressable>
    ))}
  </View>;
}

function Directory({ db }: { db: NonNullableClient }) {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ResultsView>('list');
  const [location, setLocation] = useState<LocationFilter>({ country: '', region: '' });
  const term = useDelayed(search);
  const region = useDelayed(location.region);
  const load = useCallback((signal: AbortSignal) =>
    searchDirectory(db, term, signal, { country: location.country, region }), [db, term, location.country, region]);
  const { rows, loading, error, refresh } = useRows(load);
  const points = useMemo(() => wilayaMapPoints(rows.map(row => ({ ...row, name: row.organisme || row.nom }))), [rows]);
  return <FlatList data={view === 'list' ? rows : []} keyExtractor={row => row.id} contentContainerStyle={s.body}
    keyboardShouldPersistTaps="handled"
    refreshing={loading} onRefresh={refresh}
    ListHeaderComponent={<View style={{ gap: 16 }}>
      <SectionHeader eyebrow="Le réseau PaperAtlas" title="Annuaire professionnel"
        description="Retrouvez les membres professionnels de PaperAtlas." />
      <View style={s.search}>
        <Feather name="search" size={20} color={colors.accentLight} />
        <TextInput value={search} onChangeText={setSearch} style={s.searchInput} accessibilityLabel="Rechercher dans l’annuaire"
          placeholder="Nom, métier, ville…" placeholderTextColor={colors.muted} returnKeyType="search" maxLength={100} />
      </View>
      <FilterFields location={location} onLocation={setLocation} />
      <ResultsViewSwitch view={view} onChange={setView} />
      {rows.length ? <Text style={s.listLabel}>Professionnels affichés · {rows.length}</Text> : null}
      {error && rows.length ? <Text style={s.error}>{error}</Text> : null}
    </View>}
    renderItem={({ item }) => <Card icon="users" title={item.organisme || item.nom} meta={[item.metier, item.wilaya, countryName(item.pays)].filter(Boolean).join(' · ')}>
      {item.organisme ? <Text style={s.muted}>{item.nom}</Text> : null}
      {item.bio ? <Text style={s.text}>{item.bio}</Text> : null}
    </Card>}
    ListEmptyComponent={view === 'map' && (rows.length > 0 || (!loading && !error))
      ? <DirectoryMap entries={points} total={rows.length} kind="directory" />
      : <Notice loading={loading} error={error} empty="Aucun professionnel trouvé." />}
  />;
}

function Listings({ db, kind }: { db: NonNullableClient; kind: ListingKind }) {
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState<LocationFilter>({ country: '', region: '' });
  const [view, setView] = useState<ResultsView>('list');
  const region = useDelayed(location.region);
  const load = useCallback((signal: AbortSignal) => publishedListings(db, kind, signal, { category, country: location.country, region }), [db, kind, category, location.country, region]);
  const { rows, loading, error, refresh } = useRows(load);
  const points = useMemo(() => wilayaMapPoints(rows.map(row => ({ ...row, name: row.titre }))), [rows]);
  return <FlatList data={view === 'list' ? rows : []} keyExtractor={item => item.id} contentContainerStyle={s.body}
    keyboardShouldPersistTaps="handled"
    refreshing={loading} onRefresh={refresh}
    ListHeaderComponent={<View style={{ gap: 12 }}>
      <SectionHeader eyebrow="À découvrir" title={kind === 'offre' ? 'Offres d’emploi' : 'Annonces'}
        description={kind === 'offre' ? 'Les offres publiées sur PaperAtlas.' : 'Les annonces publiées sur PaperAtlas.'} />
      <FilterFields typeLabel={kind === 'offre' ? 'Type de contrat' : 'Rubrique'} typeOptions={categories[kind]}
        typeValue={category} onType={setCategory} location={location} onLocation={setLocation} />
      <ResultsViewSwitch view={view} onChange={setView} />
      {rows.length ? <Text style={s.listLabel}>Publications affichées · {rows.length}</Text> : null}
      {error && rows.length ? <Text style={s.error}>{error}</Text> : null}
    </View>}
    renderItem={({ item }) => <Card icon={kind === 'offre' ? 'briefcase' : 'file-text'} title={item.titre}
      meta={[item.organisation, categories[kind].find(option => option.value === item.rubrique)?.label ?? item.rubrique, item.commune, item.wilaya, countryName(item.pays)].filter(Boolean).join(' · ')}>
      {item.description ? <Text style={s.text}>{item.description}</Text> : null}
    </Card>}
    ListEmptyComponent={view === 'map' && (rows.length > 0 || (!loading && !error))
      ? <DirectoryMap entries={points} total={rows.length} kind="publications" />
      : <Notice loading={loading} error={error} empty="Aucune publication pour le moment." />}
  />;
}

export function Account({ db, session, sessionError }: { db: NonNullableClient; session: Session | null; sessionError: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    setPending(true);
    setError('');
    try {
      const { error: failure } = session ? await db.auth.signOut({ scope: 'local' })
        : await db.auth.signInWithPassword({ email: email.trim(), password });
      if (failure) throw failure;
      setPassword('');
    } catch (failure) {
      setError(message(failure));
    } finally {
      setPending(false);
    }
  };
  return <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
      <SectionHeader eyebrow="Espace personnel" title={session ? 'Mon compte' : 'Connexion'}
        description={session ? undefined : 'Utilisez votre compte PaperAtlas existant.'} />
      <View style={s.card}>
        {session ? <View style={s.cardHead}>
          <View style={s.iconBox}><Feather name="user" size={20} color={colors.accentLight} /></View>
          <View style={s.cardContent}>
            <Text style={s.title}>Compte connecté</Text>
            <Text style={s.muted}>{session.user.email}</Text>
          </View>
        </View> : <>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Adresse e-mail</Text>
            <TextInput value={email} onChangeText={setEmail} style={s.input} accessibilityLabel="Adresse e-mail"
              placeholder="Votre adresse e-mail" placeholderTextColor={colors.muted} autoCapitalize="none" autoComplete="email" keyboardType="email-address" />
          </View>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Mot de passe</Text>
            <TextInput value={password} onChangeText={setPassword} style={s.input} accessibilityLabel="Mot de passe"
              placeholder="Votre mot de passe" placeholderTextColor={colors.muted} secureTextEntry autoComplete="current-password" />
          </View>
        </>}
        {error || sessionError ? <Text accessibilityLiveRegion="polite" style={s.error}>{error || sessionError}</Text> : null}
        <Button label={pending ? 'Patientez…' : session ? 'Se déconnecter' : 'Se connecter'}
          disabled={pending || (!session && (!email.trim() || !password))} onPress={() => void submit()} />
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

function conversationTitle(thread: Conversation, userId: string) {
  return thread.sujet || (thread.user_a === userId ? thread.nom_b : thread.nom_a) || 'Conversation';
}

export function Inbox({ db, userId }: { db: NonNullableClient; userId: string }) {
  const [thread, setThread] = useState<Conversation | null>(null);
  const load = useCallback((signal: AbortSignal) => conversations(db, userId, signal), [db, userId]);
  const { rows, loading, error, refresh } = useRows(load);
  if (thread) return <Thread key={thread.id} db={db} userId={userId} thread={thread}
    onBack={() => { setThread(null); refresh(); }} />;
  return <FlatList data={rows} keyExtractor={item => item.id} contentContainerStyle={s.body}
    refreshing={loading} onRefresh={refresh}
    ListHeaderComponent={<View style={{ gap: 12 }}>
      <SectionHeader eyebrow="Vos échanges" title="Messagerie" description="Retrouvez vos conversations." />
      {rows.length ? <Text style={s.listLabel}>Conversations affichées · {rows.length}</Text> : null}
      {error && rows.length ? <Text style={s.error}>{error}</Text> : null}
    </View>}
    ListEmptyComponent={<Notice loading={loading} error={error} empty="Aucune conversation." />}
    renderItem={({ item }) => <Pressable accessibilityRole="button" onPress={() => setThread(item)}>
      <Card icon="message-circle" title={conversationTitle(item, userId)} meta={item.last_message ?? undefined} />
    </Pressable>}
  />;
}

function Thread({ db, thread, userId, onBack }: { db: NonNullableClient; thread: Conversation; userId: string; onBack: () => void }) {
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [sendError, setSendError] = useState('');
  const load = useCallback((signal: AbortSignal) => messages(db, thread.id, signal), [db, thread.id]);
  const { rows, loading, error, refresh } = useRows(load);
  useEffect(() => {
    const channel = db.channel(`mobile-thread-${thread.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'paperatlas_messages', filter: `conversation_id=eq.${thread.id}` }, refresh)
      .subscribe(status => { if (status === 'SUBSCRIBED') refresh(); });
    return () => { void db.removeChannel(channel); };
  }, [db, thread.id, refresh]);
  const submit = async () => {
    const body = draft.trim();
    if (!body || pending) return;
    setPending(true);
    setSendError('');
    try {
      const previewError = await sendMessage(db, thread.id, userId, body);
      setDraft('');
      if (previewError) setSendError(`Message envoyé, mais l’aperçu n’a pas été mis à jour : ${previewError}`);
      refresh();
    } catch (failure) {
      setSendError(message(failure));
    } finally {
      setPending(false);
    }
  };
  return <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={s.threadHeader}>
      <Pressable accessibilityRole="button" accessibilityLabel="Retour aux messages" onPress={onBack} style={s.back}>
        <Feather name="arrow-left" size={18} color={colors.accent} />
        <Text style={s.accent}>Messages</Text>
      </Pressable>
      <Text accessibilityRole="header" style={s.heading}>{conversationTitle(thread, userId)}</Text>
      {error && rows.length ? <Text style={s.error}>{error}</Text> : null}
    </View>
    <FlatList data={rows} keyExtractor={item => item.id} contentContainerStyle={s.messagesBody}
      refreshing={loading} onRefresh={refresh}
      ListEmptyComponent={<Notice loading={loading} error={error} empty="Aucun message dans cette conversation." />}
      renderItem={({ item }) => <View style={[s.message, item.sender_id === userId && s.mine]}>
        <Text style={s.text}>{item.corps}</Text>
        <Text style={s.muted}>{new Date(item.created_at).toLocaleString('fr-FR')}</Text>
      </View>}
    />
    <View style={s.composer}>
      {sendError ? <Text accessibilityLiveRegion="polite" style={s.error}>{sendError}</Text> : null}
      <View style={s.row}>
        <TextInput value={draft} onChangeText={setDraft} style={[s.input, s.flex, s.composerInput]} accessibilityLabel="Votre message"
          placeholder="Votre message…" placeholderTextColor={colors.muted} editable={!pending} multiline maxLength={4000} />
        <Button label={pending ? 'Envoi…' : 'Envoyer'} disabled={pending || !draft.trim()} onPress={() => void submit()} />
      </View>
    </View>
  </KeyboardAvoidingView>;
}
