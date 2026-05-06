import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { Send, Trash2, ArrowLeft, Inbox, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { currentAPI } from "@/config/api";

const POLL_INTERVAL = 5000;

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 2592000)}mo ago`;
}

function Avatar({ name, size = 7 }) {
    const initials = name?.slice(0, 2).toUpperCase() ?? "?";
    const hue = [...(name ?? "")].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
    return (
        <div style={{
            width: `${size * 4}px`, height: `${size * 4}px`, borderRadius: "50%", flexShrink: 0,
            background: `hsl(${hue},35%,38%)`, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: `${size * 1.5}px`, fontWeight: 700,
            color: "rgba(255,255,255,0.9)", letterSpacing: "0.02em",
        }}>
            {initials}
        </div>
    );
}

const actionBtn = {
    background: "color-mix(in srgb, var(--outline) 20%, transparent)",
    border: "none", cursor: "pointer", color: "var(--text-color)",
    borderRadius: "6px", padding: "0.25rem", display: "flex", alignItems: "center",
};

function MessageBubble({ msg, isOwn, isAdmin, onDelete }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: isOwn ? "flex-end" : "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexDirection: isOwn ? "row-reverse" : "row" }}>
                <Avatar name={msg.senderUsername} size={5} />
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-text)", opacity: 0.85 }}>{msg.senderUsername}</span>
                {msg.isFromAdmin && (
                    <span style={{
                        fontSize: "0.58rem", background: "var(--primary)", color: "rgba(255,237,213,0.95)",
                        padding: "0.1rem 0.4rem", borderRadius: "4px", fontWeight: 700,
                        letterSpacing: "0.06em", textTransform: "uppercase",
                    }}>Admin</span>
                )}
                <span style={{ fontSize: "0.68rem", color: "var(--text-color)", opacity: 0.35 }}>{timeAgo(msg.createdAt)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.4rem", flexDirection: isOwn ? "row-reverse" : "row" }}
                className="group">
                <div style={{
                    maxWidth: "min(72%, 28rem)", padding: "0.55rem 0.9rem",
                    borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    fontSize: "0.85rem", lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word",
                    background: isOwn
                        ? "var(--primary)"
                        : "color-mix(in srgb, var(--accent) 90%, var(--primary) 10%)",
                    color: isOwn ? "rgba(255,244,230,0.97)" : "var(--accent-text)",
                    boxShadow: isOwn
                        ? "0 2px 12px color-mix(in srgb, var(--primary) 35%, transparent)"
                        : "0 2px 8px rgba(0,0,0,0.15)",
                    border: isOwn ? "none" : "1px solid color-mix(in srgb, var(--outline) 30%, transparent)",
                }}>
                    {msg.text}
                </div>
                {isAdmin && (
                    <button onClick={() => onDelete(msg.id)} title="Delete"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ ...actionBtn, color: "rgba(248,113,113,0.8)" }}>
                        <Trash2 size={13} />
                    </button>
                )}
            </div>
        </div>
    );
}

function BackButton({ navigate }) {
    return (
        <button onClick={() => navigate(-1)} title="Go back" style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-color)", padding: "0.25rem", borderRadius: "8px",
            display: "flex", alignItems: "center", opacity: 0.5,
            transition: "opacity 0.15s", flexShrink: 0,
        }}
            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0.5"}
        >
            <ArrowLeft size={16} />
        </button>
    );
}

function ThreadView({ threadUserId, threadUsername, onBack, currentUser, isAdmin }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const isAtBottom = useRef(true);
    const cooldownRef = useRef(null);
    const navigate = useNavigate();

    const url = isAdmin ? `${currentAPI}/dms/${threadUserId}` : `${currentAPI}/dms`;

    function scrollToBottom(smooth = true) {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "instant" });
    }

    const hasLoaded = useRef(false);

    const fetchMessages = useCallback(async (silent = false) => {
        const firstLoad = !hasLoaded.current;
        if (!silent && firstLoad) setLoading(true);
        try {
            const res = await fetch(url, { credentials: "include" });
            if (res.ok) setMessages(await res.json());
        } finally {
            if (!silent && firstLoad) {
                setLoading(false);
                hasLoaded.current = true;
            }
        }
    }, [url]);

    useEffect(() => { fetchMessages(); }, [fetchMessages]);

    useEffect(() => {
        const id = setInterval(() => {
            if (isAtBottom.current) fetchMessages(true);
        }, POLL_INTERVAL);
        return () => clearInterval(id);
    }, [fetchMessages]);

    useEffect(() => {
        if (isAtBottom.current) scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (cooldown <= 0) return;
        cooldownRef.current = setInterval(() => {
            setCooldown((c) => {
                if (c <= 1) { clearInterval(cooldownRef.current); return 0; }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(cooldownRef.current);
    }, [cooldown > 0]);

    function handleScroll(e) {
        const el = e.currentTarget;
        isAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    }

    async function handleSend(e) {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || sending || cooldown > 0) return;
        setSending(true);
        try {
            const postUrl = isAdmin ? `${currentAPI}/dms/${threadUserId}` : `${currentAPI}/dms`;
            const res = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ text: trimmed }),
            });
            if (res.status === 429) {
                const data = await res.json();
                setCooldown(data.retryAfter ?? 60);
            } else if (res.ok) {
                const msg = await res.json();
                setMessages((prev) => [...prev, msg]);
                setText("");
                isAtBottom.current = true;
                setTimeout(() => scrollToBottom(), 50);
            }
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    }

    async function handleDelete(msgId) {
        const res = await fetch(`${currentAPI}/dms/${msgId}`, { method: "DELETE", credentials: "include" });
        if (res.ok) setMessages((prev) => prev.filter((m) => m.id !== msgId));
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Header */}
            <div style={{
                padding: "1rem 1.25rem 0.85rem",
                borderBottom: "1px solid color-mix(in srgb, var(--outline) 25%, transparent)",
                background: "color-mix(in srgb, var(--accent) 40%, transparent)",
                backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", gap: "0.75rem",
            }}>
                    {onBack ? (
                    <button onClick={onBack} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "var(--text-color)", padding: "0.25rem", borderRadius: "8px",
                        display: "flex", alignItems: "center", opacity: 0.6,
                        transition: "opacity 0.15s",
                    }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "0.6"}
                    >
                        <ArrowLeft size={16} />
                    </button>
                ) : (
                    <BackButton navigate={navigate} />
                )}
                <Avatar name={isAdmin ? threadUsername : "Admin"} size={6} />
                <div>
                    <h2 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--accent-text)", margin: 0, lineHeight: 1.2 }}>
                        {isAdmin ? threadUsername : "Messages with Admins"}
                    </h2>
                    <p style={{ fontSize: "0.68rem", color: "var(--text-color)", opacity: 0.45, margin: 0, marginTop: "0.1rem" }}>
                        {isAdmin ? "Admin view" : "Private — visible to all admins"}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} onScroll={handleScroll} style={{
                flex: 1, overflowY: "auto", padding: "1.25rem 1rem",
                display: "flex", flexDirection: "column", gap: "0.85rem",
                scrollbarWidth: "thin",
                scrollbarColor: "color-mix(in srgb, var(--outline) 40%, transparent) transparent",
            }}>
                {loading && (
                    <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-color)", opacity: 0.4, fontStyle: "italic" }}>Loading…</span>
                    </div>
                )}
                {!loading && messages.length === 0 && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "0.5rem", opacity: 0.4 }}>
                        <MessageCircle size={32} style={{ color: "var(--text-color)" }} />
                        <span style={{ fontSize: "0.82rem", color: "var(--text-color)", fontStyle: "italic" }}>No messages yet.</span>
                    </div>
                )}
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg}
                        isOwn={msg.senderId === currentUser?.id}
                        isAdmin={isAdmin} onDelete={handleDelete}
                    />
                ))}
            </div>

            {/* Input */}
            <div style={{
                padding: "0.75rem 1rem",
                borderTop: "1px solid color-mix(in srgb, var(--outline) 20%, transparent)",
                background: "color-mix(in srgb, var(--accent) 30%, transparent)",
                backdropFilter: "blur(8px)",
            }}>
                <form onSubmit={handleSend} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={cooldown > 0 ? `Wait ${cooldown}s…` : "Type a message…"}
                        maxLength={500}
                        disabled={cooldown > 0}
                        style={{
                            flex: 1, padding: "0.55rem 0.9rem", borderRadius: "10px", fontSize: "0.85rem",
                            background: "color-mix(in srgb, var(--surface-background) 70%, transparent)",
                            color: "var(--accent-text)", outline: "none",
                            border: "1px solid color-mix(in srgb, var(--outline) 30%, transparent)",
                            transition: "border-color 0.15s", opacity: cooldown > 0 ? 0.5 : 1,
                        }}
                        onFocus={e => e.target.style.borderColor = "color-mix(in srgb, var(--primary) 60%, transparent)"}
                        onBlur={e => e.target.style.borderColor = "color-mix(in srgb, var(--outline) 30%, transparent)"}
                    />
                    <button type="submit" disabled={!text.trim() || sending || cooldown > 0} style={{
                        padding: "0.55rem 0.85rem", borderRadius: "10px", border: "none", cursor: "pointer",
                        background: "var(--primary)", color: "rgba(255,244,230,0.97)",
                        opacity: !text.trim() || sending || cooldown > 0 ? 0.4 : 1,
                        transition: "opacity 0.15s", display: "flex", alignItems: "center",
                    }}
                        onMouseEnter={e => { if (text.trim() && !sending && !cooldown) e.currentTarget.style.opacity = "0.82"; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = !text.trim() || sending || cooldown > 0 ? "0.4" : "1"; }}
                    >
                        <Send size={15} />
                    </button>
                </form>
                {cooldown > 0 && (
                    <p style={{ fontSize: "0.7rem", color: "var(--text-color)", opacity: 0.45, marginTop: "0.35rem" }}>
                        You can send another message in {cooldown}s.
                    </p>
                )}
            </div>
        </div>
    );
}

function AdminInbox({ onOpenThread }) {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        let hasLoaded = false;
        async function fetchThreads(silent = false) {
            if (!silent && !hasLoaded) setLoading(true);
            try {
                const res = await fetch(`${currentAPI}/dms`, { credentials: "include" });
                if (res.ok) setThreads(await res.json());
            } finally {
                if (!silent && !hasLoaded) {
                    setLoading(false);
                    hasLoaded = true;
                }
            }
        }
        fetchThreads();
        const id = setInterval(() => fetchThreads(true), POLL_INTERVAL);
        return () => clearInterval(id);
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Header */}
            <div style={{
                padding: "1rem 1.25rem 0.85rem",
                borderBottom: "1px solid color-mix(in srgb, var(--outline) 25%, transparent)",
                background: "color-mix(in srgb, var(--accent) 40%, transparent)",
                backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", gap: "0.75rem",
            }}>
                <BackButton navigate={navigate} />
                <div style={{
                    width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                    background: "color-mix(in srgb, var(--primary) 25%, var(--accent))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid color-mix(in srgb, var(--outline) 30%, transparent)",
                }}>
                    <Inbox size={16} style={{ color: "var(--primary)", opacity: 0.9 }} />
                </div>
                <div>
                    <h1 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent-text)", margin: 0 }}>Messages</h1>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-color)", opacity: 0.45, margin: 0, marginTop: "0.1rem" }}>All user conversations</p>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin" }}>
                {loading && <p style={{ fontSize: "0.82rem", color: "var(--text-color)", opacity: 0.4, fontStyle: "italic", padding: "1.5rem", textAlign: "center" }}>Loading…</p>}
                {!loading && threads.length === 0 && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem", gap: "0.5rem", opacity: 0.4 }}>
                        <Inbox size={28} style={{ color: "var(--text-color)" }} />
                        <span style={{ fontSize: "0.82rem", color: "var(--text-color)", fontStyle: "italic" }}>No messages yet.</span>
                    </div>
                )}
                {threads.map((t) => (
                    <button key={t.userId} onClick={() => onOpenThread(t.userId, t.username)} style={{
                        width: "100%", textAlign: "left", padding: "0.85rem 1.25rem",
                        borderBottom: "1px solid color-mix(in srgb, var(--outline) 15%, transparent)",
                        background: "none", border: "none", cursor: "pointer",
                        borderBottomWidth: "1px", borderBottomStyle: "solid",
                        borderBottomColor: "color-mix(in srgb, var(--outline) 15%, transparent)",
                        transition: "background 0.12s",
                        display: "flex", alignItems: "center", gap: "0.75rem",
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = "color-mix(in srgb, var(--accent) 60%, transparent)"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                        <Avatar name={t.username} size={6} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-text)" }}>{t.username}</span>
                                <span style={{ fontSize: "0.68rem", color: "var(--text-color)", opacity: 0.4, flexShrink: 0 }}>{timeAgo(t.updatedAt)}</span>
                            </div>
                            {t.lastMessage && (
                                <span style={{ fontSize: "0.75rem", color: "var(--text-color)", opacity: 0.55, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {t.lastMessage}
                                </span>
                            )}
                        </div>
                        {t.unreadCount > 0 && (
                            <span style={{
                                fontSize: "0.65rem", background: "var(--primary)", color: "rgba(255,237,213,0.97)",
                                padding: "0.15rem 0.5rem", borderRadius: "99px", fontWeight: 700, flexShrink: 0,
                            }}>{t.unreadCount}</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function DMPage() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === "ADMIN";
    const [activeThread, setActiveThread] = useState(null);

    const containerStyle = {
        display: "flex", flexDirection: "column",
        maxWidth: "42rem", margin: "0 auto", width: "100%",
        background: "color-mix(in srgb, var(--surface-background) 60%, transparent)",
        border: "1px solid color-mix(in srgb, var(--outline) 30%, transparent)",
        borderRadius: "16px", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    };

    if (!isAuthenticated) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "16rem", flexDirection: "column", gap: "0.75rem", color: "var(--text-color)" }}>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>Please log in to view messages.</p>
            <button onClick={() => navigate("/login")} style={{
                padding: "0.45rem 1.1rem", background: "var(--primary)", color: "rgba(255,237,213,0.97)",
                border: "none", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
            }}>Log In</button>
        </div>
    );

    if (!isAdmin) return (
        <div className="gc-dm-container" style={containerStyle}>
            <ThreadView threadUserId={user.id} threadUsername={user.username} onBack={null} currentUser={user} isAdmin={false} />
        </div>
    );

    return (
        <div className="gc-dm-container" style={containerStyle}>
            {activeThread ? (
                <ThreadView
                    threadUserId={activeThread.userId} threadUsername={activeThread.username}
                    onBack={() => setActiveThread(null)} currentUser={user} isAdmin={true}
                />
            ) : (
                <AdminInbox onOpenThread={(userId, username) => setActiveThread({ userId, username })} />
            )}
        </div>
    );
}
