"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber?: number;
  position?: string;
  isActive: boolean;
}

interface Session {
  id: string;
  title: string;
  date: string;
  ageGroup: string;
}

export default function DashboardPage() {
  useAuth();

  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [playersRes, sessionsRes] = await Promise.all([
          api.get<Player[]>("/players"),
          api.get<Session[]>("/sessions"),
        ]);
        setPlayers(playersRes.data);
        setSessions(sessionsRes.data);
      } catch {
        /* 401 handled by interceptor */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activePlayers = useMemo(
    () => players.filter((p) => p.isActive),
    [players]
  );

  const recentSessions = useMemo(() => sessions.slice(0, 5), [sessions]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">Whitefield FC Attendance Tracker</p>
          </div>
          <Link href="/sessions">
            <Button>Mark Attendance</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Total Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{loading ? "—" : players.length}</p>
              <p className="text-xs text-slate-500 mt-1">{activePlayers.length} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{loading ? "—" : sessions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Active Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{loading ? "—" : activePlayers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {loading
                  ? "—"
                  : sessions.filter(
                      (s) =>
                        new Date(s.date).getMonth() === new Date().getMonth()
                    ).length}
              </p>
              <p className="text-xs text-slate-500 mt-1">sessions</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : recentSessions.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No sessions yet.{" "}
                  <Link href="/sessions" className="underline text-slate-700">
                    Create one
                  </Link>
                </p>
              ) : (
                recentSessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium text-sm">{s.title}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(s.date).toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                        })}{" "}
                        · {s.ageGroup}
                      </p>
                    </div>
                    <Link href={`/attendance?sessionId=${s.id}`}>
                      <Button size="sm" variant="outline">
                        Mark
                      </Button>
                    </Link>
                  </div>
                ))
              )}
              {!loading && sessions.length > 5 && (
                <Link
                  href="/sessions"
                  className="block text-center text-sm text-slate-500 hover:text-slate-700 pt-1"
                >
                  View all {sessions.length} sessions →
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/players">
                <Button variant="outline" className="w-full justify-start">
                  👥 Manage Players
                </Button>
              </Link>
              <Link href="/sessions">
                <Button variant="outline" className="w-full justify-start">
                  📅 Manage Sessions
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline" className="w-full justify-start">
                  📊 View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
