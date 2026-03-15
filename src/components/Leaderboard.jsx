import { useState } from "react";
import { useRouteLoaderData, useLoaderData } from "react-router";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
    const { gameData } = useRouteLoaderData("main");
    const { leaderboardGlobal, leaderboardGame } = useLoaderData();
    const [tab, setTab] = useState(gameData ? "game" : "global");
    const [expanded, setExpanded] = useState(null);

    const global = leaderboardGlobal;
    const game = leaderboardGame;

    const entries = tab === "global" ? global : game;
    const gameName = gameData?.title;

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-(--accent-text) mb-2">
                Leaderboard
            </h1>
            <p className="text-(--text-color) mb-1">
                These are the players who've helped build this site - writing
                guides, filling in details, and sharing what they know so others
                can learn faster.
            </p>
            <p className="text-(--text-color) mb-4">
                Anyone with an account can suggest edits or contribute to any
                page. Your contributions get reviewed and, once accepted, your
                name appears here.{" "}
                <a
                    href="/signup"
                    className="underline font-semibold text-(--accent-text) hover:opacity-80"
                >
                    Create an account
                </a>{" "}
                to get started.
            </p>

            <div className="flex gap-2 mb-6">
                {gameName && (
                    <button
                        onClick={() => setTab("game")}
                        className={`px-4 py-1.5 rounded font-semibold text-sm cursor-pointer ${
                            tab === "game"
                                ? "bg-(--primary) text-white"
                                : "bg-(--accent) text-(--accent-text) hover:opacity-80"
                        }`}
                    >
                        {gameName}
                    </button>
                )}
                <button
                    onClick={() => setTab("global")}
                    className={`px-4 py-1.5 rounded font-semibold text-sm cursor-pointer ${
                        tab === "global"
                            ? "bg-(--primary) text-white"
                            : "bg-(--accent) text-(--accent-text) hover:opacity-80"
                    }`}
                >
                    All Games
                </button>
            </div>

            {!entries && (
                <p className="text-(--text-color) italic">Loading...</p>
            )}

            {entries && entries.length === 0 && (
                <p className="text-(--text-color) italic">
                    No contributors yet.
                </p>
            )}

            {entries && entries.length > 0 && (
                <div className="flex flex-col gap-2">
                    {entries.map((entry, i) => {
                        const isExpanded = expanded === entry.id;
                        const medal = MEDALS[i];
                        return (
                            <div
                                key={entry.id}
                                className="bg-(--accent) rounded border border-(--outline)/30"
                            >
                                <div
                                    className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                                    onClick={() =>
                                        setExpanded(
                                            isExpanded ? null : entry.id,
                                        )
                                    }
                                >
                                    <span className="w-8 text-center font-bold text-(--text-color)">
                                        {medal ?? `#${i + 1}`}
                                    </span>
                                    <span className="flex-1 font-semibold text-(--accent-text)">
                                        {entry.username}
                                    </span>
                                    <span className="text-sm text-(--text-color)">
                                        {entry.contributions}{" "}
                                        {entry.contributions === 1
                                            ? "contribution"
                                            : "contributions"}
                                    </span>
                                    {tab === "global" &&
                                        entry.byGame?.length > 0 && (
                                            <span className="text-xs text-(--text-color)">
                                                {isExpanded ? "▲" : "▼"}
                                            </span>
                                        )}
                                </div>
                                {tab === "global" &&
                                    isExpanded &&
                                    entry.byGame?.length > 0 && (
                                        <div className="border-t border-(--outline)/30 px-4 py-2 flex flex-col gap-1">
                                            {entry.byGame.map((g) => (
                                                <div
                                                    key={g.gameId}
                                                    className="flex justify-between text-sm text-(--text-color)"
                                                >
                                                    <span>{g.title}</span>
                                                    <span>
                                                        {g.contributions}{" "}
                                                        {g.contributions === 1
                                                            ? "contribution"
                                                            : "contributions"}
                                                    </span>
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
