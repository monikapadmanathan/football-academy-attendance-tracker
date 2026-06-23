"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/navbar";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Repeat2,
  Filter,
  X,
} from "lucide-react";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber?: number;
  photo?: string;
}

interface Session {
  id: string;
  title: string;
  date: string;
  ageGroup: string;
}

interface AttendanceRecord {
  id: string;
  status: string;
  notes?: string;
  createdAt: string;
  player: Player;
  session: Session;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PRESENT:      { label: "Present",      color: "#22c55e", bg: "rgba(34,197,94,0.12)",   icon: CheckCircle2 },
  ABSENT:       { label: "Absent",       color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: XCircle },
  LATE:         { label: "Late",         color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: Clock },
  EXCUSED:      { label: "Excused",      color: "#38bdf8", bg: "rgba(56,189,248,0.12)",  icon: AlertCircle },
  COMPENSATORY: { label: "Compensatory", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", icon: Repeat2 },
};

const fmt = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function ReportsPage() {
  useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filterPlayer, setFilterPlayer] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    api
      .get<AttendanceRecord[]>("/attendance")
      .then((r) => setRecords(r.data))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  // Unique players for filter
  const uniquePlayers = useMemo(() => {
    const map = new Map<string, Player>();
    records.forEach((r) => { if (!map.has(r.player.id)) map.set(r.player.id, r.player); });
    return Array.from(map.values()).sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    );
  }, [records]);

  // Filtered records
  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (filterPlayer && r.player.id !== filterPlayer) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterFrom && r.session?.date && r.session.date < filterFrom) return false;
      if (filterTo && r.session?.date && r.session.date > filterTo + "T23:59:59") return false;
      return true;
    });
  }, [records, filterPlayer, filterStatus, filterFrom, filterTo]);

  const hasFilters = filterPlayer || filterStatus || filterFrom || filterTo;

  const summary = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(STATUS_CONFIG).forEach((k) => (counts[k] = 0));
    filtered.forEach((r) => {
      if (r.status in counts) counts[r.status]++;
    });
    return counts;
  }, [filtered]);

  const selectStyle = {
    background: "var(--wfc-surface-2)",
    border: "1px solid var(--wfc-border)",
    color: "var(--wfc-text)",
    borderRadius: "0.75rem",
    padding: "0.5rem 0.75rem",
    fontSize: "0.8rem",
    outline: "none",
    width: "100%",
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: "var(--background)" }}>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black" style={{ color: "var(--wfc-text)" }}>
            Attendance Reports
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--wfc-text-muted)" }}>
            Historical logs of WFC academy training sessions
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div
                key={key}
                className="rounded-2xl p-4 transition-all cursor-pointer"
                style={{
                  background: filterStatus === key ? cfg.bg : "var(--wfc-surface)",
                  border: filterStatus === key ? `1px solid ${cfg.color}55` : "1px solid var(--wfc-border)",
                }}
                onClick={() => setFilterStatus(filterStatus === key ? "" : key)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={13} style={{ color: cfg.color }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--wfc-text-muted)" }}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-3xl font-black" style={{ color: "var(--wfc-text)" }}>{summary[key]}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--wfc-surface)", border: "1px solid var(--wfc-border)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={14} style={{ color: "var(--wfc-green)" }} />
              <h2 className="text-sm font-bold" style={{ color: "var(--wfc-text)" }}>Filters</h2>
            </div>
            {hasFilters && (
              <button
                onClick={() => { setFilterPlayer(""); setFilterStatus(""); setFilterFrom(""); setFilterTo(""); }}
                className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                style={{ color: "#ef4444" }}
              >
                <X size={12} /> Clear all
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Player filter */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--wfc-text-muted)" }}>
                Player
              </label>
              <select
                value={filterPlayer}
                onChange={(e) => setFilterPlayer(e.target.value)}
                style={selectStyle}
              >
                <option value="">All players</option>
                {uniquePlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}{p.jerseyNumber != null ? ` (#${p.jerseyNumber})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--wfc-text-muted)" }}>
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={selectStyle}
              >
                <option value="">All statuses</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            {/* Date from */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--wfc-text-muted)" }}>
                From date
              </label>
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                style={{ background: "var(--wfc-surface-2)", border: "1px solid var(--wfc-border)", color: "var(--wfc-text)" }}
              />
            </div>

            {/* Date to */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--wfc-text-muted)" }}>
                To date
              </label>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                style={{ background: "var(--wfc-surface-2)", border: "1px solid var(--wfc-border)", color: "var(--wfc-text)" }}
              />
            </div>
          </div>
        </div>

        {/* History table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--wfc-surface)", border: "1px solid var(--wfc-border)" }}
        >
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--wfc-border)" }}>
            <h2 className="font-bold" style={{ color: "var(--wfc-text)" }}>Roster History Log</h2>
            <span className="text-xs font-semibold" style={{ color: "var(--wfc-text-muted)" }}>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <p className="p-8 text-center text-sm" style={{ color: "var(--wfc-text-muted)" }}>Loading reports…</p>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-lg font-semibold" style={{ color: "var(--wfc-text)" }}>No records found</p>
              <p className="text-sm mt-1" style={{ color: "var(--wfc-text-muted)" }}>
                {hasFilters ? "Try adjusting your filters." : "No attendance history logged yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead
                  className="border-b text-xs font-semibold uppercase tracking-wider"
                  style={{ background: "var(--wfc-surface-2)", borderColor: "var(--wfc-border)", color: "var(--wfc-text-muted)" }}
                >
                  <tr>
                    <th className="px-6 py-3">Player</th>
                    <th className="px-6 py-3">Session</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--wfc-border)" }}>
                  {filtered.map((record) => {
                    const cfg = STATUS_CONFIG[record.status] ?? STATUS_CONFIG.ABSENT;
                    const Icon = cfg.icon;
                    return (
                      <tr
                        key={record.id}
                        className="transition-colors"
                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--wfc-surface-2)"}
                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {record.player.photo ? (
                              <img
                                src={record.player.photo}
                                alt=""
                                className="h-7 w-7 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black"
                                style={{ background: "var(--wfc-green-dim)", color: "var(--wfc-green)" }}
                              >
                                {`${record.player.firstName[0]}${record.player.lastName[0]}`}
                              </div>
                            )}
                            <div>
                              <span className="font-semibold" style={{ color: "var(--wfc-text)" }}>
                                {record.player.firstName} {record.player.lastName}
                              </span>
                              {record.player.jerseyNumber != null && (
                                <span className="ml-1 text-[10px]" style={{ color: "var(--wfc-text-muted)" }}>
                                  #{record.player.jerseyNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4" style={{ color: "var(--wfc-text-subtle)" }}>
                          {record.session?.title ?? "Unknown"}
                        </td>
                        <td className="px-6 py-4" style={{ color: "var(--wfc-text-subtle)" }}>
                          {record.session ? fmt(record.session.date) : fmt(record.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}
                          >
                            <Icon size={10} />
                            {cfg.label}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 italic max-w-xs truncate"
                          style={{ color: "var(--wfc-text-muted)" }}
                          title={record.notes}
                        >
                          {record.notes ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
