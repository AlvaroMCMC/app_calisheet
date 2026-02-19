// HTTP client — reemplaza db/database.ts
// Mismos tipos de retorno para que las pantallas cambien lo mínimo posible.

export interface RoutineRow {
  id: number;
  user_id: string;
  title: string;
  subtitle: string;
  tags: string;          // JSON string[]
  schedule_days: string; // JSON string[]
  last_performed: string;
  completion_rate: number | null;
  streak: string | null;
  exercises_count: number;
}

export interface ExerciseRow {
  id: number;
  routine_id: number;
  name: string;
  muscle: string;
  equipment: string;  // JSON string[]
  rest_seconds: number;
  sort_order: number;
}

export interface SetTemplateRow {
  id: number;
  exercise_id: number;
  sets: string;
  reps: string;
  weight: string;
  nivel_anillas: string;
  sort_order: number;
}

export interface ExerciseWithSets extends ExerciseRow {
  rows: SetTemplateRow[];
}

export interface SessionSetInput {
  exerciseName: string;
  weight: number;
  reps: number;
  rpe?: number;
  nivelAnillas?: number;
}

export interface SessionInput {
  routineId: number;
  routineName: string;
  startedAt: string;
  finishedAt: string;
  totalVolumeKg: number;
  sets: SessionSetInput[];
}

export interface ExerciseStats {
  maxReps: number;
  maxWeight: number;
  totalSessions: number;
  totalVolume: number;
}

export interface SetDetail {
  weight: number;
  reps: number;
  rpe: number | null;
  nivelAnillas: number | null;
}

export interface HistoryEntry {
  sessionId: number;
  date: string;
  routineName: string;
  sets: SetDetail[];
  totalVolume: number;
}

export interface VolumePoint {
  month: string;
  volume: number;
  label: string;
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

async function apiFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
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
