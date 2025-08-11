// Facility space categories; max_tiles used for schematic floorplan
export const FACILITY_SPACE = [
  { space: "Cramped", max_tiles: 4, add_cost_gp: 500, enlarge_cost_gp: 250, build_days: 10 },
  { space: "Roomy",   max_tiles: 9, add_cost_gp: 1000, enlarge_cost_gp: 500, build_days: 20 },
  { space: "Vast",    max_tiles: 25, add_cost_gp: 3000, enlarge_cost_gp: 1500, build_days: 40 }
];

export const SPECIAL_BY_LEVEL = [
  { min_level: 5,  max_special: 2 },
  { min_level: 9,  max_special: 4 },
  { min_level: 13, max_special: 5 },
  { min_level: 17, max_special: 6 }
];

export const VALID_ORDERS = ["Craft","Empower","Harvest","Recruit","Research","Trade","None"];
export const ENCLOSURE_THRESHOLD_DEFAULT = 40; // sections needed to consider the Bastion enclosed
// Expanded to ~2× entries. Names now 52; species covers major 5e-playable races.
// Weights are relative (need not sum to 1).

export const HIRELING_NAMES = [
  ["Aelar",0.05],["Borin",0.04],["Cassandra",0.05],["Dorin",0.03],["Elaith",0.04],["Faelar",0.04],
  ["Glim",0.03],["Hilde",0.03],["Ilyana",0.04],["Jorin",0.05],["Kethra",0.05],["Loram",0.03],
  ["Mara",0.04],["Nym",0.04],["Oskar",0.03],["Perrin",0.04],["Quinn",0.03],["Ragnar",0.03],
  ["Seraphina",0.05],["Thorin",0.04],["Ulric",0.04],["Valanthe",0.03],["Wren",0.04],["Xander",0.03],
  ["Yara",0.05],["Zorin",0.04],
  ["Alaric",0.04],["Brina",0.03],["Caelum",0.03],["Daria",0.04],["Edrin",0.03],["Fenra",0.03],
  ["Garrick",0.04],["Helga",0.03],["Isolde",0.04],["Jax",0.03],["Kael",0.04],["Liora",0.04],
  ["Maelis",0.03],["Neris",0.03],["Orrin",0.03],["Petra",0.04],["Riven",0.03],["Sorin",0.04],
  ["Tamsin",0.03],["Ulfgar",0.03],["Vesper",0.03],["Wynne",0.03],["Xara",0.03],["Ysra",0.03],
  ["Zephyr",0.03],["Thalia",0.04],
  ["Arielle",0.04],["Bastian",0.03],["Corin",0.03],["Delara",0.04],["Elrik",0.03],["Fiora",0.03],
  ["Galen",0.04],["Hester",0.03],["Isarn",0.04],["Jorah",0.03],["Kieran",0.04],["Lunara",0.04],
  ["Marek",0.03],["Nyssa",0.03],["Oberon",0.03],["Phaedra",0.04],["Quillon",0.03],["Rhoswen",0.04],
  ["Sylas",0.03],["Torin",0.03],["Urien",0.03],["Valken",0.03],["Willow",0.03],["Xyra",0.03],
  ["Yorick",0.03],["Zayra",0.03],
  ["Aedric",0.03],["Brynn",0.03],["Cassian",0.03],["Daelia",0.04],["Emric",0.03],["Fendrel",0.03],
  ["Gracen",0.03],["Hadric",0.03],["Ilara",0.03],["Jaspar",0.03],["Kallista",0.03],["Lucien",0.03],
  ["Marwen",0.03],["Niall",0.03],["Orla",0.03],["Phineas",0.03],["Quen",0.03],["Ravena",0.03],
  ["Selric",0.03],["Tavian",0.03],["Umara",0.03],["Virel",0.03],["Wystan",0.03],["Xavian",0.03],
  ["Ysolde",0.03],["Zorion",0.03]
];


