// ── Origins ───────────────────────────────────────────────────────────────────

export const ORIGINS = {
    ELVEN:   "Elven",
    DWARVEN: "Dwarven",
    ORCISH:  "Orcish",
    ANCIENT: "Ancient",
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
    { id:"g_n1", origin:null,      name:"Leather Wrap",         rating:1, prefix:null,            stats:{} },
    { id:"g_n2", origin:null,      name:"Cord Grip",            rating:1, prefix:null,            stats:{speed:1} },
    { id:"g_n3", origin:null,      name:"Bound Grip",           rating:2, prefix:null,            stats:{speed:1} },
    { id:"g_e1", origin:"Elven",   name:"Silkwood Grip",        rating:2, prefix:"Swift",         stats:{speed:2} },
    { id:"g_e2", origin:"Elven",   name:"Moonweave Grip",       rating:3, prefix:"Nimble",        stats:{speed:3} },
    { id:"g_e3", origin:"Elven",   name:"Starthread Grip",      rating:4, prefix:"Ethereal",      stats:{speed:3, magic:1} },
    { id:"g_e4", origin:"Elven",   name:"Dreamwoven Grip",      rating:5, prefix:"Spectral",      stats:{speed:4, magic:2} },
    { id:"g_d1", origin:"Dwarven", name:"Stone-etched Grip",    rating:2, prefix:"Heavy",         stats:{attack:1} },
    { id:"g_d2", origin:"Dwarven", name:"Runecrafted Grip",     rating:3, prefix:"Masterwork",    stats:{attack:2, defense:1} },
    { id:"g_d3", origin:"Dwarven", name:"Forgebound Grip",      rating:4, prefix:"Tempered",      stats:{attack:2, defense:2} },
    { id:"g_d4", origin:"Dwarven", name:"Deepvein Grip",        rating:5, prefix:"Indomitable",   stats:{attack:3, defense:3} },
    { id:"g_o1", origin:"Orcish",  name:"Sinew Wrap",           rating:2, prefix:"Fierce",        stats:{attack:2} },
    { id:"g_o2", origin:"Orcish",  name:"Warlord's Grip",       rating:3, prefix:"Ruthless",      stats:{attack:3} },
    { id:"g_o3", origin:"Orcish",  name:"Bloodsoaked Wrap",     rating:4, prefix:"Bloodthirsty",  stats:{attack:4} },
    { id:"g_a1", origin:"Ancient", name:"Runic Grip",           rating:3, prefix:"Cursed",        stats:{magic:3} },
    { id:"g_a2", origin:"Ancient", name:"Void-touched Grip",    rating:4, prefix:"Soulbound",     stats:{magic:5} },
    { id:"g_a3", origin:"Ancient", name:"Covenant Grip",        rating:5, prefix:"Forsaken",      stats:{magic:7} },
];

const POMMEL_POOL = [
    { id:"pm_n1", origin:null,      name:"Iron Pommel",          rating:1, prefix:null, stats:{} },
    { id:"pm_n2", origin:null,      name:"Rounded Pommel",       rating:1, prefix:null, stats:{defense:1} },
    { id:"pm_n3", origin:null,      name:"Weighted Pommel",      rating:2, prefix:null, stats:{attack:1} },
    { id:"pm_e1", origin:"Elven",   name:"Moonstone Cap",        rating:2, prefix:null, stats:{magic:1, speed:1} },
    { id:"pm_e2", origin:"Elven",   name:"Starcrystal Pommel",   rating:3, prefix:null, stats:{magic:2, speed:1} },
    { id:"pm_e3", origin:"Elven",   name:"Celestial Orb",        rating:4, prefix:null, stats:{magic:4, speed:2} },
    { id:"pm_e4", origin:"Elven",   name:"Aurora Core",          rating:5, prefix:null, stats:{magic:5, speed:2, attack:1} },
    { id:"pm_d1", origin:"Dwarven", name:"Granite Pommel",       rating:2, prefix:null, stats:{defense:2} },
    { id:"pm_d2", origin:"Dwarven", name:"Runed Counterweight",  rating:3, prefix:null, stats:{attack:1, defense:2} },
    { id:"pm_d3", origin:"Dwarven", name:"Deepgem Setting",      rating:4, prefix:null, stats:{attack:2, defense:3} },
    { id:"pm_d4", origin:"Dwarven", name:"Ancestor's Seal",      rating:5, prefix:null, stats:{attack:2, defense:5} },
    { id:"pm_o1", origin:"Orcish",  name:"Skull Cap",            rating:2, prefix:null, stats:{attack:2} },
    { id:"pm_o2", origin:"Orcish",  name:"Warbrand End",         rating:3, prefix:null, stats:{attack:3} },
    { id:"pm_o3", origin:"Orcish",  name:"Crusher Knob",         rating:4, prefix:null, stats:{attack:4} },
    { id:"pm_a1", origin:"Ancient", name:"Sigil Stone",          rating:3, prefix:null, stats:{magic:3, defense:1} },
    { id:"pm_a2", origin:"Ancient", name:"Void Core",            rating:4, prefix:null, stats:{magic:5} },
    { id:"pm_a3", origin:"Ancient", name:"Eternity Gem",         rating:5, prefix:null, stats:{magic:6, attack:2} },
];

const GUARD_POOL = [
    { id:"gd_n1", origin:null,      name:"Iron Crossguard",      rating:1, prefix:null,           stats:{defense:1} },
    { id:"gd_n2", origin:null,      name:"Wrapped Guard",        rating:1, prefix:null,           stats:{} },
    { id:"gd_n3", origin:null,      name:"Steel Crossguard",     rating:2, prefix:null,           stats:{defense:2} },
    { id:"gd_e1", origin:"Elven",   name:"Leafbend Guard",       rating:2, prefix:"Elegant",      stats:{defense:1, speed:1} },
    { id:"gd_e2", origin:"Elven",   name:"Moonsilver Guard",     rating:3, prefix:"Graceful",     stats:{defense:2, speed:1} },
    { id:"gd_e3", origin:"Elven",   name:"Starforged Guard",     rating:4, prefix:"Radiant",      stats:{defense:3, magic:1} },
    { id:"gd_e4", origin:"Elven",   name:"Solarbind Guard",      rating:5, prefix:"Luminous",     stats:{defense:4, magic:2, speed:1} },
    { id:"gd_d1", origin:"Dwarven", name:"Flanged Guard",        rating:2, prefix:"Sturdy",       stats:{defense:3} },
    { id:"gd_d2", origin:"Dwarven", name:"Runeguard",            rating:3, prefix:"Fortified",    stats:{defense:4} },
    { id:"gd_d3", origin:"Dwarven", name:"Deepstone Guard",      rating:4, prefix:"Ironclad",     stats:{defense:5} },
    { id:"gd_d4", origin:"Dwarven", name:"Ancestral Guard",      rating:5, prefix:"Unyielding",   stats:{defense:7} },
    { id:"gd_o1", origin:"Orcish",  name:"Bone Guard",           rating:2, prefix:"Brutal",       stats:{attack:1, defense:1} },
    { id:"gd_o2", origin:"Orcish",  name:"Serrated Guard",       rating:3, prefix:"Savage",       stats:{attack:2, defense:1} },
    { id:"gd_o3", origin:"Orcish",  name:"Warboss Guard",        rating:4, prefix:"Ferocious",    stats:{attack:3, defense:2} },
    { id:"gd_a1", origin:"Ancient", name:"Glyph Guard",          rating:3, prefix:"Inscribed",    stats:{defense:2, magic:2} },
    { id:"gd_a2", origin:"Ancient", name:"Voidclasp",            rating:4, prefix:"Arcane",       stats:{defense:2, magic:4} },
    { id:"gd_a3", origin:"Ancient", name:"Eternity Ward",        rating:5, prefix:"Timeless",     stats:{defense:3, magic:5} },
];

