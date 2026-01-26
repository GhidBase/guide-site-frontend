import { createContext, useContext, useState, useEffect } from "react";
import { useParams } from "react-router";

const PageContext = createContext(null);

export function PageProvider({ children }) {
    const [title, setTitle] = useState("");
    const [gameId, setGameId] = useState(1);
    const serverAPI = "https://guide-site-backend.onrender.com";
    const localAPI = "http://localhost:3000";
    const currentAPI =
        import.meta.env.VITE_SERVER == "LOCAL" ? localAPI : serverAPI;
    const currentAPIgames = currentAPI + "/games/" + gameId;

    const [gameSlug, setGameSlug] = useState();
    console.log(gameSlug);

    // Create a useEffect that uses gameSlug as a
    // dependency
    useEffect(() => {
        async function fetchGameByTitle() {
            const response = await fetch(
                currentAPI + "/games/by-slug/" + gameSlug,
            );
            const game = await response.json();
            const gameId = game.id;
            setGameId(gameId);
            console.log("game found");
            console.log(game);
            console.log(gameId);
        }
        fetchGameByTitle();
    }, [gameSlug]);

    return (
        <PageContext.Provider
            value={{
                title,
                setTitle,
                currentAPI,
                gameId,
                setGameId,
                currentAPIgames,
                gameSlug,
                setGameSlug,
            }}
        >
            {children}
        </PageContext.Provider>
    );
}

export function usePage() {
    const context = useContext(PageContext);

    if (!context) {
        throw new Error("usePage must be used within a PageProvider");
    }

    return context;
}
