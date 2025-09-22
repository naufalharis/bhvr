// src/components/Home.tsx
import React, { useEffect, useState } from "react";
import Sidebar from "./pages/Sidebar";
import Navbar from "./pages/Navbar";
import "../styles/home.css";
import { Link, useNavigate } from "react-router-dom";

interface AppProps {
  onLogout: () => void;
}

interface User {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  username: string;
  role: string; // instructor | student
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
  const [showOrderModal, setShowOrderModal] = useState(false);

  // form course
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [courseType, setCourseType] = useState("single"); // default
  const [courseSlug, setCourseSlug] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // form order
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [orderDate, setOrderDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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

  /** Fetch courses dari API */
  const fetchCourses = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Failed to fetch courses:", err.error || res.statusText);
        return;
      }

      const data: Course[] = await res.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    if (token) fetchCourses();
  }, [token]);

  /** File upload handler */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  /** Generate preview ketika ada file baru */
  useEffect(() => {
    if (!coverImage) {
      setCoverPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(coverImage);
    setCoverPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [coverImage]);

  /** Helper untuk convert file ke base64 */
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  /** Submit form (Create/Update Course) */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !overview || !courseSlug) {
      alert("Please fill all fields.");
      return;
    }

    if (user?.role !== "instructor") {
      alert("Hanya instructor yang bisa mengelola course.");
      return;
    }

    setLoading(true);
    try {
      if (!token) throw new Error("Unauthorized");

      let coverBase64: string | null = null;
      if (coverImage) {
        coverBase64 = await fileToBase64(coverImage);
      } else if (coverPreview && !coverPreview.startsWith("blob:")) {
        coverBase64 = coverPreview;
      }

      const body = {
        title: courseTitle,
        overview,
        cover: coverBase64 || "",
        course_type: courseType || "single",
        slug: courseSlug,
      };

      const url = courseId ? `/api/courses/${courseId}` : "/api/courses";
      const method = courseId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

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

  /** Reset form */
  const resetForm = () => {
    setCourseId(null);
    setCourseTitle("");
    setOverview("");
    setCourseType("single");
    setCourseSlug("");
    setCoverImage(null);
    setCoverPreview(null);
  };

  /** Delete course */
  const handleDelete = async (id: string) => {
    if (!token) return;

    if (user?.role !== "instructor") {
      alert("Hanya instructor yang bisa menghapus course.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this course?")) return;

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

  /** Edit course */
  const handleEdit = (course: Course) => {
    if (user?.role !== "instructor") {
      alert("Hanya instructor yang bisa edit course.");
      return;
    }
    setCourseId(course.id);
    setCourseTitle(course.title);
    setOverview(course.overview);
    setCourseType(course.course_type || "single");
    setCourseSlug(course.slug);
    setCoverPreview(course.cover);
    setShowModal(true);
  };

  /** Toggle select course untuk order */
  const toggleSelectCourse = (id: string) => {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  /** Submit order ke backend */
  const handleOrderSubmit = async () => {
    if (!token || !user) return;

    if (selectedCourses.length === 0) {
      alert("Pilih minimal satu course untuk order.");
      return;
    }
    if (!orderDate) {
      alert("Pilih tanggal order terlebih dahulu.");
      return;
    }

    try {
      // Step 1: Buat order
      const resOrder = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "pending", order_date: orderDate }),
      });

      if (!resOrder.ok) {
        const err = await resOrder.json().catch(() => ({}));
        throw new Error(err.error || "Gagal membuat order");
      }

      const orderData = await resOrder.json();
      const orderId = orderData.order.id;

      // Step 2: Tambahkan order lines untuk setiap course ke API baru
      for (const cId of selectedCourses) {
        await fetch("/api/order-lines", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_id: orderId,
            product_id: cId,
            course_id: cId,
            status: "pending",
          }),
        });
      }

      alert("Order berhasil dibuat!");
      setSelectedCourses([]);
      setOrderDate("");
      setShowOrderModal(false);
      navigate("/chart");
    } catch (err: any) {
      console.error("Order submit error:", err);
      alert(`Error membuat order: ${err.message}`);
    }
  };

  /** Filter course by search */
  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Navbar userName={user ? user.first_name : "Loading..."} onLogout={onLogout} />
        <main className="content">
          {/* Profile Card */}
          <div className="profile-card">
            <h3>{user ? user.first_name : "Loading..."}</h3>
            <p>Role: {user?.role || "Unknown"}</p>
            <button>View Profile</button>
          </div>

          {/* Courses Section */}
          <div className="courses-section">
            <div className="flex justify-between items-center mb-4">
              <h2>Your Courses</h2>

              {user?.role === "instructor" && (
                <button
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                >
                  ➕ Add New Course
                </button>
              )}

              {user?.role === "student" && (
                <button
                  className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                  onClick={() => setShowOrderModal(true)}
                >
                  🛒 Order Course
                </button>
              )}
            </div>

            <div className="course-list">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <div key={course.id} className="course-card">
                    {course.cover && (
                      <img src={course.cover} alt={course.title} className="course-cover" />
                    )}
                    <div className="course-info">
                      <Link to={`/chapter/${course.id}`}>
                        <h3>{course.title}</h3>
                      </Link>
                      <p>{course.overview}</p>

                      {user?.role === "instructor" && (
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
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>No courses available.</p>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal Order */}
      {showOrderModal && user?.role === "student" && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="mb-4">Order Courses</h2>

            {/* Search */}
            <input
              type="text"
              placeholder="Search course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 py-1 border rounded mb-3"
            />

            {/* Order Date */}
            <div className="mb-3">
              <label className="block mb-1">Tanggal Order</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-2 py-1 border rounded"
                required
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredCourses.map((course) => (
                <div key={course.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course.id)}
                    onChange={() => toggleSelectCourse(course.id)}
                  />
                  <span>{course.title}</span>
                </div>
              ))}
              {filteredCourses.length === 0 && <p>No courses found.</p>}
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowOrderModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={handleOrderSubmit}
              >
                ✅ Submit Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Course */}
      {showModal && user?.role === "instructor" && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="mb-4">{courseId ? "Edit Course" : "Add New Course"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Course Title"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="w-full px-2 py-1 border rounded"
                required
              />
              <textarea
                placeholder="Overview"
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                className="w-full px-2 py-1 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Slug"
                value={courseSlug}
                onChange={(e) => setCourseSlug(e.target.value)}
                className="w-full px-2 py-1 border rounded"
                required
              />
              <select
                value={courseType}
                onChange={(e) => setCourseType(e.target.value)}
                className="w-full px-2 py-1 border rounded"
                required
              >
                <option value="single">Single</option>
                <option value="bundle">Bundle</option>
              </select>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
              {coverPreview && (
                <img src={coverPreview} alt="Preview" className="w-32 h-32 object-cover mt-2" />
              )}
              <div className="flex justify-end space-x-2">
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
