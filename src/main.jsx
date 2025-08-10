import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { HashRouter } from 'react-router-dom'
// ...
createRoot(el).render(
  <HashRouter>
    <App />
  </HashRouter>
)