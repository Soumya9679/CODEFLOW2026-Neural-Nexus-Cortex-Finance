// src/App.js

import React, { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

/* Pages */

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Upload from "./pages/Upload";
import Processing from "./pages/Processing";
import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";

/* CSS */

import "./App.css";

function App() {

  const [darkMode, setDarkMode] = useState(true);

  return (

    <div className={darkMode ? "theme-dark" : "theme-light"}>

      <BrowserRouter>

        {/* Theme Toggle */}

        <button
          className="toggle-btn"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "🌞" : "🌙"}
        </button>

        <Routes>

          <Route
            path="/"
            element={<LandingPage />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/upload"
            element={<Upload />}
          />

          <Route
            path="/processing"
            element={<Processing />}
          />

          <Route
            path="/dashboard/*"
            element={<Dashboard />}
          />

          <Route
            path="/chatbot"
            element={<Chatbot />}
          />

        </Routes>

      </BrowserRouter>

    </div>
  );
}

export default App;