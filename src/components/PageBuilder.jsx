import { useState, useEffect, Fragment } from "react";
import TextBlock from "./blocks/TextBlock";
import { useParams, Link, useNavigate } from "react-router";
import { usePage } from "../contexts/PageProvider";
import SingleImageBlock from "./blocks/SingleImageBlock";
const env = import.meta.env.VITE_ENV;


export default function PageBuilder() {
    const navigate = useNavigate();
    const { pageTitle } = useParams();

    const [blocks, setBlocks] = useState([]);
    const [adminMode, setAdminMode] = useState(false);
    const [pageData, setPageData] = useState({});
    const pageId = pageData.id;
    const orders = blocks.map((block) => (block.order ? block.order : 0));
    const highestOrder = Math.max(...orders);

    const { title, setTitle, currentAPI, gameId } = usePage();
    if (pageData && title != pageData.title && pageData.title) {
        setTitle(pageData.title);
    }

    useEffect(() => {

        async function loadPageByName(name) {
            const apiUrl = currentAPI + "/games/" + gameId + "/pages/by-slug/" + name;
            console.log(apiUrl);

            const response = await fetch(apiUrl);
            const result = await response.json();
            const { page, blocks, notFound } = result;
            if (page == null) {
                console.log("Page is null");
                if (notFound) {
                    console.log("Page null caused by 0 search results, display 404");
                }
                navigate("/404", { replace: true });
            } else {
                setBlocks(blocks);
                setPageData(page);
            }
        }
        async function loadHomepage() {
            const responseGameData = await fetch(
                currentAPI + "/games/" + gameId,
            );
            const resultGameData = await responseGameData.json();
            const { slug } = resultGameData;

            const apiUrl = currentAPI + "/games/" + gameId + "/pages/by-slug/" + slug;

            const responsePageData = await fetch(apiUrl);
            const resultPageData = await responsePageData.json();

            const { page, blocks } = resultPageData;
            if (page == null) {
                console.log("Page is null");
                console.log("homepage fail");
            } else {
                setBlocks(blocks);
                setPageData(page);
            }
        }

        if (pageTitle) {
            loadPageByName(pageTitle);
        } else if (!pageTitle) {
            loadHomepage();
        }
    }, [pageId, pageTitle, currentAPI, gameId, navigate]);

    function isOrderTaken(order) {
        return blocks.find((block) => block.order == order) != undefined;
    }

    async function addBlock({ nextOrder = highestOrder + 1, type } = {}) {
        // nextOrder is used to insert blocks at the beginning,
        // end, or middle where the user intends

        console.log("adding block");
        console.log(
            currentAPI + "/games/" + gameId + "/pages/by-id/" + pageId + "/blocks",
        );
        const orderTaken = isOrderTaken(nextOrder);

        if (orderTaken) {
            await shiftBlocks(nextOrder);
        }

        const response = await fetch(
            currentAPI + "/games/" + gameId + "/pages/by-id/" + pageId + "/blocks",
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
            currentAPI + "/games/" + gameId + "/pages/by-id/" + pageId + "/blocks",
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
        const adjustIndex = newBlocks.findIndex((block) => block.id == result.id);
        newBlocks[adjustIndex] = result;
        setBlocks(newBlocks);
    }

    async function refreshBlock(id) {
        const response = await fetch(
            currentAPI + "/games/" + gameId + "/blocks/" + id,
        );

        const result = await response.json();
        const newBlocks = [...blocks];
        const adjustIndex = newBlocks.findIndex((block) => block.id == result.id);
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
                                        updateBlockWithEditorData={updateBlockWithEditorData}
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
            {env == "DEV" && (
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
            )}
        </Fragment>
    );
}
