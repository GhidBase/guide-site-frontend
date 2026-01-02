import { useState, useEffect, Fragment } from "react";
import TextBlock from "./blocks/TextBlock";
import { useParams, Link } from "react-router";
import { usePage } from "../contexts/PageProvider";
import SingleImageBlock from "./blocks/SingleImageBlock";

export default function PageBuilder({ className }) {
    const { pageId } = useParams();
    const [blocks, setBlocks] = useState([]);
    const [adminMode, setAdminMode] = useState(true);
    const [pageData, setPageData] = useState({});
    // const highestOrder = Math.max(...blocks.order);
    const orders = blocks.map((block) => (block.order ? block.order : 0));
    const highestOrder = Math.max(...orders);

    const { title, setTitle, currentAPI } = usePage();
    if (title != pageData.title && pageData.title) {
        setTitle(pageData.title);
    }

    useEffect(() => {
        fetch(currentAPI + "/pages/" + pageId)
            .then((response) => response.json())
            .then((result) => {
                setBlocks(result.blocks);
                setPageData(result.page);
            });
    }, [pageId]);

    function isOrderTaken(order) {
        return blocks.find((block) => block.order == order) != undefined;
    }

    async function addBlock({ nextOrder = highestOrder + 1, type } = {}) {
        const orderTaken = isOrderTaken(nextOrder);

        if (orderTaken) {
            await shiftBlocks(nextOrder);
        }

        const response = await fetch(
            currentAPI + "/pages/" + pageId + "/blocks",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order: nextOrder, type }),
            },
        );
        const newBlock = await response.json();
        const newBlocks = [...blocks, newBlock];
        setBlocks(newBlocks);
    }

    async function shiftBlocks(order) {
        const response = await fetch(
            currentAPI + "/pages/" + pageId + "/blocks",
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
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
        const response = await fetch(currentAPI + "/blocks/" + block.id, {
            method: "DELETE",
            // headers: { "Content-Type": "application/json" },
            // body: JSON.stringify({}),
        });

        const deletedBlock = await response.json();
        const newBlocks = blocks.filter((block) => {
            return block.id != deletedBlock.id;
        });
        setBlocks(newBlocks);
    }

    async function updateBlockWithEditorData(block, editorRef) {
        const content = editorRef.current.getContent();
        const content2 = block.content2;

        const response = await fetch(currentAPI + "/blocks/" + block.id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content, content2 }),
        });

        const result = await response.json();
        const newBlocks = [...blocks];
        const adjustIndex = newBlocks.findIndex(
            (block) => block.id == result.id,
        );
        newBlocks[adjustIndex] = result;
        setBlocks(newBlocks);
    }

    async function refreshBlock(id) {
        const response = await fetch(currentAPI + "/blocks/" + id);

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
            <div className="flex flex-col items-center mt-2 gap-2">
                <Link
                    className="text-amber-50 bg-(--primary) w-50 rounded px-2 py-0.5"
                    to={"/page-manager/"}
                >
                    Back to Page Manager
                </Link>
                <button
                    className={`text-amber-50 bg-(--primary) w-50 rounded px-2 py-0.5`}
                    onClick={() => setAdminMode(!adminMode)}
                >
                    Switch View
                </button>
            </div>
        </Fragment>
    );
}
