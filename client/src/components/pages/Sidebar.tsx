// Sidebar.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/sidebar.css";

export default function Sidebar() {
  const location = useLocation();

  // Ambil data user dari localStorage
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;

  const role = user?.role || "guest"; // default "guest" kalau belum login

  return (
    <aside className="sidebar">
      <h1>StudyBuddy</h1>
      <nav>
        <ul>
          {/* Dashboard selalu ada */}
          <li>
            <Link
              to="/home"
              className={location.pathname === "/home" ? "active" : ""}
            >
              Dashboard
            </Link>
          </li>

          {/* Keranjang hanya muncul jika role student */}
          {role === "student" && (
            <li>
              <Link
                to="/chart"
                className={location.pathname === "/chart" ? "active" : ""}
              >
                Keranjang
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
