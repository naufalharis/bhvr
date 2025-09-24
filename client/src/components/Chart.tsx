// src/components/OrderLines.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "./pages/Sidebar";
import Navbar from "./pages/Navbar";

interface Product {
  id: string;
  title: string;
  overview?: string;
  cover?: string;
  product_type?: string;
  price?: number;
}

interface OrderLine {
  id: string;
  order_id: string;
  product_id: string | null;
  course_id?: string | null;
  status: string;
  product?: Product | null;
}

export default function OrderLines() {
  const { order_id } = useParams<{ order_id: string }>();
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchOrderLines = async () => {
    if (!order_id) {
      setError("Order ID tidak ditemukan.");
      setLoading(false);
      return;
    }

    try {
      // endpoint backend: GET /api/orders/:orderId/order-lines
      const res = await fetch(`/api/orders/${order_id}/order-lines`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.error || `Gagal fetch order_lines untuk order ${order_id}`
        );
      }

      const data = await res.json();
      setOrderLines(data.orderLines || []);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Terjadi error saat fetch order_lines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderLines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order_id]);

  const removeItem = async (lineId: string) => {
    if (!window.confirm("Hapus item ini?")) return;

    try {
      const res = await fetch(`/api/order-lines/${lineId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal menghapus item");
      }

      // hapus dari state
      setOrderLines((prev) => prev.filter((line) => line.id !== lineId));
    } catch (err: any) {
      alert(err.message || "Error menghapus item");
    }
  };

  const checkout = () => {
    alert("Checkout berhasil!");
    navigate("/chart"); // arahkan ke halaman chart setelah checkout
  };

  if (loading) return <p>Loading order lines...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Navbar userName="User" onLogout={() => {}} />
        <div style={{ padding: "20px" }}>
          <h2>🛒 Order Lines untuk Order ID: {order_id}</h2>

          {orderLines.length === 0 ? (
            <p>Keranjang masih kosong.</p>
          ) : (
            <>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "16px",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Produk</th>
                    <th style={thStyle}>Harga</th>
                    <th style={thStyle}>Course ID</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orderLines.map((line) => (
                    <tr key={line.id}>
                      <td style={tdStyle}>{line.id}</td>
                      <td style={tdStyle}>
                        {line.product?.title || line.product_id || "-"}
                      </td>
                      <td style={tdStyle}>
                        {line.product?.price
                          ? `Rp ${line.product.price.toLocaleString()}`
                          : "-"}
                      </td>
                      <td style={tdStyle}>{line.course_id || "-"}</td>
                      <td style={tdStyle}>{line.status}</td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => removeItem(line.id)}
                          style={{
                            padding: "6px 12px",
                            background: "red",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tombol Checkout */}
              <button
                onClick={checkout}
                style={{
                  marginTop: "16px",
                  padding: "8px 16px",
                  background: "orange",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Checkout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "8px",
  background: "#f3f4f6",
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "8px",
};
