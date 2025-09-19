import React, { useEffect, useState } from "react";
import useTheme, { Theme } from "../pages/useTheme";
import "../../styles/navbar.css";

interface NavbarProps {
  userName: string;
  onLogout: () => void;
}

export default function Navbar({ userName, onLogout }: NavbarProps) {
  const { theme, setTheme } = useTheme("system");

  return (
    <header className="header">
      <h2>Welcome back, {userName}</h2>
      <div className="actions">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          className="theme-select"
        >
          <option value="light">☀️ Light</option>
          <option value="dark">🌙 Dark</option>
          <option value="system">💻 System</option>
        </select>
        <button>🔔</button>
        <img src="https://i.pravatar.cc/100" alt="User avatar" />
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            onLogout();
          }}
        >
          🚪 Logout
        </button>
      </div>
    </header>
  );
}
