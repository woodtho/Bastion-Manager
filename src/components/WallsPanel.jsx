import React from "react";
import { A } from "../game/reducer.js";
import { ENCLOSURE_THRESHOLD_DEFAULT } from "../game/constants.js";

export default function WallsPanel({ state, dispatch }) {
  const [sections, setSections] = React.useState(0);
  const built = state.built_walls || 0;                                              // completed sections so far
  const queued = state.walls.reduce((acc,w) => acc + (w.sections || 0), 0);          // sum of queued sections
  const total = built + queued;                                                      // headline total including in-progress
  const threshold = state.enclosure_threshold ?? ENCLOSURE_THRESHOLD_DEFAULT;
  const enclosed = built >= threshold;
 

  return (
    <div className="card">
      <h3>Defensive Walls</h3>
      <div className="row" style={{margin:"4px 0 8px 0"}}>
        <span className="pill">Built: {built}</span>
        <span className="pill">Queued: {queued}</span>
        <span className="pill">Total (built + queued): {total}</span>
        <span className="pill">Enclosed: {enclosed ? "Yes" : "No"} (≥ {threshold})</span>
      </div>
      <div className="grid grid-3">
        <label>Queue Wall Sections (5-ft each)
          <input type="number" min={0} value={sections} onChange={e=>setSections(parseInt(e.target.value||"0",10))} />
        </label>
        <div className="row" />
        <div className="right">
          <button className="btn" onClick={() => dispatch({ type: A.QUEUE_WALLS, payload: { sections } })}>
            Add to Build Queue
          </button>
        </div>
      </div>
      <small className="mono">Each section: 250 GP and 10 days. Construction progresses automatically each Maintain.</small>
           <div className="row" style={{marginTop:8}}>
        <label>Enclosure Threshold (sections)
          <input
            type="number"
            min={1}
            value={threshold}
            onChange={(e) => {
              const v = Math.max(1, parseInt(e.target.value||"1",10));
              // update threshold inline via a tiny state mutation action
              dispatch({ type: A.HYDRATE, payload: { ...state, enclosure_threshold: v } });
            }}
          />
        </label>
      </div>
      <div style={{marginTop:8}}>
        {state.walls.length === 0 ? "No wall sections in the build queue."
          : state.walls.map(w => `${w.sections} sections (${w.days_left} days left)`).join(" | ")}
      </div>
    </div>
  );
}
