import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/storageService";
import { useToast } from "../../context/ToastContext";
import { formatCurrency, formatDateTime } from "../../utils/validation";
import AdminLayout from "../../components/AdminLayout";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";

const STATUSES = ["Preparing", "Ready", "Served", "Completed"];

function orderTotal(order) {
  return order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export default function Orders() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(db.getAll("orders"));
  const [statusFilter, setStatusFilter] = useState("All");
  const [newOrderModal, setNewOrderModal] = useState(false);
  const [cart, setCart] = useState([]);
  const [tableId, setTableId] = useState("");
  const [customerName, setCustomerName] = useState("Walk-in Guest");

  const menu = db.getAll("menu").filter((m) => m.available);
  const tables = db.getAll("tables");

  function refresh() {
    setOrders(db.getAll("orders"));
  }

  function setStatus(o, status) {
    db.update("orders", o.id, { status });
    refresh();
    showToast(`Order ${o.id} marked ${status}`, "success");
  }

  function addToCart(food) {
    setCart((prev) => {
      const found = prev.find((i) => i.foodId === food.id);
      if (found) return prev.map((i) => (i.foodId === food.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { foodId: food.id, name: food.name, price: food.price, qty: 1 }];
    });
  }

  function updateCartQty(foodId, qty) {
    if (qty <= 0) return setCart((prev) => prev.filter((i) => i.foodId !== foodId));
    setCart((prev) => prev.map((i) => (i.foodId === foodId ? { ...i, qty } : i)));
  }

  function submitOrder() {
    if (!tableId) return showToast("Select a table for this order", "error");
    if (!cart.length) return showToast("Add at least one item", "error");
    const table = tables.find((t) => t.id === tableId);
    db.insert("orders", {
      tableId,
      tableNumber: table.number,
      customerName: customerName || "Walk-in Guest",
      items: cart,
      orderTime: new Date().toISOString(),
      status: "Preparing",
    }, "O");
    db.update("tables", tableId, { status: "Occupied" });
    setCart([]);
    setTableId("");
    setCustomerName("Walk-in Guest");
    setNewOrderModal(false);
    refresh();
    showToast("Order created", "success");
  }

  const filtered = useMemo(() => {
    return statusFilter === "All" ? orders : orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <AdminLayout
      title="Food Orders"
      subtitle="POS-style order creation and kitchen status tracking"
      actions={<button className="btn btn-gold btn-sm" onClick={() => setNewOrderModal(true)}><i className="bi bi-plus-lg me-1"></i>New Order</button>}
    >
      <div className="hp-card">
        <div className="d-flex justify-content-between mb-3">
          <select className="form-select w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="table-responsive">
          <table className="table hp-table align-middle">
            <thead><tr><th>Order ID</th><th>Table</th><th>Customer</th><th>Items</th><th>Total</th><th>Time</th><th>Status</th><th>Bill</th></tr></thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td className="fw-semibold">{o.id}</td>
                  <td>Table {o.tableNumber}</td>
                  <td>{o.customerName}</td>
                  <td className="small">{o.items.map((i) => `${i.name} x${i.qty}`).join(", ")}</td>
                  <td>{formatCurrency(orderTotal(o))}</td>
                  <td className="small">{formatDateTime(o.orderTime)}</td>
                  <td>
                    <select className="form-select form-select-sm" value={o.status} onChange={(e) => setStatus(o, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-gold" onClick={() => navigate(`/admin/billing?orderId=${o.id}`)}>
                      Generate
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="8" className="text-center text-muted py-4">No orders found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={newOrderModal} title="Create New Order" size="lg" onClose={() => setNewOrderModal(false)}
        footer={<>
          <button className="btn btn-outline-secondary" onClick={() => setNewOrderModal(false)}>Cancel</button>
          <button className="btn btn-gold" onClick={submitOrder}>Submit Order ({formatCurrency(cartTotal)})</button>
        </>}
      >
        <div className="row g-3 mb-3">
          <div className="col-6">
            <label className="form-label small">Table</label>
            <select className="form-select" value={tableId} onChange={(e) => setTableId(e.target.value)}>
              <option value="">Select table...</option>
              {tables.map((t) => <option key={t.id} value={t.id}>Table {t.number}</option>)}
            </select>
          </div>
          <div className="col-6">
            <label className="form-label small">Customer Name</label>
            <input className="form-control" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
        </div>
        <div className="row">
          <div className="col-7" style={{ maxHeight: 320, overflowY: "auto" }}>
            {menu.map((f) => (
              <div key={f.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                <div className="small">
                  <div className="fw-semibold">{f.emoji} {f.name}</div>
                  <div className="text-muted">{formatCurrency(f.price)}</div>
                </div>
                <button className="btn btn-sm btn-dark-onyx" onClick={() => addToCart(f)}>Add</button>
              </div>
            ))}
          </div>
          <div className="col-5">
            <div className="small text-muted text-uppercase mb-2">Cart</div>
            {cart.length === 0 && <p className="text-muted small">No items added.</p>}
            {cart.map((i) => (
              <div key={i.foodId} className="d-flex justify-content-between align-items-center mb-2 small">
                <span>{i.name}</span>
                <div className="d-flex align-items-center gap-1">
                  <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => updateCartQty(i.foodId, i.qty - 1)}>-</button>
                  <span>{i.qty}</span>
                  <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => updateCartQty(i.foodId, i.qty + 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
