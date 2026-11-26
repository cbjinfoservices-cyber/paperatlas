import type { ComponentProps, ReactNode } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

export type IconName = ComponentProps<typeof Feather>['name'];

export const colors = {
  bg: '#1c1a18', surface: '#332d29', surface2: '#3d3630', border: '#5a4c40',
  text: '#f5ece1', muted: '#c4b2a1', accent: '#ef8b34', accentLight: '#f7d3a4',
  error: '#ffb7a9', darkAccent: '#513b2c', footer: '#241f1c',
};

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.footer },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 42, height: 42, borderRadius: 12 },
  brand: { color: colors.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  brandCaption: { color: colors.muted, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' },
  body: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28, gap: 14 },
  sectionHeader: { gap: 8, marginBottom: 12 },
  eyebrow: { color: colors.accentLight, fontSize: 11, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase' },
  heading: { color: colors.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.8 },
  title: { color: colors.text, fontSize: 17, fontWeight: '700', lineHeight: 24 },
  text: { color: colors.text, fontSize: 15, lineHeight: 22 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  accent: { color: colors.accent },
  notice: { paddingVertical: 22, color: colors.muted, lineHeight: 21 },
  noticeCard: { alignItems: 'center', gap: 10, padding: 22, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface, marginTop: 4 },
  noticeText: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  error: { color: colors.error },
  card: { gap: 14, backgroundColor: colors.surface2, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 18 },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardContent: { flex: 1, minWidth: 0, gap: 4 },
  iconBox: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.darkAccent, alignItems: 'center', justifyContent: 'center' },
  cardMeta: { color: colors.accentLight, fontSize: 13, lineHeight: 19 },
  fieldLabel: { color: colors.text, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  field: { gap: 8 },
  input: { minHeight: 52, borderRadius: 14, borderColor: colors.border, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, backgroundColor: colors.surface, fontSize: 15 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 54, paddingHorizontal: 15, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  searchInput: { flex: 1, minHeight: 52, color: colors.text, fontSize: 15, paddingVertical: 10 },
  button: { minHeight: 50, borderRadius: 25, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.accent },
  buttonText: { color: colors.bg, fontWeight: '700', fontSize: 14 },
  disabled: { opacity: 0.55 },
  tabs: { flexDirection: 'row', backgroundColor: colors.footer, borderTopWidth: 1, borderColor: colors.border, paddingHorizontal: 3, paddingVertical: 5 },
  tab: { flex: 1, minHeight: 58, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabIcon: { width: 42, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  selected: { backgroundColor: colors.darkAccent },
  tabText: { color: colors.muted, fontSize: 10, fontWeight: '600', textAlign: 'center' },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  hero: { borderRadius: 20, overflow: 'hidden', backgroundColor: colors.surface },
  heroOverlay: { padding: 20, paddingTop: 40, backgroundColor: 'rgba(28, 26, 24, 0.76)', gap: 8 },
  heroTitle: { color: colors.text, fontSize: 27, fontWeight: '700', letterSpacing: -0.6 },
  listLabel: { color: colors.muted, fontSize: 12, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 3 },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, minHeight: 44 },
  threadHeader: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, gap: 4, borderBottomWidth: 1, borderColor: colors.border },
  messagesBody: { padding: 20, gap: 10, flexGrow: 1 },
  message: { maxWidth: '88%', alignSelf: 'flex-start', backgroundColor: colors.surface2, borderRadius: 18, borderBottomLeftRadius: 5, padding: 14, gap: 5 },
  mine: { backgroundColor: colors.darkAccent, borderBottomLeftRadius: 18, borderBottomRightRadius: 5, alignSelf: 'flex-end' },
  composer: { paddingHorizontal: 20, paddingVertical: 12, gap: 8, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.footer },
  composerInput: { maxHeight: 120 },
  filterPanel: { gap: 12, padding: 16, backgroundColor: colors.surface2, borderRadius: 18, borderWidth: 1, borderColor: colors.border },
  filterHeader: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  choice: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  choiceText: { flex: 1, color: colors.text, fontSize: 15 },
  clearFilters: { alignSelf: 'flex-start', minHeight: 40, justifyContent: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalSheet: { maxHeight: '75%', backgroundColor: colors.surface2, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12 },
  modalOption: { minHeight: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: colors.border, paddingVertical: 10 },
  switchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  switchButton: { minHeight: 42, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 22, borderWidth: 1, borderColor: colors.border },
  switchActive: { backgroundColor: colors.darkAccent, borderColor: colors.accent },
  mapPanel: { gap: 8 },
  directoryMap: { height: 360, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.surface },
  homeHero: { minHeight: 420, justifyContent: 'flex-end', padding: 22, paddingTop: 70, gap: 12, backgroundColor: 'rgba(28, 26, 24, 0.60)' },
  homeTitle: { color: colors.text, fontSize: 34, fontWeight: '700', letterSpacing: -1, lineHeight: 40 },
  cinematicWaiting: { opacity: 0 },
  cinematicControl: { position: 'absolute', top: 12, right: 12, zIndex: 1, minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 22, color: colors.text, backgroundColor: colors.footer },
});

export function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <View style={s.sectionHeader}>
    <Text style={s.eyebrow}>{eyebrow}</Text>
    <Text accessibilityRole="header" style={s.heading}>{title}</Text>
    {description ? <Text style={s.muted}>{description}</Text> : null}
  </View>;
}

export function Button({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled}
    onPress={onPress} style={({ pressed }) => [s.button, (disabled || pressed) && s.disabled]}><Text style={s.buttonText}>{label}</Text></Pressable>;
}

export function Notice({ loading, error, empty }: { loading: boolean; error: string; empty: string }) {
  if (loading) return <ActivityIndicator color={colors.accent} style={s.notice} />;
  return <View style={s.noticeCard} accessibilityLiveRegion="polite">
    <Feather name={error ? 'alert-circle' : 'inbox'} size={22} color={error ? colors.error : colors.accentLight} />
    <Text style={[s.noticeText, error ? s.error : null]}>{error || empty}</Text>
  </View>;
}

export function Card({ title, meta, icon, children }: { title: string; meta?: string; icon: IconName; children?: ReactNode }) {
  return <View style={s.card}>
    <View style={s.cardHead}>
      <View style={s.iconBox}><Feather name={icon} size={19} color={colors.accentLight} /></View>
      <View style={s.cardContent}>
        <Text style={s.title}>{title}</Text>
        {meta ? <Text style={s.cardMeta}>{meta}</Text> : null}
      </View>
    </View>
    {children}
  </View>;
}
