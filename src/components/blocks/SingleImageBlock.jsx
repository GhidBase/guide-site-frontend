import { useState } from "react";
import { currentAPI } from "../../config/api";
import { useRouteLoaderData } from "react-router";
import PendingReviewNotification from "../notifications/PendingReviewNotification";
import ImagePickerModal from "../ImagePickerModal.jsx";

export default function SingleImageBlock({
    deleteBlock,
    block,
    refreshBlock,
    adminMode,
    canDelete,
}) {
    const { gameData } = useRouteLoaderData("main");
    const gameId = gameData?.id;
    const currentAPIgames = currentAPI + "/games/" + gameId;
    const [stagedFiles, setStagedFiles] = useState(["No File Chosen"]);
    const [loading, setLoading] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [imagePickerOpen, setImagePickerOpen] = useState(false);

    const contentSettings = block.content ?? {};
    const alignment = contentSettings.alignment ?? "center";
    const size = contentSettings.size ?? "full";
    const verticalAlign = contentSettings.verticalAlign ?? "center";
    const offsets = contentSettings.offsets ?? {};

    const sizeClasses = {
        small:  "max-w-48",
        medium: "max-w-80",
        large:  "max-w-2xl",
        full:   "w-full",
    };
    const alignClasses = {
        left:   "mr-auto",
        center: "mx-auto",
        right:  "ml-auto",
    };
    const verticalAlignClasses = {
        top:    "justify-start",
        center: "justify-center",
        bottom: "justify-end",
    };

    async function nudgeImage(fileId, delta) {
        const current = offsets[fileId] ?? 0;
        const newContent = {
            ...contentSettings,
            offsets: { ...offsets, [fileId]: current + delta },
        };
        await fetch(currentAPIgames + "/blocks/" + block.id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ content: newContent }),
        });
        refreshBlock(block.id);
    }

    async function saveSetting(key, value) {
        const newContent = { ...contentSettings, [key]: value };
        await fetch(currentAPIgames + "/blocks/" + block.id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ content: newContent }),
        });
        refreshBlock(block.id);
    }


    async function deleteAllFiles() {
        if (block.isUnsaved) {
            deleteBlock(block);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                currentAPIgames + "/blocks/" + block.id + "/files",
                {
                    method: "Delete",
                    credentials: "include",
                },
            );
            if (response.status === 202) {
                setShowNotification(true);
            } else if (!response.ok) {
                console.error("delete all files failed");
            }
            refreshBlock(block.id);
            deleteBlock(block);
        } finally {
            setLoading(false);
        }
    }

    async function uploadFile(e) {
        e.preventDefault();

        try {
            setLoading(true);
            const formData = new FormData(e.target);
            const response = await fetch(
                currentAPIgames + "/blocks/" + block.id + "/files",
                {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                },
            );
            if (response.status === 202) {
                setShowNotification(true);
            } else if (!response.ok) {
                console.error("upload failed");
                return;
            }

            e.target.reset();
            setStagedFiles(["No File Chosen"]);
            refreshBlock(block.id);
        } finally {
            setLoading(false);
        }
    }

    async function addFileFromPool(url) {
        try {
            setLoading(true);
            const response = await fetch(
                currentAPIgames + "/blocks/" + block.id + "/files",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ imageUrl: url }),
                },
            );
            if (response.status === 202) {
                setShowNotification(true);
            } else if (!response.ok) {
                console.error("add from pool failed");
                return;
            }
            refreshBlock(block.id);
        } finally {
            setLoading(false);
        }
    }

    async function deleteFileById(id) {
        try {
            setLoading(true);
            const response = await fetch(currentAPIgames + "/files/" + id, {
                method: "Delete",
                credentials: "include",
            });
            if (response.status === 202) {
                setShowNotification(true);
            } else if (!response.ok) {
                console.error("delete specific file failed");
            }
            refreshBlock(block.id);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div
                id={"image-block-" + block.id}
                className={`relative content-block bg-(--surface-background) w-full text-(--text-color) ${
                    adminMode && "border-b border-(--primary) mb-0 bg-black/3 md:rounded"
                }`}
            >
                {adminMode && (
                    <div className="sticky top-7 h-10 bg-(--accent) border-b border-t sm:border border-(--outline-brown)/50 rounded-t flex justify-center items-center text-xl z-1">
                        Image Block
                    </div>
                )}

                {/* Images */}
                <div
                    className={
                        `flex ${verticalAlignClasses[verticalAlign]} px-8 py-4 min-h-24` +
                        (adminMode ? ` bg-(--accent) border-x border-(--outline-brown)/50` : "")
                    }
                >
                    {block.files && block.files.map((file) => (
                        <div id={file.id} key={file.id} className={`${sizeClasses[size]} ${alignClasses[alignment]}`}>
                            <img
                                id={"photo-img-" + file.id}
                                src={file.url}
                                alt=""
                                className="w-full"
                                style={{ transform: `translateY(${offsets[file.id] ?? 0}px)` }}
                            />
                            {adminMode && (
                                <div className="flex justify-center items-center gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => nudgeImage(file.id, -4)}
                                        className="text-(--text-color) text-xs px-1.5 py-0.5 rounded hover:bg-(--surface-background) cursor-pointer"
                                        title="Move up"
                                    >▲</button>
                                    <span className="text-xs text-(--text-color) w-8 text-center">
                                        {offsets[file.id] ?? 0}px
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => nudgeImage(file.id, 4)}
                                        className="text-(--text-color) text-xs px-1.5 py-0.5 rounded hover:bg-(--surface-background) cursor-pointer"
                                        title="Move down"
                                    >▼</button>
                                    {canDelete && (
                                        <button
                                            className="text-red-700/70 text-sm cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                                            onClick={() => deleteFileById(file.id)}
                                            disabled={loading}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Settings bar */}
                {adminMode && (
                    <div className="flex items-center gap-4 px-4 py-1.5 bg-(--accent) border-x border-t border-(--outline-brown)/50 text-sm flex-wrap">
                        <div className="flex items-center gap-1">
                            <span className="text-(--text-color) mr-1">Size:</span>
                            {["small", "medium", "large", "full"].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => saveSetting("size", s)}
                                    className={`px-2 py-0.5 rounded capitalize cursor-pointer transition-colors ${
                                        size === s
                                            ? "bg-(--primary) text-white"
                                            : "text-(--text-color) hover:bg-(--surface-background)"
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-(--text-color) mr-1">Align:</span>
                            {["left", "center", "right"].map((a) => (
                                <button
                                    key={a}
                                    type="button"
                                    onClick={() => saveSetting("alignment", a)}
                                    className={`px-2 py-0.5 rounded capitalize cursor-pointer transition-colors ${
                                        alignment === a
                                            ? "bg-(--primary) text-white"
                                            : "text-(--text-color) hover:bg-(--surface-background)"
                                    }`}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-(--text-color) mr-1">Vertical:</span>
                            {["top", "center", "bottom"].map((v) => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => saveSetting("verticalAlign", v)}
                                    className={`px-2 py-0.5 rounded capitalize cursor-pointer transition-colors ${
                                        verticalAlign === v
                                            ? "bg-(--primary) text-white"
                                            : "text-(--text-color) hover:bg-(--surface-background)"
                                    }`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Admin bottom bar */}
                {adminMode && (
                    <form
                        onSubmit={uploadFile}
                        method="post"
                        encType="multipart/form-data"
                        className="py-1.5
                            sticky bottom-14 lg:bottom-0
                            divide-x divide-x-reverse divide-(--outline-brown)/25
                            border-t border-(--outline-brown)/50 sm:border-x
                            flex flex-row-reverse
                            w-full justify-between
                            h-10
                            rounded-b
                            bg-(--accent)"
                    >
                        <input type="hidden" name="id" value="<%= folder.id %>" />
                        <input
                            type="file"
                            name={"upload-file" + block.id}
                            id={"upload-file" + block.id}
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                setStagedFiles([file ? file.name : "No File Chosen"]);
                            }}
                            disabled={loading}
                        />
                        {stagedFiles[0] !== "No File Chosen" && (
                            <button
                                className="flex items-center justify-center w-full h-full text-center"
                                type="submit"
                                disabled={loading}
                            >
                                Upload
                            </button>
                        )}
                        <label
                            className="flex items-center justify-center w-full h-full text-center cursor-pointer"
                            htmlFor={"upload-file" + block.id}
                        >
                            {stagedFiles[0] === "No File Chosen" ? "Choose File" : stagedFiles[0]}
                        </label>
                        <button
                            type="button"
                            onClick={() => setImagePickerOpen(true)}
                            disabled={loading}
                            className="flex items-center justify-center w-full h-full text-center"
                        >
                            From Pool
                        </button>
                        {canDelete && (
                            <button
                                type="button"
                                onClick={deleteAllFiles}
                                disabled={loading}
                                className="text-red-700/70
                                    flex items-center justify-center text-center
                                    w-full h-full"
                            >
                                Delete All
                            </button>
                        )}
                    </form>
                )}
            </div>
            {imagePickerOpen && (
                <ImagePickerModal
                    gameId={gameId}
                    onSelect={(url) => {
                        addFileFromPool(url);
                        setImagePickerOpen(false);
                    }}
                    onClose={() => setImagePickerOpen(false)}
                />
            )}
            <PendingReviewNotification
                visible={showNotification}
                onDismiss={() => setShowNotification(false)}
            />
        </>
    );
}
