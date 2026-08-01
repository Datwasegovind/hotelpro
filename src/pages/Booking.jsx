import { useMemo, useState } from "react";
import { db } from "../services/storageService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { validate, rules } from "../utils/validation";
import PublicNavbar from "../components/PublicNavbar";
import Footer from "../components/Footer";

const TIME_SLOTS = ["12:00", "13:00", "14:00", "18:00", "19:00", "19:30", "20:00", "20:30", "21:00"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Booking() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    customerName: user?.name || "",
    contact: user?.mobile || "",
    date: todayStr(),
    time: "19:00",
    guests: 2,
    tableId: "",
  });
  const [errors, setErrors] = useState({});
  const [confirmedId, setConfirmedId] = useState(null);

  const allTables = db.getAll("tables");
  const bookings = db.getAll("bookings");

  const availableTables = useMemo(() => {
    return allTables.filter((t) => {
      if (t.capacity < Number(form.guests || 0)) return false;
      if (t.status === "Maintenance") return false;
      const clash = bookings.some(
        (b) => b.tableId === t.id && b.date === form.date && b.time === form.time && b.status !== "Cancelled"
      );
      return !clash;
    });
  }, [allTables, bookings, form.guests, form.date, form.time]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form, {
      customerName: [rules.required("Name")],
      contact: [rules.required("Contact"), rules.mobile],
      date: [rules.required("Date")],
      time: [rules.required("Time")],
      tableId: [rules.required("Table selection")],
    });
    if (form.date && form.date < todayStr()) errs.date = "Please choose today or a future date";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const table = allTables.find((t) => t.id === form.tableId);
    const clash = bookings.some(
      (b) => b.tableId === form.tableId && b.date === form.date && b.time === form.time && b.status !== "Cancelled"
    );
    if (clash) {
      showToast("That table was just booked for this slot — pick another.", "error");
      return;
    }

    const created = db.insert("bookings", {
      customerName: form.customerName,
      contact: form.contact,
      tableId: table.id,
      tableNumber: table.number,
      date: form.date,
      time: form.time,
      guests: Number(form.guests),
      status: "Pending",
    }, "B");

    setConfirmedId(created.id);
    showToast("Table reserved! We look forward to hosting you.", "success");
  }

  return (
    <div>
      <PublicNavbar />
      <section className="bg-onyx py-5">
        <div className="container text-center text-white">
          <div className="eyebrow text-gold mb-2" style={{ letterSpacing: "0.2em", fontSize: "0.75rem" }}>RESERVATIONS</div>
          <h1 className="display">Book Your Table</h1>
        </div>
      </section>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {confirmedId && (
              <div className="alert alert-success d-flex align-items-center justify-content-between">
                <div><i className="bi bi-check-circle me-2"></i>Booking <strong>{confirmedId}</strong> confirmed — pending final approval.</div>
                <button className="btn btn-sm btn-outline-success" onClick={() => setConfirmedId(null)}>New Booking</button>
              </div>
            )}
            <div className="hp-card">
              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small">Full Name</label>
                    <input name="customerName" className={`form-control ${errors.customerName ? "is-invalid" : ""}`} value={form.customerName} onChange={handleChange} />
                    {errors.customerName && <div className="invalid-feedback">{errors.customerName}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small">Contact Number</label>
                    <input name="contact" className={`form-control ${errors.contact ? "is-invalid" : ""}`} value={form.contact} onChange={handleChange} placeholder="98XXXXXXXX" />
                    {errors.contact && <div className="invalid-feedback">{errors.contact}</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small">Date</label>
                    <input type="date" name="date" min={todayStr()} className={`form-control ${errors.date ? "is-invalid" : ""}`} value={form.date} onChange={handleChange} />
                    {errors.date && <div className="invalid-feedback">{errors.date}</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small">Time Slot</label>
                    <select name="time" className="form-select" value={form.time} onChange={handleChange}>
                      {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small">Guests</label>
                    <input type="number" min="1" max="20" name="guests" className="form-control" value={form.guests} onChange={handleChange} />
                  </div>
                </div>

                <hr className="hp-hairline my-4" />
                <label className="form-label small">Available Tables for this slot</label>
                {availableTables.length === 0 && (
                  <div className="alert alert-warning small">No tables match your guest count for this date/time. Try another slot.</div>
                )}
                <div className="row g-2 mb-2">
                  {availableTables.map((t) => (
                    <div className="col-6 col-md-4" key={t.id}>
                      <div
                        className={`hp-card cursor-pointer text-center py-2 ${form.tableId === t.id ? "border-3" : ""}`}
                        style={{ borderColor: form.tableId === t.id ? "var(--gold)" : undefined, borderWidth: form.tableId === t.id ? 2 : 1 }}
                        onClick={() => setForm((f) => ({ ...f, tableId: t.id }))}
                      >
                        <div className="fw-semibold small">Table {t.number}</div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>{t.type} · Seats {t.capacity}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.tableId && <div className="text-danger small mb-2">{errors.tableId}</div>}

                <button type="submit" className="btn btn-gold w-100 py-2 mt-2">Confirm Reservation</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
