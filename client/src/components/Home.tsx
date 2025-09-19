import React, { useEffect, useState } from "react";
import "../styles/home.css";

interface AppProps {
  onLogout: () => void;
}

interface User {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  username: string;
}

interface Course {
  id: string;
  title: string;
  overview: string;
  cover: string; // Base64 string atau URL
  slug: string;
  course_type: string;
}

export default function Home({ onLogout }: AppProps) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form states (modal)
  const [courseTitle, setCourseTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [courseType, setCourseType] = useState("");
  const [courseSlug, setCourseSlug] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch user & courses
  const fetchCourses = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil course");
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal mengambil data user");
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
    fetchCourses();
  }, [token]);

  // Theme handling
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

  // Drag & drop / click handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setCoverImage(e.target.files[0]);
  };

  // Preview cover
  useEffect(() => {
    if (!coverImage) {
      setCoverPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(coverImage);
    setCoverPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [coverImage]);

  // Convert file ke Base64
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !overview || !courseType || !courseSlug || !coverImage) {
      alert("Please fill all fields and upload a cover image.");
      return;
    }

    setLoading(true);
    try {
      if (!token) throw new Error("Unauthorized");

      const coverBase64 = await fileToBase64(coverImage);

      const body = {
        title: courseTitle,
        overview,
        cover: coverBase64,
        course_type: courseType,
        slug: courseSlug,
      };

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create course");
      }

      await fetchCourses(); // refresh courses
      setShowModal(false);
      // reset form
      setCourseTitle("");
      setOverview("");
      setCourseType("");
      setCourseSlug("");
      setCoverImage(null);
      setCoverPreview(null);
      alert("Course created successfully!");
    } catch (error: any) {
      console.error("Create course error:", error);
      alert(`Error creating course: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <h1>StudyBuddy</h1>
        <nav>
          <ul>
            <li><a href="#" className="active">Dashboard</a></li>
            <li><a href="#">📝 Assignments</a></li>
            <li><a href="#">📈 Progress</a></li>
            <li><a href="#">👥 Community</a></li>
          </ul>
        </nav>
      </aside>

      {/* Main */}
      <div className="main">
        <header className="header">
          <h2>Welcome back, {user ? user.username : "Loading..."}</h2>
          <div className="actions">
            <select
              value={theme}
              onChange={(e) =>
                setTheme(e.target.value as "light" | "dark" | "system")
              }
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

        {/* Content */}
        <main className="content">
          <div className="cards">
            <div className="left-column">
              {/* Profile Card */}
              <div className="profile-card">
                <div>
                  <h3>{user ? user.username : "Loading..."}</h3>
                  <p>View your profile and settings</p>
                  <button>View Profile</button>
                </div>
              </div>

              {/* Courses Section */}
              <div className="courses-section">
                <div className="flex justify-between items-center mb-4">
                  <h2>Your Courses</h2>
                  <button
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                    onClick={() => setShowModal(true)}
                  >
                    ➕ Add New Course
                  </button>
                </div>

                <div className="course-list">
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <div key={course.id} className="course-card">
                        {course.cover && (
                          <img src={course.cover} alt={course.title} className="course-cover" />
                        )}
                        <div className="course-info">
                          <h3>{course.title}</h3>
                          <p>{course.overview}</p>
                          <button>Continue</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Loading courses...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="mb-4">Create New Course</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label>Course Title</label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Overview</label>
                <textarea
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Course Type</label>
                <select
                  value={courseType}
                  onChange={(e) => setCourseType(e.target.value)}
                  required
                >
                  <option value="">Select type</option>
                  <option value="single">Single</option>
                  <option value="bundle">Bundle</option>
                </select>
              </div>

              <div>
                <label>Course Slug</label>
                <input
                  type="text"
                  value={courseSlug}
                  onChange={(e) => setCourseSlug(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Cover Image</label>
                <input type="file" accept="image/*" onChange={handleFileChange} required />
                {coverPreview && <img src={coverPreview} alt="Cover Preview" className="w-full mt-2" />}
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
