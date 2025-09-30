import React, { useEffect, useState } from "react";
import "../../styles/sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h1>StudyBuddy</h1>
      <nav>
        <ul>
          {/* Dashboard selalu ada */}
          <li>
            <a href="/home" className="active">Dashboard</a>
          </li>
          <li><a href="/enrolled"> Assignments</a></li>
          <li><a href="/chart"> Keranjang</a></li>
          <li><a href="#">👥 Community</a></li>
        </ul>
      </nav>
    </aside>
  );
}
