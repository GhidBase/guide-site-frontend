import { createContext, useContext, useState, useEffect } from "react";
import { useParams } from "react-router";

const PageContext = createContext(null);

export function PageProvider({ children }) {
    // set from pageBuilder
    const [title, setTitle] = useState("");

    const [gameId, setGameId] = useState();
    const serverAPI = "https://guide-site-backend.onrender.com";
    const localAPI = "http://localhost:3000";
    const currentAPI =
        import.meta.env.VITE_SERVER == "LOCAL" ? localAPI : serverAPI;
    const currentAPIgames = currentAPI + "/games/" + gameId;

    const { gameSlug } = useParams();
    const gameBasePath = gameId == undefined ? "" : "/" + gameSlug;

    console.log(gameBasePath);
    console.log(title);
    console.log(gameSlug);

    function checkIsRootHomepage() {
        return !gameId && !gameSlug && !title;
    }

    const isRootHomepage = checkIsRootHomepage();

    useEffect(() => {
        console.log("useEffect begin");
        // This is what runs to try and locate a gameId
        // a lack of matching gameId to the gameSlug is
        // a sign that the gameSlug may just be a pageSlug
        // for a non game

        console.log("gameSlug: " + gameSlug);
        async function fetchGameBySlug() {
            if (gameSlug == undefined) {
                return;
            }
            console.log("Performing the gameId fetch");
            const response = await fetch(
                currentAPI + "/games/by-slug/" + gameSlug,
            );
            if (response.status === 404) {
                setGameId(null);
            } else {
                const result = await response.json();
                console.log(result);
                setGameId(result.Id);
            }
        }
        fetchGameBySlug();
    }, [gameSlug]);

    return (
        <PageContext.Provider
            value={{
                title,
                setTitle,
                currentAPI,
                gameId,
                currentAPIgames,
                gameSlug,
                isRootHomepage,
                gameBasePath,
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
