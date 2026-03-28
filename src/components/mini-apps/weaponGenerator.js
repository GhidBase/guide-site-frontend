// ── Origins ───────────────────────────────────────────────────────────────────

export const ORIGINS = {
    ELVEN: "Elven",
    HUMAN: "Human",
};

// ── Rarity ────────────────────────────────────────────────────────────────────
// Rarity is determined by summing all part ratings (4 parts × 1–5 = range 4–20).
// This means secondary parts matter: a high primary with weak secondaries can
// land at a lower rarity, and a mid primary with great secondaries can hit
// legendary. Thresholds are checked highest-first.

const RARITY_FROM_SUM = [
    { min: 81, rarity: "legendary" },
    { min: 61, rarity: "epic" },
    { min: 41, rarity: "rare" },
    { min: 21, rarity: "uncommon" },
    { min: 0,  rarity: "common" },
];

// How strongly secondary parts are pulled toward the primary part's rating.
// Index = absolute rating difference (0–4).
const RATING_PROXIMITY_WEIGHTS = [50, 25, 10, 3, 1];

// Drop weight for primary part selection by rating (index = rating - 1).
// Heavily skewed toward low ratings so legendaries feel like a real event.
const PRIMARY_RARITY_WEIGHTS = [100, 60, 30, 10, 2];

// ── Shared Pools ──────────────────────────────────────────────────────────────
// These are referenced by multiple weapon types.

const GRIP_POOL = [
    {
        id: "g_e1",
        origin: "Elven",
        name: "Silkwood Grip",
        rating: 6,
        prefix: "Swift",
        stats: { speed: 2 },
    },
    {
        id: "g_e2",
        origin: "Elven",
        name: "Moonweave Grip",
        rating: 11,
        prefix: "Nimble",
        stats: { speed: 3 },
    },
    {
        id: "g_e3",
        origin: "Elven",
        name: "Starthread Grip",
        rating: 16,
        prefix: "Ethereal",
        stats: { speed: 3, magic: 1 },
    },
    {
        id: "g_e4",
        origin: "Elven",
        name: "Dreamwoven Grip",
        rating: 22,
        prefix: "Spectral",
        stats: { speed: 4, magic: 2 },
    },
    {
        id: "g_h1",
        origin: "Human",
        name: "Soldier's Grip",
        rating: 3,
        prefix: "Reliable",
        stats: { attack: 1, defense: 1 },
    },
    {
        id: "g_h2",
        origin: "Human",
        name: "Knight's Grip",
        rating: 8,
        prefix: "Balanced",
        stats: { attack: 1, defense: 1, speed: 1 },
    },
    {
        id: "g_h3",
        origin: "Human",
        name: "Champion's Grip",
        rating: 13,
        prefix: "Steadfast",
        stats: { attack: 2, defense: 1, speed: 1 },
    },
    {
        id: "g_h4",
        origin: "Human",
        name: "Tempered Grip",
        rating: 18,
        prefix: "True",
        stats: { attack: 2, defense: 2, speed: 1 },
    },
    {
        id: "g_h5",
        origin: "Human",
        name: "Grandmaster's Grip",
        rating: 24,
        prefix: "Versatile",
        stats: { attack: 3, defense: 2, speed: 2 },
    },
];

const POMMEL_POOL = [
    {
        id: "pm_e1",
        origin: "Elven",
        name: "Moonstone Cap",
        rating: 7,
        prefix: null,
        stats: { magic: 1, speed: 1 },
    },
    {
        id: "pm_e2",
        origin: "Elven",
        name: "Starcrystal Pommel",
        rating: 12,
        prefix: null,
        stats: { magic: 2, speed: 1 },
    },
    {
        id: "pm_e3",
        origin: "Elven",
        name: "Celestial Orb",
        rating: 19,
        prefix: null,
        stats: { magic: 4, speed: 2 },
    },
    {
        id: "pm_e4",
        origin: "Elven",
        name: "Aurora Core",
        rating: 25,
        prefix: null,
        stats: { magic: 5, speed: 2, attack: 1 },
    },
    {
        id: "pm_h1",
        origin: "Human",
        name: "Soldier's Pommel",
        rating: 2,
        prefix: null,
        stats: { defense: 1 },
    },
    {
        id: "pm_h2",
        origin: "Human",
        name: "Fine Steel Pommel",
        rating: 7,
        prefix: null,
        stats: { attack: 1, defense: 1 },
    },
    {
        id: "pm_h3",
        origin: "Human",
        name: "Knight's Pommel",
        rating: 12,
        prefix: null,
        stats: { attack: 1, defense: 2 },
    },
    {
        id: "pm_h4",
        origin: "Human",
        name: "Champion's End",
        rating: 18,
        prefix: null,
        stats: { attack: 2, defense: 2, speed: 1 },
    },
    {
        id: "pm_h5",
        origin: "Human",
        name: "Grandmaster's Pommel",
        rating: 22,
        prefix: null,
        stats: { attack: 2, defense: 3, speed: 1 },
    },
];

