import menuIcon from "../assets/menu.svg";
import { Pencil, Eye, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEditMode } from "../contexts/EditModeContext.jsx";
import { useDarkMode } from "../contexts/ThemeProvider.jsx";
import { useRouteLoaderData, useNavigate } from "react-router";

export default function MobileBottomBar({ toggleNav }) {
    const { user, isAuthenticated } = useAuth();
    const isAdmin = user?.role === "ADMIN";
    const isContributor = isAuthenticated && !isAdmin;
    const { adminMode, setAdminMode, dirtyBlocks } = useEditMode();
    const { darkMode } = useDarkMode();
    const { gameData, isLDG } = useRouteLoaderData("main");
    const navigate = useNavigate();

    const btnBase = "flex items-center justify-center w-12 h-12 rounded-lg cursor-pointer hover:opacity-80 transition-opacity";
    const btnStyle = { background: darkMode ? "rgba(255,235,200,0.10)" : "var(--primary)" };

    function navPanelUrl() {
        if (isLDG) return "/navigation-panel";
        return "/games/" + gameData?.slug + "/navigation-panel";
    }

    return (
        <div
            className="lg:hidden sticky bottom-0 z-20 flex w-full items-center justify-center gap-3 px-4 py-2 border-t-4 border-(--outline)"
            style={{ background: darkMode ? "#0f0c0a" : "var(--red-brown)" }}
        >
            {isAdmin && (
                <button
                    onClick={() => navigate(navPanelUrl())}
                    title="Navigation Panel"
                    className={btnBase}
                    style={btnStyle}
                >
                    <Settings className="w-5 h-5 text-amber-50" />
                </button>
            )}

            {(isAdmin || isContributor) && (
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
                    {adminMode ? <Eye className="w-5 h-5 text-amber-50" /> : <Pencil className="w-5 h-5 text-amber-50" />}
                </button>
            )}

            <button onClick={toggleNav} className={btnBase} style={btnStyle}>
                <img src={menuIcon} className="h-6 w-6" alt="Menu" style={darkMode ? { filter: "brightness(0) invert(1)" } : undefined} />
            </button>
        </div>
    );
}
