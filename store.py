"""
store.py — Simple in-memory store for parsed DataFrames.

In production you would persist to the DB and query from it.
This pattern lets us keep the backend stateless-friendly:
upload once → derive all 7 forms from the same parsed data in memory.
"""
import pandas as pd
from typing import Optional


class DataStore:
    def __init__(self):
        self.students: Optional[pd.DataFrame] = None
        self.subjects: Optional[pd.DataFrame] = None
        self.current_results: Optional[pd.DataFrame] = None
        self.historical_results: Optional[pd.DataFrame] = None
        self.current_sem: int = 8          # default semester; overridable at upload
        self._metrics: Optional[pd.DataFrame] = None  # cached after first build

    def is_ready(self) -> bool:
        return all([
            self.students is not None,
            self.subjects is not None,
            self.current_results is not None,
            self.historical_results is not None,
        ])

    def invalidate_cache(self):
        self._metrics = None

    def get_metrics(self) -> pd.DataFrame:
        """Lazy-build and cache the student metrics DataFrame."""
        if self._metrics is None:
            if not self.is_ready():
                raise RuntimeError("Upload all 4 data files before generating forms.")
            from services.calculator import build_student_metrics
            self._metrics = build_student_metrics(
                self.students,
                self.current_results,
                self.historical_results,
                self.subjects,
                self.current_sem,
            )
        return self._metrics


# Single global instance (fine for a single-process server)
store = DataStore()
