import { useMemo, useState } from "react";
import { db } from "../../services/storageService";
import { formatCurrency, formatDateTime } from "../../utils/validation";
import AdminLayout from "../../components/AdminLayout";
import StatusBadge from "../../components/StatusBadge";
import StatCard from "../../components/StatCard";

export default function Payments() {
  const [payments] = useState(db.getAll("payments"));
  const [methodFilter, setMethodFilter] = useState("All");

  const filtered = useMemo(() => {
    const sorted = [...payments].sort((a, b) => (a.date < b.date ? 1 : -1));
    return methodFilter === "All" ? sorted : sorted.filter((p) => p.method === methodFilter);
  }, [payments, methodFilter]);

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const byMethod = ["Cash", "Card", "UPI"].map((m) => ({
    method: m,
    total: payments.filter((p) => p.method === m).reduce((sum, p) => sum + p.amount, 0),
  }));

  return (
    <AdminLayout title="Payment Management" subtitle="Track transactions across cash, card and UPI">
      <div className="row g-3 mb-4">
        <div className="col-md-3"><StatCard label="Total Collected" value={formatCurrency(totalCollected)} icon="bi-cash-stack" /></div>
        {byMethod.map((m) => (
          <div className="col-md-3" key={m.method}><StatCard label={m.method} value={formatCurrency(m.total)} icon="bi-credit-card" /></div>
        ))}
      </div>

      <div className="hp-card">
        <div className="d-flex justify-content-between mb-3">
          <h6 className="display mb-0" style={{ fontSize: "1.05rem" }}>Transaction History</h6>
          <select className="form-select w-auto" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
            <option>All</option>
            <option>Cash</option><option>Card</option><option>UPI</option>
          </select>
        </div>
        <div className="table-responsive">
          <table className="table hp-table align-middle">
            <thead><tr><th>Transaction ID</th><th>Customer</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="fw-semibold">{p.transactionId}</td>
                  <td>{p.customerName}</td>
                  <td>{formatCurrency(p.amount)}</td>
                  <td>{p.method}</td>
                  <td className="small">{formatDateTime(p.date)}</td>
                  <td><StatusBadge status={p.status} /></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="6" className="text-center text-muted py-4">No transactions yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
