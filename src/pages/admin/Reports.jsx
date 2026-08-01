import { db } from "../../services/storageService";
import { formatCurrency } from "../../utils/validation";
import AdminLayout from "../../components/AdminLayout";
import StatCard from "../../components/StatCard";

export default function Reports() {
  const bills = db.getAll("bills");
  const orders = db.getAll("orders");
  const bookings = db.getAll("bookings");
  const menu = db.getAll("menu");

  const totalRevenue = bills.reduce((sum, b) => sum + b.total, 0);
  const avgBill = bills.length ? totalRevenue / bills.length : 0;

  const foodCounts = {};
  orders.forEach((o) => o.items.forEach((i) => { foodCounts[i.name] = (foodCounts[i.name] || 0) + i.qty; }));
  const topFood = Object.entries(foodCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxFoodQty = topFood.length ? topFood[0][1] : 1;

  const paymentMix = ["Cash", "Card", "UPI"].map((m) => ({
    method: m,
    total: bills.filter((b) => b.paymentMethod === m).reduce((sum, b) => sum + b.total, 0),
  }));
  const maxPayment = Math.max(1, ...paymentMix.map((p) => p.total));

  const bookingStatusCounts = ["Pending", "Confirmed", "Cancelled", "Completed"].map((s) => ({
    status: s, count: bookings.filter((b) => b.status === s).length,
  }));

  return (
    <AdminLayout title="Reports" subtitle="Revenue, food popularity and booking analytics">
      <div className="row g-3 mb-4">
        <div className="col-md-3"><StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} icon="bi-graph-up" /></div>
        <div className="col-md-3"><StatCard label="Avg. Bill Value" value={formatCurrency(avgBill)} icon="bi-receipt" /></div>
        <div className="col-md-3"><StatCard label="Total Orders" value={orders.length} icon="bi-bag-check" /></div>
        <div className="col-md-3"><StatCard label="Total Bookings" value={bookings.length} icon="bi-calendar3" /></div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="hp-card h-100">
            <h6 className="display mb-3" style={{ fontSize: "1.05rem" }}>Top Selling Dishes</h6>
            {topFood.length === 0 && <p className="text-muted small">No order data yet.</p>}
            {topFood.map(([name, qty]) => (
              <div key={name} className="mb-3">
                <div className="d-flex justify-content-between small mb-1"><span>{name}</span><span>{qty} sold</span></div>
                <div className="progress" style={{ height: 8 }}>
                  <div className="progress-bar" style={{ width: `${(qty / maxFoodQty) * 100}%`, background: "var(--gold)" }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="hp-card h-100">
            <h6 className="display mb-3" style={{ fontSize: "1.05rem" }}>Revenue by Payment Method</h6>
            {paymentMix.map((p) => (
              <div key={p.method} className="mb-3">
                <div className="d-flex justify-content-between small mb-1"><span>{p.method}</span><span>{formatCurrency(p.total)}</span></div>
                <div className="progress" style={{ height: 8 }}>
                  <div className="progress-bar" style={{ width: `${(p.total / maxPayment) * 100}%`, background: "var(--onyx)" }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="hp-card">
            <h6 className="display mb-3" style={{ fontSize: "1.05rem" }}>Booking Status Breakdown</h6>
            <div className="row text-center g-2">
              {bookingStatusCounts.map((s) => (
                <div className="col-3" key={s.status}>
                  <div className="fs-4 display">{s.count}</div>
                  <div className="text-muted small">{s.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="hp-card">
            <h6 className="display mb-3" style={{ fontSize: "1.05rem" }}>Menu Catalogue Size</h6>
            <div className="fs-4 display">{menu.length} dishes</div>
            <div className="text-muted small">Across {new Set(menu.map((m) => m.category)).size} categories</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
