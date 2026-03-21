import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { currentAPI } from "../../config/api";
import { Check, X, Pencil, Trash2 } from "lucide-react";

const HeroTextBlock = forwardRef(function HeroTextBlock(
    { block, adminMode, canDelete, deleteBlock, updateBlockContent, onDirty },
    ref
) {
    const [games, setGames] = useState([]);
    const [overrides, setOverrides] = useState(() => {
        try { return block.content ? JSON.parse(block.content) : {}; }
        catch { return {}; }
    });
    const [editing, setEditing] = useState(null); // game.slug
    const [draft, setDraft] = useState({ description: "", imageUrl: "" });
    const [gameImages, setGameImages] = useState([]);

    useImperativeHandle(ref, () => ({
        save: async () => {
            await updateBlockContent(block, JSON.stringify(overrides));
            onDirty?.(block.id, false);
        },
    }), [overrides]);

    useEffect(() => {
        fetch(`${currentAPI}/games`)
            .then(r => r.ok ? r.json() : [])
            .then(data =>
                setGames(
                    data
                        .filter(g => g.isActive !== false)
                        .sort((a, b) => a.slug === "lucky-defense" ? -1 : b.slug === "lucky-defense" ? 1 : 0)
                )
            )
            .catch(() => {});
    }, []);

    async function startEdit(game) {
        setEditing(game.slug);
        setDraft({
            description: overrides[game.slug]?.description ?? "",
            imageUrl: overrides[game.slug]?.imageUrl ?? "",
        });
        try {
            const res = await fetch(`${currentAPI}/games/${game.id}/images`, { credentials: "include" });
            setGameImages(res.ok ? await res.json() : []);
        } catch { setGameImages([]); }
    }

    function commitEdit(slug) {
        setOverrides(prev => ({ ...prev, [slug]: { ...draft } }));
        onDirty?.(block.id, true);
        setEditing(null);
    }

    if (!adminMode) return null;

    return (
        <div style={{
            background: "rgba(10,8,6,0.6)",
            border: "1px solid rgba(232,213,183,0.1)",
            borderRadius: "12px",
            padding: "1.5rem",
            marginTop: "1rem",
            color: "#e8d5b7",
            fontFamily: "'Outfit', sans-serif",
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4 }}>
                    Hero Text Block
                </span>
                {canDelete && (
                    <button
                        onClick={deleteBlock}
                        style={{
                            background: "rgba(200,50,50,0.12)", border: "1px solid rgba(200,50,50,0.25)",
                            color: "#f08080", borderRadius: "6px", padding: "0.25rem 0.5rem",
                            cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem",
                        }}
                    >
                        <Trash2 size={12} /> Delete
                    </button>
                )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {games.map(game => {
                    const over = overrides[game.slug] ?? {};
                    const isEditing = editing === game.slug;

                    return (
                        <div
                            key={game.slug}
                            style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(232,213,183,0.08)",
                                borderRadius: "8px",
                                padding: "1rem",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isEditing ? "0.75rem" : 0 }}>
                                <div>
                                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{game.title}</span>
                                    {!isEditing && over.description && (
                                        <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", opacity: 0.4, maxWidth: "60ch", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {over.description}
                                        </p>
                                    )}
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={() => startEdit(game)}
                                        style={{
                                            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                                            color: "#e8d5b7", borderRadius: "6px", padding: "0.25rem 0.5rem",
                                            cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem",
                                        }}
                                    >
                                        <Pencil size={11} /> Edit
                                    </button>
                                )}
                            </div>

                            {isEditing && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                        <label style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.4 }}>Description</label>
                                        <textarea
                                            value={draft.description}
                                            onChange={e => setDraft(p => ({ ...p, description: e.target.value }))}
                                            rows={3}
                                            style={{
                                                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(232,213,183,0.15)",
                                                borderRadius: "6px", color: "#e8d5b7", padding: "0.5rem 0.75rem",
                                                fontSize: "0.85rem", resize: "vertical", fontFamily: "inherit", width: "100%", boxSizing: "border-box",
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                        <label style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.4 }}>Image</label>
                                        {draft.imageUrl && (
                                            <img src={draft.imageUrl} style={{ height: "80px", objectFit: "cover", borderRadius: "4px", marginBottom: "0.25rem" }} />
                                        )}
                                        {gameImages.length > 0 ? (
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "0.4rem", maxHeight: "160px", overflowY: "auto" }}>
                                                {gameImages.map(img => {
                                                    const url = img.url ?? img;
                                                    const selected = draft.imageUrl === url;
                                                    return (
                                                        <img
                                                            key={url} src={url}
                                                            onClick={() => setDraft(p => ({ ...p, imageUrl: url }))}
                                                            style={{
                                                                width: "100%", aspectRatio: "16/9", objectFit: "cover",
                                                                borderRadius: "4px", cursor: "pointer",
                                                                border: selected ? "2px solid #e8d5b7" : "2px solid transparent",
                                                                opacity: selected ? 1 : 0.55,
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p style={{ color: "rgba(232,213,183,0.3)", fontSize: "0.72rem", margin: 0 }}>No images in pool yet. Upload via the navigation panel.</p>
                                        )}
                                    </div>

                                    <div style={{ display: "flex", gap: "0.4rem" }}>
                                        <button
                                            onClick={() => commitEdit(game.slug)}
                                            style={{
                                                background: "rgba(100,200,100,0.15)", border: "1px solid rgba(100,200,100,0.3)",
                                                color: "#a0e0a0", borderRadius: "6px", padding: "0.35rem 0.65rem",
                                                cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem",
                                            }}
                                        >
                                            <Check size={12} /> Apply
                                        </button>
                                        <button
                                            onClick={() => setEditing(null)}
                                            style={{
                                                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                                                color: "rgba(232,213,183,0.5)", borderRadius: "6px", padding: "0.35rem 0.65rem",
                                                cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem",
                                            }}
                                        >
                                            <X size={12} /> Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default HeroTextBlock;
