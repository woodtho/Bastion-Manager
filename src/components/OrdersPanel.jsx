import React from "react";
import { A } from "../game/reducer.js";
import { SPECIAL_FACILITIES } from "../game/constants.js";

export default function OrdersPanel({ state, dispatch }) {
  // Allowed orders per facility; only ONE action may be picked globally
  const defs = new Map(SPECIAL_FACILITIES.map(d => [d.name, d.orders]));
  const [selection, setSelection] = React.useState(null); // { id, order }

  const specials = state.specials.map(s => ({
    ...s,
    allowed: defs.get(s.name) || []
  }));

  const toggle = (id, order) => {
    // “Checkbox-like” behavior but single-selection: clicking the same box clears it
    if (selection && selection.id === id && selection.order === order) {
      setSelection(null); // deselect
    } else {
      setSelection({ id, order }); // select one
    }
  };

  return (
    <div className="card">
      <h3>Orders</h3>
      <small className="mono">Select one action for this turn. If no action is selected, the turn is treated as Maintain (advance 7 days and resolve an event).</small>
      <table style={{marginTop:8}}>
         <thead><tr><th>ID</th><th>Name</th><th>Status</th><th colSpan="6">Actions (select one)</th></tr></thead>
                 <tbody>
                 {specials.map(s => {
            const disabled = s.status !== "Operational";
            const all = s.allowed;
            return (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
                <td>{s.status}</td>
                {all.length === 0 ? <td colSpan="6"><em>No actions.</em></td> :
                  all.map(o => {
                    const checked = !!selection && selection.id === s.id && selection.order === o;
                    return (
                      <td key={o}>
                        <label className="row" style={{gap:6}}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(s.id, o)}
                            disabled={disabled}
                          />
                          {o}
                        </label>
                      </td>
                    );
                  })
                }
              </tr>
            );
          })}
          {specials.length===0 && <tr><td colSpan="4"><em>No special facilities.</em></td></tr>}
        </tbody>
      </table>
            <div className="row" style={{marginTop:8, justifyContent:"flex-end"}}>
        <button
          className="btn primary"
          onClick={() => dispatch({ type: A.END_TURN, payload: { selection } })}
          title="End Turn (executes selected action, or Maintain if none selected)"
        >
          End Turn
        </button>
      </div>



    </div>
  );
}
