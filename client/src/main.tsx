// index.tsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";

import Login from "./components/Login";
import Home from "./components/Home";
import Register from "./components/Register";
import Chapter from "./components/Chapter";
import ChapterContents from "./components/ChapterContent";
import Chart from "./components/Chart"; // ✅ Halaman Chart

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    // ambil dari localStorage saat pertama kali render
    return localStorage.getItem("isLoggedIn") === "true";
  });

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn.toString());
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

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

      {/* Register */}
      <Route path="/register" element={<RegisterRedirect />} />

      {/* Home */}
      <Route
        path="/home"
        element={
          isLoggedIn ? (
            <Home onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Chapter */}
      <Route
        path="/chapter/:id"
        element={isLoggedIn ? <Chapter /> : <Navigate to="/login" replace />}
      />

      {/* Chapter contents */}
      <Route
        path="/chapter/:chapterId/contents"
        element={
          isLoggedIn ? (
            <ChapterContentsWrapper />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ✅ Chart */}
      <Route
        path="/chart"
        element={isLoggedIn ? <Chart /> : <Navigate to="/login" replace />}
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Wrapper Register
function RegisterRedirect() {
  const navigate = useNavigate();
  const handleRegister = () => {
    navigate("/login");
  };
  return <Register onRegister={handleRegister} />;
}

// Wrapper ChapterContents
function ChapterContentsWrapper() {
  const { chapterId } = useParams<{ chapterId: string }>();
  if (!chapterId) return <div>Chapter ID is missing</div>;
  return <ChapterContents chapterId={chapterId} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
