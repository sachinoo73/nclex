import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type Progress = {
  totalAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
};

const STORAGE_KEY = 'progress:v1';
const SESSIONS_KEY = 'sessions:v1';

export type SessionRecord = {
  id: string; // timestamp-based id
  dateISO: string;
  answered: number;
  correct: number;
  durationSeconds: number;
};

const defaultProgress: Progress = {
  totalAnswered: 0,
  totalCorrect: 0,
  currentStreak: 0,
  bestStreak: 0,
};

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [loaded, setLoaded] = useState(false);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setProgress(JSON.parse(raw));
        const sraw = await AsyncStorage.getItem(SESSIONS_KEY);
        if (sraw) setSessions(JSON.parse(sraw));
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const save = useCallback(async (next: Progress) => {
    setProgress(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const saveSessions = useCallback(async (next: SessionRecord[]) => {
    setSessions(next);
    try {
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const addSession = useCallback(
    async (record: SessionRecord) => {
      const merged = [...sessions, record].slice(-50);
      await saveSessions(merged);
    },
    [sessions, saveSessions]
  );

  const resetSessions = useCallback(async () => {
    await saveSessions([]);
  }, [saveSessions]);

  const recordAnswer = useCallback(
    async (isCorrect: boolean) => {
      const next: Progress = { ...progress };
      next.totalAnswered += 1;
      if (isCorrect) {
        next.totalCorrect += 1;
        next.currentStreak += 1;
        if (next.currentStreak > next.bestStreak) next.bestStreak = next.currentStreak;
      } else {
        next.currentStreak = 0;
      }
      await save(next);
    },
    [progress, save]
  );

  const reset = useCallback(async () => {
    await save(defaultProgress);
  }, [save]);

  const accuracy = useMemo(() => {
    if (progress.totalAnswered === 0) return 0;
    return Math.round((progress.totalCorrect / progress.totalAnswered) * 100);
  }, [progress]);

  return { progress, accuracy, loaded, recordAnswer, reset, sessions, addSession, resetSessions };
}


