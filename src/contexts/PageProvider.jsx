import { createContext, useContext, useState, useEffect } from "react";

const PageContext = createContext(null);

export function PageProvider({ children }) {
    const [title, setTitle] = useState("");
    const [gameId, setGameId] = useState();
    const serverAPI = "https://guide-site-backend.onrender.com";
    const localAPI = "http://localhost:3000";
    const currentAPI =
        import.meta.env.VITE_SERVER == "LOCAL" ? localAPI : serverAPI;
    const currentAPIgames = currentAPI + "/games/" + gameId;

    const [gameSlug, setGameSlug] = useState();

    // Create a useEffect that uses gameSlug as a
    // dependency
    useEffect(() => {
        async function fetchGameByTitle() {
            let game, gameId;
            if (gameSlug == undefined) {
                return;
            }
            const response = await fetch(
                currentAPI + "/games/by-slug/" + gameSlug,
            );
            if (response.status === 404) {
                setGameId(null);
            } else {
                game = await response.json();
                gameId = game.id;
                setGameId(gameId);
            }
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
