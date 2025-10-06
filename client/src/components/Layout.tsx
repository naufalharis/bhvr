// components/Layout.tsx
import React from "react";
import Sidebar from "./pages/Sidebar";
import Navbar from "./pages/Navbar";
import "../styles/layout.css";

interface LayoutProps {
  children: React.ReactNode;
  userName: string;
  onLogout: () => void;
}

export default function Layout({ children, userName, onLogout }: LayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar userName={userName} onLogout={onLogout} />
        <main className="content-area">
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}