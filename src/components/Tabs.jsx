import React from "react";

/* Minimal, accessible tabs with keyboard support */
export function Tabs({ value, onChange, items }) {
  return (
    <div>
      <div role="tablist" aria-label="Sections" className="tabs">
        {items.map((it, idx) => {
          const selected = value === it.value;
          return (
            <button
              key={it.value}
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${it.value}`}
              id={`tab-${it.value}`}
              tabIndex={selected ? 0 : -1}
              className={`tab ${selected ? "active" : ""}`}
              onClick={() => onChange(it.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") onChange(items[(idx + 1) % items.length].value);
                if (e.key === "ArrowLeft") onChange(items[(idx - 1 + items.length) % items.length].value);
              }}
            >
              {it.label}
            </button>
          );
        })}
      </div>
      {items.map((it) =>
        value === it.value ? (
          <div
            key={it.value}
            role="tabpanel"
            id={`panel-${it.value}`}
            aria-labelledby={`tab-${it.value}`}
            className="tab-panel"
          >
            {it.children}
          </div>
        ) : null
      )}
    </div>
  );
}