import React from "react";

/* Merge legacy order_history + events for older saves, prefer state.timeline when present */
function buildTimeline(state) {
  if (state.timeline && state.timeline.length) {
    return [...state.timeline].sort((a, b) => b.Turn - a.Turn);           // newest first
  }
  const byTurn = new Map();                                               // fallback merge
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
  return Array.from(byTurn.values()).sort((a, b) => b.Turn - a.Turn);
}

const keyPanel = (profileId) => `bastion/timeline/panelCollapsed/${profileId || "default"}`;

export default function TimelineSidebar({ state }) {
  const all = buildTimeline(state);                                       // full, newest-first
  const profileId = state?.profile_id || "default";

  /* ---------- Paging (newest-first) ---------- */
  const pageSize = 15;                                                    // show 15 per page
  const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
  const [page, setPage] = React.useState(0);                              // 0 = newest
  const pageStart = page * pageSize;
  const pageEnd = pageStart + pageSize;
  const data = all.slice(pageStart, pageEnd);

  /* ---------- Panel collapsed state (persisted) ---------- */
  const [panelCollapsed, setPanelCollapsed] = React.useState(() => {
    try {
      const raw = localStorage.getItem(keyPanel(profileId));
      if (raw != null) return JSON.parse(raw) === true;
    } catch {}
    return false;
  });
  React.useEffect(() => {
    try { localStorage.setItem(keyPanel(profileId), JSON.stringify(panelCollapsed)); } catch {}
  }, [panelCollapsed, profileId]);

  /* ---------- Row collapsed set (per visible page) ---------- */
  const [collapsed, setCollapsed] = React.useState(new Set());

  // Reset collapsed set when page or visible turns change:
  //   - On newest page (page 0): expand newest item, collapse the rest.
  //   - On older pages: collapse all by default.
  React.useEffect(() => {
    const turns = data.map((d) => d.Turn);
    const next = new Set(turns);                                          // start collapsed
    if (page === 0 && data.length > 0) next.delete(data[0].Turn);         // expand the newest
    setCollapsed(next);
  }, [page, JSON.stringify(data.map((d) => d.Turn))]);

  const toggleRow = (turn) => {
    setCollapsed((prev) => {
      const n = new Set(prev);
      if (n.has(turn)) n.delete(turn); else n.add(turn);
      return n;
    });
  };

  const collapseAllVisible = () => setCollapsed(new Set(data.map((d) => d.Turn))); // collapse visible
  const expandAllVisible = () => setCollapsed(new Set());                          // expand visible

  /* ---------- Paging handlers ---------- */
  const goNewest = () => setPage(0);
  const goOlder = () => setPage((p) => Math.min(totalPages - 1, p + 1));
  const goNewer = () => setPage((p) => Math.max(0, p - 1));
  const goOldest = () => setPage(totalPages - 1);

  return (
    <aside className={`sidebar${panelCollapsed ? " sidebar-collapsed" : ""}`} aria-label="Timeline">
      <div className="sidebar-header row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="sidebar-title">Timeline</div>
          <div className="sidebar-sub">
            Turn-by-turn actions &amp; events • Page {page + 1} / {totalPages} • {all.length} total
          </div>
        </div>
        <button
          className="btn sm"
          onClick={() => setPanelCollapsed((v) => !v)}                     /* collapse/expand panel */
          aria-expanded={!panelCollapsed}
          aria-controls="timeline-body"
          title={panelCollapsed ? "Expand timeline" : "Collapse timeline"}
        >
          {panelCollapsed ? "▸" : "▾"}
        </button>
      </div>

      {!panelCollapsed && (
        <div id="timeline-body">
          {/* Paging controls */}
          <div className="row mb-8" role="group" aria-label="Timeline paging">
            <button className="btn sm" onClick={goNewest} disabled={page === 0} title="Jump to newest">|⟵</button>
            <button className="btn sm" onClick={goNewer} disabled={page === 0} title="Newer">⟵</button>
            <button className="btn sm ghost" onClick={goOlder} disabled={page >= totalPages - 1} title="Older">⟶</button>
            <button className="btn sm ghost" onClick={goOldest} disabled={page >= totalPages - 1} title="Jump to oldest">⟶|</button>
          </div>

          {/* Bulk expand/collapse for current page */}
          <div className="row mb-8" role="group" aria-label="Timeline visibility controls">
            <button className="btn sm" onClick={expandAllVisible}>Expand page</button>
            <button className="btn sm ghost" onClick={collapseAllVisible}>Collapse page</button>
          </div>

          <div className="timeline">
            {data.length === 0 && <div className="timeline-empty">No history yet.</div>}

            {data.map((row) => {
              const isCollapsed = collapsed.has(row.Turn);
              const actionsCount = row.actions?.length || 0;
              const hasEvent = !!row.event;

              return (
                <div key={row.Turn} className="timeline-card" aria-expanded={!isCollapsed}>
                  <button
                    className="row"
                    style={{
                      width: "100%",
                      justifyContent: "space-between",
                      background: "transparent",
                      border: 0,
                      padding: 0,
                      cursor: "pointer"
                    }}
                    onClick={() => toggleRow(row.Turn)}                   /* toggle one turn */
                    aria-controls={`tl-body-${row.Turn}`}
                    aria-expanded={!isCollapsed}
                  >
                    <div className="timeline-turn">Turn {row.Turn}</div>
                    <div className="mono" style={{ color: "var(--muted)" }}>
                      {isCollapsed ? "▸" : "▾"} {actionsCount} action{actionsCount === 1 ? "" : "s"}{hasEvent ? " • event" : ""}
                    </div>
                  </button>

                  {!isCollapsed && (
                    <div id={`tl-body-${row.Turn}`} className="mt-8">
                      {actionsCount > 0 && (
                        <ul className="timeline-actions">
                          {row.actions.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                      )}
                      {hasEvent && <div className="timeline-event">{row.event}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Paging controls (bottom duplicate for long lists) */}
          {totalPages > 1 && (
            <div className="row mt-8" role="group" aria-label="Timeline paging bottom">
              <button className="btn sm" onClick={goNewest} disabled={page === 0} title="Jump to newest">|⟵</button>
              <button className="btn sm" onClick={goNewer} disabled={page === 0} title="Newer">⟵</button>
              <button className="btn sm ghost" onClick={goOlder} disabled={page >= totalPages - 1} title="Older">⟶</button>
              <button className="btn sm ghost" onClick={goOldest} disabled={page >= totalPages - 1} title="Jump to oldest">⟶|</button>
              <div className="mono" style={{ marginLeft: "auto", color: "var(--muted)" }}>
                Page {page + 1} / {totalPages}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
