import { Link } from "react-router-dom";
import {
  FiBox,
  FiCode,
  FiClipboard,
  FiLayers,
  FiLogOut,
  FiMap,
} from "react-icons/fi";
import "./DashboardItem.css";

function Dashboarditem() {
  return (
    <>
      <div className="dashboarditem dashboard-links">
        <li>
          <Link to="/Pinturas" className="item dashboard-link">
            <FiBox />
            <span>Pinturas</span>
          </Link>
        </li>

        <li>
          <Link to="/Materiales" className="item dashboard-link">
            <FiLayers />
            <span>Materiales</span>
          </Link>
        </li>

        <li>
          <Link to="/Albaranes" className="item dashboard-link">
            <FiClipboard />
            <span>Albaranes</span>
          </Link>
        </li>

        <li>
          <Link to="/Code" className="item dashboard-link">
            <FiCode />
            <span>Codigo QR</span>
          </Link>
        </li>

        <li>
          <Link to="/Nave" className="item dashboard-link">
            <FiMap />
            <span>Nave</span>
          </Link>
        </li>
      </div>

      <div className="dashboarditem dashboard-footer">
        <li className="dashboard-link muted-link">
          <FiLogOut />
          <span>Salir</span>
        </li>
      </div>
    </>
  );
}
export default Dashboarditem;
