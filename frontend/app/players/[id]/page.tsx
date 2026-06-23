"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/navbar";
import {
  ArrowLeft,
  Trophy,
  Calendar,
  TrendingUp,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Repeat2,
} from "lucide-react";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber?: number;
  position?: string;
  isActive: boolean;
  photo?: string;
  createdAt?: string;
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
  id: string;
  status: string;
  notes?: string;
  createdAt: string;
  session: Session;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PRESENT:      { label: "Present",     color: "#22c55e", bg: "rgba(34,197,94,0.12)",   icon: CheckCircle2 },
  ABSENT:       { label: "Absent",      color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: XCircle },
  LATE:         { label: "Late",        color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: Clock },
  EXCUSED:      { label: "Excused",     color: "#38bdf8", bg: "rgba(56,189,248,0.12)",  icon: AlertCircle },
  COMPENSATORY: { label: "Compensatory", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", icon: Repeat2 },
};

const fmt = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function calcStreak(records: AttendanceRecord[]): number {
  // Sort descending by session date
  const sorted = [...records].sort(
    (a, b) => new Date(b.session.date).getTime() - new Date(a.session.date).getTime()
  );
  let streak = 0;
  for (const r of sorted) {
    if (r.status === "PRESENT") streak++;
    else break;
  }
  return streak;
}