// Broad coverage of 5e playable races/subraces across PHB, supplements, Eberron, Ravnica, Theros,
// Strixhaven, Witchlight, Mordenkainen Presents, and Spelljammer. Adjust mix as desired.
export const HIRELING_SPECIES = [
  ["Human",0.14],["Elf",0.08],["Dwarf",0.07],["Halfling",0.05],["Gnome",0.05],
  ["Half-Elf",0.07],["Half-Orc",0.05],["Tiefling",0.05],["Dragonborn",0.05],
  ["Aasimar",0.03],["Goliath",0.025],["Tabaxi",0.02],["Kenku",0.02],["Firbolg",0.02],
  ["Triton",0.02],["Lizardfolk",0.02],["Tortle",0.015],["Goblin",0.02],["Hobgoblin",0.015],
  ["Bugbear",0.015],["Kobold",0.02],["Yuan-ti Pureblood",0.01],["Aarakocra",0.015],
  ["Genasi (Air)",0.01],["Genasi (Earth)",0.01],["Genasi (Fire)",0.01],["Genasi (Water)",0.01],
  ["Githyanki",0.01],["Githzerai",0.01],
  ["Warforged",0.015],["Kalashtar",0.01],["Shifter",0.012],["Changeling",0.012],
  ["Leonin",0.01],["Satyr",0.012],["Minotaur",0.01],["Centaur",0.01],
  ["Loxodon",0.01],["Vedalken",0.01],["Simic Hybrid",0.01],
  ["Owlin",0.01],["Harengon",0.012],["Fairy",0.012],
  ["Autognome",0.008],["Giff",0.008],["Hadozee",0.008],["Plasmoid",0.008],["Thri-kreen",0.008],
  // Elf lineages (often folded into Elf; kept here for flavor variety)
  ["Eladrin",0.01],["Sea Elf",0.01],["Shadar-kai",0.01]
];

// (Optional) If you also want BASIC_FACILITIES roughly doubled, append neutral, non-special basics:
export const BASIC_FACILITIES = [
  { name: "Bedroom",     default_space: "Cramped", desc: "Personal quarters for rest and privacy." },
  { name: "Dining Room", default_space: "Roomy",   desc: "Common space for meals and gatherings." },
  { name: "Parlor",      default_space: "Cramped", desc: "Comfortable space for informal meetings." },
  { name: "Courtyard",   default_space: "Vast",    desc: "Open outdoor space within the Bastion." },
  { name: "Kitchen",     default_space: "Roomy",   desc: "Meal preparation with implements and storage." },
  { name: "Storage",     default_space: "Roomy",   desc: "Secure area for supplies, tools, and goods." },
  // Added (6 more basics; purely cosmetic/utility so they won’t collide with your specials logic)
  { name: "Guest Room",  default_space: "Cramped", desc: "Simple quarters for visitors." },
  { name: "Study Nook",  default_space: "Cramped", desc: "Quiet alcove for reading and notes." },
  { name: "Bathhouse",   default_space: "Roomy",   desc: "Heated baths and steam for relaxation." },
  { name: "Cellar",      default_space: "Roomy",   desc: "Cool underground space for casks and stores." },
  { name: "Larder",      default_space: "Roomy",   desc: "Pantry with preserved food and ingredients." },
  { name: "Common Room", default_space: "Vast",    desc: "Large gathering hall for residents and guests." }
];

