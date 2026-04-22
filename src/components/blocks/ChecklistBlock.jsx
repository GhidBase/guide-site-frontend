import { forwardRef, useImperativeHandle, useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { currentAPI } from "../../config/api";

function parse(content) {
    if (!content) return { checklistId: null };
    if (typeof content === "object") {
        if (content.type === "richText" && typeof content.content === "string") {
            try { return JSON.parse(content.content); } catch { return { checklistId: null }; }
        }
        return content;
    }
    try { return JSON.parse(content); } catch { return { checklistId: null }; }
}

const ChecklistBlock = forwardRef(function ChecklistBlock(
    { block, adminMode, canDelete, deleteBlock, updateBlockContent, onDirty, gameId },
    ref
) {
    const [data, setData] = useState(() => parse(block.content));
    const [checklists, setChecklists] = useState([]);
    const [items, setItems] = useState([]);
    const [checkedItems, setCheckedItems] = useState(() => {
        if (typeof window === "undefined") return [];
        try {
            const stored = JSON.parse(localStorage.getItem("checkedItems") ?? "[]");
            return Array.isArray(stored) ? stored : [];
        } catch { return []; }
    });
    const [showAll, setShowAll] = useState(() =>
        typeof window !== "undefined" && localStorage.getItem("checklistShowAll") !== "false"
    );

    useImperativeHandle(ref, () => ({
        save: async () => {
            await updateBlockContent(block, data);
            onDirty?.(block.id, false);
        },
    }), [data]);

    useEffect(() => {
        if (!adminMode || !gameId) return;
        fetch(`${currentAPI}/games/${gameId}/checklists`)
            .then(r => r.json())
            .then(setChecklists)
            .catch(() => {});
    }, [adminMode, gameId]);

    useEffect(() => {
        if (!data.checklistId) { setItems([]); return; }
        fetch(`${currentAPI}/games/checklists/${data.checklistId}`)
            .then(r => r.json())
            .then(result => setItems(result.sort((a, b) => a.title.localeCompare(b.title))))
            .catch(() => {});
    }, [data.checklistId]);

    function selectChecklist(id) {
        const newData = { checklistId: id ? +id : null };
        setData(newData);
        onDirty?.(block.id, true);
    }

    function toggleItem(id) {
        setCheckedItems(prev => {
            const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
            localStorage.setItem("checkedItems", JSON.stringify(next));
            return next;
        });
    }

    const checkedCount = items.filter(i => checkedItems.includes(i.id)).length;
    const progress = items.length > 0 ? (checkedCount / items.length) * 100 : 0;

    return (
        <div className={adminMode ? "relative border border-b-0 border-(--outline-brown)/50 md:rounded-t" : "relative my-2"}>
            {adminMode && (
                <div className="flex items-center gap-3 px-4 py-2 bg-(--accent) border-b border-(--outline-brown)/30 text-sm text-(--text-color)">
                    <label className="shrink-0 opacity-60">Checklist:</label>
                    <select
                        value={data.checklistId ?? ""}
                        onChange={e => selectChecklist(e.target.value)}
                        className="bg-(--surface-background) border border-(--outline-brown)/40 rounded px-2 py-1 text-sm text-(--text-color) flex-1"
                    >
                        <option value="">— select a checklist —</option>
                        {checklists.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                    {canDelete && (
                        <button onClick={deleteBlock} className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs ml-auto">
                            <Trash2 size={13} /> Delete
                        </button>
                    )}
                </div>
            )}

            {data.checklistId ? (
                <div className="bg-(--surface-background) rounded-b overflow-hidden">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-(--surface-background) border-b border-(--outline-brown)/30">
                        <div className="flex justify-between items-center px-5 py-3 text-(--text-color)">
                            <span className="text-sm font-semibold tracking-wide">
                                {checkedCount}
                                <span className="opacity-40 font-normal">/{items.length}</span>
                                <span className="opacity-40 font-normal ml-1.5 text-xs">collected</span>
                            </span>
                            <button
                                onClick={() => setShowAll(v => { localStorage.setItem("checklistShowAll", !v); return !v; })}
                                className="text-xs px-3 py-1 bg-(--accent) border border-(--outline-brown)/40 rounded hover:opacity-80 transition-opacity text-(--text-color)"
                            >
                                {showAll ? "Hide Collected" : "Show All"}
                            </button>
                        </div>
                        {/* Progress bar */}
                        <div className="h-0.5 bg-(--outline-brown)/20">
                            <div
                                className="h-full bg-(--outline-brown)/60 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <ul className="px-4 py-3 space-y-2">
                        {items.map(item => (
                            <ChecklistItemRow
                                key={item.id}
                                item={item}
                                checked={checkedItems.includes(item.id)}
                                hidden={!showAll && checkedItems.includes(item.id)}
                                onToggle={() => toggleItem(item.id)}
                            />
                        ))}
                        {checkedCount === items.length && items.length > 0 && showAll && (
                            <li className="text-sm opacity-40 text-center py-6 text-(--text-color)">
                                All items collected!
                            </li>
                        )}
                    </ul>
                </div>
            ) : (
                !adminMode && (
                    <div className="p-6 text-center text-sm opacity-40">No checklist configured.</div>
                )
            )}
        </div>
    );
});

function ChecklistItemRow({ item, checked, hidden, onToggle }) {
    const [expanded, setExpanded] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);
    const hasDetails = item.imageOne || item.imageTwo || item.description;
    const images = [item.imageOne, item.imageTwo].filter(Boolean);
    const detailsRef = useRef(null);
    const [detailsHeight, setDetailsHeight] = useState(0);

    useEffect(() => {
        if (detailsRef.current) {
            setDetailsHeight(expanded ? detailsRef.current.scrollHeight : 0);
        }
    }, [expanded, imageIndex]);

    return (
        <li
            className="transition-all duration-300 overflow-hidden"
            style={{
                maxHeight: hidden ? "0px" : "1200px",
                opacity: hidden ? 0 : 1,
            }}
        >
            <div
                className={`rounded-lg border transition-all duration-200 overflow-hidden
                    ${checked
                        ? "border-(--outline-brown)/15 bg-(--accent)/40"
                        : "border-(--outline-brown)/30 bg-(--accent) hover:border-(--outline-brown)/50"
                    }`}
            >
                {/* Item header */}
                <div className="flex items-center gap-3 px-4 py-2.5">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={onToggle}
                        className="shrink-0 w-4 h-4 cursor-pointer accent-(--outline-brown)"
                    />
                    <span
                        className={`flex-1 text-sm text-(--text-color) transition-all duration-200 select-none cursor-pointer
                            ${checked ? "line-through opacity-35" : "opacity-90"}`}
                        onClick={onToggle}
                    >
                        {item.title}
                    </span>
                    {hasDetails && (
                        <button
                            onClick={() => setExpanded(v => !v)}
                            className={`text-xs px-2.5 py-1 rounded border transition-all duration-150 shrink-0
                                ${expanded
                                    ? "bg-(--surface-background) border-(--outline-brown)/50 text-(--text-color)"
                                    : "bg-(--surface-background)/50 border-(--outline-brown)/25 text-(--text-color) opacity-60 hover:opacity-100"
                                }`}
                        >
                            {expanded ? "Hide" : "Show"}
                        </button>
                    )}
                </div>

                {/* Expandable details */}
                <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: `${detailsHeight}px`, opacity: expanded ? 1 : 0 }}
                >
                    <div ref={detailsRef} className="px-4 pb-4 pt-2 space-y-3 border-t border-(--outline-brown)/15">
                        {item.description && (
                            <p className="text-sm text-(--text-color) opacity-75 leading-relaxed">
                                {item.description}
                            </p>
                        )}
                        {images.length > 0 && (
                            <div
                                className={`relative overflow-hidden rounded-md w-full ${images.length > 1 ? "cursor-pointer" : ""}`}
                                onClick={images.length > 1 ? () => setImageIndex(i => (i + 1) % images.length) : undefined}
                            >
                                <div
                                    className="flex transition-transform duration-300 ease-in-out"
                                    style={{
                                        width: `${images.length * 100}%`,
                                        transform: `translateX(-${(imageIndex / images.length) * 100}%)`,
                                    }}
                                >
                                    {images.map((src, i) => (
                                        <div key={i} style={{ width: `${100 / images.length}%` }}>
                                            <img src={src} alt="" className="w-full h-auto" />
                                        </div>
                                    ))}
                                </div>
                                {images.length > 1 && (
                                    <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded text-xs font-medium bg-black/60 text-white/80 pointer-events-none">
                                        {imageIndex === 0 ? "In-game · tap for map" : "Map · tap for in-game"}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </li>
    );
}

export default ChecklistBlock;
