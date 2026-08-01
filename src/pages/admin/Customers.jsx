import { useState } from "react";
import { db } from "../../services/storageService";
import { useToast } from "../../context/ToastContext";
import { validate, rules } from "../../utils/validation";
import AdminLayout from "../../components/AdminLayout";
import Modal from "../../components/Modal";

const EMPTY = { name: "", mobile: "", email: "", address: "", totalVisits: 0 };

export default function Customers() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState(db.getAll("customers"));
  const [orders] = useState(db.getAll("orders"));
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);

  function refresh() {
    setCustomers(db.getAll("customers"));
  }
  function openAdd() { setEditing(null); setForm(EMPTY); setErrors({}); setShowModal(true); }
  function openEdit(c) { setEditing(c); setForm({ ...c }); setErrors({}); setShowModal(true); }
  function handleChange(e) { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); }

  function handleSave(e) {
    e.preventDefault();
    const errs = validate(form, {
      name: [rules.required("Name")],
      mobile: [rules.required("Mobile"), rules.mobile],
      email: [rules.required("Email"), rules.email],
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const payload = { ...form, totalVisits: Number(form.totalVisits) || 0 };
    if (editing) {
      db.update("customers", editing.id, payload);
      showToast(`${payload.name} updated`, "success");
    } else {
      db.insert("customers", payload, "C");
      showToast(`${payload.name} added`, "success");
    }
    refresh();
    setShowModal(false);
  }
  function handleDelete() {
    db.remove("customers", deleteTarget.id);
    showToast(`${deleteTarget.name} removed`, "success");
    setDeleteTarget(null);
    refresh();
  }

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search));

  return (
    <AdminLayout
      title="Customer Management"
      subtitle={`${customers.length} guests on file`}
      actions={<button className="btn btn-gold btn-sm" onClick={openAdd}><i className="bi bi-plus-lg me-1"></i>Add Customer</button>}
    >
      <div className="hp-card">
        <input className="form-control mb-3" style={{ maxWidth: 300 }} placeholder="Search by name or mobile..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="table-responsive">
          <table className="table hp-table align-middle">
            <thead><tr><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Visits</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="fw-semibold">{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.mobile}</td>
                  <td>{c.email}</td>
                  <td>{c.totalVisits}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-gold me-1" onClick={() => setHistoryTarget(c)}><i className="bi bi-clock-history"></i></button>
                    <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEdit(c)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(c)}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="6" className="text-center text-muted py-4">No customers found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} title={editing ? "Edit Customer" : "Add Customer"} onClose={() => setShowModal(false)}
        footer={<>
          <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-gold" onClick={handleSave}>Save Customer</button>
        </>}
      >
        <form onSubmit={handleSave} noValidate>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label small">Full Name</label>
              <input name="name" className={`form-control ${errors.name ? "is-invalid" : ""}`} value={form.name} onChange={handleChange} />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
            <div className="col-6">
              <label className="form-label small">Mobile</label>
              <input name="mobile" className={`form-control ${errors.mobile ? "is-invalid" : ""}`} value={form.mobile} onChange={handleChange} />
              {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
            </div>
            <div className="col-6">
              <label className="form-label small">Email</label>
              <input name="email" className={`form-control ${errors.email ? "is-invalid" : ""}`} value={form.email} onChange={handleChange} />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div className="col-12">
              <label className="form-label small">Address</label>
              <input name="address" className="form-control" value={form.address} onChange={handleChange} />
            </div>
          </div>
        </form>
      </Modal>

      <Modal show={!!deleteTarget} title="Remove Customer" onClose={() => setDeleteTarget(null)}
        footer={<>
          <button className="btn btn-outline-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </>}
      >
        <p className="mb-0">Remove <strong>{deleteTarget?.name}</strong> from customer records?</p>
      </Modal>

      <Modal show={!!historyTarget} title={`Booking History — ${historyTarget?.name}`} onClose={() => setHistoryTarget(null)}>
        {historyTarget && (
          <ul className="list-unstyled small mb-0">
            {orders.filter((o) => o.customerName === historyTarget.name).map((o) => (
              <li key={o.id} className="border-bottom py-2">{o.id} · Table {o.tableNumber} · {o.status}</li>
            ))}
            {orders.filter((o) => o.customerName === historyTarget.name).length === 0 && <li className="text-muted py-2">No order history yet.</li>}
          </ul>
        )}
      </Modal>
    </AdminLayout>
  );
}