const SHAFT_POOL = [
    { id:"sh_n1", origin:null,      name:"Oak Shaft",            rating:1, prefix:null,           stats:{} },
    { id:"sh_n2", origin:null,      name:"Ashwood Shaft",        rating:1, prefix:null,           stats:{speed:1} },
    { id:"sh_n3", origin:null,      name:"Ironwood Shaft",       rating:2, prefix:null,           stats:{defense:1} },
    { id:"sh_e1", origin:"Elven",   name:"Moonwood Shaft",       rating:2, prefix:"Lithe",        stats:{speed:2, magic:1} },
    { id:"sh_e2", origin:"Elven",   name:"Starweave Shaft",      rating:3, prefix:"Supple",       stats:{speed:2, magic:2} },
    { id:"sh_e3", origin:"Elven",   name:"Celestial Shaft",      rating:4, prefix:"Flowing",      stats:{speed:3, magic:3} },
    { id:"sh_e4", origin:"Elven",   name:"Dreamwood Shaft",      rating:5, prefix:"Resonant",     stats:{speed:3, magic:4} },
    { id:"sh_d1", origin:"Dwarven", name:"Stone-core Shaft",     rating:2, prefix:"Rigid",        stats:{defense:2} },
    { id:"sh_d2", origin:"Dwarven", name:"Deepiron Shaft",       rating:3, prefix:"Reinforced",   stats:{attack:1, defense:2} },
    { id:"sh_d3", origin:"Dwarven", name:"Runewood Shaft",       rating:4, prefix:"Steadfast",    stats:{attack:1, defense:3} },
    { id:"sh_d4", origin:"Dwarven", name:"Ancestor Shaft",       rating:5, prefix:"Stalwart",     stats:{attack:2, defense:4} },
    { id:"sh_o1", origin:"Orcish",  name:"Bonewood Shaft",       rating:2, prefix:"Gnarled",      stats:{attack:1} },
    { id:"sh_o2", origin:"Orcish",  name:"Warwood Shaft",        rating:3, prefix:"Rough",        stats:{attack:2} },
    { id:"sh_o3", origin:"Orcish",  name:"Thunderwood Shaft",    rating:4, prefix:"Brutish",      stats:{attack:3} },
    { id:"sh_a1", origin:"Ancient", name:"Runecarved Shaft",     rating:3, prefix:"Glyphed",      stats:{magic:3} },
    { id:"sh_a2", origin:"Ancient", name:"Void Shaft",           rating:4, prefix:"Ominous",      stats:{magic:5} },
    { id:"sh_a3", origin:"Ancient", name:"Eternity Shaft",       rating:5, prefix:"Timeworn",     stats:{magic:6, defense:1} },
];

const STRING_POOL = [
    { id:"st_n1", origin:null,      name:"Hemp String",          rating:1, prefix:null,           stats:{} },
    { id:"st_n2", origin:null,      name:"Flax String",          rating:1, prefix:null,           stats:{attack:1} },
    { id:"st_n3", origin:null,      name:"Waxed String",         rating:2, prefix:null,           stats:{attack:1, speed:1} },
    { id:"st_e1", origin:"Elven",   name:"Silkweb String",       rating:2, prefix:"Singing",      stats:{attack:2, speed:2} },
    { id:"st_e2", origin:"Elven",   name:"Moonspun String",      rating:3, prefix:"Whispering",   stats:{attack:3, speed:2} },
    { id:"st_e3", origin:"Elven",   name:"Starthread String",    rating:4, prefix:"Humming",      stats:{attack:4, speed:3} },
    { id:"st_e4", origin:"Elven",   name:"Celestial Chord",      rating:5, prefix:"Resonant",     stats:{attack:5, speed:3, magic:2} },
    { id:"st_d1", origin:"Dwarven", name:"Steelcord String",     rating:2, prefix:"Taut",         stats:{attack:3} },
    { id:"st_d2", origin:"Dwarven", name:"Runebound String",     rating:3, prefix:"Tensioned",    stats:{attack:4, defense:1} },
    { id:"st_d3", origin:"Dwarven", name:"Deepsteel Cord",       rating:4, prefix:"Iron-drawn",   stats:{attack:5, defense:2} },
    { id:"st_o1", origin:"Orcish",  name:"Sinew String",         rating:2, prefix:"Tense",        stats:{attack:3} },
    { id:"st_o2", origin:"Orcish",  name:"Gut String",           rating:3, prefix:"Raw",          stats:{attack:4} },
    { id:"st_o3", origin:"Orcish",  name:"Warlord's Cord",       rating:4, prefix:"Savage-drawn",  stats:{attack:6} },
    { id:"st_a1", origin:"Ancient", name:"Runethread",           rating:3, prefix:"Rune-strung",  stats:{attack:3, magic:2} },
    { id:"st_a2", origin:"Ancient", name:"Void Chord",           rating:4, prefix:"Cursed-drawn",  stats:{attack:4, magic:4} },
    { id:"st_a3", origin:"Ancient", name:"Eternity Cord",        rating:5, prefix:"Fatebound",    stats:{attack:5, magic:5} },
];

const RISER_POOL = [
    { id:"rs_n1", origin:null,      name:"Wood Riser",           rating:1, prefix:null,           stats:{} },
    { id:"rs_n2", origin:null,      name:"Wrapped Riser",        rating:1, prefix:null,           stats:{speed:1} },
    { id:"rs_n3", origin:null,      name:"Carved Riser",         rating:2, prefix:null,           stats:{defense:1} },
    { id:"rs_e1", origin:"Elven",   name:"Moonwood Riser",       rating:2, prefix:"Balanced",     stats:{speed:2} },
    { id:"rs_e2", origin:"Elven",   name:"Starwood Riser",       rating:3, prefix:"Precise",      stats:{speed:2, magic:1} },
    { id:"rs_e3", origin:"Elven",   name:"Celestial Riser",      rating:4, prefix:"Harmonized",   stats:{speed:3, magic:2} },
    { id:"rs_e4", origin:"Elven",   name:"Dreamwood Riser",      rating:5, prefix:"Attuned",      stats:{speed:3, magic:3} },
    { id:"rs_d1", origin:"Dwarven", name:"Iron Riser",           rating:2, prefix:"Solid",        stats:{attack:1, defense:1} },
    { id:"rs_d2", origin:"Dwarven", name:"Runewood Riser",       rating:3, prefix:"Grounded",     stats:{attack:2, defense:1} },
    { id:"rs_d3", origin:"Dwarven", name:"Deepforge Riser",      rating:4, prefix:"Braced",       stats:{attack:2, defense:2} },
    { id:"rs_o1", origin:"Orcish",  name:"Bonewood Riser",       rating:2, prefix:"Crude",        stats:{attack:2} },
    { id:"rs_o2", origin:"Orcish",  name:"Warwood Riser",        rating:3, prefix:"Rugged",       stats:{attack:3} },
    { id:"rs_o3", origin:"Orcish",  name:"Bloodwood Riser",      rating:4, prefix:"Ferocious",    stats:{attack:4} },
    { id:"rs_a1", origin:"Ancient", name:"Glyph Riser",          rating:3, prefix:"Inscribed",    stats:{magic:2, speed:1} },
    { id:"rs_a2", origin:"Ancient", name:"Void Riser",           rating:4, prefix:"Soulforged",   stats:{magic:4} },
    { id:"rs_a3", origin:"Ancient", name:"Eternity Riser",       rating:5, prefix:"Timeless",     stats:{magic:5, speed:1} },
];

// ── Sword Family ──────────────────────────────────────────────────────────────

const DAGGER_BLADES = [
    { id:"db_e1", origin:"Elven",   name:"Fang",                 rating:2, stats:{attack:4,  speed:3} },
    { id:"db_e2", origin:"Elven",   name:"Moonpiercer",          rating:3, stats:{attack:6,  speed:4} },
    { id:"db_e3", origin:"Elven",   name:"Silverfang",           rating:4, stats:{attack:8,  speed:5, magic:1} },
    { id:"db_e4", origin:"Elven",   name:"Dawnwhisper",          rating:5, stats:{attack:10, speed:6, magic:2} },
    { id:"db_d1", origin:"Dwarven", name:"Puncher",              rating:1, stats:{attack:5,  speed:1} },
    { id:"db_d2", origin:"Dwarven", name:"Chisel",               rating:2, stats:{attack:7,  speed:1} },
    { id:"db_d3", origin:"Dwarven", name:"Rune Spike",           rating:3, stats:{attack:10, speed:1, defense:1} },
    { id:"db_d4", origin:"Dwarven", name:"Deepbore",             rating:4, stats:{attack:13, speed:1, defense:2} },
    { id:"db_o1", origin:"Orcish",  name:"Shiv",                 rating:1, stats:{attack:5,  speed:2} },
    { id:"db_o2", origin:"Orcish",  name:"Tusk Knife",           rating:2, stats:{attack:7,  speed:2} },
    { id:"db_o3", origin:"Orcish",  name:"Blood Fang",           rating:3, stats:{attack:10, speed:2} },
    { id:"db_o4", origin:"Orcish",  name:"Gutter",               rating:4, stats:{attack:13, speed:2} },
    { id:"db_a1", origin:"Ancient", name:"Shard",                rating:3, stats:{attack:6,  magic:4} },
    { id:"db_a2", origin:"Ancient", name:"Oathshard",            rating:4, stats:{attack:8,  magic:6} },
    { id:"db_a3", origin:"Ancient", name:"Void Needle",          rating:5, stats:{attack:10, magic:9} },
];

