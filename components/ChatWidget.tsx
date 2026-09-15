"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Maximize2, Minimize2 } from "lucide-react";

type Message = {
  id: string;
  sender: "visitor" | "agent" | "system";
  agent_name?: string;
  message: string;
  created_at: string;
};

const CONCERNS = [
  { v: "order", label: "Order Inquiry" },
  { v: "catering", label: "Events & Catering" },
  { v: "feedback", label: "Feedback" },
  { v: "other", label: "Other" },
];

const SESSION_KEY = "umami_chat";
const TIMEOUT_MS = 20 * 60 * 1000;
const WARN_MS = 18 * 60 * 1000;
const POLL_MS = 3000;

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatWidget() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [phase, setPhase] = useState<"form" | "chat" | "ended">("form");
  const [sid, setSid] = useState<string | null>(null);

  // Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [concern, setConcern] = useState("");
  const [bg, setBg] = useState("");
  const [formErr, setFormErr] = useState("");
  const [starting, setStarting] = useState(false);

  // Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const [showWarn, setShowWarn] = useState(false);
  const [agentOnline, setAgentOnline] = useState(false);
  const [agentNameOnline, setAgentNameOnline] = useState("");
  const [showAgentLabel, setShowAgentLabel] = useState(false);

  const msgsRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());

  const scrollToBottom = () => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  };

  const addMessages = useCallback((newMsgs: Message[]) => {
    const toAdd = newMsgs.filter((m) => !knownIdsRef.current.has(m.id));
    if (toAdd.length === 0) return;
    toAdd.forEach((m) => knownIdsRef.current.add(m.id));
    setMessages((prev) => [...prev, ...toAdd]);
    setTimeout(scrollToBottom, 50);
  }, []);

  const checkAgent = useCallback(async () => {
    try {
      const r = await fetch("/api/chat/agent");
      const d = await r.json();
      setAgentOnline(d.online);
      setAgentNameOnline(d.agent_name || "");
    } catch {}
  }, []);

  const pollMessages = useCallback(
    async (id: string) => {
      try {
        const r = await fetch(`/api/chat/sessions/${id}`);
        const d = await r.json();
        if (d.messages) addMessages(d.messages);
      } catch {}
    },
    [addMessages]
  );

  const startPoll = useCallback(
    (id: string) => {
      if (pollRef.current) return;
      pollMessages(id);
      pollRef.current = setInterval(() => pollMessages(id), POLL_MS);
    },
    [pollMessages]
  );

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const armTimeout = useCallback(
    (id: string) => {
      clearTimeout(toRef.current ?? undefined);
      clearTimeout(warnRef.current ?? undefined);
      setShowWarn(false);
      warnRef.current = setTimeout(() => setShowWarn(true), WARN_MS);
      toRef.current = setTimeout(async () => {
        stopPoll();
        setShowWarn(false);
        setPhase("ended");
        const sysMsg: Message = {
          id: "sys_to_" + Date.now(),
          sender: "system",
          message: "Chat closed after 20 minutes of inactivity.",
          created_at: new Date().toISOString(),
        };
        addMessages([sysMsg]);
        try {
          await fetch(`/api/chat/sessions/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "closed" }),
          });
          sessionStorage.removeItem(SESSION_KEY);
        } catch {}
      }, TIMEOUT_MS);
    },
    [stopPoll, addMessages]
  );

  // Restore session + check agent on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        setSid(saved);
        setPhase("chat");
        knownIdsRef.current = new Set(["__greet__"]);
        addMessages([
          {
            id: "__greet__",
            sender: "agent",
            message: "Welcome back! We're here to help.",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {}
    checkAgent();
    const interval = setInterval(checkAgent, 90000);
    return () => clearInterval(interval);
  }, [checkAgent, addMessages]);

  // Show agent label when agent is online and widget is closed
  useEffect(() => {
    setShowAgentLabel(agentOnline && !!agentNameOnline && !open);
  }, [agentOnline, agentNameOnline, open]);

  const handleOpen = () => {
    setOpen(true);
    setShowAgentLabel(false);
    setUnread(0);
    if (sid && phase === "chat") startPoll(sid);
  };

  const handleClose = () => {
    setOpen(false);
    stopPoll();
    checkAgent();
  };

  const handleStart = async () => {
    setFormErr("");
    if (!name.trim()) { setFormErr("Please enter your full name."); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormErr("Please enter a valid email address.");
      return;
    }
    if (!phone.trim()) { setFormErr("Please enter your contact number."); return; }
    if (!concern) { setFormErr("Please select an enquiry type."); return; }

    setStarting(true);
    try {
      const r = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitor_name: name,
          visitor_email: email,
          visitor_contact: phone,
          concern_type: concern,
          concern_background: bg,
        }),
      });
      const d = await r.json();
      if (!d.sessionId) throw new Error("Failed to create session.");

      setSid(d.sessionId);
      try { sessionStorage.setItem(SESSION_KEY, d.sessionId); } catch {}

      const concernLabel = CONCERNS.find((c) => c.v === concern)?.label || concern;
      const initMsg = "Enquiry type: " + concernLabel + (bg ? "\n\n" + bg : "");
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: d.sessionId, sender: "visitor", message: initMsg }),
      });

      knownIdsRef.current = new Set(["__greet__"]);
      setMessages([]);
      addMessages([
        {
          id: "__greet__",
          sender: "agent",
          message: `Hello ${name}! Thank you for reaching out. We'll be with you shortly.`,
          created_at: new Date().toISOString(),
        },
      ]);
      setPhase("chat");
      startPoll(d.sessionId);
      armTimeout(d.sessionId);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not connect. Please try again.";
      setFormErr(msg.length < 200 ? msg : "Could not connect. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !sid || phase !== "chat") return;
    const text = input.trim();
    setInput("");
    armTimeout(sid);
    addMessages([
      { id: "opt_" + Date.now(), sender: "visitor", message: text, created_at: new Date().toISOString() },
    ]);
    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid, sender: "visitor", message: text }),
      });
      await pollMessages(sid);
    } catch {}
  };

  const handleEnd = async () => {
    if (!sid || phase !== "chat") return;
    if (!confirm("Are you sure you want to end this chat?")) return;
    stopPoll();
    clearTimeout(toRef.current ?? undefined);
    clearTimeout(warnRef.current ?? undefined);
    setShowWarn(false);
    addMessages([
      { id: "sys_end_" + Date.now(), sender: "system", message: "You have ended this chat session.", created_at: new Date().toISOString() },
    ]);
    setPhase("ended");
    try {
      await fetch(`/api/chat/sessions/${sid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  };

  // Don't render on admin/login pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/login")) return null;

  const panelW = maximized ? "min(640px, calc(100vw - 40px))" : "380px";
  const panelH = maximized ? "min(740px, calc(100vh - 110px))" : "640px";

  return (
    <>
      {/* Agent online label */}
      <div
        className="fixed z-[99999] flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-lg border border-stone/10 cursor-pointer transition-all duration-300 text-sm font-semibold text-charcoal whitespace-nowrap"
        style={{
          bottom: 36, right: 88,
          opacity: showAgentLabel ? 1 : 0,
          pointerEvents: showAgentLabel ? "all" : "none",
          transform: showAgentLabel ? "translateX(0)" : "translateX(10px)",
        }}
        onClick={handleOpen}
      >
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
        <span><span className="text-maroon">{agentNameOnline}</span> is online</span>
      </div>

      {/* Bubble */}
      <button
        className="fixed z-[99999] bottom-7 right-7 w-14 h-14 rounded-full bg-maroon flex items-center justify-center shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 border-none"
        onClick={() => (open ? handleClose() : handleOpen())}
        aria-label="Chat with us"
      >
        {open ? (
          <X size={22} className="text-cream" />
        ) : (
          <MessageCircle size={22} className="text-cream fill-cream" />
        )}
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 bg-tan text-charcoal text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 border-2 border-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      <div
        className="fixed z-[99998] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200"
        style={{
          bottom: maximized ? 20 : 90,
          right: maximized ? 20 : 28,
          width: panelW,
          height: panelH,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transform: open ? "translateY(0) scale(1)" : "translateY(10px) scale(0.97)",
        }}
        role="dialog"
        aria-label="Live chat"
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-4 shrink-0"
          style={{ background: "linear-gradient(135deg, #6B1D1D 0%, #8B2D2D 100%)" }}
        >
          <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0 border-2 border-white/25">
            <MessageCircle size={20} className="text-cream" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-cream font-bold text-sm tracking-tight">Umami Street Support</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              <span className="text-cream/70 text-xs">We are online</span>
            </div>
          </div>
          <button
            className="w-8 h-8 rounded-lg bg-transparent border-none flex items-center justify-center text-cream/60 hover:text-cream hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => setMaximized((m) => !m)}
            aria-label={maximized ? "Minimize" : "Maximize"}
          >
            {maximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            className="w-8 h-8 rounded-lg bg-transparent border-none flex items-center justify-center text-cream/60 hover:text-cream hover:bg-white/10 transition-colors cursor-pointer"
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* Intake form */}
        {phase === "form" && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#F5F0EB]">
            <p className="text-xs text-charcoal/70 bg-white rounded-xl px-4 py-3 border-l-4 border-maroon shadow-sm leading-relaxed">
              Please fill in your details to start. In case we get disconnected, we will contact you immediately.
            </p>

            <div className="bg-white rounded-xl px-5 py-5 shadow-sm flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-stone mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full h-12 border border-stone/30 rounded-lg px-4 text-sm text-charcoal bg-[#F8F5F2] outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/10 transition-all"
                  placeholder="Juan dela Cruz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-stone mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full h-12 border border-stone/30 rounded-lg px-4 text-sm text-charcoal bg-[#F8F5F2] outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/10 transition-all"
                  placeholder="juan@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={120}
                />
              </div>
              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-stone mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  className="w-full h-12 border border-stone/30 rounded-lg px-4 text-sm text-charcoal bg-[#F8F5F2] outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/10 transition-all"
                  placeholder="09XX XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={20}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl px-5 py-5 shadow-sm flex flex-col gap-4">
              {/* Concern chips */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-stone mb-2">
                  Enquiry Type <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {CONCERNS.map((c) => (
                    <button
                      key={c.v}
                      type="button"
                      onClick={() => setConcern(c.v)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                        concern === c.v
                          ? "bg-maroon text-cream border-maroon shadow"
                          : "bg-[#F5F0EB] text-charcoal/70 border-stone/30 hover:border-maroon hover:text-maroon"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Background */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-stone mb-2">
                  Message{" "}
                  <span className="text-stone/40 normal-case font-normal tracking-normal text-[10px]">(optional)</span>
                </label>
                <textarea
                  className="w-full border border-stone/30 rounded-lg px-4 py-3 text-sm text-charcoal bg-[#F8F5F2] outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/10 resize-none transition-all leading-relaxed"
                  rows={3}
                  placeholder="Briefly describe your concern…"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  maxLength={400}
                />
              </div>
            </div>

            {formErr && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 leading-relaxed">
                {formErr}
              </p>
            )}

            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full h-12 bg-maroon text-cream font-bold text-sm rounded-xl shadow-lg hover:bg-maroon/90 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 uppercase tracking-wider"
            >
              {starting ? "Starting…" : "Start Chat"}
            </button>
          </div>
        )}

        {/* Chat messages */}
        {(phase === "chat" || phase === "ended") && (
          <>
            <div
              ref={msgsRef}
              className="flex-1 overflow-y-auto px-3.5 py-4 flex flex-col gap-1 bg-[#F8F6F3]"
            >
              {messages.map((m) => {
                if (m.sender === "system") {
                  return (
                    <div key={m.id} className="self-center max-w-[90%] text-center">
                      <span className="text-[11px] text-stone/60 italic">{m.message}</span>
                    </div>
                  );
                }
                const isVisitor = m.sender === "visitor";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col max-w-[85%] ${isVisitor ? "self-end items-end" : "self-start items-start"}`}
                  >
                    {!isVisitor && m.agent_name && (
                      <span className="text-[11px] font-bold text-maroon mb-0.5 pl-0.5">{m.agent_name}</span>
                    )}
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words whitespace-pre-wrap ${
                        isVisitor
                          ? "bg-maroon text-cream rounded-br-sm"
                          : "bg-white text-charcoal shadow-sm rounded-bl-sm"
                      }`}
                    >
                      {m.message}
                    </div>
                    <span className="text-[10px] text-stone/40 mt-1 px-0.5">{fmtTime(m.created_at)}</span>
                  </div>
                );
              })}
            </div>

            {/* Timeout warning */}
            {showWarn && (
              <div className="flex items-center gap-2.5 px-3.5 py-2 bg-amber-50 border-t border-amber-200 shrink-0">
                <span className="text-xs text-amber-800 flex-1 leading-snug">
                  No activity for 18 minutes. This chat will close in 2 minutes.
                </span>
                <button
                  onClick={() => { armTimeout(sid!); }}
                  className="text-xs font-semibold px-3 py-1 bg-maroon text-cream rounded shrink-0"
                >
                  Keep open
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="bg-white border-t border-stone/10 shrink-0">
              {phase === "chat" ? (
                <>
                  <div className="flex items-end gap-2 px-3 py-2.5">
                    <textarea
                      className="flex-1 border border-stone/20 rounded-lg px-3 py-2 text-[13px] resize-none outline-none bg-[#FAFAFA] focus:border-maroon transition-colors leading-relaxed max-h-20"
                      placeholder="Type a message…"
                      rows={1}
                      maxLength={1000}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="w-9 h-9 shrink-0 bg-maroon rounded-lg flex items-center justify-center hover:bg-maroon/90 transition-colors disabled:bg-stone/30 disabled:cursor-not-allowed"
                      aria-label="Send"
                    >
                      <Send size={14} className="text-cream" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between px-3.5 pb-2.5">
                    <span className="text-[10px] text-stone/40">Enter to send · Shift+Enter for new line</span>
                    <button
                      onClick={handleEnd}
                      className="text-[11px] text-stone/40 hover:text-red-500 underline underline-offset-2 transition-colors"
                    >
                      End chat
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-center text-xs text-stone/50 py-3 px-4">
                  This chat session has been closed.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
