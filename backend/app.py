"""Standalone application server. Never imports or connects to ProjectBuddy.

One installation is one private workspace. The deployment gateway authenticates
its PB owner; standalone access uses an installation token, never PB credentials.
"""

import hashlib
import hmac
import json
import os
from pathlib import Path
import secrets
import sqlite3
import time

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel, ConfigDict, Field

ROOT = Path(__file__).resolve().parents[1]


class Save(BaseModel):
    model_config = ConfigDict(extra="forbid")
    revision: int = Field(ge=0, strict=True)
    value: dict


def create_app(data_dir=None, access_token=None):
    app = FastAPI(title="Buddy Application API", docs_url=None, redoc_url=None)
    folder = Path(data_dir or os.environ.get("BUDDY_DATA_DIR", ROOT / "data"))
    folder.mkdir(parents=True, exist_ok=True)
    token = access_token or os.environ.get("BUDDY_ACCESS_TOKEN", "")
    if len(token) < 32:
        raise RuntimeError("Set BUDDY_ACCESS_TOKEN to at least 32 random characters")
    from backend.business import router, validate_data

    app.include_router(router, prefix="/api/business")
    database = folder / "app.sqlite3"

    def connect():
        c = sqlite3.connect(database, timeout=5)
        c.execute("PRAGMA journal_mode=WAL")
        return c

    with connect() as c:
        c.execute(
            "CREATE TABLE IF NOT EXISTS workspace(id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL, value TEXT NOT NULL)"
        )
        c.execute("INSERT OR IGNORE INTO workspace VALUES(1,0,'{}')")

    @app.middleware("http")
    async def protect(request: Request, call_next):
        path = request.url.path
        # A fixed deployment token is available only to the authenticated gateway.
        # Browser sessions use a signed HttpOnly cookie; no token in URLs/localStorage.
        authorized = hmac.compare_digest(
            request.headers.get("authorization", ""), "Bearer " + token
        )
        cookie = request.cookies.get("buddy_session", "")
        try:
            expires, signature = cookie.split(".")
            expected = hmac.new(
                token.encode(), expires.encode(), hashlib.sha256
            ).hexdigest()
            authorized |= int(expires) > time.time() and hmac.compare_digest(
                signature, expected
            )
        except (ValueError, TypeError):
            pass
        if (
            path.startswith("/api/")
            and path not in ("/api/login", "/api/health")
            and not authorized
        ):
            return Response(status_code=401)
        if request.method not in ("GET", "HEAD"):
            # Reject browser cross-origin mutations, including login CSRF.
            origin = request.headers.get("origin")
            if origin and origin != str(request.base_url).rstrip("/"):
                return Response(status_code=403)
            if (
                request.headers.get("content-type", "").split(";")[0]
                != "application/json"
            ):
                return Response(status_code=415)
            if len(await request.body()) > 1024 * 1024:
                return Response(status_code=413)
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'"
        )
        return response

    @app.get("/api/health")
    def health():
        return {"status": "ok", "storage": "sqlite", "contract": "buddy-fullstack-v1"}

    @app.post("/api/login")
    async def login(request: Request, response: Response):
        body = await request.json()
        if (
            not isinstance(body, dict)
            or not isinstance(body.get("token"), str)
            or not secrets.compare_digest(body["token"], token)
        ):
            raise HTTPException(401, "Invalid access token")
        expires = str(int(time.time()) + 3600 * 8)
        signature = hmac.new(
            token.encode(), expires.encode(), hashlib.sha256
        ).hexdigest()
        response.set_cookie(
            "buddy_session",
            expires + "." + signature,
            httponly=True,
            samesite="strict",
            secure=request.url.scheme == "https",
            max_age=28800,
        )
        return {"authenticated": True}

    @app.post("/api/logout")
    def logout(response: Response):
        response.delete_cookie("buddy_session")
        return {"authenticated": False}

    @app.get("/api/data")
    def read():
        with connect() as c:
            revision, value = c.execute(
                "SELECT revision,value FROM workspace WHERE id=1"
            ).fetchone()
        return dict(revision=revision, value=json.loads(value))

    @app.put("/api/data")
    def save(body: Save):
        try:
            value = validate_data(body.value)
            if not isinstance(value, dict):
                raise ValueError()
        except ValueError:
            raise HTTPException(422, "Business validation failed") from None
        with connect() as c:
            changed = c.execute(
                "UPDATE workspace SET revision=revision+1,value=? WHERE id=1 AND revision=?",
                (json.dumps(value, ensure_ascii=False), body.revision),
            )
            if changed.rowcount != 1:
                raise HTTPException(409, "Workspace changed; reload before saving")
        return dict(revision=body.revision + 1)

    @app.get("/runtime-config.js")
    def config():
        return Response(
            "window.__BUDDY_SERVER__=true;", media_type="application/javascript"
        )

    @app.get("/{asset:path}")
    def static(asset: str):
        files = {
            "": "index.html",
            "index.html": "index.html",
            "app.js": "app.js",
            "app.css": "app.css",
        }
        if asset not in files:
            raise HTTPException(404)
        if files[asset] == "index.html":
            html = (ROOT / "dist/index.html").read_text()
            return HTMLResponse(
                html.replace(
                    '<script src="./app.js"',
                    '<script src="./runtime-config.js"></script><script src="./app.js"',
                )
            )
        return FileResponse(ROOT / "dist" / files[asset])

    return app
