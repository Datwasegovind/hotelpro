import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { validate, rules } from "../utils/validation";

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form, {
      name: [rules.required("Full name")],
      email: [rules.required("Email"), rules.email],
      mobile: [rules.required("Mobile"), rules.mobile],
      password: [rules.required("Password"), rules.minLen(6, "Password")],
    });
    if (form.confirm !== form.password) errs.confirm = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    const result = register(form);
    setSubmitting(false);

    if (!result.ok) {
      showToast(result.error, "error");
      return;
    }
    showToast(`Account created — welcome, ${result.user.name.split(" ")[0]}!`, "success");
    navigate("/");
  }

  return (
    <div className="hp-auth-wrap">
      <div className="hp-auth-card">
        <div className="text-center mb-4">
          <span className="hp-seal mx-auto d-inline-flex mb-3">HP</span>
          <h3 className="display mb-0">Create Account</h3>
          <p className="text-muted small">Join HotelPro to book tables &amp; track orders</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label small">Full Name</label>
            <input name="name" className={`form-control ${errors.name ? "is-invalid" : ""}`} value={form.name} onChange={handleChange} placeholder="Jane Doe" />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label small">Email Address</label>
            <input type="email" name="email" className={`form-control ${errors.email ? "is-invalid" : ""}`} value={form.email} onChange={handleChange} placeholder="you@example.com" />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label small">Mobile Number</label>
            <input name="mobile" className={`form-control ${errors.mobile ? "is-invalid" : ""}`} value={form.mobile} onChange={handleChange} placeholder="98XXXXXXXX" />
            {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
          </div>
          <div className="row">
            <div className="col-6 mb-3">
              <label className="form-label small">Password</label>
              <input type="password" name="password" className={`form-control ${errors.password ? "is-invalid" : ""}`} value={form.password} onChange={handleChange} placeholder="••••••••" />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
            <div className="col-6 mb-3">
              <label className="form-label small">Confirm</label>
              <input type="password" name="confirm" className={`form-control ${errors.confirm ? "is-invalid" : ""}`} value={form.confirm} onChange={handleChange} placeholder="••••••••" />
              {errors.confirm && <div className="invalid-feedback">{errors.confirm}</div>}
            </div>
          </div>
          <button type="submit" className="btn btn-gold w-100 py-2 mt-2" disabled={submitting}>
            {submitting ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="text-center small text-muted mt-4 mb-0">
          Already registered? <Link to="/login" className="text-gold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
