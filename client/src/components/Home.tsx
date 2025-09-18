import React, { useEffect, useState } from "react";
import "../styles/home.css";

interface AppProps {
  onLogout: () => void;
}

export default function App({ onLogout }: AppProps) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (mode: "light" | "dark" | "system") => {
      if (mode === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.setAttribute("data-theme", prefersDark ? "dark" : "light");
      } else {
        root.setAttribute("data-theme", mode);
      }
    };

    applyTheme(theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) =>
        root.setAttribute("data-theme", e.matches ? "dark" : "light");
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <h1>StudyBuddy</h1>
        <nav>
          <ul>
            <li>
              <a href="#" className="active">🏠 Dashboard</a>
            </li>
            <li>
              <a href="#">📘 Lessons</a>
            </li>
            <li>
              <a href="#">📝 Assignments</a>
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

      {/* Main */}
      <div className="main">
        {/* Header */}
        <header className="header">
          <h2>Welcome back, Sarah</h2>
          <div className="actions">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
              className="theme-select"
            >
              <option value="light">☀️ Light</option>
              <option value="dark">🌙 Dark</option>
              <option value="system">💻 System</option>
            </select>
            <button>🔔</button>
            <img
              src="https://i.pravatar.cc/100"
              alt="User avatar"
            />
            <button className="logout-btn" onClick={onLogout}>
              🚪 Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="content">
          <div className="cards">
            <div className="left-column">
              {/* Profile Card */}
              <div className="profile-card">
                <div>
                  <h3>Sarah Miller</h3>
                  <p>View your profile and settings</p>
                  <button>View Profile</button>
                </div>
              </div>

              {/* Courses */}
              <div className="courses-section">
                <h2>Your Courses</h2>
                <div className="course-list">
                  <div className="course-card">
                    <div>
                      <h3>Calculus 101</h3>
                      <p>Learn the fundamentals of calculus</p>
                    </div>
                    <button>Continue</button>
                  </div>

                  <div className="course-card">
                    <div>
                      <h3>Linear Algebra Basics</h3>
                      <p>Master the basics of linear algebra</p>
                    </div>
                    <button>Continue</button>
                  </div>

                  <div className="course-card">
                    <div>
                      <h3>Differential Equations</h3>
                      <p>Explore the world of differential equations</p>
                    </div>
                    <button>Continue</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar kosong */}
            <div className="right-column"></div>
          </div>
        </main>
      </div>
    </div>
  );
}
