import { createContext, useContext, useState } from "react";

const PageContext = createContext(null);

export function PageProvider({ children }) {
    const [title, setTitle] = useState("test");
    const serverAPI = "https://guide-site-backend.onrender.com";
    const localAPI = "http://localhost:3000";
    const currentAPI = localAPI;

    return (
        <PageContext.Provider value={{ title, setTitle, currentAPI }}>
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
