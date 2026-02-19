from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct, cast
from sqlalchemy.types import DateTime

from database import get_db
from models import WorkoutSession, SessionSet
from schemas import ExerciseStats, HistoryEntry, VolumePoint, SetDetail
from auth import get_current_user_id

router = APIRouter()


# ─── GET /history/exercises ───────────────────────────────────────────────────

@router.get("/history/exercises", response_model=list[str])
async def get_exercise_names(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(distinct(SessionSet.exercise_name))
        .join(WorkoutSession, WorkoutSession.id == SessionSet.session_id)
        .where(WorkoutSession.user_id == user_id)
        .order_by(SessionSet.exercise_name)
    )
    return [row[0] for row in result.all()]


# ─── GET /history/stats?name=X&since=Y ───────────────────────────────────────

@router.get("/history/stats", response_model=ExerciseStats)
async def get_exercise_stats(
    name: str,
    since: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            func.max(SessionSet.reps).label("max_reps"),
            func.max(SessionSet.weight).label("max_weight"),
            func.count(distinct(SessionSet.session_id)).label("total_sessions"),
            func.sum(SessionSet.weight * SessionSet.reps).label("total_volume"),
        )
        .join(WorkoutSession, WorkoutSession.id == SessionSet.session_id)
        .where(
            SessionSet.exercise_name == name,
            WorkoutSession.user_id == user_id,
            WorkoutSession.finished_at >= since,
        )
    )
    row = result.one()
    return ExerciseStats(
        maxReps=row.max_reps or 0,
        maxWeight=row.max_weight or 0,
        totalSessions=row.total_sessions or 0,
        totalVolume=row.total_volume or 0,
    )


# ─── GET /history/sessions?name=X ────────────────────────────────────────────

@router.get("/history/sessions", response_model=list[HistoryEntry])
async def get_exercise_history(
    name: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    sessions_result = await db.execute(
        select(
            SessionSet.session_id,
            WorkoutSession.routine_name,
            WorkoutSession.finished_at,
        )
        .join(WorkoutSession, WorkoutSession.id == SessionSet.session_id)
        .where(
            SessionSet.exercise_name == name,
            WorkoutSession.user_id == user_id,
        )
        .distinct()
        .order_by(WorkoutSession.finished_at.desc())
        .limit(20)
    )
    sessions = sessions_result.all()

    entries = []
    for session_id, routine_name, finished_at in sessions:
        sets_result = await db.execute(
            select(SessionSet)
            .where(
                SessionSet.session_id == session_id,
                SessionSet.exercise_name == name,
            )
            .order_by(SessionSet.id)
        )
        sets = sets_result.scalars().all()
        total_volume = sum(s.weight * s.reps for s in sets)

        from datetime import datetime
        try:
            date_str = datetime.fromisoformat(finished_at).strftime("%d %b %Y").lstrip("0")
        except Exception:
            date_str = finished_at

        entries.append(HistoryEntry(
            sessionId=session_id,
            date=date_str,
            routineName=routine_name,
            sets=[SetDetail(
                weight=s.weight,
                reps=s.reps,
                rpe=s.rpe,
                nivelAnillas=s.nivel_anillas,
            ) for s in sets],
            totalVolume=total_volume,
        ))
    return entries


# ─── GET /history/volume?name=X ───────────────────────────────────────────────

@router.get("/history/volume", response_model=list[VolumePoint])
async def get_volume_progression(
    name: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    finished_at_ts = cast(WorkoutSession.finished_at, DateTime)
    month_label = func.to_char(finished_at_ts, "Mon")
    month_key = func.to_char(finished_at_ts, "YYYY-MM")
    result = await db.execute(
        select(
            month_label.label("month"),
            month_key.label("month_key"),
            func.sum(SessionSet.weight * SessionSet.reps).label("volume"),
        )
        .join(WorkoutSession, WorkoutSession.id == SessionSet.session_id)
        .where(
            SessionSet.exercise_name == name,
            WorkoutSession.user_id == user_id,
        )
        .group_by(month_label, month_key)
        .order_by(month_key)
        .limit(12)
    )
    return [
        VolumePoint(
            month=row.month,
            volume=row.volume,
            label=f"{round(row.volume)} kg",
        )
        for row in result.all()
    ]
