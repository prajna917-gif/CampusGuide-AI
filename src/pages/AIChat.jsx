import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ChatPanel from "../components/ChatPanel";

export default function AIChat() {
  const navigate = useNavigate();
  return (
    <AppLayout hideBottomNav>
      <div className="cg-chat-page">
        <div className="cg-chat-top">
          <button className="cg-icon-btn" onClick={() => navigate(-1)} aria-label="Back">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1>AI Guide</h1>
          <button className="cg-icon-btn" aria-label="Info" title="Ask for directions, rooms, staff locations and more.">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </button>
        </div>
        <ChatPanel showEmptyHint />
      </div>
    </AppLayout>
  );
}
