import { useState, useEffect, useRef, useCallback } from "react";
import { currentAPI } from "../../config/api";
import { useAuth } from "../../hooks/useAuth";

const TICK_INTERVAL = 5000; // ms between server syncs
const RARITY_COLORS = {
    common: "#6b7280",
    uncommon: "#2e7d32",
    rare: "#1565c0",
    epic: "#6a1b9a",
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
        <div className="mb-6 p-4 rounded-lg border border-(--primary)/50 bg-(--primary)/10">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <div className="font-semibold text-(--primary)">Welcome back!</div>
                    <div className="text-sm opacity-70">
                        You were away for {formatDuration(gains.secondsOffline)} — your character kept fighting {gains.enemyName}.
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
                <span>Level {level}</span>
                <span>{xp} / {xpNeeded} XP</span>
            </div>
            <div className="w-full h-2 rounded-full bg-(--surface-background) overflow-hidden">
                <div
                    className="h-full rounded-full bg-(--primary) transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function StatRow({ label, value }) {
    return (
        <div className="flex justify-between text-sm py-0.5">
            <span className="opacity-80">{label}</span>
            <span className="font-semibold">{value}</span>
        </div>
    );
}

function EnemyCard({ enemy, selected, onSelect, character }) {
    const kills = character ? calcKillsInInterval(character, enemy, 1) : 0;
    const kps = kills === 1 ? "1 kill/s" : kills > 1 ? `${kills} kills/s` : "<1 kill/s";
    return (
        <button
            onClick={() => onSelect(enemy)}
            className={`w-full text-left px-3 py-2 rounded border transition-colors cursor-pointer ${
                selected
                    ? "border-(--primary) bg-(--primary)/10"
                    : "border-(--surface-background) hover:border-(--primary)/50"
            }`}
        >
            <div className="flex justify-between items-center">
                <span className="font-medium">{enemy.name}</span>
                <span className="text-xs opacity-50">Lv.{enemy.level}</span>
            </div>
            <div className="text-xs opacity-50 mt-0.5">
                HP {enemy.hp} · ATK {enemy.attack} · DEF {enemy.defense} · {kps}
            </div>
        </button>
    );
}

function InventoryItem({ inv, onEquip }) {
    const color = RARITY_COLORS[inv.rarity] ?? "#aaa";
    return (
        <div
            className={`px-3 py-2 rounded border transition-colors ${
                inv.equipped ? "border-(--primary)" : "border-(--surface-background)"
            }`}
            style={{ borderLeftColor: color, borderLeftWidth: 3 }}
        >
            <div className="flex justify-between items-center gap-2">
                <div className="min-w-0">
                    <div className="font-medium text-sm truncate" style={{ color }}>
                        {inv.name}
                    </div>
                    <div className="text-xs opacity-70 capitalize">{inv.type} · ×{inv.quantity}</div>
                    {inv.statBonus && (
                        <div className="text-xs opacity-60">
                            {Object.entries(inv.statBonus)
                                .map(([k, v]) => `+${v} ${k}`)
                                .join(", ")}
                        </div>
                    )}
                </div>
                {(inv.type === "weapon" || inv.type === "armor") && (
                    <button
                        onClick={() => onEquip(inv.id, !inv.equipped)}
                        className="shrink-0 text-xs px-2 py-1 rounded border border-(--primary) text-(--primary) hover:bg-(--primary)/10 cursor-pointer transition-colors"
                    >
                        {inv.equipped ? "Unequip" : "Equip"}
                    </button>
                )}
            </div>
        </div>
    );
}

