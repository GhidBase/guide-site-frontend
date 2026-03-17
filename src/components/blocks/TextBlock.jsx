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
        setIsDirty(dirty);
        onDirty?.(block.id, dirty);
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
                <div className="absolute top-2 right-3 flex items-center gap-2 z-10 pointer-events-none">
                    {isDirty && (
                        <span className="text-xs text-(--primary) opacity-70 pointer-events-none">unsaved</span>
                    )}
                    {canDelete && (
                        <button
                            onClick={checkDeletion}
                            className="text-xs text-red-700/60 hover:text-red-700 pointer-events-auto cursor-pointer"
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