const GUARD_POOL = [
    {
        id: "gd_e1",
        origin: "Elven",
        name: "Leafbend Guard",
        rating: 7,
        prefix: "Elegant",
        stats: { defense: 1, speed: 1 },
    },
    {
        id: "gd_e2",
        origin: "Elven",
        name: "Moonsilver Guard",
        rating: 12,
        prefix: "Graceful",
        stats: { defense: 2, speed: 1 },
    },
    {
        id: "gd_e3",
        origin: "Elven",
        name: "Starforged Guard",
        rating: 17,
        prefix: "Radiant",
        stats: { defense: 3, magic: 1 },
    },
    {
        id: "gd_e4",
        origin: "Elven",
        name: "Solarbind Guard",
        rating: 23,
        prefix: "Luminous",
        stats: { defense: 4, magic: 2, speed: 1 },
    },
    {
        id: "gd_h1",
        origin: "Human",
        name: "Soldier's Guard",
        rating: 3,
        prefix: "Reliable",
        stats: { defense: 2 },
    },
    {
        id: "gd_h2",
        origin: "Human",
        name: "Tempered Crossguard",
        rating: 9,
        prefix: "Balanced",
        stats: { defense: 2, speed: 1 },
    },
    {
        id: "gd_h3",
        origin: "Human",
        name: "Knight's Guard",
        rating: 13,
        prefix: "Steadfast",
        stats: { defense: 3, attack: 1 },
    },
    {
        id: "gd_h4",
        origin: "Human",
        name: "Refined Guard",
        rating: 19,
        prefix: "True",
        stats: { defense: 4, attack: 1, speed: 1 },
    },
    {
        id: "gd_h5",
        origin: "Human",
        name: "Grandmaster's Guard",
        rating: 25,
        prefix: "Versatile",
        stats: { defense: 5, attack: 2, speed: 1 },
    },
];

// ── Sword Family ──────────────────────────────────────────────────────────────

const DAGGER_BLADES = [
    {
        id: "db_e1",
        origin: "Elven",
        name: "Fang",
        rating: 9,
        stats: { attack: 4, speed: 3 },
    },
    {
        id: "db_e2",
        origin: "Elven",
        name: "Moonpiercer",
        rating: 14,
        stats: { attack: 6, speed: 4 },
    },
    {
        id: "db_e3",
        origin: "Elven",
        name: "Silverfang",
        rating: 19,
        stats: { attack: 8, speed: 5, magic: 1 },
    },
    {
        id: "db_e4",
        origin: "Elven",
        name: "Dawnwhisper",
        rating: 24,
        stats: { attack: 10, speed: 6, magic: 2 },
    },
    {
        id: "db_h1",
        origin: "Human",
        name: "Soldier's Knife",
        rating: 5,
        stats: { attack: 4, speed: 2, defense: 1 },
    },
    {
        id: "db_h2",
        origin: "Human",
        name: "Tempered Dagger",
        rating: 10,
        stats: { attack: 6, speed: 2, defense: 1 },
    },
    {
        id: "db_h3",
        origin: "Human",
        name: "Knight's Dirk",
        rating: 15,
        stats: { attack: 8, speed: 3, defense: 1 },
    },
    {
        id: "db_h4",
        origin: "Human",
        name: "Fine Steel Dagger",
        rating: 20,
        stats: { attack: 10, speed: 4, defense: 2 },
    },
    {
        id: "db_h5",
        origin: "Human",
        name: "Champion's Blade",
        rating: 25,
        stats: { attack: 13, speed: 5, defense: 2 },
    },
];

const DAGGER_CROSSGUARDS = [
    {
        id: "dc_e1",
        origin: "Elven",
        name: "Leaf Quillon",
        rating: 6,
        prefix: "Keen",
        stats: { speed: 2 },
    },
    {
        id: "dc_e2",
        origin: "Elven",
        name: "Moonsilver Quillon",
        rating: 11,
        prefix: "Sharp",
        stats: { speed: 2, magic: 1 },
    },
    {
        id: "dc_e3",
        origin: "Elven",
        name: "Starforged Quillon",
        rating: 17,
        prefix: "Piercing",
        stats: { speed: 3, magic: 2 },
    },
    {
        id: "dc_h1",
        origin: "Human",
        name: "Soldier's Quillon",
        rating: 3,
        prefix: "Reliable",
        stats: { defense: 1, speed: 1 },
    },
    {
        id: "dc_h2",
        origin: "Human",
        name: "Tempered Crossguard",
        rating: 8,
        prefix: "Balanced",
        stats: { defense: 2, speed: 1 },
    },
    {
        id: "dc_h3",
        origin: "Human",
        name: "Knight's Quillon",
        rating: 13,
        prefix: "True",
        stats: { defense: 2, attack: 1, speed: 1 },
    },
    {
        id: "dc_h4",
        origin: "Human",
        name: "Fine Steel Guard",
        rating: 19,
        prefix: "Steadfast",
        stats: { defense: 3, attack: 1, speed: 2 },
    },
];

