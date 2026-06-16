"""
routers/form1b.py
-----------------
GET /forms/1b
Subject-wise result summary for all sections combined (Form 1B).
Also returns section header stats (current pass, overall pass, percentages).
"""
from fastapi import APIRouter, HTTPException
from store import store
from services.calculator import subject_stats_for_section

router = APIRouter(prefix="/forms", tags=["Forms"])


@router.get("/1b")
async def form_1b():
    """Subject-wise result summary — all sections combined (Form 1B)."""
    if not store.is_ready():
        raise HTTPException(status_code=400, detail="Upload all 4 data files first.")

    metrics = store.get_metrics()
    students = store.students
    subjects = store.subjects
    current = store.current_results

    total_strength = len(students)
    current_pass_count = int(metrics["current_pass"].sum())
    overall_pass_count = int(metrics["overall_pass"].sum())
    current_pass_pct = round(current_pass_count / total_strength * 100, 2) if total_strength else 0.0
    overall_pass_pct = round(overall_pass_count / total_strength * 100, 2) if total_strength else 0.0

    # Per-section breakdown (sections A, B, C)
    sections = sorted(students["section"].unique().tolist())
    section_stats = {}
    for sec in sections:
        sec_students = students[students["section"] == sec]
        sec_metrics = metrics[metrics["section"] == sec]
        sec_total = len(sec_students)
        sec_cp = int(sec_metrics["current_pass"].sum())
        sec_op = int(sec_metrics["overall_pass"].sum())
        section_stats[sec] = {
            "strength": sec_total,
            "current_pass": sec_cp,
            "overall_pass": sec_op,
            "current_pass_pct": round(sec_cp / sec_total * 100, 2) if sec_total else 0.0,
            "overall_pass_pct": round(sec_op / sec_total * 100, 2) if sec_total else 0.0,
        }

    # Subject rows — combine A+B+C stats
    import pandas as pd

    all_subject_rows = []
    for _, subj in subjects.iterrows():
        code = subj["subject_code"]
        sub_results = current[current["subject_code"] == code].copy()
        sub_results["grade_point"] = pd.to_numeric(sub_results["grade_point"], errors="coerce")

        attended = sub_results[~sub_results["absent"]]
        total_attended = len(attended)
        absentees = len(sub_results[sub_results["absent"]])
        passed = int((attended["grade_point"] >= 5.0).sum())
        failed = total_attended - passed
        pass_pct = round(passed / total_attended * 100, 2) if total_attended else 0.0

        # Topper names (across all sections)
        topper_names = []
        if total_attended > 0:
            max_gp = attended["grade_point"].max()
            top_regs = attended[attended["grade_point"] == max_gp]["register_no"].tolist()
            name_map = students.set_index("register_no")["name"].to_dict()
            topper_names = [name_map.get(r, r) for r in top_regs]

        # Staff names per section
        staff = {
            "A": subj.get("staff_a", ""),
            "B": subj.get("staff_b", ""),
            "C": subj.get("staff_c", ""),
        }

        all_subject_rows.append({
            "subject_code": code,
            "subject_name": subj["subject_name"],
            "staff": staff,
            "attended": total_attended,
            "absentees": absentees,
            "passed": passed,
            "failed": failed,
            "pass_pct": pass_pct,
            "topper_names": topper_names,
        })

    return {
        "form": "1B",
        "title": "Subject-wise Result Summary",
        "summary": {
            "total_strength": total_strength,
            "current_pass": current_pass_count,
            "overall_pass": overall_pass_count,
            "current_pass_pct": current_pass_pct,
            "overall_pass_pct": overall_pass_pct,
        },
        "section_stats": section_stats,
        "subjects": all_subject_rows,
    }


@router.get("/1f/{section}")
async def form_1f(section: str):
    """Subject-wise result summary for a single section (Form 1F / section variant)."""
    section = section.upper()
    if not store.is_ready():
        raise HTTPException(status_code=400, detail="Upload all 4 data files first.")

    students = store.students
    metrics = store.get_metrics()
    subjects = store.subjects

    sec_students = students[students["section"] == section]
    if sec_students.empty:
        raise HTTPException(status_code=404, detail=f"Section {section} not found.")

    sec_metrics = metrics[metrics["section"] == section]
    sec_total = len(sec_students)
    sec_cp = int(sec_metrics["current_pass"].sum())
    sec_op = int(sec_metrics["overall_pass"].sum())

    subject_rows = subject_stats_for_section(
        section,
        store.current_results,
        students,
        subjects,
    )

    return {
        "form": "1F",
        "section": section,
        "strength": sec_total,
        "current_pass": sec_cp,
        "overall_pass": sec_op,
        "current_pass_pct": round(sec_cp / sec_total * 100, 2) if sec_total else 0.0,
        "overall_pass_pct": round(sec_op / sec_total * 100, 2) if sec_total else 0.0,
        "subjects": subject_rows,
    }
