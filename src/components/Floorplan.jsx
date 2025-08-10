import React from "react";
import { A } from "../game/reducer.js";

// SVG floorplan with draggable rooms, clickable hallways, and auto-placed perimeter walls
export default function Floorplan({ state, dispatch }) {
  const rooms = state._floorplan_rooms || [];
  const paths = state._floorplan_paths || [];
  const walls = state._floorplan_walls || [];
  const scale = 48;                         // tile size in px
  const strokeW = 3;                        // room border thickness

  // Drag state stored in refs to avoid re-renders during mousemove
  const dragRef = React.useRef(null);       // { idx, startGX, startGY, origX, origY }
  const isDraggingRef = React.useRef(false);// suppress background clicks right after a drag

  // Canvas size accounts for both rooms and walls
  const maxRoomX = rooms.length ? Math.max(...rooms.map(r => r.x + r.w)) : 0;
  const maxRoomY = rooms.length ? Math.max(...rooms.map(r => r.y + r.h)) : 0;
  const maxWallX = walls.length ? Math.max(...walls.map(w => w.x + 1)) : 0;
  const maxWallY = walls.length ? Math.max(...walls.map(w => w.y + 1)) : 0;
  const canvasX = Math.max(maxRoomX, maxWallX) + 2;   // padding tiles
  const canvasY = Math.max(maxRoomY, maxWallY) + 2;
  const width = Math.max(800, canvasX * scale);
  const height = Math.max(480, canvasY * scale);

  // Helpers
  const isInRoom = (x, y) =>
    rooms.some(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h); // grid collision

  const pathKey = (x, y) => `${x},${y}`;
  const pathSet = React.useMemo(() => new Set(paths.map(p => pathKey(p.x, p.y))), [paths]);

  const togglePath = (x, y) => {
    if (isInRoom(x, y)) return;                                              // ignore clicks inside rooms
    const key = pathKey(x, y);
    const exists = pathSet.has(key);
    const next = exists ? paths.filter(p => pathKey(p.x, p.y) !== key) : [...paths, { x, y }];
    dispatch({ type: A.UPDATE_PATHS, payload: { paths: next } });            // reducer recomputes walls
  };

  const clientToGrid = (svg, clientX, clientY) => {
    const pt = svg.createSVGPoint();                                         // convert client px to SVG space
    pt.x = clientX; pt.y = clientY;
    const ctm = svg.getScreenCTM().inverse();
    const p = pt.matrixTransform(ctm);
    return { gx: Math.floor(p.x / scale), gy: Math.floor(p.y / scale), px: p.x, py: p.y };
  };

  // Drag handlers (use window listeners for smooth dragging)
  const onMouseDownRoom = (idx, e) => {
    const svg = e.currentTarget.ownerSVGElement;
    const { gx, gy } = clientToGrid(svg, e.clientX, e.clientY);
    isDraggingRef.current = false;                                           // reset drag flag
    dragRef.current = { idx, startGX: gx, startGY: gy, origX: rooms[idx].x, origY: rooms[idx].y };
    window.addEventListener("mousemove", onWindowMove);
    window.addEventListener("mouseup", onWindowUp);
    e.preventDefault();                                                      // prevent text selection
  };

  const onWindowMove = (e) => {
    const d = dragRef.current; if (!d) return;
    const svg = document.querySelector("#floorplan-svg"); if (!svg) return;
    const { gx, gy } = clientToGrid(svg, e.clientX, e.clientY);
    const dx = gx - d.startGX, dy = gy - d.startGY;
    if (dx !== 0 || dy !== 0) isDraggingRef.current = true;                  // mark as dragging
    const nx = Math.max(0, d.origX + dx), ny = Math.max(0, d.origY + dy);   // keep within non-negative grid
    const next = rooms.map((r, i) => (i === d.idx ? { ...r, x: nx, y: ny } : r));
    dispatch({ type: A.UPDATE_ROOMS, payload: { rooms: next } });            // reducer recomputes walls
  };

  const onWindowUp = () => {
    dragRef.current = null;                                                  // clear drag session
    window.removeEventListener("mousemove", onWindowMove);
    window.removeEventListener("mouseup", onWindowUp);
    // isDraggingRef reset occurs on next click gate
  };

  // Precompute wall set for O(1) neighbor checks
  const wallKey = (x, y) => `${x}|${y}`;
  const wallSet = React.useMemo(() => new Set(walls.map(w => wallKey(w.x, w.y))), [walls]);
  const hasWallAt = (x, y) => wallSet.has(wallKey(x, y));

  return (
    <div className="card">
      <h3>Floorplan (schematic)</h3>
      <button className="btn" onClick={() => dispatch({ type: A.REGEN_FLOORPLAN })}>
        Generate Floorplan
      </button>
      <div style={{ marginTop: 8, overflow: "auto", border: "1px solid #2a2f3a", borderRadius: 8 }}>
        <svg
          id="floorplan-svg"
          width={width}
          height={height}
          onClick={(e) => {
            // Toggle hallway when clicking background/hallway; ignore immediately after a drag
            if (isDraggingRef.current) { isDraggingRef.current = false; return; }
            const svg = e.currentTarget;
            const t = e.target;
            if (t && t.getAttribute && t.getAttribute("data-room") === "1") return; // ignore room tiles
            const { gx, gy } = clientToGrid(svg, e.clientX, e.clientY);
            togglePath(gx, gy);
          }}
        >
          {/* Perimeter walls — wooden look, only outside border (shared edges suppressed) */}
          {walls.map((w, i) => {
            const top    = !hasWallAt(w.x, w.y - 1);
            const bottom = !hasWallAt(w.x, w.y + 1);
            const left   = !hasWallAt(w.x - 1, w.y);
            const right  = !hasWallAt(w.x + 1, w.y);

            const sx = w.x * scale, sy = w.y * scale, ex = (w.x + 1) * scale, ey = (w.y + 1) * scale;
            const stroke = "#8B4513";   // brown (wood)
            const sw = 3;

            return (
              <g key={`w-${i}`} pointerEvents="none">
                {top &&    <line x1={sx} y1={sy} x2={ex} y2={sy} stroke={stroke} strokeWidth={sw} />}
                {bottom && <line x1={sx} y1={ey} x2={ex} y2={ey} stroke={stroke} strokeWidth={sw} />}
                {left &&   <line x1={sx} y1={sy} x2={sx} y2={ey} stroke={stroke} strokeWidth={sw} />}
                {right &&  <line x1={ex} y1={sy} x2={ex} y2={ey} stroke={stroke} strokeWidth={sw} />}
              </g>
            );
          })}

          {/* Hallway tiles (click to toggle) */}
          {paths.map((p, i) => (
            <rect
              key={`h-${i}`}
              x={p.x * scale}
              y={p.y * scale}
              width={scale}
              height={scale}
              fill="#394050"
              stroke="#3c4352"
              onClick={() => togglePath(p.x, p.y)}
            />
          ))}

          {/* Rooms (draggable; thick borders; centered labels) */}
          {rooms.map((r, idx) => (
            <g key={idx} onMouseDown={(e) => onMouseDownRoom(idx, e)}>
              {Array.from({ length: r.h }).flatMap((_, yy) =>
                Array.from({ length: r.w }).map((_, xx) => (
                  <rect
                    key={`${idx}-${xx}-${yy}`}
                    x={(r.x + xx) * scale}
                    y={(r.y + yy) * scale}
                    width={scale}
                    height={scale}
                    fill="#2a2f3a"
                    stroke="#3c4352"
                    data-room="1"                                             // identifies room tiles to click-gate
                    onClick={(e) => { e.preventDefault(); }}                  // block path toggles when clicking room
                  />
                ))
              )}
              <rect
                x={r.x * scale}
                y={r.y * scale}
                width={r.w * scale}
                height={r.h * scale}
                fill="none"
                stroke="#d4af37"
                strokeWidth={strokeW}
                pointerEvents="none"                                          // allow underlying tiles to handle drag start
              />
              <text
                x={(r.x + r.w / 2) * scale}
                y={(r.y + r.h / 2) * scale}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffd700"
                style={{ fontSize: 12, pointerEvents: "none" }}
              >
                {r.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
