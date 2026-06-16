"""
routers/form1a.py
-----------------
GET /forms/1a
Returns the semester-wise pass count matrix used in Form 1A.

Rows = which batch/semester the students belong to (I through VIII).
Columns = Semester I through VIII exam performance.
This mirrors the triangular table shown in the PDF.
"""
from fastapi import APIRouter, HTTPException
from store import store

router = APIRouter(prefix="/forms", tags=["Forms"])


@router.get("/1a")
async def form_1a():
    """Semester-wise performance matrix (Form 1A)."""
    if not store.is_ready():
        raise HTTPException(status_code=400, detail="Upload all 4 data files first.")

    metrics = store.get_metrics()
    students = store.students
    historical = store.historical_results
    current_results = store.current_results
    current_sem = store.current_sem

    import pandas as pd

    total_strength = len(students)
    sems = list(range(1, current_sem + 1))

    # For the CURRENT semester, compute pass per batch-origin row
    # The Form 1A matrix: row = "first passed in Sem X", col = exam sem
    # We reconstruct this from historical data

    # Build a dict: sem_exam -> {row_label -> pass_count}
    # Row label I = students who first appeared in Sem I (all non-lateral)
    # Row label II = students who first appeared in Sem II, etc.

    # Simplified: row = batch entry point (I = all, II = those who passed Sem I, etc.)
    # This matches the Anna University standard Form 1A interpretation:
    # "I" row under "Sem II" col = students who passed Sem I and appeared in Sem II

    # Build pass per semester from historical
    hist = historical.copy()
    hist["grade_point"] = pd.to_numeric(hist["grade_point"], errors="coerce").fillna(0)

    # Current sem pass
    curr_pass_regs = metrics[metrics["current_pass"]]["register_no"].tolist()

    # For each semester, find who passed (all subjects cleared in that sem)
    def sem_passers(sem: int) -> set:
        if sem == current_sem:
            return set(curr_pass_regs)
        sem_hist = hist[hist["semester"] == sem]
        if sem_hist.empty:
            return set()
        # Group by student; pass if all grade_points >= 5
        grouped = sem_hist.groupby("register_no")["grade_point"].min()
        return set(grouped[grouped >= 5.0].index)

    sem_pass_sets = {s: sem_passers(s) for s in sems}

    # Total per semester (students who appeared)
    def sem_total(sem: int) -> int:
        if sem == current_sem:
            return total_strength
        regs = hist[hist["semester"] == sem]["register_no"].unique()
        return len(regs)

    # Build matrix rows: row I = passed sem I, appeared in sem X
    # row VIII = passed all previous sems
    matrix = []
    for row_sem in sems:
        row_data = {"row": f"Semester {_to_roman(row_sem)}"}
        passers = sem_pass_sets[row_sem]
        for col_sem in sems:
            if col_sem < row_sem:
                row_data[f"sem_{col_sem}"] = None
            elif col_sem == row_sem:
                row_data[f"sem_{col_sem}"] = len(passers)
            else:
                # How many of row_sem passers also passed col_sem?
                row_data[f"sem_{col_sem}"] = len(passers & sem_pass_sets[col_sem])
        matrix.append(row_data)

    totals = {f"sem_{s}": sem_total(s) for s in sems}
    totals["row"] = "Total"

    return {
        "form": "1A",
        "title": "Semester Wise Performance",
        "current_semester": current_sem,
        "semesters": sems,
        "total_row": totals,
        "matrix": matrix,
    }


def _to_roman(n: int) -> str:
    mapping = {1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 8: "VIII"}
    return mapping.get(n, str(n))
