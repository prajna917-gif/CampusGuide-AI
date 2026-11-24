import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InstallPwaPrompt from "./InstallPwaPrompt";
import { getUnreadCount } from "../services/notificationService";
import QRScannerPage from "../pages/QRScanner";

const Icon = ({ name, size = 22 }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    menu: <svg {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    close: <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    collapse: <svg {...p}><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>,
    search: <svg {...p}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    bell: <svg {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    chat: <svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    home: <svg {...p}><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M9 20v-6h6v6"/></svg>,
    map: <svg {...p}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    pin: <svg {...p}><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>,
    calendar: <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    users: <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    lab: <svg {...p}><path d="M10 2v7.5L5.5 19A2 2 0 0 0 7.3 22h9.4a2 2 0 0 0 1.8-3L14 9.5V2"/><line x1="8" y1="2" x2="16" y2="2"/></svg>,
    alert: <svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    spark: <svg {...p}><path d="M12 2l2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2z"/></svg>,
    folder: <svg {...p}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    clock: <svg {...p}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>,
    chevronDown: <svg {...p}><polyline points="6 9 12 15 18 9"/></svg>,
    arrow: <svg {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    plus: <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    bookmark: <svg {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
    compass: <svg {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
    myclass: <svg {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    // QR Code icons for bottom nav - all three use QR code base with distinguishing marks
    qrMyClass: <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Quiet zone background */}
      <rect x="2" y="2" width="20" height="20" rx="2" fill="currentColor" fillOpacity="0.1"/>
      {/* Finder pattern TL (7x7 black, 5x5 white, 3x3 black) */}
      <rect x="3" y="3" width="7" height="7" fill="currentColor"/>
      <rect x="4" y="4" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1"/>
      <rect x="5.5" y="5.5" width="2" height="2" fill="currentColor"/>
      {/* Finder pattern TR */}
      <rect x="14" y="3" width="7" height="7" fill="currentColor"/>
      <rect x="15" y="4" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1"/>
      <rect x="16.5" y="5.5" width="2" height="2" fill="currentColor"/>
      {/* Finder pattern BL */}
      <rect x="3" y="14" width="7" height="7" fill="currentColor"/>
      <rect x="4" y="15" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1"/>
      <rect x="5.5" y="16.5" width="2" height="2" fill="currentColor"/>
      {/* Timing patterns - horizontal and vertical */}
      <g stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1.5">
        <line x1="10.5" y1="5" x2="13.5" y2="5"/> {/* horizontal between finders */}
        <line x1="5" y1="10.5" x2="5" y2="13.5"/> {/* vertical between finders */}
      </g>
      {/* Alignment pattern (bottom right area) - small 5x5 */}
      <rect x="15" y="15" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1"/>
      <rect x="16" y="16" width="3" height="3" fill="none" stroke="currentColor" strokeWidth="0.8"/>
      <circle cx="17.5" cy="17.5" r="0.8" fill="currentColor"/>
      {/* Data modules - scattered dots representing data */}
      <g fill="currentColor" opacity="0.6">
        <rect x="10.5" y="7" width="1.2" height="1.2"/>
        <rect x="12.5" y="7" width="1.2" height="1.2"/>
        <rect x="11" y="9" width="1.2" height="1.2"/>
        <rect x="13" y="9" width="1.2" height="1.2"/>
        <rect x="10.5" y="11" width="1.2" height="1.2"/>
        <rect x="7" y="10.5" width="1.2" height="1.2"/>
        <rect x="9" y="12.5" width="1.2" height="1.2"/>
        <rect x="7" y="14" width="1.2" height="1.2"/>
        <rect x="9" y="15.5" width="1.2" height="1.2"/>
      </g>
      {/* Format info strips - small marks near finders */}
      <g stroke="currentColor" strokeWidth="0.8" opacity="0.5">
        <line x1="3" y1="10.5" x2="3" y2="10.5"/> {/* near TL */}
        <line x1="10.5" y1="3" x2="10.5" y2="3"/> {/* near TL top */}
      </g>
      {/* My Class distinguishing mark - small book/class icon in center-right */}
      <path d="M17 8h4v8h-4z M17 8v8" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    </svg>,
    qrMap: <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Quiet zone background */}
      <rect x="2" y="2" width="20" height="20" rx="2" fill="currentColor" fillOpacity="0.1"/>
      {/* Finder pattern TL */}
      <rect x="3" y="3" width="7" height="7" fill="currentColor"/>
      <rect x="4" y="4" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1"/>
      <rect x="5.5" y="5.5" width="2" height="2" fill="currentColor"/>
      {/* Finder pattern TR */}
      <rect x="14" y="3" width="7" height="7" fill="currentColor"/>
      <rect x="15" y="4" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1"/>
      <rect x="16.5" y="5.5" width="2" height="2" fill="currentColor"/>
      {/* Finder pattern BL */}
      <rect x="3" y="14" width="7" height="7" fill="currentColor"/>
      <rect x="4" y="15" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1"/>
      <rect x="5.5" y="16.5" width="2" height="2" fill="currentColor"/>
      {/* Timing patterns */}
      <g stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1.5">
        <line x1="10.5" y1="5" x2="13.5" y2="5"/>
        <line x1="5" y1="10.5" x2="5" y2="13.5"/>
      </g>
      {/* Alignment pattern */}
      <rect x="15" y="15" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1"/>
      <rect x="16" y="16" width="3" height="3" fill="none" stroke="currentColor" strokeWidth="0.8"/>
      <circle cx="17.5" cy="17.5" r="0.8" fill="currentColor"/>
      {/* Data modules */}
      <g fill="currentColor" opacity="0.6">
        <rect x="10.5" y="7" width="1.2" height="1.2"/>
        <rect x="12.5" y="7" width="1.2" height="1.2"/>
        <rect x="11" y="9" width="1.2" height="1.2"/>
        <rect x="13" y="9" width="1.2" height="1.2"/>
        <rect x="10.5" y="11" width="1.2" height="1.2"/>
        <rect x="7" y="10.5" width="1.2" height="1.2"/>
        <rect x="9" y="12.5" width="1.2" height="1.2"/>
        <rect x="7" y="14" width="1.2" height="1.2"/>
        <rect x="9" y="15.5" width="1.2" height="1.2"/>
      </g>
      {/* Map distinguishing mark - compass needle in center */}
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M12 8v4l1.5 1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M12 12l-1 -1" stroke="currentColor" strokeWidth="1" fill="none"/>
    </svg>,
    qrScanner: <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Quiet zone background */}
      <rect x="2" y="2" width="20" height="20" rx="2" fill="currentColor" fillOpacity="0.1"/>
      {/* Finder pattern TL */}
      <rect x="3" y="3" width="7" height="7" fill="currentColor"/>
      <rect x="4" y="4" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1"/>
      <rect x="5.5" y="5.5" width="2" height="2" fill="currentColor"/>
      {/* Finder pattern TR */}
      <rect x="14" y="3" width="7" height="7" fill="currentColor"/>
      <rect x="15" y="4" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1"/>
      <rect x="16.5" y="5.5" width="2" height="2" fill="currentColor"/>
      {/* Finder pattern BL */}
      <rect x="3" y="14" width="7" height="7" fill="currentColor"/>
      <rect x="4" y="15" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1"/>
      <rect x="5.5" y="16.5" width="2" height="2" fill="currentColor"/>
      {/* Timing patterns */}
      <g stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1.5">
        <line x1="10.5" y1="5" x2="13.5" y2="5"/>
        <line x1="5" y1="10.5" x2="5" y2="13.5"/>
      </g>
      {/* Alignment pattern */}
      <rect x="15" y="15" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1"/>
      <rect x="16" y="16" width="3" height="3" fill="none" stroke="currentColor" strokeWidth="0.8"/>
      <circle cx="17.5" cy="17.5" r="0.8" fill="currentColor"/>
      {/* Data modules */}
      <g fill="currentColor" opacity="0.6">
        <rect x="10.5" y="7" width="1.2" height="1.2"/>
        <rect x="12.5" y="7" width="1.2" height="1.2"/>
        <rect x="11" y="9" width="1.2" height="1.2"/>
        <rect x="13" y="9" width="1.2" height="1.2"/>
        <rect x="10.5" y="11" width="1.2" height="1.2"/>
        <rect x="7" y="10.5" width="1.2" height="1.2"/>
        <rect x="9" y="12.5" width="1.2" height="1.2"/>
        <rect x="7" y="14" width="1.2" height="1.2"/>
        <rect x="9" y="15.5" width="1.2" height="1.2"/>
      </g>
      {/* Scanner distinguishing mark - viewfinder corners overlay */}
      <g stroke="currentColor" strokeWidth="2" fill="none">
        <path d="M5 5h4M5 5v4"/> {/* TL viewfinder */}
        <path d="M19 5h-4M19 5v4"/> {/* TR viewfinder */}
        <path d="M5 19h4M5 19v-4"/> {/* BL viewfinder */}
      </g>
      {/* Center scan line */}
      <line x1="12" y1="7" x2="12" y2="17" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.7"/>
    </svg>,
  };
  return icons[name] || null;
};

export default function AppLayout({ children, title, subtitle, hideBottomNav = false }) {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [viewAs, setViewAs] = useState(profile?.role || "student");
  const [unread, setUnread] = useState(0);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const role = profile?.role || "student";
  const allowedRoles = role === "admin" ? ["student", "faculty", "admin"] : role === "faculty" ? ["student", "faculty"] : ["student"];
  const displayName = profile?.name || "User";

  useEffect(() => { setViewAs(role); }, [role]);
  useEffect(() => {
    let cancelled = false;
    getUnreadCount().then((c) => { if (!cancelled) setUnread(c || 0); }).catch(() => {});
    return () => { cancelled = true; };
  }, [location.pathname]);
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  const menu = [
    { label: "Home", path: "/home", icon: "home" },
    { label: "Campus Map", path: "/map", icon: "map" },
    { label: "Find Classroom", path: "/find-classroom", icon: "pin" },
    { label: "My Timetable", path: role === "faculty" ? "/faculty/timetable" : "/student/timetable", icon: "calendar" },
    { label: "Faculty Directory", path: "/profile", icon: "users" },
    { label: "Labs & Departments", path: "/map", icon: "lab" },
    { label: "Room Shift Alerts", path: "/notifications", icon: "alert" },
    { label: "AI Guide", path: "/chat", icon: "spark" },
  ];

  const bottomTabs = [
    { label: "My Class", path: role === "faculty" ? "/faculty/timetable" : "/student/timetable", icon: "qrMyClass" },
    { label: "Explore Map", path: "/map", icon: "qrMap" },
    { label: "QR Scanner", action: "qr-scanner", icon: "qrScanner" },
  ];

  const isActive = (p) => location.pathname === p;

  const handleBottomTab = (tab) => {
    if (tab.action === "qr-scanner") {
      setShowQRScanner(true);
      return;
    }
    if (tab.path) navigate(tab.path);
  };

  return (
    <div className="cg-shell">
      {drawerOpen && <div className="cg-drawer-backdrop" onClick={() => setDrawerOpen(false)} />}

      <aside className={`cg-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="cg-drawer-top">
          <button className="cg-icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Collapse"><Icon name="collapse" /></button>
        </div>

        <div className="cg-viewas-card">
          <div className="cg-viewas-label">You&apos;re viewing as</div>
          <div className="cg-select-wrap">
            <select value={viewAs} onChange={(e) => setViewAs(e.target.value)} className="cg-select">
              {allowedRoles.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
            <span className="cg-select-caret"><Icon name="chevronDown" size={16} /></span>
          </div>
        </div>

        {(role === "admin") && (
          <button className="cg-update-room-btn" onClick={() => navigate("/admin/classrooms")}>
            <span className="cg-plus"><Icon name="plus" size={18} /></span> Update Room
          </button>
        )}

        <nav className="cg-drawer-nav">
          {menu.map((item) => (
            <Link key={item.label} to={item.path} className={`cg-drawer-item ${isActive(item.path) ? "active" : ""}`}>
              <span className="cg-drawer-icon"><Icon name={item.icon} /></span>
              <span>{item.label}</span>
            </Link>
          ))}
          <button className={`cg-drawer-item cg-drawer-collapse ${activityOpen ? "open" : ""}`} onClick={() => setActivityOpen((v) => !v)}>
            <span className="cg-drawer-icon"><Icon name="folder" /></span>
            <span>My Activity</span>
            <span className="cg-chevron"><Icon name="chevronDown" size={16} /></span>
          </button>
          {activityOpen && (
            <div className="cg-drawer-sub">
              <Link to="/saved" className="cg-drawer-subitem"><Icon name="bookmark" size={16} /> Saved Rooms</Link>
              <Link to="/explore" className="cg-drawer-subitem"><Icon name="clock" size={16} /> Recent Searches</Link>
            </div>
          )}
        </nav>

        <div className="cg-drawer-bottom">
          <InstallPwaPrompt />
          {role === "admin" && (
            <Link to="/admin" className="cg-admin-banner">
              <span>Admin Panel</span>
              <span className="cg-admin-arrow"><Icon name="arrow" size={18} /></span>
            </Link>
          )}
          <button className="cg-logout-link" onClick={logout}>Log out</button>
        </div>
      </aside>

      <div className="cg-main">
        <header className="cg-topbar">
          <button className="cg-icon-btn" onClick={() => setDrawerOpen(true)} aria-label="Menu"><Icon name="menu" /></button>
          <Link to="/home" className="cg-brand">
            <span className="cg-brand-pin"><Icon name="pin" size={18} /></span>
            <span className="cg-brand-text">CampusGuide <span className="cg-brand-ai">AI</span></span>
          </Link>
          <div className="cg-top-actions">
            <Link to="/explore" className="cg-icon-btn" aria-label="Search"><Icon name="search" /></Link>
            <Link to="/notifications" className="cg-icon-btn cg-badge-wrap" aria-label="Notifications">
              <Icon name="bell" />
              {unread > 0 && <span className="cg-badge">{unread > 9 ? "9+" : unread}</span>}
            </Link>
            <Link to="/chat" className="cg-icon-btn" aria-label="AI Guide"><Icon name="chat" /></Link>
            <Link to="/profile" className="cg-avatar" aria-label="Profile">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : displayName.charAt(0).toUpperCase()}
            </Link>
          </div>
        </header>

        <main className={`cg-content ${hideBottomNav ? "" : "has-bottom-nav"}`}>
          {(title || subtitle) && (
            <div className="cg-page-head">
              {title && <h1>{title}</h1>}
              {subtitle && <p>{subtitle}</p>}
            </div>
          )}
          {children}
        </main>

        {!hideBottomNav && (
          <nav className="cg-bottom-nav">
            {bottomTabs.map((t) => (
              <button
                key={t.label}
                className={`cg-bottom-item ${t.path && isActive(t.path) ? "active" : ""}`}
                onClick={() => handleBottomTab(t)}
              >
                <span className="cg-bottom-icon"><Icon name={t.icon} size={24} /></span>
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
        )}

        {showQRScanner && (
          <QRScannerPage onClose={() => setShowQRScanner(false)} onScanned={(locationId) => {
            setShowQRScanner(false);
            if (locationId) {
              navigate(`/find-classroom?dest=${locationId}`);
            }
          }} />
        )}
      </div>
    </div>
  );
}
