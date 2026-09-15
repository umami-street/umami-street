"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare } from "lucide-react";

type Session = {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_contact: string;
  concern_type: string;
  concern_background: string;
  status: "open" | "closed";
  unread_count: number;
  last_message: string;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  session_id: string;
  sender: "visitor" | "agent" | "system";
  agent_name?: string;
  message: string;
  created_at: string;
};

const CONCERN_LABELS: Record<string, string> = {
  order: "Order Inquiry",
  catering: "Events & Catering",
  feedback: "Feedback",
  other: "General Inquiry",
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function fmtAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
  return Math.floor(diff / 86400000) + "d ago";
}

function avatar(name: string) {
  return (name || "V").charAt(0).toUpperCase();
}

function playNotif() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

export default function AdminChatPage() {
  const [agentName, setAgentName] = useState("");
  const [agentInput, setAgentInput] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [filter, setFilter] = useState<"open" | "closed" | "all">("open");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [knownMsgIds, setKnownMsgIds] = useState<Set<string>>(new Set());
  const [showInfo, setShowInfo] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [pollStatus, setPollStatus] = useState("Connecting…");
  const [totalUnread, setTotalUnread] = useState(0);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgsRef = useRef<HTMLDivElement>(null);

  // Load agent name from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("umami_agent_name") || "";
      if (saved) {
        setAgentName(saved);
      } else {
        setShowModal(true);
      }
    } catch {
      setShowModal(true);
    }
  }, []);

  const scrollMsgs = () => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  };

  const sendHeartbeat = useCallback(
    async (name: string) => {
      if (!name) return;
      try {
        await fetch("/api/chat/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "heartbeat", agent_name: name }),
        });
      } catch {}
    },
    []
  );

  const applyAgentName = useCallback(
    (name: string) => {
      setAgentName(name);
      try { localStorage.setItem("umami_agent_name", name); } catch {}
      sendHeartbeat(name);
      if (!heartbeatRef.current) {
        heartbeatRef.current = setInterval(() => sendHeartbeat(name), 60000);
      }
    },
    [sendHeartbeat]
  );

  const handleAgentSubmit = () => {
    const n = agentInput.trim();
    if (!n) return;
    applyAgentName(n);
    setShowModal(false);
  };

  const prevUnreadRef = useRef<Record<string, number>>({});

  const loadSessions = useCallback(async () => {
    try {
      const r = await fetch("/api/chat/sessions");
      const list: Session[] = await r.json();
      if (!Array.isArray(list)) return;

      let hasNew = false;
      list.forEach((s) => {
        const prev = prevUnreadRef.current[s.id] || 0;
        if (s.id !== activeId && (s.unread_count || 0) > prev) hasNew = true;
        prevUnreadRef.current[s.id] = s.unread_count || 0;
      });
      if (hasNew) playNotif();

      setSessions(list);
      setTotalUnread(list.reduce((n, s) => n + (s.unread_count || 0), 0));
      setPollStatus("Live · " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch {
      setPollStatus("Connection error");
    }
  }, [activeId]);

  const fetchMessages = useCallback(async (id: string) => {
    try {
      const r = await fetch(`/api/chat/sessions/${id}`);
      const d = await r.json();
      if (d.session) {
        setSessions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...d.session } : s))
        );
      }
      if (Array.isArray(d.messages)) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const toAdd = d.messages.filter((m: Message) => !ids.has(m.id));
          if (toAdd.length === 0) return prev;
          toAdd.forEach((m: Message) => {
            if (m.sender === "visitor") {
              setKnownMsgIds((k) => {
                if (!k.has(m.id)) { playNotif(); }
                return new Set([...k, m.id]);
              });
            }
          });
          return [...prev, ...toAdd];
        });
        setTimeout(scrollMsgs, 50);
      }
    } catch {}
  }, []);

  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    loadSessions();
    pollRef.current = setInterval(() => {
      loadSessions();
      if (activeId) fetchMessages(activeId);
    }, 5000);
  }, [loadSessions, fetchMessages, activeId]);

  // Start polling and heartbeat once agent name is set
  useEffect(() => {
    if (agentName) {
      applyAgentName(agentName);
      startPolling();
    }
  }, [agentName, applyAgentName, startPolling]);

  // Restart polling when activeId changes
  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (agentName) startPolling();
  }, [activeId, agentName, startPolling]);

  // Offline on unload
  useEffect(() => {
    const handler = () => {
      if (agentName) {
        navigator.sendBeacon(
          "/api/chat/agent",
          new Blob([JSON.stringify({ action: "offline" })], { type: "application/json" })
        );
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [agentName]);

  const openSession = async (id: string) => {
    setActiveId(id);
    setMessages([]);
    setKnownMsgIds(new Set());
    setShowInfo(false);
    await fetchMessages(id);
    await loadSessions();
  };

  const sendReply = async () => {
    if (!reply.trim() || !activeId) return;
    setSending(true);
    const text = reply.trim();
    setReply("");
    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: activeId,
          sender: "agent",
          agent_name: agentName,
          message: text,
        }),
      });
      await fetchMessages(activeId);
      await loadSessions();
    } finally {
      setSending(false);
    }
  };

  const setStatus = async (status: "open" | "closed") => {
    if (!activeId) return;
    await fetch(`/api/chat/sessions/${activeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await loadSessions();
    await fetchMessages(activeId);
  };

  const terminate = async () => {
    if (!activeId) return;
    if (!confirm("Terminate this chat? A closing message will be sent to the visitor.")) return;
    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: activeId,
        sender: "agent",
        agent_name: agentName,
        message:
          "This chat session has been ended by a support agent. Thank you for contacting Umami Street. For further assistance, please feel free to reach us again.",
      }),
    });
    await setStatus("closed");
  };

  const filtered = sessions
    .filter((s) => {
      if (filter === "open") return s.status === "open";
      if (filter === "closed") return s.status === "closed";
      return true;
    })
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const active = sessions.find((s) => s.id === activeId);

  // Render messages with date dividers
  const msgGroups: Array<{ type: "divider"; date: string } | { type: "msg"; msg: Message }> = [];
  let lastDate = "";
  messages.forEach((m) => {
    const d = fmtDate(m.created_at);
    if (d !== lastDate) {
      msgGroups.push({ type: "divider", date: d });
      lastDate = d;
    }
    msgGroups.push({ type: "msg", msg: m });
  });

  return (
    <div className="flex h-full overflow-hidden">
      {/* Agent name modal */}
      {showModal && (
        <div className="fixed inset-0 bg-charcoal/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-bold text-charcoal mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
              Welcome to Live Chat
            </h2>
            <p className="text-stone text-sm mb-5 leading-relaxed">
              Enter your name before you start. Visitors will see this name when you reply.
            </p>
            <input
              className="w-full border border-stone/30 rounded-lg px-4 py-2.5 text-sm outline-none mb-3 focus:border-maroon"
              placeholder="Your name (e.g. Maria)"
              maxLength={60}
              value={agentInput}
              onChange={(e) => setAgentInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAgentSubmit()}
              autoFocus
            />
            <button
              onClick={handleAgentSubmit}
              className="w-full py-3 bg-maroon text-cream font-bold rounded-lg text-sm hover:bg-maroon/90 transition-colors"
            >
              Enter Live Chat
            </button>
          </div>
        </div>
      )}

      {/* Session list */}
      <div className="w-72 min-w-[288px] bg-white border-r border-stone/15 flex flex-col">
        <div className="px-4 py-3 border-b border-stone/10 flex items-center gap-2 shrink-0">
          <h2 className="font-bold text-sm text-charcoal flex-1">Conversations</h2>
          {totalUnread > 0 && (
            <span className="bg-tan text-charcoal text-[10px] font-bold px-2 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
          <div className="flex gap-1">
            {(["open", "closed", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[11px] px-2.5 py-1 rounded-full border capitalize transition-colors ${
                  filter === f
                    ? "bg-maroon text-cream border-maroon"
                    : "border-stone/30 text-stone hover:border-maroon hover:text-maroon"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center text-stone/50 text-sm py-12 px-4">No conversations yet.</div>
          ) : (
            filtered.map((s) => (
              <div
                key={s.id}
                onClick={() => openSession(s.id)}
                className={`flex gap-3 items-start px-4 py-3 border-b border-stone/5 cursor-pointer transition-colors ${
                  s.id === activeId ? "bg-maroon/5" : "hover:bg-stone/5"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-cream shrink-0 ${
                    s.status === "closed" ? "bg-stone/40" : "bg-maroon"
                  }`}
                >
                  {avatar(s.visitor_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-sm font-semibold text-charcoal truncate">{s.visitor_name}</span>
                    <span className="text-[10px] text-stone/40 shrink-0">{fmtAgo(s.updated_at)}</span>
                  </div>
                  <div className="flex gap-1 mb-1 flex-wrap">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        s.status === "open" ? "bg-maroon/10 text-maroon" : "bg-stone/10 text-stone"
                      }`}
                    >
                      {CONCERN_LABELS[s.concern_type] || s.concern_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone/50 truncate">{s.last_message}</span>
                    {(s.unread_count || 0) > 0 && (
                      <span className="bg-tan text-charcoal text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 shrink-0 ml-1">
                        {s.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Poll status */}
        <div className="px-4 py-2 border-t border-stone/10 shrink-0">
          <p className="text-[10px] text-stone/40">{pollStatus}</p>
        </div>
      </div>

      {/* Conversation panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#F8F6F3]">
        {!activeId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-stone/30">
            <MessageSquare size={48} />
            <p className="text-sm">Select a conversation to reply</p>
          </div>
        ) : (
          <>
            {/* Closed banner */}
            {active?.status === "closed" && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 shrink-0">
                <span className="text-xs text-amber-800 flex-1">This conversation is closed.</span>
                <button
                  onClick={() => setStatus("open")}
                  className="text-xs font-semibold px-3 py-1 bg-maroon text-cream rounded"
                >
                  Reopen
                </button>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-stone/10 shrink-0">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-charcoal text-sm truncate">{active?.visitor_name}</h3>
                <p className="text-xs text-stone/60 mt-0.5 truncate">
                  {CONCERN_LABELS[active?.concern_type || ""] || active?.concern_type} ·{" "}
                  {active?.visitor_email}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setShowInfo((v) => !v)}
                  className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                    showInfo
                      ? "bg-maroon text-cream border-maroon"
                      : "border-stone/25 text-stone hover:bg-stone/5"
                  }`}
                >
                  Info
                </button>
                {active?.status === "open" && (
                  <>
                    <button
                      onClick={terminate}
                      className="text-xs px-3 py-1.5 rounded border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                    >
                      Terminate
                    </button>
                    <button
                      onClick={() => { if (confirm("Close this session?")) setStatus("closed"); }}
                      className="text-xs px-3 py-1.5 rounded border border-stone/25 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Visitor info */}
            {showInfo && active && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-5 py-3 bg-white border-b border-stone/10 text-xs shrink-0">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-maroon mb-0.5">Email</p>
                  <p className="text-charcoal">{active.visitor_email || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-maroon mb-0.5">Contact</p>
                  <p className="text-charcoal">{active.visitor_contact || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-maroon mb-0.5">Enquiry</p>
                  <p className="text-charcoal">{CONCERN_LABELS[active.concern_type] || active.concern_type}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-maroon mb-0.5">Started</p>
                  <p className="text-charcoal">{new Date(active.created_at).toLocaleString("en-PH")}</p>
                </div>
                {active.concern_background && (
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-maroon mb-0.5">Background</p>
                    <p className="text-charcoal whitespace-pre-wrap">{active.concern_background}</p>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            <div
              ref={msgsRef}
              className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2"
            >
              {msgGroups.map((item, i) => {
                if (item.type === "divider") {
                  return (
                    <div key={"d_" + i} className="self-center text-[11px] text-stone/50 bg-stone/10 rounded-full px-3 py-0.5 my-1">
                      {item.date}
                    </div>
                  );
                }
                const m = item.msg;
                if (m.sender === "system") {
                  return (
                    <div key={m.id} className="self-center max-w-[90%] text-center">
                      <span className="text-xs text-stone/50 italic">{m.message}</span>
                    </div>
                  );
                }
                const isVisitor = m.sender === "visitor";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col max-w-[70%] ${isVisitor ? "self-start" : "self-end"}`}
                  >
                    <span className={`text-[11px] font-semibold mb-0.5 px-0.5 ${isVisitor ? "text-maroon" : "text-stone/60 text-right"}`}>
                      {isVisitor ? (active?.visitor_name || "Visitor") : (m.agent_name || agentName || "Agent")}
                    </span>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words whitespace-pre-wrap ${
                        isVisitor
                          ? "bg-white text-charcoal shadow-sm rounded-tl-sm"
                          : "bg-maroon text-cream rounded-tr-sm"
                      }`}
                    >
                      {m.message}
                    </div>
                    <span className={`text-[10px] text-stone/40 mt-1 px-0.5 ${isVisitor ? "" : "text-right"}`}>
                      {fmtTime(m.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Reply area */}
            {active?.status === "open" && (
              <div className="bg-white border-t border-stone/10 px-4 py-3 shrink-0">
                <p className="text-[11px] text-stone/50 mb-2">
                  Replying as <strong className="text-maroon">{agentName}</strong>
                  <button
                    onClick={() => { setAgentInput(agentName); setShowModal(true); }}
                    className="ml-2 underline underline-offset-2 hover:text-maroon transition-colors"
                  >
                    change
                  </button>
                </p>
                <textarea
                  className="w-full border border-stone/20 rounded-lg px-3 py-2.5 text-sm resize-none outline-none bg-[#FAFAFA] focus:border-maroon transition-colors leading-relaxed"
                  rows={3}
                  placeholder="Type your reply… (Enter to send, Shift+Enter for new line)"
                  maxLength={1000}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-stone/40">{reply.length} / 1000</span>
                  <button
                    onClick={sendReply}
                    disabled={sending || !reply.trim()}
                    className="px-5 py-2 bg-maroon text-cream text-sm font-semibold rounded-lg hover:bg-maroon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? "Sending…" : "Send Reply"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
