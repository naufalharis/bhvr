import React, { useEffect, useState } from "react";

interface OrderLine {
  id: string;
  order_id: string;
  product_id: string;
  course_id?: string;
  status: string;
}

export default function OrderLines() {
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ambil token dari localStorage
  const token = localStorage.getItem("token");

  const fetchOrderLines = async () => {
    try {
      const res = await fetch("/api/order-lines", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal fetch order_lines");
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
  }, []);

  if (loading)
    return <p style={{ padding: "20px", color: "#555" }}>Loading order lines...</p>;
  if (error)
    return <p style={{ padding: "20px", color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={titleStyle}>📦 Order Lines</h2>

      {orderLines.length === 0 ? (
        <p style={{ marginTop: "12px", color: "#666" }}>
          Belum ada order line.
        </p>
      ) : (
        <div style={{ overflowX: "auto", marginTop: "16px" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Order ID</th>
                <th style={thStyle}>Product ID</th>
                <th style={thStyle}>Course ID</th>
                <th style={thStyle}>Status</th>
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
                  <td style={tdStyle}>{line.product_id}</td>
                  <td style={tdStyle}>{line.course_id || "-"}</td>
                  <td style={{ ...tdStyle, ...statusStyle(line.status) }}>
                    {line.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
