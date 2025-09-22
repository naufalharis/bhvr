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

  if (loading) return <p>Loading order lines...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>📦 Order Lines</h2>

      {orderLines.length === 0 ? (
        <p>Belum ada order line.</p>
      ) : (
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
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
