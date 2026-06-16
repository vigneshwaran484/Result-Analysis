import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000' });

/* ── Upload endpoints ──────────────────────────── */
export const uploadStudents    = (file) => { const fd = new FormData(); fd.append('file', file); return API.post('/upload/students', fd); };
export const uploadSubjects    = (file) => { const fd = new FormData(); fd.append('file', file); return API.post('/upload/subjects', fd); };
export const uploadCurrentResults = (file, semester = 8) => { const fd = new FormData(); fd.append('file', file); return API.post(`/upload/current-results?semester=${semester}`, fd); };
export const uploadHistorical  = (file) => { const fd = new FormData(); fd.append('file', file); return API.post('/upload/historical-results', fd); };
export const getStatus         = ()     => API.get('/upload/status');

/* ── Form endpoints ────────────────────────────── */
export const getForm1A  = ()        => API.get('/forms/1a');
export const getForm1B  = ()        => API.get('/forms/1b');
export const getForm1F  = (section) => API.get(`/forms/1f/${section}`);
export const getForm1E  = ()        => API.get('/forms/1e');
export const getForm2   = ()        => API.get('/forms/2');
export const getForm3A  = ()        => API.get('/forms/3a');
export const getForm3B  = (section) => API.get(`/forms/3b/${section}`);
export const getForm4A  = ()        => API.get('/forms/4a');
