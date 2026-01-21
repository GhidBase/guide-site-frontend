import { useState, Fragment } from "react";
import { Link } from "react-router";

export default function PagesItem({
    page,
    pageIndex,
    setPages,
    deletePage,
    pages,
    updatePageTitle,
    updatePageSlug,
}) {
    const [inputText, setInputText] = useState("");
    const [slugInputText, setSlugInputText] = useState("");
    const [editMode, setEditMode] = useState(false);
    const slug = page.slug;

    function toggleEditMode() {
        setInputText(page.title);
        setSlugInputText(page.slug);
        setEditMode(!editMode);
    }

    async function updatePageItem(pageId) {
        await updatePageTitle(pageId, inputText, pageIndex);
        await updatePageSlug(pageId, slugInputText, pageIndex);
        toggleEditMode();
    }

    return (
        <li className="mt-4 w-full flex items-center" key={page.id}>
            {!editMode && (
                <div className="flex justify-between w-full px-2">
                    <p>{page.title}</p>
                    <p>{"ldg.com/" + slug}</p>
                </div>
            )}
            {editMode && (
                <form action="" className="w-full flex">
                    <input
                        className="bg-(--red-brown) min-w-0 px-2 text-white box-border rounded flex-1 max-w-100 mr-2"
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                    <input
                        className="bg-(--red-brown) min-w-0 px-2 text-white box-border rounded flex-1 max-w-100 mr-2"
                        type="text"
                        value={slugInputText}
                        onChange={(e) => setSlugInputText(e.target.value)}
                    />
                    <button
                        className="mr-2 ml-auto text-amber-50 bg-(--primary) w-22 rounded px-2 py-0.5"
                        type="submit"
                        onClick={(e) => {
                            e.preventDefault();
                            updatePageItem(page.id);
                        }}
                    >
                        Save
                    </button>
                </form>
            )}
            <button
                className={`${
                    !editMode && "ml-auto"
                } mr-2 text-amber-50 bg-(--primary) w-22 rounded px-2 py-0.5`}
                onClick={() => {
                    toggleEditMode();
                }}
            >
                {(!editMode && "Rename") || "Cancel"}
            </button>

            {/* Real edit button  */}
            {page.slug != null && (
                <Link
                    className="text-amber-50 bg-(--primary) text-center w-22 mr-2 rounded px-2 py-0.5"
                    to={"/" + page.slug}
                >
                    Edit
                </Link>
            )}

            {/* Fake edit button to warn user */}
            {page.slug == null && (
                <button
                    className={`${
                        !editMode && "ml-auto"
                    } mr-2 text-amber-50 bg-(--primary) w-22 rounded px-2 py-0.5`}
                    onClick={() =>
                        alert("Page must have url before it can be edited")
                    }
                >
                    Edit
                </button>
            )}
            <button
                onClick={async () => {
                    await deletePage(page.id);
                    const newPages = [...pages];
                    newPages.splice(pageIndex, 1);
                    setPages(newPages);
                }}
                className="text-amber-50 bg-(--primary) w-22 rounded px-2 py-0.5"
            >
                Delete
            </button>
        </li>
    );
}
