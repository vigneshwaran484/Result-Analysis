"""
routers/form1e.py
-----------------
GET /forms/1e
Result Analysis — year-wise and semester-wise breakdown
of total strength, current pass, overall pass, arrear counts etc.
This is the data needed for both the table and the two bar charts in Form 1E.
"""
from fastapi import APIRouter, HTTPException
import pandas as pd
from store import store

router = APIRouter(prefix="/forms", tags=["Forms"])

SEM_TO_YEAR = {1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4}


def _sem_analysis(sem: int, hist: pd.DataFrame, students_df: pd.DataFrame, metrics_df: pd.DataFrame, current_sem: int) -> dict:
    """Return analysis stats for a single semester."""
    if sem == current_sem:
        total = len(students_df)
        cp = int(metrics_df["current_pass"].sum())
        op = int(metrics_df["overall_pass"].sum())
        without_arr = int(metrics_df["without_arrear_history"].sum())
        with_arr = int((metrics_df["with_arrear_history"] & metrics_df["overall_pass"]).sum())
        arrear_count = int(metrics_df["pending_arrears"].sum())
    else:
        sem_hist = hist[hist["semester"] == sem].copy()
        sem_hist["grade_point"] = pd.to_numeric(sem_hist["grade_point"], errors="coerce").fillna(0)
        regs = sem_hist["register_no"].unique()
        total = len(regs)

        # Pass in that semester = all subjects cleared
        grouped_min = sem_hist.groupby("register_no")["grade_point"].min()
        passed_regs = set(grouped_min[grouped_min >= 5.0].index)
        cp = len(passed_regs)

        # Overall pass = passed that sem AND no pending arrears up to that sem
        # Simplified: count students with 0 total failures up to this sem
        hist_upto = hist[hist["semester"] <= sem].copy()
        hist_upto["grade_point"] = pd.to_numeric(hist_upto["grade_point"], errors="coerce").fillna(0)
        latest = hist_upto.sort_values("semester").drop_duplicates(["register_no", "subject_code"], keep="last")
        pending_map = latest.groupby("register_no").apply(lambda g: (g["grade_point"] < 5.0).sum())

        op = int((pending_map[pending_map == 0]).shape[0]) if not pending_map.empty else 0

        without_arr_map = hist_upto.groupby("register_no").apply(lambda g: (g["grade_point"] < 5.0).any())
        without_arr = int((~without_arr_map).sum()) if not without_arr_map.empty else 0
        with_arr = op - without_arr
        arrear_count = int(pending_map.sum()) if not pending_map.empty else 0

    return {
        "semester": sem,
        "total_strength": total,
        "current_pass": cp,
        "overall_pass": op,
        "without_history_of_arrears": without_arr,
        "with_history_of_arrears": max(0, with_arr),
        "arrear_count": arrear_count,
    }


@router.get("/1e")
async def form_1e():
    """Result Analysis — semester-wise and year-wise data (Form 1E)."""
    if not store.is_ready():
        raise HTTPException(status_code=400, detail="Upload all 4 data files first.")

    metrics = store.get_metrics()
    students = store.students
    hist = store.historical_results
    current_sem = store.current_sem

    sems = list(range(1, current_sem + 1))
    sem_data = [_sem_analysis(s, hist, students, metrics, current_sem) for s in sems]

    # Year-wise: average/sum the two sems per year
    years = sorted(set(SEM_TO_YEAR[s] for s in sems))
    year_data = []
    for year in years:
        year_sems = [d for d in sem_data if SEM_TO_YEAR[d["semester"]] == year]
        if not year_sems:
            continue
        # Use the second semester of the year (or only one if early batch)
        last = year_sems[-1]
        year_data.append({
            "year": year,
            "label": f"{['I', 'II', 'III', 'IV'][year - 1]} Year Performance",
            "total_strength": last["total_strength"],
            "current_pass": last["current_pass"],
            "overall_pass": last["overall_pass"],
            "without_history_of_arrears": last["without_history_of_arrears"],
            "with_history_of_arrears": last["with_history_of_arrears"],
            "arrear_count": last["arrear_count"],
        })

    return {
        "form": "1E",
        "title": "Result Analysis",
        "current_semester": current_sem,
        "semester_wise": sem_data,
        "year_wise": year_data,
    }
