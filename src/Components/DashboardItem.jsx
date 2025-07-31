import { Link } from "react-router-dom";

function Dashboarditem() {
  return (
    <>
      <div className="dashboarditem">
        <li>
          <Link to="/Pinturas" className="item">Pintura</Link>
        </li>

        <Link to="/Materiales">
          <li>Material</li>
        </Link>

        <Link to="/Albaranes">
          <li>Albaranes</li>
        </Link>
         <Link to="/Code">
          <li>Code</li>
        </Link>
      </div>
      <div className="dashboarditem">
        <li>Salir</li>
      </div>
    </>
  );
}
export default Dashboarditem;
