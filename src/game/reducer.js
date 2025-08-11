import {
  addBasicFacility, addSpecialFacility, execOrder, newState, resolveEvent,
  spaceInfo, tickDown, BASIC_NAMES, hireAuto, hireManual, fireHirelings, computeWalls
} from "./logic.js";
import { FACILITY_SPACE, SPECIAL_FACILITIES, VALID_ORDERS } from "./constants.js";  // <- REQUIRED


// Action types kept explicit to avoid magic strings
export const A = {
  HYDRATE: "HYDRATE",                  // replace entire state from storage (validated upstream)
  SET_PROFILE_ID: "SET_PROFILE_ID",    // change active profile id (caller hydrates or resets after)
  RESET: "RESET",                      // hard reset current profile to a fresh state
  APPLY_PROFILE: "APPLY_PROFILE",
  QUEUE_WALLS: "QUEUE_WALLS",
  ADD_BASIC: "ADD_BASIC",
  ADD_SPECIAL: "ADD_SPECIAL",
  EXECUTE_ORDERS: "EXECUTE_ORDERS",
  MAINTAIN: "MAINTAIN",
  END_TURN: "END_TURN",               // finish the turn; if an action is selected, execute it; otherwise Maintain
  UPDATE_ROOMS: "UPDATE_ROOMS",     // replace room rectangles (drag/drop)
  UPDATE_PATHS: "UPDATE_PATHS",     // toggle hallways
  HIRE_AUTO: "HIRE_AUTO",
  HIRE_MANUAL: "HIRE_MANUAL",
  FIRE_HIRELINGS: "FIRE_HIRELINGS",
  REGEN_FLOORPLAN: "REGEN_FLOORPLAN"
};

