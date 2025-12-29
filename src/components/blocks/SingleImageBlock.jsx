import { usePage } from "../../contexts/PageProvider";
import { useState, Fragment } from "react";

export default function SingleImageBlock({
    deleteBlock,
    block,
    updateBlock,
    adminMode,
    addBlock,
}) {
    async function uploadFile(e) {
        e.preventDefault();

        // Upload a file to amazon
        const formData = new FormData(e.target);
        formData.append("block", JSON.stringify(block));
        const response = await fetch(currentAPI + "/files", {
            method: "POST",
            body: formData,
        });
        if (!response.ok) {
            console.error("upload failed");
            return;
        }
        const fileData = await response.json();

        // Create a file record in the database
        e.target.reset();
    }

    async function deleteFile(number) {
        console.log(number);
        const fileName = block.files[number].filename;
        console.log(block.files[number].filename);
        console.log(currentAPI + "/files/" + fileName);
        const response = await fetch(currentAPI + "/files/" + fileName, {
            method: "Delete",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(block.files[number]),
        });
        const result = await response.json();
        console.log(result);
    }

    const { currentAPI } = usePage();
    const [editMode, setEditMode] = useState(false);
    const [stagedFiles, setStagedFiles] = useState(["No File Chosen"]);
    const blockHasFiles = !!block.files;

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

    // console.log(block.files[0].filename);

    return (
        <div className="text-(--text-color)">
            {blockHasFiles && !!imgUrls[0] && (
                <img
                    id={"photo-img-" + block.id}
                    src={imgUrls[0]}
                    alt=""
                    className="max-h-80 mx-auto"
                />
            )}
            {adminMode && (
                <Fragment>
                    <form
                        onSubmit={uploadFile}
                        // action={currentAPI + "/files"}
                        method="post"
                        encType="multipart/form-data"
                        className="flex flex-col"
                    >
                        {/* imgUrls[0] != undefined && stagedFiles[0] */}
                        {showFileText && <p>{stagedFiles[0]}</p>}
                        <div className="flex justify-center gap-2">
                            <label
                                className="text-amber-50 bg-(--primary) rounded px-2 py-0.5 h-7"
                                htmlFor={"upload-file"}
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
                                name={"upload-file"}
                                id={"upload-file"}
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
                            <button
                                className="text-amber-50 bg-(--primary) w-25 rounded px-2 py-0.5 h-7"
                                type="submit"
                            >
                                Upload
                            </button>
                        </div>
                    </form>
                    <div
                        id="lower-buttons"
                        className="flex gap-2 m-2 justify-center"
                    >
                        {editMode && (
                            <button
                                onClick={async () => {
                                    await updateBlock(block, editorRef);
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
                            onClick={() => deleteFile(0)}
                            className="text-amber-50 bg-(--primary) w-25 rounded px-2 py-0.5"
                        >
                            Delete
                        </button>
                        <button
                            onClick={async () => {
                                await addBlock({ nextOrder: block.order + 1 });
                            }}
                            className="text-amber-50 bg-(--primary) w-25 rounded px-2 py-0.5"
                        >
                            Add Block
                        </button>
                    </div>
                </Fragment>
            )}
        </div>
    );
}
