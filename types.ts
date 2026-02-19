export interface ExerciseSet {
  id: number;
  type: 'warmup' | 'working' | 'drop';
  weight: number;
  reps: number;
  rpe?: number;
  status: 'completed' | 'active' | 'pending';
  previous?: {
    weight: number;
    reps: number;
  };
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
