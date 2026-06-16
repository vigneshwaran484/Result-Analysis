"""
services/calculator.py
-----------------------
All grade computation logic:
  - GPA (current semester)
  - CGPA (cumulative across all semesters)
  - Pass / fail classification per student
  - Arrear counts and history flags
  - Subject-wise pass/fail stats
"""
import pandas as pd
from typing import Optional


FAIL_GRADES = {"RA", "U"}
PASS_THRESHOLD = 5.0   # grade_point >= 5 means pass (grade C or above)


# ─── GPA / CGPA ───────────────────────────────────────────────────────────────

def compute_gpa(
    student_reg: str,
    current_df: pd.DataFrame,
    subjects_df: pd.DataFrame,
) -> Optional[float]:
    """
    GPA = Σ(grade_point × credits) / Σ(credits) for the current semester.
    Absent subjects are excluded from both numerator and denominator.
    Returns None if the student has no valid results.
    """
    results = current_df[
        (current_df["register_no"] == student_reg) & (~current_df["absent"])
    ].copy()
    if results.empty:
        return None

    merged = results.merge(
        subjects_df[["subject_code", "credits"]], on="subject_code", how="left"
    )
    merged["credits"] = pd.to_numeric(merged["credits"], errors="coerce").fillna(0)
    total_credits = merged["credits"].sum()
    if total_credits == 0:
        return None

    merged["grade_point"] = pd.to_numeric(merged["grade_point"], errors="coerce").fillna(0)
    merged["weighted"] = merged["grade_point"] * merged["credits"]
    return round(merged["weighted"].sum() / total_credits, 2)


def compute_cgpa_and_tgp(
    student_reg: str,
    historical_df: pd.DataFrame,
    subjects_df: pd.DataFrame,
    current_df: pd.DataFrame,
    current_sem: int,
) -> tuple[Optional[float], Optional[int]]:
    """
    Returns (CGPA, TGP) across all semesters (historical + current).
    TGP = Total Grade Points (sum of grade_point × credits across all subjects).
    For arrear clears, we use the latest attempt's grade_point.
    """
    # Collect historical rows (non-arrear first attempts only, or latest if arrear)
    hist = historical_df[historical_df["register_no"] == student_reg].copy()

    # Current sem rows
    curr = current_df[
        (current_df["register_no"] == student_reg) & (~current_df["absent"])
    ][["subject_code", "grade_point"]].copy()
    curr["semester"] = current_sem

    # Combine
    if not hist.empty:
        hist_clean = hist[["subject_code", "semester", "grade_point"]].copy()
        combined = pd.concat([hist_clean, curr], ignore_index=True)
    else:
        combined = curr.copy()

    if combined.empty:
        return None, None

    # For each subject take the best (max) grade_point (handles re-attempts)
    best = combined.sort_values("grade_point", ascending=False).drop_duplicates("subject_code")

    merged = best.merge(subjects_df[["subject_code", "credits"]], on="subject_code", how="left")
    merged["credits"] = pd.to_numeric(merged["credits"], errors="coerce").fillna(0)
    merged["grade_point"] = pd.to_numeric(merged["grade_point"], errors="coerce").fillna(0)

    total_credits = merged["credits"].sum()
    if total_credits == 0:
        return None, None

    merged["weighted"] = merged["grade_point"] * merged["credits"]
    tgp = int(merged["weighted"].sum())
    cgpa = round(tgp / total_credits, 2)
    return cgpa, tgp


# ─── Pass / Fail classifications ─────────────────────────────────────────────

def is_current_pass(student_reg: str, current_df: pd.DataFrame) -> bool:
    """
    A student is a current pass if they passed ALL subjects they attended
    this semester (no RA/U grades).
    """
    attended = current_df[
        (current_df["register_no"] == student_reg) & (~current_df["absent"])
    ]
    if attended.empty:
        return False
    return bool((pd.to_numeric(attended["grade_point"], errors="coerce").fillna(0) >= PASS_THRESHOLD).all())


def get_current_arrear_count(student_reg: str, current_df: pd.DataFrame) -> int:
    """Number of subjects failed in the current semester."""
    attended = current_df[
        (current_df["register_no"] == student_reg) & (~current_df["absent"])
    ]
    return int((pd.to_numeric(attended["grade_point"], errors="coerce").fillna(0) < PASS_THRESHOLD).sum())


def is_overall_pass(
    student_reg: str,
    current_df: pd.DataFrame,
    historical_df: pd.DataFrame,
) -> bool:
    """
    Overall pass = current pass AND no pending arrears from previous semesters.
    A pending arrear = a subject with an RA/U that was never subsequently cleared.
    """
    if not is_current_pass(student_reg, current_df):
        return False
    return get_total_pending_arrears(student_reg, historical_df) == 0


