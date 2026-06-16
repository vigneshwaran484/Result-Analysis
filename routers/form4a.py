"""
routers/form4a.py
-----------------
GET /forms/4a
Semester-wise arrear breakdown per student (Form 4A).
Only shows students who have at least 1 arrear across any semester.
Lateral-entry students show "-" for Sem I and Sem II.
"""
from fastapi import APIRouter, HTTPException
import pandas as pd
from store import store

router = APIRouter(prefix="/forms", tags=["Forms"])


@router.get("/4a")
async def form_4a():
    """Arrear history — semester-wise per student (Form 4A)."""
    if not store.is_ready():
        raise HTTPException(status_code=400, detail="Upload all 4 data files first.")

    students = store.students
    historical = store.historical_results
    current_results = store.current_results
    metrics = store.get_metrics()
    current_sem = store.current_sem

    hist = historical.copy()
    hist["grade_point"] = pd.to_numeric(hist["grade_point"], errors="coerce").fillna(0)

    # Get all arrear counts per (student, semester)
    def arrears_for_sem(reg: str, sem: int) -> int:
        sem_hist = hist[(hist["register_no"] == reg) & (hist["semester"] == sem)]
        return int((sem_hist["grade_point"] < 5.0).sum())

    def current_arrears(reg: str) -> int:
        curr = current_results[
            (current_results["register_no"] == reg) & (~current_results["absent"])
        ]
        curr_gp = pd.to_numeric(curr["grade_point"], errors="coerce").fillna(0)
        return int((curr_gp < 5.0).sum())

    sems = list(range(1, current_sem + 1))
    rows = []
    serial = 1
    lateral_regs = set(students[students["lateral_entry"] == True]["register_no"].tolist())

    for _, student in students.sort_values("register_no").iterrows():
        reg = student["register_no"]
        section = student["section"]
        is_lateral = reg in lateral_regs

        sem_arrears = {}
        total = 0
        for s in sems:
            if is_lateral and s < 3:
                sem_arrears[s] = None   # lateral entry — no Sem I/II
                continue
            if s == current_sem:
                count = current_arrears(reg)
            else:
                count = arrears_for_sem(reg, s)
            sem_arrears[s] = count
            total += count

        # Only include students with at least 1 arrear
        if total == 0:
            continue

        row = {
            "serial_no": serial,
            "register_no": reg,
            "name": student["name"],
            "section": section,
            "total": total,
        }
        for s in sems:
            row[f"sem_{s}"] = sem_arrears[s]  # None renders as "-" in frontend

        rows.append(row)
        serial += 1

    return {
        "form": "4A",
        "title": "Semester-wise Arrear History",
        "semesters": sems,
        "students": rows,
        "total_students_with_arrears": len(rows),
    }
