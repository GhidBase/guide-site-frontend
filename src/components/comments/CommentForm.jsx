import { useState } from "react";

export default function CommentForm({
    onSubmit,
    placeholder = "Write a comment...",
    buttonText = "Post",
    onCancel = null,
    initialText = "",
}) {
    const [text, setText] = useState(initialText);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!text.trim()) return;
        setSubmitting(true);
        await onSubmit(text.trim());
        if (!initialText) setText("");
        setSubmitting(false);
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border-2 border-(--outline) bg-(--accent) text-(--accent-text) resize-none text-sm focus:outline-none focus:border-(--primary) transition-colors"
            />
            <div className="flex gap-2 justify-end">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-3 py-1.5 text-sm rounded-lg border-2 border-(--outline) text-(--text-color) hover:opacity-80 cursor-pointer transition-opacity"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={!text.trim() || submitting}
                    className="px-4 py-1.5 text-sm rounded-lg bg-(--primary) text-amber-50 font-semibold hover:opacity-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                    {submitting ? "Posting..." : buttonText}
                </button>
            </div>
        </form>
    );
}