const DAGGER_CROSSGUARDS = [
    { id:"dc_n1", origin:null,      name:"Simple Crossguard",    rating:1, prefix:null,           stats:{defense:1} },
    { id:"dc_n2", origin:null,      name:"Ringed Guard",         rating:2, prefix:null,           stats:{defense:1, speed:1} },
    { id:"dc_e1", origin:"Elven",   name:"Leaf Quillon",         rating:2, prefix:"Keen",         stats:{speed:2} },
    { id:"dc_e2", origin:"Elven",   name:"Moonsilver Quillon",   rating:3, prefix:"Sharp",        stats:{speed:2, magic:1} },
    { id:"dc_e3", origin:"Elven",   name:"Starforged Quillon",   rating:4, prefix:"Piercing",     stats:{speed:3, magic:2} },
    { id:"dc_d1", origin:"Dwarven", name:"Iron Quillon",         rating:2, prefix:"Sturdy",       stats:{defense:2} },
    { id:"dc_d2", origin:"Dwarven", name:"Rune Quillon",         rating:3, prefix:"Shielded",     stats:{defense:3} },
    { id:"dc_d3", origin:"Dwarven", name:"Deepmetal Quillon",    rating:4, prefix:"Fortified",    stats:{defense:4} },
    { id:"dc_o1", origin:"Orcish",  name:"Bone Spur",            rating:2, prefix:"Vicious",      stats:{attack:2} },
    { id:"dc_o2", origin:"Orcish",  name:"Barbed Guard",         rating:3, prefix:"Cruel",        stats:{attack:2, speed:1} },
    { id:"dc_a1", origin:"Ancient", name:"Glyph Ring",           rating:3, prefix:"Cursed",       stats:{magic:3} },
    { id:"dc_a2", origin:"Ancient", name:"Void Quillon",         rating:4, prefix:"Eldritch",     stats:{magic:4, speed:1} },
];

const LONGSWORD_BLADES = [
    { id:"ls_e1", origin:"Elven",   name:"Whisper",              rating:2, stats:{attack:7,  speed:2} },
    { id:"ls_e2", origin:"Elven",   name:"Moonshard",            rating:3, stats:{attack:10, speed:2} },
    { id:"ls_e3", origin:"Elven",   name:"Starweave",            rating:4, stats:{attack:13, speed:1, magic:2} },
    { id:"ls_e4", origin:"Elven",   name:"Celestial Edge",       rating:5, stats:{attack:16, speed:2, magic:3} },
    { id:"ls_d1", origin:"Dwarven", name:"Cleaver",              rating:1, stats:{attack:6} },
    { id:"ls_d2", origin:"Dwarven", name:"Stonecutter",          rating:2, stats:{attack:9} },
    { id:"ls_d3", origin:"Dwarven", name:"Deepfang",             rating:3, stats:{attack:12, defense:1} },
    { id:"ls_d4", origin:"Dwarven", name:"Ironshatter",          rating:4, stats:{attack:15, defense:2} },
    { id:"ls_d5", origin:"Dwarven", name:"Grudgeforged",         rating:5, stats:{attack:19, defense:3} },
    { id:"ls_o1", origin:"Orcish",  name:"Tusk",                 rating:1, stats:{attack:6} },
    { id:"ls_o2", origin:"Orcish",  name:"Bonecleave",           rating:2, stats:{attack:9} },
    { id:"ls_o3", origin:"Orcish",  name:"Bloodedge",            rating:3, stats:{attack:13} },
    { id:"ls_o4", origin:"Orcish",  name:"Warchief's Fang",      rating:4, stats:{attack:17, speed:-1} },
    { id:"ls_o5", origin:"Orcish",  name:"Skullsplitter",        rating:5, stats:{attack:21, speed:-2} },
    { id:"ls_a1", origin:"Ancient", name:"Relic",                rating:2, stats:{attack:7,  magic:3} },
    { id:"ls_a2", origin:"Ancient", name:"Oathbreaker",          rating:3, stats:{attack:10, magic:4} },
    { id:"ls_a3", origin:"Ancient", name:"Voidedge",             rating:4, stats:{attack:13, magic:6} },
    { id:"ls_a4", origin:"Ancient", name:"Eternity Shard",       rating:5, stats:{attack:15, magic:9} },
];

const GREATSWORD_BLADES = [
    { id:"gs_e1", origin:"Elven",   name:"Moonglaive",           rating:2, stats:{attack:12, speed:1} },
    { id:"gs_e2", origin:"Elven",   name:"Starblade",            rating:3, stats:{attack:16, speed:1, magic:2} },
    { id:"gs_e3", origin:"Elven",   name:"Sunsever",             rating:4, stats:{attack:20, speed:1, magic:3} },
    { id:"gs_e4", origin:"Elven",   name:"Celestial Reaper",     rating:5, stats:{attack:24, speed:2, magic:5} },
    { id:"gs_d1", origin:"Dwarven", name:"Great Cleaver",        rating:1, stats:{attack:10} },
    { id:"gs_d2", origin:"Dwarven", name:"Mountain Sever",       rating:2, stats:{attack:14, defense:1} },
    { id:"gs_d3", origin:"Dwarven", name:"Cragbreaker",          rating:3, stats:{attack:18, defense:2} },
    { id:"gs_d4", origin:"Dwarven", name:"Grudgereaper",         rating:4, stats:{attack:22, defense:3} },
    { id:"gs_d5", origin:"Dwarven", name:"Titan's Edge",         rating:5, stats:{attack:27, defense:4} },
    { id:"gs_o1", origin:"Orcish",  name:"Warmaul Blade",        rating:1, stats:{attack:10, speed:-1} },
    { id:"gs_o2", origin:"Orcish",  name:"Cleaver of Ruin",      rating:2, stats:{attack:14, speed:-1} },
    { id:"gs_o3", origin:"Orcish",  name:"Skullcrusher",         rating:3, stats:{attack:19, speed:-2} },
    { id:"gs_o4", origin:"Orcish",  name:"Warlord's Bane",       rating:4, stats:{attack:24, speed:-2} },
    { id:"gs_o5", origin:"Orcish",  name:"Devastator",           rating:5, stats:{attack:29, speed:-3} },
    { id:"gs_a1", origin:"Ancient", name:"Ruin",                 rating:2, stats:{attack:12, magic:4} },
    { id:"gs_a2", origin:"Ancient", name:"Apocalypse",           rating:3, stats:{attack:16, magic:6} },
    { id:"gs_a3", origin:"Ancient", name:"World Ender",          rating:4, stats:{attack:20, magic:8} },
    { id:"gs_a4", origin:"Ancient", name:"Oblivion",             rating:5, stats:{attack:23, magic:12} },
];

// ── Bow Family ────────────────────────────────────────────────────────────────

const SHORTBOW_LIMBS = [
    { id:"sb_e1", origin:"Elven",   name:"Recurve",              rating:2, stats:{attack:5,  speed:4} },
    { id:"sb_e2", origin:"Elven",   name:"Moonleaf Bow",         rating:3, stats:{attack:7,  speed:5} },
    { id:"sb_e3", origin:"Elven",   name:"Swift Arc",            rating:4, stats:{attack:9,  speed:6, magic:1} },
    { id:"sb_e4", origin:"Elven",   name:"Starweave Short",      rating:5, stats:{attack:11, speed:7, magic:2} },
    { id:"sb_d1", origin:"Dwarven", name:"Compact Crossarm",     rating:1, stats:{attack:5,  speed:3} },
    { id:"sb_d2", origin:"Dwarven", name:"Runed Short Limb",     rating:2, stats:{attack:7,  speed:3, defense:1} },
    { id:"sb_d3", origin:"Dwarven", name:"Ironwood Recurve",     rating:3, stats:{attack:9,  speed:3, defense:2} },
    { id:"sb_o1", origin:"Orcish",  name:"Crude Short Limb",     rating:1, stats:{attack:5,  speed:3} },
    { id:"sb_o2", origin:"Orcish",  name:"Warped Limb",          rating:2, stats:{attack:7,  speed:2} },
    { id:"sb_o3", origin:"Orcish",  name:"Snapwood Bow",         rating:3, stats:{attack:9,  speed:2} },
    { id:"sb_a1", origin:"Ancient", name:"Rune Recurve",         rating:3, stats:{attack:7,  speed:4, magic:2} },
    { id:"sb_a2", origin:"Ancient", name:"Void Arc",             rating:4, stats:{attack:9,  speed:4, magic:4} },
    { id:"sb_a3", origin:"Ancient", name:"Eternity Short",       rating:5, stats:{attack:11, speed:5, magic:5} },
];

