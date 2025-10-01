// src/components/Home.tsx
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
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [modalStep, setModalStep] = useState<"course" | "product" | "details">("course");
  const [courseId, setCourseId] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);

  // Form states
  const [courseTitle, setCourseTitle] = useState("");
  const [courseType, setCourseType] = useState<"single" | "bundle">("single");
  const [courseCover, setCourseCover] = useState("");
  const [courseOverview, setCourseOverview] = useState("");
  const [courseSlug, setCourseSlug] = useState("");

  const [productTitle, setProductTitle] = useState("");
  const [productOverview, setProductOverview] = useState("");
  const [productCover, setProductCover] = useState("");
  const [productType, setProductType] = useState<"course" | "bundle" | "merchandise">("course");
  const [productPrice, setProductPrice] = useState<number>(0);

  const token = localStorage.getItem("token");

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

  /** Fetch courses */
  const fetchCourses = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.error("Fetch courses failed:", await res.text());
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

  /** Submit course form */
  const handleCourseSubmit = async () => {
    if (!courseTitle || !courseOverview || !courseSlug || !courseCover) {
      alert("Lengkapi semua field course!");
      return;
    }
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: courseTitle,
          course_type: courseType,
          overview: courseOverview,
          slug: courseSlug,
          cover: courseCover, // URL atau base64
        }),
      });

      const text = await res.text();
      console.log("Course submit response:", res.status, text);

      if (!res.ok) throw new Error(text || "Gagal membuat course");

      const data = JSON.parse(text);
      setCourseId(data.course.id);
      setModalStep("product");
    } catch (err: any) {
      console.error("Error creating course:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /** Submit product form */
  const handleProductSubmit = async () => {
    if (!productTitle || !productOverview || !productCover || !courseId) {
      alert("Lengkapi semua field product!");
      return;
    }
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: productTitle,
          overview: productOverview,
          cover: productCover,
          product_type: productType,
          price: productPrice,
          course_id: courseId,
        }),
      });

      const text = await res.text();
      console.log("Product submit response:", res.status, text);

      if (!res.ok) throw new Error(text || "Gagal membuat product");

      const data = JSON.parse(text);
      setProductId(data.product.id);
      setModalStep("details");
    } catch (err: any) {
      console.error("Error creating product:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /** Render modal content */
  const renderModalContent = () => {
    if (modalStep === "course") {
      return (
        <>
          <h2 className="mb-4 font-bold text-lg">Buat Course Baru</h2>
          <input
            type="text"
            placeholder="Title"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            className="w-full border px-2 py-1 rounded mb-2"
          />
          <select
            value={courseType}
            onChange={(e) => setCourseType(e.target.value as "single" | "bundle")}
            className="w-full border px-2 py-1 rounded mb-2"
          >
            <option value="single">Single</option>
            <option value="bundle">Bundle</option>
          </select>
          <input
            type="text"
            placeholder="Cover URL"
            value={courseCover}
            onChange={(e) => setCourseCover(e.target.value)}
            className="w-full border px-2 py-1 rounded mb-2"
          />
          <textarea
            placeholder="Overview"
            value={courseOverview}
            onChange={(e) => setCourseOverview(e.target.value)}
            className="w-full border px-2 py-1 rounded mb-2"
          />
          <input
            type="text"
            placeholder="Slug"
            value={courseSlug}
            onChange={(e) => setCourseSlug(e.target.value)}
            className="w-full border px-2 py-1 rounded mb-2"
          />
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={() => setShowInstructorModal(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handleCourseSubmit}
              disabled={loading}
            >
              {loading ? "Processing..." : "Buat Course"}
            </button>
          </div>
        </>
      );
    } else if (modalStep === "product") {
      return (
        <>
          <h2 className="mb-4 font-bold text-lg">Tambah Product</h2>
          <input
            type="text"
            placeholder="Title"
            value={productTitle}
            onChange={(e) => setProductTitle(e.target.value)}
            className="w-full border px-2 py-1 rounded mb-2"
          />
          <textarea
            placeholder="Overview"
            value={productOverview}
            onChange={(e) => setProductOverview(e.target.value)}
            className="w-full border px-2 py-1 rounded mb-2"
          />
          <input
            type="text"
            placeholder="Cover URL"
            value={productCover}
            onChange={(e) => setProductCover(e.target.value)}
            className="w-full border px-2 py-1 rounded mb-2"
          />
          <select
            value={productType}
            onChange={(e) =>
              setProductType(e.target.value as "course" | "bundle" | "merchandise")
            }
            className="w-full border px-2 py-1 rounded mb-2"
          >
            <option value="course">Course</option>
            <option value="bundle">Bundle</option>
            <option value="merchandise">Merchandise</option>
          </select>
          <input
            type="number"
            placeholder="Price"
            value={productPrice}
            onChange={(e) => setProductPrice(parseFloat(e.target.value))}
            className="w-full border px-2 py-1 rounded mb-2"
          />
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={() => setModalStep("course")}
            >
              Back
            </button>
            <button
              className="px-4 py-2 bg-green-500 text-white rounded"
              onClick={handleProductSubmit}
              disabled={loading}
            >
              {loading ? "Processing..." : "Tambah Product"}
            </button>
          </div>
        </>
      );
    } else if (modalStep === "details") {
      const course = courses.find((c) => c.id === courseId);
      return (
        <>
          <h2 className="mb-4 font-bold text-lg">Product & Course Details</h2>
          <div className="mb-2">
            <h3 className="font-semibold">Course:</h3>
            <p>{course?.title}</p>
          </div>
          <div className="mb-2">
            <h3 className="font-semibold">Product:</h3>
            <p>{productTitle}</p>
            <p>Type: {productType}</p>
            <p>Price: Rp{productPrice}</p>
          </div>
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => {
                setShowInstructorModal(false);
                fetchCourses();
                // reset modal states
                setModalStep("course");
                setCourseId(null);
                setProductId(null);
                setCourseTitle("");
                setCourseOverview("");
                setCourseSlug("");
                setCourseCover("");
                setProductTitle("");
                setProductOverview("");
                setProductCover("");
                setProductPrice(0);
                setProductType("course");
              }}
            >
              Close
            </button>
          </div>
        </>
      );
    }
  };

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Navbar userName={user ? user.first_name : "Loading..."} onLogout={onLogout} />
        <main className="content">
          <div className="profile-card">
            <h3>{user ? user.first_name : "Loading..."}</h3>
            <p>Role: {user?.role || "Unknown"}</p>
          </div>

          {/* Course Section */}
          <div className="courses-section">
            <div className="flex justify-between items-center mb-4">
              <h2>Your Courses</h2>
              {user?.role === "instructor" && (
                <button
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white"
                  onClick={() => setShowInstructorModal(true)}
                >
                  ➕ Buat Course Baru
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <div
                    key={course.id}
                    className="border rounded-lg p-4 shadow hover:shadow-lg transition"
                  >
                    <img
                      src={course.cover}
                      alt={course.title}
                      className="w-full h-40 object-cover rounded mb-2"
                    />
                    <h3 className="font-bold text-lg">{course.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{course.overview}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Belum ada course tersedia.</p>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Instructor Modal */}
      {showInstructorModal && user?.role === "instructor" && (
        <div className="modal-overlay">
          <div className="modal">{renderModalContent()}</div>
        </div>
      )}
    </div>
  );
}
