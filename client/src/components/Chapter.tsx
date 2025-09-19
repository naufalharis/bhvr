// Chapter.tsx
import React, { useEffect, useState } from "react";
import Navbar from "./pages/Navbar";
import Sidebar from "./pages/Sidebar";
import "../styles/chapter.css";

interface Chapter {
  title: string;
  type: string;
  icon: string;
}

export default function Chapter() {
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // ambil data user dari localStorage
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setUserName(parsed.username || "User");
      } catch {
        setUserName("User");
      }
    }
  }, []);

  const chapters: Chapter[] = [
    {
      title: "Chapter 1: Introduction to Calculus",
      type: "Video",
      icon: "play_circle",
    },
    {
      title: "Chapter 2: Limits and Continuity",
      type: "Photos",
      icon: "image",
    },
    {
      title: "Chapter 3: Differentiation",
      type: "Explanation",
      icon: "description",
    },
    {
      title: "Chapter 4: Applications of Differentiation",
      type: "Video",
      icon: "play_circle",
    },
    {
      title: "Chapter 5: Integration",
      type: "Video",
      icon: "play_circle",
    },
    {
      title: "Chapter 6: Applications of Integration",
      type: "Photos",
      icon: "image",
    },
    {
      title: "Chapter 7: Differential Equations",
      type: "Explanation",
      icon: "description",
    },
    {
      title: "Chapter 8: Sequences and Series",
      type: "Video",
      icon: "play_circle",
    },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="main-content">
        {/* Navbar */}
        <Navbar userName={userName} onLogout={() => (window.location.href = "/login")} />

        {/* Page Content */}
        <main className="chapter-page">
          <div className="chapter-header">
            <h1>Calculus Chapters</h1>
          </div>

          <div className="chapter-list">
            {chapters.map((chapter, idx) => (
              <a key={idx} href="#" className="chapter-card">
                <div className="chapter-icon">
                  <span className="material-symbols-outlined">{chapter.icon}</span>
                </div>
                <div className="chapter-info">
                  <p className="chapter-title">{chapter.title}</p>
                  <p className="chapter-type">{chapter.type}</p>
                </div>
                <span className="material-symbols-outlined chevron">chevron_right</span>
              </a>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
