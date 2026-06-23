"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/players",   label: "Players",   icon: Users },
  { href: "/sessions",  label: "Sessions",  icon: CalendarDays },
  { href: "/reports",   label: "Reports",   icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const { logout, getUser } = useAuth();
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Populate user after mount to avoid SSR/hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getUser());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* ── Desktop Sidebar / Top Bar ─────────────────────── */}
      <header
        className="sticky top-0 z-50 w-full border-b"
        style={{
          background: "var(--wfc-surface)",
          borderColor: "var(--wfc-border)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-base font-black transition-all group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, var(--wfc-green) 0%, var(--wfc-green-dark) 100%)",
                color: "var(--wfc-surface)",
                boxShadow: "0 0 14px rgba(34,197,94,0.35)",
              }}
            >
              ⚽
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-none" style={{ color: "var(--wfc-text)" }}>
                Whitefield FC
              </p>
              <p className="text-[10px] font-medium tracking-widest uppercase" style={{ color: "var(--wfc-green)" }}>
                Coach Portal
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150"
                  style={{
                    background: active ? "var(--wfc-green-dim)" : "transparent",
                    color: active ? "var(--wfc-green)" : "var(--wfc-text-subtle)",
                    borderBottom: active ? "2px solid var(--wfc-green)" : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = "var(--wfc-text)";
                      (e.currentTarget as HTMLElement).style.background = "var(--wfc-surface-2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = "var(--wfc-text-subtle)";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  <Icon size={15} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right — user + logout */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold uppercase"
                  style={{
                    background: "var(--wfc-green-dim)",
                    color: "var(--wfc-green)",
                    border: "1px solid rgba(34,197,94,0.3)",
                  }}
                >
                  {user.username.slice(0, 2)}
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--wfc-text-subtle)" }}>
                  {user.username}
                </span>
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
              style={{ color: "var(--wfc-text-muted)", border: "1px solid var(--wfc-border)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#ef4444";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.4)";
                (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--wfc-text-muted)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--wfc-border)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden rounded-lg p-2 transition-colors"
              style={{ color: "var(--wfc-text-subtle)", border: "1px solid var(--wfc-border)" }}
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {mobileOpen && (
          <div
            className="md:hidden border-t px-4 py-3 flex flex-col gap-1"
            style={{ borderColor: "var(--wfc-border)", background: "var(--wfc-surface)" }}
          >
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
                  style={{
                    background: active ? "var(--wfc-green-dim)" : "transparent",
                    color: active ? "var(--wfc-green)" : "var(--wfc-text-subtle)",
                    borderLeft: active ? "3px solid var(--wfc-green)" : "3px solid transparent",
                  }}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* ── Mobile Bottom Tab Bar ──────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t"
        style={{
          background: "var(--wfc-surface)",
          borderColor: "var(--wfc-border)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {NAV_LINKS.map((link) => {
          const active = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors"
              style={{
                color: active ? "var(--wfc-green)" : "var(--wfc-text-muted)",
              }}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
