import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Form1A from "./pages/Form1A";
import Form1B from "./pages/Form1B";
import Form1E from "./pages/Form1E";
import Form2 from "./pages/Form2";
import Form3A from "./pages/Form3A";
import Form3B from "./pages/Form3B";
import Form4A from "./pages/Form4A";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/form1a" element={<Form1A />} />
        <Route path="/form1b" element={<Form1B />} />
        <Route path="/form1e" element={<Form1E />} />
        <Route path="/form2" element={<Form2 />} />
        <Route path="/form3a" element={<Form3A />} />
        <Route path="/form3b/:section" element={<Form3B />} />
        <Route path="/form4a" element={<Form4A />} />
      </Routes>
    </BrowserRouter>
  );
}
