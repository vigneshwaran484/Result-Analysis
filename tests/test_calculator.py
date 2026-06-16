"""
tests/test_calculator.py
Tests for GPA, CGPA, pass/fail, and arrear logic.
Run with: pytest tests/
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pandas as pd
import pytest
from services.calculator import (
    compute_gpa,
    compute_cgpa_and_tgp,
    is_current_pass,
    is_overall_pass,
    get_total_pending_arrears,
    has_history_of_arrears,
    build_student_metrics,
)


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def subjects_df():
    return pd.DataFrame([
        {"subject_code": "CS01", "subject_name": "Maths", "semester": 8, "credits": 4},
        {"subject_code": "CS02", "subject_name": "OS", "semester": 8, "credits": 3},
        {"subject_code": "CS03", "subject_name": "CN", "semester": 8, "credits": 3},
    ])


@pytest.fixture
def current_df_pass():
    """Student A passed all 3 subjects."""
    return pd.DataFrame([
        {"register_no": "A001", "subject_code": "CS01", "grade": "O", "grade_point": 10.0, "absent": False},
        {"register_no": "A001", "subject_code": "CS02", "grade": "A+", "grade_point": 9.0, "absent": False},
        {"register_no": "A001", "subject_code": "CS03", "grade": "B+", "grade_point": 7.0, "absent": False},
    ])


@pytest.fixture
def current_df_fail():
    """Student B failed CS03."""
    return pd.DataFrame([
        {"register_no": "B001", "subject_code": "CS01", "grade": "O", "grade_point": 10.0, "absent": False},
        {"register_no": "B001", "subject_code": "CS02", "grade": "A", "grade_point": 8.0, "absent": False},
        {"register_no": "B001", "subject_code": "CS03", "grade": "RA", "grade_point": 0.0, "absent": False},
    ])


@pytest.fixture
def current_df_absent():
    """Student C was absent in CS02."""
    return pd.DataFrame([
        {"register_no": "C001", "subject_code": "CS01", "grade": "A", "grade_point": 8.0, "absent": False},
        {"register_no": "C001", "subject_code": "CS02", "grade": "AB", "grade_point": None, "absent": True},
        {"register_no": "C001", "subject_code": "CS03", "grade": "B", "grade_point": 6.0, "absent": False},
    ])


@pytest.fixture
def empty_historical():
    return pd.DataFrame(columns=["register_no", "semester", "subject_code", "grade_point", "arrear"])


@pytest.fixture
def historical_with_cleared_arrear():
    """Student A had a Sem 5 arrear that they cleared in Sem 6."""
    return pd.DataFrame([
        {"register_no": "A001", "semester": 5, "subject_code": "CS50", "grade_point": 0.0, "arrear": False},
        {"register_no": "A001", "semester": 6, "subject_code": "CS50", "grade_point": 6.0, "arrear": True},
    ])


@pytest.fixture
def historical_with_pending_arrear():
    """Student A001 has a pending Sem 3 arrear (never cleared)."""
    return pd.DataFrame([
        {"register_no": "A001", "semester": 3, "subject_code": "CS30", "grade_point": 0.0, "arrear": False},
    ])


# ── GPA Tests ─────────────────────────────────────────────────────────────────

def test_gpa_all_pass(current_df_pass, subjects_df):
    # GPA = (10*4 + 9*3 + 7*3) / (4+3+3) = (40+27+21)/10 = 88/10 = 8.8
    gpa = compute_gpa("A001", current_df_pass, subjects_df)
    assert gpa == 8.8


def test_gpa_absent_excluded(current_df_absent, subjects_df):
    # GPA = (8*4 + 6*3) / (4+3) = (32+18)/7 ≈ 7.14
    gpa = compute_gpa("C001", current_df_absent, subjects_df)
    assert gpa == round((8*4 + 6*3) / 7, 2)


def test_gpa_unknown_student_returns_none(current_df_pass, subjects_df):
    gpa = compute_gpa("NOBODY", current_df_pass, subjects_df)
    assert gpa is None


# ── CGPA / TGP Tests ──────────────────────────────────────────────────────────

def test_cgpa_no_history(current_df_pass, subjects_df, empty_historical):
    cgpa, tgp = compute_cgpa_and_tgp("A001", empty_historical, subjects_df, current_df_pass, 8)
    # TGP = 10*4 + 9*3 + 7*3 = 88
    assert tgp == 88
    assert cgpa == 8.8


def test_cgpa_with_cleared_arrear(current_df_pass, subjects_df, historical_with_cleared_arrear):
    # A001 also has CS50 cleared at 6.0 (no credits in subjects_df, ignored safely)
    cgpa, tgp = compute_cgpa_and_tgp("A001", historical_with_cleared_arrear, subjects_df, current_df_pass, 8)
    # CS50 not in subjects_df so credits=0 — won't affect, just shouldn't crash
    assert cgpa is not None


# ── Pass / Fail Tests ─────────────────────────────────────────────────────────

def test_current_pass_true(current_df_pass):
    assert is_current_pass("A001", current_df_pass) is True


def test_current_pass_fail(current_df_fail):
    assert is_current_pass("B001", current_df_fail) is False


def test_overall_pass_clean_student(current_df_pass, empty_historical):
    assert is_overall_pass("A001", current_df_pass, empty_historical) is True


def test_overall_pass_pending_arrear(current_df_pass, historical_with_pending_arrear):
    """A001 passes current sem but has a pending historical arrear."""
    assert is_overall_pass("A001", current_df_pass, historical_with_pending_arrear) is False


def test_overall_pass_cleared_arrear(current_df_pass, historical_with_cleared_arrear):
    """A001 passes current sem and their historical arrear is cleared."""
    assert is_overall_pass("A001", current_df_pass, historical_with_cleared_arrear) is True


# ── Arrear History Tests ──────────────────────────────────────────────────────

def test_no_arrear_history(empty_historical):
    assert has_history_of_arrears("A001", empty_historical) is False


def test_has_arrear_history(historical_with_cleared_arrear):
    assert has_history_of_arrears("A001", historical_with_cleared_arrear) is True


def test_pending_arrears_zero_when_cleared(historical_with_cleared_arrear):
    assert get_total_pending_arrears("A001", historical_with_cleared_arrear) == 0


def test_pending_arrears_positive_when_not_cleared(historical_with_pending_arrear):
    assert get_total_pending_arrears("A001", historical_with_pending_arrear) == 1


# ── Build Metrics Integration Test ────────────────────────────────────────────

def test_build_student_metrics():
    students = pd.DataFrame([
        {"register_no": "A001", "name": "Alice", "section": "A", "batch": "2021-25", "lateral_entry": False},
        {"register_no": "B001", "name": "Bob", "section": "B", "batch": "2021-25", "lateral_entry": False},
    ])
    subjects = pd.DataFrame([
        {"subject_code": "CS01", "subject_name": "Math", "semester": 8, "credits": 4},
    ])
    current = pd.DataFrame([
        {"register_no": "A001", "subject_code": "CS01", "grade": "O", "grade_point": 10.0, "absent": False},
        {"register_no": "B001", "subject_code": "CS01", "grade": "RA", "grade_point": 0.0, "absent": False},
    ])
    historical = pd.DataFrame(columns=["register_no", "semester", "subject_code", "grade_point", "arrear"])

    metrics = build_student_metrics(students, current, historical, subjects, 8)

    alice = metrics[metrics["register_no"] == "A001"].iloc[0]
    bob = metrics[metrics["register_no"] == "B001"].iloc[0]

    assert alice["current_pass"] == True
    assert alice["overall_pass"] == True
    assert alice["gpa"] == 10.0

    assert bob["current_pass"] == False
    assert bob["overall_pass"] == False
    assert bob["pending_arrears"] >= 1
