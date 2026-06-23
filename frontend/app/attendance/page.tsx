"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber?: number;
  position?: string;
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
    if (!sessionId) {
      router.push("/sessions");
      return;
    }

    const loadData = async () => {
      try {
        // Fetch session info
        const sessionRes = await api.get<Session>(`/sessions/${sessionId}`);
        setSession(sessionRes.data);

        // Fetch players
        const playersRes = await api.get<Player[]>("/players");
        // Only show active players
        const activePlayers = playersRes.data;
        setPlayers(activePlayers);

        // Fetch existing attendance for this session
        const attendanceRes = await api.get<AttendanceRecord[]>(`/attendance?sessionId=${sessionId}`);
        
        // Map existing attendance or set default PRESENT
        const initialAttendance: Record<string, { status: string; notes: string }> = {};
        
        activePlayers.forEach((player) => {
          const existing = attendanceRes.data.find((r) => r.playerId === player.id);
          if (existing) {
            initialAttendance[player.id] = {
              status: existing.status,
              notes: existing.notes || "",
            };
          } else {
            initialAttendance[player.id] = {
              status: "PRESENT",
              notes: "",
            };
          }
        });

        setAttendance(initialAttendance);
      } catch (err) {
        console.error("Failed to load attendance roll call:", err);
        setMessage("Error loading session data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sessionId, router]);

  const handleStatusChange = (playerId: string, status: string) => {
    setAttendance((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        status,
      },
    }));
  };

  const handleNotesChange = (playerId: string, notes: string) => {
    setAttendance((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        notes,
      },
    }));
  };

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
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Failed to save attendance:", err);
      setMessage("Failed to save attendance records.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-slate-500">Loading session and roster...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>Session not found.</p>
        <Button className="mt-4" onClick={() => router.push("/sessions")}>
          Back to Sessions
        </Button>
      </div>
    );
  }

  const fmtDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      {/* Session Title & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{session.title}</h1>
          <p className="text-slate-500 text-sm mt-1">
            📅 {fmtDate(session.date)} &nbsp;|&nbsp; ⏰ {session.startTime} – {session.endTime} &nbsp;|&nbsp; 👥 Age Group: {session.ageGroup}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/sessions")}>
          Back to Sessions
        </Button>
      </div>

      {/* Roster & marking */}
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-lg text-slate-800">Attendance Sheet</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {players.length === 0 ? (
            <p className="p-6 text-slate-500 text-center">No players registered. Please add players first.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {players.map((player) => {
                const current = attendance[player.id] || { status: "PRESENT", notes: "" };
                return (
                  <div key={player.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors">
                    {/* Player Info */}
                    <div className="min-w-0 md:w-1/3">
                      <p className="font-semibold text-slate-800">
                        {player.firstName} {player.lastName}
                        {player.jerseyNumber && (
                          <span className="ml-2 text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            #{player.jerseyNumber}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {player.position || "No position listed"}
                      </p>
                    </div>

                    {/* Status Dropdowns/Selector */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      {[
                        { val: "PRESENT", label: "Present", color: "peer-checked:bg-emerald-600 peer-checked:text-white" },
                        { val: "ABSENT", label: "Absent", color: "peer-checked:bg-rose-600 peer-checked:text-white" },
                        { val: "LATE", label: "Late", color: "peer-checked:bg-amber-500 peer-checked:text-white" },
                        { val: "EXCUSED", label: "Excused", color: "peer-checked:bg-sky-600 peer-checked:text-white" },
                        { val: "COMPENSATORY", label: "Compensatory", color: "peer-checked:bg-indigo-600 peer-checked:text-white" },
                      ].map((opt) => (
                        <label key={opt.val} className="cursor-pointer">
                          <input
                            type="radio"
                            name={`status-${player.id}`}
                            value={opt.val}
                            checked={current.status === opt.val}
                            onChange={() => handleStatusChange(player.id, opt.val)}
                            className="sr-only peer"
                          />
                          <span className={`block px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-all ${opt.color}`}>
                            {opt.label}
                          </span>
                        </label>
                      ))}
                    </div>

                    {/* Notes Input */}
                    <div className="flex-1 md:max-w-xs">
                      <Input
                        type="text"
                        placeholder="Add note (e.g. sick, late 10m)..."
                        value={current.notes}
                        onChange={(e) => handleNotesChange(player.id, e.target.value)}
                        className="text-xs h-8 border-slate-200 focus-visible:ring-slate-400"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Bar */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className={`text-sm font-medium ${message.includes("success") ? "text-emerald-600" : "text-rose-600"}`}>
              {message}
            </span>
            <Button
              onClick={handleSave}
              disabled={submitting || players.length === 0}
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm px-6"
            >
              {submitting ? "Saving attendance..." : "Save Attendance"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function AttendancePage() {
  useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Suspense fallback={
        <div className="flex justify-center items-center py-12">
          <p className="text-slate-500">Loading attendance interface...</p>
        </div>
      }>
        <AttendanceForm />
      </Suspense>
    </div>
  );
}
