import { PersonalTimeBlock, TimelineEvent } from "@/lib/1/types";
import { isoDateFromDate } from "./timeline-utils";

const HOME_KEYWORDS = [
  "home",
  "house",
  "apartment",
  "dorm",
  "bedroom",
  "living room",
  "desk",
  "kitchen",
  "remote",
  "online",
  "discord",
  "zoom",
  "teams",
  "google meet",
];

export function eventLeavesHomeText(text: string | null | undefined): boolean {
  const t = (text ?? "").toLowerCase().trim();
  if (!t) return false;
  return !HOME_KEYWORDS.some((k) => t.includes(k));
}

export function blocksForDate(
  blocks: PersonalTimeBlock[],
  date: Date
): PersonalTimeBlock[] {
  const iso = isoDateFromDate(date);
  const weekday = date.getDay();
  return blocks
    .filter((b) => b.active)
    .filter((b) => {
      if (b.specific_date) return b.specific_date === iso;
      if (b.weekday != null) return b.weekday === weekday;
      return false;
    });
}

export function blocksToPhantomEvents(
  blocks: PersonalTimeBlock[],
  date: Date
): TimelineEvent[] {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  return blocks.map((b, idx) => {
    const [sh, sm] = b.start_time.split(":").map(Number);
    const [eh, em] = b.end_time.split(":").map(Number);
    const start = new Date(dayStart);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(dayStart);
    end.setHours(eh, em, 0, 0);
    return {
      id: `personal-${b.id}-${idx}`,
      title: b.label,
      description: null,
      category: "personal_time",
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      location: null,
      location_id: null,
      auto_transit: false,
      is_recurring: false,
      recurrence_rule: null,
      notes: null,
      note_status: null,
      completed: false,
      created_at: new Date().toISOString(),
    };
  });
}
