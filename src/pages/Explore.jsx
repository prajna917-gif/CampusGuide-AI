import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";

const categories = [
  { label: "Classrooms", icon: "🏫", q: "classrooms" },
  { label: "Labs", icon: "🔬", q: "labs" },
  { label: "HOD Chambers", icon: "🧑‍💼", q: "hod" },
  { label: "Staff Rooms", icon: "👔", q: "staff" },
  { label: "Departments", icon: "🏛️", q: "departments" },
  { label: "Staircases", icon: "🪜", q: "stairs" },
  { label: "Library", icon: "📚", q: "library" },
  { label: "Seminar Hall", icon: "🎤", q: "seminar" },
  { label: "Washrooms", icon: "🚻", q: "washrooms" },
  { label: "Canteen", icon: "🍽️", q: "canteen" },
  { label: "Admin Office", icon: "🏢", q: "admin" },
  { label: "Faculty", icon: "👩‍🏫", q: "faculty" },
];

export default function Explore() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");

  const submit = (e) => {
    e.preventDefault();
    navigate(`/find-classroom?q=${encodeURIComponent(q)}`);
  };

  return (
    <AppLayout hideBottomNav>
      <div className="cg-explore">
        <form className="cg-search-bar" onSubmit={submit}>
          <button type="button" className="cg-search-back" onClick={() => navigate(-1)} aria-label="Back">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search room, class, section or staff..."
          />
          <button type="submit" className="cg-search-go" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </form>

        <h2 className="cg-explore-title">Explore</h2>
        <div className="cg-explore-grid">
          {categories.map((c) => (
            <Link key={c.label} to={`/find-classroom?q=${c.q}`} className="cg-explore-item">
              <span className="cg-explore-circle">{c.icon}</span>
              <span className="cg-explore-label">{c.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
