import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, AppState, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Tab } from './screens';
import { Button, s } from './ui';

function HomeCinematic() {
  const [paused, setPaused] = useState(false);
  const [foreground, setForeground] = useState(() => (AppState.currentState ?? 'active') === 'active');
  const [hasFrame, setHasFrame] = useState(false);
  const player = useVideoPlayer(require('../assets/accueil-cinematique.mp4'), video => {
    video.loop = true;
    video.muted = true;
    video.audioMixingMode = 'mixWithOthers';
  });
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => setForeground(state === 'active'));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (status === 'error') return;
    if (foreground && !paused) player.play();
    else player.pause();
  }, [foreground, paused, player, status]);

  if (status === 'error') {
    return <Text style={s.cinematicControl} accessibilityLiveRegion="polite">Vidéo indisponible</Text>;
  }
  return <>
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <VideoView player={player} style={[s.flex, !hasFrame && s.cinematicWaiting]}
        surfaceType="textureView" contentFit="cover" nativeControls={false} onFirstFrameRender={() => setHasFrame(true)} />
    </View>
    <Pressable style={s.cinematicControl} accessibilityRole="button"
      accessibilityLabel={paused ? 'Reprendre la cinématique' : 'Mettre la cinématique en pause'}
      onPress={() => setPaused(current => !current)}>
      <Text style={s.text}>{paused ? 'Reprendre' : 'Pause'}</Text>
    </Pressable>
  </>;
}

export function Home({ navigate }: { navigate: (tab: Tab) => void }) {
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    let active = true;
    let preferenceChanged = false;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', enabled => {
      preferenceChanged = true;
      setReduceMotion(enabled);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (active && !preferenceChanged) setReduceMotion(enabled);
    }).catch(error => {
      if (active) console.warn('Impossible de lire la préférence de réduction des animations.', error);
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return <ScrollView contentContainerStyle={s.body}>
    <ImageBackground source={require('../assets/accueil.jpg')} style={s.hero}>
      {!reduceMotion ? <HomeCinematic /> : null}
      <View style={s.homeHero}>
        <Text style={s.eyebrow}>PaperAtlas · Le réseau du papier</Text>
        <Text accessibilityRole="header" style={s.homeTitle}>Toute la filière du papier, <Text style={s.accent}>réunie.</Text></Text>
        <Text style={s.text}>Découvrez les métiers du livre et de l’impression dans le monde arabe.</Text>
        <Button label="Explorer l’annuaire" onPress={() => navigate('directory')} />
      </View>
    </ImageBackground>
  </ScrollView>;
}
