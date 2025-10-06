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
import Chart from "./components/Chart";
import Payment from "./components/Payment";
import Enrolled from "./components/Enrolled";
import ProductPage from "./components/Product";
import ProductDetail from './components/ProductDetail';
import Layout from "./components/Layout";
import "./styles/layout.css";

// ✅ Hook untuk mendapatkan user name
const useUserName = () => {
  const getUserName = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).name || "User" : "User";
  };
  return getUserName();
};

// ✅ Komponen ProtectedRoute dengan Layout
const ProtectedLayout = ({ children, onLogout }: { children: React.ReactNode; onLogout: () => void }) => {
  const userName = useUserName();
  return (
    <Layout userName={userName} onLogout={onLogout}>
      {children}
    </Layout>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    localStorage.getItem("isLoggedIn") === "true"
  );

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

  // ✅ Komponen wrapper yang sederhana
  const ChapterContentsWithParams = () => {
    const { chapterId } = useParams<{ chapterId: string }>();
    return chapterId ? <ChapterContents chapterId={chapterId} /> : <div>Chapter ID is missing</div>;
  };

  const PaymentWithParams = () => {
    const { orderId } = useParams<{ orderId: string }>();
    return orderId ? <Payment orderId={orderId} /> : <div>Order ID is missing</div>;
  };

  const ChartWithParams = () => {
    const { orderId } = useParams<{ orderId?: string }>();
    return <Chart orderId={orderId} />;
  };

  const RegisterWithRedirect = () => {
    const navigate = useNavigate();
    return <Register onRegister={() => navigate("/login")} />;
  };

  return (
    <Routes>
      {/* Default route */}
      <Route
        path="/"
        element={<Navigate to={isLoggedIn ? "/home" : "/login"} replace />}
      />

      {/* Public routes - tanpa layout */}
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

      <Route 
        path="/register" 
        element={
          isLoggedIn ? (
            <Navigate to="/home" replace />
          ) : (
            <RegisterWithRedirect />
          )
        } 
      />

      {/* Protected routes - dengan layout */}
      <Route
        path="/home"
        element={
          isLoggedIn ? (
            <ProtectedLayout onLogout={handleLogout}>
              <Home />
            </ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/products"
        element={
          isLoggedIn ? (
            <ProtectedLayout onLogout={handleLogout}>
              <ProductPage />
            </ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/product-details"
        element={
          isLoggedIn ? (
            <ProtectedLayout onLogout={handleLogout}>
              <ProductDetail />
            </ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/chapter/:id"
        element={
          isLoggedIn ? (
            <ProtectedLayout onLogout={handleLogout}>
              <Chapter />
            </ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/chapter/:chapterId/contents"
        element={
          isLoggedIn ? (
            <ProtectedLayout onLogout={handleLogout}>
              <ChapterContentsWithParams />
            </ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/chart/:orderId?"
        element={
          isLoggedIn ? (
            <ProtectedLayout onLogout={handleLogout}>
              <ChartWithParams />
            </ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/payment/:orderId"
        element={
          isLoggedIn ? (
            <ProtectedLayout onLogout={handleLogout}>
              <PaymentWithParams />
            </ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/enrolled"
        element={
          isLoggedIn ? (
            <ProtectedLayout onLogout={handleLogout}>
              <Enrolled />
            </ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
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