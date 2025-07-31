import { Link } from "react-router-dom";
import "./Nav.css";
function Nav() {
  return (
    <nav className="nav">
      <Link to="/"><p className="bglogo"></p></Link>
      <ul className="itemsnav">
        <li>
          
        </li>
      </ul>
      <ul className="itemsnav">
        
        <li className="itemnav">About</li>
        <li>Contact</li>
      </ul>
    </nav>
  );
}
export default Nav;
