import { createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGameEditors } from "../hooks/useGameEditors.js";

const GameEditorContext = createContext({ isPerGameEditor: false });

export function GameEditorProvider({ gameId, children }) {
    const { user } = useAuth();
    const { editors } = useGameEditors(gameId);
    const isPerGameEditor = !!user && !!gameId && editors.some((e) => e.id === user.id);

    return (
        <GameEditorContext.Provider value={{ isPerGameEditor }}>
            {children}
        </GameEditorContext.Provider>
    );
}

export function useGameEditor() {
    return useContext(GameEditorContext);
}
