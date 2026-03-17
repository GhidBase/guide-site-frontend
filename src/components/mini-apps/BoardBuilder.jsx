import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { currentAPI } from "../../config/api";
import { useRouteLoaderData } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import ImagePickerModal from "../ImagePickerModal.jsx";
import { Search, X, Plus, ChevronUp, ChevronDown } from "lucide-react";

function BgControls({ bgImage, bgSize, heightScale, widthScale, onChange }) {
    if (!bgImage && (widthScale ?? 1) === 1 && (heightScale ?? 1) === 1)
        return null;
    return (
        <div className="flex flex-wrap gap-4 items-start pt-2 border-t border-(--outline-brown)/20">
            {bgImage && (
                <div className="flex flex-col gap-1">
                    <span className="text-xs opacity-50">BG size</span>
                    <div className="flex gap-1">
                        {["cover", "contain"].map((s) => (
                            <button
                                key={s}
                                onClick={() => onChange({ bgSize: s })}
                                className={`px-2 py-1 text-xs rounded border cursor-pointer capitalize transition-colors ${
                                    bgSize === s
                                        ? "bg-(--primary) border-(--primary) text-amber-50"
                                        : "bg-(--surface-background) border-(--outline-brown)/30 text-(--text-color) hover:border-(--primary)/50"
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs opacity-50">Scale</span>
                        <input
                            type="range"
                            min={50}
                            max={300}
                            step={5}
                            value={
                                bgSize?.endsWith("%") ? parseInt(bgSize) : 100
                            }
                            onChange={(e) =>
                                onChange({ bgSize: e.target.value + "%" })
                            }
                            className="w-24 accent-(--primary)"
                        />
                        <span className="text-xs opacity-50 w-8">
                            {bgSize?.endsWith("%")
                                ? bgSize
                                : bgSize === "contain"
                                  ? "fit"
                                  : "fill"}
                        </span>
                    </div>
                </div>
            )}
            <div className="flex flex-col gap-1">
                <span className="text-xs opacity-50">Board scale</span>
                {[
                    ["Width", "widthScale", widthScale],
                    ["Height", "heightScale", heightScale],
                ].map(([label, key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                        <span className="text-xs opacity-40 w-10">{label}</span>
                        <input
                            type="range"
                            min={0.25}
                            max={3}
                            step={0.05}
                            value={val ?? 1}
                            onChange={(e) =>
                                onChange({ [key]: Number(e.target.value) })
                            }
                            className="w-24 accent-(--primary)"
                        />
                        <span className="text-xs opacity-50 w-8">
                            {(val ?? 1).toFixed(2)}x
                        </span>
                        {(val ?? 1) !== 1 && (
                            <button
                                onClick={() => onChange({ [key]: 1 })}
                                className="text-xs opacity-40 hover:opacity-80 cursor-pointer px-1.5 py-0.5 rounded border border-(--outline-brown)/30"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function BoardBuilder() {
    const { gameData } = useRouteLoaderData("main");
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";
    const gameId = gameData?.id;

    const [categories, setCategories] = useState([]);
    const [boards, setBoards] = useState([]);
    const [currentBoardId, setCurrentBoardId] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // cells: { [boardId]: 2D array of unitId|null } stored in localStorage
    const [allCells, setAllCells] = useState({});

    // Admin state
    const [adminOpen, setAdminOpen] = useState(false);
    const [showUnitImagePicker, setShowUnitImagePicker] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newUnit, setNewUnit] = useState({
        name: "",
        imageUrl: "",
        categoryId: "",
    });

    // Admin board management
    const [showNewBoard, setShowNewBoard] = useState(false);
    const [newBoard, setNewBoard] = useState({
        name: "",
        rows: 5,
        cols: 7,
        bgImage: null,
        bgSize: "cover",
        bgX: 0,
        bgY: 0,
        heightScale: 1,
        widthScale: 1,
        bgPaddingX: 0,
        bgPaddingY: 0,
        gridOffsetX: 0,
        gridOffsetY: 0,
    });
    const [editingBoard, setEditingBoard] = useState(null);
    const [showBoardBgPicker, setShowBoardBgPicker] = useState(false);
    const [editBoardBgPicker, setEditBoardBgPicker] = useState(false);

    const dragUnitRef = useRef(null);
    const boardRef = useRef(null);
    const addUnitBtnRef = useRef(null);
    const storageKey = `board-cells-${gameId}`;

    // Load cells from localStorage
    useEffect(() => {
        if (!gameId) return;
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) setAllCells(JSON.parse(saved));
        } catch {}
    }, [gameId]);

    // Persist cells
    useEffect(() => {
        if (!gameId) return;
        localStorage.setItem(storageKey, JSON.stringify(allCells));
    }, [allCells, gameId]);

    // Load boards + categories
    useEffect(() => {
        if (!gameId) return;
        loadBoards();
        loadCategories();
    }, [gameId]);

    async function loadBoards() {
        try {
            const res = await fetch(
                currentAPI + "/games/" + gameId + "/boards",
            );
            if (res.ok) {
                const data = await res.json();
                setBoards(data);
                setCurrentBoardId((prev) => prev ?? data[0]?.id ?? null);
            }
        } catch {}
    }

    async function loadCategories() {
        try {
            const res = await fetch(
                currentAPI + "/games/" + gameId + "/unit-categories",
            );
            if (res.ok) setCategories(await res.json());
        } catch {}
    }

    const allUnits = categories.flatMap((c) => c.units ?? []);
    const unitsById = Object.fromEntries(allUnits.map((u) => [u.id, u]));

    const displayCategories = searchQuery.trim()
        ? [
              {
                  id: "search",
                  name: "Search Results",
                  units: allUnits.filter((u) =>
                      u.name.toLowerCase().includes(searchQuery.toLowerCase()),
                  ),
              },
          ]
        : categories;

    const currentBoard = boards.find((b) => b.id === currentBoardId) ?? null;
    // Merge editingBoard overrides so visual changes are live while editing
    const isCurrentlyEditing = editingBoard?.id === currentBoard?.id;
    const effectiveBoard = isCurrentlyEditing
        ? { ...currentBoard, ...editingBoard }
        : currentBoard;

    function getCells(boardId, rows, cols) {
        const saved = allCells[boardId];
        if (saved && saved.length === rows && saved[0]?.length === cols)
            return saved;
        return Array.from({ length: rows }, () => Array(cols).fill(null));
    }

    function setCells(boardId, cells) {
        setAllCells((prev) => ({ ...prev, [boardId]: cells }));
    }

    // Cell actions
    function handleCellClick(row, col) {
        if (!currentBoard) return;
        const cells = getCells(
            currentBoard.id,
            currentBoard.rows,
            currentBoard.cols,
        ).map((r) => [...r]);
        const existing = cells[row][col];
        cells[row][col] =
            selectedUnit && existing === selectedUnit.id
                ? null
                : selectedUnit
                  ? selectedUnit.id
                  : null;
        setCells(currentBoard.id, cells);
    }

    function handleCellRightClick(e, row, col) {
        e.preventDefault();
        if (!currentBoard) return;
        const cells = getCells(
            currentBoard.id,
            currentBoard.rows,
            currentBoard.cols,
        ).map((r) => [...r]);
        cells[row][col] = null;
        setCells(currentBoard.id, cells);
    }

    function handleDrop(e, row, col) {
        e.preventDefault();
        if (!dragUnitRef.current || !currentBoard) return;
        const unit = dragUnitRef.current;
        dragUnitRef.current = null;
        const cells = getCells(
            currentBoard.id,
            currentBoard.rows,
            currentBoard.cols,
        ).map((r) => [...r]);
        cells[row][col] = unit.id;
        setCells(currentBoard.id, cells);
    }

    async function saveAsPng() {
        if (!boardRef.current) return;
        const canvas = await html2canvas(boardRef.current, {
            backgroundColor: null,
            useCORS: true,
            allowTaint: false,
        });
        const link = document.createElement("a");
        link.download = `${effectiveBoard.name || "board"}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    }

    function clearBoard() {
        if (!currentBoard) return;
        setCells(
            currentBoard.id,
            Array.from({ length: currentBoard.rows }, () =>
                Array(currentBoard.cols).fill(null),
            ),
        );
    }

    // Admin: boards
    async function createBoard() {
        if (!newBoard.name.trim()) return;
        const res = await fetch(currentAPI + "/games/" + gameId + "/boards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(newBoard),
        });
        if (res.ok) {
            setNewBoard({
                name: "",
                rows: 5,
                cols: 7,
                bgImage: null,
                bgSize: "cover",
                bgX: 0,
                bgY: 0,
                heightScale: 1,
                widthScale: 1,
                bgPaddingX: 0,
                bgPaddingY: 0,
                gridOffsetX: 0,
                gridOffsetY: 0,
            });
            setShowNewBoard(false);
            await loadBoards();
        }
    }

    async function updateBoard() {
        if (!editingBoard) return;
        const res = await fetch(
            currentAPI + "/games/" + gameId + "/boards/" + editingBoard.id,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: editingBoard.name,
                    rows: editingBoard.rows,
                    cols: editingBoard.cols,
                    bgImage: editingBoard.bgImage,
                    bgSize: editingBoard.bgSize,
                    bgX: editingBoard.bgX,
                    bgY: editingBoard.bgY,
                    heightScale: editingBoard.heightScale,
                    widthScale: editingBoard.widthScale,
                    bgPaddingX: editingBoard.bgPaddingX,
                    bgPaddingY: editingBoard.bgPaddingY,
                    gridOffsetX: editingBoard.gridOffsetX,
                    gridOffsetY: editingBoard.gridOffsetY,
                }),
            },
        );
        if (res.ok) {
            setEditingBoard(null);
            await loadBoards();
        }
    }

    async function moveBoard(boardId, direction) {
        const idx = boards.findIndex((b) => b.id === boardId);
        const swapIdx = idx + direction;
        if (swapIdx < 0 || swapIdx >= boards.length) return;
        const a = boards[idx],
            b = boards[swapIdx];
        await Promise.all([
            fetch(currentAPI + "/games/" + gameId + "/boards/" + a.id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ order: b.order }),
            }),
            fetch(currentAPI + "/games/" + gameId + "/boards/" + b.id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ order: a.order }),
            }),
        ]);
        await loadBoards();
    }

    async function copyBoard(b) {
        const res = await fetch(currentAPI + "/games/" + gameId + "/boards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                name: b.name + " (copy)",
                rows: b.rows,
                cols: b.cols,
                bgImage: b.bgImage,
                bgSize: b.bgSize,
                bgX: b.bgX,
                bgY: b.bgY,
                heightScale: b.heightScale,
                widthScale: b.widthScale,
                bgPaddingX: b.bgPaddingX,
                bgPaddingY: b.bgPaddingY,
                gridOffsetX: b.gridOffsetX,
                gridOffsetY: b.gridOffsetY,
            }),
        });
        if (res.ok) {
            const data = await res.json();
            await loadBoards();
            setCurrentBoardId(data.id);
        }
    }

    async function deleteBoard(id) {
        if (!window.confirm("Delete this board configuration?")) return;
        const res = await fetch(
            currentAPI + "/games/" + gameId + "/boards/" + id,
            {
                method: "DELETE",
                credentials: "include",
            },
        );
        if (res.ok) {
            if (currentBoardId === id) setCurrentBoardId(null);
            await loadBoards();
        }
    }

    // Admin: categories
    async function createCategory() {
        if (!newCategoryName.trim()) return;
        const res = await fetch(
            currentAPI + "/games/" + gameId + "/unit-categories",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: newCategoryName.trim() }),
            },
        );
        if (res.ok) {
            setNewCategoryName("");
            await loadCategories();
        }
    }

    async function deleteCategory(id) {
        if (!window.confirm("Delete this category and all its units?")) return;
        const res = await fetch(
            currentAPI + "/games/" + gameId + "/unit-categories/" + id,
            {
                method: "DELETE",
                credentials: "include",
            },
        );
        if (res.ok) await loadCategories();
    }

    // Admin: units
    async function createUnit() {
        if (!newUnit.name.trim() || !newUnit.imageUrl || !newUnit.categoryId)
            return;
        const res = await fetch(currentAPI + "/games/" + gameId + "/units", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(newUnit),
        });
        if (res.ok) {
            setNewUnit((p) => ({
                name: "",
                imageUrl: "",
                categoryId: p.categoryId,
            }));
            await loadCategories();
        }
    }

    async function deleteUnit(id) {
        const res = await fetch(
            currentAPI + "/games/" + gameId + "/units/" + id,
            {
                method: "DELETE",
                credentials: "include",
            },
        );
        if (res.ok) await loadCategories();
    }

    const cells = currentBoard
        ? getCells(currentBoard.id, currentBoard.rows, currentBoard.cols)
        : [];

    return (
        <div className="flex flex-col gap-3 w-full max-w-6xl mx-auto p-4">
            {/* Board tabs */}
            {boards.length > 0 && (
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {boards.map((b) => (
                        <button
                            key={b.id}
                            onClick={() => setCurrentBoardId(b.id)}
                            className={`px-3 py-1 text-sm rounded-t cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                                b.id === currentBoardId
                                    ? "bg-(--primary) text-amber-50"
                                    : "bg-(--accent) text-(--text-color) border border-(--outline-brown)/40 hover:bg-(--surface-background)"
                            }`}
                        >
                            {b.name}
                        </button>
                    ))}
                </div>
            )}

            {boards.length === 0 && !isAdmin && (
                <p className="text-sm text-(--text-color) opacity-50 text-center py-10">
                    No boards configured yet.
                </p>
            )}

            {/* Admin toggle — always visible to admins */}
            {isAdmin && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setAdminOpen((o) => !o)}
                        className="px-3 py-1.5 text-sm bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90"
                    >
                        {adminOpen ? "Close Admin" : "Manage"}
                    </button>
                </div>
            )}

            {currentBoard && (
                <>
                    {/* Board toolbar */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm font-medium text-(--text-color) opacity-70">
                            {effectiveBoard.name}
                        </span>
                        <span className="text-xs text-(--text-color) opacity-40">
                            {effectiveBoard.rows}×{effectiveBoard.cols}
                        </span>
                        {!isCurrentlyEditing && (
                            <button
                                onClick={clearBoard}
                                className="px-3 py-1.5 text-sm bg-(--accent) border border-(--outline-brown)/50 text-(--text-color) rounded cursor-pointer hover:bg-(--surface-background)"
                            >
                                Clear
                            </button>
                        )}
                        {isAdmin && adminOpen && !isCurrentlyEditing && (
                            <button
                                onClick={() =>
                                    setEditingBoard({
                                        id: currentBoard.id,
                                        name: currentBoard.name,
                                        rows: currentBoard.rows,
                                        cols: currentBoard.cols,
                                        bgImage: currentBoard.bgImage,
                                        bgSize: currentBoard.bgSize || "cover",
                                        bgX: currentBoard.bgX ?? 0,
                                        bgY: currentBoard.bgY ?? 0,
                                        heightScale:
                                            currentBoard.heightScale ?? 1,
                                        widthScale:
                                            currentBoard.widthScale ?? 1,
                                        bgPaddingX:
                                            currentBoard.bgPaddingX ?? 0,
                                        bgPaddingY:
                                            currentBoard.bgPaddingY ?? 0,
                                        gridOffsetX:
                                            currentBoard.gridOffsetX ?? 0,
                                        gridOffsetY:
                                            currentBoard.gridOffsetY ?? 0,
                                    })
                                }
                                className="px-3 py-1.5 text-sm bg-(--accent) border border-(--outline-brown)/50 text-(--text-color) rounded cursor-pointer hover:bg-(--surface-background)"
                            >
                                Edit Board
                            </button>
                        )}
                        {isCurrentlyEditing && (
                            <>
                                <button
                                    onClick={updateBoard}
                                    className="px-3 py-1.5 text-sm bg-green-700/80 text-white rounded cursor-pointer hover:bg-green-700"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditingBoard(null)}
                                    className="px-3 py-1.5 text-sm bg-(--accent) border border-(--outline-brown)/50 text-(--text-color) rounded cursor-pointer hover:bg-(--surface-background)"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>

                    {/* Card: board left, unit picker right */}
                    <div className="flex flex-col lg:flex-row rounded-lg border border-(--outline-brown)/40 overflow-hidden bg-(--surface-background) lg:h-[calc(50dvh)]">
                        {/* Left: board */}
                        <div className="flex-1 min-w-0 flex flex-col items-center justify-center p-6">
                            {/* Board */}
                            <div className="w-full flex items-center justify-center min-w-0 flex-col">
                                {isCurrentlyEditing ? (
                                    /* Edit mode: positional sliders around the board */
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "auto 1fr",
                                            gridTemplateRows: "auto 1fr auto",
                                        }}
                                    >
                                        {/* Row 1 Col 1: spacer */}
                                        <div
                                            style={{
                                                gridRow: 1,
                                                gridColumn: 1,
                                            }}
                                        />
                                        {/* Row 1 Col 2: X sliders */}
                                        <div
                                            style={{
                                                gridRow: 1,
                                                gridColumn: 2,
                                            }}
                                            className="flex flex-col gap-0.5 pb-1 pl-2"
                                        >
                                            {[
                                                [
                                                    "BG X",
                                                    "bgX",
                                                    editingBoard.bgX ?? 0,
                                                    -50,
                                                    50,
                                                ],
                                                [
                                                    "Grid X",
                                                    "gridOffsetX",
                                                    editingBoard.gridOffsetX ??
                                                        0,
                                                    -40,
                                                    40,
                                                ],
                                                [
                                                    "Pad X",
                                                    "bgPaddingX",
                                                    editingBoard.bgPaddingX ??
                                                        0,
                                                    0,
                                                    40,
                                                ],
                                            ].map(
                                                ([
                                                    label,
                                                    key,
                                                    val,
                                                    min,
                                                    max,
                                                ]) => (
                                                    <div
                                                        key={key}
                                                        className="flex items-center gap-1.5"
                                                    >
                                                        <span className="text-[10px] opacity-40 w-10 text-right shrink-0">
                                                            {label}
                                                        </span>
                                                        <input
                                                            type="range"
                                                            min={min}
                                                            max={max}
                                                            step={0.1}
                                                            value={val}
                                                            onChange={(e) =>
                                                                setEditingBoard(
                                                                    (p) => ({
                                                                        ...p,
                                                                        [key]: Number(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    }),
                                                                )
                                                            }
                                                            className="flex-1 accent-(--primary)"
                                                        />
                                                        <input
                                                            type="number"
                                                            min={min}
                                                            max={max}
                                                            step={0.1}
                                                            value={val}
                                                            onChange={(e) =>
                                                                setEditingBoard(
                                                                    (p) => ({
                                                                        ...p,
                                                                        [key]: Number(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    }),
                                                                )
                                                            }
                                                            className="w-12 px-1 py-0 text-[10px] text-right tabular-nums shrink-0 rounded border border-(--outline-brown)/30 bg-(--surface-background) text-(--text-color) outline-none"
                                                        />
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                        {/* Row 2 Col 1: Y sliders (vertical) */}
                                        <div
                                            style={{
                                                gridRow: 2,
                                                gridColumn: 1,
                                            }}
                                            className="flex gap-1 items-stretch pr-2 py-1"
                                        >
                                            {[
                                                [
                                                    "BG Y",
                                                    "bgY",
                                                    editingBoard.bgY ?? 0,
                                                    -50,
                                                    50,
                                                ],
                                                [
                                                    "Grid Y",
                                                    "gridOffsetY",
                                                    editingBoard.gridOffsetY ??
                                                        0,
                                                    -40,
                                                    40,
                                                ],
                                                [
                                                    "Pad Y",
                                                    "bgPaddingY",
                                                    editingBoard.bgPaddingY ??
                                                        0,
                                                    0,
                                                    40,
                                                ],
                                            ].map(
                                                ([
                                                    label,
                                                    key,
                                                    val,
                                                    min,
                                                    max,
                                                ]) => (
                                                    <div
                                                        key={key}
                                                        className="flex flex-col items-center gap-0.5 self-stretch"
                                                    >
                                                        <span className="text-[10px] opacity-40 whitespace-nowrap">
                                                            {label}
                                                        </span>
                                                        <div
                                                            className="flex-1 flex items-center justify-center"
                                                            style={{
                                                                minHeight:
                                                                    "60px",
                                                                overflow:
                                                                    "hidden",
                                                            }}
                                                        >
                                                            <input
                                                                type="range"
                                                                min={min}
                                                                max={max}
                                                                step={0.1}
                                                                value={val}
                                                                onChange={(e) =>
                                                                    setEditingBoard(
                                                                        (
                                                                            p,
                                                                        ) => ({
                                                                            ...p,
                                                                            [key]: Number(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        }),
                                                                    )
                                                                }
                                                                style={{
                                                                    writingMode:
                                                                        "vertical-lr",
                                                                    width: "clamp(60px, 100%, 160px)",
                                                                }}
                                                                className="accent-(--primary)"
                                                            />
                                                        </div>
                                                        <input
                                                            type="number"
                                                            min={min}
                                                            max={max}
                                                            step={0.1}
                                                            value={val}
                                                            onChange={(e) =>
                                                                setEditingBoard(
                                                                    (p) => ({
                                                                        ...p,
                                                                        [key]: Number(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    }),
                                                                )
                                                            }
                                                            className="w-10 px-1 py-0 text-[10px] text-center tabular-nums rounded border border-(--outline-brown)/30 bg-(--surface-background) text-(--text-color) outline-none"
                                                        />
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                        {/* Row 3: size/scale controls — spans both columns */}
                                        {editingBoard.bgImage && (
                                            <div
                                                style={{
                                                    gridRow: 3,
                                                    gridColumn: "1 / -1",
                                                }}
                                                className="flex flex-wrap gap-4 items-start pt-1.5 mt-1 border-t border-(--outline-brown)/20"
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] opacity-50">
                                                        BG size
                                                    </span>
                                                    <div className="flex gap-1 mb-0.5">
                                                        {[
                                                            "cover",
                                                            "contain",
                                                        ].map((s) => (
                                                            <button
                                                                key={s}
                                                                onClick={() =>
                                                                    setEditingBoard(
                                                                        (
                                                                            p,
                                                                        ) => ({
                                                                            ...p,
                                                                            bgSize: s,
                                                                        }),
                                                                    )
                                                                }
                                                                className={`px-2 py-0.5 text-[10px] rounded border cursor-pointer capitalize transition-colors ${
                                                                    editingBoard.bgSize ===
                                                                    s
                                                                        ? "bg-(--primary) border-(--primary) text-amber-50"
                                                                        : "bg-(--surface-background) border-(--outline-brown)/30 text-(--text-color) hover:border-(--primary)/50"
                                                                }`}
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] opacity-40 shrink-0">
                                                            Scale
                                                        </span>
                                                        <input
                                                            type="range"
                                                            min={50}
                                                            max={300}
                                                            step={1}
                                                            value={
                                                                editingBoard.bgSize?.endsWith(
                                                                    "%",
                                                                )
                                                                    ? parseInt(
                                                                          editingBoard.bgSize,
                                                                      )
                                                                    : 100
                                                            }
                                                            onChange={(e) =>
                                                                setEditingBoard(
                                                                    (p) => ({
                                                                        ...p,
                                                                        bgSize:
                                                                            e
                                                                                .target
                                                                                .value +
                                                                            "%",
                                                                    }),
                                                                )
                                                            }
                                                            className="w-24 accent-(--primary)"
                                                        />
                                                        <input
                                                            type="number"
                                                            min={50}
                                                            max={300}
                                                            step={1}
                                                            value={
                                                                editingBoard.bgSize?.endsWith(
                                                                    "%",
                                                                )
                                                                    ? parseInt(
                                                                          editingBoard.bgSize,
                                                                      )
                                                                    : 100
                                                            }
                                                            onChange={(e) =>
                                                                setEditingBoard(
                                                                    (p) => ({
                                                                        ...p,
                                                                        bgSize:
                                                                            e
                                                                                .target
                                                                                .value +
                                                                            "%",
                                                                    }),
                                                                )
                                                            }
                                                            className="w-14 px-1 py-0 text-[10px] rounded border border-(--outline-brown)/30 bg-(--surface-background) text-(--text-color) outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] opacity-50">
                                                        Board scale
                                                    </span>
                                                    {[
                                                        [
                                                            "Width",
                                                            "widthScale",
                                                            editingBoard.widthScale,
                                                        ],
                                                        [
                                                            "Height",
                                                            "heightScale",
                                                            editingBoard.heightScale,
                                                        ],
                                                    ].map(
                                                        ([label, key, val]) => (
                                                            <div
                                                                key={key}
                                                                className="flex items-center gap-1.5"
                                                            >
                                                                <span className="text-[10px] opacity-40 w-10 shrink-0">
                                                                    {label}
                                                                </span>
                                                                <input
                                                                    type="range"
                                                                    min={0.25}
                                                                    max={3}
                                                                    step={0.01}
                                                                    value={
                                                                        val ?? 1
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setEditingBoard(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                [key]: Number(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                            }),
                                                                        )
                                                                    }
                                                                    className="w-24 accent-(--primary)"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    min={0.25}
                                                                    max={3}
                                                                    step={0.01}
                                                                    value={
                                                                        val ?? 1
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setEditingBoard(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                [key]: Number(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                            }),
                                                                        )
                                                                    }
                                                                    className="w-14 px-1 py-0 text-[10px] rounded border border-(--outline-brown)/30 bg-(--surface-background) text-(--text-color) outline-none"
                                                                />
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Row 2 Col 2: board */}
                                        <div
                                            ref={boardRef}
                                            className="relative select-none rounded overflow-hidden"
                                            style={{
                                                gridRow: 2,
                                                gridColumn: 2,
                                                width: "100%",
                                                aspectRatio: `${effectiveBoard.cols} / ${effectiveBoard.rows * (effectiveBoard.heightScale ?? 1)}`,
                                                backgroundImage:
                                                    effectiveBoard.bgImage
                                                        ? `url(${effectiveBoard.bgImage})`
                                                        : undefined,
                                                backgroundSize:
                                                    effectiveBoard.bgSize ||
                                                    "cover",
                                                backgroundPosition: `calc(50% + ${effectiveBoard.bgX ?? 0}%) calc(50% + ${effectiveBoard.bgY ?? 0}%)`,
                                                backgroundColor:
                                                    effectiveBoard.bgImage
                                                        ? undefined
                                                        : "#4a7830",
                                                backgroundRepeat: "no-repeat",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: `${(effectiveBoard.bgPaddingY ?? 0) + (effectiveBoard.gridOffsetY ?? 0)}%`,
                                                    bottom: `${(effectiveBoard.bgPaddingY ?? 0) - (effectiveBoard.gridOffsetY ?? 0)}%`,
                                                    left: `${(effectiveBoard.bgPaddingX ?? 0) + (effectiveBoard.gridOffsetX ?? 0)}%`,
                                                    right: `${(effectiveBoard.bgPaddingX ?? 0) - (effectiveBoard.gridOffsetX ?? 0)}%`,
                                                    display: "grid",
                                                    gridTemplateColumns: `repeat(${effectiveBoard.cols}, 1fr)`,
                                                    gridTemplateRows: `repeat(${effectiveBoard.rows}, 1fr)`,
                                                }}
                                            >
                                                {Array.from(
                                                    {
                                                        length:
                                                            currentBoard.rows *
                                                            currentBoard.cols,
                                                    },
                                                    (_, i) => {
                                                        const row = Math.floor(
                                                            i /
                                                                currentBoard.cols,
                                                        );
                                                        const col =
                                                            i %
                                                            currentBoard.cols;
                                                        const unitId =
                                                            cells[row]?.[col] ??
                                                            null;
                                                        const unit = unitId
                                                            ? unitsById[unitId]
                                                            : null;
                                                        return (
                                                            <div
                                                                key={`${row}-${col}`}
                                                                onClick={() =>
                                                                    handleCellClick(
                                                                        row,
                                                                        col,
                                                                    )
                                                                }
                                                                onContextMenu={(
                                                                    e,
                                                                ) =>
                                                                    handleCellRightClick(
                                                                        e,
                                                                        row,
                                                                        col,
                                                                    )
                                                                }
                                                                onDragOver={(
                                                                    e,
                                                                ) =>
                                                                    e.preventDefault()
                                                                }
                                                                onDrop={(e) =>
                                                                    handleDrop(
                                                                        e,
                                                                        row,
                                                                        col,
                                                                    )
                                                                }
                                                                style={{
                                                                    borderRight:
                                                                        col <
                                                                        effectiveBoard.cols -
                                                                            1
                                                                            ? "1px dashed rgba(255,255,255,0.3)"
                                                                            : undefined,
                                                                    borderBottom:
                                                                        row <
                                                                        effectiveBoard.rows -
                                                                            1
                                                                            ? "1px dashed rgba(255,255,255,0.3)"
                                                                            : undefined,
                                                                }}
                                                                className="flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors overflow-hidden min-w-0 min-h-0"
                                                            >
                                                                {unit && (
                                                                    <img
                                                                        src={
                                                                            unit.imageUrl
                                                                        }
                                                                        alt={
                                                                            unit.name
                                                                        }
                                                                        draggable={
                                                                            false
                                                                        }
                                                                        className="w-4/5 h-4/5 object-contain pointer-events-none drop-shadow-md"
                                                                    />
                                                                )}
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Normal view */
                                    <div className="w-full">
                                        <div
                                            ref={boardRef}
                                            className="relative select-none rounded overflow-hidden w-full"
                                            style={{
                                                width: `${(effectiveBoard.widthScale ?? 1) * 100}%`,
                                                aspectRatio: `${effectiveBoard.cols} / ${effectiveBoard.rows * (effectiveBoard.heightScale ?? 1)}`,
                                                backgroundImage:
                                                    effectiveBoard.bgImage
                                                        ? `url(${effectiveBoard.bgImage})`
                                                        : undefined,
                                                backgroundSize:
                                                    effectiveBoard.bgSize ||
                                                    "cover",
                                                backgroundPosition: `calc(50% + ${effectiveBoard.bgX ?? 0}%) calc(50% + ${effectiveBoard.bgY ?? 0}%)`,
                                                backgroundColor:
                                                    effectiveBoard.bgImage
                                                        ? undefined
                                                        : "#4a7830",
                                                backgroundRepeat: "no-repeat",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: `${(effectiveBoard.bgPaddingY ?? 0) + (effectiveBoard.gridOffsetY ?? 0)}%`,
                                                    bottom: `${(effectiveBoard.bgPaddingY ?? 0) - (effectiveBoard.gridOffsetY ?? 0)}%`,
                                                    left: `${(effectiveBoard.bgPaddingX ?? 0) + (effectiveBoard.gridOffsetX ?? 0)}%`,
                                                    right: `${(effectiveBoard.bgPaddingX ?? 0) - (effectiveBoard.gridOffsetX ?? 0)}%`,
                                                    display: "grid",
                                                    gridTemplateColumns: `repeat(${effectiveBoard.cols}, 1fr)`,
                                                    gridTemplateRows: `repeat(${effectiveBoard.rows}, 1fr)`,
                                                }}
                                            >
                                                {Array.from(
                                                    {
                                                        length:
                                                            currentBoard.rows *
                                                            currentBoard.cols,
                                                    },
                                                    (_, i) => {
                                                        const row = Math.floor(
                                                            i /
                                                                currentBoard.cols,
                                                        );
                                                        const col =
                                                            i %
                                                            currentBoard.cols;
                                                        const unitId =
                                                            cells[row]?.[col] ??
                                                            null;
                                                        const unit = unitId
                                                            ? unitsById[unitId]
                                                            : null;
                                                        return (
                                                            <div
                                                                key={`${row}-${col}`}
                                                                onClick={() =>
                                                                    handleCellClick(
                                                                        row,
                                                                        col,
                                                                    )
                                                                }
                                                                onContextMenu={(
                                                                    e,
                                                                ) =>
                                                                    handleCellRightClick(
                                                                        e,
                                                                        row,
                                                                        col,
                                                                    )
                                                                }
                                                                onDragOver={(
                                                                    e,
                                                                ) =>
                                                                    e.preventDefault()
                                                                }
                                                                onDrop={(e) =>
                                                                    handleDrop(
                                                                        e,
                                                                        row,
                                                                        col,
                                                                    )
                                                                }
                                                                style={{
                                                                    borderRight:
                                                                        col <
                                                                        effectiveBoard.cols -
                                                                            1
                                                                            ? "1px dashed rgba(255,255,255,0.3)"
                                                                            : undefined,
                                                                    borderBottom:
                                                                        row <
                                                                        effectiveBoard.rows -
                                                                            1
                                                                            ? "1px dashed rgba(255,255,255,0.3)"
                                                                            : undefined,
                                                                }}
                                                                className="flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors overflow-hidden min-w-0 min-h-0"
                                                            >
                                                                {unit && (
                                                                    <img
                                                                        src={
                                                                            unit.imageUrl
                                                                        }
                                                                        alt={
                                                                            unit.name
                                                                        }
                                                                        draggable={
                                                                            false
                                                                        }
                                                                        className="w-4/5 h-4/5 object-contain pointer-events-none drop-shadow-md"
                                                                    />
                                                                )}
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <p className="text-xs text-(--text-color) opacity-40 mt-1 text-center hidden lg:block">
                                    Click or drag to place · Right-click to
                                    remove
                                </p>
                            </div>
                        </div>
                        {/* end left column */}

                        {/* Right: unit picker */}
                        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-2 overflow-y-auto border-t lg:border-t-0 lg:border-l border-(--outline-brown)/30 p-3 lg:max-h-none">
                            {/* Selected unit */}
                            {selectedUnit ? (
                                <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-(--primary)/10 border border-(--primary)/40">
                                    <img
                                        src={selectedUnit.imageUrl}
                                        alt={selectedUnit.name}
                                        className="w-8 h-8 object-contain shrink-0"
                                    />
                                    <span className="text-xs text-(--text-color) font-medium truncate flex-1">
                                        {selectedUnit.name}
                                    </span>
                                    <button
                                        onClick={() => setSelectedUnit(null)}
                                        className="opacity-40 hover:opacity-80 cursor-pointer shrink-0"
                                    >
                                        <X className="w-3.5 h-3.5 text-(--text-color)" />
                                    </button>
                                </div>
                            ) : (
                                <p className="text-xs text-(--text-color) opacity-40 text-center py-1">
                                    Click a unit to select
                                </p>
                            )}

                            {/* Search */}
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-(--surface-background) border border-(--outline-brown)/40">
                                <Search className="w-3.5 h-3.5 text-(--text-color) opacity-50 shrink-0" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Search..."
                                    className="flex-1 bg-transparent text-(--text-color) text-sm outline-none border-0 min-w-0"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="opacity-40 hover:opacity-80 cursor-pointer shrink-0"
                                    >
                                        <X className="w-3.5 h-3.5 text-(--text-color)" />
                                    </button>
                                )}
                            </div>

                            {/* Unit grid */}
                            <div className="flex flex-col gap-3">
                                {displayCategories.map((cat) => (
                                    <div key={cat.id}>
                                        <p className="text-xs font-bold uppercase tracking-wider text-(--text-color) opacity-50 mb-1.5">
                                            {cat.name}
                                        </p>
                                        <div className="grid grid-cols-4 gap-1.5">
                                            {(cat.units ?? []).map((unit) => (
                                                <button
                                                    key={unit.id}
                                                    draggable
                                                    onDragStart={() => {
                                                        dragUnitRef.current =
                                                            unit;
                                                    }}
                                                    onClick={() =>
                                                        setSelectedUnit(
                                                            (prev) =>
                                                                prev?.id ===
                                                                unit.id
                                                                    ? null
                                                                    : unit,
                                                        )
                                                    }
                                                    title={unit.name}
                                                    className={`aspect-square rounded-md border-2 flex items-center justify-center overflow-hidden cursor-pointer transition-colors bg-(--surface-background) ${
                                                        selectedUnit?.id ===
                                                        unit.id
                                                            ? "border-(--primary)"
                                                            : "border-transparent hover:border-(--primary)/50"
                                                    }`}
                                                >
                                                    <img
                                                        src={unit.imageUrl}
                                                        alt={unit.name}
                                                        className="w-4/5 h-4/5 object-contain"
                                                        draggable={false}
                                                    />
                                                </button>
                                            ))}
                                            {(cat.units ?? []).length === 0 && (
                                                <p className="text-xs text-(--text-color) opacity-40 italic col-span-4">
                                                    No units
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {categories.length === 0 && (
                                    <p className="text-sm text-(--text-color) opacity-40 text-center py-6">
                                        No units yet.
                                        {isAdmin && " Use Manage to add some."}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* end card */}

                    {/* Admin panel — below board+sidebar */}
                    {isAdmin && adminOpen && (
                        <div className="border border-(--outline-brown)/50 rounded bg-(--accent) p-4 flex flex-col gap-6">
                            <h3 className="font-semibold text-(--text-color) text-lg">
                                Manage
                            </h3>

                            {/* Boards */}
                            <div>
                                <h4 className="text-sm font-semibold text-(--text-color) mb-2">
                                    Boards
                                </h4>
                                <div className="flex flex-col gap-1 mb-3">
                                    {boards.map((b) => (
                                        <div
                                            key={b.id}
                                            className="bg-(--surface-background) rounded text-sm text-(--text-color)"
                                        >
                                            {editingBoard?.id === b.id ? (
                                                <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                                                    <input
                                                        value={
                                                            editingBoard.name
                                                        }
                                                        onChange={(e) =>
                                                            setEditingBoard(
                                                                (p) => ({
                                                                    ...p,
                                                                    name: e
                                                                        .target
                                                                        .value,
                                                                }),
                                                            )
                                                        }
                                                        className="flex-1 min-w-0 px-2 py-0.5 rounded border border-(--outline-brown)/40 bg-(--accent) text-(--text-color) outline-none text-sm"
                                                    />
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={20}
                                                        value={
                                                            editingBoard.rows
                                                        }
                                                        onChange={(e) =>
                                                            setEditingBoard(
                                                                (p) => ({
                                                                    ...p,
                                                                    rows: Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                }),
                                                            )
                                                        }
                                                        className="w-12 px-1 py-0.5 rounded border border-(--outline-brown)/40 bg-(--accent) text-(--text-color) outline-none text-sm text-center"
                                                    />
                                                    <span className="opacity-40 text-xs">
                                                        ×
                                                    </span>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={20}
                                                        value={
                                                            editingBoard.cols
                                                        }
                                                        onChange={(e) =>
                                                            setEditingBoard(
                                                                (p) => ({
                                                                    ...p,
                                                                    cols: Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                }),
                                                            )
                                                        }
                                                        className="w-12 px-1 py-0.5 rounded border border-(--outline-brown)/40 bg-(--accent) text-(--text-color) outline-none text-sm text-center"
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            setEditBoardBgPicker(
                                                                true,
                                                            )
                                                        }
                                                        className="px-2 py-0.5 text-xs rounded border border-(--outline-brown)/40 bg-(--accent) cursor-pointer hover:opacity-80 shrink-0"
                                                    >
                                                        {editingBoard.bgImage
                                                            ? "Change BG"
                                                            : "Set BG"}
                                                    </button>
                                                    {editingBoard.bgImage && (
                                                        <button
                                                            onClick={() =>
                                                                setEditingBoard(
                                                                    (p) => ({
                                                                        ...p,
                                                                        bgImage:
                                                                            null,
                                                                    }),
                                                                )
                                                            }
                                                            className="text-xs opacity-40 hover:opacity-80 cursor-pointer shrink-0"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                    <span className="text-xs opacity-40 italic shrink-0">
                                                        Use toolbar to save
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 px-3 py-1.5">
                                                    <div className="flex flex-col shrink-0">
                                                        <button
                                                            onClick={() =>
                                                                moveBoard(
                                                                    b.id,
                                                                    -1,
                                                                )
                                                            }
                                                            disabled={
                                                                boards.indexOf(
                                                                    b,
                                                                ) === 0
                                                            }
                                                            className="opacity-40 hover:opacity-80 disabled:opacity-20 cursor-pointer p-0.5"
                                                        >
                                                            <ChevronUp className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                moveBoard(
                                                                    b.id,
                                                                    1,
                                                                )
                                                            }
                                                            disabled={
                                                                boards.indexOf(
                                                                    b,
                                                                ) ===
                                                                boards.length -
                                                                    1
                                                            }
                                                            className="opacity-40 hover:opacity-80 disabled:opacity-20 cursor-pointer p-0.5"
                                                        >
                                                            <ChevronDown className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <span className="flex-1 truncate">
                                                        {b.name}
                                                    </span>
                                                    <span className="text-xs opacity-40 shrink-0">
                                                        {b.rows}×{b.cols}
                                                    </span>
                                                    {b.id !==
                                                        currentBoardId && (
                                                        <button
                                                            onClick={() =>
                                                                setCurrentBoardId(
                                                                    b.id,
                                                                )
                                                            }
                                                            className="text-xs opacity-50 hover:opacity-90 cursor-pointer shrink-0"
                                                        >
                                                            Select
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setCurrentBoardId(
                                                                b.id,
                                                            );
                                                            setEditingBoard({
                                                                id: b.id,
                                                                name: b.name,
                                                                rows: b.rows,
                                                                cols: b.cols,
                                                                bgImage:
                                                                    b.bgImage,
                                                                bgSize:
                                                                    b.bgSize ||
                                                                    "cover",
                                                                bgX: b.bgX ?? 0,
                                                                bgY: b.bgY ?? 0,
                                                                heightScale:
                                                                    b.heightScale ??
                                                                    1,
                                                                widthScale:
                                                                    b.widthScale ??
                                                                    1,
                                                                bgPaddingX:
                                                                    b.bgPaddingX ??
                                                                    0,
                                                                bgPaddingY:
                                                                    b.bgPaddingY ??
                                                                    0,
                                                                gridOffsetX:
                                                                    b.gridOffsetX ??
                                                                    0,
                                                                gridOffsetY:
                                                                    b.gridOffsetY ??
                                                                    0,
                                                            });
                                                        }}
                                                        className="text-xs opacity-50 hover:opacity-90 cursor-pointer shrink-0"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            copyBoard(b)
                                                        }
                                                        className="text-xs opacity-50 hover:opacity-90 cursor-pointer shrink-0"
                                                    >
                                                        Copy
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            deleteBoard(b.id)
                                                        }
                                                        className="text-red-700/60 hover:text-red-700 cursor-pointer text-xs shrink-0"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {showNewBoard ? (
                                    <div className="flex flex-wrap gap-2 items-center p-3 bg-(--surface-background) rounded border border-(--outline-brown)/40 text-sm text-(--text-color)">
                                        <input
                                            value={newBoard.name}
                                            onChange={(e) =>
                                                setNewBoard((p) => ({
                                                    ...p,
                                                    name: e.target.value,
                                                }))
                                            }
                                            onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                createBoard()
                                            }
                                            placeholder="Board name..."
                                            autoFocus
                                            className="flex-1 min-w-32 px-2 py-1 rounded border border-(--outline-brown)/40 bg-(--accent) text-(--text-color) outline-none"
                                        />
                                        <label className="flex items-center gap-1">
                                            <span className="opacity-60">
                                                Rows
                                            </span>
                                            <input
                                                type="number"
                                                min={1}
                                                max={20}
                                                value={newBoard.rows}
                                                onChange={(e) =>
                                                    setNewBoard((p) => ({
                                                        ...p,
                                                        rows: Number(
                                                            e.target.value,
                                                        ),
                                                    }))
                                                }
                                                className="w-14 px-2 py-1 rounded border border-(--outline-brown)/40 bg-(--accent) text-(--text-color) outline-none text-center"
                                            />
                                        </label>
                                        <label className="flex items-center gap-1">
                                            <span className="opacity-60">
                                                Cols
                                            </span>
                                            <input
                                                type="number"
                                                min={1}
                                                max={20}
                                                value={newBoard.cols}
                                                onChange={(e) =>
                                                    setNewBoard((p) => ({
                                                        ...p,
                                                        cols: Number(
                                                            e.target.value,
                                                        ),
                                                    }))
                                                }
                                                className="w-14 px-2 py-1 rounded border border-(--outline-brown)/40 bg-(--accent) text-(--text-color) outline-none text-center"
                                            />
                                        </label>
                                        <button
                                            onClick={() =>
                                                setShowBoardBgPicker(true)
                                            }
                                            className="px-2 py-1 rounded border border-(--outline-brown)/40 bg-(--accent) cursor-pointer hover:opacity-80 text-sm"
                                        >
                                            {newBoard.bgImage
                                                ? "Change BG"
                                                : "Set BG"}
                                        </button>
                                        {newBoard.bgImage && (
                                            <button
                                                onClick={() =>
                                                    setNewBoard((p) => ({
                                                        ...p,
                                                        bgImage: null,
                                                    }))
                                                }
                                                className="opacity-40 hover:opacity-80 cursor-pointer"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={createBoard}
                                            className="px-3 py-1 bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90"
                                        >
                                            Create
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowNewBoard(false);
                                                setNewBoard({
                                                    name: "",
                                                    rows: 5,
                                                    cols: 7,
                                                    bgImage: null,
                                                    bgSize: "cover",
                                                    bgX: 0,
                                                    bgY: 0,
                                                    heightScale: 1,
                                                    widthScale: 1,
                                                    bgPaddingX: 0,
                                                    bgPaddingY: 0,
                                                    gridOffsetX: 0,
                                                    gridOffsetY: 0,
                                                });
                                            }}
                                            className="opacity-50 hover:opacity-80 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <BgControls
                                            bgImage={newBoard.bgImage}
                                            bgSize={newBoard.bgSize}
                                            heightScale={newBoard.heightScale}
                                            widthScale={newBoard.widthScale}
                                            onChange={(v) =>
                                                setNewBoard((p) => ({
                                                    ...p,
                                                    ...v,
                                                }))
                                            }
                                        />
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowNewBoard(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-(--surface-background) border border-(--outline-brown)/40 text-(--text-color) rounded cursor-pointer hover:bg-(--accent)"
                                    >
                                        <Plus className="w-4 h-4" /> New Board
                                    </button>
                                )}
                            </div>

                            {/* Categories */}
                            <div>
                                <h4 className="text-sm font-semibold text-(--text-color) mb-2">
                                    Categories
                                </h4>
                                <div className="flex flex-col gap-1 mb-3 max-h-40 overflow-y-auto">
                                    {categories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className="flex items-center justify-between px-3 py-1.5 bg-(--surface-background) rounded text-sm text-(--text-color)"
                                        >
                                            <span>
                                                {cat.name}{" "}
                                                <span className="opacity-40 text-xs">
                                                    ({(cat.units ?? []).length}{" "}
                                                    units)
                                                </span>
                                            </span>
                                            <button
                                                onClick={() =>
                                                    deleteCategory(cat.id)
                                                }
                                                className="text-red-700/60 hover:text-red-700 cursor-pointer text-xs"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        value={newCategoryName}
                                        onChange={(e) =>
                                            setNewCategoryName(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === "Enter" &&
                                            createCategory()
                                        }
                                        placeholder="New category name..."
                                        className="flex-1 px-2 py-1 text-sm rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) outline-none"
                                    />
                                    <button
                                        onClick={createCategory}
                                        className="px-3 py-1 text-sm bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Units */}
                            <div>
                                <h4 className="text-sm font-semibold text-(--text-color) mb-2">
                                    Add Unit
                                </h4>
                                <div className="flex flex-wrap gap-2 items-center">
                                    <input
                                        value={newUnit.name}
                                        onChange={(e) =>
                                            setNewUnit((p) => ({
                                                ...p,
                                                name: e.target.value,
                                            }))
                                        }
                                        placeholder="Unit name..."
                                        className="flex-1 min-w-32 px-2 py-1 text-sm rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) outline-none"
                                    />
                                    <select
                                        value={newUnit.categoryId}
                                        onChange={(e) =>
                                            setNewUnit((p) => ({
                                                ...p,
                                                categoryId: e.target.value,
                                            }))
                                        }
                                        className="px-2 py-1 text-sm rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) outline-none"
                                    >
                                        <option value="">Category...</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex items-center gap-2">
                                        {newUnit.imageUrl && (
                                            <img
                                                src={newUnit.imageUrl}
                                                className="w-8 h-8 object-contain rounded border border-(--outline-brown)/30"
                                                alt=""
                                            />
                                        )}
                                        <button
                                            onClick={() =>
                                                setShowUnitImagePicker(true)
                                            }
                                            className="px-2 py-1 text-sm rounded border border-(--outline-brown)/40 bg-(--surface-background) text-(--text-color) cursor-pointer hover:opacity-80"
                                        >
                                            {newUnit.imageUrl
                                                ? "Change Image"
                                                : "Pick Image"}
                                        </button>
                                    </div>
                                    <button
                                        ref={addUnitBtnRef}
                                        onClick={createUnit}
                                        disabled={
                                            !newUnit.name.trim() ||
                                            !newUnit.imageUrl ||
                                            !newUnit.categoryId
                                        }
                                        className="px-3 py-1 text-sm bg-(--primary) text-amber-50 rounded cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Add Unit
                                    </button>
                                </div>
                                {allUnits.length > 0 && (
                                    <div className="mt-3 flex flex-col gap-1 max-h-56 overflow-y-auto">
                                        {categories.map((cat) =>
                                            (cat.units ?? []).map((unit) => (
                                                <div
                                                    key={unit.id}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-(--surface-background) rounded text-sm text-(--text-color)"
                                                >
                                                    <img
                                                        src={unit.imageUrl}
                                                        className="w-7 h-7 object-contain rounded shrink-0"
                                                        alt=""
                                                    />
                                                    <span className="flex-1 truncate">
                                                        {unit.name}
                                                    </span>
                                                    <span className="text-xs opacity-40 shrink-0">
                                                        {cat.name}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            deleteUnit(unit.id)
                                                        }
                                                        className="text-red-700/60 hover:text-red-700 cursor-pointer text-xs shrink-0"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )),
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Image pickers */}

            {showBoardBgPicker && (
                <ImagePickerModal
                    gameId={gameId}
                    onSelect={(url) => {
                        setNewBoard((p) => ({ ...p, bgImage: url }));
                        setShowBoardBgPicker(false);
                    }}
                    onClose={() => setShowBoardBgPicker(false)}
                />
            )}

            {editBoardBgPicker && editingBoard && (
                <ImagePickerModal
                    gameId={gameId}
                    onSelect={(url) => {
                        setEditingBoard((p) => ({ ...p, bgImage: url }));
                        setEditBoardBgPicker(false);
                    }}
                    onClose={() => setEditBoardBgPicker(false)}
                />
            )}

            {showUnitImagePicker && (
                <ImagePickerModal
                    gameId={gameId}
                    onSelect={(url) => {
                        setNewUnit((p) => ({ ...p, imageUrl: url }));
                        setShowUnitImagePicker(false);
                        setTimeout(() => addUnitBtnRef.current?.focus(), 0);
                    }}
                    onClose={() => setShowUnitImagePicker(false)}
                />
            )}
        </div>
    );
}
