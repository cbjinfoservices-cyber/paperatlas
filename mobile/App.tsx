import { useLocalSession } from './src/session';
import { supabase } from './src/supabase';
import { Browsing, Inbox, Account, type Tab } from './src/screens';
import { Home } from './src/home';
import { colors, s, type IconName } from './src/ui';
import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const tabs: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Accueil', icon: 'home' },
  { id: 'directory', label: 'Annuaire', icon: 'users' },
  { id: 'annonce', label: 'Annonces', icon: 'file-text' },
  { id: 'offre', label: 'Emplois', icon: 'briefcase' },
  { id: 'inbox', label: 'Messages', icon: 'message-circle' },
  { id: 'account', label: 'Compte', icon: 'user' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const auth = useLocalSession(supabase);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.root}>
        <StatusBar style="light" />
        <View style={s.header}>
          <View style={s.brandRow}>
            <Image source={require('./assets/paperatlas-logo.jpg')} style={s.logo} accessibilityIgnoresInvertColors />
            <View>
              <Text accessibilityRole="header" style={s.brand}>PaperAtlas</Text>
              <Text style={s.brandCaption}>Le réseau du papier</Text>
            </View>
          </View>
        </View>
        <View style={s.flex}>
          {tab === 'home' ? <Home navigate={setTab} /> : !supabase ? (
            <Text style={s.notice}>Connexion à Supabase non configurée. Renseignez les variables Expo de l’application.</Text>
          ) : tab === 'inbox' || tab === 'account' ? (
            auth.loading ? <ActivityIndicator style={s.notice} color={colors.accent} /> :
              tab === 'inbox' && auth.session ? (
                <Inbox key={auth.session.user.id} db={supabase} userId={auth.session.user.id} />
              ) : (
                <Account db={supabase} session={auth.session} sessionError={auth.error} />
              )
          ) : <Browsing key={tab} db={supabase} tab={tab} />}
        </View>
        <View style={s.tabs}>
          {tabs.map(({ id, label, icon }) => (
            <Pressable key={id} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: tab === id }}
              style={s.tab} onPress={() => setTab(id)}>
              <View style={[s.tabIcon, tab === id && s.selected]}>
                <Feather name={icon} size={19} color={tab === id ? colors.accent : colors.muted} />
              </View>
              <Text numberOfLines={1} adjustsFontSizeToFit style={[s.tabText, tab === id && s.accent]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
