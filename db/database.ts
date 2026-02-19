import { SQLiteDatabase } from 'expo-sqlite';

// ─── Row types ────────────────────────────────────────────────────────────────

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
  equipment: string;   // JSON string[]
  sort_order: number;
}

export interface SetTemplateRow {
  id: number;
  exercise_id: number;
  sets: string;
  reps: string;
  weight: string;
  nivel_anillas: string;   // ring height 1-14, '' if unused
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
  nivelAnillas?: number;   // ring height 1-14
}

export interface SessionInput {
  userId: string;
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
  totalVolume: number;   // SUM(weight × reps) for the selected period
}

export interface SetDetail {
  weight: number;
  reps: number;
  rpe: number | null;
  nivelAnillas: number | null;  // ring height 1-14, null if unused
}

export interface HistoryEntry {
  sessionId: number;
  date: string;
  routineName: string;
  sets: SetDetail[];     // full detail per set
  totalVolume: number;   // sum of weight × reps for this session entry
}

export interface VolumePoint {
  month: string;
  volume: number;
  label: string;
}

// ─── Setup ────────────────────────────────────────────────────────────────────

export async function setupDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS routines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      subtitle TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      schedule_days TEXT DEFAULT '[]',
      last_performed TEXT DEFAULT 'Nunca',
      completion_rate INTEGER,
      streak TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS routine_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routine_id INTEGER NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      muscle TEXT DEFAULT '',
      equipment TEXT DEFAULT '[]',
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS set_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_id INTEGER NOT NULL,
      sets TEXT DEFAULT '3',
      reps TEXT DEFAULT '10',
      weight TEXT DEFAULT '0',
      nivel_anillas TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (exercise_id) REFERENCES routine_exercises(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS workout_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      routine_id INTEGER,
      routine_name TEXT NOT NULL DEFAULT '',
      started_at TEXT NOT NULL,
      finished_at TEXT,
      total_volume_kg REAL DEFAULT 0,
      FOREIGN KEY (routine_id) REFERENCES routines(id)
    );

    CREATE TABLE IF NOT EXISTS session_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      weight REAL DEFAULT 0,
      reps INTEGER DEFAULT 0,
      rpe REAL,
      nivel_anillas INTEGER,
      FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE
    );
  `);
}

// ─── Routines ─────────────────────────────────────────────────────────────────

export async function getRoutines(
  db: SQLiteDatabase,
  userId: string
): Promise<RoutineRow[]> {
  return db.getAllAsync<RoutineRow>(`
    SELECT r.*, COUNT(re.id) as exercises_count
    FROM routines r
    LEFT JOIN routine_exercises re ON re.routine_id = r.id
    WHERE r.user_id = ?
    GROUP BY r.id
    ORDER BY r.created_at DESC
  `, [userId]);
}

export async function getRoutineWithExercises(
  db: SQLiteDatabase,
  routineId: number
): Promise<{ routine: RoutineRow | null; exercises: ExerciseWithSets[] }> {
  const routine = await db.getFirstAsync<RoutineRow>(
    `SELECT *, 0 as exercises_count FROM routines WHERE id = ?`,
    [routineId]
  );
  const exercises = await db.getAllAsync<ExerciseRow>(
    'SELECT * FROM routine_exercises WHERE routine_id = ? ORDER BY sort_order',
    [routineId]
  );
  const exercisesWithSets: ExerciseWithSets[] = await Promise.all(
    exercises.map(async (ex) => {
      const rows = await db.getAllAsync<SetTemplateRow>(
        'SELECT * FROM set_templates WHERE exercise_id = ? ORDER BY sort_order',
        [ex.id]
      );
      return { ...ex, rows };
    })
  );
  return { routine: routine ?? null, exercises: exercisesWithSets };
}

export async function saveRoutine(
  db: SQLiteDatabase,
  data: {
    id?: number;
    userId: string;
    title: string;
    subtitle: string;
    tags: string[];
    scheduleDays: string[];
    exercises: Array<{
      name: string;
      muscle: string;
      equipment: string[];
      rows: Array<{ sets: string; reps: string; weight: string; nivel: string }>;
    }>;
  }
): Promise<number> {
  let routineId: number;

  if (data.id) {
    await db.runAsync(
      `UPDATE routines SET title=?, subtitle=?, tags=?, schedule_days=? WHERE id=? AND user_id=?`,
      [data.title, data.subtitle, JSON.stringify(data.tags), JSON.stringify(data.scheduleDays), data.id, data.userId]
    );
    routineId = data.id;
    await db.runAsync('DELETE FROM routine_exercises WHERE routine_id = ?', [routineId]);
  } else {
    const r = await db.runAsync(
      `INSERT INTO routines (user_id, title, subtitle, tags, schedule_days) VALUES (?, ?, ?, ?, ?)`,
      [data.userId, data.title, data.subtitle, JSON.stringify(data.tags), JSON.stringify(data.scheduleDays)]
    );
    routineId = r.lastInsertRowId;
  }

  for (let i = 0; i < data.exercises.length; i++) {
    const ex = data.exercises[i];
    const er = await db.runAsync(
      `INSERT INTO routine_exercises (routine_id, name, muscle, equipment, sort_order) VALUES (?, ?, ?, ?, ?)`,
      [routineId, ex.name, ex.muscle, JSON.stringify(ex.equipment ?? []), i]
    );
    const exerciseId = er.lastInsertRowId;
    for (let j = 0; j < ex.rows.length; j++) {
      const row = ex.rows[j];
      await db.runAsync(
        `INSERT INTO set_templates (exercise_id, sets, reps, weight, nivel_anillas, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
        [exerciseId, row.sets, row.reps, row.weight, row.nivel ?? '', j]
      );
    }
  }

  return routineId;
}

