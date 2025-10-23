// src/components/Home.tsx
import React, { useEffect, useState } from "react";
import "../styles/home.css";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "../icons";

interface AppProps {
  onLogout?: () => void;
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
  instructor_name?: string;
  instructor_username?: string;
  rating?: number;
  total_ratings?: number;
  total_hours?: number;
  level?: string;
  original_price?: number;
  discount_price?: number;
}

interface Product {
  id: string;
  title: string;
  overview: string;
  cover: string;
  product_type: string;
  price: number;
  course_id: string | null;
  instructor_name?: string;
  instructor_username?: string;
  rating?: number;
  total_ratings?: number;
  total_hours?: number;
  level?: string;
  original_price?: number;
  discount_price?: number;
  is_bestseller?: boolean;
  user_rating?: number; // User's personal rating
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
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showQuickOrderModal, setShowQuickOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quickOrderProduct, setQuickOrderProduct] = useState<Product | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  /** Fetch courses for instructor */
  const fetchCourses = async () => {
    if (!token || user?.role !== "instructor") return;
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

  /** Fetch products for student */
  const fetchProducts = async () => {
    if (!token || user?.role !== "student") return;
    try {
      const res = await fetch("/api/product", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();

      // Transform data from API
      const transformedProducts: Product[] = Array.isArray(data) ? data : data.data || [];

      // Load user ratings from localStorage
      const productsWithRatings = transformedProducts.map(product => {
        const savedRating = localStorage.getItem(`rating_${product.id}_${user?.id}`);
        return {
          ...product,
          user_rating: savedRating ? parseInt(savedRating) : 0
        };
      });

      setProducts(productsWithRatings);
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
      if (user?.role === "instructor") {
        fetchCourses();
      } else if (user?.role === "student") {
        fetchProducts();
        fetchOrders();
        fetchOrderLines();
      }
    }
  }, [token, user]);

  /** Handle product title click */
  const handleProductClick = (productId: string, e: React.MouseEvent) => {
    navigate(`/product/${productId}`);
  };

  /** Handle course title click */
  const handleCourseClick = (courseSlug: string, e: React.MouseEvent) => {
    navigate(`/chapter/${courseSlug}`);
  };

  /** Handle quick order button click */
  const handleQuickOrder = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickOrderProduct(product);
    setShowQuickOrderModal(true);
  };

  /** Submit single product order */
  const handleQuickOrderSubmit = async () => {
    if (!token || !user || !quickOrderProduct) return;

    setLoading(true);
    try {
      // Use today's date automatically
      const today = new Date().toISOString().split('T')[0];

      const resOrder = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "pending", order_date: today }),
      });
      if (!resOrder.ok) throw new Error("Gagal membuat order");
      const orderData = await resOrder.json();
      const orderId = orderData.order.id;

      // Create order line for the quick order product
      await fetch("/api/order-lines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          product_id: quickOrderProduct.id,
          course_id: quickOrderProduct.course_id ?? null,
          status: "pending",
        }),
      });

      // Store order data for chart page
      const orderDataForChart = {
        orderId,
        orderDate: today,
        selectedProducts: [{
          id: quickOrderProduct.id,
          title: quickOrderProduct.title,
          price: quickOrderProduct.price,
          course_id: quickOrderProduct.course_id
        }]
      };

      // Store in localStorage for chart page to access
      localStorage.setItem(`order_${orderId}`, JSON.stringify(orderDataForChart));

      alert("✅ Order berhasil dibuat! Mengarahkan ke halaman pembayaran...");

      // Reset state
      setShowQuickOrderModal(false);
      setQuickOrderProduct(null);

      // Refresh orders and order lines after successful order
      fetchOrders();
      fetchOrderLines();

      // Navigate to chart page with order ID
      navigate(`/chart/${orderId}`, {
        state: {
          orderId,
          selectedProducts: [quickOrderProduct.id]
        }
      });
    } catch (err: any) {
      alert(`Error membuat order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /** Handle rating click */
  const handleRatingClick = async (productId: string, rating: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) return;

    try {
      // Save rating to localStorage
      localStorage.setItem(`rating_${productId}_${user.id}`, rating.toString());

      // Update products state with new rating
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId
            ? { ...product, user_rating: rating }
            : product
        )
      );

      // In a real app, you would also send this to your backend
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          rating: rating,
          user_id: user.id
        }),
      });

      if (res.ok) {
        console.log("Rating saved successfully");
      }
    } catch (error) {
      console.error("Error saving rating:", error);
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

  /** Submit create course */
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
        instructor_name: `${user.first_name} ${user.last_name || ''}`.trim(),
        instructor_username: user.username
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

      alert(`✅ Course berhasil ${editingCourse ? "diperbarui" : "dibuat"}!`);

      // Reset form dan tutup modal course
      resetCourseForm();
      setShowCourseModal(false);
      fetchCourses();

    } catch (err: any) {
      console.error("❌ Error membuat course:", err);
      alert(`Error membuat course: ${err.message}`);
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

  /** Handle cancel course modal */
  const handleCancelCourseModal = () => {
    setShowCourseModal(false);
    resetCourseForm();
  };

  // Render star rating component
  const renderStarRating = (product: Product) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= (product.user_rating || 0) ? 'filled' : ''}`}
          onClick={(e) => handleRatingClick(product.id, i, e)}
          style={{ cursor: 'pointer', fontSize: '18px', color: i <= (product.user_rating || 0) ? '#ffc107' : '#e4e5e9' }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // Format product type for display
  const formatProductType = (productType: string) => {
    return productType.charAt(0).toUpperCase() + productType.slice(1).toLowerCase();
  };

  // Filter data based on search query
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.course_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.product_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app">
      <div className="main">

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
                placeholder={
                  user?.role === "instructor"
                    ? "Search courses by title, description, or type..."
                    : "Search products by title, description, or type..."
                }
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
                Found {user?.role === "instructor" ? filteredCourses.length : filteredProducts.length} {user?.role === "instructor" ? "course(s)" : "product(s)"} matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        <main className="content">
          {/* Instructor View - Courses */}
          {user?.role === "instructor" && (
            <div className="courses-section">
              <div className="courses-header">
                <h2>My Courses</h2>
                <button
                  className="create-course-btn"
                  onClick={() => setShowCourseModal(true)}
                >
                  ➕ Create New Course
                </button>
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
                          <span
                            className="course-link"
                            onClick={(e) => handleCourseClick(course.slug, e)}
                            style={{ cursor: 'pointer' }}
                          >
                            {course.title}
                          </span>
                        </h3>
                        <p className="course-overview">
                          {course.overview}
                        </p>
                        <div className="course-footer">
                          <span className="course-type-badge">
                            {course.course_type}
                          </span>
                          <div className="course-actions">
                            <button
                              className="edit-btn"
                              onClick={() => handleEditCourse(course)}
                            >
                              <FontAwesomeIcon icon={byPrefixAndName.fas.faPenToSquare} />
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              <FontAwesomeIcon icon={byPrefixAndName.fas.faTrash} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-courses">
                    <p className="no-courses-text">
                      {searchQuery ? "No courses found matching your search." : "You haven't created any courses yet."}
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
          )}

          {/* Student View - Products */}
          {user?.role === "student" && (
            <div className="products-section">
              <div className="products-header">
                <h2>Available Courses</h2>
              </div>

              <div className="products-grid">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="product-card"
                    >
                      {/* Cover Image - Top */}
                      <div className="product-cover-container">
                        <img
                          src={product.cover || "/placeholder.png"}
                          className="product-cover"
                          alt={product.title}
                        />
                        {product.is_bestseller && (
                          <div className="bestseller-badge">Bestseller</div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="product-content">

                        {/* Title - Second */}
                        <h3 className="product-title">
                          <span
                            className="product-link"
                            onClick={(e) => handleProductClick(product.id, e)}
                            style={{ cursor: 'pointer' }}
                          >
                            {product.title}
                          </span>
                        </h3>

                        {/* Instructor Name and Overview - Third */}
                        <p className="product-instructor">
                          {product.instructor_name}
                        </p>
                        <p className="product-overview">
                          {product.overview}
                        </p>

                        {/* Product Type Badge */}
                        <div className="product-info-row">
                          <div className="user-rating-section">
                            <span className="user-rating-label">Your Rating:</span>
                            <div className="user-rating-stars">
                              {renderStarRating(product)}
                            </div>
                          </div>

                          <div className="product-type-badge">
                            {formatProductType(product.product_type)}
                          </div>

                        </div>

                        {/* Rating and Info */}
                        <div className="product-rating-info">
                          <div className="product-meta">
                            <span>By : {product.instructor_username || product.instructor_name?.toLowerCase().replace(/\s+/g, '') || 'instructor'}</span>
                            <span className={`level-badge ${product.level?.toLowerCase()}`}>
                              {product.level}
                            </span>
                          </div>
                        </div>

                        {/* Price and Order Button */}
                        <div className="product-footer">
                          <div className="price-section">
                            <span className="current-price">
                              Rp{product.discount_price?.toLocaleString() || product.price.toLocaleString()}
                            </span>
                            {product.original_price && product.original_price > product.price && (
                              <span className="original-price">
                                Rp{product.original_price.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <button
                            className="quick-order-btn"
                            onClick={(e) => handleQuickOrder(product, e)}
                          >
                            <FontAwesomeIcon icon={byPrefixAndName.fas.faCartShopping}/>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-products">
                    <p className="no-products-text">
                      {searchQuery ? "No products found matching your search." : "No products available at the moment."}
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
          )}
        </main>
      </div>

      {/* Quick Order Modal for Single Product */}
      {showQuickOrderModal && user?.role === "student" && quickOrderProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Quick Order</h2>

            <div className="quick-order-product-info">
              <img
                src={quickOrderProduct.cover || "/placeholder.png"}
                alt={quickOrderProduct.title}
                className="quick-order-product-image"
              />
              <div className="quick-order-product-details">
                <h3>{quickOrderProduct.title}</h3>
                <p className="product-type">{formatProductType(quickOrderProduct.product_type)}</p>
                <p className="product-price-large">Rp{quickOrderProduct.price.toLocaleString()}</p>
              </div>
            </div>

            <div className="modal-field">
              <p className="order-date-info">
                Order will be placed for today: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowQuickOrderModal(false);
                  setQuickOrderProduct(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="submit-btn"
                onClick={handleQuickOrderSubmit}
                disabled={loading}
              >
                {loading ? "Processing..." : `✅ Order Now - Rp${quickOrderProduct.price.toLocaleString()}`}
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
              {editingCourse ? "Edit Course" : "Create New Course"}
            </h2>

            <input
              type="text"
              placeholder="Course Title"
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
              <option value="">-- Select Course Type --</option>
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
                    : "✅ Create Course"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
