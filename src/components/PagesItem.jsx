import { useState, Fragment } from "react";
import { usePage } from "../contexts/PageProvider";
import { Link, useRouteLoaderData } from "react-router";
import pencilIcon from "../assets/pencil-svgrepo-com.svg";
import cancelIcon from "../assets/cancel-circle-svgrepo-com.svg";
import saveIcon from "../assets/save-svgrepo-com.svg";

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
    const [titleEditMode, setTitleEditMode] = useState(false);
    const [slugEditMode, setSlugEditMode] = useState(false);
    const slug = page.slug;
    const { gameData } = useRouteLoaderData("main");
    const gameSlug = gameData.slug;
    const pageId = page.id;

    async function updatePageItemSlug() {
        await updatePageSlug(pageId, slugInputText, pageIndex);
        setSlugEditMode(!slugEditMode);
    }

    async function updatePageItemTitle() {
        await updatePageTitle(pageId, inputText, pageIndex);
        setTitleEditMode(!titleEditMode);
    }

    function toggleEditMode() {
        setInputText(page.title);
        setSlugInputText(page.slug);
        setEditMode(!editMode);
    }

    async function updatePageItem() {
        await updatePageTitle(pageId, inputText, pageIndex);
        await updatePageSlug(pageId, slugInputText, pageIndex);
        toggleEditMode();
    }

    return (
        <li
            id={"pageItem-" + pageIndex}
            className="mt-4 w-full
                p-2
                flex flex-col sm:flex-row
                h-37
                items-center justify-center
                bg-[#e2d2b9] rounded-lg shadow-lg
                gap-2"
            key={page.id}
        >
            <div
                className="flex flex-col w-full gap-2"
                id={"details-container-" + pageIndex}
            >
                <div
                    id={"title-container-" + pageIndex}
                    className="flex justify-stretch items-center"
                >
                    <p className="m-0 p-0 w-12">Title:</p>
                    {titleEditMode ? ( // title edit mode
                        <form action="" className="w-full flex">
                            <input
                                className="bg-(--red-brown) min-w-0 w-full px-2 text-white box-border rounded flex-1 max-w-100 "
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                            <button
                                className="ml-auto text-amber-50 w-10 h-10 p-2 rounded"
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setTitleEditMode(!titleEditMode);
                                }}
                            >
                                <img
                                    src={cancelIcon}
                                    alt="Edit Slug"
                                    className=" w-full h-full"
                                />
                            </button>
                            <button
                                className="ml-auto text-amber-50 bg-none w-10 h-10 p-2 rounded"
                                type="submit"
                                onClick={(e) => {
                                    e.preventDefault();
                                    updatePageItemTitle();
                                }}
                            >
                                <img
                                    src={saveIcon}
                                    alt="Edit Slug"
                                    className=" w-full h-full"
                                />
                            </button>
                        </form>
                    ) : (
                        // title view mode
                        <form action="" className="w-full flex items-center">
                            <p className="">{page.title}</p>
                            <button
                                className="ml-auto text-amber-50 w-10 h-10 rounded p-2 "
                                type="submit"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setInputText(page.title);
                                    setTitleEditMode(!titleEditMode);
                                }}
                            >
                                <img
                                    src={pencilIcon}
                                    alt="Edit Slug"
                                    className=" w-full h-full"
                                />
                            </button>
                        </form>
                    )}
                </div>
                <div
                    id={"slug-container-" + pageIndex}
                    className="flex justify-stretch w-full items-center"
                >
                    <p className="w-12">url: </p>
                    {slugEditMode ? ( // slug edit mode
                        <form action="" className="w-full flex">
                            <input
                                className="bg-(--red-brown) min-w-0 w-full px-2 text-white box-border rounded flex-1 max-w-100 mr-2"
                                type="text"
                                value={slugInputText}
                                onChange={(e) =>
                                    setSlugInputText(e.target.value)
                                }
                            />
                            <button
                                className="ml-auto text-amber-50 w-10 h-10 p-2 rounded"
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSlugEditMode(!slugEditMode);
                                }}
                            >
                                <img
                                    src={cancelIcon}
                                    alt="Edit Slug"
                                    className=" w-full h-full"
                                />
                            </button>
                            <button
                                className="ml-auto text-amber-50 w-10 h-10 p-2 rounded"
                                type="submit"
                                onClick={(e) => {
                                    e.preventDefault();
                                    updatePageItemSlug();
                                }}
                            >
                                <img
                                    src={saveIcon}
                                    alt="Edit Slug"
                                    className=" w-full h-full"
                                />
                            </button>
                        </form>
                    ) : (
                        // slug view mode
                        <form action="" className="w-full flex items-center">
                            <p className="">{slug}</p>
                            <button
                                className="ml-auto
                                    text-amber-50
                                    w-10 h-10
                                    p-2
                                    rounded "
                                type="submit"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSlugInputText(page.slug);
                                    setSlugEditMode(!slugEditMode);
                                }}
                            >
                                <img
                                    src={pencilIcon}
                                    alt="Edit Slug"
                                    className=" w-full h-full"
                                />
                            </button>
                        </form>
                    )}
                </div>
            </div>
            <div
                id={"button-container-" + pageIndex}
                className={"flex sm:flex-row justify-around "}
            >
                {/* Real edit button  */}
                {page.slug != null && (
                    <Link
                        className="text-amber-50 bg-(--primary) text-center w-25 mr-2 rounded px-2 py-0.5"
                        to={"/games/" + gameSlug + "/" + page.slug}
                    >
                        View Page
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
                    className="text-amber-50 bg-(--primary) w-30 rounded px-2 py-0.5"
                >
                    Delete Page
                </button>
            </div>
        </li>
    );
}
