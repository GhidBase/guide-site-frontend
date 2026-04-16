import { useState, Fragment, useEffect, useRef } from "react";
import { currentAPI } from "../config/api";
import TextBlock from "./blocks/TextBlock";
import { useRouteLoaderData } from "react-router";
import SingleImageBlock from "./blocks/SingleImageBlock";
import TierListBlock from "./blocks/TierListBlock";
import BoardBuilderBlock from "./blocks/BoardBuilderBlock";
import ImageTextBlock from "./blocks/ImageTextBlock";
import HeroTextBlock from "./blocks/HeroTextBlock";
import NotFound from "./NotFound";
import { useAuth } from "../hooks/useAuth.js";
import { useEditMode } from "../contexts/EditModeContext.jsx";
import PendingReviewNotification from "./notifications/PendingReviewNotification";
import Comments from "./comments/Comments";

export default function PageBuilder() {
    const { pageData, gameData, isLDG } = useRouteLoaderData("main");
    const gameSlug = gameData?.slug;
    const gameId = gameData?.id;
    const { user } = useAuth();
    const [blocks, setBlocks] = useState(pageData?.blocks ?? []);
    const isAdmin = user?.role == "ADMIN";
    const [claimedBy, setClaimedBy] = useState(pageData?.page?.claimedBy ?? null);
    const { adminMode, dirtyBlocks, setDirtyBlocks, setSaveAll } = useEditMode();
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
            const ref = blockRefs.current[id];
            if (!ref) {
                throw new Error(`Ref is null for block ${id} — try exiting and re-entering edit mode`);
            }
            await ref.save();
        }
    }

    useEffect(() => {
        setSaveAll(() => saveAllChanges);
        return () => setSaveAll(null);
    }, [dirtyBlocks]);

    const pageId = pageData?.page?.id;

    useEffect(() => {
        setBlocks(pageData?.blocks ?? []);
        setClaimedBy(pageData?.page?.claimedBy ?? null);
    }, [pageData]);

    const orders = blocks.map((block) => (block.order ? block.order : 0));
    const highestOrder = Math.max(...orders);

    function isOrderTaken(order) {
        return blocks.find((block) => block.order == order) != undefined;
    }

    const blocksUrl = gameId
        ? `${currentAPI}/games/${gameId}/pages/by-id/${pageId}/blocks`
        : `${currentAPI}/pages/by-id/${pageId}/blocks`;

    function blockUrl(blockId) {
        return gameId
            ? `${currentAPI}/games/${gameId}/blocks/${blockId}`
            : `${currentAPI}/blocks/${blockId}`;
    }

    function deleteBlockUrl(blockId) {
        return gameId
            ? `${currentAPI}/games/${gameId}/blocks/${blockId}`
            : `${currentAPI}/blocks/${blockId}`;
    }

    async function addBlock({ nextOrder = highestOrder + 1, type } = {}) {
        const orderTaken = isOrderTaken(nextOrder);
        if (orderTaken) {
            await shiftBlocks(nextOrder);
        }
        const response = await fetch(blocksUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: nextOrder, type }),
            credentials: "include",
        });
        const newBlock = await response.json();
        setBlocks([...blocks, newBlock]);
    }

    async function shiftBlocks(order) {
        const response = await fetch(blocksUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ type: "offset", order }),
        });
        if (!response.ok) throw new Error("Request failed");
        blocks.map((block) => {
            if (block.order >= order) block.order++;
            return block;
        });
    }

    async function deleteBlock(block) {
        const response = await fetch(deleteBlockUrl(block.id), {
            method: "DELETE",
            credentials: "include",
        });
        const deletedBlock = await response.json();
        setBlocks(blocks.filter((b) => b.id != deletedBlock.id));
    }

    async function updateBlockWithEditorData(block, editorRef) {
        if (!editorRef.current) {
            console.error("[save] editorRef.current is null for block", block.id);
            throw new Error("Editor not initialized");
        }
        const content = editorRef.current.getContent();
        const content2 = block.content2;
        console.log("[save] PUT block", block.id, "content length:", content?.length);
        const response = await fetch(blockUrl(block.id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ content, content2 }),
        });
        console.log("[save] PUT response status:", response.status);
        if (response.status === 202) {
            setShowPendingNotification(true);
            return;
        }
        if (!response.ok) {
            throw new Error(`Save failed with status ${response.status}`);
        }
        await refreshBlock(block.id);
    }

    async function updateBlockContent(block, newContent) {
        const response = await fetch(blockUrl(block.id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ content: newContent }),
        });
        if (response.status === 202) {
            setShowPendingNotification(true);
            return;
        }
        if (!response.ok) {
            console.error("Failed to save block", response.status, await response.text().catch(() => ""));
            return;
        }
        await refreshBlock(block.id);
    }

    async function refreshBlock(id) {
        const response = await fetch(blockUrl(id));
        const result = await response.json();
        const newBlocks = [...blocks];
        const adjustIndex = newBlocks.findIndex((block) => block.id == result.id);
        newBlocks[adjustIndex] = result;
        setBlocks(newBlocks);
    }

    if (pageData?.notFound) {
        return <NotFound />;
    }

    return (
        <Fragment>
        <div style={{ viewTransitionName: "page-content" }}>
            <PendingReviewNotification
                visible={showPendingNotification}
                onDismiss={() => setShowPendingNotification(false)}
            />
            {adminMode && isAdmin && (
                <div className="flex w-full bg-(--accent) border border-(--outline-brown)/50 md:rounded-t mt-4 mb-4">
                    <button onClick={async () => { await addBlock({ nextOrder: 0 }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer">
                        + Text Block
                    </button>
                    <button onClick={async () => { await addBlock({ nextOrder: 0, type: "single-image" }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer">
                        + Image Block
                    </button>
                    <button onClick={async () => { await addBlock({ nextOrder: 0, type: "tier-list" }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer">
                        + Tier List Block
                    </button>
                    <button onClick={async () => { await addBlock({ nextOrder: 0, type: "board-builder" }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer">
                        + Board Builder Block
                    </button>
                    <button onClick={async () => { await addBlock({ nextOrder: 0, type: "image-text" }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer">
                        + Image Text Block
                    </button>
                    <button onClick={async () => { await addBlock({ nextOrder: 0, type: "hero-text" }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) cursor-pointer">
                        + Hero Text Block
                    </button>
                </div>
            )}
            {blocks
                .sort((a, b) => a.order - b.order)
                .map((block) => {
                    let blockType;
                    const buttons = adminMode && isAdmin ? (
                        <div className="flex w-full bg-(--accent) border border-t-0 border-(--outline-brown)/50 md:rounded-b mb-4">
                            <button onClick={async () => { await addBlock({ nextOrder: block.order + 1 }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer">
                                + Text Block
                            </button>
                            <button onClick={async () => { await addBlock({ nextOrder: block.order + 1, type: "single-image" }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer">
                                + Image Block
                            </button>
                            <button onClick={async () => { await addBlock({ nextOrder: block.order + 1, type: "tier-list" }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer">
                                + Tier List Block
                            </button>
                            <button onClick={async () => { await addBlock({ nextOrder: block.order + 1, type: "board-builder" }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer">
                                + Board Builder Block
                            </button>
                            <button onClick={async () => { await addBlock({ nextOrder: block.order + 1, type: "image-text" }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer">
                                + Image Text Block
                            </button>
                            <button onClick={async () => { await addBlock({ nextOrder: block.order + 1, type: "hero-text" }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) cursor-pointer">
                                + Hero Text Block
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
                        case "image-text":
                            blockType = (
                                <Fragment key={block.id}>
                                    <ImageTextBlock
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
                        case "hero-text":
                            blockType = (
                                <Fragment key={block.id}>
                                    <HeroTextBlock
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
            {user && pageData?.page?.id && (() => {
                const pageId = pageData.page.id;
                const isContributor = pageData.page.contributors?.some((c) => c.id === user.id);
                const isClaimedByMe = claimedBy?.id === user.id;
                const canClaim = isAdmin || isContributor;

                async function handleClaim() {
                    const baseUrl = gameId ? `${currentAPI}/games/${gameId}/pages` : `${currentAPI}/pages`;
                    await fetch(`${baseUrl}/by-id/${pageId}/claim`, { method: "POST", credentials: "include" });
                    setClaimedBy({ id: user.id, username: user.username });
                }

                async function handleUnclaim() {
                    const baseUrl = gameId ? `${currentAPI}/games/${gameId}/pages` : `${currentAPI}/pages`;
                    await fetch(`${baseUrl}/by-id/${pageId}/claim`, { method: "DELETE", credentials: "include" });
                    setClaimedBy(null);
                }

                if (!canClaim && !claimedBy) return null;

                return (
                    <div className="px-8 py-3 border-t border-(--outline) text-sm text-(--text-color) flex items-center gap-3">
                        {claimedBy ? (
                            <>
                                <span>Page claimed by <span className="font-semibold">{claimedBy.username}</span></span>
                                {(isClaimedByMe || isAdmin) && (
                                    <button onClick={handleUnclaim} className="text-xs text-(--text-color) opacity-60 hover:opacity-100 underline">
                                        Unclaim
                                    </button>
                                )}
                            </>
                        ) : canClaim ? (
                            <button onClick={handleClaim} className="text-xs underline opacity-60 hover:opacity-100">
                                Claim this page
                            </button>
                        ) : null}
                    </div>
                );
            })()}
            {gameData && <Comments pageId={pageData?.page?.id} />}
        </div>
        </Fragment>
    );
}
