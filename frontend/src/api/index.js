import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:8000" });

// ── Real API calls (uncomment when backend is ready) ──
// export const getForm2 = () => API.get("/forms/2");

// ── Mock data (use this until backend is ready) ──
export const mockForm2 = {
  combined: { total: 195, currentPass: 191, currentPassPct: 97.95, overallPass: 171, overallPassPct: 87.69, arr1: 3, arr1Pct: 89.23, arr2: 8, arr2Pct: 91.79, arr3: 10, arr3Pct: 92.82 },
  A: { total: 65, currentPass: 63, currentPassPct: 96.92, overallPass: 56, overallPassPct: 86.15, arr1: 0, arr1Pct: 86.15, arr2: 2, arr2Pct: 89.23, arr3: 2, arr3Pct: 89.23 },
  B: { total: 66, currentPass: 66, currentPassPct: 100, overallPass: 59, overallPassPct: 89.39, arr1: 1, arr1Pct: 90.90, arr2: 3, arr2Pct: 93.93, arr3: 4, arr3Pct: 95.45 },
  C: { total: 64, currentPass: 62, currentPassPct: 96.88, overallPass: 56, overallPassPct: 87.50, arr1: 2, arr1Pct: 90.63, arr2: 3, arr2Pct: 92.19, arr3: 4, arr3Pct: 93.75 },
};
