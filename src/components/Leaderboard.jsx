import { useState, useEffect } from "react";
import { useRouteLoaderData, useLoaderData } from "react-router";
import { currentAPI } from "../config/api";

const MEDALS = ["🥇", "🥈", "🥉"];

const PERIODS = [
    { label: "All Time", since: null },
    { label: "This Month", since: () => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d.toISOString(); } },
    { label: "This Week",  since: () => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d.toISOString(); } },
];

export default function Leaderboard() {
    const { gameData } = useRouteLoaderData("main");
    const { leaderboardGlobal, leaderboardGame } = useLoaderData();
    const gameId = gameData?.id;
    const gameName = gameData?.title;

    const [scope, setScope] = useState(gameData ? "game" : "global");
    const [metric, setMetric] = useState("contributions");
    const [periodIdx, setPeriodIdx] = useState(0);
    const [expanded, setExpanded] = useState(new Set());

    const [viewData, setViewData] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    useEffect(() => {
        if (metric !== "views") return;
        setViewLoading(true);
        setViewData(null);

        const since = PERIODS[periodIdx].since ? PERIODS[periodIdx].since() : null;
        const sinceParam = since ? `?since=${encodeURIComponent(since)}` : "";

        const gameUrl  = gameId  ? `${currentAPI}/games/${gameId}/pages/view-leaderboard${sinceParam}` : null;
        const globalUrl = `${currentAPI}/pages/view-leaderboard${sinceParam}`;

        Promise.all([
            gameUrl ? fetch(gameUrl).then((r) => r.json()) : Promise.resolve(null),
            fetch(globalUrl).then((r) => r.json()),
        ]).then(([game, global]) => {
            setViewData({ game, global });
            setViewLoading(false);
        }).catch(() => setViewLoading(false));
    }, [metric, periodIdx, gameId]);

    const contribEntries = scope === "game" ? leaderboardGame : leaderboardGlobal;
    const viewEntries    = scope === "game" ? viewData?.game  : viewData?.global;

    const entries = metric === "contributions" ? contribEntries : viewEntries;
    const loading  = metric === "views" && viewLoading;

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-(--accent-text) mb-2">Leaderboard</h1>
            <p className="text-(--text-color) mb-1">
                These are the players who've helped build this site — writing guides, filling in details, and sharing what they know so others can learn faster.
            </p>
            <p className="text-(--text-color) mb-6">
                Anyone with an account can suggest edits or contribute to any page. Your contributions get reviewed and, once accepted, your name appears here.{" "}
                <a href="/signup" className="underline font-semibold text-(--accent-text) hover:opacity-80">Create an account</a> to get started.
            </p>

            {/* Scope tabs */}
            <div className="flex gap-2 mb-3">
                {gameName && (
                    <button
                        onClick={() => setScope("game")}
                        className={`px-4 py-1.5 rounded font-semibold text-sm cursor-pointer ${scope === "game" ? "bg-(--primary) text-white" : "bg-(--accent) text-(--accent-text) hover:opacity-80"}`}
                    >
                        {gameName}
                    </button>
                )}
                <button
                    onClick={() => setScope("global")}
                    className={`px-4 py-1.5 rounded font-semibold text-sm cursor-pointer ${scope === "global" ? "bg-(--primary) text-white" : "bg-(--accent) text-(--accent-text) hover:opacity-80"}`}
                >
                    All Games
                </button>
            </div>

            {/* Metric + period row */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                <button
                    onClick={() => setMetric("contributions")}
                    className={`px-3 py-1 rounded text-sm cursor-pointer ${metric === "contributions" ? "bg-(--accent) text-(--accent-text) font-semibold" : "opacity-50 hover:opacity-80"}`}
                >
                    Contributions
                </button>
                <button
                    onClick={() => setMetric("views")}
                    className={`px-3 py-1 rounded text-sm cursor-pointer ${metric === "views" ? "bg-(--accent) text-(--accent-text) font-semibold" : "opacity-50 hover:opacity-80"}`}
                >
                    Page Views
                </button>

                {metric === "views" && (
                    <div className="flex gap-1 ml-auto">
                        {PERIODS.map((p, i) => (
                            <button
                                key={p.label}
                                onClick={() => setPeriodIdx(i)}
                                className={`px-2.5 py-1 rounded text-xs cursor-pointer ${periodIdx === i ? "bg-(--primary) text-white font-semibold" : "bg-(--accent) text-(--accent-text) hover:opacity-80"}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {loading && <p className="text-(--text-color) italic">Loading...</p>}

            {!loading && entries && entries.length === 0 && (
                <p className="text-(--text-color) italic">No data yet.</p>
            )}

            {!loading && entries && entries.length > 0 && (
                <div className="flex flex-col gap-2">
                    {entries.map((entry, i) => {
                        const isExpanded = expanded.has(entry.id);
                        const medal = MEDALS[i];
                        const stat = metric === "contributions"
                            ? `${entry.contributions} ${entry.contributions === 1 ? "contribution" : "contributions"}`
                            : `${Number(entry.views).toLocaleString()} ${Number(entry.views) === 1 ? "view" : "views"}`;

                        return (
                            <div key={entry.id} className="bg-(--accent) rounded border border-(--outline)/30">
                                <div
                                    className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                                    onClick={() =>
                                        setExpanded((prev) => {
                                            const next = new Set(prev);
                                            isExpanded ? next.delete(entry.id) : next.add(entry.id);
                                            return next;
                                        })
                                    }
                                >
                                    <span className="w-8 text-center font-bold text-(--text-color)">{medal ?? `#${i + 1}`}</span>
                                    <span className="flex-1 font-semibold text-(--accent-text)">{entry.username}</span>
                                    <span className="text-sm text-(--text-color)">{stat}</span>
                                    {metric === "contributions" && scope === "global" && entry.byGame?.length > 0 && (
                                        <span className="text-xs text-(--text-color)">{isExpanded ? "▲" : "▼"}</span>
                                    )}
                                </div>
                                {metric === "contributions" && scope === "global" && isExpanded && entry.byGame?.length > 0 && (
                                    <div className="border-t border-(--outline)/30 px-4 py-2 flex flex-col gap-1">
                                        {entry.byGame.map((g) => (
                                            <div key={g.gameId} className="flex justify-between text-sm text-(--text-color)">
                                                <span>{g.title}</span>
                                                <span>{g.contributions} {g.contributions === 1 ? "contribution" : "contributions"}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
