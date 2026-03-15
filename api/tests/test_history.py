"""
Tests para el endpoint GET /history/stats.
Cubre: validación del parámetro since como ISO datetime.
"""
import pytest
from unittest.mock import patch
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_history_stats_invalid_since_returns_422(client: AsyncClient):
    """El parámetro 'since' debe ser un datetime ISO válido."""
    with patch("auth.get_current_user_id", return_value="user_aaa"):
        resp = await client.get("/history/stats", params={
            "name": "Pull Up",
            "since": "not-a-date",
        })
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_history_stats_valid_since_returns_200(client: AsyncClient):
    """Con un datetime válido retorna 200."""
    with patch("auth.get_current_user_id", return_value="user_aaa"):
        resp = await client.get("/history/stats", params={
            "name": "Pull Up",
            "since": "2026-01-01T00:00:00",
        })
    assert resp.status_code == 200
    data = resp.json()
    assert "maxReps" in data
    assert "totalSessions" in data
