import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { supabase } from "../supabase";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [toast, setToast] = useState({ message: "", type: "" });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, role, usn, year, section, branch, employee_id, department, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      setToast({ message: "Could not load users", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3500);
  }

  async function handleRoleChange(userId, newRole) {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);
      if (error) throw error;
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      showToast(`Role changed to ${newRole}`);
    } catch (err) {
      showToast(err.message || "Failed to update role", "error");
    }
  }

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.usn?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleColors = {
    student: "type-classroom",
    faculty: "type-lab",
    admin: "type-seminar-hall",
  };

  return (
    <AdminLayout title="User Management" subtitle="View and manage student & faculty accounts">
      {toast.message && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === "success" ? "✓ " : "✕ "}
          {toast.message}
        </div>
      )}

      <div className="manage-page">
        {/* Filters */}
        <div className="section-toolbar">
          <div className="search-filter-group">
            <div className="search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, email or USN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && <button className="clear-btn" onClick={() => setSearch("")}>✕</button>}
            </div>
            <select className="type-select-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* User List */}
        {loading ? (
          <div className="loading-state"><div className="spinner" /><p>Loading users...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No users found</h3>
            <p>Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="table-card">
            <div className="table-header-meta">
              <span className="total-badge">{filtered.length} users</span>
            </div>
            <div className="table-responsive desktop-only">
              <table className="custom-data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>ID / USN</th>
                    <th>Department / Year</th>
                    <th>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id}>
                      <td className="cell-room"><span className="room-pill">{user.name || "—"}</span></td>
                      <td className="cell-muted">{user.email || "—"}</td>
                      <td>
                        <span className={`type-badge ${roleColors[user.role] || ""}`}>
                          {user.role || "—"}
                        </span>
                      </td>
                      <td className="cell-muted">{user.usn || user.employee_id || "—"}</td>
                      <td className="cell-muted">
                        {user.department || (user.year ? `${user.year} ${user.section || ""}` : "—")}
                      </td>
                      <td>
                        <select
                          className="role-change-select"
                          value={user.role || "student"}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        >
                          <option value="student">Student</option>
                          <option value="faculty">Faculty</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="classroom-cards mobile-only">
              {filtered.map((user) => (
                <div key={user.id} className="classroom-card">
                  <div className="classroom-card-header">
                    <span className="room-pill">{user.name || "—"}</span>
                    <span className={`type-badge ${roleColors[user.role] || ""}`}>{user.role || "—"}</span>
                  </div>
                  <div className="classroom-card-body">
                    <div className="classroom-card-row">
                      <span className="cell-muted">{user.email || "—"}</span>
                    </div>
                    <div className="classroom-card-row">
                      <span className="cell-muted">{user.usn || user.employee_id || "—"}</span>
                    </div>
                  </div>
                  <div className="classroom-card-actions">
                    <select
                      className="role-change-select"
                      value={user.role || "student"}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}