// src/components/Register.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import "../styles/register.css";

interface Props {
  onRegister: () => void;
}

export default function Register({ onRegister }: Props) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    mobileNumber: "",
    birthDate: "",
    birthPlace: "",
    username: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // mapping ke format backend (Prisma/Hono) + set default role = student
    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      gender: formData.gender,
      mobile_number: formData.mobileNumber,
      birth_date: formData.birthDate ? new Date(formData.birthDate) : null,
      birth_place: formData.birthPlace,
      username: formData.username,
      email: formData.email,
      password: formData.password, // hash di backend
      role: "student", // 👈 default role student
    };

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
          data?.error ||
          data?.message ||
          `Request failed with status ${res.status}`;
        throw new Error(errMsg);
      }

      console.log("Register success:", data);

      // simpan token/user jika ada
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      onRegister();
      navigate("/home");
    } catch (err: any) {
      console.error("Register error:", err);
      alert(err?.message || "Terjadi kesalahan saat registrasi");
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="register-container">
      <div className="header">
        <h1>✨ Daftar Akun</h1>
        <p>Bergabunglah dengan komunitas kami</p>
      </div>

      <form id="registerForm" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="firstName">Nama Depan</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className="form-control"
              placeholder="Masukkan nama depan"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Nama Belakang</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className="form-control"
              placeholder="Masukkan nama belakang"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Jenis Kelamin</label>
            <select
              id="gender"
              name="gender"
              className="form-control"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Pilih jenis kelamin</option>
              <option value="pria">Pria</option>
              <option value="wanita">Wanita</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="mobileNumber">Nomor Handphone</label>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              className="form-control"
              placeholder="+62 812-3456-7890"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="birthDate">Tanggal Lahir</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              className="form-control"
              value={formData.birthDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="birthPlace">Tempat Lahir</label>
            <input
              type="text"
              id="birthPlace"
              name="birthPlace"
              className="form-control"
              placeholder="Masukkan tempat lahir"
              value={formData.birthPlace}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              placeholder="Masukkan username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-control"
            placeholder="nama@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="form-control"
              placeholder="Masukkan password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={togglePassword}
            >
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </button>
          </div>
        </div>

        <button type="submit" className="register-btn" disabled={loading}>
          {loading ? "Mendaftarkan..." : "🚀 Daftar Sekarang"}
        </button>
      </form>

      <div className="login-link">
        Sudah punya akun? <a href="/login">Masuk di sini</a>
      </div>
    </div>
  );
}
