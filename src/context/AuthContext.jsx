import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../services/storageService";

const AuthContext = createContext(null);
const SESSION_KEY = "hotelpro_session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  function login(email, password) {
    const users = db.getAll("users");
    const found = users.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password
    );
    if (!found) return { ok: false, error: "Invalid email or password" };
    const session = { id: found.id, name: found.name, email: found.email, role: found.role, mobile: found.mobile };
    setUser(session);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, user: session };
  }

  function register({ name, email, password, mobile }) {
    const users = db.getAll("users");
    if (users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
      return { ok: false, error: "An account with this email already exists" };
    }
    const created = db.insert(
      "users",
      { name, email, password, mobile, role: "CUSTOMER" },
      "U"
    );
    db.insert(
      "customers",
      { name, mobile, email, address: "", totalVisits: 0 },
      "C"
    );
    const session = { id: created.id, name: created.name, email: created.email, role: created.role, mobile: created.mobile };
    setUser(session);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, user: session };
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === "ADMIN" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
