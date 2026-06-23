"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/navbar";
import { Upload, Plus, X, Pencil, Trash2, ChevronRight } from "lucide-react";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber?: number;
  position?: string;
  isActive: boolean;
  photo?: string;
}

const emptyForm = {
  firstName: "",
  lastName: "",
  jerseyNumber: "",
  position: "",
  photo: "",
};

function Avatar({ player, size = 40 }: { player: Player; size?: number }) {
  const initials = `${player.firstName[0] ?? ""}${player.lastName[0] ?? ""}`.toUpperCase();
  if (player.photo) {
    return (
      <img
        src={player.photo}
        alt={`${player.firstName} ${player.lastName}`}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size, minWidth: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-xs font-black"
      style={{
        width: size,
        height: size,
        minWidth: size,
        background: "var(--wfc-green-dim)",
        color: "var(--wfc-green)",
        border: "1px solid rgba(34,197,94,0.25)",
        fontSize: size > 36 ? "0.8rem" : "0.65rem",
      }}
    >
      {initials}
    </div>
  );
}

export default function PlayersPage() {
  useAuth();

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    api
      .get<Player[]>("/players")
      .then((res) => { if (active) setPlayers(res.data); })
      .catch(() => { if (active) setPlayers([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handlePhotoUpload = async (file: File, playerId?: string) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (playerId) fd.append("playerId", playerId);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json() as { path: string };
      setForm((p) => ({ ...p, photo: data.path }));
    } catch {
      setMessage("Photo upload failed.");
    } finally {
      setUploading(false);
    }
  };

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
      photo: p.photo ?? "",
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
        photo: form.photo || undefined,
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

  const activePlayers = players.filter((p) => p.isActive);

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: "var(--background)" }}>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black" style={{ color: "var(--wfc-text)" }}>
              Players
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--wfc-text-muted)" }}>
              {activePlayers.length} active · {players.length} total
            </p>
          </div>
          <button
            onClick={showForm ? () => setShowForm(false) : openAdd}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all"
            style={{
              background: showForm ? "var(--wfc-surface-2)" : "linear-gradient(135deg, var(--wfc-green) 0%, var(--wfc-green-dark) 100%)",
              color: showForm ? "var(--wfc-text-muted)" : "var(--wfc-surface)",
              border: showForm ? "1px solid var(--wfc-border)" : "none",
              boxShadow: showForm ? "none" : "0 4px 14px rgba(34,197,94,0.30)",
            }}
          >
            {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Add Player</>}
          </button>
        </div>

        {/* Add / Edit form */}
        {showForm && (
          <div
            className="rounded-2xl p-6 space-y-6"
            style={{ background: "var(--wfc-surface)", border: "1px solid var(--wfc-border)" }}
          >
            <h2 className="text-lg font-bold" style={{ color: "var(--wfc-text)" }}>
              {editingId ? "Edit Player" : "Add New Player"}
            </h2>
            <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
              {/* Photo upload */}
              <div className="sm:col-span-2 flex items-center gap-5">
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl overflow-hidden"
                  style={{ border: "2px dashed var(--wfc-border)", background: "var(--wfc-surface-2)", cursor: "pointer" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {form.photo ? (
                    <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={24} style={{ color: "var(--wfc-text-muted)" }} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--wfc-text)" }}>
                    Player Photo
                  </p>
                  <p className="text-xs mt-0.5 mb-2" style={{ color: "var(--wfc-text-muted)" }}>
                    JPG, PNG · Max 5MB
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                    style={{
                      background: "var(--wfc-green-dim)",
                      color: "var(--wfc-green)",
                      border: "1px solid rgba(34,197,94,0.25)",
                    }}
                  >
                    {uploading ? "Uploading…" : "Choose Photo"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handlePhotoUpload(file, editingId ?? undefined);
                    }}
                  />
                </div>
              </div>

              {/* Fields */}
              {[
                { id: "firstName", label: "First Name *", placeholder: "James", type: "text", required: true },
                { id: "lastName", label: "Last Name *", placeholder: "Wilson", type: "text", required: true },
                { id: "jerseyNumber", label: "Jersey Number", placeholder: "10", type: "number" },
                { id: "position", label: "Position", placeholder: "Forward", type: "text" },
              ].map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label
                    htmlFor={field.id}
                    className="block text-sm font-medium"
                    style={{ color: "var(--wfc-text-subtle)" }}
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type={field.type}
                    min={field.id === "jerseyNumber" ? 1 : undefined}
                    max={field.id === "jerseyNumber" ? 99 : undefined}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={form[field.id as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [field.id]: e.target.value }))}
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                    style={{
                      background: "var(--wfc-surface-2)",
                      border: "1px solid var(--wfc-border)",
                      color: "var(--wfc-text)",
                    }}
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
                  disabled={submitting || uploading}
                  className="rounded-xl px-6 py-2.5 text-sm font-bold transition-all disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, var(--wfc-green) 0%, var(--wfc-green-dark) 100%)",
                    color: "var(--wfc-surface)",
                    boxShadow: "0 4px 14px rgba(34,197,94,0.25)",
                  }}
                >
                  {submitting ? "Saving…" : editingId ? "Update Player" : "Add Player"}
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

        {/* Players grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 animate-pulse"
                style={{ background: "var(--wfc-surface)", border: "1px solid var(--wfc-border)", height: 140 }}
              />
            ))}
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-lg font-semibold" style={{ color: "var(--wfc-text)" }}>No players yet</p>
            <p className="text-sm mt-1" style={{ color: "var(--wfc-text-muted)" }}>Click &ldquo;Add Player&rdquo; to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {players.map((player) => (
              <div
                key={player.id}
                className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 group"
                style={{
                  background: "var(--wfc-surface)",
                  border: "1px solid var(--wfc-border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,197,94,0.3)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(34,197,94,0.07)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--wfc-border)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                {/* Avatar + name */}
                <div className="flex items-center gap-3">
                  <Avatar player={player} size={48} />
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: "var(--wfc-text)" }}>
                      {player.firstName} {player.lastName}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--wfc-text-muted)" }}>
                      {player.position || "No position"}
                      {player.jerseyNumber != null && ` · #${player.jerseyNumber}`}
                    </p>
                  </div>
                </div>

                {/* Status badge */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(player)}
                    className="rounded-full px-3 py-1 text-xs font-semibold transition-all"
                    style={{
                      background: player.isActive ? "rgba(34,197,94,0.12)" : "rgba(100,116,139,0.12)",
                      color: player.isActive ? "var(--wfc-green)" : "var(--wfc-text-muted)",
                      border: player.isActive ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(100,116,139,0.2)",
                    }}
                  >
                    {player.isActive ? "Active" : "Inactive"}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1 border-t" style={{ borderColor: "var(--wfc-border)" }}>
                  <Link
                    href={`/players/${player.id}`}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition-all"
                    style={{ background: "var(--wfc-surface-2)", color: "var(--wfc-text-subtle)", border: "1px solid var(--wfc-border)" }}
                  >
                    Profile <ChevronRight size={12} />
                  </Link>
                  <button
                    onClick={() => openEdit(player)}
                    className="flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs transition-all"
                    style={{ background: "var(--wfc-surface-2)", color: "var(--wfc-text-subtle)", border: "1px solid var(--wfc-border)" }}
                    title="Edit"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(player.id)}
                    className="flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs transition-all"
                    style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                    title="Delete"
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
