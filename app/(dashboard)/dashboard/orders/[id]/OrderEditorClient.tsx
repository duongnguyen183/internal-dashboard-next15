"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type OrderStatus = "Pending" | "Paid" | "Cancelled";

type Order = {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
};

export default function OrderEditorClient({
  initialOrder,
}: {
  initialOrder: Order;
}) {
  const router = useRouter();

  const [customer, setCustomer] = useState(initialOrder.customer);
  const [amount, setAmount] = useState(String(initialOrder.amount));
  const [status, setStatus] = useState<OrderStatus>(initialOrder.status);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function save() {
    setErr(null);
    setOk(null);

    const c = customer.trim();
    const a = Number(amount);

    if (!c) return setErr("Customer is required.");
    if (!Number.isFinite(a) || a < 0) return setErr("Amount must be >= 0.");

    try {
      setSaving(true);

      const res = await fetch(
        `/api/orders/${encodeURIComponent(initialOrder.id)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customer: c, amount: a, status }),
        }
      );

      if (!res.ok) throw new Error(`Update failed: ${res.status}`);

      setOk("Saved!");
      router.refresh(); // refresh server data
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">Order</div>
          <div className="text-xl font-bold text-slate-900">
            {initialOrder.orderId}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Internal ID: {initialOrder.id}
          </div>
        </div>

        <button
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={() => router.push("/dashboard/orders")}
        >
          ← Back
        </button>
      </div>

      {(err || ok) && (
        <div
          className={[
            "mb-4 rounded-xl border p-3 text-sm",
            err
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800",
          ].join(" ")}
        >
          {err ?? ok}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">
            Customer
          </label>
          <input
            className="d-input mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-indigo-200/40"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            disabled={saving}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Amount</label>
          <input
            className="d-input mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-indigo-200/40"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            disabled={saving}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Status</label>
          <select
            className="d-select not-only:mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-indigo-200/40"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            disabled={saving}
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
