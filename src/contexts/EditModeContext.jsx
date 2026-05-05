import { createContext, useContext, useState } from "react";

const EditModeContext = createContext(null);
const SavingContext = createContext(null);

export function EditModeProvider({ children }) {
    const [adminMode, setAdminMode] = useState(false);
    const [dirtyBlocks, setDirtyBlocks] = useState(new Set());
    const [saveAll, setSaveAll] = useState(null); // () => async fn registered by PageBuilder
    const [isSaving, setIsSaving] = useState(false);

    return (
        <EditModeContext.Provider value={{ adminMode, setAdminMode, dirtyBlocks, setDirtyBlocks, saveAll, setSaveAll }}>
            <SavingContext.Provider value={{ isSaving, setIsSaving }}>
                {isSaving && (
                    <div style={{
                        position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
                        zIndex: 9999, pointerEvents: "none",
                        display: "flex", alignItems: "center", gap: "0.6rem",
                        background: "rgba(10, 20, 12, 0.92)",
                        border: "1px solid rgba(74, 222, 128, 0.25)",
                        borderRadius: "8px",
                        padding: "0.55rem 1rem",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(74,222,128,0.08)",
                        backdropFilter: "blur(12px)",
                        color: "rgba(74, 222, 128, 0.9)",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        letterSpacing: "0.01em",
                        whiteSpace: "nowrap",
                    }}>
                        <style>{`@keyframes saving-spin { to { transform: rotate(360deg); } }`}</style>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: "saving-spin 0.8s linear infinite", flexShrink: 0 }}>
                            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
                            <path d="M12.5 7a5.5 5.5 0 0 0-5.5-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Saving…
                    </div>
                )}
                {children}
            </SavingContext.Provider>
        </EditModeContext.Provider>
    );
}

export function useEditMode() {
    return useContext(EditModeContext);
}

export function useSaving() {
    return useContext(SavingContext);
}
