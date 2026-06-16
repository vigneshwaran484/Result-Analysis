import { useState, useEffect } from 'react';
import { getStatus } from '../api';

export default function Dashboard() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getStatus().then(r => setStatus(r.data)).catch(() => {});
  }, []);

  return (
    <>
      <div className="dashboard-hero">
        <h1>University Result Automation</h1>
        <p>
          Automates generation of all 7 university exam result forms
          (1A, 1B, 1E, 2, 3A, 3B, 4A) for St. Joseph's College of Engineering,
          CSE Department — April / May 2025 examinations.
        </p>
      </div>

      <div className="stat-grid">
        <div className={`stat-card ${status?.students ? 'success' : 'warning'}`}>
          <div className="stat-label">Students</div>
          <div className="stat-value">{status?.students ? '✔' : '—'}</div>
          <div className="stat-sub">{status?.students ? 'Uploaded' : 'Not uploaded'}</div>
        </div>
        <div className={`stat-card ${status?.subjects ? 'success' : 'warning'}`}>
          <div className="stat-label">Subjects</div>
          <div className="stat-value">{status?.subjects ? '✔' : '—'}</div>
          <div className="stat-sub">{status?.subjects ? 'Uploaded' : 'Not uploaded'}</div>
        </div>
        <div className={`stat-card ${status?.current_results ? 'success' : 'warning'}`}>
          <div className="stat-label">Current Results</div>
          <div className="stat-value">{status?.current_results ? '✔' : '—'}</div>
          <div className="stat-sub">{status?.current_results ? 'Uploaded' : 'Not uploaded'}</div>
        </div>
        <div className={`stat-card ${status?.historical_results ? 'success' : 'warning'}`}>
          <div className="stat-label">Historical Results</div>
          <div className="stat-value">{status?.historical_results ? '✔' : '—'}</div>
          <div className="stat-sub">{status?.historical_results ? 'Uploaded' : 'Not uploaded'}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ color: 'var(--text-heading)', marginBottom: 12, fontWeight: 700 }}>Quick Start</h3>
        <ol style={{ paddingLeft: 20, color: 'var(--text-secondary)', lineHeight: 2.2 }}>
          <li>Click <strong>📤 Upload Data</strong> in the sidebar</li>
          <li>Upload all 4 Excel files (students, subjects, current results, historical results)</li>
          <li>Navigate to any <strong>Form</strong> to view generated results</li>
          <li>Use <strong>Print / Save PDF</strong> on any form page for a printable version</li>
        </ol>
        {status?.ready && (
          <div style={{ marginTop: 16, padding: '10px 16px', background: 'var(--success-bg)', borderRadius: 'var(--radius-sm)', color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem' }}>
            🟢 All data loaded — Semester {status.current_semester}. You're ready to generate forms!
          </div>
        )}
      </div>
    </>
  );
}
