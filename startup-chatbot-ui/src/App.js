import React, { useState } from "react";

export default function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Merhaba, Kuveyt Türk-Meet in One Asistanına hoş geldiniz. Size istediğiniz startup çözümleri sunmak için buradayım. Lütfen bana istediğiniz startup çözümünü söyleyiniz."
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!question.trim()) return;

    const newMessages = [...messages, { role: "user", text: question }];
    setMessages(newMessages);
    setQuestion("");
    setLoading(true);

    try {
      const dailyGreetings = ["selam", "selamünaleyküm", "naber", "nasılsın", "günaydın"];
      const lower = question.toLowerCase();
      const matchedGreeting = dailyGreetings.find(g => lower.includes(g));

      if (matchedGreeting) {
        setMessages([...newMessages, { role: "bot", text: "Merhaba! Ben iyiyim, teşekkür ederim. Size nasıl yardımcı olabilirim?" }]);
        setLoading(false);
        return;
      }

      const res = await fetch("https://47821dd4-2081-4b09-93a8-b1b4754e2e87-00-rintijkv4spx.janeway.replit.dev/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      const data = await res.json();
      const reply = data.answer?.trim();

      if (reply && reply.length > 0) {
        const parts = reply.split(/(?<=\n)(?=\d+\.\s)/g);
        const formatted = parts.map(p => ({ role: "bot", text: p.trim() }));
        setMessages([...newMessages, ...formatted]);
      } else {
        setMessages([...newMessages, { role: "bot", text: "Ben sadece size startup çözümleri bulma noktasında yardımcı olabilirim." }]);
      }
    } catch (err) {
      console.error("Error:", err);
      setMessages([...messages, { role: "bot", text: "Bir hata oluştu." }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageText = (text) => {
    const urlRegex = /(?:Website:\s*)(https?:\/\/[^\s]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
      const before = text.substring(lastIndex, match.index);
      const url = match[1];
      parts.push(<span key={lastIndex}>{before}Website: </span>);
      parts.push(<a key={url} href={url} target="_blank" rel="noopener noreferrer">{url}</a>);
      lastIndex = urlRegex.lastIndex;
    }

    parts.push(<span key={lastIndex}>{text.substring(lastIndex)}</span>);
    return parts;
  };

  return (
    <div style={{ fontFamily: "Arial", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Banner */}
      <div style={{ backgroundColor: "#16A086", color: "white", padding: "15px 20px", display: "flex", alignItems: "center" }}>
        {/*<img src="https://www.kuveytturk.com.tr/medium/GalleryImage-Image-81-2x.vsf" alt="Logo" style={{ height: 60, marginRight: 20 }} />*/}
        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Meet-In-One Bot</h2>
      </div>

      {/* Chatbox */}
      <div style={{ maxWidth: 600, margin: "20px auto", background: "white", borderRadius: 10, boxShadow: "0 4px 10px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", height: "70vh", width: "90%" }}>
        <div style={{ flexGrow: 1, padding: 15, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              backgroundColor: msg.role === "user" ? "#B2DFDB" : "#E6E6E6",
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 10,
              padding: "10px 14px",
              borderRadius: 18,
              maxWidth: "85%",
              wordBreak: "break-word"
            }}>
              {renderMessageText(msg.text)}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: "flex-start", marginBottom: 12 }}>
              <div className="spinner" style={{ width: 24, height: 24, border: "4px solid #ccc", borderTop: "4px solid #16A086", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{ padding: 10, display: "flex", borderTop: "1px solid #ccc", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Mesajınızı yazın..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            style={{ flexGrow: 1, padding: 12, fontSize: 16, borderRadius: 8, border: "1px solid #ccc", minWidth: 0, flex: 1 }}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            style={{
              marginTop: 10,
              backgroundColor: "#16A086",
              color: "white",
              padding: "10px 18px",
              border: "none",
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer",
              flexShrink: 0
            }}
          >
            Gönder
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: 14, color: "#666", paddingBottom: 20 }}>
        © 2025 MeetInOne. Tüm hakları saklıdır.
      </div>

      {/* Spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
