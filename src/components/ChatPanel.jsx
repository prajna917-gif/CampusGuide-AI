import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { clearChatHistory, getChatHistory, sendChatMessage } from "../services/chatService";

let msgSeq = 0;
const nextId = () => `m-${Date.now()}-${msgSeq++}`;

export default function ChatPanel({ compact = false, showEmptyHint = false }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const listRef = useRef(null);

  const isDemo = Boolean(user?.id?.startsWith("demo-"));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (isDemo) { setLoaded(true); return; }
      try {
        const data = await getChatHistory();
        if (!cancelled) setMessages(data.map((m) => ({ id: m.id, role: m.role, content: m.content })));
      } catch (err) {
        console.warn("Chat history unavailable:", err.message);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [isDemo]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending || isDemo) return;
    setInput("");
    setError("");
    setSending(true);
    const tempId = nextId();
    setMessages((prev) => [...prev, { id: tempId, role: "user", content: text }]);
    try {
      const data = await sendChatMessage(text);
      setMessages((prev) => [...prev, { id: nextId(), role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError(err.message || "Could not reach the assistant. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleClear() {
    if (sending) return;
    try { await clearChatHistory(); setMessages([]); setError(""); } catch { setError("Could not clear the conversation."); }
  }

  if (isDemo) {
    return (
      <div className="chat-notice">
        <div className="chat-notice-icon">🔐</div>
        <h3>Sign in to use the AI assistant</h3>
        <p>You are using a demo account. Sign in with a real account to use the AI Guide.</p>
      </div>
    );
  }

  return (
    <div className={`chat-panel ${compact ? "chat-panel-compact" : "chat-panel-page"} ${showEmptyHint ? "chat-has-hint" : ""}`}>
      <div className="chat-messages" ref={listRef}>
        {!loaded ? (
          <div className="chat-loading"><div className="spinner"></div></div>
        ) : messages.length === 0 ? (
          showEmptyHint ? (
            <div className="cg-chat-empty-dashed">
              <div className="cg-chat-empty-ill">
                <svg viewBox="0 0 120 80" width="140" height="94" fill="none" stroke="#0A66E0" strokeWidth="2">
                  <rect x="10" y="18" width="70" height="44" rx="10" fill="#EEF4FF"/>
                  <circle cx="95" cy="22" r="14" fill="#E0ECFF"/>
                  <path d="M86 48h26l6 10-6-2H86l-6 2z" fill="#EEF4FF"/>
                </svg>
              </div>
              <p className="cg-chat-empty-text">Ask me where any class, lab or staff room is!</p>
            </div>
          ) : (
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <h3>CampusGuide Assistant</h3>
              <p>Ask me about classrooms, timetables, or getting around campus.</p>
            </div>
          )
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`chat-msg ${m.role === "user" ? "chat-msg-user" : "chat-msg-assistant"}`}>
              <div className="chat-bubble">{m.content}</div>
            </div>
          ))
        )}
        {sending && (
          <div className="chat-msg chat-msg-assistant"><div className="chat-bubble chat-typing"><span></span><span></span><span></span></div></div>
        )}
      </div>
      {error && <div className="chat-error">{error}</div>}
      <form className="chat-input-row" onSubmit={handleSend}>
        <input className="chat-input" type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me where any class, lab or staff room is!" disabled={sending} autoComplete="off" maxLength={4000} />
        <button className="chat-send-btn" type="submit" disabled={sending || !input.trim()} aria-label="Send">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
        {messages.length > 0 && <button className="chat-clear-btn" type="button" onClick={handleClear} disabled={sending} title="Clear">✕</button>}
      </form>
    </div>
  );
}
