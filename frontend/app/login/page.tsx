"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5002/auth/login", {
        email,
        password,
      });

      if (res.data && res.data.user) {
        // Backend'den gelen veriyi (içindeki 'role' alanı dahil) TAMAMEN kaydediyoruz
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // Giriş başarılı olunca doğrudan dashboard'a yönlendiriyoruz
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "E-posta veya şifre hatalı!");
      } else {
        alert("Giriş yapılırken bir hata oluştu!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily: "system-ui",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          backgroundColor: "white",
          padding: "32px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "360px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e2e8f0",
        }}
      >
        <h2
          style={{ margin: "0 0 8px 0", textAlign: "center", color: "#0f172a" }}
        >
          Giriş Yap
        </h2>
        <p
          style={{
            margin: "0 0 24px 0",
            textAlign: "center",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          {"Office Wallet hesabınıza erişin"}
        </p>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#334155",
              marginBottom: "6px",
            }}
          >
            E-posta Adresi
          </label>
          <input
            type="email"
            placeholder="ornek@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              boxSizing: "border-box",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#334155",
              marginBottom: "6px",
            }}
          >
            Şifre
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              boxSizing: "border-box",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "14px",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </button>

        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "14px",
            color: "#64748b",
          }}
        >
          Hesabınız yok mu?{" "}
          <span
            onClick={() => router.push("/register")}
            style={{ color: "#2563eb", cursor: "pointer", fontWeight: "600" }}
          >
            Kayıt Ol
          </span>
        </div>
      </form>
    </div>
  );
}
