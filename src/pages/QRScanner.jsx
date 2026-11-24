import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCampusMapGraph } from "../services/navigationGraph";

export default function QRScannerPage({ onClose, onScanned }) {
  const [graph, setGraph] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getCampusMapGraph()
      .then((g) => { if (!cancelled) setGraph(g); })
      .catch(() => { if (!cancelled) setCameraError("Could not load campus map for QR validation."); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    startScanner();
    return () => stopScanner();
  }, []);

  async function startScanner() {
    setCameraError("");
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Camera permission denied. You can upload a QR code image instead.");
      setScanning(false);
    }
  }

  function stopScanner() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      const result = await reader.decodeFromFile(file);
      handleQRResult(result.getText());
    } catch (err) {
      console.error("QR decode error:", err);
      alert("Could not read QR code. Try again.");
    }
  }

  function handleQRResult(text) {
    if (!graph) return;
    try {
      let locationId = text.trim();
      if (text.includes("http")) {
        const url = new URL(text);
        locationId = url.searchParams.get("from") || url.searchParams.get("dest") || url.searchParams.get("loc");
      }
      if (locationId && graph.nodes.has(locationId)) {
        onScanned(locationId);
      } else {
        alert(`Unknown location: ${text}. Please use a valid campus QR code.`);
      }
    } catch (err) {
      alert("Invalid QR code format.");
    }
  }

  return (
    <div className="cg-qr-overlay" onClick={onClose}>
      <div className="cg-qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cg-qr-header">
          <h3>Scan QR Code</h3>
          <button className="cg-qr-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="cg-qr-body">
          {cameraError ? (
            <div className="cg-qr-error">
              <p>{cameraError}</p>
              <label className="cg-btn cg-btn-primary">
                Upload QR Image
                <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} hidden />
              </label>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="cg-qr-video" playsInline muted />
              <div className="cg-qr-frame"></div>
              <p className="cg-qr-hint">Point camera at a location QR code</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
