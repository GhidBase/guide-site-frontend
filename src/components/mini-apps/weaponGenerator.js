// ── Origins ───────────────────────────────────────────────────────────────────

export const ORIGINS = {
    ELVEN: "Elven",
    HUMAN: "Human",
};

// ── Rarity ────────────────────────────────────────────────────────────────────
// Rarity is determined solely by the primary part's rating (1–5).
// Secondary parts are weighted toward the same rating tier, but vary freely,
// giving each rarity tier a wide range of actual power.

const RARITY_BY_RATING = {
    1: "common",
    2: "uncommon",
    3: "rare",
    4: "epic",
    5: "legendary",
};

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
        rating: 2,
        prefix: "Swift",
        stats: { speed: 2 },
    },
    {
        id: "g_e2",
        origin: "Elven",
        name: "Moonweave Grip",
        rating: 3,
        prefix: "Nimble",
        stats: { speed: 3 },
    },
    {
        id: "g_e3",
        origin: "Elven",
        name: "Starthread Grip",
        rating: 4,
        prefix: "Ethereal",
        stats: { speed: 3, magic: 1 },
    },
    {
        id: "g_e4",
        origin: "Elven",
        name: "Dreamwoven Grip",
        rating: 5,
        prefix: "Spectral",
        stats: { speed: 4, magic: 2 },
    },
    {
        id: "g_h1",
        origin: "Human",
        name: "Soldier's Grip",
        rating: 1,
        prefix: "Reliable",
        stats: { attack: 1, defense: 1 },
    },
    {
        id: "g_h2",
        origin: "Human",
        name: "Knight's Grip",
        rating: 2,
        prefix: "Balanced",
        stats: { attack: 1, defense: 1, speed: 1 },
    },
    {
        id: "g_h3",
        origin: "Human",
        name: "Champion's Grip",
        rating: 3,
        prefix: "Steadfast",
        stats: { attack: 2, defense: 1, speed: 1 },
    },
    {
        id: "g_h4",
        origin: "Human",
        name: "Tempered Grip",
        rating: 4,
        prefix: "True",
        stats: { attack: 2, defense: 2, speed: 1 },
    },
    {
        id: "g_h5",
        origin: "Human",
        name: "Grandmaster's Grip",
        rating: 5,
        prefix: "Versatile",
        stats: { attack: 3, defense: 2, speed: 2 },
    },
];

const POMMEL_POOL = [
    {
        id: "pm_e1",
        origin: "Elven",
        name: "Moonstone Cap",
        rating: 2,
        prefix: null,
        stats: { magic: 1, speed: 1 },
    },
    {
        id: "pm_e2",
        origin: "Elven",
        name: "Starcrystal Pommel",
        rating: 3,
        prefix: null,
        stats: { magic: 2, speed: 1 },
    },
    {
        id: "pm_e3",
        origin: "Elven",
        name: "Celestial Orb",
        rating: 4,
        prefix: null,
        stats: { magic: 4, speed: 2 },
    },
    {
        id: "pm_e4",
        origin: "Elven",
        name: "Aurora Core",
        rating: 5,
        prefix: null,
        stats: { magic: 5, speed: 2, attack: 1 },
    },
    {
        id: "pm_h1",
        origin: "Human",
        name: "Soldier's Pommel",
        rating: 1,
        prefix: null,
        stats: { defense: 1 },
    },
    {
        id: "pm_h2",
        origin: "Human",
        name: "Fine Steel Pommel",
        rating: 2,
        prefix: null,
        stats: { attack: 1, defense: 1 },
    },
    {
        id: "pm_h3",
        origin: "Human",
        name: "Knight's Pommel",
        rating: 3,
        prefix: null,
        stats: { attack: 1, defense: 2 },
    },
    {
        id: "pm_h4",
        origin: "Human",
        name: "Champion's End",
        rating: 4,
        prefix: null,
        stats: { attack: 2, defense: 2, speed: 1 },
    },
    {
        id: "pm_h5",
        origin: "Human",
        name: "Grandmaster's Pommel",
        rating: 5,
        prefix: null,
        stats: { attack: 2, defense: 3, speed: 1 },
    },
];

const GUARD_POOL = [
    {
        id: "gd_e1",
        origin: "Elven",
        name: "Leafbend Guard",
        rating: 2,
        prefix: "Elegant",
        stats: { defense: 1, speed: 1 },
    },
    {
        id: "gd_e2",
        origin: "Elven",
        name: "Moonsilver Guard",
        rating: 3,
        prefix: "Graceful",
        stats: { defense: 2, speed: 1 },
    },
    {
        id: "gd_e3",
        origin: "Elven",
        name: "Starforged Guard",
        rating: 4,
        prefix: "Radiant",
        stats: { defense: 3, magic: 1 },
    },
    {
        id: "gd_e4",
        origin: "Elven",
        name: "Solarbind Guard",
        rating: 5,
        prefix: "Luminous",
        stats: { defense: 4, magic: 2, speed: 1 },
    },
    {
        id: "gd_h1",
        origin: "Human",
        name: "Soldier's Guard",
        rating: 1,
        prefix: "Reliable",
        stats: { defense: 2 },
    },
    {
        id: "gd_h2",
        origin: "Human",
        name: "Tempered Crossguard",
        rating: 2,
        prefix: "Balanced",
        stats: { defense: 2, speed: 1 },
    },
    {
        id: "gd_h3",
        origin: "Human",
        name: "Knight's Guard",
        rating: 3,
        prefix: "Steadfast",
        stats: { defense: 3, attack: 1 },
    },
    {
        id: "gd_h4",
        origin: "Human",
        name: "Refined Guard",
        rating: 4,
        prefix: "True",
        stats: { defense: 4, attack: 1, speed: 1 },
    },
    {
        id: "gd_h5",
        origin: "Human",
        name: "Grandmaster's Guard",
        rating: 5,
        prefix: "Versatile",
        stats: { defense: 5, attack: 2, speed: 1 },
    },
];

const SHAFT_POOL = [
    {
        id: "sh_e1",
        origin: "Elven",
        name: "Moonwood Shaft",
        rating: 2,
        prefix: "Lithe",
        stats: { speed: 2, magic: 1 },
    },
    {
        id: "sh_e2",
        origin: "Elven",
        name: "Starweave Shaft",
        rating: 3,
        prefix: "Supple",
        stats: { speed: 2, magic: 2 },
    },
    {
        id: "sh_e3",
        origin: "Elven",
        name: "Celestial Shaft",
        rating: 4,
        prefix: "Flowing",
        stats: { speed: 3, magic: 3 },
    },
    {
        id: "sh_e4",
        origin: "Elven",
        name: "Dreamwood Shaft",
        rating: 5,
        prefix: "Resonant",
        stats: { speed: 3, magic: 4 },
    },
    {
        id: "sh_h1",
        origin: "Human",
        name: "Soldier's Shaft",
        rating: 1,
        prefix: "Reliable",
        stats: { defense: 1 },
    },
    {
        id: "sh_h2",
        origin: "Human",
        name: "Tempered Shaft",
        rating: 2,
        prefix: "Balanced",
        stats: { defense: 1, speed: 1 },
    },
    {
        id: "sh_h3",
        origin: "Human",
        name: "Fine Ash Shaft",
        rating: 3,
        prefix: "Steadfast",
        stats: { attack: 1, defense: 1, speed: 1 },
    },
    {
        id: "sh_h4",
        origin: "Human",
        name: "Refined Shaft",
        rating: 4,
        prefix: "True",
        stats: { attack: 1, defense: 2, speed: 1 },
    },
    {
        id: "sh_h5",
        origin: "Human",
        name: "Grandmaster's Shaft",
        rating: 5,
        prefix: "Versatile",
        stats: { attack: 2, defense: 2, speed: 2 },
    },
];

const STRING_POOL = [
    {
        id: "st_e1",
        origin: "Elven",
        name: "Silkweb String",
        rating: 2,
        prefix: "Singing",
        stats: { attack: 2, speed: 2 },
    },
    {
        id: "st_e2",
        origin: "Elven",
        name: "Moonspun String",
        rating: 3,
        prefix: "Whispering",
        stats: { attack: 3, speed: 2 },
    },
    {
        id: "st_e3",
        origin: "Elven",
        name: "Starthread String",
        rating: 4,
        prefix: "Humming",
        stats: { attack: 4, speed: 3 },
    },
    {
        id: "st_e4",
        origin: "Elven",
        name: "Celestial Chord",
        rating: 5,
        prefix: "Resonant",
        stats: { attack: 5, speed: 3, magic: 2 },
    },
    {
        id: "st_h1",
        origin: "Human",
        name: "Waxed Bowstring",
        rating: 1,
        prefix: "Reliable",
        stats: { attack: 1, speed: 1 },
    },
    {
        id: "st_h2",
        origin: "Human",
        name: "Tempered Cord",
        rating: 2,
        prefix: "Balanced",
        stats: { attack: 2, speed: 1 },
    },
    {
        id: "st_h3",
        origin: "Human",
        name: "Fine Hemp Cord",
        rating: 3,
        prefix: "True",
        stats: { attack: 3, speed: 2 },
    },
    {
        id: "st_h4",
        origin: "Human",
        name: "Refined Bowstring",
        rating: 4,
        prefix: "Steadfast",
        stats: { attack: 4, speed: 2, defense: 1 },
    },
    {
        id: "st_h5",
        origin: "Human",
        name: "Champion's Cord",
        rating: 5,
        prefix: "Versatile",
        stats: { attack: 5, speed: 3, defense: 1 },
    },
];

