// index.tsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import Register from "./components/Register";
import Chapter from "./components/Chapter";

function App() {
  // Ambil status login dari localStorage
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const stored = localStorage.getItem("isLoggedIn");
    return stored === "true";
  });

  // Simpan status login ke localStorage saat berubah
  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn.toString());
  }, [isLoggedIn]);

  return (
    <Routes>
      {/* Default route */}
      <Route
        path="/"
        element={
          isLoggedIn ? (
            <Navigate to="/home" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Login route */}
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/home" replace />
          ) : (
            <Login onLogin={() => setIsLoggedIn(true)} />
          )
        }
      />

      {/* Register route */}
      <Route path="/register" element={<RegisterRedirect />} />

      {/* Home route */}
      <Route
        path="/home"
        element={
          isLoggedIn ? (
            <Home onLogout={() => setIsLoggedIn(false)} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Chapter route dengan parameter id */}
      <Route
        path="/chapter/:id"
        element={
          isLoggedIn ? <Chapter /> : <Navigate to="/login" replace />
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Wrapper Register agar bisa redirect setelah sukses
function RegisterRedirect() {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate("/login");
  };

  return <Register onRegister={handleRegister} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
