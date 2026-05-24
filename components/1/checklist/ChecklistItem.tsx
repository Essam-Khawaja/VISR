"use client";

import { ChecklistItem as CItem } from "@/lib/1/types";
import { Check, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getItemIcon } from "@/lib/1/item-icons";

type ChecklistItemProps = {
  item: CItem;
  manualId?: string;
  initialChecked?: boolean;
  onToggle?: (checked: boolean) => void;
  onDelete?: () => void;
};

const SOURCE_META: Record<
  CItem["source"],
  { label: string; className: string } | null
> = {
  weather: {
    label: "weather",
    className: "text-amber-700 bg-amber-100/60 border-amber-300/70",
  },
  event_specific: {
    label: "one-time",
    className: "text-purple-700 bg-purple-100/60 border-purple-300/70",
  },
  manual: {
    label: "custom",
    className: "text-amaranth bg-amaranth/[0.08] border-amaranth/22",
  },
  category_default: null,
};

export default function ChecklistItemRow({
  item,
  initialChecked,
  onToggle,
  onDelete,
}: ChecklistItemProps) {
  const [checked, setChecked] = useState(initialChecked ?? item.checked);
  useEffect(() => {
    setChecked(initialChecked ?? item.checked);
  }, [initialChecked, item.checked]);

  const locked = item.locked === true;
  const Icon = getItemIcon(item.item.name);
  const sourceMeta = SOURCE_META[item.source];

  function toggle() {
    if (locked) return;
    const next = !checked;
    setChecked(next);
    onToggle?.(next);
  }

  return (
    <div
      className={`group flex items-center gap-2.5 py-2 px-2.5 rounded-xl transition-all ${
        locked
          ? "opacity-45"
          : checked
            ? "opacity-50"
            : "hover:bg-white/70"
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        disabled={locked}
        className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
          locked
            ? "border-border bg-elevated cursor-not-allowed"
            : checked
              ? "bg-sage border-sage"
              : "border-border-strong group-hover:border-sage"
        }`}
        aria-label={
          locked ? "Locked" : checked ? "Uncheck" : "Check"
        }
      >
        {checked && !locked && (
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        )}
        {checked && locked && (
          <Check className="w-3 h-3 text-stone-400" strokeWidth={3} />
        )}
      </button>
      <Icon
        className={`w-4 h-4 shrink-0 ${
          locked ? "text-stone-300" : checked ? "text-stone-300" : "text-stone-500"
        }`}
        strokeWidth={2}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-tight ${
            locked
              ? "text-stone-400"
              : checked
                ? "line-through text-stone-400"
                : "text-stone-900"
          }`}
        >
          {item.item.name}
        </p>
        {item.event_title && (
          <p
            className={`text-[11px] leading-tight mt-0.5 truncate ${
              locked ? "text-stone-400" : "text-stone-500"
            }`}
          >
            for {item.event_title}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {sourceMeta && (
          <span
            className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full border ${
              locked
                ? "text-stone-400 bg-stone-50 border-stone-200"
                : sourceMeta.className
            }`}
          >
            {sourceMeta.label}
          </span>
        )}
        <div className="w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center shrink-0">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="w-full h-full rounded-full flex items-center justify-center text-tertiary hover:text-amaranth hover:bg-amaranth/[0.08] transition-colors"
              aria-label="Remove"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

