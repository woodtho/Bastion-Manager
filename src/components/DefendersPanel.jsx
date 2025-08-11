import React from "react";

export default function DefendersPanel({ state }) {
  const n = Math.max(0, parseInt(state.defenders ?? 0, 10));                         // sanitize

  // Decompose count into 10s (only if total >= 50), then 5s (only if total >= 15), then 1s
  const tens = n >= 50 ? Math.floor(n / 10) : 0;                                     // 10-defender squads
  const remAfterTen = n - tens * 10;
  const fives = n >= 15 ? Math.floor(remAfterTen / 5) : 0;                           // 5-defender teams
  const ones = remAfterTen - fives * 5;                                              // single defenders

  // Build a flat list of pictograph units in marching order (10s, then 5s, then 1s)
  const units = [
    ...Array.from({ length: tens }, () => ({ type: 10 })),
    ...Array.from({ length: fives }, () => ({ type: 5 })),
    ...Array.from({ length: ones }, () => ({ type: 1 }))
  ];

  // Grid “formation”: compact rows with small gaps
  const COLS = 12;                                                                    // rank width
  const tile = 14;                                                                    // px size

  // Styles for symbols; colors follow app theme with sensible fallbacks
  const cVar = (v, fb) => `var(${v}, ${fb})`;
  const base = {
    width: tile, height: tile, display: "inline-block",
    margin: 2, border: `1px solid ${cVar("--border", "#3c4352")}`
  };
  const sym1 = {                                                                      // single (circle)
    ...base, borderRadius: "50%",
    background: cVar("--accent-2", "#ffd700")
  };
  const sym5 = {                                                                      // five (diamond)
    ...base, background: cVar("--ok", "#2f4166"),
    transform: "rotate(45deg)"
  };
  const sym10 = {                                                                     // ten (square, stronger)
    ...base, background: "#8b5a2b",                                                   // wood/bronze tone
    border: `2px solid ${cVar("--border-strong", "#3a4150")}`
  };

  return (
    <div className="card">
      <h3>Defenders</h3>
      <div>
        Total Bastion Defenders: <strong>{n}</strong>
      </div>

      {n === 0 ? (
        <div className="mt-8 mono" style={{ color: "var(--muted)" }}>No defenders present.</div>
      ) : (
        <div className="mt-8">
          <div
            role="img"
            aria-label={`Defender formation showing ${n} defenders`}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${COLS}, ${tile + 4}px)`,                  // tile + margin
              gap: 0,
              justifyContent: "start",
              alignContent: "start"
            }}
          >
            {units.map((u, i) => (
              <span
                key={i}
                title={
                  u.type === 10 ? "Squad (10 defenders)" :
                  u.type === 5  ? "Team (5 defenders)"   :
                                  "Defender (1)"
                }
                style={u.type === 10 ? sym10 : u.type === 5 ? sym5 : sym1}
              />
            ))}
          </div>

          {/* Optional compact legend */}
          <div className="mt-8 row" style={{ gap: 8, alignItems: "center" }}>
            <span className="mono" style={{ color: "var(--muted)" }}>Legend:</span>
            <span style={{ ...sym1 }} title="1 defender" />
            <span className="mono" style={{ color: "var(--muted)" }}>= 1</span>
            <span style={{ ...sym5 }} title="5 defenders" />
            <span className="mono" style={{ color: "var(--muted)" }}>= 5</span>
            <span style={{ ...sym10 }} title="10 defenders" />
            <span className="mono" style={{ color: "var(--muted)" }}>= 10</span>
          </div>
        </div>
      )}
    </div>
  );
}
