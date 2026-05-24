// src/App.js

import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
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

// Route Guards
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("cortex_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const GuestRoute = ({ children }) => {
  const token = localStorage.getItem("cortex_token");
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className={darkMode ? "theme-dark" : "theme-light"}>
      <BrowserRouter>
        

        <Routes>
          <Route
            path="/"
            element={<LandingPage />}
          />

          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <GuestRoute>
                <Signup />
              </GuestRoute>
            }
          />

          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />

          <Route
            path="/processing"
            element={
              <ProtectedRoute>
                <Processing />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <Chatbot />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;