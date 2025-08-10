import React from "react";

export default function EventsPanel({ state }) {
  return (
    <div className="card">
      <h3>Event Log</h3>
      <table>
        <thead><tr><th>Turn</th><th>Event</th></tr></thead>
        <tbody>
          {(state.events||[]).map((e,i) => <tr key={i}><td>{e.Turn}</td><td>{e.Event}</td></tr>)}
          {(!state.events || state.events.length===0) && <tr><td colSpan="2"><em>None.</em></td></tr>}
        </tbody>
      </table>
    </div>
  );
}
