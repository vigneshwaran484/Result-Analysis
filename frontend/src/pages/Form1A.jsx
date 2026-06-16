import { useState, useEffect } from 'react';
import { getForm1A } from '../api';

export default function Form1A() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    getForm1A()
      .then(r => setData(r.data))
      .catch(e => setErr(e.response?.data?.detail || 'Failed to load Form 1A'));
  }, []);

  if (err) return <div className="error-state"><p>{err}</p></div>;
  if (!data) return <div className="loading-state"><div className="spinner" /><p>Loading Form 1A…</p></div>;

  const sems = data.semesters;
  const roman = (n) => ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][n] || n;

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Form 1A — Semester Wise Performance</h1>
          <p>Pass count matrix across semesters (Current Sem {data.current_semester})</p>
        </div>
        <button className="btn btn-secondary btn-sm print-btn" onClick={() => window.print()}>🖨 Print</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Batch / Semester</th>
              {sems.map(s => <th key={s} className="num">Sem {roman(s)}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.matrix.map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{row.row}</td>
                {sems.map(s => (
                  <td key={s} className="num">
                    {row[`sem_${s}`] != null ? row[`sem_${s}`] : '—'}
                  </td>
                ))}
              </tr>
            ))}
            <tr style={{ background: 'rgba(99,102,241,0.06)', fontWeight: 700 }}>
              <td>{data.total_row.row}</td>
              {sems.map(s => (
                <td key={s} className="num">{data.total_row[`sem_${s}`]}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
