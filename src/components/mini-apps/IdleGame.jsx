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

function calcAttacksPerSec(character) {
    return 0.5 + (character.speed ?? 0) / 50;
}

function calcPlayerDmg(character, enemy) {
    const attack = (character.attack ?? character.baseAttack) + (character.magic ?? 0);
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

function IconScroll() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    const [screen, setScreen] = useState(null); // null | "map" | "inventory" | "log"
    const [showSettings, setShowSettings] = useState(false);
    const [invFilterSlot, setInvFilterSlot] = useState("all");
    const [invFilterRarity, setInvFilterRarity] = useState("all");
    const [invSort, setInvSort] = useState("newest");
    const [discardAllPending, setDiscardAllPending] = useState(false);
    const discardAllTimerRef = useRef(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [panelItem, setPanelItem] = useState(null);
    useEffect(() => { if (selectedItem) setPanelItem(selectedItem); }, [selectedItem]);
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
    const tickStartRef = useRef(Date.now());
    const serverTickRef = useRef(null);

    const showToast = useCallback((content, duration = 4000) => {
        setToast(content);
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToast(null), duration);
    }, []);

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
                setPlayerCurrentHp(charData.currentHp);
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

    // ── Combat loop (rAF) ──
    useEffect(() => {
        cancelAnimationFrame(rAFRef.current);
        if (!selectedEnemy || !character) return;

        localKillCountRef.current = 0;
        setLocalKillCount(0);

        if (character.currentHp <= 0) return;

        const dmg = calcPlayerDmg(character, selectedEnemy);
        const attacksPerSec = calcAttacksPerSec(character);
        const hitsToKillEnemy = Math.max(1, Math.ceil(selectedEnemy.hp / dmg));
        const enemyAttackSpeed = selectedEnemy.attackSpeed ?? 1.0;
        const playerHitInterval = (1 / attacksPerSec) * 1000;
        const enemyHitInterval = (1 / enemyAttackSpeed) * 1000;
        const enemyDmgPerHit = calcEnemyDmg(selectedEnemy, character);

        visualEnemyHpRef.current = selectedEnemy.hp;
        enemyDeadRef.current = false;
        lastPlayerHitRef.current = performance.now();
        lastEnemyHitRef.current = performance.now();
        setEnemyCurrentHp(selectedEnemy.hp);
        setPlayerCurrentHp(character.currentHp);
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

            setPlayerChargeProgress(Math.min(1, playerElapsed / playerHitInterval));
            setEnemyChargeProgress(Math.min(1, enemyElapsed / enemyHitInterval));

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
                        visualEnemyHpRef.current = selectedEnemy.hp;
                        setEnemyCurrentHp(selectedEnemy.hp);
                        enemyDeadRef.current = false;
                        setEnemyDeathPause(false);
                        lastPlayerHitRef.current = performance.now();
                        lastEnemyHitRef.current = performance.now();
                    }, 500);
                } else {
                    setEnemyCurrentHp(visualEnemyHpRef.current);
                }
            }

            if (enemyElapsed >= enemyHitInterval) {
                lastEnemyHitRef.current = now;
                setPlayerCurrentHp((prev) => Math.max(0, prev - enemyDmgPerHit));
            }

            rAFRef.current = requestAnimationFrame(loop);
        };

        rAFRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rAFRef.current);
    }, [selectedEnemy, character?.attack, character?.baseAttack, character?.speed, character?.magic, character?.defense, reviveKey]);

    // ── Server sync tick ──
    useEffect(() => {
        if (!selectedEnemy || !character) return;

        const sync = async () => {
            const now = Date.now();
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
                    body: JSON.stringify({ enemyId: selectedEnemy.id, kills, durationSeconds }),
                });
                const data = await res.json();
                if (!res.ok) return;

                setCharacter(data.character);
                setPlayerCurrentHp(data.character.currentHp);
                localKillCountRef.current = 0;
                setLocalKillCount(0);

                if (data.died) addLog(`💀 Defeated by ${selectedEnemy.name}. Recovering...`);

                if (data.killsProcessed > 0) {
                    if (data.drops?.length > 0) {
                        setRecentDrops(data.drops);
                        setTimeout(() => setRecentDrops([]), 4000);
                        for (const d of data.drops) addLog(`Dropped: ${d.name}`);
                    }
                    if (data.levelUps > 0) addLog(`⬆ Leveled up! Now level ${data.character.level}`);
                    addLog(`Killed ${data.killsProcessed}× ${selectedEnemy.name} (+${data.xpGained} XP)`);
                }

                if (data.levelUps > 0 || data.drops?.length > 0) {
                    showToast({
                        levelUps: data.levelUps,
                        newLevel: data.character.level,
                        drops: data.drops ?? [],
                    });
                }
            } catch {
                // silently ignore network errors in the tick loop
            }
        };

        serverTickRef.current = setInterval(sync, TICK_INTERVAL);
        return () => clearInterval(serverTickRef.current);
    }, [selectedEnemy, character?.id, addLog, showToast]);

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
            setSelectedItem(null);
            addLog(equipped ? "Item equipped." : "Item unequipped.");
        }
    }

    async function handleReset() {
        const res = await fetch(`${currentAPI}/idle/character/reset`, { method: "POST", credentials: "include" });
        if (res.ok) { setCharacter(await res.json()); addLog("Character reset."); }
    }

    async function handleRevive() {
        const res = await fetch(`${currentAPI}/idle/character/revive`, { method: "POST", credentials: "include" });
        if (res.ok) { const c = await res.json(); setCharacter(c); setPlayerCurrentHp(c.currentHp); setReviveKey((k) => k + 1); addLog("Revived."); }
    }

    async function handleDiscardAll(items) {
        if (!discardAllPending) {
            setDiscardAllPending(true);
            clearTimeout(discardAllTimerRef.current);
            discardAllTimerRef.current = setTimeout(() => setDiscardAllPending(false), 3000);
            return;
        }
        setDiscardAllPending(false);
        clearTimeout(discardAllTimerRef.current);
        const res = await fetch(`${currentAPI}/idle/character/items`, {
            method: "DELETE",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: items.map((i) => ({ id: i.id, source: i.source })) }),
        });
        if (res.ok) {
            const data = await res.json();
            setCharacter(data);
            addLog(`Discarded ${items.length} item${items.length !== 1 ? "s" : ""}.`);
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
            if (selectedItem?.id === itemId && selectedItem?.source === source) setSelectedItem(null);
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

    const RARITY_ORDER = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
    const SLOT_TYPES = { weapon: ["sword", "longsword", "greatsword", "dagger"], chest: ["chest"], helm: ["helm"], legs: ["legs"] };
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
            if (invFilterRarity !== "all" && i.rarity !== invFilterRarity) return false;
            return true;
        })
        .sort((a, b) => {
            switch (invSort) {
                case "oldest":    return a.id - b.id;
                case "level-high": return (b.level ?? 0) - (a.level ?? 0);
                case "level-low":  return (a.level ?? 0) - (b.level ?? 0);
                case "rarity-high": return (RARITY_ORDER[b.rarity] ?? 0) - (RARITY_ORDER[a.rarity] ?? 0);
                case "rarity-low":  return (RARITY_ORDER[a.rarity] ?? 0) - (RARITY_ORDER[b.rarity] ?? 0);
                default:          return b.id - a.id; // newest
            }
        });

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
                        <div className="mx-4 mb-2 p-3 rounded-lg border border-(--surface-background) bg-(--surface-background)/60 text-sm space-y-2 shrink-0">
                            <div className="font-semibold text-xs uppercase opacity-50 tracking-wider">Settings</div>
                            <button
                                onClick={handleReset}
                                className="w-full text-xs px-3 py-1.5 rounded border border-red-500/40 text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors text-left"
                            >
                                Reset Character (keeps weapons)
                            </button>
                            <div className="border-t border-(--surface-background) pt-2">
                                <div className="font-semibold text-xs uppercase opacity-30 tracking-wider mb-1.5">Dev</div>
                                <button
                                    onClick={handleRevive}
                                    className="w-full text-xs px-3 py-1.5 rounded border border-green-500/40 text-green-400 hover:bg-green-500/10 cursor-pointer transition-colors text-left"
                                >
                                    Instant Revive
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Stats row */}
                    <div className="flex justify-around text-sm px-4 py-2 border-b border-(--surface-background)/50 shrink-0">
                        <div className="text-center">
                            <div className="font-bold">{character.attack + (character.magic ?? 0)}</div>
                            <div className="text-xs opacity-50">ATK</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold">{character.defense}</div>
                            <div className="text-xs opacity-50">DEF</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold">{(character.speed ?? 0) > 0 ? `${calcAttacksPerSec(character).toFixed(2)}/s` : "1/s"}</div>
                            <div className="text-xs opacity-50">SPD</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold">{character.maxHp}</div>
                            <div className="text-xs opacity-50">HP</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold">{(character.totalKills + localKillCount).toLocaleString()}</div>
                            <div className="text-xs opacity-50">Kills</div>
                        </div>
                    </div>

                    {/* Combat area */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
                        {selectedEnemy ? (
                            <>
                                {character.currentHp <= 0 ? (
                                    <div className="text-center space-y-2">
                                        <div className="text-4xl select-none">💀</div>
                                        <div className="font-semibold opacity-60">Defeated</div>
                                        <div className="text-xs opacity-40">Recovering… {Math.ceil((character.maxHp - Math.max(0, character.currentHp)) / 10)}s remaining</div>
                                    </div>
                                ) : enemyDeathPause ? (
                                    <div className="text-6xl select-none animate-bounce">💥</div>
                                ) : (
                                    <div
                                        className={`text-6xl transition-transform duration-100 select-none ${
                                            attacking ? "scale-110" : "scale-100"
                                        }`}
                                    >
                                        👾
                                    </div>
                                )}
                                <div className="text-center">
                                    <div className="font-semibold text-lg">{selectedEnemy.name}</div>
                                    <div className="text-xs opacity-50">Lv.{selectedEnemy.level} · {selectedEnemy.currentZone ?? character.currentZone}</div>
                                </div>
                                {/* Enemy HP bar */}
                                {character.currentHp > 0 && enemyCurrentHp !== null && (() => {
                                    const dmg = calcPlayerDmg(character, selectedEnemy);
                                    const oneShot = dmg >= selectedEnemy.hp;
                                    const pct = Math.max(0, (enemyCurrentHp / selectedEnemy.hp) * 100);
                                    return (
                                        <div className="w-full px-2">
                                            <div className="flex justify-between text-xs mb-1 opacity-60">
                                                <span>{Math.ceil(enemyCurrentHp)} / {selectedEnemy.hp} HP</span>
                                                {oneShot
                                                    ? <span className="text-(--primary) font-semibold">One shot</span>
                                                    : <span className="text-(--primary) font-semibold">{dmg} dmg/hit</span>
                                                }
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-(--surface-background) overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-red-400 transition-all"
                                                    style={{ width: `${pct}%`, transitionDuration: `${Math.round(1000 / calcAttacksPerSec(character))}ms` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })()}
                                {/* Player HP bar */}
                                {(() => {
                                    const hp = playerCurrentHp ?? character.currentHp;
                                    const pct = Math.max(0, (hp / character.maxHp) * 100);
                                    const enemyDmg = Math.max(1, selectedEnemy.attack - character.defense);
                                    return (
                                        <div className="w-full px-2">
                                            <div className="flex justify-between text-xs mb-1 opacity-60">
                                                <span>{Math.ceil(Math.max(0, hp))} / {character.maxHp} HP</span>
                                                {character.currentHp > 0
                                                    ? <span className="text-red-400">{enemyDmg} dmg/hit</span>
                                                    : <span className="text-green-400">+{10}/s regen</span>
                                                }
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-(--surface-background) overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{
                                                        width: `${pct}%`,
                                                        background: pct > 50 ? "#4ade80" : pct > 25 ? "#facc15" : "#f87171",
                                                        transitionDuration: character.currentHp <= 0 ? "1000ms" : `${Math.round(1000 / calcAttacksPerSec(character))}ms`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })()}
                                {character.currentHp > 0 && (
                                    <div className="w-full px-2 space-y-1.5">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1 opacity-50">
                                                <span>⚔ Your attack</span>
                                                <span>{calcAttacksPerSec(character).toFixed(2)}/s</span>
                                            </div>
                                            <div className="w-full h-1.5 rounded-full bg-(--surface-background) overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-(--primary)"
                                                    style={{ width: `${playerChargeProgress * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-1 opacity-50">
                                                <span>💢 {selectedEnemy.name}</span>
                                                <span>{(selectedEnemy.attackSpeed ?? 1).toFixed(2)}/s</span>
                                            </div>
                                            <div className="w-full h-1.5 rounded-full bg-(--surface-background) overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-red-400"
                                                    style={{ width: `${enemyChargeProgress * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
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

                    {/* Toast */}
                    <div className="mx-4 mb-3 min-h-8">
                        {toast && (
                            typeof toast === "string" ? (
                                <div className="text-xs opacity-60 text-center py-1">{toast}</div>
                            ) : (
                                <div className="rounded-lg border border-(--surface-background) bg-(--accent)/60 px-3 py-2 text-xs space-y-1.5">
                                    {toast.levelUps > 0 && (
                                        <div className="font-semibold text-(--primary)">⬆ Level up! Now level {toast.newLevel}</div>
                                    )}
                                    {toast.drops.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {toast.drops.map((d, i) => (
                                                <span
                                                    key={i}
                                                    className="px-1.5 py-0.5 rounded-full border text-xs"
                                                    style={{
                                                        color: RARITY_COLORS[d.rarity] ?? "#aaa",
                                                        borderColor: RARITY_COLORS[d.rarity] ?? "#aaa",
                                                    }}
                                                >
                                                    {d.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* ── Map overlay (slides from left) ── */}
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

                {/* ── Inventory overlay (slides from right) ── */}
                <div
                    className="absolute inset-0 flex flex-col"
                    style={{
                        bottom: selectedItem ? 0 : 56,
                        transform: screen === "inventory" ? "translateX(0)" : "translateX(100%)",
                        transition: "transform 0.3s ease-in-out, bottom 0.3s ease-in-out",
                        background: "var(--surface-background, #fff)",
                    }}
                >
                    <div className="flex flex-col flex-1 min-h-0">
                    {/* Equipped + stats */}
                    <div className="shrink-0 px-4 pt-3 pb-2 border-b border-(--surface-background)/50">
                        <div className="text-xs font-semibold uppercase opacity-40 tracking-wider mb-1.5">Equipped</div>
                        <div className="flex flex-col gap-1">
                            {SLOT_ORDER.map((slot) => {
                                const inv = equippedItems.find((i) => SLOT_TYPES[slot]?.includes(i.type));
                                if (!inv) return (
                                    <div key={slot} className="flex items-center gap-2 min-w-0 opacity-20">
                                        <span className="shrink-0" style={{ fontSize: 11 }}>{SLOT_EMOJI[slot]}</span>
                                        <span className="text-xs italic capitalize">No {slot} equipped</span>
                                    </div>
                                );
                                const color = RARITY_COLORS[inv.rarity] ?? "#aaa";
                                return (
                                    <div key={`${inv.source}-${inv.id}`} className="flex items-center gap-2 min-w-0">
                                        <span className="shrink-0" style={{ fontSize: 11 }}>{SLOT_EMOJI[slot] ?? "▪"}</span>
                                        <span className="text-xs font-medium truncate flex-1" style={{ color }}>{inv.name}</span>
                                        <button
                                            onClick={() => handleEquip(inv.id, false, inv.source)}
                                            className="text-xs opacity-30 hover:opacity-70 cursor-pointer shrink-0"
                                            title="Unequip"
                                        >
                                            ×
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-3 mt-2 pt-2 border-t border-(--surface-background)/40 text-xs">
                            <span><span className="font-bold">{character.attack + (character.magic ?? 0)}</span> <span className="opacity-40">ATK</span></span>
                            <span><span className="font-bold">{character.defense}</span> <span className="opacity-40">DEF</span></span>
                            <span><span className="font-bold">{character.maxHp}</span> <span className="opacity-40">HP</span></span>
                            {(character.speed ?? 0) > 0 && <span><span className="font-bold">{calcAttacksPerSec(character).toFixed(2)}/s</span> <span className="opacity-40">SPD</span></span>}
                        </div>
                    </div>

                    {/* Comparison panel */}
                    <div
                        className="shrink-0 overflow-hidden border-b border-(--surface-background)/50"
                        style={{
                            maxHeight: selectedItem ? 500 : 0,
                            opacity: selectedItem ? 1 : 0,
                            transition: "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out",
                        }}
                        onTransitionEnd={() => { if (!selectedItem) setPanelItem(null); }}
                    >
                        {panelItem && (() => {
                            const equippedStats = equippedInSlot ? getItemStats(equippedInSlot) : {};
                            const selStats = getItemStats(panelItem);
                            const allKeys = [...new Set([...Object.keys(equippedStats), ...Object.keys(selStats)])].filter(
                                (k) => (equippedStats[k] ?? 0) !== 0 || (selStats[k] ?? 0) !== 0
                            );
                            return (
                                <div className="px-4 pt-3 pb-3 bg-(--surface-background)/30">
                                    <div className="mb-2">
                                        <span className="text-xs font-semibold uppercase opacity-40 tracking-wider">Compare</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        {/* Equipped side */}
                                        <div className="space-y-1">
                                            <div className="opacity-40 font-semibold uppercase tracking-wider" style={{ fontSize: 10 }}>
                                                {selectedSlot ? `${SLOT_EMOJI[selectedSlot]} Equipped` : "Equipped"}
                                            </div>
                                            {equippedInSlot ? (
                                                <>
                                                    <div className="font-medium leading-tight truncate" style={{ color: RARITY_COLORS[equippedInSlot.rarity] ?? "#aaa" }}>
                                                        {equippedInSlot.name}
                                                    </div>
                                                    <div className="opacity-40 truncate">
                                                        {equippedInSlot.source === "weapon"
                                                            ? `${equippedInSlot.typeLabel} · Lv.${equippedInSlot.level}`
                                                            : equippedInSlot.type}
                                                        {equippedInSlot.totalRating != null && ` · ⚡${Math.round(equippedInSlot.totalRating * (1 + Math.log(equippedInSlot.level + 1) * 2))}`}
                                                    </div>
                                                    {allKeys.map((k) => (
                                                        <div key={k} className="opacity-60">
                                                            {equippedStats[k] != null ? `${equippedStats[k] > 0 ? "+" : ""}${equippedStats[k]}` : "—"} {k}
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <div className="opacity-30 italic">Nothing equipped</div>
                                            )}
                                        </div>
                                        {/* Selected side */}
                                        <div className="space-y-1">
                                            <div className="opacity-40 font-semibold uppercase tracking-wider" style={{ fontSize: 10 }}>Selected</div>
                                            <div className="font-medium leading-tight truncate" style={{ color: RARITY_COLORS[panelItem.rarity] ?? "#aaa" }}>
                                                {panelItem.name}
                                            </div>
                                            <div className="opacity-40 truncate">
                                                {panelItem.source === "weapon"
                                                    ? `${panelItem.typeLabel} · Lv.${panelItem.level}`
                                                    : panelItem.type}
                                                {panelItem.totalRating != null && ` · ⚡${Math.round(panelItem.totalRating * (1 + Math.log(panelItem.level + 1) * 2))}`}
                                            </div>
                                            {allKeys.map((k) => {
                                                const curr = equippedStats[k] ?? 0;
                                                const next = selStats[k] ?? 0;
                                                const delta = next - curr;
                                                return (
                                                    <div key={k} className="flex items-center gap-1">
                                                        <span className="opacity-60">{next > 0 ? "+" : ""}{next} {k}</span>
                                                        {equippedInSlot && delta !== 0 && (
                                                            <span className="font-bold" style={{ fontSize: 10, color: delta > 0 ? "#22c55e" : "#ef4444" }}>
                                                                {delta > 0 ? "▲" : "▼"}{Math.abs(delta)}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => setSelectedItem(null)}
                                            className="flex-1 text-xs px-3 py-1.5 rounded border border-(--surface-background) opacity-50 hover:opacity-80 cursor-pointer transition-opacity"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={() => { handleDiscard(panelItem.id, panelItem.source); setSelectedItem(null); }}
                                            className="flex-1 text-xs px-3 py-1.5 rounded border border-red-500/40 text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
                                        >
                                            Throw Away
                                        </button>
                                        <button
                                            onClick={() => handleEquip(panelItem.id, true, panelItem.source)}
                                            className="flex-1 text-xs px-3 py-1.5 rounded border border-(--primary)/40 text-(--primary) hover:bg-(--primary)/10 cursor-pointer transition-colors font-semibold"
                                        >
                                            Equip
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Filter + sort controls */}
                    <div className="shrink-0 px-3 py-1.5 border-b border-(--surface-background)/50 space-y-1">
                        {/* Slot filter */}
                        <div className="flex gap-1 overflow-x-auto no-scrollbar">
                            {["all", "weapon", "chest", "helm", "legs"].map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() => setInvFilterSlot(slot)}
                                    className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize cursor-pointer transition-colors ${
                                        invFilterSlot === slot
                                            ? "bg-(--primary) text-white"
                                            : "border border-(--primary)/25 opacity-50 hover:opacity-80"
                                    }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                        {/* Rarity filter + sort */}
                        <div className="flex gap-1 items-center">
                            <div className="flex gap-1 overflow-x-auto no-scrollbar flex-1">
                                {["all", "common", "uncommon", "rare", "epic", "legendary"].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setInvFilterRarity(r)}
                                        className="shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-opacity capitalize"
                                        style={{
                                            background: r === "all" ? undefined : `${RARITY_COLORS[r]}22`,
                                            color: r === "all" ? undefined : RARITY_COLORS[r],
                                            border: `1px solid ${r === "all" ? "transparent" : RARITY_COLORS[r] + "66"}`,
                                            opacity: invFilterRarity === r ? 1 : 0.4,
                                            fontWeight: invFilterRarity === r ? 700 : 500,
                                        }}
                                    >
                                        {r === "all" ? "All" : r.slice(0, 1).toUpperCase()}
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
                                <option value="rarity-high">Rarity ↓</option>
                                <option value="rarity-low">Rarity ↑</option>
                                <option value="level-high">Level ↓</option>
                                <option value="level-low">Level ↑</option>
                            </select>
                            <button
                                onClick={() => setInvView((v) => v === "list" ? "grid" : "list")}
                                className="shrink-0 ml-1 opacity-50 hover:opacity-90 cursor-pointer transition-opacity"
                                title={invView === "list" ? "Grid view" : "List view"}
                            >
                                {invView === "list" ? <IconGrid /> : <IconList />}
                            </button>
                        </div>
                    </div>

                    {/* Inventory grid */}
                    <div className="flex-1 overflow-y-auto px-4 py-3">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs opacity-40">
                                {filteredItems.length} of {unequippedItems.length} items
                            </span>
                            {filteredItems.length > 0 && (
                                <button
                                    onClick={() => handleDiscardAll(filteredItems)}
                                    className={`text-xs px-2 py-0.5 rounded border cursor-pointer transition-colors ${
                                        discardAllPending
                                            ? "border-red-400 text-red-400 bg-red-400/10 font-semibold"
                                            : "border-red-300/40 text-red-400/60 hover:text-red-400 hover:border-red-400/60"
                                    }`}
                                >
                                    {discardAllPending ? `Confirm? (${filteredItems.length})` : "Remove All"}
                                </button>
                            )}
                        </div>
                        {filteredItems.length === 0 ? (
                            <div className="opacity-30 text-sm text-center py-8">
                                {unequippedItems.length === 0 ? "No items yet. Go kill some stuff!" : "No items match filters."}
                            </div>
                        ) : invView === "grid" ? (
                            <div className="grid grid-cols-4 gap-1.5">
                                {filteredItems.map((inv) => {
                                    const color = RARITY_COLORS[inv.rarity] ?? "#aaa";
                                    const slot = getItemSlot(inv);
                                    const isSelected = selectedItem?.id === inv.id && selectedItem?.source === inv.source;
                                    const itemKey = `${inv.source}-${inv.id}`;
                                    const isPendingDiscard = pendingDiscardKey === itemKey;
                                    return (
                                        <div
                                            key={itemKey}
                                            onClick={() => {
                                                if (pendingDiscardKey) { setPendingDiscardKey(null); clearTimeout(pendingDiscardTimerRef.current); return; }
                                                setSelectedItem(isSelected ? null : inv);
                                            }}
                                            className="relative flex flex-col items-center justify-center p-1.5 rounded-lg border cursor-pointer"
                                            style={{
                                                aspectRatio: "1",
                                                borderColor: isSelected ? color : `${color}40`,
                                                background: isSelected ? `${color}20` : `${color}0d`,
                                            }}
                                        >
                                            <span style={{ fontSize: 22 }}>{SLOT_EMOJI[slot] ?? "▪"}</span>
                                            <span className="text-center leading-tight mt-0.5 w-full truncate" style={{ color, fontSize: 9 }}>
                                                {inv.name}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isPendingDiscard) {
                                                        handleDiscard(inv.id, inv.source);
                                                        clearTimeout(pendingDiscardTimerRef.current);
                                                    } else {
                                                        setPendingDiscardKey(itemKey);
                                                        clearTimeout(pendingDiscardTimerRef.current);
                                                        pendingDiscardTimerRef.current = setTimeout(() => setPendingDiscardKey(null), 3000);
                                                    }
                                                }}
                                                className="absolute top-0.5 right-0.5 cursor-pointer leading-none"
                                                style={{ fontSize: 11, color: isPendingDiscard ? "#ef4444" : undefined, opacity: isPendingDiscard ? 1 : 0.25 }}
                                                title="Discard"
                                            >
                                                {isPendingDiscard ? "?" : "×"}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                {filteredItems.map((inv) => {
                                    const color = RARITY_COLORS[inv.rarity] ?? "#aaa";
                                    const isWeapon = inv.source === "weapon";
                                    const isSelected = selectedItem?.id === inv.id && selectedItem?.source === inv.source;
                                    const itemKey = `${inv.source}-${inv.id}`;
                                    const isSwipedOpen = swipedOpenKey === itemKey;
                                    const isPendingDiscard = pendingDiscardKey === itemKey;
                                    return (
                                        <div key={itemKey} className="relative overflow-hidden rounded-lg">
                                            {/* Delete button revealed by swipe */}
                                            {isSwipedOpen && (
                                                <div
                                                    className="absolute right-0 top-0 bottom-0 flex items-center justify-center"
                                                    style={{ width: 72, background: "#ef4444" }}
                                                >
                                                    <button
                                                        onClick={() => { handleDiscard(inv.id, inv.source); setSwipedOpenKey(null); }}
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
                                                    borderColor: isSelected ? `${color}60` : undefined,
                                                    background: isSelected ? `${color}12` : "var(--surface-background, #fff)",
                                                    transform: `translateX(${isSwipedOpen ? -72 : 0}px)`,
                                                    transition: "transform 0.2s ease",
                                                }}
                                                onTouchStart={(e) => {
                                                    swipeTouchStartX.current = e.touches[0].clientX;
                                                    swipeWasMove.current = false;
                                                }}
                                                onTouchEnd={(e) => {
                                                    const dx = e.changedTouches[0].clientX - (swipeTouchStartX.current ?? e.changedTouches[0].clientX);
                                                    if (Math.abs(dx) > 8) swipeWasMove.current = true;
                                                    if (dx < -60) setSwipedOpenKey(itemKey);
                                                    else if (dx > 20) setSwipedOpenKey(null);
                                                }}
                                                onClick={() => {
                                                    if (swipeWasMove.current) { swipeWasMove.current = false; return; }
                                                    if (isSwipedOpen) { setSwipedOpenKey(null); return; }
                                                    setSelectedItem(isSelected ? null : inv);
                                                }}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-sm font-medium truncate" style={{ color }}>{inv.name}</div>
                                                    {isWeapon ? (
                                                        <>
                                                            <div className="text-xs opacity-50">
                                                                {inv.typeLabel} · Lv.{inv.level} · {inv.origin}
                                                                {inv.totalRating != null && <span className="ml-1.5 opacity-70">⚡{Math.round(inv.totalRating * (1 + Math.log(inv.level + 1) * 2))}</span>}
                                                            </div>
                                                            <div className="text-xs opacity-40">
                                                                {Object.entries(inv.stats).filter(([, v]) => v !== 0).map(([k, v]) => `${v > 0 ? "+" : ""}${v} ${k}`).join(", ")}
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
                                                        onClick={(e) => { e.stopPropagation(); handleEquip(inv.id, true, inv.source); }}
                                                        className="text-xs px-2 py-1 rounded border border-(--primary)/40 text-(--primary) hover:bg-(--primary)/10 cursor-pointer transition-colors"
                                                    >
                                                        Equip
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (isPendingDiscard) {
                                                                handleDiscard(inv.id, inv.source);
                                                                clearTimeout(pendingDiscardTimerRef.current);
                                                            } else {
                                                                setPendingDiscardKey(itemKey);
                                                                clearTimeout(pendingDiscardTimerRef.current);
                                                                pendingDiscardTimerRef.current = setTimeout(() => setPendingDiscardKey(null), 3000);
                                                            }
                                                        }}
                                                        className={`text-xs px-2 py-1 rounded border cursor-pointer transition-colors ${
                                                            isPendingDiscard
                                                                ? "border-red-400 text-red-400 bg-red-400/10 font-semibold"
                                                                : "border-red-300/40 text-red-400 hover:bg-red-400/10"
                                                        }`}
                                                        title="Discard"
                                                    >
                                                        {isPendingDiscard ? "?" : "✕"}
                                                    </button>
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
                        transform: screen === "log" ? "translateX(0)" : "translateX(100%)",
                        background: "var(--surface-background, #fff)",
                    }}
                >
                    <div className="shrink-0 px-4 pt-4 pb-2 border-b border-(--surface-background)/50">
                        <div className="text-xs font-semibold uppercase opacity-40 tracking-wider">Event Log</div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-3">
                        {log.length === 0 ? (
                            <div className="opacity-30 text-sm text-center py-8">Nothing yet.</div>
                        ) : (
                            <div className="flex flex-col-reverse gap-0.5">
                                {[...log].reverse().map((entry, i) => (
                                    <div key={i} className="text-xs font-mono opacity-60">{entry}</div>
                                ))}
                            </div>
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
                        transform: selectedItem ? "translateY(100%)" : "translateY(0)",
                    }}
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
                    <button
                        onClick={() => toggleScreen("log")}
                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
                            screen === "log" ? "text-(--primary)" : "opacity-40 hover:opacity-70"
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
