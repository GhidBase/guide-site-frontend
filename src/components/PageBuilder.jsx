import { useState, useEffect } from "react";
import TextBlock from "./blocks/TextBlock";
import { useParams, Link } from "react-router";

export default function PageBuilder() {
    const { pageId } = useParams();
    const [blocks, setBlocks] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000/pages/" + pageId)
            .then((response) => response.json())
            .then((result) => setBlocks(result));
    }, [pageId]);

    async function addBlock() {
        const response = await fetch(
            "http://localhost:3000/pages/" + pageId + "/blocks",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            }
        );
        const newBlock = await response.json();
        const newBlocks = [...blocks, newBlock];
        setBlocks(newBlocks);
    }

    async function deleteBlock(block) {
        const response = await fetch(
            "http://localhost:3000/blocks/" + block.id,
            {
                method: "DELETE",
                // headers: { "Content-Type": "application/json" },
                // body: JSON.stringify({}),
            }
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
            }
        );

        const result = await response.json();
        const newBlocks = [...blocks];
        const adjustIndex = newBlocks.findIndex(
            (block) => block.id == result.id
        );
        newBlocks[adjustIndex] = result;
        setBlocks(newBlocks);
    }

    return (
        <div className="overflow-x-auto w-full flex justify-center">
            <div className="flex flex-col items-center gap-4 w-full p-4 max-w-230">
                {blocks.map((block) => {
                    // block values: id, pageId, content
                    return (
                        <TextBlock
                            key={block.id}
                            deleteBlock={() => deleteBlock(block)}
                            block={block}
                            updateBlock={updateBlock}
                        />
                    );
                })}
                <button
                    className="text-amber-50 bg-neutral-600 w-25 rounded px-2 py-0.5"
                    onClick={() => addBlock()}
                >
                    Add Block
                </button>
                <Link to={"/page-manager/"}>Back to Page Manager</Link>
            </div>
        </div>
    );
}
