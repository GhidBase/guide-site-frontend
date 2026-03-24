import { useState, useEffect } from "react";
import { useRouteLoaderData, useLoaderData } from "react-router";
import { currentAPI } from "../config/api";

const MEDALS = ["🥇", "🥈", "🥉"];

const PERIODS = [
    { label: "All Time" },
    { label: "This Month" },
    { label: "This Week" },
    { label: "Custom" },
];

function getPeriodRange(periodIdx, customMode, customDate, customFrom, customTo) {
    if (periodIdx === 1) {
        const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0);
        return { since: d.toISOString(), until: null };
    }
    if (periodIdx === 2) {
        const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0);
        return { since: d.toISOString(), until: null };
    }
    if (periodIdx === 3) {
        if (customMode === "day" && customDate) {
            const from = new Date(customDate + "T00:00:00");
            const to = new Date(from);
            to.setDate(to.getDate() + 1);
            return { since: from.toISOString(), until: to.toISOString() };
        }
        if (customMode === "range" && customFrom) {
            const from = new Date(customFrom + "T00:00:00");
            let until = null;
            if (customTo) {
                const t = new Date(customTo + "T00:00:00");
                t.setDate(t.getDate() + 1);
                until = t.toISOString();
            }
            return { since: from.toISOString(), until };
        }
    }
    return { since: null, until: null };
}

export default function Leaderboard() {
    const { gameData } = useRouteLoaderData("main");
    const { leaderboardGlobal, leaderboardGame } = useLoaderData();
    const gameId = gameData?.id;
    const gameName = gameData?.title;

    const [scope, setScope] = useState(gameData ? "game" : "global");
    const [metric, setMetric] = useState("views");
    const [periodIdx, setPeriodIdx] = useState(0);
    const [expanded, setExpanded] = useState(new Set());

    const [customMode, setCustomMode] = useState("day");
    const [customDate, setCustomDate] = useState("");
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");

    const [viewData, setViewData] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    useEffect(() => {
        if (metric !== "views") return;

        const { since, until } = getPeriodRange(periodIdx, customMode, customDate, customFrom, customTo);

        // Don't fetch custom period until a date is selected
        if (periodIdx === 3 && !since) return;

        setViewLoading(true);
        setViewData(null);

        const params = new URLSearchParams();
        if (since) params.set("since", since);
        if (until) params.set("until", until);
        const qs = params.toString() ? `?${params.toString()}` : "";

        const gameUrl   = gameId ? `${currentAPI}/games/${gameId}/pages/view-leaderboard${qs}` : null;
        const globalUrl = `${currentAPI}/pages/view-leaderboard${qs}`;

        Promise.all([
            gameUrl ? fetch(gameUrl).then((r) => r.json()) : Promise.resolve(null),
            fetch(globalUrl).then((r) => r.json()),
        ]).then(([game, global]) => {
            setViewData({ game, global });
            setViewLoading(false);
        }).catch(() => setViewLoading(false));
    }, [metric, periodIdx, customMode, customDate, customFrom, customTo, gameId]);

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
            <div className="flex flex-wrap items-center gap-2 mb-3">
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
                    <div className="flex gap-1 ml-auto flex-wrap">
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

            {/* Custom date picker */}
            {metric === "views" && periodIdx === 3 && (
                <div className="flex flex-col gap-2 mb-3">
                    <div className="flex gap-1">
                        <button
                            onClick={() => setCustomMode("day")}
                            className={`px-2.5 py-1 rounded text-xs cursor-pointer ${customMode === "day" ? "bg-(--accent) text-(--accent-text) font-semibold" : "opacity-50 hover:opacity-80"}`}
                        >
                            Single Day
                        </button>
                        <button
                            onClick={() => setCustomMode("range")}
                            className={`px-2.5 py-1 rounded text-xs cursor-pointer ${customMode === "range" ? "bg-(--accent) text-(--accent-text) font-semibold" : "opacity-50 hover:opacity-80"}`}
                        >
                            Date Range
                        </button>
                    </div>
                    {customMode === "day" ? (
                        <input
                            type="date"
                            value={customDate}
                            onChange={(e) => setCustomDate(e.target.value)}
                            className="w-fit px-2 py-1 rounded text-sm bg-(--accent) text-(--accent-text) border border-(--outline)/30"
                        />
                    ) : (
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)}
                                className="px-2 py-1 rounded text-sm bg-(--accent) text-(--accent-text) border border-(--outline)/30"
                            />
                            <span className="text-xs opacity-50">to</span>
                            <input
                                type="date"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                                className="px-2 py-1 rounded text-sm bg-(--accent) text-(--accent-text) border border-(--outline)/30"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Tracking note */}
            {metric === "views" && periodIdx !== 0 && (
                <p className="text-xs opacity-50 mb-4">View tracking began March 23, 2026.</p>
            )}

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
