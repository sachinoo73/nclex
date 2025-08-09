import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { questions as localQuestions, type Question } from '@/data/questions';
import { markActivity } from '@/hooks/useActivity';
import { useProgress, type SessionRecord } from '@/hooks/useProgress';
import { fetchRandomQuestion } from '@/services/api';

export default function HomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [dynamicQuestions, setDynamicQuestions] = useState<Question[]>(localQuestions);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const { progress, accuracy, loaded: progressLoaded, recordAnswer, reset, addSession } = useProgress();
  const [sessionComplete, setSessionComplete] = useState(false);
  const sessionLimit = 10;
  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionRecorded, setSessionRecorded] = useState(false);

  const currentQuestion = useMemo(
    () => dynamicQuestions[Math.min(currentIndex, Math.max(dynamicQuestions.length - 1, 0))],
    [currentIndex, dynamicQuestions]
  );
  const isCorrect = useMemo(
    () => (selectedOption ? selectedOption === currentQuestion.correctAnswer : false),
    [selectedOption, currentQuestion]
  );

  useEffect(() => {
    // try to hydrate with a server-provided random question initially
    const bootstrap = async () => {
      try {
        setIsLoading(true);
        const q = await fetchRandomQuestion();
        if (q) {
          setDynamicQuestions([q]);
          if (q.id) setSeenIds(new Set([q.id]));
          setCurrentIndex(0);
          setSessionActive(true);
          setSessionAnswered(0);
          setSessionCorrect(0);
          setElapsedSeconds(0);
          setSessionRecorded(false);
        } else {
          setSessionComplete(true);
        }
      } catch {
        // ignore, fallback to local seed
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  // session timer (pauses during rationale modal)
  useEffect(() => {
    if (!sessionActive || sessionComplete || showExplanation) return;
    const id = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [sessionActive, sessionComplete, showExplanation]);

  // record session once when complete
  useEffect(() => {
    if (sessionComplete && !sessionRecorded) {
      void addSession({
        id: String(Date.now()),
        dateISO: new Date().toISOString(),
        answered: sessionAnswered,
        correct: sessionCorrect,
        durationSeconds: elapsedSeconds,
      });
      setSessionRecorded(true);
    }
  }, [sessionComplete, sessionRecorded, sessionAnswered, sessionCorrect, elapsedSeconds, addSession]);

  const timerLabel = useMemo(() => {
    const m = Math.floor(elapsedSeconds / 60);
    const s = elapsedSeconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, [elapsedSeconds]);

  const goToNextQuestion = () => {
    const advance = async () => {
      try {
        setIsLoading(true);
        await markActivity();
        // fetch a new random question from API; fallback to next local
        const exclude = Array.from(seenIds);
        const fetched = await fetchRandomQuestion(exclude);
        if (!fetched) {
          setSessionComplete(true);
        } else {
          setDynamicQuestions([fetched]);
          if (fetched.id) {
            const nextSeen = new Set(seenIds);
            nextSeen.add(fetched.id);
            setSeenIds(nextSeen);
          }
          setCurrentIndex(0);
        }
      } catch {
        const nextIndex = currentIndex + 1;
        if (nextIndex < dynamicQuestions.length) {
          setCurrentIndex(nextIndex);
        } else {
          // loop through local if no API
          setDynamicQuestions(localQuestions);
          setCurrentIndex(0);
        }
      } finally {
        setSelectedOption(null);
        setShowExplanation(false);
        setIsLoading(false);
      }
    };
    void advance();
  };

  const startNewSession = () => {
    setSeenIds(new Set());
    setSessionComplete(false);
    // fetch a fresh question
    void (async () => {
      try {
        setIsLoading(true);
        const q = await fetchRandomQuestion();
        if (q) {
          setDynamicQuestions([q]);
          if (q.id) setSeenIds(new Set([q.id]));
          setCurrentIndex(0);
        } else {
          setSessionComplete(true);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const handleSelect = (optionKey: string) => {
    if (selectedOption) return; // prevent re-select
    setSelectedOption(optionKey);
    const willBeCorrect = optionKey === currentQuestion.correctAnswer;
    const nextAnswered = sessionAnswered + 1;
    const nextCorrect = sessionCorrect + (willBeCorrect ? 1 : 0);
    setSessionAnswered(nextAnswered);
    if (willBeCorrect) setSessionCorrect((c) => c + 1);
    const finished = nextAnswered >= sessionLimit;
    if (willBeCorrect) {
      // brief delay to show feedback before advancing
      setTimeout(() => {
        void recordAnswer(true);
        if (finished) {
          setSessionComplete(true);
          setShowExplanation(false);
        } else {
          goToNextQuestion();
        }
      }, 500);
    } else {
      // show rationale and wait for user to proceed
      setShowExplanation(true);
      void recordAnswer(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <GradientBackground height={180}>
          <View style={styles.practiceHeader}>
            <ThemedText lightColor="#fff" darkColor="#fff" style={styles.headerTitle}>Practice</ThemedText>
            <View style={styles.headerMetaRow}>
              <ThemedText lightColor="#fff" darkColor="#fff" style={styles.countTextWhite}>{sessionAnswered}/{sessionLimit}</ThemedText>
              <View style={styles.timePillLight}><ThemedText lightColor="#fff" darkColor="#fff" style={styles.timeTextWhite}>{timerLabel}</ThemedText></View>
            </View>
          </View>
        </GradientBackground>
        <ThemedView style={styles.card}>
        {isLoading && (
          <ThemedText style={styles.loading}>Loading…</ThemedText>
        )}
        <View style={styles.progressRow}>
          <View style={styles.progressChips}>
            <View style={styles.pill}><ThemedText style={styles.pillText}>Answered: {progress.totalAnswered}</ThemedText></View>
            <View style={styles.pill}><ThemedText style={styles.pillText}>Correct: {progress.totalCorrect}</ThemedText></View>
            <View style={styles.pill}><ThemedText style={styles.pillText}>Streak: {progress.currentStreak}</ThemedText></View>
          </View>
          <Pressable style={styles.resetBtn} onPress={reset}>
            <ThemedText style={styles.resetBtnText}>Reset</ThemedText>
          </Pressable>
        </View>
        <View style={styles.accuracyBarWrap}>
          <View style={[styles.accuracyBarFill, { width: `${accuracy}%` }]} />
        </View>
        {sessionComplete ? (
          <ThemedView style={styles.sessionBox}>
            <ThemedText style={styles.sessionTitle}>Session complete</ThemedText>
            <ThemedText>You've answered all available questions in this session.</ThemedText>
            <Pressable style={styles.nextButton} onPress={startNewSession}>
              <ThemedText style={styles.nextButtonText}>Start New Session</ThemedText>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => router.push('/(tabs)/history')}>
              <ThemedText style={styles.secondaryButtonText}>View History</ThemedText>
            </Pressable>
          </ThemedView>
        ) : (
        <ThemedText style={styles.question}>
          {currentQuestion.question}
        </ThemedText>
        )}

        <View style={styles.options}>
          {Object.entries(currentQuestion.options).map(([key, label]) => {
            const isSelected = selectedOption === key;
            const isAnswer = key === currentQuestion.correctAnswer;
            const showResult = Boolean(selectedOption);
            return (
              <Pressable
                key={key}
                onPress={() => handleSelect(key)}
                style={({ pressed }) => [
                  styles.option,
                  isSelected && styles.optionSelected,
                  showResult && isAnswer && styles.optionCorrect,
                  showResult && isSelected && !isAnswer && styles.optionIncorrect,
                  pressed && !selectedOption ? styles.optionPressed : null,
                ]}
              >
                <View style={styles.optionInner}>
                  <View style={styles.badge}>
                    <ThemedText style={styles.badgeText}>{key}</ThemedText>
                  </View>
                  <ThemedText style={styles.optionLabel}>{label}</ThemedText>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Rationale now shown in a modal */}
        </ThemedView>
      </ScrollView>
      <Modal
        visible={showExplanation}
        animationType="fade"
        transparent
        onRequestClose={() => setShowExplanation(false)}
      >
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.modalCard}>
            <ThemedText style={styles.rationaleTitle}>Rationale</ThemedText>
            <ThemedText>{currentQuestion.explanation}</ThemedText>
            <Pressable
              style={styles.nextButton}
              onPress={() => {
                setShowExplanation(false);
                if (sessionAnswered >= sessionLimit) {
                  setSessionComplete(true);
                  void addSession({
                    id: String(Date.now()),
                    dateISO: new Date().toISOString(),
                    answered: sessionAnswered,
                    correct: progress.totalCorrect % sessionAnswered === 0 ? sessionAnswered : progress.totalCorrect,
                    durationSeconds: elapsedSeconds,
                  } as SessionRecord);
                } else {
                  goToNextQuestion();
                }
              }}
            >
              <ThemedText style={styles.nextButtonText}>
                {sessionAnswered >= sessionLimit ? 'Finish Session' : 'Next Question'}
              </ThemedText>
            </Pressable>
          </ThemedView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    maxWidth: 700,
    alignSelf: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  practiceHeader: { flex: 1, justifyContent: 'flex-end', gap: 8 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  headerMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  countTextWhite: { fontWeight: '800' },
  timePillLight: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
  },
  timeTextWhite: { fontWeight: '700' },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countText: { fontWeight: '700' },
  timePill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  timeText: { fontWeight: '700' },
  progressChips: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  pillText: {
    fontSize: 13,
  },
  resetBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#dc2626',
  },
  resetBtnText: {
    color: 'white',
    fontWeight: '700',
  },
  accuracyBarWrap: {
    height: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  accuracyBarFill: {
    height: '100%',
    backgroundColor: '#16a34a',
  },
  question: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    marginTop: 2,
  },
  options: {
    gap: 14,
  },
  option: {
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.18)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  optionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.35)',
  },
  badgeText: {
    fontWeight: '700',
    color: '#166534',
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionSelected: {
    borderColor: 'rgba(16, 185, 129, 0.55)',
  },
  optionCorrect: {
    borderColor: 'rgba(22, 163, 74, 0.55)',
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  optionIncorrect: {
    borderColor: 'rgba(220, 38, 38, 0.45)',
    backgroundColor: 'rgba(220, 38, 38, 0.06)',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  optionLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    flexShrink: 1,
  },
  explainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.25)',
    paddingTop: 12,
    gap: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 16,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    backgroundColor: 'white',
  },
  rationaleTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  nextButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  loading: {
    marginBottom: 8,
    opacity: 0.7,
  },
  sessionBox: {
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  secondaryButtonText: {
    color: '#059669',
    fontWeight: '700',
  },
});
