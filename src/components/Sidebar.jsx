import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { section: "Overview", items: [{ to: "/admin/dashboard", label: "Dashboard", icon: "bi-speedometer2" }] },
  {
    section: "Operations",
    items: [
      { to: "/admin/tables", label: "Table Management", icon: "bi-grid-3x3-gap" },
      { to: "/admin/bookings", label: "Reservations", icon: "bi-calendar-check" },
      { to: "/admin/orders", label: "Food Orders", icon: "bi-receipt" },
      { to: "/admin/menu", label: "Menu Management", icon: "bi-book" },
    ],
  },
  {
    section: "Finance",
    items: [
      { to: "/admin/billing", label: "Billing", icon: "bi-file-earmark-text" },
      { to: "/admin/payments", label: "Payments", icon: "bi-credit-card" },
      { to: "/admin/reports", label: "Reports", icon: "bi-bar-chart" },
    ],
  },
  {
    section: "People",
    items: [
      { to: "/admin/customers", label: "Customers", icon: "bi-people" },
      { to: "/admin/employees", label: "Employees", icon: "bi-person-badge" },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className={`hp-sidebar ${open ? "mobile-open" : ""}`}>
      <div className="hp-sidebar-brand">
        <span className="hp-seal">HP</span>
        <div>
          <div className="name">HotelPro</div>
          <div className="tag">Admin ERP</div>
        </div>
      </div>

      <div className="py-2">
        {LINKS.map((group) => (
          <div key={group.section}>
            <div className="hp-nav-section">{group.section}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `hp-nav-link ${isActive ? "active" : ""}`}
                onClick={onClose}
              >
                <i className={`bi ${item.icon}`}></i>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div className="hp-nav-section">Session</div>
      <div className="px-3 pb-4">
        <div className="text-white-50 small mb-2">
          <i className="bi bi-person-circle me-2"></i>{user?.name}
        </div>
        <button
          className="btn btn-outline-gold btn-sm w-100"
          onClick={() => { logout(); navigate("/login"); }}
        >
          <i className="bi bi-box-arrow-right me-2"></i>Logout
        </button>
        <NavLink to="/" className="btn btn-dark-onyx btn-sm w-100 mt-2 border">
          <i className="bi bi-globe me-2"></i>View Public Site
        </NavLink>
      </div>
    </aside>
  );
}
