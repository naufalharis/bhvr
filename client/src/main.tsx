import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home"; // buat komponen Home
import "./index.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Routes>
      {/* Default route */}
      <Route
        path="/"
        element={
          isLoggedIn ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Login */}
      <Route
        path="/login"
        element={
          isLoggedIn ? <Navigate to="/home" replace /> : <Login onLogin={() => setIsLoggedIn(true)} />
        }
      />

      {/* Home */}
      <Route
        path="/home"
        element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
