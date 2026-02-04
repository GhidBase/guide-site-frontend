import "../tailwind.css";
import { currentAPI } from "../config/api";
import { Fragment, useEffect, useState } from "react";
import PagesItem from "./PagesItem";
import { useRouteLoaderData } from "react-router";
import { usePage } from "../contexts/PageProvider";
import GameItem from "./GameItem";
// const secret = import.meta.env.VITE_SECRET;

// title refers to the title input field
// setTitleInput updates that field
// setTitle updates the title of the page at the top
// of the ui to ("Page Manager")

export default function PageManager() {
    const [pages, setPages] = useState([]);
    const { gameData } = useRouteLoaderData("main");
    const gameId = gameData.id;

    const [title, setTitleInput] = useState("");
    //const { currentAPI, setTitle, gameId } = usePage();
    //setTitle("Page Manager");

    useEffect(() => {
        if (!gameId) {
            return;
        }
        fetch(currentAPI + "/games/" + gameId + "/pages")
            .then((response) => response.json())
            .then((result) => setPages(result));
    }, [currentAPI, gameId]);

    async function createPage() {
        if (!title?.trim()) {
            console.log("Error - title cannot be empty");
            return;
        }

        let response;
        try {
            response = await fetch(currentAPI + "/games/" + gameId + "/pages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Secret": import.meta.env.VITE_SECRET,
                },
                body: JSON.stringify({ title }),
            });
        } catch (err) {
            console.error("Error", err);
            return;
        }

        if (!response.ok) {
            try {
                await response.json();
            } catch {
                ("");
            }
            console.error("Create page failed");
            return;
        }

        const newPage = await response.json();
        const newPages = [...pages];
        newPages.push(newPage);
        setPages(newPages);
        setTitleInput("");
    }

    async function deletePage(id) {
        if (!+id) {
            console.log("Error - Invalid ID " + +id);
            return;
        }

        fetch(currentAPI + "/games/" + gameId + "/pages/by-id/" + id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "X-Admin-Secret": import.meta.env.VITE_SECRET,
            },
            body: JSON.stringify(),
        });
    }

    async function updatePageTitle(id, title, index) {
        if (!+id) {
            console.log("Error - Invalid ID " + +id);
            return;
        }

        await fetch(currentAPI + "/games/" + gameId + "/pages/by-id/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Admin-Secret": import.meta.env.VITE_SECRET,
            },
            body: JSON.stringify({ title }),
        });

        const newPages = [...pages];
        newPages[index].title = title;
        setPages(newPages);
    }

    async function updatePageSlug(id, slug, index) {
        if (!+id) {
            console.log("Error - Invalid ID " + +id);
            return;
        }

        await fetch(currentAPI + "/games/" + gameId + "/pages/by-id/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Admin-Secret": import.meta.env.VITE_SECRET,
            },
            body: JSON.stringify({ slug }),
        });

        const newPages = [...pages];
        newPages[index].slug = slug;
        setPages(newPages);
    }

    return (
        <Fragment>
            <div className="mt-4 flex justify-between items-center mx-auto gap-2">
                <form
                    action=""
                    className="flex gap-2 items-center flex-col md:flex-row "
                >
                    <h1 className="">Pages:</h1>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        className="bg-(--red-brown) min-w-0 text-white px-2 box-border rounded ml-auto"
                        onChange={(e) => setTitleInput(e.target.value)}
                        value={title}
                        placeholder="Page Title"
                    />
                    <button
                        type="submit"
                        onClick={(e) => {
                            e.preventDefault();
                            createPage();
                        }}
                        className="text-amber-50 bg-(--primary) w-38 rounded px-2 py-0.5"
                    >
                        Create Page
                    </button>
                </form>
            </div>
            <ul id={"pagemanager-list"} className="m-2">
                {pages.map((page, pageIndex) => {
                    return (
                        <PagesItem
                            key={page.id}
                            pageIndex={pageIndex}
                            page={page}
                            pages={pages}
                            setPages={setPages}
                            deletePage={deletePage}
                            updatePageTitle={updatePageTitle}
                            updatePageSlug={updatePageSlug}
                        />
                    );
                })}
            </ul>
        </Fragment>
    );
}
