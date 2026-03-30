// All sprites share the same 73×76 canvas — stack at identical size to align.
const SW = 73 * 3;
const SH = 76 * 3;

const CHARACTER_LAYERS = [
    "Legs_1",
    "Side Arm_1",
    "Chest_1",
    "Main Arm_1",
    "Head_1",
    "Hair_1",
];

const SWORD_VARIANTS = [
    "Rusty", "Bronze", "Iron", "Knights", "Mourning Wood",
    "Kings Gold", "Celestial", "Crimson Blight", "Dragons Crystal", "Laser",
];

function Sprite({ src, w = SW, h = SH }) {
    return <img src={src} width={w} height={h} style={{ position: "absolute", top: 0, left: 0 }} alt="" />;
}

function CharacterWithSword({ swordName }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", width: SW, height: SH }}>
                <Sprite src="/idle/Character/Male/Legs_1.png" />
                <Sprite src="/idle/Character/Male/Side Arm_1.png" />
                <Sprite src="/idle/Character/Male/Head_1.png" />
                <Sprite src="/idle/Character/Male/Hair_1.png" />
                <Sprite src="/idle/Character/Male/Chest_1.png" />
                {/* Sword between body and main arm */}
                <Sprite src={`/idle/Weapons/Swords/Hilts/Human/${swordName} Hilt.png`} />
                <Sprite src={`/idle/Weapons/Swords/Blades/Human/${swordName} Blade.png`} />
                <Sprite src="/idle/Character/Male/Main Arm_1.png" />
            </div>
            <div style={{ fontSize: 12, color: "#aaa" }}>{swordName}</div>
        </div>
    );
}

export default function IdleArtTest() {
    return (
        <div style={{ background: "#1a1a2e", minHeight: "100vh", padding: 32, color: "#fff", fontFamily: "sans-serif" }}>
            <h1 style={{ marginBottom: 32 }}>Idle Art Layer Test</h1>

            {/* Character with each sword */}
            <h2 style={{ marginBottom: 16 }}>Character + Sword</h2>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 48 }}>
                {SWORD_VARIANTS.map((name) => (
                    <CharacterWithSword key={name} swordName={name} />
                ))}
            </div>

            {/* Character layers only */}
            <h2 style={{ marginBottom: 16 }}>Character layers</h2>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 48 }}>
                {/* Full stack */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{ position: "relative", width: SW, height: SH }}>
                        {CHARACTER_LAYERS.map(name => (
                            <Sprite key={name} src={`/idle/Character/Male/${name}.png`} />
                        ))}
                    </div>
                    <div style={{ fontSize: 12, color: "#aaa" }}>All layers</div>
                </div>
                {/* Individual */}
                {CHARACTER_LAYERS.map(name => (
                    <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <div style={{ position: "relative", width: SW, height: SH }}>
                            <Sprite src={`/idle/Character/Male/${name}.png`} />
                        </div>
                        <div style={{ fontSize: 12, color: "#aaa" }}>{name}</div>
                    </div>
                ))}
            </div>

            {/* Swords only */}
            <h2 style={{ marginBottom: 16 }}>Swords (hilt + blade)</h2>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {SWORD_VARIANTS.map((name) => (
                    <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <div style={{ position: "relative", width: SW, height: SH }}>
                            <Sprite src={`/idle/Weapons/Swords/Hilts/Human/${name} Hilt.png`} />
                            <Sprite src={`/idle/Weapons/Swords/Blades/Human/${name} Blade.png`} />
                        </div>
                        <div style={{ fontSize: 12, color: "#aaa" }}>{name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
