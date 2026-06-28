import { useState, useRef, useEffect } from "react";
import { CHAT_SYSTEM_PROMPT, runVizrGodChat } from "../lib/vizrAi.js";

const BRAND = {
  name: "Vizrr",
  tagline: "Crafted for your vision.",
  accent: "#3b0066",
  gold: "#8e47d6",
  soft: "#f4e8ff",
  muted: "#7a5ea8",
  border: "#e9dff6",
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

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      gap: 10,
      marginBottom: 16,
      alignItems: "flex-start",
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: BRAND.accent, color: BRAND.gold,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, flexShrink: 0, letterSpacing: 0.5,
        }}>VG</div>
      )}
      <div style={{
        maxWidth: "78%",
        padding: "11px 15px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isUser ? BRAND.accent : BRAND.soft,
        color: isUser ? "#fff" : BRAND.accent,
        fontSize: 14,
        lineHeight: 1.65,
        whiteSpace: "pre-wrap",
        border: isUser ? "none" : `1px solid ${BRAND.border}`,
      }}>
        {msg.content}
      </div>
    </div>
  );
};

const FIT_QUESTIONS = [
  {
    key: "use",
    question: "What will you use the glasses for most?",
    options: [
      {
        label: "All-day wear",
        reply: "For all-day wear, comfort matters most. I would prioritize lightweight frames, balanced nose support, and a size that sits close without pressure points.",
      },
      {
        label: "Screen work",
        reply: "For screen work, a comfortable everyday frame with a stable fit is ideal. I would lean toward lightweight materials and a shape that feels easy to wear for long sessions.",
      },
      {
        label: "Driving",
        reply: "For driving, clarity and a secure fit are key. A frame that stays in place and gives you a wide, comfortable field of view is the safest pick.",
      },
    ],
  },
  {
    key: "prescription",
    question: "How strong is your prescription?",
    options: [
      {
        label: "Mild",
        reply: "A mild prescription gives you more flexibility with frame styles. You can focus more on comfort and the look you want.",
      },
      {
        label: "Strong",
        reply: "With a stronger prescription, fit and lens thickness matter more. I would look for frames that support a stable fit and suit your lens needs well.",
      },
      {
        label: "Don't know",
        reply: "No problem. If you do not know your prescription strength, I can still help you narrow down comfortable frame options and what to ask your optician.",
      },
    ],
  },
  {
    key: "faceShape",
    question: "What is your face shape?",
    options: [
      {
        label: "Round",
        reply: "Round faces usually pair well with angular frames like square or rectangular shapes because they add definition and balance.",
      },
      {
        label: "Square",
        reply: "Square faces often work nicely with softer or rounded frame lines that help balance strong angles.",
      },
      {
        label: "Oval",
        reply: "Oval faces are versatile, so you can explore a wide range of shapes. I would focus on the vibe and fit you want most.",
      },
      {
        label: "Heart-shaped",
        reply: "Heart-shaped faces often look great in styles that balance a narrower lower face, like aviator, round, or lightly softened frame shapes.",
      },
    ],
  },
  {
    key: "style",
    question: "What style vibe do you prefer?",
    options: [
      {
        label: "Classic",
        reply: "Classic style usually works best with timeless shapes, clean lines, and neutral tones that age well.",
      },
      {
        label: "Bold",
        reply: "Bold style gives you room to make a statement with thicker rims, sharper shapes, or standout colors.",
      },
      {
        label: "Minimalist",
        reply: "Minimalist style pairs well with slim frames, lightweight materials, and a clean, understated finish.",
      },
    ],
  },
  {
    key: "fit",
    question: "Do your glasses usually slip down or pinch your head?",
    options: [
      {
        label: "Slipping",
        reply: "If your glasses slip down, a better bridge fit, more grip at the temples, or a narrower frame width can make a big difference.",
      },
      {
        label: "Pinching",
        reply: "If your glasses pinch, you probably need a wider frame or a gentler temple fit so the pressure is reduced.",
      },
      {
        label: "No issues",
        reply: "If your current glasses already fit well, we can keep the fit profile close and focus more on style and lens needs.",
      },
    ],
  },
  {
    key: "budget",
    question: "What is your budget range?",
    options: [
      {
        label: "Budget-friendly",
        reply: "A budget-friendly range can still give you a great fit. I would prioritize comfort, durability, and a shape you can wear often.",
      },
      {
        label: "Mid-range",
        reply: "Mid-range usually gives you the best balance of finish, comfort, and long-term wearability.",
      },
      {
        label: "Premium",
        reply: "Premium choices often bring higher-end materials and refined details, so it is worth leaning into the fit and finish you want most.",
      },
    ],
  },
];

