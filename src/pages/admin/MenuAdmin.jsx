import { useMemo, useState } from "react";
import { db } from "../../services/storageService";
import { useToast } from "../../context/ToastContext";
import { validate, rules, formatCurrency } from "../../utils/validation";
import AdminLayout from "../../components/AdminLayout";
import Modal from "../../components/Modal";

const CATEGORIES = ["Indian Food", "Chinese", "Fast Food", "Beverages", "Desserts", "Special Items"];
const EMPTY = { name: "", category: "Indian Food", description: "", price: "", emoji: "🍽️", available: true };

export default function MenuAdmin() {
  const { showToast } = useToast();
  const [menu, setMenu] = useState(db.getAll("menu"));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  function refresh() {
    setMenu(db.getAll("menu"));
  }

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setShowModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({ ...item });
    setErrors({});
    setShowModal(true);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSave(e) {
    e.preventDefault();
    const errs = validate(form, {
      name: [rules.required("Food name")],
      price: [rules.required("Price"), rules.positive("Price")],
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const payload = { ...form, price: Number(form.price) };
    if (editing) {
      db.update("menu", editing.id, payload);
      showToast(`${payload.name} updated`, "success");
    } else {
      db.insert("menu", payload, "F");
      showToast(`${payload.name} added to menu`, "success");
    }
    refresh();
    setShowModal(false);
  }

  function handleDelete() {
    db.remove("menu", deleteTarget.id);
    showToast(`${deleteTarget.name} removed from menu`, "success");
    setDeleteTarget(null);
    refresh();
  }

  const filtered = useMemo(() => {
    return menu.filter((f) => {
      const matchCat = category === "All" || f.category === category;
      const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menu, category, search]);

  return (
    <AdminLayout
      title="Menu Management"
      subtitle="Add, edit and organise dishes across categories"
      actions={<button className="btn btn-gold btn-sm" onClick={openAdd}><i className="bi bi-plus-lg me-1"></i>Add Food Item</button>}
    >
      <div className="hp-card">
        <div className="d-flex flex-wrap gap-2 justify-content-between mb-3">
          <input className="form-control" style={{ maxWidth: 280 }} placeholder="Search dishes..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="form-select" style={{ maxWidth: 220 }} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>All</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="table-responsive">
          <table className="table hp-table align-middle">
            <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td style={{ fontSize: "1.3rem" }}>{f.emoji}</td>
                  <td className="fw-semibold">{f.name}<div className="text-muted small fw-normal">{f.description}</div></td>
                  <td>{f.category}</td>
                  <td>{formatCurrency(f.price)}</td>
                  <td>{f.available ? <span className="hp-badge available">Available</span> : <span className="hp-badge unavailable">Sold Out</span>}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEdit(f)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(f)}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="6" className="text-center text-muted py-4">No dishes found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} title={editing ? "Edit Food Item" : "Add Food Item"} onClose={() => setShowModal(false)}
        footer={<>
          <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-gold" onClick={handleSave}>Save Item</button>
        </>}
      >
        <form onSubmit={handleSave} noValidate>
          <div className="row g-3">
            <div className="col-8">
              <label className="form-label small">Food Name</label>
              <input name="name" className={`form-control ${errors.name ? "is-invalid" : ""}`} value={form.name} onChange={handleChange} />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
            <div className="col-4">
              <label className="form-label small">Emoji Icon</label>
              <input name="emoji" className="form-control" value={form.emoji} onChange={handleChange} />
            </div>
            <div className="col-12">
              <label className="form-label small">Description</label>
              <textarea name="description" className="form-control" rows="2" value={form.description} onChange={handleChange} />
            </div>
            <div className="col-6">
              <label className="form-label small">Category</label>
              <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-6">
              <label className="form-label small">Price (₹)</label>
              <input type="number" name="price" className={`form-control ${errors.price ? "is-invalid" : ""}`} value={form.price} onChange={handleChange} />
              {errors.price && <div className="invalid-feedback">{errors.price}</div>}
            </div>
            <div className="col-12 form-check ms-1">
              <input type="checkbox" className="form-check-input" id="available" name="available" checked={form.available} onChange={handleChange} />
              <label className="form-check-label small" htmlFor="available">Currently available</label>
            </div>
          </div>
        </form>
      </Modal>

      <Modal show={!!deleteTarget} title="Remove Food Item" onClose={() => setDeleteTarget(null)}
        footer={<>
          <button className="btn btn-outline-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </>}
      >
        <p className="mb-0">Remove <strong>{deleteTarget?.name}</strong> from the menu?</p>
      </Modal>
    </AdminLayout>
  );
}