const RISER_POOL = [
    {
        id: "rs_e1",
        origin: "Elven",
        name: "Moonwood Riser",
        rating: 2,
        prefix: "Balanced",
        stats: { speed: 2 },
    },
    {
        id: "rs_e2",
        origin: "Elven",
        name: "Starwood Riser",
        rating: 3,
        prefix: "Precise",
        stats: { speed: 2, magic: 1 },
    },
    {
        id: "rs_e3",
        origin: "Elven",
        name: "Celestial Riser",
        rating: 4,
        prefix: "Harmonized",
        stats: { speed: 3, magic: 2 },
    },
    {
        id: "rs_e4",
        origin: "Elven",
        name: "Dreamwood Riser",
        rating: 5,
        prefix: "Attuned",
        stats: { speed: 3, magic: 3 },
    },
    {
        id: "rs_h1",
        origin: "Human",
        name: "Soldier's Riser",
        rating: 1,
        prefix: "Reliable",
        stats: { attack: 1 },
    },
    {
        id: "rs_h2",
        origin: "Human",
        name: "Tempered Riser",
        rating: 2,
        prefix: "Balanced",
        stats: { attack: 1, speed: 1 },
    },
    {
        id: "rs_h3",
        origin: "Human",
        name: "Fine Wood Riser",
        rating: 3,
        prefix: "True",
        stats: { attack: 2, speed: 1, defense: 1 },
    },
    {
        id: "rs_h4",
        origin: "Human",
        name: "Refined Riser",
        rating: 4,
        prefix: "Steadfast",
        stats: { attack: 2, defense: 1, speed: 2 },
    },
    {
        id: "rs_h5",
        origin: "Human",
        name: "Champion's Riser",
        rating: 5,
        prefix: "Versatile",
        stats: { attack: 3, defense: 2, speed: 2 },
    },
];

// ── Sword Family ──────────────────────────────────────────────────────────────

const DAGGER_BLADES = [
    {
        id: "db_e1",
        origin: "Elven",
        name: "Fang",
        rating: 2,
        stats: { attack: 4, speed: 3 },
    },
    {
        id: "db_e2",
        origin: "Elven",
        name: "Moonpiercer",
        rating: 3,
        stats: { attack: 6, speed: 4 },
    },
    {
        id: "db_e3",
        origin: "Elven",
        name: "Silverfang",
        rating: 4,
        stats: { attack: 8, speed: 5, magic: 1 },
    },
    {
        id: "db_e4",
        origin: "Elven",
        name: "Dawnwhisper",
        rating: 5,
        stats: { attack: 10, speed: 6, magic: 2 },
    },
    {
        id: "db_h1",
        origin: "Human",
        name: "Soldier's Knife",
        rating: 1,
        stats: { attack: 4, speed: 2, defense: 1 },
    },
    {
        id: "db_h2",
        origin: "Human",
        name: "Tempered Dagger",
        rating: 2,
        stats: { attack: 6, speed: 2, defense: 1 },
    },
    {
        id: "db_h3",
        origin: "Human",
        name: "Knight's Dirk",
        rating: 3,
        stats: { attack: 8, speed: 3, defense: 1 },
    },
    {
        id: "db_h4",
        origin: "Human",
        name: "Fine Steel Dagger",
        rating: 4,
        stats: { attack: 10, speed: 4, defense: 2 },
    },
    {
        id: "db_h5",
        origin: "Human",
        name: "Champion's Blade",
        rating: 5,
        stats: { attack: 13, speed: 5, defense: 2 },
    },
];

const DAGGER_CROSSGUARDS = [
    {
        id: "dc_e1",
        origin: "Elven",
        name: "Leaf Quillon",
        rating: 2,
        prefix: "Keen",
        stats: { speed: 2 },
    },
    {
        id: "dc_e2",
        origin: "Elven",
        name: "Moonsilver Quillon",
        rating: 3,
        prefix: "Sharp",
        stats: { speed: 2, magic: 1 },
    },
    {
        id: "dc_e3",
        origin: "Elven",
        name: "Starforged Quillon",
        rating: 4,
        prefix: "Piercing",
        stats: { speed: 3, magic: 2 },
    },
    {
        id: "dc_h1",
        origin: "Human",
        name: "Soldier's Quillon",
        rating: 1,
        prefix: "Reliable",
        stats: { defense: 1, speed: 1 },
    },
    {
        id: "dc_h2",
        origin: "Human",
        name: "Tempered Crossguard",
        rating: 2,
        prefix: "Balanced",
        stats: { defense: 2, speed: 1 },
    },
    {
        id: "dc_h3",
        origin: "Human",
        name: "Knight's Quillon",
        rating: 3,
        prefix: "True",
        stats: { defense: 2, attack: 1, speed: 1 },
    },
    {
        id: "dc_h4",
        origin: "Human",
        name: "Fine Steel Guard",
        rating: 4,
        prefix: "Steadfast",
        stats: { defense: 3, attack: 1, speed: 2 },
    },
];

const SWORD_BLADES = [
    {
        id: "sw_e1",
        origin: "Elven",
        name: "Moonblade",
        rating: 2,
        stats: { attack: 6, speed: 2 },
    },
    {
        id: "sw_e2",
        origin: "Elven",
        name: "Starfang",
        rating: 3,
        stats: { attack: 8, speed: 2, magic: 1 },
    },
    {
        id: "sw_e3",
        origin: "Elven",
        name: "Dawnedge",
        rating: 4,
        stats: { attack: 11, speed: 2, magic: 2 },
    },
    {
        id: "sw_e4",
        origin: "Elven",
        name: "Celestial Blade",
        rating: 5,
        stats: { attack: 14, speed: 3, magic: 3 },
    },
    {
        id: "sw_h1",
        origin: "Human",
        name: "Soldier's Blade",
        rating: 1,
        stats: { attack: 5, defense: 1 },
    },
    {
        id: "sw_h2",
        origin: "Human",
        name: "Tempered Blade",
        rating: 2,
        stats: { attack: 7, defense: 1, speed: 1 },
    },
    {
        id: "sw_h3",
        origin: "Human",
        name: "Knight's Blade",
        rating: 3,
        stats: { attack: 9, defense: 2, speed: 1 },
    },
    {
        id: "sw_h5",
        origin: "Human",
        name: "Champion's Edge",
        rating: 5,
        stats: { attack: 15, defense: 4, speed: 2 },
    },
];

const LONGSWORD_BLADES = [
    {
        id: "ls_e1",
        origin: "Elven",
        name: "Whisper",
        rating: 2,
        stats: { attack: 7, speed: 2 },
    },
    {
        id: "ls_e2",
        origin: "Elven",
        name: "Moonshard",
        rating: 3,
        stats: { attack: 10, speed: 2 },
    },
    {
        id: "ls_e3",
        origin: "Elven",
        name: "Starweave",
        rating: 4,
        stats: { attack: 13, speed: 1, magic: 2 },
    },
    {
        id: "ls_e4",
        origin: "Elven",
        name: "Celestial Edge",
        rating: 5,
        stats: { attack: 16, speed: 2, magic: 3 },
    },
    {
        id: "ls_h1",
        origin: "Human",
        name: "Soldier's Longsword",
        rating: 1,
        stats: { attack: 6, defense: 1 },
    },
    {
        id: "ls_h2",
        origin: "Human",
        name: "Tempered Longsword",
        rating: 2,
        stats: { attack: 8, defense: 1, speed: 1 },
    },
    {
        id: "ls_h3",
        origin: "Human",
        name: "Knight's Blade",
        rating: 3,
        stats: { attack: 11, defense: 2, speed: 1 },
    },
    {
        id: "ls_h4",
        origin: "Human",
        name: "Fine Steel Longsword",
        rating: 4,
        stats: { attack: 14, defense: 3, speed: 1 },
    },
    {
        id: "ls_h5",
        origin: "Human",
        name: "Champion's Longsword",
        rating: 5,
        stats: { attack: 17, defense: 4, speed: 2 },
    },
];

