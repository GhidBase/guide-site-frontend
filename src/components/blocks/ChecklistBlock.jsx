import { forwardRef, useImperativeHandle, useState, useEffect, useRef } from "react";
import { Trash2, Pencil, X, Check } from "lucide-react";
import { currentAPI } from "../../config/api";
import ImagePickerModal from "../ImagePickerModal";

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

    // Title editing for the checklist itself
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState("");

    // Image picker modal state: { itemId, slot: "imageOne" | "imageTwo" } | null
    const [pickerTarget, setPickerTarget] = useState(null);

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

    const selectedChecklist = checklists.find(c => c.id === data.checklistId);

    async function saveTitle() {
        if (!titleDraft.trim() || !data.checklistId) return;
        await fetch(`${currentAPI}/games/${gameId}/checklists/${data.checklistId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ title: titleDraft.trim() }),
        });
        setChecklists(prev => prev.map(c =>
            c.id === data.checklistId ? { ...c, title: titleDraft.trim() } : c
        ));
        setEditingTitle(false);
    }

    async function saveItem(updatedItem) {
        const res = await fetch(`${currentAPI}/games/checklistItems/${updatedItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                title: updatedItem.title,
                description: updatedItem.description,
                imageOne: updatedItem.imageOne,
                imageTwo: updatedItem.imageTwo,
            }),
        });
        const saved = await res.json();
        setItems(prev => prev.map(i => i.id === saved.id ? saved : i).sort((a, b) => a.title.localeCompare(b.title)));
    }

    function handlePickImage(url) {
        if (!pickerTarget) return;
        const { itemId, slot } = pickerTarget;
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, [slot]: url } : i));
        setPickerTarget(null);
    }

    const checkedCount = items.filter(i => checkedItems.includes(i.id)).length;
    const progress = items.length > 0 ? (checkedCount / items.length) * 100 : 0;

    return (
        <div className={adminMode ? "relative border border-b-0 border-(--outline-brown)/50 md:rounded-t" : "relative my-2"}>
            {/* Admin toolbar */}
            {adminMode && (
                <div className="flex flex-col gap-2 px-4 py-2 bg-(--accent) border-b border-(--outline-brown)/30 text-sm text-(--text-color)">
                    <div className="flex items-center gap-3">
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
                            <button onClick={deleteBlock} className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs ml-auto shrink-0">
                                <Trash2 size={13} /> Delete
                            </button>
                        )}
                    </div>
                    {/* Checklist title editor */}
                    {data.checklistId && (
                        <div className="flex items-center gap-2">
                            <label className="shrink-0 opacity-60">Title:</label>
                            {editingTitle ? (
                                <>
                                    <input
                                        autoFocus
                                        value={titleDraft}
                                        onChange={e => setTitleDraft(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
                                        className="flex-1 bg-(--surface-background) border border-(--outline-brown)/40 rounded px-2 py-1 text-sm text-(--text-color)"
                                    />
                                    <button onClick={saveTitle} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
                                    <button onClick={() => setEditingTitle(false)} className="opacity-50 hover:opacity-100"><X size={14} /></button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1 opacity-80">{selectedChecklist?.title ?? "—"}</span>
                                    <button
                                        onClick={() => { setTitleDraft(selectedChecklist?.title ?? ""); setEditingTitle(true); }}
                                        className="opacity-50 hover:opacity-100"
                                    >
                                        <Pencil size={13} />
                                    </button>
                                </>
                            )}
                        </div>
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
                        <div className="h-0.5 bg-(--outline-brown)/20">
                            <div className="h-full bg-(--outline-brown)/60 transition-all duration-500" style={{ width: `${progress}%` }} />
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
                                adminMode={adminMode}
                                onSave={saveItem}
                                onOpenPicker={(slot) => setPickerTarget({ itemId: item.id, slot })}
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

            {pickerTarget && (
                <ImagePickerModal
                    gameId={gameId}
                    onSelect={handlePickImage}
                    onClose={() => setPickerTarget(null)}
                />
            )}
        </div>
    );
});

function ChecklistItemRow({ item, checked, hidden, onToggle, adminMode, onSave, onOpenPicker }) {
    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(null);
    const [saving, setSaving] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);

    const images = [item.imageOne, item.imageTwo].filter(Boolean);
    const hasDetails = item.imageOne || item.imageTwo || item.description;

    const detailsRef = useRef(null);
    const editRef = useRef(null);
    const [detailsHeight, setDetailsHeight] = useState(0);
    const [editHeight, setEditHeight] = useState(0);

    useEffect(() => {
        if (detailsRef.current)
            setDetailsHeight(expanded ? detailsRef.current.scrollHeight : 0);
    }, [expanded, imageIndex, item]);

    useEffect(() => {
        if (editRef.current)
            setEditHeight(editing ? editRef.current.scrollHeight : 0);
    }, [editing, draft]);

    function openEdit() {
        setDraft({ title: item.title, description: item.description ?? "", imageOne: item.imageOne ?? "", imageTwo: item.imageTwo ?? "" });
        setEditing(true);
        setExpanded(false);
    }

    function cancelEdit() {
        setEditing(false);
        setDraft(null);
    }

    async function handleSave() {
        setSaving(true);
        await onSave({ ...item, ...draft });
        setSaving(false);
        setEditing(false);
        setDraft(null);
    }

    // When picker selects an image, update draft
    useEffect(() => {
        if (!editing) return;
        setDraft(d => d ? { ...d, imageOne: item.imageOne ?? "", imageTwo: item.imageTwo ?? "" } : d);
    }, [item.imageOne, item.imageTwo]);

    // Sync draft image slots when pool selection arrives via parent updating item
    const prevImagesRef = useRef({ imageOne: item.imageOne, imageTwo: item.imageTwo });
    useEffect(() => {
        if (!editing || !draft) return;
        const prev = prevImagesRef.current;
        if (item.imageOne !== prev.imageOne) setDraft(d => d ? { ...d, imageOne: item.imageOne ?? "" } : d);
        if (item.imageTwo !== prev.imageTwo) setDraft(d => d ? { ...d, imageTwo: item.imageTwo ?? "" } : d);
        prevImagesRef.current = { imageOne: item.imageOne, imageTwo: item.imageTwo };
    }, [item.imageOne, item.imageTwo]);

    return (
        <li
            className="transition-all duration-300 overflow-hidden"
            style={{ maxHeight: hidden ? "0px" : "2000px", opacity: hidden ? 0 : 1 }}
        >
            <div className={`rounded-lg border transition-all duration-200 overflow-hidden
                ${checked && !editing
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
                            ${checked && !editing ? "line-through opacity-35" : "opacity-90"}`}
                        onClick={onToggle}
                    >
                        {item.title}
                    </span>
                    <div className="flex gap-1 shrink-0">
                        {adminMode && !editing && (
                            <button
                                onClick={openEdit}
                                className="text-xs px-2 py-1 rounded border bg-(--surface-background)/50 border-(--outline-brown)/25 text-(--text-color) opacity-60 hover:opacity-100 transition-all duration-150"
                            >
                                <Pencil size={11} />
                            </button>
                        )}
                        {!editing && hasDetails && (
                            <button
                                onClick={() => setExpanded(v => !v)}
                                className={`text-xs px-2.5 py-1 rounded border transition-all duration-150
                                    ${expanded
                                        ? "bg-(--surface-background) border-(--outline-brown)/50 text-(--text-color)"
                                        : "bg-(--surface-background)/50 border-(--outline-brown)/25 text-(--text-color) opacity-60 hover:opacity-100"
                                    }`}
                            >
                                {expanded ? "Hide" : "Show"}
                            </button>
                        )}
                        {editing && (
                            <button onClick={cancelEdit} className="text-xs px-2 py-1 rounded border border-(--outline-brown)/25 opacity-60 hover:opacity-100 text-(--text-color)">
                                <X size={11} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Edit panel */}
                <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: `${editHeight}px`, opacity: editing ? 1 : 0 }}
                >
                    <div ref={editRef} className="px-4 pb-4 pt-2 space-y-3 border-t border-(--outline-brown)/15">
                        <div>
                            <label className="text-xs opacity-50 text-(--text-color) block mb-1">Title</label>
                            <input
                                value={draft?.title ?? ""}
                                onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                                className="w-full bg-(--surface-background) border border-(--outline-brown)/40 rounded px-3 py-1.5 text-sm text-(--text-color)"
                            />
                        </div>
                        <div>
                            <label className="text-xs opacity-50 text-(--text-color) block mb-1">Description</label>
                            <textarea
                                value={draft?.description ?? ""}
                                onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                                rows={3}
                                className="w-full bg-(--surface-background) border border-(--outline-brown)/40 rounded px-3 py-1.5 text-sm text-(--text-color) resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {["imageOne", "imageTwo"].map(slot => (
                                <div key={slot}>
                                    <label className="text-xs opacity-50 text-(--text-color) block mb-1">
                                        {slot === "imageOne" ? "In-game image" : "Map image"}
                                    </label>
                                    <div
                                        className="relative rounded overflow-hidden border border-(--outline-brown)/30 cursor-pointer group"
                                        onClick={() => onOpenPicker(slot)}
                                    >
                                        {draft?.[slot] ? (
                                            <>
                                                <img src={draft[slot]} alt="" className="w-full h-24 object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                                                    Change
                                                </div>
                                            </>
                                        ) : (
                                            <div className="h-24 bg-(--surface-background) flex items-center justify-center text-xs opacity-40 text-(--text-color) hover:opacity-70 transition-opacity">
                                                + Pick from pool
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-1.5 bg-green-800/40 hover:bg-green-800/60 border border-green-700/40 rounded text-sm text-green-300 transition-colors disabled:opacity-50"
                        >
                            {saving ? "Saving…" : "Save"}
                        </button>
                    </div>
                </div>

                {/* Expandable view details */}
                <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: `${detailsHeight}px`, opacity: expanded ? 1 : 0 }}
                >
                    <div ref={detailsRef} className="px-4 pb-4 pt-2 space-y-3 border-t border-(--outline-brown)/15">
                        {item.description && (
                            <p className="text-sm text-(--text-color) opacity-75 leading-relaxed">{item.description}</p>
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
