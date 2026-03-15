import { useState } from "react";
import { currentAPI } from "../../config/api";
import { useRouteLoaderData } from "react-router";
import PendingReviewNotification from "../notifications/PendingReviewNotification";

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
    const blockHasFiles = !!block.files;

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

    let imgUrls = [];
    if (blockHasFiles) {
        imgUrls = block.files.map((v) =>
            typeof v.url === "string" ? v.url : undefined,
        );
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
                        `flex justify-stretch px-8 py-1` +
                        (adminMode ? ` bg-(--accent) border-x border-(--outline-brown)/50` : "")
                    }
                >
                    {block.files && block.files.map((file) => (
                        <div id={file.id} key={file.id} className="w-full m-auto">
                            <img
                                id={"photo-img-" + file.id}
                                src={file.url}
                                alt=""
                                className="max-h-80 mx-auto"
                            />
                            {adminMode && canDelete && (
                                <div className="flex justify-center mt-1">
                                    <button
                                        className="text-red-700/70 text-sm cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => deleteFileById(file.id)}
                                        disabled={loading}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

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
            <PendingReviewNotification
                visible={showNotification}
                onDismiss={() => setShowNotification(false)}
            />
        </>
    );
}
