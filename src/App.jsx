import "./App.css";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Prueva from "./pages/Prueva";
import Marteriales from "./pages/Materiales";
import Pinturas from "./pages/Pinturas";
import { ToastContainer, Zoom } from "react-toastify";
import Loader from "./Components/Loader";
import Albaranes from "./pages/Albaranes";
import Code from "./Components/QRcode/QRcode";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/Pinturas" element={<Pinturas />} />
        <Route path="/prueva" element={<Prueva />} />
        <Route path="/Materiales" element={<Marteriales />} />
        <Route path="/Albaranes" element={<Albaranes />} />
        <Route path="*" element={<Loader />} />
        <Route path="/Code" element={<Code />} />
      </Routes>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        closeOnClick={false}
        pauseOnHover={false}
        draggable={true}
        progress={false}
        theme="light"
        transition={Zoom}
      />
    </Router>
  );
}

export default App;
