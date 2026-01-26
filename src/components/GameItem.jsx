import { useState, Fragment } from "react";
import { usePage } from "../contexts/PageProvider";

export default function GameItem({ title, slug, id }) {
    const { currentAPI } = usePage();
    const [slugInput, setSlugInput] = useState(slug);
    const [editMode, setEditMode] = useState(false);
    function toggleEditMode() {
        setEditMode(!editMode);
    }

    function updateGameSlug() {
        console.log("changing game slug");

        fetch(currentAPI + "/games/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Admin-Secret": import.meta.env.VITE_SECRET,
            },
            body: JSON.stringify({ slug: slugInput, title }),
        });
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