const GREATSWORD_BLADES = [
    {
        id: "gs_e1",
        origin: "Elven",
        name: "Moonglaive",
        rating: 2,
        stats: { attack: 12, speed: 1 },
    },
    {
        id: "gs_e2",
        origin: "Elven",
        name: "Starblade",
        rating: 3,
        stats: { attack: 16, speed: 1, magic: 2 },
    },
    {
        id: "gs_e3",
        origin: "Elven",
        name: "Sunsever",
        rating: 4,
        stats: { attack: 20, speed: 1, magic: 3 },
    },
    {
        id: "gs_e4",
        origin: "Elven",
        name: "Celestial Reaper",
        rating: 5,
        stats: { attack: 24, speed: 2, magic: 5 },
    },
    {
        id: "gs_h1",
        origin: "Human",
        name: "Soldier's Greatsword",
        rating: 1,
        stats: { attack: 9, defense: 1 },
    },
    {
        id: "gs_h2",
        origin: "Human",
        name: "Tempered Greatsword",
        rating: 2,
        stats: { attack: 13, defense: 2 },
    },
    {
        id: "gs_h3",
        origin: "Human",
        name: "Knight's Claymore",
        rating: 3,
        stats: { attack: 17, defense: 3 },
    },
    {
        id: "gs_h4",
        origin: "Human",
        name: "Fine Steel Claymore",
        rating: 4,
        stats: { attack: 21, defense: 4 },
    },
    {
        id: "gs_h5",
        origin: "Human",
        name: "Grandmaster's Blade",
        rating: 5,
        stats: { attack: 25, defense: 5, speed: 1 },
    },
];

// ── Bow Family ────────────────────────────────────────────────────────────────

const SHORTBOW_LIMBS = [
    {
        id: "sb_e1",
        origin: "Elven",
        name: "Recurve",
        rating: 2,
        stats: { attack: 5, speed: 4 },
    },
    {
        id: "sb_e2",
        origin: "Elven",
        name: "Moonleaf Bow",
        rating: 3,
        stats: { attack: 7, speed: 5 },
    },
    {
        id: "sb_e3",
        origin: "Elven",
        name: "Swift Arc",
        rating: 4,
        stats: { attack: 9, speed: 6, magic: 1 },
    },
    {
        id: "sb_e4",
        origin: "Elven",
        name: "Starweave Short",
        rating: 5,
        stats: { attack: 11, speed: 7, magic: 2 },
    },
    {
        id: "sb_h1",
        origin: "Human",
        name: "Soldier's Short Limb",
        rating: 1,
        stats: { attack: 5, speed: 3, defense: 1 },
    },
    {
        id: "sb_h2",
        origin: "Human",
        name: "Tempered Short Limb",
        rating: 2,
        stats: { attack: 7, speed: 3, defense: 1 },
    },
    {
        id: "sb_h3",
        origin: "Human",
        name: "Knight's Recurve",
        rating: 3,
        stats: { attack: 9, speed: 4, defense: 1 },
    },
    {
        id: "sb_h4",
        origin: "Human",
        name: "Fine Wood Short Limb",
        rating: 4,
        stats: { attack: 11, speed: 5, defense: 2 },
    },
    {
        id: "sb_h5",
        origin: "Human",
        name: "Champion's Short Bow",
        rating: 5,
        stats: { attack: 13, speed: 6, defense: 2 },
    },
];

const BOW_LIMBS = [
    {
        id: "bw_e1",
        origin: "Elven",
        name: "Hunting Bow",
        rating: 2,
        stats: { attack: 8, speed: 3 },
    },
    {
        id: "bw_e2",
        origin: "Elven",
        name: "Moon Bow",
        rating: 3,
        stats: { attack: 11, speed: 3 },
    },
    {
        id: "bw_e3",
        origin: "Elven",
        name: "Starwood Bow",
        rating: 4,
        stats: { attack: 14, speed: 3, magic: 1 },
    },
    {
        id: "bw_e4",
        origin: "Elven",
        name: "Celestial Bow",
        rating: 5,
        stats: { attack: 17, speed: 3, magic: 3 },
    },
    {
        id: "bw_h1",
        origin: "Human",
        name: "Soldier's Bow",
        rating: 1,
        stats: { attack: 8, speed: 1, defense: 1 },
    },
    {
        id: "bw_h2",
        origin: "Human",
        name: "Tempered Hunting Bow",
        rating: 2,
        stats: { attack: 11, speed: 2, defense: 1 },
    },
    {
        id: "bw_h3",
        origin: "Human",
        name: "Knight's Bow",
        rating: 3,
        stats: { attack: 13, speed: 2, defense: 2 },
    },
    {
        id: "bw_h4",
        origin: "Human",
        name: "Fine Wood Bow",
        rating: 4,
        stats: { attack: 16, speed: 3, defense: 2 },
    },
    {
        id: "bw_h5",
        origin: "Human",
        name: "Champion's Bow",
        rating: 5,
        stats: { attack: 19, speed: 3, defense: 3 },
    },
];

const LONGBOW_LIMBS = [
    {
        id: "lb_e1",
        origin: "Elven",
        name: "Great Bow",
        rating: 2,
        stats: { attack: 12, speed: 1 },
    },
    {
        id: "lb_e2",
        origin: "Elven",
        name: "Moongrove Longbow",
        rating: 3,
        stats: { attack: 16, speed: 1, magic: 1 },
    },
    {
        id: "lb_e3",
        origin: "Elven",
        name: "Starbend Longbow",
        rating: 4,
        stats: { attack: 20, speed: 1, magic: 2 },
    },
    {
        id: "lb_e4",
        origin: "Elven",
        name: "Celestial Longbow",
        rating: 5,
        stats: { attack: 24, speed: 1, magic: 4 },
    },
    {
        id: "lb_h1",
        origin: "Human",
        name: "Soldier's Longbow",
        rating: 1,
        stats: { attack: 11, defense: 1 },
    },
    {
        id: "lb_h2",
        origin: "Human",
        name: "Tempered Longbow",
        rating: 2,
        stats: { attack: 14, defense: 2 },
    },
    {
        id: "lb_h3",
        origin: "Human",
        name: "Knight's Longbow",
        rating: 3,
        stats: { attack: 18, defense: 2, speed: 1 },
    },
    {
        id: "lb_h4",
        origin: "Human",
        name: "Fine Wood Longbow",
        rating: 4,
        stats: { attack: 22, defense: 3, speed: 1 },
    },
    {
        id: "lb_h5",
        origin: "Human",
        name: "Champion's Greatbow",
        rating: 5,
        stats: { attack: 26, defense: 4, speed: 1 },
    },
];

// ── Crossbow ──────────────────────────────────────────────────────────────────

const CROSSBOW_PRODS = [
    {
        id: "cp_e1",
        origin: "Elven",
        name: "Moonwood Prod",
        rating: 2,
        stats: { attack: 10, speed: 1 },
    },
    {
        id: "cp_e2",
        origin: "Elven",
        name: "Starwood Prod",
        rating: 3,
        stats: { attack: 14, speed: 1, magic: 1 },
    },
    {
        id: "cp_e3",
        origin: "Elven",
        name: "Celestial Prod",
        rating: 4,
        stats: { attack: 18, speed: 1, magic: 2 },
    },
    {
        id: "cp_e4",
        origin: "Elven",
        name: "Dreamwood Prod",
        rating: 5,
        stats: { attack: 22, speed: 1, magic: 3 },
    },
    {
        id: "cp_h1",
        origin: "Human",
        name: "Soldier's Prod",
        rating: 1,
        stats: { attack: 9, defense: 1 },
    },
    {
        id: "cp_h2",
        origin: "Human",
        name: "Tempered Prod",
        rating: 2,
        stats: { attack: 12, defense: 1, speed: 1 },
    },
    {
        id: "cp_h3",
        origin: "Human",
        name: "Knight's Prod",
        rating: 3,
        stats: { attack: 15, defense: 2, speed: 1 },
    },
    {
        id: "cp_h4",
        origin: "Human",
        name: "Fine Steel Prod",
        rating: 4,
        stats: { attack: 19, defense: 3, speed: 1 },
    },
    {
        id: "cp_h5",
        origin: "Human",
        name: "Champion's Prod",
        rating: 5,
        stats: { attack: 23, defense: 4, speed: 1 },
    },
];

const CROSSBOW_STOCKS = [
    {
        id: "cs_e1",
        origin: "Elven",
        name: "Moonwood Stock",
        rating: 2,
        prefix: "Elegant",
        stats: { speed: 1, defense: 1 },
    },
    {
        id: "cs_e2",
        origin: "Elven",
        name: "Starwood Stock",
        rating: 3,
        prefix: "Balanced",
        stats: { speed: 1, defense: 2 },
    },
    {
        id: "cs_e3",
        origin: "Elven",
        name: "Dreamwood Stock",
        rating: 4,
        prefix: "Precise",
        stats: { speed: 2, defense: 2 },
    },
    {
        id: "cs_h1",
        origin: "Human",
        name: "Soldier's Stock",
        rating: 1,
        prefix: "Reliable",
        stats: { defense: 1, attack: 1 },
    },
    {
        id: "cs_h2",
        origin: "Human",
        name: "Tempered Stock",
        rating: 2,
        prefix: "Balanced",
        stats: { defense: 2, attack: 1 },
    },
    {
        id: "cs_h3",
        origin: "Human",
        name: "Knight's Stock",
        rating: 3,
        prefix: "Steadfast",
        stats: { defense: 2, attack: 1, speed: 1 },
    },
    {
        id: "cs_h4",
        origin: "Human",
        name: "Fine Wood Stock",
        rating: 4,
        prefix: "True",
        stats: { defense: 3, attack: 2, speed: 1 },
    },
];

