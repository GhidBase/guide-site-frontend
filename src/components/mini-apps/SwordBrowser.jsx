import { useState } from "react";
import { generateWeapon, rescaleWeapon, WEAPON_TYPES } from "./weaponGenerator";

const RARITY_COLORS = {
    common: "#6b7280",
    uncommon: "#2e7d32",
    rare: "#1565c0",
    epic: "#6a1b9a",
    legendary: "#b45309",
};

function StatPill({ label, value }) {
    const positive = value > 0;
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                padding: "2px 8px",
                borderRadius: 99,
                fontSize: 12,
                background: positive
                    ? "rgba(0,0,0,0.06)"
                    : "rgba(200,0,0,0.08)",
                color: positive ? "#1a1a1a" : "#b91c1c",
                border: "1px solid rgba(0,0,0,0.1)",
            }}
        >
            {value > 0 ? "+" : ""}
            {value} {label}
        </span>
    );
}

function PartRow({ slot, part }) {
    const originColor = part.origin ? "#1a1a1a" : "#9ca3af";
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 0",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
        >
            <div>
                <span
                    style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        opacity: 0.4,
                        marginRight: 8,
                    }}
                >
                    {slot}
                </span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                    {part.name}
                </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                    style={{
                        fontSize: 12,
                        color: originColor,
                        opacity: part.origin ? 0.6 : 0.35,
                    }}
                >
                    {part.origin ?? "Neutral"}
                </span>
                <span
                    style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "1px 7px",
                        borderRadius: 99,
                        background: "rgba(0,0,0,0.06)",
                    }}
                >
                    ★ {part.rating}
                </span>
            </div>
        </div>
    );
}

export default function SwordBrowser() {
    const [selectedType, setSelectedType] = useState("longsword");
    const [level, setLevel] = useState(1);
    const [weapon, setWeapon] = useState(() => generateWeapon("longsword", 1));
    const [history, setHistory] = useState([]);

    function roll(type = selectedType, lvl = level) {
        setHistory((h) => [weapon, ...h].slice(0, 8));
        setWeapon(generateWeapon(type, lvl));
    }

    function handleTypeChange(type) {
        setSelectedType(type);
        setHistory((h) => [weapon, ...h].slice(0, 8));
        setWeapon(generateWeapon(type, level));
    }

    function handleLevelChange(lvl) {
        setLevel(lvl);
        setWeapon((w) => rescaleWeapon(w, lvl));
    }

    const rarityColor = RARITY_COLORS[weapon.rarity] ?? "#6b7280";

    return (
        <div
            style={{
                maxWidth: 480,
                margin: "2rem auto",
                fontFamily: "system-ui, sans-serif",
                color: "#1a1a1a",
            }}
        >
            {/* Level control */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                }}
            >
                <span
                    style={{
                        fontSize: 12,
                        fontWeight: 600,
                        opacity: 0.5,
                        whiteSpace: "nowrap",
                    }}
                >
                    Level {level}
                </span>
                <input
                    type="range"
                    min={1}
                    max={200}
                    value={level}
                    onChange={(e) => handleLevelChange(Number(e.target.value))}
                    style={{ flex: 1 }}
                />
                <input
                    type="number"
                    min={1}
                    value={level}
                    onChange={(e) =>
                        handleLevelChange(Math.max(0, Number(e.target.value)))
                    }
                    style={{
                        width: 64,
                        padding: "3px 6px",
                        borderRadius: 6,
                        border: "1px solid #e5e7eb",
                        fontSize: 13,
                        textAlign: "center",
                    }}
                />
            </div>

            {/* Type picker */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 12,
                }}
            >
                {WEAPON_TYPES.map(({ id, label }) => (
                    <button
                        key={id}
                        onClick={() => handleTypeChange(id)}
                        style={{
                            padding: "5px 12px",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            border:
                                selectedType === id
                                    ? "2px solid #1a1a1a"
                                    : "2px solid #e5e7eb",
                            background:
                                selectedType === id ? "#1a1a1a" : "#fff",
                            color: selectedType === id ? "#fff" : "#6b7280",
                            transition: "all 0.15s",
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Main card */}
            <div
                style={{
                    border: `2px solid ${rarityColor}`,
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: rarityColor,
                        padding: "14px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                color: "rgba(255,255,255,0.6)",
                                marginBottom: 2,
                            }}
                        >
                            {weapon.typeLabel}
                        </div>
                        <div
                            style={{
                                fontSize: 20,
                                fontWeight: 700,
                                color: "#fff",
                            }}
                        >
                            {weapon.name}
                        </div>
                        <div
                            style={{
                                fontSize: 12,
                                color: "rgba(255,255,255,0.75)",
                                marginTop: 2,
                            }}
                        >
                            {weapon.origin} · Rating {weapon.totalRating} · Lv.
                            {weapon.level}
                        </div>
                    </div>
                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            background: "rgba(255,255,255,0.2)",
                            color: "#fff",
                            padding: "3px 10px",
                            borderRadius: 99,
                        }}
                    >
                        {weapon.rarity}
                    </span>
                </div>

                <div style={{ padding: "16px 18px", background: "#fff" }}>
                    {/* Stats */}
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 6,
                            marginBottom: 4,
                        }}
                    >
                        {Object.entries(weapon.stats).map(([k, v]) => (
                            <StatPill key={k} label={k} value={v} />
                        ))}
                    </div>
                    {level > 1 && (
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 6,
                                marginBottom: 16,
                            }}
                        >
                            {Object.entries(weapon.baseStats).map(([k, v]) => (
                                <span
                                    key={k}
                                    style={{ fontSize: 11, opacity: 0.4 }}
                                >
                                    {k} {v > 0 ? "+" : ""}
                                    {v} base
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Parts — dynamic slots */}
                    <div>
                        {weapon.slots.map(({ key, label }) => (
                            <PartRow
                                key={key}
                                slot={label}
                                part={weapon.parts[key]}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Roll button */}
            <button
                onClick={() => roll()}
                style={{
                    width: "100%",
                    marginTop: 12,
                    padding: "12px 0",
                    background: "#1a1a1a",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                }}
            >
                Roll {weapon.typeLabel}
            </button>

            {/* History */}
            {history.length > 0 && (
                <div style={{ marginTop: 20 }}>
                    <div
                        style={{
                            fontSize: 11,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            opacity: 0.4,
                            marginBottom: 8,
                        }}
                    >
                        Recent
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                        }}
                    >
                        {history.map((w, i) => (
                            <div
                                key={i}
                                onClick={() => {
                                    setHistory((h) =>
                                        [
                                            weapon,
                                            ...h.filter((_, j) => j !== i),
                                        ].slice(0, 8),
                                    );
                                    setWeapon(w);
                                    setSelectedType(w.type);
                                }}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "8px 12px",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    border: `1px solid ${RARITY_COLORS[w.rarity]}44`,
                                    background: `${RARITY_COLORS[w.rarity]}0a`,
                                }}
                            >
                                <div>
                                    <span
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {w.name}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 11,
                                            opacity: 0.4,
                                            marginLeft: 6,
                                        }}
                                    >
                                        {w.typeLabel}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 8,
                                        alignItems: "center",
                                    }}
                                >
                                    <span
                                        style={{ fontSize: 12, opacity: 0.5 }}
                                    >
                                        {w.origin}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: RARITY_COLORS[w.rarity],
                                        }}
                                    >
                                        {w.rarity}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
