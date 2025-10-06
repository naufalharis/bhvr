import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import "../../styles/sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState("/home");

  useEffect(() => {
    setActiveMenu(location.pathname);
  }, [location.pathname]);

  const isActive = (path: string) => activeMenu === path;

  return (
    <aside className="sidebar">
      <h1>StudyBuddy</h1>
      <nav>
        <ul>
          <li>
            <Link
              to="/home"
              className={isActive("/home") ? "active" : ""}
              onClick={() => setActiveMenu("/home")}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/enrolled"
              className={isActive("/enrolled") ? "active" : ""}
              onClick={() => setActiveMenu("/enrolled")}
            >
              Assignments
            </Link>
          </li>
          <li>
            <Link
              to="/chart"
              className={isActive("/chart") ? "active" : ""}
              onClick={() => setActiveMenu("/chart")}
            >
              Keranjang
            </Link>
          </li>
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
              Produk detail
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
