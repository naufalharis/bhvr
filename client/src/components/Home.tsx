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

interface ProductDetail {
  id: string;
  course_id: string;
  product_id: string;
  price: number;
  course: Course;
  product: Product;
}

interface Order {
  id: string;
  status: string;
  order_date: string;
}

interface OrderLine {
  id: string;
  order_id: string;
  course_id: string;
  product_id: string | null;
  status: string;
}

export default function Home({ onLogout }: AppProps) {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [orderDate, setOrderDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newCourseId, setNewCourseId] = useState<string | null>(null);
  const [newCourseData, setNewCourseData] = useState<Course | null>(null);
  const [clickedCourseSlug, setClickedCourseSlug] = useState<string | null>(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [courseForm, setCourseForm] = useState({
    title: "",
    overview: "",
    cover: null as File | null,
    coverPreview: "",
    course_type: "",
    slug: "",
  });

  const [productForm, setProductForm] = useState({
    title: "",
    overview: "",
    cover: null as File | null,
    coverPreview: "",
    product_type: "",
    price: "",
  });

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

  /** Fetch orders for student */
  const fetchOrders = async () => {
    if (!token || user?.role !== "student") return;
    try {
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data.orders || data.data || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  /** Fetch order lines for student */
  const fetchOrderLines = async () => {
    if (!token || user?.role !== "student") return;
    try {
      const res = await fetch("/api/order-lines", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrderLines(Array.isArray(data) ? data : data.order_lines || data.data || []);
      }
    } catch (error) {
      console.error("Error fetching order lines:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCourses();
      if (user?.role === "student") {
        fetchProducts();
        fetchOrders();
        fetchOrderLines();
      }
    }
  }, [token, user]);

  /** Check if student has access to a course */
  const hasCourseAccess = (courseSlug: string): boolean => {
    if (user?.role === "instructor") return true;
    if (user?.role !== "student") return false;

    // Find the course by slug to get its ID
    const course = courses.find(c => c.slug === courseSlug);
    if (!course) return false;

    // Check if there's an approved order line for this course
    const hasAccess = orderLines.some(line => 
      line.course_id === course.id && line.status === "approved"
    );

    return hasAccess;
  };

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

  /** Handle course title click */
  const handleCourseClick = (courseSlug: string, e: React.MouseEvent) => {
    if (user?.role === "student") {
      if (!hasCourseAccess(courseSlug)) {
        e.preventDefault();
        e.stopPropagation();
        setClickedCourseSlug(courseSlug);
        setShowAccessDeniedModal(true);
        return;
      }
    }
    // For instructors or students with access, allow navigation
    navigate(`/chapter/${courseSlug}`);
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

      // Collect all course IDs from selected products and courses
      const allCourseIds: string[] = [];

      // Add selected courses directly
      selectedCourses.forEach(courseId => {
        allCourseIds.push(courseId);
      });

      // Add courses from selected products
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

        // If product has a course_id, add it to the list
        if (product.course_id) {
          allCourseIds.push(product.course_id);
        }
      }

      // Create order lines for selected courses
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

      // Remove duplicate course IDs
      const uniqueCourseIds = [...new Set(allCourseIds)];
      
      // Store order and course data for chart page
      const orderDataForChart = {
        orderId,
        orderDate,
        courseIds: uniqueCourseIds,
        selectedProducts: selectedProducts.map(pId => {
          const product = products.find(p => p.id === pId);
          return {
            id: pId,
            title: product?.title,
            price: product?.price,
            course_id: product?.course_id
          };
        }),
        selectedCourses: selectedCourses.map(cId => {
          const course = courses.find(c => c.id === cId);
          return {
            id: cId,
            title: course?.title,
            course_type: course?.course_type
          };
        })
      };

      // Store in localStorage for chart page to access
      localStorage.setItem(`order_${orderId}`, JSON.stringify(orderDataForChart));

      alert("✅ Order berhasil dibuat! Mengarahkan ke halaman pembayaran...");
      
      // Reset state
      setSelectedProducts([]);
      setSelectedCourses([]);
      setOrderDate("");
      setShowOrderModal(false);
      
      // Refresh orders and order lines after successful order
      fetchOrders();
      fetchOrderLines();
      
      // Immediately navigate to chart page with order ID and course IDs
      navigate(`/chart/${orderId}`, { 
        state: { 
          orderId,
          courseIds: uniqueCourseIds,
          selectedProducts: selectedProducts,
          selectedCourses: selectedCourses
        }
      });
    } catch (err: any) {
      alert(`Error membuat order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /** Upload cover menjadi base64 */
  const uploadCover = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject("Gagal membaca file cover");
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  /** Reset course form */
  const resetCourseForm = () => {
    setCourseForm({
      title: "",
      overview: "",
      cover: null,
      coverPreview: "",
      course_type: "",
      slug: "",
    });
    setEditingCourse(null);
  };

  /** Reset product form */
  const resetProductForm = () => {
    setProductForm({
      title: "",
      overview: "",
      cover: null,
      coverPreview: "",
      product_type: "",
      price: "",
    });
    setNewCourseId(null);
    setNewCourseData(null);
  };

  /** Submit create course → lanjut buka modal product */
  const handleCreateCourse = async () => {
    if (!token || !user) return;
    if (!courseForm.title || !courseForm.slug) {
      alert("Title dan Slug wajib diisi!");
      return;
    }
    if (!courseForm.course_type) {
      alert("Pilih course type terlebih dahulu!");
      return;
    }

    setLoading(true);
    try {
      let coverBase64 = "";

      if (courseForm.cover) {
        coverBase64 = await uploadCover(courseForm.cover);
      } else if (editingCourse?.cover) {
        coverBase64 = editingCourse.cover;
      }

      const body = {
        title: courseForm.title,
        overview: courseForm.overview,
        slug: courseForm.slug,
        course_type: courseForm.course_type.toLowerCase(),
        cover: coverBase64 || "/placeholder.png",
      };

      const url = editingCourse
        ? `/api/courses/${editingCourse.id}`
        : "/api/courses";
      const method = editingCourse ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Gagal membuat course");
      }

      const responseData = await res.json();
      
      // Handle different response formats
      const createdCourse = responseData.course || responseData.data || responseData;
      const createdId = createdCourse.id;

      if (!createdId) {
        throw new Error("Course ID tidak ditemukan dalam response");
      }

      console.log("✅ Course created with ID:", createdId);
      setNewCourseId(createdId);
      setNewCourseData(createdCourse);

      alert(`✅ Course berhasil ${editingCourse ? "diperbarui" : "dibuat"}!`);

      // Reset form dan tutup modal course
      resetCourseForm();
      setShowCourseModal(false);
      fetchCourses();

      // Jika membuat course baru (bukan edit), buka modal product
      if (!editingCourse) {
        setTimeout(() => {
          setShowProductModal(true);
        }, 100); // Small delay to ensure state is updated
      }
    } catch (err: any) {
      console.error("❌ Error membuat course:", err);
      alert(`Error membuat course: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /** Submit product lalu otomatis buat product detail */
  const handleCreateProduct = async () => {
    if (!token || !user) return;
    if (!productForm.title || !productForm.product_type || !productForm.price) {
      alert("Semua field wajib diisi!");
      return;
    }

    if (!newCourseId) {
      alert("Error: Course ID tidak ditemukan. Silakan buat course terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      let coverBase64 = "";
      if (productForm.cover) {
        coverBase64 = await uploadCover(productForm.cover);
      }

      // 1. Buat product
      const productRes = await fetch("/api/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: productForm.title,
          overview: productForm.overview,
          cover: coverBase64 || "/placeholder.png",
          product_type: productForm.product_type,
          price: parseFloat(productForm.price),
        }),
      });

      if (!productRes.ok) {
        const errorText = await productRes.text();
        throw new Error(errorText || "Gagal membuat product");
      }

      const productData = await productRes.json();
      const productId = productData.data?.id || productData.id;

      if (!productId) {
        throw new Error("Product ID tidak ditemukan dalam response");
      }

      console.log("✅ Product created with ID:", productId);

      // 2. Buat product detail (relasi ke course)
      const detailRes = await fetch("/api/product-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: newCourseId,
          productId: productId,
          price: parseFloat(productForm.price),
        }),
      });

      if (!detailRes.ok) {
        const errorText = await detailRes.text();
        console.error("Product Detail Error Response:", errorText);
        
        // Even if product detail fails, we still have the product
        // We can try to handle this gracefully
        if (errorText.includes("course_id") || errorText.includes("course")) {
          console.warn("Product created but product detail failed. Course might not exist.");
        }
        throw new Error(`Gagal membuat product detail: ${errorText}`);
      }

      const detailData = await detailRes.json();
      console.log("✅ Product Detail created:", detailData);

      alert("✅ Product & Product Detail berhasil dibuat!");
      
      // Reset semua state dan tutup modal
      resetProductForm();
      setShowProductModal(false);
      fetchProducts();
    } catch (err: any) {
      console.error("❌ Error creating product:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /** Delete course */
  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Apakah yakin ingin menghapus course ini?")) return;
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus course");
      alert("✅ Course berhasil dihapus!");
      fetchCourses();
    } catch (err: any) {
      alert(`Error menghapus course: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /** Edit course */
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      overview: course.overview,
      cover: null,
      coverPreview: course.cover,
      course_type: course.course_type,
      slug: course.slug,
    });
    setShowCourseModal(true);
  };

  /** Handle cancel product modal */
  const handleCancelProductModal = () => {
    setShowProductModal(false);
    resetProductForm();
  };

  /** Handle cancel course modal */
  const handleCancelCourseModal = () => {
    setShowCourseModal(false);
    resetCourseForm();
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.course_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        
        {/* Search Bar Section */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg 
                className="search-icon" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
              <input
                type="text"
                placeholder="Search courses by title, description, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="clear-search-btn"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="search-results-info">
                Found {filteredCourses.length} course(s) matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        <main className="content">
          <div className="courses-section">
            <div className="courses-header">
              <h2>Your Courses</h2>
              {user?.role === "instructor" && (
                <button
                  className="create-course-btn"
                  onClick={() => setShowCourseModal(true)}
                >
                  ➕ Buat Course Baru
                </button>
              )}
              {user?.role === "student" && (
                <button
                  className="order-btn"
                  onClick={() => setShowOrderModal(true)}
                >
                  🛒 Order
                </button>
              )}
            </div>

            <div className="courses-grid">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="course-card"
                  >
                    <img
                      src={course.cover || "/placeholder.png"}
                      className="course-cover"
                      alt={course.title}
                    />
                    <div className="course-content">
                      <h3 className="course-title">
                        {user?.role === "instructor" || hasCourseAccess(course.slug) ? (
                          <Link
                            to={`/chapter/${course.slug}`}
                            className="course-link"
                          >
                            {course.title}
                          </Link>
                        ) : (
                          <span
                            className="course-link"
                            onClick={(e) => handleCourseClick(course.slug, e)}
                            style={{ cursor: 'pointer' }}
                          >
                            {course.title}
                          </span>
                        )}
                      </h3>
                      <p className="course-overview">
                        {course.overview}
                      </p>
                      <div className="course-footer">
                        <span className="course-type-badge">
                          {course.course_type}
                          {user?.role === "student" && !hasCourseAccess(course.slug) && (
                            <span style={{ marginLeft: '8px', fontSize: '0.7em', opacity: 0.8 }}>
                              🔒 Locked
                            </span>
                          )}
                        </span>
                        {user?.role === "instructor" && (
                          <div className="course-actions">
                            <button
                              className="edit-btn"
                              onClick={() => handleEditCourse(course)}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-courses">
                  <p className="no-courses-text">
                    {searchQuery ? "No courses found matching your search." : "Belum ada course tersedia."}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="clear-search-button"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Access Denied Modal for Students */}
      {showAccessDeniedModal && user?.role === "student" && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="access-denied-header">
              <div className="access-denied-icon">🔒</div>
              <h2 className="modal-title">Access Required</h2>
            </div>
            
            <div className="access-denied-message">
              <p>You need to purchase this course to access its chapters.</p>
              <p className="access-denied-subtitle">
                Course: <strong>{courses.find(c => c.slug === clickedCourseSlug)?.title}</strong>
              </p>
            </div>

            <div className="access-denied-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowAccessDeniedModal(false)}
              >
                Maybe Later
              </button>
              <button
                type="button"
                className="submit-btn"
                onClick={() => {
                  setShowAccessDeniedModal(false);
                  setShowOrderModal(true);
                }}
              >
                🛒 Order Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Order */}
      {showOrderModal && user?.role === "student" && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Order Courses</h2>

            <input
              type="text"
              placeholder="Search product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="modal-input"
            />

            <div className="modal-field">
              <label className="modal-label">Tanggal Order</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="modal-input"
                required
              />
            </div>

            <div className="modal-section-title">Products</div>
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-checkbox">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => toggleSelectProduct(product.id)}
                />
                <span className="product-info">
                  {product.title} - Rp{product.price}
                </span>
              </div>
            ))}

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowOrderModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="submit-btn"
                onClick={handleOrderSubmit}
                disabled={loading}
              >
                {loading ? "Processing..." : "✅ Submit Order & Proceed to Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create/Edit Course */}
      {showCourseModal && user?.role === "instructor" && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">
              {editingCourse ? "Edit Course" : "Buat Course Baru"}
            </h2>

            <input
              type="text"
              placeholder="Judul Course"
              value={courseForm.title}
              onChange={(e) =>
                setCourseForm({ ...courseForm, title: e.target.value })
              }
              className="modal-input"
            />
            <textarea
              placeholder="Overview"
              value={courseForm.overview}
              onChange={(e) =>
                setCourseForm({ ...courseForm, overview: e.target.value })
              }
              className="modal-textarea"
              rows={3}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : null;
                if (file) {
                  setCourseForm({
                    ...courseForm,
                    cover: file,
                    coverPreview: URL.createObjectURL(file),
                  });
                }
              }}
              className="modal-input"
            />
            {courseForm.coverPreview && (
              <img
                src={courseForm.coverPreview}
                alt="Cover Preview"
                className="cover-preview"
              />
            )}

            <select
              value={courseForm.course_type}
              onChange={(e) =>
                setCourseForm({ ...courseForm, course_type: e.target.value })
              }
              className="modal-input"
            >
              <option value="">-- Pilih Course Type --</option>
              <option value="single">SINGLE</option>
              <option value="bundle">BUNDLE</option>
            </select>
            <input
              type="text"
              placeholder="Slug"
              value={courseForm.slug}
              onChange={(e) =>
                setCourseForm({ ...courseForm, slug: e.target.value })
              }
              className="modal-input"
            />

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancelCourseModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="submit-btn"
                onClick={handleCreateCourse}
                disabled={loading}
              >
                {loading 
                  ? "Processing..." 
                  : editingCourse 
                    ? "✅ Update Course" 
                    : "✅ Create Course & Add Product"
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create Product */}
      {showProductModal && user?.role === "instructor" && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Buat Product untuk Course</h2>
            
            {newCourseData && (
              <div className="success-message">
                <p className="success-text">
                  <strong>Course Berhasil Dibuat:</strong> {newCourseData.title}
                </p>
              </div>
            )}
            
            <input
              type="text"
              placeholder="Judul Product"
              value={productForm.title}
              onChange={(e) =>
                setProductForm({ ...productForm, title: e.target.value })
              }
              className="modal-input"
            />
            <textarea
              placeholder="Overview"
              value={productForm.overview}
              onChange={(e) =>
                setProductForm({ ...productForm, overview: e.target.value })
              }
              className="modal-textarea"
              rows={3}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : null;
                if (file) {
                  setProductForm({
                    ...productForm,
                    cover: file,
                    coverPreview: URL.createObjectURL(file),
                  });
                }
              }}
              className="modal-input"
            />
            {productForm.coverPreview && (
              <img
                src={productForm.coverPreview}
                alt="Product Cover Preview"
                className="cover-preview"
              />
            )}
            <select
              value={productForm.product_type}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  product_type: e.target.value,
                })
              }
              className="modal-input"
            >
              <option value="">-- Pilih Product Type --</option>
              <option value="bundle">Bundle</option>
              <option value="course">Course</option>
              <option value="merchandise">Merchandise</option>
            </select>
            <input
              type="number"
              placeholder="Harga"
              value={productForm.price}
              onChange={(e) =>
                setProductForm({ ...productForm, price: e.target.value })
              }
              className="modal-input"
            />
            
            <div className="info-message">
              <p className="info-text">
                <strong>Info:</strong> Product ini akan dikaitkan dengan course yang baru dibuat.
                <br />
                <strong>Course ID:</strong> <code>{newCourseId}</code>
                {newCourseData && (
                  <>
                    <br />
                    <strong>Course Title:</strong> {newCourseData.title}
                  </>
                )}
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancelProductModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="submit-btn"
                onClick={handleCreateProduct}
                disabled={loading}
              >
                {loading ? "Processing..." : "✅ Submit Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}