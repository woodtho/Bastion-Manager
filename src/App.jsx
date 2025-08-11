import React from "react";
import CharacterBastionPanel from "./components/CharacterBastionPanel.jsx";
import BasicsPanel from "./components/BasicsPanel.jsx";
import SpecialsPanel from "./components/SpecialsPanel.jsx";
import OrdersPanel from "./components/OrdersPanel.jsx";
import WallsPanel from "./components/WallsPanel.jsx";
import DefendersPanel from "./components/DefendersPanel.jsx";
import Floorplan from "./components/Floorplan.jsx";
import { reducer, init } from "./game/reducer.js";
import { loadState, saveState } from "./game/storage.js";
import { A } from "./game/reducer.js";
import { Tabs } from "./components/Tabs.jsx";
import Kpi from "./components/Kpi.jsx";
import NavBar from "./components/NavBar.jsx";
import TimelineSidebar from "./components/TimelineSidebar.jsx";
import HirelingsPanel from "./components/HirelingsPanel.jsx";  // NEW

export default function App() {
  const [state, dispatch] = React.useReducer(reducer, undefined, init);   // central reducer for pure updates

  // Hydrate once on mount from the active profile id (default first), then rehydrate if profile id changes
  React.useEffect(() => {
    // initial attempt with default profile
    const snap = loadState(state.profile_id);
    if (snap) dispatch({ type: A.HYDRATE, payload: snap });               // replace entire state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever profile id changes, try to hydrate from that profile
  React.useEffect(() => {
    const snap = loadState(state.profile_id);
    if (snap) dispatch({ type: A.HYDRATE, payload: snap });
    // if no snapshot, remain on the current in-memory state until user hits Reset (UI exposes control)
  }, [state.profile_id]);

  // Debounced auto-save on any state change to the active profile
  React.useEffect(() => {
    const t = setTimeout(() => saveState(state), 250);                    // small debounce to batch rapid updates
    return () => clearTimeout(t);
  }, [state]);                                                            // persist full snapshot

  // If rooms exist but no walls computed yet, force a recompute on mount
 React.useEffect(() => {
    if ((state._floorplan_rooms?.length || 0) > 0 && (state._floorplan_walls?.length || 0) === 0) {
      dispatch({ type: A.REGEN_FLOORPLAN });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

 const tabs = [
    {
      value: "overview",
      label: "Overview",
      children: (
        <>
          <div className="grid grid-3 mt-8">
            <Kpi label="Gold (GP)" value={state.bastion.gold.toLocaleString()} />
            <Kpi label="Defenders" value={state.defenders} />
            <Kpi label="Turn" value={state.bastion.current_turn} hint="Each Maintain = +7 days" />
          </div>
         <div className="grid grid-2 mt-12">
            <CharacterBastionPanel state={state} dispatch={dispatch} />
            {/* Replace the redundant Defenders card with Orders */}
            <OrdersPanel state={state} dispatch={dispatch} />
          </div>
        </>
      )
    },
    {
      value: "facilities",
      label: "Facilities",
      children: (
        <div className="grid grid-2 mt-8">
          <BasicsPanel state={state} dispatch={dispatch} />
          <SpecialsPanel state={state} dispatch={dispatch} />
        </div>
      )
    },
{
      value: "hirelings",
      label: "Hirelings",
      children: <HirelingsPanel state={state} dispatch={dispatch} />
    },
    {
      value: "construction",
      label: "Construction",
      children: (
        <div className="grid grid-2 mt-8">
          <WallsPanel state={state} dispatch={dispatch} />
          <Floorplan state={state} dispatch={dispatch} />
        </div>
     )
    }
  ];

  const [tab, setTab] = React.useState("overview");

  return (
    <>
      <NavBar
        title="Bastion Manager"
        subtitle="Business Dashboard"
       right={
          <div className="row">
            <span className="pill">Profile: {state.profile_id || "default"}</span>
            <span className="pill">Level: {state.character.level}</span>
          </div>
        }
      />
      <div className="app-shell">
        <TimelineSidebar state={state} />
        <main className="main">
          <div className="container">
            <Tabs value={tab} onChange={setTab} items={tabs} />
          </div>
        </main>
      </div>
    </>
 );
 }