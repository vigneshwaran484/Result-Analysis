import { useState, useEffect, useRef } from 'react';
import { uploadStudents, uploadSubjects, uploadCurrentResults, uploadHistorical, getStatus } from '../api';

const CARDS = [
  { key: 'students',           label: 'Students',           icon: '👩‍🎓', desc: 'students.xlsx — register_no, name, section, batch, lateral_entry',         fn: uploadStudents },
  { key: 'subjects',           label: 'Subjects',           icon: '📚', desc: 'subjects.xlsx — subject_code, subject_name, semester, credits, staff',      fn: uploadSubjects },
  { key: 'current_results',    label: 'Current Results',    icon: '📝', desc: 'current_sem_results.xlsx — register_no, subject_code, grade',                fn: uploadCurrentResults },
  { key: 'historical_results', label: 'Historical Results', icon: '📊', desc: 'historical_results.xlsx — register_no, semester, subject_code, grade_point', fn: uploadHistorical },
];

export default function UploadPage() {
  const [status, setStatus] = useState({});
  const [msgs, setMsgs] = useState({});
  const refs = useRef({});

  const refresh = () => getStatus().then(r => setStatus(r.data)).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const handle = async (card, file) => {
    if (!file) return;
    setMsgs(p => ({ ...p, [card.key]: { type: 'info', text: 'Uploading…' } }));
    try {
      const res = await card.fn(file);
      setMsgs(p => ({ ...p, [card.key]: { type: 'ok', text: `✔ ${res.data.message} (${res.data.rows_loaded} rows)` } }));
      refresh();
    } catch (e) {
      const detail = e.response?.data?.detail || e.message;
      setMsgs(p => ({ ...p, [card.key]: { type: 'err', text: `✘ ${detail}` } }));
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Upload Data</h1>
        <p>Upload your 4 Excel files to generate all result forms.</p>
      </div>

      <div className="upload-grid">
        {CARDS.map(c => (
          <div
            key={c.key}
            className={`upload-card ${status[c.key] ? 'done' : ''}`}
            onClick={() => refs.current[c.key]?.click()}
          >
            <input
              ref={el => refs.current[c.key] = el}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={e => handle(c, e.target.files[0])}
            />
            <div className="icon">{c.icon}</div>
            <h3>{c.label}</h3>
            <p>{c.desc}</p>
            <span className={`status-tag ${status[c.key] ? 'ok' : 'pending'}`}>
              {status[c.key] ? '✔ Uploaded' : 'Click to upload'}
            </span>
            {msgs[c.key] && (
              <p style={{
                marginTop: 8,
                fontSize: '0.78rem',
                fontWeight: 600,
                color: msgs[c.key].type === 'ok' ? 'var(--success)' :
                       msgs[c.key].type === 'err' ? 'var(--danger)' : 'var(--info)',
              }}>
                {msgs[c.key].text}
              </p>
            )}
          </div>
        ))}
      </div>

      {status.ready && (
        <div className="card" style={{ borderColor: 'var(--success)', background: 'var(--success-bg)' }}>
          <p style={{ color: 'var(--success)', fontWeight: 600 }}>
            🟢 All 4 files uploaded — Semester {status.current_semester}. Navigate to any Form in the sidebar!
          </p>
        </div>
      )}
    </>
  );
}
