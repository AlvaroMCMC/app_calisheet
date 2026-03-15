"""
Tests para el endpoint POST /sessions.
Cubre: ownership validation, creación exitosa.
"""
import pytest
from unittest.mock import patch
from httpx import AsyncClient

MOCK_USER_A = "user_aaa"
MOCK_USER_B = "user_bbb"

SESSION_PAYLOAD = {
    "routineId": 1,
    "routineName": "Test Routine",
    "startedAt": "2026-03-15T10:00:00",
    "finishedAt": "2026-03-15T10:45:00",
    "totalVolumeKg": 1500.0,
    "sets": [
        {"exerciseName": "Pull Up", "weight": 0.0, "reps": 10},
    ],
}


@pytest.mark.asyncio
async def test_save_session_forbidden_if_routine_belongs_to_other_user(client: AsyncClient, db_session):
    """Un usuario no puede guardar sesión sobre la rutina de otro."""
    from models import Routine

    # Crear rutina de user_b
    routine = Routine(user_id=MOCK_USER_B, title="Rutina B", tags=[], schedule_days=[])
    db_session.add(routine)
    await db_session.commit()
    await db_session.refresh(routine)

    # Intentar guardar sesión como user_a sobre esa rutina
    with patch("auth.get_current_user_id", return_value=MOCK_USER_A):
        resp = await client.post("/sessions", json={**SESSION_PAYLOAD, "routineId": routine.id})

    assert resp.status_code == 403, resp.text


@pytest.mark.asyncio
async def test_save_session_ok_with_own_routine(client: AsyncClient, db_session):
    """Un usuario puede guardar sesión sobre su propia rutina."""
    from models import Routine

    routine = Routine(user_id=MOCK_USER_A, title="Mi Rutina", tags=[], schedule_days=[])
    db_session.add(routine)
    await db_session.commit()
    await db_session.refresh(routine)

    with patch("auth.get_current_user_id", return_value=MOCK_USER_A):
        resp = await client.post("/sessions", json={**SESSION_PAYLOAD, "routineId": routine.id})

    assert resp.status_code == 201
    assert "id" in resp.json()


@pytest.mark.asyncio
async def test_save_session_forbidden_if_routine_not_found(client: AsyncClient):
    """Devuelve 403 si la rutina no existe."""
    with patch("auth.get_current_user_id", return_value=MOCK_USER_A):
        resp = await client.post("/sessions", json={**SESSION_PAYLOAD, "routineId": 99999})

    assert resp.status_code == 403
