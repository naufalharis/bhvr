import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./pages/Sidebar";
import Navbar from "./pages/Navbar";
import "../styles/enrolled.css";

interface AppProps {
  onLogout: () => void;
}

interface EnrolledCourse {
  id: string;
  user_id: string;
  course_id: string | null;
  order_id: string | null;
  bundle_id: string | null;
  enrolled_date: string;
  course?: {
    id: string;
    title: string;
    course_type: string;
    overview: string;
    cover: string;
    slug: string;
  };
}

interface User {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  username: string;
  role: string;
}

export default function EnrolledCoursePage({ onLogout }: AppProps) {
  const [user, setUser] = useState<User | null>(null);
  const [enrolled, setEnrolled] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  /** Fetch data enrolled dari backend */
  const fetchEnrolled = async () => {
    try {
      const res = await fetch("/api/enrolled", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal memuat enrolled courses");
      }

      const data = await res.json();
      setEnrolled(data.enrolled || []);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  /** Ambil user dari localStorage */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse stored user:", err);
      }
    }
  }, []);

  useEffect(() => {
    fetchEnrolled();
  }, []);

  /** Navigasi ke halaman chapter */
  const handleViewCourse = (slug: string) => {
    navigate(`/chapter/${slug}`);
  };

  /** Pisahkan berdasarkan course_type */
  const singleCourses = enrolled.filter(
    (item) => item.course?.course_type === "single"
  );
  const bundleCourses = enrolled.filter(
    (item) => item.course?.course_type === "bundle"
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Section */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar
          userName={user ? user.first_name : "Loading..."}
          onLogout={onLogout}
        />

        <main className="enrolled-container">
          <h2>📚 My Enrolled Courses</h2>

          {loading ? (
            <p className="status-text">Loading enrolled courses...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : enrolled.length === 0 ? (
            <p className="status-text">Belum ada course yang di-enroll.</p>
          ) : (
            <>
              {/* Bagian Single Courses */}
              {singleCourses.length > 0 && (
                <section className="section-block">
                  <h3 className="section-title">🧩 Single Courses</h3>
                  <div className="enrolled-grid">
                    {singleCourses.map((item) => (
                      <div
                        key={item.id}
                        className="enrolled-card"
                        onClick={() =>
                          item.course?.slug && handleViewCourse(item.course.slug)
                        }
                      >
                        <img
                          src={item.course?.cover || "/placeholder.jpg"}
                          alt={item.course?.title}
                          className="enrolled-cover"
                        />
                        <div className="enrolled-content">
                          <h3>{item.course?.title || "Untitled Course"}</h3>
                          <p className="course-type">
                            {item.course?.course_type}
                          </p>
                          <p className="overview">
                            {item.course?.overview?.slice(0, 100) ||
                              "Tidak ada deskripsi..."}
                            ...
                          </p>
                          <p className="enrolled-date">
                            Enrolled on:{" "}
                            {new Date(
                              item.enrolled_date
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Bagian Bundle Courses */}
              {bundleCourses.length > 0 && (
                <section className="section-block">
                  <h3 className="section-title">📦 Bundle Courses</h3>
                  <div className="enrolled-grid">
                    {bundleCourses.map((item) => (
                      <div
                        key={item.id}
                        className="enrolled-card"
                        onClick={() =>
                          item.course?.slug && handleViewCourse(item.course.slug)
                        }
                      >
                        <img
                          src={item.course?.cover || "/placeholder.jpg"}
                          alt={item.course?.title}
                          className="enrolled-cover"
                        />
                        <div className="enrolled-content">
                          <h3>{item.course?.title || "Untitled Bundle"}</h3>
                          <p className="course-type">
                            {item.course?.course_type}
                          </p>
                          <p className="overview">
                            {item.course?.overview?.slice(0, 100) ||
                              "Tidak ada deskripsi..."}
                            ...
                          </p>
                          <p className="enrolled-date">
                            Enrolled on:{" "}
                            {new Date(
                              item.enrolled_date
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