const SWORD_BLADES = [
    {
        id: "sw_e1",
        origin: "Elven",
        name: "Moonblade",
        rating: 9,
        stats: { attack: 6, speed: 2 },
    },
    {
        id: "sw_e2",
        origin: "Elven",
        name: "Starfang",
        rating: 14,
        stats: { attack: 8, speed: 2, magic: 1 },
    },
    {
        id: "sw_e3",
        origin: "Elven",
        name: "Dawnedge",
        rating: 20,
        stats: { attack: 11, speed: 2, magic: 2 },
    },
    {
        id: "sw_e4",
        origin: "Elven",
        name: "Celestial Blade",
        rating: 24,
        stats: { attack: 14, speed: 3, magic: 3 },
    },
    {
        id: "sw_h1",
        origin: "Human",
        name: "Soldier's Blade",
        rating: 5,
        stats: { attack: 5, defense: 1 },
    },
    {
        id: "sw_h2",
        origin: "Human",
        name: "Tempered Blade",
        rating: 10,
        stats: { attack: 7, defense: 1, speed: 1 },
    },
    {
        id: "sw_h3",
        origin: "Human",
        name: "Knight's Blade",
        rating: 15,
        stats: { attack: 9, defense: 2, speed: 1 },
    },
    {
        id: "sw_h5",
        origin: "Human",
        name: "Champion's Edge",
        rating: 25,
        stats: { attack: 15, defense: 4, speed: 2 },
    },
];

const LONGSWORD_BLADES = [
    {
        id: "ls_e1",
        origin: "Elven",
        name: "Whisper",
        rating: 9,
        stats: { attack: 7, speed: 2 },
    },
    {
        id: "ls_e2",
        origin: "Elven",
        name: "Moonshard",
        rating: 14,
        stats: { attack: 10, speed: 2 },
    },
    {
        id: "ls_e3",
        origin: "Elven",
        name: "Starweave",
        rating: 19,
        stats: { attack: 13, speed: 1, magic: 2 },
    },
    {
        id: "ls_e4",
        origin: "Elven",
        name: "Celestial Edge",
        rating: 24,
        stats: { attack: 16, speed: 2, magic: 3 },
    },
    {
        id: "ls_h1",
        origin: "Human",
        name: "Soldier's Longsword",
        rating: 5,
        stats: { attack: 6, defense: 1 },
    },
    {
        id: "ls_h2",
        origin: "Human",
        name: "Tempered Longsword",
        rating: 10,
        stats: { attack: 8, defense: 1, speed: 1 },
    },
    {
        id: "ls_h3",
        origin: "Human",
        name: "Knight's Blade",
        rating: 15,
        stats: { attack: 11, defense: 2, speed: 1 },
    },
    {
        id: "ls_h4",
        origin: "Human",
        name: "Fine Steel Longsword",
        rating: 20,
        stats: { attack: 14, defense: 3, speed: 1 },
    },
    {
        id: "ls_h5",
        origin: "Human",
        name: "Champion's Longsword",
        rating: 25,
        stats: { attack: 17, defense: 4, speed: 2 },
    },
];

const GREATSWORD_BLADES = [
    {
        id: "gs_e1",
        origin: "Elven",
        name: "Moonglaive",
        rating: 9,
        stats: { attack: 12, speed: 1 },
    },
    {
        id: "gs_e2",
        origin: "Elven",
        name: "Starblade",
        rating: 14,
        stats: { attack: 16, speed: 1, magic: 2 },
    },
    {
        id: "gs_e3",
        origin: "Elven",
        name: "Sunsever",
        rating: 19,
        stats: { attack: 20, speed: 1, magic: 3 },
    },
    {
        id: "gs_e4",
        origin: "Elven",
        name: "Celestial Reaper",
        rating: 24,
        stats: { attack: 24, speed: 2, magic: 5 },
    },
    {
        id: "gs_h1",
        origin: "Human",
        name: "Soldier's Greatsword",
        rating: 4,
        stats: { attack: 9, defense: 1 },
    },
    {
        id: "gs_h2",
        origin: "Human",
        name: "Tempered Greatsword",
        rating: 10,
        stats: { attack: 13, defense: 2 },
    },
    {
        id: "gs_h3",
        origin: "Human",
        name: "Knight's Claymore",
        rating: 15,
        stats: { attack: 17, defense: 3 },
    },
    {
        id: "gs_h4",
        origin: "Human",
        name: "Fine Steel Claymore",
        rating: 20,
        stats: { attack: 21, defense: 4 },
    },
    {
        id: "gs_h5",
        origin: "Human",
        name: "Grandmaster's Blade",
        rating: 25,
        stats: { attack: 25, defense: 5, speed: 1 },
    },
];
// ── Armor ─────────────────────────────────────────────────────────────────────

