import { useState, Fragment } from "react";
import { usePage } from "../../hooks/usePage";
import PendingReviewNotification from "../notifications/PendingReviewNotification";

export default function SingleImageBlock({
    deleteBlock,
    block,
    refreshBlock,
    editMode,
}) {
    const { currentAPI } = usePage();
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
                currentAPI + "/blocks/" + block.id + "/files",
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
                currentAPI + "/blocks/" + block.id + "/files",
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
            const response = await fetch(currentAPI + "/files/" + id, {
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

    let showFileText =
        imgUrls[0] == undefined || stagedFiles[0] != "No File Chosen";

    return (
        <>
            <div
                className={`text-(--text-color) mt-2 ${editMode && "bg-black/10 border-b border-(--primary) mb-0"}`}
                id={"image-block-" + block.id}
            >
                <div className="flex justify-stretch">
                    {block.files &&
                        block.files.map((file) => {
                            return (
                                <div
                                    id={file.id}
                                    key={file.id}
                                    className="w-full m-auto"
                                >
                                    <img
                                        id={"photo-img-" + file.id}
                                        src={file.url}
                                        alt=""
                                        className="max-h-80 mx-auto"
                                    />
                                    {editMode && (
                                        <button
                                            className="text-amber-50 bg-(--primary) rounded px-2 py-0.5 h-7 cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={() =>
                                                deleteFileById(file.id)
                                            }
                                            disabled={loading}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                </div>
                {editMode && (
                    <Fragment>
                        <form
                            onSubmit={uploadFile}
                            method="post"
                            encType="multipart/form-data"
                            className={`flex flex-col`}
                        >
                            <div className="flex justify-center items-center gap-2">
                                <label
                                    className="text-amber-50 bg-(--primary) rounded px-2 py-0.5 h-7 cursor-pointer hover:opacity-90"
                                    htmlFor={"upload-file" + block.id}
                                >
                                    Choose a file
                                </label>
                                <input
                                    type="hidden"
                                    name="id"
                                    value="<%= folder.id %>"
                                />
                                <input
                                    type="file"
                                    name={"upload-file" + block.id}
                                    id={"upload-file" + block.id}
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        const newFiles = [...stagedFiles];
                                        newFiles[0] = file
                                            ? file.name
                                            : "No file chosen";
                                        setStagedFiles(newFiles);
                                    }}
                                    disabled={loading}
                                />
                                {showFileText && (
                                    <p
                                        className={`${stagedFiles[0] != "No File Chosen" && "px-3"}`}
                                    >
                                        {stagedFiles[0]}
                                    </p>
                                )}
                                {stagedFiles[0] != "No File Chosen" && (
                                    <button
                                        className="text-amber-50 bg-(--primary) rounded px-2 py-0.5 h-7 cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        Upload
                                    </button>
                                )}
                            </div>
                        </form>
                        <div
                            id="lower-buttons"
                            className="flex gap-2 m-2 justify-center"
                        >
                            <button
                                onClick={() => deleteAllFiles()}
                                className="text-amber-50 bg-red-700 rounded px-3 py-1 font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                Delete All
                            </button>
                        </div>
                    </Fragment>
                )}
            </div>
            <PendingReviewNotification
                visible={showNotification}
                onDismiss={() => setShowNotification(false)}
            />
        </>
    );
}