def get_total_pending_arrears(student_reg: str, historical_df: pd.DataFrame) -> int:
    """
    Count subjects from historical data that still have a pending failure
    (i.e., the student's LAST attempt on that subject was still a fail).
    """
    hist = historical_df[historical_df["register_no"] == student_reg].copy()
    if hist.empty:
        return 0

    hist["grade_point"] = pd.to_numeric(hist["grade_point"], errors="coerce").fillna(0)
    # Take the latest attempt per subject
    latest = hist.sort_values("semester").drop_duplicates("subject_code", keep="last")
    pending = (latest["grade_point"] < PASS_THRESHOLD).sum()
    return int(pending)


def has_history_of_arrears(student_reg: str, historical_df: pd.DataFrame) -> bool:
    """True if the student has EVER failed any subject (even if now cleared)."""
    hist = historical_df[historical_df["register_no"] == student_reg]
    if hist.empty:
        return False
    return bool((pd.to_numeric(hist["grade_point"], errors="coerce").fillna(0) < PASS_THRESHOLD).any())


# ─── Bulk student metrics (used by all form APIs) ────────────────────────────

def build_student_metrics(
    students_df: pd.DataFrame,
    current_df: pd.DataFrame,
    historical_df: pd.DataFrame,
    subjects_df: pd.DataFrame,
    current_sem: int,
) -> pd.DataFrame:
    """
    Returns one row per student with:
      register_no, name, section, gpa, cgpa, tgp,
      current_pass, overall_pass, with_arrear_history, pending_arrears
    """
    records = []
    for _, student in students_df.iterrows():
        reg = student["register_no"]
        gpa = compute_gpa(reg, current_df, subjects_df)
        cgpa, tgp = compute_cgpa_and_tgp(reg, historical_df, subjects_df, current_df, current_sem)
        curr_pass = is_current_pass(reg, current_df)
        overall_pass = is_overall_pass(reg, current_df, historical_df)
        arrear_hist = has_history_of_arrears(reg, historical_df)
        pending = get_total_pending_arrears(reg, historical_df)
        if not curr_pass:
            pending += get_current_arrear_count(reg, current_df)

        records.append({
            "register_no": reg,
            "name": student["name"],
            "section": student["section"],
            "gpa": gpa,
            "cgpa": cgpa,
            "tgp": tgp,
            "current_pass": curr_pass,
            "overall_pass": overall_pass,
            "with_arrear_history": arrear_hist,
            "without_arrear_history": curr_pass and not arrear_hist,
            "pending_arrears": pending,
        })
    return pd.DataFrame(records)


# ─── Subject-wise stats (Form 1B / 1F) ───────────────────────────────────────

def subject_stats_for_section(
    section: str,
    current_df: pd.DataFrame,
    students_df: pd.DataFrame,
    subjects_df: pd.DataFrame,
) -> list[dict]:
    """
    For each subject, return:
      subject_code, subject_name, staff (for given section),
      attended, absentees, passed, failed, pass_pct, topper_names
    """
    section_students = students_df[students_df["section"] == section]["register_no"].tolist()
    section_results = current_df[current_df["register_no"].isin(section_students)].copy()
    section_results["grade_point"] = pd.to_numeric(section_results["grade_point"], errors="coerce")

    rows = []
    for _, subj in subjects_df.iterrows():
        code = subj["subject_code"]
        sub_res = section_results[section_results["subject_code"] == code]

        attended_res = sub_res[~sub_res["absent"]]
        total_attended = len(attended_res)
        absentees = len(sub_res[sub_res["absent"]])
        passed = int((attended_res["grade_point"] >= PASS_THRESHOLD).sum())
        failed = total_attended - passed
        pass_pct = round((passed / total_attended * 100), 2) if total_attended else 0.0

        # Topper = max grade_point (if multiple students share it, list all)
        topper_names = []
        if total_attended > 0:
            max_gp = attended_res["grade_point"].max()
            toppers = attended_res[attended_res["grade_point"] == max_gp]["register_no"].tolist()
            name_map = students_df.set_index("register_no")["name"].to_dict()
            topper_names = [name_map.get(r, r) for r in toppers]

        staff_key = f"staff_{section.lower()}"
        rows.append({
            "subject_code": code,
            "subject_name": subj["subject_name"],
            "staff": subj.get(staff_key, ""),
            "attended": total_attended,
            "absentees": absentees,
            "passed": passed,
            "failed": failed,
            "pass_pct": pass_pct,
            "topper_names": topper_names,
        })
    return rows
