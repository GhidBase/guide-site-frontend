import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useRouteLoaderData } from "react-router";
import { currentAPI } from "../../config/api";
import { X } from "lucide-react";

const TierListBlock = forwardRef(function TierListBlock(
    { deleteBlock, block, updateBlockContent, adminMode, canDelete, onDirty },
    ref,
) {
    const { gameData } = useRouteLoaderData("main");
    const gameId = gameData?.id;

    const [categories, setCategories] = useState([]);
    const [tierListDisplays, setTierListDisplays] = useState(
        block?.content?.tierListDisplays ?? [],
    );
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedModeId, setSelectedModeId] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [categoryDataMap, setCategoryDataMap] = useState({});

    useEffect(() => {
        if (!gameId) return;
        loadCategories();
    }, [gameId]);

    async function loadCategories() {
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
                setSelectedCategoryId(data[0]?.id != null ? String(data[0].id) : null);
            }
        } catch {}
    }

    async function loadCategoryData(categoryId) {
        if (categoryDataMap[categoryId]) {
            setSelectedModeId(categoryDataMap[categoryId].modes?.[0]?.id != null ? String(categoryDataMap[categoryId].modes[0].id) : null);
            return;
        }
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${categoryId}`);
            if (res.ok) {
                const data = await res.json();
                setCategoryDataMap(prev => ({ ...prev, [categoryId]: data }));
                setSelectedModeId(data.modes?.[0]?.id != null ? String(data.modes[0].id) : null);
            }
        } catch {}
    }

    useEffect(() => {
        if (selectedCategoryId && adminMode) loadCategoryData(selectedCategoryId);
    }, [selectedCategoryId, adminMode]);

    const selectedCategory = categories.find(c => String(c.id) === String(selectedCategoryId));
    const selectedCategoryData = categoryDataMap[selectedCategoryId];

    function handleAddTierList() {
        if (!selectedCategoryId || !selectedModeId) {
            alert("Please select both a category and a mode");
            return;
        }
        const newDisplay = {
            id: Math.random().toString(36),
            categoryId: selectedCategoryId,
            categoryName: selectedCategory?.name,
            modeId: selectedModeId,
            modeName: selectedCategoryData?.modes?.find(m => String(m.id) === String(selectedModeId))?.name ?? "Unknown Mode",
        };
        const newDisplays = [...tierListDisplays, newDisplay];
        setTierListDisplays(newDisplays);
        setIsDirty(true);
        onDirty?.(block.id, true);
    }

    function handleRemoveTierList(displayId) {
        const newDisplays = tierListDisplays.filter(d => d.id !== displayId);
        setTierListDisplays(newDisplays);
        setIsDirty(true);
        onDirty?.(block.id, true);
    }

    async function handleSave() {
        await updateBlockContent(block, { tierListDisplays });
        setIsDirty(false);
        onDirty?.(block.id, false);
    }

    useImperativeHandle(ref, () => ({
        async save() { if (isDirty) return handleSave(); },
    }), [isDirty, tierListDisplays]);

    function checkDeletion() {
        if (window.confirm("Are you sure you want to delete this block?")) deleteBlock();
    }

    return (
        <div
            id={`tier-list-block-${block.id}`}
            className={`relative content-block bg-(--surface-background) w-full text-(--text-color) ${
                adminMode && "border-b border-(--primary) mb-0 bg-black/3 md:rounded"
            }`}
        >
            {adminMode && (
                <div className="absolute top-2 right-3 flex items-center gap-2 z-10 pointer-events-none">
                    {isDirty && <span className="text-xs text-(--primary) opacity-70 pointer-events-none">unsaved</span>}
                    {canDelete && (
                        <button onClick={checkDeletion}
                            className="text-xs text-red-700/60 hover:text-red-700 pointer-events-auto cursor-pointer">
                            Delete
                        </button>
                    )}
                </div>
            )}

            {adminMode ? (
                <div className="p-6 bg-black/5">
                    <h3 className="text-lg font-semibold mb-4">Tier Lists in Block</h3>

                    {/* Add tier list */}
                    <div className="mb-6">
                        <div className="flex gap-4 mb-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select value={selectedCategoryId ?? ""}
                                    onChange={e => setSelectedCategoryId(e.target.value || null)}
                                    className="w-full px-3 py-2 bg-(--surface-background) border border-(--outline) rounded text-(--text-color)">
                                    <option value="">Select category...</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            {selectedCategoryData && (
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-2">Mode</label>
                                    <select value={selectedModeId ?? ""}
                                        onChange={e => setSelectedModeId(e.target.value || null)}
                                        className="w-full px-3 py-2 bg-(--surface-background) border border-(--outline) rounded text-(--text-color)">
                                        <option value="">Select mode...</option>
                                        {selectedCategoryData.modes?.map(mode => (
                                            <option key={mode.id} value={mode.id}>{mode.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <button onClick={handleAddTierList}
                            className="px-4 py-2 bg-(--primary) text-amber-50 rounded hover:opacity-90 font-medium">
                            Add Tier List
                        </button>
                    </div>

                    {/* Selected tier lists */}
                    {tierListDisplays.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-(--outline)">
                            <h4 className="text-sm font-semibold mb-3">Selected Tier Lists:</h4>
                            <div className="space-y-2">
                                {tierListDisplays.map(display => (
                                    <div key={display.id}
                                        className="flex items-center justify-between p-3 bg-(--surface-background) border border-(--outline) rounded">
                                        <span className="text-sm">{display.categoryName} — {display.modeName}</span>
                                        <button onClick={() => handleRemoveTierList(display.id)}
                                            className="text-red-600 hover:text-red-700 p-1 cursor-pointer">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-(--text-color) opacity-40 mt-3 italic">
                                Sections and placements are configured from the Tier List admin page.
                            </p>
                        </div>
                    )}

                    {isDirty && (
                        <div className="mt-4 pt-4 border-t border-(--outline) flex gap-2">
                            <button onClick={handleSave}
                                className="px-4 py-2 bg-green-700/50 hover:bg-green-700/60 text-amber-50 rounded font-medium">
                                Save
                            </button>
                        </div>
                    )}
                </div>
            ) : tierListDisplays.length > 0 ? (
                <div className="px-8 py-6">
                    <div className="space-y-8">
                        {tierListDisplays.map(display => (
                            <TierListDisplay key={display.id} gameId={gameId} display={display} />
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
});

export default TierListBlock;

// ── Render a single tier list ───────────────────────────────────

function TierListDisplay({ gameId, display }) {
    const [categoryData, setCategoryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const rowHeight = 80;
    const itemSize = 64;

    // Read local section assignments written by the TierList admin page
    const localSectionsStore = (() => {
        try {
            const saved = typeof window !== "undefined" && localStorage.getItem(`tier-local-sections-${gameId}`);
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    })();
    const localSectionMap = localSectionsStore[`${display.categoryId}:${display.modeId}`] ?? {};

    useEffect(() => { loadData(); }, [display.categoryId]);

    async function loadData() {
        try {
            const res = await fetch(`${currentAPI}/games/${gameId}/tier-categories/${display.categoryId}`);
            if (res.ok) setCategoryData(await res.json());
        } catch {}
        finally { setLoading(false); }
    }

    if (loading) return <div className="text-sm opacity-60">Loading...</div>;
    if (!categoryData) return <div className="text-sm opacity-60">Unable to load tier list</div>;

    const selectedMode = categoryData.modes?.find(m => String(m.id) === String(display.modeId));
    if (!selectedMode) return <div className="text-sm opacity-60">Mode not found</div>;

    const sortedTiers = [...(selectedMode.tiers ?? [])].sort((a, b) => a.order - b.order);
    const sortedSections = [...(selectedMode.sections ?? [])].sort((a, b) => a.order - b.order);
    const hasSections = sortedSections.length > 0;
    const itemsById = Object.fromEntries(categoryData.items?.map(i => [i.id, i]) ?? []);

    function getEntriesForTier(tierId) {
        return [...(selectedMode.tiers.find(t => String(t.id) === String(tierId))?.entries ?? [])]
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    function renderItem(entry) {
        const item = itemsById[entry.itemId] ?? itemsById[String(entry.itemId)];
        if (!item) return null;
        return (
            <div key={entry.id} className="flex flex-col items-center shrink-0">
                <img src={item.imageUrl} alt={item.name}
                    style={{ width: itemSize, height: itemSize }}
                    className="object-cover rounded border border-(--outline)"
                    title={item.name}
                />
                <span className="text-xs text-center mt-1 truncate" style={{ maxWidth: itemSize }}>
                    {item.name}
                </span>
            </div>
        );
    }

    return (
        <div className="border border-(--outline) rounded overflow-hidden">
            {/* Header */}
            <div className="bg-(--primary) px-4 py-2 flex items-center gap-3">
                <h4 className="font-semibold text-amber-50 flex-1">
                    {display.categoryName} — {display.modeName}
                </h4>
            </div>

            {/* Section column headers */}
            {hasSections && (
                <div className="flex border-b-2 border-(--outline) bg-(--accent)">
                    <div className="w-20 shrink-0" />
                    {sortedSections.map((section, i) => (
                        <div key={section.id}
                            className={`flex-1 py-2 text-center text-sm font-semibold text-(--text-color) ${i > 0 ? "border-l border-(--outline)" : ""}`}>
                            {section.name}
                        </div>
                    ))}
                </div>
            )}

            {/* Tier rows */}
            <div className="divide-y divide-(--outline)">
                {sortedTiers.map(tier => {
                    const entries = getEntriesForTier(tier.id);
                    return (
                        <div key={tier.id} className="flex" style={{ minHeight: rowHeight }}>
                            <div className="w-20 shrink-0 flex items-center justify-center font-bold text-white text-sm select-none px-1 text-center"
                                style={{ backgroundColor: tier.color ?? "#6366f1" }}>
                                {tier.name}
                            </div>

                            {hasSections ? (
                                sortedSections.map((section, i) => {
                                    const sectionEntries = entries.filter(e => {
                                        const assigned = e.sectionId ?? localSectionMap[e.itemId];
                                        if (i === 0 && (assigned == null || assigned === undefined)) return true;
                                        return String(assigned) === String(section.id);
                                    });
                                    return (
                                        <div key={section.id}
                                            className={`flex-1 px-3 py-2 flex flex-wrap gap-2 content-start bg-(--surface-background) ${i > 0 ? "border-l border-(--outline)" : ""}`}>
                                            {sectionEntries.map(renderItem)}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex-1 px-4 py-2 flex flex-wrap gap-3 items-center bg-(--surface-background)">
                                    {entries.length > 0
                                        ? entries.map(renderItem)
                                        : <span className="text-sm opacity-50">(empty)</span>
                                    }
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
