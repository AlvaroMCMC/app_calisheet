import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete

from database import get_db
from models import Routine, RoutineExercise, SetTemplate, WorkoutSession, SessionSet
from schemas import (
    SaveRoutineRequest, RoutineOut, RoutineWithExercisesOut,
    ExerciseOut, SetTemplateOut, SaveSessionRequest,
)
from auth import get_current_user_id

router = APIRouter()


# ─── GET /routines ────────────────────────────────────────────────────────────

@router.get("/routines", response_model=list[RoutineOut])
async def get_routines(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            Routine,
            func.count(RoutineExercise.id).label("exercises_count"),
        )
        .outerjoin(RoutineExercise, RoutineExercise.routine_id == Routine.id)
        .where(Routine.user_id == user_id)
        .group_by(Routine.id)
        .order_by(Routine.created_at.desc())
    )
    rows = result.all()
    out = []
    for routine, count in rows:
        r = RoutineOut.model_validate(routine)
        r.exercises_count = count
        out.append(r)
    return out


# ─── GET /routines/{id} ───────────────────────────────────────────────────────

@router.get("/routines/{routine_id}", response_model=RoutineWithExercisesOut)
async def get_routine_with_exercises(
    routine_id: int,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    routine = await db.get(Routine, routine_id)
    if not routine or routine.user_id != user_id:
        raise HTTPException(status_code=404, detail="Routine not found")

    ex_result = await db.execute(
        select(RoutineExercise)
        .where(RoutineExercise.routine_id == routine_id)
        .order_by(RoutineExercise.sort_order)
    )
    exercises = ex_result.scalars().all()

    exercises_out = []
    for ex in exercises:
        st_result = await db.execute(
            select(SetTemplate)
            .where(SetTemplate.exercise_id == ex.id)
            .order_by(SetTemplate.sort_order)
        )
        set_templates = st_result.scalars().all()
        ex_out = ExerciseOut.model_validate(ex)
        ex_out.rows = [SetTemplateOut.model_validate(st) for st in set_templates]
        exercises_out.append(ex_out)

    routine_out = RoutineOut.model_validate(routine)
    routine_out.exercises_count = len(exercises)
    return RoutineWithExercisesOut(routine=routine_out, exercises=exercises_out)


# ─── POST /routines ───────────────────────────────────────────────────────────

@router.post("/routines", response_model=dict)
async def create_routine(
    data: SaveRoutineRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    routine = Routine(
        user_id=user_id,
        title=data.title,
        subtitle=data.subtitle,
        tags=json.dumps(data.tags),
        schedule_days=json.dumps(data.scheduleDays),
    )
    db.add(routine)
    await db.flush()
    await _save_exercises(db, routine.id, data.exercises)
    await db.commit()
    return {"id": routine.id}


# ─── PUT /routines/{id} ───────────────────────────────────────────────────────

@router.put("/routines/{routine_id}", response_model=dict)
async def update_routine(
    routine_id: int,
    data: SaveRoutineRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    routine = await db.get(Routine, routine_id)
    if not routine or routine.user_id != user_id:
        raise HTTPException(status_code=404, detail="Routine not found")

    routine.title = data.title
    routine.subtitle = data.subtitle
    routine.tags = json.dumps(data.tags)
    routine.schedule_days = json.dumps(data.scheduleDays)

    # Delete and re-insert exercises
    await db.execute(
        delete(RoutineExercise).where(RoutineExercise.routine_id == routine_id)
    )
    await _save_exercises(db, routine_id, data.exercises)
    await db.commit()
    return {"id": routine_id}


# ─── DELETE /routines/{id} ────────────────────────────────────────────────────

@router.delete("/routines/{routine_id}", status_code=204)
async def delete_routine(
    routine_id: int,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    routine = await db.get(Routine, routine_id)
    if not routine or routine.user_id != user_id:
        raise HTTPException(status_code=404, detail="Routine not found")
    await db.delete(routine)
    await db.commit()


# ─── POST /sessions ───────────────────────────────────────────────────────────

@router.post("/sessions", status_code=201)
async def save_session(
    data: SaveSessionRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    session = WorkoutSession(
        user_id=user_id,
        routine_id=data.routineId,
        routine_name=data.routineName,
        started_at=data.startedAt,
        finished_at=data.finishedAt,
        total_volume_kg=data.totalVolumeKg,
    )
    db.add(session)
    await db.flush()

    for s in data.sets:
        db.add(SessionSet(
            session_id=session.id,
            exercise_name=s.exerciseName,
            weight=s.weight,
            reps=s.reps,
            rpe=s.rpe,
            nivel_anillas=s.nivelAnillas,
        ))

    # Update last_performed on the routine
    routine = await db.get(Routine, data.routineId)
    if routine and routine.user_id == user_id:
        now = datetime.now().strftime("%d %b %Y").lstrip("0")
        routine.last_performed = now

    await db.commit()
    return {"id": session.id}


# ─── Helper ───────────────────────────────────────────────────────────────────

async def _save_exercises(db: AsyncSession, routine_id: int, exercises):
    for i, ex in enumerate(exercises):
        exercise = RoutineExercise(
            routine_id=routine_id,
            name=ex.name,
            muscle=ex.muscle,
            equipment=json.dumps(ex.equipment),
            rest_seconds=ex.rest_seconds,
            sort_order=i,
        )
        db.add(exercise)
        await db.flush()
        for j, row in enumerate(ex.rows):
            db.add(SetTemplate(
                exercise_id=exercise.id,
                sets=row.sets,
                reps=row.reps,
                weight=row.weight,
                nivel_anillas=row.nivel,
                sort_order=j,
            ))