const BOW_LIMBS = [
    { id:"bw_e1", origin:"Elven",   name:"Hunting Bow",          rating:2, stats:{attack:8,  speed:3} },
    { id:"bw_e2", origin:"Elven",   name:"Moon Bow",             rating:3, stats:{attack:11, speed:3} },
    { id:"bw_e3", origin:"Elven",   name:"Starwood Bow",         rating:4, stats:{attack:14, speed:3, magic:1} },
    { id:"bw_e4", origin:"Elven",   name:"Celestial Bow",        rating:5, stats:{attack:17, speed:3, magic:3} },
    { id:"bw_d1", origin:"Dwarven", name:"War Bow",              rating:1, stats:{attack:8} },
    { id:"bw_d2", origin:"Dwarven", name:"Runed Bow",            rating:2, stats:{attack:11, defense:1} },
    { id:"bw_d3", origin:"Dwarven", name:"Ironwood Bow",         rating:3, stats:{attack:14, defense:2} },
    { id:"bw_d4", origin:"Dwarven", name:"Deepcraft Bow",        rating:4, stats:{attack:17, defense:2} },
    { id:"bw_o1", origin:"Orcish",  name:"Warbow",               rating:1, stats:{attack:9} },
    { id:"bw_o2", origin:"Orcish",  name:"Bonewood Bow",         rating:2, stats:{attack:12} },
    { id:"bw_o3", origin:"Orcish",  name:"Savage Recurve",       rating:3, stats:{attack:15} },
    { id:"bw_o4", origin:"Orcish",  name:"Warchief's Bow",       rating:4, stats:{attack:19, speed:-1} },
    { id:"bw_a1", origin:"Ancient", name:"Runed Bow",            rating:3, stats:{attack:11, magic:3} },
    { id:"bw_a2", origin:"Ancient", name:"Oathbow",              rating:4, stats:{attack:14, magic:5} },
    { id:"bw_a3", origin:"Ancient", name:"Eternity Bow",         rating:5, stats:{attack:17, magic:7} },
];

const LONGBOW_LIMBS = [
    { id:"lb_e1", origin:"Elven",   name:"Great Bow",            rating:2, stats:{attack:12, speed:1} },
    { id:"lb_e2", origin:"Elven",   name:"Moongrove Longbow",    rating:3, stats:{attack:16, speed:1, magic:1} },
    { id:"lb_e3", origin:"Elven",   name:"Starbend Longbow",     rating:4, stats:{attack:20, speed:1, magic:2} },
    { id:"lb_e4", origin:"Elven",   name:"Celestial Longbow",    rating:5, stats:{attack:24, speed:1, magic:4} },
    { id:"lb_d1", origin:"Dwarven", name:"Great War Bow",        rating:2, stats:{attack:13, defense:1} },
    { id:"lb_d2", origin:"Dwarven", name:"Deepwood Longbow",     rating:3, stats:{attack:17, defense:2} },
    { id:"lb_d3", origin:"Dwarven", name:"Ironheart Longbow",    rating:4, stats:{attack:21, defense:3} },
    { id:"lb_d4", origin:"Dwarven", name:"Ancestral Greatbow",   rating:5, stats:{attack:25, defense:4} },
    { id:"lb_o1", origin:"Orcish",  name:"Siege Bow",            rating:2, stats:{attack:13, speed:-1} },
    { id:"lb_o2", origin:"Orcish",  name:"Bone Longbow",         rating:3, stats:{attack:17, speed:-1} },
    { id:"lb_o3", origin:"Orcish",  name:"Warlord's Greatbow",   rating:4, stats:{attack:22, speed:-2} },
    { id:"lb_a1", origin:"Ancient", name:"Fate Bow",             rating:3, stats:{attack:15, magic:4} },
    { id:"lb_a2", origin:"Ancient", name:"Void Longbow",         rating:4, stats:{attack:19, magic:6} },
    { id:"lb_a3", origin:"Ancient", name:"Eternity Longbow",     rating:5, stats:{attack:23, magic:8} },
];

// ── Crossbow ──────────────────────────────────────────────────────────────────

const CROSSBOW_PRODS = [
    { id:"cp_e1", origin:"Elven",   name:"Moonwood Prod",        rating:2, stats:{attack:10, speed:1} },
    { id:"cp_e2", origin:"Elven",   name:"Starwood Prod",        rating:3, stats:{attack:14, speed:1, magic:1} },
    { id:"cp_e3", origin:"Elven",   name:"Celestial Prod",       rating:4, stats:{attack:18, speed:1, magic:2} },
    { id:"cp_e4", origin:"Elven",   name:"Dreamwood Prod",       rating:5, stats:{attack:22, speed:1, magic:3} },
    { id:"cp_d1", origin:"Dwarven", name:"Steel Prod",           rating:1, stats:{attack:9} },
    { id:"cp_d2", origin:"Dwarven", name:"Runed Prod",           rating:2, stats:{attack:12, defense:1} },
    { id:"cp_d3", origin:"Dwarven", name:"Deepsteel Prod",       rating:3, stats:{attack:16, defense:2} },
    { id:"cp_d4", origin:"Dwarven", name:"Ancestor Prod",        rating:4, stats:{attack:20, defense:3} },
    { id:"cp_d5", origin:"Dwarven", name:"Titan's Prod",         rating:5, stats:{attack:25, defense:4} },
    { id:"cp_o1", origin:"Orcish",  name:"Crude Prod",           rating:1, stats:{attack:9} },
    { id:"cp_o2", origin:"Orcish",  name:"Bone Prod",            rating:2, stats:{attack:12} },
    { id:"cp_o3", origin:"Orcish",  name:"War Prod",             rating:3, stats:{attack:16, speed:-1} },
    { id:"cp_o4", origin:"Orcish",  name:"Warboss Prod",         rating:4, stats:{attack:21, speed:-1} },
    { id:"cp_a1", origin:"Ancient", name:"Rune Prod",            rating:3, stats:{attack:13, magic:3} },
    { id:"cp_a2", origin:"Ancient", name:"Void Prod",            rating:4, stats:{attack:17, magic:5} },
    { id:"cp_a3", origin:"Ancient", name:"Eternity Prod",        rating:5, stats:{attack:21, magic:7} },
];

const CROSSBOW_STOCKS = [
    { id:"cs_n1", origin:null,      name:"Pine Stock",           rating:1, prefix:null,           stats:{} },
    { id:"cs_n2", origin:null,      name:"Oak Stock",            rating:1, prefix:null,           stats:{defense:1} },
    { id:"cs_n3", origin:null,      name:"Reinforced Stock",     rating:2, prefix:null,           stats:{defense:2} },
    { id:"cs_e1", origin:"Elven",   name:"Moonwood Stock",       rating:2, prefix:"Elegant",      stats:{speed:1, defense:1} },
    { id:"cs_e2", origin:"Elven",   name:"Starwood Stock",       rating:3, prefix:"Balanced",     stats:{speed:1, defense:2} },
    { id:"cs_e3", origin:"Elven",   name:"Dreamwood Stock",      rating:4, prefix:"Precise",      stats:{speed:2, defense:2} },
    { id:"cs_d1", origin:"Dwarven", name:"Iron-banded Stock",    rating:2, prefix:"Sturdy",       stats:{defense:3} },
    { id:"cs_d2", origin:"Dwarven", name:"Runed Stock",          rating:3, prefix:"Fortified",    stats:{defense:4} },
    { id:"cs_d3", origin:"Dwarven", name:"Deepmetal Stock",      rating:4, prefix:"Armored",      stats:{defense:5} },
    { id:"cs_o1", origin:"Orcish",  name:"Rough-hewn Stock",     rating:2, prefix:"Brutal",       stats:{attack:1} },
    { id:"cs_o2", origin:"Orcish",  name:"Bone-inlaid Stock",    rating:3, prefix:"Savage",       stats:{attack:2} },
    { id:"cs_a1", origin:"Ancient", name:"Glyph-carved Stock",   rating:3, prefix:"Inscribed",    stats:{magic:2, defense:1} },
    { id:"cs_a2", origin:"Ancient", name:"Void Stock",           rating:4, prefix:"Eldritch",     stats:{magic:4} },
];

const CROSSBOW_MECHANISMS = [
    { id:"cm_n1", origin:null,      name:"Iron Trigger",         rating:1, prefix:null,           stats:{} },
    { id:"cm_n2", origin:null,      name:"Brass Trigger",        rating:1, prefix:null,           stats:{speed:1} },
    { id:"cm_n3", origin:null,      name:"Spring Mechanism",     rating:2, prefix:null,           stats:{speed:2} },
    { id:"cm_e1", origin:"Elven",   name:"Moonsilver Trigger",   rating:2, prefix:"Quick",        stats:{speed:3} },
    { id:"cm_e2", origin:"Elven",   name:"Starcraft Mechanism",  rating:3, prefix:"Rapid",        stats:{speed:4} },
    { id:"cm_e3", origin:"Elven",   name:"Celestial Release",    rating:4, prefix:"Lightning",    stats:{speed:5} },
    { id:"cm_d1", origin:"Dwarven", name:"Precision Mechanism",  rating:2, prefix:"Accurate",     stats:{attack:2} },
    { id:"cm_d2", origin:"Dwarven", name:"Rune Trigger",         rating:3, prefix:"True",         stats:{attack:3, defense:1} },
    { id:"cm_d3", origin:"Dwarven", name:"Mastercraft Trigger",  rating:4, prefix:"Deadshot",     stats:{attack:4, defense:1} },
    { id:"cm_o1", origin:"Orcish",  name:"Crude Release",        rating:1, prefix:"Brutal",       stats:{attack:1} },
    { id:"cm_o2", origin:"Orcish",  name:"Heavy Trigger",        rating:2, prefix:"Forceful",     stats:{attack:2} },
    { id:"cm_a1", origin:"Ancient", name:"Rune Mechanism",       rating:3, prefix:"Cursed",       stats:{magic:2, speed:1} },
    { id:"cm_a2", origin:"Ancient", name:"Void Trigger",         rating:4, prefix:"Eldritch",     stats:{magic:3, attack:2} },
];

