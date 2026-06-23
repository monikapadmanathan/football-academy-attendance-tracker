
"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber?: number;
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
  id: string;
  status: string;
  notes?: string;
  createdAt: string;
  player: Player;
  session: Session;
}

export default function ReportsPage() {
  useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.get<AttendanceRecord[]>("/attendance");
        setRecords(response.data);
      } catch {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const summary = useMemo(() => {
    const counts = {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      EXCUSED: 0,
      COMPENSATORY: 0,
    };

    records.forEach((record) => {
      if (record.status in counts) {
        counts[record.status as keyof typeof counts] += 1;
      }
    });

    return counts;
  }, [records]);

  const fmt = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "ABSENT":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "LATE":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "EXCUSED":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "COMPENSATORY":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Attendance Reports</h1>
          <p className="text-sm text-slate-500">Historical logs of WFC academy training sessions</p>
        </div>

        {/* Counts summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
          {Object.entries(summary).map(([key, value]) => (
            <Card key={key} className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{key.toLowerCase()}</p>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* History table */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-medium text-slate-800">Roster History Log</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <p className="p-6 text-slate-500 text-center">Loading reports...</p>
            ) : records.length === 0 ? (
              <p className="p-6 text-slate-500 text-center">No attendance history logged yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-slate-500">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-700 border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-3">Player</th>
                      <th scope="col" className="px-6 py-3">Session</th>
                      <th scope="col" className="px-6 py-3">Date</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                      <th scope="col" className="px-6 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {record.player.firstName} {record.player.lastName}
                          {record.player.jerseyNumber && (
                            <span className="ml-1 text-[10px] text-slate-400">#{record.player.jerseyNumber}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">{record.session?.title || "Unknown Session"}</td>
                        <td className="px-6 py-4">{record.session ? fmt(record.session.date) : fmt(record.createdAt)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 italic text-slate-400 max-w-xs truncate" title={record.notes}>
                          {record.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
