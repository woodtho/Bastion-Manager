import React from "react";

export default function DefendersPanel({ state }) {
  return (
    <div className="card">
      <h3>Defenders</h3>
      <div>Total Bastion Defenders: <strong>{state.defenders}</strong></div>
    </div>
  );
}