// ── Wand ──────────────────────────────────────────────────────────────────────

const WAND_FOCUSES = [
    { id:"wf_e1", origin:"Elven",   name:"Mooncrystal",          rating:2, stats:{magic:6,  speed:2} },
    { id:"wf_e2", origin:"Elven",   name:"Starstone",            rating:3, stats:{magic:9,  speed:2} },
    { id:"wf_e3", origin:"Elven",   name:"Celestial Gem",        rating:4, stats:{magic:12, speed:3} },
    { id:"wf_e4", origin:"Elven",   name:"Aurora Crystal",       rating:5, stats:{magic:15, speed:3} },
    { id:"wf_d1", origin:"Dwarven", name:"Runestone",            rating:2, stats:{magic:5,  defense:1} },
    { id:"wf_d2", origin:"Dwarven", name:"Deepgem",              rating:3, stats:{magic:7,  defense:2} },
    { id:"wf_d3", origin:"Dwarven", name:"Ancestor Gem",         rating:4, stats:{magic:10, defense:2} },
    { id:"wf_d4", origin:"Dwarven", name:"Etched Gemstone",      rating:5, stats:{magic:13, defense:3} },
    { id:"wf_o1", origin:"Orcish",  name:"Bone Shard",           rating:1, stats:{magic:4,  attack:1} },
    { id:"wf_o2", origin:"Orcish",  name:"Spirit Stone",         rating:2, stats:{magic:6,  attack:1} },
    { id:"wf_o3", origin:"Orcish",  name:"Shaman's Eye",         rating:3, stats:{magic:8,  attack:2} },
    { id:"wf_o4", origin:"Orcish",  name:"Warchief's Stone",     rating:4, stats:{magic:11, attack:2} },
    { id:"wf_a1", origin:"Ancient", name:"Sigil Crystal",        rating:3, stats:{magic:10} },
    { id:"wf_a2", origin:"Ancient", name:"Void Shard",           rating:4, stats:{magic:14} },
    { id:"wf_a3", origin:"Ancient", name:"Eternity Gem",         rating:5, stats:{magic:18} },
];

const WAND_CAPS = [
    { id:"wc_n1", origin:null,      name:"Brass Cap",            rating:1, prefix:null,           stats:{} },
    { id:"wc_n2", origin:null,      name:"Copper Cap",           rating:1, prefix:null,           stats:{magic:1} },
    { id:"wc_n3", origin:null,      name:"Silver Cap",           rating:2, prefix:null,           stats:{magic:2} },
    { id:"wc_e1", origin:"Elven",   name:"Moonsilver Cap",       rating:2, prefix:"Gleaming",     stats:{magic:2, speed:1} },
    { id:"wc_e2", origin:"Elven",   name:"Starweave Cap",        rating:3, prefix:"Shimmering",   stats:{magic:3, speed:1} },
    { id:"wc_e3", origin:"Elven",   name:"Celestial Finial",     rating:4, prefix:"Radiant",      stats:{magic:4, speed:2} },
    { id:"wc_d1", origin:"Dwarven", name:"Runed Cap",            rating:2, prefix:"Grounded",     stats:{magic:2, defense:1} },
    { id:"wc_d2", origin:"Dwarven", name:"Deepgold Cap",         rating:3, prefix:"Anchored",     stats:{magic:3, defense:2} },
    { id:"wc_d3", origin:"Dwarven", name:"Ancestor Cap",         rating:4, prefix:"Steadfast",    stats:{magic:4, defense:3} },
    { id:"wc_o1", origin:"Orcish",  name:"Bone Cap",             rating:2, prefix:"Crude",        stats:{magic:1, attack:1} },
    { id:"wc_o2", origin:"Orcish",  name:"Fang Cap",             rating:3, prefix:"Primal",       stats:{magic:2, attack:2} },
    { id:"wc_a1", origin:"Ancient", name:"Sigil Cap",            rating:3, prefix:"Marked",       stats:{magic:4} },
    { id:"wc_a2", origin:"Ancient", name:"Void Finial",          rating:4, prefix:"Eldritch",     stats:{magic:6} },
    { id:"wc_a3", origin:"Ancient", name:"Eternity Cap",         rating:5, prefix:"Timeless",     stats:{magic:7} },
];

// ── Staff ─────────────────────────────────────────────────────────────────────

const STAFF_HEADS = [
    { id:"sth_e1", origin:"Elven",   name:"Mooncrystal Crown",   rating:2, stats:{magic:8,  attack:1} },
    { id:"sth_e2", origin:"Elven",   name:"Star Crown",          rating:3, stats:{magic:11, attack:1} },
    { id:"sth_e3", origin:"Elven",   name:"Celestial Crown",     rating:4, stats:{magic:15, attack:2} },
    { id:"sth_e4", origin:"Elven",   name:"Aurora Crown",        rating:5, stats:{magic:19, attack:2} },
    { id:"sth_d1", origin:"Dwarven", name:"Runed Headpiece",     rating:2, stats:{magic:6,  attack:2, defense:1} },
    { id:"sth_d2", origin:"Dwarven", name:"Deepgem Crown",       rating:3, stats:{magic:9,  attack:2, defense:1} },
    { id:"sth_d3", origin:"Dwarven", name:"Ancestor Crown",      rating:4, stats:{magic:12, attack:3, defense:2} },
    { id:"sth_d4", origin:"Dwarven", name:"Titan Crown",         rating:5, stats:{magic:15, attack:3, defense:3} },
    { id:"sth_o1", origin:"Orcish",  name:"Skull Totem",         rating:2, stats:{magic:5,  attack:3} },
    { id:"sth_o2", origin:"Orcish",  name:"Shaman's Skull",      rating:3, stats:{magic:7,  attack:4} },
    { id:"sth_o3", origin:"Orcish",  name:"Warchief's Skull",    rating:4, stats:{magic:10, attack:5} },
    { id:"sth_a1", origin:"Ancient", name:"Sigil Crown",         rating:3, stats:{magic:12} },
    { id:"sth_a2", origin:"Ancient", name:"Void Eye",            rating:4, stats:{magic:16} },
    { id:"sth_a3", origin:"Ancient", name:"Eternity Crown",      rating:5, stats:{magic:21} },
];

const STAFF_BASES = [
    { id:"stb_n1", origin:null,      name:"Iron Ferrule",        rating:1, prefix:null,           stats:{defense:1} },
    { id:"stb_n2", origin:null,      name:"Bronze Ferrule",      rating:1, prefix:null,           stats:{magic:1} },
    { id:"stb_n3", origin:null,      name:"Steel Ferrule",       rating:2, prefix:null,           stats:{magic:1, defense:1} },
    { id:"stb_e1", origin:"Elven",   name:"Moonsilver Ferrule",  rating:2, prefix:"Channeling",   stats:{magic:3} },
    { id:"stb_e2", origin:"Elven",   name:"Starweave Ferrule",   rating:3, prefix:"Flowing",      stats:{magic:4} },
    { id:"stb_e3", origin:"Elven",   name:"Celestial Base",      rating:4, prefix:"Resonant",     stats:{magic:5, speed:1} },
    { id:"stb_d1", origin:"Dwarven", name:"Runestone Ferrule",   rating:2, prefix:"Grounded",     stats:{magic:2, defense:2} },
    { id:"stb_d2", origin:"Dwarven", name:"Deepmetal Ferrule",   rating:3, prefix:"Fortified",    stats:{magic:3, defense:3} },
    { id:"stb_d3", origin:"Dwarven", name:"Ancestor Ferrule",    rating:4, prefix:"Steadfast",    stats:{magic:4, defense:4} },
    { id:"stb_o1", origin:"Orcish",  name:"Bone Ferrule",        rating:2, prefix:"Crude",        stats:{magic:1, attack:2} },
    { id:"stb_o2", origin:"Orcish",  name:"Warstomp End",        rating:3, prefix:"Brutal",       stats:{magic:2, attack:3} },
    { id:"stb_a1", origin:"Ancient", name:"Sigil Ferrule",       rating:3, prefix:"Marked",       stats:{magic:5} },
    { id:"stb_a2", origin:"Ancient", name:"Void Base",           rating:4, prefix:"Eldritch",     stats:{magic:7} },
    { id:"stb_a3", origin:"Ancient", name:"Eternity Ferrule",    rating:5, prefix:"Timeless",     stats:{magic:9} },
];

// ── Tome ──────────────────────────────────────────────────────────────────────

