import React, { useEffect, useState } from "react";
import Sidebar from "./pages/Sidebar";
import Navbar from "./pages/Navbar";
import "../styles/home.css";
import { Link } from "react-router-dom";

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
  cover: string;
  slug: string;
  course_type: string;
}

export default function Home({ onLogout }: AppProps) {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [courseType, setCourseType] = useState("");
  const [courseSlug, setCourseSlug] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

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
    if (token) fetchCourses();
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setCoverImage(e.target.files[0]);
  };

  useEffect(() => {
    if (!coverImage) {
      setCoverPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(coverImage);
    setCoverPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [coverImage]);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !overview || !courseType || !courseSlug) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      if (!token) throw new Error("Unauthorized");

      let coverBase64: string | null = null;
      if (coverImage) {
        coverBase64 = await fileToBase64(coverImage);
      } else if (coverPreview) {
        coverBase64 = coverPreview;
      }

      const body = {
        title: courseTitle,
        overview,
        cover: coverBase64,
        course_type: courseType,
        slug: courseSlug,
      };

      let res: Response;
      if (courseId) {
        res = await fetch(`/api/courses/${courseId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/courses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save course");
      }

      await fetchCourses();
      setShowModal(false);
      resetForm();
      alert(courseId ? "Course updated successfully!" : "Course created successfully!");
    } catch (error: any) {
      console.error("Save course error:", error);
      alert(`Error saving course: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCourseId(null);
    setCourseTitle("");
    setOverview("");
    setCourseType("");
    setCourseSlug("");
    setCoverImage(null);
    setCoverPreview(null);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete course");
      await fetchCourses();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting course");
    }
  };

  const handleEdit = (course: Course) => {
    setCourseId(course.id);
    setCourseTitle(course.title);
    setOverview(course.overview);
    setCourseType(course.course_type);
    setCourseSlug(course.slug);
    setCoverPreview(course.cover);
    setShowModal(true);
  };

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Navbar userName={user ? user.first_name : "Loading..."} onLogout={onLogout} />
        <main className="content">
          <div className="cards">
            <div className="left-column">
              <div className="profile-card">
                <div>
                  <h3>{user ? user.first_name : "Loading..."}</h3>
                  <p>View your profile and settings</p>
                  <button>View Profile</button>
                </div>
              </div>

              <div className="courses-section">
                <div className="flex justify-between items-center mb-4">
                  <h2>Your Courses</h2>
                  <button
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                    onClick={() => {
                      resetForm();
                      setShowModal(true);
                    }}
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
                        <Link to={`/chapter/${course.id}`}>{course.title}</Link>
                          <p>{course.overview}</p>
                          <div className="flex space-x-2 mt-2">
                            <button
                              className="px-3 py-1 bg-green-500 text-white rounded"
                              onClick={() => handleEdit(course)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="px-3 py-1 bg-red-500 text-white rounded"
                              onClick={() => handleDelete(course.id)}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No courses available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="mb-4">{courseId ? "Edit Course" : "Create New Course"}</h2>
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
                <input type="file" accept="image/*" onChange={handleFileChange} />
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
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
