// src/components/Payment.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "./pages/Sidebar";
import Navbar from "./pages/Navbar";

export default function Payment() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [method, setMethod] = useState("cod");
  const [referenceNumber, setReferenceNumber] = useState(
    `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [enrolled, setEnrolled] = useState<any[]>([]);

  const handlePayment = async () => {
    if (!orderId) {
      setMessage({ type: "error", text: "❌ Order ID tidak ditemukan" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          method,
          status: "success",
          reference_number: referenceNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat payment");

      setMessage({
        type: "success",
        text: "✅ Payment berhasil & item sudah di-enroll!",
      });
      setEnrolled(data.enrolled || []);

      setTimeout(() => navigate("/enrolled"), 1500);
    } catch (err: any) {
      setMessage({ type: "error", text: `❌ Error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handlePayment();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar />
        <main style={{ padding: "20px", flex: 1 }}>
          <h2 style={titleStyle}>💳 Payment</h2>
          <p>Order ID: <strong>{orderId}</strong></p>

          <form onSubmit={handleSubmit} style={formStyle}>
            <label style={labelStyle}>Metode Pembayaran:</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              style={inputStyle}
              required
            >
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="ewallet">E-Wallet</option>
            </select>

            <label style={labelStyle}>Reference Number:</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              style={inputStyle}
              required
            />

            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? "Processing..." : "Submit Payment"}
            </button>
          </form>

          {message && (
            <p
              style={{
                marginTop: "20px",
                color: message.type === "success" ? "green" : "red",
                fontWeight: 500,
              }}
            >
              {message.text}
            </p>
          )}

          {enrolled.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3>🎉 Enrolled Item:</h3>
              <ul>
                {enrolled.map((ec) => (
                  <li key={ec.id}>
                    {ec.course_id
                      ? `Course: ${ec.course?.title || ec.course_id}`
                      : ec.product_id
                      ? `Product: ${ec.product?.title || ec.product_id}`
                      : "Non-course item"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const titleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "600",
  marginBottom: "10px",
  color: "#111827",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  maxWidth: "400px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 16px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 500,
};
