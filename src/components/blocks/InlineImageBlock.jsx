import { forwardRef, useImperativeHandle, useState, useRef, useEffect, lazy, Suspense } from "react";
import { useRouteLoaderData } from "react-router";
import { Image, Trash2 } from "lucide-react";
import ImagePickerModal from "../ImagePickerModal.jsx";

const TextEditor = lazy(() => import("../TextEditor.jsx"));

const InlineImageBlock = forwardRef(function InlineImageBlock(
    { block, adminMode, canDelete, deleteBlock, updateBlockContent, onDirty },
    ref
) {
    const { gameData } = useRouteLoaderData("main");
    const gameId = gameData?.id;

    const [data, setData] = useState(() => {
        const empty = { imageUrl: "", imageSide: "right", imageWidth: 35, mobileImagePosition: "above", textVAlign: "top", richText: "" };
        if (!block.content) return empty;
        if (typeof block.content === "object") {
            if (block.content.type === "richText" && typeof block.content.content === "string") {
                try { return { ...empty, ...JSON.parse(block.content.content) }; }
                catch { return empty; }
            }
            return { ...empty, ...block.content };
        }
        try { return { ...empty, ...JSON.parse(block.content) }; }
        catch { return empty; }
    });

    const [imagePickerOpen, setImagePickerOpen] = useState(false);
    const editorRef = useRef(null);
    const imagePickerTriggerRef = useRef(null);
    imagePickerTriggerRef.current = () => setImagePickerOpen(true);

    // Track latest editor content without triggering re-renders
    const latestRichText = useRef(data.richText);

    // Flush editor content to state when leaving edit mode so view renders current content
    useEffect(() => {
        if (!adminMode) {
            setData(prev => ({ ...prev, richText: latestRichText.current }));
        }
    }, [adminMode]);

    const saveRef = useRef(null);
    saveRef.current = async () => {
        const richText = editorRef.current?.getContent() ?? latestRichText.current;
        await updateBlockContent(block, { ...data, richText });
        editorRef.current?.setDirty?.(false);
        onDirty?.(block.id, false);
    };

    useImperativeHandle(ref, () => ({
        async save() { return saveRef.current?.(); }
    }), []);

    function patch(updates) {
        setData(prev => ({ ...prev, ...updates }));
        onDirty?.(block.id, true);
    }

    const { imageUrl, imageSide, imageWidth, mobileImagePosition, textVAlign, richText } = data;
    const imageOnLeft = imageSide === "left";
    const alignSelfMap = { top: "flex-start", center: "center", bottom: "flex-end" };
    const textAlignSelf = alignSelfMap[textVAlign ?? "top"] ?? "flex-start";

    return (
        <>
            <style>{`
                .iib-layout { display: flex; }
                .iib-layout.iib-left { flex-direction: row; }
                .iib-layout.iib-right { flex-direction: row-reverse; }
                .iib-img-panel { position: relative; flex-shrink: 0; overflow: hidden; min-height: 160px; }
                @media (max-width: 640px) {
                    .iib-layout { flex-direction: column !important; }
                    .iib-layout.iib-mobile-below { flex-direction: column-reverse !important; }
                    .iib-img-panel { width: 100% !important; height: 220px; min-height: unset; }
                }
            `}</style>
            <div
                id={"inline-image-block-" + block.id}
                className={`relative content-block bg-(--surface-background) w-full text-(--text-color) ${
                    adminMode ? "border-b border-(--primary) mb-0 bg-black/3 md:rounded" : ""
                }`}
            >
                <div className={`iib-layout ${imageOnLeft ? "iib-left" : "iib-right"} ${mobileImagePosition === "below" ? "iib-mobile-below" : ""}`}>
                    {/* Image panel */}
                    <div
                        className="iib-img-panel"
                        style={{ width: `${imageWidth ?? 35}%` }}
                    >
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt=""
                                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                            />
                        )}
                        {adminMode && (
                            <button
                                onClick={() => setImagePickerOpen(true)}
                                style={{
                                    position: "absolute", inset: 0, width: "100%", height: "100%",
                                    background: imageUrl ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.03)",
                                    border: "2px dashed rgba(232,213,183,0.15)", cursor: "pointer",
                                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                    gap: "0.4rem", color: "rgba(232,213,183,0.6)", fontSize: "0.75rem",
                                    opacity: imageUrl ? 0 : 1,
                                    transition: "opacity 0.2s",
                                    zIndex: 2,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = imageUrl ? "0" : "1"; }}
                            >
                                <Image size={20} />
                                {imageUrl ? "Change image" : "Add image"}
                            </button>
                        )}
                    </div>

                    {/* Text panel */}
                    <div style={{ flex: 1, minWidth: 0, alignSelf: textAlignSelf }}>
                        {adminMode ? (
                            <Suspense fallback={null}>
                                <TextEditor
                                    editorRef={editorRef}
                                    content={richText}
                                    imagePickerTriggerRef={imagePickerTriggerRef}
                                    onEditorChange={(content) => {
                                        latestRichText.current = content;
                                        onDirty?.(block.id, true);
                                    }}
                                />
                            </Suspense>
                        ) : (
                            <div
                                className="text-left px-8 py-1"
                                dangerouslySetInnerHTML={{ __html: richText }}
                            />
                        )}
                    </div>
                </div>

                {adminMode && (
                    <div style={{
                        display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center",
                        padding: "0.5rem 0.75rem",
                        background: "rgba(10,8,6,0.6)",
                        border: "1px solid rgba(232,213,183,0.5)",
                        borderTop: "none",
                        fontSize: "0.72rem",
                        color: "rgba(232,213,183,0.5)",
                    }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <span style={{ opacity: 0.5 }}>Image side</span>
                            {[["left", "Left"], ["right", "Right"]].map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => patch({ imageSide: val })}
                                    style={{
                                        padding: "0.15rem 0.45rem", fontSize: "0.7rem", borderRadius: "4px", cursor: "pointer",
                                        border: imageSide === val ? "1px solid rgba(155,106,78,0.7)" : "1px solid rgba(232,213,183,0.12)",
                                        background: imageSide === val ? "rgba(155,106,78,0.2)" : "rgba(255,255,255,0.04)",
                                        color: "#e8d5b7",
                                    }}
                                >{label}</button>
                            ))}
                        </label>

                        <div style={{ width: "1px", height: "14px", background: "rgba(232,213,183,0.15)" }} />

                        <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <span style={{ opacity: 0.5 }}>Image width</span>
                            <input
                                type="number"
                                min={10} max={70}
                                value={imageWidth ?? 35}
                                onChange={e => patch({ imageWidth: +e.target.value })}
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(232,213,183,0.12)", borderRadius: "4px", color: "#e8d5b7", padding: "0.2rem 0.4rem", fontSize: "0.72rem", width: "52px" }}
                            />
                            <span style={{ opacity: 0.4 }}>%</span>
                        </label>

                        <div style={{ width: "1px", height: "14px", background: "rgba(232,213,183,0.15)" }} />

                        <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <span style={{ opacity: 0.5 }}>Mobile image</span>
                            {[["above", "Above"], ["below", "Below"]].map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => patch({ mobileImagePosition: val })}
                                    style={{
                                        padding: "0.15rem 0.45rem", fontSize: "0.7rem", borderRadius: "4px", cursor: "pointer",
                                        border: (mobileImagePosition ?? "above") === val ? "1px solid rgba(155,106,78,0.7)" : "1px solid rgba(232,213,183,0.12)",
                                        background: (mobileImagePosition ?? "above") === val ? "rgba(155,106,78,0.2)" : "rgba(255,255,255,0.04)",
                                        color: "#e8d5b7",
                                    }}
                                >{label}</button>
                            ))}
                        </label>

                        <div style={{ width: "1px", height: "14px", background: "rgba(232,213,183,0.15)" }} />

                        <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <span style={{ opacity: 0.5 }}>Text align</span>
                            {[["top", "Top"], ["center", "Center"], ["bottom", "Bottom"]].map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => patch({ textVAlign: val })}
                                    style={{
                                        padding: "0.15rem 0.45rem", fontSize: "0.7rem", borderRadius: "4px", cursor: "pointer",
                                        border: (textVAlign ?? "top") === val ? "1px solid rgba(155,106,78,0.7)" : "1px solid rgba(232,213,183,0.12)",
                                        background: (textVAlign ?? "top") === val ? "rgba(155,106,78,0.2)" : "rgba(255,255,255,0.04)",
                                        color: "#e8d5b7",
                                    }}
                                >{label}</button>
                            ))}
                        </label>

                        {canDelete && (
                            <>
                                <div style={{ flex: 1 }} />
                                <button
                                    onClick={() => { if (window.confirm("Delete this block?")) deleteBlock(); }}
                                    style={{ background: "rgba(200,50,50,0.1)", border: "1px solid rgba(200,50,50,0.25)", color: "#f08080", borderRadius: "6px", padding: "0.25rem 0.6rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.7rem" }}
                                >
                                    <Trash2 size={11} /> Delete block
                                </button>
                            </>
                        )}
                    </div>
                )}

                {imagePickerOpen && (
                    <ImagePickerModal
                        gameId={gameId}
                        onSelect={(url) => {
                            patch({ imageUrl: url });
                            setImagePickerOpen(false);
                        }}
                        onClose={() => setImagePickerOpen(false)}
                    />
                )}
            </div>
        </>
    );
});

export default InlineImageBlock;
