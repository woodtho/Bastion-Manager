import React from "react";
import { A } from "../game/reducer.js";
import { clearState } from "../game/storage.js";
import { BASTION_DESCRIPTIONS, BASTION_QUIRKS } from "../game/constants.js";

function rollD100() {
  return 1 + Math.floor(Math.random() * 100);
}

export default function CharacterBastionPanel({ state, dispatch }) {
  const [pid, setPid] = React.useState(state.profile_id || "default");   // user-scoped save slot
  const [cn, setCn] = React.useState(state.character.name);
  const [cl, setCl] = React.useState(state.character.level);
  const [bn, setBn] = React.useState(state.bastion.name);
  const [gp, setGp] = React.useState(state.bastion.gold);

  // NEW: bastion description + quirk (two-way bound to state)
  const [desc, setDesc]   = React.useState(state.bastion.description || "");
  const [quirk, setQuirk] = React.useState(state.bastion.quirk || "");

  // Collapsible (panel) – default collapsed per your ask
  const [open, setOpen] = React.useState(false);

  // Profile button layout improvement
  const onSwitch = () => {
    dispatch({ type: A.SET_PROFILE_ID, payload: { profile_id: pid || "default" } });
  };

  const onApply = () => {
    dispatch({
      type: A.APPLY_PROFILE,
      payload: {
        character_name: cn,
        character_level: cl,
        bastion_name: bn,
        gold: gp,
        // NEW: persist description + quirk
        bastion_description: desc,
        bastion_quirk: quirk
      }
    });
  };

  const onReset = () => {
    const sure = window.confirm(
      `Reset profile "${state.profile_id}"?\nThis clears saved data for this slot.`
    );
    if (!sure) return;
    clearState(state.profile_id);
    dispatch({ type: A.RESET });
  };

  // Plus/Minus controls defaulting to current values
  const adjustDefenders = (delta) => {
    const v = Math.max(0, (state.defenders || 0) + delta);
    // We’ll reuse APPLY_PROFILE to keep changes simple (you already persist with this action)
    dispatch({
      type: A.APPLY_PROFILE,
      payload: {
        character_name: state.character.name,
        character_level: state.character.level,
        bastion_name: state.bastion.name,
        gold: state.bastion.gold,
        bastion_description: state.bastion.description || "",
        bastion_quirk: state.bastion.quirk || "",
        // store defenders in the same reducer turn (add tiny patch in reducer below)
        defenders_override: v
      }
    });
  };

  const adjustGold = (delta) => {
    const v = Math.max(0, (state.bastion.gold || 0) + delta);
    setGp(v);
  };

  return (
    <div className="card">
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>Character & Bastion</h3>
        <button
          className="btn ghost"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls="char-bastion-panel"
        >
          {open ? "Collapse" : "Expand"}
        </button>
      </div>

      {open && (
        <div id="char-bastion-panel" className="mt-8">
          {/* Profile row — first two floated left per your earlier request */}
          <div className="row" style={{ flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            <div style={{ flex: "1 1 260px", minWidth: 240 }}>
              <label>Profile ID
                <input
                  value={pid}
                  onChange={e=>setPid(e.target.value.replace(/\s+/g,"_").slice(0,32))}
                  placeholder="e.g., thomas_campaign"
                />
              </label>
            </div>
            <div style={{ flex: "1 1 260px", minWidth: 240 }}>
              <label>Character Name
                <input value={cn} onChange={e=>setCn(e.target.value)} />
              </label>
            </div>
            <div className="row" style={{ width: "100%", gap: 8, marginTop: 4 }}>
              {/* Float first two to the left by ordering them first */}
              <button className="btn ghost" onClick={onSwitch} title="Switch active profile">
                Switch Profile
              </button>
              <button className="btn primary" onClick={onApply}>
                Apply / Update
              </button>
              <button className="btn warn" onClick={onReset} style={{ marginLeft: "auto" }}>
                Reset Profile
              </button>
            </div>
          </div>

          {/* Basic stats */}
          <div className="grid grid-3">
            <label>Level
              <input
                type="number" min={1} max={20}
                value={cl}
                onChange={e=>setCl(parseInt(e.target.value||"0",10))}
              />
            </label>
            <label>Bastion Name
              <input value={bn} onChange={e=>setBn(e.target.value)} />
            </label>
            <label>Gold (GP)
              <div className="row">
                <button className="btn sm" onClick={()=>adjustGold(-50)}>-50</button>
                <input
                  type="number" min={0} step={50}
                  value={gp}
                  onChange={e=>setGp(parseInt(e.target.value||"0",10))}
                />
                <button className="btn sm" onClick={()=>adjustGold(+50)}>+50</button>
              </div>
            </label>
          </div>

          {/* Defenders quick adjust (keeps current value by default) */}
          <div className="row mt-8" style={{ gap: 12, alignItems: "center" }}>
            <div className="pill">Turn: {state.bastion.current_turn}</div>
            <div className="pill">Profile: {state.profile_id}</div>
            <div className="pill">Level: {state.character.level}</div>
            <div className="row" style={{ gap: 6, marginLeft: "auto" }}>
              <span className="pill">Defenders: {state.defenders}</span>
              <button className="btn sm" onClick={()=>adjustDefenders(-1)}>-1</button>
              <button className="btn sm" onClick={()=>adjustDefenders(+1)}>+1</button>
            </div>
          </div>

          {/* NEW: Bastion Description + Quirk */}
          <h4 className="mt-12">Bastion Description</h4>
          <div className="grid grid-3">
            <label className="grid-span-2">
              <textarea
                rows={4}
                value={desc}
                onChange={e=>setDesc(e.target.value)}
                placeholder="Describe your bastion…"
              />
            </label>
            <div className="right">
              <button
                className="btn"
                onClick={() => {
                  const roll = rollD100();
                  const txt = BASTION_DESCRIPTIONS[roll-1] || `Rolled ${roll} (no entry)`;
                  setDesc(txt);
                }}
              >
                Roll d100
              </button>
            </div>
          </div>

          <h4 className="mt-12">Bastion Quirk</h4>
          <div className="grid grid-3">
            <label className="grid-span-2">
              <textarea
                rows={3}
                value={quirk}
                onChange={e=>setQuirk(e.target.value)}
                placeholder="Give your bastion a peculiar quirk…"
              />
            </label>
            <div className="right">
              <button
                className="btn"
                onClick={() => {
                  const roll = rollD100();
                  const txt = BASTION_QUIRKS[roll-1] || `Rolled ${roll} (no entry)`;
                  setQuirk(txt);
                }}
              >
                Roll d100
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
