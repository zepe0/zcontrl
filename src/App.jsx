import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Prueva from "./pages/Prueva";
import Marteriales from "./pages/Materiales";
import Pinturas from "./pages/Pinturas";
import { ToastContainer } from "react-toastify";


function App() {
  return (
   
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/Pinturas" element={<Pinturas />} />
        <Route path="/prueva" element={<Prueva />} />
        <Route path="/Materiales" element={<Marteriales />} />
      
      </Routes>
      <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
    </Router>

  );
}

export default App;
