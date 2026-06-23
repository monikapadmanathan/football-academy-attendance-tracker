"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    api.get<Session[]>("/sessions")
      .then((res) => {
        if (active) setSessions(res.data);
      })
      .catch(() => {
        if (active) setSessions([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
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

  const fmt = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Sessions</h1>
            <p className="text-sm text-slate-500">{sessions.length} total sessions</p>
          </div>
          <Button
            onClick={() => {
              setShowForm((s) => !s);
              setMessage("");
            }}
          >
            {showForm ? "Cancel" : "Create Session"}
          </Button>
        </div>

        {/* Create form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>New Training Session</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit}
                className="grid gap-4 sm:grid-cols-2"
              >
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="title">Session Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="e.g. Morning Training"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sess-date">Date *</Label>
                  <Input
                    id="sess-date"
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, date: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageGroup">Age Group *</Label>
                  <Input
                    id="ageGroup"
                    value={form.ageGroup}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, ageGroup: e.target.value }))
                    }
                    placeholder="e.g. U17"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, startTime: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, endTime: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-4">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating…" : "Create Session"}
                  </Button>
                  {message && (
                    <p className="text-sm text-slate-600">{message}</p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Sessions list */}
        {loading ? (
          <p className="text-slate-500">Loading sessions…</p>
        ) : sessions.length === 0 ? (
          <p className="text-slate-500">
            No sessions yet. Create your first session above.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <Card key={session.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">
                        {session.title}
                      </CardTitle>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {fmt(session.date)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      {session.ageGroup}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 mt-auto space-y-3">
                  <p className="text-sm text-slate-600">
                    ⏰ {session.startTime} – {session.endTime}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      size="sm"
                      onClick={() =>
                        router.push(`/attendance?sessionId=${session.id}`)
                      }
                    >
                      Mark Attendance
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(session.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
