import React, { useEffect, useState } from "react";
import Sidebar from "./pages/Sidebar";
import Navbar from "./pages/Navbar";

interface OrderLine {
  id: string;
  order_id: string;
  product_id: string;
  course_id?: string;
  status: string;
}

export default function Chart() {
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);

  // Ambil data dari localStorage sesuai ERD
  useEffect(() => {
    const stored = localStorage.getItem("order_lines");
    if (stored) {
      setOrderLines(JSON.parse(stored));
    }
  }, []);

  // Hapus item dari chart
  const removeItem = (id: string) => {
    const updated = orderLines.filter((item) => item.id !== id);
    setOrderLines(updated);
    localStorage.setItem("order_lines", JSON.stringify(updated));
  };

  // Checkout: ubah status "cart" jadi "pending"
  const checkout = () => {
    const updated = orderLines.map((item) =>
      item.status === "cart" ? { ...item, status: "pending" } : item
    );
    setOrderLines(updated);
    localStorage.setItem("order_lines", JSON.stringify(updated));
    alert("Checkout berhasil! Semua item di keranjang jadi pending order.");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Navbar */}
        <Navbar />

        {/* Konten utama */}
        <main style={{ padding: "20px", flex: 1 }}>
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
        </main>
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
