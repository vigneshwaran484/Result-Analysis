import { useState, useEffect } from 'react';
import { getForm1B } from '../api';

export default function Form1B() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    getForm1B()
      .then(r => setData(r.data))
      .catch(e => setErr(e.response?.data?.detail || 'Failed to load Form 1B'));
  }, []);

  if (err) return <div className="error-state"><p>{err}</p></div>;
  if (!data) return <div className="loading-state"><div className="spinner" /><p>Loading Form 1B…</p></div>;

  const summary = data.summary;

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Form 1B — Subject-wise Result Summary</h1>
          <p>All sections combined</p>
        </div>
        <button className="btn btn-secondary btn-sm print-btn" onClick={() => window.print()}>🖨 Print</button>
      </div>

      <div className="stat-grid">
        <div className="stat-card accent">
          <div className="stat-label">Total Strength</div>
          <div className="stat-value">{summary.total_strength}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Current Pass</div>
          <div className="stat-value">{summary.current_pass}</div>
          <div className="stat-sub">{summary.current_pass_pct}%</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Overall Pass</div>
          <div className="stat-value">{summary.overall_pass}</div>
          <div className="stat-sub">{summary.overall_pass_pct}%</div>
        </div>
      </div>

      {/* Section breakdown */}
      {data.section_stats && (
        <div className="stat-grid mb-24">
          {Object.entries(data.section_stats).map(([sec, s]) => (
            <div key={sec} className="stat-card">
              <div className="stat-label">Section {sec}</div>
              <div className="stat-sub">Strength: {s.strength} · Pass: {s.current_pass} ({s.current_pass_pct}%) · Overall: {s.overall_pass} ({s.overall_pass_pct}%)</div>
            </div>
          ))}
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Code</th>
              <th>Subject</th>
              <th>Staff</th>
              <th className="num">Attended</th>
              <th className="num">Absent</th>
              <th className="num">Passed</th>
              <th className="num">Failed</th>
              <th className="num">Pass %</th>
              <th>Topper(s)</th>
            </tr>
          </thead>
          <tbody>
            {data.subjects.map((s, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td style={{ fontFamily: 'monospace', fontWeight: 500 }}>{s.subject_code}</td>
                <td>{s.subject_name}</td>
                <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {typeof s.staff === 'object'
                    ? Object.entries(s.staff).map(([k, v]) => v ? `${k}: ${v}` : null).filter(Boolean).join(' · ')
                    : s.staff}
                </td>
                <td className="num">{s.attended}</td>
                <td className="num">{s.absentees}</td>
                <td className="num" style={{ color: 'var(--success)' }}>{s.passed}</td>
                <td className="num" style={{ color: s.failed > 0 ? 'var(--danger)' : 'inherit' }}>{s.failed}</td>
                <td className="num">
                  <span className={`tag ${s.pass_pct >= 80 ? 'tag-pass' : 'tag-fail'}`}>{s.pass_pct}%</span>
                </td>
                <td style={{ fontSize: '0.78rem' }}>{s.topper_names?.join(', ') || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
