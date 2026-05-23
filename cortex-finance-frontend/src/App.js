// src/App.js

import React from "react";

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

  return (

    <BrowserRouter>

      <Routes>

        {/* Landing Page */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Signup Page */}
        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* Upload Page */}
        <Route
          path="/upload"
          element={<Upload />}
        />

        {/* Processing Page */}
        <Route
          path="/processing"
          element={<Processing />}
        />

        {/* Dashboard Page */}
        <Route
          path="/dashboard/*"
          element={<Dashboard />}
        />

        {/* Chatbot Page */}
        <Route
          path="/chatbot"
          element={<Chatbot />}
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;