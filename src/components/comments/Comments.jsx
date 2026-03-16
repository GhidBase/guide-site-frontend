import { useState, useEffect } from "react";
import { Link } from "react-router";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { currentAPI } from "@/config/api";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";

export default function Comments({ pageId }) {
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();
    const isAdmin = user?.role === "ADMIN";

    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const totalCount = comments.reduce(
        (sum, c) => sum + 1 + (c.replies?.length ?? 0),
        0,
    );

    useEffect(() => {
        if (!pageId) return;
        setLoading(true);
        setError(null);
        fetch(`${currentAPI}/pages/${pageId}/comments`, { credentials: "include" })
            .then((r) => {
                if (!r.ok) throw new Error();
                return r.json();
            })
            .then((data) => {
                setComments(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load comments.");
                setLoading(false);
            });
    }, [pageId]);

    async function handlePost(text) {
        const res = await fetch(`${currentAPI}/pages/${pageId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ text }),
        });
        if (!res.ok) return;
        const comment = await res.json();
        setComments((prev) => [...prev, { ...comment, replies: [] }]);
    }

    async function handleReply(commentId, text) {
        const res = await fetch(
            `${currentAPI}/comments/${commentId}/replies`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ text }),
            },
        );
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
        if (!isAuthenticated) return;
        const res = await fetch(
            `${currentAPI}/comments/${commentId}/upvote`,
            {
                method: "POST",
                credentials: "include",
            },
        );
        if (!res.ok) return;
        const { upvoteCount, hasUpvoted } = await res.json();
        setComments((prev) =>
            prev.map((c) => {
                if (c.id === commentId) return { ...c, upvoteCount, hasUpvoted };
                return {
                    ...c,
                    replies: c.replies?.map((r) =>
                        r.id === commentId
                            ? { ...r, upvoteCount, hasUpvoted }
                            : r,
                    ),
                };
            }),
        );
    }

    return (
        <div className="mt-8 border-t-4 border-(--outline) pt-6 pb-8 px-4 sm:px-8">
            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
                <MessageSquare className="w-5 h-5 text-(--text-color)" />
                <h2 className="text-xl font-bold text-(--accent-text)">
                    Comments{!loading && ` (${totalCount})`}
                </h2>
            </div>

            {/* New comment form / login prompt */}
            {!authLoading && (
                <div className="mb-6">
                    {isAuthenticated ? (
                        <CommentForm
                            onSubmit={handlePost}
                            placeholder="Share your thoughts..."
                        />
                    ) : (
                        <p className="px-4 py-3 rounded-lg border-2 border-(--outline) bg-(--accent) text-sm text-(--text-color)">
                            <Link
                                to="/login"
                                className="font-semibold text-(--accent-text) underline hover:opacity-80"
                            >
                                Log in
                            </Link>
                            {" or "}
                            <Link
                                to="/signup"
                                className="font-semibold text-(--accent-text) underline hover:opacity-80"
                            >
                                sign up
                            </Link>
                            {" to leave a comment."}
                        </p>
                    )}
                </div>
            )}

            {/* States */}
            {loading && (
                <p className="text-sm text-(--text-color) italic">
                    Loading comments...
                </p>
            )}
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
            {!loading && !error && comments.length === 0 && (
                <p className="text-sm text-(--text-color) italic">
                    No comments yet. Be the first!
                </p>
            )}

            {/* Comments list */}
            {!loading && !error && comments.length > 0 && (
                <div className="flex flex-col gap-4">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            currentUser={user}
                            isAdmin={isAdmin}
                            onUpvote={handleUpvote}
                            onReply={handleReply}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
