import { EventCategory } from "@/types";

export type CategoryStyles = {
  label: string;
  bgGradient: string;
  bgSoft: string;
  border: string;
  text: string;
  dot: string;
  ring: string;
  accent: string;
};

export const CATEGORY_CONFIG: Record<EventCategory, CategoryStyles> = {
  class: {
    label: "Class / Lab",
    bgGradient: "from-sky-50 to-blue-50",
    bgSoft: "bg-sky-50/70",
    border: "border-sky-200",
    text: "text-sky-700",
    dot: "bg-sky-400",
    ring: "ring-sky-200",
    accent: "from-sky-400 to-blue-500",
  },
  meeting: {
    label: "Meeting",
    bgGradient: "from-orange-50 to-amber-50",
    bgSoft: "bg-orange-50/70",
    border: "border-orange-200",
    text: "text-orange-700",
    dot: "bg-orange-400",
    ring: "ring-orange-200",
    accent: "from-orange-400 to-amber-500",
  },
  assignment: {
    label: "Assignment / Exam",
    bgGradient: "from-rose-50 to-red-50",
    bgSoft: "bg-rose-50/70",
    border: "border-rose-200",
    text: "text-rose-700",
    dot: "bg-rose-400",
    ring: "ring-rose-200",
    accent: "from-rose-400 to-red-500",
  },
  project: {
    label: "Project",
    bgGradient: "from-violet-50 to-purple-50",
    bgSoft: "bg-violet-50/70",
    border: "border-violet-200",
    text: "text-violet-700",
    dot: "bg-violet-400",
    ring: "ring-violet-200",
    accent: "from-violet-400 to-purple-500",
  },
  club: {
    label: "Club",
    bgGradient: "from-purple-50 to-fuchsia-50",
    bgSoft: "bg-purple-50/70",
    border: "border-purple-200",
    text: "text-purple-700",
    dot: "bg-purple-400",
    ring: "ring-purple-200",
    accent: "from-purple-400 to-fuchsia-500",
  },
  transit: {
    label: "Transit",
    bgGradient: "from-slate-50 to-stone-50",
    bgSoft: "bg-slate-50/70",
    border: "border-slate-200",
    text: "text-slate-600",
    dot: "bg-slate-400",
    ring: "ring-slate-200",
    accent: "from-slate-400 to-stone-500",
  },
  grocery: {
    label: "Grocery",
    bgGradient: "from-amber-50 to-yellow-50",
    bgSoft: "bg-amber-50/70",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-400",
    ring: "ring-amber-200",
    accent: "from-amber-400 to-yellow-500",
  },
  gym: {
    label: "Gym",
    bgGradient: "from-emerald-50 to-green-50",
    bgSoft: "bg-emerald-50/70",
    border: "border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
    ring: "ring-emerald-200",
    accent: "from-emerald-400 to-green-500",
  },
  break: {
    label: "Break",
    bgGradient: "from-teal-50 to-cyan-50",
    bgSoft: "bg-teal-50/70",
    border: "border-teal-200",
    text: "text-teal-700",
    dot: "bg-teal-400",
    ring: "ring-teal-200",
    accent: "from-teal-400 to-cyan-500",
  },
  personal: {
    label: "Personal",
    bgGradient: "from-indigo-50 to-blue-50",
    bgSoft: "bg-indigo-50/70",
    border: "border-indigo-200",
    text: "text-indigo-700",
    dot: "bg-indigo-400",
    ring: "ring-indigo-200",
    accent: "from-indigo-400 to-blue-500",
  },
  personal_time: {
    label: "Personal time",
    bgGradient: "from-purple-50 to-indigo-50",
    bgSoft: "bg-purple-50/70",
    border: "border-purple-200",
    text: "text-purple-700",
    dot: "bg-purple-400",
    ring: "ring-purple-200",
    accent: "from-purple-400 to-indigo-500",
  },
  social: {
    label: "Social",
    bgGradient: "from-pink-50 to-rose-50",
    bgSoft: "bg-pink-50/70",
    border: "border-pink-200",
    text: "text-pink-700",
    dot: "bg-pink-400",
    ring: "ring-pink-200",
    accent: "from-pink-400 to-rose-500",
  },
  errand: {
    label: "Errand",
    bgGradient: "from-yellow-50 to-amber-50",
    bgSoft: "bg-yellow-50/70",
    border: "border-yellow-200",
    text: "text-yellow-700",
    dot: "bg-yellow-400",
    ring: "ring-yellow-200",
    accent: "from-yellow-400 to-amber-500",
  },
};

