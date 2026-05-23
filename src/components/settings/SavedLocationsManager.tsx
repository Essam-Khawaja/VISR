"use client";

import { useEffect, useState } from "react";
import { SavedLocation, LocationType, LOCATION_TYPES } from "@/types";
import { MapPin, Trash2, Plus, Loader2, X, Pencil } from "lucide-react";

export default function SavedLocationsManager() {
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [locationType, setLocationType] = useState<LocationType>("university");
  const [transitMinutes, setTransitMinutes] = useState(30);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/saved-locations");
      if (res.ok) {
        setLocations(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName("");
    setAddress("");
    setLocationType("university");
    setTransitMinutes(30);
    setEditingId(null);
  }

  function startEdit(l: SavedLocation) {
    setEditingId(l.id);
    setName(l.name);
    setAddress(l.address ?? "");
    setLocationType((l.location_type ?? "other") as LocationType);
    setTransitMinutes(l.transit_minutes);
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const body = {
      name: name.trim(),
      address: address.trim() || null,
      location_type: locationType,
      transit_minutes: transitMinutes,
    };
    if (editingId) {
      await fetch("/api/saved-locations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...body }),
      });
    } else {
      await fetch("/api/saved-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    resetForm();
    setShowForm(false);
    await load();
  }

  async function deleteLocation(id: string) {
    if (!confirm("Delete this location?")) return;
    await fetch(`/api/saved-locations?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="glass-card rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-sm">
            <MapPin className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight text-stone-900">
              Saved locations
            </h2>
            <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
              Quick pick when scheduling. Includes commute time
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="text-xs font-medium px-2.5 py-1.5 rounded-xl btn-ghost flex items-center gap-1"
        >
          {showForm ? (
            <>
              <X className="w-3.5 h-3.5" /> Cancel
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" /> Add
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={submit}
          className="p-3 rounded-xl bg-white/60 border border-stone-200/60 space-y-2"
        >
          <input
            type="text"
            placeholder="Name (e.g. University of Calgary)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full input-soft"
            autoFocus
          />
          <input
            type="text"
            placeholder="Address (optional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full input-soft"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={locationType}
              onChange={(e) => setLocationType(e.target.value as LocationType)}
              className="input-soft"
            >
              {LOCATION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              max={240}
              value={transitMinutes}
              onChange={(e) => setTransitMinutes(Number(e.target.value))}
              placeholder="Transit min"
              className="input-soft"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 rounded-xl btn-primary text-sm font-medium"
          >
            {editingId ? "Save location" : "Add location"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
        </div>
      ) : locations.length === 0 ? (
        <p className="text-xs text-stone-500 text-center py-4">
          No saved locations yet. Add one to get started.
        </p>
      ) : (
        <div className="space-y-1.5">
          {locations.map((l) => (
            <div
              key={l.id}
              className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-white/50 border border-stone-200/60"
            >
              <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900 truncate">
                  {l.name}
                </p>
                <p className="text-[11px] text-stone-500">
                  {l.location_type}
                  {l.transit_minutes > 0 && ` · ${l.transit_minutes} min away`}
                </p>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(l)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-white"
                  aria-label="Edit location"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteLocation(l.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                  aria-label="Delete location"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
