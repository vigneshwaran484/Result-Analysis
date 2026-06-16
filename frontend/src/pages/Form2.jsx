import { useState, useEffect } from 'react';
import { getForm2 } from '../api';

export default function Form2() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    getForm2()
      .then(r => setData(r.data))
      .catch(e => setErr(e.response?.data?.detail || 'Failed to load Form 2'));
  }, []);

  if (err) return <div className="error-state"><p>{err}</p></div>;
  if (!data) return <div className="loading-state"><div className="spinner" /><p>Loading Form 2…</p></div>;

  const sections = data.sections || [];
  const combined = data.combined;

  const Row = ({ label, section }) => (
    <tr>
      <td style={{ fontWeight: 600 }}>{label}</td>
      <td className="num">{section.total_strength ?? section.strength ?? '—'}</td>
      <td className="num" style={{ color: 'var(--success)' }}>{section.current_pass}</td>
      <td className="num">{section.current_pass_pct}%</td>
      <td className="num" style={{ color: 'var(--success)' }}>{section.overall_pass}</td>
      <td className="num">{section.overall_pass_pct}%</td>
      <td className="num">{section.with_arrear_history ?? '—'}</td>
      <td className="num">{section.without_arrear_history ?? '—'}</td>
    </tr>
  );

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Form 2 — Section Summary</h1>
          <p>Combined and per-section pass/fail statistics</p>
        </div>
        <button className="btn btn-secondary btn-sm print-btn" onClick={() => window.print()}>🖨 Print</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Section</th>
              <th className="num">Strength</th>
              <th className="num">Current Pass</th>
              <th className="num">Pass %</th>
              <th className="num">Overall Pass</th>
              <th className="num">Overall %</th>
              <th className="num">With Arrear History</th>
              <th className="num">Without Arrear History</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((sec, i) => (
              <Row key={i} label={`Section ${sec.section}`} section={sec} />
            ))}
            {combined && (
              <tr style={{ background: 'rgba(99,102,241,0.06)', fontWeight: 700 }}>
                <td style={{ fontWeight: 700 }}>Combined</td>
                <td className="num">{combined.total_strength ?? combined.strength ?? '—'}</td>
                <td className="num">{combined.current_pass}</td>
                <td className="num">{combined.current_pass_pct}%</td>
                <td className="num">{combined.overall_pass}</td>
                <td className="num">{combined.overall_pass_pct}%</td>
                <td className="num">{combined.with_arrear_history ?? '—'}</td>
                <td className="num">{combined.without_arrear_history ?? '—'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
