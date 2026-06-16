import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import PrintButton from "../components/PrintButton";

const tableData = {
  rows: [
    { label: "Total", s1:195, s2:195, s3:200, s4:199, s5:199, s6:199, s7:196, s8:195 },
    { label: "I",     s1:146, s2:163, s3:173, s4:188, s5:189, s6:191, s7:191, s8:190 },
    { label: "II",    s1:null,s2:139, s3:156, s4:166, s5:166, s6:169, s7:171, s8:175 },
    { label: "III",   s1:null,s2:null,s3:155, s4:161, s5:167, s6:170, s7:182, s8:182 },
    { label: "IV",    s1:null,s2:null,s3:null,s4:152, s5:162, s6:172, s7:176, s8:179 },
    { label: "V",     s1:null,s2:null,s3:null,s4:null,s5:163, s6:170, s7:174, s8:178 },
    { label: "VI",    s1:null,s2:null,s3:null,s4:null,s5:null,s6:170, s7:178, s8:182 },
    { label: "VII",   s1:null,s2:null,s3:null,s4:null,s5:null,s6:null,s7:189, s8:189 },
    { label: "VIII",  s1:null,s2:null,s3:null,s4:null,s5:null,s6:null,s7:null,s8:191 },
  ]
};

const chartData = [
  { sem: "SEM I",   Total:195, I:146 },
  { sem: "SEM II",  Total:195, I:163, II:139 },
  { sem: "SEM III", Total:200, I:173, II:156, III:155 },
  { sem: "SEM IV",  Total:199, I:188, II:166, III:161, IV:152 },
  { sem: "SEM V",   Total:199, I:189, II:166, III:167, IV:162, V:163 },
  { sem: "SEM VI",  Total:199, I:191, II:169, III:170, IV:172, V:170, VI:170 },
  { sem: "SEM VII", Total:196, I:191, II:171, III:182, IV:176, V:174, VI:178, VII:189 },
  { sem: "SEM VIII",Total:195, I:190, II:175, III:182, IV:179, V:178, VI:182, VII:189, VIII:191 },
];

const COLORS = ["#4e79a7","#f28e2b","#9c755f","#e15759","#76b7b2","#59a14f","#edc948","#b07aa1","#ff9da7"];
const barKeys = ["Total","I","II","III","IV","V","VI","VII","VIII"];

const sems = ["Sem I","Sem II","Sem III","Sem IV","Sem V","Sem VI","Sem VII","Sem VIII"];

export default function Form1A() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">St. Joseph's College of Engineering</h1>
        <h2 className="text-lg font-semibold">Department of Computer Science and Engineering</h2>
        <p className="font-medium">Batch 2021-25 — Semester VIII Section A, B & C</p>
        <p className="mt-2 font-bold">APR/MAY 2025 - UNIVERSITY EXAMINATIONS — BEFORE REVIEW</p>
        <p className="font-bold">SEMESTER WISE PERFORMANCE UPTO VIII SEMESTER</p>
        <p className="text-sm font-semibold text-gray-600">FORM 1A</p>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-gray-400 text-sm mb-10">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 p-2"></th>
            {sems.map(s => (
              <th key={s} className="border border-gray-400 p-2">{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.rows.map((row) => (
            <tr key={row.label} className="hover:bg-gray-50">
              <td className="border border-gray-400 p-2 font-bold text-center">{row.label}</td>
              {["s1","s2","s3","s4","s5","s6","s7","s8"].map(k => (
                <td key={k} className="border border-gray-400 p-2 text-center">
                  {row[k] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bar Chart */}
      <h3 className="text-center font-bold text-lg mb-4">SEMESTER WISE PERFORMANCE</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <XAxis dataKey="sem" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 220]} />
          <Tooltip />
          <Legend />
          {barKeys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={COLORS[i]} />
          ))}
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 text-right font-bold">HOD</div>
      <div className="mt-4 no-print">
        <PrintButton />
      </div>
    </div>
  );
}
