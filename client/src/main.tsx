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
import Payment from "./components/Payment"; // ✅ import halaman Payment
import Enrolled from "./components/Enrolled"; // ✅ import halaman Enrolled

// ✅ Komponen ProtectedRoute
function ProtectedRoute({
  isLoggedIn,
  children,
}: {
  isLoggedIn: boolean;
  children: React.ReactNode;
}) {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  // ✅ baca status login dari localStorage
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    localStorage.getItem("isLoggedIn") === "true"
  );

  // update localStorage setiap kali isLoggedIn berubah
  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn.toString());
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
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

      {/* Chapter Contents */}
      <Route
        path="/chapter/:chapterId/contents"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <ChapterContentsWrapper />
          </ProtectedRoute>
        }
      />

      {/* Chart */}
      <Route
        path="/chart"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <Chart />
          </ProtectedRoute>
        }
      />

      {/* Payment */}
      <Route
        path="/payment/:orderId"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <PaymentWrapper />
          </ProtectedRoute>
        }
      />

      {/* Enrolled */}
      <Route
        path="/enrolled"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <Enrolled />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ✅ Wrapper Register agar redirect ke login setelah register
function RegisterRedirect() {
  const navigate = useNavigate();
  const handleRegister = () => {
    navigate("/login");
  };
  return <Register onRegister={handleRegister} />;
}

// ✅ Wrapper ChapterContents agar bisa ambil param
function ChapterContentsWrapper() {
  const { chapterId } = useParams<{ chapterId: string }>();
  if (!chapterId) return <div>Chapter ID is missing</div>;
  return <ChapterContents chapterId={chapterId} />;
}

// ✅ Wrapper Payment agar bisa ambil orderId dari param
function PaymentWrapper() {
  const { orderId } = useParams<{ orderId: string }>();
  if (!orderId) return <div>Order ID is missing</div>;
  return <Payment orderId={orderId} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
