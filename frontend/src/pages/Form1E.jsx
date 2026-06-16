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

  const chartData = (data.semester_wise || []).map(s => ({
    name: `Sem ${s.semester}`,
    pass_pct: Math.round((s.overall_pass / s.total_strength) * 100) || 0,
    passed: s.overall_pass,
  }));

  const COLORS = ['#6366f1', '#818cf8', '#a78bfa', '#c4b5fd', '#3b82f6', '#60a5fa', '#22c55e', '#f59e0b'];

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Form 1E — Result Analysis</h1>
          <p>Semester-wise and year-wise performance breakdown</p>
        </div>
        <button className="btn btn-secondary btn-sm print-btn" onClick={() => window.print()}>🖨 Print</button>
      </div>

      <div className="chart-container">
        <div className="chart-title">Semester-wise Overall Pass Percentage</div>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: '#1c1f2e', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8, color: '#e2e8f0', fontSize: 13 }}
              formatter={(value) => [`${value}%`, 'Overall Pass %']}
            />
            <Bar dataKey="pass_pct" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3 style={{ marginBottom: 16 }}>Semester-wise Data</h3>
      <div className="table-wrap mb-24">
        <table>
          <thead>
            <tr>
              <th>Semester</th>
              <th className="num">Total Strength</th>
              <th className="num">Current Pass</th>
              <th className="num">Overall Pass</th>
              <th className="num">Without Arrear History</th>
              <th className="num">With Arrear History</th>
              <th className="num">Total Arrears</th>
            </tr>
          </thead>
          <tbody>
            {(data.semester_wise || []).map((s, i) => (
              <tr key={i}>
                <td>Sem {s.semester}</td>
                <td className="num">{s.total_strength}</td>
                <td className="num">{s.current_pass}</td>
                <td className="num" style={{ color: 'var(--success)', fontWeight: 600 }}>{s.overall_pass}</td>
                <td className="num">{s.without_history_of_arrears}</td>
                <td className="num">{s.with_history_of_arrears}</td>
                <td className="num" style={{ color: s.arrear_count > 0 ? 'var(--danger)' : 'inherit' }}>{s.arrear_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginBottom: 16 }}>Year-wise Data</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th className="num">Total Strength</th>
              <th className="num">Current Pass</th>
              <th className="num">Overall Pass</th>
              <th className="num">Without Arrear History</th>
              <th className="num">With Arrear History</th>
              <th className="num">Total Arrears</th>
            </tr>
          </thead>
          <tbody>
            {(data.year_wise || []).map((y, i) => (
              <tr key={i}>
                <td>{y.label}</td>
                <td className="num">{y.total_strength}</td>
                <td className="num">{y.current_pass}</td>
                <td className="num" style={{ color: 'var(--success)', fontWeight: 600 }}>{y.overall_pass}</td>
                <td className="num">{y.without_history_of_arrears}</td>
                <td className="num">{y.with_history_of_arrears}</td>
                <td className="num" style={{ color: y.arrear_count > 0 ? 'var(--danger)' : 'inherit' }}>{y.arrear_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
