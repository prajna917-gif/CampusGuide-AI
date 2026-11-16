import { Link, useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";

const Tile = ({ to, icon, label }) => (
  <Link to={to} className="cg-tile">
    <div className="cg-tile-icon">{icon}</div>
    <span className="cg-tile-label">{label}</span>
  </Link>
);

const I = ({ d, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);

export default function StudentDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const name = profile?.name || "there";

  const grid = [
    { label: "Ground Floor", to: "/map?floor=0", icon: <span className="cg-floor-num">G</span> },
    { label: "1st Floor", to: "/map?floor=1", icon: <span className="cg-floor-num">1</span> },
    { label: "2nd Floor", to: "/map?floor=2", icon: <span className="cg-floor-num">2</span> },
    { label: "3rd Floor", to: "/map?floor=3", icon: <span className="cg-floor-num">3</span> },
    { label: "Classrooms", to: "/explore?q=classrooms", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 20h10"/><path d="M12 18v2"/></svg> },
    { label: "Labs", to: "/explore?q=labs", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 2v7.5L5.5 19A2 2 0 0 0 7.3 22h9.4a2 2 0 0 0 1.8-3L14 9.5V2"/><line x1="8" y1="2" x2="16" y2="2"/></svg> },
    { label: "Departments", to: "/explore?q=departments", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { label: "Staff Rooms", to: "/explore?q=staff", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label: "AI Guide", to: "/chat", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2z"/></svg> },
  ];

  const featured = [
    { title: "Room Shift Today", desc: "3rd Year Sec B moved to 405", icon: "🔄", to: "/notifications" },
    { title: "Exam Hall Allocation", desc: "Check your exam seating & hall", icon: "📝", to: "/notifications" },
    { title: "Event / Seminar", desc: "Upcoming campus events & venues", icon: "🎤", to: "/events" },
  ];

  return (
    <AppLayout>
      <section className="cg-hero">
        <h1>Find Your Way<br/><span className="cg-hero-accent">Around Campus!</span></h1>
        <p className="cg-hero-sub">Hi {name}, where do you want to go today?</p>
      </section>

      <section className="cg-grid-3x3">
        {grid.map((g) => <Tile key={g.label} to={g.to} icon={g.icon} label={g.label} />)}
      </section>

      <section className="cg-featured">
        <div className="cg-section-head">
          <h2>Featured</h2>
          <button className="cg-link-btn" onClick={() => navigate("/notifications")}>See all</button>
        </div>
        <div className="cg-carousel">
          {featured.map((f) => (
            <Link key={f.title} to={f.to} className="cg-feature-card">
              <div className="cg-feature-icon">{f.icon}</div>
              <div className="cg-feature-body">
                <strong>{f.title}</strong>
                <span>{f.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
