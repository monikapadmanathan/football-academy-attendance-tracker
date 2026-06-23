"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/navbar";
import { ArrowLeft, CheckCircle2, XCircle, Clock, AlertCircle, Repeat2 } from "lucide-react";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber?: number;
  position?: string;
  photo?: string;
}

interface Session {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  ageGroup: string;
}

interface AttendanceRecord {
  playerId: string;
  status: string;
  notes?: string;
}

const STATUS_OPTIONS = [
  { val: "PRESENT",      label: "Present",      icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,0.15)"   },
  { val: "ABSENT",       label: "Absent",       icon: XCircle,      color: "#ef4444", bg: "rgba(239,68,68,0.15)"   },
  { val: "LATE",         label: "Late",         icon: Clock,        color: "#f59e0b", bg: "rgba(245,158,11,0.15)"  },
  { val: "EXCUSED",      label: "Excused",      icon: AlertCircle,  color: "#38bdf8", bg: "rgba(56,189,248,0.15)"  },
  { val: "COMPENSATORY", label: "Comp.",        icon: Repeat2,      color: "#a78bfa", bg: "rgba(167,139,250,0.15)" },
];

function PlayerAvatar({ player }: { player: Player }) {
  const initials = `${player.firstName[0] ?? ""}${player.lastName[0] ?? ""}`.toUpperCase();
  if (player.photo) {
    return (
      <img
        src={player.photo}
        alt={`${player.firstName} ${player.lastName}`}
        className="h-10 w-10 min-w-10 rounded-full object-cover"
        style={{ border: "1.5px solid var(--wfc-border)" }}
      />
    );
  }
  return (
    <div
      className="flex h-10 w-10 min-w-10 items-center justify-center rounded-full text-xs font-black"
      style={{
        background: "var(--wfc-green-dim)",
        color: "var(--wfc-green)",
        border: "1.5px solid rgba(34,197,94,0.3)",
      }}
    >
      {initials}
    </div>
  );
}

function AttendanceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [attendance, setAttendance] = useState<Record<string, { status: string; notes: string }>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionId) { router.push("/sessions"); return; }
    const loadData = async () => {
      try {
        const [sessionRes, playersRes, attendanceRes] = await Promise.all([
          api.get<Session>(`/sessions/${sessionId}`),
          api.get<Player[]>("/players"),
          api.get<AttendanceRecord[]>(`/attendance?sessionId=${sessionId}`),
        ]);
        setSession(sessionRes.data);
        const activePlayers = playersRes.data;
        setPlayers(activePlayers);
        const init: Record<string, { status: string; notes: string }> = {};
        activePlayers.forEach((p) => {
          const existing = attendanceRes.data.find((r) => r.playerId === p.id);
          init[p.id] = existing
            ? { status: existing.status, notes: existing.notes ?? "" }
            : { status: "PRESENT", notes: "" };
        });
        setAttendance(init);
      } catch (err) {
        console.error("Failed to load attendance roll call:", err);
        setMessage("Error loading session data.");
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [sessionId, router]);

  const handleSave = async () => {
    if (!sessionId) return;
    setSubmitting(true);
    setMessage("");
    try {
      const records = Object.entries(attendance).map(([playerId, val]) => ({
        playerId,
        sessionId,
        status: val.status,
        notes: val.notes || undefined,
      }));
      await api.post("/attendance/bulk", { records });
      setMessage("Attendance saved successfully!");
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err) {
      console.error("Failed to save attendance:", err);
      setMessage("Failed to save attendance records.");
    } finally {
      setSubmitting(false);
    }
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full animate-pulse" style={{ background: "var(--wfc-surface-2)" }} />
          <p className="text-sm" style={{ color: "var(--wfc-text-muted)" }}>Loading roster…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 text-center">
        <p style={{ color: "#ef4444" }}>Session not found.</p>
        <button
          className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold"
          style={{ background: "var(--wfc-surface-2)", color: "var(--wfc-text)", border: "1px solid var(--wfc-border)" }}
          onClick={() => router.push("/sessions")}
        >
          Back to Sessions
        </button>
      </div>
    );
  }

  const presentCount = Object.values(attendance).filter((a) => a.status === "PRESENT").length;
  const absentCount = Object.values(attendance).filter((a) => a.status === "ABSENT").length;

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push("/sessions")}
        className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: "var(--wfc-text-muted)" }}
        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--wfc-green)"}
        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--wfc-text-muted)"}
      >
        <ArrowLeft size={15} /> Back to Sessions
      </button>

      {/* Session header */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "var(--wfc-surface)", border: "1px solid var(--wfc-border)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black" style={{ color: "var(--wfc-text)" }}>{session.title}</h1>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-wider"
                style={{ background: "var(--wfc-green-dim)", color: "var(--wfc-green)", border: "1px solid rgba(34,197,94,0.25)" }}
              >
                {session.ageGroup}
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--wfc-text-muted)" }}>
              {fmtDate(session.date)} · {session.startTime}–{session.endTime}
            </p>
          </div>
          {/* Mini summary */}
          <div className="flex gap-3">
            <div className="rounded-xl px-4 py-2 text-center" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <p className="text-xl font-black" style={{ color: "var(--wfc-green)" }}>{presentCount}</p>
              <p className="text-[10px] font-semibold uppercase" style={{ color: "var(--wfc-green)" }}>Present</p>
            </div>
            <div className="rounded-xl px-4 py-2 text-center" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p className="text-xl font-black" style={{ color: "#ef4444" }}>{absentCount}</p>
              <p className="text-[10px] font-semibold uppercase" style={{ color: "#ef4444" }}>Absent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance sheet */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--wfc-surface)", border: "1px solid var(--wfc-border)" }}
      >
        <div className="px-6 py-4 border-b" style={{ borderColor: "var(--wfc-border)" }}>
          <h2 className="font-bold" style={{ color: "var(--wfc-text)" }}>Attendance Sheet</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--wfc-text-muted)" }}>
            {players.length} player{players.length !== 1 ? "s" : ""} registered
          </p>
        </div>

        {players.length === 0 ? (
          <p className="p-6 text-center text-sm" style={{ color: "var(--wfc-text-muted)" }}>
            No players registered. Please add players first.
          </p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--wfc-border)" }}>
            {players.map((player) => {
              const current = attendance[player.id] ?? { status: "PRESENT", notes: "" };
              return (
                <div
                  key={player.id}
                  className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-4 transition-colors"
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--wfc-surface-2)"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  {/* Player info */}
                  <div className="flex items-center gap-3 md:w-56 shrink-0">
                    <PlayerAvatar player={player} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--wfc-text)" }}>
                        {player.firstName} {player.lastName}
                        {player.jerseyNumber != null && (
                          <span
                            className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-mono font-bold"
                            style={{ background: "var(--wfc-surface-2)", color: "var(--wfc-text-muted)" }}
                          >
                            #{player.jerseyNumber}
                          </span>
                        )}
                      </p>
                      <p className="text-xs" style={{ color: "var(--wfc-text-muted)" }}>
                        {player.position || "No position"}
                      </p>
                    </div>
                  </div>

                  {/* Status pills */}
                  <div className="flex flex-wrap items-center gap-1.5 flex-1">
                    {STATUS_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const active = current.status === opt.val;
                      return (
                        <label key={opt.val} className="cursor-pointer">
                          <input
                            type="radio"
                            name={`status-${player.id}`}
                            value={opt.val}
                            checked={active}
                            onChange={() =>
                              setAttendance((prev) => ({
                                ...prev,
                                [player.id]: { ...prev[player.id], status: opt.val },
                              }))
                            }
                            className="sr-only"
                          />
                          <span
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{
                              background: active ? opt.bg : "var(--wfc-surface-2)",
                              color: active ? opt.color : "var(--wfc-text-muted)",
                              border: active ? `1px solid ${opt.color}55` : "1px solid var(--wfc-border)",
                              boxShadow: active ? `0 0 10px ${opt.bg}` : "none",
                            }}
                          >
                            <Icon size={11} />
                            {opt.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Notes */}
                  <div className="md:w-48 shrink-0">
                    <input
                      type="text"
                      placeholder="Notes…"
                      value={current.notes}
                      onChange={(e) =>
                        setAttendance((prev) => ({
                          ...prev,
                          [player.id]: { ...prev[player.id], notes: e.target.value },
                        }))
                      }
                      className="w-full rounded-lg px-3 py-1.5 text-xs outline-none transition-all"
                      style={{
                        background: "var(--wfc-surface-2)",
                        border: "1px solid var(--wfc-border)",
                        color: "var(--wfc-text)",
                      }}
                      onFocus={(e) => {
                        (e.currentTarget as HTMLInputElement).style.borderColor = "var(--wfc-green)";
                      }}
                      onBlur={(e) => {
                        (e.currentTarget as HTMLInputElement).style.borderColor = "var(--wfc-border)";
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer save bar */}
        <div
          className="flex items-center justify-between px-6 py-4 border-t"
          style={{ borderColor: "var(--wfc-border)", background: "var(--wfc-surface-2)" }}
        >
          <span
            className="text-sm font-medium"
            style={{ color: message.includes("success") ? "var(--wfc-green)" : message ? "#ef4444" : "transparent" }}
          >
            {message || "—"}
          </span>
          <button
            onClick={handleSave}
            disabled={submitting || players.length === 0}
            className="rounded-xl px-6 py-2.5 text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, var(--wfc-green) 0%, var(--wfc-green-dark) 100%)",
              color: "var(--wfc-surface)",
              boxShadow: "0 4px 14px rgba(34,197,94,0.30)",
            }}
          >
            {submitting ? "Saving…" : "Save Attendance"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function AttendancePage() {
  useAuth();
  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: "var(--background)" }}>
      <Navbar />
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-20">
            <p className="text-sm" style={{ color: "var(--wfc-text-muted)" }}>Loading attendance interface…</p>
          </div>
        }
      >
        <AttendanceForm />
      </Suspense>
    </div>
  );
}
