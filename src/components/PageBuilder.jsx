import { useState, Fragment, useEffect } from "react";
import { currentAPI } from "../config/api";
import TextBlock from "./blocks/TextBlock";
import { Link, useRouteLoaderData } from "react-router";
import SingleImageBlock from "./blocks/SingleImageBlock";
import { useAuth } from "../hooks/useAuth.js";
import { Pencil } from "lucide-react";
import PendingReviewNotification from "./notifications/PendingReviewNotification";

export default function PageBuilder() {
    const { pageData, gameData, isLDG } = useRouteLoaderData("main");
    const gameSlug = gameData?.slug;
    const gameId = gameData?.id;
    const { user, isAuthenticated } = useAuth();
    const [blocks, setBlocks] = useState(pageData?.blocks ?? []);
    const isAdmin = user?.role == "ADMIN";
    const isContributor = isAuthenticated && !isAdmin;
    const [adminMode, setAdminMode] = useState(false);
    const [showPendingNotification, setShowPendingNotification] = useState(false);
    const pageId = pageData?.page?.id;

    const pageManagerSlug =
        isLDG || !gameData
            ? "/page-manager"
            : "/games/" + gameSlug + "/page-manager";
    const navigationPanelSlug =
        isLDG || !gameData
            ? "/navigation-panel"
            : "/games/" + gameSlug + "/navigation-panel";

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

    return (
        <Fragment>
        <div style={{ viewTransitionName: "page-content" }}>
            {(isAdmin || isContributor) && (
                <div
                    id="dev-toolbar"
                    className=" self-stretch flex justify-center sticky top-0 bg-(--primary) sm:rounded-b max-w-full z-2 "
                >
                    <button
                        className=" text-amber-50 w-50 px-2 py-0.5 flex justify-center items-center border-r border-(--outline-brown)/25 "
                        onClick={() => setAdminMode(!adminMode)}
                    >
                        {adminMode
                            ? "View Mode"
                            : isAdmin ? "Edit Mode" : "Suggest Edit"}
                    </button>
                    {isAdmin && (
                        <Link
                            className="text-amber-50 w-50 px-2 py-0.5 flex justify-center items-center text-center"
                            to={navigationPanelSlug}
                        >
                            Navigation Panel
                        </Link>
                    )}
                </div>
            )}
            <PendingReviewNotification
                visible={showPendingNotification}
                onDismiss={() => setShowPendingNotification(false)}
            />
            {adminMode && isAdmin && (
                <div className="flex justify-center gap-2 mt-4">
                    <button
                        onClick={async () => {
                            await addBlock({
                                nextOrder: 0,
                            });
                        }}
                        className="text-amber-50 bg-(--primary) w-37 rounded px-2 py-0.5"
                    >
                        + Text Block
                    </button>
                    <button
                        onClick={async () => {
                            await addBlock({
                                nextOrder: 0,
                                type: "single-image",
                            });
                        }}
                        className="text-amber-50 bg-(--primary) w-37 rounded px-2 py-0.5"
                    >
                        + Image Block
                    </button>
                </div>
            )}
            {blocks
                .sort((a, b) => a.order - b.order)
                .map((block) => {
                    // block values: id, pageId, content
                    let blockType;
                    const buttons = adminMode && isAdmin ? (
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={async () => {
                                    await addBlock({
                                        nextOrder: block.order + 1,
                                    });
                                }}
                                className="text-amber-50 bg-(--primary) w-37 rounded px-2 py-0.5"
                            >
                                + Text Block
                            </button>
                            <button
                                onClick={async () => {
                                    await addBlock({
                                        nextOrder: block.order + 1,
                                        type: "single-image",
                                    });
                                }}
                                className="text-amber-50 bg-(--primary) w-37 rounded px-2 py-0.5"
                            >
                                + Image Block
                            </button>
                        </div>
                    ) : null;
                    switch (block.type) {
                        case null:
                            blockType = (
                                <Fragment key={block.id}>
                                    <TextBlock
                                        deleteBlock={() => deleteBlock(block)}
                                        block={block}
                                        updateBlockWithEditorData={
                                            updateBlockWithEditorData
                                        }
                                        adminMode={adminMode}
                                        addBlock={addBlock}
                                        canDelete={isAdmin}
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
                </div>
            )}
        </div>
        </Fragment>
    );
}
