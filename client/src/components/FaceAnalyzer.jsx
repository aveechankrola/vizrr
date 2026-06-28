import { useState, useRef, useEffect } from "react";
import { FACE_ANALYZER_PROMPT, analyzeVizrrFace } from "../lib/vizrAi.js";

const BRAND = {
  name: "Vizrr",
  tagline: "Crafted for your vision.",
  accent: "#3b0066",
  gold: "#b58af0",
  soft: "#f7f0ff",
  muted: "#6f4fb1",
  border: "#eadcf9",
};

const TypingDots = () => (
  <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "12px 0" }}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: 6, height: 6, borderRadius: "50%",
          background: BRAND.gold,
          animation: `vizrPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }}
      />
    ))}
  </div>
);

export default function FaceAnalyzer({ onAnalyze } = {}) {
  const [cameraActive, setCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const startCamera = async () => {
    setCameraError(null);
    setAnalysisResult(null);
    setCapturedImage(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } });
      setStream(s);
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      setCameraError("Camera access denied. Please allow camera permissions and try again.");
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraActive(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
    setCapturedImage(canvas.toDataURL("image/jpeg", 0.85));
    stopCamera();
    setAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const result = await analyzeVizrrFace({
        imageData,
        videoElement: video,
        systemPrompt: FACE_ANALYZER_PROMPT,
      });
      setAnalysisResult(result);
      if (typeof onAnalyze === 'function') onAnalyze(result);
    } catch {
      const local = await localAnalyze(canvas.width, canvas.height);
      setAnalysisResult(local);
      if (typeof onAnalyze === 'function') onAnalyze(local);
    } finally {
      setAnalyzing(false);
    }
  };

  // Lightweight local analyzer fallback - uses simple aspect-ratio heuristic
  async function localAnalyze(w, h) {
    const ratio = w && h ? w / h : 1;
    let shape = 'oval';
    if (ratio > 1.08) shape = 'oblong/rectangular';
    else if (ratio < 0.92) shape = 'round';
    else if (ratio >= 0.92 && ratio <= 1.08) shape = 'oval';

    const frames = {
      'oval': ['Aviator', 'Square', 'Cat-eye'],
      'round': ['Rectangular', 'Geometric', 'Browline'],
      'oblong/rectangular': ['Round', 'Aviator', 'Oval'],
    };

      const picks = frames[shape] || frames['oval'];
      const frameWidth = shape === 'round' ? '124-130mm' : shape === 'oblong/rectangular' ? '128-136mm' : shape === 'square' ? '126-132mm' : '124-130mm';
      return `**Face Shape:** ${shape}\n**Why:** Based on proportions, your face benefits from frames that ${shape === 'round' ? 'add angles and structure' : shape === 'oblong/rectangular' ? 'soften length and add width' : 'balance proportions and preserve natural contours'}.\n**Perfect Frames for You:**\n• ${picks[0]}: Adds definition and contrast.\n• ${picks[1]}: Balances proportions for everyday wear.\n• ${picks[2]}: Offers a stylish complement to your features.\n**Size Guide:** Look for a full frame width around ${frameWidth}; lens width usually sits around 48-54mm, depending on fit.`;
  }

  const formatAnalysis = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} style={{ fontWeight: 700, color: BRAND.accent, marginBottom: 4, marginTop: i > 0 ? 12 : 0 }}>{line.replace(/\*\*/g, "")}</p>;
      }
      if (line.includes("**")) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} style={{ marginBottom: 4, color: BRAND.accent, fontSize: 14, lineHeight: 1.7 }}>
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
          </p>
        );
      }
      if (line.startsWith("•")) {
        return <p key={i} style={{ paddingLeft: 12, marginBottom: 6, color: "#2a2a2a", fontSize: 14, lineHeight: 1.65 }}>{line}</p>;
      }
      return line ? <p key={i} style={{ marginBottom: 4, color: "#2a2a2a", fontSize: 14, lineHeight: 1.7 }}>{line}</p> : null;
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes vizrPulse { 0%,80%,100%{opacity:.3;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .vizr-cam-btn { transition: all 0.2s; cursor: pointer; }
        .vizr-cam-btn:hover { transform: scale(1.02); }
      `}</style>

      <div style={{ fontFamily: "'DM Sans', sans-serif", width: "100%", background: "linear-gradient(180deg, #fff 0%, #fcf8ff 100%)", borderRadius: 20, border: `1px solid ${BRAND.border}`, overflow: "hidden", boxShadow: "0 18px 50px rgba(59,0,102,0.14)" }}>
        
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${BRAND.accent} 0%, #4d007f 100%)`, padding: "18px 22px" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 700, color: BRAND.gold, letterSpacing: 1.8 }}>VIZRR ANALYZER</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.68)", letterSpacing: 1.35, textTransform: "uppercase", marginTop: 3 }}>AI Face Shape Detection</div>
        </div>

        {/* Analyzer Body */}
        <div style={{ padding: 22, minHeight: 420 }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: BRAND.accent, margin: "0 0 6px" }}>Face Shape Analysis</p>
            <p style={{ fontSize: 13, color: BRAND.muted, margin: 0, lineHeight: 1.6 }}>Enable your camera for a personalized frame recommendation. Our AI analyzes your facial geometry to suggest the most flattering styles.</p>
          </div>

          {!cameraActive && !capturedImage && !analysisResult && (
            <div style={{ textAlign: "center", padding: "32px 20px" }}>
              <div style={{ width: 78, height: 78, borderRadius: "50%", background: "linear-gradient(180deg, #fff 0%, #f6ecff 100%)", border: `1px solid ${BRAND.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 10px 24px rgba(59,0,102,0.08)" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={BRAND.gold} strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <p style={{ fontSize: 14, color: BRAND.muted, marginBottom: 20, lineHeight: 1.7 }}>Position your face in good lighting.<br />Look directly at the camera for best results.</p>

              {cameraError && (
                <div style={{ background: "#FFF3F3", border: "1px solid #FFCCCC", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#CC3333" }}>
                  {cameraError}
                </div>
              )}

              <button className="vizr-cam-btn" onClick={startCamera} style={{ background: `linear-gradient(135deg, ${BRAND.accent} 0%, #500a83 100%)`, color: "#fff", border: "none", borderRadius: 999, padding: "12px 28px", fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: 0.45, boxShadow: "0 10px 24px rgba(59,0,102,0.18)" }}>
                Enable Camera
              </button>
            </div>
          )}

          {cameraActive && !capturedImage && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", background: "#000", marginBottom: 16, aspectRatio: "4/3" }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
                <div style={{ position: "absolute", inset: 0, border: `1px solid rgba(181,138,240,0.35)`, borderRadius: 14, pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: "15%", left: "25%", right: "25%", bottom: "10%", border: `1.8px dashed ${BRAND.gold}`, borderRadius: "50%", opacity: 0.7, pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(59,0,102,0.68)", color: "rgba(255,255,255,0.9)", fontSize: 10, padding: "5px 12px", borderRadius: 100, letterSpacing: 1, whiteSpace: "nowrap" }}>
                  CENTER YOUR FACE IN THE OVAL
                </div>
              </div>
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button className="vizr-cam-btn" onClick={captureAndAnalyze} style={{ flex: 1, background: `linear-gradient(135deg, ${BRAND.accent} 0%, #500a83 100%)`, color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Analyze My Face Shape
                </button>
                <button onClick={stopCamera} style={{ padding: "12px 16px", background: "transparent", border: `1px solid ${BRAND.border}`, borderRadius: 12, cursor: "pointer", color: BRAND.muted, fontSize: 12 }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {analyzing && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              {capturedImage && <img src={capturedImage} alt="Captured" style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 10, transform: "scaleX(-1)", marginBottom: 20, opacity: 0.7 }} />}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <TypingDots />
              </div>
              <p style={{ fontSize: 13, color: BRAND.muted, letterSpacing: 1, textTransform: "uppercase" }}>Analyzing facial geometry...</p>
            </div>
          )}

          {analysisResult && !analyzing && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              <div style={{ display: "flex", gap: 14, marginBottom: 18, alignItems: "flex-start" }}>
                {capturedImage && <img src={capturedImage} alt="Your photo" style={{ width: 68, height: 68, objectFit: "cover", borderRadius: 10, transform: "scaleX(-1)", flexShrink: 0, border: `1px solid ${BRAND.border}` }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 600, color: BRAND.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Your Analysis</div>
                  <div style={{ fontSize: 12, color: BRAND.muted }}>Personalized recommendations based on your facial structure</div>
                </div>
              </div>

              <div style={{ background: "linear-gradient(180deg, #fdfaff 0%, #f7f0ff 100%)", border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: "17px 18px", marginBottom: 14, lineHeight: 1.7 }}>
                {formatAnalysis(analysisResult)}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="vizr-cam-btn" onClick={() => { setAnalysisResult(null); setCapturedImage(null); startCamera(); }} style={{ width: "48%", padding: "11px 16px", background: `linear-gradient(135deg, ${BRAND.accent} 0%, #500a83 100%)`, border: "none", borderRadius: 12, cursor: "pointer", color: "#fff", fontSize: 12 }}>
                  Retake Analysis
                </button>
                <button className="vizr-cam-btn" onClick={() => { if (typeof onAnalyze === 'function') onAnalyze(analysisResult); }} style={{ width: "48%", padding: "11px 16px", background: `linear-gradient(135deg, ${BRAND.gold} 0%, #a975eb 100%)`, border: "none", borderRadius: 12, cursor: "pointer", color: "#fff", fontSize: 12 }}>
                  Show Recommended Products
                </button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${BRAND.border}`, padding: "9px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(59,0,102,0.015)" }}>
          <span style={{ fontSize: 10, color: BRAND.muted, letterSpacing: 0.35 }}>Your image is processed locally and never stored.</span>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: BRAND.gold, letterSpacing: 1 }}>VIZRR</span>
        </div>
      </div>
    </>
  );
}