const CHEST_PLATES = [
    {
        id: "cp_e1",
        origin: "Elven",
        name: "Moonweave Breastplate",
        rating: 8,
        stats: { defense: 10, speed: 2 },
    },
    {
        id: "cp_e2",
        origin: "Elven",
        name: "Starforged Cuirass",
        rating: 13,
        stats: { defense: 14, speed: 2, magic: 1 },
    },
    {
        id: "cp_e3",
        origin: "Elven",
        name: "Celestial Plate",
        rating: 18,
        stats: { defense: 18, speed: 3, magic: 2 },
    },
    {
        id: "cp_e4",
        origin: "Elven",
        name: "Aurora Breastplate",
        rating: 24,
        stats: { defense: 22, speed: 3, magic: 3 },
    },
    {
        id: "cp_h1",
        origin: "Human",
        name: "Soldier's Breastplate",
        rating: 4,
        stats: { defense: 9, attack: 1 },
    },
    {
        id: "cp_h2",
        origin: "Human",
        name: "Knight's Cuirass",
        rating: 9,
        stats: { defense: 11, attack: 1, speed: 1 },
    },
    {
        id: "cp_h3",
        origin: "Human",
        name: "Champion's Plate",
        rating: 14,
        stats: { defense: 14, attack: 2, speed: 1 },
    },
    {
        id: "cp_h4",
        origin: "Human",
        name: "Grandmaster's Cuirass",
        rating: 17,
        stats: { defense: 17, attack: 2, speed: 1 },
    },
    {
        id: "cp_h5",
        origin: "Human",
        name: "Grand Champion's Plate",
        rating: 23,
        stats: { defense: 21, attack: 3, speed: 2 },
    },
];

const PAULDRONS = [
    {
        id: "pa_e1",
        origin: "Elven",
        name: "Moonsilver Pauldrons",
        rating: 7,
        prefix: "Lithe",
        stats: { defense: 4, speed: 2 },
    },
    {
        id: "pa_e2",
        origin: "Elven",
        name: "Starweave Pauldrons",
        rating: 12,
        prefix: "Graceful",
        stats: { defense: 5, speed: 2, magic: 1 },
    },
    {
        id: "pa_e3",
        origin: "Elven",
        name: "Celestial Shoulders",
        rating: 16,
        prefix: "Flowing",
        stats: { defense: 6, speed: 3, magic: 1 },
    },
    {
        id: "pa_e4",
        origin: "Elven",
        name: "Aurora Pauldrons",
        rating: 22,
        prefix: "Radiant",
        stats: { defense: 7, speed: 3, magic: 2 },
    },
    {
        id: "pa_h1",
        origin: "Human",
        name: "Iron Pauldrons",
        rating: 3,
        prefix: "Reliable",
        stats: { defense: 4, attack: 1 },
    },
    {
        id: "pa_h2",
        origin: "Human",
        name: "Soldier's Pauldrons",
        rating: 8,
        prefix: "Steadfast",
        stats: { defense: 5, attack: 1, speed: 1 },
    },
    {
        id: "pa_h3",
        origin: "Human",
        name: "Knight's Pauldrons",
        rating: 13,
        prefix: "Balanced",
        stats: { defense: 6, attack: 1, speed: 1 },
    },
    {
        id: "pa_h4",
        origin: "Human",
        name: "Champion's Pauldrons",
        rating: 17,
        prefix: "Noble",
        stats: { defense: 7, attack: 2, speed: 1 },
    },
    {
        id: "pa_h5",
        origin: "Human",
        name: "Grandmaster's Shoulders",
        rating: 23,
        prefix: "Stalwart",
        stats: { defense: 8, attack: 2, speed: 2 },
    },
];

const ARMOR_LININGS = [
    {
        id: "al_e1",
        origin: "Elven",
        name: "Moonsilk Lining",
        rating: 7,
        prefix: null,
        stats: { defense: 2, speed: 2 },
    },
    {
        id: "al_e2",
        origin: "Elven",
        name: "Starweave Padding",
        rating: 12,
        prefix: null,
        stats: { defense: 3, speed: 2, magic: 1 },
    },
    {
        id: "al_e3",
        origin: "Elven",
        name: "Celestial Lining",
        rating: 17,
        prefix: null,
        stats: { defense: 4, speed: 3, magic: 1 },
    },
    {
        id: "al_e4",
        origin: "Elven",
        name: "Dreamweave Lining",
        rating: 23,
        prefix: null,
        stats: { defense: 5, speed: 3, magic: 2 },
    },
    {
        id: "al_h1",
        origin: "Human",
        name: "Wool Lining",
        rating: 2,
        prefix: null,
        stats: { defense: 2 },
    },
    {
        id: "al_h2",
        origin: "Human",
        name: "Leather Padding",
        rating: 8,
        prefix: null,
        stats: { defense: 3, speed: 1 },
    },
    {
        id: "al_h3",
        origin: "Human",
        name: "Chainmail Lining",
        rating: 11,
        prefix: null,
        stats: { defense: 4, speed: 1 },
    },
    {
        id: "al_h4",
        origin: "Human",
        name: "Tempered Padding",
        rating: 16,
        prefix: null,
        stats: { defense: 5, attack: 1, speed: 1 },
    },
    {
        id: "al_h5",
        origin: "Human",
        name: "Masterwork Lining",
        rating: 21,
        prefix: null,
        stats: { defense: 6, attack: 1, speed: 1 },
    },
];

