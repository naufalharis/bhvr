// src/components/OrderLines.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/chart.css";

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

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-badge status-pending';
      case 'completed':
        return 'status-badge status-completed';
      case 'failed':
        return 'status-badge status-failed';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className="order-lines-container">

      <div className="order-lines-main">
        <main className="order-lines-content">
          <div className="order-lines-header">
            <span className="order-lines-icon">📦</span>
            <h2>Order Saya</h2>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading order lines...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : orderLines.length === 0 ? (
            <div className="empty-state">
              <p>Kamu belum pernah order course.</p>
            </div>
          ) : (
            <div className="order-lines-card">
              <div className="order-lines-table-container" style={{ overflowX: "auto" }}>
                <table className="order-lines-table">
                  <thead>
                    <tr>
                      <th>Order Line ID</th>
                      <th>Order ID</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderLines.map((line, index) => (
                      <tr key={line.id}>
                        <td>{line.id}</td>
                        <td>{line.order_id}</td>
                        <td>
                          <span className={getStatusClass(line.status)}>
                            {line.status}
                          </span>
                        </td>
                        <td>
                          {line.status === "pending" && (
                            <button
                              className="payment-button"
                              onClick={() => navigate(`/payment/${line.order_id}`)}
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
            </div>
          )}
        </main>
      </div>
    </div>
  );
}