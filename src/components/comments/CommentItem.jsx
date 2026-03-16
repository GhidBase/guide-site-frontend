import { useState } from "react";
import { ThumbsUp, Reply, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import CommentForm from "./CommentForm";

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
    return `${Math.floor(diff / 31536000)}y ago`;
}

export default function CommentItem({
    comment,
    currentUser,
    isAdmin,
    onUpvote,
    onReply,
    onEdit,
    onDelete,
    isReply = false,
}) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [editing, setEditing] = useState(false);
    const [showReplies, setShowReplies] = useState(true);

    const isOwn = currentUser?.id === comment.userId;
    const canModify = isOwn || isAdmin;

    async function handleEdit(text) {
        await onEdit(comment.id, text);
        setEditing(false);
    }

    async function handleReply(text) {
        await onReply(comment.id, text);
        setShowReplyForm(false);
        setShowReplies(true);
    }

    return (
        <div className={isReply ? "ml-4 sm:ml-8 pl-3 border-l-2 border-(--outline)/40" : ""}>
            <div className="bg-(--accent) rounded-lg px-4 py-3">
                {/* Header */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-sm text-(--accent-text)">
                        {comment.username}
                    </span>
                    <span className="text-xs text-(--text-color) opacity-60">
                        {timeAgo(comment.createdAt)}
                    </span>
                    {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                        <span className="text-xs text-(--text-color) opacity-40 italic">
                            (edited)
                        </span>
                    )}
                </div>

                {/* Body */}
                {editing ? (
                    <CommentForm
                        onSubmit={handleEdit}
                        placeholder="Edit your comment..."
                        buttonText="Save"
                        onCancel={() => setEditing(false)}
                        initialText={comment.text}
                    />
                ) : (
                    <p className="text-sm text-(--accent-text) whitespace-pre-wrap break-words leading-relaxed">
                        {comment.text}
                    </p>
                )}

                {/* Actions */}
                {!editing && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {/* Upvote */}
                        <button
                            onClick={() => onUpvote(comment.id)}
                            disabled={!currentUser}
                            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors cursor-pointer
                                ${comment.hasUpvoted
                                    ? "bg-(--primary) text-amber-50"
                                    : "text-(--text-color) hover:bg-(--outline)/20"
                                }
                                disabled:opacity-40 disabled:cursor-not-allowed`}
                            title={currentUser ? "Upvote" : "Log in to upvote"}
                        >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            {comment.upvoteCount > 0 && <span>{comment.upvoteCount}</span>}
                        </button>

                        {/* Reply — top-level only */}
                        {!isReply && currentUser && (
                            <button
                                onClick={() => setShowReplyForm(!showReplyForm)}
                                className="flex items-center gap-1.5 text-xs text-(--text-color) px-2 py-1 rounded-md hover:bg-(--outline)/20 cursor-pointer transition-colors"
                            >
                                <Reply className="w-3.5 h-3.5" />
                                Reply
                            </button>
                        )}

                        {/* Edit */}
                        {canModify && (
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-1.5 text-xs text-(--text-color) px-2 py-1 rounded-md hover:bg-(--outline)/20 cursor-pointer transition-colors"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                Edit
                            </button>
                        )}

                        {/* Delete */}
                        {canModify && (
                            <button
                                onClick={() => onDelete(comment.id)}
                                className="flex items-center gap-1.5 text-xs text-red-600 px-2 py-1 rounded-md hover:bg-red-100 cursor-pointer transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Reply form */}
            {showReplyForm && (
                <div className="mt-2 ml-4 sm:ml-8">
                    <CommentForm
                        onSubmit={handleReply}
                        placeholder={`Reply to ${comment.username}...`}
                        buttonText="Reply"
                        onCancel={() => setShowReplyForm(false)}
                    />
                </div>
            )}

            {/* Replies */}
            {!isReply && comment.replies?.length > 0 && (
                <div className="mt-2">
                    <button
                        onClick={() => setShowReplies(!showReplies)}
                        className="flex items-center gap-1 text-xs text-(--text-color) ml-2 mb-2 hover:opacity-80 cursor-pointer"
                    >
                        {showReplies
                            ? <ChevronUp className="w-3.5 h-3.5" />
                            : <ChevronDown className="w-3.5 h-3.5" />
                        }
                        {showReplies ? "Hide" : "Show"}{" "}
                        {comment.replies.length}{" "}
                        {comment.replies.length === 1 ? "reply" : "replies"}
                    </button>
                    {showReplies && (
                        <div className="flex flex-col gap-2">
                            {comment.replies.map((reply) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    currentUser={currentUser}
                                    isAdmin={isAdmin}
                                    onUpvote={onUpvote}
                                    onReply={onReply}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    isReply
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