const TOME_COVERS = [
    { id:"tc_e1", origin:"Elven",   name:"Moonsilver Tome",      rating:2, stats:{magic:8} },
    { id:"tc_e2", origin:"Elven",   name:"Starweave Grimoire",   rating:3, stats:{magic:11} },
    { id:"tc_e3", origin:"Elven",   name:"Celestial Codex",      rating:4, stats:{magic:15} },
    { id:"tc_e4", origin:"Elven",   name:"Aurora Compendium",    rating:5, stats:{magic:19} },
    { id:"tc_d1", origin:"Dwarven", name:"Ironbound Tome",       rating:2, stats:{magic:7,  defense:1} },
    { id:"tc_d2", origin:"Dwarven", name:"Rune Codex",           rating:3, stats:{magic:10, defense:1} },
    { id:"tc_d3", origin:"Dwarven", name:"Deepstone Grimoire",   rating:4, stats:{magic:13, defense:2} },
    { id:"tc_d4", origin:"Dwarven", name:"Ancestor's Folio",     rating:5, stats:{magic:17, defense:2} },
    { id:"tc_o1", origin:"Orcish",  name:"Skinbound Tome",       rating:1, stats:{magic:5} },
    { id:"tc_o2", origin:"Orcish",  name:"Shaman's Grimoire",    rating:2, stats:{magic:7} },
    { id:"tc_o3", origin:"Orcish",  name:"Warchief's Tome",      rating:3, stats:{magic:10} },
    { id:"tc_a1", origin:"Ancient", name:"Sigil Tome",           rating:3, stats:{magic:13} },
    { id:"tc_a2", origin:"Ancient", name:"Void Grimoire",        rating:4, stats:{magic:17} },
    { id:"tc_a3", origin:"Ancient", name:"Eternity Codex",       rating:5, stats:{magic:22} },
];

const TOME_BINDINGS = [
    { id:"tb_n1", origin:null,      name:"Leather Binding",      rating:1, prefix:null,           stats:{magic:1} },
    { id:"tb_n2", origin:null,      name:"Cloth Binding",        rating:1, prefix:null,           stats:{magic:1} },
    { id:"tb_n3", origin:null,      name:"Hide Binding",         rating:2, prefix:null,           stats:{magic:2} },
    { id:"tb_e1", origin:"Elven",   name:"Moonsilk Binding",     rating:2, prefix:"Luminous",     stats:{magic:3} },
    { id:"tb_e2", origin:"Elven",   name:"Starthread Binding",   rating:3, prefix:"Radiant",      stats:{magic:5} },
    { id:"tb_e3", origin:"Elven",   name:"Dreamweave Binding",   rating:4, prefix:"Ethereal",     stats:{magic:7} },
    { id:"tb_d1", origin:"Dwarven", name:"Ironchain Binding",    rating:2, prefix:"Sealed",       stats:{magic:2, defense:1} },
    { id:"tb_d2", origin:"Dwarven", name:"Runed Binding",        rating:3, prefix:"Warded",       stats:{magic:4, defense:1} },
    { id:"tb_d3", origin:"Dwarven", name:"Deepmetal Binding",    rating:4, prefix:"Fortified",    stats:{magic:5, defense:2} },
    { id:"tb_o1", origin:"Orcish",  name:"Bone Binding",         rating:2, prefix:"Primal",       stats:{magic:3} },
    { id:"tb_o2", origin:"Orcish",  name:"Sinew Binding",        rating:3, prefix:"Savage",       stats:{magic:4} },
    { id:"tb_a1", origin:"Ancient", name:"Glyph Binding",        rating:3, prefix:"Inscribed",    stats:{magic:6} },
    { id:"tb_a2", origin:"Ancient", name:"Void Binding",         rating:4, prefix:"Eldritch",     stats:{magic:8} },
    { id:"tb_a3", origin:"Ancient", name:"Eternity Binding",     rating:5, prefix:"Timeless",     stats:{magic:10} },
];

const TOME_PAGES = [
    { id:"tp_n1", origin:null,      name:"Parchment Pages",      rating:1, prefix:null,           stats:{magic:1} },
    { id:"tp_n2", origin:null,      name:"Vellum Pages",         rating:2, prefix:null,           stats:{magic:2} },
    { id:"tp_e1", origin:"Elven",   name:"Moonleaf Pages",       rating:2, prefix:null,           stats:{magic:3} },
    { id:"tp_e2", origin:"Elven",   name:"Starscript Pages",     rating:3, prefix:null,           stats:{magic:5} },
    { id:"tp_e3", origin:"Elven",   name:"Celestial Pages",      rating:4, prefix:null,           stats:{magic:7} },
    { id:"tp_d1", origin:"Dwarven", name:"Stone-etched Pages",   rating:2, prefix:null,           stats:{magic:3} },
    { id:"tp_d2", origin:"Dwarven", name:"Runed Tablets",        rating:3, prefix:null,           stats:{magic:5} },
    { id:"tp_d3", origin:"Dwarven", name:"Deepscript Pages",     rating:4, prefix:null,           stats:{magic:7} },
    { id:"tp_o1", origin:"Orcish",  name:"Crude Script",         rating:1, prefix:null,           stats:{magic:2} },
    { id:"tp_o2", origin:"Orcish",  name:"Blood-written Pages",  rating:2, prefix:null,           stats:{magic:4} },
    { id:"tp_a1", origin:"Ancient", name:"Glyph Pages",          rating:3, prefix:null,           stats:{magic:7} },
    { id:"tp_a2", origin:"Ancient", name:"Void Script",          rating:4, prefix:null,           stats:{magic:9} },
    { id:"tp_a3", origin:"Ancient", name:"Eternity Pages",       rating:5, prefix:null,           stats:{magic:12} },
];

const TOME_CLASPS = [
    { id:"tcl_n1", origin:null,      name:"Brass Clasp",          rating:1, prefix:null,           stats:{magic:1} },
    { id:"tcl_n2", origin:null,      name:"Silver Clasp",         rating:2, prefix:null,           stats:{magic:2} },
    { id:"tcl_e1", origin:"Elven",   name:"Moonsilver Clasp",     rating:2, prefix:null,           stats:{magic:2, speed:1} },
    { id:"tcl_e2", origin:"Elven",   name:"Starcrystal Clasp",    rating:3, prefix:null,           stats:{magic:4} },
    { id:"tcl_e3", origin:"Elven",   name:"Celestial Clasp",      rating:4, prefix:null,           stats:{magic:5} },
    { id:"tcl_d1", origin:"Dwarven", name:"Runed Lock",           rating:2, prefix:null,           stats:{magic:2, defense:1} },
    { id:"tcl_d2", origin:"Dwarven", name:"Deepgold Clasp",       rating:3, prefix:null,           stats:{magic:3, defense:2} },
    { id:"tcl_o1", origin:"Orcish",  name:"Bone Clasp",           rating:1, prefix:null,           stats:{magic:2} },
    { id:"tcl_o2", origin:"Orcish",  name:"Fang Clasp",           rating:2, prefix:null,           stats:{magic:3} },
    { id:"tcl_a1", origin:"Ancient", name:"Sigil Clasp",          rating:3, prefix:null,           stats:{magic:5} },
    { id:"tcl_a2", origin:"Ancient", name:"Void Lock",            rating:4, prefix:null,           stats:{magic:7} },
    { id:"tcl_a3", origin:"Ancient", name:"Eternity Clasp",       rating:5, prefix:null,           stats:{magic:9} },
];

// ── Spear ─────────────────────────────────────────────────────────────────────

const SPEAR_TIPS = [
    { id:"spt_e1", origin:"Elven",   name:"Moonsilver Tip",       rating:2, stats:{attack:7,  speed:2} },
    { id:"spt_e2", origin:"Elven",   name:"Starforged Tip",       rating:3, stats:{attack:10, speed:2, magic:1} },
    { id:"spt_e3", origin:"Elven",   name:"Celestial Tip",        rating:4, stats:{attack:13, speed:2, magic:2} },
    { id:"spt_e4", origin:"Elven",   name:"Dawnpiercer Tip",      rating:5, stats:{attack:16, speed:3, magic:3} },
    { id:"spt_d1", origin:"Dwarven", name:"Steel Spearhead",      rating:1, stats:{attack:6,  defense:1} },
    { id:"spt_d2", origin:"Dwarven", name:"Runed Spearhead",      rating:2, stats:{attack:9,  defense:2} },
    { id:"spt_d3", origin:"Dwarven", name:"Deepsteel Head",       rating:3, stats:{attack:12, defense:2} },
    { id:"spt_d4", origin:"Dwarven", name:"Ancestor Spearhead",   rating:4, stats:{attack:15, defense:3} },
    { id:"spt_d5", origin:"Dwarven", name:"Titan Spearhead",      rating:5, stats:{attack:19, defense:4} },
    { id:"spt_o1", origin:"Orcish",  name:"Bone Tip",             rating:1, stats:{attack:6} },
    { id:"spt_o2", origin:"Orcish",  name:"Jagged Tip",           rating:2, stats:{attack:9} },
    { id:"spt_o3", origin:"Orcish",  name:"Warspear Tip",         rating:3, stats:{attack:13} },
    { id:"spt_o4", origin:"Orcish",  name:"Warlord's Tip",        rating:4, stats:{attack:17, speed:-1} },
    { id:"spt_a1", origin:"Ancient", name:"Glyph Tip",            rating:3, stats:{attack:10, magic:3} },
    { id:"spt_a2", origin:"Ancient", name:"Void Tip",             rating:4, stats:{attack:13, magic:5} },
    { id:"spt_a3", origin:"Ancient", name:"Eternity Tip",         rating:5, stats:{attack:16, magic:7} },
];

