"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);

      const res = await fetch("/api/auth", {
        method: "POST",
      });

      if (!res.ok) {
        alert("Login failed");
        return;
      }

      // ✅ dùng router.push thay cho window.location
      router.push("/dashboard");
    } catch (e) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
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
              <input
                className="input"
                placeholder="you@company.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                className="input"
                placeholder="••••••••"
                type="password"
                disabled={loading}
              />
            </div>

            <button
              className="btn-primary mt-2"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
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
