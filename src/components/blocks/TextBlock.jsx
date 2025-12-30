import { type } from "@testing-library/user-event/dist/cjs/utility/type.js";
import TextEditor from "../TextEditor.jsx";
import { useRef, useState } from "react";

export default function TextBlock({
    deleteBlock,
    block,
    updateBlockWithEditorData,
    adminMode,
    addBlock,
}) {
    const editorRef = useRef(null);
    const [editMode, setEditMode] = useState(false);
    let content;
    if (block && block.content && block.content.content) {
        content = block.content.content;
    }

    function toggleEditorMode() {
        setEditMode(!editMode);
    }

    return (
        <div
            className={`content-block bg-(--surface-background) w-full text-(--text-color) ${
                adminMode && "border-b border-(--primary) mb-0 pt-4 bg-black/10"
            }`}
        >
            {editMode && (
                <TextEditor
                    editorRef={editorRef}
                    content={content}
                ></TextEditor>
            )}
            {!editMode && (
                <div
                    className="text-left mx-8"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            )}
            {adminMode && (
                <div
                    id="lower-buttons"
                    className="flex gap-2 m-2 justify-center"
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
                            className="text-amber-50 bg-(--primary) w-25 rounded px-2 py-0.5"
                        >
                            Save
                        </button>
                    )}
                    <button
                        onClick={() => toggleEditorMode()}
                        className="text-amber-50 bg-(--primary) w-25 rounded px-2 py-0.5"
                    >
                        {!editMode && "Edit"}
                        {editMode && "Cancel"}
                    </button>
                    <button
                        onClick={deleteBlock}
                        className="text-amber-50 bg-(--primary) w-25 rounded px-2 py-0.5"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
