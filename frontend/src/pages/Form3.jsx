import { useState, useEffect } from 'react';
import { getForm3A, getForm3B } from '../api';

/* ═══ Form 3A — All-section ranklist ═══ */
export function Form3A() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [view, setView] = useState('current');

  useEffect(() => {
    getForm3A()
      .then(r => setData(r.data))
      .catch(e => setErr(e.response?.data?.detail || 'Failed to load Form 3A'));
  }, []);

  if (err) return <div className="error-state"><p>{err}</p></div>;
  if (!data) return <div className="loading-state"><div className="spinner" /><p>Loading Form 3A…</p></div>;

  const list = view === 'current' ? data.current_sem : data.overall;

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Form 3A — All-Section Ranklist</h1>
          <p>Top performers across all sections</p>
        </div>
        <button className="btn btn-secondary btn-sm print-btn" onClick={() => window.print()}>🖨 Print</button>
      </div>

      <div className="stat-grid">
        <div className="stat-card accent">
          <div className="stat-label">Avg GPA (Current)</div>
          <div className="stat-value">{data.avg_gpa}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Avg CGPA (Overall)</div>
          <div className="stat-value">{data.avg_cgpa}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total GP</div>
          <div className="stat-value font-mono">{data.total_gp}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total TGP</div>
          <div className="stat-value font-mono">{data.total_tgp}</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${view === 'current' ? 'active' : ''}`} onClick={() => setView('current')}>Current Sem</button>
        <button className={`tab ${view === 'overall' ? 'active' : ''}`} onClick={() => setView('overall')}>Overall (CGPA)</button>
      </div>

      <RankTable list={list} view={view} />
    </>
  );
}

/* ═══ Form 3B — Section ranklist ═══ */
export function Form3B() {
  const [section, setSection] = useState('A');
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [view, setView] = useState('current');

  useEffect(() => {
    setData(null);
    setErr('');
    getForm3B(section)
      .then(r => setData(r.data))
      .catch(e => setErr(e.response?.data?.detail || 'Failed to load Form 3B'));
  }, [section]);

  if (err) return <div className="error-state"><p>{err}</p></div>;

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Form 3B — Section Ranklist</h1>
          <p>Top performers in Section {section}</p>
        </div>
        <button className="btn btn-secondary btn-sm print-btn" onClick={() => window.print()}>🖨 Print</button>
      </div>

      <div className="tabs mb-24">
        {['A', 'B', 'C'].map(s => (
          <button key={s} className={`tab ${section === s ? 'active' : ''}`} onClick={() => setSection(s)}>
            Section {s}
          </button>
        ))}
      </div>

      {!data ? (
        <div className="loading-state"><div className="spinner" /><p>Loading…</p></div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card accent">
              <div className="stat-label">Avg GPA</div>
              <div className="stat-value">{data.avg_gpa}</div>
            </div>
            <div className="stat-card success">
              <div className="stat-label">Avg CGPA</div>
              <div className="stat-value">{data.avg_cgpa}</div>
            </div>
          </div>

          <div className="tabs">
            <button className={`tab ${view === 'current' ? 'active' : ''}`} onClick={() => setView('current')}>Current Sem</button>
            <button className={`tab ${view === 'overall' ? 'active' : ''}`} onClick={() => setView('overall')}>Overall (CGPA)</button>
          </div>

          <RankTable list={view === 'current' ? data.current_sem : data.overall} view={view} />
        </>
      )}
    </>
  );
}

/* ═══ Shared rank table component ═══ */
function RankTable({ list, view }) {
  if (!list || list.length === 0) return <div className="empty-state"><div className="empty-icon">📋</div><p>No ranked students found</p></div>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th className="num">Rank</th>
            <th>Register No</th>
            <th>Name</th>
            <th>Section</th>
            <th className="num">{view === 'current' ? 'GP' : 'TGP'}</th>
            <th className="num">{view === 'current' ? 'GPA' : 'CGPA'}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((s, i) => (
            <tr key={i}>
              <td className="num" style={{ fontWeight: 700, color: i < 3 ? 'var(--warning)' : 'inherit' }}>
                {s.rank}
              </td>
              <td style={{ fontFamily: 'monospace' }}>{s.register_no}</td>
              <td>{s.name}</td>
              <td>{s.section}</td>
              <td className="num font-mono">{view === 'current' ? s.gp : s.tgp}</td>
              <td className="num" style={{ fontWeight: 600, color: 'var(--accent-light)' }}>
                {view === 'current' ? s.gpa : s.cgpa}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
