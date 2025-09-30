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
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);

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

  /** Fetch courses */
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

  /** Fetch products */
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
  }, [token, user]);

  /** Toggle select product */
  const toggleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  /** Toggle select course */
  const toggleSelectCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  /** Submit order + order lines */
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
      // step 1: create order
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

      // step 2: create order-lines
      for (const pId of selectedProducts) {
        const product = products.find((p) => p.id === pId);
        if (!product) continue;
        await fetch("/api/order-lines", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_id: orderId,
            product_id: product.id,
            course_id: product.course_id ?? null,
            status: "pending",
          }),
        });
      }

      for (const cId of selectedCourses) {
        await fetch("/api/order-lines", {
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

      alert("✅ Order berhasil dibuat!");
      setSelectedProducts([]);
      setSelectedCourses([]);
      setOrderDate("");
      setShowOrderModal(false);

      // redirect ke halaman payment
      navigate(`/payment/${orderId}`);
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
        <Navbar
          userName={user ? user.first_name : "Loading..."}
          onLogout={onLogout}
        />
        <main className="content">
          <div className="profile-card">
            <h3>{user ? user.first_name : "Loading..."}</h3>
            <p>Role: {user?.role || "Unknown"}</p>
            <button>View Profile</button>
          </div>

          {/* Course Section */}
          <div className="courses-section">
            <div className="flex justify-between items-center mb-4">
              <h2>Your Courses</h2>
              {user?.role === "instructor" && (
                <button
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white"
                  onClick={() => navigate("/create-course")}
                >
                  ➕ Buat Course Baru
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

            {/* Card Courses */}
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
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {course.overview}
                    </p>
                    <Link
                      to={`/course/${course.slug}`}
                      className="mt-2 inline-block text-blue-500 hover:underline"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Belum ada course tersedia.</p>
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
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => toggleSelectProduct(product.id)}
                />
                <span>
                  {product.title} - Rp{product.price}
                </span>
              </div>
            ))}

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
                disabled={loading}
              >
                {loading ? "Processing..." : "✅ Submit Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
