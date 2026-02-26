import { useEffect, useState, useRef } from "react";
import { currentAPI } from "../config/api.js";
import { useRouteLoaderData } from "react-router";
import { PencilIcon, Check, X, Trash } from "lucide-react";

export default function NavigationPanel() {
    const [, forceRender] = useState(0);
    const { gameData, sectionsMap } = useRouteLoaderData("main");
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

    const [editingPage, setEditingPage] = useState(null);
    const [pageName, setPageName] = useState("");

    const [newSectionName, setNewSectionName] = useState("");

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
            if (quickAddRef.current && !quickAddRef.current.contains(e.target)) {
                setOpenQuickAdd(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openQuickAdd]);

    const getSortedSections = () => {
        return Array.from(sectionsMap.values()).sort(
            (a, b) => a.order - b.order,
        );
    };

    const getSortedPages = (section) => {
        return [...section.pages].sort(
            (a, b) => (a.sort ?? 0) - (b.sort ?? 0),
        );
    };

    async function createSection() {
        if (!newSectionName.trim()) {
            alert("Section name cannot be empty");
            return;
        }

        try {
            const sections = getSortedSections();
            const maxOrder =
                sections.length > 0
                    ? Math.max(...sections.map((s) => s.order || 0))
                    : -1;

            const response = await fetch(currentAPI + "/sections", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    title: newSectionName,
                    gameId,
                    order: maxOrder + 1,
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
                credentials: "include",
                body: JSON.stringify({
                    gameId,
                    sectionOrder: newOrder,
                }),
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
                    "x-admin-secret": secret,
                },
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

    async function renamePage(id, sectionId) {
        try {
            await fetch(currentAPI + "/pages/" + id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ title: pageName }),
            });

            const section = sectionsMap.get(sectionId);
            const page = section.pages.find((p) => p.id === id);
            page.title = pageName;

            setEditingPage(null);
            forceRender((x) => x + 1);
        } catch (err) {
            console.error("Failed to rename page:", err);
        }
    }

    async function deletePage(id, sectionId) {
        try {
            await fetch(currentAPI + "/pages/" + id, {
                method: "DELETE",
                credentials: "include",
            });

            const section = sectionsMap.get(sectionId);
            section.pages = section.pages.filter((p) => p.id !== id);

            setEditingPage(null);
            forceRender((x) => x + 1);
        } catch (err) {
            console.error("Failed to delete page:", err);
        }
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
            <div className="mt-8 max-w-4xl mb-4 flex gap-2">
                <input
                    type="text"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="New section name"
                    className="bg-(--red-brown) text-white px-3 py-2 rounded flex-1"
                />
                <button
                    onClick={createSection}
                    className="bg-(--red-brown) text-white px-4 py-2 rounded hover: cursor-pointer"
                >
                    Add Section
                </button>
            </div>

            <div className="max-w-4xl">
                <table className="m-0 w-full border border-gray-700">
                    <thead>
                        <tr className="bg-gray-800">
                            <th className="p-2 text-left w-8"></th>
                            <th className="p-2 text-left">Section</th>
                            <th className="p-2 text-left">Pages</th>
                        </tr>
                    </thead>

                    <tbody>
                        {getSortedSections().map((section) => (
                            <tr
                                key={section.id}
                                className={`border-t border-gray-700 transition-colors ${
                                    dragOverSection?.id === section.id &&
                                    draggedSection?.id !== section.id
                                        ? "bg-gray-700"
                                        : ""
                                } ${editingSection === section.id ? "" : "cursor-move hover:bg-gray-800"}`}
                                draggable={editingSection !== section.id && !draggedPage}
                                onDragStart={(e) => handleSectionDragStart(e, section)}
                                onDragEnd={handleSectionDragEnd}
                                onDragOver={handleSectionDragOver}
                                onDragEnter={(e) => handleSectionDragEnter(e, section)}
                                onDrop={(e) => handleSectionDrop(e, section)}
                            >
                                <td className="p-2 text-center text-gray-500">
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
                                                    className="bg-gray-900 text-white px-2 py-1 rounded"
                                                />
                                                <Check
                                                    className="cursor-pointer ml-auto"
                                                    onClick={() =>
                                                        renameSection(
                                                            section.id,
                                                        )
                                                    }
                                                />
                                                <X
                                                    className="cursor-pointer ml-auto"
                                                    onClick={() =>
                                                        setEditingSection(null)
                                                    }
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 items-center">
                                                {section.title}
                                                <PencilIcon
                                                    className="cursor-pointer ml-auto"
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
                                                    className="cursor-pointer ml-auto"
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                `Delete page "${pageName}"?`,
                                                            )
                                                        ) {
                                                            deletePage(
                                                                editingPage.id,
                                                                editingPage.sectionId,
                                                            );
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </td>

                                <td className="p-2 align-top">
                                    {getSortedPages(section).map((page) => (
                                        <div
                                            key={page.id}
                                            className={`mb-1 flex items-center gap-1 rounded px-1 transition-colors ${
                                                dragOverPage?.id === page.id &&
                                                draggedPage?.id !== page.id
                                                    ? "bg-gray-600"
                                                    : ""
                                            }`}
                                            draggable
                                            onDragStart={(e) => handlePageDragStart(e, page)}
                                            onDragEnd={handlePageDragEnd}
                                            onDragOver={handlePageDragOver}
                                            onDragEnter={(e) => handlePageDragEnter(e, page)}
                                            onDrop={(e) => handlePageDrop(e, page, section)}
                                        >
                                            <span className="text-gray-500 cursor-move select-none mr-1">⋮⋮</span>
                                            {page.title}
                                            <select
                                                className="bg-gray-900 text-white px-2 py-1 rounded ml-auto"
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
                                            className="relative mt-2"
                                            ref={openQuickAdd === section.id ? quickAddRef : null}
                                        >
                                            <button
                                                className="w-full text-sm font-semibold text-white bg-black hover:bg-gray-800 px-3 py-1.5 rounded cursor-pointer transition-colors"
                                                onClick={() =>
                                                    setOpenQuickAdd(
                                                        openQuickAdd === section.id
                                                            ? null
                                                            : section.id,
                                                    )
                                                }
                                            >
                                                + Add page
                                            </button>

                                            {openQuickAdd === section.id && (
                                                <div className="absolute left-0 top-9 z-10 bg-gray-800 border border-gray-500 rounded shadow-xl min-w-48">
                                                    {unsectionedPages.map((page) => (
                                                        <button
                                                            key={page.id}
                                                            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer"
                                                            onClick={() => {
                                                                changePageSection(
                                                                    page.id,
                                                                    String(section.id),
                                                                    page,
                                                                );
                                                                setOpenQuickAdd(null);
                                                            }}
                                                        >
                                                            {page.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Unsectioned pages */}
            {unsectionedPages.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-lg font-bold mb-2">
                        Unsectioned Pages
                    </h2>

                    <table className="w-full border border-gray-700">
                        <thead>
                            <tr className="bg-gray-800">
                                <th className="p-2 text-left">Page</th>
                                <th className="p-2 text-left">
                                    Assign to Section
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {unsectionedPages.map((page) => (
                                <tr
                                    key={page.id}
                                    className="border-t border-gray-700"
                                >
                                    <td className="p-2">{page.title}</td>
                                    <td className="p-2">
                                        <select
                                            className="bg-gray-900 text-white px-2 py-1 rounded"
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
                </div>
            )}

            {/* Page edit popup */}
            {editingPage && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-6 rounded-lg space-y-4 min-w-96">
                        <h3 className="text-xl font-bold">Edit Page</h3>

                        <div>
                            <label className="block mb-2">Page Title:</label>
                            <input
                                value={pageName}
                                onChange={(e) => setPageName(e.target.value)}
                                className="bg-gray-800 text-white px-3 py-2 rounded w-full"
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() =>
                                    renamePage(
                                        editingPage.id,
                                        editingPage.sectionId,
                                    )
                                }
                                className="bg-green-600 px-4 py-2 rounded"
                            >
                                Save
                            </button>

                            <button
                                onClick={() => {
                                    if (confirm(`Delete page "${pageName}"?`)) {
                                        deletePage(
                                            editingPage.id,
                                            editingPage.sectionId,
                                        );
                                    }
                                }}
                                className="bg-red-600 px-4 py-2 rounded"
                            >
                                Delete
                            </button>

                            <button
                                onClick={() => setEditingPage(null)}
                                className="bg-gray-600 px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

