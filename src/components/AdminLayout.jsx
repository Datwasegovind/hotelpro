import { useState } from "react";
import Sidebar from "./Sidebar";

export default function AdminLayout({ title, subtitle, actions, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="hp-shell">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="hp-main">
        <div className="hp-topbar">
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-sm btn-outline-secondary d-lg-none" onClick={() => setMobileOpen((v) => !v)}>
              <i className="bi bi-list"></i>
            </button>
            <div>
              <h4 className="mb-0 display" style={{ fontSize: "1.3rem" }}>{title}</h4>
              {subtitle && <div className="text-muted small">{subtitle}</div>}
            </div>
          </div>
          <div className="d-flex gap-2">{actions}</div>
        </div>
        {children}
      </main>
    </div>
  );
}
