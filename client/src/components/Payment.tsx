// src/components/Payment.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/payment.css";

export default function Payment() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [method, setMethod] = useState("bank_transfer");
  const [referenceNumber, setReferenceNumber] = useState(
    `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}${new Date()
      .getDate()
      .toString()
      .padStart(2, "0")}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [enrolled, setEnrolled] = useState<any[]>([]);

  const paymentMethods = [
    {
      value: "bank_transfer",
      label: "Bank Transfer",
      icon: "🏦",
      description: "Transfer melalui bank BCA, Mandiri, BNI, atau BRI"
    },
    {
      value: "ewallet",
      label: "E-Wallet",
      icon: "📱",
      description: "Gopay, OVO, Dana, atau LinkAja"
    },
    {
      value: "cod",
      label: "Cash on Delivery",
      icon: "💵",
      description: "Bayar ketika pesanan diterima"
    },
    {
      value: "credit_card",
      label: "Credit Card",
      icon: "💳",
      description: "Visa, MasterCard, atau JCB"
    }
  ];

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

      setTimeout(() => navigate("/enrolled"), 2000);
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

  const selectedMethod = paymentMethods.find(pm => pm.value === method);

  return (
    <div className="payment-container">
      <div className="payment-content">
        <div className="payment-header">
          <div className="payment-icon">💳</div>
          <h1>Pembayaran</h1>
          <p className="payment-subtitle">Selesaikan pembayaran untuk mengakses konten</p>
        </div>

        <div className="payment-card">
          <div className="order-info">
            <h3>Informasi Pesanan</h3>
            <div className="order-id">
              <span>Order ID:</span>
              <strong>{orderId}</strong>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-section">
              <h3>Metode Pembayaran</h3>
              <div className="payment-methods">
                {paymentMethods.map((pm) => (
                  <label key={pm.value} className="payment-method-card">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm.value}
                      checked={method === pm.value}
                      onChange={(e) => setMethod(e.target.value)}
                      className="payment-method-input"
                    />
                    <div className="payment-method-content">
                      <div className="method-icon">{pm.icon}</div>
                      <div className="method-info">
                        <div className="method-label">{pm.label}</div>
                        <div className="method-description">{pm.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3>Detail Pembayaran</h3>
              <div className="input-group">
                <label htmlFor="referenceNumber">Nomor Referensi</label>
                <input
                  id="referenceNumber"
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  required
                  className="payment-input"
                  placeholder="Masukkan nomor referensi pembayaran"
                />
                <small className="input-help">
                  Nomor referensi akan digenerate otomatis
                </small>
              </div>
            </div>

            {selectedMethod && (
              <div className="method-instructions">
                <h4>Instruksi {selectedMethod.label}</h4>
                {method === "bank_transfer" && (
                  <div className="instructions">
                    <p>Silakan transfer ke salah satu rekening berikut:</p>
                    <ul>
                      <li><strong>BCA:</strong> 1234-5678-9012 (StudyBuddy Inc.)</li>
                      <li><strong>Mandiri:</strong> 9876-5432-1000 (StudyBuddy Inc.)</li>
                      <li><strong>BNI:</strong> 1111-2222-3333 (StudyBuddy Inc.)</li>
                    </ul>
                  </div>
                )}
                {method === "ewallet" && (
                  <div className="instructions">
                    <p>Scan QR code atau gunakan nomor berikut:</p>
                    <ul>
                      <li><strong>Gopay:</strong> 0812-3456-7890</li>
                      <li><strong>OVO:</strong> 0812-3456-7890</li>
                      <li><strong>Dana:</strong> 0812-3456-7890</li>
                    </ul>
                  </div>
                )}
                {method === "cod" && (
                  <div className="instructions">
                    <p>Bayar ketika pesanan Anda diterima.</p>
                    <p>Pastikan Anda memiliki uang tunai yang cukup.</p>
                  </div>
                )}
                {method === "credit_card" && (
                  <div className="instructions">
                    <p>Masukkan detail kartu kredit Anda dengan aman.</p>
                    <p>Pembayaran diproses melalui gateway yang terjamin keamanannya.</p>
                  </div>
                )}
              </div>
            )}

            <div className="payment-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="cancel-btn"
                disabled={loading}
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Memproses...
                  </>
                ) : (
                  `Bayar dengan ${selectedMethod?.label}`
                )}
              </button>
            </div>
          </form>

          {message && (
            <div className={`message ${message.type}`}>
              <div className="message-icon">
                {message.type === "success" ? "✅" : "❌"}
              </div>
              <div className="message-content">
                <p>{message.text}</p>
              </div>
            </div>
          )}

          {enrolled.length > 0 && (
            <div className="enrolled-items">
              <h3>🎉 Item yang Berhasil Di-enroll</h3>
              <div className="enrolled-list">
                {enrolled.map((ec, index) => (
                  <div key={ec.id} className="enrolled-item">
                    <span className="item-number">{index + 1}</span>
                    <div className="item-info">
                      <span className="item-title">
                        {ec.course_id
                          ? `Course: ${ec.course?.title || ec.course_id}`
                          : ec.product_id
                          ? `Product: ${ec.product?.title || ec.product_id}`
                          : "Item pembelajaran"}
                      </span>
                      <span className="item-status">✓ Ter-enroll</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="payment-security">
          <div className="security-badge">
            <span className="lock-icon">🔒</span>
            <span>Pembayaran Aman & Terenkripsi</span>
          </div>
          <div className="security-features">
            <span>SSL Secure</span>
            <span>•</span>
            <span>Data Terlindungi</span>
            <span>•</span>
            <span>Garansi 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}