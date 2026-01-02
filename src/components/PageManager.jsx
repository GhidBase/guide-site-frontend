import "../tailwind.css";
import { Fragment, useEffect, useState } from "react";
import PagesItem from "./PagesItem";
import { usePage } from "../contexts/PageProvider";

// title refers to the title input field
// setTitleInput updates that field
// setTitle updates the title of the page at the top
// of the ui to ("Page Manager")

export default function PageManager() {
    const [pages, setPages] = useState([]);
    const [title, setTitleInput] = useState("");
    const { currentAPI, setTitle } = usePage();
    setTitle("Page Manager");

    useEffect(() => {
        fetch(currentAPI + "/pages")
            .then((response) => response.json())
            .then((result) => setPages(result));
    }, []);

    async function createPage(title) {
        if (!title?.trim()) {
            console.log("Error - title cannot be empty");
            return;
        }

        let response;
        try {
            response = await fetch(currentAPI + "/pages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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

    function deletePage(id) {
        if (!+id) {
            console.log("Error - Invalid ID " + +id);
            return;
        }

        fetch(currentAPI + "/pages/" + id, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
        });

        const newPages = [...pages];
        newPages[index].title = title;
        setPages(newPages);
    }

    const isAdmin = true;

    return (
        <Fragment>
            <div className="mt-4 flex justify-between items-center mx-auto gap-2">
                <h1 className="">Pages:</h1>
                <form action="" className="flex gap-2">
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
                        className="text-amber-50 bg-(--primary) w-38 rounded px-2 py-0.5"
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
                        />
                    );
                })}
            </ul>
        </Fragment>
    );
}
