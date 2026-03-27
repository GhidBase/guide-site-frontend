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

function calcKillsInInterval(character, enemy, seconds) {
    const attack = character.attack ?? character.baseAttack;
    const dmg = Math.max(1, attack - enemy.defense);
    const hitsToKill = Math.ceil(enemy.hp / dmg);
    return Math.floor(seconds / hitsToKill);
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
                    <div className="font-semibold text-(--primary)">Welcome back!</div>
                    <div className="text-sm opacity-70">
                        Away for {formatDuration(gains.secondsOffline)} — kept fighting {gains.enemyName}.
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
                    <div className="font-bold">{gains.kills.toLocaleString()}</div>
                    <div className="text-xs opacity-60">Kills</div>
                </div>
                <div className="text-center">
                    <div className="font-bold">+{gains.xpGained.toLocaleString()}</div>
                    <div className="text-xs opacity-60">XP</div>
                </div>
                <div className="text-center">
                    <div className="font-bold">{gains.levelUps > 0 ? `+${gains.levelUps}` : "—"}</div>
                    <div className="text-xs opacity-60">Levels</div>
                </div>
            </div>
            {gains.drops.length > 0 && (
                <div className="border-t border-(--primary)/20 pt-3 flex flex-wrap gap-2">
                    {gains.drops.map((d, i) => (
                        <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-full border"
                            style={{ color: RARITY_COLORS[d.rarity] ?? "#aaa", borderColor: RARITY_COLORS[d.rarity] ?? "#aaa" }}
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
                <span className="opacity-70">{xp} / {xpNeeded} XP</span>
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
        <div ref={ref} className="h-full overflow-y-auto text-xs opacity-60 space-y-0.5 font-mono">
            {entries.map((e, i) => (
                <div key={i}>{e}</div>
            ))}
        </div>
    );
}

function IconSettings() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    );
}

function IconMap() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" y1="3" x2="9" y2="18" />
            <line x1="15" y1="6" x2="15" y2="21" />
        </svg>
    );
}

function IconBag() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    );
}

// ── main component ───────────────────────────────────────────────────────────

