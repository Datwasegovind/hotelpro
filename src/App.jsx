import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Menu from "./pages/Menu";
import Booking from "./pages/Booking";
import MyOrders from "./pages/MyOrders";

import Dashboard from "./pages/admin/Dashboard";
import Tables from "./pages/admin/Tables";
import Bookings from "./pages/admin/Bookings";
import Orders from "./pages/admin/Orders";
import MenuAdmin from "./pages/admin/MenuAdmin";
import Billing from "./pages/admin/Billing";
import Payments from "./pages/admin/Payments";
import Employees from "./pages/admin/Employees";
import Customers from "./pages/admin/Customers";
import Reports from "./pages/admin/Reports";

function NotFound() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: "100vh" }}>
      <span className="hp-seal mb-3">HP</span>
      <h1 className="display">404</h1>
      <p className="text-muted">This page doesn't exist.</p>
      <a href="/" className="btn btn-gold mt-2">Back to Home</a>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public / customer-facing */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/booking" element={<Booking />} />
      <Route
        path="/my-orders"
        element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/tables" element={<ProtectedRoute role="ADMIN"><Tables /></ProtectedRoute>} />
      <Route path="/admin/bookings" element={<ProtectedRoute role="ADMIN"><Bookings /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute role="ADMIN"><Orders /></ProtectedRoute>} />
      <Route path="/admin/menu" element={<ProtectedRoute role="ADMIN"><MenuAdmin /></ProtectedRoute>} />
      <Route path="/admin/billing" element={<ProtectedRoute role="ADMIN"><Billing /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute role="ADMIN"><Payments /></ProtectedRoute>} />
      <Route path="/admin/employees" element={<ProtectedRoute role="ADMIN"><Employees /></ProtectedRoute>} />
      <Route path="/admin/customers" element={<ProtectedRoute role="ADMIN"><Customers /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute role="ADMIN"><Reports /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