export async function deleteRoutine(db: SQLiteDatabase, routineId: number, userId: string): Promise<void> {
  await db.runAsync('DELETE FROM routines WHERE id = ? AND user_id = ?', [routineId, userId]);
}

export async function updateLastPerformed(db: SQLiteDatabase, routineId: number): Promise<void> {
  const now = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  await db.runAsync('UPDATE routines SET last_performed = ? WHERE id = ?', [now, routineId]);
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function saveSession(
  db: SQLiteDatabase,
  data: SessionInput
): Promise<void> {
  const r = await db.runAsync(
    `INSERT INTO workout_sessions (user_id, routine_id, routine_name, started_at, finished_at, total_volume_kg)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.userId, data.routineId, data.routineName, data.startedAt, data.finishedAt, data.totalVolumeKg]
  );
  const sessionId = r.lastInsertRowId;
  for (const s of data.sets) {
    await db.runAsync(
      `INSERT INTO session_sets (session_id, exercise_name, weight, reps, rpe, nivel_anillas) VALUES (?, ?, ?, ?, ?, ?)`,
      [sessionId, s.exerciseName, s.weight, s.reps, s.rpe ?? null, s.nivelAnillas ?? null]
    );
  }
}

// ─── History ──────────────────────────────────────────────────────────────────

export async function getExerciseNames(
  db: SQLiteDatabase,
  userId: string
): Promise<string[]> {
  const rows = await db.getAllAsync<{ exercise_name: string }>(
    `SELECT DISTINCT ss.exercise_name
     FROM session_sets ss
     JOIN workout_sessions ws ON ws.id = ss.session_id
     WHERE ws.user_id = ?
     ORDER BY ss.exercise_name`,
    [userId]
  );
  return rows.map((r) => r.exercise_name);
}

export async function getExerciseStats(
  db: SQLiteDatabase,
  exerciseName: string,
  userId: string,
  since: string   // ISO date string — filters sessions on/after this date
): Promise<ExerciseStats> {
  const row = await db.getFirstAsync<{
    max_reps: number;
    max_weight: number;
    total_sessions: number;
    total_volume: number;
  }>(
    `SELECT MAX(ss.reps) as max_reps, MAX(ss.weight) as max_weight,
            COUNT(DISTINCT ss.session_id) as total_sessions,
            SUM(ss.weight * ss.reps) as total_volume
     FROM session_sets ss
     JOIN workout_sessions ws ON ws.id = ss.session_id
     WHERE ss.exercise_name = ? AND ws.user_id = ? AND ws.finished_at >= ?`,
    [exerciseName, userId, since]
  );
  return {
    maxReps: row?.max_reps ?? 0,
    maxWeight: row?.max_weight ?? 0,
    totalSessions: row?.total_sessions ?? 0,
    totalVolume: row?.total_volume ?? 0,
  };
}

export async function getExerciseHistory(
  db: SQLiteDatabase,
  exerciseName: string,
  userId: string
): Promise<HistoryEntry[]> {
  const sessions = await db.getAllAsync<{
    session_id: number;
    routine_name: string;
    finished_at: string;
  }>(
    `SELECT DISTINCT ss.session_id, ws.routine_name, ws.finished_at
     FROM session_sets ss
     JOIN workout_sessions ws ON ws.id = ss.session_id
     WHERE ss.exercise_name = ? AND ws.user_id = ?
     ORDER BY ws.finished_at DESC LIMIT 20`,
    [exerciseName, userId]
  );

  const result: HistoryEntry[] = [];
  for (const s of sessions) {
    const setRows = await db.getAllAsync<{ reps: number; weight: number; rpe: number | null; nivel_anillas: number | null }>(
      'SELECT reps, weight, rpe, nivel_anillas FROM session_sets WHERE session_id = ? AND exercise_name = ? ORDER BY id',
      [s.session_id, exerciseName]
    );
    const totalVolume = setRows.reduce((sum, r) => sum + r.weight * r.reps, 0);
    result.push({
      sessionId: s.session_id,
      date: new Date(s.finished_at).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
      }),
      routineName: s.routine_name,
      sets: setRows.map((r) => ({ weight: r.weight, reps: r.reps, rpe: r.rpe, nivelAnillas: r.nivel_anillas })),
      totalVolume,
    });
  }
  return result;
}

export async function getVolumeProgression(
  db: SQLiteDatabase,
  exerciseName: string,
  userId: string
): Promise<VolumePoint[]> {
  const rows = await db.getAllAsync<{ month: string; volume: number }>(
    `SELECT strftime('%b', ws.finished_at) as month,
            SUM(ss.weight * ss.reps) as volume
     FROM session_sets ss
     JOIN workout_sessions ws ON ws.id = ss.session_id
     WHERE ss.exercise_name = ? AND ws.user_id = ?
     GROUP BY strftime('%Y-%m', ws.finished_at)
     ORDER BY ws.finished_at ASC LIMIT 12`,
    [exerciseName, userId]
  );
  return rows.map((r) => ({
    month: r.month,
    volume: r.volume,
    label: `${Math.round(r.volume)} kg`,
  }));
}
