import { EventCategory } from "@/lib/1/types";

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

// All categories live inside the Pathwise warm palette
// (amaranth / thulian / sage / brook / pomelo / chalk). The result is
// distinguishable but harmonious — nothing screams "Bootstrap blue" at
// 8am anymore.
export const CATEGORY_CONFIG: Record<EventCategory, CategoryStyles> = {
  // study / learning -> sage
  class: {
    label: "Class / Lab",
    bgGradient: "from-sage/[0.06] to-sage/[0.14]",
    bgSoft: "bg-sage/[0.08]",
    border: "border-sage/25",
    text: "text-sage",
    dot: "bg-sage",
    ring: "ring-sage/40",
    accent: "from-sage to-sage/70",
  },
  // people sync -> thulian
  meeting: {
    label: "Meeting",
    bgGradient: "from-thulian/[0.06] to-thulian/[0.14]",
    bgSoft: "bg-thulian/[0.08]",
    border: "border-thulian/25",
    text: "text-thulian",
    dot: "bg-thulian",
    ring: "ring-thulian/40",
    accent: "from-thulian to-amaranth",
  },
  // deadline / exam -> amaranth (urgent but warm)
  assignment: {
    label: "Assignment / Exam",
    bgGradient: "from-amaranth/[0.05] to-amaranth/[0.14]",
    bgSoft: "bg-amaranth/[0.08]",
    border: "border-amaranth/25",
    text: "text-amaranth",
    dot: "bg-amaranth",
    ring: "ring-amaranth/40",
    accent: "from-amaranth to-[#74304A]",
  },
  // focused making -> pomelo
  project: {
    label: "Project",
    bgGradient: "from-pomelo/[0.06] to-pomelo/[0.16]",
    bgSoft: "bg-pomelo/[0.10]",
    border: "border-pomelo/25",
    text: "text-pomelo",
    dot: "bg-pomelo",
    ring: "ring-pomelo/40",
    accent: "from-pomelo to-pomelo/70",
  },
  // community -> thulian variant
  club: {
    label: "Club",
    bgGradient: "from-thulian/[0.04] to-amaranth/[0.10]",
    bgSoft: "bg-thulian/[0.07]",
    border: "border-thulian/20",
    text: "text-thulian",
    dot: "bg-thulian",
    ring: "ring-thulian/35",
    accent: "from-thulian to-amaranth",
  },
  // movement / transit -> muted brook
  transit: {
    label: "Transit",
    bgGradient: "from-brook/[0.08] to-brook/[0.18]",
    bgSoft: "bg-brook/[0.10]",
    border: "border-brook/30",
    text: "text-secondary",
    dot: "bg-brook",
    ring: "ring-brook/40",
    accent: "from-brook to-brook/70",
  },
  // errand-y warmth -> chalk
  grocery: {
    label: "Grocery",
    bgGradient: "from-chalk/[0.25] to-chalk/[0.45]",
    bgSoft: "bg-chalk/[0.30]",
    border: "border-chalk/60",
    text: "text-pomelo",
    dot: "bg-chalk",
    ring: "ring-chalk/60",
    accent: "from-chalk to-pomelo/60",
  },
  // body / energy -> sage
  gym: {
    label: "Gym",
    bgGradient: "from-sage/[0.07] to-sage/[0.16]",
    bgSoft: "bg-sage/[0.10]",
    border: "border-sage/30",
    text: "text-sage",
    dot: "bg-sage",
    ring: "ring-sage/40",
    accent: "from-sage to-brook",
  },
  // rest -> brook
  break: {
    label: "Break",
    bgGradient: "from-brook/[0.10] to-brook/[0.20]",
    bgSoft: "bg-brook/[0.12]",
    border: "border-brook/35",
    text: "text-brook",
    dot: "bg-brook",
    ring: "ring-brook/40",
    accent: "from-brook to-sage/80",
  },
  // personal task -> thulian
  personal: {
    label: "Personal",
    bgGradient: "from-thulian/[0.05] to-thulian/[0.12]",
    bgSoft: "bg-thulian/[0.08]",
    border: "border-thulian/22",
    text: "text-thulian",
    dot: "bg-thulian",
    ring: "ring-thulian/35",
    accent: "from-thulian to-amaranth",
  },
  // protected personal time -> brook quiet
  personal_time: {
    label: "Personal time",
    bgGradient: "from-brook/[0.10] to-chalk/[0.25]",
    bgSoft: "bg-brook/[0.10]",
    border: "border-brook/30",
    text: "text-brook",
    dot: "bg-brook",
    ring: "ring-brook/40",
    accent: "from-brook to-chalk",
  },
  // social / fun -> warm thulian
  social: {
    label: "Social",
    bgGradient: "from-thulian/[0.08] to-amaranth/[0.10]",
    bgSoft: "bg-thulian/[0.10]",
    border: "border-thulian/28",
    text: "text-thulian",
    dot: "bg-thulian",
    ring: "ring-thulian/40",
    accent: "from-thulian to-amaranth",
  },
  // running an errand -> pomelo
  errand: {
    label: "Errand",
    bgGradient: "from-pomelo/[0.07] to-chalk/[0.30]",
    bgSoft: "bg-pomelo/[0.08]",
    border: "border-pomelo/25",
    text: "text-pomelo",
    dot: "bg-pomelo",
    ring: "ring-pomelo/35",
    accent: "from-pomelo to-chalk",
  },
};