export default function IdleGame() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [character, setCharacter] = useState(null);
    const [zones, setZones] = useState([]);
    const [enemies, setEnemies] = useState([]);
    const [selectedEnemy, setSelectedEnemy] = useState(null);
    const [recentDrops, setRecentDrops] = useState([]);
    const [offlineGains, setOfflineGains] = useState(null);
    const [log, setLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [screen, setScreen] = useState(null); // null | "map" | "inventory"
    const [showSettings, setShowSettings] = useState(false);

    const [attacking, setAttacking] = useState(false);
    const attackTimerRef = useRef(null);

    const localKillsRef = useRef(0);
    const tickStartRef = useRef(Date.now());
    const serverTickRef = useRef(null);

    const addLog = useCallback((msg) => {
        const time = new Date().toLocaleTimeString("en-US", { hour12: false });
        setLog((prev) => [...prev.slice(-99), `[${time}] ${msg}`]);
    }, []);

    // ── Load character + zones on mount ──
    useEffect(() => {
        if (!isAuthenticated) return;
        (async () => {
            try {
                const [charRes, zonesRes] = await Promise.all([
                    fetch(`${currentAPI}/idle/character`, { credentials: "include" }),
                    fetch(`${currentAPI}/idle/zones`, { credentials: "include" }),
                ]);
                if (!charRes.ok) throw new Error(`Server error: ${charRes.status}`);
                const { character: charData, offlineGains: gains } = await charRes.json();
                const zonesData = await zonesRes.json();
                setCharacter(charData);
                setZones(zonesData);
                if (gains) {
                    setOfflineGains(gains);
                    addLog(`Offline: killed ${gains.kills}× ${gains.enemyName} (+${gains.xpGained} XP)`);
                    if (gains.levelUps > 0) addLog(`⬆ Leveled up ${gains.levelUps}× while away!`);
                }
                addLog("Character loaded.");
            } catch (e) {
                setFetchError(e.message || "Failed to load character.");
            } finally {
                setLoading(false);
            }
        })();
    }, [isAuthenticated, addLog]);

    // ── Load enemies when zone changes ──
    useEffect(() => {
        if (!character) return;
        (async () => {
            const res = await fetch(
                `${currentAPI}/idle/enemies?zone=${character.currentZone}`,
                { credentials: "include" }
            );
            const data = await res.json();
            setEnemies(data);
            setSelectedEnemy((prev) => {
                if (prev) {
                    const stillValid = data.find((e) => e.id === prev.id);
                    if (stillValid) return stillValid;
                }
                const last = character.currentEnemyId
                    ? data.find((e) => e.id === character.currentEnemyId)
                    : null;
                return last ?? data[0] ?? null;
            });
        })();
    }, [character?.currentZone]);

    // ── Visual attack pulse ──
    useEffect(() => {
        if (!selectedEnemy || !character) {
            clearInterval(attackTimerRef.current);
            return;
        }
        const dmg = Math.max(1, character.attack - selectedEnemy.defense);
        const hitsToKill = Math.ceil(selectedEnemy.hp / dmg);

        clearInterval(attackTimerRef.current);
        attackTimerRef.current = setInterval(() => {
            setAttacking(true);
            setTimeout(() => setAttacking(false), 200);
            localKillsRef.current += 1 / hitsToKill;
        }, 1000);

        return () => clearInterval(attackTimerRef.current);
    }, [selectedEnemy, character?.attack, character?.baseAttack]);

    // ── Server sync tick ──
    useEffect(() => {
        if (!selectedEnemy || !character) return;

        const sync = async () => {
            const now = Date.now();
            const durationSeconds = (now - tickStartRef.current) / 1000;
            const kills = Math.floor(localKillsRef.current);
            localKillsRef.current = 0;
            tickStartRef.current = now;

            if (kills === 0) return;

            try {
                const res = await fetch(`${currentAPI}/idle/character/tick`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ enemyId: selectedEnemy.id, kills, durationSeconds }),
                });
                const data = await res.json();
                if (!res.ok) return;

                setCharacter(data.character);

                if (data.drops?.length > 0) {
                    setRecentDrops(data.drops);
                    setTimeout(() => setRecentDrops([]), 4000);
                    for (const d of data.drops) addLog(`Dropped: ${d.count}× ${d.name}`);
                }

                if (data.levelUps > 0) addLog(`⬆ Leveled up! Now level ${data.character.level}`);
                addLog(`Killed ${data.killsProcessed}× ${selectedEnemy.name} (+${data.xpGained} XP)`);
            } catch {
                // silently ignore network errors in the tick loop
            }
        };

        serverTickRef.current = setInterval(sync, TICK_INTERVAL);
        return () => clearInterval(serverTickRef.current);
    }, [selectedEnemy, character?.id, addLog]);

    // ── Zone change ──
    async function handleZoneChange(zone) {
        const res = await fetch(`${currentAPI}/idle/character/zone`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ zone }),
        });
        if (res.ok) {
            const data = await res.json();
            setCharacter(data);
            addLog(`Moved to ${zone}.`);
        }
    }

    // ── Equip/unequip ──
    async function handleEquip(inventoryItemId, equipped, source) {
        const res = await fetch(`${currentAPI}/idle/character/equip/${inventoryItemId}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ equipped, source }),
        });
        if (res.ok) {
            const data = await res.json();
            setCharacter(data);
            addLog(equipped ? "Item equipped." : "Item unequipped.");
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
            addLog("Item discarded.");
        }
    }

    function toggleScreen(name) {
        setScreen((s) => (s === name ? null : name));
        setShowSettings(false);
    }

    // ── Render states ──
    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center h-64 text-(--text-color) opacity-50">
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-(--text-color)">
                <p className="text-lg font-semibold">You need to be logged in to play.</p>
                <a href="/login" className="text-(--primary) underline">Log in</a>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-2 text-(--text-color)">
                <p className="font-semibold">Failed to load game</p>
                <p className="text-sm opacity-50">{fetchError}</p>
                <p className="text-xs opacity-40">Make sure the backend is running.</p>
            </div>
        );
    }

    if (!character) return null;

    const equippedItems = character.inventory.filter((i) => i.equipped);
    const unequippedItems = character.inventory.filter((i) => !i.equipped);

    return (
        <div className="text-(--text-color)" style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
            <OfflineSummary gains={offlineGains} onDismiss={() => setOfflineGains(null)} />
            {/* Game frame */}
            <div
                className="relative overflow-hidden flex-1"
            >
                {/* ── Battle screen (base layer) ── */}
                <div className="absolute inset-0 flex flex-col" style={{ bottom: 56 }}>
                    {/* Header bar */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
                        <XpBar xp={character.xp} xpNeeded={character.xpNeeded} level={character.level} />
                        <button
                            onClick={() => { setShowSettings((s) => !s); setScreen(null); }}
                            className="ml-3 shrink-0 opacity-50 hover:opacity-90 cursor-pointer transition-opacity"
                            aria-label="Settings"
                        >
                            <IconSettings />
                        </button>
                    </div>

                    {/* Settings panel (inline, below header) */}
                    {showSettings && (
                        <div className="mx-4 mb-2 p-3 rounded-lg border border-(--surface-background) bg-(--surface-background)/60 text-sm space-y-1 shrink-0">
                            <div className="font-semibold text-xs uppercase opacity-50 tracking-wider mb-2">Settings</div>
                            <div className="opacity-70 text-xs">No settings yet.</div>
                        </div>
                    )}

                    {/* Stats row */}
                    <div className="flex justify-around text-sm px-4 py-2 border-b border-(--surface-background)/50 shrink-0">
                        <div className="text-center">
                            <div className="font-bold">{character.attack}</div>
                            <div className="text-xs opacity-50">ATK</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold">{character.defense}</div>
                            <div className="text-xs opacity-50">DEF</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold">{character.maxHp}</div>
                            <div className="text-xs opacity-50">HP</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold">{character.totalKills.toLocaleString()}</div>
                            <div className="text-xs opacity-50">Kills</div>
                        </div>
                    </div>

                    {/* Combat area */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
                        {selectedEnemy ? (
                            <>
                                <div
                                    className={`text-6xl transition-transform duration-100 select-none ${
                                        attacking ? "scale-110" : "scale-100"
                                    }`}
                                >
                                    👾
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-lg">{selectedEnemy.name}</div>
                                    <div className="text-xs opacity-50">Lv.{selectedEnemy.level} · {selectedEnemy.currentZone ?? character.currentZone}</div>
                                </div>
                                <div
                                    className={`text-xs px-3 py-1 rounded-full transition-opacity duration-200 font-bold ${
                                        attacking ? "opacity-100" : "opacity-0"
                                    } text-(--primary) border border-(--primary)/30`}
                                >
                                    ⚔ Attack!
                                </div>
                                {recentDrops.length > 0 && (
                                    <div className="w-full text-center">
                                        <DropFeed drops={recentDrops} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="opacity-30 text-sm">Open Map to select an enemy</div>
                        )}
                    </div>

                    {/* Combat log */}
                    <div className="mx-4 mb-3 p-2 rounded-lg border border-(--surface-background)/40 bg-(--surface-background)/30" style={{ height: 72 }}>
                        <CombatLog entries={log} />
                    </div>
                </div>

                {/* ── Map overlay (slides in from left) ── */}
                <div
                    className="absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out"
                    style={{
                        bottom: 56,
                        transform: screen === "map" ? "translateX(0)" : "translateX(-100%)",
                        background: "var(--surface-background, #fff)",
                    }}
                >
                    {/* Zone selector header */}
                    <div className="flex gap-1 flex-wrap px-4 pt-4 pb-3 border-b border-(--surface-background)/50 shrink-0">
                        {zones.map((z) => (
                            <button
                                key={z}
                                onClick={() => handleZoneChange(z)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize cursor-pointer transition-colors ${
                                    z === character.currentZone
                                        ? "bg-(--primary) text-white"
                                        : "border border-(--primary)/30 opacity-60 hover:opacity-90"
                                }`}
                            >
                                {z}
                            </button>
                        ))}
                    </div>

                    {/* Enemy list */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                        {enemies.map((e) => (
                            <EnemyCard
                                key={e.id}
                                enemy={e}
                                selected={selectedEnemy?.id === e.id}
                                onSelect={(enemy) => {
                                    setSelectedEnemy(enemy);
                                    setScreen(null);
                                }}
                                character={character}
                            />
                        ))}
                        {enemies.length === 0 && (
                            <div className="opacity-30 text-sm text-center py-8">No enemies in this zone.</div>
                        )}
                    </div>
                </div>

                {/* ── Inventory overlay (slides in from right) ── */}
                <div
                    className="absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out"
                    style={{
                        bottom: 56,
                        transform: screen === "inventory" ? "translateX(0)" : "translateX(100%)",
                        background: "var(--surface-background, #fff)",
                    }}
                >
                    {/* Equipped + stats */}
                    <div className="shrink-0 px-4 pt-4 pb-3 border-b border-(--surface-background)/50">
                        <div className="text-xs font-semibold uppercase opacity-40 tracking-wider mb-2">Equipped</div>
                        {equippedItems.length === 0 ? (
                            <div className="text-xs opacity-30">Nothing equipped.</div>
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                {equippedItems.map((inv) => {
                                    const color = RARITY_COLORS[inv.rarity] ?? "#aaa";
                                    const subtitle = inv.source === "weapon"
                                        ? `${inv.typeLabel} · Lv.${inv.level} · ${inv.origin}`
                                        : inv.type;
                                    return (
                                        <div key={`${inv.source}-${inv.id}`} className="flex justify-between items-center">
                                            <div className="min-w-0">
                                                <span className="text-sm font-medium" style={{ color }}>{inv.name}</span>
                                                <span className="text-xs opacity-40 ml-2 capitalize">{subtitle}</span>
                                            </div>
                                            <button
                                                onClick={() => handleEquip(inv.id, false, inv.source)}
                                                className="text-xs opacity-50 hover:opacity-90 cursor-pointer ml-3 shrink-0"
                                            >
                                                Unequip
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex gap-4 mt-3 pt-3 border-t border-(--surface-background)/40">
                            <div className="text-center">
                                <div className="text-sm font-bold">{character.attack}</div>
                                <div className="text-xs opacity-40">ATK</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-bold">{character.defense}</div>
                                <div className="text-xs opacity-40">DEF</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-bold">{character.maxHp}</div>
                                <div className="text-xs opacity-40">HP</div>
                            </div>
                        </div>
                    </div>

                    {/* Inventory grid */}
                    <div className="flex-1 overflow-y-auto px-4 py-3">
                        <div className="text-xs font-semibold uppercase opacity-40 tracking-wider mb-2">
                            Inventory ({unequippedItems.length})
                        </div>
                        {unequippedItems.length === 0 ? (
                            <div className="opacity-30 text-sm text-center py-8">No items yet. Go kill some stuff!</div>
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                {unequippedItems.map((inv) => {
                                    const color = RARITY_COLORS[inv.rarity] ?? "#aaa";
                                    const isWeapon = inv.source === "weapon";
                                    return (
                                        <div
                                            key={`${inv.source}-${inv.id}`}
                                            className="flex justify-between items-center px-3 py-2 rounded-lg border border-(--surface-background)"
                                            style={{ borderLeftColor: color, borderLeftWidth: 3 }}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-medium truncate" style={{ color }}>{inv.name}</div>
                                                {isWeapon ? (
                                                    <>
                                                        <div className="text-xs opacity-50">{inv.typeLabel} · Lv.{inv.level} · {inv.origin}</div>
                                                        <div className="text-xs opacity-40">
                                                            {Object.entries(inv.stats)
                                                                .filter(([, v]) => v !== 0)
                                                                .map(([k, v]) => `${v > 0 ? "+" : ""}${v} ${k}`)
                                                                .join(", ")}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="text-xs opacity-50 capitalize">{inv.type} · ×{inv.quantity}</div>
                                                        {inv.statBonus && (
                                                            <div className="text-xs opacity-40">
                                                                {Object.entries(inv.statBonus).map(([k, v]) => `+${v} ${k}`).join(", ")}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex gap-1.5 shrink-0 ml-2">
                                                <button
                                                    onClick={() => handleEquip(inv.id, true, inv.source)}
                                                    className="text-xs px-2 py-1 rounded border border-(--primary)/40 text-(--primary) hover:bg-(--primary)/10 cursor-pointer transition-colors"
                                                >
                                                    Equip
                                                </button>
                                                <button
                                                    onClick={() => handleDiscard(inv.id, inv.source)}
                                                    className="text-xs px-2 py-1 rounded border border-red-300/40 text-red-400 hover:bg-red-400/10 cursor-pointer transition-colors"
                                                    title="Discard"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Bottom navbar ── */}
                <div
                    className="absolute bottom-0 left-0 right-0 flex border-t border-(--surface-background)"
                    style={{ height: 56, background: "var(--surface-background, #fff)" }}
                >
                    <button
                        onClick={() => toggleScreen("map")}
                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
                            screen === "map" ? "text-(--primary)" : "opacity-40 hover:opacity-70"
                        }`}
                    >
                        <IconMap />
                        <span className="text-xs font-medium">Map</span>
                    </button>
                    <button
                        onClick={() => toggleScreen("inventory")}
                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
                            screen === "inventory" ? "text-(--primary)" : "opacity-40 hover:opacity-70"
                        }`}
                    >
                        <IconBag />
                        <span className="text-xs font-medium">Inventory</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
