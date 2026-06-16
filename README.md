# University Result Automation System
### St. Joseph's College of Engineering — CSE Department

Automates all 7 university result forms (1A, 1B, 1E, 2, 3A, 3B, 4A) from 4 Excel files.

---

## How to Run

### Step 1 — Backend (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```

Backend runs at: **http://localhost:8000**
Interactive API docs: **http://localhost:8000/docs** ← use this without a frontend!

---

### Step 2 — Frontend (React + Vite)

Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## Using Without a Frontend

Open **http://localhost:8000/docs** in your browser.

You'll see a Swagger UI where you can:
1. Upload all 4 Excel files using the `/upload/*` endpoints (click → "Try it out" → choose file → Execute)
2. Call any form endpoint (`/forms/1a`, `/forms/2`, etc.) and see the JSON instantly

---

## Using the Web Dashboard

1. Open http://localhost:5173
2. Click **Upload Data** in the sidebar
3. Upload your 4 Excel files (drag & drop or click each card)
4. Navigate to any Form in the sidebar to view results
5. Click **Print / Save PDF** on any form page to get a printable version

---

## Input File Format

### students.xlsx
| register_no | name | section | batch | lateral_entry |
|-------------|------|---------|-------|---------------|
| 312321104044 | FLORANCE RITHI F | A | 2021-25 | No |

### subjects.xlsx
| subject_code | subject_name | semester | credits | staff_a | staff_b | staff_c |
|---|---|---|---|---|---|---|
| CS1815 | Software Quality Assurance | 8 | 3 | Mr. S. Niresh Kumar | Dr. C. Pandeeswaran | Dr. G. Brindha |

### current_sem_results.xlsx
| register_no | subject_code | grade |
|---|---|---|
| 312321104044 | CS1815 | O |

**Valid grades:** O, A+, A, B+, B, C, RA, U, AB (absent)

### historical_results.xlsx
| register_no | semester | subject_code | grade_point | arrear |
|---|---|---|---|---|
| 312321104003 | 2 | MA1102 | 0.0 | No |

---

## API Endpoints

```
POST  /upload/students              Upload students.xlsx
POST  /upload/subjects              Upload subjects.xlsx
POST  /upload/current-results       Upload current_sem_results.xlsx  (?semester=8)
POST  /upload/historical-results    Upload historical_results.xlsx
GET   /upload/status                Check what's been uploaded

GET   /forms/1a                     Semester-wise performance matrix
GET   /forms/1b                     Subject-wise result summary (all sections)
GET   /forms/1f/{section}           Subject-wise result summary (one section)
GET   /forms/1e                     Result analysis + chart data
GET   /forms/2                      Section summary (Combined + A/B/C)
GET   /forms/3a                     All-section ranklist
GET   /forms/3b/{section}           Section ranklist (A / B / C)
GET   /forms/4a                     Arrear history per student
```

---

## Running Tests

```bash
cd backend
pytest tests/ -v
```

22 tests covering:
- GPA / CGPA calculation
- Pass/fail classification
- Arrear pending / cleared logic
- All 4 upload endpoints
- Invalid file rejection

---

## Project Structure

```
backend/
├── main.py                  FastAPI app entry point
├── database.py              SQLite (swap to Supabase: change DATABASE_URL)
├── store.py                 In-memory DataFrame cache
├── requirements.txt
├── models/
│   ├── student.py
│   ├── subject.py
│   └── result.py
├── services/
│   ├── parser.py            Excel reader & validator
│   ├── calculator.py        GPA, CGPA, pass/fail, arrear logic
│   └── ranklist.py          Ranklist generator
├── routers/
│   ├── upload.py
│   ├── form1a.py
│   ├── form1b.py
│   ├── form1e.py
│   ├── form2.py
│   ├── form3.py
│   └── form4a.py
└── tests/
    ├── test_calculator.py
    └── test_upload.py

frontend/
├── src/
│   ├── api/index.js         All API calls
│   ├── components/index.jsx Shared UI components
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Upload.jsx
│   │   ├── Form1A.jsx
│   │   ├── Form1B.jsx
│   │   ├── Form1E.jsx       With Recharts bar charts
│   │   ├── Form2.jsx
│   │   ├── Form3.jsx        Form3A + Form3B
│   │   └── Form4A.jsx       With search filter
│   └── App.jsx              Sidebar + routing
└── package.json
```

---

## Tech Stack

**Backend:** FastAPI · Pandas · Openpyxl · SQLAlchemy · SQLite · Uvicorn · pytest

**Frontend:** React 18 · Vite · Recharts · Axios · Vanilla CSS

---

*Internal use — St. Joseph's College of Engineering, Batch 2021–25*
