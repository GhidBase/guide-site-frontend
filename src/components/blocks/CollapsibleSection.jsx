import { forwardRef, useImperativeHandle, useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";

const CollapsibleSection = forwardRef(function CollapsibleSection(
    { startBlock, endBlock, innerBlocks, adminMode, isAdmin, renderInnerBlock, makeButtons, updateBlockContent, onDirty, deleteStart, deleteEnd },
    ref
) {
    const [data, setData] = useState(() => {
        const empty = { title: "", defaultOpen: false };
        const c = startBlock.content;
        if (!c) return empty;
        if (typeof c === "object") {
            if (c.type === "richText") {
                try { return { ...empty, ...JSON.parse(c.content) }; }
                catch { return empty; }
            }
            return { ...empty, ...c };
        }
        try { return { ...empty, ...JSON.parse(c) }; }
        catch { return empty; }
    });

    const [isOpen, setIsOpen] = useState(data.defaultOpen);

    useImperativeHandle(ref, () => ({
        async save() {
            await updateBlockContent(startBlock, data);
            onDirty?.(startBlock.id, false);
        },
    }), [data]);

    function patch(updates) {
        setData(prev => ({ ...prev, ...updates }));
        onDirty?.(startBlock.id, true);
    }

    if (adminMode) {
        const addInsideOrder = endBlock ? endBlock.order - 1 : startBlock.order;

        return (
            <div style={{ border: "2px dashed rgba(155,106,78,0.35)", borderRadius: "8px", margin: "0.25rem 0 1rem" }}>
                {/* Header */}
                <div style={{ background: "rgba(155,106,78,0.12)", padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px dashed rgba(155,106,78,0.25)", borderRadius: "6px 6px 0 0" }}>
                    <ChevronDown size={14} style={{ opacity: 0.4, flexShrink: 0 }} />
                    <input
                        value={data.title}
                        onChange={e => patch({ title: e.target.value })}
                        placeholder="Section title…"
                        style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "inherit", fontFamily: "inherit", fontSize: "0.9rem", fontWeight: 600 }}
                    />
                    <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", opacity: 0.6, whiteSpace: "nowrap", cursor: "pointer" }}>
                        <input type="checkbox" checked={data.defaultOpen} onChange={e => patch({ defaultOpen: e.target.checked })} />
                        Open by default
                    </label>
                    {isAdmin && (
                        <button
                            onClick={() => {
                                if (window.confirm("Delete this collapsible section? Inner blocks will remain as regular content.")) {
                                    deleteStart();
                                    deleteEnd?.();
                                }
                            }}
                            style={{ background: "rgba(200,50,50,0.1)", border: "1px solid rgba(200,50,50,0.25)", color: "#f08080", borderRadius: "6px", padding: "0.2rem 0.5rem", cursor: "pointer", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                        >
                            <Trash2 size={11} /> Delete
                        </button>
                    )}
                </div>

                {/* Inner blocks */}
                <div>
                    {innerBlocks.length === 0 ? (
                        <>
                            <div style={{ padding: "1.25rem", opacity: 0.3, fontSize: "0.8rem", textAlign: "center" }}>
                                Empty — add blocks below
                            </div>
                            {makeButtons(addInsideOrder)}
                        </>
                    ) : (
                        innerBlocks.map(block => renderInnerBlock(block))
                    )}
                </div>

                {/* End marker */}
                <div style={{ background: "rgba(155,106,78,0.06)", borderTop: "1px dashed rgba(155,106,78,0.2)", padding: "0.3rem 1rem", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.3, borderRadius: "0 0 6px 6px" }}>
                    End of collapsible section
                </div>
            </div>
        );
    }

    // View mode
    return (
        <div>
            <button
                onClick={() => setIsOpen(o => !o)}
                style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.75rem 2rem",
                    background: "transparent", border: "none", cursor: "pointer",
                    color: "inherit", textAlign: "left",
                    borderBottom: "1px solid rgba(232,213,183,0.1)",
                }}
            >
                <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{data.title || "Section"}</span>
                <ChevronDown
                    size={16}
                    style={{ transition: "transform 0.25s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0, opacity: 0.6 }}
                />
            </button>
            {isOpen && (
                <div>
                    {innerBlocks.map(block => renderInnerBlock(block))}
                </div>
            )}
        </div>
    );
});

export default CollapsibleSection;
