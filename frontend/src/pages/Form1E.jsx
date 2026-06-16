import { useState, useEffect } from 'react';
import { getForm1E } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Form1E() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    getForm1E()
      .then(r => setData(r.data))
      .catch(e => setErr(e.response?.data?.detail || 'Failed to load Form 1E'));
  }, []);

  if (err) return <div className="error-state"><p>{err}</p></div>;
  if (!data) return <div className="loading-state"><div className="spinner" /><p>Loading Form 1E…</p></div>;

  const chartData = (data.subjects || []).map(s => ({
    name: s.subject_code,
    pass_pct: s.pass_pct,
    passed: s.passed,
    failed: s.failed,
  }));

  const COLORS = ['#6366f1', '#818cf8', '#a78bfa', '#c4b5fd', '#3b82f6', '#60a5fa', '#22c55e', '#f59e0b'];

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Form 1E — Result Analysis</h1>
          <p>Visual analysis with charts and data table</p>
        </div>
        <button className="btn btn-secondary btn-sm print-btn" onClick={() => window.print()}>🖨 Print</button>
      </div>

      {data.summary && (
        <div className="stat-grid">
          <div className="stat-card accent">
            <div className="stat-label">Total Strength</div>
            <div className="stat-value">{data.summary.total_strength}</div>
          </div>
          <div className="stat-card success">
            <div className="stat-label">Current Pass %</div>
            <div className="stat-value">{data.summary.current_pass_pct}%</div>
            <div className="stat-sub">{data.summary.current_pass} / {data.summary.total_strength}</div>
          </div>
          <div className="stat-card success">
            <div className="stat-label">Overall Pass %</div>
            <div className="stat-value">{data.summary.overall_pass_pct}%</div>
            <div className="stat-sub">{data.summary.overall_pass} / {data.summary.total_strength}</div>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="chart-container">
          <div className="chart-title">Subject-wise Pass Percentage</div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: '#1c1f2e',
                  border: '1px solid rgba(148,163,184,0.15)',
                  borderRadius: 8,
                  color: '#e2e8f0',
                  fontSize: 13,
                }}
              />
              <Bar dataKey="pass_pct" name="Pass %" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.subjects && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Code</th>
                <th>Subject</th>
                <th className="num">Attended</th>
                <th className="num">Passed</th>
                <th className="num">Failed</th>
                <th className="num">Pass %</th>
              </tr>
            </thead>
            <tbody>
              {data.subjects.map((s, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td style={{ fontFamily: 'monospace' }}>{s.subject_code}</td>
                  <td>{s.subject_name}</td>
                  <td className="num">{s.attended}</td>
                  <td className="num" style={{ color: 'var(--success)' }}>{s.passed}</td>
                  <td className="num" style={{ color: s.failed > 0 ? 'var(--danger)' : 'inherit' }}>{s.failed}</td>
                  <td className="num">
                    <span className={`tag ${s.pass_pct >= 80 ? 'tag-pass' : 'tag-fail'}`}>{s.pass_pct}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
