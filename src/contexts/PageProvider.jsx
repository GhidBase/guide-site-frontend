import { createContext, useContext, useState, useEffect } from "react";
import { useParams } from "react-router";
import { currentAPI } from "../config/api.js";

const PageContext = createContext(null);

export function PageProvider({ children }) {
    // set from pageBuilder

    const [gameId, setGameId] = useState();
    const currentAPIgames = currentAPI + "/games/" + gameId;

    const { gameSlug } = useParams();
    const gameBasePath = gameId == undefined ? "" : "/" + gameSlug;

    useEffect(() => {
        // This is what runs to try and locate a gameId
        // a lack of matching gameId to the gameSlug is
        // a sign that the gameSlug may just be a pageSlug
        // for a non game

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
                currentAPI,
                gameId,
                currentAPIgames,
                gameSlug,
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
