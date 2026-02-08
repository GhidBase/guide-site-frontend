import { currentAPI } from "../config/api";
import { Fragment, useEffect, useState } from "react";
import PagesItem from "./PagesItem";
import { useRouteLoaderData } from "react-router";
const secret = import.meta.env.VITE_SECRET;
import { getNavbarMap, onHydrateNavbar } from "@/stores/navbarStore";

// title refers to the title input field
// setTitleInput updates that field

export default function PageManager() {
    const [pages, setPages] = useState([]);
    const { gameData } = useRouteLoaderData("main");
    const gameId = gameData?.id;
    const [title, setTitleInput] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [, forceRender] = useState(0);
    const navbarMap = getNavbarMap();

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

    // Rerender navbar - can probably adjust this
    useEffect(() => {
        const unsubscribe = onHydrateNavbar(() => {
            forceRender((x) => x + 1);
        });
        return unsubscribe;
    }, []);

    async function createPage() {
        if (!title?.trim()) {
            console.log("Error - title cannot be empty");
            return;
        }

        if (!selectedSection || isNaN(Number(selectedSection))) {
            console.log("Error - invalid section");
            return;
        }

        console.log(title, "is the title");
        console.log(Number(selectedSection), "is the sectionID");

        let response;
        try {
            response = await fetch(currentAPI + "/games/" + gameId + "/pages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Secret": import.meta.env.VITE_SECRET,
                },
                body: JSON.stringify({
                    title,
                    sectionId: Number(selectedSection),
                }),
            });
        } catch (err) {
            console.error("Error", err);
            return;
        }

        const newPage = await response.json();
        setPages([...pages, newPage]);
        setTitleInput("");
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

    async function changePageSection(pageId, newSectionId) {
        if (!pageId || !newSectionId) return;

        try {
            await fetch(currentAPI + "/sections/" + pageId, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Secret": secret,
                },
                body: JSON.stringify({ sectionId: Number(newSectionId) }),
            });

            const pageIndex = pages.findIndex((p) => p.id === pageId);
            if (pageIndex !== -1) {
                const newPages = [...pages];
                newPages[pageIndex].sectionId = Number(newSectionId);
                setPages(newPages);
            }

            forceRender((x) => x + 1);
        } catch (err) {
            console.error("Failed to change page section:", err);
        }
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
                        className="bg-gray-900 text-white px-2 py-1 rounded"
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                    >
                        <option value="">Select section</option>
                        {Array.from(navbarMap.values()).map((section) => (
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
                        />
                    );
                })}
            </ul>

            <div className="mt-4">
                <h2 className="text-lg font-bold mb-2">Sections</h2>

                <table className="w-full border border-gray-700">
                    <thead>
                        <tr className="bg-gray-800">
                            <th className="p-2 text-left">Section</th>
                            <th className="p-2 text-left">Pages</th>
                            <th className="p-2 text-left">Move Page</th>
                        </tr>
                    </thead>

                    <tbody>
                        {Array.from(navbarMap.values()).map((section) => (
                            <tr
                                key={section.id}
                                className="border-t border-gray-700"
                            >
                                <td className="p-2">{section.title}</td>
                                <td className="p-2">
                                    {section.pages.map((page) => (
                                        <div key={page.id} className="mb-1">
                                            {page.title}
                                        </div>
                                    ))}
                                </td>
                                <td className="p-2">
                                    {section.pages.map((page) => (
                                        <div
                                            key={page.id}
                                            className="mb-1 flex gap-2 items-center"
                                        >
                                            <select
                                                className="bg-gray-900 text-white px-2 py-1 rounded"
                                                onChange={(e) =>
                                                    changePageSection(
                                                        page.id,
                                                        e.target.value,
                                                    )
                                                }
                                                defaultValue=""
                                            >
                                                <option value="">
                                                    Move to...
                                                </option>
                                                {Array.from(navbarMap.values())
                                                    .filter(
                                                        (s) =>
                                                            s.id !== section.id,
                                                    )
                                                    .map((s) => (
                                                        <option
                                                            key={s.id}
                                                            value={s.id}
                                                        >
                                                            {s.title}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    ))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Fragment>
    );
}
