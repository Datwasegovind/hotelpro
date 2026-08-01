export const isRequired = (v) => v !== undefined && v !== null && String(v).trim().length > 0;

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");

export const isMobile = (v) => /^[6-9]\d{9}$/.test(v || "");

export const isPositiveNumber = (v) => !isNaN(v) && Number(v) > 0;

export const minLength = (v, n) => String(v || "").length >= n;

/**
 * Runs a set of { field: [validators] } rules against a values object.
 * Each validator is (value) => errorMessage|null
 * Returns { field: errorMessage } for failing fields only.
 */
export function validate(values, rules) {
  const errors = {};
  Object.entries(rules).forEach(([field, validators]) => {
    for (const fn of validators) {
      const msg = fn(values[field]);
      if (msg) {
        errors[field] = msg;
        break;
      }
    }
  });
  return errors;
}

export const rules = {
  required: (label) => (v) => (isRequired(v) ? null : `${label} is required`),
  email: (v) => (isEmail(v) ? null : "Enter a valid email address"),
  mobile: (v) => (isMobile(v) ? null : "Enter a valid 10-digit mobile number"),
  minLen: (n, label) => (v) => (minLength(v, n) ? null : `${label} must be at least ${n} characters`),
  positive: (label) => (v) => (isPositiveNumber(v) ? null : `${label} must be a positive number`),
};

export function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
