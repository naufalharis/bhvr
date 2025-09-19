import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";

interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // gunakan proxy dari vite.config.js
  const API_URL = "/api/login";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch {
          data = {};
        }
      } else {
        const text = await res.text();
        data = text ? { message: text } : {};
      }

      if (!res.ok) {
        const errMsg =
          data?.error || data?.message || `Request failed with status ${res.status}`;
        throw new Error(errMsg);
      }

      console.log("Login response:", data);

      if (data?.token) {
        localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        onLogin();
        navigate("/home");
        return;
      }

      throw new Error("Login berhasil tapi token tidak ditemukan. Cek backend.");
    } catch (err: any) {
      console.error("Login error:", err);
      alert(err?.message || "Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <div>
          <h2>Kursus</h2>
          <div>
            <Link to="/register">Sign up</Link>
          </div>
        </div>
      </header>

      <main className="login-main">
        <div>
          <h1>Login to Your Account</h1>
          <p>Enter your credentials to access your courses.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="email">Email</label>
            <div>
              <input
                type="email"
                id="email"
                placeholder="youremail@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div>
              <label htmlFor="password">Password</label>
              <div>
                <a href="#">Forgot your password?</a>
              </div>
            </div>
            <div>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Log in"}
            </button>
          </div>
        </form>

        <p>
          Don&apos;t have an account? <Link to="/register">Sign up</Link>
        </p>
      </main>
    </div>
  );
}
