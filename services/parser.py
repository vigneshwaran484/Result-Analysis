"""
services/parser.py
------------------
Reads the 4 uploaded Excel files into validated Pandas DataFrames.
Raises ValueError with a human-readable message on any format problem.
"""
import io
import pandas as pd
from typing import BinaryIO


# ── Grade mapping (Anna University 10-point scale) ────────────────────────────
GRADE_POINT_MAP = {
    "O": 10.0,
    "A+": 9.0,
    "A": 8.0,
    "B+": 7.0,
    "B": 6.0,
    "C": 5.0,
    "RA": 0.0,
    "U": 0.0,
    "AB": None,   # absent
}

FAIL_GRADES = {"RA", "U"}


def _read_excel(file: BinaryIO, required_cols: list[str], sheet_name=0) -> pd.DataFrame:
    """Read an Excel file and validate required columns exist."""
    try:
        df = pd.read_excel(io.BytesIO(file.read()), sheet_name=sheet_name, dtype=str)
    except Exception as e:
        raise ValueError(f"Could not read Excel file: {e}")

    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns: {missing}")
    return df


# ── Individual parsers ─────────────────────────────────────────────────────────

def parse_students(file: BinaryIO) -> pd.DataFrame:
    required = ["register_no", "name", "section", "batch", "lateral_entry"]
    df = _read_excel(file, required)
    df["register_no"] = df["register_no"].str.strip()
    df["section"] = df["section"].str.strip().str.upper()
    df["lateral_entry"] = df["lateral_entry"].str.strip().str.lower().map(
        {"yes": True, "no": False, "true": True, "false": False}
    ).fillna(False)
    return df[required]


def parse_subjects(file: BinaryIO) -> pd.DataFrame:
    required = ["subject_code", "subject_name", "semester", "credits",
                "staff_a", "staff_b", "staff_c"]
    df = _read_excel(file, required)
    df["semester"] = pd.to_numeric(df["semester"], errors="coerce").fillna(0).astype(int)
    df["credits"] = pd.to_numeric(df["credits"], errors="coerce").fillna(0).astype(int)
    return df[required]


def parse_current_results(file: BinaryIO) -> pd.DataFrame:
    required = ["register_no", "subject_code", "grade"]
    df = _read_excel(file, required)
    df["register_no"] = df["register_no"].str.strip()
    df["subject_code"] = df["subject_code"].str.strip()
    df["grade"] = df["grade"].str.strip().str.upper()
    df["absent"] = df["grade"].isin(["AB", "ABSENT"])
    df["grade_point"] = df["grade"].map(GRADE_POINT_MAP)
    return df


def parse_historical_results(file: BinaryIO) -> pd.DataFrame:
    required = ["register_no", "semester", "subject_code", "grade_point", "arrear"]
    df = _read_excel(file, required)
    df["register_no"] = df["register_no"].str.strip()
    df["semester"] = pd.to_numeric(df["semester"], errors="coerce").fillna(0).astype(int)
    df["grade_point"] = pd.to_numeric(df["grade_point"], errors="coerce")
    df["arrear"] = df["arrear"].str.strip().str.lower().map(
        {"yes": True, "no": False, "true": True, "false": False}
    ).fillna(False)
    return df[required]
