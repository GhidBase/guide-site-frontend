import { useState, useEffect } from "react";
import { currentAPI } from "../../config/api";
import { useRouteLoaderData } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { X, Search, ChevronUp, ChevronDown } from "lucide-react";

export default function TierList() {
    const { gameData } = useRouteLoaderData("main");
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";
    const gameId = gameData?.id;

    const [tierLists, setTierLists] = useState([]);
    const [selectedListId, setSelectedListId] = useState(null);
    const [tiers, setTiers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [entries, setEntries] = useState([]);

    const [selectedCategoryId, setSelectedCategoryId] = useState("all");
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [adminOpen, setAdminOpen] = useState(false);

    // Unit pool (reuse board builder units)
    const [unitCategories, setUnitCategories] = useState([]);

    // Admin forms
    const [newListName, setNewListName] = useState("");
    const [newTier, setNewTier] = useState({ name: "", color: "#ef4444" });
    const [newCategory, setNewCategory] = useState({ name: "", color: "#6366f1" });

    useEffect(() => {
        if (!gameId) return;
        loadTierLists();
        loadUnitCategories();
    }, [gameId]);

    useEffect(() => {
        if (!selectedListId) return;
        loadTiers();
        loadCategories();
        loadEntries();
    }, [selectedListId]);

    async function loadTierLists() {
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-lists`);
            if (res.ok) {
                const data = await res.json();
                setTierLists(data);
                setSelectedListId(prev => prev ?? data[0]?.id ?? null);
            }
        } catch {}
    }

    async function loadTiers() {
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-lists/${selectedListId}/tiers`);
            if (res.ok) setTiers(await res.json());
        } catch {}
    }

    async function loadCategories() {
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-lists/${selectedListId}/categories`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
                setSelectedCategoryId(prev =>
                    prev === "all" || data.find(c => c.id === prev) ? prev : "all"
                );
            }
        } catch {}
    }

    async function loadEntries() {
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-lists/${selectedListId}/entries`);
            if (res.ok) setEntries(await res.json());
        } catch {}
    }

    async function loadUnitCategories() {
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/unit-categories`);
            if (res.ok) setUnitCategories(await res.json());
        } catch {}
    }

    const allUnits = unitCategories.flatMap(c => c.units ?? []);
    const unitsById = Object.fromEntries(allUnits.map(u => [u.id, u]));
    const filteredUnits = searchQuery.trim()
        ? allUnits.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : allUnits;

    const sortedTiers = [...tiers].sort((a, b) => a.order - b.order);
    const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
    const visibleCategories = selectedCategoryId === "all"
        ? sortedCategories
        : sortedCategories.filter(c => c.id === selectedCategoryId);

    function getEntries(tierId, categoryId) {
        return entries.filter(e => e.tierId === tierId && e.categoryId === categoryId);
    }

    async function placeUnit(tierId, categoryId) {
        if (!selectedUnit || !isAdmin) return;
        const alreadyPlaced = entries.find(
            e => e.tierId === tierId && e.categoryId === categoryId && e.unitId === selectedUnit.id
        );
        if (alreadyPlaced) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-lists/${selectedListId}/entries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ tierId, categoryId, unitId: selectedUnit.id }),
            });
            if (res.ok) await loadEntries();
        } catch {}
    }

    async function removeEntry(entryId) {
        try {
            const res = await fetch(
                `${currentAPI}/games/${gameId}/tier-lists/${selectedListId}/entries/${entryId}`,
                { method: "DELETE", credentials: "include" }
            );
            if (res.ok) await loadEntries();
        } catch {}
    }

    async function createTierList() {
        if (!newListName.trim()) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-lists`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: newListName.trim() }),
            });
            if (res.ok) {
                const data = await res.json();
                setNewListName("");
                await loadTierLists();
                setSelectedListId(data.id);
            }
        } catch {}
    }

    async function deleteTierList(id) {
        if (!window.confirm("Delete this tier list and all its contents?")) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-lists/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                if (selectedListId === id) setSelectedListId(null);
                await loadTierLists();
            }
        } catch {}
    }

    async function createTier() {
        if (!newTier.name.trim()) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-lists/${selectedListId}/tiers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: newTier.name.trim(), color: newTier.color, order: tiers.length }),
            });
            if (res.ok) { setNewTier({ name: "", color: "#ef4444" }); await loadTiers(); }
        } catch {}
    }

    async function deleteTier(id) {
        try {
            const res = await fetch(
                `${currentAPI}/games/${gameId}/tier-lists/${selectedListId}/tiers/${id}`,
                { method: "DELETE", credentials: "include" }
            );
            if (res.ok) await loadTiers();
        } catch {}
    }

    async function moveTier(id, direction) {
        const sorted = [...tiers].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex(t => t.id === id);
        const swapIdx = idx + direction;
        if (swapIdx < 0 || swapIdx >= sorted.length) return;
        const a = sorted[idx], b = sorted[swapIdx];
        try {
            await Promise.all([
                fetch(`${currentAPI}/games/${gameId}/tier-lists/${selectedListId}/tiers/${a.id}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
                    body: JSON.stringify({ order: b.order }),
                }),
                fetch(`${currentAPI}/games/${gameId}/tier-lists/${selectedListId}/tiers/${b.id}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
                    body: JSON.stringify({ order: a.order }),
                }),
            ]);
            await loadTiers();
        } catch {}
    }

    async function createCategory() {
        if (!newCategory.name.trim()) return;
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-lists/${selectedListId}/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: newCategory.name.trim(), color: newCategory.color, order: categories.length }),
            });
            if (res.ok) { setNewCategory({ name: "", color: "#6366f1" }); await loadCategories(); }
        } catch {}
    }

    async function deleteCategory(id) {
        try {
            const res = await fetch(
                `${currentAPI}/games/${gameId}/tier-lists/${selectedListId}/categories/${id}`,
                { method: "DELETE", credentials: "include" }
            );
            if (res.ok) await loadCategories();
        } catch {}
    }

    async function moveCategory(id, direction) {
        const sorted = [...categories].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex(c => c.id === id);
        const swapIdx = idx + direction;
        if (swapIdx < 0 || swapIdx >= sorted.length) return;
        const a = sorted[idx], b = sorted[swapIdx];
        try {
            await Promise.all([
                fetch(`${currentAPI}/games/${gameId}/tier-lists/${selectedListId}/categories/${a.id}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
                    body: JSON.stringify({ order: b.order }),
                }),
                fetch(`${currentAPI}/games/${gameId}/tier-lists/${selectedListId}/categories/${b.id}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
                    body: JSON.stringify({ order: a.order }),
                }),
            ]);
            await loadCategories();
        } catch {}
    }

    const selectedList = tierLists.find(tl => tl.id === selectedListId);

    return (
        <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto p-4">

            {/* Tier list tabs */}
            {tierLists.length > 0 && (
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {tierLists.map(tl => (
                        <button key={tl.id} onClick={() => setSelectedListId(tl.id)}
                            className={`px-3 py-1 text-sm rounded-t cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                                tl.id === selectedListId
                                    ? "bg-(--primary) text-amber-50"
                                    : "bg-(--accent) text-(--text-color) border border-(--outline-brown)/40 hover:bg-(--surface-background)"
                            }`}>
                            {tl.name}
                        </button>
                    ))}
                </div>
            )}

            {tierLists.length === 0 && !isAdmin && (
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

            {selectedList && (
                <>
                    {/* Category tabs */}
                    {sortedCategories.length > 0 && (
                        <div className="flex items-center gap-1 border-b-2 border-(--outline-brown)/20 pb-1 overflow-x-auto">
                            <button
                                onClick={() => setSelectedCategoryId("all")}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-t cursor-pointer whitespace-nowrap transition-colors ${
                                    selectedCategoryId === "all"
                                        ? "bg-(--primary) text-amber-50"
                                        : "text-(--text-color) hover:bg-(--surface-background)"
                                }`}>
                                All
                            </button>
                            {sortedCategories.map(cat => (
                                <button key={cat.id} onClick={() => setSelectedCategoryId(cat.id)}
                                    className={`px-4 py-1.5 text-sm font-semibold rounded-t cursor-pointer whitespace-nowrap transition-colors ${
                                        selectedCategoryId === cat.id ? "text-white" : "text-(--text-color) hover:bg-(--surface-background)"
                                    }`}
                                    style={selectedCategoryId === cat.id ? { backgroundColor: cat.color } : {}}>
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Column headers (when showing all categories) */}
                    {selectedCategoryId === "all" && sortedCategories.length > 1 && (
                        <div className="flex">
                            <div className="w-16 shrink-0" />
                            {sortedCategories.map(cat => (
                                <div key={cat.id} className="flex-1 min-w-0 text-center py-1">
                                    <span className="text-xs font-bold uppercase tracking-wide"
                                        style={{ color: cat.color }}>
                                        {cat.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tier rows */}
                    <div className="flex flex-col rounded-lg overflow-hidden border-2 border-(--outline-brown)/30">
                        {sortedTiers.length === 0 && (
                            <p className="text-sm text-(--text-color) opacity-40 text-center py-10">
                                No tiers yet.{isAdmin && " Use Manage to add some."}
                            </p>
                        )}
                        {sortedTiers.map((tier, tierIdx) => (
                            <div key={tier.id}
                                className={`flex min-h-24 ${tierIdx > 0 ? "border-t-2 border-(--outline-brown)/20" : ""}`}>
                                {/* Tier label */}
                                <div className="w-16 shrink-0 flex items-center justify-center font-bold text-white text-sm select-none"
                                    style={{ backgroundColor: tier.color }}>
                                    {tier.name}
                                </div>

                                {/* Category columns */}
                                <div className="flex flex-1 min-w-0 bg-(--accent)">
                                    {visibleCategories.map((cat, catIdx) => {
                                        const cellEntries = getEntries(tier.id, cat.id);
                                        return (
                                            <div key={cat.id}
                                                onClick={() => isAdmin && selectedUnit && placeUnit(tier.id, cat.id)}
                                                className={`flex-1 min-w-0 p-2 flex flex-wrap gap-1.5 content-start
                                                    ${catIdx > 0 ? "border-l border-(--outline-brown)/20" : ""}
                                                    ${isAdmin && selectedUnit ? "cursor-pointer hover:bg-(--surface-background)/60 transition-colors" : ""}
                                                `}>
                                                {cellEntries.map(entry => {
                                                    const unit = unitsById[entry.unitId];
                                                    if (!unit) return null;
                                                    return (
                                                        <div key={entry.id} className="relative group shrink-0 flex flex-col items-center">
                                                            <div className="w-14 h-14 rounded overflow-hidden border border-(--outline-brown)/30">
                                                                <img src={unit.imageUrl} alt={unit.name}
                                                                    className="w-full h-full object-cover" />
                                                            </div>
                                                            <p className="text-xs text-center text-(--text-color) opacity-70 mt-0.5 w-14 truncate">
                                                                {unit.name}
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
                                                {isAdmin && selectedUnit && cellEntries.length === 0 && (
                                                    <div className="w-14 h-14 rounded border-2 border-dashed border-(--outline-brown)/30 flex items-center justify-center">
                                                        <span className="text-lg text-(--text-color) opacity-20">+</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {visibleCategories.length === 0 && (
                                        <p className="p-2 text-xs text-(--text-color) opacity-30 italic flex items-center">
                                            No categories configured
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Admin: unit picker */}
                    {isAdmin && adminOpen && (
                        <div className="border border-(--outline-brown)/50 rounded bg-(--accent) p-4 flex flex-col gap-3">
                            <p className="text-xs font-semibold text-(--text-color) opacity-60 uppercase tracking-wide">
                                {selectedUnit
                                    ? `Selected: ${selectedUnit.name} — click a cell to place`
                                    : "Select a unit, then click a tier cell to place it"}
                            </p>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-(--surface-background) border border-(--outline-brown)/40">
                                <Search className="w-4 h-4 text-(--text-color) opacity-50 shrink-0" />
                                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search units..."
                                    className="flex-1 bg-transparent text-(--text-color) text-sm outline-none border-0" />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery("")} className="opacity-40 hover:opacity-80 cursor-pointer">
                                        <X className="w-4 h-4 text-(--text-color)" />
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                                {filteredUnits.map(unit => (
                                    <button key={unit.id}
                                        onClick={() => setSelectedUnit(prev => prev?.id === unit.id ? null : unit)}
                                        title={unit.name}
                                        className={`w-12 h-12 rounded border-2 flex items-center justify-center p-0.5 cursor-pointer transition-colors ${
                                            selectedUnit?.id === unit.id
                                                ? "border-(--primary) bg-(--primary)/20"
                                                : "border-(--outline-brown)/30 bg-(--surface-background) hover:border-(--primary)/50"
                                        }`}>
                                        <img src={unit.imageUrl} alt={unit.name} className="w-full h-full object-contain" draggable={false} />
                                    </button>
                                ))}
                                {filteredUnits.length === 0 && (
                                    <p className="text-xs text-(--text-color) opacity-40 italic">No units found</p>
                                )}
                                {allUnits.length === 0 && (
                                    <p className="text-xs text-(--text-color) opacity-40 italic">
                                        No units in the unit pool yet. Add some via the Board Builder manage panel.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Admin: management panel */}
                    {isAdmin && adminOpen && (
                        <div className="border border-(--outline-brown)/50 rounded bg-(--accent) p-4 flex flex-col gap-6">
                            <h3 className="font-semibold text-(--text-color) text-lg">Manage</h3>

                            {/* Tier Lists */}
                            <div>
                                <h4 className="text-sm font-semibold text-(--text-color) mb-2">Tier Lists</h4>
                                <div className="flex flex-col gap-1 mb-2">
                                    {tierLists.map(tl => (
                                        <div key={tl.id} className="flex items-center gap-2 px-3 py-1.5 bg-(--surface-background) rounded text-sm text-(--text-color)">
                                            <span className="flex-1 truncate">{tl.name}</span>
                                            <button onClick={() => deleteTierList(tl.id)} className="text-red-700/60 hover:text-red-700 cursor-pointer text-xs">Delete</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input value={newListName} onChange={e => setNewListName(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && createTierList()}
                                        placeholder="New tier list name..."
                                        className="flex-1 px-2 py-1 text-sm rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) outline-none" />
                                    <button onClick={createTierList} className="px-3 py-1 text-sm bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90 shrink-0">Add</button>
                                </div>
                            </div>

                            {/* Tiers (rows) */}
                            <div>
                                <h4 className="text-sm font-semibold text-(--text-color) mb-2">Tiers (Rows)</h4>
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
                                    <input type="color" value={newTier.color}
                                        onChange={e => setNewTier(p => ({ ...p, color: e.target.value }))}
                                        className="w-8 h-8 rounded border border-(--outline-brown)/40 cursor-pointer p-0.5 bg-transparent shrink-0" />
                                    <input value={newTier.name} onChange={e => setNewTier(p => ({ ...p, name: e.target.value }))}
                                        onKeyDown={e => e.key === "Enter" && createTier()}
                                        placeholder="Tier name (S, A, T0, T0.5)..."
                                        className="flex-1 px-2 py-1 text-sm rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) outline-none" />
                                    <button onClick={createTier} className="px-3 py-1 text-sm bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90 shrink-0">Add</button>
                                </div>
                            </div>

                            {/* Categories (columns/tabs) */}
                            <div>
                                <h4 className="text-sm font-semibold text-(--text-color) mb-2">Categories (Columns)</h4>
                                <div className="flex flex-col gap-1 mb-2">
                                    {sortedCategories.map((cat, idx) => (
                                        <div key={cat.id} className="flex items-center gap-2 px-3 py-1.5 bg-(--surface-background) rounded text-sm text-(--text-color)">
                                            <div className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: cat.color }} />
                                            <span className="flex-1 truncate">{cat.name}</span>
                                            <div className="flex gap-0.5 shrink-0">
                                                <button onClick={() => moveCategory(cat.id, -1)} disabled={idx === 0}
                                                    className="opacity-40 hover:opacity-80 disabled:opacity-20 cursor-pointer p-0.5">
                                                    <ChevronUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => moveCategory(cat.id, 1)} disabled={idx === sortedCategories.length - 1}
                                                    className="opacity-40 hover:opacity-80 disabled:opacity-20 cursor-pointer p-0.5">
                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <button onClick={() => deleteCategory(cat.id)} className="text-red-700/60 hover:text-red-700 cursor-pointer text-xs shrink-0">Delete</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 items-center">
                                    <input type="color" value={newCategory.color}
                                        onChange={e => setNewCategory(p => ({ ...p, color: e.target.value }))}
                                        className="w-8 h-8 rounded border border-(--outline-brown)/40 cursor-pointer p-0.5 bg-transparent shrink-0" />
                                    <input value={newCategory.name} onChange={e => setNewCategory(p => ({ ...p, name: e.target.value }))}
                                        onKeyDown={e => e.key === "Enter" && createCategory()}
                                        placeholder="Category name (DPS, Support, Tank)..."
                                        className="flex-1 px-2 py-1 text-sm rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) outline-none" />
                                    <button onClick={createCategory} className="px-3 py-1 text-sm bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90 shrink-0">Add</button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
