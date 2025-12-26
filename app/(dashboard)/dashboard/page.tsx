import Link from "next/link";

export const metadata = {
  title: "Overview | Internal Dashboard",
  description: "Dashboard overview page.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="h1">Overview</h1>
          <p className="muted mt-1">
            Dashboard overview (we will add stats after Orders).
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/dashboard/orders"
            className="inline-flex rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:brightness-[1.03]"
            style={{
              background:
                "linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--primary2)) 100%)",
            }}
          >
            Go to Orders
          </Link>

          <Link
            href="/dashboard/orders/new"
            className="inline-flex rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white"
          >
            Create Order
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "TOTAL ORDERS", value: "128", note: "Demo number" },
          { label: "REVENUE", value: "$12,540", note: "Demo number" },
          { label: "PENDING TASKS", value: "6", note: "Demo number" },
        ].map((x) => (
          <div
            key={x.label}
            className="rounded-2xl border border-slate-200 bg-white/60 p-4"
          >
            <div className="text-xs font-semibold text-slate-500">
              {x.label}
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {x.value}
            </div>
            <div className="mt-1 text-xs text-slate-600">{x.note}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent activity */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white/60 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">
              Recent activity
            </div>
            <span className="text-xs text-slate-600">Today</span>
          </div>

          <div className="mt-3 divide-y divide-slate-200">
            {[
              { title: "Order #OD-1024 created", meta: "by Demo User • 10:12" },
              { title: "Order #OD-1021 marked as Paid", meta: "10:02" },
              { title: "Customer profile updated", meta: "09:48" },
              { title: "Order #OD-1017 cancelled", meta: "09:21" },
              { title: "New draft order saved", meta: "Yesterday" },
            ].map((item) => (
              <div key={item.title} className="py-3">
                <div className="text-sm font-medium text-slate-900">
                  {item.title}
                </div>
                <div className="text-xs text-slate-600">{item.meta}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-slate-200 bg-white/60 p-4">
          <div className="text-sm font-semibold text-slate-900">
            Quick actions
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Shortcuts for common tasks.
          </p>

          <div className="mt-4 space-y-2">
            <a
              href="/dashboard/orders"
              className="block rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white"
            >
              View all orders
            </a>

            <a
              href="/dashboard/orders/new"
              className="block rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white"
            >
              Create new order
            </a>

            <span
              className="block cursor-not-allowed rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-500"
              title="Coming soon"
            >
              Export (coming soon)
            </span>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white/70 p-3 text-xs text-slate-600">
            Note: These are demo sections to make the dashboard look like a real
            internal product. We will connect real data after Orders API.
          </div>
        </div>
      </div>
    </div>
  );
}
