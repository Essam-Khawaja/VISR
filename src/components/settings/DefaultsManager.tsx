"use client";

import { useEffect, useState } from "react";
import {
  Item,
  CategoryDefaultItem,
  EVENT_CATEGORIES,
  CustomCategory,
} from "@/types";
import { getCategoryStyles, getCategoryIcon } from "@/lib/category-colors";
import { Plus, X, Trash2, Loader2, Backpack } from "lucide-react";
import { getItemIcon } from "@/lib/item-icons";

type CatRow = {
  key: string;
  label: string;
  isCustom: boolean;
  customId?: string;
  items: { id: string; itemId: string; name: string }[];
};

export default function DefaultsManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [defaults, setDefaults] = useState<CategoryDefaultItem[]>([]);
  const [customCats, setCustomCats] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [pending, setPending] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [itemsRes, defRes, catRes] = await Promise.all([
        fetch("/api/items"),
        fetch("/api/category-defaults"),
        fetch("/api/custom-categories"),
      ]);
      if (itemsRes.ok) setItems(await itemsRes.json());
      if (defRes.ok) setDefaults(await defRes.json());
      if (catRes.ok) setCustomCats(await catRes.json());
    } finally {
      setLoading(false);
    }
  }

  async function addItemToCategory(category: string) {
    if (!newItemName.trim()) return;
    setPending(true);
    try {
      let item = items.find(
        (i) => i.name.toLowerCase() === newItemName.trim().toLowerCase()
      );
      if (!item) {
        const res = await fetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newItemName.trim() }),
        });
        if (res.ok) {
          item = await res.json();
        }
      }
      if (!item) return;

      await fetch("/api/category-defaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, item_id: item.id }),
      });
      setNewItemName("");
      setAddingFor(null);
      await load();
    } finally {
      setPending(false);
    }
  }

  async function removeDefault(defaultId: string) {
    setPending(true);
    try {
      await fetch(`/api/category-defaults?id=${defaultId}`, {
        method: "DELETE",
      });
      await load();
    } finally {
      setPending(false);
    }
  }

  async function addCustomCategory() {
    if (!newCategoryLabel.trim()) return;
    setPending(true);
    try {
      await fetch("/api/custom-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newCategoryLabel.trim() }),
      });
      setNewCategoryLabel("");
      setAddingCategory(false);
      await load();
    } finally {
      setPending(false);
    }
  }

  async function deleteCustomCategory(id: string, label: string) {
    if (
      !confirm(
        `Delete category "${label}"? Items linked to it will lose their default tag.`
      )
    )
      return;
    setPending(true);
    try {
      await fetch(`/api/custom-categories?id=${id}`, { method: "DELETE" });
      await load();
    } finally {
      setPending(false);
    }
  }

  const itemMap = new Map(items.map((i) => [i.id, i]));

  const rows: CatRow[] = [
    ...EVENT_CATEGORIES.filter((c) => c !== "transit").map((cat) => ({
      key: cat,
      label: getCategoryStyles(cat).label,
      isCustom: false,
      items: defaults
        .filter((d) => d.category === cat)
        .map((d) => ({
          id: d.id,
          itemId: d.item_id,
          name: itemMap.get(d.item_id)?.name ?? "Unknown",
        })),
    })),
    ...customCats.map((c) => ({
      key: c.name,
      label: c.label,
      isCustom: true,
      customId: c.id,
      items: defaults
        .filter((d) => d.category === c.name)
        .map((d) => ({
          id: d.id,
          itemId: d.item_id,
          name: itemMap.get(d.item_id)?.name ?? "Unknown",
        })),
    })),
  ];

  return (
    <div className="glass-card rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 via-fuchsia-400 to-pink-400 flex items-center justify-center shadow-sm">
            <Backpack className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight text-stone-900">
              Pack defaults per category
            </h2>
            <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
              Items auto-suggested when an event of that type lands on your day.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setAddingCategory((v) => !v);
            setNewCategoryLabel("");
          }}
          className="text-[11px] font-medium px-2 py-1 rounded-lg btn-ghost flex items-center gap-1"
        >
          {addingCategory ? (
            <>
              <X className="w-3 h-3" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" />
              Category
            </>
          )}
        </button>
      </div>

      {addingCategory && (
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/60 border border-stone-200/60">
          <input
            type="text"
            value={newCategoryLabel}
            onChange={(e) => setNewCategoryLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomCategory();
              }
            }}
            placeholder="e.g. Volunteering"
            className="flex-1 input-soft py-1 text-xs"
            autoFocus
          />
          <button
            type="button"
            onClick={addCustomCategory}
            disabled={pending || !newCategoryLabel.trim()}
            className="px-2.5 py-1 rounded-lg btn-primary text-xs font-medium disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => {
            const styles = getCategoryStyles(row.key);
            const Icon = getCategoryIcon(row.key);
            const adding = addingFor === row.key;
            return (
              <div
                key={row.key}
                className="rounded-xl bg-white/60 border border-stone-200/60 p-3"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg bg-gradient-to-br ${styles.accent} flex items-center justify-center shrink-0`}
                    >
                      <Icon
                        className="w-3 h-3 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                    <p className="text-sm font-semibold text-stone-900 truncate">
                      {row.label}
                    </p>
                    {row.isCustom && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-full border border-stone-200">
                        custom
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setAddingFor(adding ? null : row.key);
                        setNewItemName("");
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
                          Item
                        </>
                      )}
                    </button>
                    {row.isCustom && row.customId && (
                      <button
                        onClick={() =>
                          deleteCustomCategory(row.customId!, row.label)
                        }
                        disabled={pending}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                        aria-label={`Delete category ${row.label}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {row.items.length === 0 && !adding && (
                    <p className="text-[11px] text-stone-400 italic py-0.5">
                      No defaults
                    </p>
                  )}
                  {row.items.map((it) => {
                    const ItemIcon = getItemIcon(it.name);
                    return (
                      <span
                        key={it.id}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-white rounded-full border border-stone-200 text-stone-700"
                      >
                        <ItemIcon
                          className="w-3 h-3 text-stone-500"
                          strokeWidth={2}
                        />
                        {it.name}
                        <button
                          onClick={() => removeDefault(it.id)}
                          disabled={pending}
                          className="text-stone-400 hover:text-rose-600 disabled:opacity-50"
                          aria-label={`Remove ${it.name}`}
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>

                {adding && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addItemToCategory(row.key);
                        }
                      }}
                      placeholder="e.g. Lab notebook"
                      className="flex-1 input-soft py-1 text-xs"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => addItemToCategory(row.key)}
                      disabled={pending || !newItemName.trim()}
                      className="px-2.5 py-1 rounded-lg btn-primary text-xs font-medium disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