const ARMOR_CLASPS = [
    {
        id: "ac_e1",
        origin: "Elven",
        name: "Moonsilver Clasp",
        rating: 7,
        prefix: null,
        stats: { defense: 2, speed: 1 },
    },
    {
        id: "ac_e2",
        origin: "Elven",
        name: "Starforged Buckle",
        rating: 11,
        prefix: null,
        stats: { defense: 3, speed: 1 },
    },
    {
        id: "ac_e3",
        origin: "Elven",
        name: "Celestial Clasp",
        rating: 17,
        prefix: null,
        stats: { defense: 3, speed: 2, magic: 1 },
    },
    {
        id: "ac_e4",
        origin: "Elven",
        name: "Aurora Fastening",
        rating: 22,
        prefix: null,
        stats: { defense: 4, speed: 2, magic: 1 },
    },
    {
        id: "ac_h1",
        origin: "Human",
        name: "Iron Buckle",
        rating: 2,
        prefix: null,
        stats: { defense: 2 },
    },
    {
        id: "ac_h2",
        origin: "Human",
        name: "Soldier's Clasp",
        rating: 8,
        prefix: null,
        stats: { defense: 3 },
    },
    {
        id: "ac_h3",
        origin: "Human",
        name: "Knight's Buckle",
        rating: 12,
        prefix: null,
        stats: { defense: 3, attack: 1 },
    },
    {
        id: "ac_h4",
        origin: "Human",
        name: "Champion's Clasp",
        rating: 16,
        prefix: null,
        stats: { defense: 4, attack: 1 },
    },
    {
        id: "ac_h5",
        origin: "Human",
        name: "Grandmaster's Fastening",
        rating: 23,
        prefix: null,
        stats: { defense: 5, attack: 1, speed: 1 },
    },
];

const HELM_SHELLS = [
    {
        id: "hs_e1",
        origin: "Elven",
        name: "Moonsilver Helm",
        rating: 9,
        stats: { defense: 6, speed: 1, magic: 1 },
    },
    {
        id: "hs_e2",
        origin: "Elven",
        name: "Starforged Helm",
        rating: 13,
        stats: { defense: 8, speed: 1, magic: 2 },
    },
    {
        id: "hs_e3",
        origin: "Elven",
        name: "Celestial Crown",
        rating: 20,
        stats: { defense: 11, speed: 2, magic: 3 },
    },
    {
        id: "hs_e4",
        origin: "Elven",
        name: "Aurora Helm",
        rating: 24,
        stats: { defense: 14, speed: 2, magic: 4 },
    },
    {
        id: "hs_h1",
        origin: "Human",
        name: "Iron Helm",
        rating: 4,
        stats: { defense: 5, attack: 1 },
    },
    {
        id: "hs_h2",
        origin: "Human",
        name: "Soldier's Helm",
        rating: 10,
        stats: { defense: 7, attack: 1, speed: 1 },
    },
    {
        id: "hs_h3",
        origin: "Human",
        name: "Knight's Helm",
        rating: 14,
        stats: { defense: 9, attack: 1, speed: 1 },
    },
    {
        id: "hs_h4",
        origin: "Human",
        name: "Champion's Helm",
        rating: 17,
        stats: { defense: 11, attack: 2, speed: 1 },
    },
];

const HELM_VISORS = [
    {
        id: "hv_e1",
        origin: "Elven",
        name: "Moonsilver Visor",
        rating: 7,
        prefix: "Keen",
        stats: { defense: 3, magic: 1 },
    },
    {
        id: "hv_e2",
        origin: "Elven",
        name: "Starweave Visor",
        rating: 12,
        prefix: "Piercing",
        stats: { defense: 4, magic: 2 },
    },
    {
        id: "hv_e3",
        origin: "Elven",
        name: "Celestial Faceplate",
        rating: 18,
        prefix: "Vigilant",
        stats: { defense: 5, magic: 2, speed: 1 },
    },
    {
        id: "hv_e4",
        origin: "Elven",
        name: "Aurora Visor",
        rating: 23,
        prefix: "Prescient",
        stats: { defense: 6, magic: 3, speed: 1 },
    },
    {
        id: "hv_h1",
        origin: "Human",
        name: "Iron Visor",
        rating: 2,
        prefix: "Reliable",
        stats: { defense: 3 },
    },
    {
        id: "hv_h2",
        origin: "Human",
        name: "Soldier's Visor",
        rating: 8,
        prefix: "Steadfast",
        stats: { defense: 4, attack: 1 },
    },
    {
        id: "hv_h3",
        origin: "Human",
        name: "Knight's Faceplate",
        rating: 13,
        prefix: "Resolute",
        stats: { defense: 5, attack: 1 },
    },
    {
        id: "hv_h4",
        origin: "Human",
        name: "Champion's Visor",
        rating: 19,
        prefix: "Dauntless",
        stats: { defense: 6, attack: 2 },
    },
    {
        id: "hv_h5",
        origin: "Human",
        name: "Grandmaster's Faceplate",
        rating: 24,
        prefix: "Indomitable",
        stats: { defense: 7, attack: 2, speed: 1 },
    },
];

