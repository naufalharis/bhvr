import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "../../styles/sidebar.css";

export default function Sidebar() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    console.log("✅ Role dari localStorage:", storedRole); // debug
    setRole(storedRole);
  }, []);

  return (
    <aside className="sidebar">
      <h1>StudyBuddy</h1>
      <nav>
        <ul>
          <li>
            <NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")}>
              Dashboard
            </NavLink>
          </li>

          <li>
            <a href="/chart">📝 chart</a>
          </li>
          <li>
            <a href="#">📈 Progress</a>
          </li>
          <li>
            <a href="#">👥 Community</a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
