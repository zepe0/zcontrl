import { Link, NavLink } from "react-router-dom";
import "./Nav.css";
import { FiBox, FiCode, FiClipboard, FiLayers, FiMap } from "react-icons/fi";

function Nav() {
  return (
    <nav className="nav">
      <Link to="/" className="brand-link" aria-label="Ir al inicio">
        <p className="bglogo"></p>
        <span className="brand-title">ZControl</span>
      </Link>

      <div className="nav-actions nav-menu" aria-label="Navegacion principal">
        <NavLink
          to="/Pinturas"
          className={({ isActive }) =>
            `nav-menu-link ${isActive ? "nav-menu-link-active" : ""}`
          }
        >
          <FiBox />
          <span>Pinturas</span>
        </NavLink>
        <NavLink
          to="/Materiales"
          className={({ isActive }) =>
            `nav-menu-link ${isActive ? "nav-menu-link-active" : ""}`
          }
        >
          <FiLayers />
          <span>Materiales</span>
        </NavLink>
        <NavLink
          to="/Albaranes"
          className={({ isActive }) =>
            `nav-menu-link ${isActive ? "nav-menu-link-active" : ""}`
          }
        >
          <FiClipboard />
          <span>Albaranes</span>
        </NavLink>
        <NavLink
          to="/Code"
          className={({ isActive }) =>
            `nav-menu-link ${isActive ? "nav-menu-link-active" : ""}`
          }
        >
          <FiCode />
          <span>Codigo QR</span>
        </NavLink>
        <NavLink
          to="/Nave"
          className={({ isActive }) =>
            `nav-menu-link ${isActive ? "nav-menu-link-active" : ""}`
          }
        >
          <FiMap />
          <span>Nave</span>
        </NavLink>
      </div>
    </nav>
  );
}
export default Nav;
