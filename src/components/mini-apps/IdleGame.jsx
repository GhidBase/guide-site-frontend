import { useState, useEffect, useRef, useCallback } from "react";
import { currentAPI } from "../../config/api";
import { useAuth } from "../../hooks/useAuth";

const TICK_INTERVAL = 5000;
const RARITY_COLORS = {
    common: "#6b7280",
    uncommon: "#2e7d32",
    rare: "#1565c0",
    epic: "#6a1b9a",
    legendary: "#b45309",
};
const ORIGIN_COLORS = { Elven: "#34d399", Human: "#fbbf24" };

const SWORD_TYPES = new Set(["sword", "longsword", "greatsword", "dagger"]);

// Maps blade part name → { folder, variant } for sword art.
// folder = "Human" | "Elven" (matches the subfolder under Blades/ and Hilts/)
// variant = file name prefix before " Blade.png" / " Hilt.png"
// Unlisted Human blades fall back to { folder: "Human", variant: "Rusty" }
// Unlisted Elven blades fall back to { folder: "Elven", variant: "Woven Fate" }
const BLADE_ART_MAP = {
    // ── Human ──
    "Soldier's Blade": { folder: "Human", variant: "Rusty" },
    "Tempered Blade": { folder: "Human", variant: "Iron" },
    "Knight's Blade": { folder: "Human", variant: "Knights" },
    "Bronze Sword": { folder: "Human", variant: "Bronze" },
    "Champion's Edge": { folder: "Human", variant: "Kings Gold" },
    // ── Elven ──
    "Jeweled Saber": { folder: "Elven", variant: "Jeweled Saber" },
    "Evils Bane": { folder: "Elven", variant: "Evils Bane" },
    "Elven Glass Blade": { folder: "Elven", variant: "Elven Glass" },
    "Rose Blade": { folder: "Elven", variant: "Rose" },
    "Woven Fate": { folder: "Elven", variant: "Woven Fate" },
};

const WORLD_NAMES = {
    forest: "Forest", cave: "Cave", dungeon: "Dungeon",
    swamp: "Swamp", tundra: "Tundra", volcano: "Volcano",
    abyss: "Abyss", celestial: "Celestial",
};
const WORLDS_ORDER = ["forest", "cave", "dungeon", "swamp", "tundra", "volcano", "abyss", "celestial"];
const PREV_WORLD = { cave: "forest", dungeon: "cave", swamp: "dungeon", tundra: "swamp", volcano: "tundra", abyss: "volcano", celestial: "abyss" };

const ENEMY_EMOJI = {
    "Forest Goblin": "👺",
    "Wild Wolf": "🐺",
    "Forest Troll": "👹",
    "Giant Slime": "🟢",
    "Cave Bat": "🦇",
    "Rock Golem": "🪨",
    "Cave Troll": "👹",
    "Thornwood Ancient": "🌳",
    "Skeleton Warrior": "💀",
    "Dark Knight": "🗡️",
    "Ancient Dragon": "🐉",
    "Dungeon Warden": "🏰",
    "Bog Witch": "🧙",
    "Swamp Lurker": "🐊",
    "Venomfang Serpent": "🐍",
    "Hydra": "🐲",
    "Frost Wraith": "👻",
    "Yeti": "🦍",
    "Ice Elemental": "❄️",
    "Frost Giant": "🧊",
    "Lava Imp": "😈",
    "Magma Golem": "🌋",
    "Fire Drake": "🔥",
    "Inferno Wyrm": "🐉",
    "Void Shade": "🌑",
    "Abyssal Fiend": "👿",
    "Chaos Spawn": "🕳️",
    "Abyssal Lord": "💀",
    "Fallen Seraph": "🪽",
    "Astral Sentinel": "⭐",
    "Storm Archon": "⚡",
    "Celestial Arbiter": "✨",
};

function getEnemyEmoji(enemy) {
    if (!enemy) return "👾";
    return ENEMY_EMOJI[enemy.name] ?? (enemy.isBoss ? "👑" : "👾");
}

function getSwordArtVariant(inventory) {
    const sword = inventory?.find((w) => w.equipped && SWORD_TYPES.has(w.type));
    if (!sword) return null;
    const bladeName = sword.parts?.blade?.name;
    const mapped = BLADE_ART_MAP[bladeName];
    if (mapped) return mapped;
    // Fallback by origin
    const origin = sword.origin ?? "Human";
    return origin === "Elven"
        ? { folder: "Elven", variant: "Woven Fate" }
        : { folder: "Human", variant: "Rusty" };
}

// Maps primary part names → art set folder under /idle/Armor/.
// Matched against the primary part of the armor item (plate for chest/legs, shell for helm)
// so prefixed items (e.g. "Reinforced Soldier's Breastplate") still resolve correctly.
const ARMOR_ART_MAP = {
    // Soldier's kit → Leather Armor
    "Soldier's Breastplate": "Leather Armor",
    "Soldier's Helm":        "Leather Armor",
    "Soldier's Greaves":     "Leather Armor",
};

function getArmorSet(item) {
    // Primary slot key: "plate" for chest/legs, "shell" for helm
    const primaryName = item.parts?.plate?.name ?? item.parts?.shell?.name;
    return ARMOR_ART_MAP[primaryName] ?? "Rags";
}

function calcAttacksPerSec(character) {
    return 0.5 + (character.speed ?? 0) / 50;
}

function calcPlayerDmg(character, enemy) {
    const attack =
        (character.attack ?? character.baseAttack) + (character.magic ?? 0);
    const k = 50 * enemy.level;
    const reduction = enemy.defense / (enemy.defense + k);
    return Math.max(1, Math.round(attack * (1 - reduction)));
}

function calcEnemyDmg(enemy, character) {
    const k = 50 * enemy.level;
    const reduction = (character.defense ?? 0) / ((character.defense ?? 0) + k);
    return Math.max(1, Math.round(enemy.attack * (1 - reduction)));
}

function calcKillsInInterval(character, enemy, seconds) {
    const dmg = calcPlayerDmg(character, enemy);
    const attacksPerSec = calcAttacksPerSec(character);
    const hitsToKill = Math.max(1, Math.ceil(enemy.hp / dmg));
    const timeToKill = hitsToKill / attacksPerSec;
    return Math.floor(seconds / timeToKill);
}

function formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ── sub-components ──────────────────────────────────────────────────────────

