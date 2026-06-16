import { useState, useEffect } from 'react';
import { getForm4A } from '../api';

export default function Form4A() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getForm4A()
      .then(r => setData(r.data))
      .catch(e => setErr(e.response?.data?.detail || 'Failed to load Form 4A'));
  }, []);

  if (err) return <div className="error-state"><p>{err}</p></div>;
  if (!data) return <div className="loading-state"><div className="spinner" /><p>Loading Form 4A…</p></div>;

  const students = (data.students || []).filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.register_no?.toLowerCase().includes(q) || s.name?.toLowerCase().includes(q);
  });

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Form 4A — Arrear History</h1>
          <p>Students with current or historical arrears</p>
        </div>
        <button className="btn btn-secondary btn-sm print-btn" onClick={() => window.print()}>🖨 Print</button>
      </div>

      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search by name or register number…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>{search ? 'No students match your search' : 'No arrear data found'}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Register No</th>
                <th>Name</th>
                <th>Section</th>
                <th className="num">Pending Arrears</th>
                <th className="num">Current Sem Arrears</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td style={{ fontFamily: 'monospace' }}>{s.register_no}</td>
                  <td>{s.name}</td>
                  <td>{s.section}</td>
                  <td className="num">{s.pending_arrears ?? '—'}</td>
                  <td className="num">{s.current_arrears ?? '—'}</td>
                  <td>
                    <span className={`tag ${(s.pending_arrears || 0) + (s.current_arrears || 0) === 0 ? 'tag-pass' : 'tag-fail'}`}>
                      {(s.pending_arrears || 0) + (s.current_arrears || 0) === 0 ? 'Cleared' : 'Arrears'}
                    </span>
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
