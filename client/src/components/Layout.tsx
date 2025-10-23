// components/Layout.tsx
import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./pages/Sidebar";
import Navbar from "./pages/Navbar";
import "../styles/layout.css";

interface LayoutProps {
  children: React.ReactNode;
  userName: string;
  onLogout: () => void;
}

export default function Layout({ children, userName, onLogout }: LayoutProps) {
  const location = useLocation();

  // jika path mengandung "chapter", sidebar disembunyikan
  const hideSidebar = location.pathname.includes("chapter");

  return (
    <div className="app-layout">
      {!hideSidebar && <Sidebar />} {/* hanya tampil jika bukan halaman chapter */}
      <div className={`main-content ${hideSidebar ? "full-width" : ""}`}>
        <Navbar userName={userName} onLogout={onLogout} />
        <main className="content-area">
          <div className="content-wrapper">{children}</div>
        </main>
      </div>
    </div>
  );
}
