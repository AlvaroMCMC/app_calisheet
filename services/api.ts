// HTTP client — wrapper sobre fetch con manejo de errores y tipos centralizados.
// Los tipos son importados desde types.ts (fuente única de verdad).

export type {
  RoutineRow,
  ExerciseRow,
  SetTemplateRow,
  ExerciseWithSets,
  SessionSetInput,
  SessionInput,
  ExerciseStats,
  SetDetail,
  HistoryEntry,
  VolumePoint,
} from '../types';

import type {
  RoutineRow,
  ExerciseWithSets,
  SessionInput,
  ExerciseStats,
  HistoryEntry,
  VolumePoint,
} from '../types';

// ─── Core fetch ───────────────────────────────────────────────────────────────

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;

/** Errores de red recuperables — se reintenta. */
function isRetryable(err: unknown): boolean {
  if (err instanceof Error) {
    return (
      err.message.includes('Network request failed') ||
      err.message.includes('Failed to fetch')
    );
  }
  return false;
}

async function apiFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {},
  attempt = 0
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {}),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      // 401/403 no se reintenta — son errores de autenticación/autorización
      throw new Error(`API ${res.status}: ${text}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  } catch (err) {
    if (attempt < MAX_RETRIES && isRetryable(err)) {
      const backoff = Math.pow(2, attempt) * 500; // 500ms, 1000ms
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return apiFetch<T>(path, token, options, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Routines ─────────────────────────────────────────────────────────────────

export async function getRoutines(token: string): Promise<RoutineRow[]> {
  return apiFetch('/routines', token);
}

export async function getRoutineWithExercises(
  token: string,
  routineId: number
): Promise<{ routine: RoutineRow | null; exercises: ExerciseWithSets[] }> {
  return apiFetch(`/routines/${routineId}`, token);
}

export async function saveRoutine(
  token: string,
  data: {
    id?: number;
    title: string;
    subtitle: string;
    tags: string[];
    scheduleDays: string[];
    exercises: Array<{
      name: string;
      muscle: string;
      equipment: string[];
      rest_seconds: number;
      rows: Array<{ sets: string; reps: string; weight: string; nivel: string }>;
    }>;
  }
): Promise<number> {
  const method = data.id ? 'PUT' : 'POST';
  const path = data.id ? `/routines/${data.id}` : '/routines';
  const result = await apiFetch<{ id: number }>(path, token, {
    method,
    body: JSON.stringify(data),
  });
  return result.id;
}

export async function deleteRoutine(token: string, routineId: number): Promise<void> {
  return apiFetch(`/routines/${routineId}`, token, { method: 'DELETE' });
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function saveSession(token: string, data: SessionInput): Promise<void> {
  await apiFetch('/sessions', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── History ──────────────────────────────────────────────────────────────────

export async function getExerciseNames(token: string): Promise<string[]> {
  return apiFetch('/history/exercises', token);
}

export async function getExerciseStats(
  token: string,
  exerciseName: string,
  since: string
): Promise<ExerciseStats> {
  return apiFetch(
    `/history/stats?name=${encodeURIComponent(exerciseName)}&since=${encodeURIComponent(since)}`,
    token
  );
}

export async function getExerciseHistory(
  token: string,
  exerciseName: string
): Promise<HistoryEntry[]> {
  return apiFetch(`/history/sessions?name=${encodeURIComponent(exerciseName)}`, token);
}

export async function getVolumeProgression(
  token: string,
  exerciseName: string
): Promise<VolumePoint[]> {
  return apiFetch(`/history/volume?name=${encodeURIComponent(exerciseName)}`, token);
}
