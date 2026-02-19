import os
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from jose.backends import RSAKey

CLERK_JWKS_URL = os.getenv(
    "CLERK_JWKS_URL",
    "https://thankful-lamprey-62.clerk.accounts.dev/.well-known/jwks.json",
)

bearer_scheme = HTTPBearer()
_jwks_cache: dict | None = None


async def _get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache is None:
        async with httpx.AsyncClient() as client:
            resp = await client.get(CLERK_JWKS_URL)
            resp.raise_for_status()
            _jwks_cache = resp.json()
    return _jwks_cache


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    token = credentials.credentials
    try:
        jwks = await _get_jwks()
        # Get the key id from the token header
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        # Find matching key
        key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
        if key is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token key")
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing subject")
        return user_id
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
