import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <nav style={styles.nav}>
      <h2>My App</h2>
      <div>
        <NavLink to="/" style={({ isActive }) => ({ ...styles.link, color: isActive ? "yellow" : "white" })}>Home</NavLink>
        <NavLink to="/about" style={({ isActive }) => ({ ...styles.link, color: isActive ? "yellow" : "white" })}>About</NavLink>
        <NavLink to="/analysis" style={({ isActive }) => ({ ...styles.link, color: isActive ? "yellow" : "white" })}>Analysis</NavLink>
        <NavLink to="/upload" style={({ isActive }) => ({ ...styles.link, color: isActive ? "yellow" : "white" })}>Upload</NavLink>
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: "flex", justifyContent: "space-between", padding: "10px 20px", backgroundColor: "#333", color: "white" },
  link: { margin: "0 10px", textDecoration: "none" },
};