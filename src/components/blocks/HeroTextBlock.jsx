import { forwardRef, useImperativeHandle, useState } from "react";
import { Trash2 } from "lucide-react";

const EMPTY = { title: "", subtitle: "", backgroundUrl: "", accentColor: "#9b6a4e" };

function parse(content) {
    if (!content) return { ...EMPTY };
    if (typeof content === "object") {
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

    useImperativeHandle(ref, () => ({
        save: async () => {
            await updateBlockContent(block, data);
            onDirty?.(block.id, false);
        },
    }), [data]);

    function update(patch) {
        setData(prev => ({ ...prev, ...patch }));
        onDirty?.(block.id, true);
    }

    const { title, subtitle, backgroundUrl, accentColor } = data;

    const inputBase = {
        background: "transparent",
        border: "none",
        outline: "none",
        textAlign: "center",
        width: "100%",
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: "-0.04em",
        fontWeight: 900,
        fontSize: "clamp(3rem, 10vw, 7rem)",
        lineHeight: 1,
        caretColor: accentColor,
        display: "block",
    };

    return (
        <div className={adminMode ? "relative border border-b-0 border-(--outline-brown)/50 md:rounded-t" : "relative my-2"}>
            <div
                className="relative flex flex-col items-center justify-center text-center rounded-xl overflow-hidden py-20 px-8 min-h-48"
                style={{
                    background: backgroundUrl
                        ? `linear-gradient(to bottom, rgba(10,8,6,0.5), rgba(10,8,6,0.8)), url(${backgroundUrl}) center/cover no-repeat`
                        : "transparent",
                    color: "#e8d5b7",
                    fontFamily: "'Outfit', sans-serif",
                }}
            >
                {/* Settings bar — only in admin mode */}
                {adminMode && (
                    <div style={{
                        position: "absolute", top: "0.75rem", left: "50%", transform: "translateX(-50%)",
                        display: "flex", alignItems: "center", gap: "0.5rem", zIndex: 10,
                        background: "rgba(10,8,6,0.82)", borderRadius: "8px",
                        padding: "0.35rem 0.65rem", border: "1px solid rgba(232,213,183,0.15)",
                        whiteSpace: "nowrap",
                    }}>
                        <input
                            value={backgroundUrl}
                            onChange={e => update({ backgroundUrl: e.target.value })}
                            placeholder="Background image URL"
                            style={{ background: "transparent", border: "none", color: "rgba(232,213,183,0.7)", fontSize: "0.72rem", width: "200px", outline: "none", fontFamily: "monospace" }}
                        />
                        <div style={{ width: "1px", height: "14px", background: "rgba(232,213,183,0.2)" }} />
                        <label style={{ fontSize: "0.65rem", opacity: 0.5, color: "#e8d5b7" }}>Accent</label>
                        <input
                            type="color"
                            value={accentColor}
                            onChange={e => update({ accentColor: e.target.value })}
                            style={{ height: "18px", width: "28px", border: "none", background: "none", cursor: "pointer", padding: 0 }}
                        />
                        {canDelete && (
                            <>
                                <div style={{ width: "1px", height: "14px", background: "rgba(232,213,183,0.2)" }} />
                                <button onClick={deleteBlock} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(240,128,128,0.7)", fontSize: "0.7rem", padding: 0, display: "flex", alignItems: "center", gap: "0.2rem" }}>
                                    <Trash2 size={11} /> Delete
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Title */}
                {adminMode ? (
                    <input
                        value={title}
                        onChange={e => update({ title: e.target.value })}
                        placeholder="Title"
                        style={{ ...inputBase, color: "#f5ede0", textShadow: `0 4px 60px ${accentColor}44` }}
                    />
                ) : (
                    title && (
                        <h1 className="m-0 font-black leading-none tracking-tight" style={{ fontSize: "clamp(3rem, 10vw, 7rem)", letterSpacing: "-0.04em", color: "#f5ede0", textShadow: `0 4px 60px ${accentColor}44` }}>
                            {title}
                        </h1>
                    )
                )}

                {/* Subtitle */}
                {adminMode ? (
                    <input
                        value={subtitle}
                        onChange={e => update({ subtitle: e.target.value })}
                        placeholder="Subtitle"
                        style={{ ...inputBase, color: accentColor, textShadow: `0 4px 60px ${accentColor}66` }}
                    />
                ) : (
                    subtitle && (
                        <h1 className="m-0 font-black leading-none tracking-tight" style={{ fontSize: "clamp(3rem, 10vw, 7rem)", letterSpacing: "-0.04em", color: accentColor, textShadow: `0 4px 60px ${accentColor}66` }}>
                            {subtitle}
                        </h1>
                    )
                )}

                {!adminMode && !title && !subtitle && (
                    <span className="opacity-30 text-sm">Empty hero block</span>
                )}
            </div>
        </div>
    );
});

export default HeroTextBlock;
