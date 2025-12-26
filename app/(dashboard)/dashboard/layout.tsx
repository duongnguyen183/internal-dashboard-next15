// app/(dashboard)/dashboard/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Dashboard | Internal Dashboard",
  description: "Internal business management dashboard (demo).",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Next 15/16: cookies() is async dynamic API
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("auth")?.value === "true";

  if (!isLoggedIn) redirect("/login");

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_20%_-20%,rgba(99,102,241,0.18),transparent_60%),radial-gradient(900px_500px_at_90%_0%,rgba(236,72,153,0.14),transparent_60%),linear-gradient(to_bottom,rgba(248,250,252,1),rgba(248,250,252,1))]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-sm">
              ID
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">
                Internal Dashboard
              </div>
              <div className="text-xs text-slate-600">
                Business management system (demo)
              </div>
            </div>
          </div>

          {/* Keep Link for your current logout implementation */}
          <Link
            href="/api/auth/logout"
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 active:opacity-90"
          >
            Logout
          </Link>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[260px_1fr] md:px-6">
        {/* Sidebar */}
        <aside className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur">
          <div className="mb-3 text-xs font-semibold tracking-wide text-slate-500">
            NAVIGATION
          </div>

          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Overview
            </Link>
            <Link
              href="/dashboard/orders"
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Orders
            </Link>
            <Link
              href="/"
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Public home
            </Link>
          </nav>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">
              Tip (demo)
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Use this dashboard to showcase CRUD, pagination, error/loading
              states.
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold text-slate-500">
              Signed in as
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              Demo User
            </div>
            <div className="text-xs text-slate-600">
              Frontend • Internal Tools
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
