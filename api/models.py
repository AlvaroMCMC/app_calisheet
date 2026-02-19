from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base


class Routine(Base):
    __tablename__ = "routines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False, default="")
    subtitle = Column(String, default="")
    tags = Column(Text, default="[]")           # JSON string[]
    schedule_days = Column(Text, default="[]")  # JSON string[]
    last_performed = Column(String, default="Nunca")
    completion_rate = Column(Integer, nullable=True)
    streak = Column(String, nullable=True)
    created_at = Column(String, default=func.now())

    exercises = relationship("RoutineExercise", back_populates="routine", cascade="all, delete-orphan")
    sessions = relationship("WorkoutSession", back_populates="routine")


class RoutineExercise(Base):
    __tablename__ = "routine_exercises"

    id = Column(Integer, primary_key=True, autoincrement=True)
    routine_id = Column(Integer, ForeignKey("routines.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False, default="")
    muscle = Column(String, default="")
    equipment = Column(Text, default="[]")  # JSON string[]
    rest_seconds = Column(Integer, default=90)
    sort_order = Column(Integer, default=0)

    routine = relationship("Routine", back_populates="exercises")
    set_templates = relationship("SetTemplate", back_populates="exercise", cascade="all, delete-orphan")


class SetTemplate(Base):
    __tablename__ = "set_templates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    exercise_id = Column(Integer, ForeignKey("routine_exercises.id", ondelete="CASCADE"), nullable=False)
    sets = Column(String, default="3")
    reps = Column(String, default="10")
    weight = Column(String, default="0")
    nivel_anillas = Column(String, default="")
    sort_order = Column(Integer, default=0)

    exercise = relationship("RoutineExercise", back_populates="set_templates")


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False, index=True)
    routine_id = Column(Integer, ForeignKey("routines.id", ondelete="SET NULL"), nullable=True)
    routine_name = Column(String, nullable=False, default="")
    started_at = Column(String, nullable=False)
    finished_at = Column(String, nullable=True)
    total_volume_kg = Column(Float, default=0)

    routine = relationship("Routine", back_populates="sessions")
    sets = relationship("SessionSet", back_populates="session", cascade="all, delete-orphan")


class SessionSet(Base):
    __tablename__ = "session_sets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("workout_sessions.id", ondelete="CASCADE"), nullable=False)
    exercise_name = Column(String, nullable=False)
    weight = Column(Float, default=0)
    reps = Column(Integer, default=0)
    rpe = Column(Float, nullable=True)
    nivel_anillas = Column(Integer, nullable=True)

    session = relationship("WorkoutSession", back_populates="sets")
