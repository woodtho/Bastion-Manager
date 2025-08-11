// src/components/SpecialsPanel.jsx
import React from "react";
import { A } from "../game/reducer.js";
import { SPECIAL_FACILITIES } from "../game/constants.js";
import { maxSpecialForLevel } from "../game/logic.js";

export default function SpecialsPanel({ state, dispatch }) {
  const characterLevel = state.character?.level ?? 1;

  // Real cap from game logic/constants
  const maxAllowed = maxSpecialForLevel(characterLevel);

  // Owned and available (remove duplicates already purchased)
  const owned = new Set((state.specials || []).map(s => s.name));
  const ownedCount = owned.size;
  const available = SPECIAL_FACILITIES.filter(f => !owned.has(f.name));

  // Remaining slots the player can *actually* add at current level
  const remainingSlots = Math.max(0, maxAllowed - ownedCount);

  // Local selection state defaults to first available
  const [choice, setChoice] = React.useState(available[0]?.name || "");

  // Keep selection valid if inventory changes
  React.useEffect(() => {
    if (!available.find(f => f.name === choice)) {
      setChoice(available[0]?.name || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.specials, characterLevel]);

  const add = () => {
    if (!choice || remainingSlots <= 0) return;
    dispatch({ type: A.ADD_SPECIAL, payload: { name: choice } });              // reducer also enforces cap
  };

  return (
    <div className="card">
      <h3 style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Special Facilities
        <span className="pill">{remainingSlots} can be added</span>
      </h3>
      <p className="muted">
        Level {characterLevel}: max {maxAllowed} specials. Owned {ownedCount}.
      </p>

      <div className="grid grid-3">
        <label>Choose facility
          <select
            value={choice}
            onChange={e => setChoice(e.target.value)}
            disabled={available.length === 0 || remainingSlots === 0}
          >
            {available.length === 0 ? (
              <option value="">All facilities purchased</option>
            ) : (
              available.map(f => (
                <option key={f.name} value={f.name}>
                  {f.name} • {f.space} • min lvl {f.min_level}
                </option>
              ))
            )}
          </select>
        </label>

        <div className="align-end">
          <button
            className="btn primary"
            onClick={add}
            disabled={!choice || remainingSlots === 0}
            title={remainingSlots === 0 ? "No remaining slots at current level" : "Add selected facility"}
          >
            Add Special
          </button>
        </div>
      </div>

      <h4 className="mt-12">Owned</h4>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Space</th><th>Status</th><th>Hirelings</th>
          </tr>
        </thead>
        <tbody>
          {(state.specials || []).length === 0 ? (
            <tr><td colSpan="5"><em>None.</em></td></tr>
          ) : (
            state.specials.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
                <td>{s.space}</td>
                <td>{s.status}</td>
                <td>{s.hirelings}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
