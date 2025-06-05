import { Link } from "react-router-dom";
import "./Nav.css";
function Nav() {
  return (
    <nav className="nav">
      <p className="bglogo"><Link to="/"></Link></p>
      <ul className="itemsnav">
        <li>
          
        </li>
      </ul>
      <ul className="itemsnav">
        
        <li>About</li>
        <li>Contact</li>
      </ul>
    </nav>
  );
}
export default Nav;
