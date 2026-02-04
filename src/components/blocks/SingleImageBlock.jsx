import { useState, Fragment } from "react";
import { currentAPI } from "../../config/api";
import { useRouteLoaderData } from "react-router";

export default function SingleImageBlock({
    deleteBlock,
    block,
    refreshBlock,
    adminMode,
}) {
    const { gameData } = useRouteLoaderData("main");
    const gameId = gameData?.id;
    const currentAPIgames = currentAPI + "/games/" + gameId;
    const [stagedFiles, setStagedFiles] = useState(["No File Chosen"]);
    const blockHasFiles = !!block.files;

    async function deleteAllFiles() {
        await fetch(
            currentAPIgames + gameId + "/blocks/" + block.id + "/files",
            {
                method: "Delete",
                headers: { "X-Admin-Secret": import.meta.env.VITE_SECRET },
            },
        );
        refreshBlock(block.id);
        deleteBlock(block);
    }

    async function uploadFile(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const response = await fetch(
            currentAPIgames + "/blocks/" + block.id + "/files",
            {
                method: "POST",
                body: formData,
                headers: { "X-Admin-Secret": import.meta.env.VITE_SECRET },
            },
        );
        if (!response.ok) {
            console.error("upload failed");
            return;
        }

        e.target.reset();
        setStagedFiles(["No File Chosen"]);
        refreshBlock(block.id);
    }

    async function deleteFileById(id) {
        console.log(id);
        await fetch(currentAPIgames + "/files/" + id, {
            method: "Delete",
            headers: {
                "X-Admin-Secret": import.meta.env.VITE_SECRET,
            },
        });
        refreshBlock(block.id);
    }

    async function deleteFile(number) {
        const fileId = block.files[number].id;
        const response = await fetch(currentAPIgames + "/files/" + fileId, {
            method: "Delete",
            headers: {
                "X-Admin-Secret": import.meta.env.VITE_SECRET,
            },
        });
        const result = await response.json();
    }

    // Image urls are the actual downloaded url from the storage
    // staged files are queued uploads
    let imgUrls = [];
    if (blockHasFiles) {
        imgUrls = block.files.map((v) =>
            typeof v.url === "string" ? v.url : undefined,
        );
    }
    // if the img isn't defined, we'll show the default "No File Chosen" message.
    // Or, if the image is defined and there is a file chosen, we'll show the file name
    // else, don't show any message
    let showFileText =
        imgUrls[0] == undefined || stagedFiles[0] != "No File Chosen";

    return (
        <div
            className={`text-(--text-color) mt-2 ${adminMode && "bg-black/10 border-b border-(--primary) mb-0"}`}
            id={"image-block-" + block.id}
        >
            <div className="flex justify-stretch">
                {block.files &&
                    block.files.map((file) => {
                        console.log(file);
                        return (
                            <div
                                id={file.id}
                                key={file.id}
                                className="w-full m-auto flex flex-col justify-center items-center gap-2"
                            >
                                <img
                                    id={"photo-img-" + file.id}
                                    src={file.url}
                                    alt=""
                                    className="max-h-80 mx-auto"
                                />
                                {adminMode && (
                                    <button
                                        className="text-amber-50 bg-(--primary) w-25 rounded px-2 py-0.5 h-7"
                                        onClick={() => deleteFileById(file.id)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        );
                    })}
            </div>
            {adminMode && (
                <Fragment>
                    <form
                        onSubmit={uploadFile}
                        method="post"
                        encType="multipart/form-data"
                        className={`flex flex-col`}
                    >
                        <div className="my-2 flex justify-center items-center gap-2">
                            <label
                                className="text-amber-50 bg-(--primary) rounded px-2 py-0.5 h-7"
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
                            />
                            {showFileText && (
                                <p
                                    className={`${stagedFiles[0] != "No File Chosen" && "px-3"}`}
                                >
                                    {stagedFiles[0]}
                                </p>
                            )}
                            {stagedFiles[0] != "No File Chosen" && (
                                <>
                                    <button
                                        className="text-amber-50 bg-(--primary) w-25 rounded px-2 py-0.5 h-7"
                                        type="submit"
                                    >
                                        Upload
                                    </button>
                                    <button
                                        onClick={() => deleteAllFiles()}
                                        className="text-amber-50 bg-(--primary) rounded px-2 py-0.5"
                                    >
                                        Delete Block
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </Fragment>
            )}
        </div>
    );
}
