import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const LAST_ACTIVE_KEY = 'lastActiveAt:v1';

export async function markActivity(): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
  } catch {}
}

export function useRecentActivity(timeoutMs: number = 5 * 60 * 1000) {
  const [lastActive, setLastActive] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLocalTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  const refresh = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(LAST_ACTIVE_KEY);
      setLastActive(raw ? Number(raw) : null);
    } catch {
      setLastActive(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    return () => clearLocalTimeout();
  }, [refresh]);

  useEffect(() => {
    clearLocalTimeout();
    if (lastActive == null) return;
    const remaining = lastActive + timeoutMs - Date.now();
    if (remaining > 0) {
      timeoutRef.current = setTimeout(() => setLastActive((v) => (typeof v === 'number' ? v - timeoutMs : null)), remaining);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastActive, timeoutMs]);

  const isRecent = useMemo(() => {
    if (lastActive == null) return false;
    return Date.now() - lastActive < timeoutMs;
  }, [lastActive, timeoutMs]);

  return { isRecent, refresh } as const;
}


