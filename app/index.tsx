import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';
import { markActivity } from '@/hooks/useActivity';

export default function LandingScreen() {
  const router = useRouter();
  // Progress overview removed from landing for a cleaner hero

  const handleStart = () => {
    void markActivity();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GradientBackground variant="full">
        <View style={styles.heroCenter}>
          <Ionicons name="heart-circle" size={72} color="white" />
          <ThemedText style={styles.titleLight}>NCLEX RN Practice</ThemedText>
          <ThemedText style={styles.subtitleLight}>Sharpen your skills with focused, rational-backed questions.</ThemedText>
          <Pressable style={styles.primaryBtnSolid} onPress={handleStart}>
            <ThemedText style={styles.primaryBtnText}>Start Practice</ThemedText>
          </Pressable>
        </View>
      </GradientBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {},
  heroCenter: { alignItems: 'center', gap: 8 },
  titleLight: { fontSize: 24, fontWeight: '800', color: 'white' },
  subtitleLight: { color: 'white', opacity: 0.9, textAlign: 'center' },
  primaryBtnSolid: {
    marginTop: 8,
    backgroundColor: 'white',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  primaryBtnText: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 16,
  },
  // removed progress overview styles
});