const SPEAR_SOCKETS = [
    { id:"ss_n1", origin:null,      name:"Iron Socket",          rating:1, prefix:null,           stats:{defense:1} },
    { id:"ss_n2", origin:null,      name:"Bronze Socket",        rating:1, prefix:null,           stats:{} },
    { id:"ss_n3", origin:null,      name:"Steel Socket",         rating:2, prefix:null,           stats:{defense:2} },
    { id:"ss_e1", origin:"Elven",   name:"Moonsilver Socket",    rating:2, prefix:"Swift",        stats:{speed:2} },
    { id:"ss_e2", origin:"Elven",   name:"Starforged Socket",    rating:3, prefix:"Keen",         stats:{speed:2, magic:1} },
    { id:"ss_e3", origin:"Elven",   name:"Celestial Socket",     rating:4, prefix:"Precise",      stats:{speed:3, magic:2} },
    { id:"ss_d1", origin:"Dwarven", name:"Runed Socket",         rating:2, prefix:"Sturdy",       stats:{defense:3} },
    { id:"ss_d2", origin:"Dwarven", name:"Deepmetal Socket",     rating:3, prefix:"Braced",       stats:{defense:4} },
    { id:"ss_d3", origin:"Dwarven", name:"Ancestor Socket",      rating:4, prefix:"Fortified",    stats:{defense:5} },
    { id:"ss_o1", origin:"Orcish",  name:"Bone Socket",          rating:2, prefix:"Brutal",       stats:{attack:1} },
    { id:"ss_o2", origin:"Orcish",  name:"War Socket",           rating:3, prefix:"Fierce",       stats:{attack:2} },
    { id:"ss_a1", origin:"Ancient", name:"Glyph Socket",         rating:3, prefix:"Inscribed",    stats:{magic:2, defense:1} },
    { id:"ss_a2", origin:"Ancient", name:"Void Socket",          rating:4, prefix:"Eldritch",     stats:{magic:4} },
];

const SPEAR_BUTTS = [
    { id:"spb_n1", origin:null,      name:"Iron Butt Cap",        rating:1, prefix:null,           stats:{} },
    { id:"spb_n2", origin:null,      name:"Bronze Butt Cap",      rating:1, prefix:null,           stats:{defense:1} },
    { id:"spb_n3", origin:null,      name:"Weighted End",         rating:2, prefix:null,           stats:{attack:1} },
    { id:"spb_e1", origin:"Elven",   name:"Moonsilver End",       rating:2, prefix:null,           stats:{magic:1, speed:1} },
    { id:"spb_e2", origin:"Elven",   name:"Starcrystal End",      rating:3, prefix:null,           stats:{magic:2, speed:1} },
    { id:"spb_e3", origin:"Elven",   name:"Celestial End",        rating:4, prefix:null,           stats:{magic:3, speed:2} },
    { id:"spb_d1", origin:"Dwarven", name:"Granite End",          rating:2, prefix:null,           stats:{defense:2} },
    { id:"spb_d2", origin:"Dwarven", name:"Runed End",            rating:3, prefix:null,           stats:{attack:1, defense:2} },
    { id:"spb_d3", origin:"Dwarven", name:"Deepmetal End",        rating:4, prefix:null,           stats:{attack:1, defense:3} },
    { id:"spb_o1", origin:"Orcish",  name:"Skull End",            rating:2, prefix:null,           stats:{attack:2} },
    { id:"spb_o2", origin:"Orcish",  name:"Spiked End",           rating:3, prefix:null,           stats:{attack:3} },
    { id:"spb_a1", origin:"Ancient", name:"Sigil End",            rating:3, prefix:null,           stats:{magic:3} },
    { id:"spb_a2", origin:"Ancient", name:"Void End",             rating:4, prefix:null,           stats:{magic:5} },
];

// ── Shield ────────────────────────────────────────────────────────────────────

const SHIELD_FACES = [
    { id:"sf_e1", origin:"Elven",   name:"Moonsilver Shield",    rating:2, stats:{defense:8,  speed:1} },
    { id:"sf_e2", origin:"Elven",   name:"Starforged Aegis",     rating:3, stats:{defense:11, speed:1} },
    { id:"sf_e3", origin:"Elven",   name:"Celestial Bulwark",    rating:4, stats:{defense:14, speed:1, magic:1} },
    { id:"sf_e4", origin:"Elven",   name:"Aurora Aegis",         rating:5, stats:{defense:17, speed:1, magic:2} },
    { id:"sf_d1", origin:"Dwarven", name:"Iron Shield",          rating:1, stats:{defense:8} },
    { id:"sf_d2", origin:"Dwarven", name:"Runed Kite Shield",    rating:2, stats:{defense:11} },
    { id:"sf_d3", origin:"Dwarven", name:"Deepstone Bulwark",    rating:3, stats:{defense:14} },
    { id:"sf_d4", origin:"Dwarven", name:"Ancestor's Aegis",     rating:4, stats:{defense:17} },
    { id:"sf_d5", origin:"Dwarven", name:"Titan's Bulwark",      rating:5, stats:{defense:21} },
    { id:"sf_o1", origin:"Orcish",  name:"Bone Shield",          rating:1, stats:{defense:7,  attack:1} },
    { id:"sf_o2", origin:"Orcish",  name:"Warplate Shield",      rating:2, stats:{defense:10, attack:1} },
    { id:"sf_o3", origin:"Orcish",  name:"Warchief's Shield",    rating:3, stats:{defense:13, attack:2} },
    { id:"sf_o4", origin:"Orcish",  name:"Rageplate Bulwark",    rating:4, stats:{defense:16, attack:2} },
    { id:"sf_a1", origin:"Ancient", name:"Glyph Shield",         rating:3, stats:{defense:11, magic:2} },
    { id:"sf_a2", origin:"Ancient", name:"Void Aegis",           rating:4, stats:{defense:14, magic:4} },
    { id:"sf_a3", origin:"Ancient", name:"Eternity Bulwark",     rating:5, stats:{defense:18, magic:5} },
];

const SHIELD_RIMS = [
    { id:"sr_n1", origin:null,      name:"Iron Rim",             rating:1, prefix:null,           stats:{defense:1} },
    { id:"sr_n2", origin:null,      name:"Bronze Rim",           rating:1, prefix:null,           stats:{defense:1} },
    { id:"sr_n3", origin:null,      name:"Steel Rim",            rating:2, prefix:null,           stats:{defense:2} },
    { id:"sr_e1", origin:"Elven",   name:"Moonsilver Rim",       rating:2, prefix:"Gilded",       stats:{defense:2, magic:1} },
    { id:"sr_e2", origin:"Elven",   name:"Starforged Rim",       rating:3, prefix:"Shining",      stats:{defense:3, magic:1} },
    { id:"sr_e3", origin:"Elven",   name:"Celestial Rim",        rating:4, prefix:"Radiant",      stats:{defense:4, magic:2} },
    { id:"sr_d1", origin:"Dwarven", name:"Flanged Rim",          rating:2, prefix:"Reinforced",   stats:{defense:4} },
    { id:"sr_d2", origin:"Dwarven", name:"Runed Rim",            rating:3, prefix:"Fortified",    stats:{defense:5} },
    { id:"sr_d3", origin:"Dwarven", name:"Deepsteel Rim",        rating:4, prefix:"Unyielding",   stats:{defense:6} },
    { id:"sr_o1", origin:"Orcish",  name:"Spiked Rim",           rating:2, prefix:"Barbed",       stats:{defense:2, attack:2} },
    { id:"sr_o2", origin:"Orcish",  name:"Bone Rim",             rating:3, prefix:"Brutal",       stats:{defense:3, attack:2} },
    { id:"sr_a1", origin:"Ancient", name:"Glyph Rim",            rating:3, prefix:"Inscribed",    stats:{defense:3, magic:2} },
    { id:"sr_a2", origin:"Ancient", name:"Void Rim",             rating:4, prefix:"Eldritch",     stats:{defense:4, magic:3} },
];

