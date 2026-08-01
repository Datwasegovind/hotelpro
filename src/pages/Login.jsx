import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { validate, rules } from "../utils/validation";

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form, {
      email: [rules.required("Email"), rules.email],
      password: [rules.required("Password")],
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    const result = login(form.email, form.password);
    setSubmitting(false);

    if (!result.ok) {
      showToast(result.error, "error");
      return;
    }
    showToast(`Welcome back, ${result.user.name.split(" ")[0]}!`, "success");
    if (result.user.role === "ADMIN") navigate("/admin/dashboard");
    else navigate(location.state?.from || "/");
  }

  function quickFill(role) {
    if (role === "ADMIN") setForm({ email: "admin@hotelpro.com", password: "admin123" });
    else setForm({ email: "rohan@example.com", password: "customer123" });
  }

  return (
    <div className="hp-auth-wrap">
      <div className="hp-auth-card">
        <div className="text-center mb-4">
          <span className="hp-seal mx-auto d-inline-flex mb-3">HP</span>
          <h3 className="display mb-0">Welcome Back</h3>
          <p className="text-muted small">Sign in to manage your table &amp; orders</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label small">Email Address</label>
            <input
              type="email" name="email" className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={form.email} onChange={handleChange} placeholder="you@example.com"
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label small">Password</label>
            <input
              type="password" name="password" className={`form-control ${errors.password ? "is-invalid" : ""}`}
              value={form.password} onChange={handleChange} placeholder="••••••••"
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>
          <button type="submit" className="btn btn-gold w-100 py-2 mt-2" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="d-flex gap-2 mt-3">
          <button className="btn btn-outline-gold btn-sm flex-fill" onClick={() => quickFill("ADMIN")}>
            Use Admin Demo
          </button>
          <button className="btn btn-outline-gold btn-sm flex-fill" onClick={() => quickFill("CUSTOMER")}>
            Use Guest Demo
          </button>
        </div>

        <p className="text-center small text-muted mt-4 mb-0">
          New here? <Link to="/register" className="text-gold">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