function DropFeed({ drops }) {
    if (drops.length === 0) return null;
    return (
        <div className="space-y-1">
            {drops.map((d, i) => (
                <div
                    key={i}
                    className="flex items-center gap-2 text-sm"
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
        <div ref={ref} className="h-32 overflow-y-auto text-xs opacity-80 space-y-0.5 font-mono pr-1">
            {entries.map((e, i) => (
                <div key={i}>{e}</div>
            ))}
        </div>
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
    const [activeTab, setActiveTab] = useState("combat");

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

    // ── Load enemies when zone changes; restore last enemy ──
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
                // Restore last fought enemy, otherwise pick first
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
    async function handleEquip(inventoryItemId, equipped) {
        const res = await fetch(`${currentAPI}/idle/character/equip/${inventoryItemId}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ equipped }),
        });
        if (res.ok) {
            const data = await res.json();
            setCharacter(data);
            addLog(equipped ? "Item equipped." : "Item unequipped.");
        }
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

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-6 text-(--text-color)">
            <h1 className="text-2xl font-bold mb-6">Idle RPG</h1>

            <OfflineSummary gains={offlineGains} onDismiss={() => setOfflineGains(null)} />

            {/* Top: character stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg border border-(--surface-background) bg-(--surface-background)/60 space-y-3">
                    <XpBar xp={character.xp} xpNeeded={character.xpNeeded} level={character.level} />
                    <div className="grid grid-cols-3 gap-2 pt-1">
                        <StatRow label="ATK" value={character.attack} />
                        <StatRow label="DEF" value={character.defense} />
                        <StatRow label="HP" value={character.maxHp} />
                    </div>
                    <div className="text-xs opacity-60">{character.totalKills.toLocaleString()} total kills</div>
                </div>

                {/* Zone selector */}
                <div className="p-4 rounded-lg border border-(--surface-background) bg-(--surface-background)/60">
                    <div className="text-sm font-semibold mb-2 opacity-90">Zone</div>
                    <div className="flex flex-wrap gap-2">
                        {zones.map((z) => (
                            <button
                                key={z}
                                onClick={() => handleZoneChange(z)}
                                className={`px-3 py-1.5 rounded text-sm capitalize cursor-pointer transition-colors ${
                                    z === character.currentZone
                                        ? "bg-(--primary) text-white"
                                        : "border border-(--primary)/40 hover:border-(--primary) text-(--text-color)"
                                }`}
                            >
                                {z}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-(--surface-background) mb-4">
                {["combat", "inventory", "log"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium capitalize cursor-pointer transition-colors ${
                            activeTab === tab
                                ? "border-b-2 border-(--primary) text-(--primary)"
                                : "opacity-50 hover:opacity-80"
                        }`}
                    >
                        {tab}
                        {tab === "inventory" && ` (${character.inventory.length})`}
                    </button>
                ))}
            </div>

            {/* Combat tab */}
            {activeTab === "combat" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="text-sm font-semibold opacity-80 mb-2 capitalize">{character.currentZone} enemies</div>
                        {enemies.map((e) => (
                            <EnemyCard
                                key={e.id}
                                enemy={e}
                                selected={selectedEnemy?.id === e.id}
                                onSelect={setSelectedEnemy}
                                character={character}
                            />
                        ))}
                    </div>

                    <div className="p-4 rounded-lg border border-(--surface-background) bg-(--surface-background)/60 flex flex-col items-center justify-center gap-4 min-h-48">
                        {selectedEnemy ? (
                            <>
                                <div
                                    className={`text-4xl transition-transform duration-100 select-none ${
                                        attacking ? "scale-110" : "scale-100"
                                    }`}
                                >
                                    👾
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold">{selectedEnemy.name}</div>
                                    <div className="text-xs opacity-50">Lv.{selectedEnemy.level}</div>
                                </div>
                                <div
                                    className={`text-xs px-2 py-1 rounded transition-opacity duration-300 ${
                                        attacking ? "opacity-100" : "opacity-0"
                                    } text-(--primary) font-bold`}
                                >
                                    ⚔ Attack!
                                </div>
                                {recentDrops.length > 0 && (
                                    <div className="border-t border-(--surface-background) pt-3 w-full">
                                        <DropFeed drops={recentDrops} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="opacity-40 text-sm">Select an enemy to fight</div>
                        )}
                    </div>
                </div>
            )}

            {/* Inventory tab */}
            {activeTab === "inventory" && (
                <div>
                    {character.inventory.length === 0 ? (
                        <div className="opacity-40 text-sm text-center py-10">No items yet. Go kill some stuff!</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {character.inventory.map((inv) => (
                                <InventoryItem key={inv.id} inv={inv} onEquip={handleEquip} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Log tab */}
            {activeTab === "log" && (
                <div className="p-3 rounded-lg border border-(--surface-background) bg-(--surface-background)/50">
                    <CombatLog entries={log} />
                </div>
            )}
        </div>
    );
}
