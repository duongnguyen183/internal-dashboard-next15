"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders | Internal Dashboard",
  description: "Manage internal orders (CRUD, pagination, search).",
};

type OrderStatus = "Pending" | "Paid" | "Cancelled";

type Order = {
  id: string; // internal id (uuid-like)
  orderId: string; // human id: OD-1001
  customer: string;
  amount: number;
  status: OrderStatus;
  createdAt: string; // ISO
};

type ApiResp = {
  items: Order[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

function getPageItems(current: number, total: number) {
  const items: (number | "...")[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) items.push(i);
    return items;
  }
  items.push(1);
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) items.push("...");
  for (let i = left; i <= right; i++) items.push(i);
  if (right < total - 1) items.push("...");
  items.push(total);
  return items;
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const cls =
    status === "Paid"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Pending"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}
    >
      {status}
    </span>
  );
}

/* ------------------------- Toast ------------------------- */

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  ttlMs?: number; // auto close
};

function makeId() {
  return `t-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function ToastStack({
  toasts,
  onClose,
}: {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="fixed right-4 top-4 z-[60] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => {
        const tone =
          t.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-950"
            : t.type === "error"
            ? "border-rose-200 bg-rose-50 text-rose-950"
            : "border-slate-200 bg-white text-slate-950";

        const badge =
          t.type === "success"
            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
            : t.type === "error"
            ? "bg-rose-100 text-rose-800 border-rose-200"
            : "bg-slate-100 text-slate-800 border-slate-200";

        const label =
          t.type === "success"
            ? "Success"
            : t.type === "error"
            ? "Error"
            : "Info";

        return (
          <div
            key={t.id}
            className={[
              "rounded-2xl border px-4 py-3 shadow-lg",
              "backdrop-blur supports-[backdrop-filter]:bg-white/80",
              tone,
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={[
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                      badge,
                    ].join(" ")}
                  >
                    {label}
                  </span>
                  {t.title && (
                    <div className="truncate text-sm font-semibold">
                      {t.title}
                    </div>
                  )}
                </div>
                <div className="text-sm leading-relaxed text-slate-700">
                  {t.message}
                </div>

                {t.actionLabel && t.onAction && (
                  <div className="mt-2">
                    <button
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                      onClick={() => t.onAction?.()}
                    >
                      {t.actionLabel}
                    </button>
                  </div>
                )}
              </div>

              <button
                className="rounded-xl px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                onClick={() => onClose(t.id)}
                aria-label="Close toast"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------- Modal ------------------------- */

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="text-base font-semibold text-slate-900">
              {title}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>
          <div className="px-5 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  tone = "danger",
  onConfirm,
  onClose,
  busy,
}: {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  tone?: "danger" | "default";
  onConfirm: () => void;
  onClose: () => void;
  busy?: boolean;
}) {
  const confirmBtn =
    tone === "danger"
      ? "bg-rose-600 hover:bg-rose-700 text-white"
      : "bg-slate-900 hover:bg-slate-800 text-white";

  return (
    <Modal open={open} title={title} onClose={() => (busy ? null : onClose())}>
      <div className="space-y-4">
        {description && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {description}
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            onClick={onClose}
            disabled={busy}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold shadow-sm disabled:opacity-60",
              confirmBtn,
            ].join(" ")}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Working…" : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------- Page ------------------------- */

export default function OrdersPage() {
  const router = useRouter();

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [data, setData] = useState<ApiResp | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastTimers = useRef<Map<string, number>>(new Map());

  // modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);

  const [formCustomer, setFormCustomer] = useState("");
  const [formAmount, setFormAmount] = useState<string>("0");
  const [formStatus, setFormStatus] = useState<Order["status"]>("Pending");
  const [saving, setSaving] = useState(false);

  // delete confirm modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // optimistic delete + undo
  const deleteTimers = useRef<Map<string, number>>(new Map()); // order.id -> timeout
  const deletedSnapshots = useRef<
    Map<string, { order: Order; prevPage: number }>
  >(new Map());

  // force refresh after CRUD
  const [refreshKey, setRefreshKey] = useState(0);

  const query = useMemo(
    () => ({ q, page, limit, refreshKey }),
    [q, page, limit, refreshKey]
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      try {
        setFetching(true);
        setError(null);

        const params = new URLSearchParams({
          q: query.q,
          page: String(query.page),
          limit: String(query.limit),
        });

        const res = await fetch(`/api/orders?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const json = (await res.json()) as ApiResp;
        if (!cancelled) setData(json);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setFetching(false);
      }
    }

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [query]);

  function pushToast(t: Omit<ToastItem, "id">) {
    const id = makeId();
    const ttl = t.ttlMs ?? 2800;

    setToasts((prev) => [{ ...t, id }, ...prev].slice(0, 4)); // keep max 4 toasts

    // auto close
    const timer = window.setTimeout(() => {
      closeToast(id);
    }, ttl);
    toastTimers.current.set(id, timer);
  }

  function closeToast(id: string) {
    const timer = toastTimers.current.get(id);
    if (timer) window.clearTimeout(timer);
    toastTimers.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }

  function openCreate() {
    setEditing(null);
    setFormCustomer("");
    setFormAmount("0");
    setFormStatus("Pending");
    setModalOpen(true);
  }

  function openEdit(o: Order) {
    setEditing(o);
    setFormCustomer(o.customer);
    setFormAmount(String(o.amount));
    setFormStatus(o.status);
    setModalOpen(true);
  }

  async function submitForm() {
    const customer = formCustomer.trim();
    const amount = Number(formAmount);

    if (!customer) {
      pushToast({
        type: "error",
        title: "Validation",
        message: "Customer is required.",
      });
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      pushToast({
        type: "error",
        title: "Validation",
        message: "Amount must be a positive number.",
      });
      return;
    }

    try {
      setSaving(true);

      if (!editing) {
        // CREATE
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customer, amount, status: formStatus }),
        });
        if (!res.ok) throw new Error(`Create failed: ${res.status}`);

        pushToast({
          type: "success",
          title: "Created",
          message: "Order created successfully.",
        });
      } else {
        // UPDATE
        const res = await fetch(
          `/api/orders/${encodeURIComponent(editing.id)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customer, amount, status: formStatus }),
          }
        );
        if (!res.ok) throw new Error(`Update failed: ${res.status}`);

        pushToast({
          type: "success",
          title: "Updated",
          message: `${editing.orderId} updated successfully.`,
        });
      }

      setModalOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      pushToast({
        type: "error",
        title: "Request failed",
        message: msg,
        ttlMs: 4200,
      });
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(o: Order) {
    setDeleting(o);
    setDeleteOpen(true);
  }

  function undoDelete(orderIdInternal: string) {
    const t = deleteTimers.current.get(orderIdInternal);
    if (t) window.clearTimeout(t);
    deleteTimers.current.delete(orderIdInternal);

    const snap = deletedSnapshots.current.get(orderIdInternal);
    if (!snap) return;

    deletedSnapshots.current.delete(orderIdInternal);

    pushToast({
      type: "info",
      title: "Undo",
      message: `Restored ${snap.order.orderId}.`,
    });

    setPage(snap.prevPage);
    setRefreshKey((k) => k + 1);
  }

  async function commitDelete(o: Order) {
    const res = await fetch(`/api/orders/${encodeURIComponent(o.id)}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  }

  async function confirmDelete() {
    if (!deleting) return;

    const o = deleting;
    setDeleteBusy(true);

    try {
      setDeleteOpen(false);

      deletedSnapshots.current.set(o.id, { order: o, prevPage: page });

      pushToast({
        type: "info",
        title: "Deleting…",
        message: `${o.orderId} will be deleted.`,
        actionLabel: "Undo",
        onAction: () => undoDelete(o.id),
        ttlMs: 3500,
      });

      const timer = window.setTimeout(async () => {
        try {
          await commitDelete(o);
          setRefreshKey((k) => k + 1);

          pushToast({
            type: "success",
            title: "Deleted",
            message: `${o.orderId} deleted.`,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          pushToast({
            type: "error",
            title: "Delete failed",
            message: msg,
            ttlMs: 4500,
          });
          setRefreshKey((k) => k + 1);
        } finally {
          deleteTimers.current.delete(o.id);
          deletedSnapshots.current.delete(o.id);
        }
      }, 3500);

      deleteTimers.current.set(o.id, timer);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      pushToast({
        type: "error",
        title: "Delete failed",
        message: msg,
        ttlMs: 4500,
      });
    } finally {
      setDeleteBusy(false);
      setDeleting(null);
    }
  }

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  function goDetail(o: Order) {
    router.push(`/dashboard/orders/${encodeURIComponent(o.id)}`);
  }

  return (
    <div className="space-y-5">
      <ToastStack toasts={toasts} onClose={closeToast} />

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Orders
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Search, paginate, and manage internal orders.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-indigo-200/40 md:w-80"
            placeholder="Search by ID, customer, status..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 active:opacity-90"
          >
            + New
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="text-sm font-semibold text-rose-900">
            Something went wrong
          </div>
          <div className="mt-1 text-sm text-rose-700">{error}</div>
        </div>
      )}

      {/* Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {fetching && (
          <div className="mb-3 text-sm text-slate-600">Loading…</div>
        )}

        {!fetching && !error && items.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
            <div className="text-sm font-semibold text-slate-900">
              No orders found
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Try another keyword.
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-semibold text-slate-700">
                <tr className="border-b border-slate-200">
                  <th className="py-3 pr-4">Order ID</th>
                  <th className="py-3 pr-4">Customer</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Created</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="text-slate-900">
                {items.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => goDetail(o)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        goDetail(o);
                      }
                    }}
                    className={[
                      "border-b border-slate-100 hover:bg-slate-50/80",
                      "cursor-pointer",
                      "focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200/40",
                    ].join(" ")}
                    aria-label={`Open ${o.orderId} detail`}
                  >
                    <td className="py-3 pr-4 font-semibold">{o.orderId}</td>
                    <td className="py-3 pr-4">{o.customer}</td>
                    <td className="py-3 pr-4 font-medium">${o.amount}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3 pr-4 text-slate-700">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // ✅ do not navigate
                            openEdit(o);
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // ✅ do not navigate
                            requestDelete(o);
                          }}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-3 text-xs text-slate-500">
              Tip: Click a row to open order details.
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-slate-600">
            Page <span className="font-semibold">{data?.page ?? page}</span> of{" "}
            <span className="font-semibold">{totalPages}</span> •{" "}
            <span className="font-semibold">{data?.total ?? 0}</span> records
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-700">Rows</span>
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-200/40"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                disabled={fetching}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const raw = String(
                  new FormData(e.currentTarget).get("goto") || ""
                ).trim();
                const n = Number(raw);
                if (!Number.isFinite(n)) return;
                setPage(Math.min(Math.max(1, n), totalPages));
                e.currentTarget.reset();
              }}
            >
              <span className="text-xs font-medium text-slate-700">Go to</span>
              <input
                name="goto"
                inputMode="numeric"
                className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-200/40"
                placeholder="e.g. 3"
                disabled={fetching}
              />
            </form>

            <div className="flex items-center gap-1">
              <button
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                disabled={page <= 1 || fetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>

              {getPageItems(page, totalPages).map((p, idx) =>
                p === "..." ? (
                  <span key={`dots-${idx}`} className="px-2 text-slate-500">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    disabled={fetching}
                    onClick={() => setPage(p)}
                    className={[
                      "h-9 min-w-9 rounded-xl px-3 text-sm font-semibold transition",
                      p === page
                        ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                disabled={page >= totalPages || fetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Create/Edit */}
      <Modal
        open={modalOpen}
        title={editing ? `Edit ${editing.orderId}` : "Create new order"}
        onClose={() => (saving ? null : setModalOpen(false))}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Customer
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-200/40"
              value={formCustomer}
              onChange={(e) => setFormCustomer(e.target.value)}
              placeholder="e.g. Alice"
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Amount
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-200/40"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                inputMode="decimal"
                placeholder="e.g. 120"
                disabled={saving}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Status
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-200/40"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as OrderStatus)}
                disabled={saving}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitForm}
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Create"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        open={deleteOpen}
        title={deleting ? `Delete ${deleting.orderId}?` : "Delete order?"}
        description={
          deleting ? (
            <div className="space-y-2">
              <div className="text-sm">
                This will delete{" "}
                <span className="font-semibold">{deleting.orderId}</span>{" "}
                permanently (after 3.5s). You can undo immediately after
                confirming.
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-xs font-semibold text-slate-500">
                    Customer
                  </div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {deleting.customer}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-xs font-semibold text-slate-500">
                    Amount
                  </div>
                  <div className="mt-1 font-semibold text-slate-900">
                    ${deleting.amount}
                  </div>
                </div>
              </div>
            </div>
          ) : null
        }
        confirmText="Delete"
        cancelText="Cancel"
        tone="danger"
        busy={deleteBusy}
        onClose={() => (deleteBusy ? null : setDeleteOpen(false))}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
