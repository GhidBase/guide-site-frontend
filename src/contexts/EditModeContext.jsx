import { createContext, useContext, useState } from "react";

const EditModeContext = createContext(null);

export function EditModeProvider({ children }) {
    const [adminMode, setAdminMode] = useState(false);
    const [dirtyBlocks, setDirtyBlocks] = useState(new Set());
    const [saveAll, setSaveAll] = useState(null); // () => async fn registered by PageBuilder

    return (
        <EditModeContext.Provider value={{ adminMode, setAdminMode, dirtyBlocks, setDirtyBlocks, saveAll, setSaveAll }}>
            {children}
        </EditModeContext.Provider>
    );
}

export function useEditMode() {
    return useContext(EditModeContext);
}
