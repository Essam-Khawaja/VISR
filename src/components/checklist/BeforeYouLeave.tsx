"use client";

import { ChecklistItem, ManualChecklistItem } from "@/types";
import ChecklistItemRow from "./ChecklistItem";
import { Backpack, Plus, X } from "lucide-react";
import { useState } from "react";
import { todayISODate } from "@/lib/timeline-utils";

type BeforeYouLeaveProps = {
  items: ChecklistItem[];
  manualItems: ManualChecklistItem[];
  forDate: string;
  onAddManual: (name: string) => Promise<void>;
  onDeleteManual: (id: string) => Promise<void>;
  onToggleManual: (id: string, checked: boolean) => Promise<void>;
};

export default function BeforeYouLeave({
  items,
  manualItems,
  forDate,
  onAddManual,
  onDeleteManual,
  onToggleManual,
}: BeforeYouLeaveProps) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);

  const dayEnded = forDate < todayISODate();

  const combined: ChecklistItem[] = [
    ...items,
    ...manualItems.map((m) => ({
      item: {
        id: m.id,
        name: m.item_name,
        icon: null,
        created_at: m.created_at,
      },
      source: "manual" as const,
      manual_id: m.id,
      checked: m.checked,
      locked: dayEnded,
    })),
  ].sort((a, b) => Number(a.locked) - Number(b.locked));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setPending(true);
    try {
      await onAddManual(name.trim());
      setName("");
      setAdding(false);
    } finally {
      setPending(false);
    }
  }

  if (combined.length === 0 && !adding) {
    return (
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 via-fuchsia-400 to-pink-400 flex items-center justify-center shadow-sm">
              <Backpack className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-sm font-semibold leading-tight text-stone-900">
                Before You Leave
              </h2>
              <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                Nothing to pack. Add a custom one if needed.
              </p>
            </div>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="text-[11px] font-medium px-2 py-1 rounded-lg btn-ghost flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Custom
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 via-fuchsia-400 to-pink-400 flex items-center justify-center shadow-sm">
            <Backpack className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight text-stone-900">
              Before You Leave
            </h2>
            <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
              {combined.length} {combined.length === 1 ? "item" : "items"} to pack
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (adding) {
              setAdding(false);
              setName("");
            } else {
              setAdding(true);
            }
          }}
          className="text-[11px] font-medium px-2 py-1 rounded-lg btn-ghost flex items-center gap-1"
        >
          {adding ? (
            <>
              <X className="w-3 h-3" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" />
              Custom
            </>
          )}
        </button>
      </div>

      {adding && (
        <form
          onSubmit={submit}
          className="mb-2 flex items-center gap-1.5 p-2 rounded-xl bg-white/60 border border-stone-200/60"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. House keys"
            className="flex-1 input-soft py-1 text-xs"
            autoFocus
          />
          <button
            type="submit"
            disabled={pending || !name.trim()}
            className="px-2.5 py-1 rounded-lg btn-primary text-xs font-medium disabled:opacity-50"
          >
            Add
          </button>
        </form>
      )}

      <div className="space-y-0.5">
        {combined.map((item, i) => (
          <ChecklistItemRow
            key={item.manual_id ?? `${item.source}-${item.item.id}-${i}`}
            item={item}
            initialChecked={item.checked}
            onToggle={(checked) => {
              if (item.manual_id && !item.locked) {
                onToggleManual(item.manual_id, checked);
              }
            }}
            onDelete={
              item.manual_id && !item.locked
                ? () => onDeleteManual(item.manual_id!)
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
