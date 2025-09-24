// src/components/OrderLines.tsx
import React, { useEffect, useState } from "react";
import Sidebar from "./pages/Sidebar";
import Navbar from "./pages/Navbar";

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

  if (loading)
    return <p style={{ padding: "20px", color: "#555" }}>Loading order lines...</p>;
  if (error)
    return <p style={{ padding: "20px", color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>🛒 Your Cart (Order Lines)</h2>

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
                <th style={thStyle}>Order ID</th>
                <th style={thStyle}>Product ID</th>
                <th style={thStyle}>Course ID</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orderLines.map((line) => (
                <tr key={line.id}>
                  <td style={tdStyle}>{line.id}</td>
                  <td style={tdStyle}>{line.order_id}</td>
                  <td style={tdStyle}>{line.product_id}</td>
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
  );
}

// 🔹 Styles
const titleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "600",
  marginBottom: "10px",
  color: "#111827",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
};

const thStyle: React.CSSProperties = {
  borderBottom: "2px solid #e5e7eb",
  padding: "12px",
  textAlign: "left",
  background: "#f3f4f6",
  fontWeight: 600,
  fontSize: "14px",
  color: "#374151",
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e7eb",
  padding: "10px 12px",
  fontSize: "14px",
  color: "#111827",
};

// 🔹 Dynamic status badge
const statusStyle = (status: string): React.CSSProperties => {
  let bg = "#e5e7eb";
  let color = "#374151";

  if (status === "pending") {
    bg = "#fef3c7";
    color = "#92400e";
  } else if (status === "completed") {
    bg = "#d1fae5";
    color = "#065f46";
  } else if (status === "failed") {
    bg = "#fee2e2";
    color = "#991b1b";
  }

  return {
    background: bg,
    color: color,
    fontWeight: 500,
    textAlign: "center",
    borderRadius: "6px",
  };
};
