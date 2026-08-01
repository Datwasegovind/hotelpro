import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function PublicNavbar() {
  const { user, logout, isAdmin } = useAuth();
  const { totalQty } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="hp-public-nav">
      <div className="container d-flex align-items-center justify-content-between">
        <NavLink to="/" className="d-flex align-items-center gap-2">
          <span className="hp-seal">HP</span>
          <div>
            <div className="text-white display" style={{ fontSize: "1.05rem", lineHeight: 1 }}>HotelPro</div>
            <div className="text-gold" style={{ fontSize: "0.6rem", letterSpacing: "0.18em" }}>FINE DINING &amp; STAY</div>
          </div>
        </NavLink>

        <div className="d-none d-lg-flex align-items-center gap-4">
          <NavLink to="/" end className="nav-link">Home</NavLink>
          <NavLink to="/menu" className="nav-link">Menu</NavLink>
          <NavLink to="/booking" className="nav-link">Book a Table</NavLink>
          {user && !isAdmin && <NavLink to="/my-orders" className="nav-link">My Orders</NavLink>}
        </div>

        <div className="d-flex align-items-center gap-3">
          <NavLink to="/menu" className="position-relative text-gold" title="Cart">
            <i className="bi bi-basket3 fs-5"></i>
            {totalQty > 0 && (
              <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle" style={{ fontSize: "0.6rem" }}>
                {totalQty}
              </span>
            )}
          </NavLink>
          {!user && (
            <>
              <NavLink to="/login" className="btn btn-outline-gold btn-sm">Login</NavLink>
              <NavLink to="/register" className="btn btn-gold btn-sm">Register</NavLink>
            </>
          )}
          {user && isAdmin && (
            <NavLink to="/admin/dashboard" className="btn btn-gold btn-sm">Admin Panel</NavLink>
          )}
          {user && !isAdmin && (
            <div className="dropdown">
              <button className="btn btn-outline-gold btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                <i className="bi bi-person-circle me-1"></i>{user.name.split(" ")[0]}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><NavLink className="dropdown-item" to="/my-orders">My Orders</NavLink></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={() => { logout(); navigate("/"); }}>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
