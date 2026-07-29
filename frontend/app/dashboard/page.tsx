"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface UserType {
  id: number;
  email: string;
  balance: number;
  role: string;
}

interface TransactionType {
  id: number;
  senderId: number;
  receiverId: number;
  amountInKurus: number;
  amountTL: number;
  type: string;
  description: string;
  createdAt: string;
}

interface ReconciliationReportType {
  timestamp: string;
  totalUsersChecked: number;
  hasDiscrepancy: boolean;
  details: unknown[];
}

export default function DashboardPage() {
  const router = useRouter();

  // Lazy initialization ile localStorage okuma
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [reconciliationReport, setReconciliationReport] =
    useState<ReconciliationReportType | null>(null);

  // Form State'leri
  const [payCategory, setPayCategory] = useState("yemek");
  const [payAmount, setPayAmount] = useState(50);

  const [transferReceiverId, setTransferReceiverId] = useState<number | null>(
    null,
  );
  const [transferAmount, setTransferAmount] = useState(100);

  const [depositTargetId, setDepositTargetId] = useState<number | null>(null);
  const [depositAmount, setDepositAmount] = useState(500);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser?.role === "admin";

  // Veri yükleme fonksiyonu
  const loadDataManual = async () => {
    if (!currentUser) return;
    try {
      const usersRes = await axios.get("http://localhost:5001/users");
      setAllUsers(usersRes.data);

      // Rol Kontrolü: Admin tümünü, User sadece KENDİ geçmişini çeker
      const endpoint =
        currentUser.role === "admin"
          ? `http://localhost:5001/transactions/all?page=${page}`
          : `http://localhost:5001/transactions/my-history?userId=${currentUser.id}&page=${page}`;

      const txRes = await axios.get(endpoint);
      setTransactions(txRes.data.data);
      setLastPage(txRes.data.lastPage);
    } catch (err) {
      console.error("Veri yüklenemedi", err);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    let isSubscribed = true;

    const fetchData = async () => {
      try {
        const usersRes = await axios.get("http://localhost:5001/users");
        if (!isSubscribed) return;
        setAllUsers(usersRes.data);

        const endpoint =
          currentUser.role === "admin"
            ? `http://localhost:5001/transactions/all?page=${page}`
            : `http://localhost:5001/transactions/my-history?userId=${currentUser.id}&page=${page}`;

        const txRes = await axios.get(endpoint);
        if (!isSubscribed) return;
        setTransactions(txRes.data.data);
        setLastPage(txRes.data.lastPage);
      } catch (err) {
        console.error("Veri yüklenemedi", err);
      }
    };

    void fetchData();

    return () => {
      isSubscribed = false;
    };
  }, [currentUser, page, router]);

  // Ödeme Yap
  const handlePayment = async () => {
    if (!currentUser || isSubmitting) return;
    setIsSubmitting(true);

    const timeStampKey = String(new Date().getTime());
    const idempotencyKey = `pay-${currentUser.id}-${timeStampKey}`;

    try {
      const res = await axios.post(
        "http://localhost:5001/transactions/pay",
        {
          userId: currentUser.id,
          category: payCategory,
          amountTL: Number(payAmount),
        },
        { headers: { "Idempotency-Key": idempotencyKey } },
      );

      alert("Ödeme Başarılı!");
      updateUserBalance(res.data.newBalance);
      await loadDataManual();
    } catch (err: unknown) {
      let errorMsg = "Ödeme başarısız!";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.message || errorMsg;
      }
      alert(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Transfer Gönder (User)
  const handleTransfer = async () => {
    if (!currentUser) return;
    if (!transferReceiverId) {
      alert("Lütfen alıcı seçin!");
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

    const timeStampKey = String(new Date().getTime());
    const idempotencyKey = `transfer-${currentUser.id}-${timeStampKey}`;

    try {
      const res = await axios.post(
        "http://localhost:5001/transactions/transfer",
        {
          senderId: currentUser.id,
          receiverId: transferReceiverId,
          amountTL: Number(transferAmount),
        },
        { headers: { "Idempotency-Key": idempotencyKey } },
      );

      alert("Transfer Başarılı!");
      updateUserBalance(res.data.newBalance);
      await loadDataManual();
    } catch (err: unknown) {
      let errorMsg = "Transfer başarısız!";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.message || errorMsg;
      }
      alert(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bakiye Yükle (Admin)
  const handleDeposit = async () => {
    if (!depositTargetId) {
      alert("Lütfen kullanıcı seçin!");
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await axios.post("http://localhost:5001/transactions/deposit", {
        targetUserId: depositTargetId,
        amountTL: Number(depositAmount),
      });

      alert("Bakiye Yüklendi!");
      await loadDataManual();
    } catch (err: unknown) {
      let errorMsg = "Bakiye yüklenemedi!";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.message || errorMsg;
      }
      alert(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mutabakat (Admin)
  const handleRunReconciliation = async () => {
    try {
      const res = await axios.get("http://localhost:5001/reconciliation/run");
      setReconciliationReport(res.data);
    } catch (err) {
      console.error(err);
      alert("Mutabakat çalıştırılamadı.");
    }
  };

  const updateUserBalance = (newBalance: number) => {
    if (!currentUser) return;
    const updated = { ...currentUser, balance: newBalance };
    setCurrentUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!currentUser) return <div style={centerStyle}>Yükleniyor...</div>;

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      {/* BAKİYE KARTI */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={badgeStyle(isAdmin)}>
            {isAdmin ? "👑 Admin" : "👤 User"}
          </span>
          <button onClick={handleLogout} style={logoutBtnStyle}>
            Çıkış Yap
          </button>
        </div>
        <h2 style={{ margin: "10px 0 5px 0" }}>{currentUser.email}</h2>
        <div style={balanceBoxStyle}>
          <span style={{ fontSize: "14px", color: "#94a3b8" }}>
            GÜNCEL BAKİYE
          </span>
          <h1 style={{ fontSize: "36px", margin: "5px 0", color: "#38bdf8" }}>
            ₺{currentUser.balance.toFixed(2)}
          </h1>
        </div>
      </div>

      {/* İŞLEMLER ALANI */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {/* ÖDE FORMU */}
        <div style={boxStyle}>
          <h3 style={{ marginTop: 0 }}>🛒 Hızlı Ödeme (Kasa)</h3>
          <label style={labelStyle}>Kasa Seçin:</label>
          <select
            style={inputStyle}
            value={payCategory}
            onChange={(e) => setPayCategory(e.target.value)}
          >
            <option value="yemek">Yemek Kasası</option>
            <option value="kahve">Kahve Kasası</option>
            <option value="atistirmalik">Atıştırmalık Kasası</option>
          </select>

          <label style={labelStyle}>Tutar (TL):</label>
          <input
            type="number"
            style={inputStyle}
            value={payAmount}
            onChange={(e) => setPayAmount(Number(e.target.value))}
          />

          <button
            disabled={isSubmitting}
            onClick={handlePayment}
            style={buttonStyle("#10b981")}
          >
            {isSubmitting ? "İşleniyor..." : "Ödeme Yap"}
          </button>
        </div>

        {/* NORMAL USER -> TRANSFER FORMU */}
        {!isAdmin && (
          <div style={boxStyle}>
            <h3 style={{ marginTop: 0 }}>💸 Arkadaşa Transfer</h3>
            <label style={labelStyle}>Alıcı Seçin:</label>
            <select
              style={inputStyle}
              onChange={(e) => setTransferReceiverId(Number(e.target.value))}
              defaultValue=""
            >
              <option value="" disabled>
                -- Kişi Seç --
              </option>
              {allUsers
                .filter((u) => u.id !== currentUser.id)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email}
                  </option>
                ))}
            </select>

            <label style={labelStyle}>Tutar (TL):</label>
            <input
              type="number"
              style={inputStyle}
              value={transferAmount}
              onChange={(e) => setTransferAmount(Number(e.target.value))}
            />

            <button
              disabled={isSubmitting}
              onClick={handleTransfer}
              style={buttonStyle("#3b82f6")}
            >
              {isSubmitting ? "İşleniyor..." : "Gönder"}
            </button>
          </div>
        )}

        {/* ADMIN USER -> BAKİYE YÜKLE FORMU */}
        {isAdmin && (
          <div style={boxStyle}>
            <h3 style={{ marginTop: 0 }}>💵 Kullanıcıya Bakiye Yükle</h3>
            <label style={labelStyle}>Kullanıcı Seçin:</label>
            <select
              style={inputStyle}
              onChange={(e) => setDepositTargetId(Number(e.target.value))}
              defaultValue=""
            >
              <option value="" disabled>
                -- Kullanıcı Seç --
              </option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email} (₺{u.balance})
                </option>
              ))}
            </select>

            <label style={labelStyle}>Yüklenecek Tutar (TL):</label>
            <input
              type="number"
              style={inputStyle}
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
            />

            <button
              disabled={isSubmitting}
              onClick={handleDeposit}
              style={buttonStyle("#8b5cf6")}
            >
              {isSubmitting ? "İşleniyor..." : "Bakiye Yükle"}
            </button>
          </div>
        )}
      </div>

      {/* SADECE ADMIN -> MUTABAKAT PANELİ */}
      {isAdmin && (
        <div
          style={{
            ...boxStyle,
            backgroundColor: "#fffbeb",
            borderColor: "#fde68a",
            marginTop: "20px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>👑 Admin Mutabakat Paneli</h3>
          <button
            onClick={handleRunReconciliation}
            style={buttonStyle("#d97706")}
          >
            🔍 Mutabakat Raporunu Çalıştır
          </button>

          {reconciliationReport && (
            <div
              style={{
                marginTop: "15px",
                background: "#fff",
                padding: "15px",
                borderRadius: "8px",
                border: "1px solid #fcd34d",
              }}
            >
              <h4>
                Mutabakat Sonucu:{" "}
                {reconciliationReport.hasDiscrepancy
                  ? "⚠️ UYUŞMAZLIK VAR"
                  : "✅ TÜM MUTABAKATLAR OK"}
              </h4>
              <pre
                style={{
                  fontSize: "12px",
                  background: "#f8fafc",
                  padding: "10px",
                  borderRadius: "6px",
                  overflowX: "auto",
                }}
              >
                {JSON.stringify(reconciliationReport, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* İŞLEM GEÇMİŞİ TABLOSU (Admin tümünü, User sadece kendisininkini görür) */}
      <div style={{ ...boxStyle, marginTop: "20px" }}>
        <h3 style={{ marginTop: 0 }}>
          📜{" "}
          {isAdmin
            ? "Tüm Sistem İşlem Geçmişi (Admin Paneli)"
            : "İşlem Geçmişim"}
        </h3>

        {transactions.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Henüz bir işlem geçmişiniz bulunmuyor.
          </p>
        ) : (
          <table
            style={{
              width: "100%",
              textAlign: "left",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid #e2e8f0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                <th style={{ padding: "8px" }}>Tipi</th>
                <th style={{ padding: "8px" }}>Açıklama</th>
                <th style={{ padding: "8px", textAlign: "right" }}>Tutar</th>
                <th style={{ padding: "8px" }}>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px 8px" }}>
                    <span style={typeBadgeStyle(tx.type)}>
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px" }}>{tx.description}</td>
                  <td style={{ padding: "10px 8px", fontWeight: "bold" }}>
                    ₺{(tx.amountInKurus / 100).toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Sayfalama */}
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            style={pageBtnStyle}
          >
            Önceki
          </button>
          <span style={{ fontSize: "14px", color: "#475569" }}>
            Sayfa {page} / {lastPage}
          </span>
          <button
            disabled={page >= lastPage}
            onClick={() => setPage((p) => p + 1)}
            style={pageBtnStyle}
          >
            Sonraki
          </button>
        </div>
      </div>
    </div>
  );
}

// Stiller
const cardStyle: React.CSSProperties = {
  background: "#0f172a",
  color: "#fff",
  padding: "24px",
  borderRadius: "16px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
};
const balanceBoxStyle: React.CSSProperties = {
  background: "#1e293b",
  padding: "16px",
  borderRadius: "12px",
  marginTop: "12px",
  textAlign: "center",
};
const boxStyle: React.CSSProperties = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
};
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  color: "#475569",
  marginBottom: "4px",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  margin: "2px 0 14px 0",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
};
const buttonStyle = (bg: string): React.CSSProperties => ({
  width: "100%",
  padding: "12px",
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
});
const badgeStyle = (isAdmin: boolean): React.CSSProperties => ({
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "bold",
  background: isAdmin ? "#fef3c7" : "#e0e7ff",
  color: isAdmin ? "#b45309" : "#3730a3",
});
const typeBadgeStyle = (type: string): React.CSSProperties => ({
  padding: "3px 8px",
  borderRadius: "6px",
  fontSize: "11px",
  fontWeight: "bold",
  background:
    type === "payment"
      ? "#fee2e2"
      : type === "transfer"
        ? "#dbeafe"
        : "#dcfce7",
  color:
    type === "payment"
      ? "#991b1b"
      : type === "transfer"
        ? "#1e40af"
        : "#166534",
});
const pageBtnStyle: React.CSSProperties = {
  padding: "6px 14px",
  border: "1px solid #cbd5e1",
  background: "#fff",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
};
const logoutBtnStyle: React.CSSProperties = {
  padding: "6px 12px",
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "bold",
};
const centerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
};
