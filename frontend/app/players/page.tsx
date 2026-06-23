"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber?: number;
  position?: string;
  isActive: boolean;
}

const emptyForm = {
  firstName: "",
  lastName: "",
  jerseyNumber: "",
  position: "",
};

export default function PlayersPage() {
  useAuth();

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const res = await api.get<Player[]>("/players");
      setPlayers(res.data);
    } catch {
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    api.get<Player[]>("/players")
      .then((res) => {
        if (active) setPlayers(res.data);
      })
      .catch(() => {
        if (active) setPlayers([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setShowForm(true);
  };

  const openEdit = (p: Player) => {
    setEditingId(p.id);
    setForm({
      firstName: p.firstName,
      lastName: p.lastName,
      jerseyNumber: p.jerseyNumber?.toString() ?? "",
      position: p.position ?? "",
    });
    setMessage("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        jerseyNumber: form.jerseyNumber ? Number(form.jerseyNumber) : undefined,
        position: form.position || undefined,
      };
      if (editingId) {
        await api.patch(`/players/${editingId}`, payload);
        setMessage("Player updated.");
      } else {
        await api.post("/players", payload);
        setMessage("Player added.");
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await load();
    } catch {
      setMessage("Failed to save player.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this player? This cannot be undone.")) return;
    try {
      await api.delete(`/players/${id}`);
      await load();
    } catch {
      alert("Failed to delete player.");
    }
  };

  const handleToggleActive = async (p: Player) => {
    try {
      await api.patch(`/players/${p.id}`, { isActive: !p.isActive });
      await load();
    } catch {
      alert("Failed to update player status.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Players</h1>
            <p className="text-sm text-slate-500">
              {players.filter((p) => p.isActive).length} active ·{" "}
              {players.length} total
            </p>
          </div>
          <Button onClick={showForm ? () => setShowForm(false) : openAdd}>
            {showForm ? "Cancel" : "Add Player"}
          </Button>
        </div>

        {/* Add / Edit form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit Player" : "Add New Player"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit}
                className="grid gap-4 sm:grid-cols-2"
              >
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, firstName: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, lastName: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jerseyNumber">Jersey Number</Label>
                  <Input
                    id="jerseyNumber"
                    type="number"
                    min="1"
                    max="99"
                    value={form.jerseyNumber}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, jerseyNumber: e.target.value }))
                    }
                    placeholder="e.g. 10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={form.position}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, position: e.target.value }))
                    }
                    placeholder="e.g. Forward"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-4">
                  <Button type="submit" disabled={submitting}>
                    {submitting
                      ? "Saving…"
                      : editingId
                      ? "Update Player"
                      : "Add Player"}
                  </Button>
                  {message && (
                    <p className="text-sm text-slate-600">{message}</p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Players table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <p className="p-6 text-slate-500">Loading players…</p>
            ) : players.length === 0 ? (
              <p className="p-6 text-slate-500">
                No players yet. Click &ldquo;Add Player&rdquo; to get started.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">
                        Jersey #
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">
                        Position
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {players.map((player) => (
                      <tr key={player.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium">
                          {player.firstName} {player.lastName}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {player.jerseyNumber != null
                            ? `#${player.jerseyNumber}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {player.position || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleActive(player)}
                            title="Click to toggle active status"
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                              player.isActive
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                          >
                            {player.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(player)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(player.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            Delete
                          </Button>
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
