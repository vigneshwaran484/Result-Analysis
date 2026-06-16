"""
routers/form3.py
----------------
GET /forms/3a          — All-section ranklist (Form 3A)
GET /forms/3b/{section} — Section-wise ranklist (Form 3B)
"""
from fastapi import APIRouter, HTTPException
from store import store
from services.ranklist import generate_ranklist

router = APIRouter(prefix="/forms", tags=["Forms"])


@router.get("/3a")
async def form_3a():
    """All-section ranklist — current sem GPA and overall CGPA (Form 3A)."""
    if not store.is_ready():
        raise HTTPException(status_code=400, detail="Upload all 4 data files first.")

    metrics = store.get_metrics()
    ranklist = generate_ranklist(metrics, section=None)

    return {
        "form": "3A",
        "title": "All-Section Ranklist",
        **ranklist,
    }


@router.get("/3b/{section}")
async def form_3b(section: str):
    """Section-wise ranklist for a given section (A / B / C) — Form 3B."""
    section = section.upper()
    if not store.is_ready():
        raise HTTPException(status_code=400, detail="Upload all 4 data files first.")

    students = store.students
    if section not in students["section"].unique():
        raise HTTPException(status_code=404, detail=f"Section '{section}' not found.")

    metrics = store.get_metrics()
    ranklist = generate_ranklist(metrics, section=section)

    return {
        "form": "3B",
        "section": section,
        "title": f"Section {section} Ranklist",
        **ranklist,
    }
