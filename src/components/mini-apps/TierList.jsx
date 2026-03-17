import { useState, useEffect } from "react";
import { currentAPI } from "../../config/api";
import { useRouteLoaderData } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import ImagePickerModal from "../ImagePickerModal.jsx";

export default function TierList() {
    const { gameData } = useRouteLoaderData("main");
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";
    const gameId = gameData?.id;

    // Top-level categories ("Units", "Items", etc.)
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    // Full data for selected category (items + modes with tiers + entries)
    const [categoryData, setCategoryData] = useState(null);
    // Selected mode within the category
    const [selectedModeId, setSelectedModeId] = useState(null);

    // Admin state
    const [adminOpen, setAdminOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showItemImagePicker, setShowItemImagePicker] = useState(false);

    // Admin forms
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newItemName, setNewItemName] = useState("");
    const [newItemImageUrl, setNewItemImageUrl] = useState("");
    const [newModeName, setNewModeName] = useState("");
    const [newModeColor, setNewModeColor] = useState("#6366f1");
    const [newTierName, setNewTierName] = useState("");
    const [newTierColor, setNewTierColor] = useState("#ef4444");

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
    const poolItems = categoryData?.items ?? [];
    const itemsById = Object.fromEntries(poolItems.map(i => [i.id, i]));
    const modes = [...(categoryData?.modes ?? [])].sort((a, b) => a.order - b.order);
    const selectedMode = modes.find(m => m.id === selectedModeId) ?? null;
    const sortedTiers = [...(selectedMode?.tiers ?? [])].sort((a, b) => a.order - b.order);

    function getEntriesForTier(tierId) {
        return [...(selectedMode?.tiers.find(t => t.id === tierId)?.entries ?? [])]
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    // ── Categories ─────────────────────────────────────────
    async function createCategory() {
        if (!newCategoryName.trim()) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
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
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: newItemName.trim(), imageUrl: newItemImageUrl, order: poolItems.length }),
            });
            if (res.ok) {
                setNewItemName(""); setNewItemImageUrl("");
                await loadCategoryData(selectedCategoryId);
            }
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
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
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

    // ── Tiers ───────────────────────────────────────────────
    async function createTier() {
        if (!newTierName.trim() || !selectedModeId) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes/${selectedModeId}/tiers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: newTierName.trim(), color: newTierColor, order: sortedTiers.length }),
            });
            if (res.ok) { setNewTierName(""); await loadCategoryData(selectedCategoryId); }
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

    // ── Entries (placements) ────────────────────────────────
    async function placeItem(tierId) {
        if (!selectedItem || !selectedModeId) return;
        const tier = selectedMode?.tiers.find(t => t.id === tierId);
        if (tier?.entries?.find(e => e.itemId === selectedItem.id)) return; // already there
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${selectedCategoryId}/modes/${selectedModeId}/entries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
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

    return (
        <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto p-4">

            {/* Category tabs (Units, Items, etc.) */}
            {categories.length > 0 && (
                <div className="flex items-center gap-1 border-b-2 border-(--outline-brown)/30 overflow-x-auto pb-px">
                    {categories.map(cat => (
                        <button key={cat.id}
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className={`px-4 py-2 text-sm font-semibold rounded-t cursor-pointer whitespace-nowrap transition-colors shrink-0 ${
                                cat.id === selectedCategoryId
                                    ? "bg-(--primary) text-amber-50"
                                    : "text-(--text-color) hover:bg-(--surface-background)"
                            }`}>
                            {cat.name}
                        </button>
                    ))}
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
                    {/* Mode tabs (Coop Mode, PvP Mode, etc.) */}
                    {modes.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {modes.map(mode => (
                                <button key={mode.id}
                                    onClick={() => setSelectedModeId(mode.id)}
                                    className={`px-4 py-1.5 text-sm font-semibold rounded cursor-pointer transition-colors whitespace-nowrap ${
                                        mode.id === selectedModeId ? "text-white" : "text-(--text-color) bg-(--surface-background) hover:opacity-80"
                                    }`}
                                    style={mode.id === selectedModeId ? { backgroundColor: mode.color } : {}}>
                                    {mode.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Tier grid */}
                    {selectedMode && (
                        <div className="flex flex-col rounded-lg overflow-hidden border-2 border-(--outline-brown)/30">
                            {sortedTiers.length === 0 && (
                                <p className="text-sm text-(--text-color) opacity-40 text-center py-10">
                                    No tiers yet.{isAdmin && " Use Manage to add tiers to this mode."}
                                </p>
                            )}
                            {sortedTiers.map((tier, tierIdx) => {
                                const entries = getEntriesForTier(tier.id);
                                return (
                                    <div key={tier.id}
                                        className={`flex min-h-24 ${tierIdx > 0 ? "border-t-2 border-(--outline-brown)/20" : ""}`}>
                                        {/* Tier label */}
                                        <div className="w-16 shrink-0 flex items-center justify-center font-bold text-white text-sm select-none"
                                            style={{ backgroundColor: tier.color }}>
                                            {tier.name}
                                        </div>
                                        {/* Items */}
                                        <div
                                            onClick={() => isAdmin && selectedItem && placeItem(tier.id)}
                                            className={`flex-1 p-2 flex flex-wrap gap-2 content-start bg-(--accent)
                                                ${isAdmin && selectedItem ? "cursor-pointer hover:bg-(--surface-background)/60 transition-colors" : ""}
                                            `}
                                        >
                                            {entries.map(entry => {
                                                const item = itemsById[entry.itemId];
                                                if (!item) return null;
                                                return (
                                                    <div key={entry.id} className="relative group shrink-0 flex flex-col items-center">
                                                        <div className="w-16 h-16 rounded overflow-hidden border border-(--outline-brown)/30">
                                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <p className="text-xs text-center text-(--text-color) opacity-70 mt-0.5 w-16 truncate">
                                                            {item.name}
                                                        </p>
                                                        {isAdmin && (
                                                            <button
                                                                onClick={e => { e.stopPropagation(); removeEntry(entry.id); }}
                                                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full hidden group-hover:flex items-center justify-center cursor-pointer z-10"
                                                            >
                                                                <X className="w-2.5 h-2.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {isAdmin && selectedItem && (
                                                <div className="w-16 h-16 rounded border-2 border-dashed border-(--outline-brown)/30 flex items-center justify-center opacity-50">
                                                    <span className="text-2xl text-(--text-color)">+</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!selectedMode && modes.length === 0 && (
                        <p className="text-sm text-(--text-color) opacity-40 text-center py-10">
                            No modes yet.{isAdmin && " Use Manage to add modes."}
                        </p>
                    )}

                    {/* Admin: item picker */}
                    {isAdmin && adminOpen && (
                        <div className="border border-(--outline-brown)/50 rounded bg-(--accent) p-4 flex flex-col gap-3">
                            <p className="text-xs font-semibold text-(--text-color) opacity-60 uppercase tracking-wide">
                                {selectedItem
                                    ? `Selected: ${selectedItem.name} — click a tier row to place`
                                    : `Select a ${categoryData.name.toLowerCase().replace(/s$/, "")} to place in a tier`}
                            </p>
                            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                                {poolItems.map(item => (
                                    <button key={item.id}
                                        onClick={() => setSelectedItem(prev => prev?.id === item.id ? null : item)}
                                        title={item.name}
                                        className={`w-12 h-12 rounded border-2 overflow-hidden cursor-pointer transition-colors ${
                                            selectedItem?.id === item.id
                                                ? "border-(--primary) ring-2 ring-(--primary)/40"
                                                : "border-(--outline-brown)/30 hover:border-(--primary)/50"
                                        }`}>
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" draggable={false} />
                                    </button>
                                ))}
                                {poolItems.length === 0 && (
                                    <p className="text-xs text-(--text-color) opacity-40 italic">
                                        No items in the pool yet. Add some in the Manage panel.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Admin manage panel — shown even without a selected category */}
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
                                <p className="text-xs text-(--text-color) opacity-50 mb-2">e.g. "Coop Mode", "PvP Mode". Each mode has its own tiers and placements.</p>
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

                            {/* Tiers — for the currently selected mode */}
                            {selectedMode && (
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
