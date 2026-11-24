import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { supabase } from "../supabase";

export default function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadActivity();
  }, []);

  async function loadActivity() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, role, content, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;

      const { data: notifs } = await supabase
        .from("notifications")
        .select("id, title, type, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      const combined = [
        ...(data || []).map((m) => ({
          id: `chat-${m.id}`,
          type: "ai_chat",
          title: m.role === "user" ? "User asked AI" : "AI replied",
          detail: m.content?.substring(0, 80) || "",
          time: m.created_at,
          icon: m.role === "user" ? "💬" : "🤖",
        })),
        ...(notifs || []).map((n) => ({
          id: `notif-${n.id}`,
          type: "notification",
          title: n.title,
          detail: `Notification sent (${n.type})`,
          time: n.created_at,
          icon: "📢",
        })),
      ].sort((a, b) => new Date(b.time) - new Date(a.time));

      setActivities(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = activities.filter((a) => {
    if (filter === "all") return true;
    return a.type === filter;
  });

  function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? "s" : ""} ago`;
  }

  return (
    <AdminLayout title="Activity Log" subtitle="Recent activity across the campus platform">
      <div className="manage-page">
        <div className="section-toolbar">
          <div className="floor-filter-pills">
            <button className={`pill-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
            <button className={`pill-btn ${filter === "ai_chat" ? "active" : ""}`} onClick={() => setFilter("ai_chat")}>AI Chat</button>
            <button className={`pill-btn ${filter === "notification" ? "active" : ""}`} onClick={() => setFilter("notification")}>Notifications</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner" /><p>Loading activity...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No activity yet</h3>
            <p>Activity will appear here as users interact with the platform.</p>
          </div>
        ) : (
          <div className="recent-changes-list">
            {filtered.map((item) => (
              <div key={item.id} className="recent-change-item">
                <div className="recent-change-icon icon-blue">
                  <span style={{ fontSize: "18px" }}>{item.icon}</span>
                </div>
                <div className="recent-change-content">
                  <span className="recent-change-title">{item.title}</span>
                  <span className="recent-change-desc">{item.detail}</span>
                </div>
                <span className="recent-change-time">{timeAgo(item.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}