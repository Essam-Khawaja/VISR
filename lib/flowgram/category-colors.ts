import { EventCategory } from "@/lib/flowgram/types";
import { CATEGORY_CONFIG, CategoryStyles } from "./constants";
import {
  BookOpen,
  Users,
  AlertCircle,
  Wrench,
  Landmark,
  Bus,
  ShoppingCart,
  Dumbbell,
  Coffee,
  Sparkles,
  PartyPopper,
  Package,
  Tag,
  Moon,
  LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<EventCategory, LucideIcon> = {
  class: BookOpen,
  meeting: Users,
  assignment: AlertCircle,
  project: Wrench,
  club: Landmark,
  transit: Bus,
  grocery: ShoppingCart,
  gym: Dumbbell,
  break: Coffee,
  personal: Sparkles,
  personal_time: Moon,
  social: PartyPopper,
  errand: Package,
};

const GENERIC_STYLES: CategoryStyles = {
  label: "Custom",
  bgGradient: "from-chalk/[0.20] to-chalk/[0.35]",
  bgSoft: "bg-chalk/[0.20]",
  border: "border-border-strong",
  text: "text-secondary",
  dot: "bg-pomelo",
  ring: "ring-chalk/60",
  accent: "from-pomelo to-chalk",
};

export function getCategoryStyles(category: string): CategoryStyles {
  const cfg = CATEGORY_CONFIG[category as EventCategory];
  return cfg ?? GENERIC_STYLES;
}

export function getCategoryLabel(category: string): string {
  return CATEGORY_CONFIG[category as EventCategory]?.label ?? category;
}

export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category as EventCategory] ?? Tag;
}
