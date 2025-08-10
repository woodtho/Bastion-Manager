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

export const HIRELING_NAMES = [
  ["Aelar",0.05],["Borin",0.04],["Cassandra",0.05],["Dorin",0.03],["Elaith",0.04],["Faelar",0.04],
  ["Glim",0.03],["Hilde",0.03],["Ilyana",0.04],["Jorin",0.05],["Kethra",0.05],["Loram",0.03],
  ["Mara",0.04],["Nym",0.04],["Oskar",0.03],["Perrin",0.04],["Quinn",0.03],["Ragnar",0.03],
  ["Seraphina",0.05],["Thorin",0.04],["Ulric",0.04],["Valanthe",0.03],["Wren",0.04],["Xander",0.03],
  ["Yara",0.05],["Zorin",0.04]
];

export const HIRELING_SPECIES = [
  ["Human",0.15],["Elf",0.12],["Dwarf",0.10],["Halfling",0.08],["Gnome",0.08],["Half-Elf",0.09],
  ["Half-Orc",0.07],["Tiefling",0.05],["Dragonborn",0.06],["Goliath",0.04],["Aasimar",0.05],
  ["Kenku",0.03],["Tabaxi",0.02],["Firbolg",0.03],["Triton",0.02]
];

export const BASIC_FACILITIES = [
  { name: "Bedroom",     default_space: "Cramped", desc: "Personal quarters for rest and privacy." },
  { name: "Dining Room", default_space: "Roomy",   desc: "Common space for meals and gatherings." },
  { name: "Parlor",      default_space: "Cramped", desc: "Comfortable space for informal meetings." },
  { name: "Courtyard",   default_space: "Vast",    desc: "Open outdoor space within the Bastion." },
  { name: "Kitchen",     default_space: "Roomy",   desc: "Meal preparation with implements and storage." },
  { name: "Storage",     default_space: "Roomy",   desc: "Secure area for supplies, tools, and goods." }
];

export const SPECIAL_FACILITIES = [
  ["Arcane Study",5,"Arcane Focus or tool as Spellcasting Focus","Roomy",1,["Craft","Research"]],
  ["Armory",5,"None","Roomy",1,["Trade"]],
  ["Barrack",5,"None","Roomy",1,["Recruit"]],
  ["Garden",5,"None","Roomy",1,["Harvest"]],
  ["Library",5,"None","Roomy",1,["Research"]],
  ["Workshop",5,"None","Roomy",3,["Craft"]],
  ["Sanctuary",5,"Holy Symbol or Druidic Focus","Roomy",1,["Craft","Empower"]],
  ["Storehouse",5,"None","Roomy",1,["Trade"]],
  ["Smithy",5,"None","Roomy",2,["Craft"]],
  ["Greenhouse",9,"None","Roomy",1,["Harvest"]],
  ["Laboratory",9,"None","Roomy",1,["Craft"]],
  ["Sacristy",9,"Holy Symbol or Druidic Focus","Roomy",1,["Craft","Harvest"]],
  ["Scriptorium",9,"None","Roomy",1,["Craft","Research"]],
  ["Stable",9,"None","Roomy",1,["Trade","Recruit"]],
  ["Training Area",9,"None","Vast",4,["Empower"]],
  ["Trophy Room",9,"None","Roomy",1,["Research"]],
  ["Archive",13,"None","Roomy",1,["Research"]],
  ["Meditation Chamber",13,"None","Cramped",1,["Empower"]],
  ["Menagerie",13,"None","Vast",2,["Recruit","Harvest"]],
  ["Observatory",13,"Spellcasting Focus","Roomy",1,["Empower","Research"]],
  ["Reliquary",13,"Holy Symbol or Druidic Focus","Cramped",1,["Harvest","Research"]],
  ["Sanctum",17,"Holy Symbol or Druidic Focus","Roomy",4,["Empower"]],
  ["Demiplane",17,"Arcane Focus or tool as Spellcasting Focus","Vast",1,["Empower","Research"]],
  ["Guildhall",17,"Expertise in a skill","Vast",1,["Recruit","Trade"]],
  ["War Room",17,"Fighting Style or Unarmored Defense","Vast",2,["Recruit","Research"]]
].map(([name,min_level,prereq,space,hirelings,orders]) => ({
  name, min_level, prereq, space, hirelings, orders
}));
