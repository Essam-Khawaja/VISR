"use client";

import { ChecklistItem as CItem } from "@/types";
import { Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { getItemIcon } from "@/lib/item-icons";

type ChecklistItemProps = {
  item: CItem;
  manualId?: string;
  initialChecked?: boolean;
  onToggle?: (checked: boolean) => void;
  onDelete?: () => void;
};

export default function ChecklistItemRow({
  item,
  initialChecked,
  onToggle,
  onDelete,
}: ChecklistItemProps) {
  const [checked, setChecked] = useState(initialChecked ?? item.checked);
  const Icon = getItemIcon(item.item.name);

  function toggle() {
    const next = !checked;
    setChecked(next);
    onToggle?.(next);
  }

  return (
    <div
      className={`group flex items-center gap-2.5 py-2 px-2.5 rounded-xl transition-all ${
        checked ? "opacity-50" : "hover:bg-white/70"
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors ${
          checked
            ? "bg-emerald-500 border-emerald-500"
            : "border-stone-300 group-hover:border-emerald-400"
        }`}
        aria-label={checked ? "Uncheck" : "Check"}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </button>
      <Icon
        className={`w-4 h-4 shrink-0 ${
          checked ? "text-stone-300" : "text-stone-500"
        }`}
        strokeWidth={2}
      />
      <button
        type="button"
        onClick={toggle}
        className="flex-1 min-w-0 text-left"
      >
        <p
          className={`text-sm font-medium leading-tight ${
            checked ? "line-through text-stone-400" : "text-stone-900"
          }`}
        >
          {item.item.name}
        </p>
        {item.event_title && (
          <p className="text-[11px] text-stone-500 leading-tight mt-0.5 truncate">
            for {item.event_title}
          </p>
        )}
      </button>
      {item.source === "weather" && (
        <span className="text-[10px] uppercase tracking-wider font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-200">
          weather
        </span>
      )}
      {item.source === "event_specific" && (
        <span className="text-[10px] uppercase tracking-wider font-semibold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full border border-violet-200">
          one-time
        </span>
      )}
      {item.source === "manual" && (
        <span className="text-[10px] uppercase tracking-wider font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-200">
          custom
        </span>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