const HELM_STRAPS = [
    {
        id: "hst_e1",
        origin: "Elven",
        name: "Moonsilk Strap",
        rating: 7,
        prefix: null,
        stats: { defense: 2, speed: 1 },
    },
    {
        id: "hst_e2",
        origin: "Elven",
        name: "Starweave Strap",
        rating: 12,
        prefix: null,
        stats: { defense: 3, speed: 1, magic: 1 },
    },
    {
        id: "hst_e3",
        origin: "Elven",
        name: "Celestial Strap",
        rating: 17,
        prefix: null,
        stats: { defense: 3, speed: 2, magic: 1 },
    },
    {
        id: "hst_e4",
        origin: "Elven",
        name: "Dreamweave Strap",
        rating: 22,
        prefix: null,
        stats: { defense: 4, speed: 2, magic: 2 },
    },
    {
        id: "hst_h1",
        origin: "Human",
        name: "Leather Strap",
        rating: 1,
        prefix: null,
        stats: { defense: 1 },
    },
    {
        id: "hst_h2",
        origin: "Human",
        name: "Reinforced Strap",
        rating: 6,
        prefix: null,
        stats: { defense: 2 },
    },
    {
        id: "hst_h3",
        origin: "Human",
        name: "Knight's Strap",
        rating: 11,
        prefix: null,
        stats: { defense: 3, speed: 1 },
    },
    {
        id: "hst_h4",
        origin: "Human",
        name: "Champion's Strap",
        rating: 16,
        prefix: null,
        stats: { defense: 3, attack: 1, speed: 1 },
    },
    {
        id: "hst_h5",
        origin: "Human",
        name: "Masterwork Strap",
        rating: 21,
        prefix: null,
        stats: { defense: 4, attack: 1, speed: 1 },
    },
];

const LEG_PLATES = [
    {
        id: "lp_e1",
        origin: "Elven",
        name: "Moonweave Greaves",
        rating: 8,
        stats: { defense: 8, speed: 3 },
    },
    {
        id: "lp_e2",
        origin: "Elven",
        name: "Starforged Greaves",
        rating: 14,
        stats: { defense: 11, speed: 3, magic: 1 },
    },
    {
        id: "lp_e3",
        origin: "Elven",
        name: "Celestial Greaves",
        rating: 19,
        stats: { defense: 14, speed: 4, magic: 1 },
    },
    {
        id: "lp_e4",
        origin: "Elven",
        name: "Aurora Greaves",
        rating: 25,
        stats: { defense: 17, speed: 5, magic: 2 },
    },
    {
        id: "lp_h1",
        origin: "Human",
        name: "Iron Greaves",
        rating: 4,
        stats: { defense: 8, speed: 1 },
    },
    {
        id: "lp_h2",
        origin: "Human",
        name: "Soldier's Greaves",
        rating: 9,
        stats: { defense: 10, attack: 1, speed: 1 },
    },
    {
        id: "lp_h3",
        origin: "Human",
        name: "Knight's Greaves",
        rating: 15,
        stats: { defense: 12, attack: 1, speed: 2 },
    },
    {
        id: "lp_h4",
        origin: "Human",
        name: "Champion's Greaves",
        rating: 20,
        stats: { defense: 15, attack: 2, speed: 2 },
    },
    {
        id: "lp_h5",
        origin: "Human",
        name: "Grand Champion's Greaves",
        rating: 24,
        stats: { defense: 18, attack: 2, speed: 3 },
    },
];

const KNEE_PLATES = [
    {
        id: "kp_e1",
        origin: "Elven",
        name: "Moonsilver Poleyn",
        rating: 8,
        prefix: "Nimble",
        stats: { defense: 3, speed: 2 },
    },
    {
        id: "kp_e2",
        origin: "Elven",
        name: "Starforged Poleyn",
        rating: 13,
        prefix: "Swift",
        stats: { defense: 4, speed: 3 },
    },
    {
        id: "kp_e3",
        origin: "Elven",
        name: "Celestial Poleyn",
        rating: 18,
        prefix: "Fleet",
        stats: { defense: 5, speed: 3, magic: 1 },
    },
    {
        id: "kp_e4",
        origin: "Elven",
        name: "Aurora Poleyn",
        rating: 23,
        prefix: "Ethereal",
        stats: { defense: 6, speed: 4, magic: 1 },
    },
    {
        id: "kp_h1",
        origin: "Human",
        name: "Iron Poleyn",
        rating: 3,
        prefix: "Reliable",
        stats: { defense: 3, speed: 1 },
    },
    {
        id: "kp_h2",
        origin: "Human",
        name: "Soldier's Poleyn",
        rating: 9,
        prefix: "Steadfast",
        stats: { defense: 4, attack: 1, speed: 1 },
    },
    {
        id: "kp_h3",
        origin: "Human",
        name: "Knight's Poleyn",
        rating: 14,
        prefix: "Balanced",
        stats: { defense: 5, attack: 1, speed: 2 },
    },
    {
        id: "kp_h4",
        origin: "Human",
        name: "Champion's Poleyn",
        rating: 19,
        prefix: "Stalwart",
        stats: { defense: 6, attack: 2, speed: 2 },
    },
    {
        id: "kp_h5",
        origin: "Human",
        name: "Grandmaster's Poleyn",
        rating: 24,
        prefix: "Indomitable",
        stats: { defense: 7, attack: 2, speed: 3 },
    },
];

