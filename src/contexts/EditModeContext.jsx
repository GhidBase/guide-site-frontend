import { createContext, useContext, useState } from "react";

const EditModeContext = createContext(null);

export function EditModeProvider({ children }) {
    const [adminMode, setAdminMode] = useState(false);
    const [dirtyBlocks, setDirtyBlocks] = useState(new Set());

    return (
        <EditModeContext.Provider value={{ adminMode, setAdminMode, dirtyBlocks, setDirtyBlocks }}>
            {children}
        </EditModeContext.Provider>
    );
}

export function useEditMode() {
    return useContext(EditModeContext);
}
