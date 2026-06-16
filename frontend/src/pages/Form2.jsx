import { mockForm2 } from "../api/index";
import PrintButton from "../components/PrintButton";

const rows = [
  { label: "Total Strength",                      key: "total" },
  { label: "Current Pass",                         key: "currentPass" },
  { label: "Current Pass %",                       key: "currentPassPct" },
  { label: "Overall Pass",                         key: "overallPass" },
  { label: "Overall Pass %",                       key: "overallPassPct" },
  { label: "Number of Students with 1 Arrear",     key: "arr1" },
  { label: "Pass % including 1 Arrear",            key: "arr1Pct" },
  { label: "Number of Students with 1 & 2 Arrear", key: "arr2" },
  { label: "Pass % including 1 & 2 Arrear",        key: "arr2Pct" },
  { label: "Number of Students with 1, 2 & 3 Arrear", key: "arr3" },
  { label: "Pass % including 1, 2 & 3 Arrear",    key: "arr3Pct" },
];

export default function Form2() {
  const d = mockForm2;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">St. Joseph's College of Engineering</h1>
        <h2 className="text-lg font-semibold">Department of Computer Science and Engineering</h2>
        <p className="font-medium">Batch 2021-25 — Semester VIII Section A, B & C</p>
        <p className="mt-2 font-bold">APR/MAY 2025 - UNIVERSITY EXAMINATIONS</p>
        <p className="text-sm font-semibold text-gray-600">FORM 2</p>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-gray-400 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 p-2 text-left"></th>
            <th className="border border-gray-400 p-2">Combined</th>
            <th className="border border-gray-400 p-2">A</th>
            <th className="border border-gray-400 p-2">B</th>
            <th className="border border-gray-400 p-2">C</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="hover:bg-gray-50">
              <td className="border border-gray-400 p-2 font-medium">{row.label}</td>
              <td className="border border-gray-400 p-2 text-center font-bold">{d.combined[row.key]}</td>
              <td className="border border-gray-400 p-2 text-center">{d.A[row.key]}</td>
              <td className="border border-gray-400 p-2 text-center">{d.B[row.key]}</td>
              <td className="border border-gray-400 p-2 text-center">{d.C[row.key]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-right font-bold">HOD</div>
      <div className="mt-4 no-print">
        <PrintButton />
      </div>
    </div>
  );
}