const CROSSBOW_MECHANISMS = [
    {
        id: "cm_e1",
        origin: "Elven",
        name: "Moonsilver Trigger",
        rating: 2,
        prefix: "Quick",
        stats: { speed: 3 },
    },
    {
        id: "cm_e2",
        origin: "Elven",
        name: "Starcraft Mechanism",
        rating: 3,
        prefix: "Rapid",
        stats: { speed: 4 },
    },
    {
        id: "cm_e3",
        origin: "Elven",
        name: "Celestial Release",
        rating: 4,
        prefix: "Lightning",
        stats: { speed: 5 },
    },
    {
        id: "cm_h1",
        origin: "Human",
        name: "Brass Mechanism",
        rating: 1,
        prefix: "Reliable",
        stats: { speed: 1, attack: 1 },
    },
    {
        id: "cm_h2",
        origin: "Human",
        name: "Tempered Trigger",
        rating: 2,
        prefix: "Balanced",
        stats: { speed: 2, attack: 1 },
    },
    {
        id: "cm_h3",
        origin: "Human",
        name: "Knight's Mechanism",
        rating: 3,
        prefix: "True",
        stats: { speed: 2, attack: 2, defense: 1 },
    },
    {
        id: "cm_h4",
        origin: "Human",
        name: "Fine Steel Trigger",
        rating: 4,
        prefix: "Steadfast",
        stats: { speed: 3, attack: 3, defense: 1 },
    },
];

// ── Wand ──────────────────────────────────────────────────────────────────────

const WAND_FOCUSES = [
    {
        id: "wf_e1",
        origin: "Elven",
        name: "Mooncrystal",
        rating: 2,
        stats: { magic: 6, speed: 2 },
    },
    {
        id: "wf_e2",
        origin: "Elven",
        name: "Starstone",
        rating: 3,
        stats: { magic: 9, speed: 2 },
    },
    {
        id: "wf_e3",
        origin: "Elven",
        name: "Celestial Gem",
        rating: 4,
        stats: { magic: 12, speed: 3 },
    },
    {
        id: "wf_e4",
        origin: "Elven",
        name: "Aurora Crystal",
        rating: 5,
        stats: { magic: 15, speed: 3 },
    },
    {
        id: "wf_h1",
        origin: "Human",
        name: "Scholar's Focus",
        rating: 1,
        stats: { magic: 4, defense: 1 },
    },
    {
        id: "wf_h2",
        origin: "Human",
        name: "Tempered Focus",
        rating: 2,
        stats: { magic: 6, defense: 1, speed: 1 },
    },
    {
        id: "wf_h3",
        origin: "Human",
        name: "Refined Focus",
        rating: 3,
        stats: { magic: 8, defense: 2, speed: 1 },
    },
    {
        id: "wf_h4",
        origin: "Human",
        name: "Mage's Focus",
        rating: 4,
        stats: { magic: 11, defense: 2, speed: 2 },
    },
    {
        id: "wf_h5",
        origin: "Human",
        name: "Archmage's Focus",
        rating: 5,
        stats: { magic: 14, defense: 3, speed: 2 },
    },
];

const WAND_CAPS = [
    {
        id: "wc_e1",
        origin: "Elven",
        name: "Moonsilver Cap",
        rating: 2,
        prefix: "Gleaming",
        stats: { magic: 2, speed: 1 },
    },
    {
        id: "wc_e2",
        origin: "Elven",
        name: "Starweave Cap",
        rating: 3,
        prefix: "Shimmering",
        stats: { magic: 3, speed: 1 },
    },
    {
        id: "wc_e3",
        origin: "Elven",
        name: "Celestial Finial",
        rating: 4,
        prefix: "Radiant",
        stats: { magic: 4, speed: 2 },
    },
    {
        id: "wc_h1",
        origin: "Human",
        name: "Scholar's Cap",
        rating: 1,
        prefix: "Reliable",
        stats: { magic: 1, defense: 1 },
    },
    {
        id: "wc_h2",
        origin: "Human",
        name: "Tempered Cap",
        rating: 2,
        prefix: "Balanced",
        stats: { magic: 2, defense: 1, speed: 1 },
    },
    {
        id: "wc_h3",
        origin: "Human",
        name: "Fine Metal Cap",
        rating: 3,
        prefix: "True",
        stats: { magic: 3, defense: 2, speed: 1 },
    },
    {
        id: "wc_h4",
        origin: "Human",
        name: "Mage's Finial",
        rating: 4,
        prefix: "Steadfast",
        stats: { magic: 4, defense: 2, speed: 2 },
    },
];

// ── Staff ─────────────────────────────────────────────────────────────────────

const STAFF_HEADS = [
    {
        id: "sth_e1",
        origin: "Elven",
        name: "Mooncrystal Crown",
        rating: 2,
        stats: { magic: 8, attack: 1 },
    },
    {
        id: "sth_e2",
        origin: "Elven",
        name: "Star Crown",
        rating: 3,
        stats: { magic: 11, attack: 1 },
    },
    {
        id: "sth_e3",
        origin: "Elven",
        name: "Celestial Crown",
        rating: 4,
        stats: { magic: 15, attack: 2 },
    },
    {
        id: "sth_e4",
        origin: "Elven",
        name: "Aurora Crown",
        rating: 5,
        stats: { magic: 19, attack: 2 },
    },
    {
        id: "sth_h1",
        origin: "Human",
        name: "Scholar's Head",
        rating: 1,
        stats: { magic: 5, defense: 1 },
    },
    {
        id: "sth_h2",
        origin: "Human",
        name: "Tempered Headpiece",
        rating: 2,
        stats: { magic: 7, defense: 2 },
    },
    {
        id: "sth_h3",
        origin: "Human",
        name: "Mage's Crown",
        rating: 3,
        stats: { magic: 10, defense: 2, attack: 1 },
    },
    {
        id: "sth_h4",
        origin: "Human",
        name: "Refined Staff Head",
        rating: 4,
        stats: { magic: 13, defense: 3, attack: 1 },
    },
    {
        id: "sth_h5",
        origin: "Human",
        name: "Archmage's Crown",
        rating: 5,
        stats: { magic: 16, defense: 3, attack: 2 },
    },
];

const STAFF_BASES = [
    {
        id: "stb_e1",
        origin: "Elven",
        name: "Moonsilver Ferrule",
        rating: 2,
        prefix: "Channeling",
        stats: { magic: 3 },
    },
    {
        id: "stb_e2",
        origin: "Elven",
        name: "Starweave Ferrule",
        rating: 3,
        prefix: "Flowing",
        stats: { magic: 4 },
    },
    {
        id: "stb_e3",
        origin: "Elven",
        name: "Celestial Base",
        rating: 4,
        prefix: "Resonant",
        stats: { magic: 5, speed: 1 },
    },
    {
        id: "stb_h1",
        origin: "Human",
        name: "Scholar's Ferrule",
        rating: 1,
        prefix: "Reliable",
        stats: { magic: 1, defense: 1 },
    },
    {
        id: "stb_h2",
        origin: "Human",
        name: "Tempered Ferrule",
        rating: 2,
        prefix: "Balanced",
        stats: { magic: 2, defense: 2 },
    },
    {
        id: "stb_h3",
        origin: "Human",
        name: "Fine Steel Ferrule",
        rating: 3,
        prefix: "Steadfast",
        stats: { magic: 3, defense: 3 },
    },
    {
        id: "stb_h4",
        origin: "Human",
        name: "Mage's Base",
        rating: 4,
        prefix: "True",
        stats: { magic: 4, defense: 3, speed: 1 },
    },
];

// ── Tome ──────────────────────────────────────────────────────────────────────

const TOME_COVERS = [
    {
        id: "tc_e1",
        origin: "Elven",
        name: "Moonsilver Tome",
        rating: 2,
        stats: { magic: 8 },
    },
    {
        id: "tc_e2",
        origin: "Elven",
        name: "Starweave Grimoire",
        rating: 3,
        stats: { magic: 11 },
    },
    {
        id: "tc_e3",
        origin: "Elven",
        name: "Celestial Codex",
        rating: 4,
        stats: { magic: 15 },
    },
    {
        id: "tc_e4",
        origin: "Elven",
        name: "Aurora Compendium",
        rating: 5,
        stats: { magic: 19 },
    },
    {
        id: "tc_h1",
        origin: "Human",
        name: "Scholar's Tome",
        rating: 1,
        stats: { magic: 5, defense: 1 },
    },
    {
        id: "tc_h2",
        origin: "Human",
        name: "Tempered Codex",
        rating: 2,
        stats: { magic: 7, defense: 1 },
    },
    {
        id: "tc_h3",
        origin: "Human",
        name: "Mage's Grimoire",
        rating: 3,
        stats: { magic: 10, defense: 2 },
    },
    {
        id: "tc_h4",
        origin: "Human",
        name: "Refined Compendium",
        rating: 4,
        stats: { magic: 13, defense: 2 },
    },
    {
        id: "tc_h5",
        origin: "Human",
        name: "Archmage's Codex",
        rating: 5,
        stats: { magic: 17, defense: 3 },
    },
];

