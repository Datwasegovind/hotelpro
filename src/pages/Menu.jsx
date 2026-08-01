import { useMemo, useState } from "react";
import { db } from "../services/storageService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/validation";
import PublicNavbar from "../components/PublicNavbar";
import Footer from "../components/Footer";

const CATEGORIES = ["All", "Indian Food", "Chinese", "Fast Food", "Beverages", "Desserts", "Special Items"];

export default function Menu() {
  const allFood = db.getAll("menu");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const { items, addItem, removeItem, updateQty, subtotal, tableNumber, setTableNumber, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const tables = db.getAll("tables").filter((t) => t.status === "Available");

  const filtered = useMemo(() => {
    return allFood.filter((f) => {
      const matchCat = category === "All" || f.category === category;
      const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allFood, category, search]);

  function placeOrder() {
    if (!user) {
      showToast("Please login to place an order", "error");
      navigate("/login");
      return;
    }
    if (!items.length) {
      showToast("Your cart is empty", "error");
      return;
    }
    if (!tableNumber) {
      showToast("Please select a table for your order", "error");
      return;
    }
    const table = tables.find((t) => String(t.number) === String(tableNumber));
    db.insert("orders", {
      tableId: table ? table.id : null,
      tableNumber: Number(tableNumber),
      customerName: user.name,
      items: items.map((i) => ({ foodId: i.foodId, name: i.name, qty: i.qty, price: i.price })),
      orderTime: new Date().toISOString(),
      status: "Preparing",
    }, "O");
    clearCart();
    showToast("Order placed! Track it under My Orders.", "success");
    navigate("/my-orders");
  }

  return (
    <div>
      <PublicNavbar />

      <section className="bg-onyx py-5">
        <div className="container text-center text-white">
          <div className="eyebrow text-gold mb-2" style={{ letterSpacing: "0.2em", fontSize: "0.75rem" }}>THE MENU</div>
          <h1 className="display">Crafted, Plated, Served</h1>
        </div>
      </section>

      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="d-flex flex-wrap gap-2 mb-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`btn btn-sm ${category === c ? "btn-gold" : "btn-outline-gold"}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              className="form-control mb-4"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="row g-3">
              {filtered.map((food) => (
                <div className="col-md-6" key={food.id}>
                  <div className="hp-food-card d-flex h-100">
                    <div className="thumb" style={{ width: 110, flexShrink: 0, height: "auto" }}>{food.emoji}</div>
                    <div className="body flex-fill d-flex flex-column">
                      <div className="fw-semibold">{food.name}</div>
                      <div className="text-muted small flex-fill">{food.description}</div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="text-gold fw-semibold">{formatCurrency(food.price)}</span>
                        {food.available ? (
                          <button className="btn btn-sm btn-dark-onyx" onClick={() => addItem(food)}>
                            <i className="bi bi-plus-lg me-1"></i>Add
                          </button>
                        ) : (
                          <span className="hp-badge unavailable">Sold Out</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p className="text-muted">No dishes match your search.</p>}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="hp-card sticky-top" style={{ top: 90 }}>
              <h5 className="display" style={{ fontSize: "1.15rem" }}>
                <i className="bi bi-basket3 me-2 text-gold"></i>Your Order
              </h5>
              <hr className="hp-hairline my-3" />
              {items.length === 0 && <p className="text-muted small">Your cart is empty. Add dishes to get started.</p>}
              {items.map((i) => (
                <div className="d-flex justify-content-between align-items-center mb-2" key={i.foodId}>
                  <div className="small">
                    <div className="fw-semibold">{i.name}</div>
                    <div className="text-muted">{formatCurrency(i.price)} each</div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQty(i.foodId, i.qty - 1)}>-</button>
                    <span>{i.qty}</span>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQty(i.foodId, i.qty + 1)}>+</button>
                    <button className="btn btn-sm text-danger" onClick={() => removeItem(i.foodId)}><i className="bi bi-trash"></i></button>
                  </div>
                </div>
              ))}
              {items.length > 0 && (
                <>
                  <hr className="hp-hairline my-3" />
                  <div className="d-flex justify-content-between fw-semibold mb-3">
                    <span>Subtotal</span><span className="text-gold">{formatCurrency(subtotal)}</span>
                  </div>
                  <label className="form-label small">Select Your Table</label>
                  <select className="form-select mb-3" value={tableNumber || ""} onChange={(e) => setTableNumber(e.target.value)}>
                    <option value="">Choose an available table...</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.number}>Table {t.number} · {t.type} · Seats {t.capacity}</option>
                    ))}
                  </select>
                  <button className="btn btn-gold w-100" onClick={placeOrder}>Place Order</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
