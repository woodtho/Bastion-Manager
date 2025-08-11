import { FACILITY_SPACE, SPECIAL_BY_LEVEL, HIRELING_NAMES, HIRELING_SPECIES, VALID_ORDERS, SPECIAL_FACILITIES, ENCLOSURE_THRESHOLD_DEFAULT } from "./constants.js";

// Helper: assert-style guards for runtime validation
export const assert = (cond, msg) => { if (!cond) throw new Error(msg); };            // fail fast on invalid state
export const choice = (v, arr, msg) => { assert(arr.includes(v), msg || "Invalid choice"); return v; };

export const spaceInfo = (space) => {
  const row = FACILITY_SPACE.find(s => s.space === space);                            // lookup space row
  assert(row, "Unknown space");
  return row;
};

export const maxSpecialForLevel = (lvl) => {
  assert(Number.isInteger(lvl) && lvl >= 1 && lvl <= 20, "Level must be 1..20");      // validate level range
  const elig = SPECIAL_BY_LEVEL.filter(x => x.min_level <= lvl);                      // eligible rows
  if (elig.length === 0) return 0;                                                    // below level 5
  return Math.max(...elig.map(x => x.max_special));                                   // highest cap
};

const wsample = (pairs) => {
  // pairs: [[value, weight], ...]; returns one value using weighted random selection
  const total = pairs.reduce((s, [,w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [val, w] of pairs) { r -= w; if (r <= 0) return val; }
  return pairs[pairs.length - 1][0];                                                  // fallback due to FP rounding
};

// Internal: attach next ID
const nextHirelingId = (st) => st.hireling_seq || 1;
const bumpHirelingSeq = (st, used = 1) => ({ ...st, hireling_seq: (st.hireling_seq || 1) + used });

// Auto-generate N hirelings for a facility; returns updated state
export const hireAuto = (st, facName, n) => {
  assert(Number.isInteger(n) && n >= 1, "n must be >= 1");
  let s = { ...st };
  const rows = [];
  for (let i = 0; i < n; i++) {
    const id = nextHirelingId(s);
    rows.push({
      id,
      name: wsample(HIRELING_NAMES),
      species: wsample(HIRELING_SPECIES),
      role: `Hireling (${facName})`,
      facility: facName
    });
    s = bumpHirelingSeq(s);
  }
 // append hires
  s = { ...s, hirelings: [...s.hirelings, ...rows] };                   // add new rows
  // if facility has any hirelings now, force it Operational immediately
  const nowHasStaff = s.hirelings.some(h => h.facility === facName);     // check staffing
  if (nowHasStaff) {
    s = {                                                                
      ...s, 
      specials: s.specials.map(f => 
        f.name === facName ? { ...f, status: "Operational", shutdown_until: 0 } : f  // clear shutdown
      )
    };
  }
  return s;
};

// Manual hire: user provides name/species/facility
export const hireManual = (st, facName, name, species) => {
  assert(typeof facName === "string" && facName.length > 0, "facility required");
  assert(typeof name === "string" && name.length > 0, "name required");
  assert(typeof species === "string" && species.length > 0, "species required");
  const id = nextHirelingId(st);
  const row = { id, name, species, role: `Hireling (${facName})`, facility: facName };
  // add the hire and bump id
  let s = bumpHirelingSeq({ ...st, hirelings: [...st.hirelings, row] }); // commit hire
  // if the target facility was shut down, restore it now that it has staff
  const nowHasStaff = s.hirelings.some(h => h.facility === facName);     // verify staffing
  if (nowHasStaff) {
    s = { 
      ...s, 
      specials: s.specials.map(f => 
        f.name === facName ? { ...f, status: "Operational", shutdown_until: 0 } : f  // immediate restore
      )
    };
  }
  return s;
};

// Fire by IDs
export const fireHirelings = (st, ids) => {
  const set = new Set(ids || []);
  return { ...st, hirelings: st.hirelings.filter(h => !set.has(h.id)) };
};

export const roll = (n, sides=6) => {
  assert(Number.isInteger(n) && n >= 0, "n must be >=0");                             // non-negative dice
  assert(Number.isInteger(sides) && sides >= 2, "sides must be >=2");                 // validate sides
  const r = [];
  for (let i=0;i<n;i++) r.push(1 + Math.floor(Math.random()*sides));                  // uniform 1..sides
  return r;
};

export const tickDown = (x) => Math.max((x ?? 0) - 1, 0);                             // non-negative countdown

export const newState = () => ({
  profile_id: "default",                                                    // user-scoped save slot
  character: { name: "Unnamed Hero", level: 5 },
  bastion:   { name: "Unnamed Bastion", gold: 1000, current_turn: 1 },
  basics:    [],                                                                      // {id,name,space,tiles}
  specials:  [],                                                                      // {id,name,space,hirelings,status,shutdown_until}
  hirelings: [], 
  hireling_seq: 1,                                                                      // {name,species,role,facility}
  defenders: 0,
  walls:     [],                                                                      // {queue_id,sections,gp_cost,days_left}
  built_walls: 0,                                                                      // cumulative completed wall sections
  enclosure_threshold: ENCLOSURE_THRESHOLD_DEFAULT, // user-configurable threshold for “enclosed”
  armory_stocked: false,
  events: [],                                                                         // {Turn, Event}
  order_history: [],                                                                  // {Turn, Log[]}
  _events_last_turn: 0,                                                               // internal flag to block orders after Maintain
  _floorplan: [],      
  _floorplan_rooms: [],                                                               // [{label,x,y,w,h}]
  _floorplan_paths: [],     
  _floorplan_walls: [] ,                                                               // [{x,y}]                                                  // cached schematic tiles
  timeline: [],  
  description: "", 
  quirk: ""
});

// Derived helper: returns true if enough wall sections are built to enclose the Bastion
export const hasWalls = (st) => (st.built_walls || 0) >= (st.enclosure_threshold || ENCLOSURE_THRESHOLD_DEFAULT);

// Find special facility def
export const getSpecialDef = (name) => SPECIAL_FACILITIES.find(f => f.name === name);

// Add a BASIC facility with cost and tiles set by space
export const addBasicFacility = (st, facName, space) => {
  choice(facName, BASIC_NAMES, "Unknown basic facility");                             // validate basic name
  choice(space, FACILITY_SPACE.map(s => s.space), "Invalid space");                   // validate space
  const info = spaceInfo(space);                                                      // space params
  assert(st.bastion.gold >= info.add_cost_gp, "Insufficient gold for basic facility"); // enforce budget
  const idNum = st.basics.length + 1;
  const newRow = { id: `B${String(idNum).padStart(3,"0")}`, name: facName, space, tiles: info.max_tiles };
  return {
    ...st,
    basics: [...st.basics, newRow],                                                   // append basic
    bastion: { ...st.bastion, gold: st.bastion.gold - info.add_cost_gp }              // pay cost
  };
};

// Add a SPECIAL facility by level (no gold cost)
export const addSpecialFacility = (st, facName) => {
  const fac = getSpecialDef(facName);
  assert(!!fac, "Unknown special facility");                                          // ensure exists
  assert(st.character.level >= fac.min_level, "Level requirement not met");           // check level
  const allowed = maxSpecialForLevel(st.character.level);                             // cap
  assert(st.specials.length < allowed, "Special facility limit reached for level");   // enforce cap
  const idNum = st.specials.length + 1;
  const row = { id:`S${String(idNum).padStart(3,"0")}`, name: fac.name, space: fac.space, hirelings: fac.hirelings, status:"Operational", shutdown_until:0 };
  let s = { ...st, specials: [...st.specials, row] };
  s = hireAuto(s, fac.name, fac.hirelings); // seed initial staff with IDs
  return s;
};

// Execute a per-facility order
export const execOrder = (st, facId, order) => {
  choice(order, VALID_ORDERS, "Invalid order");                                       // validate order symbolically
  const row = st.specials.find(s => s.id === facId);                                   // find target facility
  if (!row) return { state: st, msg: "Invalid facility." };                            // guard
  if (row.status !== "Operational") return { state: st, msg: `${row.name} is not operational this turn.` };
  const def = getSpecialDef(row.name);
  if (!def.orders.includes(order)) return { state: st, msg: `Invalid order for ${row.name}` }; // per-facility validity

  let s = { ...st };                                                                   // local working copy
  let msg = "No effect.";

  if (row.name === "Barrack" && order === "Recruit") {
    s = { ...s, defenders: s.defenders + 4 };                                         // add up to 4 defenders
    msg = "Recruited up to 4 Bastion Defenders.";
  } else if (row.name === "Garden" && order === "Harvest") {
    s = { ...s, bastion: { ...s.bastion, gold: s.bastion.gold + 100 } };              // add 100 GP
    msg = "Harvested herbs worth 100 GP.";
  } else if (row.name === "Workshop" && order === "Craft") {
    const cost = 50;
    if (s.bastion.gold >= cost) {
      s = { ...s, bastion: { ...s.bastion, gold: s.bastion.gold - cost } };           // pay cost
      msg = "Crafted a common item at a cost of 50 GP.";
    } else {
      msg = "Insufficient gold to craft.";
    }
  } else if (row.name === "Library" && order === "Research") {
    msg = "Research conducted; advantage on next Bastion research check (narrative).";
  } else if (row.name === "Armory" && order === "Trade") {
    const cost = 100 + s.defenders * 100;
    if (s.bastion.gold >= cost) {
      s = { ...s, bastion: { ...s.bastion, gold: s.bastion.gold - cost }, armory_stocked: true };
      msg = `Armory stocked for ${cost} GP.`;
    } else {
      msg = "Insufficient gold to stock Armory.";
    }
  } else if (row.name === "Sanctuary" && order === "Empower") {
    msg = "Empowerment granted; one ally gains a minor boon until next turn (narrative).";
  }

  return { state: s, msg };
};

// Attack event resolution as specified
export const attackEvent = (st) => {
  const diceBase = 6;
   const diceN = hasWalls(st) ? Math.max(0, diceBase - 2) : diceBase;                // -2 dice if walls enclose
  if (st.defenders > 0) {
    const sides = st.armory_stocked ? 8 : 6;                                          // upgrade to d8 if Armory stocked
    const rolls = roll(diceN, sides);
    const losses = rolls.filter(x => x === 1).length;                                 // each 1 loses 1 defender
    const defenders = Math.max(0, st.defenders - losses);
    return {
      state: { ...st, defenders, armory_stocked: false },                              // consume stock
      log: `Attack repelled. Defender losses: ${losses}.`
    };
  } else {
    const ops = st.specials.filter(s => s.status === "Operational");
    if (ops.length > 0) {
      const victim = ops[Math.floor(Math.random() * ops.length)];                     // choose a victim
      const specials = st.specials.map(s => s.id === victim.id ? { ...s, status: "Shut Down", shutdown_until: st.bastion.current_turn + 1 } : s);
      return { state: { ...st, specials }, log: `Attack damaged ${victim.name}. Shut down for next turn.` };
    }
    return { state: st, log: "Attack occurred, but no special facilities to damage." };
  }
};

export const criminalHirelingEvent = (st) => {
  if (st.hirelings.length === 0) return { state: st, log: "No hirelings to be implicated." };
  const target = st.hirelings[Math.floor(Math.random() * st.hirelings.length)];
  const bribe = 100 * roll(1)[0];                                                     // 1d6 × 100 GP
  if (st.bastion.gold >= bribe) {
    return { state: { ...st, bastion: { ...st.bastion, gold: st.bastion.gold - bribe } }, log: `Criminal past revealed (${target.name}). Bribe paid: ${bribe} GP.` };
  } else {
    const remaining = st.hirelings.filter(h => h.facility === target.facility && h.name !== target.name).length;
    let s = { ...st, hirelings: st.hirelings.filter(h => h.name !== target.name) };   // remove hireling
    if (remaining === 0) {
      s = { ...s, specials: s.specials.map(f => f.name === target.facility ? { ...f, status:"Shut Down", shutdown_until: s.bastion.current_turn + 1 } : f) };
      return { state: s, log: `${target.name} arrested; ${target.facility} shut down for next turn.` };
    }
    return { state: s, log: `${target.name} arrested.` };
  }
};

export const extraordinaryOpportunityEvent = (st) => {
  if (st.bastion.gold >= 500) {
    const s = { ...st, bastion: { ...st.bastion, gold: st.bastion.gold - 500 } };     // pay 500 GP
    return { state: s, log: "Extraordinary Opportunity seized (500 GP). Rolling an additional event.", bonus_roll: true };
  }
  return { state: st, log: "Declined Extraordinary Opportunity (insufficient gold).", bonus_roll: false };
};

export const friendlyVisitorsEvent = (st) => {
  if (st.specials.length === 0) return { state: st, log: "Visitors arrived but no special facility to use." };
  const fac = st.specials[Math.floor(Math.random() * st.specials.length)].name;
  const reward = 100 * roll(1)[0];
  return { state: { ...st, bastion: { ...st.bastion, gold: st.bastion.gold + reward } }, log: `Friendly Visitors used ${fac}; earned ${reward} GP.` };
};

export const lostHirelingsEvent = (st) => {
  if (st.specials.length === 0) return { state: st, log: "No special facilities affected." };
  const fac = st.specials[Math.floor(Math.random() * st.specials.length)].name;
  const s = {
    ...st,
    hirelings: st.hirelings.filter(h => h.facility !== fac),
    specials: st.specials.map(f => f.name === fac ? { ...f, status:"Shut Down", shutdown_until: st.bastion.current_turn + 1 } : f)
  };
  return { state: s, log: `Lost hirelings from ${fac}. Facility shut down for next turn.` };
};

export const magicalDiscoveryEvent = (st) => {
  const item = Math.random() < 0.5 ? "Potion of Healing (Uncommon variant)" : "Spell Scroll (Uncommon)";
  return { state: st, log: `Magical Discovery: ${item} found and stored.` };
};

export const refugeesEvent = (st) => {
  const n = roll(2).reduce((a,b) => a + b, 0);                                        // 2d6 (used in original as 2d4; adjust if needed)
  const reward = 100 * roll(1)[0];
  return { state: { ...st, bastion: { ...st.bastion, gold: st.bastion.gold + reward } }, log: `${n} refugees sheltered; received ${reward} GP.` };
};

export const requestForAidEvent = (st) => {
  const sent = Math.min(st.defenders, Math.max(1, Math.floor(st.defenders / 2)));     // dispatch at least 1, up to half
  if (sent <= 0) return { state: st, log: "Request for Aid: no defenders available to dispatch." };
  const diceTotal = roll(sent).reduce((a,b) => a + b, 0);                              // total of 1d6 per defender
  const reward = 100 * roll(1)[0];
  if (diceTotal >= 10) {
    return { state: { ...st, bastion: { ...st.bastion, gold: st.bastion.gold + reward } }, log: `Aid successful. Reward ${reward} GP. No losses.` };
  }
  return { state: { ...st, bastion: { ...st.bastion, gold: st.bastion.gold + Math.floor(reward/2) }, defenders: Math.max(0, st.defenders - 1) }, log: `Aid marginally successful. Reward ${Math.floor(reward/2)} GP. One defender lost.` };
};

export const treasureEvent = (st) => {
  const tier = wsample([["Art Object (250 GP)",1],["Art Object (750 GP)",1],["Magic Item (table roll)",1]]);
  return { state: st, log: `Treasure acquired: ${tier}.` };
};

export const allIsWellEvent = (st) => ({ state: st, log: "All Is Well." });

// Event resolver (single pull) with bonus-roll chaining for Extraordinary Opportunity
export const resolveEvent = (st) => {
  const d = roll(1, 100)[0];                                                          // 1d100 roll
  const label =
    (d <= 50) ? "All Is Well" :
    (d <= 55) ? "Attack" :
    (d <= 58) ? "Criminal Hireling" :
    (d <= 63) ? "Extraordinary Opportunity" :
    (d <= 70) ? "Friendly Visitors" :
    (d <= 75) ? "Lost Hirelings" :
    (d <= 80) ? "Magical Discovery" :
    (d <= 87) ? "Refugees" :
    (d <= 93) ? "Request for Aid" :
                "Treasure";

  const out = ({
    "Attack": attackEvent,
    "Criminal Hireling": criminalHirelingEvent,
    "Extraordinary Opportunity": extraordinaryOpportunityEvent,
    "Friendly Visitors": friendlyVisitorsEvent,
    "Lost Hirelings": lostHirelingsEvent,
    "Magical Discovery": magicalDiscoveryEvent,
    "Refugees": refugeesEvent,
    "Request for Aid": requestForAidEvent,
    "Treasure": treasureEvent,
    "All Is Well": allIsWellEvent
  })[label](st);

  if (out.bonus_roll) {
    const again = resolveEvent(out.state);                                            // roll again
    return { state: again.state, log: `${label}: ${out.log} Then: ${again.log}` };    // combine logs
  }
  return { state: out.state, log: `${label}: ${out.log}` };
};

// Build a set for quick lookup
const k = (x,y) => `${x},${y}`;


export function computeWalls(rooms, paths, n_sections) {
  const N = Math.max(0, n_sections|0);
  if (!rooms?.length || N === 0) return [];

  // Collect occupied cells (rooms + paths)
  const occ = new Set();
  rooms.forEach(r => {
    for (let yy=0; yy<r.h; yy++) for (let xx=0; xx<r.w; xx++) occ.add(k(r.x+xx, r.y+yy));
  });
  paths.forEach(p => occ.add(k(p.x, p.y)));

  // Bounding box of occupied cells
  let xs = [], ys = [];
  for (const s of occ) {
    const [sx, sy] = s.split(',').map(Number);
    xs.push(sx); ys.push(sy);
  }
  const rawMinX = Math.min(...xs), rawMaxX = Math.max(...xs);
  const rawMinY = Math.min(...ys), rawMaxY = Math.max(...ys);
  // Outset by 1, but never below 0 (SVG negative coords disappear)
  const padL = rawMinX > 0 ? 1 : 0;
  const padT = rawMinY > 0 ? 1 : 0;
  const minX = rawMinX - padL;
  const minY = rawMinY - padT;
  const maxX = rawMaxX + 1;
  const maxY = rawMaxY + 1;

  // Perimeter loop coordinates (clockwise, no duplicates)
  const ring = [];
  for (let x = minX; x <= maxX; x++) ring.push({ x, y: minY });            // top
  for (let y = minY+1; y <= maxY; y++) ring.push({ x: maxX, y });          // right
  for (let x = maxX-1; x >= minX; x--) ring.push({ x, y: maxY });          // bottom
  for (let y = maxY-1; y > minY; y--)  ring.push({ x: minX, y });          // left

  // Take the first N sections
  return ring.slice(0, Math.min(N, ring.length));
}

// Basic facility names set, used by guard in addBasicFacility
export const BASIC_NAMES = ["Bedroom","Dining Room","Parlor","Courtyard","Kitchen","Storage"];
