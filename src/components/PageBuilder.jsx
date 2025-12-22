import { useState, useEffect, Fragment } from "react";
import TextBlock from "./blocks/TextBlock";
import { useParams, Link } from "react-router";
import { usePage } from "../contexts/PageProvider";

export default function PageBuilder() {
    const { pageId } = useParams();
    const [blocks, setBlocks] = useState([]);
    const [adminMode, setAdminMode] = useState(true);
    const [pageData, setPageData] = useState({});
    // const highestOrder = Math.max(...blocks.order);
    const orders = blocks.map((block) => (block.order ? block.order : 0));
    const highestOrder = Math.max(...orders);

    const { title, setTitle } = usePage();
    if (title != pageData.title) {
        setTitle(pageData.title);
    }

    useEffect(() => {
        fetch("http://localhost:3000/pages/" + pageId)
            .then((response) => response.json())
            .then((result) => {
                setBlocks(result.blocks);
                setPageData(result.page);
            });
    }, [pageId]);

    function isOrderTaken(order) {
        return blocks.find((block) => block.order == order) != undefined;
    }

    async function addBlock(nextOrder = highestOrder + 1) {
        const orderTaken = isOrderTaken(nextOrder);

        if (orderTaken) {
            await shiftBlocks(nextOrder);
        }

        const response = await fetch(
            "http://localhost:3000/pages/" + pageId + "/blocks",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order: nextOrder }),
            },
        );
        const newBlock = await response.json();
        const newBlocks = [...blocks, newBlock];
        setBlocks(newBlocks);
    }

    async function shiftBlocks(order) {
        const response = await fetch(
            "http://localhost:3000/pages/" + pageId + "/blocks",
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
        const response = await fetch(
            "http://localhost:3000/blocks/" + block.id,
            {
                method: "DELETE",
                // headers: { "Content-Type": "application/json" },
                // body: JSON.stringify({}),
            },
        );

        const deletedBlock = await response.json();
        const newBlocks = blocks.filter((block) => {
            return block.id != deletedBlock.id;
        });
        setBlocks(newBlocks);
    }

    async function updateBlock(block, editorRef) {
        const content = editorRef.current.getContent();

        const response = await fetch(
            "http://localhost:3000/blocks/" + block.id,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
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

    return (
        <div
            id="page-builder"
            className="bg-(--surface-background) gap-4 grow p-4 flex flex-col flex-1 items-center pr-60"
        >
            <div
                id="page-builder-content-positioner"
                className="max-w-230 w-full mt-5 flex flex-col grow"
            >
                {blocks
                    .sort((a, b) => a.order - b.order)
                    .map((block) => {
                        // block values: id, pageId, content
                        return (
                            <TextBlock
                                key={block.id}
                                deleteBlock={() => deleteBlock(block)}
                                block={block}
                                updateBlock={updateBlock}
                                adminMode={adminMode}
                                addBlock={addBlock}
                            />
                        );
                    })}
                {adminMode && (
                    <div className="flex flex-col items-center gap-2 mt-2">
                        <button
                            className="text-amber-50 bg-(--primary) w-50 rounded px-2 py-0.5"
                            onClick={() => addBlock()}
                        >
                            Add Block
                        </button>
                    </div>
                )}
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
            </div>
        </div>
    );
}
