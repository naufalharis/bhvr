import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./pages/Sidebar";
import Navbar from "./pages/Navbar";

interface EnrolledCourse {
  id: string;
  user_id: string;
  course_id: string | null;
  order_id: string | null;
  bundle_id: string | null;
  enrolled_date: string;
  order?: any;
  course?: any;
}

export default function EnrolledCoursePage() {
  const [enrolled, setEnrolled] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchEnrolled = async () => {
    try {
      const res = await fetch("/api/enrolled", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal fetch enrolled courses");
      }

      const data = await res.json();
      setEnrolled(data.enrolled || []);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Terjadi error saat fetch enrolled courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolled();
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <main style={{ padding: "20px", flex: 1 }}>
          <h2 style={titleStyle}>📚 Enrolled Courses</h2>

          {loading ? (
            <p style={{ padding: "20px", color: "#555" }}>
              Loading enrolled courses...
            </p>
          ) : error ? (
            <p style={{ padding: "20px", color: "red" }}>{error}</p>
          ) : enrolled.length === 0 ? (
            <p style={{ marginTop: "12px", color: "#666" }}>
              Belum ada course yang di-enroll.
            </p>
          ) : (
            <div style={cardGrid}>
              {enrolled.map((item) => (
                <div key={item.id} style={cardStyle}>
                  <h3 style={courseTitle}>
                    {item.course?.title || "Untitled Course"}
                  </h3>
                  <p style={courseMeta}>
                    <strong>Enrolled Date:</strong>{" "}
                    {new Date(item.enrolled_date).toLocaleDateString()}
                  </p>
                  <p style={courseMeta}>
                    <strong>Order ID:</strong> {item.order_id || "-"}
                  </p>
                  <p style={courseMeta}>
                    <strong>Course ID:</strong> {item.course_id || "-"}
                  </p>
                  <p style={courseMeta}>
                    <strong>Bundle ID:</strong> {item.bundle_id || "-"}
                  </p>
                  <div style={footerCard}>
                    {item.course_id && (
                      <button
                        onClick={() => navigate(`/courses/${item.course_id}`)}
                        style={btnStyle}
                      >
                        Lihat Course
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Styles
const titleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "600",
  marginBottom: "16px",
  color: "#111827",
};

const cardGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "20px",
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  padding: "16px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const courseTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1f2937",
  marginBottom: "8px",
};

const courseMeta: React.CSSProperties = {
  fontSize: "14px",
  color: "#4b5563",
  margin: "4px 0",
};

const footerCard: React.CSSProperties = {
  marginTop: "12px",
  display: "flex",
  justifyContent: "flex-end",
};

const btnStyle: React.CSSProperties = {
  padding: "8px 12px",
  background: "#2563eb",
  color: "#fff",
  fontSize: "14px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};
