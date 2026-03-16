import { lazy, Suspense, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { useRouteLoaderData } from "react-router";
import ImagePickerModal from "../ImagePickerModal.jsx";

const TextEditor = lazy(() => import("../TextEditor.jsx"));

const TextBlock = forwardRef(function TextBlock({
    deleteBlock,
    block,
    updateBlockWithEditorData,
    adminMode,
    canDelete,
    onDirty,
}, ref) {
    const { gameData } = useRouteLoaderData("main");
    const editorRef = useRef(null);
    const imagePickerTriggerRef = useRef(null);
    const [isDirty, setIsDirty] = useState(false);
    const [imagePickerOpen, setImagePickerOpen] = useState(false);

    imagePickerTriggerRef.current = () => setImagePickerOpen(true);

    // Always-fresh save function via ref so useImperativeHandle stays stable
    const saveRef = useRef(null);
    saveRef.current = async () => {
        await updateBlockWithEditorData(block, editorRef);
        editorRef.current?.setDirty(false);
        setIsDirty(false);
        onDirty?.(block.id, false);
    };

    useImperativeHandle(ref, () => ({
        async save() {
            return saveRef.current?.();
        },
    }), []);

    const content = block?.content?.content;

    function handleEditorChange(_content, editor) {
        const dirty = editor.isDirty();
        setIsDirty((prev) => {
            if (dirty !== prev) onDirty?.(block.id, dirty);
            return dirty;
        });
    }

    function checkDeletion() {
        if (window.confirm("Are you sure you want to delete this block?")) {
            deleteBlock();
        }
    }

    return (
        <div
            id={"text-block-" + block.id}
            className={`relative content-block bg-(--surface-background) w-full text-(--text-color) ${
                adminMode && "border-b border-(--primary) mb-0 bg-black/3 md:rounded"
            }`}
        >
            {adminMode && (
                <div className="sticky top-7 h-10 bg-(--accent) border-b border-t sm:border border-(--outline-brown)/50 rounded-t flex items-center z-1">
                    <div className="flex-1 flex justify-center items-center text-xl">
                        Text Block
                        {isDirty && (
                            <span className="ml-2 text-xs text-(--primary) font-normal opacity-70">• unsaved</span>
                        )}
                    </div>
                    {canDelete && (
                        <button
                            onClick={checkDeletion}
                            className="flex items-center justify-center px-4 h-full text-sm text-red-700/70 border-l border-(--outline-brown)/25 shrink-0"
                        >
                            Delete
                        </button>
                    )}
                </div>
            )}

            {adminMode ? (
                <Suspense fallback={null}>
                    <TextEditor
                        editorRef={editorRef}
                        content={content}
                        imagePickerTriggerRef={imagePickerTriggerRef}
                        onEditorChange={handleEditorChange}
                    />
                </Suspense>
            ) : (
                <div
                    id={"text-content-" + block.id}
                    className="text-left px-8 py-1"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            )}

            {imagePickerOpen && (
                <ImagePickerModal
                    gameId={gameData?.id}
                    onSelect={(url) => {
                        editorRef.current?.insertContent(`<img src="${url}" />`);
                        setImagePickerOpen(false);
                    }}
                    onClose={() => setImagePickerOpen(false)}
                />
            )}

        </div>
    );
});

export default TextBlock;
