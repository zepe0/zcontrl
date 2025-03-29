import { Link } from "react-router-dom";
import "./Nav.css";
function Nav() {
  return (
    <nav className="nav">
      <h1 className=""><Link to="/">LOGO</Link></h1>
      <ul className="itemsnav">
        <li>
          <input type="text" placeholder="Search" />
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
