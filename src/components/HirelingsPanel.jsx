import React from "react";
import { A } from "../game/reducer.js";
import { HIRELING_SPECIES } from "../game/constants.js";

export default function HirelingsPanel({ state, dispatch }) {
  /* ---------- Defenders pictograph (chess pieces) ----------
     Denominations (greedy): 100 ♚, 50 ♛, 20 ♝, 10 ♜, 5 ♞, 1 ♙
     Always decomposes to a valid mix that sums exactly to the total.
  */
  const defenders = Math.max(0, parseInt(state.defenders ?? 0, 10));
  const DENOMS = [
    { value: 100, glyph: "♚", label: "Company (100 defenders)" },
    { value:  50, glyph: "♛", label: "Platoon (50 defenders)"  },
    { value:  20, glyph: "♝", label: "Section (20 defenders)"  },
    { value:  10, glyph: "♜", label: "Squad (10 defenders)"    },
    { value:   5, glyph: "♞", label: "Team (5 defenders)"       },
    { value:   1, glyph: "♙", label: "Defender (1)"             }
  ];
  const decompose = (n) => {
    const out = []; let r = n;
    for (const d of DENOMS) { if (r <= 0) break; const k = Math.floor(r / d.value);
      for (let i = 0; i < k; i++) out.push(d); r -= k * d.value; }
    return out;
  };
  const units = decompose(defenders);

  // Formation vs legend sizing
  const COLS = 6;
  const TILE = 22;                 // legend
  const ARMY_TILE = 34;            // formation
  const cVar = (v, fb) => `var(${v}, ${fb})`;

  const pieceCell = {                                                  // legend
    fontSize: TILE, display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: TILE + 10, height: TILE + 10, margin: 2, background: "transparent", border: "none",
    color: cVar("--accent-2", "#ffd700"), lineHeight: 1
  };
  const armyPieceCell = {                                              // formation
    fontSize: ARMY_TILE, display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: ARMY_TILE + 14, height: ARMY_TILE + 14, margin: 2, background: "transparent",
    border: "none", color: cVar("--accent-2", "#ffd700"), lineHeight: 1
  };

  /* ---------- Hirelings controls (mobile-friendly) ---------- */
  const facilities = state.specials.map(s => s.name);
  const [facility, setFacility] = React.useState(facilities[0] || "");
  const [count, setCount] = React.useState(1);
  const [name, setName] = React.useState("");
  const [species, setSpecies] = React.useState(HIRELING_SPECIES[0][0]);
  const [selected, setSelected] = React.useState(new Set());

  React.useEffect(() => {
    if (!facility && facilities.length > 0) setFacility(facilities[0]);             // default facility
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

  // Collapsible panels (default open)
  const [openDefenders, setOpenDefenders] = React.useState(true);
  const [openHirelings, setOpenHirelings] = React.useState(true);

  return (
    <>
      {/* --------- Defenders (collapsible) --------- */}
      <details className="card" open={openDefenders} onToggle={(e)=>setOpenDefenders(e.currentTarget.open)}>
        <summary
          style={{
            listStyle: "none", cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 8
          }}
        >
          <h3 style={{ margin: 0 }}>Defenders</h3>
          <div className="row" style={{ gap: 8 }}>
            <span className="pill">Total: {defenders}</span>
            <span aria-hidden="true" style={{ color: "var(--accent-2)" }}>
              {openDefenders ? "▾" : "▸"}
            </span>
          </div>
        </summary>

        <div className="mt-8">
          {defenders === 0 ? (
            <div className="mono" style={{ color: "var(--muted)" }}>No defenders present.</div>
          ) : (
            <>
              {/* Formation */}
              <div
                role="img"
                aria-label={`Defender formation showing ${defenders} defenders`}
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${COLS}, ${ARMY_TILE + 18}px)`,
                  gap: 0,
                  justifyContent: "start",
                  alignContent: "start"
                }}
              >
                {units.map((u, i) => (
                  <span key={i} title={u.label} style={armyPieceCell}>{u.glyph}</span>
                ))}
              </div>

              {/* Legend (smaller) */}
              <div className="mt-8 row" style={{ gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span className="mono" style={{ color: "var(--muted)" }}>Legend:</span>
                {DENOMS.map(d => (
                  <span key={d.value} className="row" style={{ gap: 6, alignItems: "center" }}>
                    <span style={pieceCell} aria-hidden="true">{d.glyph}</span>
                    <span className="mono" style={{ color: "var(--muted)" }}>= {d.value}</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </details>

      {/* --------- Hirelings (collapsible, mobile-friendly UI) --------- */}
      <details className="card" open={openHirelings} onToggle={(e)=>setOpenHirelings(e.currentTarget.open)}>
        <summary
          style={{
            listStyle: "none", cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 8
          }}
        >
          <h3 style={{ margin: 0 }}>Hirelings</h3>
          <div className="row" style={{ gap: 8 }}>
            <span className="pill">Total: {rows.length}</span>
            <span aria-hidden="true" style={{ color: "var(--accent-2)" }}>
              {openHirelings ? "▾" : "▸"}
            </span>
          </div>
        </summary>

        {/* Controls */}
        <div className="mt-8 grid grid-3">
          <label>Facility
            <select value={facility} onChange={e=>setFacility(e.target.value)}>
              {facilities.length === 0 ? (
                <option value="">No facilities</option>
              ) : (
                facilities.map(n => <option key={n} value={n}>{n}</option>)
              )}
            </select>
          </label>

          <label>Auto-generate (count)
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={count}
              onChange={e=>setCount(parseInt(e.target.value||"1",10))}
            />
          </label>

          <div className="row" style={{ justifyContent: "flex-end", alignItems: "end" }}>
            <button className="btn" onClick={hireAuto} disabled={!facility} style={{ width: "100%" }}>
              Auto Generate
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-3">
          <label>Name
            <input
              value={name}
              onChange={e=>setName(e.target.value)}
              placeholder="e.g., Seraphina"
              autoComplete="off"
            />
          </label>

          <label>Species
            <select value={species} onChange={e=>setSpecies(e.target.value)}>
              {HIRELING_SPECIES.map(([sp]) => <option key={sp} value={sp}>{sp}</option>)}
            </select>
          </label>

          <div className="row" style={{ justifyContent: "flex-end", alignItems: "end" }}>
            <button className="btn primary" onClick={hireManual} disabled={!facility || !name} style={{ width: "100%" }}>
              Hire Manually
            </button>
          </div>
        </div>

        {/* Actions (mobile-friendly full-width on wrap) */}
        <div className="row" style={{ marginTop: 8, justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div className="mono" style={{ color: "var(--muted)" }}>
            Selected: {selected.size}
          </div>
          <button className="btn warn" onClick={fire} disabled={selected.size===0} style={{ minWidth: 180 }}>
            Fire Selected
          </button>
        </div>

        {/* Roster */}
        <h4 className="mt-12">Roster</h4>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th></th><th>ID</th><th>Name</th><th>Species</th><th>Role</th><th>Facility</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan="6"><em>None.</em></td></tr>
              ) : rows.map(h => (
                <tr key={h.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(h.id)}
                      onChange={()=>toggleRow(h.id)}
                      aria-label={`Select ${h.name}`}
                    />
                  </td>
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
      </details>
    </>
  );
}
