"use client";

import { useState } from "react";
import axios from "axios";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      // Backend'deki register endpoint'ine istek atıyoruz
      // Not: Backend portun 3000 olduğu için doğrudan oraya gönderiyoruz
      await axios.post("http://localhost:3000/auth/register", {
        email,
        password,
      });

      setSuccess(true);
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const errorObject = err as {
          response?: { data?: { message?: string } };
        };
        setError(
          errorObject.response?.data?.message ||
            "Kayıt sırasında bir hata oluştu!",
        );
      } else {
        setError("Kayıt sırasında bir hata oluştu!");
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          width: "300px",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ textAlign: "center", margin: "0 0 10px 0" }}>Kayıt Ol</h2>

        {error && (
          <p style={{ color: "red", fontSize: "14px", margin: 0 }}>{error}</p>
        )}
        {success && (
          <p style={{ color: "green", fontSize: "14px", margin: 0 }}>
            Kayıt başarılı! Şimdi Giriş Yapabilirsiniz.
          </p>
        )}

        <input
          type="email"
          placeholder="Yeni E-posta Adresi"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="password"
          placeholder="Yeni Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Kaydol
        </button>
      </form>
    </div>
  );
}
