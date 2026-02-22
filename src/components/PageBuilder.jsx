import { useState, Fragment, useEffect } from "react";
import { currentAPI } from "../config/api";
import TextBlock from "./blocks/TextBlock";
import { Link, useRouteLoaderData } from "react-router";
import SingleImageBlock from "./blocks/SingleImageBlock";
import { useAuth } from "@/hooks/useAuth";
import { Pencil } from "lucide-react";
import PendingReviewNotification from "./notifications/PendingReviewNotification";

export default function PageBuilder() {
    const { pageData, gameData } = useRouteLoaderData("main");
    const { user, isAuthenticated } = useAuth();
    const gameSlug = gameData?.slug;
    const gameId = gameData?.id;
    const [blocks, setBlocks] = useState(pageData?.blocks ?? []);
    const [unsavedBlocks, setUnsavedBlocks] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const pageId = pageData?.page?.id;

    const canEdit =
        isAuthenticated && (user?.role === "ADMIN" || user?.role === "EDITOR");

    useEffect(() => {
        setBlocks(pageData?.blocks ?? []);
    }, [gameData]);

    const orders = blocks.map((block) => (block.order ? block.order : 0));
    const highestOrder = orders.length > 0 ? Math.max(...orders) : 0;

    function isOrderTaken(order) {
        return blocks.find((block) => block.order == order) != undefined;
    }

    async function addBlock({ nextOrder = highestOrder + 1, type } = {}) {
        if (!pageId) return;

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
                credentials: "include",
                body: JSON.stringify({ order: nextOrder, type }),
            },
        );

        if (response.status === 202) {
            setShowNotification(true);
            return;
        }

        const newBlock = await response.json();
        const newBlocks = [...blocks, newBlock];
        setBlocks(newBlocks);
    }

    function createUnsavedBlock({ nextOrder = highestOrder + 1, type } = {}) {
        if (!pageId) return;

        const tempId = `temp-${Date.now()}`;
        const newUnsavedBlock = {
            id: tempId,
            order: nextOrder,
            type: type || null,
            content: { content: "" },
            content2: null,
            isUnsaved: true,
        };

        setUnsavedBlocks((prev) => [...prev, newUnsavedBlock]);
    }

    async function saveUnsavedBlock(tempBlock, content) {
        const orderTaken = isOrderTaken(tempBlock.order);
        if (orderTaken) {
            const offsetResponse = await fetch(
                currentAPI +
                    "/games/" +
                    gameId +
                    "/pages/by-id/" +
                    pageId +
                    "/blocks",
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        type: "offset",
                        order: tempBlock.order,
                    }),
                },
            );

            if (offsetResponse.status === 202) {
                setShowNotification(true);
            }
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
                credentials: "include",
                body: JSON.stringify({
                    order: tempBlock.order,
                    type: tempBlock.type,
                    content: content,
                }),
            },
        );

        if (response.status === 202) {
            setShowNotification(true);
            setUnsavedBlocks((prev) =>
                prev.filter((b) => b.id !== tempBlock.id),
            );
            return;
        }

        const newBlock = await response.json();

        const updateResponse = await fetch(
            currentAPI + "/games/" + gameId + "/blocks/" + newBlock.id,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ content }),
            },
        );

        if (updateResponse.status === 202) {
            setShowNotification(true);
        }

        const updatedBlock = await updateResponse.json();

        setUnsavedBlocks((prev) => prev.filter((b) => b.id !== tempBlock.id));
        setBlocks((prev) => [...prev, updatedBlock]);
    }

    function cancelUnsavedBlock(tempId) {
        setUnsavedBlocks((prev) => prev.filter((b) => b.id !== tempId));
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
        if (response.status === 202) {
            setShowNotification(true);
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
        if (block.isUnsaved) {
            cancelUnsavedBlock(block.id);
            return;
        }

        const response = await fetch(
            currentAPI + "/games/" + gameId + "/blocks/" + block.id,
            {
                method: "DELETE",
                credentials: "include",
            },
        );

        if (response.status === 202) {
            setShowNotification(true);
            return;
        }

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
            setShowNotification(true);
        }

        if (response.ok) {
            const result = await response.json();
            const newBlocks = [...blocks];
            const adjustIndex = newBlocks.findIndex(
                (block) => block.id == result.id,
            );
            newBlocks[adjustIndex] = result;
            setBlocks(newBlocks);
        }
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
            {canEdit && (
                <div className="flex justify-center gap-2 mt-4 mb-4">
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className="flex items-center gap-2 px-4 py-2 bg-(--primary) text-amber-50 rounded font-semibold cursor-pointer hover:opacity-90"
                    >
                        <Pencil size={18} />
                        {editMode ? "Done Editing" : "Edit"}
                    </button>
                </div>
            )}
            {editMode && (
                <div className="flex justify-center gap-2 mt-4">
                    <button
                        onClick={() => {
                            createUnsavedBlock({
                                nextOrder: 0,
                                type: "text",
                            });
                        }}
                        disabled={!pageId}
                        className="text-amber-50 bg-(--primary) w-37 rounded px-2 py-0.5 cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        + Text Block
                    </button>
                    <button
                        onClick={() => {
                            createUnsavedBlock({
                                nextOrder: 0,
                                type: "single-image",
                            });
                        }}
                        disabled={!pageId}
                        className="text-amber-50 bg-(--primary) w-37 rounded px-2 py-0.5 cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        + Image Block
                    </button>
                </div>
            )}
            {[...blocks, ...unsavedBlocks]
                .sort((a, b) => a.order - b.order)
                .map((block) => {
                    let blockType;
                    const buttons = editMode ? (
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => {
                                    createUnsavedBlock({
                                        nextOrder: block.order + 1,
                                        type: "text",
                                    });
                                }}
                                disabled={!pageId}
                                className="text-amber-50 bg-(--primary) w-37 rounded px-2 py-0.5 cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                + Text Block
                            </button>
                            <button
                                onClick={() => {
                                    createUnsavedBlock({
                                        nextOrder: block.order + 1,
                                        type: "single-image",
                                    });
                                }}
                                disabled={!pageId}
                                className="text-amber-50 bg-(--primary) w-37 rounded px-2 py-0.5 cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                + Image Block
                            </button>
                        </div>
                    ) : null;
                    switch (block.type) {
                        case null:
                        case "text":
                            blockType = (
                                <Fragment key={block.id}>
                                    <TextBlock
                                        deleteBlock={() => deleteBlock(block)}
                                        block={block}
                                        updateBlockWithEditorData={
                                            updateBlockWithEditorData
                                        }
                                        saveUnsavedBlock={saveUnsavedBlock}
                                        editMode={editMode}
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
                                        editMode={editMode}
                                    />
                                    {buttons}
                                </Fragment>
                            );
                    }
                    return blockType;
                })}
            {user?.role === "ADMIN" && (
                <div className="flex flex-col items-center mt-2 gap-2">
                    <Link
                        className="text-amber-50 bg-(--primary) w-50 rounded px-2 py-0.5 cursor-pointer hover:opacity-90"
                        to={"/games/" + gameSlug + "/page-manager"}
                    >
                        Back to Page Manager
                    </Link>
                </div>
            )}
            <PendingReviewNotification
                visible={showNotification}
                onDismiss={() => setShowNotification(false)}
            />
        </Fragment>
    );
}
