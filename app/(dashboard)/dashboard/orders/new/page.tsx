"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type OrderStatus = "Pending" | "Paid" | "Cancelled";

export default function NewOrderPage() {
  const router = useRouter();

  const [customer, setCustomer] = useState("");
  const [amount, setAmount] = useState<string>("0");
  const [status, setStatus] = useState<OrderStatus>("Pending");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const c = customer.trim();
    const a = Number(amount);

    if (!c) return setErr("Customer is required.");
    if (!Number.isFinite(a) || a < 0) return setErr("Amount must be >= 0.");

    try {
      setSaving(true);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: c, amount: a, status }),
      });

      if (!res.ok) throw new Error(`Create failed: ${res.status}`);

      // ✅ Tạo xong -> về list
      router.push("/dashboard/orders");
      router.refresh(); // optional: đảm bảo list load data mới
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create Order
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Create a new order and return to the list.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/orders")}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back
        </button>
      </div>

      {err && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {err}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">
              Customer
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-200/40"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. Alice"
              disabled={saving}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Amount
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-200/40"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard/orders")}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
