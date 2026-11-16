import { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import { getNotifications, markAllAsRead, NOTIF_ICON } from "../services/notificationService";

function timeLabel(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch { return ""; }
}

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setItems(await getNotifications()); } catch { setItems([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const toggle = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <AppLayout hideBottomNav>
      <div className="cg-notif-page">
        <div className="cg-notif-head">
          <h1>Notifications</h1>
          <div className="cg-notif-actions">
            <button className="cg-link-btn" onClick={() => setSelectMode((v) => !v)}>{selectMode ? "Done" : "Select"}</button>
            <button className="cg-icon-btn" onClick={() => window.history.back()} aria-label="Close">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {selectMode && items.length > 0 && (
          <div className="cg-notif-bulk">
            <span>{selected.size} selected</span>
            <button className="cg-link-btn" onClick={async () => { await markAllAsRead(); setItems((p)=>p.map(n=>({...n,is_read:true}))); setSelected(new Set()); }}>Mark read</button>
          </div>
        )}

        {loading ? (
          <div className="cg-empty">Loading…</div>
        ) : items.length === 0 ? (
          <div className="cg-empty">
            <div className="cg-empty-icon">🔔</div>
            <p>No notifications yet</p>
          </div>
        ) : (
          <ul className="cg-notif-list">
            {items.map((n) => (
              <li key={n.id} className={`cg-notif-row ${n.is_read ? "read" : ""}`} onClick={() => selectMode && toggle(n.id)}>
                {selectMode && (
                  <span className={`cg-check ${selected.has(n.id) ? "checked" : ""}`}>{selected.has(n.id) ? "✓" : ""}</span>
                )}
                <div className="cg-notif-iconbox">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </div>
                <div className="cg-notif-body">
                  <div className="cg-notif-msg">{n.message || n.title}</div>
                  <div className="cg-notif-time">{n.title && n.message ? `${n.title} · ` : ""}{timeLabel(n.created_at)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}
