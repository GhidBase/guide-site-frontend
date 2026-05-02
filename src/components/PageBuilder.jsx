import { useState, Fragment, useEffect, useRef } from "react";
import { currentAPI } from "../config/api";
import TextBlock from "./blocks/TextBlock";
import { useRouteLoaderData } from "react-router";
import SingleImageBlock from "./blocks/SingleImageBlock";
import TierListBlock from "./blocks/TierListBlock";
import BoardBuilderBlock from "./blocks/BoardBuilderBlock";
import ImageTextBlock from "./blocks/ImageTextBlock";
import InlineImageBlock from "./blocks/InlineImageBlock";
import CollapsibleSection from "./blocks/CollapsibleSection";
import HeroTextBlock from "./blocks/HeroTextBlock";
import ChecklistBlock from "./blocks/ChecklistBlock";
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
        const failed = [];
        for (const id of dirtyBlocks) {
            const ref = blockRefs.current[id];
            if (!ref) {
                console.warn(`Ref is null for block ${id} — skipping`);
                continue;
            }
            try {
                await ref.save();
            } catch (err) {
                console.error(`Failed to save block ${id}:`, err);
                failed.push(id);
            }
        }
        if (failed.length > 0) {
            throw new Error(`${failed.length} block(s) failed to save. Please try again.`);
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

    function groupBlocks(sortedBlocks) {
        const result = [];
        let i = 0;
        while (i < sortedBlocks.length) {
            const block = sortedBlocks[i];
            if (block.type === "collapsible-start") {
                let j = i + 1;
                while (j < sortedBlocks.length && sortedBlocks[j].type !== "collapsible-end") j++;
                result.push({
                    _group: true,
                    key: `cg-${block.id}`,
                    startBlock: block,
                    innerBlocks: sortedBlocks.slice(i + 1, j),
                    endBlock: sortedBlocks[j] ?? null,
                });
                i = sortedBlocks[j] ? j + 1 : sortedBlocks.length;
            } else if (block.type === "collapsible-end") {
                i++; // orphaned end marker — skip silently
            } else {
                result.push(block);
                i++;
            }
        }
        return result;
    }

    function makeButtons(order) {
        if (!adminMode || !isAdmin) return null;
        const cls = "flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer";
        const last = "flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) cursor-pointer";
        return (
            <div className="flex w-full bg-(--accent) border border-t-0 border-(--outline-brown)/50 md:rounded-b mb-4">
                <button onClick={async () => { await addBlock({ nextOrder: order + 1 }); }} className={cls}>+ Text Block</button>
                <button onClick={async () => { await addBlock({ nextOrder: order + 1, type: "single-image" }); }} className={cls}>+ Image Block</button>
                <button onClick={async () => { await addBlock({ nextOrder: order + 1, type: "tier-list" }); }} className={cls}>+ Tier List Block</button>
                <button onClick={async () => { await addBlock({ nextOrder: order + 1, type: "board-builder" }); }} className={cls}>+ Board Builder Block</button>
                <button onClick={async () => { await addBlock({ nextOrder: order + 1, type: "image-text" }); }} className={cls}>+ Image Text Block</button>
                <button onClick={async () => { await addBlock({ nextOrder: order + 1, type: "inline-image" }); }} className={cls}>+ Inline Image Block</button>
                <button onClick={async () => { await addBlock({ nextOrder: order + 1, type: "hero-text" }); }} className={cls}>+ Hero Text Block</button>
                <button onClick={async () => { await addBlock({ nextOrder: order + 1, type: "checklist" }); }} className={cls}>+ Checklist Block</button>
                <button onClick={async () => { await addCollapsibleSection(order + 1); }} className={last}>+ Collapsible Section</button>
            </div>
        );
    }

    function renderBlockComponent(block) {
        switch (block.type) {
            case null:
                return <TextBlock ref={(el) => { blockRefs.current[block.id] = el; }} deleteBlock={() => deleteBlock(block)} block={block} updateBlockWithEditorData={updateBlockWithEditorData} adminMode={adminMode} canDelete={isAdmin} onDirty={handleDirtyChange} />;
            case "board-builder":
                return <BoardBuilderBlock ref={(el) => { blockRefs.current[block.id] = el; }} deleteBlock={() => deleteBlock(block)} block={block} updateBlockContent={updateBlockContent} adminMode={adminMode} canDelete={isAdmin} onDirty={handleDirtyChange} />;
            case "tier-list":
                return <TierListBlock ref={(el) => { blockRefs.current[block.id] = el; }} deleteBlock={() => deleteBlock(block)} block={block} updateBlockContent={updateBlockContent} adminMode={adminMode} canDelete={isAdmin} onDirty={handleDirtyChange} />;
            case "image-text":
                return <ImageTextBlock ref={(el) => { blockRefs.current[block.id] = el; }} deleteBlock={() => deleteBlock(block)} block={block} updateBlockContent={updateBlockContent} adminMode={adminMode} canDelete={isAdmin} onDirty={handleDirtyChange} />;
            case "inline-image":
                return <InlineImageBlock ref={(el) => { blockRefs.current[block.id] = el; }} deleteBlock={() => deleteBlock(block)} block={block} updateBlockContent={updateBlockContent} adminMode={adminMode} canDelete={isAdmin} onDirty={handleDirtyChange} />;
            case "hero-text":
                return <HeroTextBlock ref={(el) => { blockRefs.current[block.id] = el; }} deleteBlock={() => deleteBlock(block)} block={block} updateBlockContent={updateBlockContent} adminMode={adminMode} canDelete={isAdmin} onDirty={handleDirtyChange} />;
            case "checklist":
                return <ChecklistBlock ref={(el) => { blockRefs.current[block.id] = el; }} deleteBlock={() => deleteBlock(block)} block={block} updateBlockContent={updateBlockContent} adminMode={adminMode} canDelete={isAdmin} onDirty={handleDirtyChange} gameId={gameId} />;
            default:
                return <SingleImageBlock deleteBlock={() => deleteBlock(block)} block={block} refreshBlock={refreshBlock} adminMode={adminMode} addBlock={addBlock} canDelete={isAdmin} />;
        }
    }

    function renderBlockItem(block) {
        return (
            <Fragment key={block.id}>
                {renderBlockComponent(block)}
                {makeButtons(block.order)}
            </Fragment>
        );
    }

    async function addCollapsibleSection(atOrder) {
        await addBlock({ nextOrder: atOrder, type: "collapsible-start" });
        await addBlock({ nextOrder: atOrder + 1, type: "collapsible-end" });
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
            throw new Error("Editor not initialized");
        }
        const content = editorRef.current.getContent();
        const content2 = block.content2;
        const response = await fetch(blockUrl(block.id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ content, content2 }),
        });
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
            throw new Error(`Save failed with status ${response.status}`);
        }
        await refreshBlock(block.id);
    }

    async function refreshBlock(id) {
        const response = await fetch(blockUrl(id));
        const result = await response.json();
        setBlocks(prev => prev.map(b => b.id == result.id ? result : b));
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
                <div className="flex w-full bg-(--accent) border border-(--outline-brown)/50 md:rounded-t mt-4 mb-0">
                    <button onClick={async () => { await addBlock({ nextOrder: 0 }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer">+ Text Block</button>
                    <button onClick={async () => { await addBlock({ nextOrder: 0, type: "single-image" }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer">+ Image Block</button>
                    <button onClick={async () => { await addBlock({ nextOrder: 0, type: "tier-list" }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer">+ Tier List Block</button>
                    <button onClick={async () => { await addBlock({ nextOrder: 0, type: "board-builder" }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer">+ Board Builder Block</button>
                    <button onClick={async () => { await addBlock({ nextOrder: 0, type: "image-text" }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer">+ Image Text Block</button>
                    <button onClick={async () => { await addBlock({ nextOrder: 0, type: "inline-image" }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer">+ Inline Image Block</button>
                    <button onClick={async () => { await addBlock({ nextOrder: 0, type: "hero-text" }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer">+ Hero Text Block</button>
                    <button onClick={async () => { await addBlock({ nextOrder: 0, type: "checklist" }); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) border-r border-(--outline-brown)/25 cursor-pointer">+ Checklist Block</button>
                    <button onClick={async () => { await addCollapsibleSection(0); }} className="flex-1 py-2 text-sm text-(--text-color) hover:bg-(--surface-background) cursor-pointer">+ Collapsible Section</button>
                </div>
            )}
            {groupBlocks(blocks.slice().sort((a, b) => a.order - b.order)).map(item => {
                if (item._group) {
                    return (
                        <Fragment key={item.key}>
                            <CollapsibleSection
                                ref={(el) => { blockRefs.current[item.startBlock.id] = el; }}
                                startBlock={item.startBlock}
                                endBlock={item.endBlock}
                                innerBlocks={item.innerBlocks}
                                adminMode={adminMode}
                                isAdmin={isAdmin}
                                renderInnerBlock={renderBlockItem}
                                makeButtons={makeButtons}
                                updateBlockContent={updateBlockContent}
                                onDirty={handleDirtyChange}
                                deleteStart={() => deleteBlock(item.startBlock)}
                                deleteEnd={() => item.endBlock && deleteBlock(item.endBlock)}
                            />
                            {makeButtons(item.endBlock?.order ?? item.startBlock.order)}
                        </Fragment>
                    );
                }
                return renderBlockItem(item);
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