const TOME_BINDINGS = [
    {
        id: "tb_e1",
        origin: "Elven",
        name: "Moonsilk Binding",
        rating: 2,
        prefix: "Luminous",
        stats: { magic: 3 },
    },
    {
        id: "tb_e2",
        origin: "Elven",
        name: "Starthread Binding",
        rating: 3,
        prefix: "Radiant",
        stats: { magic: 5 },
    },
    {
        id: "tb_e3",
        origin: "Elven",
        name: "Dreamweave Binding",
        rating: 4,
        prefix: "Ethereal",
        stats: { magic: 7 },
    },
    {
        id: "tb_h1",
        origin: "Human",
        name: "Cloth Binding",
        rating: 1,
        prefix: "Reliable",
        stats: { magic: 1, defense: 1 },
    },
    {
        id: "tb_h2",
        origin: "Human",
        name: "Fine Leather Binding",
        rating: 2,
        prefix: "Balanced",
        stats: { magic: 2, defense: 1 },
    },
    {
        id: "tb_h3",
        origin: "Human",
        name: "Scholar's Binding",
        rating: 3,
        prefix: "Steadfast",
        stats: { magic: 4, defense: 2 },
    },
    {
        id: "tb_h4",
        origin: "Human",
        name: "Tempered Binding",
        rating: 4,
        prefix: "True",
        stats: { magic: 5, defense: 2 },
    },
];

const TOME_PAGES = [
    {
        id: "tp_e1",
        origin: "Elven",
        name: "Moonleaf Pages",
        rating: 2,
        prefix: null,
        stats: { magic: 3 },
    },
    {
        id: "tp_e2",
        origin: "Elven",
        name: "Starscript Pages",
        rating: 3,
        prefix: null,
        stats: { magic: 5 },
    },
    {
        id: "tp_e3",
        origin: "Elven",
        name: "Celestial Pages",
        rating: 4,
        prefix: null,
        stats: { magic: 7 },
    },
    {
        id: "tp_h1",
        origin: "Human",
        name: "Fine Parchment",
        rating: 1,
        prefix: null,
        stats: { magic: 2 },
    },
    {
        id: "tp_h2",
        origin: "Human",
        name: "Scholar's Parchment",
        rating: 2,
        prefix: null,
        stats: { magic: 3 },
    },
    {
        id: "tp_h3",
        origin: "Human",
        name: "Refined Vellum",
        rating: 3,
        prefix: null,
        stats: { magic: 5 },
    },
    {
        id: "tp_h4",
        origin: "Human",
        name: "Illuminated Pages",
        rating: 4,
        prefix: null,
        stats: { magic: 7 },
    },
    {
        id: "tp_h5",
        origin: "Human",
        name: "Archmage's Script",
        rating: 5,
        prefix: null,
        stats: { magic: 10 },
    },
];

const TOME_CLASPS = [
    {
        id: "tcl_e1",
        origin: "Elven",
        name: "Moonsilver Clasp",
        rating: 2,
        prefix: null,
        stats: { magic: 2, speed: 1 },
    },
    {
        id: "tcl_e2",
        origin: "Elven",
        name: "Starcrystal Clasp",
        rating: 3,
        prefix: null,
        stats: { magic: 4 },
    },
    {
        id: "tcl_e3",
        origin: "Elven",
        name: "Celestial Clasp",
        rating: 4,
        prefix: null,
        stats: { magic: 5 },
    },
    {
        id: "tcl_h1",
        origin: "Human",
        name: "Brass Lock",
        rating: 1,
        prefix: null,
        stats: { magic: 1, defense: 1 },
    },
    {
        id: "tcl_h2",
        origin: "Human",
        name: "Silver Clasp",
        rating: 2,
        prefix: null,
        stats: { magic: 2, defense: 1 },
    },
    {
        id: "tcl_h3",
        origin: "Human",
        name: "Scholar's Clasp",
        rating: 3,
        prefix: null,
        stats: { magic: 3, defense: 2 },
    },
    {
        id: "tcl_h4",
        origin: "Human",
        name: "Refined Clasp",
        rating: 4,
        prefix: null,
        stats: { magic: 4, defense: 2 },
    },
];

// ── Spear ─────────────────────────────────────────────────────────────────────

const SPEAR_TIPS = [
    {
        id: "spt_e1",
        origin: "Elven",
        name: "Moonsilver Tip",
        rating: 2,
        stats: { attack: 7, speed: 2 },
    },
    {
        id: "spt_e2",
        origin: "Elven",
        name: "Starforged Tip",
        rating: 3,
        stats: { attack: 10, speed: 2, magic: 1 },
    },
    {
        id: "spt_e3",
        origin: "Elven",
        name: "Celestial Tip",
        rating: 4,
        stats: { attack: 13, speed: 2, magic: 2 },
    },
    {
        id: "spt_e4",
        origin: "Elven",
        name: "Dawnpiercer Tip",
        rating: 5,
        stats: { attack: 16, speed: 3, magic: 3 },
    },
    {
        id: "spt_h1",
        origin: "Human",
        name: "Soldier's Spearhead",
        rating: 1,
        stats: { attack: 6, defense: 1, speed: 1 },
    },
    {
        id: "spt_h2",
        origin: "Human",
        name: "Tempered Spearhead",
        rating: 2,
        stats: { attack: 9, defense: 2, speed: 1 },
    },
    {
        id: "spt_h3",
        origin: "Human",
        name: "Knight's Tip",
        rating: 3,
        stats: { attack: 11, defense: 2, speed: 2 },
    },
    {
        id: "spt_h4",
        origin: "Human",
        name: "Fine Steel Tip",
        rating: 4,
        stats: { attack: 14, defense: 3, speed: 2 },
    },
    {
        id: "spt_h5",
        origin: "Human",
        name: "Champion's Tip",
        rating: 5,
        stats: { attack: 17, defense: 4, speed: 3 },
    },
];

const SPEAR_SOCKETS = [
    {
        id: "ss_e1",
        origin: "Elven",
        name: "Moonsilver Socket",
        rating: 2,
        prefix: "Swift",
        stats: { speed: 2 },
    },
    {
        id: "ss_e2",
        origin: "Elven",
        name: "Starforged Socket",
        rating: 3,
        prefix: "Keen",
        stats: { speed: 2, magic: 1 },
    },
    {
        id: "ss_e3",
        origin: "Elven",
        name: "Celestial Socket",
        rating: 4,
        prefix: "Precise",
        stats: { speed: 3, magic: 2 },
    },
    {
        id: "ss_h1",
        origin: "Human",
        name: "Iron Socket",
        rating: 1,
        prefix: "Reliable",
        stats: { defense: 2 },
    },
    {
        id: "ss_h2",
        origin: "Human",
        name: "Tempered Socket",
        rating: 2,
        prefix: "Balanced",
        stats: { defense: 2, speed: 1 },
    },
    {
        id: "ss_h3",
        origin: "Human",
        name: "Knight's Socket",
        rating: 3,
        prefix: "Steadfast",
        stats: { defense: 3, attack: 1 },
    },
    {
        id: "ss_h4",
        origin: "Human",
        name: "Fine Steel Socket",
        rating: 4,
        prefix: "True",
        stats: { defense: 3, attack: 1, speed: 1 },
    },
];

const SPEAR_BUTTS = [
    {
        id: "spb_e1",
        origin: "Elven",
        name: "Moonsilver End",
        rating: 2,
        prefix: null,
        stats: { magic: 1, speed: 1 },
    },
    {
        id: "spb_e2",
        origin: "Elven",
        name: "Starcrystal End",
        rating: 3,
        prefix: null,
        stats: { magic: 2, speed: 1 },
    },
    {
        id: "spb_e3",
        origin: "Elven",
        name: "Celestial End",
        rating: 4,
        prefix: null,
        stats: { magic: 3, speed: 2 },
    },
    {
        id: "spb_h1",
        origin: "Human",
        name: "Capped Butt",
        rating: 1,
        prefix: null,
        stats: { defense: 1 },
    },
    {
        id: "spb_h2",
        origin: "Human",
        name: "Tempered Butt Cap",
        rating: 2,
        prefix: null,
        stats: { attack: 1, defense: 1 },
    },
    {
        id: "spb_h3",
        origin: "Human",
        name: "Balanced End",
        rating: 3,
        prefix: null,
        stats: { attack: 1, defense: 2, speed: 1 },
    },
    {
        id: "spb_h4",
        origin: "Human",
        name: "Fine Steel Butt",
        rating: 4,
        prefix: null,
        stats: { attack: 2, defense: 2, speed: 1 },
    },
];

