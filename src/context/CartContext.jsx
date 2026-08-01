import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // { foodId, name, price, qty }
  const [tableNumber, setTableNumber] = useState(null);

  function addItem(food) {
    setItems((prev) => {
      const existing = prev.find((i) => i.foodId === food.id);
      if (existing) {
        return prev.map((i) => (i.foodId === food.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { foodId: food.id, name: food.name, price: food.price, qty: 1 }];
    });
  }

  function removeItem(foodId) {
    setItems((prev) => prev.filter((i) => i.foodId !== foodId));
  }

  function updateQty(foodId, qty) {
    if (qty <= 0) return removeItem(foodId);
    setItems((prev) => prev.map((i) => (i.foodId === foodId ? { ...i, qty } : i)));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
  const totalQty = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, subtotal, totalQty, tableNumber, setTableNumber }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