function OfflineSummary({ gains, onDismiss }) {
    if (!gains) return null;
    return (
        <div
            style={{
                position: "fixed",
                top: 16,
                left: "50%",
                transform: "translateX(-50%)",
                width: "min(360px, calc(100vw - 32px))",
                zIndex: 100,
                padding: 16,
                borderRadius: 12,
                border: "1px solid var(--primary)",
                background: "var(--accent)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <div className="font-semibold text-(--primary)">
                        Welcome back!
                    </div>
                    <div className="text-sm opacity-70">
                        Away for {formatDuration(gains.secondsOffline)} — kept
                        fighting {gains.enemyName}.
                    </div>
                </div>
                <button
                    onClick={onDismiss}
                    className="text-xs opacity-50 hover:opacity-100 cursor-pointer ml-4 shrink-0"
                >
                    ✕
                </button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                <div className="text-center">
                    <div className="font-bold">
                        {gains.kills.toLocaleString()}
                    </div>
                    <div className="text-xs opacity-60">Kills</div>
                </div>
                <div className="text-center">
                    <div className="font-bold">
                        +{gains.xpGained.toLocaleString()}
                    </div>
                    <div className="text-xs opacity-60">XP</div>
                </div>
                <div className="text-center">
                    <div className="font-bold">
                        {gains.levelUps > 0 ? `+${gains.levelUps}` : "—"}
                    </div>
                    <div className="text-xs opacity-60">Levels</div>
                </div>
            </div>
            {gains.drops.length > 0 && (
                <div className="border-t border-(--primary)/20 pt-3 flex flex-wrap gap-2">
                    {gains.drops.map((d, i) => (
                        <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-full border"
                            style={{
                                color: RARITY_COLORS[d.rarity] ?? "#aaa",
                                borderColor: RARITY_COLORS[d.rarity] ?? "#aaa",
                            }}
                        >
                            {d.count}× {d.name}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function XpBar({ xp, xpNeeded, level }) {
    const pct = Math.min(100, Math.floor((xp / xpNeeded) * 100));
    return (
        <div className="w-full">
            <div className="flex justify-between text-xs mb-1 opacity-90">
                <span className="font-semibold">Level {level}</span>
                <span className="opacity-70">
                    {xp} / {xpNeeded} XP
                </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-(--surface-background) overflow-hidden">
                <div
                    className="h-full rounded-full bg-(--primary) transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function EnemyCard({ enemy, selected, onSelect, character }) {
    const kills = character ? calcKillsInInterval(character, enemy, 1) : 0;
    const kps = kills === 1 ? "1/s" : kills > 1 ? `${kills}/s` : "<1/s";
    return (
        <button
            onClick={() => onSelect(enemy)}
            className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${
                selected
                    ? "border-(--primary) bg-(--primary)/10"
                    : "border-(--surface-background) hover:border-(--primary)/40"
            }`}
        >
            <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{enemy.name}</span>
                <span className="text-xs opacity-50">Lv.{enemy.level}</span>
            </div>
            <div className="text-xs opacity-50 mt-0.5">
                HP {enemy.hp} · ATK {enemy.attack} · DEF {enemy.defense} · {kps}
            </div>
        </button>
    );
}

function DropFeed({ drops }) {
    if (drops.length === 0) return null;
    return (
        <div className="space-y-1">
            {drops.map((d, i) => (
                <div
                    key={i}
                    className="flex items-center gap-2 text-sm font-medium"
                    style={{ color: RARITY_COLORS[d.rarity] ?? "#aaa" }}
                >
                    <span>+{d.count}×</span>
                    <span>{d.name}</span>
                </div>
            ))}
        </div>
    );
}

function CombatLog({ entries }) {
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
    }, [entries]);
    return (
        <div
            ref={ref}
            className="h-full overflow-y-auto text-xs opacity-60 space-y-0.5 font-mono"
        >
            {entries.map((e, i) => (
                <div key={i}>{e}</div>
            ))}
        </div>
    );
}

function IconSettings() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    );
}

function IconMap() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" y1="3" x2="9" y2="18" />
            <line x1="15" y1="6" x2="15" y2="21" />
        </svg>
    );
}

function IconScroll() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    );
}

function IconBag() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    );
}

function IconGrid() {
    return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="1" width="6" height="6" rx="1" />
            <rect x="9" y="1" width="6" height="6" rx="1" />
            <rect x="1" y="9" width="6" height="6" rx="1" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
    );
}

function IconList() {
    return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="2" width="14" height="2.5" rx="1" />
            <rect x="1" y="6.75" width="14" height="2.5" rx="1" />
            <rect x="1" y="11.5" width="14" height="2.5" rx="1" />
        </svg>
    );
}

// ── LoginScreen ──────────────────────────────────────────────────────────────

function LoginScreen() {
    const { login, signup, error, setError } = useAuth();
    const [mode, setMode] = useState("login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (mode === "signup" && password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setSubmitting(true);
        setError(null);
        const ok =
            mode === "login"
                ? await login(username, password)
                : await signup(username, password);
        if (!ok) setSubmitting(false);
    }

    function switchMode(m) {
        setMode(m);
        setError(null);
        setUsername("");
        setPassword("");
        setConfirmPassword("");
    }

    return (
        <div
            className="text-(--text-color) flex items-center justify-center px-6"
            style={{ height: "100dvh" }}
        >
            <div className="w-full max-w-xs space-y-5">
                <div className="text-center space-y-1">
                    <div className="text-2xl font-bold">⚔️ Idle Quest</div>
                    <div className="text-sm opacity-50">
                        Log in to start your adventure
                    </div>
                </div>

                {/* Mode toggle */}
                <div className="flex rounded-lg overflow-hidden border border-(--surface-background) text-sm">
                    {["login", "signup"].map((m) => (
                        <button
                            key={m}
                            onClick={() => switchMode(m)}
                            className={`flex-1 py-2 cursor-pointer transition-colors capitalize ${
                                mode === m
                                    ? "bg-(--primary) text-white font-semibold"
                                    : "opacity-40 hover:opacity-70"
                            }`}
                        >
                            {m === "login" ? "Log In" : "Sign Up"}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                        className="w-full px-3 py-2 rounded-lg border border-(--surface-background) bg-(--surface-background)/60 text-sm outline-none focus:border-(--primary) transition-colors"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete={
                            mode === "login"
                                ? "current-password"
                                : "new-password"
                        }
                        className="w-full px-3 py-2 rounded-lg border border-(--surface-background) bg-(--surface-background)/60 text-sm outline-none focus:border-(--primary) transition-colors"
                    />
                    {mode === "signup" && (
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            className="w-full px-3 py-2 rounded-lg border border-(--surface-background) bg-(--surface-background)/60 text-sm outline-none focus:border-(--primary) transition-colors"
                        />
                    )}
                    {error && (
                        <div className="text-xs text-red-400 px-1">{error}</div>
                    )}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2 rounded-lg bg-(--primary) text-white font-semibold text-sm cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {submitting
                            ? "..."
                            : mode === "login"
                              ? "Log In"
                              : "Sign Up"}
                    </button>
                </form>

                <p className="text-center text-xs opacity-30">
                    Accounts are shared with GuideCodex
                </p>
            </div>
        </div>
    );
}

// ── main component ───────────────────────────────────────────────────────────

export default function IdleGame() {
    const { isAuthenticated, isLoading: authLoading, logout, user } = useAuth();

    const [character, setCharacter] = useState(null);
    const [recentDrops, setRecentDrops] = useState([]);
    const [offlineGains, setOfflineGains] = useState(null);
    const [log, setLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [screen, setScreen] = useState(null); // null | "map" | "inventory" | "log"
    const [unviewedItems, setUnviewedItems] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [invFilterSlot, setInvFilterSlot] = useState("all");
    const [invFilterRarity, setInvFilterRarity] = useState("all");
    const [invSort, setInvSort] = useState("power-high");
    const [lockedItems, setLockedItems] = useState(() => {
        try {
            return new Set(
                JSON.parse(localStorage.getItem("idle-locked-items") ?? "[]"),
            );
        } catch {
            return new Set();
        }
    });
    const toggleLock = (itemKey) => {
        setLockedItems((prev) => {
            const next = new Set(prev);
            if (next.has(itemKey)) next.delete(itemKey);
            else next.add(itemKey);
            localStorage.setItem(
                "idle-locked-items",
                JSON.stringify([...next]),
            );
            return next;
        });
    };
    const [discardAllPending, setDiscardAllPending] = useState(false);
    const discardAllTimerRef = useRef(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [panelItem, setPanelItem] = useState(null);
    const [detailItem, setDetailItem] = useState(null);
    const [panelDetailItem, setPanelDetailItem] = useState(null);
    useEffect(() => {
        if (detailItem) setPanelDetailItem(detailItem);
    }, [detailItem]);
    useEffect(() => {
        if (selectedItem) setPanelItem(selectedItem);
    }, [selectedItem]);
    const [pendingDiscardKey, setPendingDiscardKey] = useState(null);
    const pendingDiscardTimerRef = useRef(null);
    const [swipedOpenKey, setSwipedOpenKey] = useState(null);
    const swipeTouchStartX = useRef(null);
    const swipeWasMove = useRef(false);
    const [invView, setInvView] = useState("list");

    const [attacking, setAttacking] = useState(false);
    const [enemyCurrentHp, setEnemyCurrentHp] = useState(null);
    const [playerCurrentHp, setPlayerCurrentHp] = useState(null);
    const [playerChargeProgress, setPlayerChargeProgress] = useState(0);
    const [enemyChargeProgress, setEnemyChargeProgress] = useState(0);
    const [enemyDeathPause, setEnemyDeathPause] = useState(false);
    const [reviveKey, setReviveKey] = useState(0);
    const [playerIsAlive, setPlayerIsAlive] = useState(true);
    const playerIsAliveRef = useRef(true);
    useEffect(() => {
        playerIsAliveRef.current = playerIsAlive;
    }, [playerIsAlive]);
    const enemyDeadRef = useRef(false);
    const lastPlayerHitRef = useRef(0);
    const lastEnemyHitRef = useRef(0);
    const [toast, setToast] = useState(null);
    const rAFRef = useRef(null);
    const toastTimerRef = useRef(null);

    const localKillsRef = useRef(0);
    const [localKillCount, setLocalKillCount] = useState(0);
    const localKillCountRef = useRef(0);
    const visualEnemyHpRef = useRef(null);
    const enemyMaxHpRef = useRef(0);
    const tickStartRef = useRef(Date.now());
    const serverTickRef = useRef(null);
    const lastReviveTimeRef = useRef(0);
    // Mirrors playerCurrentHp state so tick/revive async functions always see the current value
    const playerCurrentHpRef = useRef(null);

    const showToast = useCallback((content, duration = 4000) => {
        setToast(content);
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToast(null), duration);
    }, []);

    const addLog = useCallback((msg) => {
        const time = new Date().toLocaleTimeString("en-US", { hour12: false });
        setLog((prev) => [...prev.slice(-99), `[${time}] ${msg}`]);
    }, []);

    // ── Character reload (used on mount and on visibility return) ──
    const reloadCharacter = useCallback(async () => {
        try {
            const res = await fetch(`${currentAPI}/idle/character`, {
                credentials: "include",
            });
            if (!res.ok) return;
            const { character: charData, offlineGains: gains } =
                await res.json();
            // Reset tick timing so the next tick doesn't cover the full offline gap
            tickStartRef.current = Date.now();
            localKillsRef.current = 0;
            setCharacter(charData);
            playerCurrentHpRef.current = charData.currentHp;
            setPlayerCurrentHp(charData.currentHp);
            setPlayerIsAlive(charData.currentHp > 0);
            if (charData.currentHp > 0) lastReviveTimeRef.current = Date.now();
            if (gains) {
                setOfflineGains(gains);
                addLog(
                    `Offline: killed ${gains.kills}× ${gains.enemyName} (+${gains.xpGained} XP)`,
                );
                if (gains.levelUps > 0)
                    addLog(`⬆ Leveled up ${gains.levelUps}× while away!`);
            }
        } catch {
            /* ignore */
        }
    }, [addLog]);

    // ── Load character on mount (also re-runs when Retry button resets loading to true) ──
    useEffect(() => {
        if (!isAuthenticated || !loading) return;
        (async () => {
            try {
                const charRes = await fetch(`${currentAPI}/idle/character`, {
                    credentials: "include",
                });
                if (!charRes.ok) {
                    let msg = `Server error: ${charRes.status}`;
                    try {
                        const body = await charRes.json();
                        if (body?.error) msg = body.error;
                    } catch {
                        /* ignore */
                    }
                    throw new Error(msg);
                }
                const { character: charData, offlineGains: gains } =
                    await charRes.json();
                setCharacter(charData);
                playerCurrentHpRef.current = charData.currentHp;
                setPlayerCurrentHp(charData.currentHp);
                setPlayerIsAlive(charData.currentHp > 0);
                if (gains) {
                    setOfflineGains(gains);
                    addLog(
                        `Offline: killed ${gains.kills}× ${gains.enemyName} (+${gains.xpGained} XP)`,
                    );
                    if (gains.levelUps > 0)
                        addLog(`⬆ Leveled up ${gains.levelUps}× while away!`);
                }
                addLog("Character loaded.");
            } catch (e) {
                setFetchError(e.message || "Failed to load character.");
            } finally {
                setLoading(false);
            }
        })();
    }, [isAuthenticated, loading, addLog]);

    // ── Re-fetch character when tab regains visibility ──
    useEffect(() => {
        const handleVisibility = () => {
            if (!document.hidden && isAuthenticated) reloadCharacter();
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () =>
            document.removeEventListener("visibilitychange", handleVisibility);
    }, [isAuthenticated, reloadCharacter]);

    // ── Combat loop (rAF) ──
    const selectedEnemy = character?.currentEnemy ?? null;
    useEffect(() => {
        cancelAnimationFrame(rAFRef.current);
        if (!selectedEnemy || !character) return;

        localKillCountRef.current = 0;
        localKillsRef.current = 0;
        setLocalKillCount(0);

        if (!playerIsAlive) return;

        const dmg = calcPlayerDmg(character, selectedEnemy);
        const attacksPerSec = calcAttacksPerSec(character);
        const hitsToKillEnemy = Math.max(1, Math.ceil(selectedEnemy.hp / dmg));
        const enemyAttackSpeed = selectedEnemy.attackSpeed ?? 1.0;
        const playerHitInterval = (1 / attacksPerSec) * 1000;
        const enemyHitInterval = (1 / enemyAttackSpeed) * 1000;
        const enemyDmgPerHit = calcEnemyDmg(selectedEnemy, character);

        enemyMaxHpRef.current = selectedEnemy.hp;
        visualEnemyHpRef.current = selectedEnemy.hp;
        enemyDeadRef.current = false;
        lastPlayerHitRef.current = performance.now();
        lastEnemyHitRef.current = performance.now();
        setEnemyCurrentHp(selectedEnemy.hp);
        // Don't overwrite playerCurrentHpRef here — it's already correct from revive/load/regen.
        // Seeding it from character.currentHp would clobber it with a stale server snapshot.
        setPlayerChargeProgress(0);
        setEnemyChargeProgress(0);
        setEnemyDeathPause(false);

        const loop = (now) => {
            if (enemyDeadRef.current) {
                setPlayerChargeProgress(0);
                setEnemyChargeProgress(0);
                rAFRef.current = requestAnimationFrame(loop);
                return;
            }

            const playerElapsed = now - lastPlayerHitRef.current;
            const enemyElapsed = now - lastEnemyHitRef.current;

            setPlayerChargeProgress(
                Math.min(1, playerElapsed / playerHitInterval),
            );
            setEnemyChargeProgress(
                Math.min(1, enemyElapsed / enemyHitInterval),
            );

            if (playerElapsed >= playerHitInterval) {
                lastPlayerHitRef.current = now;
                setAttacking(true);
                setTimeout(() => setAttacking(false), 150);

                localKillsRef.current += 1 / hitsToKillEnemy;
                visualEnemyHpRef.current -= dmg;
                if (visualEnemyHpRef.current <= 0) {
                    localKillCountRef.current += 1;
                    setLocalKillCount(localKillCountRef.current);
                    setEnemyCurrentHp(0);
                    enemyDeadRef.current = true;
                    setEnemyDeathPause(true);
                    setTimeout(() => {
                        visualEnemyHpRef.current = enemyMaxHpRef.current;
                        setEnemyCurrentHp(enemyMaxHpRef.current);
                        enemyDeadRef.current = false;
                        setEnemyDeathPause(false);
                        lastPlayerHitRef.current = performance.now();
                        lastEnemyHitRef.current = performance.now();
                    }, 1500);
                } else {
                    setEnemyCurrentHp(visualEnemyHpRef.current);
                }
            }

            if (enemyElapsed >= enemyHitInterval) {
                lastEnemyHitRef.current = now;
                playerCurrentHpRef.current = Math.max(
                    0,
                    playerCurrentHpRef.current - enemyDmgPerHit,
                );
                setPlayerCurrentHp(playerCurrentHpRef.current);
                if (playerCurrentHpRef.current === 0) setPlayerIsAlive(false);
            }

            rAFRef.current = requestAnimationFrame(loop);
        };

        rAFRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rAFRef.current);
    }, [
        selectedEnemy?.id,
        character?.attack,
        character?.baseAttack,
        character?.speed,
        character?.magic,
        character?.defense,
        reviveKey,
        playerIsAlive,
    ]);

    // ── Visual regen animation while dead ──
    // Speed: fills maxHp over exactly TICK_INTERVAL ms so animation completes with the server tick.
    // Does NOT update playerCurrentHpRef — tick handler owns the authoritative value.
    // Combat only restarts when BOTH this animation reaches maxHp AND the server has confirmed.
    const [serverConfirmedRevive, setServerConfirmedRevive] = useState(false);

    useEffect(() => {
        if (playerIsAlive) return;
        const hpPerSecond = 10;
        const interval = setInterval(() => {
            setPlayerCurrentHp((prev) =>
                Math.min(character?.maxHp ?? 100, (prev ?? 0) + hpPerSecond),
            );
        }, 1000);
        return () => clearInterval(interval);
    }, [playerIsAlive]);

    useEffect(() => {
        if (
            !playerIsAlive &&
            serverConfirmedRevive &&
            (playerCurrentHp ?? 0) >= (character?.maxHp ?? 100)
        ) {
            setServerConfirmedRevive(false);
            setPlayerIsAlive(true);
        }
    }, [
        serverConfirmedRevive,
        playerCurrentHp,
        playerIsAlive,
        character?.maxHp,
    ]);

    // ── Server sync tick ──
    useEffect(() => {
        if (!selectedEnemy || !character) return;

        const sync = async () => {
            const syncStartTime = Date.now();
            const now = syncStartTime;
            const durationSeconds = (now - tickStartRef.current) / 1000;
            const kills = Math.floor(localKillsRef.current);
            localKillsRef.current -= kills;
            tickStartRef.current = now;

            // Always tick even if kills=0 so server can process HP regen while dead

            try {
                const res = await fetch(`${currentAPI}/idle/character/tick`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        kills,
                        durationSeconds,
                    }),
                });
                const data = await res.json();
                if (!res.ok) return;
                // Discard tick responses that were in-flight before the last revive —
                // their character snapshot has currentHp ≤ 0 and would re-trigger death UI
                if (syncStartTime < lastReviveTimeRef.current) return;

                setCharacter(data.character);
                // Only sync displayed HP from server when the frontend also considers us dead (regen progress).
                // While alive, the rAF loop exclusively owns playerCurrentHp — never let a stale tick overwrite it.
                // Use playerIsAliveRef (not the HP ref) so partial-HP ticks don't break the condition.
                if (!playerIsAliveRef.current) {
                    playerCurrentHpRef.current = data.character.currentHp;
                    // Don't overwrite playerCurrentHp display — regen animation owns it.
                    // Revive fires via the effect once animation reaches maxHp + server confirms.
                    if (data.character.currentHp >= data.character.maxHp) {
                        lastReviveTimeRef.current = Date.now();
                        setServerConfirmedRevive(true);
                    }
                }
                localKillCountRef.current = 0;
                setLocalKillCount(0);

                if (data.died) {
                    addLog(
                        `💀 Defeated by ${selectedEnemy.name}. Recovering...`,
                    );
                    if (playerIsAliveRef.current) {
                        playerCurrentHpRef.current = 0;
                        setPlayerCurrentHp(0);
                        setPlayerIsAlive(false);
                    }
                }

                if (data.killsProcessed > 0) {
                    if (data.drops?.length > 0) {
                        setRecentDrops(data.drops);
                        setTimeout(() => setRecentDrops([]), 4000);
                        for (const d of data.drops)
                            addLog(`Dropped: ${d.name}`);
                        setUnviewedItems((n) => n + data.drops.length);
                    }
                    if (data.levelUps > 0)
                        addLog(
                            `⬆ Leveled up! Now level ${data.character.level}`,
                        );
                    addLog(
                        `Killed ${data.killsProcessed}× ${selectedEnemy.name} (+${data.xpGained} XP)`,
                    );
                    if (data.floorAdvanced)
                        addLog(
                            `Advanced to floor ${data.character.currentFloor}!`,
                        );
                    if (data.bossKilled)
                        addLog(`Boss defeated! New world unlocked.`);
                }

                if (data.levelUps > 0 || data.drops?.length > 0) {
                    showToast({
                        levelUps: data.levelUps,
                        newLevel: data.character.level,
                        drops: data.drops ?? [],
                    });
                }

                if (data.offlineGains) {
                    const g = data.offlineGains;
                    setOfflineGains(g);
                    addLog(
                        `Offline: killed ${g.kills}× ${g.enemyName} (+${g.xpGained} XP)`,
                    );
                    if (g.levelUps > 0)
                        addLog(`⬆ Leveled up ${g.levelUps}× while away!`);
                }
            } catch {
                // silently ignore network errors in the tick loop
            }
        };

        serverTickRef.current = setInterval(sync, TICK_INTERVAL);
        return () => clearInterval(serverTickRef.current);
    }, [selectedEnemy?.id, character?.id, addLog, showToast]);

    // ── Floor change ──
    async function changeFloor(world, floor) {
        const res = await fetch(`${currentAPI}/idle/character/floor`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ world, floor }),
        });
        if (res.ok) {
            const data = await res.json();
            setCharacter(data);
            addLog(`Moved to ${WORLD_NAMES[world] ?? world} floor ${floor}.`);
        }
    }

    // ── Equip/unequip ──
    async function handleEquip(inventoryItemId, equipped, source) {
        const res = await fetch(
            `${currentAPI}/idle/character/equip/${inventoryItemId}`,
            {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ equipped, source }),
            },
        );
        if (res.ok) {
            const data = await res.json();
            setCharacter(data);
            setSelectedItem(null);
            addLog(equipped ? "Item equipped." : "Item unequipped.");
        }
    }

    async function handleReset() {
        const res = await fetch(`${currentAPI}/idle/character/reset`, {
            method: "POST",
            credentials: "include",
        });
        if (res.ok) {
            setCharacter(await res.json());
            addLog("Character reset.");
        }
    }

    async function handleRevive() {
        lastReviveTimeRef.current = Date.now();
        setServerConfirmedRevive(false);
        const res = await fetch(`${currentAPI}/idle/character/revive`, {
            method: "POST",
            credentials: "include",
        });
        if (res.ok) {
            const c = await res.json();
            setCharacter(c);
            playerCurrentHpRef.current = c.currentHp;
            setPlayerCurrentHp(c.currentHp);
            setPlayerIsAlive(true);
            setReviveKey((k) => k + 1);
            addLog("Revived.");
        }
    }

    async function handleDiscardAll(items) {
        const unlocked = items.filter(
            (i) => !lockedItems.has(`${i.source}-${i.id}`),
        );
        if (!discardAllPending) {
            setDiscardAllPending(true);
            clearTimeout(discardAllTimerRef.current);
            discardAllTimerRef.current = setTimeout(
                () => setDiscardAllPending(false),
                3000,
            );
            return;
        }
        setDiscardAllPending(false);
        clearTimeout(discardAllTimerRef.current);
        if (unlocked.length === 0) return;
        const res = await fetch(`${currentAPI}/idle/character/items`, {
            method: "DELETE",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                items: unlocked.map((i) => ({ id: i.id, source: i.source })),
            }),
        });
        if (res.ok) {
            const data = await res.json();
            setCharacter(data);
            addLog(
                `Discarded ${unlocked.length} item${unlocked.length !== 1 ? "s" : ""}.`,
            );
        }
    }

    async function handleDiscard(itemId, source) {
        const res = await fetch(`${currentAPI}/idle/character/item/${itemId}`, {
            method: "DELETE",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ source }),
        });
        if (res.ok) {
            const data = await res.json();
            setCharacter(data);
            if (selectedItem?.id === itemId && selectedItem?.source === source)
                setSelectedItem(null);
            setPendingDiscardKey(null);
            setSwipedOpenKey(null);
            addLog("Item discarded.");
        }
    }

    function toggleScreen(name) {
        setScreen((s) => (s === name ? null : name));
        setShowSettings(false);
        setSelectedItem(null);
        setPendingDiscardKey(null);
        setSwipedOpenKey(null);
        if (name === "inventory") setUnviewedItems(0);
    }

    // ── Render states ──
    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-64 text-(--text-color) opacity-50">
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginScreen />;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-(--text-color) opacity-50">
                Loading...
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-2 text-(--text-color)">
                <p className="font-semibold">Failed to load game</p>
                <p className="text-sm opacity-50">{fetchError}</p>
                <p className="text-xs opacity-40">
                    Make sure the backend is running.
                </p>
                <button
                    onClick={() => {
                        setFetchError(null);
                        setLoading(true);
                    }}
                    className="mt-2 px-4 py-1.5 text-sm rounded border border-(--text-color)/30 hover:border-(--text-color)/60 cursor-pointer"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!character) return null;

    const RARITY_ORDER = {
        common: 1,
        uncommon: 2,
        rare: 3,
        epic: 4,
        legendary: 5,
    };
    const SLOT_TYPES = {
        weapon: ["sword", "longsword", "greatsword", "dagger"],
        chest: ["chest"],
        helm: ["helm"],
        legs: ["legs"],
    };
    const SLOT_EMOJI = { weapon: "⚔️", chest: "🛡️", helm: "🪖", legs: "👖" };
    const SLOT_ORDER = ["weapon", "helm", "chest", "legs"];

    function getItemSlot(item) {
        for (const [slot, types] of Object.entries(SLOT_TYPES)) {
            if (types.includes(item.type)) return slot;
        }
        return null;
    }

    function getItemStats(item) {
        if (item.source === "weapon") return item.stats ?? {};
        return item.statBonus ?? {};
    }

    const equippedItems = character.inventory.filter((i) => i.equipped);
    const unequippedItems = character.inventory.filter((i) => !i.equipped);
    const swordArt = getSwordArtVariant(character.inventory);
    const _legsItem  = equippedItems.find((i) => i.type === "legs");
    const _chestItem = equippedItems.find((i) => i.type === "chest");
    const _helmItem  = equippedItems.find((i) => i.type === "helm");
    const armorLegs  = _legsItem  ? getArmorSet(_legsItem)  : null;
    const armorChest = _chestItem ? getArmorSet(_chestItem) : null;
    const armorHelm  = _helmItem  ? getArmorSet(_helmItem)  : null;

    const selectedSlot = panelItem ? getItemSlot(panelItem) : null;
    const equippedInSlot = selectedSlot
        ? equippedItems.find((i) => SLOT_TYPES[selectedSlot]?.includes(i.type))
        : null;

    const filteredItems = unequippedItems
        .filter((i) => {
            if (invFilterSlot !== "all") {
                const allowed = SLOT_TYPES[invFilterSlot] ?? [];
                if (!allowed.includes(i.type)) return false;
            }
            if (invFilterRarity !== "all" && i.rarity !== invFilterRarity)
                return false;
            return true;
        })
        .sort((a, b) => {
            switch (invSort) {
                case "oldest":
                    return a.id - b.id;
                case "level-high":
                    return (b.level ?? 0) - (a.level ?? 0);
                case "level-low":
                    return (a.level ?? 0) - (b.level ?? 0);
                case "rarity-high":
                    return (
                        (RARITY_ORDER[b.rarity] ?? 0) -
                        (RARITY_ORDER[a.rarity] ?? 0)
                    );
                case "rarity-low":
                    return (
                        (RARITY_ORDER[a.rarity] ?? 0) -
                        (RARITY_ORDER[b.rarity] ?? 0)
                    );
                case "power-high": {
                    const pa = Math.round(
                        (a.totalRating ?? 0) *
                            (1 + Math.log((a.level ?? 1) + 1) * 2),
                    );
                    const pb = Math.round(
                        (b.totalRating ?? 0) *
                            (1 + Math.log((b.level ?? 1) + 1) * 2),
                    );
                    return pb - pa;
                }
                case "power-low": {
                    const pa = Math.round(
                        (a.totalRating ?? 0) *
                            (1 + Math.log((a.level ?? 1) + 1) * 2),
                    );
                    const pb = Math.round(
                        (b.totalRating ?? 0) *
                            (1 + Math.log((b.level ?? 1) + 1) * 2),
                    );
                    return pa - pb;
                }
                default:
                    return b.id - a.id; // newest
            }
        });

    return (
        <div
            className="text-(--text-color)"
            style={{
                height: "100dvh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <OfflineSummary
                gains={offlineGains}
                onDismiss={() => setOfflineGains(null)}
            />
            {/* Game frame */}
            <div className="relative overflow-hidden flex-1">
                {/* ── Battle screen (base layer) ── */}
                <div
                    className="absolute inset-0 flex flex-col"
                    style={{ bottom: 56 }}
                >
                    {/* Header bar */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
                        <XpBar
                            xp={character.xp}
                            xpNeeded={character.xpNeeded}
                            level={character.level}
                        />
                        <button
                            onClick={() => {
                                setShowSettings((s) => !s);
                                setScreen(null);
                            }}
                            className="ml-3 shrink-0 opacity-50 hover:opacity-90 cursor-pointer transition-opacity"
                            aria-label="Settings"
                        >
                            <IconSettings />
                        </button>
                    </div>

                    {/* Settings panel (inline, below header) */}
                    {showSettings && (
                        <div className="mx-4 mb-2 p-3 rounded-lg border border-(--surface-background) bg-(--surface-background)/60 text-sm space-y-2 shrink-0">
                            <div className="font-semibold text-xs uppercase opacity-50 tracking-wider">
                                Settings
                            </div>
                            {user?.username && (
                                <div className="text-xs opacity-50">
                                    Logged in as{" "}
                                    <span className="opacity-100 font-medium">
                                        {user.username}
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={handleReset}
                                className="w-full text-xs px-3 py-1.5 rounded border border-red-500/40 text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors text-left"
                            >
                                Reset Character (keeps weapons)
                            </button>
                            <div className="border-t border-(--surface-background) pt-2">
                                <div className="font-semibold text-xs uppercase opacity-30 tracking-wider mb-1.5">
                                    Dev
                                </div>
                                <button
                                    onClick={handleRevive}
                                    className="w-full text-xs px-3 py-1.5 rounded border border-green-500/40 text-green-400 hover:bg-green-500/10 cursor-pointer transition-colors text-left"
                                >
                                    Instant Revive
                                </button>
                            </div>
                            <div className="border-t border-(--surface-background) pt-2">
                                <button
                                    onClick={() => {
                                        logout();
                                        setShowSettings(false);
                                    }}
                                    className="w-full text-xs px-3 py-1.5 rounded border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 cursor-pointer transition-colors text-left"
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Stats row */}
                    <div className="flex justify-around text-sm px-4 py-2 border-b border-(--surface-background)/50 shrink-0">
                        <div className="text-center">
                            <div className="font-bold">
                                {character.attack + (character.magic ?? 0)}
                            </div>
                            <div className="text-xs opacity-50">ATK</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold">{character.defense}</div>
                            <div className="text-xs opacity-50">DEF</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold">
                                {(character.speed ?? 0) > 0
                                    ? `${calcAttacksPerSec(character).toFixed(2)}/s`
                                    : "1/s"}
                            </div>
                            <div className="text-xs opacity-50">SPD</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold">{character.maxHp}</div>
                            <div className="text-xs opacity-50">HP</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold">
                                {(
                                    character.totalKills + localKillCount
                                ).toLocaleString()}
                            </div>
                            <div className="text-xs opacity-50">Kills</div>
                        </div>
                    </div>

                    {/* Combat area */}
                    <div className="flex-1 flex flex-col justify-center gap-2 px-3">
                        {selectedEnemy ? (
                            <>
                                {/* Arena — player left, enemy right */}
                                <div className="flex items-end justify-between gap-2">
                                    {/* ── Player side ── */}
                                    <div className="flex flex-col items-center gap-1 flex-1">
                                        {/* Player HP bar */}
                                        {(() => {
                                            const hp =
                                                playerCurrentHp ??
                                                character.currentHp;
                                            const pct = Math.max(
                                                0,
                                                (hp / character.maxHp) * 100,
                                            );
                                            return (
                                                <div className="w-full">
                                                    <div className="flex justify-between text-xs mb-0.5 opacity-60">
                                                        <span className="truncate">
                                                            {Math.ceil(
                                                                Math.max(0, hp),
                                                            )}
                                                            /{character.maxHp}
                                                        </span>
                                                        {playerIsAlive ? (
                                                            <span className="text-red-400 shrink-0 ml-1">
                                                                {calcEnemyDmg(
                                                                    selectedEnemy,
                                                                    character,
                                                                )}
                                                                ↓
                                                            </span>
                                                        ) : (
                                                            <span className="text-green-400 shrink-0 ml-1">
                                                                +10/s
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="w-full h-2 rounded-full bg-(--surface-background) overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all"
                                                            style={{
                                                                width: `${pct}%`,
                                                                background:
                                                                    pct > 50
                                                                        ? "#4ade80"
                                                                        : pct >
                                                                            25
                                                                          ? "#facc15"
                                                                          : "#f87171",
                                                                transitionDuration: !playerIsAlive ? "1000ms" : "150ms",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                        {/* Character sprite */}
                                        <div
                                            className="relative"
                                            style={{ width: 146, height: 152 }}
                                        >
                                            {!playerIsAlive ? (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <div className="text-3xl select-none">
                                                        💀
                                                    </div>
                                                    <div className="text-xs opacity-40 mt-1">
                                                        {Math.ceil(
                                                            (character.maxHp -
                                                                Math.max(
                                                                    0,
                                                                    character.currentHp,
                                                                )) /
                                                                10,
                                                        )}
                                                        s
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <img
                                                        src="/idle/Character/Male/Legs_1.png"
                                                        width={146}
                                                        height={152}
                                                        className="absolute top-0 left-0"
                                                        alt=""
                                                    />
                                                    {armorLegs && (
                                                        <img
                                                            src={`/idle/Armor/${armorLegs}/Legs_${armorLegs}_1.png`}
                                                            width={146}
                                                            height={152}
                                                            className="absolute top-0 left-0"
                                                            alt=""
                                                        />
                                                    )}
                                                    <img
                                                        src="/idle/Character/Male/Side Arm_1.png"
                                                        width={146}
                                                        height={152}
                                                        className="absolute top-0 left-0"
                                                        alt=""
                                                    />
                                                    {armorChest && (
                                                        <img
                                                            src={`/idle/Armor/${armorChest}/Side Arm_${armorChest}_1.png`}
                                                            width={146}
                                                            height={152}
                                                            className="absolute top-0 left-0"
                                                            alt=""
                                                        />
                                                    )}
                                                    <img
                                                        src="/idle/Character/Male/Chest_1.png"
                                                        width={146}
                                                        height={152}
                                                        className="absolute top-0 left-0"
                                                        alt=""
                                                    />
                                                    {armorChest && (
                                                        <img
                                                            src={`/idle/Armor/${armorChest}/Chest_${armorChest}_1.png`}
                                                            width={146}
                                                            height={152}
                                                            className="absolute top-0 left-0"
                                                            alt=""
                                                        />
                                                    )}
                                                    <img src="/idle/Character/Male/Head_1.png" width={146} height={152} className="absolute top-0 left-0" alt="" />
                                                    {armorHelm && <img src={`/idle/Armor/${armorHelm}/Head_${armorHelm}_1.png`} width={146} height={152} className="absolute top-0 left-0" alt="" />}
                                                    {!armorHelm && <img src="/idle/Character/Male/Hair/Hair_sprite_1.png" width={146} height={152} className="absolute top-0 left-0" alt="" />}
                                                    {swordArt && (
                                                        <img
                                                            src={`/idle/Weapons/Swords/Hilts/${swordArt.folder}/${swordArt.variant} Hilt.png`}
                                                            width={146}
                                                            height={152}
                                                            className="absolute top-0 left-0"
                                                            alt=""
                                                        />
                                                    )}
                                                    {swordArt && (
                                                        <img
                                                            src={`/idle/Weapons/Swords/Blades/${swordArt.folder}/${swordArt.variant} Blade.png`}
                                                            width={146}
                                                            height={152}
                                                            className="absolute top-0 left-0"
                                                            alt=""
                                                        />
                                                    )}
                                                    <img
                                                        src="/idle/Character/Male/Main Arm_1.png"
                                                        width={146}
                                                        height={152}
                                                        className="absolute top-0 left-0"
                                                        alt=""
                                                    />
                                                    {armorChest && (
                                                        <img
                                                            src={`/idle/Armor/${armorChest}/Main Arm_${armorChest}_1.png`}
                                                            width={146}
                                                            height={152}
                                                            className="absolute top-0 left-0"
                                                            alt=""
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        {/* Player attack charge bar */}
                                        {playerIsAlive && (
                                            <div className="w-full">
                                                <div className="flex justify-between text-xs mb-0.5 opacity-40">
                                                    <span>ATK</span>
                                                    <span>
                                                        {calcAttacksPerSec(
                                                            character,
                                                        ).toFixed(2)}
                                                        /s
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 rounded-full bg-(--surface-background) overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-(--primary)"
                                                        style={{
                                                            width: `${playerChargeProgress * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* VS divider */}
                                    <div className="text-xs opacity-30 pb-8 shrink-0">
                                        vs
                                    </div>

                                    {/* ── Enemy side ── */}
                                    <div className="flex flex-col items-center gap-1 flex-1">
                                        {/* Enemy HP bar */}
                                        {playerIsAlive &&
                                            enemyCurrentHp !== null &&
                                            (() => {
                                                const dmg = calcPlayerDmg(
                                                    character,
                                                    selectedEnemy,
                                                );
                                                const pct = Math.max(
                                                    0,
                                                    (enemyCurrentHp /
                                                        selectedEnemy.hp) *
                                                        100,
                                                );
                                                return (
                                                    <div className="w-full">
                                                        <div className="flex justify-between text-xs mb-0.5 opacity-60">
                                                            <span className="truncate">
                                                                {Math.ceil(
                                                                    enemyCurrentHp,
                                                                )}
                                                                /
                                                                {
                                                                    selectedEnemy.hp
                                                                }
                                                            </span>
                                                            <span className="text-(--primary) shrink-0 ml-1">
                                                                {dmg}↓
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-2 rounded-full bg-(--surface-background) overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full bg-red-400 transition-all"
                                                                style={{
                                                                    width: `${pct}%`,
                                                                    transitionDuration: "150ms",
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        {/* Enemy art */}
                                        <div
                                            className="flex items-center justify-center"
                                            style={{ width: 120, height: 125 }}
                                        >
                                            {enemyDeathPause ? (
                                                <div className="text-5xl select-none animate-bounce">
                                                    💥
                                                </div>
                                            ) : (
                                                <div
                                                    className={`text-5xl transition-transform duration-100 select-none ${attacking ? "scale-110" : "scale-100"}`}
                                                >
                                                    {getEnemyEmoji(selectedEnemy)}
                                                </div>
                                            )}
                                        </div>
                                        {/* Enemy attack charge bar */}
                                        {playerIsAlive && (
                                            <div className="w-full">
                                                <div className="flex justify-between text-xs mb-0.5 opacity-40">
                                                    <span>ATK</span>
                                                    <span>
                                                        {(
                                                            selectedEnemy.attackSpeed ??
                                                            1
                                                        ).toFixed(2)}
                                                        /s
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 rounded-full bg-(--surface-background) overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-red-400"
                                                        style={{
                                                            width: `${enemyChargeProgress * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Enemy name + floor kill progress */}
                                <div className="text-center">
                                    <div className="font-semibold">
                                        {selectedEnemy.name}
                                        {selectedEnemy.isBoss && (
                                            <span className="ml-1.5 text-xs font-bold text-yellow-400 align-middle">
                                                BOSS
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs opacity-50">
                                        Lv.{selectedEnemy.level} ·{" "}
                                        {WORLD_NAMES[character.currentWorld] ?? character.currentWorld}{" "}
                                        Floor {character.currentFloor}
                                    </div>
                                    {/* Kill progress — only on regular floors not yet cleared */}
                                    {character.currentFloor < 10 &&
                                        (character.worldProgress?.[character.currentWorld] ?? 0) < character.currentFloor && (
                                        <div className="mt-1 text-xs opacity-50">
                                            {character.killsOnFloor ?? 0} / 10 kills
                                        </div>
                                    )}
                                </div>

                                {recentDrops.length > 0 && (
                                    <div className="w-full text-center">
                                        <DropFeed drops={recentDrops} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="opacity-30 text-sm">
                                Loading enemy...
                            </div>
                        )}
                    </div>

                    {/* Toast */}
                    <div className="mx-4 mb-3 min-h-8">
                        {toast &&
                            (typeof toast === "string" ? (
                                <div className="text-xs opacity-60 text-center py-1">
                                    {toast}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-(--surface-background) bg-(--accent)/60 px-3 py-2 text-xs space-y-1.5">
                                    {toast.levelUps > 0 && (
                                        <div className="font-semibold text-(--primary)">
                                            ⬆ Level up! Now level{" "}
                                            {toast.newLevel}
                                        </div>
                                    )}
                                    {toast.drops.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {toast.drops.map((d, i) => (
                                                <span
                                                    key={i}
                                                    className="px-1.5 py-0.5 rounded-full border text-xs"
                                                    style={{
                                                        color:
                                                            RARITY_COLORS[
                                                                d.rarity
                                                            ] ?? "#aaa",
                                                        borderColor:
                                                            RARITY_COLORS[
                                                                d.rarity
                                                            ] ?? "#aaa",
                                                    }}
                                                >
                                                    {d.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>

                {/* ── Map overlay (slides from left) ── */}
                <div
                    className="absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out"
                    style={{
                        bottom: 56,
                        transform:
                            screen === "map"
                                ? "translateX(0)"
                                : "translateX(-100%)",
                        background: "var(--surface-background, #fff)",
                    }}
                >
                    <div className="shrink-0 px-4 pt-4 pb-2 border-b border-(--surface-background)/50">
                        <div className="text-xs font-semibold uppercase opacity-40 tracking-wider">
                            World Map
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
                        {WORLDS_ORDER.map((world) => {
                            const prevWorld = PREV_WORLD[world];
                            const worldUnlocked =
                                !prevWorld ||
                                (character.worldProgress?.[prevWorld] ?? 0) >= 10;
                            const progress = character.worldProgress?.[world] ?? 0;
                            const isCurrentWorld =
                                character.currentWorld === world;
                            return (
                                <div key={world}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span
                                            className={`text-sm font-bold ${worldUnlocked ? "" : "opacity-30"}`}
                                        >
                                            {WORLD_NAMES[world]}
                                        </span>
                                        {!worldUnlocked && (
                                            <span className="text-xs opacity-30">
                                                🔒 Locked
                                            </span>
                                        )}
                                        {worldUnlocked && progress >= 10 && (
                                            <span className="text-xs text-yellow-400 font-semibold">
                                                ✓ Cleared
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {Array.from({ length: 10 }, (_, i) => {
                                            const floor = i + 1;
                                            const isBoss = floor === 10;
                                            const isActive =
                                                isCurrentWorld &&
                                                character.currentFloor === floor;
                                            let floorUnlocked = false;
                                            if (worldUnlocked) {
                                                if (floor === 1)
                                                    floorUnlocked = true;
                                                else if (floor <= 9)
                                                    floorUnlocked = progress >= floor - 1;
                                                else
                                                    floorUnlocked = progress >= 9;
                                            }
                                            return (
                                                <button
                                                    key={floor}
                                                    disabled={!floorUnlocked}
                                                    onClick={() => {
                                                        if (floorUnlocked) {
                                                            changeFloor(world, floor);
                                                            setScreen(null);
                                                        }
                                                    }}
                                                    className={`relative flex flex-col items-center justify-center rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer ${
                                                        isActive
                                                            ? "bg-(--primary) text-white"
                                                            : floorUnlocked
                                                              ? "border border-(--primary)/30 hover:border-(--primary)/70"
                                                              : "opacity-20 border border-(--surface-background) cursor-not-allowed"
                                                    }`}
                                                >
                                                    {isBoss && (
                                                        <span
                                                            className="absolute -top-1 -right-1 px-1 rounded text-[9px] font-bold leading-tight"
                                                            style={{
                                                                background:
                                                                    "#b45309",
                                                                color: "#fff",
                                                            }}
                                                        >
                                                            BOSS
                                                        </span>
                                                    )}
                                                    <span>{floor}</span>
                                                    {progress >= floor && !isActive && (
                                                        <span
                                                            className="text-[9px] opacity-50"
                                                            style={{
                                                                lineHeight: 1,
                                                            }}
                                                        >
                                                            ✓
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Inventory overlay (slides from right) ── */}
                <div
                    className="absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out"
                    style={{
                        bottom: 56,
                        transform:
                            screen === "inventory"
                                ? "translateX(0)"
                                : "translateX(100%)",
                        background: "var(--surface-background, #fff)",
                    }}
                >
                    <div className="flex flex-col flex-1 min-h-0">
                        {/* Equipped + stats */}
                        <div className="shrink-0 px-4 pt-3 pb-2 border-b border-(--surface-background)/50">
                            <div className="text-xs font-semibold uppercase opacity-40 tracking-wider mb-1.5">
                                Equipped
                            </div>
                            <div className="flex flex-col gap-1">
                                {SLOT_ORDER.map((slot) => {
                                    const inv = equippedItems.find((i) =>
                                        SLOT_TYPES[slot]?.includes(i.type),
                                    );
                                    if (!inv)
                                        return (
                                            <div
                                                key={slot}
                                                className="flex items-center gap-2 min-w-0 opacity-20"
                                            >
                                                <span
                                                    className="shrink-0"
                                                    style={{ fontSize: 11 }}
                                                >
                                                    {SLOT_EMOJI[slot]}
                                                </span>
                                                <span className="text-xs italic capitalize">
                                                    No {slot} equipped
                                                </span>
                                            </div>
                                        );
                                    const color =
                                        RARITY_COLORS[inv.rarity] ?? "#aaa";
                                    return (
                                        <div
                                            key={`${inv.source}-${inv.id}`}
                                            className="flex items-center gap-2 min-w-0"
                                        >
                                            <span
                                                className="shrink-0"
                                                style={{ fontSize: 11 }}
                                            >
                                                {SLOT_EMOJI[slot] ?? "▪"}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    setSelectedItem(inv)
                                                }
                                                className="text-xs font-medium truncate flex-1 text-left cursor-pointer hover:underline decoration-dotted"
                                                style={{ color }}
                                            >
                                                {inv.name}
                                            </button>
                                            {inv.source === "weapon" &&
                                                inv.level != null && (
                                                    <span className="shrink-0 text-xs opacity-40 ml-1">
                                                        Lv.{inv.level}
                                                        {inv.totalRating !=
                                                            null && (
                                                            <span className="ml-1">
                                                                ⚡
                                                                {Math.round(
                                                                    inv.totalRating *
                                                                        (1 +
                                                                            Math.log(
                                                                                inv.level +
                                                                                    1,
                                                                            ) *
                                                                                2),
                                                                )}
                                                            </span>
                                                        )}
                                                    </span>
                                                )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-3 mt-2 pt-2 border-t border-(--surface-background)/40 text-xs">
                                <span>
                                    <span className="font-bold">
                                        {character.attack +
                                            (character.magic ?? 0)}
                                    </span>{" "}
                                    <span className="opacity-40">ATK</span>
                                </span>
                                <span>
                                    <span className="font-bold">
                                        {character.defense}
                                    </span>{" "}
                                    <span className="opacity-40">DEF</span>
                                </span>
                                <span>
                                    <span className="font-bold">
                                        {character.maxHp}
                                    </span>{" "}
                                    <span className="opacity-40">HP</span>
                                </span>
                                {(character.speed ?? 0) > 0 && (
                                    <span>
                                        <span className="font-bold">
                                            {calcAttacksPerSec(
                                                character,
                                            ).toFixed(2)}
                                            /s
                                        </span>{" "}
                                        <span className="opacity-40">SPD</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Comparison panel */}
                        <div
                            className="shrink-0 overflow-hidden border-b border-(--surface-background)/50"
                            style={{
                                maxHeight: selectedItem ? 500 : 0,
                                opacity: selectedItem ? 1 : 0,
                                transition:
                                    "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out",
                            }}
                            onTransitionEnd={() => {
                                if (!selectedItem) setPanelItem(null);
                            }}
                        >
                            {panelItem &&
                                (() => {
                                    const isViewingEquipped =
                                        panelItem.equipped;
                                    const equippedStats =
                                        !isViewingEquipped && equippedInSlot
                                            ? getItemStats(equippedInSlot)
                                            : {};
                                    const selStats = getItemStats(panelItem);
                                    const allKeys = [
                                        ...new Set([
                                            ...Object.keys(equippedStats),
                                            ...Object.keys(selStats),
                                        ]),
                                    ].filter(
                                        (k) =>
                                            (equippedStats[k] ?? 0) !== 0 ||
                                            (selStats[k] ?? 0) !== 0,
                                    );
                                    return (
                                        <div className="px-4 pt-3 pb-3 bg-(--surface-background)/30">
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-xs font-semibold uppercase opacity-40 tracking-wider">
                                                    {isViewingEquipped
                                                        ? "Equipped Item"
                                                        : "Compare"}
                                                </span>
                                                {panelItem.source ===
                                                    "weapon" &&
                                                    panelItem.parts && (
                                                        <button
                                                            onClick={() =>
                                                                setDetailItem(
                                                                    panelItem,
                                                                )
                                                            }
                                                            className="text-xs opacity-40 hover:opacity-80 cursor-pointer"
                                                        >
                                                            Parts ▸
                                                        </button>
                                                    )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                {/* Equipped side */}
                                                <div className="space-y-1">
                                                    <div
                                                        className="opacity-40 font-semibold uppercase tracking-wider"
                                                        style={{ fontSize: 10 }}
                                                    >
                                                        {isViewingEquipped
                                                            ? selectedSlot
                                                                ? `${SLOT_EMOJI[selectedSlot]} If Unequipped`
                                                                : "If Unequipped"
                                                            : selectedSlot
                                                              ? `${SLOT_EMOJI[selectedSlot]} Equipped`
                                                              : "Equipped"}
                                                    </div>
                                                    {!isViewingEquipped &&
                                                    equippedInSlot ? (
                                                        <>
                                                            <div
                                                                className="font-medium leading-tight truncate"
                                                                style={{
                                                                    color:
                                                                        RARITY_COLORS[
                                                                            equippedInSlot
                                                                                .rarity
                                                                        ] ??
                                                                        "#aaa",
                                                                }}
                                                            >
                                                                {
                                                                    equippedInSlot.name
                                                                }
                                                            </div>
                                                            <div className="opacity-40 truncate">
                                                                {equippedInSlot.source ===
                                                                "weapon"
                                                                    ? `${equippedInSlot.typeLabel} · Lv.${equippedInSlot.level}`
                                                                    : equippedInSlot.type}
                                                                {equippedInSlot.totalRating !=
                                                                    null &&
                                                                    ` · ⚡${Math.round(equippedInSlot.totalRating * (1 + Math.log(equippedInSlot.level + 1) * 2))}`}
                                                            </div>
                                                            {allKeys.map(
                                                                (k) => (
                                                                    <div
                                                                        key={k}
                                                                        className="opacity-60"
                                                                    >
                                                                        {equippedStats[
                                                                            k
                                                                        ] !=
                                                                        null
                                                                            ? `${equippedStats[k] > 0 ? "+" : ""}${equippedStats[k]}`
                                                                            : "—"}{" "}
                                                                        {k}
                                                                    </div>
                                                                ),
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="opacity-30 italic">
                                                            {isViewingEquipped
                                                                ? `No ${selectedSlot ?? "item"}`
                                                                : "Nothing equipped"}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Selected side */}
                                                <div className="space-y-1">
                                                    <div
                                                        className="opacity-40 font-semibold uppercase tracking-wider"
                                                        style={{ fontSize: 10 }}
                                                    >
                                                        {isViewingEquipped
                                                            ? "Equipped"
                                                            : "Selected"}
                                                    </div>
                                                    <div
                                                        className="font-medium leading-tight truncate"
                                                        style={{
                                                            color:
                                                                RARITY_COLORS[
                                                                    panelItem
                                                                        .rarity
                                                                ] ?? "#aaa",
                                                        }}
                                                    >
                                                        {panelItem.name}
                                                    </div>
                                                    <div className="opacity-40 truncate">
                                                        {panelItem.source ===
                                                        "weapon"
                                                            ? `${panelItem.typeLabel} · Lv.${panelItem.level}`
                                                            : panelItem.type}
                                                        {panelItem.totalRating !=
                                                            null &&
                                                            ` · ⚡${Math.round(panelItem.totalRating * (1 + Math.log(panelItem.level + 1) * 2))}`}
                                                    </div>
                                                    {allKeys.map((k) => {
                                                        const curr =
                                                            equippedStats[k] ??
                                                            0;
                                                        const next =
                                                            selStats[k] ?? 0;
                                                        const delta =
                                                            next - curr;
                                                        return (
                                                            <div
                                                                key={k}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <span className="opacity-60">
                                                                    {next > 0
                                                                        ? "+"
                                                                        : ""}
                                                                    {next} {k}
                                                                </span>
                                                                {!isViewingEquipped &&
                                                                    equippedInSlot &&
                                                                    delta !==
                                                                        0 && (
                                                                        <span
                                                                            className="font-bold"
                                                                            style={{
                                                                                fontSize: 10,
                                                                                color:
                                                                                    delta >
                                                                                    0
                                                                                        ? "#22c55e"
                                                                                        : "#ef4444",
                                                                            }}
                                                                        >
                                                                            {delta >
                                                                            0
                                                                                ? "▲"
                                                                                : "▼"}
                                                                            {Math.abs(
                                                                                delta,
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                {isViewingEquipped &&
                                                                    delta !==
                                                                        0 && (
                                                                        <span
                                                                            className="font-bold"
                                                                            style={{
                                                                                fontSize: 10,
                                                                                color:
                                                                                    delta <
                                                                                    0
                                                                                        ? "#ef4444"
                                                                                        : "#22c55e",
                                                                            }}
                                                                        >
                                                                            {delta <
                                                                            0
                                                                                ? "▼"
                                                                                : "▲"}
                                                                            {Math.abs(
                                                                                delta,
                                                                            )}
                                                                        </span>
                                                                    )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() =>
                                                        setSelectedItem(null)
                                                    }
                                                    className="flex-1 text-xs px-3 py-1.5 rounded border border-(--surface-background) opacity-50 hover:opacity-80 cursor-pointer transition-opacity"
                                                >
                                                    Back
                                                </button>
                                                {isViewingEquipped ? (
                                                    <button
                                                        onClick={() =>
                                                            handleEquip(
                                                                panelItem.id,
                                                                false,
                                                                panelItem.source,
                                                            )
                                                        }
                                                        className="flex-1 text-xs px-3 py-1.5 rounded border border-(--primary)/40 text-(--primary) hover:bg-(--primary)/10 cursor-pointer transition-colors font-semibold"
                                                    >
                                                        Unequip
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                handleDiscard(
                                                                    panelItem.id,
                                                                    panelItem.source,
                                                                );
                                                                setSelectedItem(
                                                                    null,
                                                                );
                                                            }}
                                                            className="flex-1 text-xs px-3 py-1.5 rounded border border-red-500/40 text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
                                                        >
                                                            Throw Away
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleEquip(
                                                                    panelItem.id,
                                                                    true,
                                                                    panelItem.source,
                                                                )
                                                            }
                                                            className="flex-1 text-xs px-3 py-1.5 rounded border border-(--primary)/40 text-(--primary) hover:bg-(--primary)/10 cursor-pointer transition-colors font-semibold"
                                                        >
                                                            Equip
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                        </div>

                        {/* Filter + sort controls */}
                        <div className="shrink-0 px-3 py-1.5 border-b border-(--surface-background)/50 space-y-1">
                            {/* Slot filter */}
                            <div className="flex gap-1 overflow-x-auto no-scrollbar">
                                {["all", "weapon", "chest", "helm", "legs"].map(
                                    (slot) => (
                                        <button
                                            key={slot}
                                            onClick={() =>
                                                setInvFilterSlot(slot)
                                            }
                                            className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize cursor-pointer transition-colors ${
                                                invFilterSlot === slot
                                                    ? "bg-(--primary) text-white"
                                                    : "border border-(--primary)/25 opacity-50 hover:opacity-80"
                                            }`}
                                        >
                                            {slot}
                                        </button>
                                    ),
                                )}
                            </div>
                            {/* Rarity filter + sort */}
                            <div className="flex gap-1 items-center">
                                <div className="flex gap-1 overflow-x-auto no-scrollbar flex-1">
                                    {[
                                        "all",
                                        "common",
                                        "uncommon",
                                        "rare",
                                        "epic",
                                        "legendary",
                                    ].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() =>
                                                setInvFilterRarity(r)
                                            }
                                            className="shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-opacity capitalize"
                                            style={{
                                                background:
                                                    r === "all"
                                                        ? undefined
                                                        : `${RARITY_COLORS[r]}22`,
                                                color:
                                                    r === "all"
                                                        ? undefined
                                                        : RARITY_COLORS[r],
                                                border: `1px solid ${r === "all" ? "transparent" : RARITY_COLORS[r] + "66"}`,
                                                opacity:
                                                    invFilterRarity === r
                                                        ? 1
                                                        : 0.4,
                                                fontWeight:
                                                    invFilterRarity === r
                                                        ? 700
                                                        : 500,
                                            }}
                                        >
                                            {r === "all"
                                                ? "All"
                                                : r.slice(0, 1).toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                <select
                                    value={invSort}
                                    onChange={(e) => setInvSort(e.target.value)}
                                    className="shrink-0 text-xs px-1.5 py-1 rounded border border-(--surface-background) bg-(--accent) cursor-pointer opacity-70"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="rarity-high">
                                        Rarity ↓
                                    </option>
                                    <option value="rarity-low">Rarity ↑</option>
                                    <option value="level-high">Level ↓</option>
                                    <option value="level-low">Level ↑</option>
                                    <option value="power-high">Power ↓</option>
                                    <option value="power-low">Power ↑</option>
                                </select>
                                <button
                                    onClick={() =>
                                        setInvView((v) =>
                                            v === "list" ? "grid" : "list",
                                        )
                                    }
                                    className="shrink-0 ml-1 opacity-50 hover:opacity-90 cursor-pointer transition-opacity"
                                    title={
                                        invView === "list"
                                            ? "Grid view"
                                            : "List view"
                                    }
                                >
                                    {invView === "list" ? (
                                        <IconGrid />
                                    ) : (
                                        <IconList />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Inventory grid */}
                        <div className="flex-1 overflow-y-auto px-4 py-3">
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs opacity-40">
                                    {filteredItems.length} of{" "}
                                    {unequippedItems.length} items
                                </span>
                                {filteredItems.length > 0 && (
                                    <button
                                        onClick={() =>
                                            handleDiscardAll(filteredItems)
                                        }
                                        className={`text-xs px-2 py-0.5 rounded border cursor-pointer transition-colors ${
                                            discardAllPending
                                                ? "border-red-400 text-red-400 bg-red-400/10 font-semibold"
                                                : "border-red-300/40 text-red-400/60 hover:text-red-400 hover:border-red-400/60"
                                        }`}
                                    >
                                        {(() => {
                                            const unlocked =
                                                filteredItems.filter(
                                                    (i) =>
                                                        !lockedItems.has(
                                                            `${i.source}-${i.id}`,
                                                        ),
                                                );
                                            return discardAllPending
                                                ? `Confirm? (${unlocked.length})`
                                                : "Remove All";
                                        })()}
                                    </button>
                                )}
                            </div>
                            {filteredItems.length === 0 ? (
                                <div className="opacity-30 text-sm text-center py-8">
                                    {unequippedItems.length === 0
                                        ? "No items yet. Go kill some stuff!"
                                        : "No items match filters."}
                                </div>
                            ) : invView === "grid" ? (
                                <div className="grid grid-cols-4 gap-1.5">
                                    {filteredItems.map((inv) => {
                                        const color =
                                            RARITY_COLORS[inv.rarity] ?? "#aaa";
                                        const slot = getItemSlot(inv);
                                        const isSelected =
                                            selectedItem?.id === inv.id &&
                                            selectedItem?.source === inv.source;
                                        const itemKey = `${inv.source}-${inv.id}`;
                                        const isPendingDiscard =
                                            pendingDiscardKey === itemKey;
                                        const isLocked =
                                            lockedItems.has(itemKey);
                                        return (
                                            <div
                                                key={itemKey}
                                                onClick={() => {
                                                    if (pendingDiscardKey) {
                                                        setPendingDiscardKey(
                                                            null,
                                                        );
                                                        clearTimeout(
                                                            pendingDiscardTimerRef.current,
                                                        );
                                                        return;
                                                    }
                                                    setSelectedItem(
                                                        isSelected ? null : inv,
                                                    );
                                                }}
                                                className="relative flex flex-col items-center justify-center p-1.5 rounded-lg border cursor-pointer"
                                                style={{
                                                    aspectRatio: "1",
                                                    borderColor: isSelected
                                                        ? color
                                                        : `${color}40`,
                                                    background: isSelected
                                                        ? `${color}20`
                                                        : `${color}0d`,
                                                }}
                                            >
                                                <span style={{ fontSize: 22 }}>
                                                    {SLOT_EMOJI[slot] ?? "▪"}
                                                </span>
                                                <span
                                                    className="text-center leading-tight mt-0.5 w-full truncate"
                                                    style={{
                                                        color,
                                                        fontSize: 9,
                                                    }}
                                                >
                                                    {inv.name}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleLock(itemKey);
                                                    }}
                                                    className="absolute top-0.5 left-0.5 cursor-pointer leading-none"
                                                    style={{
                                                        fontSize: 10,
                                                        opacity: isLocked
                                                            ? 0.9
                                                            : 0.2,
                                                    }}
                                                    title={
                                                        isLocked
                                                            ? "Unlock"
                                                            : "Lock"
                                                    }
                                                >
                                                    🔒
                                                </button>
                                                {!isLocked && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (
                                                                isPendingDiscard
                                                            ) {
                                                                handleDiscard(
                                                                    inv.id,
                                                                    inv.source,
                                                                );
                                                                clearTimeout(
                                                                    pendingDiscardTimerRef.current,
                                                                );
                                                            } else {
                                                                setPendingDiscardKey(
                                                                    itemKey,
                                                                );
                                                                clearTimeout(
                                                                    pendingDiscardTimerRef.current,
                                                                );
                                                                pendingDiscardTimerRef.current =
                                                                    setTimeout(
                                                                        () =>
                                                                            setPendingDiscardKey(
                                                                                null,
                                                                            ),
                                                                        3000,
                                                                    );
                                                            }
                                                        }}
                                                        className="absolute top-0.5 right-0.5 cursor-pointer leading-none"
                                                        style={{
                                                            fontSize: 11,
                                                            color: isPendingDiscard
                                                                ? "#ef4444"
                                                                : undefined,
                                                            opacity:
                                                                isPendingDiscard
                                                                    ? 1
                                                                    : 0.25,
                                                        }}
                                                        title="Discard"
                                                    >
                                                        {isPendingDiscard
                                                            ? "?"
                                                            : "×"}
                                                    </button>
                                                )}
                                                {inv.source === "weapon" &&
                                                    inv.parts && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDetailItem(
                                                                    inv,
                                                                );
                                                            }}
                                                            className="absolute bottom-0.5 right-0.5 cursor-pointer leading-none opacity-25 hover:opacity-80"
                                                            title="View parts"
                                                            style={{
                                                                fontSize: 10,
                                                            }}
                                                        >
                                                            👁
                                                        </button>
                                                    )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1.5">
                                    {filteredItems.map((inv) => {
                                        const color =
                                            RARITY_COLORS[inv.rarity] ?? "#aaa";
                                        const isWeapon =
                                            inv.source === "weapon";
                                        const isSelected =
                                            selectedItem?.id === inv.id &&
                                            selectedItem?.source === inv.source;
                                        const itemKey = `${inv.source}-${inv.id}`;
                                        const isSwipedOpen =
                                            swipedOpenKey === itemKey;
                                        const isLocked =
                                            lockedItems.has(itemKey);
                                        return (
                                            <div
                                                key={itemKey}
                                                className="relative overflow-hidden rounded-lg"
                                            >
                                                {/* Delete button revealed by swipe — hidden for locked items */}
                                                {isSwipedOpen && !isLocked && (
                                                    <div
                                                        className="absolute right-0 top-0 bottom-0 flex items-center justify-center"
                                                        style={{
                                                            width: 72,
                                                            background:
                                                                "#ef4444",
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() => {
                                                                handleDiscard(
                                                                    inv.id,
                                                                    inv.source,
                                                                );
                                                                setSwipedOpenKey(
                                                                    null,
                                                                );
                                                            }}
                                                            className="text-white text-xs font-semibold w-full h-full cursor-pointer"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                                {/* Item row — slides left on swipe */}
                                                <div
                                                    className="flex justify-between items-center px-3 py-2 border cursor-pointer transition-colors"
                                                    style={{
                                                        position: "relative",
                                                        zIndex: 1,
                                                        borderLeftColor: color,
                                                        borderLeftWidth: 3,
                                                        borderColor: isSelected
                                                            ? `${color}60`
                                                            : undefined,
                                                        background: isSelected
                                                            ? `${color}12`
                                                            : "var(--surface-background, #fff)",
                                                        transform: `translateX(${isSwipedOpen ? -72 : 0}px)`,
                                                        transition:
                                                            "transform 0.2s ease",
                                                    }}
                                                    onTouchStart={(e) => {
                                                        swipeTouchStartX.current =
                                                            e.touches[0].clientX;
                                                        swipeWasMove.current = false;
                                                    }}
                                                    onTouchEnd={(e) => {
                                                        const dx =
                                                            e.changedTouches[0]
                                                                .clientX -
                                                            (swipeTouchStartX.current ??
                                                                e
                                                                    .changedTouches[0]
                                                                    .clientX);
                                                        if (Math.abs(dx) > 8)
                                                            swipeWasMove.current = true;
                                                        if (
                                                            !isLocked &&
                                                            dx < -60
                                                        )
                                                            setSwipedOpenKey(
                                                                itemKey,
                                                            );
                                                        else if (dx > 20)
                                                            setSwipedOpenKey(
                                                                null,
                                                            );
                                                    }}
                                                    onClick={() => {
                                                        if (
                                                            swipeWasMove.current
                                                        ) {
                                                            swipeWasMove.current = false;
                                                            return;
                                                        }
                                                        if (isSwipedOpen) {
                                                            setSwipedOpenKey(
                                                                null,
                                                            );
                                                            return;
                                                        }
                                                        setSelectedItem(
                                                            isSelected
                                                                ? null
                                                                : inv,
                                                        );
                                                    }}
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <div
                                                                className="text-sm font-medium truncate flex-1"
                                                                style={{
                                                                    color,
                                                                }}
                                                            >
                                                                {inv.name}
                                                            </div>
                                                            <button
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    toggleLock(
                                                                        itemKey,
                                                                    );
                                                                }}
                                                                className="shrink-0 cursor-pointer leading-none"
                                                                style={{
                                                                    fontSize: 12,
                                                                    opacity:
                                                                        isLocked
                                                                            ? 0.9
                                                                            : 0.2,
                                                                }}
                                                                title={
                                                                    isLocked
                                                                        ? "Unlock"
                                                                        : "Lock"
                                                                }
                                                            >
                                                                🔒
                                                            </button>
                                                            {isWeapon &&
                                                                inv.parts && (
                                                                    <button
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            setDetailItem(
                                                                                inv,
                                                                            );
                                                                        }}
                                                                        className="shrink-0 opacity-30 hover:opacity-80 cursor-pointer leading-none"
                                                                        title="View parts"
                                                                        style={{
                                                                            fontSize: 14,
                                                                        }}
                                                                    >
                                                                        👁
                                                                    </button>
                                                                )}
                                                        </div>
                                                        {isWeapon ? (
                                                            <>
                                                                <div className="text-xs opacity-50">
                                                                    {
                                                                        inv.typeLabel
                                                                    }{" "}
                                                                    · Lv.
                                                                    {
                                                                        inv.level
                                                                    }{" "}
                                                                    ·{" "}
                                                                    {inv.origin}
                                                                    {inv.totalRating !=
                                                                        null && (
                                                                        <span className="ml-1.5 opacity-70">
                                                                            ⚡
                                                                            {Math.round(
                                                                                inv.totalRating *
                                                                                    (1 +
                                                                                        Math.log(
                                                                                            inv.level +
                                                                                                1,
                                                                                        ) *
                                                                                            2),
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs opacity-40">
                                                                    {Object.entries(
                                                                        inv.stats,
                                                                    )
                                                                        .filter(
                                                                            ([
                                                                                ,
                                                                                v,
                                                                            ]) =>
                                                                                v !==
                                                                                0,
                                                                        )
                                                                        .map(
                                                                            ([
                                                                                k,
                                                                                v,
                                                                            ]) =>
                                                                                `${v > 0 ? "+" : ""}${v} ${k}`,
                                                                        )
                                                                        .join(
                                                                            ", ",
                                                                        )}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="text-xs opacity-50 capitalize">
                                                                    {inv.type} ·
                                                                    ×
                                                                    {
                                                                        inv.quantity
                                                                    }
                                                                </div>
                                                                {inv.statBonus && (
                                                                    <div className="text-xs opacity-40">
                                                                        {Object.entries(
                                                                            inv.statBonus,
                                                                        )
                                                                            .map(
                                                                                ([
                                                                                    k,
                                                                                    v,
                                                                                ]) =>
                                                                                    `+${v} ${k}`,
                                                                            )
                                                                            .join(
                                                                                ", ",
                                                                            )}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Log overlay (slides from right) ── */}
                <div
                    className="absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out"
                    style={{
                        bottom: 56,
                        transform:
                            screen === "log"
                                ? "translateX(0)"
                                : "translateX(100%)",
                        background: "var(--surface-background, #fff)",
                    }}
                >
                    <div className="shrink-0 px-4 pt-4 pb-2 border-b border-(--surface-background)/50">
                        <div className="text-xs font-semibold uppercase opacity-40 tracking-wider">
                            Event Log
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-3">
                        {log.length === 0 ? (
                            <div className="opacity-30 text-sm text-center py-8">
                                Nothing yet.
                            </div>
                        ) : (
                            <div className="flex flex-col-reverse gap-0.5">
                                {[...log].reverse().map((entry, i) => (
                                    <div
                                        key={i}
                                        className="text-xs font-mono opacity-60"
                                    >
                                        {entry}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Parts detail modal ── */}
                <div
                    className="absolute inset-0 z-50 flex flex-col justify-end transition-opacity duration-300"
                    style={{
                        opacity: detailItem ? 1 : 0,
                        pointerEvents: detailItem ? "auto" : "none",
                    }}
                    onClick={() => setDetailItem(null)}
                >
                    <div className="absolute inset-0 bg-black/50" />
                    <div
                        className="relative rounded-t-2xl flex flex-col transition-transform duration-300 ease-in-out"
                        style={{
                            maxHeight: "75%",
                            background: "var(--accent, #fff)",
                            transform: detailItem
                                ? "translateY(0)"
                                : "translateY(100%)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onTransitionEnd={() => {
                            if (!detailItem) setPanelDetailItem(null);
                        }}
                    >
                        {panelDetailItem && (
                            <>
                                <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-(--surface-background)/50 shrink-0">
                                    <div className="min-w-0 pr-3">
                                        <div
                                            className="font-semibold truncate"
                                            style={{
                                                color:
                                                    RARITY_COLORS[
                                                        panelDetailItem.rarity
                                                    ] ?? "#aaa",
                                            }}
                                        >
                                            {panelDetailItem.name}
                                        </div>
                                        <div className="text-xs opacity-50 mt-0.5">
                                            {panelDetailItem.typeLabel} · Lv.
                                            {panelDetailItem.level} ·{" "}
                                            {panelDetailItem.origin}
                                            {panelDetailItem.totalRating !=
                                                null &&
                                                ` · ⚡${Math.round(panelDetailItem.totalRating * (1 + Math.log(panelDetailItem.level + 1) * 2))}`}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setDetailItem(null)}
                                        className="text-xl opacity-40 hover:opacity-70 cursor-pointer leading-none shrink-0"
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="overflow-y-auto flex-1 px-4 py-3 space-y-4">
                                    {Object.entries(
                                        panelDetailItem.parts ?? {},
                                    ).map(([key, part]) => {
                                        const label = key
                                            .split("_")
                                            .map(
                                                (w) =>
                                                    w.charAt(0).toUpperCase() +
                                                    w.slice(1),
                                            )
                                            .join(" ");
                                        const statEntries = Object.entries(
                                            part.stats,
                                        ).filter(([, v]) => v !== 0);
                                        return (
                                            <div key={key}>
                                                <div className="text-xs font-semibold uppercase tracking-wider opacity-30 mb-1">
                                                    {label}
                                                </div>
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-medium truncate">
                                                            {part.name}
                                                        </div>
                                                        <div
                                                            className="text-xs mt-0.5"
                                                            style={{
                                                                color:
                                                                    ORIGIN_COLORS[
                                                                        part
                                                                            .origin
                                                                    ] ?? "#aaa",
                                                                opacity: 0.8,
                                                            }}
                                                        >
                                                            {part.origin}
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <div className="text-xs opacity-40">
                                                            Rating {part.rating}
                                                        </div>
                                                        {statEntries.length >
                                                            0 && (
                                                            <div className="text-xs opacity-60 mt-0.5">
                                                                {statEntries
                                                                    .map(
                                                                        ([
                                                                            k,
                                                                            v,
                                                                        ]) =>
                                                                            `${v > 0 ? "+" : ""}${v} ${k}`,
                                                                    )
                                                                    .join(
                                                                        " · ",
                                                                    )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Bottom navbar ── */}
                <div
                    className="absolute bottom-0 left-0 right-0 flex border-t border-(--surface-background)"
                    style={{
                        height: 56,
                        background: "var(--surface-background, #fff)",
                        transition: "transform 0.3s ease-in-out",
                        transform: "translateY(0)",
                    }}
                >
                    <button
                        onClick={() => toggleScreen("map")}
                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
                            screen === "map"
                                ? "text-(--primary)"
                                : "opacity-40 hover:opacity-70"
                        }`}
                    >
                        <IconMap />
                        <span className="text-xs font-medium">Map</span>
                    </button>
                    <button
                        onClick={() => toggleScreen("inventory")}
                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
                            screen === "inventory"
                                ? "text-(--primary)"
                                : "opacity-40 hover:opacity-70"
                        }`}
                    >
                        <div className="relative">
                            <IconBag />
                            {unviewedItems > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                                    {unviewedItems > 99 ? "99+" : unviewedItems}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-medium">Inventory</span>
                    </button>
                    <button
                        onClick={() => toggleScreen("log")}
                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
                            screen === "log"
                                ? "text-(--primary)"
                                : "opacity-40 hover:opacity-70"
                        }`}
                    >
                        <IconScroll />
                        <span className="text-xs font-medium">Log</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
