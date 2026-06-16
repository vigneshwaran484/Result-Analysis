"""
services/ranklist.py
---------------------
Generates sorted ranklists from student metrics DataFrame.
Used by Form 3A (all sections) and Form 3B (per section).
"""
import pandas as pd


def generate_ranklist(
    metrics_df: pd.DataFrame,
    section: str = None,
) -> dict:
    """
    Returns:
      {
        "current_sem": [...],   # ranked by GPA descending
        "overall": [...],       # ranked by CGPA (TGP) descending
        "avg_gpa": float,
        "avg_cgpa": float,
        "total_gp": int,
        "total_tgp": int,
      }

    If section is given, filter to that section only.
    """
    df = metrics_df.copy()
    if section:
        df = df[df["section"] == section]

    # Only students who passed current semester appear in current sem ranklist
    current_cleared = df[df["current_pass"]].copy()
    # Only overall all-clear students appear in overall ranklist
    overall_cleared = df[df["overall_pass"]].copy()

    def rank_current(d: pd.DataFrame) -> list[dict]:
        d = d.sort_values(["gpa", "tgp"], ascending=[False, False]).reset_index(drop=True)
        rows = []
        for i, row in d.iterrows():
            rows.append({
                "rank": i + 1,
                "register_no": row["register_no"],
                "name": row["name"],
                "section": row["section"],
                "gp": row["tgp"],            # GP = current sem grade points total
                "gpa": row["gpa"],
            })
        return rows

    def rank_overall(d: pd.DataFrame) -> list[dict]:
        d = d.sort_values(["cgpa", "tgp"], ascending=[False, False]).reset_index(drop=True)
        rows = []
        for i, row in d.iterrows():
            rows.append({
                "rank": i + 1,
                "register_no": row["register_no"],
                "name": row["name"],
                "section": row["section"],
                "tgp": row["tgp"],
                "cgpa": row["cgpa"],
            })
        return rows

    total_gp = int(current_cleared["tgp"].sum()) if not current_cleared.empty else 0
    avg_gpa = round(current_cleared["gpa"].mean(), 2) if not current_cleared.empty else 0.0
    total_tgp = int(overall_cleared["tgp"].sum()) if not overall_cleared.empty else 0
    avg_cgpa = round(overall_cleared["cgpa"].mean(), 2) if not overall_cleared.empty else 0.0

    return {
        "current_sem": rank_current(current_cleared),
        "overall": rank_overall(overall_cleared),
        "avg_gpa": avg_gpa,
        "avg_cgpa": avg_cgpa,
        "total_gp": total_gp,
        "total_tgp": total_tgp,
    }
