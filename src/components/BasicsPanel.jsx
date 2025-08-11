import React from "react";
import { A } from "../game/reducer.js";
import { BASIC_FACILITIES, FACILITY_SPACE } from "../game/constants.js";

export default function BasicsPanel({ state, dispatch }) {
  const [name, setName] = React.useState(BASIC_FACILITIES[0].name);
  const [space, setSpace] = React.useState(FACILITY_SPACE[0].space);

  // Lookup for selected space
  const spaceRow = React.useMemo(
    () => FACILITY_SPACE.find(s => s.space === space) || { add_cost_gp: 0, max_tiles: 0 },
    [space]
  );
  const cost = spaceRow.add_cost_gp || 0;                                           // add cost for BASIC facilities
  const gold = state.bastion?.gold ?? 0;
  const canAfford = gold >= cost;

  const addBasic = () => {
    if (!canAfford) return;
    dispatch({ type: A.ADD_BASIC, payload: { name, space } });
  };

  return (
    <div className="card">
      <h3 style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Basics
      </h3>

      <div className="grid grid-3">
        <label>Basic Facility
          <select value={name} onChange={e=>setName(e.target.value)}>
            {BASIC_FACILITIES.map(b => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
          </select>
        </label>

        <label>Space
          <select value={space} onChange={e=>setSpace(e.target.value)}>
            {FACILITY_SPACE.map(s => (
              <option key={s.space} value={s.space}>{s.space}</option>
            ))}
          </select>
        </label>

        <div className="right" title={canAfford ? "Add the selected basic facility" : "Insufficient gold"}>
          <button className="btn" onClick={addBasic} disabled={!canAfford}>
            Add Basic
          </button>
        </div>
      </div>

        <span className="row" style={{ gap: 8, alignItems: "center" }}>
          <span className="pill" title="Total gold available">Gold: {gold} GP</span>
          <span
            className="pill"
            title="Cost to add the selected facility and size"
            style={{ borderColor: canAfford ? "var(--accent)" : "#6a3b34", color: canAfford ? "var(--text)" : "#ffd4cf", background: canAfford ? "var(--surface)" : "#59312b" }}
          >
            Cost: {cost} GP
          </span>
        </span>
        
      <table style={{ marginTop: 8 }}>
        <thead>
          <tr><th>ID</th><th>Name</th><th>Space</th><th>Tiles</th></tr>
        </thead>
        <tbody>
          {state.basics.map(b => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.name}</td>
              <td>{b.space}</td>
              <td>{b.tiles}</td>
            </tr>
          ))}
          {state.basics.length === 0 && (
            <tr><td colSpan="4"><em>No basics yet.</em></td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
