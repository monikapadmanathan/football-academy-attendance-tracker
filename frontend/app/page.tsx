"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) router.replace("/dashboard");
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const response = await api.post("/auth/login", { username, password });
      if (response.data?.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        router.push("/dashboard");
      }
    } catch {
      setMsg("Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center p-6"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(34,197,94,0.10) 0%, transparent 70%), var(--background)",
      }}
    >
      {/* Background pitch lines decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--wfc-border) 1px, transparent 1px), linear-gradient(90deg, var(--wfc-border) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: 0.25,
        }}
      />

      <div className="relative w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Logo */}
        <div className="text-center space-y-4">
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl text-4xl"
            style={{
              background: "linear-gradient(135deg, var(--wfc-green) 0%, var(--wfc-green-dark) 100%)",
              boxShadow: "0 0 40px rgba(34,197,94,0.35), 0 0 80px rgba(34,197,94,0.10)",
            }}
          >
            ⚽
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--wfc-text)" }}>
              Whitefield FC
            </h1>
            <p className="text-sm font-medium tracking-widest uppercase mt-1" style={{ color: "var(--wfc-green)" }}>
              Coach Portal
            </p>
          </div>
        </div>

        {/* Login card */}
        <div
          className="rounded-2xl p-8 space-y-6"
          style={{
            background: "rgba(22, 26, 35, 0.80)",
            border: "1px solid var(--wfc-border)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.06)",
          }}
        >
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--wfc-text)" }}>
              Sign in
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--wfc-text-muted)" }}>
              Enter your credentials to access the portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-sm font-medium"
                style={{ color: "var(--wfc-text-subtle)" }}
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="coach"
                required
                autoComplete="username"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "var(--wfc-surface-2)",
                  border: "1px solid var(--wfc-border)",
                  color: "var(--wfc-text)",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "var(--wfc-green)";
                  (e.currentTarget as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(34,197,94,0.12)";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "var(--wfc-border)";
                  (e.currentTarget as HTMLInputElement).style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium"
                style={{ color: "var(--wfc-text-subtle)" }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "var(--wfc-surface-2)",
                  border: "1px solid var(--wfc-border)",
                  color: "var(--wfc-text)",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "var(--wfc-green)";
                  (e.currentTarget as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(34,197,94,0.12)";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "var(--wfc-border)";
                  (e.currentTarget as HTMLInputElement).style.boxShadow = "none";
                }}
              />
            </div>

            {/* Error */}
            {msg && (
              <div
                className="rounded-lg px-4 py-3 text-sm font-medium"
                style={{
                  background: "rgba(239,68,68,0.10)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#ef4444",
                }}
              >
                {msg}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-bold transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? "var(--wfc-green-dark)"
                  : "linear-gradient(135deg, var(--wfc-green) 0%, var(--wfc-green-dark) 100%)",
                color: "var(--wfc-surface)",
                boxShadow: loading ? "none" : "0 4px 14px rgba(34,197,94,0.35)",
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 6px 20px rgba(34,197,94,0.50)";
              }}
              onMouseLeave={(e) => {
                if (!loading)
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 4px 14px rgba(34,197,94,0.35)";
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs" style={{ color: "var(--wfc-text-muted)" }}>
          Whitefield FC Academy · Attendance Management System
        </p>
      </div>
    </main>
  );
}