// ── Shield ────────────────────────────────────────────────────────────────────

const SHIELD_FACES = [
    {
        id: "sf_e1",
        origin: "Elven",
        name: "Moonsilver Shield",
        rating: 2,
        stats: { defense: 8, speed: 1 },
    },
    {
        id: "sf_e2",
        origin: "Elven",
        name: "Starforged Aegis",
        rating: 3,
        stats: { defense: 11, speed: 1 },
    },
    {
        id: "sf_e3",
        origin: "Elven",
        name: "Celestial Bulwark",
        rating: 4,
        stats: { defense: 14, speed: 1, magic: 1 },
    },
    {
        id: "sf_e4",
        origin: "Elven",
        name: "Aurora Aegis",
        rating: 5,
        stats: { defense: 17, speed: 1, magic: 2 },
    },
    {
        id: "sf_h1",
        origin: "Human",
        name: "Soldier's Shield",
        rating: 1,
        stats: { defense: 8, attack: 1 },
    },
    {
        id: "sf_h2",
        origin: "Human",
        name: "Tempered Shield",
        rating: 2,
        stats: { defense: 10, attack: 1, speed: 1 },
    },
    {
        id: "sf_h3",
        origin: "Human",
        name: "Knight's Shield",
        rating: 3,
        stats: { defense: 13, attack: 1, speed: 1 },
    },
    {
        id: "sf_h4",
        origin: "Human",
        name: "Fine Steel Kite",
        rating: 4,
        stats: { defense: 16, attack: 2, speed: 1 },
    },
    {
        id: "sf_h5",
        origin: "Human",
        name: "Champion's Bulwark",
        rating: 5,
        stats: { defense: 19, attack: 2, speed: 2 },
    },
];

const SHIELD_RIMS = [
    {
        id: "sr_e1",
        origin: "Elven",
        name: "Moonsilver Rim",
        rating: 2,
        prefix: "Gilded",
        stats: { defense: 2, magic: 1 },
    },
    {
        id: "sr_e2",
        origin: "Elven",
        name: "Starforged Rim",
        rating: 3,
        prefix: "Shining",
        stats: { defense: 3, magic: 1 },
    },
    {
        id: "sr_e3",
        origin: "Elven",
        name: "Celestial Rim",
        rating: 4,
        prefix: "Radiant",
        stats: { defense: 4, magic: 2 },
    },
    {
        id: "sr_h1",
        origin: "Human",
        name: "Tempered Rim",
        rating: 1,
        prefix: "Reliable",
        stats: { defense: 2 },
    },
    {
        id: "sr_h2",
        origin: "Human",
        name: "Soldier's Rim",
        rating: 2,
        prefix: "Balanced",
        stats: { defense: 3, attack: 1 },
    },
    {
        id: "sr_h3",
        origin: "Human",
        name: "Knight's Rim",
        rating: 3,
        prefix: "Steadfast",
        stats: { defense: 4, attack: 1 },
    },
    {
        id: "sr_h4",
        origin: "Human",
        name: "Fine Steel Rim",
        rating: 4,
        prefix: "True",
        stats: { defense: 5, attack: 1, speed: 1 },
    },
];

const SHIELD_BOSSES = [
    {
        id: "sb2_e1",
        origin: "Elven",
        name: "Mooncrystal Boss",
        rating: 2,
        prefix: null,
        stats: { defense: 2, magic: 1 },
    },
    {
        id: "sb2_e2",
        origin: "Elven",
        name: "Starforged Boss",
        rating: 3,
        prefix: null,
        stats: { defense: 3, magic: 2 },
    },
    {
        id: "sb2_e3",
        origin: "Elven",
        name: "Celestial Orb Boss",
        rating: 4,
        prefix: null,
        stats: { defense: 4, magic: 3 },
    },
    {
        id: "sb2_h1",
        origin: "Human",
        name: "Iron Boss",
        rating: 1,
        prefix: null,
        stats: { defense: 2 },
    },
    {
        id: "sb2_h2",
        origin: "Human",
        name: "Tempered Boss",
        rating: 2,
        prefix: null,
        stats: { defense: 3, attack: 1 },
    },
    {
        id: "sb2_h3",
        origin: "Human",
        name: "Knight's Boss",
        rating: 3,
        prefix: null,
        stats: { defense: 4, attack: 1 },
    },
    {
        id: "sb2_h4",
        origin: "Human",
        name: "Fine Steel Boss",
        rating: 4,
        prefix: null,
        stats: { defense: 5, attack: 2 },
    },
    {
        id: "sb2_h5",
        origin: "Human",
        name: "Champion's Boss",
        rating: 5,
        prefix: null,
        stats: { defense: 6, attack: 2, speed: 1 },
    },
];

// ── Armor ─────────────────────────────────────────────────────────────────────

const CHEST_PLATES = [
    {
        id: "cp_e1",
        origin: "Elven",
        name: "Moonweave Breastplate",
        rating: 2,
        stats: { defense: 10, speed: 2 },
    },
    {
        id: "cp_e2",
        origin: "Elven",
        name: "Starforged Cuirass",
        rating: 3,
        stats: { defense: 14, speed: 2, magic: 1 },
    },
    {
        id: "cp_e3",
        origin: "Elven",
        name: "Celestial Plate",
        rating: 4,
        stats: { defense: 18, speed: 3, magic: 2 },
    },
    {
        id: "cp_e4",
        origin: "Elven",
        name: "Aurora Breastplate",
        rating: 5,
        stats: { defense: 22, speed: 3, magic: 3 },
    },
    {
        id: "cp_h1",
        origin: "Human",
        name: "Soldier's Breastplate",
        rating: 1,
        stats: { defense: 9, attack: 1 },
    },
    {
        id: "cp_h2",
        origin: "Human",
        name: "Knight's Cuirass",
        rating: 2,
        stats: { defense: 11, attack: 1, speed: 1 },
    },
    {
        id: "cp_h3",
        origin: "Human",
        name: "Champion's Plate",
        rating: 3,
        stats: { defense: 14, attack: 2, speed: 1 },
    },
    {
        id: "cp_h4",
        origin: "Human",
        name: "Grandmaster's Cuirass",
        rating: 4,
        stats: { defense: 17, attack: 2, speed: 1 },
    },
    {
        id: "cp_h5",
        origin: "Human",
        name: "Grand Champion's Plate",
        rating: 5,
        stats: { defense: 21, attack: 3, speed: 2 },
    },
];

const PAULDRONS = [
    {
        id: "pa_e1",
        origin: "Elven",
        name: "Moonsilver Pauldrons",
        rating: 2,
        prefix: "Lithe",
        stats: { defense: 4, speed: 2 },
    },
    {
        id: "pa_e2",
        origin: "Elven",
        name: "Starweave Pauldrons",
        rating: 3,
        prefix: "Graceful",
        stats: { defense: 5, speed: 2, magic: 1 },
    },
    {
        id: "pa_e3",
        origin: "Elven",
        name: "Celestial Shoulders",
        rating: 4,
        prefix: "Flowing",
        stats: { defense: 6, speed: 3, magic: 1 },
    },
    {
        id: "pa_e4",
        origin: "Elven",
        name: "Aurora Pauldrons",
        rating: 5,
        prefix: "Radiant",
        stats: { defense: 7, speed: 3, magic: 2 },
    },
    {
        id: "pa_h1",
        origin: "Human",
        name: "Iron Pauldrons",
        rating: 1,
        prefix: "Reliable",
        stats: { defense: 4, attack: 1 },
    },
    {
        id: "pa_h2",
        origin: "Human",
        name: "Soldier's Pauldrons",
        rating: 2,
        prefix: "Steadfast",
        stats: { defense: 5, attack: 1, speed: 1 },
    },
    {
        id: "pa_h3",
        origin: "Human",
        name: "Knight's Pauldrons",
        rating: 3,
        prefix: "Balanced",
        stats: { defense: 6, attack: 1, speed: 1 },
    },
    {
        id: "pa_h4",
        origin: "Human",
        name: "Champion's Pauldrons",
        rating: 4,
        prefix: "Noble",
        stats: { defense: 7, attack: 2, speed: 1 },
    },
    {
        id: "pa_h5",
        origin: "Human",
        name: "Grandmaster's Shoulders",
        rating: 5,
        prefix: "Stalwart",
        stats: { defense: 8, attack: 2, speed: 2 },
    },
];

