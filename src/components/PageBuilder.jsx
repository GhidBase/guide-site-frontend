import { useState, useEffect, Fragment } from "react";
import TextBlock from "./blocks/TextBlock";
import { useParams, Link } from "react-router";
import { usePage } from "../contexts/PageProvider";
import SingleImageBlock from "./blocks/SingleImageBlock";

export default function PageBuilder({ className }) {
    const { pageId, pageTitle } = useParams();

    const [blocks, setBlocks] = useState([]);
    const [adminMode, setAdminMode] = useState(false);
    const [pageData, setPageData] = useState({});
    const orders = blocks.map((block) => (block.order ? block.order : 0));
    const highestOrder = Math.max(...orders);

    const { title, setTitle, currentAPI, gameId: contextGameId } = usePage();
    if (pageData && title != pageData.title && pageData.title) {
        setTitle(pageData.title);
    }

    // I need to make it so that if no page is found from the initial page
    // search, then the page will redirect

    useEffect(() => {
        const type = pageId ? "id" : "title";
        const pageInput = pageId ? pageId : pageTitle;
        const gameId = 1;
        const homepage = "lucky-defense";

        async function loadPageByName(name) {
            const apiUrl =
                currentAPI +
                "/pages/" +
                name +
                "?type=" +
                type +
                "&gameId=" +
                1;

            const response = await fetch(apiUrl);
            const result = await response.json();
            const { page, blocks } = result;
            if (page == null) {
                console.log("Page is null");
            } else {
                setBlocks(blocks);
                setPageData(page);
            }
        }
        async function loadHomepage() {
            const responseGameData = await fetch(
                currentAPI + "/games/" + contextGameId,
            );
            const resultGameData = await responseGameData.json();
            const { slug, title } = resultGameData;

            const apiUrl =
                currentAPI +
                "/pages/" +
                slug +
                "?type=" +
                type +
                "&gameId=" +
                1;

            const responsePageData = await fetch(apiUrl);
            const resultPageData = await responsePageData.json();

            const { page, blocks } = resultPageData;
            if (page == null) {
                console.log("Page is null");
            } else {
                setBlocks(blocks);
                setPageData(page);
            }
        }

        // I need to add an error check here
        // Add an error page when there is no
        // result

        if (type == "title" && pageInput) {
            // If the type is title and the title isn't empty
            loadPageByName(pageInput);
        } else if (type == "title" && !pageInput) {
            // If the type is title and the title is empty
            loadHomepage();
        }
    }, [pageId, pageTitle]);

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
