import { Link, useRouteLoaderData } from "react-router";
import { useDarkMode } from "../contexts/ThemeProvider.jsx";

export default function NotFound() {
    const { gameData, isLDG } = useRouteLoaderData("main") ?? {};
    const { darkMode } = useDarkMode();
    const homeUrl = gameData ? (isLDG ? "/" : `/games/${gameData.slug}`) : "/";
    const label = gameData ? `Back to ${gameData.title}` : "Back to GuideCodex";

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-(--text-color)">
            <h1 className="text-6xl font-bold opacity-30">404</h1>
            <p className="text-lg font-medium">This page doesn't exist.</p>
            <Link
                to={homeUrl}
                className="mt-2 px-4 py-2 text-amber-50 rounded font-medium hover:opacity-90 transition-opacity"
                style={{ background: darkMode ? "rgba(255,235,200,0.12)" : "var(--primary)" }}
            >
                {label}
            </Link>
        </div>
    );
}
