import { useState, useEffect, useRef, useCallback } from "react";
import { useRouteLoaderData, Link } from "react-router";
import { Send, Trash2, ShieldPlus, ShieldMinus, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { currentAPI } from "@/config/api";
import { useGameEditors } from "../../hooks/useGameEditors.js";

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

function SystemMessage({ msg }) {
    return (
        <div style={{ display: "flex", justifyContent: "center", padding: "0.25rem 0" }}>
            <span style={{
                fontSize: "0.7rem", color: "var(--text-color)", opacity: 0.45, fontStyle: "italic",
                padding: "0.2rem 0.85rem", borderRadius: "99px",
                background: "color-mix(in srgb, var(--outline) 15%, transparent)",
            }}>
                {msg.text}
            </span>
        </div>
    );
}

function ChatMessage({ msg, isOwn, isAdmin, isEditorUser, onDelete, onGrant, onRevoke }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: isOwn ? "flex-end" : "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexDirection: isOwn ? "row-reverse" : "row" }}>
                <Avatar name={msg.username} size={5} />
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-text)", opacity: 0.85 }}>{msg.username}</span>
                {isEditorUser && (
                    <span style={{
                        fontSize: "0.58rem", background: "var(--primary)", color: "rgba(255,237,213,0.95)",
                        padding: "0.1rem 0.4rem", borderRadius: "4px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                    }}>Editor</span>
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
                <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ display: "flex", gap: "0.2rem" }}>
                    {isAdmin && !isEditorUser && (
                        <button onClick={() => onGrant(msg.userId)} title="Grant editor" style={actionBtn}>
                            <ShieldPlus size={13} />
                        </button>
                    )}
                    {isAdmin && isEditorUser && (
                        <button onClick={() => onRevoke(msg.userId)} title="Revoke editor" style={{ ...actionBtn, color: "rgba(248,113,113,0.8)" }}>
                            <ShieldMinus size={13} />
                        </button>
                    )}
                    {(isOwn || isAdmin) && (
                        <button onClick={() => onDelete(msg.id)} title="Delete" style={{ ...actionBtn, color: "rgba(248,113,113,0.8)" }}>
                            <Trash2 size={13} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const actionBtn = {
    background: "color-mix(in srgb, var(--outline) 20%, transparent)",
    border: "none", cursor: "pointer", color: "var(--text-color)",
    borderRadius: "6px", padding: "0.25rem", display: "flex", alignItems: "center",
};

export default function GameChat() {
    const { gameData } = useRouteLoaderData("main");
    const { user, isAuthenticated } = useAuth();
    const isAdmin = user?.role === "ADMIN";
    const gameId = gameData?.id;

    const { editors, isGameEditor, grantEditor, revokeEditor } = useGameEditors(gameId);
    const editorIds = new Set(editors.map((e) => e.id));

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const isAtBottom = useRef(true);

    function scrollToBottom(smooth = true) {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "instant" });
    }

    const fetchMessages = useCallback(async (silent = false) => {
        if (!gameId) return;
        if (!silent) setLoading(true);
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/chat?limit=100`, { credentials: "include" });
            if (res.ok) setMessages(await res.json());
        } finally {
            if (!silent) setLoading(false);
        }
    }, [gameId]);

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

    function handleScroll(e) {
        const el = e.currentTarget;
        isAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    }

    async function handleSend(e) {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || sending) return;
        setSending(true);
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ text: trimmed }),
            });
            if (res.ok) {
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
        const res = await fetch(`${currentAPI}/games/${gameId}/chat/${msgId}`, { method: "DELETE", credentials: "include" });
        if (res.ok) setMessages((prev) => prev.filter((m) => m.id !== msgId));
    }

    async function handleGrant(userId) {
        try { await grantEditor(userId); await fetchMessages(true); } catch {}
    }
    async function handleRevoke(userId) {
        try { await revokeEditor(userId); await fetchMessages(true); } catch {}
    }

    if (!gameData) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "16rem", color: "var(--text-color)" }}>
            No game selected.
        </div>
    );

    return (
        <div className="gc-chat-container" style={{
            display: "flex", flexDirection: "column",
            maxWidth: "42rem", margin: "0 auto", width: "100%",
            background: "color-mix(in srgb, var(--surface-background) 60%, transparent)",
            border: "1px solid color-mix(in srgb, var(--outline) 30%, transparent)",
            borderRadius: "16px", overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}>
            {/* Header */}
            <div style={{
                padding: "1rem 1.25rem 0.85rem",
                borderBottom: "1px solid color-mix(in srgb, var(--outline) 25%, transparent)",
                background: "color-mix(in srgb, var(--accent) 40%, transparent)",
                backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", gap: "0.75rem",
            }}>
                <div style={{
                    width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                    background: "color-mix(in srgb, var(--primary) 25%, var(--accent))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid color-mix(in srgb, var(--outline) 30%, transparent)",
                }}>
                    <MessageSquare size={16} style={{ color: "var(--primary)", opacity: 0.9 }} />
                </div>
                <div>
                    <h1 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent-text)", margin: 0, lineHeight: 1.2 }}>
                        {gameData.title} Chat
                    </h1>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-color)", opacity: 0.5, margin: 0, marginTop: "0.1rem" }}>
                        {isGameEditor ? "You have editor access." : "Ask an admin to become a game editor."}
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
                        <MessageSquare size={32} style={{ color: "var(--text-color)" }} />
                        <span style={{ fontSize: "0.82rem", color: "var(--text-color)", fontStyle: "italic" }}>No messages yet. Say hi!</span>
                    </div>
                )}
                {messages.map((msg) =>
                    msg.type === "message" ? (
                        <ChatMessage key={msg.id} msg={msg}
                            isOwn={user?.id === msg.userId} isAdmin={isAdmin}
                            isEditorUser={editorIds.has(msg.userId)}
                            onDelete={handleDelete} onGrant={handleGrant} onRevoke={handleRevoke}
                        />
                    ) : (
                        <SystemMessage key={msg.id} msg={msg} />
                    )
                )}
            </div>

            {/* Input */}
            <div style={{
                padding: "0.75rem 1rem",
                borderTop: "1px solid color-mix(in srgb, var(--outline) 20%, transparent)",
                background: "color-mix(in srgb, var(--accent) 30%, transparent)",
                backdropFilter: "blur(8px)",
            }}>
                {isAuthenticated ? (
                    <form onSubmit={handleSend} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type a message…"
                            maxLength={500}
                            style={{
                                flex: 1, padding: "0.55rem 0.9rem", borderRadius: "10px", fontSize: "0.85rem",
                                background: "color-mix(in srgb, var(--surface-background) 70%, transparent)",
                                color: "var(--accent-text)", outline: "none",
                                border: "1px solid color-mix(in srgb, var(--outline) 30%, transparent)",
                                transition: "border-color 0.15s",
                            }}
                            onFocus={e => e.target.style.borderColor = "color-mix(in srgb, var(--primary) 60%, transparent)"}
                            onBlur={e => e.target.style.borderColor = "color-mix(in srgb, var(--outline) 30%, transparent)"}
                        />
                        <button type="submit" disabled={!text.trim() || sending} style={{
                            padding: "0.55rem 0.85rem", borderRadius: "10px", border: "none", cursor: "pointer",
                            background: "var(--primary)", color: "rgba(255,244,230,0.97)",
                            opacity: !text.trim() || sending ? 0.4 : 1,
                            transition: "opacity 0.15s, transform 0.1s",
                            display: "flex", alignItems: "center",
                        }}
                            onMouseEnter={e => { if (text.trim() && !sending) e.currentTarget.style.opacity = "0.82"; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = !text.trim() || sending ? "0.4" : "1"; }}
                        >
                            <Send size={15} />
                        </button>
                    </form>
                ) : (
                    <p style={{ fontSize: "0.82rem", color: "var(--text-color)", textAlign: "center", margin: 0 }}>
                        <Link to="/login" style={{ fontWeight: 700, color: "var(--accent-text)", textDecoration: "underline" }}>Log in</Link>{" "}
                        to join the conversation.
                    </p>
                )}
            </div>
        </div>
    );
}
