import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{ backgroundColor: "#000000" }} // Black background
    >
      <div className="container">
        <Link
          className="navbar-brand"
          to="/"
          style={{ color: "#FFC107", fontWeight: "bold" }} // Yellow brand
        >
          MyApp
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ backgroundColor: "#FFC107" }} // Yellow toggle button
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item me-2">
              <button
                className="btn"
                type="submit"
                style={{
                  backgroundColor: "#FFC107",
                  color: "#000000",
                  border: "none",
                }}
              >
                Search
              </button>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/" style={{ color: "#FFFFFF" }}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/register"
                style={{ color: "#FFFFFF" }}
              >
                Register
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/login"
                style={{ color: "#FFFFFF" }}
              >
                Login
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
