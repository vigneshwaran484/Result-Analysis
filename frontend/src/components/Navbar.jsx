import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-800 text-white px-6 py-3 flex flex-wrap gap-4">
      <Link to="/" className="hover:underline">Dashboard</Link>
      <Link to="/form1a" className="hover:underline">Form 1A</Link>
      <Link to="/form1b" className="hover:underline">Form 1B</Link>
      <Link to="/form1e" className="hover:underline">Form 1E</Link>
      <Link to="/form2" className="hover:underline">Form 2</Link>
      <Link to="/form3a" className="hover:underline">Form 3A</Link>
      <Link to="/form3b/A" className="hover:underline">Form 3B</Link>
      <Link to="/form4a" className="hover:underline">Form 4A</Link>
    </nav>
  );
}
