// src/components/ProductDetailPage.tsx
import React, { useEffect, useState } from "react";
import Sidebar from "./pages/Sidebar";
import Navbar from "./pages/Navbar";
import "../styles/productdetail.css";
import { useNavigate } from "react-router-dom";

interface AppProps {
  onLogout: () => void;
}

interface User {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  username: string;
  role: string;
}

interface Product {
  id: string;
  title: string;
  overview: string;
  cover: string;
  product_type: string;
  price: number;
}

interface Course {
  id: string;
  title: string;
  overview: string;
  cover: string;
  slug: string;
  course_type: string;
}

interface ProductDetail {
  id: string;
  course_id: string;
  product_id: string;
  price: number;
  course: Course;
  product: Product;
}

export default function ProductDetailPage({ onLogout }: AppProps) {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  /** Get user from localStorage */
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

  /** Fetch products */
  const fetchProducts = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/product", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`);
      }
      const data = await res.json();
      setProducts(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  /** Fetch courses */
  const fetchCourses = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch courses: ${res.status}`);
      }
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    }
  };

  /** Fetch product details */
  const fetchProductDetails = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/product-details", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch product details: ${res.status}`);
      }
      const data = await res.json();
      setProductDetails(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching product details:", error);
      setProductDetails([]);
    }
  };

  useEffect(() => {
    if (token && user?.role === "instructor") {
      fetchProducts();
      fetchCourses();
      fetchProductDetails();
    }
  }, [token, user]);

  /** Reset form */
  const resetForm = () => {
    setSelectedProduct("");
    setSelectedCourses([]);
  };

  /** Handle cancel modal */
  const handleCancelModal = () => {
    setShowLinkModal(false);
    resetForm();
  };

  /** Toggle course selection */
  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  /** Select all courses */
  const selectAllCourses = () => {
    const available = getAvailableCourses();
    setSelectedCourses(available.map(course => course.id));
  };

  /** Deselect all courses */
  const deselectAllCourses = () => {
    setSelectedCourses([]);
  };

  /** Link products with courses */
  const handleLinkProducts = async () => {
    if (!token || !user) return;
    if (!selectedProduct) {
      alert("Pilih product terlebih dahulu!");
      return;
    }
    if (selectedCourses.length === 0) {
      alert("Pilih minimal satu course!");
      return;
    }

    setLoading(true);
    try {
      const results = [];
      
      for (const courseId of selectedCourses) {
        // Check if this product-course combination already exists
        const existingDetail = productDetails.find(
          detail => detail.product_id === selectedProduct && detail.course_id === courseId
        );

        if (existingDetail) {
          console.log(`Relationship already exists for course ${courseId}, skipping...`);
          continue;
        }

        const res = await fetch("/api/product-details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: selectedProduct,
            courseId: courseId,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Gagal menghubungkan course ${courseId}`);
        }

        const result = await res.json();
        results.push(result);
      }

      if (results.length > 0) {
        alert(`✅ ${results.length} product(s) berhasil dihubungkan dengan courses!`);
      } else {
        alert("ℹ️ Semua course yang dipilih sudah terhubung dengan product ini.");
      }
      
      // Reset form and close modal
      resetForm();
      setShowLinkModal(false);
      
      // Refresh data
      fetchProductDetails();
    } catch (err: any) {
      console.error("❌ Error linking products:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /** Delete product detail */
  const handleDeleteProductDetail = async (productDetailId: string) => {
    if (!window.confirm("Apakah yakin ingin menghapus hubungan product-course ini?")) return;
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/product-details/${productDetailId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menghapus product detail");
      }
      
      alert("✅ Hubungan product-course berhasil dihapus!");
      fetchProductDetails();
    } catch (err: any) {
      alert(`Error menghapus product detail: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search query
  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.product_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.course_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProductDetails = productDetails.filter((detail) =>
    detail.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    detail.course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get courses that are not yet linked to the selected product
  const getAvailableCourses = () => {
    if (!selectedProduct) return filteredCourses;
    
    return filteredCourses.filter(course => 
      !productDetails.some(detail => 
        detail.course_id === course.id && detail.product_id === selectedProduct
      )
    );
  };

  const availableCourses = getAvailableCourses();

  // Get selected product data
  const selectedProductData = products.find(p => p.id === selectedProduct);

  if (user?.role !== "instructor") {
    return (
      <div className="app">
        <Sidebar />
        <div className="main">
          <Navbar
            userName={user ? user.first_name : "Loading..."}
            onLogout={onLogout}
          />
          <div className="content">
            <div className="access-denied">
              <h2>Access Denied</h2>
              <p>Only instructors can access product detail management.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Navbar
          userName={user ? user.first_name : "Loading..."}
          onLogout={onLogout}
        />
        
        {/* Search Section */}
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
                placeholder="Search products, courses, or relationships..."
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
          </div>
        </div>

        <main className="content">
          <div className="product-detail-section">
            <div className="section-header">
              <h2>Product-Course Relationships</h2>
              <button
                className="link-products-btn"
                onClick={() => setShowLinkModal(true)}
                disabled={loading}
              >
                🔗 Link Products & Courses
              </button>
            </div>

            {/* Product Details List */}
            <div className="relationships-section">
              <h3>Existing Relationships ({filteredProductDetails.length})</h3>
              
              {filteredProductDetails.length > 0 ? (
                <div className="relationships-grid">
                  {filteredProductDetails.map((detail) => (
                    <div key={detail.id} className="relationship-card">
                      <div className="relationship-content">
                        <div className="relationship-info">
                          <h4 className="product-name">{detail.product.title}</h4>
                          <span className="relationship-connector">↔</span>
                          <h4 className="course-name">{detail.course.title}</h4>
                        </div>
                        <div className="relationship-details">
                          <span className="product-type">{detail.product.product_type}</span>
                          <span className="course-type">{detail.course.course_type}</span>
                          <span className="detail-price">Rp{detail.price.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="relationship-actions">
                        <button
                          className="delete-relationship-btn"
                          onClick={() => handleDeleteProductDetail(detail.id)}
                          disabled={loading}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-relationships">
                  <p className="no-relationships-text">
                    {searchQuery 
                      ? "No relationships found matching your search." 
                      : "No product-course relationships yet. Start by linking products with courses."}
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

            {/* Quick Stats */}
            <div className="stats-section">
              <div className="stat-card">
                <h3>{products.length}</h3>
                <p>Total Products</p>
              </div>
              <div className="stat-card">
                <h3>{courses.length}</h3>
                <p>Total Courses</p>
              </div>
              <div className="stat-card">
                <h3>{productDetails.length}</h3>
                <p>Active Relationships</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Link Products Modal */}
      {showLinkModal && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <h2 className="modal-title">Link Products with Courses</h2>

            <div className="modal-field">
              <label className="modal-label">Select Product *</label>
              <select
                value={selectedProduct}
                onChange={(e) => {
                  setSelectedProduct(e.target.value);
                  setSelectedCourses([]); // Reset course selection when product changes
                }}
                className="modal-input"
                required
                disabled={loading}
              >
                <option value="">-- Choose a Product --</option>
                {filteredProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title} ({product.product_type}) - Rp{product.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && selectedProductData && (
              <div className="selected-product-info">
                <p><strong>Selected Product:</strong> {selectedProductData.title}</p>
                <p><strong>Price:</strong> Rp{selectedProductData.price.toLocaleString()}</p>
                <p><strong>Type:</strong> {selectedProductData.product_type}</p>
              </div>
            )}

            {selectedProduct && (
              <div className="courses-selection-section">
                <div className="selection-header">
                  <label className="modal-label">
                    Select Courses to Link ({availableCourses.length} available)
                  </label>
                  <div className="selection-actions">
                    <button
                      type="button"
                      className="select-all-btn"
                      onClick={selectAllCourses}
                      disabled={loading || availableCourses.length === 0}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      className="deselect-all-btn"
                      onClick={deselectAllCourses}
                      disabled={loading || selectedCourses.length === 0}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                
                <div className="courses-checkbox-grid">
                  {availableCourses.length > 0 ? (
                    availableCourses.map((course) => (
                      <div key={course.id} className="course-checkbox-item">
                        <input
                          type="checkbox"
                          id={`course-${course.id}`}
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => toggleCourseSelection(course.id)}
                          disabled={loading}
                        />
                        <label htmlFor={`course-${course.id}`} className="course-checkbox-label">
                          <span className="course-title">{course.title}</span>
                          <span className="course-type">{course.course_type}</span>
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="no-courses-available">
                      <p>All courses are already linked to this product or no courses available.</p>
                    </div>
                  )}
                </div>

                {selectedCourses.length > 0 && (
                  <div className="selection-summary">
                    <p>
                      <strong>{selectedCourses.length} course(s)</strong> selected for linking with product
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancelModal}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="submit-btn"
                onClick={handleLinkProducts}
                disabled={loading || !selectedProduct || selectedCourses.length === 0}
              >
                {loading ? "Linking..." : `🔗 Link ${selectedCourses.length} Course(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}