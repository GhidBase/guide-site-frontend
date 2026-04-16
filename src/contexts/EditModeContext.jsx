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
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 9999,
                            background: "rgba(0,0,0,0.45)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            pointerEvents: "all",
                        }}
                    >
                        <div
                            style={{
                                background: "var(--accent, #1e1e1e)",
                                color: "var(--accent-text, #fff)",
                                borderRadius: "12px",
                                padding: "1.5rem 2.5rem",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "0.75rem",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                            }}
                        >
                            <svg
                                width="36"
                                height="36"
                                viewBox="0 0 36 36"
                                fill="none"
                                style={{ animation: "spin 0.8s linear infinite" }}
                            >
                                <circle cx="18" cy="18" r="14" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
                                <path d="M32 18a14 14 0 0 0-14-14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            </svg>
                            <span style={{ fontWeight: 600, fontSize: "1rem" }}>Saving…</span>
                        </div>
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
