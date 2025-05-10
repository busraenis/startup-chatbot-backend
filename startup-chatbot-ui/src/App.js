import React, { useState } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("https://startup-chatbot-backend-1.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      setAnswer(data.answer);
    } catch (e) {
      setAnswer("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    "Risk Yönetimi", "Kredi", "Yapay Zeka", "Güvenlik",
    "Kimlik Doğrulama", "Siber Güvenlik", "Veri Analizi", "Müşteri İçgörüleri"
  ];

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>Startup Çözüm Bulucu</h1>

      <div style={{ marginTop: 20, padding: 15, backgroundColor: "#f3f4f6", borderRadius: 8 }}>
        <p style={{ marginBottom: 4 }}>🔍 Merhaba! Size hangi konuda yardımcı olabilirim?</p>
        <p style={{ fontSize: 14, color: "#555" }}>
          İş biriminizin ihtiyaç duyduğu dijital çözümü bulmak için ne aradığınızı kısaca yazın.
        </p>
        <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
          Örn: “Kredi risk değerlendirme çözümü arıyorum” veya “Müşteri hizmetleri için chatbot önerir misin?”
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 15 }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ne tür bir çözüm arıyorsunuz?"
          style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button onClick={handleSubmit} disabled={loading} style={{
          padding: "10px 16px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer"
        }}>
          {loading ? "Gönderiliyor..." : "Gönder"}
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Önerilen Çözümler:</h3>
        <div style={{ marginTop: 8, whiteSpace: "pre-line", padding: 10, backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: 6 }}>
          {answer ? answer : "Henüz bir öneri yok."}
        </div>
      </div>

      <div style={{ marginTop: 30 }}>
        <h4>Hızlı Filtreler:</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
          {filters.map((tag, i) => (
            <span
              key={i}
              onClick={() => setQuestion(tag)}
              style={{
                backgroundColor: "#e5e7eb",
                padding: "6px 12px",
                borderRadius: 16,
                cursor: "pointer",
                fontSize: 14
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
