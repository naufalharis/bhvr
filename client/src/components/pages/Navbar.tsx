import React, { useEffect } from "react";
import useTheme, { Theme } from "../pages/useTheme";
import { useNavigate } from "react-router-dom";
import "../../styles/navbar.css";

interface NavbarProps {
  userName: string;
  onLogout: () => void;
}

export default function Navbar({ userName, onLogout }: NavbarProps) {
  const getInitialTheme = (): Theme => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    return savedTheme || "system";
  };

  const { theme, setTheme } = useTheme(getInitialTheme());
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogoutClick = () => {
    onLogout();
    navigate("/login");
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
          <option value="system"> system</option>
        </select>
        <img src="https://i.pravatar.cc/100" alt="User avatar" />
        <button className="logout-btn" onClick={handleLogoutClick}>
          Logout
        </button>
      </div>
    </header>
  );
}
