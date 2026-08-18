"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface UserType {
  id?: string;
  _id?: string;
  email: string;
  balance: number;
  role?: string;
}

interface TransactionType {
  id?: string;
  _id?: string;
  userId: string;
  type: string;
  amount: number;
  description?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [payCategory, setPayCategory] = useState("Yemek Kasası");
  const [payAmount, setPayAmount] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const fetchData = async (currentUser: UserType) => {
    try {
      setLoading(true);
      const userId = currentUser._id || currentUser.id;

      let activeUser = currentUser;

      // 1. Veritabanından en güncel halini çek
      if (userId) {
        try {
          const meRes = await axios.get(
            `http://localhost:5002/users/${userId}`,
          );
          if (meRes.data) {
            activeUser = {
              ...meRes.data,
              id: meRes.data._id || meRes.data.id,
            };
            setUser(activeUser);
            localStorage.setItem("user", JSON.stringify(activeUser));
          }
        } catch (e) {
          console.warn("Profil tazelenirken hata:", e);
        }
      }

      // 2. Diğer kullanıcıları getir
      const usersRes = await axios.get("http://localhost:5002/users");
      const others = usersRes.data.filter(
        (u: UserType) => (u._id || u.id) !== userId,
      );
      setAllUsers(others);

      // 3. İşlemleri getir
      const currentRole = String(activeUser.role).trim().toUpperCase();
      const txRes = await axios.get(
        `http://localhost:5002/transactions?userId=${userId}&role=${currentRole}`,
      );
      setTransactions(txRes.data);
    } catch (err) {
      console.error("Veri çekme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initDashboard = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        router.push("/login");
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser) as UserType;
        await fetchData(parsedUser);
      } catch {
        localStorage.removeItem("user");
        router.push("/login");
      }
    };

    initDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handlePayment = async () => {
    if (!user || !payAmount || Number(payAmount) <= 0) return;
    const amount = Number(payAmount);

    if (user.balance < amount) {
      alert("Yetersiz bakiye!");
      return;
    }

    try {
      const userId = user._id || user.id;
      await axios.post("http://localhost:5002/transactions", {
        userId,
        type: payCategory,
        amount,
        description: `${payCategory} ödemesi`,
      });

      alert("Ödeme başarılı!");
      setPayAmount("");
      await fetchData(user);
    } catch (err) {
      console.error(err);
      alert("Ödeme yapılırken hata oluştu!");
    }
  };

  const handleTransfer = async () => {
    if (
      !user ||
      !targetUserId ||
      !transferAmount ||
      Number(transferAmount) <= 0
    )
      return;
    const amount = Number(transferAmount);

    if (user.balance < amount) {
      alert("Yetersiz bakiye!");
      return;
    }

    const receiver = allUsers.find((u) => (u._id || u.id) === targetUserId);

    try {
      const userId = user._id || user.id;
      await axios.post("http://localhost:5002/transactions", {
        userId,
        receiverId: targetUserId,
        type: "Transfer",
        amount,
        description: `Transfer -> ${receiver?.email || targetUserId}`,
      });

      alert("Transfer başarılı!");
      setTransferAmount("");
      setTargetUserId("");
      await fetchData(user);
    } catch (err) {
      console.error(err);
      alert("Transfer sırasında hata oluştu!");
    }
  };

  if (loading && !user) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>Yükleniyor...</div>
    );
  }

  const isAdmin = String(user?.role).trim().toUpperCase() === "ADMIN";

  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: "system-ui",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* ÜST BİLGİ KARTI */}
        <div
          style={{
            backgroundColor: "#1e293b",
            borderRadius: "16px",
            padding: "30px",
            color: "white",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            {/* ROZET KISMI */}
            <span
              style={{
                backgroundColor: isAdmin ? "#d97706" : "#2563eb",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {isAdmin ? "👑 ADMIN" : "👤 KULLANICI"}
            </span>

            <span style={{ color: "#94a3b8", fontSize: "14px" }}>
              {user?.email}
            </span>

            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#ef444420",
                color: "#f87171",
                border: "1px solid #ef444440",
                padding: "6px 16px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Çıkış Yap
            </button>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                letterSpacing: "1px",
              }}
            >
              GÜNCEL HESAP BAKİYESİ
            </div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                color: "#38bdf8",
                marginTop: "5px",
              }}
            >
              ₺
              {user?.balance?.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        {/* İŞLEM FORM KARTLARI */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {/* ÖDEME */}
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>
              🛒 Hızlı Ödeme (Kasa)
            </h3>
            <select
              value={payCategory}
              onChange={(e) => setPayCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
              }}
            >
              <option value="Yemek Kasası">🍔 Yemek Kasası</option>
              <option value="Kahve Kasası">☕ Kahve Kasası</option>
              <option value="Aktivite Kasası">🎯 Aktivite Kasası</option>
            </select>
            <input
              type="number"
              placeholder="Tutar (TL)"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "16px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={handlePayment}
              style={{
                width: "100%",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Ödeme Yap
            </button>
          </div>

          {/* TRANSFER */}
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>
              💸 Arkadaşa Transfer
            </h3>
            <select
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
              }}
            >
              <option value="">-- Alıcı Seçin --</option>
              {allUsers.map((u) => (
                <option key={u._id || u.id} value={u._id || u.id}>
                  {u.email}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Tutar (TL)"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "16px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={handleTransfer}
              style={{
                width: "100%",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Transfer Gönder
            </button>
          </div>
        </div>

        {/* İŞLEM GEÇMİŞİ */}
        <div
          style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h3
            style={{ margin: "0 0 20px 0", fontSize: "18px", color: "#0f172a" }}
          >
            📜 {isAdmin ? "Tüm Sistem İşlem Geçmişi" : "İşlem Geçmişim"}
          </h3>
          {transactions.length === 0 ? (
            <div
              style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}
            >
              Henüz işlem bulunmuyor.
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx._id || tx.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div>
                  <div style={{ fontWeight: "600", color: "#334155" }}>
                    {tx.type} {tx.description ? `- ${tx.description}` : ""}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#94a3b8",
                      marginTop: "2px",
                    }}
                  >
                    {tx.createdAt
                      ? new Date(tx.createdAt).toLocaleString("tr-TR")
                      : "-"}
                  </div>
                </div>
                <div style={{ fontWeight: "bold", color: "#ef4444" }}>
                  -₺
                  {tx.amount?.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
