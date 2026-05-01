import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { Send, Trash2, ArrowLeft, Inbox } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { currentAPI } from "@/config/api";
import { useDarkMode } from "../../contexts/ThemeProvider.jsx";

const POLL_INTERVAL = 5000;

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 2592000)}mo ago`;
}

function MessageBubble({ msg, isOwn, isAdmin, onDelete }) {
    return (
        <div className={`flex flex-col gap-0.5 ${isOwn ? "items-end" : "items-start"}`}>
            <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-(--accent-text)">{msg.senderUsername}</span>
                {msg.isFromAdmin && (
                    <span className="text-[0.6rem] bg-(--primary) text-amber-50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Admin</span>
                )}
                <span className="text-xs text-(--text-color) opacity-40">{timeAgo(msg.createdAt)}</span>
            </div>
            <div className={`group flex items-end gap-1.5 ${isOwn ? "flex-row-reverse" : ""}`}>
                <div className={`max-w-xs sm:max-w-md px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words leading-relaxed
                    ${isOwn ? "bg-(--primary) text-amber-50 rounded-br-sm" : "bg-(--accent) text-(--accent-text) rounded-bl-sm"}`}>
                    {msg.text}
                </div>
                {isAdmin && (
                    <button
                        onClick={() => onDelete(msg.id)}
                        title="Delete"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-red-400 cursor-pointer transition-opacity"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}

function ThreadView({ threadUserId, threadUsername, onBack, currentUser, isAdmin }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const isAtBottom = useRef(true);
    const cooldownRef = useRef(null);

    const url = isAdmin ? `${currentAPI}/dms/${threadUserId}` : `${currentAPI}/dms`;

    const fetchMessages = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await fetch(url, { credentials: "include" });
            if (res.ok) setMessages(await res.json());
        } finally {
            if (!silent) setLoading(false);
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
        if (isAtBottom.current) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
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
        <div className="flex flex-col h-full">
            <div className="px-4 pt-4 pb-3 border-b-2 border-(--outline) flex items-center gap-3">
                {onBack && (
                    <button onClick={onBack} className="p-1 rounded hover:opacity-60 cursor-pointer text-(--text-color)">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                )}
                <div>
                    <h2 className="text-base font-bold text-(--accent-text)">
                        {isAdmin ? threadUsername : "Messages with Admins"}
                    </h2>
                    <p className="text-xs text-(--text-color) opacity-50">
                        {isAdmin ? "Admin view" : "Private — visible to all admins"}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" onScroll={handleScroll}>
                {loading && <p className="text-sm text-(--text-color) opacity-50 italic text-center">Loading...</p>}
                {!loading && messages.length === 0 && (
                    <p className="text-sm text-(--text-color) opacity-50 italic text-center">No messages yet.</p>
                )}
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        msg={msg}
                        isOwn={msg.senderId === currentUser?.id}
                        isAdmin={isAdmin}
                        onDelete={handleDelete}
                    />
                ))}
                <div ref={bottomRef} />
            </div>

            <div className="px-4 pb-4 pt-2 border-t-2 border-(--outline)">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : "Type a message..."}
                        maxLength={500}
                        disabled={cooldown > 0}
                        className="flex-1 px-3 py-2 rounded-lg text-sm bg-(--accent) text-(--accent-text) border border-(--outline)/40 outline-none focus:border-(--primary) placeholder:text-(--text-color) placeholder:opacity-40 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!text.trim() || sending || cooldown > 0}
                        className="px-3 py-2 bg-(--primary) text-amber-50 rounded-lg disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
                {cooldown > 0 && (
                    <p className="text-xs text-(--text-color) opacity-50 mt-1">
                        You can send another message in {cooldown}s.
                    </p>
                )}
            </div>
        </div>
    );
}

function AdminInbox({ currentUser, onOpenThread }) {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchThreads() {
            setLoading(true);
            try {
                const res = await fetch(`${currentAPI}/dms`, { credentials: "include" });
                if (res.ok) setThreads(await res.json());
            } finally {
                setLoading(false);
            }
        }
        fetchThreads();
        const id = setInterval(fetchThreads, POLL_INTERVAL);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 pt-4 pb-3 border-b-2 border-(--outline)">
                <h1 className="text-lg font-bold text-(--accent-text) flex items-center gap-2">
                    <Inbox className="w-5 h-5" />
                    Messages
                </h1>
                <p className="text-xs text-(--text-color) opacity-50 mt-0.5">All user conversations</p>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading && <p className="text-sm text-(--text-color) opacity-50 italic p-4 text-center">Loading...</p>}
                {!loading && threads.length === 0 && (
                    <p className="text-sm text-(--text-color) opacity-50 italic p-4 text-center">No messages yet.</p>
                )}
                {threads.map((t) => (
                    <button
                        key={t.userId}
                        onClick={() => onOpenThread(t.userId, t.username)}
                        className="w-full text-left px-4 py-3 border-b border-(--outline)/30 hover:bg-(--accent) transition-colors flex flex-col gap-0.5"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-(--accent-text)">{t.username}</span>
                            <span className="text-xs text-(--text-color) opacity-40">{timeAgo(t.updatedAt)}</span>
                        </div>
                        {t.lastMessage && (
                            <span className="text-xs text-(--text-color) opacity-60 truncate">{t.lastMessage}</span>
                        )}
                        {t.unreadCount > 0 && (
                            <span className="text-xs bg-(--primary) text-amber-50 px-1.5 py-0.5 rounded-full w-fit font-semibold">{t.unreadCount} new</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function DMPage() {
    const { user, isAuthenticated } = useAuth();
    const { darkMode } = useDarkMode();
    const navigate = useNavigate();
    const isAdmin = user?.role === "ADMIN";

    const [activeThread, setActiveThread] = useState(null);

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center h-64 text-(--text-color) flex-col gap-2">
                <p>Please log in to view messages.</p>
                <button onClick={() => navigate("/login")} className="px-4 py-2 bg-(--primary) text-amber-50 rounded text-sm font-semibold cursor-pointer hover:opacity-90">
                    Log In
                </button>
            </div>
        );
    }

    const containerClass = "flex flex-col max-w-2xl mx-auto w-full h-[calc(100vh-var(--sticky-header-height,64px)-2rem)]";

    if (!isAdmin) {
        return (
            <div className={containerClass}>
                <ThreadView
                    threadUserId={user.id}
                    threadUsername={user.username}
                    onBack={null}
                    currentUser={user}
                    isAdmin={false}
                />
            </div>
        );
    }

    return (
        <div className={containerClass}>
            {activeThread ? (
                <ThreadView
                    threadUserId={activeThread.userId}
                    threadUsername={activeThread.username}
                    onBack={() => setActiveThread(null)}
                    currentUser={user}
                    isAdmin={true}
                />
            ) : (
                <AdminInbox
                    currentUser={user}
                    onOpenThread={(userId, username) => setActiveThread({ userId, username })}
                />
            )}
        </div>
    );
}
