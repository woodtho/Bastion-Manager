import React from "react";

/* Merges legacy order_history + events for older saves, but prefers state.timeline when present */
function buildTimeline(state) {
  if (state.timeline && state.timeline.length) {
    return [...state.timeline].sort((a,b) => b.Turn - a.Turn);
  }
  // Fallback merge for older profiles
  const byTurn = new Map();
  (state.order_history || []).forEach(({ Turn, Log }) => {
    const t = byTurn.get(Turn) || { Turn, actions: [], event: null };
    t.actions = [...t.actions, ...(Log || [])];
    byTurn.set(Turn, t);
  });
  (state.events || []).forEach(({ Turn, Event }) => {
    const t = byTurn.get(Turn) || { Turn, actions: [], event: null };
    t.event = Event || null;
    byTurn.set(Turn, t);
  });
  return Array.from(byTurn.values()).sort((a,b) => b.Turn - a.Turn);
}

export default function TimelineSidebar({ state }) {
  const data = buildTimeline(state);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Timeline</div>
        <div className="sidebar-sub">Turn-by-turn actions & events</div>
      </div>
      <div className="timeline">
        {data.length === 0 && (
          <div className="timeline-empty">No history yet.</div>
        )}
        {data.map((row, idx) => (
          <div key={idx} className="timeline-card">
            <div className="timeline-turn">Turn {row.Turn}</div>
            {row.actions && row.actions.length > 0 && (
              <ul className="timeline-actions">
                {row.actions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            )}
            {row.event && (
              <div className="timeline-event">{row.event}</div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
