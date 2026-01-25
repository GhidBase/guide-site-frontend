import { Fragment, useEffect, useState } from "react";
import { usePage } from "../hooks/usePage";
import "../tailwind.css";
import PagesItem from "./PagesItem";

// title refers to the title input field
// setTitleInput updates that field
// setTitle updates the title of the page at the top
// of the ui to ("Page Manager")

export default function PageManager() {
    const [pages, setPages] = useState([]);
    const [title, setTitleInput] = useState("");
    const { setTitle, currentAPI, gameId } = usePage();

    useEffect(() => {
        setTitle("Page Manager");
    }, [setTitle]);

    useEffect(() => {
        fetch(currentAPI + "/pages", {
            credentials: "include",
        })
            .then((response) => response.json())
            .then((result) => setPages(result));
    }, []);

    async function createPage(title) {
        if (!title?.trim()) {
            console.log("Error - title cannot be empty");
            return;
        }

        try {
            const response = await fetch(currentAPI + "/pages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ title, gameId: gameId || 1 }),
            });
            if (!response.ok) {
                const data = await response.json();
                console.error("Create page failed:", data);
                return;
            }
            const newPage = await response.json();
            const newPages = [...pages];
            newPages.push(newPage);
            setPages(newPages);
            setTitleInput("");
        } catch (err) {
            console.error("Error", err);
            return;
        }
    }

    function deletePage(id) {
        if (!+id) {
            console.log("Error - Invalid ID " + +id);
            return;
        }

        fetch(currentAPI + "/pages/" + id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(),
        });
    }

    async function updatePageTitle(id, title, index) {
        if (!+id) {
            console.log("Error - Invalid ID " + +id);
            return;
        }

        await fetch(currentAPI + "/pages/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
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

        await fetch(currentAPI + "/pages/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ slug }),
        });

        const newPages = [...pages];
        newPages[index].slug = slug;
        setPages(newPages);
    }

    return (
        <Fragment>
            <div className="mt-4 flex justify-between items-center mx-auto gap-2">
                <form action="" className="flex gap-2 items-center">
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
                            createPage(title);
                        }}
                        className="text-amber-50 bg-(--primary) w-38 rounded px-2 py-0.5 cursor-pointer"
                    >
                        Create Page
                    </button>
                </form>
            </div>
            <ul className="">
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
