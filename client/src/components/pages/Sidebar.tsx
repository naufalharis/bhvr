import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../../styles/sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState("/home");

  // Update active menu based on current route
  useEffect(() => {
    setActiveMenu(location.pathname);
  }, [location.pathname]);

  const isActive = (path: string) => {
    return activeMenu === path;
  };

  return (
    <aside className="sidebar">
      <h1>StudyBuddy</h1>
      <nav>
        <ul>
          <li>
            <a 
              href="/home" 
              className={isActive("/home") ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setActiveMenu("/home");
                window.location.href = "/home";
              }}
            >
              Dashboard
            </a>
          </li>
          <li>
            <a 
              href="/enrolled" 
              className={isActive("/enrolled") ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setActiveMenu("/enrolled");
                window.location.href = "/enrolled";
              }}
            >
              Assignments
            </a>
          </li>
          <li>
            <a 
              href="/chart" 
              className={isActive("/chart") ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setActiveMenu("/chart");
                window.location.href = "/chart";
              }}
            >
              Keranjang
            </a>
          </li>
          <li>
            <a 
              href="/products" 
              className={isActive("/products") ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setActiveMenu("/products");
                window.location.href = "/products";
              }}
            >
              Product
            </a>
          </li>
          <li>
            <a 
              href="/product-details" 
              className={isActive("/product-details") ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setActiveMenu("/product-details");
                window.location.href = "/product-details";
              }}
            >
              Produk detail
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}