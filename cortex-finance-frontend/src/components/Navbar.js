import React from "react";
import { Link } from "react-router-dom";

function Navbar() {

  return (
    <div className="dashboard-navbar">

      {/* Logo */}
      <h1 className="dashboard-logo">
        AI Bank Analyzer
      </h1>

      {/* Navigation Links */}
      <div className="nav-links">

        <Link to="/dashboard">
          <button className="nav-btn">
            Dashboard
          </button>
        </Link>

        <Link to="/upload">
          <button className="nav-btn">
            Upload
          </button>
        </Link>

        <Link to="/chatbot">
          <button className="nav-btn">
            AI Assistant
          </button>
        </Link>

        <Link to="/">
          <button className="logout-button">
            Logout
          </button>
        </Link>

      </div>

    </div>
  );
}

export default Navbar;