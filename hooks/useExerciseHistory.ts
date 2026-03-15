import { useState, useEffect } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-expo';
import {
  getExerciseStats,
  getExerciseHistory,
  getVolumeProgression,
} from '../services/api';
import type { ExerciseStats, HistoryEntry, VolumePoint } from '../types';
import { getPeriodStart } from '../utils/date';

type Period = 'week' | 'month';

interface ExerciseHistoryState {
  stats: ExerciseStats | null;
  history: HistoryEntry[];
  volume: VolumePoint[];
  loading: boolean;
  error: string | null;
  maxVolume: number;
}

/**
 * Hook que encapsula toda la lógica de datos del historial de ejercicios.
 * Extrae fetching, estado y cálculos de la pantalla ExerciseHistoryScreen.
 */
export function useExerciseHistory(
  exerciseName: string | null,
  period: Period
): ExerciseHistoryState {
  const { getToken } = useClerkAuth();
  const [stats, setStats] = useState<ExerciseStats | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [volume, setVolume] = useState<VolumePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!exerciseName) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        if (!token || cancelled) return;
        const [h, v, s] = await Promise.all([
          getExerciseHistory(token, exerciseName),
          getVolumeProgression(token, exerciseName),
          getExerciseStats(token, exerciseName, getPeriodStart(period)),
        ]);
        if (!cancelled) {
          setHistory(h);
          setVolume(v);
          setStats(s);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar historial');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [exerciseName, period]);

  const maxVolume = volume.length > 0
    ? Math.max(...volume.map((v) => v.volume), 1)
    : 1;

  return { stats, history, volume, loading, error, maxVolume };
}
