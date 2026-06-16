import { useState, useEffect } from 'react';
import './index.css';
import { getStatus } from './api';
import Dashboard   from './pages/Dashboard';
import UploadPage  from './pages/Upload';
import Form1A      from './pages/Form1A';
import Form1B      from './pages/Form1B';
import Form1E      from './pages/Form1E';
import Form2       from './pages/Form2';
import { Form3A, Form3B } from './pages/Form3';
import Form4A      from './pages/Form4A';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getStatus().then(r => setReady(r.data.ready)).catch(() => {});
  }, []);

  const nav = (key) => {
    setPage(key);
    if (key === 'upload' || key === 'dashboard') {
      getStatus().then(r => setReady(r.data.ready)).catch(() => {});
    }
  };

  const PAGES = {
    dashboard: <Dashboard />,
    upload:    <UploadPage />,
    form1a:    <Form1A />,
    form1b:    <Form1B />,
    form1e:    <Form1E />,
    form2:     <Form2 />,
    form3a:    <Form3A />,
    form3b:    <Form3B />,
    form4a:    <Form4A />,
  };

  const Link = ({ id, label, badge }) => (
    <button className={`nav-link ${page === id ? 'active' : ''}`} onClick={() => nav(id)}>
      {label}
      {badge && <span className="badge">{badge}</span>}
    </button>
  );

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>SJCE Result Automation</h2>
          <p>CSE Dept · APR/MAY 2025</p>
        </div>
        <div className="sidebar-section">Navigation</div>
        <Link id="dashboard" label="🏠 Dashboard" />
        <Link id="upload"    label="📤 Upload Data" badge={ready ? '✓' : '!'} />
        <div className="sidebar-section">Forms</div>
        <Link id="form1a" label="Form 1A — Sem Performance" />
        <Link id="form1b" label="Form 1B — Subject Summary" />
        <Link id="form1e" label="Form 1E — Result Analysis" />
        <Link id="form2"  label="Form 2  — Section Summary" />
        <Link id="form3a" label="Form 3A — All-Section Rank" />
        <Link id="form3b" label="Form 3B — Section Rank" />
        <Link id="form4a" label="Form 4A — Arrear History" />
        <div style={{ marginTop:'auto', padding:'16px 20px', color:'rgba(255,255,255,.25)', fontSize:11 }}>
          {ready ? '🟢 Data loaded' : '🔴 No data uploaded'}
        </div>
      </aside>
      <main className="main">
        {PAGES[page]}
      </main>
    </div>
  );
}
