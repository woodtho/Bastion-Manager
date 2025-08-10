import React from "react";
import { A } from "../game/reducer.js";
import { HIRELING_SPECIES } from "../game/constants.js";

export default function HirelingsPanel({ state, dispatch }) {
  const facilities = state.specials.map(s => s.name);
  const [facility, setFacility] = React.useState(facilities[0] || "");
  const [count, setCount] = React.useState(1);
  const [name, setName] = React.useState("");
  const [species, setSpecies] = React.useState(HIRELING_SPECIES[0][0]);
  const [selected, setSelected] = React.useState(new Set());

  React.useEffect(() => {
    if (!facility && facilities.length > 0) setFacility(facilities[0]);
  }, [facilities, facility]);

  const hireAuto = () => {
    if (!facility) return;
    dispatch({ type: A.HIRE_AUTO, payload: { facility, n: Math.max(1, count|0) } });
  };

  const hireManual = () => {
    if (!facility || !name || !species) return;
    dispatch({ type: A.HIRE_MANUAL, payload: { facility, name, species } });
    setName("");
  };

  const fire = () => {
    if (selected.size === 0) return;
    dispatch({ type: A.FIRE_HIRELINGS, payload: { ids: Array.from(selected) } });
    setSelected(new Set());
  };

  const toggleRow = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const rows = state.hirelings;

  return (
    <div className="card">
      <h3>Hirelings</h3>
      <div className="grid grid-3">
        <label>Facility
          <select value={facility} onChange={e=>setFacility(e.target.value)}>
            {facilities.length === 0 ? <option value="">No facilities</option> :
              facilities.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label>Auto-generate (count)
          <input type="number" min={1} value={count} onChange={e=>setCount(parseInt(e.target.value||"1",10))} />
        </label>
        <div className="right">
          <button className="btn" onClick={hireAuto} disabled={!facility}>Auto Generate</button>
        </div>
      </div>

      <div className="grid grid-3 mt-8">
        <label>Name
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g., Seraphina" />
        </label>
        <label>Species
          <select value={species} onChange={e=>setSpecies(e.target.value)}>
            {HIRELING_SPECIES.map(([sp]) => <option key={sp} value={sp}>{sp}</option>)}
          </select>
        </label>
        <div className="right">
          <button className="btn" onClick={hireManual} disabled={!facility || !name}>Hire Manually</button>
        </div>
      </div>

      <div className="row" style={{marginTop:8, justifyContent:"flex-end"}}>
        <button className="btn warn" onClick={fire} disabled={selected.size===0}>Fire Selected</button>
      </div>

      <h4 className="mt-12">Roster</h4>
      <table>
        <thead><tr><th></th><th>ID</th><th>Name</th><th>Species</th><th>Role</th><th>Facility</th></tr></thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan="6"><em>None.</em></td></tr>
          ) : rows.map(h => (
            <tr key={h.id}>
              <td><input type="checkbox" checked={selected.has(h.id)} onChange={()=>toggleRow(h.id)} /></td>
              <td>{h.id}</td>
              <td>{h.name}</td>
              <td>{h.species}</td>
              <td>{h.role}</td>
              <td>{h.facility}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