export const SPECIAL_FACILITIES = [
  // Level 5
  ["Arcane Study",5,"Arcane Focus or tool as Spellcasting Focus","Roomy",1,["Craft","Research"]],
  ["Armory",5,"None","Roomy",1,["Trade"]],
  ["Aviary",5,"None","Cramped",1,["Recruit"]],
  ["Barrack",5,"None","Roomy",1,["Recruit"]],
  ["Garden",5,"None","Roomy",1,["Harvest"]],
  ["Library",5,"None","Roomy",1,["Research"]],
  ["Portentorium",5,"None","Roomy",1,["Empower"]],
  ["Sanctuary",5,"Holy Symbol or Druidic Focus","Roomy",1,["Craft","Empower"]],
  ["Storehouse",5,"None","Roomy",1,["Trade"]],
  ["Trapworks",5,"Proficiency with Thieves’ Tools or Sleight of Hand","Roomy",1,["Craft"]],
  ["Workshop",5,"None","Roomy",3,["Craft"]],

  // Level 9
  ["Greenhouse",9,"None","Roomy",1,["Harvest"]],
  ["Inn",9,"None","Vast",2,["Empower"]],
  ["Laboratory",9,"None","Roomy",1,["Craft"]],
  ["Prison",9,"None","Roomy",1,["Research"]],
  ["Sacristy",9,"Holy Symbol or Druidic Focus","Roomy",1,["Craft","Harvest"]],
  ["Scriptorium",9,"None","Roomy",1,["Craft","Research"]],
  ["Stable",9,"None","Roomy",1,["Trade","Recruit"]],
  ["Training Area",9,"None","Vast",4,["Empower"]],
  ["Trophy Room",9,"None","Roomy",1,["Research"]],
  ["Warlord’s Honor Hall",9,"Access to Weapon Mastery for two or more weapons","Roomy",1,["Empower"]],

  // Level 13
  ["Archive",13,"None","Roomy",1,["Research"]],
  ["Dungeon",13,"None","Roomy",1,["Trade"]],
  ["Meditation Chamber",13,"None","Cramped",1,["Empower"]],
  ["Menagerie",13,"None","Vast",2,["Recruit","Harvest"]],
  ["Mobile Bastion Engine",13,"None","Roomy",2,["Move"]],
  ["Observatory",13,"Spellcasting Focus","Roomy",1,["Empower","Research"]],
  ["Reliquary",13,"Holy Symbol or Druidic Focus","Cramped",1,["Harvest","Research"]],
  ["Scrying Chamber",13,"Spellcasting Focus (Arcane/Druidic/Holy Symbol)","Roomy",1,["Research"]],
  ["Temple",13,"None","Roomy",1,["Recruit"]],

  // Level 17
  ["Sanctum",17,"Holy Symbol or Druidic Focus","Roomy",4,["Empower"]],
  ["Demiplane",17,"Arcane Focus or tool as Spellcasting Focus","Vast",1,["Empower","Research"]],
  ["Guildhall",17,"Expertise in a skill","Vast",1,["Recruit","Trade"]],
  ["War Room",17,"Fighting Style or Unarmored Defense","Vast",2,["Recruit","Research"]]
].map(([name,min_level,prereq,space,hirelings,orders]) => ({
  name, min_level, prereq, space, hirelings, orders
}));

export const BASTION_DESCRIPTIONS = [
  /* 1 */ "Crumbling Watchtower — A crumbling watchtower atop a windswept cliff. Its winding staircase creaks ominously in the seaborne winds.",
  /* 2 */ "Converted Windmill — Found in a quiet valley, its sails long since broken. A family of ravens roosts in the rafters.",
  /* 3 */ "Submerged Lighthouse — Partially sunk in a swamp, its beacon now fueled by bioluminescent moss.",
  /* 4 */ "Mushroom Trunk Cottage — A deserted cottage built into a colossal mushroom trunk. Faint glowing spores illuminate the interior at dusk.",
  /* 5 */ "Roadside Inn — A once-thriving rest stop now deserted. Collapsed stables and a squeaky signboard hint at past revelries. The floor still bears scuff marks from countless dances.",
  // ...continue entries 6..100 exactly from your D100 list...
];

export const BASTION_QUIRKS = [
  /* 1 */ "The shadows in this place move slightly at all times, as if cast by a flickering unseen light.",
  /* 2 */ "Chairs, tables, and shelves occasionally shuffle a few inches on their own.",
  /* 3 */ "Footsteps or spoken words echo longer than normal, giving an impression of grandeur even in smaller chambers.",
  /* 4 */ "Tiny glowing mushrooms or vines grow on walls, casting a soft, eerie glow.",
  /* 5 */ "An unseen force tidies the space at night, stacking objects neatly or sweeping floors.",
  // ...continue entries 6..100 exactly from your D100 quirk list...
];

