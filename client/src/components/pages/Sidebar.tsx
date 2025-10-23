import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "../../styles/sidebar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "../../icons";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("/home");
  const [user, setUser] = useState<User | null>(null);

  // Middleware sederhana: ambil user dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login"); // redirect jika belum login
    } else {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Gagal parsing data user:", error);
        localStorage.removeItem("user");
        navigate("/login");
      }
    }
  }, [navigate]);

  // Update menu aktif berdasarkan path URL
  useEffect(() => {
    setActiveMenu(location.pathname);
  }, [location.pathname]);

  const isActive = (path: string) => activeMenu === path;

  return (
    <aside className="sidebar">
      <h1><FontAwesomeIcon icon={byPrefixAndName.fas.faBook} /> StudyBuddy</h1>
      <nav>
        <ul>
          {/* Menu umum (semua role bisa lihat) */}
          <li>
            <Link
              to="/home"
              className={isActive("/home") ? "active" : ""}
              onClick={() => setActiveMenu("/home")}
            >
              Dashboard
            </Link>
          </li>

          {/* Menu khusus Student */}
          {user?.role === "student" && (
            <>
              <li>
                <Link
                  to="/enrolled"
                  className={isActive("/enrolled") ? "active" : ""}
                  onClick={() => setActiveMenu("/enrolled")}
                >
                  Your Courses
                </Link>
              </li>
              <li>
                <Link
                  to="/chart"
                  className={isActive("/chart") ? "active" : ""}
                  onClick={() => setActiveMenu("/chart")}
                >
                  Cart
                </Link>
              </li>
            </>
          )}

          {/* Menu khusus Instructor */}
          {user?.role === "instructor" && (
            <>
              <li>
                <Link
                  to="/products"
                  className={isActive("/products") ? "active" : ""}
                  onClick={() => setActiveMenu("/products")}
                >
                  Product
                </Link>
              </li>
              <li>
                <Link
                  to="/product-details"
                  className={isActive("/product-details") ? "active" : ""}
                  onClick={() => setActiveMenu("/product-details")}
                >
                  Produk Detail
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
}