export const reducer = (st, action) => {

  const withAutoWalls = (s) => ({
    ...s,
    _floorplan_walls: computeWalls(s._floorplan_rooms || [], s._floorplan_paths || [], s.built_walls || 0)
  });

  switch (action.type) {
    case A.HYDRATE: {
      // Replace entire state with a trusted snapshot (shape must match current version)
      return { ...action.payload };
    }

    case A.SET_PROFILE_ID: {
      // Only switch the identifier here; caller should follow with HYDRATE or RESET
      const { profile_id } = action.payload || {};
      if (!profile_id || typeof profile_id !== "string") return st;
      return { ...st, profile_id };
    }

    case A.RESET: {
      // Drop to a brand-new default state but keep the selected profile id
      const keepId = st.profile_id || "default";
      const fresh = init();                  // create new default state
      return { ...fresh, profile_id: keepId };
    }
    case A.APPLY_PROFILE: {
      const { character_name, character_level, bastion_name, gold, has_walls, defenders } = action.payload;
      // Ensure starting two free basics if none exist; refund cost after adding
      let s = {
        ...st,
        character: { name: character_name, level: character_level },
        bastion: { ...st.bastion, name: bastion_name, gold },
        has_walls: !!has_walls
      };

  // Apply defenders at top level; guard non-negative integer
  if (Number.isInteger(defenders) && defenders >= 0) {
    s = { ...s, defenders };
  }

      if (s.basics.length === 0) {
        const cramped = spaceInfo("Cramped");
        const roomy = spaceInfo("Roomy");
        s = addBasicFacility(s, "Bedroom", "Cramped");                     // initial free
        s = { ...s, bastion: { ...s.bastion, gold: s.bastion.gold + cramped.add_cost_gp } }; // refund
        s = addBasicFacility(s, "Dining Room", "Roomy");                   // initial free
        s = { ...s, bastion: { ...s.bastion, gold: s.bastion.gold + roomy.add_cost_gp } };   // refund
      }
      return s;
    }

    case A.QUEUE_WALLS: {
      const { sections } = action.payload;
      if (!Number.isInteger(sections) || sections < 0) return st;         // ignore invalid requests
      if (sections === 0) return st;                                      // nothing to do
      const total_cost = 250 * sections;                                  // 250 GP per section
      if (st.bastion.gold < total_cost) return st;                        // insufficient gold
      const next_id = (st.walls.length === 0 ? 1 : Math.max(...st.walls.map(w => w.queue_id)) + 1);
      return {
        ...st,
        walls: [...st.walls, { queue_id: next_id, sections, gp_cost: total_cost, days_left: sections * 10 }],
        bastion: { ...st.bastion, gold: st.bastion.gold - total_cost }
      };
    }

    case A.ADD_BASIC: {
      const { name, space } = action.payload;
      if (!BASIC_NAMES.includes(name)) return st;                          // guard unknown
      if (!FACILITY_SPACE.map(x => x.space).includes(space)) return st;    // guard invalid
      try { return addBasicFacility(st, name, space); } catch { return st; }
    }

    case A.ADD_SPECIAL: {
      const { name } = action.payload;
      // Disallow duplicates
      if (st.specials.some(s => s.name === name)) return st;               // already owned
      if (!SPECIAL_FACILITIES.find(f => f.name === name)) return st;       // unknown
      try { return addSpecialFacility(st, name); } catch { return st; }
    }

    case A.HIRE_AUTO: {
      const { facility, n } = action.payload || {};
      if (!facility || !Number.isInteger(n) || n < 1) return st;
      return hireAuto(st, facility, n);
    }
    case A.HIRE_MANUAL: {
      const { facility, name, species } = action.payload || {};
      if (!facility || !name || !species) return st;
      return hireManual(st, facility, name, species);
    }
    case A.FIRE_HIRELINGS: {
      const { ids } = action.payload || {};
      if (!ids || !Array.isArray(ids) || ids.length === 0) return st;
      return fireHirelings(st, ids);
    }

      
    case A.END_TURN: {
      // Optional payload: { selection: { id, order } }  — if absent => Maintain
      const sel = action.payload?.selection;

      // Start from current state
      let s = { ...st };

      // If a single valid action is selected, execute it now (this turn), else it's a Maintain
      let tookAction = false;

      let actionsLog = [];

      if (sel && VALID_ORDERS.includes(sel.order) && sel.order !== "None") {
        const res = execOrder(s, sel.id, sel.order);
        s = res.state;
        actionsLog = [`${(s.specials.find(x => x.id === sel.id) || { name: sel.id }).name}: ${res.msg}`];
        tookAction = true;
      }

      // Advance time by one Bastion turn (7 days), process walls & shutdowns
      s = { ...s, bastion: { ...s.bastion, current_turn: s.bastion.current_turn + 1 } };
      s = { ...s, walls: s.walls.map(w => ({ ...w, days_left: Math.max(w.days_left - 7, 0) })) }; // progress
      s = { ...s, specials: s.specials.map(f => {
        const left = tickDown(f.shutdown_until);
        return { ...f, shutdown_until: left, status: (left === 0 ? "Operational" : f.status) };
      })};

      // Handle completed wall sections: count, add to built_walls, then remove from queue
      const done = s.walls.filter(w => w.days_left === 0).reduce((acc, w) => acc + (w.sections || 0), 0); // sum finished sections
      if (done > 0) {
        s = { ...s, built_walls: (s.built_walls || 0) + done };                                          // record cumulative completions
      }
      s = { ...s, walls: s.walls.filter(w => w.days_left > 0) };   
      s = withAutoWalls(s); // reposition perimeter walls based on new layout/count


      // If no action was taken, this is a Maintain: trigger exactly one event
      if (!tookAction) {
        const ev = resolveEvent(s);
        s = ev.state;
        s = { ...s, events: [...(s.events||[]), { Turn: s.bastion.current_turn, Event: ev.log }], _events_last_turn: s.bastion.current_turn };
        // Push Maintain entry into timeline
        s = { ...s, timeline: [...(s.timeline||[]), { Turn: s.bastion.current_turn, actions: [], event: ev.log }] };
      } else {
        // Push Action entry into timeline (no event)
        s = { ...s, timeline: [...(s.timeline||[]), { Turn: s.bastion.current_turn, actions: actionsLog, event: null }] };
       }
      return s;
    }

    case A.REGEN_FLOORPLAN: {
       // Build room rectangles with labels; paths start empty
      const rooms = [];
      let cursorX = 1, cursorY = 1, rowH = 0;
      const margin = 2;
      const items = [
        ...st.basics.map(b => ({ label: `${b.name}`, tiles: b.tiles })),                 // no [space]
        ...st.specials.map(s => {   
          const maxTiles = (FACILITY_SPACE.find(x => x.space === s.space) || { max_tiles: 1 }).max_tiles;
           return { label: `${s.name}`, tiles: maxTiles };
        })
      ];
      items.forEach(it => {
        const n = Math.max(1, it.tiles || 1);
        const w = Math.ceil(Math.sqrt(n));
        const h = Math.ceil(n / w);
        if (cursorX + w + margin > 60) { cursorX = 1; cursorY += rowH + margin; rowH = 0; }
        rooms.push({ label: it.label, x: cursorX, y: cursorY, w, h });
        cursorX += w + margin;
        rowH = Math.max(rowH, h);
      });
     
      const s2 = { ...st, _floorplan_rooms: rooms, _floorplan_paths: [] };
      return withAutoWalls(s2);

    }

      case A.UPDATE_ROOMS: {
      const rooms = action.payload?.rooms;
      if (!Array.isArray(rooms)) return st;
      return withAutoWalls({ ...st, _floorplan_rooms: rooms });
    }

    case A.UPDATE_PATHS: {
      const paths = action.payload?.paths;
      if (!Array.isArray(paths)) return st;
      return withAutoWalls({ ...st, _floorplan_paths: paths });
    }

    default: return st;
  }
};

export const init = () => newState();
