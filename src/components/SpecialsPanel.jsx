// src/components/SpecialsPanel.jsx
import React from "react";
import { A } from "../game/reducer.js";
import { SPECIAL_FACILITIES } from "../game/constants.js";

export default function SpecialsPanel({ state, dispatch }) {
  // Compute list of facilities not yet owned
  const owned = new Set((state.specials || []).map(s => s.name));                   // O(1) lookups
  const available = SPECIAL_FACILITIES.filter(f => !owned.has(f.name));             // remove purchased

  // Local selection state defaults to first available
  const [choice, setChoice] = React.useState(available[0]?.name || "");

  // Keep selection valid if inventory changes
  React.useEffect(() => {
    if (!available.find(f => f.name === choice)) {
      setChoice(available[0]?.name || "");
    }
  }, [state.specials]); // eslint-disable-line react-hooks/exhaustive-deps

  const add = () => {
    if (!choice) return;
    dispatch({ type: A.ADD_SPECIAL, payload: { name: choice } });                   // reducer blocks duplicates, too
  };

  return (
    <div className="card">
      <h3>Special Facilities</h3>
      <p className="muted">Limited by character level. Each special includes its own hirelings.</p>

      <div className="grid grid-3">
        <label>Choose facility
          <select
            value={choice}
            onChange={e => setChoice(e.target.value)}
            disabled={available.length === 0}                                       // nothing left to buy
          >
            {available.length === 0 ? (
              <option value="">All available facilities have been purchased</option>
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
          <button className="btn primary" onClick={add} disabled={!choice}>
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
