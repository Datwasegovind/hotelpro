import { useState } from "react";
import { db } from "../../services/storageService";
import { useToast } from "../../context/ToastContext";
import { validate, rules, formatCurrency, formatDate } from "../../utils/validation";
import AdminLayout from "../../components/AdminLayout";
import Modal from "../../components/Modal";

const ROLES = ["Manager", "Waiter", "Chef", "Receptionist"];
const EMPTY = { name: "", mobile: "", role: "Waiter", salary: "", joiningDate: new Date().toISOString().slice(0, 10) };

export default function Employees() {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState(db.getAll("employees"));
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  function refresh() {
    setEmployees(db.getAll("employees"));
  }

  function openAdd() {
    setEditing(null); setForm(EMPTY); setErrors({}); setShowModal(true);
  }
  function openEdit(e) {
    setEditing(e); setForm({ ...e }); setErrors({}); setShowModal(true);
  }
  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }
  function handleSave(e) {
    e.preventDefault();
    const errs = validate(form, {
      name: [rules.required("Name")],
      mobile: [rules.required("Mobile"), rules.mobile],
      salary: [rules.required("Salary"), rules.positive("Salary")],
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const payload = { ...form, salary: Number(form.salary) };
    if (editing) {
      db.update("employees", editing.id, payload);
      showToast(`${payload.name} updated`, "success");
    } else {
      db.insert("employees", payload, "E");
      showToast(`${payload.name} added`, "success");
    }
    refresh();
    setShowModal(false);
  }
  function handleDelete() {
    db.remove("employees", deleteTarget.id);
    showToast(`${deleteTarget.name} removed`, "success");
    setDeleteTarget(null);
    refresh();
  }

  const filtered = employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase()));
  const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);

  return (
    <AdminLayout
      title="Employee Management"
      subtitle={`${employees.length} staff · Monthly payroll ${formatCurrency(totalPayroll)}`}
      actions={<button className="btn btn-gold btn-sm" onClick={openAdd}><i className="bi bi-plus-lg me-1"></i>Add Employee</button>}
    >
      <div className="hp-card">
        <input className="form-control mb-3" style={{ maxWidth: 300 }} placeholder="Search by name or role..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="table-responsive">
          <table className="table hp-table align-middle">
            <thead><tr><th>Employee ID</th><th>Name</th><th>Mobile</th><th>Role</th><th>Salary</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td className="fw-semibold">{e.id}</td>
                  <td>{e.name}</td>
                  <td>{e.mobile}</td>
                  <td><span className="hp-badge available">{e.role}</span></td>
                  <td>{formatCurrency(e.salary)}</td>
                  <td>{formatDate(e.joiningDate)}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEdit(e)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(e)}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="7" className="text-center text-muted py-4">No employees found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} title={editing ? "Edit Employee" : "Add Employee"} onClose={() => setShowModal(false)}
        footer={<>
          <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-gold" onClick={handleSave}>Save Employee</button>
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
              <label className="form-label small">Role</label>
              <select name="role" className="form-select" value={form.role} onChange={handleChange}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="col-6">
              <label className="form-label small">Salary (₹/month)</label>
              <input type="number" name="salary" className={`form-control ${errors.salary ? "is-invalid" : ""}`} value={form.salary} onChange={handleChange} />
              {errors.salary && <div className="invalid-feedback">{errors.salary}</div>}
            </div>
            <div className="col-6">
              <label className="form-label small">Joining Date</label>
              <input type="date" name="joiningDate" className="form-control" value={form.joiningDate} onChange={handleChange} />
            </div>
          </div>
        </form>
      </Modal>

      <Modal show={!!deleteTarget} title="Remove Employee" onClose={() => setDeleteTarget(null)}
        footer={<>
          <button className="btn btn-outline-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </>}
      >
        <p className="mb-0">Remove <strong>{deleteTarget?.name}</strong> from staff records?</p>
      </Modal>
    </AdminLayout>
  );
}
