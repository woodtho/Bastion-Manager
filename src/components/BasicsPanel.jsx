import React from "react";
import { A } from "../game/reducer.js";
import { BASIC_FACILITIES, FACILITY_SPACE } from "../game/constants.js";

export default function BasicsPanel({ state, dispatch }) {
  const [name, setName] = React.useState(BASIC_FACILITIES[0].name);
  const [space, setSpace] = React.useState(FACILITY_SPACE[0].space);

  return (
    <div className="card">
      <h3>Basics</h3>
      <div className="grid grid-3">
        <label>Basic Facility
          <select value={name} onChange={e=>setName(e.target.value)}>
            {BASIC_FACILITIES.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
          </select>
        </label>
        <label>Space
          <select value={space} onChange={e=>setSpace(e.target.value)}>
            {FACILITY_SPACE.map(s => <option key={s.space} value={s.space}>{s.space}</option>)}
          </select>
        </label>
        <div className="right">
          <button className="btn" onClick={() => dispatch({ type: A.ADD_BASIC, payload: { name, space } })}>Add Basic</button>
        </div>
      </div>

      <table style={{marginTop:8}}>
        <thead><tr><th>ID</th><th>Name</th><th>Space</th><th>Tiles</th></tr></thead>
        <tbody>
          {state.basics.map(b => (
            <tr key={b.id}><td>{b.id}</td><td>{b.name}</td><td>{b.space}</td><td>{b.tiles}</td></tr>
          ))}
          {state.basics.length===0 && <tr><td colSpan="4"><em>No basics yet.</em></td></tr>}
        </tbody>
      </table>
    </div>
  );
}
