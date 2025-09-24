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

interface Product {
  id: string;
  title: string;
  overview: string;
  cover: string;
  product_type: string;
  price: number;
  course_id: string | null;
}

export default function Home({ onLogout }: AppProps) {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // form course
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [courseType, setCourseType] = useState("single");
  const [courseSlug, setCourseSlug] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // form order
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
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
      if (!res.ok) return;
      const data: Course[] = await res.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  /** Fetch products dari API */
  const fetchProducts = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/product", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCourses();
      if (user?.role === "student") {
        fetchProducts();
      }
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [token, user]);

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

  /** Helper convert file ke base64 */
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
      if (!res.ok) throw new Error("Failed to save course");
      await fetchCourses();
      setShowModal(false);
      resetForm();
      alert(courseId ? "Course updated!" : "Course created!");
    } catch (error: any) {
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
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete course");
      await fetchCourses();
    } catch (error) {
      alert("Error deleting course");
    }
  };

  /** Edit course */
  const handleEdit = (course: Course) => {
    if (user?.role !== "instructor") return;
    setCourseId(course.id);
    setCourseTitle(course.title);
    setOverview(course.overview);
    setCourseType(course.course_type || "single");
    setCourseSlug(course.slug);
    setCoverPreview(course.cover);
    setShowModal(true);
  };

  /** Toggle select product untuk order */
  const toggleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  /** Toggle select course untuk order */
  const toggleSelectCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  /** Submit order */
  const handleOrderSubmit = async () => {
    if (!token || !user) return;
    if (selectedProducts.length === 0 && selectedCourses.length === 0) {
      alert("Pilih minimal satu product atau course untuk order.");
      return;
    }
    if (!orderDate) {
      alert("Pilih tanggal order terlebih dahulu.");
      return;
    }
    setLoading(true);
    try {
      // buat order
      const resOrder = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "pending", order_date: orderDate }),
      });
      if (!resOrder.ok) throw new Error("Gagal membuat order");
      const orderData = await resOrder.json();
      const orderId = orderData.order.id;

      // order-lines dari products
      for (const pId of selectedProducts) {
        const product = products.find((p) => p.id === pId);
        if (!product) continue;
        await fetch("/api/student/order-lines", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_id: orderId,
            product_id: product.id,
            course_id: product.course_id,
            status: "pending",
          }),
        });
      }

      // order-lines dari courses
      for (const cId of selectedCourses) {
        await fetch("/api/student/order-lines", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_id: orderId,
            product_id: null,
            course_id: cId,
            status: "pending",
          }),
        });
      }

      alert("Order berhasil dibuat!");
      setSelectedProducts([]);
      setSelectedCourses([]);
      setOrderDate("");
      setShowOrderModal(false);
      navigate("/chart");
    } catch (err: any) {
      alert(`Error membuat order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /** Filter product by search */
  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Navbar userName={user ? user.first_name : "Loading..."} onLogout={onLogout} />
        <main className="content">
          <div className="profile-card">
            <h3>{user ? user.first_name : "Loading..."}</h3>
            <p>Role: {user?.role || "Unknown"}</p>
            <button>View Profile</button>
          </div>

          <div className="courses-section">
            <div className="flex justify-between items-center mb-4">
              <h2>Your Courses</h2>

              {user?.role === "instructor" && (
                <button
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white"
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
                  className="px-4 py-2 rounded-lg bg-green-500 text-white"
                  onClick={() => setShowOrderModal(true)}
                >
                  🛒 Order
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
            <h2 className="mb-4">Order</h2>

            <input
              type="text"
              placeholder="Search product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 py-1 border rounded mb-3"
            />

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

            <div className="mb-2 font-semibold">Products</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleSelectProduct(product.id)}
                  />
                  <span>
                    {product.title} - Rp{product.price}
                    {product.course_id && (
                      <span style={{ color: "gray", fontSize: 12 }}>
                        {" "}
                        ({courses.find((c) => c.id === product.course_id)?.title || "Course"})
                      </span>
                    )}
                  </span>
                </div>
              ))}
              {filteredProducts.length === 0 && <p>No products found.</p>}
            </div>

            <div className="mt-4 mb-2 font-semibold">Courses</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course.id)}
                    onChange={() => toggleSelectCourse(course.id)}
                  />
                  <span>{course.title}</span>
                </div>
              ))}
              {courses.length === 0 && <p>No courses available.</p>}
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

              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
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
