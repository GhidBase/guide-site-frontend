import { forwardRef, useImperativeHandle, useState } from "react";
import { Check, X, Pencil, Trash2 } from "lucide-react";

const EMPTY = { title: "", subtitle: "", backgroundUrl: "", accentColor: "#9b6a4e" };

function parse(content) {
    if (!content) return { ...EMPTY };
    if (typeof content === "object") {
        // Legacy: backend incorrectly wrapped the JSON string in a richText envelope
        if (content.type === "richText" && typeof content.content === "string") {
            try { return { ...EMPTY, ...JSON.parse(content.content) }; }
            catch { return { ...EMPTY }; }
        }
        return { ...EMPTY, ...content };
    }
    try { return { ...EMPTY, ...JSON.parse(content) }; }
    catch { return { ...EMPTY }; }
}

const HeroTextBlock = forwardRef(function HeroTextBlock(
    { block, adminMode, canDelete, deleteBlock, updateBlockContent, onDirty },
    ref,
) {
    const [data, setData] = useState(() => parse(block.content));
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState({ ...EMPTY });

    useImperativeHandle(ref, () => ({
        save: async () => {
            await updateBlockContent(block, data);
            onDirty?.(block.id, false);
        },
    }), [data]);

    function startEdit() {
        setDraft({ ...data });
        setEditing(true);
    }

    function commit() {
        setData({ ...draft });
        onDirty?.(block.id, true);
        setEditing(false);
    }

    const { title, subtitle, backgroundUrl, accentColor } = data;

    return (
        <div className="relative my-2">
            {/* Admin controls */}
            {adminMode && !editing && (
                <div className="flex items-center gap-2 mb-2">
                    <button
                        onClick={startEdit}
                        className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-(--outline-brown)/40 bg-(--accent) text-(--text-color) cursor-pointer hover:bg-(--surface-background)"
                    >
                        <Pencil size={11} /> Edit
                    </button>
                    {canDelete && (
                        <button
                            onClick={deleteBlock}
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-red-500/30 bg-red-900/20 text-red-300 cursor-pointer hover:bg-red-900/40"
                        >
                            <Trash2 size={11} /> Delete
                        </button>
                    )}
                </div>
            )}

            {/* Inline edit form */}
            {editing && (
                <div className="mb-4 p-4 rounded-lg border border-(--outline-brown)/40 bg-(--accent) flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs uppercase tracking-widest opacity-50 text-(--text-color)">Title</label>
                        <input
                            value={draft.title}
                            onChange={e => setDraft(p => ({ ...p, title: e.target.value }))}
                            className="px-3 py-1.5 rounded border border-(--outline-brown)/30 bg-(--surface-background) text-(--text-color) text-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs uppercase tracking-widest opacity-50 text-(--text-color)">Subtitle</label>
                        <textarea
                            value={draft.subtitle}
                            onChange={e => setDraft(p => ({ ...p, subtitle: e.target.value }))}
                            rows={2}
                            className="px-3 py-1.5 rounded border border-(--outline-brown)/30 bg-(--surface-background) text-(--text-color) text-sm resize-y"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs uppercase tracking-widest opacity-50 text-(--text-color)">Background image URL (optional)</label>
                        <input
                            value={draft.backgroundUrl}
                            onChange={e => setDraft(p => ({ ...p, backgroundUrl: e.target.value }))}
                            className="px-3 py-1.5 rounded border border-(--outline-brown)/30 bg-(--surface-background) text-(--text-color) text-sm font-mono"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs uppercase tracking-widest opacity-50 text-(--text-color)">Accent color</label>
                        <input
                            type="color"
                            value={draft.accentColor}
                            onChange={e => setDraft(p => ({ ...p, accentColor: e.target.value }))}
                            className="h-8 w-14 border-none cursor-pointer p-0 bg-transparent"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={commit}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded border border-green-500/30 bg-green-900/20 text-green-300 cursor-pointer hover:bg-green-900/40"
                        >
                            <Check size={12} /> Apply
                        </button>
                        <button
                            onClick={() => setEditing(false)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded border border-(--outline-brown)/30 bg-(--accent) text-(--text-color) opacity-60 cursor-pointer hover:opacity-100"
                        >
                            <X size={12} /> Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Render */}
            <div
                className="relative flex flex-col items-center justify-center text-center rounded-xl overflow-hidden py-20 px-8 min-h-48"
                style={{
                    background: backgroundUrl
                        ? `linear-gradient(to bottom, rgba(10,8,6,0.5), rgba(10,8,6,0.8)), url(${backgroundUrl}) center/cover no-repeat`
                        : `linear-gradient(135deg, ${accentColor}22 0%, #0e0b08 60%, #0a0806 100%)`,
                    borderBottom: `3px solid ${accentColor}`,
                    color: "#e8d5b7",
                    fontFamily: "'Outfit', sans-serif",
                }}
            >
                {title && (
                    <h1
                        className="m-0 font-black leading-none tracking-tight"
                        style={{
                            fontSize: "clamp(3rem, 10vw, 7rem)",
                            letterSpacing: "-0.04em",
                            color: "#f5ede0",
                            textShadow: `0 4px 60px ${accentColor}44`,
                        }}
                    >
                        {title}
                    </h1>
                )}
                {subtitle && (
                    <p
                        className="mt-4 mb-0 max-w-prose leading-relaxed"
                        style={{ fontSize: "1rem", color: "rgba(232,213,183,0.6)" }}
                    >
                        {subtitle}
                    </p>
                )}
                {!title && !subtitle && adminMode && (
                    <span className="opacity-30 text-sm">Empty hero block — click Edit to add content</span>
                )}
            </div>
        </div>
    );
});

export default HeroTextBlock;
