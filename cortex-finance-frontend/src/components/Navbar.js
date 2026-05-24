import React from "react";
import { Link } from "react-router-dom";

function Navbar({ darkMode, setDarkMode }) {

  return (
    <div className={darkMode ? "dashboard-navbar dark" : "dashboard-navbar light"}>

      {/* Logo */}
      <h1 className="dashboard-logo">
        AI Bank Analyzer
      </h1>

      {/* Navigation Links */}
      <div className="nav-links">

        {/* 🌙 ICON TOGGLE ONLY */}
        <button
          className="nav-btn toggle-btn"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "🌞" : "🌙"}
        </button>

        
      </div>

    </div>
  );
}

export default Navbar;