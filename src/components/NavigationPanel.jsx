import { useEffect, useState, useRef } from "react";
import { currentAPI } from "../config/api.js";
import { useRouteLoaderData } from "react-router";
import {
    PencilIcon,
    Check,
    X,
    Trash,
    ChevronDown,
    ChevronRight,
} from "lucide-react";

const secret = import.meta.env.VITE_SECRET;

export default function NavigationPanel() {
    const [, forceRender] = useState(0);
    const { gameData, sectionsMap } = useRouteLoaderData("main");
    if (!gameData || !sectionsMap) {
        return <div>Loading navigation data...</div>;
    }
    const gameId = gameData?.id;
    const [unsectionedPages, setUnsectionedPages] = useState([]);

    useEffect(() => {
        if (!gameId) return;
        fetch(currentAPI + "/games/" + gameId + "/pages")
            .then((res) => res.json())
            .then((pages) =>
                setUnsectionedPages(pages.filter((p) => !p.sectionId)),
            );
    }, [gameId]);

    const [editingSection, setEditingSection] = useState(null);
    const [sectionName, setSectionName] = useState("");

    const [newSectionName, setNewSectionName] = useState("");

    // ── ACCORDION STATE ──────────────────────────────────────────────────────
    const [expandedSections, setExpandedSections] = useState(new Set());

    useEffect(() => {
        const all = getSortedSections().map((s) => s.id);
        setExpandedSections(new Set(all));
    }, []);

    function toggleSection(id) {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function toggleAllSections() {
        const all = getSortedSections().map((s) => s.id);
        const allExp = all.every((id) => expandedSections.has(id));
        setExpandedSections(allExp ? new Set() : new Set(all));
    }

    function allExpanded() {
        const all = getSortedSections();
        return all.length > 0 && all.every((s) => expandedSections.has(s.id));
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Section drag state
    const [draggedSection, setDraggedSection] = useState(null);
    const [dragOverSection, setDragOverSection] = useState(null);

    // Page drag state
    const [draggedPage, setDraggedPage] = useState(null);
    const [dragOverPage, setDragOverPage] = useState(null);

    // Quick-add dropdown open state per section (stores section id or null)
    const [openQuickAdd, setOpenQuickAdd] = useState(null);
    const quickAddRef = useRef(null);

    // Close quick-add dropdown when clicking outside
    useEffect(() => {
        if (!openQuickAdd) return;
        function handleClickOutside(e) {
            if (
                quickAddRef.current &&
                !quickAddRef.current.contains(e.target)
            ) {
                setOpenQuickAdd(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [openQuickAdd]);

    const getSortedSections = () => {
        return Array.from(sectionsMap.values()).sort(
            (a, b) => a.order - b.order,
        );
    };

    const getSortedPages = (section) => {
        return [...section.pages].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    };

    async function createSection() {
        if (!newSectionName.trim()) {
            alert("Section name cannot be empty");
            return;
        }

        try {
            const sections = getSortedSections();
            //
            // const maxOrder =
            //     sections.length > 0
            //         ? Math.max(...sections.map((s) => s.order || 0))
            //         : -1;

            const response = await fetch(currentAPI + "/sections", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    title: newSectionName,
                    gameId,
                    order: sections.length,
                }),
            });

            const newSection = await response.json();
            sectionsMap.set(newSection.id, { ...newSection, pages: [] });
            setNewSectionName("");
            forceRender((x) => x + 1);
        } catch (err) {
            console.error("Failed to create section:", err);
        }
    }

    async function renameSection(id) {
        try {
            await fetch(currentAPI + "/sections/rename/" + id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ title: sectionName }),
            });

            sectionsMap.get(id).title = sectionName;
            setEditingSection(null);
            forceRender((x) => x + 1);
        } catch (err) {
            console.error("Failed to rename section:", err);
        }
    }

    async function deleteSection(id) {
        try {
            await fetch(currentAPI + "/sections/delete/" + id, {
                method: "DELETE",
                credentials: "include",
            });

            sectionsMap.delete(id);
            forceRender((x) => x + 1);
        } catch (err) {
            console.error("Failed to delete section:", err);
        }
    }

    async function reorderSections(newOrder) {
        try {
            await fetch(currentAPI + "/sections/reorder", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gameId,
                    sectionOrder: newOrder,
                }),
                credentials: "include",
            });

            newOrder.forEach((id, index) => {
                const section = sectionsMap.get(id);
                if (section) {
                    section.order = index;
                }
            });

            forceRender((x) => x + 1);
        } catch (err) {
            console.error("Failed to reorder sections:", err);
        }
    }

    async function reorderPages(sectionId, newOrder) {
        try {
            await fetch(currentAPI + "/games/" + gameId + "/pages/reorder", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    sectionId,
                    pageOrder: newOrder,
                }),
            });

            const section = sectionsMap.get(sectionId);
            if (section) {
                newOrder.forEach((id, index) => {
                    const page = section.pages.find((p) => p.id === id);
                    if (page) page.sort = index;
                });
            }

            forceRender((x) => x + 1);
        } catch (err) {
            console.error("Failed to reorder pages:", err);
        }
    }

    // Section drag handlers
    function handleSectionDragStart(e, section) {
        setDraggedSection(section);
        e.dataTransfer.effectAllowed = "move";
        e.currentTarget.style.opacity = "0.4";
    }

    function handleSectionDragEnd(e) {
        e.currentTarget.style.opacity = "1";
        setDraggedSection(null);
        setDragOverSection(null);
    }

    function handleSectionDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        return false;
    }

    function handleSectionDragEnter(e, section) {
        setDragOverSection(section);
    }

    function handleSectionDrop(e, targetSection) {
        e.preventDefault();
        e.stopPropagation();

        if (!draggedSection || draggedSection.id === targetSection.id) {
            return;
        }

        const sections = getSortedSections();
        const draggedIndex = sections.findIndex(
            (s) => s.id === draggedSection.id,
        );
        const targetIndex = sections.findIndex(
            (s) => s.id === targetSection.id,
        );

        const reordered = [...sections];
        const [removed] = reordered.splice(draggedIndex, 1);
        reordered.splice(targetIndex, 0, removed);

        const newOrder = reordered.map((s) => s.id);

        reorderSections(newOrder);

        setDraggedSection(null);
        setDragOverSection(null);
    }

    // Page drag handlers
    function handlePageDragStart(e, page) {
        e.stopPropagation();
        setDraggedPage(page);
        e.dataTransfer.effectAllowed = "move";
        e.currentTarget.style.opacity = "0.4";
    }

    function handlePageDragEnd(e) {
        e.currentTarget.style.opacity = "1";
        setDraggedPage(null);
        setDragOverPage(null);
    }

    function handlePageDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        return false;
    }

    function handlePageDragEnter(e, page) {
        e.stopPropagation();
        setDragOverPage(page);
    }

    function handlePageDrop(e, targetPage, section) {
        e.preventDefault();
        e.stopPropagation();

        if (!draggedPage || draggedPage.id === targetPage.id) {
            return;
        }

        if (draggedPage.sectionId !== targetPage.sectionId) {
            return;
        }

        const pages = getSortedPages(section);
        const draggedIndex = pages.findIndex((p) => p.id === draggedPage.id);
        const targetIndex = pages.findIndex((p) => p.id === targetPage.id);

        const reordered = [...pages];
        const [removed] = reordered.splice(draggedIndex, 1);
        reordered.splice(targetIndex, 0, removed);

        const newOrder = reordered.map((p) => p.id);

        reorderPages(section.id, newOrder);

        setDraggedPage(null);
        setDragOverPage(null);
    }

    // Touch drag refs
    const touchDraggedSection = useRef(null);
    const touchDraggedPage = useRef(null);
    const touchDraggedPageSection = useRef(null);
    const touchClone = useRef(null);

    function createTouchClone(el, touch) {
        const clone = el.cloneNode(true);
        const rect = el.getBoundingClientRect();
        clone.style.position = "fixed";
        clone.style.left = rect.left + "px";
        clone.style.top = rect.top + "px";
        clone.style.width = rect.width + "px";
        clone.style.opacity = "0.7";
        clone.style.pointerEvents = "none";
        clone.style.zIndex = "9999";
        clone.style.transform = "scale(1.02)";
        document.body.appendChild(clone);
        touchClone.current = clone;
    }

    function removeTouchClone() {
        if (touchClone.current) {
            touchClone.current.remove();
            touchClone.current = null;
        }
    }

    function getElementFromPoint(x, y, excludeEl) {
        if (excludeEl) excludeEl.style.display = "none";
        const el = document.elementFromPoint(x, y);
        if (excludeEl) excludeEl.style.display = "";
        return el;
    }

    // Section touch handlers
    function handleSectionTouchStart(e, section) {
        if (editingSection) return;
        touchDraggedSection.current = section;
        const card = e.currentTarget.closest("[data-section-id]");
        createTouchClone(card || e.currentTarget, e.touches[0]);
        if (card) card.style.opacity = "0.4";
    }

    function handleSectionTouchMove(e) {
        if (!touchDraggedSection.current) return;
        const touch = e.touches[0];
        if (touchClone.current) {
            touchClone.current.style.left =
                touch.clientX - touchClone.current.offsetWidth / 2 + "px";
            touchClone.current.style.top = touch.clientY - 20 + "px";
        }
        const el = getElementFromPoint(
            touch.clientX,
            touch.clientY,
            touchClone.current,
        );
        const sectionEl = el?.closest("[data-section-id]");
        if (sectionEl) {
            const id = Number(sectionEl.dataset.sectionId);
            const over = sectionsMap.get(id);
            if (over) setDragOverSection(over);
        }
    }

    function handleSectionTouchEnd(e, currentSection) {
        if (!touchDraggedSection.current) return;
        const card = e.currentTarget.closest("[data-section-id]");
        if (card) card.style.opacity = "1";
        removeTouchClone();

        const touch = e.changedTouches[0];
        const el = getElementFromPoint(touch.clientX, touch.clientY, null);
        const sectionEl = el?.closest("[data-section-id]");
        if (sectionEl) {
            const targetId = Number(sectionEl.dataset.sectionId);
            if (targetId !== touchDraggedSection.current.id) {
                const sections = getSortedSections();
                const draggedIndex = sections.findIndex(
                    (s) => s.id === touchDraggedSection.current.id,
                );
                const targetIndex = sections.findIndex(
                    (s) => s.id === targetId,
                );
                const reordered = [...sections];
                const [removed] = reordered.splice(draggedIndex, 1);
                reordered.splice(targetIndex, 0, removed);
                reorderSections(reordered.map((s) => s.id));
            }
        }

        touchDraggedSection.current = null;
        setDragOverSection(null);
    }

    // Page touch handlers
    function handlePageTouchStart(e, page, section) {
        touchDraggedPage.current = page;
        touchDraggedPageSection.current = section;
        const row = e.currentTarget.closest("[data-page-id]");
        createTouchClone(row || e.currentTarget, e.touches[0]);
        if (row) row.style.opacity = "0.4";
    }

    function handlePageTouchMove(e) {
        if (!touchDraggedPage.current) return;
        const touch = e.touches[0];
        if (touchClone.current) {
            touchClone.current.style.left =
                touch.clientX - touchClone.current.offsetWidth / 2 + "px";
            touchClone.current.style.top = touch.clientY - 20 + "px";
        }
        const el = getElementFromPoint(
            touch.clientX,
            touch.clientY,
            touchClone.current,
        );
        const pageEl = el?.closest("[data-page-id]");
        if (pageEl) {
            const id = Number(pageEl.dataset.pageId);
            const section = touchDraggedPageSection.current;
            const over = section?.pages.find((p) => p.id === id);
            if (over) setDragOverPage(over);
        }
    }

    function handlePageTouchEnd(e) {
        if (!touchDraggedPage.current) return;
        const row = e.currentTarget.closest("[data-page-id]");
        if (row) row.style.opacity = "1";
        removeTouchClone();

        const touch = e.changedTouches[0];
        const el = getElementFromPoint(touch.clientX, touch.clientY, null);
        const pageEl = el?.closest("[data-page-id]");
        if (pageEl) {
            const targetId = Number(pageEl.dataset.pageId);
            const section = touchDraggedPageSection.current;
            if (section && targetId !== touchDraggedPage.current.id) {
                const pages = getSortedPages(section);
                const draggedIndex = pages.findIndex(
                    (p) => p.id === touchDraggedPage.current.id,
                );
                const targetIndex = pages.findIndex((p) => p.id === targetId);
                if (draggedIndex !== -1 && targetIndex !== -1) {
                    const reordered = [...pages];
                    const [removed] = reordered.splice(draggedIndex, 1);
                    reordered.splice(targetIndex, 0, removed);
                    reorderPages(
                        section.id,
                        reordered.map((p) => p.id),
                    );
                }
            }
        }

        touchDraggedPage.current = null;
        touchDraggedPageSection.current = null;
        setDragOverPage(null);
    }

    async function changePageSection(pageId, newSectionId, page = null) {
        if (!pageId) return;

        try {
            await fetch(currentAPI + "/sections/" + pageId, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    sectionId:
                        newSectionId === "none" ? null : Number(newSectionId),
                }),
            });

            if (newSectionId === "none") {
                if (page?.sectionId) {
                    const oldSection = sectionsMap.get(page.sectionId);
                    if (oldSection) {
                        oldSection.pages = oldSection.pages.filter(
                            (p) => p.id !== pageId,
                        );
                    }
                }
                if (page)
                    setUnsectionedPages((prev) => [
                        ...prev,
                        { ...page, sectionId: null },
                    ]);
            } else {
                if (page?.sectionId) {
                    const oldSection = sectionsMap.get(page.sectionId);
                    if (oldSection) {
                        oldSection.pages = oldSection.pages.filter(
                            (p) => p.id !== pageId,
                        );
                    }
                }
                const section = sectionsMap.get(Number(newSectionId));
                if (section && page) {
                    section.pages.push({
                        ...page,
                        sectionId: Number(newSectionId),
                    });
                }
                setUnsectionedPages((prev) =>
                    prev.filter((p) => p.id !== pageId),
                );
            }

            forceRender((x) => x + 1);
        } catch (err) {
            console.error("Failed to change page section:", err);
        }
    }

    return (
        <>
            {/* Add Section bar — stacks vertically on mobile, row on sm+ */}
            <div className="mt-8 max-w-4xl mb-4 flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="New section name"
                    className="bg-(--red-brown) text-white px-3 py-2 rounded w-full sm:flex-1"
                />
                <button
                    onClick={createSection}
                    className="bg-(--red-brown) text-white px-4 py-2 rounded hover: cursor-pointer w-full sm:w-auto"
                >
                    Add Section
                </button>
            </div>

            {/* ── EXPAND / COLLAPSE ALL button ─────────────────────────────── */}
            {getSortedSections().length > 0 && (
                <div className="max-w-4xl mb-2 flex justify-center sm:justify-start">
                    <button
                        onClick={toggleAllSections}
                        className="text-sm text-(--text-color) hover:text-(--accent-text) bg-(--red-brown-trans) hover:bg-(--primary) px-3 py-1 rounded transition-colors cursor-pointer font-semibold"
                    >
                        {allExpanded() ? "Collapse All" : "Expand All"}
                    </button>
                </div>
            )}
            {/* ─────────────────────────────────────────────────────────────── */}

            {/* Sections — desktop: table, mobile: card list */}
            <div className="max-w-4xl w-full">
                {/* Desktop table (hidden on mobile) */}
                <table className="m-0 w-full border border-(--outline) hidden sm:table">
                    <thead>
                        <tr className="bg-(--primary)">
                            <th className="p-2 text-left w-8"></th>
                            <th className="p-2 text-left text-white">
                                Section
                            </th>
                            <th className="p-2 text-left text-white">Pages</th>
                        </tr>
                    </thead>

                    <tbody>
                        {getSortedSections().map((section) => (
                            <tr
                                key={section.id}
                                className={`border-t border-(--outline) transition-colors ${
                                    dragOverSection?.id === section.id &&
                                    draggedSection?.id !== section.id
                                        ? "bg-(--red-brown-trans)"
                                        : ""
                                } ${editingSection === section.id ? "" : "cursor-move hover:bg-(--accent)"}`}
                                draggable={
                                    editingSection !== section.id &&
                                    !draggedPage
                                }
                                onDragStart={(e) =>
                                    handleSectionDragStart(e, section)
                                }
                                onDragEnd={handleSectionDragEnd}
                                onDragOver={handleSectionDragOver}
                                onDragEnter={(e) =>
                                    handleSectionDragEnter(e, section)
                                }
                                onDrop={(e) => handleSectionDrop(e, section)}
                            >
                                <td className="p-2 text-center text-(--text-color)">
                                    <span className="text-xl">⋮⋮</span>
                                </td>

                                <td className="p-2 align-top">
                                    <div className="flex gap-2">
                                        {editingSection === section.id ? (
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    value={sectionName}
                                                    onChange={(e) =>
                                                        setSectionName(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="bg-(--accent) text-(--accent-text) px-2 py-1 rounded"
                                                />
                                                <Check
                                                    className="cursor-pointer ml-auto text-(--text-color)"
                                                    onClick={() =>
                                                        renameSection(
                                                            section.id,
                                                        )
                                                    }
                                                />
                                                <X
                                                    className="cursor-pointer ml-auto text-(--text-color)"
                                                    onClick={() =>
                                                        setEditingSection(null)
                                                    }
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 items-center">
                                                {/* ── Per-section accordion toggle (desktop) ── */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSection(
                                                            section.id,
                                                        );
                                                    }}
                                                    className="cursor-pointer text-(--text-color) hover:text-(--outline) shrink-0"
                                                    title={
                                                        expandedSections.has(
                                                            section.id,
                                                        )
                                                            ? "Collapse"
                                                            : "Expand"
                                                    }
                                                >
                                                    {expandedSections.has(
                                                        section.id,
                                                    ) ? (
                                                        <ChevronDown
                                                            size={16}
                                                        />
                                                    ) : (
                                                        <ChevronRight
                                                            size={16}
                                                        />
                                                    )}
                                                </button>
                                                {/* ─────────────────────────────────────────── */}
                                                <span className="text-(--accent-text)">
                                                    {section.title}
                                                </span>
                                                <PencilIcon
                                                    className="cursor-pointer ml-auto text-(--text-color)"
                                                    onClick={() => {
                                                        setEditingSection(
                                                            section.id,
                                                        );
                                                        setSectionName(
                                                            section.title,
                                                        );
                                                    }}
                                                />
                                                <Trash
                                                    className="cursor-pointer ml-auto text-(--danger-text-color)"
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                `Delete section "${section.title}"?`,
                                                            )
                                                        ) {
                                                            deleteSection(
                                                                section.id,
                                                            );
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* ── Pages cell: only rendered when expanded (desktop) ── */}
                                <td className="p-2 align-top">
                                    {expandedSections.has(section.id) && (
                                        <>
                                            {getSortedPages(section).map(
                                                (page) => (
                                                    <div
                                                        key={page.id}
                                                        className={`mb-1 flex items-center gap-1 rounded px-1 transition-colors ${
                                                            dragOverPage?.id ===
                                                                page.id &&
                                                            draggedPage?.id !==
                                                                page.id
                                                                ? "bg-(--red-brown-trans)"
                                                                : ""
                                                        }`}
                                                        draggable
                                                        onDragStart={(e) =>
                                                            handlePageDragStart(
                                                                e,
                                                                page,
                                                            )
                                                        }
                                                        onDragEnd={
                                                            handlePageDragEnd
                                                        }
                                                        onDragOver={
                                                            handlePageDragOver
                                                        }
                                                        onDragEnter={(e) =>
                                                            handlePageDragEnter(
                                                                e,
                                                                page,
                                                            )
                                                        }
                                                        onDrop={(e) =>
                                                            handlePageDrop(
                                                                e,
                                                                page,
                                                                section,
                                                            )
                                                        }
                                                    >
                                                        <span className="text-(--text-color) cursor-move select-none mr-1">
                                                            ⋮⋮
                                                        </span>
                                                        <span className="text-(--accent-text)">
                                                            {page.title}
                                                        </span>
                                                        <select
                                                            className="bg-(--accent) text-(--accent-text) px-2 py-1 rounded ml-auto"
                                                            onChange={(e) =>
                                                                changePageSection(
                                                                    page.id,
                                                                    e.target
                                                                        .value,
                                                                    page,
                                                                )
                                                            }
                                                            defaultValue=""
                                                        >
                                                            <option value="">
                                                                Move to...
                                                            </option>
                                                            <option value="none">
                                                                No Section
                                                            </option>
                                                            {Array.from(
                                                                sectionsMap.values(),
                                                            )
                                                                .filter(
                                                                    (s) =>
                                                                        s.id !==
                                                                        section.id,
                                                                )
                                                                .map((s) => (
                                                                    <option
                                                                        key={
                                                                            s.id
                                                                        }
                                                                        value={
                                                                            s.id
                                                                        }
                                                                    >
                                                                        {
                                                                            s.title
                                                                        }
                                                                    </option>
                                                                ))}
                                                        </select>
                                                    </div>
                                                ),
                                            )}

                                            {/* Quick-add unsectioned pages */}
                                            {unsectionedPages.length > 0 && (
                                                <div
                                                    className="relative mt-2"
                                                    ref={
                                                        openQuickAdd ===
                                                        section.id
                                                            ? quickAddRef
                                                            : null
                                                    }
                                                >
                                                    <button
                                                        className="w-full text-sm font-semibold text-white bg-(--primary) hover:opacity-90 px-3 py-1.5 rounded cursor-pointer transition-colors"
                                                        onClick={() =>
                                                            setOpenQuickAdd(
                                                                openQuickAdd ===
                                                                    section.id
                                                                    ? null
                                                                    : section.id,
                                                            )
                                                        }
                                                    >
                                                        + Add page
                                                    </button>

                                                    {openQuickAdd ===
                                                        section.id && (
                                                        <div className="absolute left-0 mb-1 z-10 bg-(--accent) border border-(--outline) rounded shadow-xl min-w-48">
                                                            {unsectionedPages.map(
                                                                (page) => (
                                                                    <button
                                                                        key={
                                                                            page.id
                                                                        }
                                                                        className="block w-full text-left px-4 py-2 text-sm text-(--accent-text) hover:bg-(--surface-background) cursor-pointer"
                                                                        onClick={() => {
                                                                            changePageSection(
                                                                                page.id,
                                                                                String(
                                                                                    section.id,
                                                                                ),
                                                                                page,
                                                                            );
                                                                            setOpenQuickAdd(
                                                                                null,
                                                                            );
                                                                        }}
                                                                    >
                                                                        {
                                                                            page.title
                                                                        }
                                                                    </button>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </td>
                                {/* ──────────────────────────────────────────────────────── */}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Mobile card list (hidden on sm+) */}
                <div className="flex flex-col gap-3 sm:hidden">
                    {getSortedSections().map((section) => (
                        <div
                            key={section.id}
                            data-section-id={section.id}
                            className={`border border-(--outline) rounded-lg transition-colors ${
                                dragOverSection?.id === section.id &&
                                draggedSection?.id !== section.id
                                    ? "bg-(--red-brown-trans)"
                                    : ""
                            }`}
                            draggable={
                                editingSection !== section.id && !draggedPage
                            }
                            onDragStart={(e) =>
                                handleSectionDragStart(e, section)
                            }
                            onDragEnd={handleSectionDragEnd}
                            onDragOver={handleSectionDragOver}
                            onDragEnter={(e) =>
                                handleSectionDragEnter(e, section)
                            }
                            onDrop={(e) => handleSectionDrop(e, section)}
                        >
                            {/* Section header — was bg-blue-500, now themed */}
                            <div className="flex items-center gap-2 px-3 py-2 bg-(--primary) rounded-t-lg">
                                <span
                                    className="text-white text-lg select-none touch-none"
                                    onTouchStart={(e) =>
                                        handleSectionTouchStart(e, section)
                                    }
                                    onTouchMove={handleSectionTouchMove}
                                    onTouchEnd={(e) =>
                                        handleSectionTouchEnd(e, section)
                                    }
                                >
                                    ⋮⋮
                                </span>

                                {editingSection === section.id ? (
                                    <>
                                        <input
                                            value={sectionName}
                                            onChange={(e) =>
                                                setSectionName(e.target.value)
                                            }
                                            className="bg-(--accent) text-(--accent-text) px-2 py-1 rounded flex-1 min-w-0"
                                        />
                                        <Check
                                            size={18}
                                            className="cursor-pointer shrink-0 text-white"
                                            onClick={() =>
                                                renameSection(section.id)
                                            }
                                        />
                                        <X
                                            size={18}
                                            className="cursor-pointer shrink-0 text-white"
                                            onClick={() =>
                                                setEditingSection(null)
                                            }
                                        />
                                    </>
                                ) : (
                                    <>
                                        <span className="font-semibold flex-1 truncate text-white">
                                            {section.title}
                                        </span>
                                        <PencilIcon
                                            size={16}
                                            className="cursor-pointer shrink-0 text-white"
                                            onClick={() => {
                                                setEditingSection(section.id);
                                                setSectionName(section.title);
                                            }}
                                        />
                                        <Trash
                                            size={16}
                                            className="cursor-pointer shrink-0 text-white"
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        `Delete section "${section.title}"?`,
                                                    )
                                                ) {
                                                    deleteSection(section.id);
                                                }
                                            }}
                                        />
                                        {/* ── Per-section accordion toggle (mobile) ── */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSection(section.id);
                                            }}
                                            className="cursor-pointer text-white shrink-0 min-w-11 flex items-center justify-center active:opacity-60"
                                            title={
                                                expandedSections.has(section.id)
                                                    ? "Collapse"
                                                    : "Expand"
                                            }
                                        >
                                            {expandedSections.has(
                                                section.id,
                                            ) ? (
                                                <ChevronDown size={20} />
                                            ) : (
                                                <ChevronRight size={20} />
                                            )}
                                        </button>
                                        {/* ─────────────────────────────────────────── */}
                                    </>
                                )}
                            </div>

                            {/* ── Pages list: only rendered when expanded (mobile) ── */}
                            {expandedSections.has(section.id) && (
                                <div className="px-3 py-2 flex flex-col gap-1 bg-(--surface-background)">
                                    {getSortedPages(section).map((page) => (
                                        <div
                                            key={page.id}
                                            data-page-id={page.id}
                                            className={`flex items-center gap-2 rounded px-1 py-1 transition-colors ${
                                                dragOverPage?.id === page.id &&
                                                draggedPage?.id !== page.id
                                                    ? "bg-(--red-brown-trans)"
                                                    : ""
                                            }`}
                                            draggable
                                            onDragStart={(e) =>
                                                handlePageDragStart(e, page)
                                            }
                                            onDragEnd={handlePageDragEnd}
                                            onDragOver={handlePageDragOver}
                                            onDragEnter={(e) =>
                                                handlePageDragEnter(e, page)
                                            }
                                            onDrop={(e) =>
                                                handlePageDrop(e, page, section)
                                            }
                                        >
                                            <span
                                                className="text-(--text-color) cursor-move select-none shrink-0 touch-none"
                                                onTouchStart={(e) =>
                                                    handlePageTouchStart(
                                                        e,
                                                        page,
                                                        section,
                                                    )
                                                }
                                                onTouchMove={
                                                    handlePageTouchMove
                                                }
                                                onTouchEnd={handlePageTouchEnd}
                                            >
                                                ⋮⋮
                                            </span>
                                            <span className="flex-1 truncate text-sm text-(--accent-text)">
                                                {page.title}
                                            </span>
                                            <select
                                                className="bg-(--accent) text-(--accent-text) px-1 py-1 rounded text-xs max-w-[120px] shrink-0"
                                                onChange={(e) =>
                                                    changePageSection(
                                                        page.id,
                                                        e.target.value,
                                                        page,
                                                    )
                                                }
                                                defaultValue=""
                                            >
                                                <option value="">
                                                    Move to...
                                                </option>
                                                <option value="none">
                                                    No Section
                                                </option>
                                                {Array.from(
                                                    sectionsMap.values(),
                                                )
                                                    .filter(
                                                        (s) =>
                                                            s.id !== section.id,
                                                    )
                                                    .map((s) => (
                                                        <option
                                                            key={s.id}
                                                            value={s.id}
                                                        >
                                                            {s.title}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    ))}

                                    {/* Quick-add unsectioned pages */}
                                    {unsectionedPages.length > 0 && (
                                        <div
                                            className="relative mt-1"
                                            ref={
                                                openQuickAdd === section.id
                                                    ? quickAddRef
                                                    : null
                                            }
                                        >
                                            <button
                                                className="w-full text-sm font-semibold text-white bg-(--primary) hover:opacity-90 px-3 py-1.5 rounded cursor-pointer transition-colors"
                                                onClick={() =>
                                                    setOpenQuickAdd(
                                                        openQuickAdd ===
                                                            section.id
                                                            ? null
                                                            : section.id,
                                                    )
                                                }
                                            >
                                                + Add page
                                            </button>

                                            {openQuickAdd === section.id && (
                                                <div className="absolute left-0 mb-1 z-10 bg-(--accent) border border-(--outline) rounded shadow-xl min-w-48 w-full">
                                                    {unsectionedPages.map(
                                                        (page) => (
                                                            <button
                                                                key={page.id}
                                                                className="block w-full text-left px-4 py-2 text-sm text-(--accent-text) hover:bg-(--surface-background) cursor-pointer"
                                                                onClick={() => {
                                                                    changePageSection(
                                                                        page.id,
                                                                        String(
                                                                            section.id,
                                                                        ),
                                                                        page,
                                                                    );
                                                                    setOpenQuickAdd(
                                                                        null,
                                                                    );
                                                                }}
                                                            >
                                                                {page.title}
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* ──────────────────────────────────────────────────────── */}
                        </div>
                    ))}
                </div>
            </div>

            {/* Unsectioned pages */}
            {unsectionedPages.length > 0 && (
                <div className="mt-6 max-w-4xl w-full">
                    <h2 className="text-lg font-bold mb-2 text-(--accent-text)">
                        Unsectioned Pages
                    </h2>

                    {/* Desktop table */}
                    <table className="w-full border border-(--outline) hidden sm:table">
                        <thead>
                            <tr className="bg-(--primary)">
                                <th className="p-2 text-left text-white">
                                    Page
                                </th>
                                <th className="p-2 text-left text-white">
                                    Assign to Section
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {unsectionedPages.map((page) => (
                                <tr
                                    key={page.id}
                                    className="border-t border-(--outline) hover:bg-(--accent) transition-colors"
                                >
                                    <td className="p-2 text-(--accent-text)">
                                        {page.title}
                                    </td>
                                    <td className="p-2">
                                        <select
                                            className="bg-(--accent) text-(--accent-text) px-2 py-1 rounded"
                                            onChange={(e) =>
                                                changePageSection(
                                                    page.id,
                                                    e.target.value,
                                                    page,
                                                )
                                            }
                                            defaultValue=""
                                        >
                                            <option value="">
                                                Assign to...
                                            </option>
                                            {Array.from(
                                                sectionsMap.values(),
                                            ).map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.title}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mobile card list for unsectioned pages */}
                    <div className="flex flex-col sm:hidden border border-(--outline) rounded-lg bg-(--surface-background)">
                        {unsectionedPages.map((page) => (
                            <div
                                key={page.id}
                                className="flex items-center gap-2 border-t border-(--outline) first:border-t-0 px-3 py-2 hover:bg-(--accent) transition-colors"
                            >
                                <span className="flex-1 truncate text-sm text-(--accent-text)">
                                    {page.title}
                                </span>
                                <select
                                    className="bg-(--accent) text-(--accent-text) px-1 py-1 rounded text-xs max-w-[140px] shrink-0"
                                    onChange={(e) =>
                                        changePageSection(
                                            page.id,
                                            e.target.value,
                                            page,
                                        )
                                    }
                                    defaultValue=""
                                >
                                    <option value="">Assign to...</option>
                                    {Array.from(sectionsMap.values()).map(
                                        (s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.title}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

