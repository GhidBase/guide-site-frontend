import { useState, useEffect } from "react";
import { Link } from "react-router";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouteLoaderData } from "react-router";
import { currentAPI } from "@/config/api";
import CommentItem from "./comments/CommentItem";

export default function CommentOverview() {
    const { gameData, isLDG } = useRouteLoaderData("main");
    const gameId = gameData?.id;
    const gameSlug = gameData?.slug;
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";

    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!gameId) return;
        load();
    }, [gameId]);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/comments/all`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setComments(data);
        } catch {
            setError("Failed to load comments.");
        } finally {
            setLoading(false);
        }
    }

    async function handleReply(commentId, text) {
        const res = await fetch(`${currentAPI}/comments/${commentId}/replies`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ text }),
        });
        if (!res.ok) return;
        const reply = await res.json();
        setComments((prev) =>
            prev.map((c) =>
                c.id === commentId
                    ? { ...c, replies: [...(c.replies ?? []), reply] }
                    : c,
            ),
        );
    }

    async function handleEdit(commentId, text) {
        const res = await fetch(`${currentAPI}/comments/${commentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ text }),
        });
        if (!res.ok) return;
        const updated = await res.json();
        setComments((prev) =>
            prev.map((c) => {
                if (c.id === commentId) return { ...c, ...updated };
                return {
                    ...c,
                    replies: c.replies?.map((r) =>
                        r.id === commentId ? { ...r, ...updated } : r,
                    ),
                };
            }),
        );
    }

    async function handleDelete(commentId) {
        if (!window.confirm("Delete this comment?")) return;
        const res = await fetch(`${currentAPI}/comments/${commentId}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (!res.ok) return;
        setComments((prev) =>
            prev
                .filter((c) => c.id !== commentId)
                .map((c) => ({
                    ...c,
                    replies: c.replies?.filter((r) => r.id !== commentId),
                })),
        );
    }

    async function handleUpvote(commentId) {
        const res = await fetch(`${currentAPI}/comments/${commentId}/upvote`, {
            method: "POST",
            credentials: "include",
        });
        if (!res.ok) return;
        const { upvoteCount, hasUpvoted } = await res.json();
        setComments((prev) =>
            prev.map((c) => {
                if (c.id === commentId) return { ...c, upvoteCount, hasUpvoted };
                return {
                    ...c,
                    replies: c.replies?.map((r) =>
                        r.id === commentId ? { ...r, upvoteCount, hasUpvoted } : r,
                    ),
                };
            }),
        );
    }

    function pageLink(comment) {
        if (isLDG || !gameSlug) return `/${comment.pageSlug}`;
        return `/games/${gameSlug}/${comment.pageSlug}`;
    }

    if (!isAdmin) return null;

    return (
        <div
            style={{ viewTransitionName: "page-content" }}
            className="max-w-3xl mx-auto px-4 py-8"
        >
            <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-(--text-color)" />
                <h1 className="text-2xl font-bold text-(--accent-text)">
                    Comment Overview
                </h1>
                {!loading && (
                    <span className="text-sm opacity-50 text-(--text-color)">
                        ({comments.length})
                    </span>
                )}
            </div>

            {loading && (
                <p className="text-sm italic opacity-60 text-(--text-color)">
                    Loading...
                </p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!loading && !error && comments.length === 0 && (
                <p className="text-sm italic opacity-60 text-(--text-color)">
                    No comments yet.
                </p>
            )}

            <div className="flex flex-col gap-6">
                {comments.map((comment) => (
                    <div key={comment.id}>
                        <Link
                            to={pageLink(comment)}
                            className="text-xs font-semibold text-(--primary) hover:underline mb-1 block"
                        >
                            {comment.pageTitle}
                        </Link>
                        <CommentItem
                            comment={comment}
                            currentUser={user}
                            isAdmin={isAdmin}
                            onUpvote={handleUpvote}
                            onReply={handleReply}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
