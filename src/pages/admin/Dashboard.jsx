import { db } from "../../services/storageService";
import { formatCurrency } from "../../utils/validation";
import AdminLayout from "../../components/AdminLayout";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const tables = db.getAll("tables");
  const bookings = db.getAll("bookings");
  const customers = db.getAll("customers");
  const orders = db.getAll("orders");
  const bills = db.getAll("bills");

  const totalTables = tables.length;
  const available = tables.filter((t) => t.status === "Available").length;
  const reserved = tables.filter((t) => t.status === "Reserved").length;
  const occupied = tables.filter((t) => t.status === "Occupied").length;
  const todaysBookings = bookings.filter((b) => b.date === todayStr()).length;

  const todaysRevenue = bills
    .filter((b) => (b.date || "").slice(0, 10) === todayStr())
    .reduce((sum, b) => sum + b.total, 0);

  const monthKey = todayStr().slice(0, 7);
  const monthlyRevenue = bills
    .filter((b) => (b.date || "").slice(0, 7) === monthKey)
    .reduce((sum, b) => sum + b.total, 0);

  const occupancyPct = totalTables ? Math.round(((occupied + reserved) / totalTables) * 100) : 0;

  const recentOrders = [...orders].sort((a, b) => (a.orderTime < b.orderTime ? 1 : -1)).slice(0, 5);
  const recentBookings = [...bookings].sort((a, b) => (a.id < b.id ? 1 : -1)).slice(0, 5);

  const menuAll = db.getAll("menu");
  const categoryCounts = menuAll.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <AdminLayout title="Dashboard" subtitle="Live snapshot of tables, orders and revenue">
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><StatCard label="Total Tables" value={totalTables} icon="bi-grid-3x3-gap" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Available" value={available} icon="bi-check-circle" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Reserved" value={reserved} icon="bi-calendar-check" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Occupied" value={occupied} icon="bi-people-fill" /></div>
      </div>
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><StatCard label="Today Reservations" value={todaysBookings} icon="bi-journal-check" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Total Customers" value={customers.length} icon="bi-person-lines-fill" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Total Orders" value={orders.length} icon="bi-receipt" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Today Revenue" value={formatCurrency(todaysRevenue)} icon="bi-cash-stack" /></div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-4">
          <div className="hp-card h-100">
            <div className="label text-muted small text-uppercase mb-2">Monthly Revenue</div>
            <div className="display" style={{ fontSize: "1.8rem" }}>{formatCurrency(monthlyRevenue)}</div>
            <div className="text-success small mt-1"><i className="bi bi-graph-up-arrow me-1"></i>Across {bills.length} settled bills</div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="hp-card h-100">
            <div className="label text-muted small text-uppercase mb-2">Table Occupancy</div>
            <div className="display" style={{ fontSize: "1.8rem" }}>{occupancyPct}%</div>
            <div className="progress mt-2" style={{ height: 8 }}>
              <div className="progress-bar" style={{ width: `${occupancyPct}%`, background: "var(--gold)" }}></div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="hp-card h-100">
            <div className="label text-muted small text-uppercase mb-3">Menu Mix</div>
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <div key={cat} className="mb-2">
                <div className="d-flex justify-content-between small mb-1"><span>{cat}</span><span>{count}</span></div>
                <div className="progress" style={{ height: 6 }}>
                  <div className="progress-bar" style={{ width: `${(count / menuAll.length) * 100}%`, background: "var(--onyx)" }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="hp-card">
            <h6 className="display mb-3" style={{ fontSize: "1.05rem" }}>Recent Orders</h6>
            <table className="table hp-table">
              <thead><tr><th>ID</th><th>Table</th><th>Status</th></tr></thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}><td>{o.id}</td><td>Table {o.tableNumber}</td><td><StatusBadge status={o.status} /></td></tr>
                ))}
                {recentOrders.length === 0 && <tr><td colSpan="3" className="text-muted text-center py-3">No orders yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="hp-card">
            <h6 className="display mb-3" style={{ fontSize: "1.05rem" }}>Recent Reservations</h6>
            <table className="table hp-table">
              <thead><tr><th>ID</th><th>Guest</th><th>Status</th></tr></thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id}><td>{b.id}</td><td>{b.customerName}</td><td><StatusBadge status={b.status} /></td></tr>
                ))}
                {recentBookings.length === 0 && <tr><td colSpan="3" className="text-muted text-center py-3">No reservations yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
