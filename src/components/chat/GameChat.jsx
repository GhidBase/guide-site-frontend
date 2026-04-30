import { useState, useEffect, useRef, useCallback } from "react";
import { useRouteLoaderData, Link } from "react-router";
import { Send, Trash2, ShieldPlus, ShieldMinus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { currentAPI } from "@/config/api";
import { useGameEditors } from "../../hooks/useGameEditors.js";
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

function SystemMessage({ msg }) {
    return (
        <div className="flex justify-center py-1">
            <span className="text-xs text-(--text-color) opacity-50 italic px-3 py-1 rounded-full bg-(--outline)/10">
                {msg.text}
            </span>
        </div>
    );
}

function ChatMessage({ msg, isOwn, isAdmin, isEditorUser, onDelete, onGrant, onRevoke }) {
    return (
        <div className={`flex flex-col gap-0.5 ${isOwn ? "items-end" : "items-start"}`}>
            <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-(--accent-text)">{msg.username}</span>
                {isEditorUser && (
                    <span className="text-[0.6rem] bg-(--primary) text-amber-50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Editor</span>
                )}
                <span className="text-xs text-(--text-color) opacity-40">{timeAgo(msg.createdAt)}</span>
            </div>
            <div className={`group flex items-end gap-1.5 ${isOwn ? "flex-row-reverse" : ""}`}>
                <div
                    className={`max-w-xs sm:max-w-md px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words leading-relaxed
                        ${isOwn
                            ? "bg-(--primary) text-amber-50 rounded-br-sm"
                            : "bg-(--accent) text-(--accent-text) rounded-bl-sm"
                        }`}
                >
                    {msg.text}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isAdmin && !isEditorUser && (
                        <button
                            onClick={() => onGrant(msg.userId)}
                            title="Grant game editor"
                            className="p-1 rounded hover:bg-(--primary)/20 text-(--text-color) cursor-pointer"
                        >
                            <ShieldPlus className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {isAdmin && isEditorUser && (
                        <button
                            onClick={() => onRevoke(msg.userId)}
                            title="Revoke game editor"
                            className="p-1 rounded hover:bg-red-100 text-red-500 cursor-pointer"
                        >
                            <ShieldMinus className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {(isOwn || isAdmin) && (
                        <button
                            onClick={() => onDelete(msg.id)}
                            title="Delete message"
                            className="p-1 rounded hover:bg-red-100 text-red-400 cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function GameChat() {
    const { gameData } = useRouteLoaderData("main");
    const { user, isAuthenticated } = useAuth();
    const { darkMode } = useDarkMode();
    const isAdmin = user?.role === "ADMIN";
    const gameId = gameData?.id;

    const { editors, isGameEditor, grantEditor, revokeEditor } = useGameEditors(gameId);
    const editorIds = new Set(editors.map((e) => e.id));

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const isAtBottom = useRef(true);

    const fetchMessages = useCallback(async (silent = false) => {
        if (!gameId) return;
        if (!silent) setLoading(true);
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/chat?limit=100`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, [gameId]);

    useEffect(() => { fetchMessages(); }, [fetchMessages]);

    // Poll for new messages
    useEffect(() => {
        const id = setInterval(() => {
            if (isAtBottom.current) fetchMessages(true);
        }, POLL_INTERVAL);
        return () => clearInterval(id);
    }, [fetchMessages]);

    // Auto-scroll to bottom on new messages if already near bottom
    useEffect(() => {
        if (isAtBottom.current) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
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
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
            }
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    }

    async function handleDelete(msgId) {
        const res = await fetch(`${currentAPI}/games/${gameId}/chat/${msgId}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (res.ok) setMessages((prev) => prev.filter((m) => m.id !== msgId));
    }

    async function handleGrant(userId) {
        try {
            await grantEditor(userId);
            // Post system message optimistically
            await fetchMessages(true);
        } catch {}
    }

    async function handleRevoke(userId) {
        try {
            await revokeEditor(userId);
            await fetchMessages(true);
        } catch {}
    }

    if (!gameData) {
        return (
            <div className="flex items-center justify-center h-64 text-(--text-color)">
                No game selected.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-var(--sticky-header-height,64px)-2rem)] max-w-2xl mx-auto w-full">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b-2 border-(--outline)">
                <h1 className="text-lg font-bold text-(--accent-text)">{gameData.title} Chat</h1>
                <p className="text-xs text-(--text-color) opacity-60 mt-0.5">
                    {isGameEditor ? "You have editor access for this game." : "Ask an admin here to become a game editor."}
                </p>
            </div>

            {/* Messages */}
            <div
                className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
                onScroll={handleScroll}
            >
                {loading && (
                    <p className="text-sm text-(--text-color) opacity-50 italic text-center">Loading...</p>
                )}
                {!loading && messages.length === 0 && (
                    <p className="text-sm text-(--text-color) opacity-50 italic text-center">No messages yet. Say hi!</p>
                )}
                {messages.map((msg) =>
                    msg.type === "message" ? (
                        <ChatMessage
                            key={msg.id}
                            msg={msg}
                            isOwn={user?.id === msg.userId}
                            isAdmin={isAdmin}
                            isEditorUser={editorIds.has(msg.userId)}
                            onDelete={handleDelete}
                            onGrant={handleGrant}
                            onRevoke={handleRevoke}
                        />
                    ) : (
                        <SystemMessage key={msg.id} msg={msg} />
                    )
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t-2 border-(--outline)">
                {isAuthenticated ? (
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type a message..."
                            maxLength={500}
                            className="flex-1 px-3 py-2 rounded-lg text-sm bg-(--accent) text-(--accent-text) border border-(--outline)/40 outline-none focus:border-(--primary) placeholder:text-(--text-color) placeholder:opacity-40"
                        />
                        <button
                            type="submit"
                            disabled={!text.trim() || sending}
                            className="px-3 py-2 bg-(--primary) text-amber-50 rounded-lg disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                ) : (
                    <p className="text-sm text-(--text-color) text-center">
                        <Link to="/login" className="font-semibold text-(--accent-text) underline hover:opacity-80">Log in</Link>{" "}
                        to join the conversation.
                    </p>
                )}
            </div>
        </div>
    );
}
