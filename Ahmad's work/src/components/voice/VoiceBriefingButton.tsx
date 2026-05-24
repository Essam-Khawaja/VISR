"use client";

import { useEffect, useRef, useState } from "react";
import {
  TimelineEvent,
  ChecklistItem,
  WeatherData,
  Routine,
  ManualChecklistItem,
  PersonalTimeBlock,
} from "@/types";
import {
  sortEventsByTime,
  formatTime,
  isPastEvent,
  todayISODate,
  isSameDay,
} from "@/lib/timeline-utils";
import { isRoutineScheduledOnDate } from "@/lib/routine-schedule";
import { blocksForDate } from "@/lib/personal-time";
import { Volume2, VolumeX } from "lucide-react";

type VoiceBriefingButtonProps = {
  events: TimelineEvent[];
  items: ChecklistItem[];
  manualItems: ManualChecklistItem[];
  personalTimeBlocks: PersonalTimeBlock[];
  forDate: string;
  weather?: WeatherData | null;
};

function formatTimeLabel(time: string | null): string {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h)) return "";
  const d = new Date();
  d.setHours(h, m || 0, 0, 0);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function joinList(parts: string[]): string {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

function dayPhrase(forDate: string): {
  greeting: string;
  intro: string;
  past: boolean;
} {
  const target = new Date(`${forDate}T12:00:00`);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isToday = isSameDay(target, today);
  const isTomorrow = isSameDay(target, tomorrow);
  const past = target.getTime() < today.getTime() && !isToday;

  if (isToday) {
    const hour = today.getHours();
    const greeting =
      hour < 12
        ? "Good morning"
        : hour < 17
          ? "Good afternoon"
          : "Good evening";
    return { greeting, intro: "Here's what's still ahead today.", past: false };
  }

  const dateLabel = target.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (isTomorrow) {
    return {
      greeting: "Heads up",
      intro: `Here's what tomorrow, ${dateLabel}, looks like.`,
      past: false,
    };
  }

  if (past) {
    return {
      greeting: "Looking back",
      intro: `Here's how ${dateLabel} went.`,
      past: true,
    };
  }

  return {
    greeting: "Looking ahead",
    intro: `Here's what ${dateLabel} looks like.`,
    past: false,
  };
}

function buildScript(
  events: TimelineEvent[],
  items: ChecklistItem[],
  manualItems: ManualChecklistItem[],
  personalTimeBlocks: PersonalTimeBlock[],
  routines: Routine[],
  forDate: string,
  weather?: WeatherData | null
): string {
  const { greeting, intro, past } = dayPhrase(forDate);
  const isToday = forDate === todayISODate();

  const relevant = sortEventsByTime(events)
    .filter((e) => e.category !== "personal_time")
    .filter((e) => (isToday ? !isPastEvent(e) : true));

  let script = `${greeting}. ${intro} `;

  if (weather) {
    const tempLabel = `${Math.round(weather.temp)} degrees`;
    if (past) {
      script += `It was about ${tempLabel}. `;
    } else if (weather.is_forecast && !isToday) {
      script += `Expected around ${tempLabel}, ${weather.description}. `;
    } else {
      script += `It's ${tempLabel}, ${weather.description}. `;
    }
    if (weather.rain_probability >= 50) {
      script += past
        ? "There was a good chance of rain. "
        : "Bring an umbrella, decent chance of rain. ";
    }
    if (weather.snow) {
      script += past ? "Snowy day. " : "Snow likely, dress warm. ";
    }
  }

  if (relevant.length === 0) {
    script += isToday
      ? "Nothing else scheduled. You're free for the rest of the day. "
      : "Nothing on the calendar yet. ";
  } else {
    const verb = past ? "had" : "have";
    const thingWord = relevant.length === 1 ? "thing" : "things";
    const tense = isToday ? "left" : past ? "" : "lined up";
    script += `You ${verb} ${relevant.length} ${thingWord}${tense ? ` ${tense}` : ""}. `;
    for (const e of relevant) {
      script += `${e.title} at ${formatTime(e.start_time)}. `;
    }
  }

  const target = new Date(`${forDate}T12:00:00`);
  const dayRoutines = routines.filter((r) =>
    isRoutineScheduledOnDate(r, target)
  );
  if (dayRoutines.length > 0 && !past) {
    const routineLines = dayRoutines.map((r) => {
      const t = formatTimeLabel(r.preferred_time);
      return t ? `${r.title} around ${t}` : r.title;
    });
    const word = dayRoutines.length === 1 ? "routine" : "routines";
    script += `${dayRoutines.length} ${word} on deck. ${joinList(routineLines)}. `;
  }

  const dayBlocks = blocksForDate(personalTimeBlocks, target);
  if (dayBlocks.length > 0 && !past) {
    const blockLines = dayBlocks.map((b) => {
      const start = formatTimeLabel(b.start_time);
      const end = formatTimeLabel(b.end_time);
      if (start && end) return `${b.label} from ${start} to ${end}`;
      if (start) return `${b.label} around ${start}`;
      return b.label;
    });
    const word = dayBlocks.length === 1 ? "block" : "blocks";
    script += `Personal time ${word}: ${joinList(blockLines)}. `;
  }

  const manualToMention = manualItems.filter((m) =>
    isToday ? !m.checked : true
  );
  if (manualToMention.length > 0 && !past) {
    script += `Custom reminders: ${joinList(manualToMention.map((m) => m.item_name))}. `;
  }

  const unpacked = items.filter((i) => !i.checked && !i.locked);
  if (unpacked.length > 0 && !past) {
    const names = unpacked.map((i) => i.item.name);
    script += `Don't forget to pack: ${joinList(names)}. `;
  }

  const lockedUnpacked = items.filter((i) => !i.checked && i.locked);
  if (lockedUnpacked.length > 0 && isToday && !past) {
    const names = lockedUnpacked.map((i) => i.item.name);
    script += `You may have missed packing: ${joinList(names)}. `;
  }

  script += past ? "Hope it went well." : "You've got this.";
  return script;
}

function pickFemaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const preferred = [
    /samantha/i,
    /siri/i,
    /karen/i,
    /tessa/i,
    /victoria/i,
    /allison/i,
    /susan/i,
    /zira/i,
    /female/i,
    /serena/i,
    /moira/i,
    /fiona/i,
    /libby/i,
    /aria/i,
    /jenny/i,
    /sonia/i,
    /nora/i,
    /ava/i,
    /emma/i,
  ];

  const englishVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith("en")
  );
  const pool = englishVoices.length > 0 ? englishVoices : voices;

  for (const re of preferred) {
    const found = pool.find((v) => re.test(v.name));
    if (found) return found;
  }

  return pool[0] ?? null;
}

