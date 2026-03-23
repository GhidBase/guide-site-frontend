import { useLoaderData } from "react-router";
import { currentAPI } from "../../src/config/api";
import { useState } from "react";
import { redirect } from "react-router";

export async function loader({ params, request }) {
    const { gameSlug } = params;
    const isLDG = new URL(request.url).hostname.includes("luckydefenseguides");
    const effectiveSlug = gameSlug ?? (isLDG ? "lucky-defense" : null);

    let analyticsUrl;
    if (effectiveSlug) {
        const game = await fetch(`${currentAPI}/games/by-slug/${effectiveSlug}`).then((r) => r.json());
        if (!game?.id) throw redirect("/");
        analyticsUrl = `${currentAPI}/games/${game.id}/pages/analytics`;
    } else {
        analyticsUrl = `${currentAPI}/pages/analytics`;
    }

    const res = await fetch(analyticsUrl, { headers: { cookie: request.headers.get("cookie") ?? "" } });
    if (res.status === 403) throw redirect("/access-denied");
    const data = await res.json();
    return data;
}

export default function AnalyticsPage() {
    const { pages, users } = useLoaderData();
    const [tab, setTab] = useState("pages");

    const totalViews = pages.reduce((sum, p) => sum + p.views, 0);

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 text-(--text-color)">
            <h1 className="text-2xl font-bold mb-1">Analytics</h1>
            <p className="text-sm opacity-60 mb-6">{totalViews.toLocaleString()} total views across {pages.length} pages</p>

            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setTab("pages")}
                    className={`px-4 py-1.5 rounded text-sm font-medium ${tab === "pages" ? "bg-(--accent) text-(--accent-text)" : "opacity-60 hover:opacity-100"}`}
                >
                    Pages
                </button>
                <button
                    onClick={() => setTab("users")}
                    className={`px-4 py-1.5 rounded text-sm font-medium ${tab === "users" ? "bg-(--accent) text-(--accent-text)" : "opacity-60 hover:opacity-100"}`}
                >
                    Creators
                </button>
            </div>

            {tab === "pages" && (
                <div className="flex flex-col gap-1">
                    {pages.map((page, i) => (
                        <div key={page.id} className="flex items-center gap-3 px-3 py-2 rounded bg-(--accent)">
                            <span className="text-xs opacity-40 w-6 text-right shrink-0">{i + 1}</span>
                            <span className="flex-1 truncate text-sm text-(--accent-text)">{page.title}</span>
                            {page.claimedBy && (
                                <span className="text-xs opacity-50 shrink-0">@{page.claimedBy.username}</span>
                            )}
                            <span className="text-sm font-mono font-semibold shrink-0">{page.views.toLocaleString()}</span>
                        </div>
                    ))}
                    {pages.length === 0 && <p className="text-sm opacity-50">No pages yet.</p>}
                </div>
            )}

            {tab === "users" && (
                <div className="flex flex-col gap-1">
                    {users.map((u, i) => (
                        <div key={u.id} className="flex items-center gap-3 px-3 py-2 rounded bg-(--accent)">
                            <span className="text-xs opacity-40 w-6 text-right shrink-0">{i + 1}</span>
                            <span className="flex-1 text-sm text-(--accent-text) font-medium">@{u.username}</span>
                            <span className="text-xs opacity-50 shrink-0">{u.pageCount} page{u.pageCount !== 1 ? "s" : ""}</span>
                            <span className="text-sm font-mono font-semibold shrink-0">{u.views.toLocaleString()}</span>
                        </div>
                    ))}
                    {users.length === 0 && <p className="text-sm opacity-50">No claimed pages yet.</p>}
                </div>
            )}
        </div>
    );
}
