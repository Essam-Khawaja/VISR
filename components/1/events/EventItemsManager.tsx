"use client";

import { useEffect, useState, useCallback } from "react";
import { Item } from "@/lib/1/types";
import { Plus, X, Loader2 } from "lucide-react";
import { getItemIcon } from "@/lib/1/item-icons";

type LinkedItem = {
  id: string;
  item_id: string;
  is_one_time: boolean;
  items: Item;
};

type EventItemsManagerProps = {
  eventId: string;
};

export default function EventItemsManager({ eventId }: EventItemsManagerProps) {
  const [linked, setLinked] = useState<LinkedItem[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [linkedRes, itemsRes] = await Promise.all([
        fetch(`/api/1/event-items?event_id=${eventId}`),
        fetch("/api/1/items"),
      ]);
      if (linkedRes.ok) setLinked(await linkedRes.json());
      if (itemsRes.ok) setAllItems(await itemsRes.json());
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  async function addItem() {
    if (!name.trim()) return;
    setPending(true);
    try {
      let item = allItems.find(
        (i) => i.name.toLowerCase() === name.trim().toLowerCase()
      );
      if (!item) {
        const itemRes = await fetch("/api/1/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() }),
        });
        if (itemRes.ok) {
          item = await itemRes.json();
        }
      }
      if (!item) return;

      await fetch("/api/1/event-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          item_id: item.id,
          is_one_time: true,
        }),
      });
      setName("");
      setAdding(false);
      await load();
    } finally {
      setPending(false);
    }
  }

  async function removeLink(id: string) {
    setPending(true);
    try {
      await fetch(`/api/1/event-items?id=${id}`, { method: "DELETE" });
      await load();
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          Items for this event
        </label>
        <button
          type="button"
          onClick={() => {
            if (adding) {
              setAdding(false);
              setName("");
            } else {
              setAdding(true);
            }
          }}
          className="text-[11px] font-medium px-2 py-0.5 rounded-lg btn-ghost flex items-center gap-1"
        >
          {adding ? (
            <>
              <X className="w-3 h-3" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" />
              Add
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-start py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-400" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {linked.length === 0 && !adding && (
            <p className="text-[11px] text-stone-400 italic py-1">
              No specific items for this event
            </p>
          )}
          {linked.map((l) => {
            const Icon = getItemIcon(l.items.name);
            return (
              <span
                key={l.id}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-white rounded-full border border-stone-200 text-stone-700"
              >
                <Icon className="w-3 h-3 text-stone-500" strokeWidth={2} />
                {l.items.name}
                <button
                  type="button"
                  onClick={() => removeLink(l.id)}
                  disabled={pending}
                  className="text-stone-400 hover:text-rose-600 disabled:opacity-50"
                  aria-label={`Remove ${l.items.name}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {adding && (
        <div className="mt-2 flex items-center gap-1.5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                addItem();
              } else if (e.key === "Escape") {
                e.preventDefault();
                setAdding(false);
                setName("");
              }
            }}
            placeholder="e.g. Arduino kit"
            className="flex-1 input-soft py-1 text-xs"
            autoComplete="off"
            autoFocus
          />
          <button
            type="button"
            onClick={addItem}
            disabled={pending || !name.trim()}
            className="px-2.5 py-1 rounded-lg btn-primary text-xs font-medium disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}

      <p className="text-[10px] text-stone-400 italic mt-1.5">
        These show up in &ldquo;Before You Leave&rdquo; on this event&apos;s day.
      </p>
    </div>
  );
}
