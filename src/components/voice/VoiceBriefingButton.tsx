"use client";

import { useEffect, useState } from "react";
import { TimelineEvent, ChecklistItem, WeatherData } from "@/types";
import {
  sortEventsByTime,
  formatTime,
  isPastEvent,
  todayISODate,
  isSameDay,
} from "@/lib/timeline-utils";
import { Volume2, VolumeX } from "lucide-react";

type VoiceBriefingButtonProps = {
  events: TimelineEvent[];
  items: ChecklistItem[];
  forDate: string;
  weather?: WeatherData | null;
};

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
  forDate: string,
  weather?: WeatherData | null
): string {
  const { greeting, intro, past } = dayPhrase(forDate);
  const isToday = forDate === todayISODate();

  const relevant = sortEventsByTime(events).filter((e) =>
    isToday ? !isPastEvent(e) : true
  );

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
    const verb = past
      ? "had"
      : isToday
        ? "have"
        : "have";
    const thingWord = relevant.length === 1 ? "thing" : "things";
    const tense = isToday ? "left" : past ? "" : "lined up";
    script += `You ${verb} ${relevant.length} ${thingWord}${tense ? ` ${tense}` : ""}. `;
    const top = relevant.slice(0, 5);
    for (const e of top) {
      script += `${e.title} at ${formatTime(e.start_time)}. `;
    }
    if (relevant.length > 5) {
      script += `Plus ${relevant.length - 5} more. `;
    }
  }

  const unpacked = items.filter((i) => !i.checked).slice(0, 6);
  if (unpacked.length > 0 && !past) {
    script += `Don't forget to pack: ${unpacked.map((i) => i.item.name).join(", ")}. `;
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
  forDate,
  weather,
}: VoiceBriefingButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSupported(true);
    const sync = () => window.speechSynthesis.getVoices();
    sync();
    window.speechSynthesis.addEventListener?.("voiceschanged", sync);
    return () =>
      window.speechSynthesis.removeEventListener?.("voiceschanged", sync);
  }, []);

  function speak() {
    if (!supported) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const script = buildScript(events, items, forDate, weather);
    const utter = new SpeechSynthesisUtterance(script);
    const voice = pickFemaleVoice();
    if (voice) utter.voice = voice;
    utter.rate = 1.0;
    utter.pitch = 1.05;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
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
