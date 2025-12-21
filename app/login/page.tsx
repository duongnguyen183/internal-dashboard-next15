"use client";

export default function LoginPage() {
  async function handleLogin() {
    const res = await fetch("/api/auth", { method: "POST" });
    if (!res.ok) return alert("Login failed");
    window.location.href = "/dashboard";
  }

  return (
    <div className="app-bg">
      <div className="container-center">
        <div className="card w-full p-8">
          <h1 className="h1">Welcome back</h1>
          <p className="muted mt-1">Sign in to Internal Dashboard</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" placeholder="you@company.com" />
            </div>

            <div>
              <label className="label">Password</label>
              <input className="input" placeholder="••••••••" type="password" />
            </div>

            <button className="btn-primary mt-2" onClick={handleLogin}>
              Sign in
            </button>

            <p className="muted text-center">
              Demo mode — no real credentials required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
