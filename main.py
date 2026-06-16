"""
main.py — FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import init_db
from routers import upload, form1a, form1b, form1e, form2, form3, form4a


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="University Result Automation API",
    description=(
        "Automates generation of university exam result forms "
        "(1A, 1B, 1E, 2, 3A, 3B, 4A) for St. Joseph's College of Engineering, CSE."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Allow the React frontend (Vite dev server) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(upload.router)
app.include_router(form1a.router)
app.include_router(form1b.router)
app.include_router(form1e.router)
app.include_router(form2.router)
app.include_router(form3.router)
app.include_router(form4a.router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "ok",
        "message": "University Result Automation API",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
