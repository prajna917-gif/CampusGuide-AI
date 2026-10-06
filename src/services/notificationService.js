import { supabase } from "../supabase";

const LOCAL_STORAGE_KEY = "campusguide_notifications_data";

const DEFAULT_NOTIFICATIONS = [
  {
    id: "demo-1",
    user_id: null,
    role: null,
    title: "Welcome to CampusGuide!",
    message: "Navigate your campus easily using the indoor map.",
    type: "info",
    related_room_id: null,
    related_allocation_id: null,
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    user_id: null,
    role: "faculty",
    title: "Room Booking System Live",
    message: "You can now request classroom changes directly from your dashboard.",
    type: "success",
    related_room_id: null,
    related_allocation_id: null,
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    user_id: null,
    role: null,
    title: "Holiday Notice",
    message: "College will remain closed on Oct 15th for a public holiday.",
    type: "warning",
    related_room_id: null,
    related_allocation_id: null,
    is_read: false,
    created_at: new Date().toISOString(),
  },
];

// ─── ICON / COLOR MAP ────────────────────────────────────────────────────────
export const NOTIF_ICON = {
  info:        "ℹ️",
  warning:     "⚠️",
  success:     "✅",
  error:       "🔴",
  room_change: "🏫",
};

function getLocalNotifications() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

function setLocalNotifications(items) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

// ─── FETCH ────────────────────────────────────────────────────────────────────

/**
 * Fetch notifications for the current user (personal + role-broadcasts).
 * Falls back to localStorage (demo mode) if Supabase is unavailable.
 */
export async function getNotifications(limit = 30) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("Notifications fetch error:", error.message);
      throw error;
    }
    return data ?? [];
  } catch {
    return getLocalNotifications();
  }
}

/**
 * Count unread notifications for the current user.
 */
export async function getUnreadCount() {
  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);

    if (error) throw error;
    return count ?? 0;
  } catch {
    const local = getLocalNotifications();
    return local.filter((n) => !n.is_read).length;
  }
}

// ─── MARK AS READ ─────────────────────────────────────────────────────────────

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId) {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) throw error;
  } catch {
    const local = getLocalNotifications();
    const updated = local.map((n) =>
      n.id === notificationId ? { ...n, is_read: true } : n
    );
    setLocalNotifications(updated);
  }
}

export async function markAllAsRead() {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false);

    if (error) throw error;
  } catch {
    const local = getLocalNotifications();
    const updated = local.map((n) => ({ ...n, is_read: true }));
    setLocalNotifications(updated);
  }
}

// ─── ADMIN: POST NOTIFICATION ─────────────────────────────────────────────────

/**
 * Post a notification (admin only).
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {'info'|'warning'|'success'|'error'|'room_change'} [opts.type]
 * @param {'student'|'faculty'|'admin'|null} [opts.role] - null = all roles
 * @param {string|null} [opts.userId]  - null = broadcast to role
 */
export async function postNotification({ title, message, type = "info", role = null, userId = null }) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert({ title, message, type, role, user_id: userId })
      .select();

    if (error) {
      const hint =
        error.message.includes("row-level security")
          ? "\n\nRLS blocked the insert — check: the admin user must have a row in public.profiles with role = 'admin' (my_role() must return 'admin'). Additionally, ensure only ONE schema file was run (schema_rooms.sql OR schema_notifications.sql, not both)."
          : "";
      throw new Error(error.message + hint);
    }

    return data?.[0] ?? null;
  } catch (err) {
    const local = getLocalNotifications();
    const newNotif = {
      id: "local-" + Date.now(),
      user_id: userId,
      role,
      title,
      message,
      type,
      related_room_id: null,
      related_allocation_id: null,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setLocalNotifications([newNotif, ...local]);
    return newNotif;
  }
}

// ─── RELATIVE TIME HELPER ─────────────────────────────────────────────────────
export function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)  return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? "s" : ""} ago`;
}