const LEG_STRAPS = [
    {
        id: "ls2_e1",
        origin: "Elven",
        name: "Moonsilk Straps",
        rating: 7,
        prefix: null,
        stats: { defense: 2, speed: 2 },
    },
    {
        id: "ls2_e2",
        origin: "Elven",
        name: "Starweave Straps",
        rating: 11,
        prefix: null,
        stats: { defense: 3, speed: 2 },
    },
    {
        id: "ls2_e3",
        origin: "Elven",
        name: "Celestial Straps",
        rating: 18,
        prefix: null,
        stats: { defense: 4, speed: 3, magic: 1 },
    },
    {
        id: "ls2_e4",
        origin: "Elven",
        name: "Dreamweave Straps",
        rating: 22,
        prefix: null,
        stats: { defense: 5, speed: 3, magic: 1 },
    },
    {
        id: "ls2_h1",
        origin: "Human",
        name: "Leather Straps",
        rating: 3,
        prefix: null,
        stats: { defense: 2, speed: 1 },
    },
    {
        id: "ls2_h2",
        origin: "Human",
        name: "Soldier's Straps",
        rating: 8,
        prefix: null,
        stats: { defense: 3, speed: 1 },
    },
    {
        id: "ls2_h3",
        origin: "Human",
        name: "Knight's Straps",
        rating: 12,
        prefix: null,
        stats: { defense: 3, attack: 1, speed: 1 },
    },
    {
        id: "ls2_h4",
        origin: "Human",
        name: "Champion's Straps",
        rating: 16,
        prefix: null,
        stats: { defense: 4, attack: 1, speed: 2 },
    },
    {
        id: "ls2_h5",
        origin: "Human",
        name: "Masterwork Straps",
        rating: 23,
        prefix: null,
        stats: { defense: 5, attack: 2, speed: 2 },
    },
];

// ── Weapon Definitions ────────────────────────────────────────────────────────
// slots[0] is always the primary (locks origin). The rest are weighted.

const WEAPON_DEFINITIONS = {
    sword: {
        label: "Sword",
        slots: [
            { key: "blade", label: "Blade", pool: SWORD_BLADES },
            { key: "guard", label: "Guard", pool: GUARD_POOL },
            { key: "grip", label: "Grip", pool: GRIP_POOL },
            { key: "pommel", label: "Pommel", pool: POMMEL_POOL },
        ],
    },
    dagger: {
        label: "Dagger",
        slots: [
            { key: "blade", label: "Blade", pool: DAGGER_BLADES },
            {
                key: "crossguard",
                label: "Crossguard",
                pool: DAGGER_CROSSGUARDS,
            },
            { key: "grip", label: "Grip", pool: GRIP_POOL },
            { key: "pommel", label: "Pommel", pool: POMMEL_POOL },
        ],
    },
    longsword: {
        label: "Long Sword",
        slots: [
            { key: "blade", label: "Blade", pool: LONGSWORD_BLADES },
            { key: "guard", label: "Guard", pool: GUARD_POOL },
            { key: "grip", label: "Grip", pool: GRIP_POOL },
            { key: "pommel", label: "Pommel", pool: POMMEL_POOL },
        ],
    },
    greatsword: {
        label: "Great Sword",
        slots: [
            { key: "blade", label: "Blade", pool: GREATSWORD_BLADES },
            { key: "guard", label: "Guard", pool: GUARD_POOL },
            { key: "grip", label: "Grip", pool: GRIP_POOL },
            { key: "pommel", label: "Pommel", pool: POMMEL_POOL },
        ],
    },
    chest: {
        label: "Chest",
        slots: [
            { key: "plate", label: "Plate", pool: CHEST_PLATES },
            { key: "pauldrons", label: "Pauldrons", pool: PAULDRONS },
            { key: "lining", label: "Lining", pool: ARMOR_LININGS },
            { key: "clasp", label: "Clasp", pool: ARMOR_CLASPS },
        ],
    },
    helm: {
        label: "Helm",
        slots: [
            { key: "shell", label: "Shell", pool: HELM_SHELLS },
            { key: "visor", label: "Visor", pool: HELM_VISORS },
            { key: "lining", label: "Lining", pool: ARMOR_LININGS },
            { key: "strap", label: "Strap", pool: HELM_STRAPS },
        ],
    },
    legs: {
        label: "Legs",
        slots: [
            { key: "plate", label: "Plate", pool: LEG_PLATES },
            { key: "kneeplate", label: "Kneeplate", pool: KNEE_PLATES },
            { key: "lining", label: "Lining", pool: ARMOR_LININGS },
            { key: "straps", label: "Straps", pool: LEG_STRAPS },
        ],
    },
};

