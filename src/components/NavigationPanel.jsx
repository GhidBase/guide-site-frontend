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
    Info,
    Palette,
    ExternalLink,
} from "lucide-react";
import {
    useTheme,
    THEME_DEFAULTS,
    THEME_FIELDS,
} from "../contexts/ThemeProvider.jsx";

const secret = import.meta.env.VITE_SECRET;

export default function NavigationPanel() {
    const [, forceRender] = useState(0);
    const { gameData, sectionsMap, isLDG } = useRouteLoaderData("main");
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

    const [newPageTitle, setNewPageTitle] = useState("");
    const [newPageSection, setNewPageSection] = useState("");
    const [editingPage, setEditingPage] = useState(null);
    const [pageName, setPageName] = useState("");
    const [detailPage, setDetailPage] = useState(null);
    const [detailTitle, setDetailTitle] = useState("");
    const [detailSlug, setDetailSlug] = useState("");
    const [detailDescription, setDetailDescription] = useState("");

    const { theme, setTheme } = useTheme();
    const [themeOpen, setThemeOpen] = useState(false);
    const [themeClosing, setThemeClosing] = useState(false);
    const [editingTheme, setEditingTheme] = useState(null);
    const [savedTheme, setSavedTheme] = useState(null);
    const [detailClosing, setDetailClosing] = useState(false);

    const [discordUrl, setDiscordUrl] = useState(gameData?.discordUrl ?? "");
    const [showSupportButton, setShowSupportButton] = useState(gameData?.showSupportButton !== false);

    // ── IMAGE POOL ────────────────────────────────────────────────────────────
    const [images, setImages] = useState([]);
    const [imagePoolOpen, setImagePoolOpen] = useState(false);
    const [imageUploadFile, setImageUploadFile] = useState(null);
    const [imageUploadTitle, setImageUploadTitle] = useState("");
    const [imageUploadCategory, setImageUploadCategory] = useState("");
    const [imageUploading, setImageUploading] = useState(false);
    const [bulkFiles, setBulkFiles] = useState([]);
    const [bulkCategory, setBulkCategory] = useState("");
    const [bulkProgress, setBulkProgress] = useState(null); // null | { done, total }

    useEffect(() => {
        if (!gameId) return;
        fetch(currentAPI + "/games/" + gameId + "/images")
            .then((r) => r.json())
            .then(setImages)
            .catch(() => {});
    }, [gameId]);

    async function uploadImage() {
        if (!imageUploadFile) return;
        setImageUploading(true);
        const formData = new FormData();
        formData.append("image", imageUploadFile);
        formData.append("title", imageUploadTitle || imageUploadFile.name);
        if (imageUploadCategory.trim()) {
            formData.append("category", imageUploadCategory.trim());
        }
        try {
            const res = await fetch(currentAPI + "/games/" + gameId + "/images", {
                method: "POST",
                credentials: "include",
                body: formData,
            });
            const newImage = await res.json();
            setImages((prev) => [...prev, newImage]);
            setImageUploadFile(null);
            setImageUploadTitle("");
        } catch (err) {
            console.error("Failed to upload image:", err);
        } finally {
            setImageUploading(false);
        }
    }

    async function bulkUploadImages(category) {
        if (bulkFiles.length === 0) return;
        setBulkProgress({ done: 0, total: bulkFiles.length });
        const uploaded = [];
        for (let i = 0; i < bulkFiles.length; i++) {
            const file = bulkFiles[i];
            const formData = new FormData();
            formData.append("image", file);
            formData.append("title", file.name.replace(/\.[^.]+$/, ""));
            if (category.trim()) formData.append("category", category.trim());
            try {
                const res = await fetch(currentAPI + "/games/" + gameId + "/images", {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                });
                if (res.ok) {
                    const newImage = await res.json();
                    uploaded.push(newImage);
                }
            } catch (err) {
                console.error("Failed to upload", file.name, err);
            }
            setBulkProgress({ done: i + 1, total: bulkFiles.length });
        }
        setImages((prev) => [...prev, ...uploaded]);
        setBulkFiles([]);
        setBulkProgress(null);
    }

    async function deleteImagesByCategory(cat) {
        const group = images.filter((img) => cat === "" ? !img.category : img.category === cat);
        if (!confirm(`Delete all ${group.length} image${group.length !== 1 ? "s" : ""} in "${cat || "Uncategorized"}"?`)) return;
        for (const img of group) {
            try {
                await fetch(currentAPI + "/games/" + gameId + "/images/" + img.id, {
                    method: "DELETE",
                    credentials: "include",
                });
            } catch (err) {
                console.error("Failed to delete", img.id, err);
            }
        }
        setImages((prev) => prev.filter((img) => cat === "" ? img.category : img.category !== cat));
    }

    async function deleteImage(imageId) {
        try {
            await fetch(currentAPI + "/games/" + gameId + "/images/" + imageId, {
                method: "DELETE",
                credentials: "include",
            });
            setImages((prev) => prev.filter((img) => img.id !== imageId));
        } catch (err) {
            console.error("Failed to delete image:", err);
        }
    }
    // ─────────────────────────────────────────────────────────────────────────

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
        console.log("changePageSection:", { pageId, newSectionId, parsedId: Number(newSectionId) });
        if (!pageId) return;

        try {
            const res = await fetch(currentAPI + "/games/" + gameId + "/pages/by-id/" + pageId, {
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
            if (!res.ok) {
                const text = await res.text();
                console.error("changePageSection failed:", res.status, text);
                alert("Failed to assign page to section: " + res.status + " " + text);
                return;
            }

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

    async function createPage() {
        if (!newPageTitle.trim()) {
            alert("Page title cannot be empty");
            return;
        }
        const body = { title: newPageTitle };
        if (newPageSection) body.sectionId = Number(newPageSection);
        try {
            const res = await fetch(currentAPI + "/games/" + gameId + "/pages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body),
            });
            const newPage = await res.json();
            if (newPage.sectionId) {
                const section = sectionsMap.get(newPage.sectionId);
                if (section) section.pages.push(newPage);
                forceRender((x) => x + 1);
            } else {
                setUnsectionedPages((prev) => [...prev, newPage]);
            }
            setNewPageTitle("");
            setNewPageSection("");
        } catch (err) {
            console.error("Failed to create page:", err);
        }
    }

    async function deletePage(page) {
        try {
            await fetch(
                currentAPI + "/games/" + gameId + "/pages/by-id/" + page.id,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                },
            );
            if (page.sectionId) {
                const section = sectionsMap.get(page.sectionId);
                if (section)
                    section.pages = section.pages.filter(
                        (p) => p.id !== page.id,
                    );
                forceRender((x) => x + 1);
            } else {
                setUnsectionedPages((prev) =>
                    prev.filter((p) => p.id !== page.id),
                );
            }
        } catch (err) {
            console.error("Failed to delete page:", err);
        }
    }

    async function renamePage(id) {
        try {
            await fetch(
                currentAPI + "/games/" + gameId + "/pages/by-id/" + id,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ title: pageName }),
                },
            );
            let updated = false;
            for (const section of sectionsMap.values()) {
                const page = section.pages.find((p) => p.id === id);
                if (page) {
                    page.title = pageName;
                    updated = true;
                    break;
                }
            }
            if (!updated) {
                setUnsectionedPages((prev) =>
                    prev.map((p) =>
                        p.id === id ? { ...p, title: pageName } : p,
                    ),
                );
            } else {
                forceRender((x) => x + 1);
            }
            setEditingPage(null);
        } catch (err) {
            console.error("Failed to rename page:", err);
        }
    }

    useEffect(() => {
        if (detailPage) {
            setDetailTitle(detailPage.title ?? "");
            setDetailSlug(detailPage.slug ?? "");
            setDetailDescription(detailPage.description ?? "");
        }
    }, [detailPage]);

    function openDetailPage(page) {
        setDetailPage(page);
    }

    function openThemeEditor() {
        const current = { ...THEME_DEFAULTS, ...(gameData?.theme ?? {}) };
        setEditingTheme(current);
        setSavedTheme(current);
        setThemeOpen(true);
    }

    function handleThemeChange(key, value) {
        const next = { ...editingTheme, [key]: value };
        setEditingTheme(next);
        setTheme(next); // live preview
    }

    function closeThemeAnimated(then) {
        setThemeClosing(true);
        setTimeout(() => {
            setThemeClosing(false);
            setThemeOpen(false);
            then?.();
        }, 150);
    }

    function cancelTheme() {
        setTheme(savedTheme); // revert live preview
        closeThemeAnimated(() => setEditingTheme(null));
    }

    function resetThemeToDefaults() {
        setEditingTheme(THEME_DEFAULTS);
        setTheme(THEME_DEFAULTS);
    }

    async function saveTheme() {
        try {
            await fetch(currentAPI + "/games/" + gameId + "/theme", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ theme: editingTheme }),
            });
            setSavedTheme(editingTheme);
            closeThemeAnimated();
        } catch (err) {
            console.error("Failed to save theme:", err);
        }
    }

    async function saveDiscordUrl() {
        try {
            await fetch(currentAPI + "/games/" + gameId, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ discordUrl, showSupportButton }),
            });
        } catch (err) {
            console.error("Failed to save discord URL:", err);
        }
    }

    async function savePageDetail() {
        const id = detailPage.id;
        const titleChanged = detailTitle !== detailPage.title;
        const slugChanged = detailSlug !== (detailPage.slug ?? "");
        const descriptionChanged = detailDescription !== (detailPage.description ?? "");

        try {
            if (titleChanged || slugChanged || descriptionChanged) {
                const body = {};
                if (titleChanged) body.title = detailTitle;
                if (slugChanged) body.slug = detailSlug;
                if (descriptionChanged) body.description = detailDescription;
                await fetch(
                    currentAPI + "/games/" + gameId + "/pages/by-id/" + id,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify(body),
                    },
                );
            }

            // Update local state mirrors
            const updated = {
                ...detailPage,
                title: detailTitle,
                slug: detailSlug,
                description: detailDescription,
            };
            let foundInSection = false;
            for (const section of sectionsMap.values()) {
                const idx = section.pages.findIndex((p) => p.id === id);
                if (idx !== -1) {
                    section.pages[idx] = updated;
                    foundInSection = true;
                    break;
                }
            }
            if (!foundInSection) {
                setUnsectionedPages((prev) =>
                    prev.map((p) => (p.id === id ? updated : p)),
                );
            } else {
                forceRender((x) => x + 1);
            }
            closeDetailAnimated();
        } catch (err) {
            console.error("Failed to save page detail:", err);
        }
    }

    function closeDetailAnimated() {
        setDetailClosing(true);
        setTimeout(() => {
            setDetailClosing(false);
            setDetailPage(null);
        }, 150);
    }

    return (
        <>
        <div className="px-4 sm:px-0">
            {/* ── Game Settings ─────────────────────────────────────────────── */}
            <div className="mt-8 max-w-4xl mb-6 border border-(--outline)/40 rounded-lg overflow-hidden">
                <div className="bg-(--primary) px-4 py-2">
                    <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Game Settings</h2>
                </div>
                <div className="p-4 flex flex-col gap-3 bg-(--accent)">
                    {/* Discord URL */}
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={discordUrl}
                            onChange={(e) => setDiscordUrl(e.target.value)}
                            placeholder="Discord invite URL"
                            className="bg-(--surface-background) text-(--accent-text) placeholder-(--text-color) px-3 py-2 rounded flex-1 min-w-0 text-sm"
                        />
                        <button
                            onClick={saveDiscordUrl}
                            className="bg-(--primary) text-white px-4 py-2 rounded cursor-pointer hover:opacity-90 shrink-0 text-sm font-semibold"
                        >
                            Save
                        </button>
                    </div>

                    {/* Support button toggle */}
                    <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
                        <input
                            type="checkbox"
                            checked={showSupportButton}
                            onChange={e => setShowSupportButton(e.target.checked)}
                            className="w-4 h-4 accent-(--primary) cursor-pointer"
                        />
                        <span className="text-sm text-(--text-color)">Show "Support the Developer" in footer</span>
                    </label>

                    {/* Theme + Image Pool buttons */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={openThemeEditor}
                            className="flex items-center gap-2 bg-(--surface-background) text-(--accent-text) border border-(--outline)/40 px-4 py-2 rounded cursor-pointer hover:bg-(--primary) hover:text-white transition-colors text-sm font-semibold"
                        >
                            <Palette size={15} />
                            Game Theme
                        </button>
                        <button
                            onClick={() => setImagePoolOpen((o) => !o)}
                            className="flex items-center gap-2 bg-(--surface-background) text-(--accent-text) border border-(--outline)/40 px-4 py-2 rounded cursor-pointer hover:bg-(--primary) hover:text-white transition-colors text-sm font-semibold"
                        >
                            {imagePoolOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                            Image Pool
                            <span className="opacity-60 text-xs">({images.length})</span>
                        </button>
                    </div>

                    {/* Image Pool expanded */}
                    {imagePoolOpen && (
                        <div className="border border-(--outline)/40 rounded-lg p-4 flex flex-col gap-4 bg-(--surface-background)">
                            {/* Bulk upload */}
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-semibold text-(--accent-text)">Bulk Import</p>
                                <div className="flex gap-2 items-center flex-wrap">
                                    <input
                                        type="text"
                                        value={bulkCategory}
                                        onChange={(e) => setBulkCategory(e.target.value)}
                                        placeholder="Category for all (optional)"
                                        className="bg-(--accent) text-(--accent-text) px-3 py-1.5 rounded text-sm flex-1 min-w-0"
                                        disabled={bulkProgress !== null}
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => setBulkFiles(Array.from(e.target.files))}
                                        className="text-sm text-(--text-color) flex-1 min-w-0"
                                        disabled={bulkProgress !== null}
                                    />
                                    <button
                                        onClick={() => bulkUploadImages(bulkCategory)}
                                        disabled={bulkFiles.length === 0 || bulkProgress !== null}
                                        className="bg-(--primary) text-white px-4 py-1.5 rounded text-sm cursor-pointer hover:opacity-90 disabled:opacity-50 font-semibold shrink-0"
                                    >
                                        {bulkProgress
                                                ? `Uploading ${bulkProgress.done}/${bulkProgress.total}…`
                                                : `Upload ${bulkFiles.length} file${bulkFiles.length !== 1 ? "s" : ""}`}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-semibold text-(--accent-text)">Upload Image</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageUploadFile(e.target.files[0] ?? null)}
                                    className="text-sm text-(--text-color)"
                                />
                                <div className="flex gap-2 flex-wrap">
                                    <input
                                        type="text"
                                        value={imageUploadTitle}
                                        onChange={(e) => setImageUploadTitle(e.target.value)}
                                        placeholder="Title (optional)"
                                        className="bg-(--accent) text-(--accent-text) px-3 py-1.5 rounded text-sm flex-1 min-w-0"
                                    />
                                    <input
                                        type="text"
                                        value={imageUploadCategory}
                                        onChange={(e) => setImageUploadCategory(e.target.value)}
                                        placeholder="Category (optional)"
                                        className="bg-(--accent) text-(--accent-text) px-3 py-1.5 rounded text-sm flex-1 min-w-0"
                                    />
                                </div>
                                <button
                                    onClick={uploadImage}
                                    disabled={!imageUploadFile || imageUploading}
                                    className="bg-(--primary) text-white px-4 py-1.5 rounded text-sm cursor-pointer hover:opacity-90 disabled:opacity-50 self-start font-semibold"
                                >
                                    {imageUploading ? "Uploading…" : "Upload"}
                                </button>
                            </div>
                            {images.length === 0 && (
                                <p className="text-sm text-(--text-color) italic">No images yet.</p>
                            )}
                            {(() => {
                                const categories = ["", ...new Set(images.map((img) => img.category).filter(Boolean))];
                                return categories.map((cat) => {
                                    const group = images.filter((img) =>
                                        cat === "" ? !img.category : img.category === cat,
                                    );
                                    if (group.length === 0) return null;
                                    return (
                                        <div key={cat || "__uncategorized"}>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs font-semibold text-(--text-color) uppercase">
                                                    {cat || "Uncategorized"} ({group.length})
                                                </p>
                                                <button
                                                    onClick={() => deleteImagesByCategory(cat)}
                                                    className="text-xs text-(--danger-text-color) hover:opacity-70 cursor-pointer"
                                                >
                                                    Delete all
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                {group.map((img) => (
                                                    <div
                                                        key={img.id}
                                                        className="relative group border border-(--outline)/30 rounded overflow-hidden"
                                                    >
                                                        <img
                                                            src={img.url}
                                                            alt={img.title}
                                                            className="w-full h-16 object-contain bg-white"
                                                        />
                                                        <p className="text-xs text-(--text-color) px-1 py-0.5 truncate">
                                                            {img.title}
                                                        </p>
                                                        <button
                                                            onClick={() => deleteImage(img.id)}
                                                            className="absolute top-1 right-1 bg-black/60 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                        >
                                                            <Trash size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Add Section / Add Page ─────────────────────────────────────── */}
            <div className="max-w-4xl mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        placeholder="New section name"
                        className="bg-(--red-brown) text-white placeholder-white/70 px-3 py-2 rounded flex-1 min-w-0 text-sm"
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); createSection(); } }}
                    />
                    <button
                        onClick={createSection}
                        className="bg-(--red-brown) text-white px-3 py-2 rounded cursor-pointer hover:opacity-90 shrink-0 text-sm font-semibold"
                    >
                        + Section
                    </button>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newPageTitle}
                        onChange={(e) => setNewPageTitle(e.target.value)}
                        placeholder="New page title"
                        className="bg-(--red-brown) text-white placeholder-white/70 px-3 py-2 rounded flex-1 min-w-0 text-sm"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                createPage();
                            }
                        }}
                    />
                    <button
                        onClick={createPage}
                        className="bg-(--red-brown) text-white px-3 py-2 rounded cursor-pointer hover:opacity-90 shrink-0 text-sm font-semibold"
                    >
                        + Page
                    </button>
                </div>
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
                                                        draggable={
                                                            editingPage !==
                                                            page.id
                                                        }
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
                                                        <span className="text-(--text-color) cursor-move select-none mr-1 shrink-0">
                                                            ⋮⋮
                                                        </span>
                                                        {editingPage ===
                                                        page.id ? (
                                                            <>
                                                                <input
                                                                    value={
                                                                        pageName
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setPageName(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="bg-(--accent) text-(--accent-text) px-2 py-1 rounded flex-1 min-w-0"
                                                                    onKeyDown={(
                                                                        e,
                                                                    ) => {
                                                                        if (
                                                                            e.key ===
                                                                            "Enter"
                                                                        )
                                                                            renamePage(
                                                                                page.id,
                                                                            );
                                                                        if (
                                                                            e.key ===
                                                                            "Escape"
                                                                        )
                                                                            setEditingPage(
                                                                                null,
                                                                            );
                                                                    }}
                                                                    autoFocus
                                                                />
                                                                <Check
                                                                    size={14}
                                                                    className="cursor-pointer shrink-0 text-(--text-color)"
                                                                    onClick={() =>
                                                                        renamePage(
                                                                            page.id,
                                                                        )
                                                                    }
                                                                />
                                                                <X
                                                                    size={14}
                                                                    className="cursor-pointer shrink-0 text-(--text-color)"
                                                                    onClick={() =>
                                                                        setEditingPage(
                                                                            null,
                                                                        )
                                                                    }
                                                                />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="text-(--accent-text) flex-1 truncate">
                                                                    {page.title}
                                                                </span>
                                                                <PencilIcon
                                                                    size={14}
                                                                    className="cursor-pointer shrink-0 text-(--text-color)"
                                                                    onClick={() => {
                                                                        setEditingPage(
                                                                            page.id,
                                                                        );
                                                                        setPageName(
                                                                            page.title,
                                                                        );
                                                                    }}
                                                                />
                                                                <Trash
                                                                    size={14}
                                                                    className="cursor-pointer shrink-0 text-(--danger-text-color)"
                                                                    onClick={() => {
                                                                        if (
                                                                            confirm(
                                                                                `Delete page "${page.title}"?`,
                                                                            )
                                                                        )
                                                                            deletePage(
                                                                                page,
                                                                            );
                                                                    }}
                                                                />
                                                                <Info
                                                                    size={14}
                                                                    className="cursor-pointer shrink-0 text-(--text-color)"
                                                                    onClick={() =>
                                                                        setDetailPage(
                                                                            page,
                                                                        )
                                                                    }
                                                                />
                                                                {page.slug && (
                                                                    <a
                                                                        href={isLDG || !gameData ? "/" + page.slug : "/games/" + gameData.slug + "/" + page.slug}
                                                                        className="shrink-0 text-(--text-color)"
                                                                    >
                                                                        <ExternalLink size={14} />
                                                                    </a>
                                                                )}
                                                                <select
                                                                    className="bg-(--accent) text-(--accent-text) px-2 py-1 rounded ml-auto shrink-0"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        changePageSection(
                                                                            page.id,
                                                                            e
                                                                                .target
                                                                                .value,
                                                                            page,
                                                                        )
                                                                    }
                                                                    defaultValue=""
                                                                >
                                                                    <option value="">
                                                                        Move
                                                                        to...
                                                                    </option>
                                                                    <option value="none">
                                                                        No
                                                                        Section
                                                                    </option>
                                                                    {Array.from(
                                                                        sectionsMap.values(),
                                                                    )
                                                                        .filter(
                                                                            (
                                                                                s,
                                                                            ) =>
                                                                                s.id !==
                                                                                section.id,
                                                                        )
                                                                        .map(
                                                                            (
                                                                                s,
                                                                            ) => (
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
                                                                            ),
                                                                        )}
                                                                </select>
                                                            </>
                                                        )}
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
                                            {editingPage === page.id ? (
                                                <>
                                                    <input
                                                        value={pageName}
                                                        onChange={(e) =>
                                                            setPageName(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="bg-(--accent) text-(--accent-text) px-2 py-1 rounded flex-1 min-w-0 text-sm"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter")
                                                                renamePage(
                                                                    page.id,
                                                                );
                                                            if (
                                                                e.key === "Escape"
                                                            )
                                                                setEditingPage(
                                                                    null,
                                                                );
                                                        }}
                                                        autoFocus
                                                    />
                                                    <Check
                                                        size={16}
                                                        className="cursor-pointer shrink-0 text-(--text-color)"
                                                        onClick={() =>
                                                            renamePage(page.id)
                                                        }
                                                    />
                                                    <X
                                                        size={16}
                                                        className="cursor-pointer shrink-0 text-(--text-color)"
                                                        onClick={() =>
                                                            setEditingPage(null)
                                                        }
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <span className="flex-1 truncate text-sm text-(--accent-text)">
                                                        {page.title}
                                                    </span>
                                                    <PencilIcon
                                                        size={18}
                                                        className="cursor-pointer shrink-0 text-(--text-color) p-0.5"
                                                        onClick={() => {
                                                            setEditingPage(
                                                                page.id,
                                                            );
                                                            setPageName(
                                                                page.title,
                                                            );
                                                        }}
                                                    />
                                                    <Trash
                                                        size={18}
                                                        className="cursor-pointer shrink-0 text-(--danger-text-color) p-0.5"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    `Delete page "${page.title}"?`,
                                                                )
                                                            )
                                                                deletePage(page);
                                                        }}
                                                    />
                                                    <Info
                                                        size={18}
                                                        className="cursor-pointer shrink-0 text-(--text-color) p-0.5"
                                                        onClick={() =>
                                                            openDetailPage(page)
                                                        }
                                                    />
                                                    {page.slug && (
                                                        <a
                                                            href={isLDG || !gameData ? "/" + page.slug : "/games/" + gameData.slug + "/" + page.slug}
                                                            className="shrink-0 text-(--text-color) p-0.5"
                                                        >
                                                            <ExternalLink size={18} />
                                                        </a>
                                                    )}
                                                    <select
                                                        className="hidden sm:block bg-(--accent) text-(--accent-text) px-1 py-1 rounded text-xs max-w-[120px] shrink-0"
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
                                                                    s.id !==
                                                                    section.id,
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
                                                </>
                                            )}
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
                                        {editingPage === page.id ? (
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    value={pageName}
                                                    onChange={(e) =>
                                                        setPageName(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="bg-(--accent) text-(--accent-text) px-2 py-1 rounded flex-1 min-w-0"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter")
                                                            renamePage(page.id);
                                                        if (e.key === "Escape")
                                                            setEditingPage(null);
                                                    }}
                                                    autoFocus
                                                />
                                                <Check
                                                    size={14}
                                                    className="cursor-pointer shrink-0 text-(--text-color)"
                                                    onClick={() =>
                                                        renamePage(page.id)
                                                    }
                                                />
                                                <X
                                                    size={14}
                                                    className="cursor-pointer shrink-0 text-(--text-color)"
                                                    onClick={() =>
                                                        setEditingPage(null)
                                                    }
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="flex-1">
                                                    {page.title}
                                                </span>
                                                <PencilIcon
                                                    size={14}
                                                    className="cursor-pointer shrink-0 text-(--text-color)"
                                                    onClick={() => {
                                                        setEditingPage(page.id);
                                                        setPageName(page.title);
                                                    }}
                                                />
                                                <Trash
                                                    size={14}
                                                    className="cursor-pointer shrink-0 text-(--danger-text-color)"
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                `Delete page "${page.title}"?`,
                                                            )
                                                        )
                                                            deletePage(page);
                                                    }}
                                                />
                                                <Info
                                                    size={14}
                                                    className="cursor-pointer shrink-0 text-(--text-color)"
                                                    onClick={() =>
                                                        openDetailPage(page)
                                                    }
                                                />
                                                {page.slug && (
                                                    <a
                                                        href={isLDG || !gameData ? "/" + page.slug : "/games/" + gameData.slug + "/" + page.slug}
                                                        className="shrink-0 text-(--text-color)"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </a>
                                                )}
                                            </div>
                                        )}
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
                                {editingPage === page.id ? (
                                    <>
                                        <input
                                            value={pageName}
                                            onChange={(e) =>
                                                setPageName(e.target.value)
                                            }
                                            className="bg-(--accent) text-(--accent-text) px-2 py-1 rounded flex-1 min-w-0 text-sm"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter")
                                                    renamePage(page.id);
                                                if (e.key === "Escape")
                                                    setEditingPage(null);
                                            }}
                                            autoFocus
                                        />
                                        <Check
                                            size={16}
                                            className="cursor-pointer shrink-0 text-(--text-color)"
                                            onClick={() => renamePage(page.id)}
                                        />
                                        <X
                                            size={16}
                                            className="cursor-pointer shrink-0 text-(--text-color)"
                                            onClick={() => setEditingPage(null)}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1 truncate text-sm text-(--accent-text)">
                                            {page.title}
                                        </span>
                                        <PencilIcon
                                            size={14}
                                            className="cursor-pointer shrink-0 text-(--text-color)"
                                            onClick={() => {
                                                setEditingPage(page.id);
                                                setPageName(page.title);
                                            }}
                                        />
                                        <Trash
                                            size={14}
                                            className="cursor-pointer shrink-0 text-(--danger-text-color)"
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        `Delete page "${page.title}"?`,
                                                    )
                                                )
                                                    deletePage(page);
                                            }}
                                        />
                                        <Info
                                            size={14}
                                            className="cursor-pointer shrink-0 text-(--text-color)"
                                            onClick={() => openDetailPage(page)}
                                        />
                                        {page.slug && (
                                            <a
                                                href={isLDG || !gameData ? "/" + page.slug : "/games/" + gameData.slug + "/" + page.slug}
                                                className="shrink-0 text-(--text-color)"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
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
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>{/* end px-4 sm:px-0 wrapper */}

            {/* Theme editor modal */}
            {(themeOpen || themeClosing) && editingTheme && (
                <div
                    className={`modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50${themeClosing ? " out" : ""}`}
                    onClick={cancelTheme}
                >
                    <div
                        className={`modal-panel bg-(--surface-background) border border-(--outline) rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto${themeClosing ? " out" : ""}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-lg font-bold text-(--accent-text)">
                                Game Theme
                            </h2>
                            <button
                                onClick={cancelTheme}
                                className="shrink-0 text-(--text-color) hover:text-(--accent-text) cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {THEME_FIELDS.map(({ key, label, description }) => (
                                <div
                                    key={key}
                                    className="flex items-center gap-3"
                                >
                                    <input
                                        type="color"
                                        value={editingTheme[key]}
                                        onChange={(e) =>
                                            handleThemeChange(key, e.target.value)
                                        }
                                        className="w-10 h-10 rounded cursor-pointer border border-(--outline) shrink-0 p-0.5 bg-transparent"
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-semibold text-(--accent-text)">
                                            {label}
                                        </span>
                                        <span className="text-xs text-(--text-color)">
                                            {description}
                                        </span>
                                    </div>
                                    <span className="ml-auto font-mono text-xs text-(--text-color) shrink-0">
                                        {editingTheme[key]}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-(--outline)">
                            <button
                                onClick={resetThemeToDefaults}
                                className="text-sm text-(--text-color) border border-(--outline) px-3 py-1.5 rounded cursor-pointer hover:bg-(--accent)"
                            >
                                Reset to defaults
                            </button>
                            <button
                                onClick={cancelTheme}
                                className="ml-auto text-sm text-(--text-color) border border-(--outline) px-3 py-1.5 rounded cursor-pointer hover:bg-(--accent)"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveTheme}
                                className="text-sm bg-(--primary) text-white px-4 py-1.5 rounded cursor-pointer hover:opacity-90 font-semibold"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Page detail modal */}
            {(detailPage || detailClosing) && (() => {
                const previewUrl = detailSlug
                    ? (isLDG || !gameData
                        ? "/" + detailSlug
                        : "/games/" + gameData.slug + "/" + detailSlug)
                    : null;
                const section = detailPage.sectionId
                    ? sectionsMap.get(detailPage.sectionId)
                    : null;

                return (
                    <div
                        className={`modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50${detailClosing ? " out" : ""}`}
                        onClick={closeDetailAnimated}
                    >
                        <div
                            className={`modal-panel bg-(--surface-background) border border-(--outline) rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 flex flex-col gap-4${detailClosing ? " out" : ""}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                                <h2 className="text-lg font-bold text-(--accent-text) leading-tight">
                                    Page Details
                                </h2>
                                <button
                                    onClick={closeDetailAnimated}
                                    className="shrink-0 text-(--text-color) hover:text-(--accent-text) cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Editable fields */}
                            <div className="flex flex-col gap-3 text-sm">
                                <div>
                                    <label className="text-(--text-color) font-semibold block mb-1">Title</label>
                                    <input
                                        value={detailTitle}
                                        onChange={(e) => setDetailTitle(e.target.value)}
                                        className="bg-(--accent) text-(--accent-text) px-3 py-1.5 rounded w-full"
                                    />
                                </div>

                                <div>
                                    <label className="text-(--text-color) font-semibold block mb-1">URL slug</label>
                                    <input
                                        value={detailSlug}
                                        onChange={(e) => setDetailSlug(e.target.value)}
                                        className="bg-(--accent) text-(--accent-text) px-3 py-1.5 rounded w-full font-mono"
                                        placeholder="page-slug"
                                    />
                                    {previewUrl && (
                                        <p className="text-(--text-color) text-xs mt-1 break-all font-mono">
                                            {previewUrl}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-(--text-color) font-semibold mb-0.5">Section</p>
                                    <p className="text-(--accent-text)">
                                        {section ? section.title : <span className="italic text-(--text-color)">None</span>}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-(--text-color) font-semibold mb-0.5">Page ID</p>
                                    <p className="text-(--accent-text) font-mono">{detailPage.id}</p>
                                </div>
                            </div>

                            {/* Discord embed section */}
                            <div className="border-t border-(--outline) pt-4 flex flex-col gap-2">
                                <label className="text-(--accent-text) font-semibold text-sm">Discord Embed Description</label>
                                <textarea
                                    value={detailDescription}
                                    onChange={(e) => setDetailDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Short description shown in Discord link previews…"
                                    className="bg-(--accent) text-(--accent-text) px-3 py-1.5 rounded w-full text-sm resize-y"
                                />
                            </div>

                            {/* Save button */}
                            <button
                                onClick={savePageDetail}
                                className="bg-(--primary) text-white px-4 py-2 rounded cursor-pointer hover:opacity-90 font-semibold"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                );
            })()}
        </>
    );
}


