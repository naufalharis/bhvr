// src/components/OrderLines.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./pages/Sidebar";
import Navbar from "./pages/Navbar";

interface OrderLine {
  id: string;
  order_id: string;
  product_id: string | null;
  course_id: string | null;
  course_name?: string | null;
  status: string;
}

export default function OrderLines() {
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // === Fetch Pending Order Lines ===
  const fetchOrderLines = async () => {
    try {
      const res = await fetch("/api/order-lines/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal fetch order_lines");
      }

      const data = await res.json();

      const mappedLines: OrderLine[] = (data.orderLines || []).map(
        (line: any) => ({
          id: line.id,
          order_id: line.order_id,
          product_id: line.product_id ?? null,
          course_id: line.course_id ?? null,
          course_name: line.course?.title ?? "-",
          status: line.status,
        })
      );

      setOrderLines(mappedLines);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Terjadi error saat fetch order_lines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderLines();
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <main style={{ padding: "20px", flex: 1 }}>
          <h2 style={titleStyle}>📦 Order Saya</h2>

          {loading ? (
            <p style={{ padding: "20px", color: "#555" }}>
              Loading order lines...
            </p>
          ) : error ? (
            <p style={{ padding: "20px", color: "red" }}>{error}</p>
          ) : orderLines.length === 0 ? (
            <p style={{ marginTop: "12px", color: "#666" }}>
              Kamu belum pernah order course.
            </p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: "16px" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Order Line ID</th>
                    <th style={thStyle}>Order ID</th>
                    <th style={thStyle}>Course</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orderLines.map((line, index) => (
                    <tr
                      key={line.id}
                      style={{
                        backgroundColor: index % 2 === 0 ? "#fff" : "#f9fafb",
                      }}
                    >
                      <td style={tdStyle}>{line.id}</td>
                      <td style={tdStyle}>{line.order_id}</td>
                      <td style={tdStyle}>
                        {line.course_name || line.course_id || "-"}
                      </td>
                      <td style={{ ...tdStyle, ...statusStyle(line.status) }}>
                        {line.status}
                      </td>
                      <td style={tdStyle}>
                        {line.status === "pending" && (
                          <button
                            onClick={() => navigate(`/payment/${line.order_id}`)}
                            style={buttonStyle}
                          >
                            💳 Bayar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
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

const buttonStyle: React.CSSProperties = {
  padding: "6px 12px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 500,
};

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
