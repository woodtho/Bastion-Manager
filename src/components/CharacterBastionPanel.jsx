import React from "react";
import { A } from "../game/reducer.js";
import { clearState } from "../game/storage.js";

const keyPanel = (profileId) => `bastion/prefs/charBastionCollapsed/${profileId || "default"}`;

export default function CharacterBastionPanel({ state, dispatch }) {
  const currentPid = state.profile_id || "default";
  const currentName = state.character.name || "";
  const currentLevel = state.character.level ?? 1;
  const currentBastion = state.bastion.name || "";
  const currentGold = state.bastion.gold ?? 0;
  const currentDefenders = state.defenders ?? 0;

  const [pid, setPid] = React.useState(currentPid);
  const [cn, setCn] = React.useState(currentName);
  const [cl, setCl] = React.useState(currentLevel);
  const [bn, setBn] = React.useState(currentBastion);
  const [gp, setGp] = React.useState(currentGold);
  const [defenders, setDefenders] = React.useState(currentDefenders);

  React.useEffect(() => { setPid(currentPid); }, [currentPid]);
  React.useEffect(() => { setCn(currentName); }, [currentName]);
  React.useEffect(() => { setCl(currentLevel); }, [currentLevel]);
  React.useEffect(() => { setBn(currentBastion); }, [currentBastion]);
  React.useEffect(() => { setGp(currentGold); }, [currentGold]);
  React.useEffect(() => { setDefenders(currentDefenders); }, [currentDefenders]);

  const [collapsed, setCollapsed] = React.useState(() => {
    try {
      const raw = localStorage.getItem(keyPanel(currentPid));
      if (raw != null) return JSON.parse(raw) === true;
    } catch {}
    return true;
  });
  React.useEffect(() => {
    try { localStorage.setItem(keyPanel(currentPid), JSON.stringify(collapsed)); } catch {}
  }, [collapsed, currentPid]);

  const onSwitchProfile = () => {
    dispatch({ type: A.SET_PROFILE_ID, payload: { profile_id: pid || "default" } });
  };

  const onApply = () => {
    dispatch({
      type: A.APPLY_PROFILE,
      payload: {
        character_name: cn,
        character_level: cl,
        bastion_name: bn,
        gold: gp,
        defenders
      }
    });
  };

  const onReset = () => {
    const msg = `Reset profile "${state.profile_id}"?\n\nThis will clear saved data for this profile and restore defaults. This cannot be undone.`;
    if (window.confirm(msg)) {
      clearState(state.profile_id);
      dispatch({ type: A.RESET });
    }
  };

  return (
    <div className={`card${collapsed ? " is-collapsed" : ""}`}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Character &amp; Bastion</h3>
        <button
          className="btn sm"
          onClick={() => setCollapsed(v => !v)}
          aria-expanded={!collapsed}
          aria-controls="char-bastion-body"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "▸" : "▾"}
        </button>
      </div>

      {!collapsed && (
        <div id="char-bastion-body" className="mt-8">
          <div className="grid grid-2">
            <label>Profile ID
              <input
                value={pid}
                onChange={e => setPid(e.target.value.replace(/\s+/g, "_").slice(0, 32))}
                placeholder="e.g., thomas_campaign"
              />
            </label>

            <label>Character Name
              <input value={cn} onChange={e => setCn(e.target.value)} />
            </label>

            <label>Level
              <input
                type="number"
                min={1}
                max={20}
                value={cl}
                onChange={e => setCl(parseInt(e.target.value || "0", 10))}
              />
            </label>

            <label>Bastion Name
              <input value={bn} onChange={e => setBn(e.target.value)} />
            </label>

            <label>Gold (GP)
              <div className="row" style={{ gap: 6 }}>
                <button
                  className="btn sm"
                  onClick={() => setGp(prev => Math.max(0, (Number.isFinite(prev) ? prev : 0) - 50))}
                >−</button>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={gp}
                  onChange={e => setGp(parseInt(e.target.value || "0", 10))}
                />
                <button
                  className="btn sm"
                  onClick={() => setGp(prev => (Number.isFinite(prev) ? prev : 0) + 50)}
                >+</button>
              </div>
            </label>

            <label>Defenders
              <div className="row" style={{ gap: 6 }}>
                <button
                  className="btn sm"
                  onClick={() => setDefenders(prev => Math.max(0, (Number.isFinite(prev) ? prev : 0) - 1))}
                >−</button>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={defenders}
                  onChange={e => setDefenders(parseInt(e.target.value || "0", 10))}
                />
                <button
                  className="btn sm"
                  onClick={() => setDefenders(prev => (Number.isFinite(prev) ? prev : 0) + 1)}
                >+</button>
              </div>
            </label>
          </div>

          {/* Button layout: first two floated left, reset floated right */}
          <div
            className="row"
            style={{
              marginTop: 12,
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8
            }}
          >
            <div className="row" style={{ gap: 8 }}>
              <button className="btn ghost" onClick={onSwitchProfile}>Switch Profile</button>
              <button className="btn primary" onClick={onApply}>Apply / Update</button>
            </div>
            <div>
              <button className="btn warn" onClick={onReset}>Reset Profile</button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
