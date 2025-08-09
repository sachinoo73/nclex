import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useProgress } from '@/hooks/useProgress';

export default function SettingsScreen() {
  const { reset, resetSessions } = useProgress();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <GradientBackground height={160}>
          <ThemedText lightColor="#fff" darkColor="#fff" style={styles.headerTitle}>Settings</ThemedText>
        </GradientBackground>
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Data</ThemedText>
          <Pressable style={styles.btnDanger} onPress={reset}>
            <ThemedText style={styles.btnText}>Reset Progress</ThemedText>
          </Pressable>
          <Pressable style={styles.btnDanger} onPress={resetSessions}>
            <ThemedText style={styles.btnText}>Clear Session History</ThemedText>
          </Pressable>
        </View>
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
    gap: 8,
  },
  cardTitle: { fontWeight: '700' },
  btnDanger: {
    alignSelf: 'flex-start',
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnText: { color: 'white', fontWeight: '700' },
});


