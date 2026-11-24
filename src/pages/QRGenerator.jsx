import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { getClassrooms } from "../services/classroomService";
import { generateQRForLocation, openPrintSheet } from "../utils/qrGenerator";

export default function QRGenerator() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [qrPreview, setQrPreview] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    setLoading(true);
    try {
      const data = await getClassrooms();
      setRooms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3500);
  }

  async function handleGenerate() {
    if (!selectedRoom) {
      showToast("Select a room first", "error");
      return;
    }
    setGenerating(true);
    try {
      const qr = await generateQRForLocation(selectedRoom, `Room ${selectedRoom}`, { sizeKey: "door_sticker" });
      if (qr?.dataUrl) {
        setQrPreview(qr);
      } else {
        showToast("Could not generate QR code", "error");
      }
    } catch (err) {
      showToast("QR generation failed", "error");
    } finally {
      setGenerating(false);
    }
  }

  async function handlePrintAll() {
    setPrinting(true);
    try {
      const codes = [];
      for (const room of rooms) {
        const qr = await generateQRForLocation(`r_${room.room_number}`, `Room ${room.room_number}`, { sizeKey: "door_sticker" });
        if (qr?.dataUrl) codes.push(qr);
      }
      if (codes.length === 0) {
        showToast("No rooms to generate codes for", "error");
        return;
      }
      const opened = openPrintSheet(codes, { sizeKey: "door_sticker", title: "CampusGuide — All Room QR Codes" });
      if (!opened) {
        showToast("Pop-up blocked. Allow pop-ups to print.", "error");
      } else {
        showToast(`Print sheet opened with ${codes.length} codes.`);
      }
    } catch (err) {
      showToast("Failed to build print sheet", "error");
    } finally {
      setPrinting(false);
    }
  }

  function downloadQR() {
    if (!qrPreview?.dataUrl) return;
    const a = document.createElement("a");
    a.href = qrPreview.dataUrl;
    a.download = `QR-Room-${qrPreview.locationId.replace("r_", "")}.png`;
    a.click();
    showToast("QR code downloaded!");
  }

  return (
    <AdminLayout title="QR Code Generator" subtitle="Generate and print QR codes for every room">
      {toast.message && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === "success" ? "✓ " : "✕ "}
          {toast.message}
        </div>
      )}

      <div className="qr-gen-page">
        {/* Single Room Generator */}
        <div className="qr-gen-card">
          <h3 className="qr-gen-title">Generate QR for a Room</h3>
          <p className="qr-gen-desc">Select a room to generate its scannable QR code. Students scan it to get directions.</p>

          <div className="qr-gen-form">
            <select
              className="qr-gen-select"
              value={selectedRoom}
              onChange={(e) => { setSelectedRoom(e.target.value); setQrPreview(null); }}
              disabled={loading}
            >
              <option value="">— Select a room —</option>
              {rooms.map((room) => (
                <option key={room.id} value={`r_${room.room_number}`}>
                  Room {room.room_number} — Floor {room.floor} ({room.type})
                </option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={handleGenerate} disabled={generating || !selectedRoom}>
              {generating ? "Generating..." : "Generate QR"}
            </button>
          </div>

          {qrPreview && (
            <div className="qr-gen-preview">
              <img src={qrPreview.dataUrl} alt="QR Code" className="qr-gen-img" />
              <div className="qr-gen-preview-info">
                <strong>Room {qrPreview.locationId.replace("r_", "")}</strong>
                <span className="qr-gen-url">{qrPreview.url}</span>
              </div>
              <div className="qr-gen-preview-actions">
                <button className="btn btn-primary btn-sm" onClick={downloadQR}>Download PNG</button>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Print */}
        <div className="qr-gen-card">
          <h3 className="qr-gen-title">Print All Room QR Codes</h3>
          <p className="qr-gen-desc">Generate and print QR codes for all {rooms.length} rooms at once. Opens a print-ready sheet.</p>
          <button className="btn btn-primary" onClick={handlePrintAll} disabled={printing || loading}>
            {printing ? "Preparing..." : `Print All ${rooms.length} QR Codes`}
          </button>
        </div>

        {/* Room List with QR status */}
        <div className="qr-gen-card">
          <h3 className="qr-gen-title">All Rooms</h3>
          {loading ? (
            <div className="loading-state"><div className="spinner" /><p>Loading rooms...</p></div>
          ) : (
            <div className="qr-gen-room-list">
              {rooms.map((room) => (
                <div key={room.id} className="qr-gen-room-item">
                  <div className="qr-gen-room-info">
                    <span className="room-pill">Room {room.room_number}</span>
                    <span className="floor-badge">Floor {room.floor}</span>
                    <span className={`type-badge type-${room.type.toLowerCase().replace(/\s+/g, "-")}`}>{room.type}</span>
                  </div>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={async () => {
                      setSelectedRoom(`r_${room.room_number}`);
                      setGenerating(true);
                      try {
                        const qr = await generateQRForLocation(`r_${room.room_number}`, `Room ${room.room_number}`, { sizeKey: "door_sticker" });
                        if (qr?.dataUrl) setQrPreview(qr);
                      } finally {
                        setGenerating(false);
                      }
                    }}
                  >
                    Generate
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}