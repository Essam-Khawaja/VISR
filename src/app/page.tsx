"use client";

import { useEffect, useState, useCallback } from "react";
import {
  TimelineEvent,
  Item,
  ChecklistItem,
  WeatherData,
  WeatherAdvice,
  UserSettings,
  SavedLocation,
  EventCategory,
  ManualChecklistItem,
} from "@/types";
import { getWeatherAdvice } from "@/lib/weather";
import {
  formatDateLong,
  isSameDay,
  todayISODate,
} from "@/lib/timeline-utils";
import Header from "@/components/layout/Header";
import DayNavigator from "@/components/layout/DayNavigator";
import Timeline from "@/components/timeline/Timeline";
import BeforeYouLeave from "@/components/checklist/BeforeYouLeave";
import WeatherBanner from "@/components/weather/WeatherBanner";
import FreeTimeFinder from "@/components/free-time/FreeTimeFinder";
import EventForm from "@/components/events/EventForm";
import NoteEditor from "@/components/events/NoteEditor";
import DayOverview from "@/components/day-overview/DayOverview";
import EndOfDayReschedule from "@/components/reschedule/EndOfDayReschedule";
import RoutinesPanel from "@/components/routines/RoutinesPanel";
import VoiceBriefingButton from "@/components/voice/VoiceBriefingButton";
import ICSImportButton from "@/components/import/ICSImportButton";
import { Plus, Loader2, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";

const TRANSIT_MARKER = "auto-transit";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<string>(todayISODate());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("date");
    if (fromQuery && /^\d{4}-\d{2}-\d{2}$/.test(fromQuery)) {
      setSelectedDate(fromQuery);
    }
  }, []);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [eventItems, setEventItems] = useState<Record<string, Item[]>>({});
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [manualItems, setManualItems] = useState<ManualChecklistItem[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherAdvice, setWeatherAdvice] = useState<WeatherAdvice[]>([]);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TimelineEvent | null>(null);
  const [editingNote, setEditingNote] = useState<TimelineEvent | null>(null);
  const [prefillSlot, setPrefillSlot] = useState<
    { start: string; end: string } | null
  >(null);

  const targetDate = new Date(`${selectedDate}T12:00:00`);
  const today = new Date();
  const isToday = isSameDay(targetDate, today);
  const isPast = targetDate.getTime() < today.getTime() && !isToday;
  const isFuture = targetDate.getTime() > today.getTime() && !isToday;
  const daysAhead = Math.round(
    (new Date(`${selectedDate}T00:00:00`).getTime() -
      new Date(todayISODate() + "T00:00:00").getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const canFetchWeather = !isPast && daysAhead <= 5;

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {}
  }, []);

  const loadLocations = useCallback(async () => {
    try {
      const res = await fetch("/api/saved-locations");
      if (res.ok) setLocations(await res.json());
    } catch {}
  }, []);

  const loadEvents = useCallback(async (date: string) => {
    try {
      const res = await fetch(`/api/events?date=${date}`);
      if (res.ok) {
        const data = (await res.json()) as TimelineEvent[];
        setEvents(data);

        const itemMap: Record<string, Item[]> = {};
        await Promise.all(
          data.map(async (event) => {
            const r = await fetch(`/api/event-items?event_id=${event.id}`);
            if (r.ok) {
              const linked = await r.json();
              itemMap[event.id] = linked
                .map((l: { items: Item }) => l.items)
                .filter(Boolean);
            }
          })
        );
        setEventItems(itemMap);
      }
    } catch {}
  }, []);

  const loadManualItems = useCallback(async (date: string) => {
    try {
      const res = await fetch(`/api/manual-checklist?date=${date}`);
      if (res.ok) setManualItems(await res.json());
    } catch {}
  }, []);

  const loadWeather = useCallback(
    async (s: UserSettings | null, date: string, fetchable: boolean) => {
      if (!s?.city || !fetchable) {
        setWeather(null);
        setWeatherAdvice([]);
        setWeatherError(fetchable ? null : "no-data");
        return;
      }
      try {
        const params = new URLSearchParams({ city: s.city, date });
        if (s.country_code) params.set("country", s.country_code);
        const res = await fetch(`/api/weather?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setWeather(data);
          setWeatherAdvice(getWeatherAdvice(data));
          setWeatherError(null);
        } else {
          setWeather(null);
          setWeatherAdvice([]);
          setWeatherError("error");
        }
      } catch {
        setWeather(null);
        setWeatherAdvice([]);
        setWeatherError("error");
      }
    },
    []
  );

  const isLeavingHome = useCallback(
    (event: TimelineEvent): boolean => {
      if (event.location_id) {
        const loc = locations.find((l) => l.id === event.location_id);
        if (loc?.location_type === "home") return false;
        if (loc) return true;
      }
      const text = (event.location ?? "").toLowerCase().trim();
      if (!text) return false;
      const homeKeywords = [
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
      return !homeKeywords.some((k) => text.includes(k));
    },
    [locations]
  );

  const buildChecklist = useCallback(
    async (eventsForDay: TimelineEvent[], adv: WeatherAdvice[]) => {
      const goingOut = eventsForDay.filter(isLeavingHome);
      if (goingOut.length === 0) {
        setChecklistItems([]);
        return;
      }

      try {
        const defRes = await fetch("/api/category-defaults");
        const itemRes = await fetch("/api/items");
        if (!defRes.ok || !itemRes.ok) {
          setChecklistItems([]);
          return;
        }
        const defaults = await defRes.json();
        const allItems: Item[] = await itemRes.json();
        const itemMap = new Map(allItems.map((i) => [i.id, i]));

        const byName = new Map<
          string,
          {
            item: Item;
            source: ChecklistItem["source"];
            event_titles: Set<string>;
          }
        >();

        function track(
          item: Item,
          source: ChecklistItem["source"],
          eventTitle?: string
        ) {
          const key = item.name.trim().toLowerCase();
          const existing = byName.get(key);
          if (existing) {
            if (eventTitle) existing.event_titles.add(eventTitle);
            if (source === "event_specific") existing.source = source;
            return;
          }
          byName.set(key, {
            item,
            source,
            event_titles: new Set(eventTitle ? [eventTitle] : []),
          });
        }

        const categoriesGoingOut = new Set(goingOut.map((e) => e.category));

        for (const def of defaults) {
          if (!categoriesGoingOut.has(def.category as EventCategory)) continue;
          const item = itemMap.get(def.item_id);
          if (!item) continue;
          const eventForCat = goingOut.find(
            (e) => e.category === def.category
          );
          track(item, "category_default", eventForCat?.title);
        }

        for (const event of goingOut) {
          const r = await fetch(`/api/event-items?event_id=${event.id}`);
          if (r.ok) {
            const linked = await r.json();
            for (const l of linked) {
              const item = l.items as Item;
              if (!item || !l.is_one_time) continue;
              track(item, "event_specific", event.title);
            }
          }
        }

        const waterBottle = allItems.find(
          (i) => i.name.trim().toLowerCase() === "water bottle"
        );
        if (waterBottle) {
          track(waterBottle, "category_default", "always good to have");
        }

        for (const a of adv) {
          if (!a.item) continue;
          const synthetic: Item = {
            id: `weather-${a.item}`,
            name: a.item,
            icon: null,
            created_at: new Date().toISOString(),
          };
          track(synthetic, "weather");
        }

        const items: ChecklistItem[] = Array.from(byName.values()).map(
          (entry) => ({
            item: entry.item,
            source: entry.source,
            event_title: Array.from(entry.event_titles).join(", ") || undefined,
            event_titles: Array.from(entry.event_titles),
            checked: false,
          })
        );

        setChecklistItems(items);
      } catch {}
    },
    [isLeavingHome]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadSettings();
      await loadLocations();
      setLoading(false);
    })();
  }, [loadSettings, loadLocations]);

  useEffect(() => {
    loadEvents(selectedDate);
    loadManualItems(selectedDate);
  }, [selectedDate, loadEvents, loadManualItems]);

  useEffect(() => {
    if (settings) {
      loadWeather(settings, selectedDate, canFetchWeather);
    }
  }, [settings, selectedDate, canFetchWeather, loadWeather]);

  useEffect(() => {
    buildChecklist(events, weatherAdvice);
  }, [events, weatherAdvice, buildChecklist]);

  async function addManualItem(name: string) {
    await fetch("/api/manual-checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_name: name, for_date: selectedDate }),
    });
    await loadManualItems(selectedDate);
  }

  async function deleteManualItem(id: string) {
    await fetch(`/api/manual-checklist?id=${id}`, { method: "DELETE" });
    await loadManualItems(selectedDate);
  }

  async function toggleManualItem(id: string, checked: boolean) {
    setManualItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, checked } : m))
    );
    await fetch("/api/manual-checklist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, checked }),
    });
  }

  async function maybeAddTransitBlocks(event: TimelineEvent) {
    if (!event.auto_transit || !event.location_id) return;
    const loc = locations.find((l) => l.id === event.location_id);
    if (!loc || loc.transit_minutes <= 0) return;

    const beforeStart = new Date(
      new Date(event.start_time).getTime() - loc.transit_minutes * 60 * 1000
    );
    const beforeEnd = new Date(event.start_time);
    const afterStart = new Date(event.end_time);
    const afterEnd = new Date(
      new Date(event.end_time).getTime() + loc.transit_minutes * 60 * 1000
    );

    const eventDate = beforeStart.toISOString().split("T")[0];
    const existingRes = await fetch(`/api/events?date=${eventDate}`);
    const existing: TimelineEvent[] = existingRes.ok
      ? await existingRes.json()
      : [];

    const hasBefore = existing.some(
      (e) =>
        e.category === "transit" &&
        e.description?.includes(TRANSIT_MARKER) &&
        Math.abs(new Date(e.end_time).getTime() - beforeEnd.getTime()) < 60000
    );
    const hasAfter = existing.some(
      (e) =>
        e.category === "transit" &&
        e.description?.includes(TRANSIT_MARKER) &&
        Math.abs(new Date(e.start_time).getTime() - afterStart.getTime()) <
          60000
    );

    const toCreate: Array<Partial<TimelineEvent>> = [];
    if (!hasBefore) {
      toCreate.push({
        title: `Transit to ${loc.name}`,
        description: `${TRANSIT_MARKER} for ${event.title}`,
        category: "transit",
        start_time: beforeStart.toISOString(),
        end_time: beforeEnd.toISOString(),
        location: loc.name,
      });
    }
    if (!hasAfter) {
      toCreate.push({
        title: `Transit from ${loc.name}`,
        description: `${TRANSIT_MARKER} for ${event.title}`,
        category: "transit",
        start_time: afterStart.toISOString(),
        end_time: afterEnd.toISOString(),
        location: loc.name,
      });
    }

    for (const block of toCreate) {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(block),
      });
    }
  }

  async function handleCreateEvent(data: Partial<TimelineEvent>) {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created: TimelineEvent = await res.json();
      await maybeAddTransitBlocks(created);
      await loadEvents(selectedDate);
    }
  }

  async function handleUpdateEvent(data: Partial<TimelineEvent>) {
    if (!editing) return;
    const res = await fetch("/api/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editing.id, ...data }),
    });
    if (res.ok) {
      const updated: TimelineEvent = await res.json();
      await maybeAddTransitBlocks(updated);
      await loadEvents(selectedDate);
    }
  }

  async function handleDeleteEvent(event: TimelineEvent) {
    await fetch(`/api/events?id=${event.id}`, { method: "DELETE" });
    await loadEvents(selectedDate);
  }

  async function handleToggleComplete(event: TimelineEvent) {
    await fetch("/api/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: event.id, completed: !event.completed }),
    });
    await loadEvents(selectedDate);
  }

  async function handleReschedule(event: TimelineEvent, newStart: string) {
    const dur =
      new Date(event.end_time).getTime() - new Date(event.start_time).getTime();
    const newEnd = new Date(new Date(newStart).getTime() + dur);
    await fetch("/api/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: event.id,
        start_time: newStart,
        end_time: newEnd.toISOString(),
      }),
    });
    await loadEvents(selectedDate);
  }

  const showSetupHint = !loading && (!settings?.city || !settings?.country_code);

  const weatherLabel = isPast
    ? "past"
    : isFuture
      ? daysAhead === 1
        ? "tomorrow"
        : `${daysAhead} days out`
      : undefined;

  return (
    <div className="min-h-screen pb-24">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        <DayNavigator selectedDate={selectedDate} onChange={setSelectedDate} />

        {!isToday && (
          <div className="text-center -mt-1">
            <p className="text-[11px] text-stone-400">
              {formatDateLong(`${selectedDate}T12:00:00`)}
            </p>
          </div>
        )}

        {showSetupHint && (
          <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-3 flex items-center gap-3">
            <SettingsIcon className="w-4 h-4 text-orange-600 shrink-0" />
            <p className="text-xs text-orange-800 flex-1 leading-relaxed">
              Set your city and timezone in{" "}
              <Link
                href="/settings"
                className="font-semibold underline decoration-orange-400 underline-offset-2"
              >
                settings
              </Link>{" "}
              to unlock weather, free-time, and routine planning.
            </p>
          </div>
        )}

        {weather && (
          <WeatherBanner
            weather={weather}
            advice={weatherAdvice}
            city={settings?.city ?? ""}
            label={weatherLabel}
          />
        )}

        {!weather && settings?.city && weatherError === "no-data" && (
          <div className="rounded-2xl border border-stone-200 bg-white/60 px-4 py-2.5">
            <p className="text-[11px] text-stone-500 leading-relaxed">
              {isPast
                ? "No historical weather on the free tier. We can only forecast a few days out."
                : "Forecasts go five days out. This day is beyond that window."}
            </p>
          </div>
        )}

        {isToday && (
          <DayOverview events={events} city={settings?.city ?? ""} />
        )}

        <BeforeYouLeave
          items={checklistItems}
          manualItems={manualItems}
          forDate={selectedDate}
          onAddManual={addManualItem}
          onDeleteManual={deleteManualItem}
          onToggleManual={toggleManualItem}
        />

        {events.length > 0 && (
          <VoiceBriefingButton
            events={events}
            items={checklistItems}
            forDate={selectedDate}
            weather={weather}
          />
        )}

        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-stone-900">
                {isToday ? "Today's flow" : "Day overview"}
              </h2>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {events.length === 0
                  ? "Nothing scheduled"
                  : `${events.length} ${events.length === 1 ? "item" : "items"}`}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <ICSImportButton onImported={() => loadEvents(selectedDate)} />
              <button
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
                className="text-xs font-medium px-3 py-1.5 rounded-xl btn-primary flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
            </div>
          ) : (
            <Timeline
              events={events}
              eventItems={eventItems}
              locations={locations}
              showCurrentMarker={isToday}
              onEditEvent={(e) => {
                setEditing(e);
                setShowForm(true);
              }}
              onDeleteEvent={handleDeleteEvent}
              onToggleComplete={handleToggleComplete}
              onEditNote={(e) => setEditingNote(e)}
            />
          )}
        </div>

        <FreeTimeFinder
          onScheduleSlot={(start, end) => {
            setPrefillSlot({ start, end });
            setEditing(null);
            setShowForm(true);
          }}
        />

        <RoutinesPanel forDate={selectedDate} />

        {isToday && (
          <EndOfDayReschedule
            events={events}
            onReschedule={handleReschedule}
            onMarkDone={async (e) => handleToggleComplete(e)}
          />
        )}
      </main>

      {showForm && (
        <EventForm
          event={editing}
          initialDate={selectedDate}
          initialStart={prefillSlot?.start}
          initialEnd={prefillSlot?.end}
          locations={locations}
          onSubmit={editing ? handleUpdateEvent : handleCreateEvent}
          onDelete={editing ? handleDeleteEvent : undefined}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
            setPrefillSlot(null);
          }}
        />
      )}

      {editingNote && (
        <NoteEditor
          event={editingNote}
          onSave={async (notes, status) => {
            await fetch("/api/events", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: editingNote.id,
                notes,
                note_status: status,
              }),
            });
            await loadEvents(selectedDate);
          }}
          onClose={() => setEditingNote(null)}
        />
      )}
    </div>
  );
}
