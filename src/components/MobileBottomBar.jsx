import { Menu, Pencil, Eye, Settings, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEditMode, useSaving } from "../contexts/EditModeContext.jsx";
import { useDarkMode, useActiveColors } from "../contexts/ThemeProvider.jsx";
import { useRouteLoaderData, useNavigate } from "react-router";
import { useGameEditor } from "../contexts/GameEditorContext.jsx";

function hexLuminance(hex) {
    if (!hex || hex.length < 7) return 0.5;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const lin = c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export default function MobileBottomBar({ toggleNav }) {
    const { user, isAuthenticated } = useAuth();
    const isAdmin = user?.role === "ADMIN";
    const isGlobalEditor = user?.role === "EDITOR";
    const { isPerGameEditor } = useGameEditor();
    const canEdit = isAdmin || isGlobalEditor || isPerGameEditor;
    const { adminMode, setAdminMode, dirtyBlocks, saveAll } = useEditMode();
    const { setIsSaving } = useSaving();
    const { darkMode } = useDarkMode();
    const activeColors = useActiveColors();
    const { gameData, isLDG } = useRouteLoaderData("main");
    const navigate = useNavigate();

    const iconColor = darkMode ? "#e8d5b7" : (hexLuminance(activeColors.primary) < 0.35 ? "var(--accent, #f0e3c3)" : "var(--accent-text, #3a2a1a)");
    const btnBase = "flex items-center justify-center w-12 h-12 rounded-lg cursor-pointer hover:opacity-80 transition-opacity";
    const btnStyle = { background: darkMode ? "rgba(255,235,200,0.10)" : "var(--primary)", color: iconColor };

    function navPanelUrl() {
        if (isLDG || !gameData) return "/navigation-panel";
        return "/games/" + gameData.slug + "/navigation-panel";
    }

    return (
        <div
            className="lg:hidden sticky bottom-0 z-20 flex w-full items-center justify-center gap-3 px-4 py-2 border-t-4 border-(--outline)"
            style={{ background: darkMode ? "#0f0c0a" : "var(--primary)", color: iconColor }}
        >
            {isAdmin && (
                <button
                    onClick={() => navigate(navPanelUrl())}
                    title="Navigation Panel"
                    className={btnBase}
                    style={btnStyle}
                >
                    <Settings className="w-5 h-5" />
                </button>
            )}

            {canEdit && (
                <button
                    onClick={() => {
                        if (adminMode && dirtyBlocks.size > 0) {
                            if (!window.confirm("You have unsaved changes. Exit edit mode anyway?")) return;
                        }
                        setAdminMode(m => !m);
                    }}
                    title={adminMode ? "Exit edit mode" : "Enter edit mode"}
                    className={`${btnBase} ${adminMode ? "ring-2 ring-amber-50/40" : ""}`}
                    style={btnStyle}
                >
                    {adminMode ? <Eye className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                </button>
            )}

            {adminMode && dirtyBlocks.size > 0 && saveAll && (
                <button
                    onClick={async () => {
                        setIsSaving(true);
                        try { await saveAll(); } finally { setIsSaving(false); }
                    }}
                    title={`Save (${dirtyBlocks.size})`}
                    className={btnBase}
                    style={{ ...btnStyle, background: "rgba(21,128,61,0.7)" }}
                >
                    <Save className="w-5 h-5" />
                </button>
            )}

            <button onClick={toggleNav} className={btnBase} style={btnStyle}>
                <Menu className="w-6 h-6" />
            </button>
        </div>
    );
}
