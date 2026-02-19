from pydantic import BaseModel
from typing import Optional


# ─── Set Templates ────────────────────────────────────────────────────────────

class SetTemplateSchema(BaseModel):
    sets: str = "3"
    reps: str = "10"
    weight: str = "0"
    nivel: str = ""


# ─── Exercises ────────────────────────────────────────────────────────────────

class ExerciseSchema(BaseModel):
    name: str = ""
    muscle: str = ""
    equipment: list[str] = []
    rest_seconds: int = 90
    rows: list[SetTemplateSchema] = []


class SetTemplateOut(BaseModel):
    id: int
    sets: str
    reps: str
    weight: str
    nivel_anillas: str

    class Config:
        from_attributes = True


class ExerciseOut(BaseModel):
    id: int
    routine_id: int
    name: str
    muscle: str
    equipment: str  # JSON string
    rest_seconds: int
    sort_order: int
    rows: list[SetTemplateOut] = []

    class Config:
        from_attributes = True


# ─── Routines ─────────────────────────────────────────────────────────────────

class SaveRoutineRequest(BaseModel):
    id: Optional[int] = None
    title: str
    subtitle: str = ""
    tags: list[str] = []
    scheduleDays: list[str] = []
    exercises: list[ExerciseSchema] = []


class RoutineOut(BaseModel):
    id: int
    user_id: str
    title: str
    subtitle: str
    tags: str
    schedule_days: str
    last_performed: str
    completion_rate: Optional[int]
    streak: Optional[str]
    exercises_count: int = 0

    class Config:
        from_attributes = True


class RoutineWithExercisesOut(BaseModel):
    routine: Optional[RoutineOut]
    exercises: list[ExerciseOut] = []


# ─── Sessions ─────────────────────────────────────────────────────────────────

class SessionSetInput(BaseModel):
    exerciseName: str
    weight: float
    reps: int
    rpe: Optional[float] = None
    nivelAnillas: Optional[int] = None


class SaveSessionRequest(BaseModel):
    routineId: int
    routineName: str
    startedAt: str
    finishedAt: str
    totalVolumeKg: float
    sets: list[SessionSetInput]


# ─── History ──────────────────────────────────────────────────────────────────

class ExerciseStats(BaseModel):
    maxReps: int
    maxWeight: float
    totalSessions: int
    totalVolume: float


class SetDetail(BaseModel):
    weight: float
    reps: int
    rpe: Optional[float]
    nivelAnillas: Optional[int]


class HistoryEntry(BaseModel):
    sessionId: int
    date: str
    routineName: str
    sets: list[SetDetail]
    totalVolume: float


class VolumePoint(BaseModel):
    month: str
    volume: float
    label: str
