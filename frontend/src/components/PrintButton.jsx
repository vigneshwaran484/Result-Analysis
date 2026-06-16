export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
    >
      Print / Save as PDF
    </button>
  );
}
