import { useState, Fragment, useEffect, useRef } from "react";
import { currentAPI } from "../config/api";
import TextBlock from "./blocks/TextBlock";
import { Link, useRouteLoaderData } from "react-router";
import SingleImageBlock from "./blocks/SingleImageBlock";
import TierListBlock from "./blocks/TierListBlock";
import BoardBuilderBlock from "./blocks/BoardBuilderBlock";
import GuideCodexHomepage from "./GuideCodexHomepage";
import { useAuth } from "../hooks/useAuth.js";
import { useEditMode } from "../contexts/EditModeContext.jsx";
import { Pencil } from "lucide-react";
import PendingReviewNotification from "./notifications/PendingReviewNotification";
import Comments from "./comments/Comments";

export default function PageBuilder() {
    const { pageData, gameData, isLDG } = useRouteLoaderData("main");
    const gameSlug = gameData?.slug;
    const gameId = gameData?.id;
    const { user, isAuthenticated } = useAuth();
    const [blocks, setBlocks] = useState(pageData?.blocks ?? []);
    const isAdmin = user?.role == "ADMIN";
    const isContributor = isAuthenticated && !isAdmin;
    const { adminMode, setAdminMode, dirtyBlocks, setDirtyBlocks } = useEditMode();
    const [showPendingNotification, setShowPendingNotification] = useState(false);
    const blockRefs = useRef({});

    function handleDirtyChange(blockId, dirty) {
        setDirtyBlocks((prev) => {
            const next = new Set(prev);
            dirty ? next.add(blockId) : next.delete(blockId);
            return next;
        });
    }

    async function saveAllChanges() {
        for (const id of dirtyBlocks) {
            await blockRefs.current[id]?.save();
        }
    }

    function handleToggleAdminMode() {
        if (adminMode && dirtyBlocks.size > 0) {
            if (!window.confirm("You have unsaved changes. Exit edit mode anyway?")) return;
            setDirtyBlocks(new Set());
        }
        setAdminMode((m) => !m);
    }
    const pageId = pageData?.page?.id;

    const pageManagerSlug =
        isLDG || !gameData
            ? "/page-manager"
            : "/games/" + gameSlug + "/page-manager";
    const navigationPanelSlug =
        isLDG || !gameData
            ? "/navigation-panel"
            : "/games/" + gameSlug + "/navigation-panel";
    const commentOverviewSlug =
        isLDG || !gameData
            ? "/comment-overview"
            : "/games/" + gameSlug + "/comment-overview";

    useEffect(() => {
        setBlocks(pageData?.blocks ?? []);
    }, [gameData]);
    const orders = blocks.map((block) => (block.order ? block.order : 0));
    const highestOrder = Math.max(...orders);

    function isOrderTaken(order) {
        return blocks.find((block) => block.order == order) != undefined;
    }

    async function addBlock({ nextOrder = highestOrder + 1, type } = {}) {
        // nextOrder is used to insert blocks at the beginning,
        // end, or middle where the user intends

        console.log("adding block");
        console.log(
            currentAPI +
                "/games/" +
                gameId +
                "/pages/by-id/" +
                pageId +
                "/blocks",
        );
        const orderTaken = isOrderTaken(nextOrder);

        if (orderTaken) {
            await shiftBlocks(nextOrder);
        }

        const response = await fetch(
            currentAPI +
                "/games/" +
                gameId +
                "/pages/by-id/" +
                pageId +
                "/blocks",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ order: nextOrder, type }),
                credentials: "include",
            },
        );
        const newBlock = await response.json();
        const newBlocks = [...blocks, newBlock];
        setBlocks(newBlocks);
    }

    async function shiftBlocks(order) {
        const response = await fetch(
            currentAPI +
                "/games/" +
                gameId +
                "/pages/by-id/" +
                pageId +
                "/blocks",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ type: "offset", order }),
            },
        );
        if (!response.ok) {
            throw new Error("Request failed");
        }
        blocks.map((block) => {
            if (block.order >= order) {
                block.order++;
            }
            return block;
        });
        return;
    }

    async function deleteBlock(block) {
        console.log(gameId);
        const response = await fetch(
            currentAPI + "/games/" + gameId + "/blocks/" + block.id,
            {
                method: "DELETE",
                credentials: "include",
            },
        );

        const deletedBlock = await response.json();
        const newBlocks = blocks.filter((block) => {
            return block.id != deletedBlock.id;
        });
        setBlocks(newBlocks);
    }

    async function updateBlockWithEditorData(block, editorRef) {
        const content = editorRef.current.getContent();
        const content2 = block.content2;

        const response = await fetch(
            currentAPI + "/games/" + gameId + "/blocks/" + block.id,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ content, content2 }),
            },
        );

        if (response.status === 202) {
            setShowPendingNotification(true);
            return;
        }

        await refreshBlock(block.id);
    }

    async function updateBlockContent(block, newContent) {
        const response = await fetch(
            currentAPI + "/games/" + gameId + "/blocks/" + block.id,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ content: newContent }),
            },
        );

        if (response.status === 202) {
            setShowPendingNotification(true);
            return;
        }

        await refreshBlock(block.id);
    }

    async function refreshBlock(id) {
        const response = await fetch(
            currentAPI + "/games/" + gameId + "/blocks/" + id,
        );

        const result = await response.json();
        const newBlocks = [...blocks];
        const adjustIndex = newBlocks.findIndex(
            (block) => block.id == result.id,
        );
        newBlocks[adjustIndex] = result;
        setBlocks(newBlocks);
    }

    if (!gameData) {
        return <GuideCodexHomepage />;
    }

    return (
        <Fragment>
        <div style={{ viewTransitionName: "page-content" }}>
            {adminMode && dirtyBlocks.size > 0 && (
                <div className="self-stretch flex justify-center sticky top-0 bg-(--primary) sm:rounded-b max-w-full z-2">
                    <button
                        className="text-amber-50 font-semibold px-4 py-0.5 flex justify-center items-center bg-green-800/40 hover:bg-green-700/50"
                        onClick={saveAllChanges}
                    >
                        Save Changes ({dirtyBlocks.size})
                    </button>
                </div>
            )}
            <PendingReviewNotification
                visible={showPendingNotification}
                onDismiss={() => setShowPendingNotification(false)}
            />
            {adminMode && isAdmin && (
                <div className="flex w-full bg-(--accent) border border-(--outline-brown)/50 md:rounded-t mt-4 mb-4">
                    <button
                        onClick={async () => { await addBlock({ nextOrder: 0 }); }}
                        className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer"
                    >
                        + Text Block
                    </button>
                    <button
                        onClick={async () => { await addBlock({ nextOrder: 0, type: "single-image" }); }}
                        className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer"
                    >
                        + Image Block
                    </button>
                    <button
                        onClick={async () => { await addBlock({ nextOrder: 0, type: "tier-list" }); }}
                        className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer"
                    >
                        + Tier List Block
                    </button>
                    <button
                        onClick={async () => { await addBlock({ nextOrder: 0, type: "board-builder" }); }}
                        className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) cursor-pointer"
                    >
                        + Board Builder Block
                    </button>
                </div>
            )}
            {blocks
                .sort((a, b) => a.order - b.order)
                .map((block) => {
                    // block values: id, pageId, content
                    let blockType;
                    const buttons = adminMode && isAdmin ? (
                        <div className="flex w-full bg-(--accent) border border-t-0 border-(--outline-brown)/50 md:rounded-b mb-4">
                            <button
                                onClick={async () => { await addBlock({ nextOrder: block.order + 1 }); }}
                                className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer"
                            >
                                + Text Block
                            </button>
                            <button
                                onClick={async () => { await addBlock({ nextOrder: block.order + 1, type: "single-image" }); }}
                                className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer"
                            >
                                + Image Block
                            </button>
                            <button
                                onClick={async () => { await addBlock({ nextOrder: block.order + 1, type: "tier-list" }); }}
                                className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer"
                            >
                                + Tier List Block
                            </button>
                            <button
                                onClick={async () => { await addBlock({ nextOrder: block.order + 1, type: "board-builder" }); }}
                                className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) cursor-pointer"
                            >
                                + Board Builder Block
                            </button>
                        </div>
                    ) : null;
                    switch (block.type) {
                        case null:
                            blockType = (
                                <Fragment key={block.id}>
                                    <TextBlock
                                        ref={(el) => { blockRefs.current[block.id] = el; }}
                                        deleteBlock={() => deleteBlock(block)}
                                        block={block}
                                        updateBlockWithEditorData={updateBlockWithEditorData}
                                        adminMode={adminMode}
                                        canDelete={isAdmin}
                                        onDirty={handleDirtyChange}
                                    />
                                    {buttons}
                                </Fragment>
                            );
                            break;
                        case "board-builder":
                            blockType = (
                                <Fragment key={block.id}>
                                    <BoardBuilderBlock
                                        ref={(el) => { blockRefs.current[block.id] = el; }}
                                        deleteBlock={() => deleteBlock(block)}
                                        block={block}
                                        updateBlockContent={updateBlockContent}
                                        adminMode={adminMode}
                                        canDelete={isAdmin}
                                        onDirty={handleDirtyChange}
                                    />
                                    {buttons}
                                </Fragment>
                            );
                            break;
                        case "tier-list":
                            blockType = (
                                <Fragment key={block.id}>
                                    <TierListBlock
                                        ref={(el) => { blockRefs.current[block.id] = el; }}
                                        deleteBlock={() => deleteBlock(block)}
                                        block={block}
                                        updateBlockContent={updateBlockContent}
                                        adminMode={adminMode}
                                        canDelete={isAdmin}
                                        onDirty={handleDirtyChange}
                                    />
                                    {buttons}
                                </Fragment>
                            );
                            break;
                        default:
                            blockType = (
                                <Fragment key={block.id}>
                                    <SingleImageBlock
                                        deleteBlock={() => deleteBlock(block)}
                                        block={block}
                                        refreshBlock={refreshBlock}
                                        adminMode={adminMode}
                                        addBlock={addBlock}
                                        canDelete={isAdmin}
                                    />
                                    {buttons}
                                </Fragment>
                            );
                    }
                    return blockType;
                })}
            {pageData?.page?.contributors?.length > 0 && (
                <div className="mt-6 px-8 py-3 border-t border-(--outline) text-sm text-(--text-color)">
                    <span className="font-semibold">Contributors: </span>
                    {pageData.page.contributors.map((c, i) => (
                        <span key={c.id}>
                            {c.username}{i < pageData.page.contributors.length - 1 ? ", " : ""}
                        </span>
                    ))}
                </div>
            )}
            {isAdmin && (
                <div className="flex flex-col items-center mt-2 gap-2">
                    <Link
                        className="text-amber-50 bg-(--primary) w-50 rounded px-2 py-0.5 cursor-pointer hover:opacity-90 text-center"
                        to={navigationPanelSlug}
                    >
                        Navigation Panel
                    </Link>
                    <Link
                        className="text-amber-50 bg-(--primary) w-50 rounded px-2 py-0.5 cursor-pointer hover:opacity-90 text-center"
                        to={commentOverviewSlug}
                    >
                        Comment Overview
                    </Link>
                </div>
            )}
            {gameData && <Comments pageId={pageData?.page?.id} />}
        </div>
        </Fragment>
    );
}
