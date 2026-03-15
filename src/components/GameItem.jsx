import { useState, Fragment, useEffect } from "react";
import { currentAPI } from "../config/api.js";

export default function GameItem({ title, slug, id }) {
    const [slugInput, setSlugInput] = useState(slug);
    const [editMode, setEditMode] = useState(false);
    const [hasHomepage, setHasHomepage] = useState(null);
    const [creatingHomepage, setCreatingHomepage] = useState(false);

    useEffect(() => {
        fetch(currentAPI + "/games/" + id + "/pages")
            .then((r) => r.json())
            .then((pages) => setHasHomepage(pages.some((p) => p.slug === slug)));
    }, [id, slug]);

    function toggleEditMode() {
        setEditMode(!editMode);
    }

    function updateGameSlug() {
        fetch(currentAPI + "/games/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ slug: slugInput, title }),
        });
    }

    async function createHomepage() {
        setCreatingHomepage(true);
        try {
            const res = await fetch(currentAPI + "/games/" + id + "/pages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ title }),
            });
            if (!res.ok) {
                console.error("Failed to create page:", await res.text());
                return;
            }
            const page = await res.json();
            await fetch(currentAPI + "/games/" + id + "/pages/by-id/" + page.id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ slug }),
            });
            setHasHomepage(true);
        } catch (err) {
            console.error("Failed to create homepage:", err);
        } finally {
            setCreatingHomepage(false);
        }
    }

    return (
        <li className="mt-4 gap-2 w-full flex items-center">
            <div>{title}</div>
            {!editMode && <div className="ml-auto">{slug}</div>}
            {editMode && (
                <input
                    type="text"
                    name=""
                    value={slugInput}
                    className="bg-(--red-brown) min-w-0 px-2 text-white box-border rounded flex-1 max-w-100 mr-2 ml-auto"
                    onChange={(e) => setSlugInput(e.target.value)}
                />
            )}

            {hasHomepage === true && (
                <a
                    href={"/games/" + slug}
                    className="mr-2 text-amber-50 bg-(--primary) w-38 rounded px-2 py-0.5 text-center"
                >
                    Go to Homepage
                </a>
            )}
            {hasHomepage === false && (
                <button
                    onClick={creatingHomepage ? undefined : createHomepage}
                    disabled={creatingHomepage}
                    className="mr-2 text-amber-50 bg-(--primary) w-38 rounded px-2 py-0.5 disabled:opacity-50 cursor-pointer"
                >
                    {creatingHomepage ? "Creating…" : "Create Homepage"}
                </button>
            )}

            {!editMode && (
                <button
                    onClick={() => toggleEditMode()}
                    className="mr-2 text-amber-50 bg-(--primary) w-30 rounded px-2 py-0.5"
                >
                    Change Url
                </button>
            )}

            {editMode && (
                <Fragment>
                    <button
                        onClick={() => updateGameSlug()}
                        className="mr-2 text-amber-50 bg-(--primary) w-30 rounded px-2 py-0.5"
                    >
                        Save
                    </button>
                    <button type=""></button>
                </Fragment>
            )}
        </li>
    );
}
