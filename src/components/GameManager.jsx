import { useEffect, useState, Fragment } from "react";
import GameItem from "./GameItem";
import { currentAPI } from "../config/api.js";

export default function GameManager() {
    const [games, setGames] = useState([]);
    const [titleInput, setTitleInput] = useState("");

    useEffect(() => {
        fetch(currentAPI + "/games/")
            .then((response) => response.json())
            .then((result) => setGames(result));
    }, [currentAPI]);

    async function createGame(title) {
        console.log("Create game");
        if (!title?.trim()) {
            console.log("Error - title cannot be empty");
            return;
        }

        try {
            await fetch(currentAPI + "/games", {
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
    }

    return (
        <Fragment>
            <div className="mt-4 flex justify-between items-center mx-auto gap-2">
                <h1 className="">Games:</h1>
                <input
                    type="text"
                    name="title"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="bg-(--red-brown) min-w-0 text-white px-2 box-border rounded ml-auto"
                    placeholder="Game Title"
                />

                <button
                    type="submit"
                    onClick={(e) => {
                        e.preventDefault();
                        createGame(titleInput);
                    }}
                    className="text-amber-50 bg-(--primary) w-38 rounded px-2 py-0.5"
                >
                    Add Game
                </button>
            </div>
            <ul>
                {games.map((game) => {
                    return (
                        <GameItem
                            title={game.title}
                            slug={game.slug}
                            id={game.id}
                            key={game.id}
                        />
                    );
                })}
            </ul>
        </Fragment>
    );
}
