"use client";

import { EventCategory } from "@/types";
import { getCategoryStyles, getCategoryIcon } from "@/lib/category-colors";

type CategoryBadgeProps = {
  category: EventCategory;
  size?: "sm" | "md";
};

export default function CategoryBadge({
  category,
  size = "sm",
}: CategoryBadgeProps) {
  const styles = getCategoryStyles(category);
  const Icon = getCategoryIcon(category);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${styles.bgSoft} ${styles.border} ${styles.text} ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
      }`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{styles.label}</span>
    </span>
  );
}
