// src/components/Navbar.tsx
import React, { useEffect, useState } from "react";
import useTheme, { Theme } from "../pages/useTheme";
import { useNavigate } from "react-router-dom";
import "../../styles/navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "../../icons";

interface NavbarProps {
  onLogout: () => void;
}

interface User {
  id: string;
  role: "student" | "instructor";
  email: string;
  name: string;
  username: string; // Menambahkan properti username
}

export default function Navbar({ onLogout }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>("User");
  
  const getInitialTheme = (): Theme => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    return savedTheme || "system";
  };

  const { theme, setTheme } = useTheme(getInitialTheme());
  const navigate = useNavigate();

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser: User = JSON.parse(userData);
          setUser(parsedUser);
          
          // Prioritaskan username, kemudian name, kemudian email, terakhir fallback "User"
          if (parsedUser.username && parsedUser.username.trim() !== "") {
            setUserName(parsedUser.username);
          } else if (parsedUser.name && parsedUser.name.trim() !== "") {
            setUserName(parsedUser.name);
          } else if (parsedUser.email) {
            // Jika menggunakan email, ambil bagian sebelum @ untuk username
            const emailUsername = parsedUser.email.split('@')[0];
            setUserName(emailUsername);
          } else {
            setUserName("User");
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setUserName("User");
      }
    };

    loadUserData();

    // Listen for storage changes (in case user data is updated in another tab/component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        loadUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogoutClick = () => {
    onLogout();
    navigate("/login");
  };

  // Format username dengan kapitalisasi pertama
  const formatUsername = (name: string): string => {
    if (!name) return "User";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <header className="header">
      <div className="user-info">
        <h2>👋 Hello, {formatUsername(userName)}</h2>
      </div>
      <div className="actions">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          className="theme-select"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
        <button className="logout-btn" onClick={handleLogoutClick}>
          Logout <FontAwesomeIcon icon={byPrefixAndName.fas.faRightFromBracket} />
        </button>
      </div>
    </header>
  );
}