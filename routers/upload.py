"""
routers/upload.py
-----------------
POST endpoints for uploading the 4 Excel input files.
Each endpoint parses the file and stores the DataFrame in the global store.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from services.parser import (
    parse_students,
    parse_subjects,
    parse_current_results,
    parse_historical_results,
)
from store import store

router = APIRouter(prefix="/upload", tags=["Upload"])


def _ok(msg: str, rows: int) -> dict:
    return {"status": "ok", "message": msg, "rows_loaded": rows}


@router.post("/students")
async def upload_students(file: UploadFile = File(...)):
    """Upload students.xlsx — columns: register_no, name, section, batch, lateral_entry"""
    try:
        df = parse_students(file.file)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    store.students = df
    store.invalidate_cache()
    return _ok("Students uploaded", len(df))


@router.post("/subjects")
async def upload_subjects(file: UploadFile = File(...)):
    """Upload subjects.xlsx — columns: subject_code, subject_name, semester, credits, staff_a/b/c"""
    try:
        df = parse_subjects(file.file)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    store.subjects = df
    store.invalidate_cache()
    return _ok("Subjects uploaded", len(df))


@router.post("/current-results")
async def upload_current_results(
    file: UploadFile = File(...),
    semester: int = Query(8, description="Current semester number (1-8)"),
):
    """Upload current_sem_results.xlsx — columns: register_no, subject_code, grade"""
    try:
        df = parse_current_results(file.file)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    store.current_results = df
    store.current_sem = semester
    store.invalidate_cache()
    return _ok("Current results uploaded", len(df))


@router.post("/historical-results")
async def upload_historical_results(file: UploadFile = File(...)):
    """Upload historical_results.xlsx — columns: register_no, semester, subject_code, grade_point, arrear"""
    try:
        df = parse_historical_results(file.file)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    store.historical_results = df
    store.invalidate_cache()
    return _ok("Historical results uploaded", len(df))


@router.get("/status")
async def upload_status():
    """Check which files have been uploaded."""
    return {
        "students": store.students is not None,
        "subjects": store.subjects is not None,
        "current_results": store.current_results is not None,
        "historical_results": store.historical_results is not None,
        "ready": store.is_ready(),
        "current_semester": store.current_sem,
    }
