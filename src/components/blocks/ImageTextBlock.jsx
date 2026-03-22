import { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react";
import { Link, useRouteLoaderData, useNavigate } from "react-router";
import { ArrowUpRight, Trash2, Image } from "lucide-react";
import ImagePickerModal from "../ImagePickerModal.jsx";
import { useDarkMode } from "../../contexts/ThemeProvider.jsx";

// Content shape: { sectionLabel: string, cards: Card[] }
// Card shape: { id, title, description, imageUrl, imageSide, cardHeight, cardLinkUrl, linkUrl, linkText, accentColor }

function genId() {
    return Math.random().toString(36).slice(2, 10);
}

const DEFAULT_ACCENT = "#9b6a4e";

const ImageTextBlock = forwardRef(function ImageTextBlock(
    { block, adminMode, canDelete, deleteBlock, updateBlockContent, onDirty },
    ref
) {
    const DEFAULT_CARD = {
        id: genId(),
        title: "",
        description: "",
        imageUrl: "",
        imageSide: "auto",
        cardHeight: 260,
        cardLinkUrl: "",
        linkUrl: "",
        linkText: "Learn more",
        accentColor: DEFAULT_ACCENT,
    };

    const [data, setData] = useState(() => {
        const empty = { sectionLabel: "", cards: [DEFAULT_CARD] };
        if (!block.content) return empty;
        if (typeof block.content === "object") {
            if (block.content.type === "richText" && typeof block.content.content === "string") {
                try { return JSON.parse(block.content.content); }
                catch { return empty; }
            }
            return block.content;
        }
        try { return JSON.parse(block.content); }
        catch { return empty; }
    });

    const [showPicker, setShowPicker] = useState(false);
    const cardRefs = useRef([]);
    const { darkMode } = useDarkMode();
    const { gameData } = useRouteLoaderData("main");
    const gameId = gameData?.id;
    const navigate = useNavigate();

    useImperativeHandle(ref, () => ({
        save: async () => {
            await updateBlockContent(block, data);
            onDirty?.(block.id, false);
        },
    }), [data]);

    useEffect(() => {
        if (adminMode) return; // skip observer in edit mode
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
    }, [data.cards.length, adminMode]);

    function updateCard(id, patch) {
        setData(prev => ({
            ...prev,
            cards: prev.cards.map(c => c.id === id ? { ...c, ...patch } : c),
        }));
        onDirty?.(block.id, true);
    }

    const { cards = [], sectionLabel = "" } = data;

    // Which card is currently using the image picker
    const [pickerCardId, setPickerCardId] = useState(null);

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
                .itb-card[data-visible="true"],
                .itb-card[data-admin="true"] {
                    opacity: 1;
                    transform: translateY(0) rotate(0deg);
                }
                .itb-card-inner {
                    transition: transform 0.5s cubic-bezier(0.16,1,0.3,1),
                                box-shadow 0.5s cubic-bezier(0.16,1,0.3,1);
                }
                .itb-card:not([data-admin="true"]):hover .itb-card-inner { transform: translateY(-5px); }
                .itb-img { transition: transform 0.8s cubic-bezier(0.16,1,0.3,1); }
                .itb-card:not([data-admin="true"]):hover .itb-img { transform: scale(1.06); }
                .itb-title { transition: color 0.3s ease; }
                .itb-card:not([data-admin="true"]):hover .itb-title { color: #ffffff; }
                .itb-accent-bar {
                    width: 0;
                    transition: width 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s;
                }
                .itb-card[data-visible="true"] .itb-accent-bar,
                .itb-card[data-admin="true"] .itb-accent-bar { width: 2.5rem; }
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
                .itb-card:not([data-admin="true"]):hover .itb-link::after { width: 100%; }
                .itb-inline-input {
                    background: transparent;
                    border: none;
                    outline: none;
                    font-family: inherit;
                    color: inherit;
                    width: 100%;
                    padding: 0;
                    resize: none;
                }
                .itb-inline-input::placeholder { opacity: 0.3; }
                @media (max-width: 640px) {
                    .itb-card-inner {
                        flex-direction: column !important;
                        min-height: unset !important;
                    }
                    .itb-img-panel {
                        width: 100% !important;
                        height: 220px !important;
                    }
                    .itb-img-overlay {
                        background: linear-gradient(to bottom, transparent 45%, rgba(10,8,6,0.55)) !important;
                    }
                    .itb-card-text {
                        padding: 1.25rem 1.25rem 1.5rem !important;
                        border-left: none !important;
                        border-right: none !important;
                        border-top: 3px solid var(--itb-accent) !important;
                    }
                    .itb-card-text p {
                        max-width: 100% !important;
                    }
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
                            <span style={{ fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", opacity: darkMode ? 0.35 : 0.7, color: darkMode ? "inherit" : "#3a1f0d", whiteSpace: "nowrap" }}>
                                {sectionLabel}
                            </span>
                        )}
                        <div style={{ flex: 1, height: "1px", background: darkMode ? "linear-gradient(to right, rgba(232,213,183,0.12), transparent)" : "linear-gradient(to right, rgba(58,31,13,0.18), transparent)" }} />
                    </div>
                )}

                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: adminMode ? "2rem" : "1.5rem" }}>
                    {cards.map((card, i) => {
                        const isEven = i % 2 === 0;
                        const imageIsLeft = card.imageSide === "right" ? false : card.imageSide === "left" ? true : isEven;
                        const accent = card.accentColor || DEFAULT_ACCENT;
                        const isCardClickable = card.cardLinkUrl && !adminMode;

                        return (
                            <div
                                key={card.id}
                                ref={el => (cardRefs.current[i] = el)}
                                className="itb-card"
                                data-admin={adminMode ? "true" : undefined}
                                style={{ transitionDelay: `${i * 0.05}s`, "--itb-accent": accent }}
                            >
                                {/* Card */}
                                <div
                                    className="itb-card-inner"
                                    style={{
                                        display: "flex",
                                        flexDirection: imageIsLeft ? "row" : "row-reverse",
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                        boxShadow: "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
                                        minHeight: `${card.cardHeight ?? 260}px`,
                                        border: "1px solid rgba(232,213,183,0.07)",
                                        background: "#0a0806",
                                        cursor: isCardClickable ? "pointer" : "default",
                                    }}
                                    onClick={() => {
                                        if (!isCardClickable) return;
                                        const url = card.cardLinkUrl;
                                        if (url.startsWith("http://") || url.startsWith("https://")) {
                                            window.location.href = url;
                                        } else {
                                            navigate(url);
                                        }
                                    }}
                                    onMouseEnter={e => { if (!adminMode) e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${accent}28, inset 0 1px 0 rgba(255,255,255,0.05)`; }}
                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)"; }}
                                >
                                    {/* Image panel */}
                                    {(card.imageUrl || adminMode) && (
                                        <div className="itb-img-panel" style={{ width: "42%", flexShrink: 0, overflow: "hidden", position: "relative", alignSelf: "stretch", background: card.imageUrl ? undefined : "rgba(255,255,255,0.03)" }}>
                                            {card.imageUrl && (
                                                <img
                                                    src={card.imageUrl}
                                                    alt={card.title}
                                                    className="itb-img"
                                                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", opacity: 0, transition: "opacity 0.5s ease" }}
                                                    onLoad={e => { e.currentTarget.style.opacity = 1; }}
                                                />
                                            )}
                                            <div className="itb-img-overlay" style={{
                                                position: "absolute", inset: 0,
                                                background: imageIsLeft
                                                    ? "linear-gradient(to right, transparent 65%, rgba(10,8,6,0.4))"
                                                    : "linear-gradient(to left, transparent 65%, rgba(10,8,6,0.4))",
                                                pointerEvents: "none",
                                            }} />
                                            {adminMode && (
                                                <button
                                                    onClick={() => { setPickerCardId(card.id); setShowPicker(true); }}
                                                    style={{
                                                        position: "absolute", inset: 0, width: "100%", height: "100%",
                                                        background: card.imageUrl ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.15)",
                                                        border: "none", cursor: "pointer",
                                                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                                        gap: "0.4rem", color: "rgba(232,213,183,0.6)", fontSize: "0.75rem",
                                                        opacity: card.imageUrl ? 0 : 1,
                                                        transition: "opacity 0.2s",
                                                        zIndex: 2,
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
                                                    onMouseLeave={e => { e.currentTarget.style.opacity = card.imageUrl ? "0" : "1"; }}
                                                >
                                                    <Image size={20} />
                                                    {card.imageUrl ? "Change image" : "Add image"}
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Text panel */}
                                    <div className="itb-card-text" style={{
                                        flex: 1,
                                        background: `linear-gradient(135deg, ${accent}14 0%, #0e0b08 50%, #0a0806 100%)`,
                                        borderLeft: imageIsLeft ? `3px solid ${accent}` : "none",
                                        borderRight: !imageIsLeft ? `3px solid ${accent}` : "none",
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
                                        <div style={{ position: "absolute", [imageIsLeft ? "left" : "right"]: "-30px", top: "-30px", width: "160px", height: "160px", background: `radial-gradient(circle, ${accent}1a 0%, transparent 70%)`, pointerEvents: "none" }} />

                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", position: "relative" }}>
                                            <div className="itb-accent-bar" style={{ height: "2px", background: accent, borderRadius: "2px", flexShrink: 0 }} />
                                            <span style={{ fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.35 }}>
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        {adminMode ? (
                                            <input
                                                className="itb-inline-input itb-title"
                                                value={card.title}
                                                onChange={e => updateCard(card.id, { title: e.target.value })}
                                                placeholder="Title"
                                                style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", color: "#f5ede0", caretColor: accent }}
                                            />
                                        ) : (
                                            <h2 className="itb-title" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", color: "#f5ede0", margin: 0, position: "relative" }}>
                                                {card.title}
                                            </h2>
                                        )}

                                        {/* Description */}
                                        {adminMode ? (
                                            <textarea
                                                className="itb-inline-input"
                                                value={card.description}
                                                onChange={e => updateCard(card.id, { description: e.target.value })}
                                                placeholder="Description"
                                                rows={3}
                                                style={{ fontSize: "0.875rem", lineHeight: 1.75, color: "rgba(232,213,183,0.52)", caretColor: accent }}
                                            />
                                        ) : (
                                            card.description && (
                                                <p style={{ fontSize: "0.875rem", lineHeight: 1.75, color: "rgba(232,213,183,0.52)", maxWidth: "48ch", margin: 0, position: "relative" }}>
                                                    {card.description}
                                                </p>
                                            )
                                        )}

                                        {/* Link */}
                                        {adminMode ? (
                                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                                <input
                                                    className="itb-inline-input itb-link"
                                                    value={card.linkText}
                                                    onChange={e => updateCard(card.id, { linkText: e.target.value })}
                                                    placeholder="Link text"
                                                    style={{ color: accent, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.05em", width: "auto", flex: 1, caretColor: "#e8d5b7" }}
                                                />
                                                <ArrowUpRight size={13} style={{ color: accent, flexShrink: 0 }} />
                                            </div>
                                        ) : (
                                            card.linkUrl && (() => {
                                                const isExternal = card.linkUrl.startsWith("http://") || card.linkUrl.startsWith("https://");
                                                const linkStyle = { color: accent, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.05em", textDecoration: "none", marginTop: "0.25rem", width: "fit-content", position: "relative" };
                                                return isExternal ? (
                                                    <a href={card.linkUrl} className="itb-link" style={linkStyle}>
                                                        {card.linkText || "Learn more"}
                                                        <ArrowUpRight size={13} />
                                                    </a>
                                                ) : (
                                                    <Link to={card.linkUrl} className="itb-link" style={linkStyle}>
                                                        {card.linkText || "Learn more"}
                                                        <ArrowUpRight size={13} />
                                                    </Link>
                                                );
                                            })()
                                        )}
                                    </div>
                                </div>

                                {/* Settings strip — admin only */}
                                {adminMode && (
                                    <div style={{
                                        marginTop: "0.5rem",
                                        display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center",
                                        padding: "0.5rem 0.75rem",
                                        background: "rgba(10,8,6,0.6)",
                                        borderRadius: "0 0 8px 8px",
                                        border: "1px solid rgba(232,213,183,0.08)",
                                        borderTop: "none",
                                        fontSize: "0.72rem",
                                        color: "rgba(232,213,183,0.5)",
                                    }}>
                                        {/* Link URL */}
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                            <span style={{ opacity: 0.5 }}>Link URL</span>
                                            <input
                                                value={card.linkUrl}
                                                onChange={e => updateCard(card.id, { linkUrl: e.target.value })}
                                                placeholder="—"
                                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(232,213,183,0.12)", borderRadius: "4px", color: "#e8d5b7", padding: "0.2rem 0.4rem", fontSize: "0.72rem", width: "140px", fontFamily: "monospace" }}
                                            />
                                        </label>

                                        <div style={{ width: "1px", height: "14px", background: "rgba(232,213,183,0.15)" }} />

                                        {/* Card link */}
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                            <span style={{ opacity: 0.5 }}>Card link</span>
                                            <input
                                                value={card.cardLinkUrl}
                                                onChange={e => updateCard(card.id, { cardLinkUrl: e.target.value })}
                                                placeholder="—"
                                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(232,213,183,0.12)", borderRadius: "4px", color: "#e8d5b7", padding: "0.2rem 0.4rem", fontSize: "0.72rem", width: "140px", fontFamily: "monospace" }}
                                            />
                                        </label>

                                        <div style={{ width: "1px", height: "14px", background: "rgba(232,213,183,0.15)" }} />

                                        {/* Image side */}
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                            <span style={{ opacity: 0.5 }}>Image</span>
                                            {[["auto", "Auto"], ["left", "Left"], ["right", "Right"]].map(([val, label]) => (
                                                <button
                                                    key={val}
                                                    onClick={() => updateCard(card.id, { imageSide: val })}
                                                    style={{
                                                        padding: "0.15rem 0.45rem", fontSize: "0.7rem", borderRadius: "4px", cursor: "pointer",
                                                        border: (card.imageSide ?? "auto") === val ? "1px solid rgba(155,106,78,0.7)" : "1px solid rgba(232,213,183,0.12)",
                                                        background: (card.imageSide ?? "auto") === val ? "rgba(155,106,78,0.2)" : "rgba(255,255,255,0.04)",
                                                        color: "#e8d5b7",
                                                    }}
                                                >{label}</button>
                                            ))}
                                        </label>

                                        <div style={{ width: "1px", height: "14px", background: "rgba(232,213,183,0.15)" }} />

                                        {/* Height */}
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                            <span style={{ opacity: 0.5 }}>Height</span>
                                            <input
                                                type="number"
                                                min={100} max={1200}
                                                value={card.cardHeight ?? 260}
                                                onChange={e => updateCard(card.id, { cardHeight: +e.target.value })}
                                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(232,213,183,0.12)", borderRadius: "4px", color: "#e8d5b7", padding: "0.2rem 0.4rem", fontSize: "0.72rem", width: "64px" }}
                                            />
                                            <span style={{ opacity: 0.4 }}>px</span>
                                        </label>

                                        <div style={{ width: "1px", height: "14px", background: "rgba(232,213,183,0.15)" }} />

                                        {/* Accent color */}
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                            <span style={{ opacity: 0.5 }}>Accent</span>
                                            <input
                                                type="color"
                                                value={card.accentColor || DEFAULT_ACCENT}
                                                onChange={e => updateCard(card.id, { accentColor: e.target.value })}
                                                style={{ height: "20px", width: "28px", border: "none", background: "none", cursor: "pointer", padding: 0 }}
                                            />
                                        </label>

                                        {/* Delete block */}
                                        {canDelete && (
                                            <>
                                                <div style={{ flex: 1 }} />
                                                <button
                                                    onClick={deleteBlock}
                                                    style={{ background: "rgba(200,50,50,0.1)", border: "1px solid rgba(200,50,50,0.25)", color: "#f08080", borderRadius: "6px", padding: "0.25rem 0.6rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.7rem" }}
                                                >
                                                    <Trash2 size={11} /> Delete block
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {showPicker && (
                    <ImagePickerModal
                        gameId={gameId}
                        onSelect={(url) => {
                            if (pickerCardId) updateCard(pickerCardId, { imageUrl: url });
                            setShowPicker(false);
                            setPickerCardId(null);
                        }}
                        onClose={() => { setShowPicker(false); setPickerCardId(null); }}
                    />
                )}
            </div>
        </>
    );
});

export default ImageTextBlock;
