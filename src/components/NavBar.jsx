import React from "react";

export default function NavBar({ title, subtitle, right }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-title">{title}</div>
        {subtitle ? <div className="brand-sub">{subtitle}</div> : null}
      </div>
      <div className="topbar-right">{right}</div>
    </header>
  );
}