const ARMOR_LININGS = [
    {
        id: "al_e1",
        origin: "Elven",
        name: "Moonsilk Lining",
        rating: 2,
        prefix: null,
        stats: { defense: 2, speed: 2 },
    },
    {
        id: "al_e2",
        origin: "Elven",
        name: "Starweave Padding",
        rating: 3,
        prefix: null,
        stats: { defense: 3, speed: 2, magic: 1 },
    },
    {
        id: "al_e3",
        origin: "Elven",
        name: "Celestial Lining",
        rating: 4,
        prefix: null,
        stats: { defense: 4, speed: 3, magic: 1 },
    },
    {
        id: "al_e4",
        origin: "Elven",
        name: "Dreamweave Lining",
        rating: 5,
        prefix: null,
        stats: { defense: 5, speed: 3, magic: 2 },
    },
    {
        id: "al_h1",
        origin: "Human",
        name: "Wool Lining",
        rating: 1,
        prefix: null,
        stats: { defense: 2 },
    },
    {
        id: "al_h2",
        origin: "Human",
        name: "Leather Padding",
        rating: 2,
        prefix: null,
        stats: { defense: 3, speed: 1 },
    },
    {
        id: "al_h3",
        origin: "Human",
        name: "Chainmail Lining",
        rating: 3,
        prefix: null,
        stats: { defense: 4, speed: 1 },
    },
    {
        id: "al_h4",
        origin: "Human",
        name: "Tempered Padding",
        rating: 4,
        prefix: null,
        stats: { defense: 5, attack: 1, speed: 1 },
    },
    {
        id: "al_h5",
        origin: "Human",
        name: "Masterwork Lining",
        rating: 5,
        prefix: null,
        stats: { defense: 6, attack: 1, speed: 1 },
    },
];

const ARMOR_CLASPS = [
    {
        id: "ac_e1",
        origin: "Elven",
        name: "Moonsilver Clasp",
        rating: 2,
        prefix: null,
        stats: { defense: 2, speed: 1 },
    },
    {
        id: "ac_e2",
        origin: "Elven",
        name: "Starforged Buckle",
        rating: 3,
        prefix: null,
        stats: { defense: 3, speed: 1 },
    },
    {
        id: "ac_e3",
        origin: "Elven",
        name: "Celestial Clasp",
        rating: 4,
        prefix: null,
        stats: { defense: 3, speed: 2, magic: 1 },
    },
    {
        id: "ac_e4",
        origin: "Elven",
        name: "Aurora Fastening",
        rating: 5,
        prefix: null,
        stats: { defense: 4, speed: 2, magic: 1 },
    },
    {
        id: "ac_h1",
        origin: "Human",
        name: "Iron Buckle",
        rating: 1,
        prefix: null,
        stats: { defense: 2 },
    },
    {
        id: "ac_h2",
        origin: "Human",
        name: "Soldier's Clasp",
        rating: 2,
        prefix: null,
        stats: { defense: 3 },
    },
    {
        id: "ac_h3",
        origin: "Human",
        name: "Knight's Buckle",
        rating: 3,
        prefix: null,
        stats: { defense: 3, attack: 1 },
    },
    {
        id: "ac_h4",
        origin: "Human",
        name: "Champion's Clasp",
        rating: 4,
        prefix: null,
        stats: { defense: 4, attack: 1 },
    },
    {
        id: "ac_h5",
        origin: "Human",
        name: "Grandmaster's Fastening",
        rating: 5,
        prefix: null,
        stats: { defense: 5, attack: 1, speed: 1 },
    },
];

const HELM_SHELLS = [
    {
        id: "hs_e1",
        origin: "Elven",
        name: "Moonsilver Helm",
        rating: 2,
        stats: { defense: 6, speed: 1, magic: 1 },
    },
    {
        id: "hs_e2",
        origin: "Elven",
        name: "Starforged Helm",
        rating: 3,
        stats: { defense: 8, speed: 1, magic: 2 },
    },
    {
        id: "hs_e3",
        origin: "Elven",
        name: "Celestial Crown",
        rating: 4,
        stats: { defense: 11, speed: 2, magic: 3 },
    },
    {
        id: "hs_e4",
        origin: "Elven",
        name: "Aurora Helm",
        rating: 5,
        stats: { defense: 14, speed: 2, magic: 4 },
    },
    {
        id: "hs_h1",
        origin: "Human",
        name: "Iron Helm",
        rating: 1,
        stats: { defense: 5, attack: 1 },
    },
    {
        id: "hs_h2",
        origin: "Human",
        name: "Soldier's Helm",
        rating: 2,
        stats: { defense: 7, attack: 1, speed: 1 },
    },
    {
        id: "hs_h3",
        origin: "Human",
        name: "Knight's Helm",
        rating: 3,
        stats: { defense: 9, attack: 1, speed: 1 },
    },
    {
        id: "hs_h4",
        origin: "Human",
        name: "Champion's Helm",
        rating: 4,
        stats: { defense: 11, attack: 2, speed: 1 },
    },
];

const HELM_VISORS = [
    {
        id: "hv_e1",
        origin: "Elven",
        name: "Moonsilver Visor",
        rating: 2,
        prefix: "Keen",
        stats: { defense: 3, magic: 1 },
    },
    {
        id: "hv_e2",
        origin: "Elven",
        name: "Starweave Visor",
        rating: 3,
        prefix: "Piercing",
        stats: { defense: 4, magic: 2 },
    },
    {
        id: "hv_e3",
        origin: "Elven",
        name: "Celestial Faceplate",
        rating: 4,
        prefix: "Vigilant",
        stats: { defense: 5, magic: 2, speed: 1 },
    },
    {
        id: "hv_e4",
        origin: "Elven",
        name: "Aurora Visor",
        rating: 5,
        prefix: "Prescient",
        stats: { defense: 6, magic: 3, speed: 1 },
    },
    {
        id: "hv_h1",
        origin: "Human",
        name: "Iron Visor",
        rating: 1,
        prefix: "Reliable",
        stats: { defense: 3 },
    },
    {
        id: "hv_h2",
        origin: "Human",
        name: "Soldier's Visor",
        rating: 2,
        prefix: "Steadfast",
        stats: { defense: 4, attack: 1 },
    },
    {
        id: "hv_h3",
        origin: "Human",
        name: "Knight's Faceplate",
        rating: 3,
        prefix: "Resolute",
        stats: { defense: 5, attack: 1 },
    },
    {
        id: "hv_h4",
        origin: "Human",
        name: "Champion's Visor",
        rating: 4,
        prefix: "Dauntless",
        stats: { defense: 6, attack: 2 },
    },
    {
        id: "hv_h5",
        origin: "Human",
        name: "Grandmaster's Faceplate",
        rating: 5,
        prefix: "Indomitable",
        stats: { defense: 7, attack: 2, speed: 1 },
    },
];

const HELM_STRAPS = [
    {
        id: "hst_e1",
        origin: "Elven",
        name: "Moonsilk Strap",
        rating: 2,
        prefix: null,
        stats: { defense: 2, speed: 1 },
    },
    {
        id: "hst_e2",
        origin: "Elven",
        name: "Starweave Strap",
        rating: 3,
        prefix: null,
        stats: { defense: 3, speed: 1, magic: 1 },
    },
    {
        id: "hst_e3",
        origin: "Elven",
        name: "Celestial Strap",
        rating: 4,
        prefix: null,
        stats: { defense: 3, speed: 2, magic: 1 },
    },
    {
        id: "hst_e4",
        origin: "Elven",
        name: "Dreamweave Strap",
        rating: 5,
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
        rating: 2,
        prefix: null,
        stats: { defense: 2 },
    },
    {
        id: "hst_h3",
        origin: "Human",
        name: "Knight's Strap",
        rating: 3,
        prefix: null,
        stats: { defense: 3, speed: 1 },
    },
    {
        id: "hst_h4",
        origin: "Human",
        name: "Champion's Strap",
        rating: 4,
        prefix: null,
        stats: { defense: 3, attack: 1, speed: 1 },
    },
    {
        id: "hst_h5",
        origin: "Human",
        name: "Masterwork Strap",
        rating: 5,
        prefix: null,
        stats: { defense: 4, attack: 1, speed: 1 },
    },
];

const LEG_PLATES = [
    {
        id: "lp_e1",
        origin: "Elven",
        name: "Moonweave Greaves",
        rating: 2,
        stats: { defense: 8, speed: 3 },
    },
    {
        id: "lp_e2",
        origin: "Elven",
        name: "Starforged Greaves",
        rating: 3,
        stats: { defense: 11, speed: 3, magic: 1 },
    },
    {
        id: "lp_e3",
        origin: "Elven",
        name: "Celestial Greaves",
        rating: 4,
        stats: { defense: 14, speed: 4, magic: 1 },
    },
    {
        id: "lp_e4",
        origin: "Elven",
        name: "Aurora Greaves",
        rating: 5,
        stats: { defense: 17, speed: 5, magic: 2 },
    },
    {
        id: "lp_h1",
        origin: "Human",
        name: "Iron Greaves",
        rating: 1,
        stats: { defense: 8, speed: 1 },
    },
    {
        id: "lp_h2",
        origin: "Human",
        name: "Soldier's Greaves",
        rating: 2,
        stats: { defense: 10, attack: 1, speed: 1 },
    },
    {
        id: "lp_h3",
        origin: "Human",
        name: "Knight's Greaves",
        rating: 3,
        stats: { defense: 12, attack: 1, speed: 2 },
    },
    {
        id: "lp_h4",
        origin: "Human",
        name: "Champion's Greaves",
        rating: 4,
        stats: { defense: 15, attack: 2, speed: 2 },
    },
    {
        id: "lp_h5",
        origin: "Human",
        name: "Grand Champion's Greaves",
        rating: 5,
        stats: { defense: 18, attack: 2, speed: 3 },
    },
];

