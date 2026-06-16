"""
routers/form2.py
----------------
GET /forms/2
Section summary — Combined + Section A/B/C breakdown.
Includes arrear-inclusive pass % (1, 1+2, 1+2+3 arrears).
"""
from fastapi import APIRouter, HTTPException
import pandas as pd
from store import store

router = APIRouter(prefix="/forms", tags=["Forms"])


def _section_summary(section_label: str, met: pd.DataFrame) -> dict:
    total = len(met)
    cp = int(met["current_pass"].sum())
    op = int(met["overall_pass"].sum())

    def students_with_exactly_n_pending(n_max: int) -> int:
        """Students who are overall-fail but have <= n_max pending arrears."""
        pending_leq = met[~met["overall_pass"] & (met["pending_arrears"] <= n_max)]
        return len(pending_leq)

    n1 = students_with_exactly_n_pending(1)
    n12 = students_with_exactly_n_pending(2)
    n123 = students_with_exactly_n_pending(3)

    def pct(passed: int) -> float:
        return round(passed / total * 100, 2) if total else 0.0

    return {
        "section": section_label,
        "total_strength": total,
        "current_pass": cp,
        "current_pass_pct": pct(cp),
        "overall_pass": op,
        "overall_pass_pct": pct(op),
        "students_with_1_arrear": n1,
        "pass_pct_incl_1_arrear": pct(op + n1),
        "students_with_1_2_arrear": n12,
        "pass_pct_incl_1_2_arrear": pct(op + n12),
        "students_with_1_2_3_arrear": n123,
        "pass_pct_incl_1_2_3_arrear": pct(op + n123),
    }


@router.get("/2")
async def form_2():
    """Section summary — Combined + A/B/C (Form 2)."""
    if not store.is_ready():
        raise HTTPException(status_code=400, detail="Upload all 4 data files first.")

    metrics = store.get_metrics()
    students = store.students

    sections = sorted(students["section"].unique().tolist())

    combined = _section_summary("Combined", metrics)
    section_breakdown = {}
    for sec in sections:
        sec_metrics = metrics[metrics["section"] == sec]
        section_breakdown[sec] = _section_summary(sec, sec_metrics)

    return {
        "form": "2",
        "title": "Section Summary",
        "combined": combined,
        "sections": section_breakdown,
    }
