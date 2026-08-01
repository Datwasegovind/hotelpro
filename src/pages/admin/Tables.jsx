import { useState } from "react";
import { db } from "../../services/storageService";
import { useToast } from "../../context/ToastContext";
import { validate, rules } from "../../utils/validation";
import AdminLayout from "../../components/AdminLayout";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";

const STATUSES = ["Available", "Reserved", "Occupied", "Cleaning", "Maintenance"];
const TYPES = ["Indoor", "Outdoor", "Window", "Balcony", "Family", "Banquet"];
const EMPTY = { number: "", floor: 1, capacity: 2, type: "Indoor", status: "Available" };

export default function Tables() {
  const { showToast } = useToast();
  const [tables, setTables] = useState(db.getAll("tables"));
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [floorFilter, setFloorFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState(null);

  function refresh() {
    setTables(db.getAll("tables"));
  }

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setShowModal(true);
  }

  function openEdit(t) {
    setEditing(t);
    setForm({ number: t.number, floor: t.floor, capacity: t.capacity, type: t.type, status: t.status });
    setErrors({});
    setShowModal(true);
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSave(e) {
    e.preventDefault();
    const errs = validate(form, {
      number: [rules.required("Table number"), rules.positive("Table number")],
      capacity: [rules.required("Capacity"), rules.positive("Capacity")],
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const payload = {
      number: Number(form.number),
      floor: Number(form.floor),
      capacity: Number(form.capacity),
      type: form.type,
      status: form.status,
    };

    if (editing) {
      db.update("tables", editing.id, payload);
      showToast(`Table ${payload.number} updated`, "success");
    } else {
      db.insert("tables", payload, "T");
      showToast(`Table ${payload.number} added`, "success");
    }
    refresh();
    setShowModal(false);
  }

  function handleDelete() {
    db.remove("tables", deleteTarget.id);
    showToast(`Table ${deleteTarget.number} deleted`, "success");
    setDeleteTarget(null);
    refresh();
  }

  function quickStatus(t, status) {
    db.update("tables", t.id, { status });
    refresh();
    showToast(`Table ${t.number} marked ${status}`, "info");
  }

  const floors = ["All", ...new Set(tables.map((t) => t.floor))];
  const visible = floorFilter === "All" ? tables : tables.filter((t) => t.floor === Number(floorFilter));

  return (
    <AdminLayout
      title="Table Management"
      subtitle="Manage seating, floor layout &amp; live status"
      actions={<button className="btn btn-gold btn-sm" onClick={openAdd}><i className="bi bi-plus-lg me-1"></i>Add Table</button>}
    >
      <div className="hp-card mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="display mb-0" style={{ fontSize: "1.05rem" }}>Floor Layout</h6>
          <select className="form-select form-select-sm w-auto" value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)}>
            {floors.map((f) => <option key={f} value={f}>{f === "All" ? "All Floors" : `Floor ${f}`}</option>)}
          </select>
        </div>
        <div className="d-flex flex-wrap gap-3">
          {visible.map((t) => (
            <div
              key={t.id}
              className={`hp-floor-table ${t.status.toLowerCase()}`}
              onClick={() => openEdit(t)}
              title={`Table ${t.number} — ${t.status}`}
            >
              <div className="dot"></div>
              <div className="fw-semibold">T{t.number}</div>
              <div style={{ fontSize: "0.65rem" }} className="text-muted">Seats {t.capacity}</div>
            </div>
          ))}
        </div>
        <div className="d-flex gap-3 mt-3 small text-muted flex-wrap">
          {STATUSES.map((s) => (
            <span key={s}><span className={`dot d-inline-block rounded-circle me-1`} style={{ width: 8, height: 8, background: `var(--${s === "Available" ? "success" : s === "Reserved" ? "warning" : s === "Occupied" ? "danger" : s === "Cleaning" ? "info" : "muted"})` }}></span>{s}</span>
          ))}
        </div>
      </div>

      <div className="hp-card">
        <div className="table-responsive">
          <table className="table hp-table align-middle">
            <thead>
              <tr><th>Table #</th><th>Floor</th><th>Type</th><th>Capacity</th><th>Status</th><th>Quick Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {tables.map((t) => (
                <tr key={t.id}>
                  <td className="fw-semibold">Table {t.number}</td>
                  <td>{t.floor}</td>
                  <td>{t.type}</td>
                  <td>{t.capacity}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>
                    <select className="form-select form-select-sm" value={t.status} onChange={(e) => quickStatus(t, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEdit(t)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(t)}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}
              {tables.length === 0 && <tr><td colSpan="7" className="text-center text-muted py-4">No tables yet — add your first one.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} title={editing ? "Edit Table" : "Add New Table"} onClose={() => setShowModal(false)}
        footer={<>
          <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-gold" onClick={handleSave}>Save Table</button>
        </>}
      >
        <form onSubmit={handleSave} noValidate>
          <div className="row g-3">
            <div className="col-6">
              <label className="form-label small">Table Number</label>
              <input type="number" name="number" className={`form-control ${errors.number ? "is-invalid" : ""}`} value={form.number} onChange={handleChange} />
              {errors.number && <div className="invalid-feedback">{errors.number}</div>}
            </div>
            <div className="col-6">
              <label className="form-label small">Floor</label>
              <input type="number" name="floor" className="form-control" value={form.floor} onChange={handleChange} />
            </div>
            <div className="col-6">
              <label className="form-label small">Seating Capacity</label>
              <input type="number" name="capacity" className={`form-control ${errors.capacity ? "is-invalid" : ""}`} value={form.capacity} onChange={handleChange} />
              {errors.capacity && <div className="invalid-feedback">{errors.capacity}</div>}
            </div>
            <div className="col-6">
              <label className="form-label small">Table Type</label>
              <select name="type" className="form-select" value={form.type} onChange={handleChange}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label small">Status</label>
              <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <Modal show={!!deleteTarget} title="Delete Table" onClose={() => setDeleteTarget(null)}
        footer={<>
          <button className="btn btn-outline-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </>}
      >
        <p className="mb-0">Are you sure you want to delete <strong>Table {deleteTarget?.number}</strong>? This cannot be undone.</p>
      </Modal>
    </AdminLayout>
  );
}
