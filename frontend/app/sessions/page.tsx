"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/navbar";
import { Plus, X, Trash2, CalendarDays, Clock } from "lucide-react";

interface Session {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  ageGroup: string;
}

const today = new Date().toISOString().split("T")[0];

const emptyForm = {
  title: "",
  date: today,
  startTime: "09:00",
  endTime: "11:00",
  ageGroup: "",
};

const fmt = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const inputStyle = {
  background: "var(--wfc-surface-2)",
  border: "1px solid var(--wfc-border)",
  color: "var(--wfc-text)",
};

export default function SessionsPage() {
  useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const res = await api.get<Session[]>("/sessions");
      setSessions(res.data);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    api
      .get<Session[]>("/sessions")
      .then((res) => { if (active) setSessions(res.data); })
      .catch(() => { if (active) setSessions([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      await api.post("/sessions", form);
      setMessage("Session created.");
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch {
      setMessage("Failed to create session.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this session and all its attendance records?")) return;
    try {
      await api.delete(`/sessions/${id}`);
      await load();
    } catch {
      alert("Failed to delete session.");
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: "var(--background)" }}>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black" style={{ color: "var(--wfc-text)" }}>Sessions</h1>
            <p className="text-sm mt-1" style={{ color: "var(--wfc-text-muted)" }}>
              {sessions.length} total training session{sessions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => { setShowForm((s) => !s); setMessage(""); }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all"
            style={{
              background: showForm ? "var(--wfc-surface-2)" : "linear-gradient(135deg, var(--wfc-green) 0%, var(--wfc-green-dark) 100%)",
              color: showForm ? "var(--wfc-text-muted)" : "var(--wfc-surface)",
              border: showForm ? "1px solid var(--wfc-border)" : "none",
              boxShadow: showForm ? "none" : "0 4px 14px rgba(34,197,94,0.30)",
            }}
          >
            {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Create Session</>}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div
            className="rounded-2xl p-6 space-y-5"
            style={{ background: "var(--wfc-surface)", border: "1px solid var(--wfc-border)" }}
          >
            <h2 className="text-lg font-bold" style={{ color: "var(--wfc-text)" }}>New Training Session</h2>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-sm font-medium" style={{ color: "var(--wfc-text-subtle)" }}>
                  Session Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Morning Training"
                  required
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  style={inputStyle}
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

              {[
                { id: "date", label: "Date *", type: "date" },
                { id: "ageGroup", label: "Age Group *", type: "text", placeholder: "e.g. U17" },
                { id: "startTime", label: "Start Time *", type: "time" },
                { id: "endTime", label: "End Time *", type: "time" },
              ].map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label className="block text-sm font-medium" style={{ color: "var(--wfc-text-subtle)" }}>
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type={field.type}
                    value={form[field.id as keyof typeof form]}
                    placeholder={field.placeholder}
                    required
                    onChange={(e) => setForm((p) => ({ ...p, [field.id]: e.target.value }))}
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                    style={inputStyle}
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
              ))}

              <div className="sm:col-span-2 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl px-6 py-2.5 text-sm font-bold transition-all disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, var(--wfc-green) 0%, var(--wfc-green-dark) 100%)",
                    color: "var(--wfc-surface)",
                    boxShadow: "0 4px 14px rgba(34,197,94,0.25)",
                  }}
                >
                  {submitting ? "Creating…" : "Create Session"}
                </button>
                {message && (
                  <p
                    className="text-sm font-medium"
                    style={{ color: message.includes("Failed") ? "#ef4444" : "var(--wfc-green)" }}
                  >
                    {message}
                  </p>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Sessions grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl animate-pulse"
                style={{ background: "var(--wfc-surface)", border: "1px solid var(--wfc-border)", height: 170 }}
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-lg font-semibold" style={{ color: "var(--wfc-text)" }}>No sessions yet</p>
            <p className="text-sm mt-1" style={{ color: "var(--wfc-text-muted)" }}>Create your first training session above.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200"
                style={{ background: "var(--wfc-surface)", border: "1px solid var(--wfc-border)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,197,94,0.3)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(34,197,94,0.07)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--wfc-border)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: "var(--wfc-text)" }}>
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-1" style={{ color: "var(--wfc-text-muted)" }}>
                      <CalendarDays size={11} />
                      <span className="text-xs">{fmt(session.date)}</span>
                    </div>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                    style={{ background: "var(--wfc-green-dim)", color: "var(--wfc-green)", border: "1px solid rgba(34,197,94,0.25)" }}
                  >
                    {session.ageGroup}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--wfc-text-muted)" }}>
                  <Clock size={11} />
                  {session.startTime} – {session.endTime}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1 border-t" style={{ borderColor: "var(--wfc-border)" }}>
                  <button
                    onClick={() => router.push(`/attendance?sessionId=${session.id}`)}
                    className="flex-1 rounded-lg py-2 text-xs font-bold transition-all"
                    style={{
                      background: "linear-gradient(135deg, var(--wfc-green) 0%, var(--wfc-green-dark) 100%)",
                      color: "var(--wfc-surface)",
                    }}
                  >
                    Mark Attendance
                  </button>
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="flex items-center justify-center rounded-lg px-3 py-2 text-xs transition-all"
                    style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                    title="Delete session"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
