import { useState, useEffect, useRef } from "react";
import { currentAPI } from "../../config/api";
import { useRouteLoaderData } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { X, ChevronUp, ChevronDown, Pencil } from "lucide-react";
import ImagePickerModal from "../ImagePickerModal.jsx";

export default function TierList() {
    const { gameData } = useRouteLoaderData("main");
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";
    const gameId = gameData?.id;

    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [categoryData, setCategoryData] = useState(null);
    const [selectedModeId, setSelectedModeId] = useState(null);

    const storageKey = `tier-row-height-${gameId}`;
    const [rowHeight, setRowHeight] = useState(() => {
        const saved = typeof window !== "undefined" && localStorage.getItem(storageKey);
        return saved ? Number(saved) : 80;
    });
    function updateRowHeight(h) { setRowHeight(h); localStorage.setItem(storageKey, h); }

    // Local section assignments (itemId -> sectionId) per category+mode, persisted to localStorage
    // Used as fallback when the backend doesn't return sectionId on entries
    const localSectionsKey = `tier-local-sections-${gameId}`;
    const [localSectionsStore, setLocalSectionsStore] = useState(() => {
        const saved = typeof window !== "undefined" && localStorage.getItem(localSectionsKey);
        return saved ? JSON.parse(saved) : {};
    });

    // Admin state
    const [adminOpen, setAdminOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showItemImagePicker, setShowItemImagePicker] = useState(false);

    // Drag and drop
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverTierId, setDragOverTierId] = useState(null);
    const containerRef = useRef(null);
    const touchDragRef = useRef(null);
    const dragEntryRef = useRef(null);

    // Admin forms
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newItemName, setNewItemName] = useState("");
    const [newItemImageUrl, setNewItemImageUrl] = useState("");
    const [newModeName, setNewModeName] = useState("");
    const [newModeColor, setNewModeColor] = useState("#6366f1");
    const [newTierName, setNewTierName] = useState("");
    const [newTierColor, setNewTierColor] = useState("#ef4444");
    const [newSectionName, setNewSectionName] = useState("");
    const [renamingModeId, setRenamingModeId] = useState(null);
    const [renamingModeName, setRenamingModeName] = useState("");
    const [addingMode, setAddingMode] = useState(false);
    const [newModeNameInline, setNewModeNameInline] = useState("");
    const [renamingTierId, setRenamingTierId] = useState(null);
    const [renamingTierName, setRenamingTierName] = useState("");
    const [addingTier, setAddingTier] = useState(false);
    const [renamingCategoryId, setRenamingCategoryId] = useState(null);
    const [renamingCategoryName, setRenamingCategoryName] = useState("");
    const [addingCategory, setAddingCategory] = useState(false);
    const [newCategoryNameInline, setNewCategoryNameInline] = useState("");
    const [renamingSectionId, setRenamingSectionId] = useState(null);
    const [renamingSectionName, setRenamingSectionName] = useState("");
    const [addingSection, setAddingSection] = useState(false);

    useEffect(() => {
        if (!gameId) return;
        loadCategories();
    }, [gameId]);

    useEffect(() => {
        if (!selectedCategoryId) return;
        loadCategoryData(selectedCategoryId);
    }, [selectedCategoryId]);

    async function loadCategories() {
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
                setSelectedCategoryId(prev => prev ?? data[0]?.id ?? null);
            }
        } catch {}
    }

    async function loadCategoryData(id) {
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${id}`);
            if (res.ok) {
                const data = await res.json();
                setCategoryData(data);
                const modeIds = data.modes?.map(m => m.id) ?? [];
                setSelectedModeId(prev => modeIds.includes(prev) ? prev : data.modes?.[0]?.id ?? null);
            }
        } catch {}
    }

    // Derived data
    const itemSize = Math.max(32, rowHeight - 16);
    const poolItems = categoryData?.items ?? [];
    const itemsById = Object.fromEntries(poolItems.map(i => [i.id, i]));
    const localSectionMap = localSectionsStore[`${selectedCategoryId}:${selectedModeId}`] ?? {};

    function updateLocalSection(itemId, sectionId) {
        const key = `${selectedCategoryId}:${selectedModeId}`;
        const next = { ...localSectionsStore, [key]: { ...localSectionMap, [itemId]: sectionId } };
        setLocalSectionsStore(next);
        localStorage.setItem(localSectionsKey, JSON.stringify(next));
    }
    const modes = [...(categoryData?.modes ?? [])].sort((a, b) => a.order - b.order);
    const selectedMode = modes.find(m => m.id === selectedModeId) ?? null;
    const sortedTiers = [...(selectedMode?.tiers ?? [])].sort((a, b) => a.order - b.order);
    const sortedSections = [...(selectedMode?.sections ?? [])].sort((a, b) => a.order - b.order);
    const hasSections = sortedSections.length > 0;

    function getEntriesForTier(tierId) {
        return [...(selectedMode?.tiers.find(t => t.id === tierId)?.entries ?? [])]
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    // ── Categories ─────────────────────────────────────────
    async function createCategory() {
        if (!newCategoryName.trim()) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ name: newCategoryName.trim(), order: categories.length }),
            });
            if (res.ok) {
                const data = await res.json();
                setNewCategoryName("");
                await loadCategories();
                setSelectedCategoryId(data.id);
            }
        } catch {}
    }

    async function deleteCategory(id) {
        if (!window.confirm("Delete this category and all its data?")) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${id}`, {
                method: "DELETE", credentials: "include",
            });
            if (res.ok) {
                if (selectedCategoryId === id) { setSelectedCategoryId(null); setCategoryData(null); }
                await loadCategories();
            }
        } catch {}
    }

    // ── Items (pool) ────────────────────────────────────────
    async function createItem() {
        if (!newItemName.trim() || !newItemImageUrl) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/items`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ name: newItemName.trim(), imageUrl: newItemImageUrl, order: poolItems.length }),
            });
            if (res.ok) { setNewItemName(""); setNewItemImageUrl(""); await loadCategoryData(selectedCategoryId); }
        } catch {}
    }

    async function deleteItem(itemId) {
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/items/${itemId}`, {
                method: "DELETE", credentials: "include",
            });
            if (res.ok) await loadCategoryData(selectedCategoryId);
        } catch {}
    }

    // ── Modes ───────────────────────────────────────────────
    async function createMode() {
        if (!newModeName.trim()) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ name: newModeName.trim(), color: newModeColor, order: modes.length }),
            });
            if (res.ok) {
                const data = await res.json();
                setNewModeName("");
                await loadCategoryData(selectedCategoryId);
                setSelectedModeId(data.id);
            }
        } catch {}
    }

    async function deleteMode(modeId) {
        if (!window.confirm("Delete this mode and all its placements?")) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes/${modeId}`, {
                method: "DELETE", credentials: "include",
            });
            if (res.ok) {
                if (selectedModeId === modeId) setSelectedModeId(null);
                await loadCategoryData(selectedCategoryId);
            }
        } catch {}
    }

    async function renameMode(modeId) {
        if (!renamingModeName.trim()) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes/${modeId}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ name: renamingModeName.trim() }),
            });
            if (res.ok) { setRenamingModeId(null); await loadCategoryData(selectedCategoryId); }
        } catch {}
    }

    async function createModeInline() {
        if (!newModeNameInline.trim()) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ name: newModeNameInline.trim(), color: newModeColor, order: modes.length }),
            });
            if (res.ok) {
                const data = await res.json();
                setNewModeNameInline(""); setAddingMode(false);
                await loadCategoryData(selectedCategoryId);
                setSelectedModeId(data.id);
            }
        } catch {}
    }

    // ── Tiers ───────────────────────────────────────────────
    async function createTier() {
        if (!newTierName.trim() || !selectedModeId) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes/${selectedModeId}/tiers`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ name: newTierName.trim(), color: newTierColor, order: sortedTiers.length }),
            });
            if (res.ok) { setNewTierName(""); setAddingTier(false); await loadCategoryData(selectedCategoryId); }
        } catch {}
    }

    async function renameTier(tierId) {
        if (!renamingTierName.trim()) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes/${selectedModeId}/tiers/${tierId}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ name: renamingTierName.trim() }),
            });
            if (res.ok) { setRenamingTierId(null); await loadCategoryData(selectedCategoryId); }
        } catch {}
    }

    async function deleteTier(tierId) {
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes/${selectedModeId}/tiers/${tierId}`, {
                method: "DELETE", credentials: "include",
            });
            if (res.ok) await loadCategoryData(selectedCategoryId);
        } catch {}
    }

    async function moveTier(tierId, direction) {
        const idx = sortedTiers.findIndex(t => t.id === tierId);
        const swapIdx = idx + direction;
        if (swapIdx < 0 || swapIdx >= sortedTiers.length) return;
        const a = sortedTiers[idx], b = sortedTiers[swapIdx];
        try {
            await Promise.all([
                fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes/${selectedModeId}/tiers/${a.id}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
                    body: JSON.stringify({ order: b.order }),
                }),
                fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes/${selectedModeId}/tiers/${b.id}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
                    body: JSON.stringify({ order: a.order }),
                }),
            ]);
            await loadCategoryData(selectedCategoryId);
        } catch {}
    }

    // ── Sections ─────────────────────────────────────────────
    async function createSection() {
        if (!newSectionName.trim() || !selectedModeId) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes/${selectedModeId}/sections`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ name: newSectionName.trim(), order: sortedSections.length }),
            });
            if (res.ok) { setNewSectionName(""); setAddingSection(false); await loadCategoryData(selectedCategoryId); }
        } catch {}
    }

    async function deleteSection(sectionId) {
        if (!window.confirm("Delete this section? Entries in this section will become unsectioned.")) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes/${selectedModeId}/sections/${sectionId}`, {
                method: "DELETE", credentials: "include",
            });
            if (res.ok) await loadCategoryData(selectedCategoryId);
        } catch {}
    }

    // ── Entries (placements) ────────────────────────────────
    async function placeItem(tierId, sectionId) {
        if (!selectedItem || !selectedModeId) return;
        const tier = selectedMode?.tiers.find(t => t.id === tierId);
        const alreadyPlaced = tier?.entries?.find(e => e.itemId === selectedItem.id);

        // If sections are used, always update local section assignment on click
        if (sectionId) updateLocalSection(selectedItem.id, sectionId);

        // If item is already in this tier, no need to POST again
        if (alreadyPlaced) return;

        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes/${selectedModeId}/entries`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ tierId, itemId: selectedItem.id }),
            });
            if (res.ok) await loadCategoryData(selectedCategoryId);
        } catch {}
    }

    async function removeEntry(entryId) {
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes/${selectedModeId}/entries/${entryId}`, {
                method: "DELETE", credentials: "include",
            });
            if (res.ok) await loadCategoryData(selectedCategoryId);
        } catch {}
    }

    async function placeItemFromDrag(tierId, item, sectionId) {
        const tier = selectedMode?.tiers.find(t => t.id === tierId);
        const alreadyPlaced = tier?.entries?.find(e => e.itemId === item.id);
        // If sections exist and item is already in this tier, just assign its section
        if (alreadyPlaced) {
            if (hasSections && sectionId) updateLocalSection(item.id, sectionId);
            return;
        }
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes/${selectedModeId}/entries`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ tierId, itemId: item.id }),
            });
            if (res.ok) await loadCategoryData(selectedCategoryId);
        } catch {}
    }

    async function moveEntry(entryId, toTierId, itemId) {
        const toTier = selectedMode?.tiers.find(t => t.id === toTierId);
        if (toTier?.entries?.find(e => e.itemId === itemId)) return;
        try {
            const delRes = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes/${selectedModeId}/entries/${entryId}`, {
                method: "DELETE", credentials: "include",
            });
            if (!delRes.ok) return;
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes/${selectedModeId}/entries`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ tierId: toTierId, itemId }),
            });
            if (res.ok) await loadCategoryData(selectedCategoryId);
        } catch {}
    }

    async function handleDrop(tierId, sectionId) {
        setDragOverTierId(null);
        if (draggedItem) {
            await placeItemFromDrag(tierId, draggedItem, sectionId);
            setDraggedItem(null);
        } else if (dragEntryRef.current) {
            const { entryId, itemId, fromTierId } = dragEntryRef.current;
            // Update section assignment (handles same-tier section reassignment)
            if (hasSections && sectionId) updateLocalSection(itemId, sectionId);
            // Move to different tier if needed
            if (fromTierId !== tierId) await moveEntry(entryId, tierId, itemId);
            dragEntryRef.current = null;
        }
    }

    // ── Touch drag (mobile) ─────────────────────────────────
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        function onTouchMove(e) {
            if (!touchDragRef.current) return;
            const touch = e.touches[0];
            if (!touchDragRef.current.ghost) {
                const dx = touch.clientX - touchDragRef.current.startX;
                const dy = touch.clientY - touchDragRef.current.startY;
                if (Math.hypot(dx, dy) < 10) return;
                const imageUrl = touchDragRef.current.item?.imageUrl;
                if (!imageUrl) return;
                const ghost = document.createElement("div");
                ghost.style.cssText = `position:fixed;width:56px;height:56px;border-radius:8px;overflow:hidden;pointer-events:none;z-index:9999;opacity:0.85;transform:translate(-50%,-50%);left:${touch.clientX}px;top:${touch.clientY}px;box-shadow:0 8px 24px rgba(0,0,0,0.3);`;
                const img = document.createElement("img");
                img.src = imageUrl; img.style.cssText = "width:100%;height:100%;object-fit:cover;";
                ghost.appendChild(img); document.body.appendChild(ghost);
                touchDragRef.current.ghost = ghost;
            }
            e.preventDefault();
            const ghost = touchDragRef.current.ghost;
            ghost.style.left = `${touch.clientX}px`;
            ghost.style.top = `${touch.clientY}px`;
            ghost.style.display = "none";
            const tierEl = document.elementFromPoint(touch.clientX, touch.clientY)?.closest("[data-tier-id]");
            ghost.style.display = "";
            setDragOverTierId(tierEl?.dataset.tierId ?? null);
        }
        el.addEventListener("touchmove", onTouchMove, { passive: false });
        return () => el.removeEventListener("touchmove", onTouchMove);
    }, []);

    async function handleTouchEnd(e) {
        if (!touchDragRef.current) return;
        const { ghost, item, entry } = touchDragRef.current;
        ghost?.remove();
        if (!ghost) { touchDragRef.current = null; return; }
        const touch = e.changedTouches[0];
        const tierEl = document.elementFromPoint(touch.clientX, touch.clientY)?.closest("[data-tier-id]");
        const tierId = tierEl?.dataset.tierId;
        setDragOverTierId(null);
        if (tierId) {
            const tid = isNaN(tierId) ? tierId : Number(tierId);
            if (item && !entry) await placeItemFromDrag(tid, item);
            else if (entry && entry.fromTierId !== tid) await moveEntry(entry.entryId, tid, entry.itemId);
        }
        touchDragRef.current = null;
    }

    async function renameCategory(catId) {
        if (!renamingCategoryName.trim()) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${catId}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ name: renamingCategoryName.trim() }),
            });
            if (res.ok) { setRenamingCategoryId(null); await loadCategories(); }
        } catch {}
    }

    async function createCategoryInline() {
        if (!newCategoryNameInline.trim()) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ name: newCategoryNameInline.trim(), order: categories.length }),
            });
            if (res.ok) {
                const data = await res.json();
                setNewCategoryNameInline(""); setAddingCategory(false);
                await loadCategories();
                setSelectedCategoryId(data.id);
            }
        } catch {}
    }

    async function renameSection(sectionId) {
        if (!renamingSectionName.trim()) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes/${selectedModeId}/sections/${sectionId}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ name: renamingSectionName.trim() }),
            });
            if (res.ok) { setRenamingSectionId(null); await loadCategoryData(selectedCategoryId); }
        } catch {}
    }

    // ── Entry render helper ─────────────────────────────────
    function renderEntry(entry, fromTierId) {
        const item = itemsById[entry.itemId];
        if (!item) return null;
        return (
            <div key={entry.id}
                className="relative shrink-0 flex flex-col items-center"
                draggable={isAdmin}
                onDragStart={isAdmin ? (e) => { e.stopPropagation(); dragEntryRef.current = { entryId: entry.id, itemId: entry.itemId, fromTierId }; setDraggedItem(null); } : undefined}
                onDragEnd={isAdmin ? () => { dragEntryRef.current = null; setDragOverTierId(null); } : undefined}
                onTouchStart={isAdmin ? (e) => {
                    const touch = e.touches[0];
                    touchDragRef.current = { entry: { entryId: entry.id, itemId: entry.itemId, fromTierId }, item, startX: touch.clientX, startY: touch.clientY, ghost: null };
                } : undefined}
            >
                <div className="rounded overflow-hidden border border-(--outline-brown)/30"
                    style={{ width: itemSize, height: itemSize }}>
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" draggable={false} />
                </div>
                <p className="text-xs text-center text-(--text-color) opacity-70 mt-0.5 truncate"
                    style={{ width: itemSize }}>
                    {item.name}
                </p>
                {isAdmin && (
                    <button
                        onClick={e => { e.stopPropagation(); removeEntry(entry.id); }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center cursor-pointer z-10"
                    >
                        <X className="w-2.5 h-2.5" />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div ref={containerRef} onTouchEnd={handleTouchEnd} className="flex flex-col gap-4 w-full max-w-6xl mx-auto p-4">

            {/* Category tabs */}
            {(categories.length > 0 || isAdmin) && (
                <div className="flex items-center gap-1 border-b-2 border-(--outline-brown)/30 overflow-x-auto pb-px">
                    {categories.map(cat => (
                        renamingCategoryId === cat.id ? (
                            <div key={cat.id} className="flex items-center gap-1 shrink-0">
                                <input
                                    autoFocus
                                    value={renamingCategoryName}
                                    onChange={e => setRenamingCategoryName(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") renameCategory(cat.id);
                                        if (e.key === "Escape") setRenamingCategoryId(null);
                                    }}
                                    className="px-2 py-1 text-sm rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) outline-none w-32"
                                />
                                <button onClick={() => renameCategory(cat.id)}
                                    className="text-xs px-2 py-1 bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90">Save</button>
                                <button onClick={() => setRenamingCategoryId(null)}
                                    className="text-xs px-1.5 py-1 text-(--text-color) opacity-50 hover:opacity-80 cursor-pointer">✕</button>
                            </div>
                        ) : (
                            <div key={cat.id} className="flex items-center gap-0.5 group shrink-0">
                                <button
                                    onClick={() => setSelectedCategoryId(cat.id)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-t cursor-pointer whitespace-nowrap transition-colors ${
                                        cat.id === selectedCategoryId
                                            ? "bg-(--primary) text-amber-50"
                                            : "text-(--text-color) hover:bg-(--surface-background)"
                                    }`}>
                                    {cat.name}
                                </button>
                                {isAdmin && (
                                    <>
                                        <button
                                            onClick={() => { setRenamingCategoryId(cat.id); setRenamingCategoryName(cat.name); }}
                                            title="Rename"
                                            className="p-1 opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity cursor-pointer text-(--text-color)">
                                            <Pencil className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => deleteCategory(cat.id)}
                                            title="Delete"
                                            className="p-1 opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity cursor-pointer text-red-500">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </>
                                )}
                            </div>
                        )
                    ))}

                    {isAdmin && (
                        addingCategory ? (
                            <div className="flex items-center gap-1 shrink-0">
                                <input
                                    autoFocus
                                    value={newCategoryNameInline}
                                    onChange={e => setNewCategoryNameInline(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") createCategoryInline();
                                        if (e.key === "Escape") { setAddingCategory(false); setNewCategoryNameInline(""); }
                                    }}
                                    placeholder="Category name..."
                                    className="px-2 py-1 text-sm rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) outline-none w-36"
                                />
                                <button onClick={createCategoryInline}
                                    className="text-xs px-2 py-1 bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90">Add</button>
                                <button onClick={() => { setAddingCategory(false); setNewCategoryNameInline(""); }}
                                    className="text-xs px-1.5 py-1 text-(--text-color) opacity-50 hover:opacity-80 cursor-pointer">✕</button>
                            </div>
                        ) : (
                            <button onClick={() => setAddingCategory(true)}
                                className="px-2 py-2 text-sm text-(--text-color) opacity-40 hover:opacity-80 cursor-pointer whitespace-nowrap shrink-0">
                                + Category
                            </button>
                        )
                    )}
                </div>
            )}

            {categories.length === 0 && !isAdmin && (
                <p className="text-sm text-(--text-color) opacity-50 text-center py-10">No tier lists yet.</p>
            )}

            {/* Admin toggle */}
            {isAdmin && (
                <div className="flex justify-end">
                    <button onClick={() => setAdminOpen(o => !o)}
                        className="px-3 py-1.5 text-sm bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90">
                        {adminOpen ? "Close Admin" : "Manage"}
                    </button>
                </div>
            )}

            {categoryData && (
                <>
                    {/* Mode tabs */}
                    {(modes.length > 0 || isAdmin) && (
                        <div className="flex items-center gap-1 flex-wrap">
                            {modes.map(mode => (
                                renamingModeId === mode.id ? (
                                    <div key={mode.id} className="flex items-center gap-1">
                                        <input
                                            autoFocus
                                            value={renamingModeName}
                                            onChange={e => setRenamingModeName(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === "Enter") renameMode(mode.id);
                                                if (e.key === "Escape") setRenamingModeId(null);
                                            }}
                                            className="px-2 py-1 text-sm rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) outline-none w-32"
                                        />
                                        <button onClick={() => renameMode(mode.id)}
                                            className="text-xs px-2 py-1 bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90">Save</button>
                                        <button onClick={() => setRenamingModeId(null)}
                                            className="text-xs px-1.5 py-1 text-(--text-color) opacity-50 hover:opacity-80 cursor-pointer">✕</button>
                                    </div>
                                ) : (
                                    <div key={mode.id} className="flex items-center gap-0.5 group">
                                        <button
                                            onClick={() => setSelectedModeId(mode.id)}
                                            className={`px-4 py-1.5 text-sm font-semibold rounded cursor-pointer transition-colors whitespace-nowrap ${
                                                mode.id === selectedModeId ? "text-white" : "text-(--text-color) bg-(--surface-background) hover:opacity-80"
                                            }`}
                                            style={mode.id === selectedModeId ? { backgroundColor: mode.color } : {}}>
                                            {mode.name}
                                        </button>
                                        {isAdmin && (
                                            <>
                                                <button
                                                    onClick={() => { setRenamingModeId(mode.id); setRenamingModeName(mode.name); }}
                                                    title="Rename"
                                                    className="p-1 opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity cursor-pointer text-(--text-color)">
                                                    <Pencil className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => deleteMode(mode.id)}
                                                    title="Delete"
                                                    className="p-1 opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity cursor-pointer text-red-500">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )
                            ))}

                            {/* Add mode inline */}
                            {isAdmin && (
                                addingMode ? (
                                    <div className="flex items-center gap-1">
                                        <input
                                            autoFocus
                                            value={newModeNameInline}
                                            onChange={e => setNewModeNameInline(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === "Enter") createModeInline();
                                                if (e.key === "Escape") { setAddingMode(false); setNewModeNameInline(""); }
                                            }}
                                            placeholder="Mode name..."
                                            className="px-2 py-1 text-sm rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) outline-none w-36"
                                        />
                                        <button onClick={createModeInline}
                                            className="text-xs px-2 py-1 bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90">Add</button>
                                        <button onClick={() => { setAddingMode(false); setNewModeNameInline(""); }}
                                            className="text-xs px-1.5 py-1 text-(--text-color) opacity-50 hover:opacity-80 cursor-pointer">✕</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setAddingMode(true)}
                                        className="px-2 py-1.5 text-sm text-(--text-color) opacity-40 hover:opacity-80 cursor-pointer rounded hover:bg-(--surface-background) transition-colors whitespace-nowrap">
                                        + Mode
                                    </button>
                                )
                            )}
                        </div>
                    )}

                    {/* Row height + section controls */}
                    <div className="flex items-center gap-3 self-end">
                        {isAdmin && (
                            addingSection ? (
                                <div className="flex items-center gap-1">
                                    <input
                                        autoFocus
                                        value={newSectionName}
                                        onChange={e => setNewSectionName(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") createSection();
                                            if (e.key === "Escape") setAddingSection(false);
                                        }}
                                        placeholder="Section name..."
                                        className="px-1.5 py-0.5 text-xs rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) outline-none w-28"
                                    />
                                    <button onClick={createSection}
                                        className="text-xs px-1.5 py-0.5 bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90 shrink-0">Add</button>
                                    <button onClick={() => setAddingSection(false)}
                                        className="text-xs text-(--text-color) opacity-50 hover:opacity-80 cursor-pointer">✕</button>
                                </div>
                            ) : (
                                <button onClick={() => setAddingSection(true)}
                                    className="text-xs text-(--text-color) opacity-40 hover:opacity-80 cursor-pointer whitespace-nowrap">
                                    + Section
                                </button>
                            )
                        )}
                        <span className="text-xs text-(--text-color) opacity-50">Row size</span>
                        <input type="range" min={48} max={160} step={4}
                            value={rowHeight}
                            onChange={e => updateRowHeight(Number(e.target.value))}
                            className="w-24 accent-(--primary) cursor-pointer"
                        />
                    </div>

                    {/* Tier grid + item picker side by side */}
                    <div className="flex gap-4 items-start">
                    {selectedMode && (
                        <div className="flex-1 flex flex-col rounded-lg overflow-hidden border-2 border-(--outline-brown)/30">

                            {/* Section column headers */}
                            {(hasSections || isAdmin) && (
                                <div className="flex border-b-2 border-(--outline-brown)/20 bg-(--accent)">
                                    <div className="w-16 shrink-0" />
                                    {sortedSections.map((section, i) => (
                                        <div key={section.id}
                                            className={`flex-1 group flex items-center justify-center gap-1 py-2 text-sm font-semibold text-(--text-color) ${i > 0 ? "border-l-2 border-(--outline-brown)/20" : ""}`}>
                                            {renamingSectionId === section.id ? (
                                                <div className="flex items-center gap-1 px-1">
                                                    <input
                                                        autoFocus
                                                        value={renamingSectionName}
                                                        onChange={e => setRenamingSectionName(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === "Enter") renameSection(section.id);
                                                            if (e.key === "Escape") setRenamingSectionId(null);
                                                        }}
                                                        className="px-1.5 py-0.5 text-xs rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) outline-none w-24"
                                                    />
                                                    <button onClick={() => renameSection(section.id)}
                                                        className="text-xs px-1.5 py-0.5 bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90">✓</button>
                                                    <button onClick={() => setRenamingSectionId(null)}
                                                        className="text-xs text-(--text-color) opacity-50 hover:opacity-80 cursor-pointer">✕</button>
                                                </div>
                                            ) : (
                                                <>
                                                    {section.name}
                                                    {isAdmin && (
                                                        <>
                                                            <button
                                                                onClick={() => { setRenamingSectionId(section.id); setRenamingSectionName(section.name); }}
                                                                title="Rename"
                                                                className="opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity cursor-pointer text-(--text-color)">
                                                                <Pencil className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteSection(section.id)}
                                                                title="Delete"
                                                                className="opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity cursor-pointer text-red-500">
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {sortedTiers.length === 0 && (
                                <p className="text-sm text-(--text-color) opacity-40 text-center py-10">
                                    No tiers yet.{isAdmin && " Use Manage to add tiers to this mode."}
                                </p>
                            )}

                            {sortedTiers.map((tier, tierIdx) => {
                                const entries = getEntriesForTier(tier.id);
                                return (
                                    <div key={tier.id}
                                        style={{ minHeight: rowHeight + "px" }}
                                        className={`flex ${tierIdx > 0 ? "border-t-2 border-(--outline-brown)/20" : ""}`}
                                        onDragOver={isAdmin ? (e) => { e.preventDefault(); setDragOverTierId(String(tier.id)); } : undefined}
                                        onDrop={isAdmin ? (e) => { e.preventDefault(); handleDrop(tier.id); } : undefined}
                                    >
                                        {/* Tier label */}
                                        <div className="w-16 shrink-0 relative group flex items-center justify-center font-bold text-white text-sm select-none px-1 text-center"
                                            style={{ backgroundColor: tier.color }}>
                                            {renamingTierId === tier.id ? (
                                                <div className="flex flex-col items-center gap-1 p-1 w-full" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        autoFocus
                                                        value={renamingTierName}
                                                        onChange={e => setRenamingTierName(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === "Enter") renameTier(tier.id);
                                                            if (e.key === "Escape") setRenamingTierId(null);
                                                        }}
                                                        className="w-full px-1 py-0.5 text-xs rounded bg-white/20 text-white placeholder-white/50 outline-none text-center border border-white/40"
                                                    />
                                                    <div className="flex gap-1">
                                                        <button onClick={() => renameTier(tier.id)}
                                                            className="text-xs text-white bg-white/20 px-1.5 rounded hover:bg-white/30 cursor-pointer">✓</button>
                                                        <button onClick={() => setRenamingTierId(null)}
                                                            className="text-xs text-white/70 px-1 rounded cursor-pointer">✕</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {tier.name}
                                                    {isAdmin && (
                                                        <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto bg-black/40 transition-opacity cursor-default">
                                                            <button
                                                                onClick={e => { e.stopPropagation(); setRenamingTierId(tier.id); setRenamingTierName(tier.name); }}
                                                                title="Rename"
                                                                className="text-white hover:text-white/70 cursor-pointer">
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={e => { e.stopPropagation(); deleteTier(tier.id); }}
                                                                title="Delete"
                                                                className="text-white hover:text-red-300 cursor-pointer">
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {hasSections ? (
                                            // Section columns
                                            sortedSections.map((section, i) => {
                                                const sectionEntries = entries.filter(e => {
                                                    const assigned = e.sectionId ?? localSectionMap[e.itemId];
                                                    // Orphaned items (no section assignment) fall into the first column
                                                    if (i === 0 && (assigned == null || assigned === undefined)) return true;
                                                    return assigned === section.id;
                                                });
                                                return (
                                                    <div key={section.id}
                                                        data-tier-id={tier.id}
                                                        onClick={() => isAdmin && selectedItem && placeItem(tier.id, section.id)}
                                                        onDragOver={isAdmin ? (e) => { e.preventDefault(); setDragOverTierId(String(tier.id)); } : undefined}
                                                        onDrop={isAdmin ? (e) => { e.preventDefault(); e.stopPropagation(); handleDrop(tier.id, section.id); } : undefined}
                                                        className={`flex-1 p-2 flex flex-wrap gap-2 content-start transition-colors
                                                            ${dragOverTierId == String(tier.id) ? "bg-(--primary)/15" : "bg-(--accent)"}
                                                            ${i > 0 ? "border-l-2 border-(--outline-brown)/20" : ""}
                                                            ${isAdmin && selectedItem ? "cursor-pointer hover:bg-(--surface-background)/60" : ""}`}>
                                                        {sectionEntries.map(e => renderEntry(e, tier.id))}
                                                        {isAdmin && selectedItem && (
                                                            <div className="rounded border-2 border-dashed border-(--outline-brown)/30 flex items-center justify-center opacity-50"
                                                                style={{ width: itemSize, height: itemSize }}>
                                                                <span className="text-2xl text-(--text-color)">+</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            // Flat layout
                                            <div
                                                data-tier-id={tier.id}
                                                onClick={() => isAdmin && selectedItem && placeItem(tier.id, null)}
                                                className={`flex-1 p-2 flex flex-wrap gap-2 content-start transition-colors
                                                    ${dragOverTierId == String(tier.id) ? "bg-(--primary)/15 ring-2 ring-inset ring-(--primary)/40" : "bg-(--accent)"}
                                                    ${isAdmin && selectedItem ? "cursor-pointer hover:bg-(--surface-background)/60" : ""}`}>
                                                {entries.map(e => renderEntry(e, tier.id))}
                                                {isAdmin && selectedItem && (
                                                    <div className="rounded border-2 border-dashed border-(--outline-brown)/30 flex items-center justify-center opacity-50"
                                                        style={{ width: itemSize, height: itemSize }}>
                                                        <span className="text-2xl text-(--text-color)">+</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {/* Add tier row */}
                            {isAdmin && (
                                addingTier ? (
                                    <div className="flex items-center gap-2 p-2 border-t-2 border-(--outline-brown)/20 bg-(--accent)">
                                        <input type="color" value={newTierColor} onChange={e => setNewTierColor(e.target.value)}
                                            className="w-7 h-7 rounded border border-(--outline-brown)/40 cursor-pointer p-0.5 bg-transparent shrink-0" />
                                        <input
                                            autoFocus
                                            value={newTierName}
                                            onChange={e => setNewTierName(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === "Enter") createTier();
                                                if (e.key === "Escape") setAddingTier(false);
                                            }}
                                            placeholder="Tier name (S, A, T0)..."
                                            className="flex-1 px-2 py-1 text-sm rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) outline-none"
                                        />
                                        <button onClick={createTier}
                                            className="text-xs px-2 py-1 bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90 shrink-0">Add</button>
                                        <button onClick={() => setAddingTier(false)}
                                            className="text-xs text-(--text-color) opacity-50 hover:opacity-80 cursor-pointer px-1">✕</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setAddingTier(true)}
                                        className="border-t-2 border-(--outline-brown)/20 w-full py-2 text-sm text-(--text-color) opacity-40 hover:opacity-70 cursor-pointer hover:bg-(--surface-background)/50 transition-colors">
                                        + Tier
                                    </button>
                                )
                            )}
                        </div>
                    )}

                    {/* Admin: item picker — right sidebar */}
                    {isAdmin && (
                        <div className="w-52 shrink-0 border border-(--outline-brown)/50 rounded bg-(--accent) p-3 flex flex-col gap-3 sticky top-4">
                            <p className="text-xs font-semibold text-(--text-color) opacity-60 uppercase tracking-wide">
                                {selectedItem
                                    ? `Selected: ${selectedItem.name}`
                                    : "Select to place"}
                            </p>
                            <div className="flex flex-wrap gap-1.5 overflow-y-auto max-h-[60vh]">
                                {poolItems.map(item => (
                                    <button key={item.id}
                                        onClick={() => setSelectedItem(prev => prev?.id === item.id ? null : item)}
                                        draggable
                                        onDragStart={() => { setDraggedItem(item); dragEntryRef.current = null; setSelectedItem(null); }}
                                        onDragEnd={() => { setDraggedItem(null); setDragOverTierId(null); }}
                                        onTouchStart={(e) => {
                                            const touch = e.touches[0];
                                            touchDragRef.current = { item, startX: touch.clientX, startY: touch.clientY, ghost: null };
                                        }}
                                        title={item.name}
                                        className={`w-12 h-12 rounded border-2 overflow-hidden cursor-grab active:cursor-grabbing transition-colors ${
                                            selectedItem?.id === item.id || draggedItem?.id === item.id
                                                ? "border-(--primary) ring-2 ring-(--primary)/40"
                                                : "border-(--outline-brown)/30 hover:border-(--primary)/50"
                                        }`}>
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" draggable={false} />
                                    </button>
                                ))}
                                {poolItems.length === 0 && (
                                    <p className="text-xs text-(--text-color) opacity-40 italic">
                                        No items yet. Add some in Manage.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                    </div>{/* end flex row */}

                    {!selectedMode && modes.length === 0 && (
                        <p className="text-sm text-(--text-color) opacity-40 text-center py-10">
                            No modes yet.{isAdmin && " Use Manage to add modes."}
                        </p>
                    )}
                </>
            )}

            {/* Admin manage panel */}
            {isAdmin && adminOpen && (
                <div className="border border-(--outline-brown)/50 rounded bg-(--accent) p-4 flex flex-col gap-6">
                    <h3 className="font-semibold text-(--text-color) text-lg">Manage</h3>

                    {/* Categories */}
                    <div>
                        <h4 className="text-sm font-semibold text-(--text-color) mb-1">Categories</h4>
                        <p className="text-xs text-(--text-color) opacity-50 mb-2">Top-level groups like "Units" or "Items". Each has its own item pool and modes.</p>
                        <div className="flex flex-col gap-1 mb-2">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex items-center gap-2 px-3 py-1.5 bg-(--surface-background) rounded text-sm text-(--text-color)">
                                    <span className="flex-1 truncate">{cat.name}</span>
                                    <button onClick={() => deleteCategory(cat.id)} className="text-red-700/60 hover:text-red-700 cursor-pointer text-xs">Delete</button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && createCategory()}
                                placeholder="Category name (Units, Items, Artifacts)..."
                                className="flex-1 px-2 py-1 text-sm rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) outline-none" />
                            <button onClick={createCategory} className="px-3 py-1 text-sm bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90 shrink-0">Add</button>
                        </div>
                    </div>

                    {categoryData && (
                        <>
                            {/* Item pool */}
                            <div>
                                <h4 className="text-sm font-semibold text-(--text-color) mb-1">{categoryData.name} Pool</h4>
                                <p className="text-xs text-(--text-color) opacity-50 mb-2">These items are shared across all modes in this category.</p>
                                <div className="flex flex-col gap-1 mb-3 max-h-44 overflow-y-auto">
                                    {poolItems.map(item => (
                                        <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 bg-(--surface-background) rounded text-sm text-(--text-color)">
                                            <img src={item.imageUrl} className="w-7 h-7 object-cover rounded shrink-0" alt="" />
                                            <span className="flex-1 truncate">{item.name}</span>
                                            <button onClick={() => deleteItem(item.id)} className="text-red-700/60 hover:text-red-700 cursor-pointer text-xs shrink-0">Delete</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2 items-center">
                                    <input value={newItemName} onChange={e => setNewItemName(e.target.value)}
                                        placeholder="Item name..."
                                        className="flex-1 min-w-32 px-2 py-1 text-sm rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) outline-none" />
                                    <div className="flex items-center gap-2">
                                        {newItemImageUrl && <img src={newItemImageUrl} className="w-8 h-8 object-cover rounded border border-(--outline-brown)/30" alt="" />}
                                        <button onClick={() => setShowItemImagePicker(true)}
                                            className="px-2 py-1 text-sm rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) cursor-pointer hover:opacity-80">
                                            {newItemImageUrl ? "Change Image" : "Pick Image"}
                                        </button>
                                    </div>
                                    <button onClick={createItem}
                                        disabled={!newItemName.trim() || !newItemImageUrl}
                                        className="px-3 py-1 text-sm bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Modes */}
                            <div>
                                <h4 className="text-sm font-semibold text-(--text-color) mb-1">Modes</h4>
                                <p className="text-xs text-(--text-color) opacity-50 mb-2">e.g. "Coop Mode", "PvP Mode". Each mode has its own tiers, sections, and placements.</p>
                                <div className="flex flex-col gap-1 mb-2">
                                    {modes.map(mode => (
                                        <div key={mode.id} className="flex items-center gap-2 px-3 py-1.5 bg-(--surface-background) rounded text-sm text-(--text-color)">
                                            <div className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: mode.color }} />
                                            <span className="flex-1 truncate">{mode.name}</span>
                                            <button onClick={() => deleteMode(mode.id)} className="text-red-700/60 hover:text-red-700 cursor-pointer text-xs shrink-0">Delete</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 items-center">
                                    <input type="color" value={newModeColor} onChange={e => setNewModeColor(e.target.value)}
                                        className="w-8 h-8 rounded border border-(--outline-brown)/40 cursor-pointer p-0.5 bg-transparent shrink-0" />
                                    <input value={newModeName} onChange={e => setNewModeName(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && createMode()}
                                        placeholder="Mode name (Coop Mode, PvP Mode, Guild Battle)..."
                                        className="flex-1 px-2 py-1 text-sm rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) outline-none" />
                                    <button onClick={createMode} className="px-3 py-1 text-sm bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90 shrink-0">Add</button>
                                </div>
                            </div>

                            {selectedMode && (
                                <>
                                    {/* Tiers */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-(--text-color) mb-1">
                                            Tiers — <span style={{ color: selectedMode.color }}>{selectedMode.name}</span>
                                        </h4>
                                        <p className="text-xs text-(--text-color) opacity-50 mb-2">Switch modes above to manage tiers for a different mode.</p>
                                        <div className="flex flex-col gap-1 mb-2">
                                            {sortedTiers.map((tier, idx) => (
                                                <div key={tier.id} className="flex items-center gap-2 px-3 py-1.5 bg-(--surface-background) rounded text-sm text-(--text-color)">
                                                    <div className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: tier.color }} />
                                                    <span className="flex-1 truncate">{tier.name}</span>
                                                    <div className="flex gap-0.5 shrink-0">
                                                        <button onClick={() => moveTier(tier.id, -1)} disabled={idx === 0}
                                                            className="opacity-40 hover:opacity-80 disabled:opacity-20 cursor-pointer p-0.5">
                                                            <ChevronUp className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={() => moveTier(tier.id, 1)} disabled={idx === sortedTiers.length - 1}
                                                            className="opacity-40 hover:opacity-80 disabled:opacity-20 cursor-pointer p-0.5">
                                                            <ChevronDown className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <button onClick={() => deleteTier(tier.id)} className="text-red-700/60 hover:text-red-700 cursor-pointer text-xs shrink-0">Delete</button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <input type="color" value={newTierColor} onChange={e => setNewTierColor(e.target.value)}
                                                className="w-8 h-8 rounded border border-(--outline-brown)/40 cursor-pointer p-0.5 bg-transparent shrink-0" />
                                            <input value={newTierName} onChange={e => setNewTierName(e.target.value)}
                                                onKeyDown={e => e.key === "Enter" && createTier()}
                                                placeholder="Tier name (S, A, B, T0, T0.5)..."
                                                className="flex-1 px-2 py-1 text-sm rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) outline-none" />
                                            <button onClick={createTier} className="px-3 py-1 text-sm bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90 shrink-0">Add</button>
                                        </div>
                                    </div>

                                    {/* Sections */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-(--text-color) mb-1">
                                            Sections — <span style={{ color: selectedMode.color }}>{selectedMode.name}</span>
                                        </h4>
                                        <p className="text-xs text-(--text-color) opacity-50 mb-2">
                                            Optional column dividers shown across all tiers (e.g. "DPS", "Support"). When sections exist, click a column to place items into it.
                                        </p>
                                        <div className="flex flex-col gap-1 mb-2">
                                            {sortedSections.map(section => (
                                                <div key={section.id} className="flex items-center gap-2 px-3 py-1.5 bg-(--surface-background) rounded text-sm text-(--text-color)">
                                                    <span className="flex-1 truncate">{section.name}</span>
                                                    <button onClick={() => deleteSection(section.id)} className="text-red-700/60 hover:text-red-700 cursor-pointer text-xs shrink-0">Delete</button>
                                                </div>
                                            ))}
                                            {sortedSections.length === 0 && (
                                                <p className="text-xs text-(--text-color) opacity-30 italic">No sections — tier list displays as a single row.</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <input value={newSectionName} onChange={e => setNewSectionName(e.target.value)}
                                                onKeyDown={e => e.key === "Enter" && createSection()}
                                                placeholder="Section name (DPS, Support, Healer)..."
                                                className="flex-1 px-2 py-1 text-sm rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) outline-none" />
                                            <button onClick={createSection} className="px-3 py-1 text-sm bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90 shrink-0">Add</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Image picker modal */}
            {showItemImagePicker && (
                <ImagePickerModal
                    gameId={gameId}
                    onSelect={url => { setNewItemImageUrl(url); setShowItemImagePicker(false); }}
                    onClose={() => setShowItemImagePicker(false)}
                />
            )}
        </div>
    );
}