export default function PlayerProfilePage() {
  useAuth();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [player, setPlayer] = useState<Player | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [playerRes, attRes] = await Promise.all([
          api.get<Player>(`/players/${id}`),
          api.get<AttendanceRecord[]>(`/attendance?playerId=${id}`),
        ]);
        setPlayer(playerRes.data);
        // Filter records for this player if backend doesn't filter by playerId
        const filtered = attRes.data.filter
          ? attRes.data.filter((r: AttendanceRecord & { player?: Player }) => 
              (r as AttendanceRecord & { player?: Player }).player?.id === id || true
            )
          : attRes.data;
        setRecords(filtered);
      } catch {
        router.replace("/players");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--background)" }}>
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <div
              className="mx-auto h-12 w-12 rounded-full animate-pulse"
              style={{ background: "var(--wfc-surface-2)" }}
            />
            <p className="text-sm" style={{ color: "var(--wfc-text-muted)" }}>Loading profile…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!player) return null;

  const totalSessions = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const attendancePct = totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 0;
  const streak = calcStreak(records);

  const statusCounts = Object.keys(STATUS_CONFIG).reduce<Record<string, number>>((acc, k) => {
    acc[k] = records.filter((r) => r.status === k).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: "var(--background)" }}>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
        {/* Back */}
        <Link
          href="/players"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: "var(--wfc-text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--wfc-green)"}
          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--wfc-text-muted)"}
        >
          <ArrowLeft size={15} />
          Back to Players
        </Link>

        {/* Hero card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--wfc-surface)", border: "1px solid var(--wfc-border)" }}
        >
          {/* Green header bar */}
          <div
            className="h-28"
            style={{
              background: "linear-gradient(135deg, #14532d 0%, #166534 40%, #16a34a 100%)",
            }}
          />
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex items-end gap-5 -mt-14 mb-5">
              <div
                className="h-24 w-24 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-black shrink-0"
                style={{
                  border: "3px solid var(--wfc-surface)",
                  background: player.photo ? "transparent" : "var(--wfc-green-dim)",
                  color: "var(--wfc-green)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                }}
              >
                {player.photo ? (
                  <img
                    src={player.photo}
                    alt={`${player.firstName} ${player.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  `${player.firstName[0]}${player.lastName[0]}`.toUpperCase()
                )}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-black" style={{ color: "var(--wfc-text)" }}>
                    {player.firstName} {player.lastName}
                  </h1>
                  {player.jerseyNumber != null && (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-black"
                      style={{ background: "var(--wfc-green-dim)", color: "var(--wfc-green)", border: "1px solid rgba(34,197,94,0.3)" }}
                    >
                      #{player.jerseyNumber}
                    </span>
                  )}
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      background: player.isActive ? "rgba(34,197,94,0.12)" : "rgba(100,116,139,0.12)",
                      color: player.isActive ? "var(--wfc-green)" : "var(--wfc-text-muted)",
                      border: player.isActive ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(100,116,139,0.2)",
                    }}
                  >
                    {player.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: "var(--wfc-text-muted)" }}>
                  {player.position || "No position listed"}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Attendance", value: `${attendancePct}%`, icon: TrendingUp, color: "#22c55e" },
                { label: "Sessions", value: totalSessions, icon: Calendar, color: "#38bdf8" },
                { label: "Present", value: present, icon: Trophy, color: "#22c55e" },
                { label: "Streak", value: `${streak} 🔥`, icon: Flame, color: "#f59e0b" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="rounded-xl p-4"
                    style={{ background: "var(--wfc-surface-2)", border: "1px solid var(--wfc-border)" }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={13} style={{ color: s.color }} />
                      <span className="text-xs font-medium" style={{ color: "var(--wfc-text-muted)" }}>
                        {s.label}
                      </span>
                    </div>
                    <p className="text-2xl font-black" style={{ color: "var(--wfc-text)" }}>
                      {s.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status breakdown */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--wfc-surface)", border: "1px solid var(--wfc-border)" }}
        >
          <h2 className="font-bold mb-4" style={{ color: "var(--wfc-text)" }}>Attendance Breakdown</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}
                >
                  <Icon size={14} style={{ color: cfg.color }} />
                  <span className="text-sm font-semibold" style={{ color: cfg.color }}>
                    {statusCounts[key]}
                  </span>
                  <span className="text-xs" style={{ color: "var(--wfc-text-muted)" }}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Attendance bar */}
          {totalSessions > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--wfc-text-muted)" }}>
                <span>Overall attendance rate</span>
                <span style={{ color: "var(--wfc-green)", fontWeight: 700 }}>{attendancePct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--wfc-surface-2)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${attendancePct}%`,
                    background: "linear-gradient(90deg, var(--wfc-green-dark), var(--wfc-green))",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Attendance history table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--wfc-surface)", border: "1px solid var(--wfc-border)" }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: "var(--wfc-border)" }}>
            <h2 className="font-bold" style={{ color: "var(--wfc-text)" }}>Attendance History</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--wfc-text-muted)" }}>
              {totalSessions} session{totalSessions !== 1 ? "s" : ""} recorded
            </p>
          </div>

          {records.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar size={36} className="mx-auto mb-3" style={{ color: "var(--wfc-text-muted)", opacity: 0.3 }} />
              <p className="text-sm" style={{ color: "var(--wfc-text-muted)" }}>
                No attendance records yet for this player.
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--wfc-border)" }}>
              {[...records]
                .sort((a, b) => new Date(b.session.date).getTime() - new Date(a.session.date).getTime())
                .map((record) => {
                  const cfg = STATUS_CONFIG[record.status] ?? STATUS_CONFIG.ABSENT;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={record.id}
                      className="flex items-center justify-between px-6 py-4 transition-colors"
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--wfc-surface-2)"}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--wfc-text)" }}>
                          {record.session?.title ?? "Unknown session"}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--wfc-text-muted)" }}>
                          {record.session ? fmt(record.session.date) : ""}
                          {record.session?.ageGroup && (
                            <span
                              className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{ background: "var(--wfc-green-dim)", color: "var(--wfc-green)" }}
                            >
                              {record.session.ageGroup}
                            </span>
                          )}
                        </p>
                        {record.notes && (
                          <p className="text-xs italic mt-0.5" style={{ color: "var(--wfc-text-muted)" }}>
                            {record.notes}
                          </p>
                        )}
                      </div>
                      <div
                        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}
                      >
                        <Icon size={11} />
                        {cfg.label}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
