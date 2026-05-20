import React, { useState } from "react";

function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: input
        })
      });

      if (!res.ok) {
        throw new Error(`Chat API error: ${res.status}`);
      }

      const data = await res.json();

      // Add bot reply
      const botMessage = {
        sender: "bot",
        text: data.reply
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (err) {
      console.error(err);
    }

    setInput("");
  };

  return (
    <>
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "340px",
            maxHeight: "480px",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0px 20px 60px rgba(0,0,0,0.2)",
            padding: "12px",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: 0, fontSize: "1rem" }}>🤖 AI Chatbot</h3>
            <button
              onClick={() => setOpen(false)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "1.25rem",
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              flex: 1,
              minHeight: "220px",
              overflowY: "auto",
              border: "1px solid #e0e0e0",
              padding: "10px",
              borderRadius: "12px",
              marginBottom: "10px",
              background: "#fafafa"
            }}
          >
            {messages.length === 0 ? (
              <div style={{ color: "#666", fontSize: "0.95rem" }}>
                Start the conversation by asking a question.
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                    marginBottom: "10px"
                  }}
                >
                  <div
                    style={{
                      background: msg.sender === "user" ? "#007bff" : "#e5e5ea",
                      color: msg.sender === "user" ? "white" : "black",
                      padding: "10px 14px",
                      borderRadius: "18px",
                      maxWidth: "80%",
                      wordBreak: "break-word"
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Ask something..."
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: "12px",
                border: "1px solid #d1d5db"
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                border: "none",
                background: "#2563eb",
                color: "white",
                cursor: "pointer"
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "58px",
          height: "58px",
          borderRadius: "50%",
          background: "#2563eb",
          border: "none",
          color: "white",
          fontSize: "1.5rem",
          cursor: "pointer",
          boxShadow: "0px 10px 30px rgba(37,99,235,0.3)",
          zIndex: 1000
        }}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        💬
      </button>
    </>
  );
}

export default Chatbot;