const SHIELD_BOSSES = [
    { id:"sb2_n1", origin:null,      name:"Iron Boss",           rating:1, prefix:null,           stats:{defense:1} },
    { id:"sb2_n2", origin:null,      name:"Bronze Boss",         rating:1, prefix:null,           stats:{defense:1} },
    { id:"sb2_n3", origin:null,      name:"Steel Boss",          rating:2, prefix:null,           stats:{defense:2} },
    { id:"sb2_e1", origin:"Elven",   name:"Mooncrystal Boss",    rating:2, prefix:null,           stats:{defense:2, magic:1} },
    { id:"sb2_e2", origin:"Elven",   name:"Starforged Boss",     rating:3, prefix:null,           stats:{defense:3, magic:2} },
    { id:"sb2_e3", origin:"Elven",   name:"Celestial Orb Boss",  rating:4, prefix:null,           stats:{defense:4, magic:3} },
    { id:"sb2_d1", origin:"Dwarven", name:"Granite Boss",        rating:2, prefix:null,           stats:{defense:3} },
    { id:"sb2_d2", origin:"Dwarven", name:"Deepgem Boss",        rating:3, prefix:null,           stats:{defense:4} },
    { id:"sb2_d3", origin:"Dwarven", name:"Ancestor Boss",       rating:4, prefix:null,           stats:{defense:5} },
    { id:"sb2_d4", origin:"Dwarven", name:"Titan's Boss",        rating:5, prefix:null,           stats:{defense:7} },
    { id:"sb2_o1", origin:"Orcish",  name:"Skull Boss",          rating:2, prefix:null,           stats:{defense:2, attack:1} },
    { id:"sb2_o2", origin:"Orcish",  name:"Warbrand Boss",       rating:3, prefix:null,           stats:{defense:3, attack:2} },
    { id:"sb2_a1", origin:"Ancient", name:"Sigil Boss",          rating:3, prefix:null,           stats:{defense:3, magic:2} },
    { id:"sb2_a2", origin:"Ancient", name:"Void Core",           rating:4, prefix:null,           stats:{defense:4, magic:4} },
    { id:"sb2_a3", origin:"Ancient", name:"Eternity Gem Boss",   rating:5, prefix:null,           stats:{defense:5, magic:5} },
];

// ── Weapon Definitions ────────────────────────────────────────────────────────
// slots[0] is always the primary (locks origin). The rest are weighted.

const WEAPON_DEFINITIONS = {
    dagger: {
        label: "Dagger",
        slots: [
            { key: "blade",      label: "Blade",      pool: DAGGER_BLADES },
            { key: "crossguard", label: "Crossguard", pool: DAGGER_CROSSGUARDS },
            { key: "grip",       label: "Grip",       pool: GRIP_POOL },
            { key: "pommel",     label: "Pommel",     pool: POMMEL_POOL },
        ],
    },
    longsword: {
        label: "Long Sword",
        slots: [
            { key: "blade",  label: "Blade",  pool: LONGSWORD_BLADES },
            { key: "guard",  label: "Guard",  pool: GUARD_POOL },
            { key: "grip",   label: "Grip",   pool: GRIP_POOL },
            { key: "pommel", label: "Pommel", pool: POMMEL_POOL },
        ],
    },
    greatsword: {
        label: "Great Sword",
        slots: [
            { key: "blade",  label: "Blade",  pool: GREATSWORD_BLADES },
            { key: "guard",  label: "Guard",  pool: GUARD_POOL },
            { key: "grip",   label: "Grip",   pool: GRIP_POOL },
            { key: "pommel", label: "Pommel", pool: POMMEL_POOL },
        ],
    },
    shortbow: {
        label: "Short Bow",
        slots: [
            { key: "limb",   label: "Limb",   pool: SHORTBOW_LIMBS },
            { key: "riser",  label: "Riser",  pool: RISER_POOL },
            { key: "string", label: "String", pool: STRING_POOL },
            { key: "grip",   label: "Grip",   pool: GRIP_POOL },
        ],
    },
    bow: {
        label: "Bow",
        slots: [
            { key: "limb",   label: "Limb",   pool: BOW_LIMBS },
            { key: "riser",  label: "Riser",  pool: RISER_POOL },
            { key: "string", label: "String", pool: STRING_POOL },
            { key: "grip",   label: "Grip",   pool: GRIP_POOL },
        ],
    },
    longbow: {
        label: "Long Bow",
        slots: [
            { key: "limb",   label: "Limb",   pool: LONGBOW_LIMBS },
            { key: "riser",  label: "Riser",  pool: RISER_POOL },
            { key: "string", label: "String", pool: STRING_POOL },
            { key: "grip",   label: "Grip",   pool: GRIP_POOL },
        ],
    },
    crossbow: {
        label: "Crossbow",
        slots: [
            { key: "prod",      label: "Prod",      pool: CROSSBOW_PRODS },
            { key: "stock",     label: "Stock",     pool: CROSSBOW_STOCKS },
            { key: "mechanism", label: "Mechanism", pool: CROSSBOW_MECHANISMS },
            { key: "string",    label: "String",    pool: STRING_POOL },
        ],
    },
    wand: {
        label: "Wand",
        slots: [
            { key: "focus", label: "Focus",  pool: WAND_FOCUSES },
            { key: "shaft", label: "Shaft",  pool: SHAFT_POOL },
            { key: "grip",  label: "Grip",   pool: GRIP_POOL },
            { key: "cap",   label: "Cap",    pool: WAND_CAPS },
        ],
    },
    staff: {
        label: "Staff",
        slots: [
            { key: "head",         label: "Head",         pool: STAFF_HEADS },
            { key: "upper_shaft",  label: "Upper Shaft",  pool: SHAFT_POOL },
            { key: "lower_shaft",  label: "Lower Shaft",  pool: SHAFT_POOL },
            { key: "base",         label: "Base",         pool: STAFF_BASES },
        ],
    },
    tome: {
        label: "Tome",
        slots: [
            { key: "cover",   label: "Cover",   pool: TOME_COVERS },
            { key: "binding", label: "Binding", pool: TOME_BINDINGS },
            { key: "pages",   label: "Pages",   pool: TOME_PAGES },
            { key: "clasp",   label: "Clasp",   pool: TOME_CLASPS },
        ],
    },
    spear: {
        label: "Spear",
        slots: [
            { key: "tip",    label: "Tip",     pool: SPEAR_TIPS },
            { key: "socket", label: "Socket",  pool: SPEAR_SOCKETS },
            { key: "shaft",  label: "Shaft",   pool: SHAFT_POOL },
            { key: "butt",   label: "Butt Cap",pool: SPEAR_BUTTS },
        ],
    },
    shield: {
        label: "Shield",
        slots: [
            { key: "face", label: "Face", pool: SHIELD_FACES },
            { key: "rim",  label: "Rim",  pool: SHIELD_RIMS },
            { key: "boss", label: "Boss", pool: SHIELD_BOSSES },
            { key: "grip", label: "Grip", pool: GRIP_POOL },
        ],
    },
};

export const WEAPON_TYPES = Object.entries(WEAPON_DEFINITIONS).map(([id, def]) => ({ id, label: def.label }));

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
    const weighted = pool.map(part => {
        const isCross = part.origin !== null && part.origin !== lockedOrigin;
        if (isCross && !allowCrossOrigin) return { item: part, weight: 0 };
        const originWeight = part.origin === null ? 30 : isCross ? 10 : 60;
        const ratingWeight = RATING_PROXIMITY_WEIGHTS[Math.abs(part.rating - primaryRating)] ?? 1;
        return { item: part, weight: originWeight * ratingWeight };
    });
    return weightedRandom(weighted);
}

function calcRarity(primaryRating) {
    return RARITY_BY_RATING[primaryRating] ?? "legendary";
}

function buildName(primaryPart, otherParts) {
    const prefix = [...otherParts]
        .filter(p => p.prefix)
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

function resolveOrigin(parts) {
    const counts = {};
    for (const part of parts) {
        if (part.origin) counts[part.origin] = (counts[part.origin] ?? 0) + 1;
    }
    if (Object.keys(counts).length === 0) return "Neutral";
    const [dominant, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return count >= 3 ? dominant : `Mixed (${dominant})`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateWeapon(type) {
    const def = WEAPON_DEFINITIONS[type];
    if (!def) throw new Error(`Unknown weapon type: ${type}`);

    const [primarySlot, ...secondarySlots] = def.slots;
    const primaryPart = weightedRandom(
        primarySlot.pool.map(part => ({ item: part, weight: PRIMARY_RARITY_WEIGHTS[part.rating - 1] ?? 1 }))
    );
    const lockedOrigin = primaryPart.origin;

    const parts = { [primarySlot.key]: primaryPart };
    const secondaryParts = [];
    let hasCrossOriginPart = false;
    for (const slot of secondarySlots) {
        const part = pickPart(slot.pool, lockedOrigin, primaryPart.rating, !hasCrossOriginPart);
        if (part.origin !== null && part.origin !== lockedOrigin) hasCrossOriginPart = true;
        parts[slot.key] = part;
        secondaryParts.push(part);
    }

    const allParts = [primaryPart, ...secondaryParts];
    const totalRating = allParts.reduce((sum, p) => sum + p.rating, 0);

    return {
        type,
        typeLabel: def.label,
        name:        buildName(primaryPart, secondaryParts),
        origin:      resolveOrigin(allParts),
        rarity:      calcRarity(primaryPart.rating),
        totalRating,
        stats:       mergeStats(...allParts),
        slots:       def.slots.map(s => ({ key: s.key, label: s.label })),
        parts,
    };
}

export const generateSword = () => generateWeapon("longsword");
