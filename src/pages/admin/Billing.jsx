import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { db } from "../../services/storageService";
import { useToast } from "../../context/ToastContext";
import { formatCurrency, formatDateTime } from "../../utils/validation";
import AdminLayout from "../../components/AdminLayout";

const GST_RATE = 0.05;
const SERVICE_RATE = 0.05;
const PAYMENT_METHODS = ["Cash", "Card", "UPI"];

function orderTotal(order) {
  return order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export default function Billing() {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const preselectOrderId = searchParams.get("orderId");

  const [orders] = useState(db.getAll("orders").filter((o) => o.status !== "Completed" || true));
  const [bills, setBills] = useState(db.getAll("bills"));
  const [orderId, setOrderId] = useState(preselectOrderId || "");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [generatedBill, setGeneratedBill] = useState(null);

  const order = orders.find((o) => o.id === orderId);

  const subtotal = order ? orderTotal(order) : 0;
  const gst = subtotal * GST_RATE;
  const service = subtotal * SERVICE_RATE;
  const total = Math.max(subtotal + gst + service - Number(discount || 0), 0);

  function generateInvoice() {
    if (!order) return showToast("Select an order to bill", "error");
    const bill = db.insert("bills", {
      orderId: order.id,
      tableNumber: order.tableNumber,
      customerName: order.customerName,
      items: order.items,
      subtotal,
      gst: Number(gst.toFixed(2)),
      serviceCharge: Number(service.toFixed(2)),
      discount: Number(discount || 0),
      total: Number(total.toFixed(2)),
      paymentMethod,
      date: new Date().toISOString(),
    }, "INV");

    db.insert("payments", {
      transactionId: `TXN${Math.floor(10000 + Math.random() * 89999)}`,
      customerName: order.customerName,
      amount: bill.total,
      method: paymentMethod,
      date: bill.date,
      status: "Success",
    }, "P");

    db.update("orders", order.id, { status: "Completed" });
    if (order.tableId) db.update("tables", order.tableId, { status: "Cleaning" });

    setBills(db.getAll("bills"));
    setGeneratedBill(bill);
    showToast(`Invoice ${bill.id} generated`, "success");
  }

  const history = useMemo(() => [...bills].sort((a, b) => (a.date < b.date ? 1 : -1)), [bills]);

  return (
    <AdminLayout title="Billing" subtitle="Generate GST invoices and settle guest bills">
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="hp-card mb-4">
            <h6 className="display mb-3" style={{ fontSize: "1.05rem" }}>New Invoice</h6>
            <label className="form-label small">Select Order</label>
            <select className="form-select mb-3" value={orderId} onChange={(e) => { setOrderId(e.target.value); setGeneratedBill(null); }}>
              <option value="">Choose an order...</option>
              {orders.filter((o) => o.status !== "Completed").map((o) => (
                <option key={o.id} value={o.id}>{o.id} — Table {o.tableNumber} — {o.customerName}</option>
              ))}
            </select>

            {order && (
              <>
                <div className="small text-muted mb-2">Items</div>
                <table className="table table-sm mb-3">
                  <tbody>
                    {order.items.map((i, idx) => (
                      <tr key={idx}><td>{i.name} x{i.qty}</td><td className="text-end">{formatCurrency(i.price * i.qty)}</td></tr>
                    ))}
                  </tbody>
                </table>

                <label className="form-label small">Discount (₹)</label>
                <input type="number" min="0" className="form-control mb-3" value={discount} onChange={(e) => setDiscount(e.target.value)} />

                <label className="form-label small">Payment Method</label>
                <select className="form-select mb-3" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                </select>

                <div className="small">
                  <div className="d-flex justify-content-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="d-flex justify-content-between"><span>GST (5%)</span><span>{formatCurrency(gst)}</span></div>
                  <div className="d-flex justify-content-between"><span>Service Charge (5%)</span><span>{formatCurrency(service)}</span></div>
                  <div className="d-flex justify-content-between"><span>Discount</span><span>- {formatCurrency(discount)}</span></div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-6"><span>Total Payable</span><span className="text-gold">{formatCurrency(total)}</span></div>
                </div>
                <button className="btn btn-gold w-100 mt-3" onClick={generateInvoice}>
                  <i className="bi bi-receipt me-2"></i>Generate Invoice
                </button>
              </>
            )}
          </div>

          <div className="hp-card">
            <h6 className="display mb-3" style={{ fontSize: "1.05rem" }}>Billing History</h6>
            <div className="table-responsive" style={{ maxHeight: 260, overflowY: "auto" }}>
              <table className="table hp-table">
                <thead><tr><th>Invoice</th><th>Table</th><th>Total</th><th>Method</th></tr></thead>
                <tbody>
                  {history.map((b) => (
                    <tr key={b.id} className="cursor-pointer" onClick={() => setGeneratedBill(b)}>
                      <td>{b.id}</td><td>T{b.tableNumber}</td><td>{formatCurrency(b.total)}</td><td>{b.paymentMethod}</td>
                    </tr>
                  ))}
                  {history.length === 0 && <tr><td colSpan="4" className="text-muted text-center py-3">No bills yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          {generatedBill ? (
            <>
              <div className="d-flex justify-content-end gap-2 mb-3 no-print">
                <button className="btn btn-outline-gold btn-sm" onClick={() => window.print()}><i className="bi bi-printer me-1"></i>Print</button>
                <button className="btn btn-gold btn-sm" onClick={() => window.print()}><i className="bi bi-download me-1"></i>Download PDF</button>
              </div>
              <div className="hp-invoice">
                <div className="inv-head">
                  <div className="d-flex align-items-center gap-3">
                    <span className="hp-seal">HP</span>
                    <div>
                      <div className="display fs-5">HotelPro</div>
                      <div className="text-muted small">Marine Drive, Mumbai · GSTIN 27ABCDE1234F1Z5</div>
                    </div>
                  </div>
                  <div className="text-end small">
                    <div className="fw-bold">Invoice {generatedBill.id}</div>
                    <div className="text-muted">{formatDateTime(generatedBill.date)}</div>
                  </div>
                </div>
                <div className="row small mb-3">
                  <div className="col-6"><strong>Bill To:</strong> {generatedBill.customerName}</div>
                  <div className="col-6 text-end"><strong>Table:</strong> {generatedBill.tableNumber}</div>
                </div>
                <table>
                  <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th className="text-end">Total</th></tr></thead>
                  <tbody>
                    {generatedBill.items.map((i, idx) => (
                      <tr key={idx}><td>{i.name}</td><td>{i.qty}</td><td>{formatCurrency(i.price)}</td><td className="text-end">{formatCurrency(i.price * i.qty)}</td></tr>
                    ))}
                  </tbody>
                </table>
                <div className="totals">
                  <div className="row"><span>Subtotal</span><span>{formatCurrency(generatedBill.subtotal)}</span></div>
                  <div className="row"><span>GST (5%)</span><span>{formatCurrency(generatedBill.gst)}</span></div>
                  <div className="row"><span>Service Charge (5%)</span><span>{formatCurrency(generatedBill.serviceCharge)}</span></div>
                  <div className="row"><span>Discount</span><span>- {formatCurrency(generatedBill.discount)}</span></div>
                  <div className="row grand"><span>Total</span><span>{formatCurrency(generatedBill.total)}</span></div>
                </div>
                <div className="small text-muted mt-4">Paid via {generatedBill.paymentMethod} · Thank you for dining with HotelPro.</div>
              </div>
            </>
          ) : (
            <div className="hp-card h-100 d-flex align-items-center justify-content-center text-muted">
              <div className="text-center py-5">
                <i className="bi bi-receipt-cutoff" style={{ fontSize: "2.5rem" }}></i>
                <p className="mt-3 mb-0">Select an order and generate an invoice to preview it here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
