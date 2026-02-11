import { currentAPI } from "../config/api";
import { Fragment, useEffect, useState } from "react";
import PagesItem from "./PagesItem";
import { useRouteLoaderData } from "react-router";
const secret = import.meta.env.VITE_SECRET;

// title refers to the title input field
// setTitleInput updates that field

export default function PageManager() {
    const [pages, setPages] = useState([]);
    const { gameData, sectionsMap } = useRouteLoaderData("main");
    const gameId = gameData?.id;
    const [title, setTitleInput] = useState("");
    const [selectedSection, setSelectedSection] = useState("");

    // Get Pages
    useEffect(() => {
        if (!gameId) {
            fetch(currentAPI + "/games/" + gameId + "/pages")
                .then((response) => response.json())
                .then((result) => setPages(result));
            return;
        } else {
            fetch(currentAPI + "/games/" + gameId + "/pages")
                .then((response) => response.json())
                .then((result) => setPages(result));
            return;
        }
    }, [currentAPI, gameId]);

    async function createPage() {
        if (!title?.trim()) {
            console.log("Error - title cannot be empty");
            return;
        }

        try {
            const body = { title };
            
            // Only add sectionId if a section is selected (not "none" and not empty string)
            if (selectedSection && selectedSection !== "none" && selectedSection !== "" && !isNaN(Number(selectedSection))) {
                body.sectionId = Number(selectedSection);
            }

            const response = await fetch(currentAPI + "/games/" + gameId + "/pages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Secret": import.meta.env.VITE_SECRET,
                },
                body: JSON.stringify(body),
            });

            const newPage = await response.json();
            setPages([...pages, newPage]);
            setTitleInput("");
            setSelectedSection("");
        } catch (err) {
            console.error("Error", err);
        }
    }

    function deletePage(id) {
        if (!+id) return;

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
        if (!+id) return;

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
        if (!+id) return;

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

    async function updatePageSort(id, sort, index) {
        if (!+id) return;

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
                <form className="flex gap-2 items-center">
                    <h1>Pages:</h1>

                    <input
                        type="text"
                        className="bg-(--red-brown) text-white px-2 rounded"
                        onChange={(e) => setTitleInput(e.target.value)}
                        value={title}
                        placeholder="Page Title"
                    />

                    <select
                        className="bg-(--red-brown) text-white px-2 py-1 rounded"
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                    >
                        <option value="">Select section (optional)</option>
                        {Array.from(sectionsMap.values()).map((section) => (
                            <option key={section.id} value={section.id}>
                                {section.title}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        onClick={(e) => {
                            e.preventDefault();
                            createPage();
                        }}
                        className="text-amber-50 bg-(--primary) px-2 py-1 rounded"
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
                            updatePageSort={updatePageSort}
                        />
                    );
                })}
            </ul>
        </Fragment>
    );
}