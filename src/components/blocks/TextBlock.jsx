import TextEditor from "../TextEditor.jsx";
import { useRef, useState } from "react";
import { usePage } from "../../hooks/usePage.js";
import PendingReviewNotification from "../notifications/PendingReviewNotification";

export default function TextBlock({
    block,
    updateBlockWithEditorData,
    saveUnsavedBlock,
    editMode,
    deleteBlock,
}) {
    const { currentAPI } = usePage();
    const editorRef = useRef(null);
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [loading, setLoading] = useState(false);

    let content;
    if (block && block.content && block.content.content) {
        content = block.content.content;
    }

    async function handleSaveChanges() {
        try {
            setLoading(true);
            const contentData = editorRef.current.getContent();

            if (block.isUnsaved) {
                await saveUnsavedBlock(block, contentData);
            } else {
                const content2 = block.content2;

                const response = await fetch(
                    currentAPI + "/blocks/" + block.id,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            content: contentData,
                            content2,
                        }),
                    },
                );

                if (response.status === 202) {
                    setShowNotification(true);
                }

                await updateBlockWithEditorData(block, editorRef);
            }
            setIsEditingContent(false);
        } catch (err) {
            console.error("Error saving changes:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className={`content-block bg-(--surface-background) w-full text-(--text-color) ${
                editMode && "border-b border-(--primary) mb-0 pt-4 bg-black/10"
            }`}
        >
            {(isEditingContent || block.isUnsaved) && editMode && (
                <TextEditor
                    editorRef={editorRef}
                    content={content}
                ></TextEditor>
            )}
            {!isEditingContent && !block.isUnsaved && (
                <div
                    className="text-left mx-8"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            )}
            {editMode && (
                <div
                    id="lower-buttons"
                    className="flex gap-2 m-2 justify-center"
                >
                    {(isEditingContent || block.isUnsaved) && (
                        <button
                            onClick={handleSaveChanges}
                            disabled={loading}
                            className="text-amber-50 bg-green-700 rounded px-3 py-1 font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? "Saving..."
                                : block.isUnsaved
                                  ? "Create Block"
                                  : "Save Changes"}
                        </button>
                    )}
                    {!block.isUnsaved && (
                        <button
                            onClick={() =>
                                setIsEditingContent(!isEditingContent)
                            }
                            disabled={loading}
                            className="text-amber-50 bg-(--primary) rounded px-3 py-1 font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {!isEditingContent && "Edit"}
                            {isEditingContent && "Cancel"}
                        </button>
                    )}
                    <button
                        onClick={() => deleteBlock(block)}
                        disabled={loading}
                        className="text-amber-50 bg-red-700 rounded px-3 py-1 font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {block.isUnsaved ? "Cancel" : "Delete"}
                    </button>
                </div>
            )}
            <PendingReviewNotification
                visible={showNotification}
                onDismiss={() => setShowNotification(false)}
            />
        </div>
    );
}