const KNEE_PLATES = [
    {
        id: "kp_e1",
        origin: "Elven",
        name: "Moonsilver Poleyn",
        rating: 2,
        prefix: "Nimble",
        stats: { defense: 3, speed: 2 },
    },
    {
        id: "kp_e2",
        origin: "Elven",
        name: "Starforged Poleyn",
        rating: 3,
        prefix: "Swift",
        stats: { defense: 4, speed: 3 },
    },
    {
        id: "kp_e3",
        origin: "Elven",
        name: "Celestial Poleyn",
        rating: 4,
        prefix: "Fleet",
        stats: { defense: 5, speed: 3, magic: 1 },
    },
    {
        id: "kp_e4",
        origin: "Elven",
        name: "Aurora Poleyn",
        rating: 5,
        prefix: "Ethereal",
        stats: { defense: 6, speed: 4, magic: 1 },
    },
    {
        id: "kp_h1",
        origin: "Human",
        name: "Iron Poleyn",
        rating: 1,
        prefix: "Reliable",
        stats: { defense: 3, speed: 1 },
    },
    {
        id: "kp_h2",
        origin: "Human",
        name: "Soldier's Poleyn",
        rating: 2,
        prefix: "Steadfast",
        stats: { defense: 4, attack: 1, speed: 1 },
    },
    {
        id: "kp_h3",
        origin: "Human",
        name: "Knight's Poleyn",
        rating: 3,
        prefix: "Balanced",
        stats: { defense: 5, attack: 1, speed: 2 },
    },
    {
        id: "kp_h4",
        origin: "Human",
        name: "Champion's Poleyn",
        rating: 4,
        prefix: "Stalwart",
        stats: { defense: 6, attack: 2, speed: 2 },
    },
    {
        id: "kp_h5",
        origin: "Human",
        name: "Grandmaster's Poleyn",
        rating: 5,
        prefix: "Indomitable",
        stats: { defense: 7, attack: 2, speed: 3 },
    },
];

const LEG_STRAPS = [
    {
        id: "ls2_e1",
        origin: "Elven",
        name: "Moonsilk Straps",
        rating: 2,
        prefix: null,
        stats: { defense: 2, speed: 2 },
    },
    {
        id: "ls2_e2",
        origin: "Elven",
        name: "Starweave Straps",
        rating: 3,
        prefix: null,
        stats: { defense: 3, speed: 2 },
    },
    {
        id: "ls2_e3",
        origin: "Elven",
        name: "Celestial Straps",
        rating: 4,
        prefix: null,
        stats: { defense: 4, speed: 3, magic: 1 },
    },
    {
        id: "ls2_e4",
        origin: "Elven",
        name: "Dreamweave Straps",
        rating: 5,
        prefix: null,
        stats: { defense: 5, speed: 3, magic: 1 },
    },
    {
        id: "ls2_h1",
        origin: "Human",
        name: "Leather Straps",
        rating: 1,
        prefix: null,
        stats: { defense: 2, speed: 1 },
    },
    {
        id: "ls2_h2",
        origin: "Human",
        name: "Soldier's Straps",
        rating: 2,
        prefix: null,
        stats: { defense: 3, speed: 1 },
    },
    {
        id: "ls2_h3",
        origin: "Human",
        name: "Knight's Straps",
        rating: 3,
        prefix: null,
        stats: { defense: 3, attack: 1, speed: 1 },
    },
    {
        id: "ls2_h4",
        origin: "Human",
        name: "Champion's Straps",
        rating: 4,
        prefix: null,
        stats: { defense: 4, attack: 1, speed: 2 },
    },
    {
        id: "ls2_h5",
        origin: "Human",
        name: "Masterwork Straps",
        rating: 5,
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
    shortbow: {
        label: "Short Bow",
        slots: [
            { key: "limb", label: "Limb", pool: SHORTBOW_LIMBS },
            { key: "riser", label: "Riser", pool: RISER_POOL },
            { key: "string", label: "String", pool: STRING_POOL },
            { key: "grip", label: "Grip", pool: GRIP_POOL },
        ],
    },
    bow: {
        label: "Bow",
        slots: [
            { key: "limb", label: "Limb", pool: BOW_LIMBS },
            { key: "riser", label: "Riser", pool: RISER_POOL },
            { key: "string", label: "String", pool: STRING_POOL },
            { key: "grip", label: "Grip", pool: GRIP_POOL },
        ],
    },
    longbow: {
        label: "Long Bow",
        slots: [
            { key: "limb", label: "Limb", pool: LONGBOW_LIMBS },
            { key: "riser", label: "Riser", pool: RISER_POOL },
            { key: "string", label: "String", pool: STRING_POOL },
            { key: "grip", label: "Grip", pool: GRIP_POOL },
        ],
    },
    crossbow: {
        label: "Crossbow",
        slots: [
            { key: "prod", label: "Prod", pool: CROSSBOW_PRODS },
            { key: "stock", label: "Stock", pool: CROSSBOW_STOCKS },
            { key: "mechanism", label: "Mechanism", pool: CROSSBOW_MECHANISMS },
            { key: "string", label: "String", pool: STRING_POOL },
        ],
    },
    wand: {
        label: "Wand",
        slots: [
            { key: "focus", label: "Focus", pool: WAND_FOCUSES },
            { key: "shaft", label: "Shaft", pool: SHAFT_POOL },
            { key: "grip", label: "Grip", pool: GRIP_POOL },
            { key: "cap", label: "Cap", pool: WAND_CAPS },
        ],
    },
    staff: {
        label: "Staff",
        slots: [
            { key: "head", label: "Head", pool: STAFF_HEADS },
            { key: "upper_shaft", label: "Upper Shaft", pool: SHAFT_POOL },
            { key: "lower_shaft", label: "Lower Shaft", pool: SHAFT_POOL },
            { key: "base", label: "Base", pool: STAFF_BASES },
        ],
    },
    tome: {
        label: "Tome",
        slots: [
            { key: "cover", label: "Cover", pool: TOME_COVERS },
            { key: "binding", label: "Binding", pool: TOME_BINDINGS },
            { key: "pages", label: "Pages", pool: TOME_PAGES },
            { key: "clasp", label: "Clasp", pool: TOME_CLASPS },
        ],
    },
    spear: {
        label: "Spear",
        slots: [
            { key: "tip", label: "Tip", pool: SPEAR_TIPS },
            { key: "socket", label: "Socket", pool: SPEAR_SOCKETS },
            { key: "shaft", label: "Shaft", pool: SHAFT_POOL },
            { key: "butt", label: "Butt Cap", pool: SPEAR_BUTTS },
        ],
    },
    shield: {
        label: "Shield",
        slots: [
            { key: "face", label: "Face", pool: SHIELD_FACES },
            { key: "rim", label: "Rim", pool: SHIELD_RIMS },
            { key: "boss", label: "Boss", pool: SHIELD_BOSSES },
            { key: "grip", label: "Grip", pool: GRIP_POOL },
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
    const weighted = pool.map((part) => {
        const isCross = part.origin !== null && part.origin !== lockedOrigin;
        if (isCross && !allowCrossOrigin) return { item: part, weight: 0 };
        const originWeight = part.origin === null ? 30 : isCross ? 10 : 60;
        const ratingWeight =
            RATING_PROXIMITY_WEIGHTS[Math.abs(part.rating - primaryRating)] ??
            1;
        return { item: part, weight: originWeight * ratingWeight };
    });
    return weightedRandom(weighted);
}

function calcRarity(primaryRating) {
    return RARITY_BY_RATING[primaryRating] ?? "legendary";
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

function scaleStats(stats, level) {
    const multiplier = 1 + Math.log(level + 1) * LOG_SCALING_FACTOR;
    const scaled = {};
    for (const [key, val] of Object.entries(stats)) {
        // Negative stats (e.g. speed penalty) scale toward zero, not further negative
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
            weight: PRIMARY_RARITY_WEIGHTS[part.rating - 1] ?? 1,
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

    return {
        type,
        typeLabel: def.label,
        name: buildName(primaryPart, secondaryParts),
        origin: resolveOrigin(allParts),
        rarity: calcRarity(primaryPart.rating),
        totalRating,
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
