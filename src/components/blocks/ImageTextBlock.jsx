import { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react";
import { Link, useRouteLoaderData } from "react-router";
import { ArrowUpRight, Pencil, Trash2, Plus, Check, X, Image } from "lucide-react";
import ImagePickerModal from "../ImagePickerModal.jsx";

// Content shape: { sectionLabel: string, cards: Card[] }
// Card shape: { id, title, description, imageUrl, linkUrl, linkText, accentColor }

function genId() {
    return Math.random().toString(36).slice(2, 10);
}

const DEFAULT_ACCENT = "#9b6a4e";

const CARD_FIELDS = [
    ["Title", "title", "text"],
    ["Description", "description", "textarea"],
    ["Link URL", "linkUrl", "text"],
    ["Link text", "linkText", "text"],
];

const ImageTextBlock = forwardRef(function ImageTextBlock(
    { block, adminMode, canDelete, deleteBlock, updateBlockContent, onDirty },
    ref
) {
    const [data, setData] = useState(() => {
        if (!block.content) return { sectionLabel: "", cards: [] };
        if (typeof block.content === "object") {
            // Legacy: backend incorrectly wrapped the JSON string in a richText envelope
            if (block.content.type === "richText" && typeof block.content.content === "string") {
                try { return JSON.parse(block.content.content); }
                catch { return { sectionLabel: "", cards: [] }; }
            }
            return block.content;
        }
        try { return JSON.parse(block.content); }
        catch { return { sectionLabel: "", cards: [] }; }
    });
    const [editing, setEditing] = useState(null);
    const [draft, setDraft] = useState(null);
    const [showPicker, setShowPicker] = useState(false);
    const cardRefs = useRef([]);
    const { gameData } = useRouteLoaderData("main");
    const gameId = gameData?.id;

    useImperativeHandle(ref, () => ({
        save: async () => {
            await updateBlockContent(block, data);
            onDirty?.(block.id, false);
        },
    }), [data]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.setAttribute("data-visible", "true");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08 }
        );
        cardRefs.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, [data.cards.length]);

    function startEdit(card) {
        setEditing(card.id);
        setDraft({ ...card });
    }

    function commitEdit() {
        setData(prev => ({
            ...prev,
            cards: prev.cards.map(c => c.id === draft.id ? { ...draft } : c),
        }));
        onDirty?.(block.id, true);
        setEditing(null);
        setDraft(null);
    }

    function cancelEdit() {
        // If it was a new (empty) card that was never filled in, remove it
        if (draft && !draft.title && data.cards.find(c => c.id === draft.id)?.title === "New card") {
            setData(prev => ({ ...prev, cards: prev.cards.filter(c => c.id !== draft.id) }));
        }
        setEditing(null);
        setDraft(null);
    }

    function addCard() {
        const card = {
            id: genId(),
            title: "New card",
            description: "",
            imageUrl: "",
            linkUrl: "",
            linkText: "Learn more",
            accentColor: DEFAULT_ACCENT,
        };
        setData(prev => ({ ...prev, cards: [...prev.cards, card] }));
        onDirty?.(block.id, true);
        setEditing(card.id);
        setDraft({ ...card });
    }

    function removeCard(id) {
        setData(prev => ({ ...prev, cards: prev.cards.filter(c => c.id !== id) }));
        onDirty?.(block.id, true);
    }

    const { cards = [], sectionLabel = "" } = data;

    return (
        <>
            <style>{`
                @keyframes itb-section-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .itb-section-label { animation: itb-section-in 0.6s ease 0.15s both; }
                .itb-card {
                    opacity: 0;
                    transform: translateY(48px) rotate(0.4deg);
                    transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1),
                                transform 0.9s cubic-bezier(0.16,1,0.3,1);
                    position: relative;
                }
                .itb-card[data-visible="true"] {
                    opacity: 1;
                    transform: translateY(0) rotate(0deg);
                }
                .itb-card-inner {
                    transition: transform 0.5s cubic-bezier(0.16,1,0.3,1),
                                box-shadow 0.5s cubic-bezier(0.16,1,0.3,1);
                }
                .itb-card:hover .itb-card-inner { transform: translateY(-5px); }
                .itb-img { transition: transform 0.8s cubic-bezier(0.16,1,0.3,1); }
                .itb-card:hover .itb-img { transform: scale(1.06); }
                .itb-title { transition: color 0.3s ease; }
                .itb-card:hover .itb-title { color: #ffffff; }
                .itb-accent-bar {
                    width: 0;
                    transition: width 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s;
                }
                .itb-card[data-visible="true"] .itb-accent-bar { width: 2.5rem; }
                .itb-link {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }
                .itb-link::after {
                    content: '';
                    position: absolute;
                    bottom: -1px; left: 0;
                    width: 0; height: 1px;
                    background: currentColor;
                    transition: width 0.3s ease;
                }
                .itb-card:hover .itb-link::after { width: 100%; }
                @media (max-width: 640px) {
                    .itb-card-inner { flex-direction: column !important; min-height: unset !important; }
                    .itb-img-panel { width: 100% !important; height: 200px !important; }
                    .itb-card-text { padding: 1.5rem !important; }
                }
            `}</style>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "0.5rem 0" }}>
                {/* Section label */}
                {(sectionLabel || adminMode) && (
                    <div className="itb-section-label" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        {adminMode ? (
                            <input
                                value={sectionLabel}
                                onChange={e => { setData(p => ({ ...p, sectionLabel: e.target.value })); onDirty?.(block.id, true); }}
                                placeholder="Section label (optional)"
                                style={{
                                    background: "transparent",
                                    border: "1px dashed rgba(232,213,183,0.2)",
                                    borderRadius: "4px",
                                    color: "inherit",
                                    padding: "0.2rem 0.5rem",
                                    fontSize: "0.65rem",
                                    letterSpacing: "0.2em",
                                    textTransform: "uppercase",
                                    width: "220px",
                                    fontFamily: "inherit",
                                }}
                            />
                        ) : (
                            <span style={{ fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.35, whiteSpace: "nowrap" }}>
                                {sectionLabel}
                            </span>
                        )}
                        <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, rgba(232,213,183,0.12), transparent)" }} />
                    </div>
                )}

                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {cards.map((card, i) => {
                        const isEven = i % 2 === 0;
                        const accent = card.accentColor || DEFAULT_ACCENT;
                        const isEditing = editing === card.id;

                        return (
                            <div
                                key={card.id}
                                ref={el => (cardRefs.current[i] = el)}
                                className="itb-card"
                                style={{ transitionDelay: `${i * 0.05}s` }}
                            >
                                {/* Edit overlay */}
                                {adminMode && isEditing && draft && (
                                    <div style={{
                                        position: "absolute", inset: 0, zIndex: 20,
                                        background: "rgba(10,8,6,0.96)",
                                        borderRadius: "12px",
                                        padding: "1.25rem",
                                        display: "flex", flexDirection: "column", gap: "0.6rem",
                                        border: `1px solid ${accent}50`,
                                        overflowY: "auto",
                                    }}>
                                        <p style={{ fontWeight: 600, fontSize: "0.85rem", margin: 0, color: "#e8d5b7" }}>Edit card</p>
                                        {CARD_FIELDS.map(([label, key, type]) => (
                                            <div key={key} style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                                <label style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.4, color: "#e8d5b7" }}>{label}</label>
                                                {type === "textarea" ? (
                                                    <textarea
                                                        value={draft[key] ?? ""}
                                                        onChange={e => setDraft(p => ({ ...p, [key]: e.target.value }))}
                                                        rows={3}
                                                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(232,213,183,0.15)", borderRadius: "5px", color: "#e8d5b7", padding: "0.4rem 0.6rem", fontSize: "0.82rem", resize: "vertical", fontFamily: "inherit", width: "100%", boxSizing: "border-box" }}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={draft[key] ?? ""}
                                                        onChange={e => setDraft(p => ({ ...p, [key]: e.target.value }))}
                                                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(232,213,183,0.15)", borderRadius: "5px", color: "#e8d5b7", padding: "0.4rem 0.6rem", fontSize: "0.82rem", fontFamily: "inherit", width: "100%", boxSizing: "border-box" }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                            <label style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.4, color: "#e8d5b7" }}>Image</label>
                                            <div style={{ display: "flex", gap: "0.4rem" }}>
                                                <input
                                                    type="text"
                                                    value={draft.imageUrl ?? ""}
                                                    onChange={e => setDraft(p => ({ ...p, imageUrl: e.target.value }))}
                                                    placeholder="Paste URL or choose from pool"
                                                    style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(232,213,183,0.15)", borderRadius: "5px", color: "#e8d5b7", padding: "0.4rem 0.6rem", fontSize: "0.82rem", fontFamily: "inherit", boxSizing: "border-box" }}
                                                />
                                                <button
                                                    onClick={() => setShowPicker(true)}
                                                    style={{ background: "rgba(155,106,78,0.2)", border: "1px solid rgba(155,106,78,0.4)", color: "#e8d5b7", borderRadius: "5px", padding: "0.4rem 0.6rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", whiteSpace: "nowrap" }}
                                                >
                                                    <Image size={12} /> Pool
                                                </button>
                                            </div>
                                            {draft.imageUrl && (
                                                <img src={draft.imageUrl} alt="" style={{ width: "100%", maxHeight: "100px", objectFit: "cover", borderRadius: "4px", marginTop: "0.25rem" }} />
                                            )}
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                            <label style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.4, color: "#e8d5b7" }}>Accent color</label>
                                            <input
                                                type="color"
                                                value={draft.accentColor || DEFAULT_ACCENT}
                                                onChange={e => setDraft(p => ({ ...p, accentColor: e.target.value }))}
                                                style={{ height: "30px", width: "56px", border: "none", background: "none", cursor: "pointer", padding: 0 }}
                                            />
                                        </div>
                                        <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.25rem" }}>
                                            <button onClick={commitEdit} style={{ background: "rgba(100,200,100,0.15)", border: "1px solid rgba(100,200,100,0.3)", color: "#a0e0a0", borderRadius: "6px", padding: "0.35rem 0.65rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem" }}>
                                                <Check size={12} /> Apply
                                            </button>
                                            <button onClick={cancelEdit} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(232,213,183,0.5)", borderRadius: "6px", padding: "0.35rem 0.65rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem" }}>
                                                <X size={12} /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Admin buttons (not editing) */}
                                {adminMode && !isEditing && (
                                    <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem", zIndex: 10, display: "flex", gap: "0.35rem" }}>
                                        <button onClick={() => startEdit(card)} style={{ background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.15)", color: "#e8d5b7", borderRadius: "5px", padding: "0.3rem 0.45rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                            <Pencil size={11} />
                                        </button>
                                        <button onClick={() => removeCard(card.id)} style={{ background: "rgba(200,50,50,0.2)", border: "1px solid rgba(200,50,50,0.3)", color: "#f08080", borderRadius: "5px", padding: "0.3rem 0.45rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                            <Trash2 size={11} />
                                        </button>
                                    </div>
                                )}

                                {/* Card */}
                                <div
                                    className="itb-card-inner"
                                    style={{
                                        display: "flex",
                                        flexDirection: isEven ? "row" : "row-reverse",
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                        boxShadow: "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
                                        minHeight: "260px",
                                        border: "1px solid rgba(232,213,183,0.07)",
                                        background: "#0a0806",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${accent}28, inset 0 1px 0 rgba(255,255,255,0.05)`; }}
                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)"; }}
                                >
                                    {card.imageUrl && (
                                        <div className="itb-img-panel" style={{ width: "42%", flexShrink: 0, overflow: "hidden", position: "relative" }}>
                                            <img
                                                src={card.imageUrl}
                                                alt={card.title}
                                                className="itb-img"
                                                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                                            />
                                            <div style={{
                                                position: "absolute", inset: 0,
                                                background: isEven
                                                    ? "linear-gradient(to right, transparent 65%, rgba(10,8,6,0.4))"
                                                    : "linear-gradient(to left, transparent 65%, rgba(10,8,6,0.4))",
                                                pointerEvents: "none",
                                            }} />
                                        </div>
                                    )}

                                    <div className="itb-card-text" style={{
                                        flex: 1,
                                        background: `linear-gradient(135deg, ${accent}14 0%, #0e0b08 50%, #0a0806 100%)`,
                                        borderLeft: isEven ? `3px solid ${accent}` : "none",
                                        borderRight: !isEven ? `3px solid ${accent}` : "none",
                                        padding: "2.5rem",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        gap: "1rem",
                                        boxSizing: "border-box",
                                        position: "relative",
                                        overflow: "hidden",
                                        color: "#e8d5b7",
                                        fontFamily: "'Outfit', sans-serif",
                                    }}>
                                        <div style={{ position: "absolute", [isEven ? "left" : "right"]: "-30px", top: "-30px", width: "160px", height: "160px", background: `radial-gradient(circle, ${accent}1a 0%, transparent 70%)`, pointerEvents: "none" }} />

                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", position: "relative" }}>
                                            <div className="itb-accent-bar" style={{ height: "2px", background: accent, borderRadius: "2px", flexShrink: 0 }} />
                                            <span style={{ fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.35 }}>
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                        </div>

                                        <h2 className="itb-title" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", color: "#f5ede0", margin: 0, position: "relative" }}>
                                            {card.title}
                                        </h2>

                                        {card.description && (
                                            <p style={{ fontSize: "0.875rem", lineHeight: 1.75, color: "rgba(232,213,183,0.52)", maxWidth: "48ch", margin: 0, position: "relative" }}>
                                                {card.description}
                                            </p>
                                        )}

                                        {card.linkUrl && (
                                            <Link
                                                to={card.linkUrl}
                                                className="itb-link"
                                                style={{ color: accent, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.05em", textDecoration: "none", marginTop: "0.25rem", width: "fit-content", position: "relative" }}
                                            >
                                                {card.linkText || "Learn more"}
                                                <ArrowUpRight size={13} />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {showPicker && (
                    <ImagePickerModal
                        gameId={gameId}
                        onSelect={(url) => { setDraft(p => ({ ...p, imageUrl: url })); setShowPicker(false); }}
                        onClose={() => setShowPicker(false)}
                    />
                )}

                {/* Admin footer */}
                {adminMode && (
                    <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", paddingTop: "0.25rem" }}>
                        <button
                            onClick={addCard}
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(232,213,183,0.2)", color: "rgba(232,213,183,0.6)", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem" }}
                        >
                            <Plus size={13} /> Add card
                        </button>
                        {canDelete && (
                            <button
                                onClick={deleteBlock}
                                style={{ background: "rgba(200,50,50,0.1)", border: "1px solid rgba(200,50,50,0.25)", color: "#f08080", borderRadius: "8px", padding: "0.5rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem" }}
                            >
                                <Trash2 size={12} /> Delete block
                            </button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
});

export default ImageTextBlock;
