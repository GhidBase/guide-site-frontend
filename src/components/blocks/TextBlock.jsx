import TextEditor from "../TextEditor.jsx";
import { useRef, useState, useEffect } from "react";

export default function TextBlock({
    deleteBlock,
    block,
    updateBlockWithEditorData,
    adminMode,
    addBlock,
}) {
    const editorRef = useRef(null);
    const [editMode, setEditMode] = useState(false);
    const contentRef = useRef(null);
    const [height, setHeight] = useState(0);

    let content;

    if (block && block.content && block.content.content) {
        content = block.content.content;
    }

    useEffect(() => {
        if (contentRef.current) {
            setHeight(contentRef.current.offsetHeight);
        }
    }, [content, adminMode]);

    console.log(height);

    function toggleEditorMode() {
        setEditMode(!editMode);
    }

    function checkDeletion() {
        const confirmedDelete = window.confirm(
            "Are you sure you want to delete this block?",
        );
        if (confirmedDelete) {
            deleteBlock();
        }
    }

    return (
        <div
            id={"text-block-" + block.id}
            className={`relative content-block bg-(--surface-background) w-full text-(--text-color) ${
                adminMode &&
                "border-b border-(--primary) mb-0 bg-black/3 md:rounded "
            }`}
        >
            {adminMode && (
                <div
                    id={"text-block-header-" + block.id}
                    className="sticky top-7
                h-10
                bg-(--accent)
                border-b border-t sm:border border-(--outline-brown)/50 rounded-t
                flex justify-center items-center
                text-xl z-1 "
                >
                    Text Block
                </div>
            )}
            {editMode && (
                <TextEditor
                    height={height}
                    editorRef={editorRef}
                    content={content}
                ></TextEditor>
            )}
            {!editMode && (
                <div
                    id={"text-content-" + block.id}
                    ref={contentRef}
                    className={
                        `text-left px-8 py-1` +
                        (adminMode &&
                            ` bg-(--accent) border-x border-(--outline-brown)/50 `)
                    }
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            )}
            {adminMode && (
                <div
                    id="lower-buttons"
                    //className="flex flex-row-reverse sticky bottom-15 md:bottom-2 divide-x divide-x-reverse divide-(--outline-brown)/25 m-2 gap-2 justify-center"
                    className=" py-1.5
                    sticky bottom-14 lg:bottom-0
                    divide-x divide-x-reverse divide-(--outline-brown)/25
                    border-t border-(--outline-brown)/50 sm:border-x
                    flex flex-row-reverse
                    w-full justify-between
                    h-10
                    rounded-b
                    bg-(--accent)"
                >
                    {editMode && (
                        <button
                            onClick={async () => {
                                await updateBlockWithEditorData(
                                    block,
                                    editorRef,
                                );
                                toggleEditorMode();
                            }}
                            //className="text-amber-50 bg-(--primary) w-25 rounded px-2 py-0.5"
                            className="flex items-center justify-center w-full h-full text-center"
                        >
                            Save
                        </button>
                    )}
                    <button
                        onClick={() => toggleEditorMode()}
                        className="flex items-center justify-center w-full h-full text-center"
                        //className="text-amber-50 bg-(--primary) w-25 rounded px-2 py-0.5"
                    >
                        {!editMode && "Edit"}
                        {editMode && "Cancel"}
                    </button>
                    <button
                        onClick={checkDeletion}
                        //className="text-amber-50 bg-(--primary) w-25 rounded px-2 py-0.5"
                        className="text-red-700/70
                        flex items-center justify-center text-center 
                        w-full h-full "
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
