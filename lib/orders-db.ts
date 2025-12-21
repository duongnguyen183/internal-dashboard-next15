// lib/orders-db.ts
export type OrderStatus = "Pending" | "Paid" | "Cancelled";

export type Order = {
  id: string; // internal id (uuid-like)
  orderId: string; // human id: OD-1001
  customer: string;
  amount: number;
  status: OrderStatus;
  createdAt: string; // ISO
};

type ListParams = {
  q?: string;
  page?: number;
  limit?: number;
};

type ListResult = {
  items: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Persist in dev across hot reloads
declare global {
  // eslint-disable-next-line no-var
  var __ordersStore: Order[] | undefined;
}

function seedOrders(): Order[] {
  const now = new Date();
  const mk = (
    n: number,
    customer: string,
    amount: number,
    status: OrderStatus,
    daysAgo: number
  ): Order => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return {
      id: `seed-${n}`, // internal id
      orderId: `OD-${String(1000 + n).padStart(4, "0")}`,
      customer,
      amount,
      status,
      createdAt: d.toISOString(),
    };
  };

  return [
    mk(1, "Alice", 50, "Paid", 0),
    mk(2, "Bob", 62, "Pending", 1),
    mk(3, "Charlie", 74, "Cancelled", 2),
    mk(4, "Daisy", 86, "Paid", 3),
    mk(5, "Ethan", 98, "Pending", 4),
    mk(6, "Alice", 110, "Cancelled", 5),
    mk(7, "Bob", 122, "Paid", 6),
    mk(8, "Charlie", 134, "Pending", 7),
    mk(9, "Daisy", 146, "Cancelled", 8),
    mk(10, "Ethan", 158, "Pending", 9),
  ];
}

function store(): Order[] {
  if (!globalThis.__ordersStore) globalThis.__ordersStore = seedOrders();
  return globalThis.__ordersStore;
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function matchesQuery(o: Order, q: string) {
  const qq = normalize(q);
  return (
    normalize(o.orderId).includes(qq) ||
    normalize(o.customer).includes(qq) ||
    normalize(o.status).includes(qq)
  );
}

function makeUuidLike() {
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nextOrderId() {
  const orders = store();
  const max = orders.reduce((acc, o) => {
    const m = /^OD-(\d+)$/.exec(o.orderId);
    if (!m) return acc;
    return Math.max(acc, Number(m[1]));
  }, 1000);
  return `OD-${String(max + 1).padStart(4, "0")}`;
}

export function listOrders(params: ListParams = {}): ListResult {
  const page = Math.max(1, Number(params.page ?? 1));
  const limit = Math.min(50, Math.max(1, Number(params.limit ?? 10)));
  const q = (params.q ?? "").trim();

  const orders = store();
  const filtered = q ? orders.filter((o) => matchesQuery(o, q)) : [...orders];

  filtered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);

  const start = (safePage - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return { items, total, page: safePage, limit, totalPages };
}

export function createOrder(
  input: Partial<Pick<Order, "customer" | "amount" | "status">>
): Order {
  const orders = store();

  const customer =
    String(input.customer ?? "New Customer").trim() || "New Customer";
  const amount = Number(input.amount ?? 0);
  const status: OrderStatus = (input.status as OrderStatus) ?? "Pending";

  const o: Order = {
    id: makeUuidLike(),
    orderId: nextOrderId(),
    customer,
    amount: Number.isFinite(amount) ? amount : 0,
    status: ["Pending", "Paid", "Cancelled"].includes(status)
      ? status
      : "Pending",
    createdAt: new Date().toISOString(),
  };

  orders.unshift(o);
  return o;
}

// IMPORTANT: update/delete/get accept BOTH internal id and orderId (OD-xxxx)
function findIndexByAnyId(anyId: string) {
  const orders = store();
  const id = anyId.trim();
  return orders.findIndex((o) => o.id === id || o.orderId === id);
}

export function getOrder(anyId: string) {
  const orders = store();
  const id = anyId.trim();
  return orders.find((o) => o.id === id || o.orderId === id) ?? null;
}

export function updateOrder(
  anyId: string,
  patch: { customer?: string; amount?: number; status?: OrderStatus }
) {
  const orders = store();
  const idx = findIndexByAnyId(anyId);
  if (idx === -1) return null;

  const cur = orders[idx];

  const next: Order = {
    ...cur,
    customer:
      patch.customer !== undefined
        ? String(patch.customer).trim()
        : cur.customer,
    amount: patch.amount !== undefined ? Number(patch.amount) : cur.amount,
    status: patch.status !== undefined ? patch.status : cur.status,
  };

  orders[idx] = next;
  return next;
}

export function deleteOrder(anyId: string) {
  const orders = store();
  const idx = findIndexByAnyId(anyId);
  if (idx === -1) return false;
  orders.splice(idx, 1);
  return true;
}
