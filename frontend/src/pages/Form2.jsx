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

  const sections = data.sections || {};
  const combined = data.combined;

  const Row = ({ label, section }) => (
    <tr>
      <td style={{ fontWeight: 600 }}>{label}</td>
      <td className="num">{section.total_strength}</td>
      <td className="num" style={{ color: 'var(--success)' }}>{section.current_pass}</td>
      <td className="num">{section.current_pass_pct}%</td>
      <td className="num" style={{ color: 'var(--success)', fontWeight: 600 }}>{section.overall_pass}</td>
      <td className="num" style={{ fontWeight: 600 }}>{section.overall_pass_pct}%</td>
      <td className="num">{section.students_with_1_arrear}</td>
      <td className="num">{section.pass_pct_incl_1_arrear}%</td>
      <td className="num">{section.students_with_1_2_arrear}</td>
      <td className="num">{section.pass_pct_incl_1_2_arrear}%</td>
      <td className="num">{section.students_with_1_2_3_arrear}</td>
      <td className="num">{section.pass_pct_incl_1_2_3_arrear}%</td>
    </tr>
  );

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Form 2 — Section Summary</h1>
          <p>Combined and per-section pass percentages including arrear grace bounds</p>
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
              <th className="num">Curr Pass %</th>
              <th className="num">Overall Pass</th>
              <th className="num">Overall Pass %</th>
              <th className="num">1 Arrear</th>
              <th className="num">Pass % (incl 1)</th>
              <th className="num">≤ 2 Arrears</th>
              <th className="num">Pass % (incl ≤ 2)</th>
              <th className="num">≤ 3 Arrears</th>
              <th className="num">Pass % (incl ≤ 3)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(sections).map(([secLabel, secData]) => (
              <Row key={secLabel} label={`Section ${secLabel}`} section={secData} />
            ))}
            {combined && (
              <tr style={{ background: 'rgba(99,102,241,0.06)' }}>
                <td style={{ fontWeight: 700 }}>Combined</td>
                <td className="num">{combined.total_strength}</td>
                <td className="num" style={{ color: 'var(--success)' }}>{combined.current_pass}</td>
                <td className="num">{combined.current_pass_pct}%</td>
                <td className="num" style={{ color: 'var(--success)', fontWeight: 700 }}>{combined.overall_pass}</td>
                <td className="num" style={{ fontWeight: 700 }}>{combined.overall_pass_pct}%</td>
                <td className="num">{combined.students_with_1_arrear}</td>
                <td className="num">{combined.pass_pct_incl_1_arrear}%</td>
                <td className="num">{combined.students_with_1_2_arrear}</td>
                <td className="num">{combined.pass_pct_incl_1_2_arrear}%</td>
                <td className="num">{combined.students_with_1_2_3_arrear}</td>
                <td className="num">{combined.pass_pct_incl_1_2_3_arrear}%</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