const getFitSummaryReply = (answers) => {
  const chosen = FIT_QUESTIONS.flatMap((question) => {
    const selected = answers[question.key];
    if (!selected) return [];
    return `${question.question} ${selected}`;
  });

  if (!chosen.length) {
    return "Share a few fit details and I will narrow down the best frame direction for you.";
  }

  return `Thanks. Here is the fit profile I have so far:\n\n${chosen.map((line) => `• ${line}`).join("\n")}\n\nBased on that, I can help you refine frame shape, comfort, and budget together.`;
};

export default function ChatBot({ open, onToggleOpen } = {}) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome to Vizrr. I'm VizrGod, your personal eyewear consultant.\n\nI can help you find frames that suit your face perfectly, answer questions about materials, lens types, or sizing. What can I help you with today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [fitAnswers, setFitAnswers] = useState({});

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(messages);
  const loadingRef = useRef(loading);
  const recognitionRef = useRef(null);
  const voiceTranscriptRef = useRef("");

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const quickPrompts = [
    {
      question: "What frames suit a round face?",
      answer: "That's a great question! For a round face, you'll look fantastic in frames that add angles and definition. I recommend square or rectangular frames. They'll contrast with your features beautifully and create a very balanced, stylish look. You've got this!"
    },
    {
      question: "Tell me about your materials",
      answer: "We believe in quality you can feel! Our frames are crafted from the best materials like premium acetate, ultra-lightweight titanium, and sustainable wood. Each one is chosen for its durability and comfort, so you can feel confident and amazing in your new glasses."
    },
    {
      question: "How do I measure my frame size?",
      answer: "Finding your perfect fit is easy! You can use a credit card to measure your face width. Hold the edge against the bridge of your nose and see where the other end lands. If it's at the end of your eye, you're a standard size. If it extends beyond, you're a wider fit. You'll find the perfect pair in no time!"
    },
    {
      question: "What's the difference between acetate and titanium?",
      answer: "Great question! Acetate is a plant-based plastic known for its rich colors and patterns, giving you a bold, expressive look. Titanium is an ultra-lightweight and strong metal, perfect for a minimalist, comfortable feel. Both are fantastic choices, it just depends on the style you're going for!"
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = window.navigator?.language || "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }

      const nextValue = transcript.trim();
      voiceTranscriptRef.current = nextValue;

      if (nextValue) {
        setInput(nextValue);
        setVoiceError("");
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setVoiceError(event.error === "not-allowed"
        ? "Microphone access was blocked. Allow it in your browser settings and try again."
        : "Voice input is unavailable right now. Try typing your message instead.");
      voiceTranscriptRef.current = "";
    };

    recognition.onend = () => {
      setIsListening(false);

      const transcript = voiceTranscriptRef.current.trim();
      voiceTranscriptRef.current = "";

      if (transcript && !loadingRef.current) {
        sendMessage(transcript);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const [minimized, setMinimized] = useState(!open);

  // When parent requests the chat to open, focus the input and scroll to bottom
  useEffect(() => {
    if (open) {
      setMinimized(false);
      setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } else {
      // keep minimized when parent closes
      setMinimized(true);
    }
  }, [open]);

  const sendMessage = async (prompt) => {
    const isQuickPrompt = typeof prompt === 'object' && prompt !== null;
    const text = isQuickPrompt ? prompt.question : (prompt || input.trim());

    if (!text || loadingRef.current) return;
    setInput("");
    
    const newMessages = [...messagesRef.current, { role: "user", content: text }];
    if (isQuickPrompt) {
      newMessages.push({ role: "assistant", content: prompt.answer });
      setMessages(newMessages);
      return;
    }
    
    setMessages(newMessages);
    setLoading(true);
    loadingRef.current = true;
    
    try {
      const reply = await runVizrGodChat(newMessages, { systemPrompt: CHAT_SYSTEM_PROMPT });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I’m having trouble connecting right now, but I can still help with frame style, sizing, materials, or product picks. Try again in a moment." }]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const toggleVoiceInput = () => {
    if (!voiceSupported || loading) return;

    const recognition = recognitionRef.current;
    if (!recognition) {
      setVoiceError("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
      return;
    }

    voiceTranscriptRef.current = "";
    setVoiceError("");
    setIsListening(true);
    recognition.start();
  };

  const handleFitAnswer = (question, option) => {
    if (loadingRef.current) return;

    setFitAnswers((prev) => {
      const nextAnswers = { ...prev, [question.key]: option.label };
      const userMessage = { role: "user", content: `${question.question}\n${option.label}` };
      const assistantMessage = { role: "assistant", content: option.reply };
      const summaryMessage = FIT_QUESTIONS.every((item) => nextAnswers[item.key])
        ? { role: "assistant", content: getFitSummaryReply(nextAnswers) }
        : null;

      const conversation = [
        ...messagesRef.current,
        userMessage,
        assistantMessage,
        ...(summaryMessage ? [summaryMessage] : []),
      ];

      messagesRef.current = conversation;
      setMessages(conversation);

      return nextAnswers;
    });
  };

  const currentFitQuestion = FIT_QUESTIONS.find((question) => !fitAnswers[question.key]);
  const fitCheckComplete = !currentFitQuestion && FIT_QUESTIONS.every((question) => Boolean(fitAnswers[question.key]));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes vizrPulse { 0%,80%,100%{opacity:.3;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }
        .vizr-quick { transition: all 0.18s; cursor: pointer; }
        .vizr-quick:hover { background: ${BRAND.accent}; color: #fff; border-color: ${BRAND.accent}; }
        .vizr-send:hover { background: ${BRAND.gold}; }
        .vizr-send:disabled { opacity: 0.4; cursor: not-allowed; }
        .vizr-voice:hover { background: ${BRAND.soft}; border-color: ${BRAND.gold}; }
        .vizr-voice--active { background: ${BRAND.accent}; color: #fff; border-color: ${BRAND.accent}; }
        .vizr-voice--active:hover { background: ${BRAND.accent}; border-color: ${BRAND.accent}; }
        .vizr-voice:disabled { opacity: 0.45; cursor: not-allowed; }
      `}</style>

      <div style={{ fontFamily: "'DM Sans', sans-serif", width: "100%", maxWidth: 560, margin: "0 auto", background: "linear-gradient(180deg, #ffffff 0%, #fcf8ff 100%)", borderRadius: 18, border: `1px solid ${BRAND.border}`, overflow: "hidden", boxShadow: "0 18px 50px rgba(59,0,102,0.18)" }}>

        {/* Minimized bar — non-interactive (use the page's Open Live Chat button to open) */}
        {minimized ? (
          <div style={{ padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: BRAND.accent, color: BRAND.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>VG</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.accent, letterSpacing: 0.4 }}>VIZRGOD</div>
              <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: 0.3 }}>AI Style Consultant</div>
            </div>
          </div>
        ) : null}
        
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${BRAND.accent} 0%, #4d007f 100%)`, padding: "16px 18px", display: minimized ? 'none' : 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: BRAND.gold, letterSpacing: 1.6 }}>VIZRGOD</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.62)", letterSpacing: 1.35, textTransform: "uppercase", marginTop: 2 }}>AI Style Consultant</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => { setMinimized(true); onToggleOpen?.(false); }} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', padding: '7px 9px', borderRadius: 999, cursor: 'pointer', fontSize: 12 }}>Minimize</button>
            </div>
          </div>
        </div>

        {/* Chat Body */}
        <div style={{ display: "flex", flexDirection: "column", height: 420 }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 6px", scrollbarWidth: "thin" }}>
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
            {loading && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: BRAND.accent, color: BRAND.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>VG</div>
                <div style={{ background: BRAND.soft, border: `1px solid ${BRAND.border}`, borderRadius: "14px 14px 14px 4px", padding: "3px 12px" }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && currentFitQuestion && (
            <div style={{ padding: "0 14px 10px" }}>
              <div style={{ border: `1px solid ${BRAND.border}`, background: "#fff", borderRadius: 16, padding: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.accent, letterSpacing: 0.4 }}>Quick Fit Check</div>
                    <div style={{ fontSize: 11, color: BRAND.muted, marginTop: 2 }}>
                      Question {FIT_QUESTIONS.findIndex((question) => question.key === currentFitQuestion.key) + 1} of {FIT_QUESTIONS.length}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: BRAND.muted }}>
                    {fitCheckComplete ? "Complete" : "In progress"}
                  </div>
                </div>

                <div style={{ fontSize: 12.5, fontWeight: 600, color: BRAND.accent, marginBottom: 8, lineHeight: 1.35 }}>
                  {currentFitQuestion.question}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {currentFitQuestion.options.map((option) => {
                    const selected = fitAnswers[currentFitQuestion.key] === option.label;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        className={`vizr-quick${selected ? " vizr-quick--selected" : ""}`}
                        onClick={() => handleFitAnswer(currentFitQuestion, option)}
                        style={{ fontSize: 12, padding: "7px 12px", borderRadius: 999, border: `1px solid ${selected ? BRAND.accent : BRAND.border}`, color: selected ? "#fff" : BRAND.muted, cursor: "pointer", background: selected ? BRAND.accent : "#fff", letterSpacing: 0.2 }}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>

                <div style={{ marginTop: 10, fontSize: 11, color: BRAND.muted, lineHeight: 1.5 }}>
                  Answer this one first, then I’ll ask the next fit question.
                </div>
              </div>
            </div>
          )}

          <div style={{ padding: "10px 12px 12px", borderTop: `1px solid ${BRAND.border}`, background: "rgba(59,0,102,0.02)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask about frames, sizing, styles..."
                style={{ flex: 1, resize: "none", border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: "10px 14px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", background: BRAND.soft, color: BRAND.accent, lineHeight: 1.5, minHeight: 42, maxHeight: 90 }}
                rows={1}
              />
              <button
                type="button"
                className={`vizr-voice${isListening ? " vizr-voice--active" : ""}`}
                onClick={toggleVoiceInput}
                disabled={loading || !voiceSupported}
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
                title={voiceSupported ? (isListening ? "Stop voice input" : "Start voice input") : "Voice input not supported"}
                style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", border: `1px solid ${BRAND.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0, color: BRAND.accent }}
              >
                {isListening ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6.5" y="6.5" width="11" height="11" rx="2.2" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" />
                    <path d="M19 12a7 7 0 0 1-14 0" />
                    <path d="M12 19v3" />
                  </svg>
                )}
              </button>
              <button className="vizr-send" onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ width: 40, height: 40, borderRadius: 12, background: BRAND.accent, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <div style={{ minHeight: 18, marginTop: 8, fontSize: 11, color: voiceError ? "#b44f68" : BRAND.muted, letterSpacing: 0.2 }}>
              {voiceError || (isListening ? "Listening for your question. Speak naturally and pause when finished." : voiceSupported ? "Tap the microphone for voice input." : "Voice input is not supported in this browser.")}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${BRAND.border}`, padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(59,0,102,0.015)" }}>
          <span style={{ fontSize: 11, color: BRAND.muted, letterSpacing: 0.5 }}>Powered by VizrGod AI</span>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: BRAND.gold, letterSpacing: 1 }}>VIZRR</span>
        </div>
      </div>
    </>
  );
}