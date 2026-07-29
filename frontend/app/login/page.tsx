"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // 👈 'next/router' DEĞİL, 'next/navigation' olmalı!
import axios from "axios";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Sayfanın kendi kendine yenilenmesini engeller
    setError("");
    setSuccess("");

    const endpoint = isLogin ? "/auth/login" : "/auth/register";

    try {
      const response = await axios.post(`http://localhost:5001${endpoint}`, {
        email,
        password,
      });

      if (isLogin) {
        console.log("Backend Response:", response.data);

        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));

          router.push("/dashboard");
        } else {
          setError("Kullanıcı bilgisi alınamadı!");
        }
      } else {
        setSuccess(
          "Kayıt başarılı! Şimdi aynı bilgilerle giriş yapabilirsiniz.",
        );
        setIsLogin(true);
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const errorObject = err as {
          response?: { data?: { message?: string } };
        };
        setError(
          errorObject.response?.data?.message ||
            "İşlem sırasında bir hata oluştu!",
        );
      } else {
        setError("Sunucuya bağlanılamadı. Backend açık mı?");
      }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Üst Sekme Butonları */}
        <div style={tabContainerStyle}>
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError("");
              setSuccess("");
            }}
            style={{
              ...tabButtonStyle,
              borderBottom: isLogin ? "3px solid #0070f3" : "none",
              color: isLogin ? "#0070f3" : "#888",
            }}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError("");
              setSuccess("");
            }}
            style={{
              ...tabButtonStyle,
              borderBottom: !isLogin ? "3px solid #10b981" : "none",
              color: !isLogin ? "#10b981" : "#888",
            }}
          >
            Kayıt Ol
          </button>
        </div>

        <h2
          style={{ textAlign: "center", color: "#333", marginBottom: "20px" }}
        >
          {isLogin ? "Hoş Geldiniz" : "Hesap Oluştur"}
        </h2>

        {/* Hata & Başarı Mesajları */}
        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div>
            <label style={labelStyle}>E-posta</label>
            <input
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Şifre</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            style={{
              ...buttonStyle,
              backgroundColor: isLogin ? "#0070f3" : "#10b981",
            }}
          >
            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </button>
        </form>
      </div>
    </div>
  );
}

// 🎨 Stil Tanımlamaları (CSS-in-JS)
const containerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  backgroundColor: "#f3f4f6",
  fontFamily: "Inter, system-ui, sans-serif",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "400px",
  backgroundColor: "#ffffff",
  padding: "30px",
  borderRadius: "16px",
  boxShadow:
    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
};

const tabContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-around",
  marginBottom: "20px",
  borderBottom: "1px solid #e5e7eb",
};

const tabButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: "10px 20px",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: "500",
  color: "#374151",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  marginTop: "10px",
  padding: "12px",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "background-color 0.2s",
};

const errorStyle: React.CSSProperties = {
  padding: "10px",
  backgroundColor: "#fef2f2",
  color: "#ef4444",
  borderRadius: "6px",
  fontSize: "14px",
  marginBottom: "15px",
  border: "1px solid #fca5a5",
};

const successStyle: React.CSSProperties = {
  padding: "10px",
  backgroundColor: "#ecfdf5",
  color: "#10b981",
  borderRadius: "6px",
  fontSize: "14px",
  marginBottom: "15px",
  border: "1px solid #6ee7b7",
};
