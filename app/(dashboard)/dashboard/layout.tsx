import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/", label: "Public home" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuth = await isAuthenticated();
  if (!isAuth) redirect("/login");

  return (
    <div className="app-bg">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Topbar */}
        <div className="card mb-5 flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white font-semibold shadow-sm">
              ID
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Internal Dashboard
              </div>
              <div className="text-xs text-slate-600">
                Business management system (demo)
              </div>
            </div>
          </div>

          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:brightness-[1.03]"
              style={{
                background:
                  "linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--primary2)) 100%)",
              }}
            >
              Logout
            </button>
          </form>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="card p-3">
            <div className="px-3 pb-2 text-xs font-semibold tracking-wide text-slate-500">
              NAVIGATION
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100/70 transition"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white/60 p-3">
              <div className="text-xs font-semibold text-slate-700">
                Tip (demo)
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Use this dashboard to showcase CRUD, pagination, error/loading
                states.
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-white/60 p-3">
              <div className="text-xs font-semibold text-slate-700">
                Signed in as
              </div>
              <div className="mt-1 text-sm font-medium text-slate-900">
                Demo User
              </div>
              <div className="text-xs text-slate-600">
                Frontend • Internal Tools
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="card p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
