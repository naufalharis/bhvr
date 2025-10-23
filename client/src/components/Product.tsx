// src/components/ProductPage.tsx
import React, { useEffect, useState } from "react";
import "../styles/product.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "../icons";

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

interface Product {
  id: string;
  title: string;
  overview: string;
  cover: string;
  product_type: string;
  price: number;
}

export default function ProductPage({ onLogout }: AppProps) {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [productForm, setProductForm] = useState({
    title: "",
    overview: "",
    cover: null as File | null,
    coverPreview: "",
    product_type: "",
    price: "",
  });

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
        if (res.status === 401) {
          console.log("User not authorized to access products");
          return;
        }
        throw new Error(`Failed to fetch products: ${res.status}`);
      }
      const data = await res.json();
      setProducts(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  /** Fetch product types */
  const fetchProductTypes = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/product/types", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProductTypes(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error("Error fetching product types:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
      fetchProductTypes();
    }
  }, [token]);

  /** Upload cover to base64 */
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
    setEditingProduct(null);
  };

  /** Create or update product */
  const handleCreateProduct = async () => {
    if (!token || !user) return;
    if (!productForm.title || !productForm.product_type || !productForm.price) {
      alert("Title, Product Type, dan Price wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      let coverBase64 = "";
      if (productForm.cover) {
        coverBase64 = await uploadCover(productForm.cover);
      } else if (editingProduct?.cover) {
        coverBase64 = editingProduct.cover;
      }

      const body = {
        title: productForm.title,
        overview: productForm.overview,
        cover: coverBase64 || "/placeholder.png",
        product_type: productForm.product_type,
        price: parseFloat(productForm.price),
      };

      const url = "/api/product";
      const method = "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Gagal membuat product");
      }

      const productData = await res.json();
      
      alert(`✅ Product berhasil ${editingProduct ? "diperbarui" : "dibuat"}!`);

      // Reset form dan tutup modal
      resetProductForm();
      setShowProductModal(false);
      fetchProducts(); // Refresh products list

    } catch (err: any) {
      console.error("❌ Error creating product:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /** Delete product */
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Apakah yakin ingin menghapus product ini?")) return;
    if (!token) return;
    setLoading(true);
    try {
      // Note: You might need to add a DELETE endpoint in your backend
      const res = await fetch(`/api/product/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus product");
      alert("✅ Product berhasil dihapus!");
      fetchProducts();
    } catch (err: any) {
      alert(`Error menghapus product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /** Edit product */
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      overview: product.overview,
      cover: null,
      coverPreview: product.cover,
      product_type: product.product_type,
      price: product.price.toString(),
    });
    setShowProductModal(true);
  };

  /** Handle cancel product modal */
  const handleCancelProductModal = () => {
    setShowProductModal(false);
    resetProductForm();
  };

  // Filter products based on search query and selected type
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.overview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "" || product.product_type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="app">
      <div className="main">
        
        {/* Search and Filter Section */}
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
                placeholder="Search products by title or description..."
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

            {/* Product Type Filter */}
            <div className="filter-section">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="type-filter"
              >
                <option value="">All Types</option>
                {productTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {searchQuery && (
              <div className="search-results-info">
                Found {filteredProducts.length} product(s) matching "{searchQuery}"
                {selectedType && ` in ${selectedType} category`}
              </div>
            )}
          </div>
        </div>

        <main className="content">
          <div className="products-section">
            <div className="products-header">
              <h2>Products</h2>
              {user?.role === "instructor" && (
                <button
                  className="create-product-btn"
                  onClick={() => setShowProductModal(true)}
                >
                  ➕ Create New Product
                </button>
              )}
            </div>

            <div className="products-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div key={product.id} className="product-card">
                    <img
                      src={product.cover || "/placeholder.png"}
                      className="product-cover"
                      alt={product.title}
                    />
                    <div className="product-content">
                      <h3 className="product-title">
                        {product.title}
                      </h3>
                      <p className="product-overview">
                        {product.overview}
                      </p>
                      <div className="product-details">
                        <span className="product-type-badge">
                          {product.product_type}
                        </span>
                        <span className="product-price">
                          Rp{product.price.toLocaleString()}
                        </span>
                      </div>
                      {user?.role === "instructor" && (
                        <div className="product-actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleEditProduct(product)}
                          >
                           <FontAwesomeIcon icon={byPrefixAndName.fas.faPenToSquare}></FontAwesomeIcon>
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <FontAwesomeIcon icon={byPrefixAndName.fas.faTrash}></FontAwesomeIcon>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-products">
                  <p className="no-products-text">
                    {searchQuery || selectedType 
                      ? "No products found matching your criteria." 
                      : "No products available yet."}
                  </p>
                  {(searchQuery || selectedType) && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedType("");
                      }}
                      className="clear-filters-button"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal Create/Edit Product - Only for Instructors */}
      {showProductModal && user?.role === "instructor" && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">
              {editingProduct ? "Edit Product" : "Create New Product"}
            </h2>

            <div className="modal-field">
              <label className="modal-label">Product Title *</label>
              <input
                type="text"
                placeholder="Enter product title"
                value={productForm.title}
                onChange={(e) =>
                  setProductForm({ ...productForm, title: e.target.value })
                }
                className="modal-input"
                required
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">Overview</label>
              <textarea
                placeholder="Enter product description"
                value={productForm.overview}
                onChange={(e) =>
                  setProductForm({ ...productForm, overview: e.target.value })
                }
                className="modal-textarea"
                rows={3}
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">Cover Image</label>
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
            </div>

            <div className="modal-field">
              <label className="modal-label">Product Type *</label>
              <select
                value={productForm.product_type}
                onChange={(e) =>
                  setProductForm({ ...productForm, product_type: e.target.value })
                }
                className="modal-input"
                required
              >
                <option value="">-- Select Product Type --</option>
                <option value="bundle">Bundle</option>
                <option value="course">Course</option>
                <option value="merchandise">Merchandise</option>
              </select>
            </div>

            <div className="modal-field">
              <label className="modal-label">Price *</label>
              <input
                type="number"
                placeholder="Enter price"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
                className="modal-input"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancelProductModal}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="submit-btn"
                onClick={handleCreateProduct}
                disabled={loading}
              >
                {loading 
                  ? "Processing..." 
                  : editingProduct 
                    ? "✅ Update Product" 
                    : "✅ Create Product"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}