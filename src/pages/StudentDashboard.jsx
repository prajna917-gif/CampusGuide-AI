import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  NOTIF_ICON,
  timeAgo,
} from "../services/notificationService";

export default function StudentDashboard() {
  const { profile } = useAuth();
  const studentName = profile?.name || "Manya";
  const [activeTab, setActiveTab] = useState("cards");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    const [data, count] = await Promise.all([getNotifications(), getUnreadCount()]);
    setNotifications(data);
    setUnreadCount(count);
    setNotifLoading(false);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  async function handleMarkRead(id) {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function handleMarkAllRead() {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  const cards = [
    { label: "Today's Timetable", desc: "View your classes", to: "/student/timetable", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    )},
    { label: "Find Classroom", desc: "Search & navigate", to: "/find-classroom", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    )},
    { label: "Campus Map", desc: "Explore building map", to: "/map", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    )},
    { label: "Your Profile", desc: "View / edit details", to: "/profile", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )},
  ];

  return (
    <AppLayout
      title="Student Dashboard"
      subtitle="Your campus overview & schedule"
    >
      <div className="dashboard-welcome-banner cg-welcome-banner">
        <h1 className="greeting-text">Good Morning, {studentName}! 👋</h1>
        <p className="greeting-sub">Here&apos;s your today&apos;s overview.</p>
      </div>

      <div className="student-tab-bar cg-seg-tabs">
        {["cards", "notifications"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "cards" ? "Quick Cards" : (
              <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                Notifications
                {unreadCount > 0 && (
                  <span className="notif-badge cg-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "cards" && (
        <div className="portal-cards-grid cg-grid-2x2">
          {cards.map((card) => (
            <Link key={card.label} to={card.to} className="portal-card cg-tile">
              <div className="portal-icon-box cg-tile-icon">
                {card.icon}
              </div>
              <div className="portal-card-body">
                <h3>{card.label}</h3>
                <span className="card-link-text">{card.desc} ›</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="notification-panel cg-card">
          <div className="notification-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2 style={{ margin: 0 }}>Notifications</h2>
            {unreadCount > 0 && (
              <button className="mark-all-read-btn cg-link-btn" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          {notifLoading ? (
            <div className="empty-state cg-empty"><span className="empty-icon">⏳</span><p>Loading...</p></div>
          ) : notifications.length === 0 ? (
            <div className="empty-state cg-empty">
              <span className="empty-icon">🔔</span>
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item cg-notif-row ${notif.is_read ? "notif-read read" : "notif-unread"}`}
                  onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                  style={{ cursor: notif.is_read ? "default" : "pointer" }}
                >
                  <div className={`notification-icon cg-notif-iconbox notif-${notif.type}`}>
                    {NOTIF_ICON[notif.type] ?? "ℹ️"}
                  </div>
                  <div className="notification-content cg-notif-body">
                    <div className="notification-title" style={{ fontWeight: 600, marginBottom: "2px" }}>
                      {notif.title}
                      {!notif.is_read && <span className="unread-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0A66E0", display: "inline-block", marginLeft: "6px" }} />}
                    </div>
                    <div className="notification-message" style={{ color: "#475569", fontSize: "0.9rem" }}>{notif.message}</div>
                  </div>
                  <div className="notification-time cg-notif-time" style={{ color: "#6B7280", fontSize: "0.8rem" }}>{timeAgo(notif.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
