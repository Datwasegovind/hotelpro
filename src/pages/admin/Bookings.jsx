import { useMemo, useState } from "react";
import { db } from "../../services/storageService";
import { useToast } from "../../context/ToastContext";
import AdminLayout from "../../components/AdminLayout";
import StatusBadge from "../../components/StatusBadge";
import { formatDate } from "../../utils/validation";

const STATUSES = ["Pending", "Confirmed", "Cancelled", "Completed"];

export default function Bookings() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState(db.getAll("bookings"));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  function refresh() {
    setBookings(db.getAll("bookings"));
  }

  function setStatus(b, status) {
    db.update("bookings", b.id, { status });
    if (status === "Confirmed") db.update("tables", b.tableId, { status: "Reserved" });
    if (status === "Cancelled") db.update("tables", b.tableId, { status: "Available" });
    if (status === "Completed") db.update("tables", b.tableId, { status: "Available" });
    refresh();
    showToast(`Booking ${b.id} marked ${status}`, "success");
  }

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch = b.customerName.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, search, statusFilter]);

  return (
    <AdminLayout title="Table Reservations" subtitle="Confirm, cancel or complete guest bookings">
      <div className="hp-card">
        <div className="d-flex flex-wrap gap-2 justify-content-between mb-3">
          <input className="form-control" style={{ maxWidth: 280 }} placeholder="Search guest or booking ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="form-select" style={{ maxWidth: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="table-responsive">
          <table className="table hp-table align-middle">
            <thead>
              <tr><th>Booking ID</th><th>Guest</th><th>Contact</th><th>Table</th><th>Date</th><th>Time</th><th>Guests</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td className="fw-semibold">{b.id}</td>
                  <td>{b.customerName}</td>
                  <td>{b.contact}</td>
                  <td>Table {b.tableNumber}</td>
                  <td>{formatDate(b.date)}</td>
                  <td>{b.time}</td>
                  <td>{b.guests}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td>
                    <select className="form-select form-select-sm" value={b.status} onChange={(e) => setStatus(b, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="9" className="text-center text-muted py-4">No reservations found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
