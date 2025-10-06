import React, { useEffect, useState } from "react";
import useTheme, { Theme } from "../pages/useTheme";
import "../../styles/navbar.css";

interface NavbarProps {
  userName: string;
  onLogout: () => void;
}

export default function Navbar({ userName, onLogout }: NavbarProps) {
  // Get the initial theme from localStorage or default to "system"
  const getInitialTheme = (): Theme => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    return savedTheme || "system";
  };

  const { theme, setTheme } = useTheme(getInitialTheme());

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogout = () => {
    // Don't remove theme from localStorage on logout
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
  };

  return (
    <header className="header">
      <h2>👋 {userName}</h2>
      <div className="actions">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          className="theme-select"
        >
          <option value="light"> Light</option>
          <option value="dark"> Dark</option>
          <option value="system"> System</option>
        </select>
        <img src="https://i.pravatar.cc/100" alt="User avatar" />
        <button className="logout-btn" onClick={handleLogout}>
           Logout
        </button>
      </div>
    </header>
  );
}