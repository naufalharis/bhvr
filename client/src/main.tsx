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

import Login from "./components/login";
import Home from "./components/Home";
import Register from "./components/Register";
import Chapter from "./components/Chapter";
import ChapterContents from "./components/ChapterContent"; 
import Chart from "./components/Chart"; // ✅ import halaman Chart

function App() {
  // default: user belum login
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // setiap kali isLoggedIn berubah, update localStorage
  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn.toString());
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role"); // ✅ pastikan role ikut dibersihkan
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

      {/* Login */}
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
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <Home onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      {/* Chapter */}
      <Route
        path="/chapter/:id"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <Chapter />
          </ProtectedRoute>
        }
      />

      {/* Chapter Contents route dengan parameter chapterId */}
      <Route
        path="/chapter/:chapterId/contents"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <ChapterContentsWrapper />
          </ProtectedRoute>
        }
      />

      {/* ✅ Chart route */}
      <Route
        path="/chart"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <Chart />
          </ProtectedRoute>
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

// Wrapper untuk ChapterContents agar bisa membaca chapterId dari param
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
