import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRecentActivity } from '@/hooks/useActivity';
import { useProgress } from '@/hooks/useProgress';

export default function HomeTab() {
  const router = useRouter();
  const { progress, accuracy } = useProgress();
  const { isRecent } = useRecentActivity();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <GradientBackground>
          <View style={styles.heroCenter}>
            <Ionicons name="heart-circle" size={64} color="white" />
            <ThemedText style={styles.titleLight}>NCLEX RN Practice</ThemedText>
            <ThemedText style={styles.subtitleLight}>Quickly jump into a focused 10-question session.</ThemedText>
            <Pressable style={styles.primaryBtnSolid} onPress={() => router.push('/(tabs)')}>
              <ThemedText style={styles.primaryBtnText}>Start Practice</ThemedText>
            </Pressable>
          </View>
        </GradientBackground>

        {isRecent && (
        <View style={styles.progressCard}>
          <ThemedText style={styles.progressTitle}>Your Progress</ThemedText>
          <View style={styles.pillsRow}>
            <View style={styles.pill}><ThemedText style={styles.pillText}>Answered: {progress.totalAnswered}</ThemedText></View>
            <View style={styles.pill}><ThemedText style={styles.pillText}>Correct: {progress.totalCorrect}</ThemedText></View>
            <View style={styles.pill}><ThemedText style={styles.pillText}>Streak: {progress.currentStreak}</ThemedText></View>
            <View style={styles.pill}><ThemedText style={styles.pillText}>Accuracy: {accuracy}%</ThemedText></View>
          </View>
        </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 16, gap: 16 },
  heroCenter: { alignItems: 'center', gap: 8 },
  titleLight: { fontSize: 22, fontWeight: '800', color: 'white' },
  subtitleLight: { color: 'white', opacity: 0.9, textAlign: 'center' },
  primaryBtnSolid: {
    marginTop: 8,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  primaryBtnText: { color: '#059669', fontWeight: '700' },
  progressCard: {
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  progressTitle: { fontWeight: '700' },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  pillText: { fontSize: 13 },
});


