// ─── Shared API types — fuente única de verdad ────────────────────────────────
// Tanto services/api.ts como db/database.ts importan desde aquí.

// ─── Rutinas ──────────────────────────────────────────────────────────────────

export interface RoutineRow {
  id: number;
  user_id: string;
  title: string;
  subtitle: string;
  tags: string[];          // Array nativo (JSONB en Postgres)
  schedule_days: string[]; // Array nativo (JSONB en Postgres)
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
  equipment: string[]; // Array nativo (JSONB en Postgres)
  rest_seconds: number;
  sort_order: number;
}

export interface SetTemplateRow {
  id: number;
  exercise_id: number;
  sets: string;
  reps: string;
  weight: string;
  nivel_anillas: string; // ring height 1-14, '' if unused
  sort_order: number;
}

export interface ExerciseWithSets extends ExerciseRow {
  rows: SetTemplateRow[];
}

// ─── Sesiones ─────────────────────────────────────────────────────────────────

export interface SessionSetInput {
  exerciseName: string;
  weight: number;
  reps: number;
  rpe?: number;
  nivelAnillas?: number; // ring height 1-14
}

export interface SessionInput {
  routineId: number;
  routineName: string;
  startedAt: string;
  finishedAt: string;
  totalVolumeKg: number;
  sets: SessionSetInput[];
}

// ─── Historial ────────────────────────────────────────────────────────────────

export interface ExerciseStats {
  maxReps: number;
  maxWeight: number;
  totalSessions: number;
  totalVolume: number; // SUM(weight × reps) for the selected period
}

export interface SetDetail {
  weight: number;
  reps: number;
  rpe: number | null;
  nivelAnillas: number | null; // ring height 1-14, null if unused
}

export interface HistoryEntry {
  sessionId: number;
  date: string;
  routineName: string;
  sets: SetDetail[];    // full detail per set
  totalVolume: number;  // sum of weight × reps for this session entry
}

export interface VolumePoint {
  month: string;
  volume: number;
  label: string;
}

// ─── Tipos de UI (workout activo) ─────────────────────────────────────────────

export interface ExerciseSet {
  id: number;
  type: 'warmup' | 'working' | 'drop';
  weight: number;
  reps: number;
  rpe?: number;
  status: 'completed' | 'active' | 'pending';
  previous?: { weight: number; reps: number };
}

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  type: string;
  sets: ExerciseSet[];
  equipment?: string;
}

export interface Routine {
  id: string;
  title: string;
  subtitle?: string;
  tags: string[];
  exercisesCount: number;
  lastPerformed: string;
  completionRate?: number;
  streak?: string;
}
