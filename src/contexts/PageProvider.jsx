import { useState } from "react";
import { PageContext } from "./PageContext";

export function PageProvider({ children }) {
    const [title, setTitle] = useState("");
    const [gameId, setGameId] = useState(1);
    const currentAPI = import.meta.env.VITE_API_URL;

    return (
        <PageContext.Provider
            value={{
                title,
                setTitle,
                currentAPI,
                gameId,
                setGameId,
            }}
        >
            {children}
        </PageContext.Provider>
    );
}
