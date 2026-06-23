"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/navbar";
import {
  Users,
  CalendarDays,
  UserCheck,
  UserX,
  TrendingUp,
  ArrowRight,
  Clock,
} from "lucide-react";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber?: number;
  position?: string;
  isActive: boolean;
  photo?: string;
}

interface Session {
  id: string;
  title: string;
  date: string;
  ageGroup: string;
  startTime: string;
  endTime: string;
}

interface AttendanceRecord {
  playerId: string;
  sessionId: string;
  status: string;
}

const fmt = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

export default function DashboardPage() {
  useAuth();

  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, sRes, aRes] = await Promise.all([
          api.get<Player[]>("/players"),
          api.get<Session[]>("/sessions"),
          api.get<AttendanceRecord[]>("/attendance"),
        ]);
        setPlayers(pRes.data);
        setSessions(sRes.data);
        setAttendance(aRes.data);
      } catch {
        /* 401 handled by interceptor */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activePlayers = useMemo(() => players.filter((p) => p.isActive), [players]);
  const recentSessions = useMemo(() => sessions.slice(0, 5), [sessions]);

  // Today's stats
  const todayStr = new Date().toISOString().split("T")[0];
  const todaySessions = useMemo(
    () => sessions.filter((s) => s.date.startsWith(todayStr)),
    [sessions, todayStr]
  );
  const todaySessionIds = todaySessions.map((s) => s.id);
  const todayAttendance = useMemo(
    () => attendance.filter((a) => todaySessionIds.includes(a.sessionId)),
    [attendance, todaySessionIds]
  );
  const presentToday = todayAttendance.filter((a) => a.status === "PRESENT").length;
  const absentToday = todayAttendance.filter((a) => a.status === "ABSENT").length;
  const attendancePct =
    attendance.length > 0
      ? Math.round(
          (attendance.filter((a) => a.status === "PRESENT").length / attendance.length) * 100
        )
      : 0;

  const stats = [
    {
      label: "Total Players",
      value: loading ? "—" : players.length,
      sub: `${activePlayers.length} active`,
      icon: Users,
      color: "#22c55e",
      glow: "rgba(34,197,94,0.15)",
    },
    {
      label: "Present Today",
      value: loading ? "—" : presentToday,
      sub: todaySessions.length > 0 ? `${todaySessions.length} session(s) today` : "No sessions today",
      icon: UserCheck,
      color: "#22c55e",
      glow: "rgba(34,197,94,0.15)",
    },
    {
      label: "Absent Today",
      value: loading ? "—" : absentToday,
      sub: absentToday > 0 ? "Players absent" : "All present!",
      icon: UserX,
      color: "#ef4444",
      glow: "rgba(239,68,68,0.12)",
    },
    {
      label: "Attendance Rate",
      value: loading ? "—" : `${attendancePct}%`,
      sub: "All time average",
      icon: TrendingUp,
      color: "#f59e0b",
      glow: "rgba(245,158,11,0.12)",
    },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: "var(--background)" }}>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-black tracking-tight"
              style={{ color: "var(--wfc-text)" }}
            >
              Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--wfc-text-muted)" }}>
              Whitefield FC · Academy Attendance Tracker
            </p>
          </div>
          <Link
            href="/sessions"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all"
            style={{
              background: "linear-gradient(135deg, var(--wfc-green) 0%, var(--wfc-green-dark) 100%)",
              color: "var(--wfc-surface)",
              boxShadow: "0 4px 14px rgba(34,197,94,0.30)",
            }}
          >
            <CalendarDays size={15} />
            Mark Attendance
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-2xl p-5 transition-all duration-200 group"
                style={{
                  background: "var(--wfc-surface)",
                  border: "1px solid var(--wfc-border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = s.color + "55";
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${s.glow}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--wfc-border)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--wfc-text-muted)" }}>
                    {s.label}
                  </span>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: s.glow, color: s.color }}
                  >
                    <Icon size={15} />
                  </div>
                </div>
                <p className="text-4xl font-black" style={{ color: "var(--wfc-text)" }}>
                  {s.value}
                </p>
                <p className="text-xs mt-2" style={{ color: "var(--wfc-text-muted)" }}>
                  {s.sub}
                </p>
              </div>
            );
          })}
        </div>

        {/* Body grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Sessions — 2 cols */}
          <div className="lg:col-span-2 rounded-2xl" style={{ background: "var(--wfc-surface)", border: "1px solid var(--wfc-border)" }}>
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "var(--wfc-border)" }}
            >
              <h2 className="font-bold" style={{ color: "var(--wfc-text)" }}>
                Recent Sessions
              </h2>
              <Link
                href="/sessions"
                className="flex items-center gap-1 text-xs font-semibold transition-colors"
                style={{ color: "var(--wfc-green)" }}
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--wfc-border)" }}>
              {loading ? (
                <p className="px-6 py-8 text-center text-sm" style={{ color: "var(--wfc-text-muted)" }}>
                  Loading sessions…
                </p>
              ) : recentSessions.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <CalendarDays size={36} className="mx-auto mb-3 opacity-20" style={{ color: "var(--wfc-text-muted)" }} />
                  <p className="text-sm" style={{ color: "var(--wfc-text-muted)" }}>
                    No sessions yet.{" "}
                    <Link href="/sessions" style={{ color: "var(--wfc-green)" }} className="font-semibold">
                      Create one →
                    </Link>
                  </p>
                </div>
              ) : (
                recentSessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-6 py-4 transition-colors"
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--wfc-surface-2)"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black"
                        style={{ background: "var(--wfc-green-dim)", color: "var(--wfc-green)" }}
                      >
                        {new Date(s.date).getDate()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--wfc-text)" }}>
                          {s.title}
                        </p>
                        <p className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: "var(--wfc-text-muted)" }}>
                          <Clock size={10} />
                          {fmt(s.date)} · {s.startTime}–{s.endTime}
                          <span
                            className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ background: "var(--wfc-green-dim)", color: "var(--wfc-green)" }}
                          >
                            {s.ageGroup}
                          </span>
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/attendance?sessionId=${s.id}`}
                      className="rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                      style={{
                        background: "var(--wfc-green-dim)",
                        color: "var(--wfc-green)",
                        border: "1px solid rgba(34,197,94,0.25)",
                      }}
                    >
                      Mark
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-2xl" style={{ background: "var(--wfc-surface)", border: "1px solid var(--wfc-border)" }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: "var(--wfc-border)" }}>
              <h2 className="font-bold" style={{ color: "var(--wfc-text)" }}>Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              {[
                { href: "/players", label: "Manage Players", icon: "👥", desc: `${activePlayers.length} active players` },
                { href: "/sessions", label: "Training Sessions", icon: "📅", desc: `${sessions.length} total sessions` },
                { href: "/reports", label: "View Reports", icon: "📊", desc: "Attendance history" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all"
                  style={{ border: "1px solid var(--wfc-border)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--wfc-surface-2)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,197,94,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--wfc-border)";
                  }}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--wfc-text)" }}>
                      {item.label}
                    </p>
                    <p className="text-xs" style={{ color: "var(--wfc-text-muted)" }}>
                      {item.desc}
                    </p>
                  </div>
                  <ArrowRight size={14} className="ml-auto" style={{ color: "var(--wfc-text-muted)" }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