export default function VoiceBriefingButton({
  events,
  items,
  manualItems,
  personalTimeBlocks,
  forDate,
  weather,
}: VoiceBriefingButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const sessionRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSupported(true);
    const sync = () => window.speechSynthesis.getVoices();
    sync();
    window.speechSynthesis.addEventListener?.("voiceschanged", sync);
    return () =>
      window.speechSynthesis.removeEventListener?.("voiceschanged", sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/routines");
        if (!res.ok) return;
        const data = (await res.json()) as Routine[];
        if (!cancelled) setRoutines(data);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function stop() {
    sessionRef.current += 1;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  function speak() {
    if (!supported) return;
    if (speaking) {
      stop();
      return;
    }
    const script = buildScript(
      events,
      items,
      manualItems,
      personalTimeBlocks,
      routines,
      forDate,
      weather
    );
    const chunks =
      script
        .match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g)
        ?.map((s) => s.trim())
        .filter(Boolean) ?? [script];

    const voice = pickFemaleVoice();
    const session = ++sessionRef.current;
    window.speechSynthesis.cancel();
    setSpeaking(true);

    const speakNext = (i: number) => {
      if (sessionRef.current !== session) return;
      if (i >= chunks.length) {
        setSpeaking(false);
        return;
      }
      const utter = new SpeechSynthesisUtterance(chunks[i]);
      if (voice) utter.voice = voice;
      utter.rate = 1.0;
      utter.pitch = 1.05;
      utter.onend = () => speakNext(i + 1);
      utter.onerror = () => speakNext(i + 1);
      window.speechSynthesis.speak(utter);
    };

    speakNext(0);
  }

  if (!supported) return null;

  const isToday = forDate === todayISODate();
  const target = new Date(`${forDate}T12:00:00`);
  const past = target.getTime() < Date.now() && !isToday;

  const label = isToday
    ? speaking
      ? "Stop briefing"
      : "Play upcoming briefing"
    : speaking
      ? "Stop briefing"
      : past
        ? "Play day recap"
        : "Play day preview";

  const subtitle = isToday
    ? "Hands-free walkthrough of what's still ahead"
    : past
      ? "Recap of how that day looked"
      : "Preview of what's coming up";

  return (
    <button
      onClick={speak}
      className="w-full glass-card rounded-2xl px-4 py-3 flex items-center gap-3 hover:scale-[1.005] transition-transform"
    >
      <div
        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${speaking ? "from-rose-400 to-pink-500" : "from-sky-400 to-cyan-500"} flex items-center justify-center shadow-sm`}
      >
        {speaking ? (
          <VolumeX className="w-4 h-4 text-white" strokeWidth={2.5} />
        ) : (
          <Volume2 className="w-4 h-4 text-white" strokeWidth={2.5} />
        )}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold text-stone-900">{label}</p>
        <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
          {subtitle}
        </p>
      </div>
    </button>
  );
}
