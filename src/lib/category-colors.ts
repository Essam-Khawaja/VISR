import { EventCategory } from "@/types";
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
  social: PartyPopper,
  errand: Package,
};

export function getCategoryStyles(category: EventCategory): CategoryStyles {
  return CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.personal;
}

export function getCategoryLabel(category: EventCategory): string {
  return CATEGORY_CONFIG[category]?.label ?? category;
}

export function getCategoryIcon(category: EventCategory): LucideIcon {
  return CATEGORY_ICONS[category] ?? Sparkles;
}
