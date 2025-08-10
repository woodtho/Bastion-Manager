import React from "react";
import { A } from "../game/reducer.js";
import { clearState } from "../game/storage.js";

export default function CharacterBastionPanel({ state, dispatch }) {
  const [pid, setPid] = React.useState(state.profile_id || "default");   // user-scoped save slot
  const [cn, setCn] = React.useState(state.character.name);
  const [cl, setCl] = React.useState(state.character.level);
  const [bn, setBn] = React.useState(state.bastion.name);
  const [gp, setGp] = React.useState(state.bastion.gold);

  return (
    <div className="card">
      <h3>Character & Bastion</h3>
      <div className="grid grid-2">
        <label>Profile ID
          <input
            value={pid}
            onChange={e=>setPid(e.target.value.replace(/\s+/g,"_").slice(0,32))}   // normalize and limit length
            placeholder="e.g., thomas_campaign"
          />
        </label>
        <label>Character Name<input value={cn} onChange={e=>setCn(e.target.value)} /></label>
        <label>Level<input type="number" min={1} max={20} value={cl} onChange={e=>setCl(parseInt(e.target.value||"0",10))} /></label>
        <label>Bastion Name<input value={bn} onChange={e=>setBn(e.target.value)} /></label>
        <label>Gold (GP)<input type="number" min={0} step={50} value={gp} onChange={e=>setGp(parseInt(e.target.value||"0",10))} /></label>
        <div className="right">
          <button
            className="btn ghost"
            onClick={() => dispatch({ type: A.SET_PROFILE_ID, payload: { profile_id: pid || "default" } })}
            title="Switch the active save slot (auto-loads if it exists)"
            style={{marginRight:8}}
          >
            Switch Profile
          </button>
          <button className="btn primary" onClick={() => dispatch({ type: A.APPLY_PROFILE, payload: { character_name: cn, character_level: cl, bastion_name: bn, gold: gp } })}>
            Apply / Update
          </button>
        </div>
      </div>
       <div className="row" style={{marginTop:8, justifyContent:"space-between"}}>
        <small className="mono">Turn: {state.bastion.current_turn}</small>
        <div className="row">
          <span className="pill">Profile: {state.profile_id}</span>
          <span className="pill">Gold: {state.bastion.gold} GP</span>
          <span className="pill">Level: {state.character.level}</span>
           </div>
      </div>
      <div className="row" style={{marginTop:8, justifyContent:"flex-end"}}>
        <button
          className="btn warn"
          onClick={() => { clearState(state.profile_id); dispatch({ type: A.RESET }); }}
          title="Clear saved data for this profile and reset to defaults"
        >
          Reset Profile
        </button>
      </div>
    </div>
  );
}
