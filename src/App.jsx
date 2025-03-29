import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Prueva from "./pages/Prueva";
import Marteriales from "./pages/Materiales";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/prueva" element={<Prueva />} />
        <Route path="/Materiales" element={<Marteriales />} />
      
      </Routes>
    </Router>
  );
}

export default App;
