// src/components/Login.tsx
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // gunakan proxy /api/login, fallback ke http://localhost:3000/login
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login gagal, periksa email dan password");
      }

      console.log("Login response:", data);

      if (data.token) {
        // simpan token & user ke localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        onLogin(); // update state dari App
        navigate("/home"); // redirect ke halaman home
      } else {
        alert("Login gagal: email atau password salah");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Header */}
      <header className="login-header">
        <div>
          <h2>Kursus Bimbel</h2>
          <div>
            <Link to="/register">Sign up</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
      </main>
    </div>
  );
}
