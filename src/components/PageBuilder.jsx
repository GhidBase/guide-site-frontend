import { useState, Fragment, useEffect } from "react";
import { currentAPI } from "../config/api";
import TextBlock from "./blocks/TextBlock";
import { Link, useRouteLoaderData } from "react-router";
import SingleImageBlock from "./blocks/SingleImageBlock";
const env = import.meta.env.VITE_ENV;

export default function PageBuilder() {
    const { pageData, gameData } = useRouteLoaderData("main");
    const gameSlug = gameData?.slug;
    const gameId = gameData?.id;
    const [blocks, setBlocks] = useState(pageData?.blocks ?? []);
    const [adminMode, setAdminMode] = useState(false);
    const pageId = pageData?.page?.id;
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
                    "X-Admin-Secret": import.meta.env.VITE_SECRET,
                },
                body: JSON.stringify({ order: nextOrder, type }),
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
                    "X-Admin-Secret": import.meta.env.VITE_SECRET,
                },
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
                headers: {
                    "X-Admin-Secret": import.meta.env.VITE_SECRET,
                },
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
                    "X-Admin-Secret": import.meta.env.VITE_SECRET,
                },
                body: JSON.stringify({ content, content2 }),
            },
        );

        const result = await response.json();
        const newBlocks = [...blocks];
        const adjustIndex = newBlocks.findIndex(
            (block) => block.id == result.id,
        );
        newBlocks[adjustIndex] = result;
        setBlocks(newBlocks);
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
            {env == "DEV" && (
                <div className="-mx-4 flex sticky top-0 left-0 bg-(--primary) md:rounded-b max-w-full ">
                    <button
                        className=" text-amber-50 w-50 px-2 py-0.5 flex justify-center items-center border-r border-(--outline-brown)/25 "
                        onClick={() => setAdminMode(!adminMode)}
                    >
                        {adminMode ? "User Mode" : "Admin Mode"}
                    </button>
                    <Link
                        className=" text-amber-50 w-50 px-2 py-0.5 flex justify-center items-center"
                        to={"/games/" + gameSlug + "/page-manager"}
                    >
                        Back to Page Manager
                    </Link>
                </div>
            )}
            {adminMode && (
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
                    const buttons = adminMode ? (
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
                                    />
                                    {buttons}
                                </Fragment>
                            );
                    }
                    return blockType;
                })}
        </Fragment>
    );
}