export const WEAPON_TYPES = Object.entries(WEAPON_DEFINITIONS).map(
    ([id, def]) => ({ id, label: def.label }),
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function weightedRandom(weightedItems) {
    const total = weightedItems.reduce((sum, x) => sum + x.weight, 0);
    let r = Math.random() * total;
    for (const { item, weight } of weightedItems) {
        r -= weight;
        if (r <= 0) return item;
    }
    return weightedItems[weightedItems.length - 1].item;
}

function pickPart(pool, lockedOrigin, primaryRating, allowCrossOrigin) {
    const primaryTier = Math.ceil(primaryRating / 5);
    const weighted = pool.map((part) => {
        const isCross = part.origin !== null && part.origin !== lockedOrigin;
        if (isCross && !allowCrossOrigin) return { item: part, weight: 0 };
        const originWeight = part.origin === null ? 30 : isCross ? 10 : 60;
        const partTier = Math.ceil(part.rating / 5);
        const ratingWeight = RATING_PROXIMITY_WEIGHTS[Math.abs(partTier - primaryTier)] ?? 1;
        return { item: part, weight: originWeight * ratingWeight };
    });
    return weightedRandom(weighted);
}

function calcRarity(totalRating) {
    for (const { min, rarity } of RARITY_FROM_SUM) {
        if (totalRating >= min) return rarity;
    }
    return "common";
}

function buildName(primaryPart, otherParts) {
    const prefix =
        [...otherParts]
            .filter((p) => p.prefix)
            .sort((a, b) => b.rating - a.rating)[0]?.prefix ?? null;
    return prefix ? `${prefix} ${primaryPart.name}` : primaryPart.name;
}

function mergeStats(...parts) {
    const stats = {};
    for (const part of parts) {
        for (const [key, val] of Object.entries(part.stats)) {
            stats[key] = (stats[key] ?? 0) + val;
        }
    }
    return stats;
}

const LOG_SCALING_FACTOR = 2;

const UNSCALED_STATS = new Set(["speed"]);

function scaleStats(stats, level) {
    const multiplier = 1 + Math.log(level + 1) * LOG_SCALING_FACTOR;
    const scaled = {};
    for (const [key, val] of Object.entries(stats)) {
        if (UNSCALED_STATS.has(key)) { scaled[key] = val; continue; }
        // Negative stats (e.g. penalties) scale toward zero, not further negative
        if (val < 0) scaled[key] = Math.ceil(val / multiplier);
        else scaled[key] = Math.round(val * multiplier);
    }
    return scaled;
}

function resolveOrigin(parts) {
    const counts = {};
    for (const part of parts) {
        if (part.origin) counts[part.origin] = (counts[part.origin] ?? 0) + 1;
    }
    if (Object.keys(counts).length === 0) return "Neutral";
    const [dominant, count] = Object.entries(counts).sort(
        (a, b) => b[1] - a[1],
    )[0];
    return count >= 3 ? dominant : `Mixed (${dominant})`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateWeapon(type, level = 1) {
    const def = WEAPON_DEFINITIONS[type];
    if (!def) throw new Error(`Unknown weapon type: ${type}`);

    const [primarySlot, ...secondarySlots] = def.slots;
    const primaryPart = weightedRandom(
        primarySlot.pool.map((part) => ({
            item: part,
            weight: PRIMARY_RARITY_WEIGHTS[Math.ceil(part.rating / 5) - 1] ?? 1,
        })),
    );
    const lockedOrigin = primaryPart.origin;

    const parts = { [primarySlot.key]: primaryPart };
    const secondaryParts = [];
    let hasCrossOriginPart = false;
    for (const slot of secondarySlots) {
        const part = pickPart(
            slot.pool,
            lockedOrigin,
            primaryPart.rating,
            !hasCrossOriginPart,
        );
        if (part.origin !== null && part.origin !== lockedOrigin)
            hasCrossOriginPart = true;
        parts[slot.key] = part;
        secondaryParts.push(part);
    }

    const allParts = [primaryPart, ...secondaryParts];
    const totalRating = allParts.reduce((sum, p) => sum + p.rating, 0);
    const itemPower = Math.round(totalRating * (1 + Math.log(level + 1) * LOG_SCALING_FACTOR));

    return {
        type,
        typeLabel: def.label,
        name: buildName(primaryPart, secondaryParts),
        origin: resolveOrigin(allParts),
        rarity: calcRarity(totalRating),
        totalRating,
        itemPower,
        level,
        stats: scaleStats(mergeStats(...allParts), level),
        baseStats: mergeStats(...allParts),
        slots: def.slots.map((s) => ({ key: s.key, label: s.label })),
        parts,
    };
}

export const generateSword = () => generateWeapon("longsword");

export function rescaleWeapon(weapon, level) {
    return { ...weapon, level, stats: scaleStats(weapon.baseStats, level) };
}
