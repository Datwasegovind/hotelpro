import { useAuth } from "../context/AuthContext";
import { db } from "../services/storageService";
import { formatCurrency, formatDateTime } from "../utils/validation";
import StatusBadge from "../components/StatusBadge";
import PublicNavbar from "../components/PublicNavbar";
import Footer from "../components/Footer";

export default function MyOrders() {
  const { user } = useAuth();
  const allOrders = db.getAll("orders");
  const allBookings = db.getAll("bookings");
  const allBills = db.getAll("bills");

  const myOrders = allOrders.filter((o) => o.customerName === user.name).sort((a, b) => (a.orderTime < b.orderTime ? 1 : -1));
  const myBookings = allBookings.filter((b) => b.customerName === user.name);
  const myBills = allBills.filter((b) => b.customerName === user.name);

  function orderTotal(order) {
    return order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  return (
    <div>
      <PublicNavbar />
      <section className="bg-onyx py-5">
        <div className="container text-center text-white">
          <div className="eyebrow text-gold mb-2" style={{ letterSpacing: "0.2em", fontSize: "0.75rem" }}>YOUR ACCOUNT</div>
          <h1 className="display">My Orders &amp; Bookings</h1>
        </div>
      </section>

      <div className="container py-5">
        <h5 className="display mb-3" style={{ fontSize: "1.2rem" }}><i className="bi bi-receipt me-2 text-gold"></i>Orders</h5>
        <div className="table-responsive mb-5">
          <table className="table hp-table align-middle">
            <thead><tr><th>Order ID</th><th>Table</th><th>Items</th><th>Total</th><th>Placed</th><th>Status</th></tr></thead>
            <tbody>
              {myOrders.length === 0 && <tr><td colSpan="6" className="text-muted text-center py-4">No orders yet — visit the menu to place one.</td></tr>}
              {myOrders.map((o) => (
                <tr key={o.id}>
                  <td className="fw-semibold">{o.id}</td>
                  <td>Table {o.tableNumber}</td>
                  <td>{o.items.map((i) => `${i.name} x${i.qty}`).join(", ")}</td>
                  <td>{formatCurrency(orderTotal(o))}</td>
                  <td>{formatDateTime(o.orderTime)}</td>
                  <td><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h5 className="display mb-3" style={{ fontSize: "1.2rem" }}><i className="bi bi-calendar-check me-2 text-gold"></i>Table Reservations</h5>
        <div className="table-responsive mb-5">
          <table className="table hp-table align-middle">
            <thead><tr><th>Booking ID</th><th>Table</th><th>Date</th><th>Time</th><th>Guests</th><th>Status</th></tr></thead>
            <tbody>
              {myBookings.length === 0 && <tr><td colSpan="6" className="text-muted text-center py-4">No reservations yet.</td></tr>}
              {myBookings.map((b) => (
                <tr key={b.id}>
                  <td className="fw-semibold">{b.id}</td>
                  <td>Table {b.tableNumber}</td>
                  <td>{b.date}</td>
                  <td>{b.time}</td>
                  <td>{b.guests}</td>
                  <td><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h5 className="display mb-3" style={{ fontSize: "1.2rem" }}><i className="bi bi-file-earmark-text me-2 text-gold"></i>Bills</h5>
        <div className="table-responsive">
          <table className="table hp-table align-middle">
            <thead><tr><th>Invoice</th><th>Table</th><th>Total</th><th>Payment</th><th>Date</th></tr></thead>
            <tbody>
              {myBills.length === 0 && <tr><td colSpan="5" className="text-muted text-center py-4">No bills yet.</td></tr>}
              {myBills.map((b) => (
                <tr key={b.id}>
                  <td className="fw-semibold">{b.id}</td>
                  <td>Table {b.tableNumber}</td>
                  <td>{formatCurrency(b.total)}</td>
                  <td>{b.paymentMethod}</td>
                  <td>{formatDateTime(b.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
}
