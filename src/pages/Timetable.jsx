import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import {
  DAY_SHORT,
  MISSING_CLASS_INFO,
  TIMETABLE_DAYS,
  loadStudentTimetable,
  periodStatus,
  subscribeToTimetable,
  toHHMM,
  todayName,
} from "../services/timetableService";

const TABS = [
  { id: "week", label: "Complete" },
  { id: "day", label: "Today / Day" },
];

function groupByDay(rows) {
  return rows.reduce((acc, row) => {
    (acc[row.day] ||= []).push(row);
    return acc;
  }, {});
}

function NowPanel({ row, tone, title, emptyText }) {
  return (
    <div className={`cg-now-card ${tone}`}>
      <div className="cg-now-head">
        <span className="cg-now-dot" />
        <span className="cg-now-title">{title}</span>
      </div>
      {row ? (
        <>
          <div className="cg-now-subject">{row.subject}</div>
          <div className="cg-now-meta">{row.faculty} · {row.room}</div>
          <div className="cg-now-time">{toHHMM(row.start_time)} – {toHHMM(row.end_time)}{row.period_number ? ` · P${row.period_number}` : ""}</div>
        </>
      ) : (
        <div className="cg-now-empty">{emptyText}</div>
      )}
    </div>
  );
}

export default function Timetable() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("week");
  const [selectedDay, setSelectedDay] = useState(todayName());
  const [now, setNow] = useState(() => new Date());
  const [state, setState] = useState({ loading: true, rows: [], classKey: null, status: "ready" });

  const load = useCallback(async () => {
    const result = await loadStudentTimetable(profile);
    setState({ loading: false, rows: result.rows, classKey: result.classKey, status: result.status });
  }, [profile]);

  useEffect(() => { setState((s) => ({ ...s, loading: true })); load(); }, [load]);
  useEffect(() => {
    const unsubscribe = subscribeToTimetable(load);
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { unsubscribe(); document.removeEventListener("visibilitychange", onVisible); };
  }, [load]);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  const byDay = useMemo(() => groupByDay(state.rows), [state.rows]);
  const today = todayName();
  const { rows, classKey, status, loading } = state;

  const renderDay = (day) => {
    const dayRows = byDay[day] || [];
    const isToday = day === today;
    return (
      <section key={day} className={`cg-tt-day ${isToday ? "is-today" : ""}`}>
        <div className="cg-tt-day-head">
          <div className="cg-tt-day-title">
            <h3>{day}</h3>
            {isToday && <span className="cg-chip">Today</span>}
          </div>
          <span className="cg-tt-count">{dayRows.length} {dayRows.length === 1 ? "period" : "periods"}</span>
        </div>
        {dayRows.length === 0 ? (
          <div className="cg-tt-empty">No classes scheduled.</div>
        ) : (
          <div className="cg-tt-cards">
            {dayRows.map((row) => {
              const st = isToday ? periodStatus(row, now) : "";
              return (
                <div key={row.id} className={`cg-tt-card ${st ? `st-${st}` : ""}`}>
                  <div className="cg-tt-card-top">
                    <span className="cg-period">P{row.period_number}</span>
                    <span className="cg-time">{toHHMM(row.start_time)} – {toHHMM(row.end_time)}</span>
                    {isToday && <span className={`cg-status ${st}`}>{st}</span>}
                  </div>
                  <div className="cg-tt-subject">{row.subject}</div>
                  <div className="cg-tt-meta">{[row.subject_code, row.faculty].filter(Boolean).join(" · ") || "—"}</div>
                  <div className="cg-tt-bottom">
                    <span className="cg-room">Room {row.room}</span>
                    <Link to={`/find-classroom?dest=r_${row.room}`} className="cg-nav-link">Navigate</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  const dayRows = byDay[selectedDay] || [];
  const todayRows = byDay[today] || [];
  const todayWithStatus = todayRows.map((row) => ({ row, status: periodStatus(row, now) }));
  const current = todayWithStatus.find((p) => p.status === "current")?.row;
  const upcoming = todayWithStatus.find((p) => p.status === "upcoming")?.row;

  return (
    <AppLayout
      title="My Timetable"
      subtitle={classKey ? `${classKey.branch} · Year ${classKey.year} · Sec ${classKey.section} · Sem ${classKey.semester}` : "Your class schedule"}
    >
      <div className="cg-timetable">
        <div className="cg-seg-tabs">
          {TABS.map((t) => (
            <button key={t.id} className={activeTab === t.id ? "active" : ""} onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="cg-card cg-center"><div className="spinner" /><p className="cg-muted">Loading your timetable…</p></div>
        ) : status === "missing-class" ? (
          <div className="cg-card cg-center"><h3>Class information unavailable</h3><p className="cg-muted">{MISSING_CLASS_INFO}</p></div>
        ) : status === "empty" ? (
          <div className="cg-card cg-center"><h3>No timetable published yet</h3><p className="cg-muted">Your timetable for this class has not been published.</p></div>
        ) : activeTab === "week" ? (
          <div className="cg-tt-week">{TIMETABLE_DAYS.map(renderDay)}</div>
        ) : (
          <div className="cg-tt-dayview">
            <div className="cg-today-panel">
              <div className="cg-today-head">
                <h3>Today's Timetable</h3>
                <span>{now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short" })}</span>
              </div>
              {todayRows.length === 0 ? (
                <div className="cg-tt-empty">No classes today. Enjoy your day.</div>
              ) : (
                <>
                  <div className="cg-now-grid">
                    <NowPanel row={current} tone="current" title="Current period" emptyText="No class in progress." />
                    <NowPanel row={upcoming} tone="upcoming" title="Upcoming period" emptyText="All periods done for today." />
                  </div>
                  <div className="cg-progress-list">
                    {todayWithStatus.map(({ row, status: st }) => (
                      <div key={row.id} className={`cg-progress-row st-${st}`}>
                        <span className="cg-period">{row.period_number}</span>
                        <div className="cg-progress-main">
                          <strong>{row.subject}</strong>
                          <span>{row.faculty}</span>
                        </div>
                        <span className="cg-room-sm">{row.room}</span>
                        <span className={`cg-status ${st}`}>{st}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="cg-day-picker">
              {TIMETABLE_DAYS.map((day) => (
                <button key={day} className={selectedDay === day ? "active" : ""} onClick={() => setSelectedDay(day)}>
                  {DAY_SHORT[day]}{day === today ? " •" : ""}
                </button>
              ))}
            </div>
            {renderDay(selectedDay)}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
