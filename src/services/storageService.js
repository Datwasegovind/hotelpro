/**
 * storageService.js
 * Central localStorage-backed data layer. Mimics a REST-ish API so it can be
 * swapped later for real HTTP calls (see src/services/README below).
 *
 * Every collection is namespaced under "hotelpro_<name>" in localStorage.
 * On first run, collections are seeded from src/data/*.json.
 */

import tablesSeed from "../data/tables.json";
import menuSeed from "../data/menu.json";
import customersSeed from "../data/customers.json";
import ordersSeed from "../data/orders.json";
import employeesSeed from "../data/employees.json";
import bookingsSeed from "../data/bookings.json";
import billsSeed from "../data/bills.json";
import paymentsSeed from "../data/payments.json";
import usersSeed from "../data/users.json";
import reviewsSeed from "../data/reviews.json";

const NS = "hotelpro_";

const SEEDS = {
  tables: tablesSeed,
  menu: menuSeed,
  customers: customersSeed,
  orders: ordersSeed,
  employees: employeesSeed,
  bookings: bookingsSeed,
  bills: billsSeed,
  payments: paymentsSeed,
  users: usersSeed,
  reviews: reviewsSeed,
};

function key(collection) {
  return `${NS}${collection}`;
}

function ensureSeeded(collection) {
  const k = key(collection);
  if (localStorage.getItem(k) === null) {
    localStorage.setItem(k, JSON.stringify(SEEDS[collection] || []));
  }
}

function readAll(collection) {
  ensureSeeded(collection);
  try {
    return JSON.parse(localStorage.getItem(key(collection))) || [];
  } catch {
    return [];
  }
}

function writeAll(collection, data) {
  localStorage.setItem(key(collection), JSON.stringify(data));
  return data;
}

function nextId(collection, prefix) {
  const rows = readAll(collection);
  const nums = rows
    .map((r) => r.id)
    .filter((id) => typeof id === "string" && id.startsWith(prefix))
    .map((id) => parseInt(id.replace(prefix, ""), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

export const db = {
  getAll(collection) {
    return readAll(collection);
  },
  getById(collection, id) {
    return readAll(collection).find((r) => r.id === id) || null;
  },
  find(collection, predicate) {
    return readAll(collection).filter(predicate);
  },
  insert(collection, record, idPrefix) {
    const rows = readAll(collection);
    const id = record.id || nextId(collection, idPrefix);
    const withId = { ...record, id, createdAt: record.createdAt || new Date().toISOString() };
    rows.push(withId);
    writeAll(collection, rows);
    return withId;
  },
  update(collection, id, patch) {
    const rows = readAll(collection);
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    rows[idx] = { ...rows[idx], ...patch, updatedAt: new Date().toISOString() };
    writeAll(collection, rows);
    return rows[idx];
  },
  remove(collection, id) {
    const rows = readAll(collection);
    const next = rows.filter((r) => r.id !== id);
    writeAll(collection, next);
    return next.length !== rows.length;
  },
  replaceAll(collection, rows) {
    return writeAll(collection, rows);
  },
  resetAll() {
    Object.keys(SEEDS).forEach((c) => localStorage.removeItem(key(c)));
    Object.keys(SEEDS).forEach(ensureSeeded);
  },
};

export const nextIdFor = nextId;
