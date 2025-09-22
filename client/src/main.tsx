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
import Chart from "./components/Chart"; // ✅ import halaman Chart

function App() {
  // default: user belum login
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // setiap kali isLoggedIn berubah, update localStorage
  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn.toString());
  }, [isLoggedIn]);

  // fungsi logout → clear localStorage & reset state
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

  return (
    <Routes>
      {/* Default route selalu cek login */}
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
            <Home onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Chapter route dengan parameter id */}
      <Route
        path="/chapter/:id"
        element={isLoggedIn ? <Chapter /> : <Navigate to="/login" replace />}
      />

      {/* Chapter Contents route dengan parameter chapterId */}
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

      {/* ✅ Chart route */}
      <Route
        path="/chart"
        element={isLoggedIn ? <Chart /> : <Navigate to="/login" replace />}
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
