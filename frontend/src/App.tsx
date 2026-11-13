import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import About from "./pages/About";
import Analysis from "./pages/Analysis";
import Upload from "./pages/Upload";

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </Router>
  );
}