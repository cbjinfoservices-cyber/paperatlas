import { useMemo, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { directoryMapHtml, mapLocations } from './directory-map-html';
import { Notice, s } from './ui';

const baseUrl = 'https://paperatlas.net/';
const attributionUrl = 'https://www.openstreetmap.org/copyright';

export function DirectoryMap({ entries, total, kind }: {
  entries: Parameters<typeof mapLocations>[0];
  total: number;
  kind: 'directory' | 'publications';
}) {
  const locations = useMemo(() => mapLocations(entries), [entries]);
  const source = useMemo(() => ({ html: directoryMapHtml(locations), baseUrl }), [locations]);
  const [creditError, setCreditError] = useState(false);
  const placed = locations.reduce((total, location) => total + location.names.length, 0);
  return <View style={s.mapPanel}>
    <Text style={s.muted}>{placed
      ? `${kind === 'directory' ? 'Membres' : 'Publications'} sur la carte : ${placed}/${total} · Positions approximatives (centres de wilaya)`
      : kind === 'directory' ? 'Aucun membre localisable avec ces filtres.' : 'Aucune publication localisable avec ces filtres.'}</Text>
    <View style={s.directoryMap}>
      <WebView source={source} originWhitelist={['*']} style={s.flex}
        onShouldStartLoadWithRequest={({ url }) => url === baseUrl || url === 'about:blank'}
        setSupportMultipleWindows={false} allowFileAccess={false}
        allowFileAccessFromFileURLs={false} allowUniversalAccessFromFileURLs={false}
        renderError={() => <Notice loading={false} error="Impossible d’afficher la carte." empty="" />} />
    </View>
    <Text accessibilityRole="link" style={s.accent}
      onPress={() => { void Linking.openURL(attributionUrl).catch(() => setCreditError(true)); }}>
      © Contributeurs OpenStreetMap
    </Text>
    {creditError ? <Text style={s.error}>Impossible d’ouvrir les crédits de la carte.</Text> : null}
  </View>;
}
