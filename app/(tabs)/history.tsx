import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useProgress } from '@/hooks/useProgress';

export default function HistoryScreen() {
  const { sessions } = useProgress();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <GradientBackground height={160}>
          <ThemedText lightColor="#fff" darkColor="#fff" style={styles.headerTitle}>History</ThemedText>
        </GradientBackground>
        {sessions.length === 0 ? (
          <ThemedText>No sessions yet.</ThemedText>
        ) : (
          <FlatList
            data={[...sessions].reverse()}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <ThemedView style={styles.card}>
                <ThemedText style={styles.cardTitle}>{new Date(item.dateISO).toLocaleString()}</ThemedText>
                <ThemedText>Answered: {item.answered}</ThemedText>
                <ThemedText>Correct: {item.correct}</ThemedText>
                <ThemedText>Time: {Math.floor(item.durationSeconds / 60)}:{String(item.durationSeconds % 60).padStart(2, '0')}</ThemedText>
              </ThemedView>
            )}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: '800' },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  cardTitle: { fontWeight: '700' },
});


